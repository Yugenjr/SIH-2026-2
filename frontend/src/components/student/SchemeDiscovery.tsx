import React, { useState } from 'react';
import { UserProfile, SchemeConfig } from '../../types';
import { CheckCircle2, HelpCircle, ChevronRight, X, ShieldCheck } from 'lucide-react';

interface SchemeDiscoveryProps {
  profile: UserProfile;
  schemes: SchemeConfig[];
  onSelectScheme: (schemeId: string) => void;
  onBack: () => void;
}

export const SchemeDiscovery: React.FC<SchemeDiscoveryProps> = ({
  profile,
  schemes,
  onSelectScheme,
  onBack
}) => {
  const [selectedExplainScheme, setSelectedExplainScheme] = useState<SchemeConfig | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const handleOpenWhyModal = (scheme: SchemeConfig) => {
    setSelectedExplainScheme(scheme);
    setEvaluationResult({
      eligible: profile.category === 'ST' && profile.annual_income <= scheme.max_income_limit && profile.academic_percentage >= scheme.min_academic_score,
      scheme_code: scheme.code,
      scheme_name: scheme.name,
      scheme_version: scheme.version,
      rules_evaluated: [
        {
          rule: "Category Requirement",
          requirement: "Scheduled Tribe (ST)",
          actual: profile.category,
          passed: profile.category === 'ST',
          status: profile.category === 'ST' ? "PASS" : "FAIL"
        },
        {
          rule: "Annual Family Income",
          requirement: `<= ₹${scheme.max_income_limit.toLocaleString('en-IN')}`,
          actual: `₹${profile.annual_income.toLocaleString('en-IN')}`,
          passed: profile.annual_income <= scheme.max_income_limit,
          status: profile.annual_income <= scheme.max_income_limit ? "PASS" : "FAIL"
        },
        {
          rule: "Academic Percentage",
          requirement: `>= ${scheme.min_academic_score}%`,
          actual: `${profile.academic_percentage}%`,
          passed: profile.academic_percentage >= scheme.min_academic_score,
          status: profile.academic_percentage >= scheme.min_academic_score ? "PASS" : "FAIL"
        },
        {
          rule: "Age Limit",
          requirement: `<= ${scheme.max_age_limit} Years`,
          actual: `${profile.age} Years`,
          passed: profile.age <= scheme.max_age_limit,
          status: profile.age <= scheme.max_age_limit ? "PASS" : "FAIL"
        }
      ]
    });
  };

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Find Schemes For Me</h2>
          <p className="text-xs text-slate-500">Profile rule matcher evaluating factual qualification criteria</p>
        </div>
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
        >
          ← Back to Overview
        </button>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block font-bold uppercase text-[10px]">Category</span>
          <span className="font-extrabold text-slate-900 text-sm">{profile.category}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-bold uppercase text-[10px]">Annual Income</span>
          <span className="font-extrabold text-slate-900 text-sm">₹{profile.annual_income.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-bold uppercase text-[10px]">Education Level</span>
          <span className="font-extrabold text-slate-900 text-sm">{profile.education_level}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-bold uppercase text-[10px]">Academic Score</span>
          <span className="font-extrabold text-slate-900 text-sm">{profile.academic_percentage}%</span>
        </div>
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Evaluated Opportunities</h3>

        {schemes.map((scheme) => {
          const isEligible = profile.category === 'ST' && profile.annual_income <= scheme.max_income_limit && profile.academic_percentage >= scheme.min_academic_score;

          return (
            <div 
              key={scheme.id}
              className={`bg-white border rounded-2xl p-6 shadow-2xs transition-all ${
                isEligible ? 'border-emerald-200 shadow-sm' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {isEligible ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" /> Potentially Eligible
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono">Code: {scheme.code}</span>
                    <span className="text-xs text-slate-400 font-mono">Version: {scheme.version}</span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900">{scheme.name}</h4>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed">{scheme.description}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => handleOpenWhyModal(scheme)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Why?</span>
                  </button>

                  <button
                    onClick={() => onSelectScheme(scheme.id)}
                    className="px-5 py-2 rounded-xl bg-[#0e2a47] hover:bg-[#0b2035] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                  >
                    <span>Apply Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WHY? EXPLAINABLE ELIGIBILITY MODAL */}
      {selectedExplainScheme && evaluationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Explainable Eligibility Check</h3>
              </div>
              <button 
                onClick={() => setSelectedExplainScheme(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">{selectedExplainScheme.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 font-mono font-bold">
                  {evaluationResult.scheme_version}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                {evaluationResult.rules_evaluated.map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200/80">
                    <div>
                      <span className="font-semibold text-slate-800 block">{r.rule}</span>
                      <span className="text-[11px] text-slate-500">Limit: {r.requirement} • Actual: <strong className="text-slate-900">{r.actual}</strong></span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      ✓ {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedExplainScheme(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Close Explanation
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
