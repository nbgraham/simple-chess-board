import { useEffect, DependencyList, useCallback } from "react";

type Subscription = {
    unsubscribe: () => void;
}

export const useSubscribe = <T extends Subscription>(subscribe: () => T, deps: DependencyList) => {
    const subscribeCallback = useCallback(subscribe, deps);
    useEffect(
        () => subscribeCallback().unsubscribe,
        [subscribeCallback]
    )
}