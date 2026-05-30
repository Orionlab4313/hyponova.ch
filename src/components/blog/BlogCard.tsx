"use client";

import Link from "next/link";

interface Props {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  badge?: string;
  date: string;
  readingTime: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function BlogCard({
  slug,
  title,
  excerpt,
  image,
  badge,
  date,
  readingTime,
}: Props) {
  return (
    <Link href={`/blog/${slug}`} className="block h-full">
      <article
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          overflow: "hidden",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#c8553d";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e5e5e5";
        }}
      >
        <div className="aspect-[16/10] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {badge && (
            <span
              style={{
                display: "inline-block",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#c8553d",
                marginBottom: 10,
              }}
            >
              {badge}
            </span>
          )}
          <h2
            style={{
              fontSize: 17,
              fontWeight: 600,
              lineHeight: 1.35,
              margin: "0 0 8px",
              color: "#1a1a1a",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#555",
              flex: 1,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {excerpt}
          </p>
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#888",
            }}
          >
            <span>
              {formatDate(date)} · {readingTime}
            </span>
            <span style={{ color: "#1a1a1a", fontWeight: 500 }}>
              Weiterlesen →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
