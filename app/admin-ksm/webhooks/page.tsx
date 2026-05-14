'use client';

import { useEffect, useState } from 'react';
import { 
  RefreshCw, CheckCircle2, XCircle, Clock, 
  ChevronDown, ChevronUp, Activity 
} from 'lucide-react';

interface WebhookEvent {
  id: string;
  date: string;
  provider: string;
  eventType: string;
  status: string;
  processedAt: string | null;
  errorMessage: string | null;
  payload: any;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  PROCESSED: { label: 'Traité', color: 'text-emerald-400', icon: CheckCircle2 },
  PENDING: { label: 'En attente', color: 'text-amber-400', icon: Clock },
  FAILED: { label: 'Échoué', color: 'text-red-400', icon: XCircle },
};

export default function AdminWebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/webhooks');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWebhooks(); }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const stats = {
    total: events.length,
    processed: events.filter(e => e.status === 'PROCESSED').length,
    failed: events.filter(e => e.status === 'FAILED').length,
    pending: events.filter(e => e.status === 'PENDING').length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Webhooks
          </h1>
          <p className="text-white/40 text-xs mt-1">Journal des événements Tara Money</p>
        </div>
        <button
          onClick={fetchWebhooks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Traités', value: stats.processed, color: 'text-emerald-400' },
          { label: 'En attente', value: stats.pending, color: 'text-amber-400' },
          { label: 'Échoués', value: stats.failed, color: 'text-red-400' },
        ].map((stat, idx) => (
          <div key={idx} className="border border-white/10 bg-zinc-950 p-4 text-center">
            <div className={`font-display text-2xl ${stat.color}`}>{stat.value}</div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Events List */}
      <div className="border border-white/10 bg-zinc-950 overflow-hidden">
        {loading && events.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">Aucun événement webhook enregistré.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {events.map(event => {
              const statusConf = STATUS_MAP[event.status] || STATUS_MAP.PENDING;
              const StatusIcon = statusConf.icon;
              const isExpanded = expandedId === event.id;

              return (
                <div key={event.id} className="hover:bg-white/[0.01] transition-colors">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    className="w-full flex items-center gap-4 p-4 text-left cursor-pointer"
                  >
                    <StatusIcon className={`w-4 h-4 ${statusConf.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-white/80 font-bold">{event.eventType}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/30 mt-1">
                        {formatDate(event.date)}
                        {event.errorMessage && (
                          <span className="text-red-400 ml-3">• {event.errorMessage}</span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/20 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/20 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <pre className="bg-black border border-white/10 p-4 text-[11px] text-white/60 font-mono overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
