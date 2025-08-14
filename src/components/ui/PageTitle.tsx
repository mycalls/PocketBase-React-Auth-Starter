// src/components/ui/PageTitle.tsx

interface PageTitleProps {
  title: string;
  subTitle?: string | null | undefined;
}

export const PageTitle = ({ title, subTitle }: PageTitleProps) => {
  return (
    <>
      <h2 className="text-3xl font-semibold mb-2 text-start text-gray-800">{title}</h2>
      {subTitle && <p>{subTitle}</p>}
    </>
  );
};
