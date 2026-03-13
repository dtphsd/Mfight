interface PreviewTagProps {
  label: string;
}

export function PreviewTag({ label }: PreviewTagProps) {
  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "3px 7px",
        fontSize: "9px",
        color: "#e8dbc9",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {label}
    </span>
  );
}
