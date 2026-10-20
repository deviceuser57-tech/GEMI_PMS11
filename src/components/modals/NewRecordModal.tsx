import React, { useState } from 'react';
import { BaseRecord, EntityType } from '../../types/pms';
import { X, Users, Plane, Bed, GitBranch, Layers, Award } from 'lucide-react';
import { CrewProfileForm } from '../forms/CrewProfileForm';
import { ManningPlanForm } from '../forms/ManningPlanForm';
import { InspectionCheckForm } from '../forms/InspectionCheckForm';
import { DependencyForm } from '../forms/DependencyForm';
import { GenericRecordForm } from '../forms/GenericRecordForm';

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEntity?: EntityType;
  defaultWps?: string;
  initialRecord?: BaseRecord;
  availableRoles: BaseRecord[];
  availableWps: BaseRecord[];
  allRecords: BaseRecord[];
  onSave: (record: BaseRecord, secondRecord?: BaseRecord) => void;
  isArabic: boolean;
}

export const NewRecordModal: React.FC<NewRecordModalProps> = ({
  isOpen,
  onClose,
  defaultEntity = 'task',
  defaultWps,
  initialRecord,
  availableRoles,
  availableWps,
  allRecords,
  onSave,
  isArabic
}) => {
  if (!isOpen) return null;

  // Determine active form type based on entity
  const determineInitialForm = (): 'crew' | 'manning' | 'inspection' | 'dependency' | 'generic' => {
    const e = initialRecord?.entity || defaultEntity;
    if (e === 'crew_member' || e === 'crew_certificate') return 'crew';
    if (e === 'manning_plan') return 'manning';
    if (e === 'helideck_check' || e === 'accommodation_check') return 'inspection';
    if (e === 'dependency') return 'dependency';
    return 'generic';
  };

  const [formType, setFormType] = useState<'crew' | 'manning' | 'inspection' | 'dependency' | 'generic'>(
    determineInitialForm()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">
              {initialRecord
                ? isArabic ? `تعديل السجل [${initialRecord.rid}]` : `Edit Record [${initialRecord.rid}]`
                : isArabic ? 'إنشاء وتسجيل إدخال جديد' : 'New Operational Record Entry'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Selector Tabs (Only shown when creating new, not editing) */}
        {!initialRecord && (
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFormType('crew')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                formType === 'crew'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isArabic ? 'الطاقم والشهادات (WPS-23)' : 'Crew & Cert (WPS-23)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFormType('manning')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                formType === 'manning'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isArabic ? 'خطة المانينج (Safe Manning)' : 'Manning Plan'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFormType('inspection')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                formType === 'inspection'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تفتيش المهبط / الإقامة' : 'Helideck / Accom Check'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFormType('dependency')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                formType === 'dependency'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{isArabic ? 'رابط الاعتمادية (Precedence)' : 'Dependency Linker'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFormType('generic')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                formType === 'generic'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isArabic ? 'سجل تشغيلي عام' : 'Generic Record (Tasks/Rules)'}</span>
            </button>
          </div>
        )}

        {/* Selected Form Component */}
        <div className="p-6">
          {formType === 'crew' && (
            <CrewProfileForm
              initialRecord={initialRecord}
              availableRoles={availableRoles}
              onSave={(rec, cert) => {
                onSave(rec, cert);
                onClose();
              }}
              onCancel={onClose}
              isArabic={isArabic}
            />
          )}

          {formType === 'manning' && (
            <ManningPlanForm
              initialRecord={initialRecord}
              availableRoles={availableRoles}
              onSave={rec => {
                onSave(rec);
                onClose();
              }}
              onCancel={onClose}
              isArabic={isArabic}
            />
          )}

          {formType === 'inspection' && (
            <InspectionCheckForm
              initialRecord={initialRecord}
              defaultFacility={defaultEntity === 'accommodation_check' ? 'Accommodation' : 'Helideck'}
              onSave={(rec, capa) => {
                onSave(rec, capa);
                onClose();
              }}
              onCancel={onClose}
              isArabic={isArabic}
            />
          )}

          {formType === 'dependency' && (
            <DependencyForm
              initialRecord={initialRecord}
              availableRecords={allRecords}
              onSave={rec => {
                onSave(rec);
                onClose();
              }}
              onCancel={onClose}
              isArabic={isArabic}
            />
          )}

          {formType === 'generic' && (
            <GenericRecordForm
              initialRecord={initialRecord}
              defaultEntity={defaultEntity}
              availableWps={availableWps}
              onSave={rec => {
                onSave(rec);
                onClose();
              }}
              onCancel={onClose}
              isArabic={isArabic}
            />
          )}
        </div>
      </div>
    </div>
  );
};
