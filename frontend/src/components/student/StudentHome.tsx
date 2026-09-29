import React, { useState } from 'react';
import { UserProfile, Application, Fellowship } from '../../types';
import { 
  CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, FileText, ArrowUpRight, MessageSquare, Send, X 
} from 'lucide-react';
import { api } from '../../services/api';

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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; provider?: string }>>([
    { 
      sender: 'bot', 
      text: `Namaste ${profile.name}. I am SETU RAG-Grounded Assistant. How can I assist you with your scholarship application or MoTA guidelines today?`,
      provider: 'RAG Grounded in DB & MoTA Policies'
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const activeDeficiency = applications
    .flatMap(a => a.deficiencies)
    .find(d => d.status === 'ACTION REQUIRED');

  const primaryApp = applications.find(a => a.id === 'NFST-2026-00821') || applications[0];

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery || chatQuery;
    if (!q.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: q }]);
    if (!customQuery) setChatQuery('');
    setChatLoading(true);

    try {
      const res = await api.askChatbot(q, primaryApp?.id || 'NFST-2026-00821');
      const answer = res?.answer || 'Response unavailable. Please try again.';
      const provider = res?.provider || 'SETU_RAG_Grounded';
      setChatMessages(prev => [...prev, { sender: 'bot', text: answer, provider }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to SETU RAG Assistant. Please try again.', provider: 'Network Error' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      
      {/* 1. Official Government Student Welcome Banner */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0e2a47]">Student Portal</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-300 font-mono">
                ID: {profile.id}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Welcome, <span className="text-[#0e2a47]">{profile.name}</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {profile.education_level} • {profile.institution} ({profile.state})
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenDiscovery}
              className="px-4 py-2 rounded-lg bg-[#0e2a47] hover:bg-[#0b2035] text-white font-bold text-xs shadow-xs flex items-center space-x-2 transition-all"
            >
              <span>Browse All Scholarships</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Profile Fact Strip */}
        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span>
            <strong className="text-slate-800 font-semibold">{profile.category} (Scheduled Tribe)</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Declared Income</span>
            <strong className="text-slate-800 font-mono">₹{profile.annual_income.toLocaleString('en-IN')}/year</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Academic Score</span>
            <strong className="text-emerald-700 font-bold">{profile.academic_percentage}%</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Aadhaar Identity</span>
            <strong className="text-slate-800 font-mono">{profile.aadhaar_masked} (Verified)</strong>
          </div>
        </div>
      </div>

      {/* 2. Official Action Notice Box (Deficiency Alert) */}
      {activeDeficiency && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5 border border-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900">ACTION REQUIRED BY APPLICANT</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-200 text-amber-900 font-mono font-bold">
                  Deadline: {activeDeficiency.deadline}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{activeDeficiency.problem}</h3>
              <p className="text-xs text-slate-700 mt-0.5">{activeDeficiency.required_action}</p>
            </div>
          </div>

          <button
            onClick={() => onFixDeficiency(activeDeficiency.application_id, activeDeficiency.id)}
            className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 flex items-center justify-center space-x-1.5"
          >
            <span>Fix Now & Revalidate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Official Application Lifecycle Stage Tracker */}
      {primaryApp && (
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Application Tracker</span>
              <h2 className="text-base font-bold text-slate-900">{primaryApp.scheme_name} ({primaryApp.scheme_code})</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Application No</span>
              <strong className="text-sm font-mono text-[#0e2a47]">#{primaryApp.application_number}</strong>
            </div>
          </div>

          {/* Vertical Government Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            
            {/* Step 1: Drafted */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>1. Form Drafted</span>
              </div>
              <p className="text-[11px] text-slate-500">Submitted on {primaryApp.submitted_at.split(' ')[0]}</p>
            </div>

            {/* Step 2: Document OCR */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>2. Document OCR</span>
              </div>
              <p className="text-[11px] text-slate-500">AI Quality Analysis Passed</p>
            </div>

            {/* Step 3: Officer Scrutiny */}
            <div className={`p-3 rounded-lg border text-xs space-y-1 ${
              primaryApp.status === 'OFFICER_SCRUTINY' || primaryApp.status === 'SUBMITTED'
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : (primaryApp.status === 'APPROVED' ? 'bg-slate-50 border-slate-200 text-emerald-700 font-bold' : 'bg-amber-50 border-amber-300 text-amber-900')
            }`}>
              <div className="flex items-center space-x-1.5 font-bold">
                {primaryApp.status === 'APPROVED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-700 animate-pulse" />
                )}
                <span>3. Officer Scrutiny</span>
              </div>
              <p className="text-[11px] text-slate-600">Assigned: {primaryApp.assigned_officer_name || 'Verification Desk'}</p>
            </div>

            {/* Step 4: Eligibility Decision */}
            <div className={`p-3 rounded-lg border text-xs space-y-1 ${
              primaryApp.status === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="flex items-center space-x-1.5">
                {primaryApp.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <span className="w-2 h-2 rounded-full bg-slate-300"></span>}
                <span>4. Officer Decision</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {primaryApp.status === 'APPROVED' ? 'Approved & Sanctioned' : 'Pending Scrutiny'}
              </p>
            </div>

            {/* Step 5: Fellowship Activation */}
            <div className={`p-3 rounded-lg border text-xs space-y-1 ${
              fellowship && fellowship.status === 'ACTIVE'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="flex items-center space-x-1.5">
                {fellowship && fellowship.status === 'ACTIVE' ? <ShieldCheck className="w-4 h-4 text-emerald-700" /> : <span className="w-2 h-2 rounded-full bg-slate-300"></span>}
                <span>5. DBT Fellowship</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {fellowship ? `₹31,000/mo (Yr ${fellowship.current_year})` : 'Awaiting Approval'}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 4. Lower Grid: Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* My Applications Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-[#0e2a47]" />
              <span>My Submitted Applications ({applications.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[400px] border border-slate-200 rounded-lg shadow-inner">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 font-bold z-10 shadow-2xs">
                <tr>
                  <th className="p-2.5">Application No</th>
                  <th className="p-2.5">Scheme Name</th>
                  <th className="p-2.5">Stage / Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 bg-white">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-[#0e2a47]">#{app.application_number}</td>
                    <td className="p-2.5 font-semibold">{app.scheme_code} 2026</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.status === 'APPROVED' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : (app.status === 'DEFICIENT' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300')
                      }`}>
                        ● {app.current_stage_label}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button 
                        onClick={() => onStartApplication(app.scheme_id)}
                        className="text-xs text-blue-700 hover:text-blue-900 font-bold inline-flex items-center gap-1"
                      >
                        Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fellowship Record Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Active Fellowship Record</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
              {fellowship?.status || 'ACTIVE'}
            </span>
          </div>

          {fellowship ? (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">{fellowship.scheme_name}</span>
                <strong className="text-sm font-bold text-slate-900">Year {fellowship.current_year} of {fellowship.total_years}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Monthly Stipend</span>
                  <strong className="text-emerald-700 font-bold">₹31,000 / month</strong>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Next Renewal</span>
                  <strong className="text-slate-800 font-semibold">{fellowship.next_renewal_date}</strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onViewFellowship}
                  className="px-3 py-1.5 rounded bg-[#0e2a47] text-white font-bold text-xs hover:bg-[#0b2035]"
                >
                  View Fellowship Details
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              No active fellowship awarded.
            </div>
          )}
        </div>

      </div>

      {/* 5. Floating Government Chatbot Widget */}
      <div className="fixed bottom-4 right-4 z-40">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="px-4 py-2.5 rounded-full bg-[#0e2a47] hover:bg-[#0b2035] text-white font-bold text-xs shadow-lg flex items-center space-x-2 border border-slate-600"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>SETU RAG Assistant</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500 text-white font-mono">RAG AI</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[420px]">
            
            {/* Header */}
            <div className="bg-[#0e2a47] text-white p-3 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>SETU Verification Assistant (Groq RAG)</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick RAG Prompt Chips */}
            <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap gap-1">
              <button
                onClick={() => handleSendMessage(undefined, "What is my application status?")}
                className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[10px] rounded font-medium"
              >
                📋 Status Check
              </button>
              <button
                onClick={() => handleSendMessage(undefined, "What are the NFST stipend amounts and rules?")}
                className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[10px] rounded font-medium"
              >
                💰 Stipend & Rules
              </button>
              <button
                onClick={() => handleSendMessage(undefined, "Am I eligible for NFST scholarship?")}
                className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[10px] rounded font-medium"
              >
                ⚖️ Eligibility Check
              </button>
              <button
                onClick={() => handleSendMessage(undefined, "How do I fix document deficiency?")}
                className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[10px] rounded font-medium"
              >
                ⚠️ Deficiency Help
              </button>
            </div>

            {/* Message Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs bg-slate-50">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-2.5 rounded-lg max-w-[85%] leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-[#0e2a47] text-white' 
                      : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                  }`}>
                    {m.text}
                  </div>
                  {m.provider && m.sender === 'bot' && (
                    <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                      🔍 {m.provider}
                    </span>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="text-[10px] text-slate-500 italic flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                  <span>Retrieving MoTA Guidelines & DB Context via Groq RAG...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => handleSendMessage(e)} className="p-2 border-t border-slate-200 bg-white flex space-x-1.5">
              <input
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="Ask about status, eligibility, rules..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-600"
              />
              <button type="submit" className="p-2 bg-[#0e2a47] text-white rounded-lg hover:bg-[#0b2035]">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>
        )}
      </div>

    </div>
  );
};

