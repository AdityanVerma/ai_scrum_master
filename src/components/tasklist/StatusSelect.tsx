type StatusSelectProps = {
    value: string;
    disabled?: boolean;
    onChange: (status: string) => void;
};

export default function StatusSelect({
    value,
    disabled,
    onChange,
}: StatusSelectProps) {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            aria-label="Status"
            className="input w-auto px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
        </select>
    );
}
