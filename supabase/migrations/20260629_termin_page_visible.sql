-- Steuert ob die oeffentliche Terminseite /termin direkt erreichbar ist.
-- Bei false: /termin redirected zu /dienstleistungen und der Nav-Eintrag ist versteckt.
-- Workflow-interne Buchung (mit prefill-Token aus dem Fragebogen) bleibt erlaubt.

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS termin_page_visible boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.admin_settings.termin_page_visible IS 'Steuert ob die oeffentliche Terminseite /termin direkt erreichbar ist. Bei false: Redirect zu /dienstleistungen, Nav-Eintrag versteckt. Workflow-Buchung mit prefill-Token bleibt erlaubt.';
