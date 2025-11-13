import { useCallback, useEffect, useRef } from 'react';

export type RunWithSignal<T> = (signal: AbortSignal) => Promise<T>;

export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  // Abort and clear the current controller, with optional reason (modern browsers)
  const abort = useCallback((reason?: any) => {
    if (controllerRef.current) {
      try {
        // AbortController.abort accepts an optional reason in modern specs
        (controllerRef.current as AbortController).abort(reason);
      } catch {
        /* ignore */
      }
      controllerRef.current = null;
    }
  }, []);

  // Create a new controller (aborting any previous), store and return it
  const replaceController = useCallback((reason?: any): AbortController => {
    // abort previous if exists
    if (controllerRef.current) {
      try {
        controllerRef.current.abort(reason);
      } catch {}
    }
    const ac = new AbortController();
    controllerRef.current = ac;
    return ac;
  }, []);

  // Return a signal (will create controller if none exists)
  const getSignal = useCallback((): AbortSignal => {
    if (!controllerRef.current) controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);

  // Run an async function with a fresh controller (aborts previous), and auto-cleanup
  const run = useCallback(async <T,>(fn: RunWithSignal<T>): Promise<T> => {
    const ac = replaceController('run-new-request'); // optional reason
    try {
      const result = await fn(ac.signal);
      return result;
    } finally {
      // clear controller only if still ours (no newer request started)
      if (controllerRef.current === ac) controllerRef.current = null;
    }
  }, [replaceController]);

  // Auto-abort on unmount
  useEffect(() => {
    return () => {
      abort('component-unmount');
    };
  }, [abort]);

  return {
    controllerRef,
    abort,
    replaceController,
    getSignal,
    run
  } as const;
}

export default useAbortController;
