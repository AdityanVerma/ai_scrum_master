type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
};

export default function PageHeader({
  title,
  description,
  eyebrow,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-sm font-medium text-brand-strong">
            {eyebrow}
          </p>
        )}

        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>

        {description && (
          <p className="mt-2 max-w-2xl text-muted">{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}
