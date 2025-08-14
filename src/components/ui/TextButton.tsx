// src/components/ui/TextButton.tsx

export interface TextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function TextButton({ className, ...props }: TextButtonProps) {
  return (
    <button
      type="button"
      className={`py-2.5 px-5 text-sm font-medium text-blue-700 focus:outline-none bg-white rounded-full hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-blue-500 dark:hover:text-white dark:hover:bg-gray-700 ${className ?? ''}`}
      {...props}
    />
  );
}
