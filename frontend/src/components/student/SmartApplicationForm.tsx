import React, { useState } from 'react';
import { UserProfile, ApplicationDocument } from '../../types';
import { 
  CheckCircle2, AlertTriangle, Upload, FileText, ArrowRight, ShieldCheck, RefreshCw, XCircle 
} from 'lucide-react';
import { api } from '../../services/api';

interface SmartApplicationFormProps {
  profile: UserProfile;
  schemeId: string;
  onSubmitted: (appId: string) => void;
  onCancel: () => void;
}

export const SmartApplicationForm: React.FC<SmartApplicationFormProps> = ({
  profile,
  schemeId,
  onSubmitted,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<number>(4);
  const [uploadedDocs, setUploadedDocs] = useState<ApplicationDocument[]>([
    {
      id: "DOC-821-1",
      application_id: "NFST-2026-00821",
      doc_type: "Caste Certificate",
      file_name: "ST_Caste_Certificate_Arun.pdf",
      quality: "GOOD",
      ocr_confidence: 0.99,
      is_valid: true,
      extracted_fields: [
        { field_name: "Applicant Name", value: "Arun Kumar", confidence: 0.99, source: "Caste Certificate" },
        { field_name: "Tribe / Community", value: "Malayali (ST)", confidence: 0.98, source: "Caste Certificate" }
      ]
    }
  ]);

  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');
  const [qualityError, setQualityError] = useState<any | null>(null);
  const [dobMismatchDetected, setDobMismatchDetected] = useState<boolean>(true);

  const steps = [
    { num: 1, label: 'Personal', status: '✓' },
    { num: 2, label: 'Academic', status: '✓' },
    { num: 3, label: 'Scheme', status: '✓' },
    { num: 4, label: 'Documents', status: '●' },
    { num: 5, label: 'Review', status: '○' },
    { num: 6, label: 'Submit', status: '○' }
  ];

  const handleSimulateUpload = async (docType: string, simulateBlurry: boolean = false) => {
    setUploading(true);
    setQualityError(null);
    setUploadStatusMsg(`Processing document... Running PaddleOCR & extraction...`);

    setTimeout(async () => {
      const res = await api.uploadDocument(docType, simulateBlurry, "NFST-2026-00821");
      setUploading(false);

      if (!res.success || res.quality_status === 'BLURRY') {
        setQualityError(res);
      } else {
        const newDoc: ApplicationDocument = {
          id: `DOC-${uploadedDocs.length + 1}`,
          application_id: "NFST-2026-00821",
          doc_type: docType,
          file_name: res.file_name,
          quality: "GOOD",
          ocr_confidence: 0.97,
          is_valid: true,
          extracted_fields: res.extracted_fields
        };
        setUploadedDocs(prev => [...prev.filter(d => d.doc_type !== docType), newDoc]);
      }
    }, 1200);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase tracking-wider">Guided Application</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">National Fellowship for ST Students (NFST 2026)</h2>
        </div>
        <button onClick={onCancel} className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200">
          Cancel Draft
        </button>
      </div>

      {/* Stepper */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between text-xs overflow-x-auto shadow-2xs">
        {steps.map((step) => (
          <div 
            key={step.num}
            onClick={() => setCurrentStep(step.num)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl cursor-pointer transition-all ${
              currentStep === step.num ? 'bg-[#0e2a47] text-white font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === step.num ? 'bg-white text-[#0e2a47]' : 'bg-slate-100 text-slate-500'
            }`}>
              {step.num}
            </span>
            <span>{step.label}</span>
          </div>
        ))}
      </div>

      {/* SECTION 4: INTELLIGENT DOCUMENT UPLOAD */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Document Upload & Instant Quality Check
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">Pre-Submission Verification</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Upload clean documents. SAHA verifies readability and extracts fields before submission.</p>
            </div>

            <button
              onClick={() => handleSimulateUpload('Income Certificate', true)}
              disabled={uploading}
              className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Blurry Upload Demo</span>
            </button>
          </div>

          {/* UPLOADING INDICATOR */}
          {uploading && (
            <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-xs text-blue-800 font-bold">{uploadStatusMsg}</span>
            </div>
          )}

          {/* QUALITY ERROR BANNER */}
          {qualityError && (
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-pink-900 uppercase tracking-wider">{qualityError.error_title}</h4>
                  <p className="text-xs text-pink-800 mt-0.5">{qualityError.error_message}</p>
                  <p className="text-xs text-pink-900 font-bold mt-1">{qualityError.required_action}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-pink-200/80 flex justify-end">
                <button
                  onClick={() => handleSimulateUpload('Income Certificate', false)}
                  className="px-4 py-1.5 rounded-lg bg-pink-600 text-white font-bold text-xs hover:bg-pink-700 transition-all"
                >
                  Replace Document Now
                </button>
              </div>
            </div>
          )}

          {/* DOB MISMATCH PRE-SUBMISSION ALERT */}
          {dobMismatchDetected && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Cross-Document Consistency Check</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">DATE OF BIRTH MISMATCH DETECTED</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Application DOB: <strong className="text-slate-900">12/04/2004</strong> vs Marksheet DOB: <strong className="text-amber-800">12/04/2003</strong>.
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold whitespace-nowrap">
                Manual Verification Required
              </span>
            </div>
          )}

          {/* UPLOAD CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Income Certificate */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Income Certificate</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">Mandatory</span>
              </div>

              {uploadedDocs.find(d => d.doc_type === 'Income Certificate') ? (
                <div className="space-y-2 bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Income Certificate Verified
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">OCR 97%</span>
                  </div>
                  
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                    <div>Name: <strong className="text-slate-900">Arun Kumar</strong> ✓ Match</div>
                    <div>Extracted Income: <strong className="text-emerald-700 font-bold">₹1,80,000</strong> ✓ Valid</div>
                    <div>Validity: <strong className="text-slate-900">Valid until 11/06/2027</strong></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleSimulateUpload('Income Certificate', false)}
                  className="w-full py-5 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center text-xs text-slate-500 hover:text-slate-900 bg-white transition-all"
                >
                  <Upload className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="font-semibold">Upload Income Certificate</span>
                </button>
              )}
            </div>

            {/* Academic Marksheet */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Academic Marksheet</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">Mandatory</span>
              </div>

              <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Marksheet_PhD_Biotech.pdf
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">OCR 98%</span>
                </div>
                
                <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  <div>Percentage: <strong className="text-slate-900">82.4%</strong> (Min required 60%)</div>
                  <div>Extracted DOB: <strong className="text-amber-700">12/04/2003</strong></div>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button onClick={() => setCurrentStep(3)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200">
              ← Previous Step
            </button>
            <button 
              onClick={() => setCurrentStep(5)}
              className="px-6 py-2.5 rounded-xl bg-[#0e2a47] hover:bg-[#0b2035] text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <span>Proceed to Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* SECTION 5 & 6: REVIEW & SUBMIT */}
      {currentStep >= 5 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Review & Final Submission</h3>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Student Name</span>
              <span className="font-bold text-slate-900">{profile.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Category & Income</span>
              <span className="font-bold text-slate-900">{profile.category} • ₹{profile.annual_income.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Pre-Submission Verification Status</span>
              <span className="font-bold text-emerald-700">✓ ALL DOCUMENTS VERIFIED</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button onClick={() => setCurrentStep(4)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200">
              Back to Documents
            </button>
            <button
              onClick={() => onSubmitted("NFST-2026-00821")}
              className="px-6 py-2.5 rounded-xl bg-[#0e2a47] hover:bg-[#0b2035] text-white font-bold text-xs shadow-md transition-all"
            >
              Submit Clean Application
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
