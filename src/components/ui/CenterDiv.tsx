// src/components/ui/CenterDiv.tsx

function CenterDiv({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={`flex min-h-svh w-full items-center justify-center p-6 md:p-10 ${className}`}
    >
      {children}
    </div>
  );
}

export { CenterDiv };
