-- Tagesaktuelle Zinssaetze fuer die Homepage. Single-Row (id=1).
-- Wird vom Admin via /admin/zinssaetze gepflegt.

CREATE TABLE IF NOT EXISTS public.interest_rates (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  saron_marge numeric(4,2),
  fixed_5y numeric(4,2),
  fixed_7y numeric(4,2),
  fixed_10y numeric(4,2),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

INSERT INTO public.interest_rates (id, saron_marge, fixed_5y, fixed_7y, fixed_10y)
VALUES (1, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.interest_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "interest_rates_public_read" ON public.interest_rates;
CREATE POLICY "interest_rates_public_read" ON public.interest_rates
  FOR SELECT USING (true);

COMMENT ON TABLE public.interest_rates IS 'Tagesaktuelle Zinssaetze fuer die Homepage. Single-Row (id=1). Wird vom Admin gepflegt.';
