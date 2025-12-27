import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseApiOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useApiMutation<TData, TResponse>(
  mutationFn: (data: TData) => Promise<{ success: boolean; data?: TResponse; error?: string }>,
  options: UseApiOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mutate = useCallback(
    async (data: TData): Promise<{ success: boolean; data?: TResponse }> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(data);

        if (result.success) {
          if (options.successMessage) {
            toast({
              title: 'Success',
              description: options.successMessage,
            });
          }
          return { success: true, data: result.data };
        } else {
          const errorMsg = result.error || options.errorMessage || 'An error occurred';
          setError(errorMsg);
          toast({
            title: 'Error',
            description: errorMsg,
            variant: 'destructive',
          });
          return { success: false };
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options.successMessage, options.errorMessage, toast]
  );

  return { mutate, isLoading, error };
}
