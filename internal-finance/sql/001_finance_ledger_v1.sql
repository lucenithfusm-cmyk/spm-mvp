-- SPM FINANCE v1 — DRAFT MIGRATION, NOT APPLIED.
-- Apply to Supabase staging after a backup, a designated admin, and QA.
-- No business, identity, or health data from end users should be stored here.
BEGIN;
CREATE TABLE IF NOT EXISTS public.spm_finance_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.spm_finance_admins FROM anon, authenticated;
ALTER TABLE public.spm_finance_admins ENABLE ROW LEVEL SECURITY;
-- Intentionally no browser RLS policies for the admin list.
-- Provision the owner via a controlled server-side, service-role operation.
CREATE OR REPLACE FUNCTION public.spm_is_finance_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$ SELECT EXISTS(
  SELECT 1 FROM public.spm_finance_admins a WHERE a.user_id=(select auth.uid())
) $$;
REVOKE ALL ON FUNCTION public.spm_is_finance_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spm_is_finance_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS public.spm_finance_sales (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 payment_provider text NOT NULL DEFAULT 'wompi' CHECK(payment_provider IN ('wompi','mercadopago','manual_import')),
 provider_payment_id text NOT NULL,
 order_reference text,
 product_code text NOT NULL DEFAULT 'spm-28d',
 currency text NOT NULL DEFAULT 'COP' CHECK(currency='COP'),
 amount_gross_cop bigint NOT NULL CHECK(amount_gross_cop>=0),
 refund_cop bigint NOT NULL DEFAULT 0 CHECK(refund_cop>=0),
 fee_cop bigint NOT NULL DEFAULT 0 CHECK(fee_cop>=0),
 withholding_cop bigint NOT NULL DEFAULT 0 CHECK(withholding_cop>=0),
 payment_status text NOT NULL CHECK(payment_status IN ('pending','approved','declined','voided','partially_refunded','refunded')),
 purchased_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(payment_provider,provider_payment_id),
 CHECK(refund_cop<=amount_gross_cop)
);
ALTER TABLE public.spm_finance_sales ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.spm_finance_sales FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.spm_finance_sales TO authenticated;
CREATE POLICY spm_fin_sales_owner_read ON public.spm_finance_sales FOR SELECT TO authenticated
USING ((select public.spm_is_finance_admin()));
-- NO browser write policies. Upsert only via verified backend webhook/service role.

CREATE TABLE IF NOT EXISTS public.spm_finance_movements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 movement_date date NOT NULL,
 category text NOT NULL CHECK(category IN ('wompi_payout','business_expense','bank_fee','owner_draw','owner_contribution','refund_from_bank','correction_credit','correction_debit')),
 amount_cop bigint NOT NULL CHECK(amount_cop>0),
 description text NOT NULL CHECK(char_length(description)<=600),
 external_reference text,
 actor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.spm_finance_movements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.spm_finance_movements FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT ON public.spm_finance_movements TO authenticated;
CREATE POLICY spm_fin_movement_admin_read ON public.spm_finance_movements FOR SELECT TO authenticated
USING ((select public.spm_is_finance_admin()));
CREATE POLICY spm_fin_movement_admin_insert ON public.spm_finance_movements FOR INSERT TO authenticated
WITH CHECK ((select public.spm_is_finance_admin()) AND actor_id=(select auth.uid()));
-- Deliberately append-only: corrections are additional movements, not edits/deletes.

CREATE TABLE IF NOT EXISTS public.spm_finance_settings (
 id text PRIMARY KEY CHECK(id='spm'),
 reserve_refund_pct numeric(5,2) NOT NULL DEFAULT 0 CHECK(reserve_refund_pct BETWEEN 0 AND 100),
 reserve_growth_pct numeric(5,2) NOT NULL DEFAULT 0 CHECK(reserve_growth_pct BETWEEN 0 AND 100),
 withdrawal_target_cop bigint NOT NULL DEFAULT 0 CHECK(withdrawal_target_cop>=0),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(reserve_refund_pct + reserve_growth_pct <= 100)
);
INSERT INTO public.spm_finance_settings(id) VALUES('spm') ON CONFLICT(id) DO NOTHING;
ALTER TABLE public.spm_finance_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.spm_finance_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT,UPDATE ON public.spm_finance_settings TO authenticated;
CREATE POLICY spm_fin_settings_admin_read ON public.spm_finance_settings FOR SELECT TO authenticated
USING ((select public.spm_is_finance_admin()));
CREATE POLICY spm_fin_settings_admin_update ON public.spm_finance_settings FOR UPDATE TO authenticated
USING ((select public.spm_is_finance_admin()))
WITH CHECK ((select public.spm_is_finance_admin()));
COMMIT;
