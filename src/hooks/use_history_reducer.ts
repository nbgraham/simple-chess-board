import { useReducer } from 'react';

type HistoryAction<T> = {
    type: 'push',
    item: T
} | {
    type: 'pop'
} | {
    type: 'reset'
}
export const useHistoryReducer = <T>(initialState: T[]) => {
    const historyReducer = (state: T[], action: HistoryAction<T>) => {
        switch(action.type) {
            case 'push':
                return [...state, action.item]
            case 'pop':
                return state.length === 0 ? state : state.slice(0, -1)
            case 'reset':
                return initialState;
            default:
                return state;
        }
    }
    return useReducer(historyReducer, initialState);
}