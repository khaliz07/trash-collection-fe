import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title: string;
  description?: string;
}

export function useToast() {
  const toast = ({ title, description }: ToastOptions) => {
    sonnerToast(title, {
      description,
    });
  };

  return { toast };
} 