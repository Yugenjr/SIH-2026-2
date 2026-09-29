import React from 'react';
import { Fellowship } from '../../types';
import { ShieldCheck, CheckCircle2, Clock, FileText, CreditCard, ArrowRight } from 'lucide-react';

interface FellowshipLifecycleViewProps {
  fellowship: Fellowship | null;
  onBack: () => void;
}

export const FellowshipLifecycleView: React.FC<FellowshipLifecycleViewProps> = ({ fellowship, onBack }) => {
  if (!fellowship) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono uppercase">Post-Award Operations</span>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">{fellowship.scheme_name}</h2>
        </div>
        <button onClick={onBack} className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-200">
          ← Back to Dashboard
        </button>
      </div>

      {/* Fellowship Details */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs text-slate-500">Fellow</span>
            <h3 className="text-xl font-bold text-slate-800">{fellowship.student_name}</h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              Status: {fellowship.status}
            </span>
            <span className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 font-mono">
              Year {fellowship.current_year} / {fellowship.total_years}
            </span>
          </div>
        </div>

        {/* 4-Year Timeline */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">4-Year Fellowship Progress Timeline</h4>

          <div className="grid grid-cols-6 gap-2 text-center pt-2">
            
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
              <span className="text-emerald-700 font-bold">Awarded</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
              <span className="text-emerald-700 font-bold">Year 1</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs space-y-1 shadow-sm">
              <span className="text-blue-700 font-bold">Year 2</span>
              <span className="h-2.5 w-2.5 bg-blue-500 rounded-full mx-auto block animate-ping" />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 opacity-60">
              <span className="text-slate-500">Year 3</span>
              <span className="h-2 w-2 bg-slate-300 rounded-full mx-auto block" />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 opacity-60">
              <span className="text-slate-500">Year 4</span>
              <span className="h-2 w-2 bg-slate-300 rounded-full mx-auto block" />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 opacity-60">
              <span className="text-slate-500">Completion</span>
              <span className="h-2 w-2 bg-slate-300 rounded-full mx-auto block" />
            </div>

          </div>
        </div>

        {/* Financial & Renewal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs shadow-sm">
            <span className="text-slate-500 block font-bold uppercase text-[10px]">DBT / PFMS Stipend Transfer</span>
            <div className="flex items-center justify-between">
              <span className="text-slate-800 font-semibold">Monthly Stipend</span>
              <strong className="text-emerald-600 text-sm font-mono">₹{fellowship.stipend_amount_monthly.toLocaleString('en-IN')} / mo</strong>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">Annual Contingency</span>
              <strong className="text-slate-800 font-mono">₹{fellowship.contingency_annual.toLocaleString('en-IN')} / yr</strong>
            </div>
            <div className="pt-2 text-[11px] text-emerald-600 font-semibold">
              Payment Status: {fellowship.dbt_payment_status}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs shadow-sm">
            <span className="text-slate-500 block font-bold uppercase text-[10px]">Academic Renewal Requirements</span>
            <div>
              <span className="text-slate-800 font-semibold block">Next Progress Report Due</span>
              <span className="text-amber-600 font-mono font-bold text-sm">{fellowship.next_renewal_date}</span>
            </div>
            <button className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all">
              Upload Year-2 Progress Report
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
