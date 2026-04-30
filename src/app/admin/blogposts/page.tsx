"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog-posts";
import { IconTrash, IconPlus } from "@/components/admin/blogposts/EditorIcons";
import SetupNotice from "@/components/admin/blogposts/SetupNotice";
import ScheduleDialog from "@/components/admin/blogposts/dialogs/ScheduleDialog";

type StatusFilter = "all" | "draft" | "published" | "scheduled";

const statusConfig: Record<
  "draft" | "published" | "scheduled",
  { label: string; color: string; background: string }
> = {
  draft: { label: "Entwurf", color: "#666", background: "#eee" },
  published: { label: "Live", color: "#0a7a2e", background: "#e6f4ea" },
  scheduled: { label: "Geplant", color: "#c8553d", background: "rgba(200,85,61,0.12)" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("de-CH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BlogpostsListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [loadError, setLoadError] = useState<string>("");
  const [openMenu, setOpenMenu] = useState<{
    postId: string;
    top: number;
    left: number;
  } | null>(null);
  const [schedulingPost, setSchedulingPost] = useState<BlogPost | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/blogposts");
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        } else {
          const j = await res.json().catch(() => ({}));
          const msg = String(j.error || "");
          if (/blog_posts|schema cache|relation.*does not exist/i.test(msg)) {
            setSetupNeeded(true);
          } else {
            setLoadError(msg || "Fehler beim Laden");
          }
        }
      } catch (err) {
        if (!cancelled) setLoadError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Status-Dropdown schliessen bei Klick ausserhalb oder Scroll
  useEffect(() => {
    if (!openMenu) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function onScroll() {
      setOpenMenu(null);
    }
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [openMenu]);

  function toggleMenu(postId: string, buttonEl: HTMLButtonElement) {
    if (openMenu?.postId === postId) {
      setOpenMenu(null);
      return;
    }
    const rect = buttonEl.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 150;
    let top = rect.bottom + 6;
    let left = rect.right - menuWidth;
    // Flip wenn unten kein Platz
    if (top + menuHeight > window.innerHeight - 10) {
      top = rect.top - menuHeight - 6;
    }
    // Horizontal einclampen
    if (left < 10) left = 10;
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }
    setOpenMenu({ postId, top, left });
  }

  async function handleDelete(id: string) {
    if (!confirm("Diesen Post wirklich löschen?")) return;
    const res = await fetch(`/api/admin/blogposts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Löschen fehlgeschlagen");
    }
  }

  async function updateStatus(
    post: BlogPost,
    status: "draft" | "published" | "scheduled",
    publishAt?: string | null
  ) {
    const body: Record<string, unknown> = { status };
    if (status === "scheduled") body.publish_at = publishAt;
    if (status === "draft" || status === "published") body.publish_at = null;

    const res = await fetch(`/api/admin/blogposts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
      setOpenMenu(null);
      setSchedulingPost(null);
    } else {
      const j = await res.json().catch(() => ({}));
      alert("Status konnte nicht geändert werden: " + (j.error || "unbekannt"));
    }
  }

  if (setupNeeded) {
    return <SetupNotice />;
  }

  const filtered = posts.filter((p) => filter === "all" || p.status === filter);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Blogposts</h1>
        <Link
          href="/admin/blogposts/new"
          style={{
            padding: "10px 16px",
            background: "#c8553d",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <IconPlus /> Neuer Post
        </Link>
      </div>

      {loadError && (
        <div
          style={{
            padding: "12px 14px",
            background: "rgba(239,68,68,0.08)",
            color: "#c00",
            borderRadius: 4,
            marginBottom: 14,
            fontSize: 14,
          }}
        >
          {loadError}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        {(
          [
            ["all", `Alle (${posts.length})`],
            ["draft", `Entwürfe (${posts.filter((p) => p.status === "draft").length})`],
            ["published", `Live (${posts.filter((p) => p.status === "published").length})`],
            ["scheduled", `Geplant (${posts.filter((p) => p.status === "scheduled").length})`],
          ] as [StatusFilter, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            style={{
              padding: "6px 12px",
              background: filter === k ? "#c8553d" : "#fff",
              color: filter === k ? "#fff" : "#333",
              border: "1px solid " + (filter === k ? "#c8553d" : "#ddd"),
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        {loading && (
          <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
            Laden…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
            Keine Posts in dieser Kategorie. Erstelle deinen ersten Post.
          </div>
        )}
        {!loading &&
          filtered.map((post) => {
            const cfg = statusConfig[post.status] || statusConfig.draft;
            return (
              <div
                key={post.id}
                className="blogpost-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Link
                  href={`/admin/blogposts/${post.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flex: 1,
                    minWidth: 0,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 42,
                      background: "#f0f0f0",
                      borderRadius: 4,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {post.hero_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.hero_image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {post.title_de || post.title_en || "(ohne Titel)"}
                      {post.content_html_en && post.content_html_en.trim() && (
                        <span
                          title="EN-Version vorhanden"
                          style={{
                            marginLeft: 6,
                            fontSize: 9,
                            padding: "2px 5px",
                            background: "#e6f4ea",
                            color: "#0a7a2e",
                            borderRadius: 6,
                            fontWeight: 700,
                            verticalAlign: "middle",
                          }}
                        >
                          DE/EN
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#888",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      /{post.slug} · {formatDate(post.created_at)}
                      {post.status === "scheduled" && post.publish_at && (
                        <> · geplant für {formatDateTime(post.publish_at)}</>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Status-Button (Dropdown öffnet sich als Portal ausserhalb des Containers) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(post.id, e.currentTarget);
                  }}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "6px 10px",
                    background: cfg.background,
                    color: cfg.color,
                    borderRadius: 12,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {cfg.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#c00",
                    cursor: "pointer",
                    padding: 6,
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Löschen"
                  title="Löschen"
                >
                  <IconTrash />
                </button>
              </div>
            );
          })}
      </div>

      {/* Status-Dropdown als Fixed-Portal, ausserhalb des Containers mit overflow:hidden */}
      {openMenu &&
        (() => {
          const post = posts.find((p) => p.id === openMenu.postId);
          if (!post) return null;
          return (
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: openMenu.top,
                left: openMenu.left,
                width: 220,
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: 6,
                boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
                zIndex: 2000,
                padding: 4,
              }}
            >
              <button
                type="button"
                onClick={() => updateStatus(post, "draft")}
                disabled={post.status === "draft"}
                style={dropdownItemStyle(post.status === "draft")}
              >
                Als Entwurf
              </button>
              <button
                type="button"
                onClick={() => updateStatus(post, "published")}
                disabled={post.status === "published"}
                style={dropdownItemStyle(post.status === "published")}
              >
                Sofort veröffentlichen
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  setSchedulingPost(post);
                }}
                style={dropdownItemStyle(false)}
              >
                {post.status === "scheduled" ? "Termin ändern" : "Planen…"}
              </button>
            </div>
          );
        })()}

      {schedulingPost && (
        <ScheduleDialog
          initial={schedulingPost.publish_at}
          onClose={() => setSchedulingPost(null)}
          onConfirm={(iso) => updateStatus(schedulingPost, "scheduled", iso)}
        />
      )}

      <style>{`
        @media (max-width: 640px) {
          .blogpost-row {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

function dropdownItemStyle(disabled: boolean): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    background: "transparent",
    border: "none",
    borderRadius: 4,
    fontSize: 14,
    cursor: disabled ? "default" : "pointer",
    color: disabled ? "#aaa" : "#1a1a1a",
    fontFamily: "inherit",
  };
}
