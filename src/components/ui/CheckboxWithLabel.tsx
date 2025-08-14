// src/components/ui/CheckboxWithLabel.tsx

interface CheckboxWithLabelProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  containerClassName?: string;
}

export function CheckboxWithLabel({
  id,
  label,
  containerClassName,
  className,
  ...props
}: CheckboxWithLabelProps) {
  return (
    <div className={`flex items-start mb-5 ${containerClassName ?? ''}`}>
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          className={`w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 ${className ?? ''}`}
          {...props}
        />
      </div>
      <label htmlFor={id} className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        {label}
      </label>
    </div>
  );
}
