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
  const className = variant === "primary" ? "btn-primary" : "btn-secondary";

  return (
    <div className="my-8 flex justify-center">
      {isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {label}
        </a>
      ) : (
        <Link href={href} className={className}>
          {label}
        </Link>
      )}
    </div>
  );
}
