import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';
import { RootState, store } from './store';
import { ActionCreator, PayloadAction } from '@reduxjs/toolkit';
import { useCallback } from 'react';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()

export function useDispatchAppAction<TPayload = undefined>(actionCreator: ActionCreator<PayloadAction<TPayload>>) {
    const appDispatch = useAppDispatch();

    return useCallback((payload: TPayload) => {
        appDispatch(actionCreator(payload));
    }, [appDispatch, actionCreator]);
}

type AppThunk<ThunkArg = void, Response = void> = (payload: ThunkArg) => (dispatch: AppDispatch, getState: () => RootState) => Response;
export function useDispatchAppThunk<TPayload>(thunk: AppThunk<TPayload>) {
    const appDispatch = useAppDispatch();

    return useCallback((payload: TPayload) => {
        appDispatch(thunk(payload));
    }, [appDispatch, thunk]);
}
