import React, { useEffect, useState } from 'react';
import { getGuests, approveRequest, rejectRequest, resetData } from '../services/storage';
import { Guest, RequestStatus } from '../types';
import GlassPanel from '../components/GlassPanel';
import Button from '../components/Button';
import QRCode from 'react-qr-code';
import { 
  Check, X, Search, RefreshCw, Trash2, Download, 
  Users, UserCheck, Clock, AlertCircle, Activity, Filter
} from 'lucide-react';

// --- SOTTO-COMPONENTI ---

const StatCard = ({ icon: Icon, label, value, color, subtext }: any) => (
  <GlassPanel className="p-5 flex items-center justify-between relative overflow-hidden group">
    <div className="relative z-10">
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      {subtext && <p className={`text-xs mt-1 ${color}`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${color} group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={24} />
    </div>
    {/* Glow effect background */}
    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${color.replace('text-', 'bg-')}`} />
  </GlassPanel>
);

const GuestCard = ({ guest, onApprove, onReject }: { guest: Guest, onApprove: any, onReject: any }) => {
  const isApproved = guest.status === RequestStatus.APPROVED;
  const isPending = guest.status === RequestStatus.PENDING;
  const isRejected = guest.status === RequestStatus.REJECTED;

  return (
    <GlassPanel 
      className={`p-5 flex flex-col gap-4 transition-all duration-300 hover:border-white/20 ${guest.isUsed ? 'opacity-50 grayscale' : ''}`}
      intensity="low"
    >
      <div className="flex justify-between items-start">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h3 className="font-bold text-lg text-white truncate">{guest.firstName} {guest.lastName}</h3>
             {guest.isUsed && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500 text-black">ENTRATO</span>}
           </div>
           <p className="text-sm text-gray-400">@{guest.instagram}</p>
           <p className="text-xs text-gray-500 mt-0.5">{guest.email}</p>
        </div>
        
        {/* Status Icon */}
        <div className={`p-2 rounded-full border ${
           isApproved ? 'bg-green-500/10 border-green-500/20 text-green-500' :
           isRejected ? 'bg-red-500/10 border-red-500/20 text-red-500' :
           'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
        }`}>
           {isApproved ? <UserCheck size={16} /> : isRejected ? <X size={16} /> : <Clock size={16} />}
        </div>
      </div>

      {/* QR Code Area (Solo se approvato) */}
      {isApproved && (
        <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between border border-white/5">
           <div className="text-xs text-gray-400">
              <p>ID: ...{guest.id.slice(-6)}</p>
              <p className="mt-1">{guest.isUsed ? 'Già scansionato' : 'Pronto per scansione'}</p>
           </div>
           <div className="bg-white p-1 rounded">
             <QRCode value={guest.qrCode || ''} size={40} />
           </div>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
          <button 
            onClick={() => onReject(guest.id)}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-sm font-medium transition-colors border border-white/5"
          >
            <X size={16} /> Rifiuta
          </button>
          <button 
            onClick={() => onApprove(guest.id)}
            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-green-500/20 text-white hover:text-green-400 text-sm font-medium transition-colors border border-white/10"
          >
            <Check size={16} /> Approva
          </button>
        </div>
      )}
    </GlassPanel>
  );
};


// --- DASHBOARD PRINCIPALE ---

const Dashboard: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState<'ALL' | RequestStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getGuests();
        setGuests(data); 
      } catch (error) {
        console.error("Errore", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey(p => p + 1);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Confermi approvazione e invio email?")) return;
    setGuests(prev => prev.map(g => g.id === id ? { ...g, status: RequestStatus.APPROVED } : g)); // UI ottimistica
    try { await approveRequest(id); handleRefresh(); } catch (e) { alert("Errore"); handleRefresh(); }
  };

  const handleReject = async (id: string) => {
    if(!window.confirm("Vuoi rifiutare questa richiesta?")) return;
    setGuests(prev => prev.map(g => g.id === id ? { ...g, status: RequestStatus.REJECTED } : g));
    await rejectRequest(id);
  };
  
  const handleReset = async () => {
      if(window.confirm('CANCELLARE TUTTO IL DATABASE? Azione irreversibile.')) {
          await resetData();
          handleRefresh();
      }
  }

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(guests, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `russoloco_export_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // Logica di Filtraggio Avanzata
  const filteredGuests = guests.filter(g => {
    const matchesFilter = filter === 'ALL' ? true : g.status === filter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      g.firstName.toLowerCase().includes(searchLower) || 
      g.lastName.toLowerCase().includes(searchLower) ||
      g.email.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: guests.length,
    approved: guests.filter(g => g.status === RequestStatus.APPROVED).length,
    pending: guests.filter(g => g.status === RequestStatus.PENDING).length,
    used: guests.filter(g => g.isUsed).length,
  };

  return (
    <div className="min-h-screen w-full bg-black p-4 md:p-8 pt-6 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            RUSSOLOCO <span className="text-red-600">ADMIN</span>
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gestione accessi e lista invitati in tempo reale.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="secondary" className="!p-3"><RefreshCw size={18} /></Button>
            <Button onClick={exportData} variant="secondary" className="!p-3"><Download size={18} /></Button>
            <Button onClick={handleReset} variant="danger" className="!p-3 border-red-900/50 bg-red-900/20 text-red-500"><Trash2 size={18} /></Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Totale Richieste" value={stats.total} color="text-blue-400" />
        <StatCard icon={Clock} label="In Attesa" value={stats.pending} color="text-yellow-400" subtext="Da revisionare" />
        <StatCard icon={UserCheck} label="Approvati" value={stats.approved} color="text-green-400" />
        <StatCard icon={Activity} label="Ingressi Reali" value={stats.used} color="text-red-500" subtext={`${Math.round((stats.used / (stats.approved || 1)) * 100)}% degli approvati`} />
      </div>

      {/* Toolbar (Search & Filter) */}
      <div className="sticky top-4 z-40 mb-6">
        <GlassPanel className="p-2 flex flex-col md:flex-row gap-2" intensity="high">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Cerca per nome, cognome o email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 overflow-x-auto">
            {[
              { id: 'ALL', label: 'Tutti' },
              { id: RequestStatus.PENDING, label: 'Attesa' },
              { id: RequestStatus.APPROVED, label: 'Approvati' },
              { id: RequestStatus.REJECTED, label: 'Rifiutati' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === f.id 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Guest Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <RefreshCw className="animate-spin mb-4 text-red-500" size={32} />
          <p>Caricamento dati...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredGuests.map(guest => (
              <GuestCard 
                key={guest.id} 
                guest={guest} 
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
            ))}
          </div>

          {filteredGuests.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <Filter className="mx-auto mb-4 opacity-50" size={48} />
              <p>Nessun ospite trovato con questi filtri.</p>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Dashboard;