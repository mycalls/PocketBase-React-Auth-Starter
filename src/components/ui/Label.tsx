// src/components/ui/Label.tsx

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  __dummy?: never;
}

export const Label = ({ children, ...props }: LabelProps) => {
  return (
    <label {...props} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      {children}
    </label>
  );
};
