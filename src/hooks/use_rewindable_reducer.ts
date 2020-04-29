import { useCallback, useMemo } from 'react'
import { useResumableReducer } from './use_resumable_reducer';
import { makeInitialState, makeRewindableReducer, UNDO, REDO, RESET, RewindableReducerState } from '../utils/rewindable_reducer';

export type SaveOptions<S, A> = {
    saveKey: string;
    serializeState: (state: S) => string;
    deserializeState: (ser: string) => S;
    serializeAction: (action: A) => string;
    deserializeAction: (ser: string) => A;
    saveValue: (key: string, value: string) => void;
    retrieveValue: (key: string) => string | null;
}

export const useRewindableReducer = <S, A>(reducer: (state: S, action: A) => S, initialState: S, saveOptions?: Partial<SaveOptions<S, A>>) => {
    const initialRewindableState = makeInitialState<S,A>(initialState);
    const rewindableReducer = makeRewindableReducer(reducer, initialRewindableState)

    const { saveState, retrieveState } = useMemo(
        () => getSaveAndRetrieveFunctions(saveOptions),
        [saveOptions]
    )

    const [state, dispatch] = useResumableReducer(
        rewindableReducer,
        initialRewindableState,
        saveState,
        retrieveState
    );

    const undo = useCallback(() => dispatch(UNDO.action), [dispatch])
    const redo = useCallback(() => dispatch(REDO.action), [dispatch])
    const reset = useCallback(() => dispatch(RESET.action), [dispatch])
    const externalDispatch = useCallback((action: A) => dispatch(action), [dispatch]);

    return {
        state: state.currentState,
        dispatch: externalDispatch,
        pastActions: state.pastActions,
        undo,
        redo,
        reset
    }
}

const getSaveAndRetrieveFunctions = <S, A>(saveOptions?: Partial<SaveOptions<S, A>>) => {
    const _saveOptions = saveOptions && {
        saveKey: getNextSaveId(),
        serializeState: JSON.stringify,
        deserializeState: JSON.parse,
        serializeAction: JSON.stringify,
        deserializeAction: JSON.parse,
        saveValue: defaultSaveItem,
        retrieveValue: defaultRetrieveItem,
        ...saveOptions,
    } as SaveOptions<S, A>

    const saveKey = _saveOptions?.saveKey;
    const save = _saveOptions?.saveValue;
    const retrieve = _saveOptions?.retrieveValue
    const saveState = _saveOptions && save && ((state: RewindableReducerState<S, A>) => {
        save(`${saveKey}__pastActions`, JSON.stringify(state.pastActions.map(_saveOptions.serializeAction)));
        save(`${saveKey}__pastStates`, JSON.stringify(state.pastStates.map(_saveOptions.serializeState)));
        save(`${saveKey}__currentState`, _saveOptions.serializeState(state.currentState));
        save(`${saveKey}__futureActions`, JSON.stringify(state.futureActions.map(_saveOptions.serializeAction)));
        save(`${saveKey}__futureStates`, JSON.stringify(state.futureStates.map(_saveOptions.serializeState)));
    })
    const retrieveState = _saveOptions && retrieve && ((): RewindableReducerState<S, A> | undefined => {
        const pastActionsSer = retrieve(`${saveKey}__pastActions`);
        const pastStatesSer = retrieve(`${saveKey}__pastStates`);
        const currentStateSer = retrieve(`${saveKey}__currentState`);
        const futureActionsSer = retrieve(`${saveKey}__futureActions`);
        const futureStatesSer = retrieve(`${saveKey}__futureStates`);
        return !!pastActionsSer && !!pastStatesSer && !!currentStateSer && !!futureActionsSer && !!futureStatesSer ? {
            pastActions: (JSON.parse(pastActionsSer) as string[]).map(s => _saveOptions.deserializeAction(s)),
            pastStates: (JSON.parse(pastStatesSer) as string[]).map(s => _saveOptions.deserializeState(s)),
            currentState: _saveOptions.deserializeState(currentStateSer),
            futureActions: (JSON.parse(futureActionsSer) as string[]).map(s => _saveOptions.deserializeAction(s)),
            futureStates: (JSON.parse(futureStatesSer) as string[]).map(s => _saveOptions.deserializeState(s)),
        } as RewindableReducerState<S, A> : undefined;
    })

    return { saveState, retrieveState };
}

const defaultSaveItem = (key: string, value: string) => sessionStorage.setItem(key, value);
const defaultRetrieveItem = (key: string) => sessionStorage.getItem(key);

let saveId = 0;
const getNextSaveId = () => `${saveId++}`;