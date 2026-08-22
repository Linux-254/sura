import { Bell, CheckCheck, Info, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAestheticTheme } from "@/contexts/AestheticThemeContext";
import { trpc } from "@/lib/trpc";

export function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const { palette } = useAestheticTheme();
  const [open, setOpen] = useState(false);
  const surfaced = useRef(new Set<number>());
  const feed = trpc.notifications.feed.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 60000 });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => feed.refetch() });
  useEffect(() => {
    if (!feed.data) return;
    feed.data.notifications.filter((notice) => !notice.isRead).forEach((notice) => {
      if (surfaced.current.has(notice.id)) return;
      surfaced.current.add(notice.id);
      toast(notice.title, { description: notice.body, action: notice.linkUrl ? { label: "Open", onClick: () => { window.location.assign(notice.linkUrl!); } } : undefined });
    });
    feed.data.announcements.forEach((announcement) => {
      if (surfaced.current.has(-announcement.id)) return;
      surfaced.current.add(-announcement.id);
      toast(announcement.title, { description: announcement.body, action: announcement.linkUrl ? { label: "View", onClick: () => { window.location.assign(announcement.linkUrl!); } } : undefined });
    });
  }, [feed.data]);
  if (!isAuthenticated) return null;
  const notifications = feed.data?.notifications ?? [];
  const announcements = feed.data?.announcements ?? [];
  const unreadCount = notifications.filter((notice) => !notice.isRead).length + announcements.length;
  return <div className="relative"><button onClick={() => setOpen(!open)} style={{ borderColor: palette.border, backgroundColor: palette.paper, color: palette.ink }} className="vb-focus relative grid h-9 w-9 place-items-center rounded-full border" aria-label="Open notifications"><Bell className="h-4 w-4" />{unreadCount > 0 && <span style={{ backgroundColor: palette.accent, color: palette.paper }} className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.56rem] font-bold">{Math.min(unreadCount, 9)}</span>}</button>{open && <div style={{ borderColor: palette.border, backgroundColor: palette.paper }} className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[20rem] overflow-hidden rounded-2xl border shadow-[0_18px_45px_rgba(48,33,16,0.18)]"><div className="flex items-center justify-between border-b border-black/5 px-4 py-3"><p className="text-sm font-bold">Web app updates</p><button onClick={() => setOpen(false)} className="vb-focus"><X className="h-4 w-4" /></button></div><div className="max-h-80 overflow-auto p-2">{announcements.map((notice) => <NotificationRow key={`a-${notice.id}`} title={notice.title} body={notice.body} accent={palette.accent} />)}{notifications.map((notice) => <NotificationRow key={notice.id} title={notice.title} body={notice.body} accent={palette.accent} unread={!notice.isRead} onDismiss={() => markRead.mutate({ notificationId: notice.id, dismissed: true })} onRead={() => markRead.mutate({ notificationId: notice.id, dismissed: false })} />)}{notifications.length + announcements.length === 0 && <div className="p-7 text-center"><Info className="mx-auto h-5 w-5" style={{ color: palette.accent }} /><p className="mt-3 text-sm font-semibold">Nothing needs you right now.</p><p className="mt-1 text-xs leading-5 text-[#7a6b59]">Membership, offers, company progress, and platform announcements will appear here.</p></div>}</div></div>}</div>;
}

function NotificationRow({ title, body, accent, unread, onDismiss, onRead }: { title: string; body: string; accent: string; unread?: boolean; onDismiss?: () => void; onRead?: () => void }) {
  return <div className={`rounded-xl p-3 ${unread ? "bg-black/[0.035]" : ""}`}><div className="flex gap-3"><i className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} /><div className="min-w-0 flex-1"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[#766756]">{body}</p>{(onRead || onDismiss) && <div className="mt-2 flex gap-3 text-xs font-bold"><button onClick={onRead} className="vb-focus inline-flex items-center gap-1 text-[#806040]"><CheckCheck className="h-3.5 w-3.5" />Read</button><button onClick={onDismiss} className="vb-focus text-[#806040]">Dismiss</button></div>}</div></div></div>;
}
