'use client';
import { useState, useEffect } from 'react';
import KpiChart from '@/components/KpiChart';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const { data: result } = await supabase
      .from('network_snapshots')
      .select('*')
      .order('date', { ascending: true });
    setData(result || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshLiveData = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://testnet.arcscan.app/api/v2/stats');
      const stats = await res.json();

      const today = new Date().toISOString().split('T')[0];

      await supabase.from('network_snapshots').upsert({
        date: today,
        network: 'arc_testnet',
        active_wallets: stats.active_addresses_24h || 0,
        new_wallets: stats.new_addresses_24h || 0,
        tx_count: stats.transactions_24h || 0,
        usdc_volume: stats.usdc_volume_24h || 0,
        new_contracts: stats.new_contracts_24h || 0,
        avg_gas_fee: stats.average_gas_price || 0,
      });

      await loadData();
      alert('✅ Live Arc testnet data refreshed!');
    } catch (e) {
      alert('Could not fetch live data right now. Try again in a few seconds.');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'institutional', label: 'Institutional Signals' },
    { id: 'competitive', label: 'Competitive Benchmark' },
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
          <button
            onClick={refreshLiveData}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
          >
            {loading ? 'Fetching...' : '🔄 Refresh Live Arc Data'}
          </button>
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

        {/* Competitive Benchmark Tab */}
        {activeTab === 'competitive' && (
          <div className="mt-10">
            <h2 className="text-3xl font-semibold mb-8">Competitive Benchmark</h2>
            <p className="text-slate-400 mb-6">Arc Testnet vs Base Sepolia vs Arbitrum Sepolia</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <KpiChart title="Daily Active Wallets" data={data} dataKey="active_wallets" color="#10b981" />
              <KpiChart title="USDC Volume" data={data} dataKey="usdc_volume" color="#3b82f6" prefix="$" />
              <KpiChart title="New Wallets" data={data} dataKey="new_wallets" color="#8b5cf6" />
              <KpiChart title="New Contracts" data={data} dataKey="new_contracts" color="#f59e0b" />
            </div>
            <p className="text-slate-400 text-sm mt-8 text-center">
              Note: Full multi-chain live comparison can be added next — this shows the structure and real Arc data.
            </p>
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
              This contract allows batch payments to multiple addresses in one transaction — a core treasury operations pattern that institutions test on Arc.
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
