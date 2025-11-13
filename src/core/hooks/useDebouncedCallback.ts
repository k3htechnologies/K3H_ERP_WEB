import { useCallback, useEffect, useRef } from 'react'

export type DebouncedFn<T extends (...args: any[]) => void> = {
    (this: void, ...args: Parameters<T>): void
    cancel: () => void
    flush: (...args: Parameters<T>) => void
}

/**
 * useDebouncedCallback
 * - callback: function to debounce
 * - delay: debounce delay in ms (default 350)
 *
 * Returns a function that can be called normally, and has .cancel() and .flush() helpers.
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay = 350
): DebouncedFn<T> {
    const timerRef = useRef<number | null>(null)
    const cbRef = useRef<T>(callback)

    // keep latest callback reference
    useEffect(() => {
        cbRef.current = callback
    }, [callback])

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
    }, [])

    const cancel = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const flush = useCallback((...args: Parameters<T>) => {
        cancel()
        // invoke latest callback synchronously
        cbRef.current(...args)
    }, [cancel])

    const debounced = useCallback((...args: Parameters<T>) => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current)
        }
        // schedule next call
        timerRef.current = window.setTimeout(() => {
            timerRef.current = null
            cbRef.current(...args)
        }, delay)
    }, [delay])

    // attach helpers to returned function
    const debouncedWithHelpers = debounced as DebouncedFn<T>
    debouncedWithHelpers.cancel = cancel
    debouncedWithHelpers.flush = flush

    return debouncedWithHelpers
}

export default useDebouncedCallback
