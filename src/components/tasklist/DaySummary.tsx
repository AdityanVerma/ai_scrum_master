import { formatTime } from "@/lib/format-date";
import type { Snapshot, Task } from "./shared";

function compareSnapshots(sodTasks: Task[], eodTasks: Task[]) {
    const sodMap = new Map(sodTasks.map((task) => [task.id, task]));

    const completed = eodTasks.filter((task) => {
        const sodTask = sodMap.get(task.id);

        return sodTask && sodTask.status !== "DONE" && task.status === "DONE";
    });

    const added = eodTasks.filter((task) => !sodMap.has(task.id));

    const remaining = eodTasks.filter((task) => task.status !== "DONE");

    return { completed, added, remaining };
}

function latest(snapshots: Snapshot[], type: string) {
    return snapshots
        .filter((snapshot) => snapshot.type === type)
        .sort(
            (a, b) =>
                new Date(b.capturedAt).getTime() -
                new Date(a.capturedAt).getTime(),
        )[0];
}

function Stat({
    label,
    value,
    boxClass,
    labelClass,
    valueClass = "",
}: {
    label: string;
    value: number;
    boxClass: string;
    labelClass: string;
    valueClass?: string;
}) {
    return (
        <div className={`rounded-lg p-3 ${boxClass}`}>
            <p className={`text-xs font-medium ${labelClass}`}>{label}</p>

            <p className={`mt-1 text-xl font-semibold ${valueClass}`}>
                {value}
            </p>
        </div>
    );
}

function TaskGroup({
    title,
    titleClass,
    marker,
    tasks,
    emptyText,
}: {
    title: string;
    titleClass: string;
    marker: string;
    tasks: Task[];
    emptyText: string;
}) {
    return (
        <div className="rounded-lg border border-line bg-surface p-4">
            <p className={`text-xs font-semibold ${titleClass}`}>{title}</p>

            {tasks.length > 0 ? (
                <ul className="mt-2 space-y-2">
                    {tasks.map((task) => (
                        <li key={task.id} className="text-sm">
                            {marker} {task.title}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-2 text-xs text-muted">{emptyText}</p>
            )}
        </div>
    );
}

export default function DaySummary({ snapshots }: { snapshots: Snapshot[] }) {
    const sodSnapshot = latest(snapshots, "SOD");
    const eodSnapshot = latest(snapshots, "EOD");

    const comparison =
        sodSnapshot && eodSnapshot
            ? compareSnapshots(sodSnapshot.tasks, eodSnapshot.tasks)
            : null;

    const shown = [sodSnapshot, eodSnapshot].filter(
        (snapshot): snapshot is Snapshot => Boolean(snapshot),
    );

    return (
        <section className="mt-6 rounded-lg border border-line bg-canvas p-4">
            <h3 className="text-sm font-semibold">Day Summary</h3>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
                {shown.map((snapshot) => (
                    <div
                        key={`${snapshot.type}-${snapshot.capturedAt}`}
                        className="rounded-lg border border-line bg-surface p-4"
                    >
                        <p className="text-sm font-semibold">{snapshot.type}</p>

                        <p className="mt-1 text-xs text-muted">
                            Captured at{" "}
                            {formatTime(snapshot.capturedAt)}
                        </p>

                        <p className="mt-3 text-sm text-muted">
                            Tasks captured:{" "}
                            <span className="font-medium">
                                {snapshot.tasks.length}
                            </span>
                        </p>
                    </div>
                ))}
            </div>

            {comparison && (
                <div className="mt-4 border-t border-line pt-4">
                    <h4 className="text-sm font-semibold">SOD vs EOD</h4>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <Stat
                            label="Completed"
                            value={comparison.completed.length}
                            boxClass="bg-brand-soft"
                            labelClass="text-brand-strong"
                            valueClass="text-brand-strong"
                        />

                        <Stat
                            label="Added During Day"
                            value={comparison.added.length}
                            boxClass="bg-black/5"
                            labelClass="text-muted"
                        />

                        <Stat
                            label="Remaining"
                            value={comparison.remaining.length}
                            boxClass="bg-amber-50"
                            labelClass="text-amber-700"
                            valueClass="text-amber-700"
                        />
                    </div>

                    {/* TODO: a "Carry Forward" button per remaining task is not
                        wired up yet (POST /api/tasklists/[id] with sourceTaskId). */}
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <TaskGroup
                            title="Completed"
                            titleClass="text-brand-strong"
                            marker="✓"
                            tasks={comparison.completed}
                            emptyText="No tasks completed."
                        />

                        <TaskGroup
                            title="Added During Day"
                            titleClass="text-muted"
                            marker="+"
                            tasks={comparison.added}
                            emptyText="No tasks added."
                        />

                        <TaskGroup
                            title="Remaining"
                            titleClass="text-amber-700"
                            marker="○"
                            tasks={comparison.remaining}
                            emptyText="All tasks completed."
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
