import { TASK_CATEGORIES } from "./shared";

export type TaskFieldValues = {
    title: string;
    category: string;
    priority: string;
    estimatedMins: string;
};

export const EMPTY_TASK_FIELDS: TaskFieldValues = {
    title: "",
    category: "Development",
    priority: "MEDIUM",
    estimatedMins: "60",
};

type TaskFieldsProps = {
    values: TaskFieldValues;
    onChange: (values: TaskFieldValues) => void;
};

// The four inputs shared by the add-task and edit-task forms.
export default function TaskFields({ values, onChange }: TaskFieldsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <input
                type="text"
                placeholder="Task title"
                aria-label="Task title"
                value={values.title}
                onChange={(event) =>
                    onChange({ ...values, title: event.target.value })
                }
                className="input"
                required
            />

            <select
                value={values.category}
                aria-label="Category"
                onChange={(event) =>
                    onChange({ ...values, category: event.target.value })
                }
                className="input"
            >
                {TASK_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>

            <select
                value={values.priority}
                aria-label="Priority"
                onChange={(event) =>
                    onChange({ ...values, priority: event.target.value })
                }
                className="input"
            >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
            </select>

            <input
                type="number"
                min="1"
                placeholder="Estimated minutes"
                aria-label="Estimated minutes"
                value={values.estimatedMins}
                onChange={(event) =>
                    onChange({ ...values, estimatedMins: event.target.value })
                }
                className="input"
                required
            />
        </div>
    );
}
