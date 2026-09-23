type PageContainerProps = {
    children: React.ReactNode;
    className?: string;
};

export default function PageContainer({
    children,
    className = "",
}: PageContainerProps) {
    return (
        <main
            className={`min-h-screen bg-[#F8F7F2] px-4 py-8 text-[#1F2924] sm:px-6 sm:py-10 ${className}`}
        >
            <div className="mx-auto max-w-6xl">
                {children}
            </div>
        </main>
    );
}