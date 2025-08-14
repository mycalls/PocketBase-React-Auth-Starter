// src/components/ui/TimeBadge.tsx

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function TimeBadge({
  seconds,
  className,
  ...props
}: { seconds: number } & React.ComponentProps<'span'>) {
  return (
    <span
      {...props}
      className={`text-sm font-medium text-gray-500 dark:text-gray-400 ${className ?? ''}`}
    >
      {formatTime(seconds)}
    </span>
  );
}
