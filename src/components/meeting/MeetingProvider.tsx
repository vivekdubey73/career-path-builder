import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { MeetingRoom } from "./MeetingRoom";

interface MeetingPayload {
  zoomUrl: string;
  meetingTitle: string;
  participantName: string;
}

interface Ctx {
  joinMeeting: (p: MeetingPayload) => void;
}

const MeetingContext = createContext<Ctx | null>(null);

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<MeetingPayload | null>(null);
  const navigate = useNavigate();

  const joinMeeting = useCallback((p: MeetingPayload) => setActive(p), []);
  const close = useCallback(() => {
    setActive(null);
    navigate("/mentors");
  }, [navigate]);

  return (
    <MeetingContext.Provider value={{ joinMeeting }}>
      {children}
      {active && (
        <MeetingRoom
          open
          zoomUrl={active.zoomUrl}
          meetingTitle={active.meetingTitle}
          participantName={active.participantName}
          onClose={close}
        />
      )}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const ctx = useContext(MeetingContext);
  if (!ctx) throw new Error("useMeeting must be used within MeetingProvider");
  return ctx;
}
