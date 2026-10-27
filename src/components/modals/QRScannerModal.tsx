import React, { useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { X, QrCode, Search, Camera, Check, AlertCircle, ArrowRight, Scan, ShieldCheck } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: BaseRecord[];
  onSelectRecord: (record: BaseRecord) => void;
  isArabic: boolean;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
  isArabic
}) => {
  const [tagInput, setTagInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLookup = (rid: string) => {
    const cleanRid = rid.trim().toUpperCase();
    if (!cleanRid) return;

    // Search by RID or ID or matching direct string
    const found = records.find(r => r.rid.toUpperCase() === cleanRid || r.id === cleanRid);

    if (found) {
      onSelectRecord(found);
      onClose();
      setTagInput('');
      setErrorMsg('');
    } else {
      setErrorMsg(
        isArabic
          ? `لم يتم العثور على سجل بالرمز المعرف: ${cleanRid}`
          : `No record found with Tag / RID: ${cleanRid}`
      );
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      // Pick a random or sample record from the list
      const sample = records[Math.floor(Math.random() * records.length)];
      if (sample) {
        setTagInput(sample.rid);
        handleLookup(sample.rid);
      }
      setIsScanning(false);
    }, 1200);
  };

  const filteredSuggestions = tagInput.trim()
    ? records.filter(
        r =>
          r.rid.toLowerCase().includes(tagInput.toLowerCase()) ||
          r.title.toLowerCase().includes(tagInput.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>{isArabic ? 'ماسح الـ QR والبطاقات الميدانية' : 'Offshore Mobile Tag & QR Scanner'}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isArabic ? 'امسح ملصق المعدات أو أدخل المعرف RID للوصول السريع' : 'Scan physical rig equipment tags or search by RID'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Camera Frame Simulation */}
          <div className="relative bg-slate-950 rounded-2xl border-2 border-dashed border-cyan-500/40 p-6 flex flex-col items-center justify-center text-center space-y-3 overflow-hidden shadow-inner group">
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

            {isScanning ? (
              <div className="py-8 space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-semibold text-cyan-300 animate-pulse">
                  {isArabic ? 'جاري قراءة رمز الاستجابة الميداني...' : 'Scanning rig tag frame...'}
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {isArabic ? 'وجّه الكاميرا إلى ملصق الـ QR' : 'Point Mobile Camera at Equipment QR Tag'}
                  </h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                    {isArabic ? 'يدعم قراءة أكواد WPS, GAP, DEL, R, ACT وجميع الشيتات' : 'Compatible with all PMS-11 rig worksheets & asset badges'}
                  </p>
                </div>
                <button
                  onClick={handleSimulateScan}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Scan className="w-4 h-4" />
                  <span>{isArabic ? 'بدء المسح الكاميري الميداني' : 'Activate Live Rig Scanner'}</span>
                </button>
              </>
            )}
          </div>

          {/* Manual Input Search */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              {isArabic ? 'أو أدخل كود السجل / المعرف (RID) يدوياً:' : 'Or Enter Record Tag / RID manually:'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup(tagInput)}
                  placeholder={isArabic ? 'مثال: WPS-19, GAP-003, R-048' : 'e.g. WPS-19, GAP-003, R-048'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono uppercase"
                />
              </div>
              <button
                onClick={() => handleLookup(tagInput)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>{isArabic ? 'فتح' : 'Open'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/60 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Suggestions list */}
            {filteredSuggestions.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1 mt-2 max-h-48 overflow-y-auto">
                <p className="text-[10px] text-slate-500 font-bold uppercase px-2 py-0.5">
                  {isArabic ? 'السجلات المطابقة:' : 'Matching Rig Records:'}
                </p>
                {filteredSuggestions.map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => {
                      onSelectRecord(rec);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {rec.rid}
                      </span>
                      <span className="text-xs text-slate-200 group-hover:text-cyan-300 truncate max-w-[200px]">
                        {rec.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {rec.department}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
