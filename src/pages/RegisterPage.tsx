import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const schema = z.object({
  name:            z.string().min(2, 'Full name required'),
  email:           z.string().email('Valid email required'),
  password:        z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type F = z.infer<typeof schema>;

export default function RegisterPage() {
  const { user, register: reg, loading } = useAuthStore();
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (d: F) => {
    const ok = await reg({ name: d.name, email: d.email, password: d.password, role: 'recruiter' });
    if (ok) nav('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <Link to="/login" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-lg">TalentFlow</span>
          </Link>
        </div>

        <div className="card p-7">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-slate-900 mb-1">Create account</h1>
            <p className="text-sm text-slate-500">Join TalentFlow and start hiring smarter</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {([
              { name: 'name',  label: 'Full name',  type: 'text',     placeholder: 'Jane Doe',           ac: 'name'  },
              { name: 'email', label: 'Work email', type: 'email',    placeholder: 'you@company.com',    ac: 'email' },
            ] as const).map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input {...register(f.name)} type={f.type} autoComplete={f.ac}
                  className={`input ${errors[f.name] ? 'input-err' : ''}`} placeholder={f.placeholder} />
                {errors[f.name] && <p className="mt-1.5 text-xs text-rose-600">{errors[f.name]?.message}</p>}
              </div>
            ))}

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'}
                  className={`input pr-11 ${errors.password ? 'input-err' : ''}`} placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input {...register('confirmPassword')} type="password"
                className={`input ${errors.confirmPassword ? 'input-err' : ''}`} placeholder="Repeat password" />
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-rose-600">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : 'Create free account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
