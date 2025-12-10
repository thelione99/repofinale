import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import AuthGuard from './components/AuthGuard';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30 selection:text-white">
        <Routes>
          {/* Landing e Registrazione (Pubbliche) */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Home />} />
          
          {/* Admin (Protetta) */}
          <Route path="/admin" element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
          
          {/* Scanner (Protetta - ORA CHIEDERÀ LA PASSWORD) */}
          <Route path="/scanner" element={
            <AuthGuard>
              <Scanner />
            </AuthGuard>
          } />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;