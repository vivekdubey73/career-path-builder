interface Props {
  participantName: string;
  durationLabel: string;
}

export function MeetingStatusBar({ participantName, durationLabel }: Props) {
  return (
    <div className="flex h-7 items-center justify-between border-b border-border/40 bg-background/60 px-4 text-[11px]">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-semibold text-success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-success" />
          </span>
          Live
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="font-mono text-muted-foreground">{durationLabel}</span>
      </div>
      <div className="text-muted-foreground truncate max-w-[60%] text-right">
        {participantName}
      </div>
    </div>
  );
}
