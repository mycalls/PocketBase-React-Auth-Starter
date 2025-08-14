// src/components/ui/AlertText.tsx

type Variant = 'error' | 'success' | 'info' | 'warning';

export function AlertText({
  variant = 'info',
  children,
  className,
  ...props
}: {
  variant?: Variant;
} & React.ComponentProps<'p'>) {
  const color = {
    error: 'text-red-500',
    success: 'text-green-500',
    info: 'text-gray-500',
    warning: 'text-yellow-600',
  }[variant];

  return (
    <p {...props} className={`text-sm ${color} ${className ?? ''}`}>
      {children}
    </p>
  );
}
