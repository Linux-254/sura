import { useEffect, useState } from "react";
import { Landmark, Percent, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { SuraEmptyState, SuraErrorState, SuraProcessing } from "@/components/SuraStates";
import { useAuth } from "@/_core/hooks/useAuth";
import { resolveDashboardDestination } from "@/lib/dashboardAccess";
import { trpc } from "@/lib/trpc";

export default function AdminCommissionPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const companies = trpc.admin.companyReviewQueue.useQuery(undefined, { enabled: user?.role === "admin" });
  const updateRate = trpc.admin.setCompanyCommissionRate.useMutation({ onSuccess: () => companies.refetch() });
  const [drafts, setDrafts] = useState<Record<number, number>>({});
  useEffect(() => { if (user && user.role !== "admin") setLocation(resolveDashboardDestination("/admin/commissions", user.role)); }, [user, setLocation]);
  if (user && user.role !== "admin") return <DashboardLayout eyebrow="SURA / ACCOUNT" title="Returning you to your private space." description="Commission controls are reserved for the platform administrator."><SuraProcessing title="Returning you safely." copy="This control is not available to member accounts." /></DashboardLayout>;

  return <DashboardLayout eyebrow="SURA / ADMIN / COMMISSIONS" title="A clear rate, held at the source." description="Only platform administrators can set a company’s SURA commission. Orders always read this server-held rate; customers cannot supply or override it.">
    <section className="mb-6 rounded-[1.6rem] border border-[#d4bea3] bg-[#fffaf3] p-5 sm:p-7"><div className="flex gap-3"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#a66732]" /><div><h2 className="text-base font-bold text-[#3c2e22]">Transparent allocation boundary</h2><p className="mt-1 text-sm leading-6 text-[#756655]">Every rate is constrained to 20%–50%. Seller settlement is the merchandise subtotal less the SURA commission; delivery remains separate. Actual fund splitting requires a verified payment provider and reconciliation process.</p></div></div></section>
    {companies.isLoading && <SuraProcessing eyebrow="SURA / ADMIN" title="Loading company rates." copy="Preparing the company records governed by the commission boundary." />}
    {companies.isError && <SuraErrorState title="Company rates are unavailable right now." copy="No rate change was made. Try loading the administrator queue again." onRetry={() => companies.refetch()} />}
    {companies.data?.length === 0 && <SuraEmptyState eyebrow="SURA / ADMIN" title="No company rate records yet." copy="Companies will appear here once their studio record has been created." />}
    <section className="grid gap-4 xl:grid-cols-2">{companies.data?.map((company) => { const rate = drafts[company.id] ?? company.commissionRatePct; const validRate = Number.isInteger(rate) && rate >= 20 && rate <= 50; return <article key={company.id} className="rounded-[1.6rem] border border-[#ded1bf] bg-[#fbf8f2] p-5 shadow-[0_12px_30px_rgba(58,40,21,0.05)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="vb-kicker text-[#9d5b2d]">{company.verificationStatus} · {company.city || "City to be confirmed"}</p><h2 className="vb-serif mt-2 text-3xl">{company.name}</h2><p className="mt-2 text-sm text-[#756655]">{company.slug}</p></div><Landmark className="h-5 w-5 text-[#a96b35]" /></div><div className="mt-6 rounded-2xl bg-[#f0e8dc] p-4"><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#76563b]">Current allocation rule</p><p className="mt-2 text-sm leading-6 text-[#5e4835]">SURA receives <strong>{company.commissionRatePct}%</strong> of merchandise. The seller’s recorded settlement is <strong>{100 - company.commissionRatePct}%</strong>; delivery is not part of this split.</p></div><label className="mt-6 block"><span className="text-xs font-bold uppercase tracking-[0.08em] text-[#756452]">SURA commission rate</span><div className="mt-2 flex items-center gap-3"><div className="flex flex-1 items-center rounded-xl border border-[#ded1c1] bg-white px-3"><input aria-label={`Commission rate for ${company.name}`} value={rate} onChange={(event) => setDrafts((current) => ({ ...current, [company.id]: Number(event.target.value) }))} type="number" min="20" max="50" step="1" className="vb-focus w-full bg-transparent py-3 text-lg font-bold outline-none" /><Percent className="h-4 w-4 text-[#9a5e30]" /></div><button disabled={!validRate || updateRate.isPending || rate === company.commissionRatePct} onClick={() => updateRate.mutate({ companyId: company.id, commissionRatePct: rate })} className="vb-button vb-focus rounded-full bg-[#1d1b18] px-4 py-3 text-xs font-bold text-[#fbf7ef] disabled:opacity-50">Save rate</button></div><p className={`mt-2 text-xs ${validRate ? "text-[#756655]" : "text-[#9a4533]"}`}>{validRate ? "The permitted range is 20% to 50%." : "Use a whole number from 20% to 50%."}</p></label></article>; })}</section>
    {updateRate.isError && <p className="mt-5 rounded-xl bg-[#fff0eb] p-4 text-sm text-[#8c3c2b]">The rate was not updated. Confirm it is a whole number from 20% to 50%, then try again.</p>}
  </DashboardLayout>;
}
