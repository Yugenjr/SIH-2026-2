import React, { useState } from 'react';
import { SchemeConfig } from '../../types';
import { Settings, Play, CheckCircle2, ShieldCheck, Sparkles, Sliders, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface SchemeBuilderProps {
  schemes: SchemeConfig[];
}

export const SchemeBuilder: React.FC<SchemeBuilderProps> = ({ schemes }) => {
  const [selectedScheme, setSelectedScheme] = useState<SchemeConfig>(schemes[0]);
  const [incomeLimit, setIncomeLimit] = useState<number>(selectedScheme.max_income_limit);
  const [scoreLimit, setScoreLimit] = useState<number>(selectedScheme.min_academic_score);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const handleRunSimulation = async () => {
    setSimulating(true);
    const result = await api.simulateImpact(200000.0, incomeLimit);
    setSimulating(false);
    setSimulationResult(result);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Scheme Builder & Rule Versioning</h2>
            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-mono">Scheme-as-Code Engine</span>
          </div>
          <p className="text-xs text-slate-500">Configure scheme eligibility rules, version policies, and run pre-publication impact simulations.</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-sm">
          <span className="text-slate-500">Current Version:</span>
          <strong className="text-emerald-600 font-mono">{selectedScheme.version}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: SCHEME FORM CONFIGURATOR (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              Configure Scheme Rules & Thresholds
            </h3>
            <span className="text-xs text-slate-500">ID: {selectedScheme.id}</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-500 block mb-1">Scheme Name</label>
              <input
                type="text"
                value={selectedScheme.name}
                readOnly
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 block mb-1">Target Category</label>
                <input
                  type="text"
                  value="ST (Scheduled Tribe)"
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-emerald-600 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Maximum Age Limit</label>
                <input
                  type="text"
                  value="35 Years"
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                />
              </div>
            </div>

            {/* DYNAMIC THRESHOLD SLIDERS FOR SIMULATION */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  Annual Income Limit Threshold
                </span>
                <span className="text-sm font-bold text-amber-600 font-mono">₹{incomeLimit.toLocaleString('en-IN')}</span>
              </div>

              <input
                type="range"
                min={150000}
                max={400000}
                step={10000}
                value={incomeLimit}
                onChange={(e) => setIncomeLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>₹1,50,000</span>
                <span>₹2,50,000 (Current)</span>
                <span>₹4,00,000</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Minimum Academic Score (%)</span>
                <span className="text-sm font-bold text-blue-600 font-mono">{scoreLimit}%</span>
              </div>

              <input
                type="range"
                min={50}
                max={85}
                step={5}
                value={scoreLimit}
                onChange={(e) => setScoreLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Impact Simulation</span>
            </button>
          </div>

        </div>

        {/* RIGHT: IMPACT SIMULATOR RESULTS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Pre-Publication Impact Simulator
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-500">Policy Engine</span>
            </div>

            {simulating ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <div className="inline-block h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p>Simulating rule changes against 4,281 historical applications...</p>
              </div>
            ) : simulationResult ? (
              <div className="space-y-4">
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Applications Evaluated</span>
                    <strong className="text-slate-800 font-mono">{simulationResult.total_applications_evaluated.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Potentially Newly Eligible</span>
                    <strong className="text-emerald-600 font-mono">+{simulationResult.newly_eligible_count}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Total Affected Applications</span>
                    <strong className="text-amber-600 font-mono">{simulationResult.total_affected_count}</strong>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs space-y-1">
                  <span className="text-amber-600 font-bold block">RULE CHANGE PROPOSAL</span>
                  <p className="text-slate-600">
                    Annual Income Limit: <span className="line-through text-slate-400">₹2,00,000</span> → <strong className="text-slate-800">₹{incomeLimit.toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-200">
                    Review Changes
                  </button>
                  <button className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md">
                    Publish Version NFST-2026.2
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Adjust sliders on the left and click "Run Impact Simulation" to test rule changes.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
