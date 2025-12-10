import React, { useState, useEffect } from 'react';
import GlassPanel from './GlassPanel';
import Button from './Button';
import { Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Controlla se la password è già salvata nella sessione
    const savedAuth = sessionStorage.getItem('russoloco_admin_auth');
    if (savedAuth) setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Salva la password nella sessione del browser
    sessionStorage.setItem('russoloco_admin_auth', password);
    // Ricarica la pagina per applicare le modifiche ai servizi
    window.location.reload();
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative z-50">
      <GlassPanel className="max-w-sm w-full p-8 text-center" borderRed>
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-6">Area Riservata</h2>
        <p className="text-gray-400 text-sm mb-4">Inserisci la password Admin per continuare</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-center focus:outline-none focus:border-red-500/50"
          />
          {error && <p className="text-red-500 text-sm">Password errata</p>}
          <Button type="submit" className="w-full">ACCEDI</Button>
        </form>
      </GlassPanel>
    </div>
  );
};

export default AuthGuard;