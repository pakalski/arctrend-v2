'use client';
import { useState, useEffect } from 'react';
import KpiChart from '@/components/KpiChart';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
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

  const refreshAllChains = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      // 1. Arc Testnet
      const arcRes = await fetch('https://testnet.arcscan.app/api/v2/stats');
      const arcStats = await arcRes.json();
      await supabase.from('network_snapshots').upsert({
        date: today,
        network: 'arc_testnet',
        active_wallets: arcStats.active_addresses_24h || 0,
        new_wallets: arcStats.new_addresses_24h || 0,
        tx_count: arcStats.transactions_24h || 0,
        usdc_volume: arcStats.usdc_volume_24h || 0,
        new_contracts: arcStats.new_contracts_24h || 0,
      });

      // 2. Base Sepolia
      const baseRes = await fetch('https://base-sepolia.blockscout.com/api/v2/stats');
      const baseStats = await baseRes.json();
      await supabase.from('network_snapshots').upsert({
        date: today,
        network: 'base_sepolia',
        active_wallets: baseStats.active_addresses_24h || baseStats.total_addresses || 0,
        tx_count: baseStats.transactions_today || 0,
        new_contracts: baseStats.new_contracts_24h || 0,
      });

      // 3. Arbitrum Sepolia
      const arbRes = await fetch('https://arbitrum-sepolia.blockscout.com/api/v2/stats');
      const arbStats = await arbRes.json();
      await supabase.from('network_snapshots').upsert({
        date: today,
        network: 'arbitrum_sepolia',
        active_wallets: arbStats.active_addresses_24h || arbStats.total_addresses || 0,
        tx_count: arbStats.transactions_today || 0,
        new_contracts: arbStats.new_contracts_24h || 0,
      });

      await loadData();
      alert('✅ Real live data pulled from Arc + Base Sepolia + Arbitrum Sepolia!');
    } catch (e) {
      alert('Could not fetch data from all chains. Try again in a moment.');
    }
    setLoading(false);
  };

  const filteredData = data.filter(row => {
    const rowDate = new Date(row.date);
    const now = new Date();
    if (timeRange === '7d') return rowDate >= new Date(now.getTime() - 7*24*60*60*1000);
    if (timeRange === '30d') return rowDate >= new Date(now.getTime() - 30*24*60*60*1000);
    if (timeRange === '90d') return rowDate >= new Date(now.getTime() - 90*24*60*60*1000);
    if (timeRange === '180d') return rowDate >= new Date(now.getTime() - 180*24*60*60*1000);
    if (timeRange === '365d') return rowDate >= new Date(now.getTime() - 365*24*60*60*1000);
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-6xl font-bold tracking-tighter">ArcTrend</h1>
            <p className="text-slate-400 text-2xl mt-1">Arc Testnet • Institutional Adoption Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-6 py-3 text-lg">
              <option value="7d">1 Week</option>
              <option value="30d">1 Month</option>
              <option value="90d">3 Months</option>
              <option value="180d">6 Months</option>
              <option value="365d">1 Year</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={refreshAllChains}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-2xl font-medium"
            >
              {loading ? 'Fetching all chains...' : '🔄 Refresh All Chains'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="flex border-b border-slate-700">
          {['overview', 'institutional', 'competitive', 'treasury'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-6 text-lg font-medium border-b-2 transition-all ${activeTab === tab ? 'border-emerald-400 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              {tab === 'overview' ? 'Overview' : tab === 'institutional' ? 'Institutional Signals' : tab === 'competitive' ? 'Competitive Benchmark' : 'My Treasury Contract'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <KpiChart title="Daily Active Wallets (DAA)" data={filteredData.filter(d => d.network === 'arc_testnet')} dataKey="active_wallets" color="#10b981" />
            <KpiChart title="USDC Volume" data={filteredData.filter(d => d.network === 'arc_testnet')} dataKey="usdc_volume" color="#3b82f6" prefix="$" />
            <KpiChart title="New Wallets" data={filteredData.filter(d => d.network === 'arc_testnet')} dataKey="new_wallets" color="#8b5cf6" />
            <KpiChart title="New Contracts Deployed" data={filteredData.filter(d => d.network === 'arc_testnet')} dataKey="new_contracts" color="#f59e0b" />
          </div>
        )}

        {activeTab === 'competitive' && (
          <div className="mt-10">
            <h2 className="text-3xl font-semibold mb-8">Competitive Benchmark</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4 text-emerald-400">Arc Testnet</h3>
                <KpiChart title="Daily Active Wallets" data={filteredData.filter(d => d.network === 'arc_testnet')} dataKey="active_wallets" color="#10b981" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4 text-blue-400">Base Sepolia</h3>
                <KpiChart title="Daily Active Wallets" data={filteredData.filter(d => d.network === 'base_sepolia')} dataKey="active_wallets" color="#3b82f6" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4 text-purple-400">Arbitrum Sepolia</h3>
                <KpiChart title="Daily Active Wallets" data={filteredData.filter(d => d.network === 'arbitrum_sepolia')} dataKey="active_wallets" color="#a78bfa" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'treasury' && (
          <div className="mt-10 p-10 bg-gradient-to-br from-slate-900 to-emerald-950 border border-emerald-400/30 rounded-3xl">
            <h2 className="text-3xl font-bold mb-8">Your Treasury Batch Router</h2>
            <div className="bg-slate-950 rounded-2xl p-6 mb-8 font-mono text-sm break-all">
              0x5391d64389995d86dDb7a8FfdC4F8d854B61a0FF
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-slate-500 text-sm mt-20 pb-12">
        Built as interview demo for Circle/Arc
      </footer>
    </div>
  );
}
