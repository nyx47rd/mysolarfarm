import React, { useState } from 'react';
import { Icon } from './Icons';

interface AuthScreenProps {
  onLoginSuccess: (user: any, saveData: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isRegistering ? 'register' : 'login',
          username,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Başarılı giriş
      onLoginSuccess(data.user, data.saveData);

    } catch (err: any) {
      setError(err.message);
      // Fallback for localhost development where API might not exist
      if (err.message.includes("Unexpected token") || err.message.includes("fetch")) {
          setError("API connection failed. Are you running via 'vercel dev'?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Decorative Header */}
        <div className="h-2 bg-gradient-to-r from-solar-600 to-purple-600"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-inner">
               <Icon name={isRegistering ? 'UserPlus' : 'Lock'} className="text-solar-500" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">SOLAR TYCOON</h1>
            <p className="text-slate-400 text-sm mt-2">
              {isRegistering ? 'Establish new grid access' : 'Identify yourself, operator.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-solar-500 focus:ring-1 focus:ring-solar-500 transition-all placeholder-slate-600"
                  placeholder="Enter callsign..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-solar-500 focus:ring-1 focus:ring-solar-500 transition-all placeholder-slate-600"
                  placeholder="Enter security key..."
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg text-center animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg mt-4 flex items-center justify-center gap-2
                ${loading 
                  ? 'bg-slate-700 text-slate-400 cursor-wait' 
                  : 'bg-solar-600 hover:bg-solar-500 text-white hover:scale-[1.02] active:scale-95 shadow-solar-900/20'
                }
              `}
            >
              {loading ? (
                 <Icon name="RotateCw" className="animate-spin" size={20} />
              ) : (
                 <Icon name={isRegistering ? 'ArrowRight' : 'Check'} size={20} />
              )}
              {loading ? 'Processing...' : (isRegistering ? 'INITIALIZE SYSTEM' : 'ACCESS GRID')}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-800 pt-6">
            <p className="text-slate-500 text-sm">
              {isRegistering ? 'Already have a grid?' : 'New to the system?'}
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="ml-2 text-solar-400 font-bold hover:text-solar-300 underline underline-offset-4 transition-colors"
              >
                {isRegistering ? 'Login here' : 'Register Access'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};