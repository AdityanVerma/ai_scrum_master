import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";

type NotAllowedProps = {
  message?: string;
};

// Shown when someone opens a page their role cannot use, for example a Member
// opening Plan Sprint by its URL. The API refuses the actions anyway; this
// explains why instead of showing a page full of failing buttons.
export default function NotAllowed({
  message = "This page is only for the Scrum Master.",
}: NotAllowedProps) {
  return (
    <PageContainer>
      <div className="card mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-semibold">Not allowed</h1>

        <p className="mt-2 text-muted">{message}</p>

        <p className="mt-1 text-sm text-muted">
          If you need access, ask your Scrum Master.
        </p>

        <Link href="/" className="btn-primary mt-6">
          Back to Dashboard
        </Link>
      </div>
    </PageContainer>
  );
}
