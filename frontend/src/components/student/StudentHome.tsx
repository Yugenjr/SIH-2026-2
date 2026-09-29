import React from 'react';
import { UserProfile, Application, Fellowship } from '../../types';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, FileText, ArrowUpRight 
} from 'lucide-react';

interface StudentHomeProps {
  profile: UserProfile;
  applications: Application[];
  fellowship: Fellowship | null;
  onStartApplication: (schemeId: string) => void;
  onFixDeficiency: (appId: string, defId: string) => void;
  onViewFellowship: () => void;
  onOpenDiscovery: () => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  profile,
  applications,
  fellowship,
  onStartApplication,
  onFixDeficiency,
  onViewFellowship,
  onOpenDiscovery
}) => {
  const activeDeficiency = applications
    .flatMap(a => a.deficiencies)
    .find(d => d.status === 'ACTION REQUIRED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Intelligent pre-submission verification & scholarship operations</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenDiscovery}
            className="px-4 py-2 rounded-xl bg-[#0e2a47] hover:bg-[#0b2035] text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all"
          >
            <span>Find schemes for me</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* OVERVIEW STAT CARDS ROW (Exact GKI Board Theme Match) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* CARD 1: ELIGIBLE SCHEMES */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ELIGIBLE</span>
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 block leading-none">2</span>
            <span className="text-[11px] text-slate-400 mt-1 block">ST Scholarships</span>
          </div>
        </div>

        {/* CARD 2: APPLICATIONS */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ACTIVE</span>
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 block leading-none">{applications.length}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Submitted drafts</span>
          </div>
        </div>

        {/* CARD 3: DEFICIENCIES */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">DEFICIENCIES</span>
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-amber-600 block leading-none">{activeDeficiency ? 1 : 0}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Action required</span>
          </div>
        </div>

        {/* CARD 4: PRE-VERIFICATION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">OCR CHECK</span>
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-emerald-600 block leading-none">100%</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Pre-submission</span>
          </div>
        </div>

        {/* CARD 5: FELLOWSHIP YEAR */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FELLOWSHIP</span>
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-slate-900 block leading-none">Yr {fellowship?.current_year || 2}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Of 4 years</span>
          </div>
        </div>

        {/* CARD 6: DBT STIPEND */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">DBT PAYMENT</span>
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-600 block leading-none">₹31,000</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Monthly transfer</span>
          </div>
        </div>

      </div>

      {/* ACTION REQUIRED BANNER (Pre-Submission / Deficiency Fix) */}
      {activeDeficiency && (
        <div className="bg-pink-50/70 border border-pink-200/80 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-pink-100 text-pink-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-700">ACTION REQUIRED</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-100 text-pink-800 font-mono font-bold">Deadline: {activeDeficiency.deadline}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">{activeDeficiency.problem}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{activeDeficiency.required_action}</p>
            </div>
          </div>

          <button
            onClick={() => onFixDeficiency(activeDeficiency.application_id, activeDeficiency.id)}
            className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 flex items-center justify-center space-x-1.5"
          >
            <span>Fix Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* LOWER GRID: APPLICATIONS & FELLOWSHIP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* YOUR APPLICATIONS IN PROGRESS (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#0e2a47]" />
              <span>Applications in Progress ({applications.length})</span>
            </h3>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div 
                key={app.id}
                className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{app.scheme_code} 2026</span>
                    <span className="text-xs text-slate-400 font-mono">#{app.application_number}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'APPROVED' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : (app.status === 'DEFICIENT' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200')
                    }`}>
                      ● {app.current_stage_label}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-mono">{app.submitted_at.split(' ')[0]}</span>
                  <button 
                    onClick={() => onStartApplication(app.scheme_id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold mt-1 inline-flex items-center gap-1"
                  >
                    View Status <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FELLOWSHIP LIFECYCLE (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Fellowship Lifecycle</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              {fellowship?.status || 'ACTIVE'}
            </span>
          </div>

          {fellowship ? (
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-3">
              <div>
                <span className="text-xs text-slate-500 block">{fellowship.scheme_name}</span>
                <span className="text-base font-bold text-slate-900">Year {fellowship.current_year} of {fellowship.total_years}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Year 2 Academic Progress</span>
                  <span className="font-semibold text-slate-700">50%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-1/2 rounded-full" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/60">
                <span className="text-slate-500">Next renewal: <strong className="text-slate-900">{fellowship.next_renewal_date}</strong></span>
                <button
                  onClick={onViewFellowship}
                  className="px-3 py-1.5 rounded-lg bg-[#0e2a47] text-white font-semibold text-xs hover:bg-[#0b2035] transition-all"
                >
                  View Fellowship
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              No active fellowship. Complete application verification to activate.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
