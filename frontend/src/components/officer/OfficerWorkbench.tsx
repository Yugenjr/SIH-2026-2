import React, { useState, useEffect } from 'react';
import { Application, ApplicationDocument } from '../../types';
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, XCircle, ArrowUpRight, Search, FileText, User, Eye, ShieldAlert, Sparkles, Send, Clock 
} from 'lucide-react';
import { api } from '../../services/api';

interface OfficerWorkbenchProps {
  onRefresh: () => void;
}

export const OfficerWorkbench: React.FC<OfficerWorkbenchProps> = ({ onRefresh }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ApplicationDocument | null>(null);
  const [activeHighlightField, setActiveHighlightField] = useState<string | null>(null);
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const q = await api.getOfficerQueue();
    setQueue(q);
    const app = await api.getApplicationById("NFST-2026-00821");
    if (app) {
      setSelectedApp(app);
      if (app.documents && app.documents.length > 0) {
        setSelectedDoc(app.documents[0]);
      }
    }
    setLoading(false);
  };

  const handleSelectApp = async (appId: string) => {
    const app = await api.getApplicationById(appId);
    if (app) {
      setSelectedApp(app);
      if (app.documents && app.documents.length > 0) {
        setSelectedDoc(app.documents[0]);
      }
    }
  };

  const handleOfficerDecision = async (action: string) => {
    if (!selectedApp) return;
    if (action === 'REQUEST_CORRECTION' && !showCorrectionModal) {
      setCorrectionReason('Date of Birth Mismatch between Application and Marksheet. Please upload official proof.');
      setShowCorrectionModal(true);
      return;
    }

    await api.officerDecision(selectedApp.id, action, correctionReason || 'Officer decision recorded');
    setShowCorrectionModal(false);
    loadData();
    onRefresh();
  };

  return (
    <div className="space-y-4 w-full pb-12">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Officer Verification Workbench</h2>
            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-mono">Dense Operations UI</span>
          </div>
          <p className="text-xs text-slate-500">Review AI verification summaries, inspect evidence, resolve mismatches, and issue decisions.</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 shadow-sm">
            Assigned Queue: <strong className="text-slate-800">{queue.length}</strong>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-700 font-semibold shadow-sm">
            High Priority: <strong className="text-slate-800">{queue.filter(q => q.priority === 'HIGH').length}</strong>
          </div>
        </div>
      </div>

      {/* THREE PANE WORKBENCH LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT PANE: WORK QUEUE (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 shadow-sm rounded-2xl p-4 space-y-3 flex flex-col h-[760px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Work Queue</h3>
            <span className="text-[10px] font-mono text-slate-500">Sorted by SLA</span>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1">
            {queue.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectApp(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedApp?.id === item.id 
                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider uppercase ${
                    item.priority === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {item.priority} PRIORITY
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">SLA: {item.sla_days_remaining}d remaining</span>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{item.student_name}</span>
                    <span className="text-[11px] font-mono text-slate-500">#{item.application_number}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER & RIGHT PANES (9 Cols) */}
        {selectedApp ? (
          <div className="lg:col-span-9 space-y-4">
            
            {/* TOP ROW: SUMMARY & AI VERIFICATION PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* APPLICANT SUMMARY CARD */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block font-mono">App #{selectedApp.application_number}</span>
                    <h3 className="text-lg font-bold text-slate-800">{selectedApp.student_name}</h3>
                    <p className="text-xs text-slate-500">{selectedApp.scheme_name}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    ✓ ELIGIBLE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-center shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Documents</span>
                    <span className="font-bold text-slate-800 text-sm">5 / 5</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Consistency</span>
                    <span className="font-bold text-emerald-600 text-sm">96%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Anomaly Signals</span>
                    <span className="font-bold text-amber-600 text-sm">1</span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Declared Family Income:</span>
                    <strong className="text-slate-800">₹{selectedApp.annual_income.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Academic Score:</span>
                    <strong className="text-slate-800">{selectedApp.academic_percentage}%</strong>
                  </div>
                </div>
              </div>

              {/* AI VERIFICATION & ANOMALY PANEL */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Verification & Signals
                  </h4>
                  <span className="text-xs font-mono text-emerald-600 font-bold">Score: 94%</span>
                </div>

                {/* DOB MISMATCH FLAG */}
                {!selectedApp.cross_doc_status.dob_match && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>FLAG: DATE OF BIRTH MISMATCH</span>
                    </div>
                    <p className="text-slate-600">
                      Application DOB: <strong className="text-slate-800">12/04/2004</strong> vs Marksheet DOB: <strong className="text-slate-800">12/04/2003</strong>
                    </p>
                    <p className="text-[11px] text-amber-600 font-semibold mt-1">Recommended Action: Manual verification required</p>
                  </div>
                )}

                {/* ANOMALY SIGNAL */}
                {selectedApp.anomaly_flags.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Perceptual Similarity Signal</span>
                    <p className="text-slate-600">{selectedApp.anomaly_flags[0]}</p>
                  </div>
                )}
              </div>

            </div>

            {/* BOTTOM: DOCUMENT EVIDENCE VIEWER WITH BOUNDING BOX HIGHLIGHTS */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Document Evidence Inspection
                </h3>

                <div className="flex items-center space-x-2">
                  {selectedApp.documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        selectedDoc?.id === doc.id 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {doc.doc_type}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDoc && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  
                  {/* Extracted Fields Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Extracted OCR Evidence Fields</h4>
                    <p className="text-[11px] text-slate-500">Click a field to highlight evidence region in viewer</p>

                    <div className="space-y-1.5 pt-1">
                      {selectedDoc.extracted_fields.map((field, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveHighlightField(field.field_name)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            activeHighlightField === field.field_name 
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="text-slate-500 block text-[10px]">{field.field_name}</span>
                            <span className="font-semibold text-slate-800">{field.value}</span>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-emerald-600 font-mono border border-slate-200">
                              {(field.confidence * 100).toFixed(0)}% OCR
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Page {field.page || 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulated Document Region Viewer */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 relative flex flex-col justify-between min-h-[260px] shadow-sm">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                      <span className="font-mono text-slate-600">{selectedDoc.file_name}</span>
                      <span className="text-emerald-600 font-bold">✓ Verified Digital Stamp</span>
                    </div>

                    <div className="my-6 p-6 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-2 relative overflow-hidden">
                      <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                      <p className="text-xs font-mono text-slate-500">Official Certificate Stream Preview</p>

                      {/* Evidence Bounding Box Overlay Simulation */}
                      {activeHighlightField && (
                        <div className="absolute inset-x-8 top-6 p-2 rounded bg-amber-50 border-2 border-amber-400 text-amber-700 text-xs font-bold animate-pulse shadow-sm">
                          Highlighted Evidence Region: {activeHighlightField}
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 text-center">
                      Source: {selectedDoc.doc_type} • DigiLocker Registry Verified
                    </div>
                  </div>

                </div>
              )}

              {/* OFFICER DECISION ACTIONS */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium">Recorded decisions are logged in Decision Replay audit</span>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleOfficerDecision('REJECT')}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-all shadow-sm"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => handleOfficerDecision('REQUEST_CORRECTION')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-extrabold shadow-sm transition-all"
                  >
                    Request Correction
                  </button>

                  <button
                    onClick={() => handleOfficerDecision('APPROVE')}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md transition-all"
                  >
                    Approve Application
                  </button>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-9 bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center text-slate-500">
            Select an application from the work queue to review.
          </div>
        )}

      </div>

      {/* REQUEST CORRECTION DEFICIENCY MODAL */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Generate Deficiency Notice</h3>
            <p className="text-xs text-slate-600">This structured notice will immediately trigger an "Action Required" alert for the student.</p>

            <textarea
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder="Specify required correction action..."
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowCorrectionModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold">
                Cancel
              </button>
              <button 
                onClick={() => handleOfficerDecision('REQUEST_CORRECTION')}
                className="px-5 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-400 shadow-sm"
              >
                Send Deficiency Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
