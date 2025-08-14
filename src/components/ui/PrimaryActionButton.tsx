// src/components/ui/PrimaryActionButton.tsx

export interface PrimaryActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function PrimaryActionButton({ className, children, ...props }: PrimaryActionButtonProps) {
  return (
    <button
      className={`w-full text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
