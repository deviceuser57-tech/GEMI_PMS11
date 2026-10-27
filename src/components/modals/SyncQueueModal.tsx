import React, { useState } from 'react';
import { SyncQueueItem, processSyncQueue, removeSyncQueueItem, clearSyncQueue, addSyncQueueItem } from '../../lib/syncQueue';
import {
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Check,
  Printer
} from 'lucide-react';

interface SyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncQueue: SyncQueueItem[];
  onUpdateQueue: (queue: SyncQueueItem[]) => void;
  isOnline: boolean;
  isArabic: boolean;
}

export const SyncQueueModal: React.FC<SyncQueueModalProps> = ({
  isOpen,
  onClose,
  syncQueue,
  onUpdateQueue,
  isOnline,
  isArabic
}) => {
  if (!isOpen) return null;

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const handleManualSync = async () => {
    if (syncQueue.length === 0) return;
    setIsSyncing(true);

    try {
      const res = await processSyncQueue((updatedQueue) => {
        onUpdateQueue(updatedQueue);
      });

      if (res.success) {
        setLastSyncTime(new Date().toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US'));
        onUpdateQueue([]);
      }
    } catch (e) {
      console.error('Manual sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    const updated = removeSyncQueueItem(id);
    onUpdateQueue(updated);
  };

  const handleClearAll = () => {
    if (confirm(isArabic ? 'هل أنت متأكد من مسح جميع عمليات المزامنة المعتلقة؟' : 'Are you sure you want to clear all pending sync operations?')) {
      const updated = clearSyncQueue();
      onUpdateQueue(updated);
    }
  };

  const handleAddDemoSyncItem = () => {
    const updated = addSyncQueueItem({
      recordId: `rec-demo-${Date.now().toString().slice(-4)}`,
      recordRid: `INSP-${Math.floor(100 + Math.random() * 900)}`,
      action: 'UPDATE',
      entity: 'task',
      title: isArabic ? 'تفتيش ميداني محلي - تم الحفظ دون اتصال' : 'Local Inspection Check - Offline Saved',
      department: 'HSE & Safety'
    });
    onUpdateQueue(updated);
  };

  const getActionBadge = (action: SyncQueueItem['action']) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">CREATE +</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">UPDATE ↻</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">DELETE ✕</span>;
      case 'STATUS_CHANGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">STATUS ✓</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">ACTION</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col printable-area">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20 no-print">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              isOnline ? 'bg-gradient-to-tr from-cyan-600 to-blue-600' : 'bg-gradient-to-tr from-amber-600 to-orange-600'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>{isArabic ? 'قائمة عمليات المزامنة مع الخادم (Offline Sync Queue)' : 'Offline Sync Queue & Sync Operations'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'متابعة العمليات التي تم إنشاؤها وتعديلها دون اتصال بالإنترنت والمزامنة اليدوية'
                  : 'Track and manually trigger pending offline operations queued for cloud synchronization'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 transition-colors flex items-center gap-1 text-xs font-bold"
              title={isArabic ? 'طباعة القائمة المعلقة' : 'Print Queue List'}
            >
              <Printer className="w-4 h-4" />
              <span>{isArabic ? 'طباعة' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            )}
            <div>
              <span className="text-[10px] text-slate-500 block">{isArabic ? 'حالة الاتصال بالشبكة' : 'Connection Status'}</span>
              <span className={`font-bold ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isOnline ? (isArabic ? 'متصل - جاهز للمزامنة' : 'Online - Ready') : (isArabic ? 'غير متصل - حفظ محلي' : 'Offline Mode')}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">{isArabic ? 'العمليات المعلقة' : 'Pending Operations'}</span>
              <span className="font-mono font-bold text-white text-sm">
                {syncQueue.length} {isArabic ? 'عملية' : 'items'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block">{isArabic ? 'آخر مزامنة ناجحة' : 'Last Synced'}</span>
              <span className="font-mono font-semibold text-slate-300 text-xs">
                {lastSyncTime || (isArabic ? 'تلقائية بالخلفية' : 'Background Auto')}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Operations Queue List */}
        <div className="p-5 text-xs space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">
              {isArabic ? 'قائمة العمليات المعلقة للمزامنة:' : 'Queued Offline Operations:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddDemoSyncItem}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>{isArabic ? 'تجربة إضافة سجل محلي' : '+ Add Test Local Record'}</span>
              </button>
            </div>
          </div>

          {syncQueue.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">
                {isArabic ? 'كافة البيانات متزامنة بالكامل مع الخادم' : 'All Local Data Fully Synced with Server'}
              </h4>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                {isArabic
                  ? 'لا توجد عمليات تعديل أو إدخال معلقة في طابور الانتظار المحلي حالياً.'
                  : 'There are no pending local creation or edit operations queued for synchronization.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {syncQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{getActionBadge(item.action)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {item.recordRid && (
                          <span className="font-mono text-cyan-300 font-bold text-[11px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800">
                            {item.recordRid}
                          </span>
                        )}
                        <h5 className="font-semibold text-white truncate text-xs">{item.title}</h5>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{item.department}</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US')}</span>
                        {item.status === 'Syncing' && (
                          <span className="text-cyan-400 font-bold flex items-center gap-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            {isArabic ? 'جاري المزامنة...' : 'Syncing...'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors shrink-0"
                    title={isArabic ? 'إلغاء العملية' : 'Remove queued action'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          {syncQueue.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isArabic ? 'مسح السجل' : 'Clear Queue'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </button>

            <button
              onClick={handleManualSync}
              disabled={isSyncing || syncQueue.length === 0}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all ${
                isSyncing || syncQueue.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white cursor-pointer shadow-cyan-600/30'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? isArabic ? 'جاري المزامنة...' : 'Syncing in Progress...'
                  : isArabic ? '⚡ إعادة المزامنة الآن (Retry Sync)' : '⚡ Retry Sync Now'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
