import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import UploadView from "./UploadView";
import { verifyUploadToken } from "@/lib/upload-tokens";
import { createServiceClient } from "@/lib/supabase";
import { requiredDocumentCategories, DOCUMENT_CATEGORY_LABELS, type SubmissionType } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dokumenten-Upload | HYPONOVA",
  robots: { index: false, follow: false },
};

interface Props { params: Promise<{ token: string }> }

async function readLang(): Promise<"de" | "en"> {
  const c = await cookies();
  const v = c.get("hyponova-lang")?.value;
  return v === "en" ? "en" : "de";
}

export default async function UploadPage({ params }: Props) {
  const { token } = await params;
  const tok = await verifyUploadToken(token);
  if (!tok) notFound();

  const sb = createServiceClient();
  const [{ data: lead }, { data: submission }, { data: documents }] = await Promise.all([
    sb.from("leads").select("first_name,last_name,email").eq("id", tok.lead_id).maybeSingle(),
    tok.submission_id
      ? sb.from("questionnaire_submissions").select("type,answers,lang").eq("id", tok.submission_id).maybeSingle()
      : Promise.resolve({ data: null }),
    sb.from("documents").select("id,category,file_name,file_size,uploaded_at,status").eq("lead_id", tok.lead_id).order("uploaded_at", { ascending: false }),
  ]);

  if (!lead) notFound();

  const lang = (submission?.lang as "de" | "en") || (await readLang());

  let categories: { key: string; label: string }[] = [];
  if (submission) {
    const reqCats = requiredDocumentCategories(submission.type as SubmissionType, submission.answers as any);
    categories = reqCats.map((k) => ({ key: k, label: DOCUMENT_CATEGORY_LABELS[k]?.[lang] ?? k }));
  } else {
    // Fallback: zeige alle Kategorien
    categories = Object.entries(DOCUMENT_CATEGORY_LABELS).map(([k, v]) => ({ key: k, label: v[lang] }));
  }

  return (
    <>
      <Header />
      <main>
        <UploadView
          token={token}
          lang={lang}
          leadName={`${lead.first_name} ${lead.last_name}`}
          categories={categories}
          existingDocuments={documents || []}
          expiresAt={tok.expires_at}
          submissionType={(submission?.type as SubmissionType) || null}
        />
      </main>
      <Footer />
    </>
  );
}
