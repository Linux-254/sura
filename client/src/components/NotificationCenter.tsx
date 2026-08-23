import { Activity, Bell, CheckCheck, Info, Radio, X } from "lucide-react";
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { trpc } from "@/lib/trpc";

export function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const { palette } = useAestheticTheme();
  const [open, setOpen] = useState(false);
  const surfaced = useRef(new Set<number>());
  const feed = trpc.notifications.feed.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => feed.refetch() });

  useEffect(() => {
    if (!feed.data) return;
    feed.data.notifications.filter((notice) => !notice.isRead).forEach((notice) => {
      if (surfaced.current.has(notice.id)) return;
      surfaced.current.add(notice.id);
      toast(notice.title, { description: notice.body, action: notice.linkUrl ? { label: "Open", onClick: () => { window.location.assign(notice.linkUrl!); } } : undefined });
    });
    feed.data.announcements.forEach((announcement) => {
      const announcementKey = -announcement.id;
      if (surfaced.current.has(announcementKey)) return;
      surfaced.current.add(announcementKey);
      toast(announcement.title, { description: announcement.body, action: announcement.linkUrl ? { label: "View", onClick: () => { window.location.assign(announcement.linkUrl!); } } : undefined });
    });
  }, [feed.data]);

  if (!isAuthenticated) return null;
  const notifications = feed.data?.notifications ?? [];
  const announcements = feed.data?.announcements ?? [];
  const unreadCount = notifications.filter((notice) => !notice.isRead).length;
  const activityCount = unreadCount + announcements.length;

  return <div className="relative flex items-center gap-2">
    <div className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.63rem] font-bold text-[#87917b] xl:flex" title="Activity refreshes automatically">
      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d7ff4d] opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#8eb436]" /></span>
      Live activity
    </div>
    <button onClick={() => setOpen(!open)} style={{ borderColor: palette.border, backgroundColor: palette.paper, color: palette.ink }} className="vb-focus relative grid h-9 w-9 place-items-center rounded-full border" aria-label={`Open notifications${activityCount ? `, ${activityCount} updates` : ""}`} aria-expanded={open}>
      <Bell className="h-4 w-4" />
      {activityCount > 0 && <span style={{ backgroundColor: palette.accent, color: palette.paper }} className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.56rem] font-black">{Math.min(activityCount, 9)}</span>}
    </button>
    {open && <div style={{ borderColor: palette.border, backgroundColor: palette.paper }} className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border shadow-[0_18px_45px_rgba(48,33,16,0.18)]">
      <div className="flex items-start justify-between border-b border-black/5 px-4 py-3"><div><p className="flex items-center gap-2 text-sm font-black"><Activity className="h-4 w-4" style={{ color: palette.accent }} />Activity center</p><p className="mt-1 text-[0.68rem] text-[#7d6e5f]">Updates refresh automatically.</p></div><button onClick={() => setOpen(false)} className="vb-focus rounded-lg p-1"><X className="h-4 w-4" /></button></div>
      <div className="grid grid-cols-2 gap-2 border-b border-black/5 p-3"><ActivityStat label="Unread" value={unreadCount} icon={<Bell className="h-3.5 w-3.5" />} accent={palette.accent} /><ActivityStat label="Platform" value={announcements.length} icon={<Radio className="h-3.5 w-3.5" />} accent={palette.accent} /></div>
      <div className="max-h-80 overflow-auto p-2">{announcements.map((notice) => <NotificationRow key={`a-${notice.id}`} title={notice.title} body={notice.body} accent={palette.accent} />)}{notifications.map((notice) => <NotificationRow key={notice.id} title={notice.title} body={notice.body} accent={palette.accent} unread={!notice.isRead} onDismiss={() => markRead.mutate({ notificationId: notice.id, dismissed: true })} onRead={() => markRead.mutate({ notificationId: notice.id, dismissed: false })} />)}{notifications.length + announcements.length === 0 && <div className="p-7 text-center"><Info className="mx-auto h-5 w-5" style={{ color: palette.accent }} /><p className="mt-3 text-sm font-semibold">Nothing needs you right now.</p><p className="mt-1 text-xs leading-5 text-[#7a6b59]">Membership, offers, company progress, and platform announcements will appear here.</p></div>}</div>
    </div>}
  </div>;
}

function ActivityStat({ label, value, icon, accent }: { label: string; value: number; icon: ReactNode; accent: string }) {
  return <div className="rounded-xl bg-black/[0.035] px-3 py-2"><div className="flex items-center justify-between text-[#817262]"><span className="text-[0.62rem] font-bold uppercase tracking-[0.08em]">{label}</span><span style={{ color: accent }}>{icon}</span></div><p className="mt-1 text-lg font-black">{value}</p></div>;
}

function NotificationRow({ title, body, accent, unread, onDismiss, onRead }: { title: string; body: string; accent: string; unread?: boolean; onDismiss?: () => void; onRead?: () => void }) {
  return <div className={`rounded-xl p-3 ${unread ? "bg-black/[0.035]" : ""}`}><div className="flex gap-3"><i className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} /><div className="min-w-0 flex-1"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[#766756]">{body}</p>{(onRead || onDismiss) && <div className="mt-2 flex gap-3 text-xs font-bold"><button onClick={onRead} className="vb-focus inline-flex items-center gap-1 text-[#806040]"><CheckCheck className="h-3.5 w-3.5" />Read</button><button onClick={onDismiss} className="vb-focus text-[#806040]">Dismiss</button></div>}</div></div></div>;
}
