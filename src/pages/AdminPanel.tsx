import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, LogOut, Trash2, Power, PowerOff, Users, Video, Plus, Calendar, ExternalLink, UserCog, Clock } from 'lucide-react';
import { getCurrentUser, isCurrentUserAdmin, getAllUsers, updateUserRole, deactivateUser, reactivateUser, deleteUser, signOut } from '@/lib/auth';
import { UserProfile } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMeeting } from '@/components/meeting/MeetingProvider';

type MentorshipSession = {
  id: string;
  title: string;
  description: string | null;
  mentor_name: string;
  scheduled_at: string;
  duration_minutes: number;
  zoom_meeting_url: string;
  zoom_meeting_id: string | null;
  status: string;
  created_at: string;
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { joinMeeting } = useMeeting();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'mentors' | 'availability'>('users');

  // Mentors
  type AdminMentor = {
    id: string; name: string; initials: string; role: string; title: string; company: string;
    bio: string; full_bio: string; photo_url: string; skills: string[]; category: string;
    avatar_color: string; available: boolean; availability_status: string; is_featured: boolean;
    match_score: number;
  };
  const [mentors, setMentors] = useState<AdminMentor[]>([]);
  const blankMentor: AdminMentor = { id: '', name: '', initials: '', role: '', title: '', company: '', bio: '', full_bio: '', photo_url: '', skills: [], category: 'Technical', avatar_color: 'bg-blue-600', available: true, availability_status: 'available_now', is_featured: true, match_score: 80 };
  const [mentorEdit, setMentorEdit] = useState<AdminMentor | null>(null);
  const [mentorSkillsRaw, setMentorSkillsRaw] = useState('');

  // Availability
  type Slot = { id: string; mentor_id: string; start_at: string; duration_minutes: number; is_booked: boolean };
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotForm, setSlotForm] = useState({ mentor_id: '', start_at: '', duration_minutes: 30 });

  // Session scheduling state
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    mentor_name: '',
    scheduled_at: '',
    duration_minutes: 60,
    zoom_meeting_url: '',
  });
  const [sessionLoading, setSessionLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const [user, isAdmin] = await Promise.all([getCurrentUser(), isCurrentUserAdmin()]);
      if (!user || !isAdmin) {
        navigate('/admin-login');
        return;
      }
      setCurrentUser({ ...user, role: 'admin' });
      await loadUsers();
      await loadSessions();
      await loadMentors();
      await loadSlots();
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const loadMentors = async () => {
    const { data } = await supabase.from('mentors').select('*').order('name');
    if (data) setMentors(data as any);
  };
  const loadSlots = async () => {
    const { data } = await (supabase as any).from('mentor_availability').select('*').order('start_at');
    if (data) setSlots(data as Slot[]);
  };
  const saveMentor = async () => {
    if (!mentorEdit) return;
    const skills = mentorSkillsRaw.split(',').map(s => s.trim()).filter(Boolean);
    const initials = mentorEdit.initials || mentorEdit.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const payload = { ...mentorEdit, initials, skills };
    if (mentorEdit.id) {
      const { id, ...rest } = payload;
      await (supabase as any).from('mentors').update(rest).eq('id', id);
    } else {
      const { id, ...rest } = payload;
      await (supabase as any).from('mentors').insert(rest);
    }
    setMentorEdit(null);
    await loadMentors();
    toast({ title: 'Mentor saved' });
  };
  const deleteMentor = async (id: string) => {
    await (supabase as any).from('mentors').delete().eq('id', id);
    await loadMentors();
    toast({ title: 'Mentor removed' });
  };
  const toggleMentorStatus = async (m: AdminMentor) => {
    const next = m.availability_status === 'available_now' ? 'unavailable' : 'available_now';
    await (supabase as any).from('mentors').update({ availability_status: next, available: next === 'available_now' }).eq('id', m.id);
    await loadMentors();
  };
  const addSlot = async () => {
    if (!slotForm.mentor_id || !slotForm.start_at) {
      toast({ title: 'Pick mentor and time', variant: 'destructive' }); return;
    }
    await (supabase as any).from('mentor_availability').insert({
      mentor_id: slotForm.mentor_id,
      start_at: new Date(slotForm.start_at).toISOString(),
      duration_minutes: slotForm.duration_minutes,
    });
    setSlotForm({ mentor_id: '', start_at: '', duration_minutes: 30 });
    await loadSlots();
    toast({ title: 'Slot added' });
  };
  const deleteSlot = async (id: string) => {
    await (supabase as any).from('mentor_availability').delete().eq('id', id);
    await loadSlots();
  };
  

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const loadSessions = async () => {
    const { data } = await supabase
      .from('mentorship_sessions')
      .select('*')
      .order('scheduled_at', { ascending: false });
    if (data) setSessions(data as MentorshipSession[]);
  };

  const handleCreateSession = async () => {
    if (!sessionForm.title || !sessionForm.mentor_name || !sessionForm.scheduled_at || !sessionForm.zoom_meeting_url) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    setSessionLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    // Extract meeting ID from Zoom URL (e.g. https://zoom.us/j/1234567890)
    const zoomIdMatch = sessionForm.zoom_meeting_url.match(/\/j\/(\d+)/);
    const zoomMeetingId = zoomIdMatch ? zoomIdMatch[1] : null;

    const { error: err } = await supabase.from('mentorship_sessions').insert({
      title: sessionForm.title,
      description: sessionForm.description || null,
      mentor_name: sessionForm.mentor_name,
      scheduled_at: new Date(sessionForm.scheduled_at).toISOString(),
      duration_minutes: sessionForm.duration_minutes,
      zoom_meeting_url: sessionForm.zoom_meeting_url,
      zoom_meeting_id: zoomMeetingId,
      created_by: user?.id ?? null,
      status: 'scheduled',
    });
    setSessionLoading(false);
    if (err) {
      toast({ title: 'Failed to create session', description: err.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Session scheduled!', description: 'Users will see this session instantly.' });
    setShowSessionForm(false);
    setSessionForm({ title: '', description: '', mentor_name: '', scheduled_at: '', duration_minutes: 60, zoom_meeting_url: '' });
    await loadSessions();
  };

  const handleUpdateSessionStatus = async (id: string, status: string) => {
    await supabase.from('mentorship_sessions').update({ status }).eq('id', id);
    await loadSessions();
    toast({ title: `Session marked as ${status}` });
  };

  const handleDeleteSession = async (id: string) => {
    await supabase.from('mentorship_sessions').delete().eq('id', id);
    await loadSessions();
    toast({ title: 'Session deleted' });
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    setError(null);
    setSuccess(null);
    const { error: roleError } = await updateUserRole(userId, newRole as 'user' | 'mentor' | 'admin');
    if (roleError) setError(roleError);
    else { setSuccess(`User role updated to ${newRole}`); await loadUsers(); }
    setActionLoading(null);
  };

  const handleDeactivate = async (userId: string) => {
    setActionLoading(userId);
    setError(null);
    const { error: e } = await deactivateUser(userId);
    if (e) setError(e);
    else { setSuccess('User deactivated'); await loadUsers(); }
    setActionLoading(null);
  };

  const handleReactivate = async (userId: string) => {
    setActionLoading(userId);
    setError(null);
    const { error: e } = await reactivateUser(userId);
    if (e) setError(e);
    else { setSuccess('User reactivated'); await loadUsers(); }
    setActionLoading(null);
  };

  const handleDelete = async (userId: string) => {
    setActionLoading(userId);
    setError(null);
    const { error: e } = await deleteUser(userId);
    if (e) setError(e);
    else { setSuccess('User deleted'); await loadUsers(); }
    setActionLoading(null);
    setDeleteConfirm(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-slate-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-sm text-slate-400">Welcome, {currentUser.name || currentUser.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
          >
            <Users className="h-4 w-4 inline mr-2" />User Management
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'sessions' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
          >
            <Video className="h-4 w-4 inline mr-2" />Mentorship Sessions
          </button>
          <button onClick={() => setActiveTab('mentors')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'mentors' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
            <UserCog className="h-4 w-4 inline mr-2" />Mentors
          </button>
          <button onClick={() => setActiveTab('availability')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'availability' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}>
            <Clock className="h-4 w-4 inline mr-2" />Availability
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {activeTab === 'users' && (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">User Management</h2>
              {users.length === 0 ? (
                <div className="text-center py-12"><p className="text-slate-400">No users found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Created</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="py-4 px-4 text-sm text-slate-200">{user.name || '—'}</td>
                          <td className="py-4 px-4 text-sm text-slate-200">{user.email}</td>
                          <td className="py-4 px-4">
                            <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v)} disabled={actionLoading === user.id}>
                              <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-slate-200"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="user" className="text-slate-200">User</SelectItem>
                                <SelectItem value="mentor" className="text-slate-200">Mentor</SelectItem>
                                <SelectItem value="admin" className="text-slate-200">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {user.is_active ? (
                                <Button size="sm" variant="outline" onClick={() => handleDeactivate(user.id)} disabled={actionLoading === user.id} className="border-slate-600 text-slate-300 hover:bg-slate-700 h-8">
                                  {actionLoading === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <PowerOff className="h-3 w-3" />}
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleReactivate(user.id)} disabled={actionLoading === user.id} className="border-slate-600 text-slate-300 hover:bg-slate-700 h-8">
                                  {actionLoading === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(user.id)} disabled={actionLoading === user.id} className="border-red-600/50 text-red-400 hover:bg-red-500/10 h-8">
                                {actionLoading === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Mentorship Sessions</h2>
              <Button onClick={() => setShowSessionForm(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Schedule Session
              </Button>
            </div>

            {/* Session form */}
            {showSessionForm && (
              <Card className="border-slate-700 bg-slate-800/50 backdrop-blur p-6">
                <h3 className="text-lg font-bold text-white mb-4">Schedule New Zoom Session</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Session Title *</label>
                    <input
                      type="text"
                      value={sessionForm.title}
                      onChange={e => setSessionForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. DSA Masterclass"
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Mentor Name *</label>
                    <input
                      type="text"
                      value={sessionForm.mentor_name}
                      onChange={e => setSessionForm(f => ({ ...f, mentor_name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={sessionForm.scheduled_at}
                      onChange={e => setSessionForm(f => ({ ...f, scheduled_at: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Duration (minutes)</label>
                    <select
                      value={sessionForm.duration_minutes}
                      onChange={e => setSessionForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                      <option value={120}>120 min</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Zoom Meeting URL *</label>
                    <input
                      type="url"
                      value={sessionForm.zoom_meeting_url}
                      onChange={e => setSessionForm(f => ({ ...f, zoom_meeting_url: e.target.value }))}
                      placeholder="https://zoom.us/j/1234567890"
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">Create a Zoom meeting and paste the invite link here</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Description</label>
                    <textarea
                      value={sessionForm.description}
                      onChange={e => setSessionForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="What will be covered in this session?"
                      className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500 resize-none h-20"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowSessionForm(false)} className="border-slate-600 text-slate-200">Cancel</Button>
                  <Button onClick={handleCreateSession} disabled={sessionLoading}>
                    {sessionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                    Schedule Session
                  </Button>
                </div>
              </Card>
            )}

            {/* Sessions list */}
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <Card className="border-slate-700 bg-slate-800/50 p-12 text-center">
                  <Calendar className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No sessions scheduled yet</p>
                  <p className="text-sm text-slate-500 mt-1">Click "Schedule Session" to create your first Zoom mentorship session</p>
                </Card>
              ) : (
                sessions.map(s => {
                  const isPast = new Date(s.scheduled_at) < new Date();
                  const isNow = !isPast && new Date(s.scheduled_at) <= new Date(Date.now() + 15 * 60000);
                  const statusColor = s.status === 'live' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    s.status === 'completed' ? 'bg-slate-500/10 text-slate-400 border-slate-500/30' :
                    s.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/30';
                  return (
                    <Card key={s.id} className="border-slate-700 bg-slate-800/50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-white">{s.title}</h3>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColor}`}>{s.status}</span>
                          </div>
                          <p className="text-sm text-slate-400">Mentor: {s.mentor_name}</p>
                          <p className="text-sm text-slate-400">
                            {new Date(s.scheduled_at).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at{' '}
                            {new Date(s.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            {' · '}{s.duration_minutes} min
                          </p>
                          {s.description && <p className="text-xs text-slate-500 mt-1">{s.description}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                          {(s.status === 'scheduled' || isNow) && (
                            <Button
                              size="sm"
                              className="gap-1.5 w-full"
                              onClick={() => joinMeeting({
                                zoomUrl: s.zoom_meeting_url,
                                meetingTitle: s.title,
                                participantName: s.mentor_name,
                              })}
                            >
                              <Video className="h-3.5 w-3.5" /> Join Zoom
                            </Button>
                          )}
                          {s.status === 'scheduled' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateSessionStatus(s.id, 'live')} className="border-green-600/50 text-green-400 hover:bg-green-500/10">
                                Go Live
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateSessionStatus(s.id, 'cancelled')} className="border-red-600/50 text-red-400 hover:bg-red-500/10">
                                Cancel
                              </Button>
                            </>
                          )}
                          {s.status === 'live' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateSessionStatus(s.id, 'completed')} className="border-slate-600 text-slate-300">
                              End Session
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleDeleteSession(s.id)} className="border-red-600/50 text-red-400 hover:bg-red-500/10">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'mentors' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Mentor Profiles</h2>
              <Button onClick={() => { setMentorEdit(blankMentor); setMentorSkillsRaw(''); }} className="gap-2"><Plus className="h-4 w-4" /> Add Mentor</Button>
            </div>
            {mentorEdit && (
              <Card className="border-slate-700 bg-slate-800/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">{mentorEdit.id ? 'Edit' : 'Add'} Mentor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ['Name', 'name'], ['Title', 'title'], ['Role', 'role'], ['Company', 'company'],
                    ['Photo URL', 'photo_url'], ['Avatar color (Tailwind)', 'avatar_color'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-slate-400">{label}</label>
                      <input value={(mentorEdit as any)[key] ?? ''} onChange={e => setMentorEdit({ ...mentorEdit, [key]: e.target.value } as any)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2 text-sm text-white" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Category</label>
                    <select value={mentorEdit.category} onChange={e => setMentorEdit({ ...mentorEdit, category: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2 text-sm text-white">
                      {['Technical','Product','Design','Data','Career'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Status</label>
                    <select value={mentorEdit.availability_status} onChange={e => setMentorEdit({ ...mentorEdit, availability_status: e.target.value, available: e.target.value === 'available_now' })} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2 text-sm text-white">
                      <option value="available_now">Available Now</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Skills (comma-separated)</label>
                    <input value={mentorSkillsRaw || mentorEdit.skills?.join(', ') || ''} onChange={e => setMentorSkillsRaw(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2 text-sm text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Short bio</label>
                    <input value={mentorEdit.bio} onChange={e => setMentorEdit({ ...mentorEdit, bio: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2 text-sm text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Full bio</label>
                    <textarea value={mentorEdit.full_bio} onChange={e => setMentorEdit({ ...mentorEdit, full_bio: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2 text-sm text-white h-24" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-200">
                    <input type="checkbox" checked={mentorEdit.is_featured} onChange={e => setMentorEdit({ ...mentorEdit, is_featured: e.target.checked })} />
                    Show in Mentor Panels
                  </label>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setMentorEdit(null)} className="border-slate-600 text-slate-200">Cancel</Button>
                  <Button onClick={saveMentor}>Save</Button>
                </div>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mentors.map(m => (
                <Card key={m.id} className="border-slate-700 bg-slate-800/50 p-4">
                  <div className="flex items-start gap-3">
                    {m.photo_url && <img src={m.photo_url} alt={m.name} className="h-14 w-14 rounded-full object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.title || m.role} · {m.company}</p>
                      <p className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{m.availability_status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => toggleMentorStatus(m)} className="border-slate-600 text-slate-200 flex-1">
                      {m.availability_status === 'available_now' ? 'Set Unavailable' : 'Set Available'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setMentorEdit(m); setMentorSkillsRaw(m.skills?.join(', ') || ''); }} className="border-slate-600 text-slate-200">Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => deleteMentor(m.id)} className="border-red-600/50 text-red-400"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Mentor Availability Slots</h2>
            <Card className="border-slate-700 bg-slate-800/50 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Mentor</label>
                  <select value={slotForm.mentor_id} onChange={e => setSlotForm(f => ({ ...f, mentor_id: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2 text-sm text-white">
                    <option value="">Select mentor</option>
                    {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Start at</label>
                  <input type="datetime-local" value={slotForm.start_at} onChange={e => setSlotForm(f => ({ ...f, start_at: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Duration</label>
                  <select value={slotForm.duration_minutes} onChange={e => setSlotForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2 text-sm text-white">
                    {[15,30,45,60,90].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <Button onClick={addSlot} className="gap-2"><Plus className="h-4 w-4" /> Add Slot</Button>
              </div>
            </Card>
            <div className="space-y-2">
              {slots.map(s => {
                const mentor = mentors.find(m => m.id === s.mentor_id);
                return (
                  <Card key={s.id} className="border-slate-700 bg-slate-800/50 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-semibold">{mentor?.name || 'Unknown mentor'}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(s.start_at).toLocaleString()} · {s.duration_minutes} min · {s.is_booked ? 'Booked' : 'Open'}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => deleteSlot(s.id)} className="border-red-600/50 text-red-400"><Trash2 className="h-3 w-3" /></Button>
                  </Card>
                );
              })}
              {slots.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No availability slots yet.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
