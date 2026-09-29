export type SubtaskFieldValues = {
    title: string;
    estimatedMins: string;
};

export const EMPTY_SUBTASK_FIELDS: SubtaskFieldValues = {
    title: "",
    estimatedMins: "60",
};

type SubtaskFieldsProps = {
    values: SubtaskFieldValues;
    onChange: (values: SubtaskFieldValues) => void;
};

// The two inputs shared by the add-subtask and edit-subtask forms.
export default function SubtaskFields({
    values,
    onChange,
}: SubtaskFieldsProps) {
    return (
        <div className="flex gap-3">
            <input
                type="text"
                placeholder="Subtask title"
                aria-label="Subtask title"
                value={values.title}
                onChange={(event) =>
                    onChange({ ...values, title: event.target.value })
                }
                className="input flex-1"
                required
            />

            <input
                type="number"
                min="1"
                placeholder="Minutes"
                aria-label="Minutes"
                value={values.estimatedMins}
                onChange={(event) =>
                    onChange({ ...values, estimatedMins: event.target.value })
                }
                className="input w-32"
                required
            />
        </div>
    );
}
