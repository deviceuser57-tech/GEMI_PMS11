import React, { useState, useRef } from 'react';
import { DocumentRepositoryItem, Department } from '../../types/pms';
import { getStoredDocuments, saveDocuments } from '../../lib/documentRepository';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Download,
  ExternalLink,
  Shield,
  Eye,
  BookOpen,
  Tag,
  Calendar,
  User,
  X,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  UploadCloud,
  Camera,
  Layers,
  RefreshCw,
  Check,
  Printer,
  Save
} from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';

interface DocumentRepositoryViewProps {
  isArabic: boolean;
  currentUser: { name: string; role: string; department: string };
  onNavigateToOrchestrator?: (query: string) => void;
}

export const DocumentRepositoryView: React.FC<DocumentRepositoryViewProps> = ({
  isArabic,
  currentUser,
  onNavigateToOrchestrator
}) => {
  const [documents, setDocuments] = useState<DocumentRepositoryItem[]>(getStoredDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [securityFilter, setSecurityFilter] = useState('All');

  const [selectedDoc, setSelectedDoc] = useState<DocumentRepositoryItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);

  // Upload Form State
  const [docCode, setDocCode] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentRepositoryItem['category']>('Safety Procedure');
  const [docDept, setDocDept] = useState<Department>('HSE & Safety');
  const [docSecurity, setDocSecurity] = useState<DocumentRepositoryItem['security_level']>('Public');
  const [docRev, setDocRev] = useState('Rev.01');
  const [docSummary, setDocSummary] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docTags, setDocTags] = useState('');

  // OCR Camera Scanning State
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useGsapPageReveal();

  const filteredDocs = documents.filter(doc => {
    if (categoryFilter !== 'All' && doc.category !== categoryFilter) return false;
    if (departmentFilter !== 'All' && doc.department !== departmentFilter) return false;
    if (securityFilter !== 'All' && doc.security_level !== securityFilter) return false;
    if (
      searchQuery &&
      !doc.document_code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.summary_english.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleSaveNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docCode.trim()) return;

    const newDoc: DocumentRepositoryItem = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      document_code: docCode.toUpperCase().trim(),
      title: docTitle.trim(),
      category: docCategory,
      department: docDept,
      source_type: 'PDF',
      upload_date: new Date().toISOString().split('T')[0],
      uploaded_by: currentUser.name,
      security_level: docSecurity,
      revision: docRev,
      summary_english: docSummary || docTitle,
      text_content: docContent || docSummary || docTitle,
      tags: docTags ? docTags.split(',').map(t => t.trim()) : ['PMS-11', 'Documentation']
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveDocuments(updated);

    setIsUploadModalOpen(false);
    setDocCode('');
    setDocTitle('');
    setDocSummary('');
    setDocContent('');
    setDocTags('');
    alert(isArabic ? 'تم رفع وحفظ الوثيقة بنجاح في المستودع' : 'Document successfully cataloged in repository');
  };

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setOcrImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunOcrScan = async () => {
    if (!ocrImagePreview) return;

    setIsOcrProcessing(true);
    setOcrResult(null);

    try {
      const response = await fetch('/api/ocr/scan-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: ocrImagePreview,
          mimeType: 'image/jpeg'
        })
      });

      const data = await response.json();
      if (data.data) {
        setOcrResult(data.data);
      }
    } catch (err) {
      console.error('OCR scan failed:', err);
      alert(isArabic ? 'فشل المسح الضوئي للوثيقة، يرجى إعادة المحاولة' : 'OCR scan failed, please retry.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleSaveOcrDocument = () => {
    if (!ocrResult) return;

    const newDoc: DocumentRepositoryItem = {
      id: `DOC-OCR-${Date.now().toString().slice(-4)}`,
      document_code: ocrResult.document_code || `INSP-OCR-${Math.floor(Math.random() * 900 + 100)}`,
      title: ocrResult.title || 'Scanned Physical Inspection Sheet',
      category: (ocrResult.category as any) || 'Audit Report',
      department: (ocrResult.department as any) || 'QA/QC',
      source_type: 'PDF',
      upload_date: new Date().toISOString().split('T')[0],
      uploaded_by: `${currentUser.name} (Camera OCR)`,
      security_level: 'Restricted',
      revision: 'Field Scan',
      summary_english: ocrResult.summary_english || ocrResult.title,
      text_content: ocrResult.extracted_text || ocrResult.summary_english,
      tags: Array.isArray(ocrResult.tags) ? [...ocrResult.tags, ocrResult.mapped_wps_id || 'WPS-01'] : ['OCR-Scanned', ocrResult.mapped_wps_id || 'WPS-01']
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveDocuments(updated);

    setIsOcrModalOpen(false);
    setOcrImagePreview(null);
    setOcrResult(null);
    alert(
      isArabic
        ? `تمت رقمنة وثيقة التفتيش [${newDoc.document_code}] بنجاح وربطها تلقائياً بحزمة [${ocrResult.mapped_wps_id || 'WPS-01'}]`
        : `Inspection sheet [${newDoc.document_code}] digitized & mapped to ${ocrResult.mapped_wps_id || 'WPS-01'}!`
    );
  };

  return (
    <div className="space-y-6 gsap-card">
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>{isArabic ? 'مستودع الوثائق والرقمنة بالمسح الضوئي (OCR Document Repository)' : 'PMS-11 Document Repository & OCR Digitizer'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  CAMERA OCR + RAG
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? 'رقمنة أوراق التفتيش الميدانية بالكاميرا وربطها تلقائياً بحزم العمل WPS وحفظ المعايير التشريعية'
                  : 'Digitize physical field inspection sheets via camera OCR and map them automatically to WPS records'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Camera OCR Scan Button */}
          <button
            onClick={() => setIsOcrModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-teal-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 animate-pulse text-amber-300" />
            <span>{isArabic ? '📷 مسح ضوئي لكاميرا التفتيش (OCR Scan)' : '📷 Camera OCR Scan & Map WPS'}</span>
          </button>

          {/* Standard Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>{isArabic ? 'رفع وثيقة +' : '+ Upload Manual'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'بحث بالكود، العنوان أو الكلمات المفتاحية...' : 'Search by code, title or tags...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">{isArabic ? 'جميع التصنيفات' : 'All Categories'}</option>
              <option value="Statutory Standard">Statutory Standard (SOLAS/IMO)</option>
              <option value="Class Rule">Class Rule (DNV/GL)</option>
              <option value="Barge Manual">Barge Manual (PMS-11 Booklet)</option>
              <option value="Technical Spec">Technical Spec (WPS/NDT)</option>
              <option value="Safety Procedure">Safety Procedure (CAP 437/HSE)</option>
              <option value="Audit Report">Audit Report</option>
            </select>
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="All">{isArabic ? 'جميع الأقسام' : 'All Departments'}</option>
              <option value="Marine">Marine</option>
              <option value="Technical & Maintenance">Technical & Maintenance</option>
              <option value="HSE & Safety">HSE & Safety</option>
              <option value="Pipelay Operations">Pipelay Operations</option>
              <option value="Aviation & Helideck">Aviation & Helideck</option>
              <option value="QA/QC">QA/QC</option>
            </select>
          </div>

          <div>
            <select
              value={securityFilter}
              onChange={e => setSecurityFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-semibold"
            >
              <option value="All">{isArabic ? 'جميع مستويات الأمان' : 'All Security Levels'}</option>
              <option value="Public">Public Access</option>
              <option value="Restricted">Restricted (Operations)</option>
              <option value="Confidential Admin">Confidential Admin Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-cyan-800/80 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  {doc.tags.includes('OCR-Scanned') && <Camera className="w-3 h-3 text-amber-400" />}
                  {doc.document_code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {doc.revision}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors leading-snug">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                  {doc.summary_english}
                </p>
              </div>

              {/* Tags List */}
              <div className="flex flex-wrap gap-1 pt-1">
                {doc.tags.map((t, idx) => (
                  <span key={idx} className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    t.startsWith('WPS-')
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{doc.category}</span>
                <span className="font-semibold text-slate-300">{doc.department}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isArabic ? 'معاينة النص' : 'Preview Document'}</span>
                </button>

                {onNavigateToOrchestrator && (
                  <button
                    onClick={() => onNavigateToOrchestrator(doc.document_code)}
                    className="p-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold transition-all"
                    title={isArabic ? 'استكشاف واستشارة هذه الوثيقة في الأوركسترا' : 'Query Document in Orchestrator'}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Camera OCR Document Scanning Modal */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] printable-area">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 no-print">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-400" />
                <span>{isArabic ? 'ماسح كاميرا التفتيش الميداني (Camera OCR Inspector)' : 'Field Inspection Sheet Camera OCR Digitizer'}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 transition-colors flex items-center gap-1 text-xs font-bold"
                  title={isArabic ? 'طباعة تقرير المسح الضوئي' : 'Print OCR Scan Sheet'}
                >
                  <Printer className="w-4 h-4" />
                  <span>{isArabic ? 'طباعة' : 'Print'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsOcrModalOpen(false);
                    setOcrImagePreview(null);
                    setOcrResult(null);
                  }}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Step 1: Capture or Select Photo */}
              {!ocrImagePreview ? (
                <div className="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-8 text-center space-y-3 transition-colors bg-slate-950/50">
                  <div className="w-12 h-12 rounded-full bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {isArabic ? 'التقط صورة لورقة التفتيش أو ارفع مستنداً' : 'Snap photo of physical safety sheet or select image'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isArabic ? 'يدعم نماذج فحص UT، تصاريح العمل PTW، وتقارير المعاينة الميدانية' : 'Supports UT Thickness logs, NDT test sheets, PTW permits, and DNV audit sheets'}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileCapture}
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isArabic ? 'التقاط الكاميرا / اختيار الصورة' : 'Open Camera / Choose Photo'}</span>
                  </button>
                </div>
              ) : (
                /* Step 2: Image Preview & Process Button */
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-52 flex items-center justify-center">
                    <img src={ocrImagePreview} alt="Inspection Sheet Preview" className="max-h-52 object-contain" />
                    <button
                      onClick={() => {
                        setOcrImagePreview(null);
                        setOcrResult(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {!ocrResult && (
                    <button
                      onClick={handleRunOcrScan}
                      disabled={isOcrProcessing}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isOcrProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isArabic ? 'جاري الاستخراج بالذكاء الاصطناعي والربط التلقائي بـ WPS...' : 'Extracting safety text & mapping to WPS via Gemini Vision...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>{isArabic ? 'بدء التحليل الضوئي وتحديد حزمة WPS' : 'Run OCR Analysis & Auto-Map WPS Record'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: Extracted OCR Results Display */}
              {ocrResult && (
                <div className="bg-slate-950 border border-teal-800/80 p-4 rounded-2xl space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs">{isArabic ? 'تمت الرقمنة والربط بنجاح!' : 'Digitized & Mapped Successfully!'}</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Auto-Mapped: {ocrResult.mapped_wps_id || 'WPS-01'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-mono text-cyan-400 font-bold text-xs">[{ocrResult.document_code}] {ocrResult.title}</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{ocrResult.summary_english}</p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto scrollbar-thin">
                    <span className="text-[10px] text-slate-400 block mb-1 font-bold uppercase">{isArabic ? 'النص والمقاسات المستخرجة:' : 'Extracted Text & UT Readings:'}</span>
                    {ocrResult.extracted_text}
                  </div>

                  <button
                    onClick={handleSaveOcrDocument}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isArabic ? 'حفظ الوثيقة وربطها بسجلات البارجة' : 'Save Digitized Document & Link to WPS Records'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col printable-area">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 no-print">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {selectedDoc.document_code}
                </span>
                <span className="text-xs text-slate-300 font-bold">{selectedDoc.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 transition-colors flex items-center gap-1 text-xs font-bold"
                  title={isArabic ? 'طباعة الوثيقة' : 'Print Document'}
                >
                  <Printer className="w-4 h-4" />
                  <span>{isArabic ? 'طباعة' : 'Print'}</span>
                </button>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-white">{selectedDoc.title}</h3>
                <p className="text-slate-400 mt-1">{selectedDoc.summary_english}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-300 font-mono text-[11px] leading-relaxed">
                <span className="text-[10px] text-cyan-400 font-bold block uppercase">{isArabic ? 'نص الفقرة المستخرجة (Extract Passage for RAG Engine):' : 'Extract Document Passage:'}</span>
                <p>{selectedDoc.text_content}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">{isArabic ? 'القسم:' : 'Department:'}</span>
                  <span className="font-semibold text-slate-200">{selectedDoc.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isArabic ? 'مستوى السرية:' : 'Security Access:'}</span>
                  <span className="font-semibold text-amber-400">{selectedDoc.security_level}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isArabic ? 'تاريخ الرفع:' : 'Upload Date:'}</span>
                  <span className="font-mono text-slate-300">{selectedDoc.upload_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{isArabic ? 'تم الرفع بواسطة:' : 'Uploaded By:'}</span>
                  <span className="font-semibold text-slate-300">{selectedDoc.uploaded_by}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/80 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>{isArabic ? 'طباعة الوثيقة' : 'Print Document'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
                >
                  {isArabic ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col printable-area">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between no-print">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>{isArabic ? 'رفع كود أو دليل فني جديد' : 'Catalog New Technical Document'}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 transition-colors flex items-center gap-1 text-xs font-bold"
                  title={isArabic ? 'طباعة النموذج' : 'Print Form'}
                >
                  <Printer className="w-4 h-4" />
                  <span>{isArabic ? 'طباعة' : 'Print'}</span>
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveNewDoc} className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Document Code:</label>
                  <input
                    type="text"
                    required
                    value={docCode}
                    onChange={e => setDocCode(e.target.value)}
                    placeholder="e.g. SOLAS-CH3-HELI"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Revision:</label>
                  <input
                    type="text"
                    value={docRev}
                    onChange={e => setDocRev(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Document Title:</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="e.g. Offshore Crane Operations & Emergency Braking Procedure"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category:</label>
                  <select
                    value={docCategory}
                    onChange={e => setDocCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="Statutory Standard">Statutory Standard</option>
                    <option value="Class Rule">Class Rule (DNV)</option>
                    <option value="Barge Manual">Barge Manual</option>
                    <option value="Technical Spec">Technical Spec</option>
                    <option value="Safety Procedure">Safety Procedure</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Department:</label>
                  <select
                    value={docDept}
                    onChange={e => setDocDept(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="HSE & Safety">HSE & Safety</option>
                    <option value="Marine">Marine</option>
                    <option value="Technical & Maintenance">Technical & Maintenance</option>
                    <option value="Pipelay Operations">Pipelay Operations</option>
                    <option value="QA/QC">QA/QC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Summary / Abstract:</label>
                <textarea
                  rows={2}
                  value={docSummary}
                  onChange={e => setDocSummary(e.target.value)}
                  placeholder="Brief summary of requirements..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Extract Searchable Passage Text:</label>
                <textarea
                  rows={4}
                  value={docContent}
                  onChange={e => setDocContent(e.target.value)}
                  placeholder="Enter key technical text rules for AI Orchestrator query engine..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/80 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>{isArabic ? 'طباعة النموذج' : 'Print Form'}</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isArabic ? 'حفظ وتجميع الوثيقة بالمستودع' : 'Save & Catalog Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
