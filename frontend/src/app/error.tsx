'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 border border-border bg-card p-8 text-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">An unexpected error occurred.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
