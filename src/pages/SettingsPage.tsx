import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Shield, Bell, Palette, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { getAvatarColor, getInitials } from '../utils';
import { toast } from 'sonner';

const profileSchema = z.object({
  name:  z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  role:  z.string(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const SECTIONS = [
  { id: 'profile',  icon: User,    label: 'Profile'        },
  { id: 'security', icon: Shield,  label: 'Security'       },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'appearance', icon: Palette, label: 'Appearance'   },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', role: user?.role || 'recruiter' },
  });

  const onSave = async (data: ProfileForm) => {
    setSaved(false);
    await new Promise(r => setTimeout(r, 700));
    toast.success('Profile updated!');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and workspace preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  activeSection === s.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <s.icon className="w-4 h-4 shrink-0" />
                {s.label}
                <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-opacity ${activeSection === s.id ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'profile' && (
            <div className="card p-6 space-y-6">
              <h3 className="font-semibold text-slate-900">Profile Information</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: getAvatarColor(user?.name || '') }}>
                  {getInitials(user?.name || 'U')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role} · TalentFlow</p>
                  <button className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1">
                    Change avatar
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input {...register('name')} className={`input ${errors.name ? 'input-err' : ''}`} />
                    {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input {...register('email')} type="email" className={`input ${errors.email ? 'input-err' : ''}`} />
                    {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Role</label>
                  <select {...register('role')} className="input">
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button type="submit" className="btn btn-primary gap-2">
                    {saved ? <><Check className="w-4 h-4" />Saved!</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="card p-6 space-y-6">
              <h3 className="font-semibold text-slate-900">Security</h3>
              <div className="p-4 bg-emerald-50 rounded-xl flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">JWT Authentication Active</p>
                  <p className="text-xs text-emerald-700">Secured via Bearer token · auto-validates on load</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" className="input" placeholder="••••••••" />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input" placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" className="input" placeholder="Repeat password" />
                </div>
                <button
                  onClick={() => toast.info('Password change requires backend support')}
                  className="btn btn-primary"
                >Update Password</button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card p-6 space-y-5">
              <h3 className="font-semibold text-slate-900">Notification Preferences</h3>
              {[
                { label: 'New application received',    desc: 'When a candidate applies for a job',       def: true  },
                { label: 'Candidate status updated',    desc: 'When a candidate is moved to a new stage', def: true  },
                { label: 'Weekly pipeline digest',      desc: 'Summary of pipeline activity every week',  def: false },
                { label: 'New job posted',              desc: 'When a new position is created',           def: false },
              ].map(n => {
                const [on, setOn] = useState(n.def);
                return (
                  <div key={n.label} className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{n.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                    </div>
                    <button onClick={() => setOn(v => !v)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0 ${on ? 'bg-primary-600' : 'bg-slate-200'}`}
                      style={{ height: 22, width: 40 }}>
                      <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
                        style={{ width: 18, height: 18, top: 2, left: on ? 20 : 2, position: 'absolute', transition: 'left 0.2s' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="card p-6 space-y-5">
              <h3 className="font-semibold text-slate-900">Appearance</h3>
              <div>
                <label className="label mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', bg: 'bg-white', border: 'border-primary-500' },
                    { id: 'dark',  label: 'Dark',  bg: 'bg-slate-900', border: 'border-slate-400' },
                    { id: 'auto',  label: 'System', bg: 'bg-gradient-to-br from-white to-slate-800', border: 'border-slate-300' },
                  ].map(t => (
                    <button key={t.id} onClick={() => toast.info('Dark mode coming soon!')}
                      className={`p-4 rounded-xl border-2 ${t.id === 'light' ? t.border : 'border-slate-200'} transition-all hover:border-primary-400 flex flex-col items-center gap-2`}>
                      <div className={`w-8 h-8 rounded-lg ${t.bg} border border-slate-200`} />
                      <span className="text-xs font-medium text-slate-700">{t.label}</span>
                      {t.id === 'light' && <Check className="w-3 h-3 text-primary-600" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label mb-3">Accent Color</label>
                <div className="flex gap-2">
                  {['#2563eb','#7c3aed','#0891b2','#16a34a','#d97706','#dc2626'].map(c => (
                    <button key={c} onClick={() => toast.info('Custom theme coming soon!')}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${c === '#2563eb' ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
