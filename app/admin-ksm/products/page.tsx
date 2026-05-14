'use client';

import { useEffect, useState } from 'react';
import { tools } from '@/lib/data';
import Image from 'next/image';
import { RefreshCw, Package, TrendingUp, ExternalLink } from 'lucide-react';

interface ProductMetrics {
  [productId: string]: { count: number; revenue: number };
}

export default function AdminProductsPage() {
  const [metrics, setMetrics] = useState<ProductMetrics>({});
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setMetrics(data.productStats || {});
    } catch (err) {
      console.error('Failed to fetch product metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  const formatCFA = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  const totalRevenue = Object.values(metrics).reduce((sum, m) => sum + m.revenue, 0);
  const totalSales = Object.values(metrics).reduce((sum, m) => sum + m.count, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Catalogue
          </h1>
          <p className="text-white/40 text-xs mt-1">{tools.length} produits dans l'Arsenal</p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-white/10 bg-zinc-950 p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-gold/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-gold" />
          </div>
          <div>
            <div className="font-display text-2xl">{totalSales}</div>
            <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Ventes totales</div>
          </div>
        </div>
        <div className="border border-white/10 bg-zinc-950 p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-400/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-display text-2xl">{formatCFA(totalRevenue)}</div>
            <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Revenu total produits</div>
          </div>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map(tool => {
          const stats = metrics[tool.id] || { count: 0, revenue: 0 };
          const share = totalSales > 0 ? Math.round((stats.count / totalSales) * 100) : 0;

          return (
            <div 
              key={tool.id} 
              className="border border-white/10 bg-zinc-950 overflow-hidden hover:border-white/20 transition-colors flex flex-col"
            >
              {/* Product Image */}
              {tool.image && (
                <div className="relative w-full aspect-[4/3] bg-zinc-900">
                  <Image
                    src={tool.image}
                    alt={tool.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Info */}
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div>
                  <span className="text-[9px] text-black font-black bg-gold px-2 py-0.5 uppercase tracking-tighter">
                    {tool.category}
                  </span>
                </div>
                <h3 className="font-display text-2xl uppercase tracking-tighter">{tool.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{tool.desc}</p>

                {/* Metrics */}
                <div className="mt-auto pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="font-display text-xl text-gold">{stats.count}</div>
                    <div className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Ventes</div>
                  </div>
                  <div>
                    <div className="font-display text-xl">{tool.price.split(' ')[0]}</div>
                    <div className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Prix</div>
                  </div>
                  <div>
                    <div className="font-display text-xl text-emerald-400">{share}%</div>
                    <div className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Part</div>
                  </div>
                </div>

                {/* Revenue */}
                <div className="bg-white/[0.03] p-3 flex justify-between items-center">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">CA Généré</span>
                  <span className="text-sm font-bold text-white">{formatCFA(stats.revenue)}</span>
                </div>

                {/* Link */}
                <a
                  href={`/arsenal/${tool.id}`}
                  target="_blank"
                  className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-gold transition-colors"
                >
                  Voir la page publique <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
