import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRize } from "@/lib/store";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrandLoader } from "@/components/BrandLoader";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Welcome from "./pages/Welcome.tsx";
import Signup from "./pages/Signup.tsx";
import Signin from "./pages/Signin.tsx";
import Quiz from "./pages/Quiz.tsx";
import Goal from "./pages/Goal.tsx";
import GapReport from "./pages/GapReport.tsx";
import Home from "./pages/Home.tsx";
import Roadmap from "./pages/Roadmap.tsx";
import Skills from "./pages/Skills.tsx";
import Profile from "./pages/Profile.tsx";
import Resume from "./pages/Resume.tsx";
import Admin from "./pages/Admin.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import Insights from "./pages/Insights.tsx";
import Settings from "./pages/Settings.tsx";
import CareerEngine from "./pages/CareerEngine.tsx";

import Mentors from "./pages/Mentors.tsx";
import MentorPanel from "./pages/MentorPanel.tsx";
import MeetingRoom from "./pages/MeetingRoom.tsx";
import MentorDashboard from "./pages/MentorDashboard.tsx";
import Employability from "./pages/Employability.tsx";
import CareerAssessment from "./pages/CareerAssessment.tsx";
import { AIMentorChat } from "./components/AIMentorChat";
import { MeetingProvider } from "./components/meeting/MeetingProvider";

const AuthSync = () => {
  const setProfile = useRize((s) => s.setProfile);
  const finishOnboarding = useRize((s) => s.finishOnboarding);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = (session.user.user_metadata as any)?.name || session.user.email?.split("@")[0] || "";
        setProfile({ name, email: session.user.email || "" });
        finishOnboarding();
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const name = (data.session.user.user_metadata as any)?.name || data.session.user.email?.split("@")[0] || "";
        setProfile({ name, email: data.session.user.email || "" });
        finishOnboarding();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [setProfile, finishOnboarding]);
  return null;
};

const App = () => (
  <TooltipProvider>
      <AuthSync />
      <BrandLoader />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MeetingProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/goal" element={<Goal />} />
            <Route path="/gap" element={<GapReport />} />
            <Route path="/home" element={<Home />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/blog" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/career-engine" element={<CareerEngine />} />

            <Route path="/mentors" element={<Mentors />} />
            <Route path="/mentor-panel" element={<MentorPanel />} />
            <Route path="/meeting/:roomId" element={<MeetingRoom />} />
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
            <Route path="/employability" element={<Employability />} />
            <Route path="/career-assessment" element={<CareerAssessment />} />
            <Route path="/admin-old" element={<Admin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AIMentorChat />
        </MeetingProvider>
      </BrowserRouter>
  </TooltipProvider>
);

export default App;
