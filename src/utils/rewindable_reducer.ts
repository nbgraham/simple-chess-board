import { SerDeClass } from "./serde";

const rewindableActionCreator = (name: string) => {
    const type = `@@${name}@@`;
    const action = { type };
    const isActionType = (action: any): action is typeof action =>
        action instanceof Object && 'type' in action && action.type === type;
    return {
        action,
        isActionType
    };
}

export const UNDO = rewindableActionCreator('UNDO');
export const REDO = rewindableActionCreator('REDO');
export const RESET = rewindableActionCreator('RESET');

export type RewindableReducerState<S, A> = {
    pastActions: A[]
    pastStates: S[]
    currentState: S
    futureActions: A[]
    futureStates: S[]
}
export type SerDeRewindableReducerState<S, A> = {
    pastActions: SerDeClass<A>[]
    pastStates: SerDeClass<S>[]
    currentState: S
    futureActions: SerDeClass<S>[]
    futureStates: SerDeClass<A>[]
}
export type RewindableReducerAction<A> = A | typeof UNDO.action | typeof RESET.action;

export const makeInitialState = <S, A>(initialState: S): RewindableReducerState<S, A> => ({
    pastActions: [],
    pastStates: [],
    currentState: initialState,
    futureActions: [],
    futureStates: [],
})

export const makeRewindableReducer = <S, A>(reducer: (state: S, action: A) => S, initialRewindableState: RewindableReducerState<S, A>) =>
    (state: RewindableReducerState<S, A>, action: RewindableReducerAction<A>): RewindableReducerState<S, A> => {
        if (UNDO.isActionType(action)) {
            if (state.pastStates.length === 0) {
                return state;
            }
            const prevState = state.pastStates[state.pastStates.length - 1];
            const prevAction = state.pastActions[state.pastActions.length - 1];
            return {
                pastActions: state.pastActions.slice(0, -1),
                pastStates: state.pastStates.slice(0, -1),
                currentState: prevState,
                futureActions: [prevAction, ...state.futureActions],
                futureStates: [state.currentState, ...state.futureStates],
            };
        } else if (REDO.isActionType(action)) {
            if (state.futureStates.length === 0) {
                return state;
            }
            const nextState = state.futureStates[0];
            const nextAction = state.futureActions[0];
            return {
                pastActions: [...state.pastActions, nextAction],
                pastStates: [...state.pastStates, state.currentState],
                currentState: nextState,
                futureActions: state.futureActions.slice(1),
                futureStates: state.futureStates.slice(1),
            };
        } else if (RESET.isActionType(action)) {
            return initialRewindableState;
        } else {
            const nextState = reducer(state.currentState, action);
            return {
                pastActions: [...state.pastActions, action],
                pastStates: [...state.pastStates, state.currentState],
                currentState: nextState,
                futureActions: [],
                futureStates: [],
            };
        }
    }