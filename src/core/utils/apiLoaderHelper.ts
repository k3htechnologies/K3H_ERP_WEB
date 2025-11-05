/**
 * Runs an API call with automatic loader and status handling.
 * @param setLoading - Function to set loading state
 * @param setLoadingMessage - Function to set loading message text
 * @param apiCall - The async API function to call
 * @param onSuccess - Optional callback for success response
 * @param onError - Optional callback for error response
 * @param onWarning - Optional callback for partial success or warning
 */
export const runApiWithLoader = async <T>(
    setLoading: (loading: boolean) => void,
    setLoadingMessage: (message: string) => void,
    apiCall: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: any) => void,
    onWarning?: (warning: any) => void,
    loadingMessage: string = 'Please wait...'
): Promise<T | null> => {
    try {

        setLoadingMessage(loadingMessage);
        setLoading(true);

        const result = await apiCall();

        if ((result as any)?.status === 'warning' && onWarning) {

            onWarning(result);

            return result;
        }

        onSuccess?.(result);

        return result;

    } catch (error) {

        console.error('API call failed:', error);

        onError?.(error);

        return null;

    } finally {

        setLoading(false);
        setLoadingMessage('');

    }
}
