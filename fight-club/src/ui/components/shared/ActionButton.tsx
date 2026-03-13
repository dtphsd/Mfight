import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ActionButtonTone = "primary" | "secondary";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tone?: ActionButtonTone;
}

const baseStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  cursor: "pointer",
};

const toneStyles: Record<ActionButtonTone, CSSProperties> = {
  primary: {
    border: "none",
    background: "#cf6a32",
    color: "#fff8ed",
  },
  secondary: {
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff8ed",
  },
};

export function ActionButton({ children, tone = "secondary", style, ...props }: ActionButtonProps) {
  return (
    <button
      {...props}
      style={{
        ...baseStyle,
        ...toneStyles[tone],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
