import { ArrowLeft, Building2, Loader2, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { resolveDashboardDestination } from "@/lib/dashboardAccess";

export default function CompanyDetailPage() {
  const [, params] = useRoute("/company/:id");
  const [, setLocation] = useLocation();
  const companyId = Number(params?.id ?? 0);
  const membership = trpc.companies.membership.useQuery({ companyId }, { enabled: Number.isInteger(companyId) && companyId > 0, retry: false });
  useEffect(() => { if (membership.isError) setLocation(resolveDashboardDestination(`/company/${companyId}`, "user", false)); }, [membership.isError, companyId, setLocation]);
  if (membership.isLoading) return <DashboardLayout eyebrow="SURA / COMPANY" title="Opening your company studio." description="Checking secure company membership before showing management details."><div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-[#a96b35]" /></div></DashboardLayout>;
  if (membership.isError || !membership.data) return <DashboardLayout eyebrow="SURA / COMPANY" title="Returning to your company studio." description="Company management requires an active owner, manager, or editor membership."><div className="rounded-[1.5rem] border border-[#e3c1b2] bg-[#fff3ed] p-7 text-sm text-[#7e4839]">Access was not granted. Redirecting to your company studio…</div></DashboardLayout>;
  return <DashboardLayout eyebrow="SURA / COMPANY MANAGEMENT" title="A studio with secure boundaries." description="Only active company members can open this management space. Your role controls what you can do next."><Link href="/company" className="vb-focus inline-flex items-center gap-2 text-sm font-bold text-[#795634]"><ArrowLeft className="h-4 w-4" />Back to all company spaces</Link><section className="mt-7 rounded-[1.6rem] border border-[#ded1bf] bg-[#fbf8f2] p-7"><div className="flex items-start justify-between gap-4"><div><p className="vb-kicker text-[#9d5b2d]">Secure company access</p><h2 className="vb-serif mt-3 text-4xl">Member role: {membership.data.memberRole}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#756655]">This view is intentionally gated by a server-side membership check. Manage company settings and sensitive controls only after a verified company workspace is connected.</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1d1b18] text-[#e5aa63]"><ShieldCheck className="h-5 w-5" /></div></div><div className="mt-7 rounded-2xl border border-dashed border-[#cfbda8] bg-[#f8f2e9] p-5 text-sm text-[#766756]"><Building2 className="mb-3 h-5 w-5 text-[#a96b35]" />Company-specific editing is ready to expand here without loosening the membership boundary.</div></section></DashboardLayout>;
}
