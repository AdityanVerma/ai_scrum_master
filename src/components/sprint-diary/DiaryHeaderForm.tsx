"use client";

import {
    DIARY_STATUSES,
    type DiaryHeader,
    type DiaryStatus,
} from "@/lib/sprint-diary/format";

type DiaryHeaderFormProps = {
    values: DiaryHeader;
    disabled: boolean;
    onChange: (values: DiaryHeader) => void;
};

// The part of the diary the Scrum Master writes. It changes slowly, so each
// new diary starts as a copy of the previous one.
export default function DiaryHeaderForm({
    values,
    disabled,
    onChange,
}: DiaryHeaderFormProps) {
    return (
        <div className="space-y-5">
            <div>
                <label htmlFor="diary-phase" className="label">
                    Phase
                </label>

                <input
                    id="diary-phase"
                    type="text"
                    value={values.phase}
                    maxLength={500}
                    disabled={disabled}
                    onChange={(event) =>
                        onChange({ ...values, phase: event.target.value })
                    }
                    placeholder="e.g. Phase 3: [Web] NextJS implementation & new features with AI"
                    className="input"
                />
            </div>

            <div>
                <label htmlFor="diary-macro" className="label">
                    Macro scope (phase level)
                </label>

                <textarea
                    id="diary-macro"
                    value={values.macroScope}
                    maxLength={5000}
                    disabled={disabled}
                    rows={5}
                    onChange={(event) =>
                        onChange({ ...values, macroScope: event.target.value })
                    }
                    placeholder="One line per sprint: Sprint 17 [Phase 3.6] - features - status"
                    className="input leading-6"
                />
            </div>

            <div>
                <label htmlFor="diary-micro" className="label">
                    Micro scope (sprint level)
                </label>

                <textarea
                    id="diary-micro"
                    value={values.microScope}
                    maxLength={5000}
                    disabled={disabled}
                    rows={6}
                    onChange={(event) =>
                        onChange({ ...values, microScope: event.target.value })
                    }
                    placeholder={"Current sprint: Sprint 17 - On track\nPlanned internal release to UAT: Oct 6\nRelease to pre prod: Oct 10"}
                    className="input leading-6"
                />

                <p className="hint">
                    Overtime sprints are added above this automatically.
                </p>
            </div>

            <div className="max-w-xs">
                <label htmlFor="diary-status" className="label">
                    Status
                </label>

                <select
                    id="diary-status"
                    value={values.status ?? ""}
                    disabled={disabled}
                    onChange={(event) =>
                        onChange({
                            ...values,
                            status: (event.target.value || null) as DiaryStatus | null,
                        })
                    }
                    className="input"
                >
                    <option value="">Not set</option>

                    {DIARY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
