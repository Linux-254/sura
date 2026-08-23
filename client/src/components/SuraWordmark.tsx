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
    <text x="1" y="45" fill={ink} fontFamily="Georgia, 'Times New Roman', serif" fontSize="43" fontWeight="700" letterSpacing="1.6">SURA</text>
    <circle cx="168" cy="13" r="8.5" stroke={accent} strokeWidth="2.4" />
    <circle cx="168" cy="13" r="2.4" fill={accent} />
    <path d="M176.7 13H187M181.8 7.9V18.1" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
  </svg>;
}
