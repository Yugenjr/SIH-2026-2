import React, { useEffect, useState } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, Users, Clock, CheckCircle2, ShieldAlert, ArrowUpRight, RefreshCw 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../../services/api';

export const CommandCenter: React.FC = () => {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    api.getMotaCommandCenter().then(setData);
  }, []);

  if (!data) return null;

  const { metrics, bottleneck_intelligence, state_distribution } = data;

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">MoTA Command Center & Operational Analytics</h2>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">Executive Dashboard</span>
          </div>
          <p className="text-xs text-slate-500">National operational layer monitoring scheme performance, bottleneck intelligence, and officer workload.</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-emerald-600 font-bold font-mono">
            Cycle Time Reduced: -68%
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-500">Total Applications</span>
          <div className="text-2xl font-black text-slate-800 font-mono">{metrics.total_applications}</div>
          <span className="text-[10px] text-blue-600 font-semibold">+12% vs last cycle</span>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-500">Verified Eligible</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">{metrics.verified_eligible}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">98.2% Accuracy Rate</span>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-500">Active Deficiencies</span>
          <div className="text-2xl font-black text-amber-500 font-mono">{metrics.active_deficiencies}</div>
          <span className="text-[10px] text-amber-600 font-semibold">Pre-submission resolved</span>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-500">Avg Processing Time</span>
          <div className="text-2xl font-black text-slate-800 font-mono">{metrics.avg_processing_time_days} days</div>
          <span className="text-[10px] text-emerald-600 font-semibold">Down from 14.8 days</span>
        </div>

      </div>

      {/* BOTTLENECK INTELLIGENCE PANEL */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-white border border-amber-200 text-amber-500 shrink-0 shadow-sm">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">Bottleneck Intelligence</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 font-mono border border-amber-200">Stage: {bottleneck_intelligence.highest_delay_stage}</span>
            </div>

            <h3 className="text-base font-bold text-slate-800">
              {bottleneck_intelligence.applications_waiting} applications pending in {bottleneck_intelligence.highest_delay_stage} ({bottleneck_intelligence.overdue_applications} overdue)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recommended Administrative Action: <strong className="text-slate-800">{bottleneck_intelligence.recommended_action}</strong>
            </p>
          </div>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs shrink-0 shadow-sm">
          Execute Redistribution
        </button>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* STATE DISTRIBUTION BAR CHART */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              State-wise Application Volume & Approvals
            </h3>
            <span className="text-xs text-slate-500">Top 5 States</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={state_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="state" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Applications" />
                <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WORKLOAD DISTRIBUTION CARD */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Officer Capacity & Workload Balance
            </h3>
            <span className="text-xs text-slate-500">Active Officers: 12</span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 shadow-sm">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Dr. Rajeshwar Prasad (Region A)</span>
                <span className="text-amber-600 font-mono">18 / 20 Capacity</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-11/12 rounded-full" />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 shadow-sm">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-800">Smt. Anita Sharma (Region B)</span>
                <span className="text-emerald-600 font-mono">6 / 20 Capacity</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-1/3 rounded-full" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
