'use client';
import { useState, useEffect } from 'react';
import KpiChart from '@/components/KpiChart';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    supabase
      .from('network_snapshots')
      .select('*')
      .eq('network', 'arc_testnet')
      .order('date', { ascending: true })
      .then(({ data: result }) => setData(result || []));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">ArcTrend</h1>
            <p className="text-slate-400 text-xl">Arc Testnet Adoption + Institutional Analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-6 py-3 text-lg"
            >
              <option value="7d">1 Week</option>
              <option value="30d">1 Month</option>
              <option value="90d">3 Months</option>
              <option value="180d">6 Months</option>
              <option value="365d">1 Year</option>
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <KpiChart title="Daily Active Wallets (DAA)" data={data} dataKey="active_wallets" color="#10b981" />
          <KpiChart title="USDC Volume" data={data} dataKey="usdc_volume" color="#3b82f6" prefix="$" />
          <KpiChart title="New Wallets" data={data} dataKey="new_wallets" color="#8b5cf6" />
          <KpiChart title="New Contracts" data={data} dataKey="new_contracts" color="#f59e0b" />
        </div>

        <div className="mt-16 p-8 bg-slate-900 border border-slate-700 rounded-3xl">
          <h2 className="text-2xl font-semibold mb-6">Your Deployed Treasury Contract</h2>
          <p className="text-slate-400 mb-4">Contract Address:</p>
          <code className="bg-slate-950 p-4 rounded-2xl block text-emerald-400 font-mono text-sm break-all">
            0x5391d64389995d86dDb7a8FfdC4F8d854B61a0FF
          </code>
          <p className="text-slate-400 mt-8 text-sm">This section will show live metrics from your treasury router once data is populated.</p>
        </div>

        <p className="text-center text-slate-500 mt-16 text-sm">
          Dashboard deployed successfully • Contract live on Arc Testnet
        </p>
      </div>
    </div>
  );
}
