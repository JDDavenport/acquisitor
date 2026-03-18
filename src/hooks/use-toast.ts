import { toast } from 'sonner';

export function useToast() {
  return {
    toast: (title: string, options?: { description?: string; variant?: 'default' | 'destructive' }) => {
      const variant = options?.variant;
      if (variant === 'destructive') {
        return toast.error(title, { description: options?.description });
      }
      return toast.success(title, { description: options?.description });
    },
  };
}
