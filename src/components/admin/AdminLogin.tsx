import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useCms } from '@/context/CmsContext';

const CrtScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative crt-overlay bg-black min-h-screen text-stone-100 font-mono overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-tr from-transparent via-white/5 to-transparent mix-blend-overlay"></div>
      {children}
    </div>
  );
};

const AdminLogin = () => {
  const { login } = useCms();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setError('');
    } else {
      setError('ACCESS DENIED: INCORRECT PASS-KEY');
      setPassword('');
    }
  };

  return (
    <CrtScreen>
      <div className="w-full max-w-md px-4 relative z-20">
        <div className="bg-zinc-950 p-6 md:p-8 pixel-border-gold relative flex flex-col gap-6 text-left">
          {/* Header Tab */}
          <div className="absolute -top-6 left-6 bg-black px-4 py-1.5 border-2 border-primary text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary retro">
            SYS_LOGIN.EXE
          </div>

          {/* Icon / Brand */}
          <div className="text-center mt-2 flex flex-col items-center gap-3">
            <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded shadow-[0_0_12px_rgba(245,212,103,0.3)] animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-primary retro tracking-wide text-shadow-glow">
              TK_SYSTEM
            </h1>
            <p className="text-stone-500 text-[10px] uppercase tracking-widest font-mono">
              SECURE MAIN-FRAME LINK // INPUT CREDENTIALS
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-password" className="text-stone-400 text-[10px] tracking-wider retro">
                PASS_KEY
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="INPUT PASS-KEY..."
                  className="w-full bg-zinc-900 border-2 border-stone-800 text-stone-200 px-4 py-2.5 font-mono text-sm tracking-wider focus:outline-none focus:border-primary retro-text"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-mono tracking-widest uppercase">{error}</p>
            )}

            <button type="submit" className="w-full pixel-btn text-center py-2.5 text-xs">
              ESTABLISH LINK
            </button>
          </form>

          <p className="text-center text-[9px] text-stone-600 font-mono tracking-wider">
            DEFAULT PASS: admin123
          </p>
        </div>
      </div>
    </CrtScreen>
  );
};

export default AdminLogin;
