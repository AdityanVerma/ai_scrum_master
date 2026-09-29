type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageContainer({
  children,
  className = '',
}: PageContainerProps) {
  return (
    <main className={`flex-1 px-4 py-8 sm:px-6 sm:py-10 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  );
}
