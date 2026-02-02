import { THEME } from "@/core/constants";

interface ToggleSwitchProps {
    name: string;
    value: boolean;
    onChange: (name: string, value: boolean) => void;
    label?: string;
    yesLabel?: string;
    noLabel?: string;
    disabled?: boolean;
    required?: boolean
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    name,
    value,
    onChange,
    label,
    yesLabel = "YES",
    noLabel = "NO",
    disabled = false,
    required,
}) => {
    const handleToggle = () => {
        if (disabled) return;
        onChange(name, !value);
    };
    const theme = THEME
    return (

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {label && (
                <label style={{
                    display: 'block',
                    fontSize: theme.fontSize.sm,
                    fontWeight: theme.fontWeight.medium,
                    color: theme.colors.text,
                    marginBottom: theme.spacing.sm,
                }}>
                    {label}
                    {required && <span style={{ color: theme.colors.error, marginLeft: '4px' }}>*</span>}
                </label>

            )}

            {/* Toggle */}
            <div
                onClick={handleToggle}
                style={{
                    width: 70,
                    height: 32,
                    borderRadius: 20,
                    background: value ? "#135BEC" : "#9ca3af",
                    cursor: disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 3,
                    position: "relative",
                    transition: "0.3s",
                }}
            >
                <div
                    style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "#fff",
                        transform: value ? "translateX(38px)" : "translateX(0)",
                        transition: "0.3s",
                    }}
                />

                <span
                    style={{
                        position: "absolute",
                        fontSize: 11,
                        color: "#fff",
                        fontWeight: 600,
                        left: value ? 8 : 34,
                    }}
                >
                    {value ? yesLabel : noLabel}
                </span>
            </div>
        </div>
    );
};

export default ToggleSwitch;
