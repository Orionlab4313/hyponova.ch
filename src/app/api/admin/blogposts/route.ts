import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase";

async function promoteScheduledPosts(
  supabase: ReturnType<typeof createServiceClient>
) {
  try {
    await supabase
      .from("blog_posts")
      .update({ status: "published", updated_at: new Date().toISOString() })
      .eq("status", "scheduled")
      .lte("publish_at", new Date().toISOString());
  } catch (err) {
    console.error("Auto-promote scheduled posts failed:", err);
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    await promoteScheduledPosts(supabase);

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Blogposts GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    if (!body.title_de || !body.title_de.trim()) {
      return NextResponse.json(
        { error: "Deutscher Titel ist erforderlich" },
        { status: 400 }
      );
    }
    if (!body.slug || !body.slug.trim()) {
      return NextResponse.json(
        { error: "Slug ist erforderlich" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", body.slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Slug ist bereits vergeben" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title_de: body.title_de,
        title_en: body.title_en || "",
        title_highlight_de: body.title_highlight_de || null,
        title_highlight_en: body.title_highlight_en || null,
        badge_de: body.badge_de || "Blog",
        badge_en: body.badge_en || "Blog",
        slug: body.slug,
        excerpt_de: body.excerpt_de || "",
        excerpt_en: body.excerpt_en || "",
        hero_image: body.hero_image || "",
        content_html_de: body.content_html_de || "",
        content_html_en: body.content_html_en || "",
        reading_time_de: body.reading_time_de || "5 min",
        reading_time_en: body.reading_time_en || "5 min",
        status: body.status || "draft",
        publish_at: body.publish_at || null,
        meta_description_de: body.meta_description_de || null,
        meta_description_en: body.meta_description_en || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/blog");
    if (data?.slug) revalidatePath(`/blog/${data.slug}`);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Blogposts POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
