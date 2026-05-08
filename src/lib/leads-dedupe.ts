type LeadIdentity = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

function normName(v: string | null | undefined): string {
  return (v || "").toLowerCase().trim().replace(/\s+/g, " ");
}

function normEmail(v: string | null | undefined): string {
  return (v || "").toLowerCase().trim();
}

function normPhone(v: string | null | undefined): string {
  return (v || "").replace(/\D+/g, "");
}

export function leadDedupeKey(lead: LeadIdentity): string {
  return [
    normName(lead.first_name),
    normName(lead.last_name),
    normEmail(lead.email),
    normPhone(lead.phone),
  ].join("|");
}

export type DedupeGroup<T> = {
  key: string;
  keep: T;
  remove: T[];
};

export function groupDuplicates<T extends LeadIdentity & { id: string; created_at?: string | null }>(
  leads: T[]
): DedupeGroup<T>[] {
  const buckets = new Map<string, T[]>();
  for (const lead of leads) {
    const key = leadDedupeKey(lead);
    if (!key.replace(/\|/g, "")) continue;
    const arr = buckets.get(key) || [];
    arr.push(lead);
    buckets.set(key, arr);
  }

  const groups: DedupeGroup<T>[] = [];
  for (const [key, arr] of buckets.entries()) {
    if (arr.length < 2) continue;
    const sorted = [...arr].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return ta - tb;
    });
    const [keep, ...remove] = sorted;
    groups.push({ key, keep, remove });
  }
  return groups;
}
