import Link from "next/link";

interface Props {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}

export default function BlogButton({
  href,
  label,
  variant = "primary",
}: Props) {
  const isExternal = /^https?:\/\//.test(href);

  const baseStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    textDecoration: "none",
    transition: "opacity 0.15s, background 0.15s",
  };

  const style: React.CSSProperties =
    variant === "primary"
      ? { ...baseStyle, background: "#0a0a0a", color: "#fff" }
      : {
          ...baseStyle,
          background: "transparent",
          color: "#0a0a0a",
          border: "1px solid #d4d4d4",
        };

  return (
    <div className="my-8 flex justify-center">
      {isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
          {label}
        </a>
      ) : (
        <Link href={href} style={style}>
          {label}
        </Link>
      )}
    </div>
  );
}
