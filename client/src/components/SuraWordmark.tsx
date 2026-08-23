import React from "react";

type SuraWordmarkProps = {
  className?: string;
  title?: string;
  tone?: "ink" | "paper";
};

export function SuraWordmark({ className = "", title, tone = "ink" }: SuraWordmarkProps) {
  const ink = tone === "paper" ? "#fbf7ef" : "#211b16";
  const badgeInk = tone === "paper" ? "#f7d09b" : "#9a5b33";

  return <svg data-testid="sura-wordmark" data-sura-story="place-identity-possibility" data-sura-waves="3" viewBox="0 0 260 98" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {title && <title>{title}</title>}
    <text x="3" y="55" fill={ink} fontFamily="Georgia, 'Times New Roman', serif" fontSize="62" fontWeight="700" letterSpacing="0.6">SURA</text>
    <g data-sura-story-badge="wayfinder" stroke={badgeInk} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="214" cy="15" r="8" strokeWidth="2.8" />
      <path d="M214 25V44M205 35H223" strokeWidth="2.6" />
      <path d="M214 31C218 31 221 33.8 221 38C221 41.4 218.3 44 214 44" strokeWidth="2.2" />
    </g>
    <g fill="none" strokeLinecap="round">
      <path d="M5 72C26 61 46 82 69 72C88 64 105 62 124 70" stroke="#d6814a" strokeWidth="3.7" />
      <path d="M72 79C93 69 112 87 136 76C152 68 170 68 186 75" stroke="#b36782" strokeWidth="3.7" />
      <path d="M139 76C160 65 181 83 204 73C220 66 235 68 250 75" stroke="#5d6da0" strokeWidth="3.7" />
    </g>
  </svg>;
}

export function SuraCreativeBadge({ className = "" }: { className?: string }) {
  return <svg data-testid="sura-creative-badge" data-sura-story-badge="wayfinder" viewBox="0 0 64 64" aria-hidden="true" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="sura-badge-field" x1="8" y1="6" x2="55" y2="58" gradientUnits="userSpaceOnUse"><stop stopColor="#f0b164" /><stop offset="0.44" stopColor="#c06f82" /><stop offset="1" stopColor="#586c9d" /></linearGradient></defs>
    <circle cx="32" cy="32" r="27" fill="url(#sura-badge-field)" />
    <circle cx="32" cy="18" r="4.8" stroke="#fffaf2" strokeWidth="3.1" />
    <path d="M32 23V38M24 31H40M32 30C36 30 38.5 32.8 38.5 36.6C38.5 39.3 36 41.5 32 41.5" stroke="#fffaf2" strokeWidth="3" strokeLinecap="round" />
    <path d="M15 47C22 40 29 52 36 45C42 39 47 41 51 43" stroke="#fffaf2" strokeWidth="3.2" strokeLinecap="round" />
  </svg>;
}
