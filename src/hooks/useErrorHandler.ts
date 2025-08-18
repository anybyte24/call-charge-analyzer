import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorDetails {
  code?: string;
  message: string;
  context?: string;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: any, context?: string) => {
    let errorMessage = 'Si è verificato un errore imprevisto';
    let errorCode = '';

    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    if (error?.code) {
      errorCode = error.code;
    }

    // Log error for debugging
    console.error('Application Error:', {
      code: errorCode,
      message: errorMessage,
      context,
      originalError: error,
      timestamp: new Date().toISOString(),
    });

    // Show user-friendly message
    toast({
      title: 'Errore',
      description: `${errorMessage}${context ? ` (${context})` : ''}`,
      variant: 'destructive',
    });

    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error monitoring service (e.g., Sentry)
      // Sentry.captureException(error, { tags: { context } });
    }
  }, [toast]);

  const handleAsyncError = useCallback(async (asyncFn: () => Promise<any>, context?: string) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};