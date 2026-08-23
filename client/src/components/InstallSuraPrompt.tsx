import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export function InstallSuraPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!installEvent || dismissed) return null;

  const install = async () => {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  };

  return <aside className="fixed inset-x-3 bottom-[5.4rem] z-[60] flex items-center gap-3 rounded-2xl border border-[#d8cdbf] bg-[#11130f] p-3 text-[#f7f3eb] shadow-[0_18px_45px_rgba(18,16,11,0.25)] sm:bottom-5 sm:left-5 sm:right-auto sm:w-[22rem]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d7ff4d] text-[#19210d]"><Download className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-black">Take Sura with you.</p><p className="mt-0.5 text-[0.68rem] leading-4 text-[#bdc2a9]">Install the local network for a faster, focused home screen.</p></div><button onClick={install} className="vb-focus rounded-full bg-[#d7ff4d] px-3 py-2 text-[0.68rem] font-black text-[#19210d]">Install</button><button onClick={() => setDismissed(true)} className="vb-focus rounded-lg p-1.5 text-[#aeb1a3] hover:bg-white/10" aria-label="Dismiss install prompt"><X className="h-4 w-4" /></button></aside>;
}
