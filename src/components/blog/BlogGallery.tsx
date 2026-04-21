interface Props {
  images: { src: string; alt?: string }[];
  columns?: 2 | 3;
}

export default function BlogGallery({ images, columns = 2 }: Props) {
  if (!images.length) return null;
  return (
    <div
      className="my-8 grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={img.src}
          alt={img.alt || ""}
          loading="lazy"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 8,
            display: "block",
          }}
        />
      ))}
      <style>{`
        @media (max-width: 640px) {
          .blog-prose > div[data-gallery] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
