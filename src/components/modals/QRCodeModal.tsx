import React, { useEffect, useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { X, QrCode, Download, Printer, Copy, Check, ExternalLink, ShieldCheck, Tag } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeModalProps {
  record: BaseRecord | null;
  onClose: () => void;
  isArabic: boolean;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ record, onClose, isArabic }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!record) return;
    const directUrl = `${window.location.origin}${window.location.pathname}?recordId=${encodeURIComponent(record.rid)}`;
    
    QRCode.toDataURL(directUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR code:', err));
  }, [record]);

  if (!record) return null;

  const directUrl = `${window.location.origin}${window.location.pathname}?recordId=${encodeURIComponent(record.rid)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `PMS11_Tag_${record.rid}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {isArabic ? 'بطاقة رمز الاستجابة السريعة (Rig Tag)' : 'Rig Asset QR Code Tag'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isArabic ? 'رمز الفحص الميداني والوسم الإلكتروني للبارجة' : 'PMS-11 Offshore Physical Asset Tag'}
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

        {/* Tag Body (Printable Tag Card) */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Tag Preview Card */}
          <div className="bg-white text-slate-950 p-5 rounded-2xl border-4 border-slate-950 shadow-2xl max-w-xs mx-auto print:m-0 print:border-2">
            {/* Tag Header */}
            <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
              <div className="flex items-center justify-center gap-1 font-extrabold text-[10px] tracking-widest uppercase text-cyan-900">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 inline" />
                <span>PMS-11 BARGE TAG</span>
              </div>
              <h4 className="font-black text-xs text-slate-900 uppercase">
                {record.department}
              </h4>
            </div>

            {/* QR Image */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 flex justify-center shadow-inner">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR Code for ${record.rid}`} className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  {isArabic ? 'جاري إنشاء الرمز...' : 'Generating Tag...'}
                </div>
              )}
            </div>

            {/* Tag Info */}
            <div className="mt-3 text-center space-y-1">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-md font-mono font-black text-sm tracking-wide">
                {record.rid}
              </div>
              <p className="font-bold text-xs text-slate-900 line-clamp-2 px-1">
                {record.title}
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-semibold pt-1">
                <span>{isArabic ? 'الحالة:' : 'Status:'} <strong className="text-slate-900">{record.status}</strong></span>
                <span>•</span>
                <span>{isArabic ? 'حزمة العمل:' : 'WPS:'} <strong className="text-slate-900">{record.wps_id || 'Global'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isArabic ? 'تحميل PNG' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>{isArabic ? 'طباعة الملصق' : 'Print Tag Badge'}</span>
              </button>
            </div>

            {/* Copy Link Input */}
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
              <input
                type="text"
                readOnly
                value={directUrl}
                className="bg-transparent text-[11px] font-mono text-slate-400 w-full px-2 outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold shrink-0 flex items-center gap-1"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copied ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
