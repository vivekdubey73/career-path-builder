import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingHeader } from "./MeetingHeader";
import { MeetingStatusBar } from "./MeetingStatusBar";

import { useMeetingTimer } from "@/hooks/useMeetingTimer";
import { cn } from "@/lib/utils";

interface MeetingRoomProps {
  zoomUrl: string;
  meetingTitle: string;
  participantName: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Build an embeddable Zoom URL.
 * Zoom blocks `zoom.us/j/...` from iframes via X-Frame-Options, so we route
 * through the Web SDK launcher (`zoom.us/wc/{id}/join`) which is embeddable.
 */
function buildEmbedUrl(raw: string): string {
  try {
    const u = new URL(raw);
    // /j/{meetingId}
    const jMatch = u.pathname.match(/\/j\/(\d+)/);
    const wcMatch = u.pathname.match(/\/wc\/(\d+)/);
    const id = jMatch?.[1] ?? wcMatch?.[1];
    if (id) {
      const pwd = u.searchParams.get("pwd");
      const params = new URLSearchParams();
      if (pwd) params.set("pwd", pwd);
      params.set("uname", "RIZE Member");
      const qs = params.toString();
      return `https://zoom.us/wc/${id}/join${qs ? `?${qs}` : ""}`;
    }
  } catch {
    // fall through
  }
  return raw;
}

export function MeetingRoom({
  zoomUrl,
  meetingTitle,
  participantName,
  open,
  onClose,
}: MeetingRoomProps) {
  const [, setConfirmLeave] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const loadFlag = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const { formatted } = useMeetingTimer(open);

  const embedUrl = buildEmbedUrl(zoomUrl);

  // Detect if the iframe never fires a load event (likely X-Frame-Options block).
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setBlocked(false);
    loadFlag.current = false;
    const t = window.setTimeout(() => {
      if (!loadFlag.current) setBlocked(true);
    }, 7000);
    return () => window.clearTimeout(t);
  }, [open, embedUrl]);

  // Escape key leaves immediately
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (iframeRef.current) iframeRef.current.src = "about:blank";
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleLeave = () => {
    if (iframeRef.current) iframeRef.current.src = "about:blank";
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="RIZE Meeting Room"
    >
      <MeetingHeader
        meetingTitle={meetingTitle}
        zoomUrl={zoomUrl}
        onLeave={handleLeave}
      />
      <MeetingStatusBar participantName={participantName} durationLabel={formatted} />

      <div className="relative flex-1 overflow-hidden bg-background">
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "md:p-6"
          )}
        >
          <div className="relative h-full w-full md:h-[95%] md:w-[96%] rounded-none md:rounded-2xl overflow-hidden border border-border/60 bg-card shadow-elevated">
            {loading && !blocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">Connecting to your RIZE meeting…</p>
                <p className="mt-1 text-xs text-muted-foreground/70">Securely loading the call</p>
              </div>
            )}

            {blocked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="h-14 w-14 rounded-full bg-warning/15 flex items-center justify-center mb-4">
                  <ShieldAlert className="h-7 w-7 text-warning" />
                </div>
                <h3 className="font-display font-bold text-lg">Meeting can't be embedded</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  This Zoom meeting is configured to require the Zoom desktop or browser app.
                  Open it in a new tab to join — you can return here once you're done.
                </p>
                <Button asChild className="mt-5 rounded-xl gap-2">
                  <a href={zoomUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Open in Zoom
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="mt-2 rounded-xl text-muted-foreground"
                  onClick={handleLeave}
                >
                  Back to Mentors
                </Button>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title="RIZE Meeting"
                className="h-full w-full bg-black"
                allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                allowFullScreen
                onLoad={() => {
                  loadFlag.current = true;
                  setLoading(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
