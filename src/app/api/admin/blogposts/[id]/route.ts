import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Blogpost GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = createServiceClient();
    const body = await request.json();

    const { data: previous } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    const oldSlug = previous?.slug as string | undefined;

    if (body.slug) {
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", body.slug)
        .neq("id", id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { error: "Slug ist bereits vergeben" },
          { status: 409 }
        );
      }
    }

    const allowed = [
      "title_de",
      "title_en",
      "title_highlight_de",
      "title_highlight_en",
      "badge_de",
      "badge_en",
      "slug",
      "excerpt_de",
      "excerpt_en",
      "hero_image",
      "content_html_de",
      "content_html_en",
      "reading_time_de",
      "reading_time_en",
      "status",
      "publish_at",
      "meta_description_de",
      "meta_description_en",
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/blog");
    if (data?.slug) revalidatePath(`/blog/${data.slug}`);
    if (oldSlug && oldSlug !== data?.slug) revalidatePath(`/blog/${oldSlug}`);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Blogpost PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = createServiceClient();

    const { data: previous } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    const slug = previous?.slug as string | undefined;

    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/blog");
    if (slug) revalidatePath(`/blog/${slug}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blogpost DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
