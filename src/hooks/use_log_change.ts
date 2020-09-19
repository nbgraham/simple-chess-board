import { useEffect } from "react"

export function useLogChange<T>(name: string, item: T) {
    useEffect(
        () => {
            console.log(`${name} changed`)
        },
        [item]
    )
}