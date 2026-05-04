import { ExternalLink, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/rize-logo.png";

interface Props {
  meetingTitle: string;
  zoomUrl: string;
  onLeave: () => void;
}

export function MeetingHeader({ meetingTitle, zoomUrl, onLeave }: Props) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-md px-4">
      <div className="flex items-center gap-3 min-w-0">
        <img src={logo} alt="RIZE" className="h-7 w-7 rounded-md" />
        <span className="font-display font-bold text-sm tracking-tight">RIZE Meet</span>
        <span className="hidden sm:inline-block h-4 w-px bg-border" />
        <span className="hidden sm:inline-block truncate text-xs text-muted-foreground max-w-[260px]">
          {meetingTitle}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex rounded-lg text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <a href={zoomUrl} target="_blank" rel="noopener noreferrer" title="Open in Zoom app">
            <ExternalLink className="h-3.5 w-3.5" /> Open in Zoom
          </a>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onLeave}
          className="rounded-lg gap-1.5"
        >
          <PhoneOff className="h-3.5 w-3.5" /> Leave
        </Button>
      </div>
    </header>
  );
}
