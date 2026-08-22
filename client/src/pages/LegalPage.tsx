import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { Link, useRoute } from "wouter";
import { VibeLayout } from "@/components/VibeLayout";

const legalCopy = {
  terms: {
    eyebrow: "SURA LEGAL / TERMS", title: "Terms that keep the space clear.",
    intro: "These draft platform terms explain how SURA accounts, company spaces, directory information, and payment records are handled. They should be reviewed by qualified Kenyan counsel before public launch.",
    sections: [["Using SURA", "Use SURA lawfully and provide accurate account and company information. Directory recommendations and indicative pricing are not binding offers."], ["Company spaces", "Company owners are responsible for the information, social links, and public materials they publish. Verification status is not an endorsement or guarantee."], ["Payments", "SURA records payment order references and states. We do not collect or store card numbers, mobile-money PINs, or other sensitive payment credentials in the application."], ["Changes", "We may update these terms to reflect new functionality or legal requirements. Material changes will be surfaced before continued use where required."]],
  },
  privacy: {
    eyebrow: "SURA LEGAL / PRIVACY", title: "Privacy with a point of view.",
    intro: "This draft privacy notice describes the personal data SURA needs to operate accounts and local planning features. It should be reviewed by qualified Kenyan counsel before public launch.",
    sections: [["Account data", "We use secure sign-in identity data, profile details, and your saved planning activity to provide the SURA experience."], ["Location choice", "Location access is optional. If you permit it, SURA uses a coarse city match for local recommendations and does not store raw device coordinates."], ["Public profiles", "Only social links and profile fields you mark as public are intended for public display. Keep links current and do not post sensitive personal information."], ["Security", "Access-controlled procedures protect private dashboard data. Payment credentials are handled only by a selected payment gateway, never by SURA’s application forms."]],
  },
} as const;

export default function LegalPage() {
  const [isPrivacy] = useRoute("/privacy");
  const page = isPrivacy ? legalCopy.privacy : legalCopy.terms;
  return <VibeLayout><main className="container max-w-4xl pb-20 pt-10 sm:pt-16"><Link href="/" className="vb-focus inline-flex items-center gap-2 text-sm font-bold text-[#795634]"><ArrowLeft className="h-4 w-4" />Back to SURA</Link><div className="mt-10 rounded-[2rem] border border-[#ded1bf] bg-[#fbf8f2] p-7 shadow-[0_18px_44px_rgba(60,42,22,0.06)] sm:p-12"><div className="flex items-start justify-between gap-4"><div><p className="vb-kicker text-[#9d5b2d]">{page.eyebrow}</p><h1 className="vb-serif mt-4 max-w-2xl text-5xl leading-[0.94] text-[#261f19] sm:text-6xl">{page.title}</h1></div><LockKeyhole className="h-6 w-6 text-[#a96b35]" /></div><p className="mt-7 max-w-2xl text-base leading-7 text-[#706150]">{page.intro}</p><div className="mt-10 divide-y divide-[#e3d8cb] border-y border-[#e3d8cb]">{page.sections.map(([heading, copy]) => <section key={heading} className="py-6"><div className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#aa6a34]" /><div><h2 className="text-base font-bold text-[#392d22]">{heading}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#756655]">{copy}</p></div></div></section>)}</div><p className="mt-8 text-xs leading-5 text-[#8d7b67]">Draft version: 2026-08-22 · This is product copy, not legal advice.</p></div></main></VibeLayout>;
}
