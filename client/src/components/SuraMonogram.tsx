import React from "react";

type SuraMonogramProps = {
  className?: string;
  title?: string;
  tone?: "ink" | "paper";
};

export function SuraMonogram({ className = "", title, tone = "ink" }: SuraMonogramProps) {
  const paperTone = tone === "paper";
  const field = paperTone ? "#fbf7ef" : "#211b16";
  const ribbon = paperTone ? "#211b16" : "#fbf7ef";
  const outline = paperTone ? "#ddcdb9" : "#3d332a";

  return <svg data-testid="sura-monogram" viewBox="0 0 64 64" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {title && <title>{title}</title>}
    <rect x="1" y="1" width="62" height="62" rx="19" fill={field} stroke={outline} strokeWidth="2" />
    <path d="M43.8 18.1C39.2 14.5 29.5 14.2 24.1 18.8C17.2 24.6 21.5 30.8 32.8 32.7C42.7 34.4 46.5 39 42.6 44.7C38.5 50.8 27.6 51.3 20.2 46.6" stroke={ribbon} strokeWidth="7.1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M45.7 16.9L49.3 20.5" stroke="#d6a063" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M17.8 44.4L21.6 48.1" stroke="#d6a063" strokeWidth="3.2" strokeLinecap="round" />
    <circle cx="49.3" cy="20.5" r="2" fill="#f4d39a" />
  </svg>;
}
