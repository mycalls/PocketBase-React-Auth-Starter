// src/components/ui/InputField.tsx

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  __dummy?: never;
}

export const InputField = ({ ...props }: InputFieldProps) => {
  return (
    <input
      {...props}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
    />
  );
};
