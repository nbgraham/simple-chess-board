import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';
import { RootState, store } from './store';
import { ActionCreator, PayloadAction } from '@reduxjs/toolkit';
import { useCallback } from 'react';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>() 

export function useDispatchAppAction<Payload = undefined>(actionCreator: ActionCreator<PayloadAction<Payload>>) {
    const appDispatch = useAppDispatch();

    return useCallback((payload: Payload) => {
        appDispatch(actionCreator(payload));
    }, [appDispatch, actionCreator]);
}
