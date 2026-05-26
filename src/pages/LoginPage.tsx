import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Zap, Users, BarChart3, Layers } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
  rememberMe: z.boolean().optional(),
});
type F = z.infer<typeof schema>;

const FEATURES = [
  { icon: Users,    title: 'Smart Pipeline',    desc: 'Kanban board with drag-and-drop hiring stages' },
  { icon: BarChart3,title: 'AI Scoring',        desc: 'Auto-score candidates against job requirements' },
  { icon: Layers,   title: 'Bulk Actions',      desc: 'Shortlist or reject multiple candidates at once' },
];

export default function LoginPage() {
  const { user, login, loading } = useAuthStore();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as any)?.from?.pathname || '/dashboard';
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (d: F) => {
    const ok = await login({ email: d.email, password: d.password });
    if (ok) nav(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex-col justify-between p-10 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-60px] left-[-60px] w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-40px] right-[-40px] w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">TalentFlow</span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h2 className="font-display font-bold text-white text-4xl leading-tight mb-4">
            Hire smarter.<br />Move faster.
          </h2>
          <p className="text-primary-200 text-base leading-relaxed max-w-sm">
            The AI-powered HR platform that helps teams find, evaluate and hire top talent — all in one place.
          </p>
        </div>

        {/* Feature cards */}
        <div className="relative space-y-3">
          {FEATURES.map(f => (
            <div key={f.title} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur rounded-2xl">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-primary-200">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative text-xs text-primary-300">Powered by HireAI · Secure JWT Auth</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-lg">TalentFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl text-slate-900 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to your recruiter account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="label">Email address</label>
              <input {...register('email')} type="email" autoComplete="email"
                className={`input ${errors.email ? 'input-err' : ''}`} placeholder="you@company.com" />
              {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  className={`input pr-11 ${errors.password ? 'input-err' : ''}`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input {...register('rememberMe')} type="checkbox" className="w-4 h-4 rounded accent-primary-600" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : 'Sign in to TalentFlow'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
