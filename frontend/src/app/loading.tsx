export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 animate-spin border-2 border-[var(--site-cyan)] border-t-transparent" />
        <p className="font-mono text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
