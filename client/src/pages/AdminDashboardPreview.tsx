import React, { useState } from "react";
import { BadgeCheck, BellRing, CalendarDays, ChartNoAxesCombined, ChevronRight, ClipboardCheck, EyeOff, Landmark, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "wouter";
import { VibeLayout } from "@/components/VibeLayout";

type ReportRange = "today" | "month" | "year" | "custom";
type PreviewTab = "overview" | "sales" | "companies" | "member-safety" | "engagement";

const reportRanges: { id: ReportRange; label: string }[] = [
  { id: "today", label: "Day" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "custom", label: "Custom date" },
];

const tabs: { id: PreviewTab; label: string; Icon: typeof ClipboardCheck }[] = [
  { id: "overview", label: "Overview", Icon: ChartNoAxesCombined },
  { id: "sales", label: "Sales & payouts", Icon: Landmark },
  { id: "companies", label: "Company quality", Icon: BadgeCheck },
  { id: "member-safety", label: "Member safety", Icon: ShieldCheck },
  { id: "engagement", label: "Engagement", Icon: BellRing },
];

const tabContent: Record<PreviewTab, { eyebrow: string; title: string; copy: string; action: string }> = {
  overview: { eyebrow: "ADMINISTRATOR OVERVIEW", title: "Governance starts with a clean view.", copy: "Protected operational data will appear here only after a verified administrator accesses the live workspace.", action: "Open live overview" },
  sales: { eyebrow: "SALES & PAYOUTS", title: "No protected sales data is connected to this preview.", copy: "Live sales, commission allocation, delivery, refunds, and seller settlements require a verified payment provider and protected reporting access.", action: "Open sales reporting" },
  companies: { eyebrow: "COMPANY QUALITY", title: "No company records are shown in this preview.", copy: "Verification decisions, catalog health, delivery readiness, and offer reviews stay inside the protected administrator workspace.", action: "Review company queue" },
  "member-safety": { eyebrow: "MEMBER SAFETY", title: "Privacy signals stay server-held.", copy: "Account, moderation, permission, and audit controls must never be exposed through a public dashboard preview.", action: "Open safety controls" },
  engagement: { eyebrow: "ENGAGEMENT", title: "Announcements are not published from preview.", copy: "Public contact routes and notifications require authenticated administrator review before they affect the SURA experience.", action: "Open engagement controls" },
};

export default function AdminDashboardPreview() {
  const [range, setRange] = useState<ReportRange>("month");
  const [activeTab, setActiveTab] = useState<PreviewTab>("overview");
  const [customDate, setCustomDate] = useState("");
  const currentTab = tabContent[activeTab];

  return <VibeLayout>
    <main className="container py-10 sm:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-[#d8c6b1] bg-[#1d1b18] px-6 py-8 text-[#faf4eb] shadow-[0_24px_60px_rgba(31,23,15,0.16)] sm:px-10 sm:py-11">
        <div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><p className="vb-kicker text-[#d7a261]">SURA / ADMINISTRATOR PREVIEW</p><h1 className="vb-serif mt-4 text-4xl leading-[0.95] sm:text-6xl">A clear view, held with care.</h1><p className="mt-5 max-w-xl text-sm leading-6 text-[#d8cabc] sm:text-base">Explore the controls and reporting structure without exposing live users, companies, orders, payment records, sales, or review data.</p></div><div className="flex items-center gap-3 rounded-2xl border border-[#5b5042] bg-[#27221d] px-4 py-3 text-sm"><EyeOff className="h-5 w-5 text-[#d7a261]" /><span><strong className="block text-[#faf4eb]">Privacy-safe preview</strong><span className="text-xs text-[#cbbca9]">Read-only, no live records</span></span></div></div>
        <div className="mt-9 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#554a3c] bg-[#27221d] p-4"><UsersRound className="h-4 w-4 text-[#d7a261]" /><p className="mt-5 text-2xl font-bold">0</p><p className="mt-1 text-xs text-[#d8cabc]">Private records revealed</p></div><div className="rounded-2xl border border-[#554a3c] bg-[#27221d] p-4"><BadgeCheck className="h-4 w-4 text-[#d7a261]" /><p className="mt-5 text-2xl font-bold">20–50%</p><p className="mt-1 text-xs text-[#d8cabc]">Commission governance range</p></div><div className="rounded-2xl border border-[#554a3c] bg-[#27221d] p-4"><ShieldCheck className="h-4 w-4 text-[#d7a261]" /><p className="mt-5 text-2xl font-bold">Server-held</p><p className="mt-1 text-xs text-[#d8cabc]">Payment and moderation boundaries</p></div></div>
      </section>

      <section className="mt-8 rounded-[1.7rem] border border-[#ded1bf] bg-[#fbf8f2] p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="vb-kicker text-[#9d5b2d]">REPORTING WINDOW</p><h2 className="vb-serif mt-2 text-3xl text-[#2d2219]">Choose the operational view.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#756655]">These filters are interactive for layout preview only. They do not query or infer commercial activity.</p></div><CalendarDays className="h-6 w-6 text-[#a66732]" /></div><div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Preview report period">{reportRanges.map((item) => <button key={item.id} type="button" onClick={() => setRange(item.id)} className={`vb-focus rounded-full border px-4 py-2 text-xs font-bold transition-colors ${range === item.id ? "border-[#1d1b18] bg-[#1d1b18] text-[#fbf7ef]" : "border-[#d4c2b0] bg-white text-[#624f3d] hover:bg-[#efe4d4]"}`}>{item.label}</button>)}{range === "custom" && <label className="flex items-center gap-2 rounded-full border border-[#d4c2b0] bg-white px-3 py-1.5 text-xs font-bold text-[#624f3d]">Date<input aria-label="Custom preview date" type="date" value={customDate} onChange={(event) => setCustomDate(event.target.value)} className="bg-transparent text-xs outline-none" /></label>}</div><p className="mt-4 text-xs text-[#8a7865]">Selected preview period: <strong>{range === "custom" ? customDate || "Choose a date" : reportRanges.find((item) => item.id === range)?.label}</strong> · no live metrics connected</p></section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[15rem_1fr]"><aside className="rounded-[1.6rem] border border-[#ded1bf] bg-[#fbf8f2] p-3"><p className="px-3 pt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9d5b2d]">Operations</p><div className="mt-3 space-y-1" role="tablist" aria-label="Administrator preview sections">{tabs.map(({ id, label, Icon }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`vb-focus flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${activeTab === id ? "bg-[#1d1b18] text-[#fbf7ef]" : "text-[#625342] hover:bg-[#efe6da]"}`}><Icon className="h-4 w-4" />{label}</button>)}</div><div className="mt-4 border-t border-[#e5dbcf] px-3 pt-4 text-xs leading-5 text-[#756655]">Live routes require a verified, registered account and server-enforced administrator role.</div></aside>
        <div className="space-y-5"><article className="rounded-[1.6rem] border border-[#ded1bf] bg-[#fbf8f2] p-6 sm:p-7"><p className="vb-kicker text-[#9d5b2d]">{currentTab.eyebrow}</p><h2 className="vb-serif mt-4 text-3xl text-[#2d2219]">{currentTab.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#756655]">{currentTab.copy}</p><button disabled className="mt-6 rounded-full border border-[#d4c2b0] px-4 py-2 text-xs font-bold text-[#8a7865] opacity-70">{currentTab.action}</button></article>
          <article className="rounded-[1.6rem] border border-[#ded1bf] bg-[#fffaf3] p-6 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="vb-kicker text-[#9d5b2d]">SALES REPORT PREVIEW</p><h2 className="vb-serif mt-3 text-3xl text-[#2d2219]">A reporting canvas, ready for protected data.</h2></div><span className="rounded-full border border-[#d8c6b1] bg-white px-3 py-1.5 text-xs font-bold text-[#8a7865]">No live metrics</span></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-dashed border-[#d7c5b0] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#9d5b2d]">Gross sales</p><p className="mt-4 text-2xl font-bold text-[#2d2219]">—</p><p className="mt-1 text-xs text-[#8a7865]">Requires verified transactions</p></div><div className="rounded-2xl border border-dashed border-[#d7c5b0] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#9d5b2d]">SURA commission</p><p className="mt-4 text-2xl font-bold text-[#2d2219]">—</p><p className="mt-1 text-xs text-[#8a7865]">Server-calculated allocation</p></div><div className="rounded-2xl border border-dashed border-[#d7c5b0] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#9d5b2d]">Seller settlement</p><p className="mt-4 text-2xl font-bold text-[#2d2219]">—</p><p className="mt-1 text-xs text-[#8a7865]">Delivery reported separately</p></div></div><div className="mt-6 grid h-36 grid-cols-7 items-end gap-2 rounded-2xl border border-dashed border-[#d7c5b0] bg-white p-4" aria-label="Empty sales trend chart">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day} className="flex h-full flex-col justify-end"><div className="h-1 rounded-full bg-[#dec9b2]" /><span className="mt-2 text-center text-[0.62rem] font-semibold text-[#8a7865]">{day}</span></div>)}</div><p className="mt-3 text-xs leading-5 text-[#8a7865]">Trend slots remain intentionally empty until protected, reconciled payment data is connected.</p></article></div></section>
      <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.6rem] border border-dashed border-[#d4bea3] bg-[#fffaf3] p-6"><div><p className="vb-kicker text-[#9d5b2d]">Secure next step</p><h2 className="vb-serif mt-2 text-3xl text-[#2d2219]">Open the protected workspace only after email verification.</h2></div><Link href="/join" className="vb-button vb-focus inline-flex items-center gap-2 rounded-full bg-[#1d1b18] px-5 py-3 text-sm font-bold text-[#fbf7ef]">Go to secure account access <ChevronRight className="h-4 w-4" /></Link></section>
    </main>
  </VibeLayout>;
}
