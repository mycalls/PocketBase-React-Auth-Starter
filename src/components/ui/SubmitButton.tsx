// src/components/ui/SubmitButton.tsx

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string;
  isLoading?: boolean;
}

export const SubmitButton = ({
  children,
  loadingText,
  isLoading,
  disabled,
  ...props
}: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      {...props}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};
