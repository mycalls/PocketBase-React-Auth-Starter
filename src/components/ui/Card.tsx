// src/components/ui/Card.tsx

function FormCard({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={`w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

function FormCardTitle({ children, className, ...props }: React.ComponentProps<'h5'>) {
  return (
    <h5 {...props} className={`text-xl font-medium text-gray-900 dark:text-white ${className}`}>
      {children}
    </h5>
  );
}

function FormCardDescription({ children, className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      {...props}
      className={`mt-2 text-sm font-normal text-gray-700 dark:text-gray-400 ${className}`}
    >
      {children}
    </p>
  );
}

export { FormCard, FormCardTitle, FormCardDescription };
