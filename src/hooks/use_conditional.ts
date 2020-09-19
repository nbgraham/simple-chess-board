import { useCallback } from "react";

type AnyFunction<R = any> = (...a: any) => R
type TypedFunction<P extends Array<any>, R>  = (...a: P) => R
type ReplaceReturnType<T extends AnyFunction, TNewReturn> = TypedFunction<Parameters<T>, TNewReturn>

export function useConditionalExecution<T, TExecute extends React.Dispatch<React.SetStateAction<T>>>(execute: TExecute, shouldExecute: (p: T) => boolean): ReplaceReturnType<TExecute, void>;
export function useConditionalExecution<TExecute extends AnyFunction>(execute: TExecute, shouldExecute: ReplaceReturnType<TExecute, boolean>): ReplaceReturnType<TExecute, void>;
export function useConditionalExecution<TExecute extends AnyFunction>(execute: TExecute, shouldExecute: ReplaceReturnType<TExecute, boolean>): ReplaceReturnType<TExecute, void> {
    return useCallback((...args: Parameters<TExecute>) => {
        if (shouldExecute(...args)) {
            execute(...args)
        }
    }, [execute, shouldExecute]);
}