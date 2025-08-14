// src/components/ui/Divider.tsx

export function Divider({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={`mt-4 font-medium border-t border-gray-200 dark:border-gray-700 ${className ?? ''}`}
    />
  );
}
