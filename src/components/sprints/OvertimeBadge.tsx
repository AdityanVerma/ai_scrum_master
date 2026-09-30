import { getOvertimeDays } from "@/lib/sprint-status";

type OvertimeBadgeProps = {
    sprint: { status: string; endDate: string };
    unfinishedTasks: number;
};

// Shown on an ACTIVE sprint that has run past its end date. The sprint keeps
// running until the Scrum Master ends it.
export default function OvertimeBadge({
    sprint,
    unfinishedTasks,
}: OvertimeBadgeProps) {
    const days = getOvertimeDays(sprint);

    if (days === 0) {
        return null;
    }

    return (
        <span
            className="badge badge-warning"
            title="Past its end date and still active until the Scrum Master ends it."
        >
            Overtime: {days} {days === 1 ? "day" : "days"}, {unfinishedTasks}{" "}
            unfinished
        </span>
    );
}
