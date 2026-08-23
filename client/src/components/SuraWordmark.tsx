import React from "react";

type SuraWordmarkProps = {
  className?: string;
  title?: string;
  tone?: "ink" | "paper";
};

export function SuraWordmark({ className = "", title, tone = "ink" }: SuraWordmarkProps) {
  const ink = tone === "paper" ? "#fbf7ef" : "#211b16";
  const accent = tone === "paper" ? "#f0bf78" : "#b87035";

  return <svg data-testid="sura-wordmark" viewBox="0 0 190 64" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {title && <title>{title}</title>}
    <defs><linearGradient id="sura-creative-wave" x1="5" y1="56" x2="156" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#d77a48" /><stop offset="0.48" stopColor="#b56a82" /><stop offset="1" stopColor="#526a9c" /></linearGradient></defs>
    <text x="1" y="45" fill={ink} fontFamily="Georgia, 'Times New Roman', serif" fontSize="43" fontWeight="700" letterSpacing="1.6">SURA</text>
    <path d="M4 56C20 49 35 63 53 56C71 49 85 49 102 56C120 63 137 49 157 55" stroke="url(#sura-creative-wave)" strokeWidth="3.2" strokeLinecap="round" />
    <circle cx="168" cy="13" r="8.5" stroke={accent} strokeWidth="2.4" />
    <circle cx="168" cy="13" r="2.4" fill={accent} />
    <path d="M176.7 13H187M181.8 7.9V18.1" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
  </svg>;
}

export function SuraCreativeBadge({ className = "" }: { className?: string }) {
  return <svg data-testid="sura-creative-badge" viewBox="0 0 64 64" aria-hidden="true" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sura-badge-field" x1="8" y1="6" x2="55" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#f0b164" /><stop offset="0.44" stopColor="#c06f82" /><stop offset="1" stopColor="#586c9d" /></linearGradient></defs>
    <circle cx="32" cy="32" r="27" fill="url(#sura-badge-field)" />
    <path d="M15 36C23 27 30 44 39 33C44 27 47 25 50 23" stroke="#fffaf2" strokeWidth="4.2" strokeLinecap="round" />
    <circle cx="19" cy="22" r="3" fill="#fffaf2" fillOpacity="0.9" />
  </svg>;
}
