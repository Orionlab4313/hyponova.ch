interface Props {
  provider: "youtube" | "vimeo";
  videoId: string;
}

export default function BlogVideoEmbed({ provider, videoId }: Props) {
  const src =
    provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : `https://player.vimeo.com/video/${videoId}`;

  return (
    <div
      className="my-8 w-full"
      style={{
        position: "relative",
        paddingBottom: "56.25%",
        height: 0,
        overflow: "hidden",
        borderRadius: 8,
      }}
    >
      <iframe
        src={src}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
  );
}

export function parseVideoUrl(
  url: string
): { provider: "youtube" | "vimeo"; id: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return { provider: "youtube", id: v };
      // /embed/ID
      const m = u.pathname.match(/^\/embed\/([A-Za-z0-9_-]{6,})/);
      if (m) return { provider: "youtube", id: m[1] };
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return { provider: "youtube", id };
    }

    // Vimeo
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const m = u.pathname.match(/\/(\d+)/);
      if (m) return { provider: "vimeo", id: m[1] };
    }
    return null;
  } catch {
    return null;
  }
}
