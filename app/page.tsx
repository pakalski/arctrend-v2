'use client';
import { useState, useEffect } from 'react';
import KpiChart from '@/components/KpiChart';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    supabase
      .from('network_snapshots')
      .select('*')
      .eq('network', 'arc_testnet')
      .order('date', { ascending: true })
      .then(({ data: result }) => setData(result || []));
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'institutional', label: 'Institutional Signals' },
    { id: 'treasury', label: 'My Treasury Contract' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-6xl font-bold tracking-tighter">ArcTrend</h1>
            <p className="text-slate-400 text-2xl mt-1">Arc Testnet • Institutional Adoption Dashboard</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-5 py-2 rounded-2xl text-sm font-medium">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              LIVE ON ARC TESTNET
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="flex border-b border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-6 text-lg font-medium border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-emerald-400 text-white' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <KpiChart title="Daily Active Wallets (DAA)" data={data} dataKey="active_wallets" color="#10b981" />
            <KpiChart title="USDC Volume" data={data} dataKey="usdc_volume" color="#3b82f6" prefix="$" />
            <KpiChart title="New Wallets" data={data} dataKey="new_wallets" color="#8b5cf6" />
            <KpiChart title="New Contracts Deployed" data={data} dataKey="new_contracts" color="#f59e0b" />
          </div>
        )}

        {/* Institutional Signals Tab */}
        {activeTab === 'institutional' && (
          <div className="mt-10 p-8 bg-slate-900 border border-slate-700 rounded-3xl">
            <h2 className="text-3xl font-semibold mb-8">Institutional Signals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <KpiChart title="Large Transactions (> $10k)" data={data} dataKey="large_tx_10k" color="#ec4899" />
              <KpiChart title="CCTP Bridge Volume" data={data} dataKey="cctp_volume" color="#06b67f" prefix="$" />
              <KpiChart title="Batch Payment Rate" data={data} dataKey="batch_tx_rate" color="#a78bfa" />
            </div>
          </div>
        )}

        {/* Treasury Contract Tab */}
        {activeTab === 'treasury' && (
          <div className="mt-10 p-10 bg-gradient-to-br from-slate-900 to-emerald-950 border border-emerald-400/30 rounded-3xl">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl">🏦</span>
              <div>
                <h2 className="text-3xl font-bold">Your Treasury Batch Router</h2>
                <p className="text-emerald-400">Live on Arc Testnet</p>
              </div>
            </div>
            <div className="bg-slate-950 rounded-2xl p-6 font-mono text-sm break-all">
              0x5391d64389995d86dDb7a8FfdC4F8d854B61a0FF
            </div>
            <p className="mt-10 text-slate-300 text-lg">
              This contract is ready for institutional batch payments, treasury operations, and multi-recipient settlements — exactly what large institutions are testing on Arc.
            </p>
          </div>
        )}
      </div>

      <footer className="text-center text-slate-500 text-sm mt-20 pb-12">
        Built as interview demo for Circle/Arc • Contract deployed on Arc Testnet
      </footer>
    </div>
  );
}
