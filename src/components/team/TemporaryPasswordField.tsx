"use client";

// Letters and digits that are hard to confuse when read out or typed by hand.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generateTemporaryPassword(length = 12) {
    const values = crypto.getRandomValues(new Uint32Array(length));

    return Array.from(values, (value) => ALPHABET[value % ALPHABET.length]).join("");
}

type TemporaryPasswordFieldProps = {
    id: string;
    value: string;
    onChange: (value: string) => void;
};

// Shown as plain text: the Scrum Master has to pass it on, and the member
// must replace it at their first login.
export default function TemporaryPasswordField({
    id,
    value,
    onChange,
}: TemporaryPasswordFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="label">
                Temporary Password
            </label>

            <div className="flex gap-2">
                <input
                    id={id}
                    type="text"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="input font-mono"
                    autoComplete="off"
                    spellCheck={false}
                    minLength={8}
                    required
                />

                <button
                    type="button"
                    onClick={() => onChange(generateTemporaryPassword())}
                    className="btn-secondary"
                >
                    Generate
                </button>
            </div>

            <p className="hint">
                At least 8 characters. They must choose their own password
                when they first sign in.
            </p>
        </div>
    );
}
