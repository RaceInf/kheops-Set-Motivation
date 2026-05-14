'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/chantier-ksm7');
      } else {
        setError('Mot de passe incorrect.');
        setPassword('');
      }
    } catch {
      setError('Erreur de connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-12">
          <div className="text-gold text-[10px] font-bold tracking-[0.5em] uppercase mb-3">
            Kheops Set Motivation
          </div>
          <h1 className="font-display text-4xl uppercase tracking-tighter text-white">
            LE CHANTIER
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="border border-white/10 bg-zinc-950 p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Lock className="w-5 h-5 text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
              Accès Restreint
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="admin-password" className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
              Mot de Passe
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full bg-black border border-white/20 p-4 text-sm text-white focus:outline-none focus:border-gold transition-colors"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full py-4 bg-gold text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</>
            ) : (
              'Se Connecter'
            )}
          </button>
        </form>

        <p className="text-center text-[9px] text-white/20 uppercase tracking-widest mt-8">
          Zone à accès restreint • KSM {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
