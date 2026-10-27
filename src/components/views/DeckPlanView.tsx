import React, { useState, useMemo } from 'react';
import { BaseRecord, Department } from '../../types/pms';
import { getStoredDocuments } from '../../lib/documentRepository';
import {
  MapPin,
  Layers,
  Plus,
  X,
  Search,
  Filter,
  Eye,
  QrCode,
  ShieldCheck,
  Plane,
  Anchor,
  Bed,
  Flame,
  Activity,
  AlertTriangle,
  Move,
  CheckCircle2,
  Compass,
  Zap,
  Crosshair,
  BookOpen,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';

interface DeckPlanViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onSelectRecord: (record: BaseRecord) => void;
  onShowQrModal: (record: BaseRecord) => void;
  onUpdateRecord: (updatedRecord: BaseRecord) => void;
}

export type DeckLevel = '01_main_deck' | '02_accommodation' | '03_machinery';

interface ZoneHotspot {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  deck_level: DeckLevel;
  svgPolygon: string; // Polygon points for vector hotspot highlight
  badgeX: number;
  badgeY: number;
  department: Department;
  status: 'Operational' | 'High Readiness' | 'Under Maintenance' | 'Action Required';
  linkedDocCode?: string;
  descriptionEnglish: string;
  descriptionArabic: string;
}

export const DeckPlanView: React.FC<DeckPlanViewProps> = ({
  records,
  isArabic,
  onSelectRecord,
  onShowQrModal,
  onUpdateRecord
}) => {
  const [activeDeck, setActiveDeck] = useState<DeckLevel>('01_main_deck');
  const [selectedPinRecord, setSelectedPinRecord] = useState<BaseRecord | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<ZoneHotspot | null>(null);
  const [pinningModeRecord, setPinningModeRecord] = useState<BaseRecord | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useGsapPageReveal();

  // Defined Hotspots for PMS-11 Barge Equipment & Zones
  const HOTSPOTS: ZoneHotspot[] = [
    {
      id: 'helideck_zone',
      nameEnglish: 'Helideck ECAR 138 Landing Platform',
      nameArabic: 'مهبط الطائرات المعتمد (ECAR 138 / ECAA)',
      deck_level: '01_main_deck',
      svgPolygon: '120,150 250,150 250,400 120,400',
      badgeX: 185,
      badgeY: 135,
      department: 'Aviation & Helideck',
      status: 'Operational',
      linkedDocCode: 'ECAR-138-HELI',
      descriptionEnglish: 'D-Value 22.2m octagonal helideck with ECAA ECAR Part 138 DIFFS foam cannons, friction mesh, and perimeter lighting.',
      descriptionArabic: 'منصة هبوط المروحيات قطر 22.2m معتمدة رسمياً طبقاً لسلطة الطيران المدني المصري ECAA (ECAR Part 138) مجهزة بمدافع الفوم DIFFS وشبكة مانعة للانزلاق وإضاءة المحيط.'
    },
    {
      id: 'crane_zone',
      nameEnglish: '800T Heavy Lift Crane & Tub Foundation',
      nameArabic: 'الرافعة الثقيلة 800 طن والقاعدة الدوارة',
      deck_level: '01_main_deck',
      svgPolygon: '830,180 1000,180 1000,380 830,380',
      badgeX: 915,
      badgeY: 165,
      department: 'Technical & Maintenance',
      status: 'High Readiness',
      linkedDocCode: 'DNV-ARC-1976',
      descriptionEnglish: '800T revolving main crane tub, lattice boom, UT thickness verified foundation, and 100T aux crane.',
      descriptionArabic: 'قاعدة الرافعة 800 طن الموثقة مسح السماكات UT مع ذراع الرافعة والرافعة المساعدة 100 طن.'
    },
    {
      id: 'pipelay_zone',
      nameEnglish: 'Pipelay Firing Line & Tensioners 1 & 2',
      nameArabic: 'خط تمديد الأنابيب والشدادات 1 و 2',
      deck_level: '01_main_deck',
      svgPolygon: '320,230 750,230 750,320 320,320',
      badgeX: 535,
      badgeY: 220,
      department: 'Pipelay Operations',
      status: 'Operational',
      linkedDocCode: 'WPS-PIPELAY-SPEC-2026',
      descriptionEnglish: 'Line-up tensioners 120T pull force, automatic welding stations 1-4, 100% NDT X-ray darkroom, roller track.',
      descriptionArabic: 'شدادات بقوة 120 طناً، محطات اللحام الآلي 1-4، وغرفة الفحص بالأشعة X-Ray بنسبة 100%.'
    },
    {
      id: 'moonpool_zone',
      nameEnglish: '300M Saturation Diving & Moonpool Complex',
      nameArabic: 'مجمع الغوص العميق 300m والـ Moonpool',
      deck_level: '01_main_deck',
      svgPolygon: '580,340 730,340 730,440 580,440',
      badgeX: 655,
      badgeY: 330,
      department: 'Diving Operations',
      status: 'Action Required',
      linkedDocCode: 'DNV-ARC-1976',
      descriptionEnglish: 'Moonpool 8m x 6m aperture, 300m SAT diving bell davit, hyperbaric decompression chamber, dive gas quads.',
      descriptionArabic: 'فتحة الـ Moonpool مع جرس الغوص العميق 300m، غرف إزالة الضغط، وأسطوانات غازات الغوص.'
    },
    {
      id: 'bridge_zone',
      nameEnglish: 'Navigation Bridge & DP-2 Control Wheelhouse',
      nameArabic: 'برج القيادة والتحكم الملاحي DP-2',
      deck_level: '02_accommodation',
      svgPolygon: '720,120 950,120 950,430 720,430',
      badgeX: 835,
      badgeY: 105,
      department: 'Marine',
      status: 'Operational',
      linkedDocCode: 'PMS11-STABILITY-MANUAL',
      descriptionEnglish: 'DP-2 dynamic positioning consoles, ECDIS displays, navigation radar antennas, and emergency vessel stop.',
      descriptionArabic: 'منصات التوجيه الديناميكي DP-2، شاشات الملاحة ECDIS، ورادار الملاحة والسيطرة البحرية.'
    },
    {
      id: 'quarters_zone',
      nameEnglish: '250 Berth Quarters & Mess Hall Complex',
      nameArabic: 'كبائن التسكين 250 سريراً وصالة الطعام',
      deck_level: '02_accommodation',
      svgPolygon: '380,130 700,130 700,420 380,420',
      badgeX: 540,
      badgeY: 115,
      department: 'Catering & Accommodation',
      status: 'High Readiness',
      linkedDocCode: 'SOLAS-CH2-FIRE',
      descriptionEnglish: 'MLC 2006 compliant living quarters for 250 crew members, mess hall, galley, and emergency fire dampers.',
      descriptionArabic: 'كبائن التسكين المعتمدة لـ 250 فرداً وفق MLC 2006، صالة الطعام، ومخمدات الحريق اللحظية.'
    },
    {
      id: 'engine_zone',
      nameEnglish: 'Main Engine Room & Generators 1-4',
      nameArabic: 'غرفة المحركات الرئيسية والمولدات 1-4',
      deck_level: '03_machinery',
      svgPolygon: '340,130 760,130 760,420 340,420',
      badgeX: 550,
      badgeY: 115,
      department: 'Technical & Maintenance',
      status: 'Operational',
      linkedDocCode: 'SOLAS-CH2-FIRE',
      descriptionEnglish: 'Main diesel engine room housing GenSets 1-4, fixed CO2 fire extinguishing system, main electrical switchboard.',
      descriptionArabic: 'غرفة الديزل المجهزة بالمولدات 1-4، نظام إطفاء CO2 الثابت، ولوحة التوزيع الكهربائية الرئيسية.'
    }
  ];

  // Pre-seed mock coordinates
  const recordsWithDeckData = useMemo(() => {
    return records.map((record, index) => {
      if (record.data?.deck_location) return record;

      let deck: DeckLevel = '01_main_deck';
      let x = 20 + ((index * 17) % 60);
      let y = 25 + ((index * 23) % 50);

      if (record.entity === 'helideck_profile' || record.entity === 'helideck_check') {
        deck = '01_main_deck';
        x = 18;
        y = 28;
      } else if (record.entity === 'accommodation_capacity' || record.entity === 'accommodation_check') {
        deck = '02_accommodation';
        x = 78;
        y = 48;
      } else if (record.department === 'Technical & Maintenance' || record.title.toLowerCase().includes('engine')) {
        deck = '03_machinery';
        x = 52;
        y = 52;
      } else if (record.department === 'Diving Operations') {
        deck = '01_main_deck';
        x = 56;
        y = 68;
      } else if (record.department === 'Pipelay Operations') {
        deck = '01_main_deck';
        x = 48;
        y = 42;
      }

      return {
        ...record,
        data: {
          ...record.data,
          deck_location: {
            deck_level: deck,
            x,
            y
          }
        }
      };
    });
  }, [records]);

  // Active Deck Records
  const activeDeckRecords = useMemo(() => {
    return recordsWithDeckData.filter(r => {
      const loc = r.data?.deck_location;
      if (!loc || loc.deck_level !== activeDeck) return false;
      if (departmentFilter !== 'All' && r.department !== departmentFilter) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (
        searchQuery &&
        !r.rid.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [recordsWithDeckData, activeDeck, departmentFilter, statusFilter, searchQuery]);

  // Unpinned Records
  const availableToPinRecords = useMemo(() => {
    return recordsWithDeckData.filter(r => {
      const loc = r.data?.deck_location;
      return !loc || loc.deck_level !== activeDeck;
    }).slice(0, 15);
  }, [recordsWithDeckData, activeDeck]);

  // Filter Hotspots for active deck
  const activeDeckHotspots = useMemo(() => {
    return HOTSPOTS.filter(h => h.deck_level === activeDeck);
  }, [activeDeck]);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!pinningModeRecord) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const updated: BaseRecord = {
      ...pinningModeRecord,
      updated_at: new Date().toISOString(),
      data: {
        ...pinningModeRecord.data,
        deck_location: {
          deck_level: activeDeck,
          x: Math.max(5, Math.min(95, xPct)),
          y: Math.max(5, Math.min(95, yPct))
        }
      }
    };

    onUpdateRecord(updated);
    setPinningModeRecord(null);
    setSelectedPinRecord(updated);
  };

  const getPinColor = (status: string) => {
    switch (status) {
      case 'Compliant':
      case 'Approved':
      case 'Verified':
        return '#10b981'; // Green
      case 'In Progress':
      case 'Under Review':
        return '#06b6d4'; // Cyan
      case 'Non-Compliant':
      case 'Overdue':
        return '#f43f5e'; // Red
      default:
        return '#f59e0b'; // Amber
    }
  };

  // Find records pinned to the selected hotspot zone
  const hotspotPinnedRecords = useMemo(() => {
    if (!selectedHotspot) return [];
    return activeDeckRecords.filter(r => r.department === selectedHotspot.department || r.entity === 'wps');
  }, [selectedHotspot, activeDeckRecords]);

  // Find documents linked to selected hotspot zone
  const hotspotDocuments = useMemo(() => {
    if (!selectedHotspot) return [];
    const allDocs = getStoredDocuments();
    return allDocs.filter(d => d.document_code === selectedHotspot.linkedDocCode || d.department === selectedHotspot.department);
  }, [selectedHotspot]);

  return (
    <div className="space-y-6 gsap-card">
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>{isArabic ? 'المخطط الهندسي ذو الطبقات ونقاط الاتصال الحية (Layered SVG CAD Blueprint)' : 'PMS-11 Layered SVG CAD Blueprint with Interactive Hotspots'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  LAYERED HOTSPOTS
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? 'مسقط ثلاثي الطبقات مع مناطق حية تفاعلية (Hotspots) للانتقال المباشر للمعدات واستعراض وثائق الامتثال'
                  : 'Layered top-down schematic with interactive hotspots for deck zones, safety standards, and pinned records'}
              </p>
            </div>
          </div>
        </div>

        {/* Deck Level Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => { setActiveDeck('01_main_deck'); setSelectedPinRecord(null); setSelectedHotspot(null); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeDeck === '01_main_deck'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>{isArabic ? '01 السطح الرئيسي للعمليات' : '01 Main Ops Deck'}</span>
          </button>

          <button
            onClick={() => { setActiveDeck('02_accommodation'); setSelectedPinRecord(null); setSelectedHotspot(null); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeDeck === '02_accommodation'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>{isArabic ? '02 سطح الإقامة والقيادة' : '02 Accommodation Deck'}</span>
          </button>

          <button
            onClick={() => { setActiveDeck('03_machinery'); setSelectedPinRecord(null); setSelectedHotspot(null); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeDeck === '03_machinery'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isArabic ? '03 سطح الآلات والمحركات' : '03 Machinery Deck'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Layered SVG Canvas (3 Cols) + Side Control Drawer (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Layered SVG Blueprint Canvas (3 Columns) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 flex flex-col relative overflow-hidden">
          {/* CAD Filters & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                {isArabic ? 'فلاتر الخريطة:' : 'Map Filters:'}
              </span>

              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="All">{isArabic ? 'جميع الأقسام' : 'All Departments'}</option>
                <option value="Marine">Marine</option>
                <option value="Technical & Maintenance">Technical & Maintenance</option>
                <option value="HSE & Safety">HSE & Safety</option>
                <option value="Diving Operations">Diving Operations</option>
                <option value="Pipelay Operations">Pipelay Operations</option>
                <option value="Aviation & Helideck">Aviation & Helideck</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="All">{isArabic ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="Compliant">Compliant / Approved</option>
                <option value="In Progress">In Progress</option>
                <option value="OPEN">OPEN / Draft</option>
                <option value="Non-Compliant">Non-Compliant / Overdue</option>
              </select>
            </div>

            {/* Hotspots Active Count Overlay */}
            <div className="flex items-center gap-3 text-[11px] font-mono font-semibold text-slate-400">
              <span className="text-cyan-300">INTERACTIVE HOTSPOTS: {activeDeckHotspots.length} ZONES</span>
              <span>•</span>
              <span className="text-emerald-400">PINNED RECORDS: {activeDeckRecords.length}</span>
            </div>
          </div>

          {/* LAYERED SVG BLUEPRINT CANVAS */}
          <div className="relative bg-slate-950 rounded-2xl border-2 border-slate-800 p-4 min-h-[520px] flex items-center justify-center overflow-hidden shadow-inner select-none">
            {/* Background CAD Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-25 pointer-events-none" />

            <svg
              viewBox="0 0 1100 550"
              className="w-full h-auto max-h-[600px] cursor-crosshair transition-all"
              onClick={handleMapClick}
            >
              <defs>
                <linearGradient id="cadHullGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0b1329" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#111c3a" stopOpacity="0.98" />
                  <stop offset="100%" stopColor="#0b1329" stopOpacity="0.95" />
                </linearGradient>

                <radialGradient id="cadHelideck" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                  <stop offset="80%" stopColor="#0369a1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
                </radialGradient>

                <filter id="hudGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* LAYER 1: HULL ENVELOPE & CAD METRIC SCALE RULERS */}
              <g stroke="#334155" strokeWidth="1">
                <line x1="100" y1="35" x2="1000" y2="35" />
                {Array.from({ length: 13 }).map((_, i) => (
                  <g key={i} transform={`translate(${100 + i * 75}, 35)`}>
                    <line x1="0" y1="-5" x2="0" y2="5" />
                    <text x="0" y="-8" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">{i * 10}m</text>
                  </g>
                ))}
                <line x1="80" y1="275" x2="1020" y2="275" stroke="#0284c7" strokeWidth="1" strokeDasharray="12 6" />
                <text x="50" y="278" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">C/L</text>
              </g>

              {/* Hull Outline */}
              <path
                d="M 100 275 L 180 85 L 940 85 Q 1000 85 1010 165 L 1010 385 Q 1000 465 940 465 L 180 465 Z"
                fill="url(#cadHullGrad)"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />

              {/* LAYER 2: DECK EQUIPMENT VECTOR LAYOUT */}
              {activeDeck === '01_main_deck' && (
                <g>
                  {/* Helideck */}
                  <polygon points="120,150 250,150 250,400 120,400" fill="url(#cadHelideck)" stroke="#0284c7" strokeWidth="2" />
                  <circle cx="185" cy="275" r="90" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="8 4" />
                  <circle cx="185" cy="275" r="80" fill="none" stroke="#eab308" strokeWidth="1.5" />
                  <text x="185" y="290" textAnchor="middle" fill="#ffffff" fontSize="42" fontWeight="black" fontFamily="sans-serif">H</text>

                  {/* 800T Heavy Crane */}
                  <circle cx="910" cy="275" r="70" fill="#0f172a" stroke="#eab308" strokeWidth="3" />
                  <line x1="910" y1="275" x2="680" y2="200" stroke="#eab308" strokeWidth="7" strokeLinecap="round" />
                  <text x="910" y="280" textAnchor="middle" fill="#eab308" fontSize="12" fontWeight="black" fontFamily="monospace">800T CRANE</text>

                  {/* Pipelay Tensioners */}
                  <rect x="320" y="235" width="420" height="80" fill="#0b1329" stroke="#06b6d4" strokeWidth="2" rx="8" />
                  <text x="530" y="280" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="extrabold">PIPELAY TENSIONERS & WELDING LINE</text>

                  {/* Moonpool & Sat Diving */}
                  <rect x="580" y="340" width="150" height="100" fill="#0284c7" fillOpacity="0.2" stroke="#0284c7" strokeWidth="2" rx="10" />
                  <text x="655" y="395" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">MOONPOOL 8m x 6m</text>
                </g>
              )}

              {activeDeck === '02_accommodation' && (
                <g>
                  {/* Bridge */}
                  <polygon points="720,120 950,120 950,430 720,430" fill="#0369a1" fillOpacity="0.25" stroke="#0284c7" strokeWidth="2.5" />
                  <text x="835" y="150" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="black">NAVIGATION BRIDGE & DP-2</text>

                  {/* 250 Berth Quarters */}
                  <rect x="380" y="130" width="320" height="290" fill="#0f172a" stroke="#475569" strokeWidth="2" rx="12" />
                  <text x="540" y="275" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="extrabold">CREW CABINS & MESS (250 BERTHS)</text>
                </g>
              )}

              {activeDeck === '03_machinery' && (
                <g>
                  {/* Main Engine Room */}
                  <rect x="340" y="130" width="420" height="290" fill="#7c2d12" fillOpacity="0.25" stroke="#ea580c" strokeWidth="2.5" rx="14" />
                  <text x="550" y="275" textAnchor="middle" fill="#fb923c" fontSize="14" fontWeight="black">MAIN DIESEL ENGINE ROOM (GENS 1-4)</text>
                </g>
              )}

              {/* LAYER 3: INTERACTIVE ZONE HOTSPOTS OVERLAY */}
              {activeDeckHotspots.map(hs => {
                const isSelected = selectedHotspot?.id === hs.id;

                return (
                  <g
                    key={hs.id}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspot(hs);
                      setSelectedPinRecord(null);
                    }}
                  >
                    {/* Hotspot Highlight Polygon */}
                    <polygon
                      points={hs.svgPolygon}
                      fill={isSelected ? '#06b6d4' : '#0284c7'}
                      fillOpacity={isSelected ? '0.4' : '0.15'}
                      stroke={isSelected ? '#ffffff' : '#38bdf8'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                      strokeDasharray="6 3"
                      className="transition-all duration-200 group-hover:fill-opacity-30"
                    />

                    {/* Hotspot Zone Badge Button */}
                    <g transform={`translate(${hs.badgeX}, ${hs.badgeY})`}>
                      <rect
                        x="-70"
                        y="-12"
                        width="140"
                        height="24"
                        rx="6"
                        fill="#020617"
                        fillOpacity="0.95"
                        stroke={isSelected ? '#ffffff' : '#06b6d4'}
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        ⚡ {hs.nameEnglish.slice(0, 18)}..
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* LAYER 4: PINNED RECORDS AS ANIMATED HUD TARGET MARKERS */}
              {activeDeckRecords.map(record => {
                const loc = record.data?.deck_location;
                if (!loc) return null;

                const cx = (loc.x / 100) * 1100;
                const cy = (loc.y / 100) * 550;
                const isSelected = selectedPinRecord?.id === record.id;
                const pinColor = getPinColor(record.status);

                return (
                  <g
                    key={record.id}
                    transform={`translate(${cx}, ${cy})`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPinRecord(record);
                      setSelectedHotspot(null);
                    }}
                  >
                    <circle
                      r={isSelected ? "24" : "18"}
                      fill={pinColor}
                      fillOpacity="0.25"
                      className="animate-ping origin-center"
                    />

                    <circle
                      r={isSelected ? "20" : "15"}
                      fill={pinColor}
                      fillOpacity="0.4"
                      stroke={isSelected ? "#ffffff" : pinColor}
                      strokeWidth={isSelected ? "3" : "1.5"}
                      filter="url(#hudGlow)"
                    />

                    <circle
                      r="9"
                      fill={pinColor}
                      stroke="#020617"
                      strokeWidth="2.5"
                    />

                    <rect
                      x="-38"
                      y="-34"
                      width="76"
                      height="20"
                      rx="5"
                      fill="#020617"
                      fillOpacity="0.95"
                      stroke={pinColor}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="-20"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="black"
                      fontFamily="monospace"
                    >
                      {record.rid}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Side Panel: Hotspot Zone Inspection or Pin Details or Drawer (1 Column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5 flex flex-col h-full">
          {selectedHotspot ? (
            /* Selected Zone Hotspot Inspection Menu */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  {selectedHotspot.id.toUpperCase()}
                </span>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white leading-snug">
                  {isArabic ? selectedHotspot.nameArabic : selectedHotspot.nameEnglish}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {isArabic ? selectedHotspot.descriptionArabic : selectedHotspot.descriptionEnglish}
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isArabic ? 'حالة المنطقة:' : 'Zone Status:'}</span>
                  <span className="font-bold text-emerald-400 font-mono text-[11px]">
                    {selectedHotspot.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isArabic ? 'القسم المسؤول:' : 'Managing Dept:'}</span>
                  <span className="font-semibold text-slate-200">{selectedHotspot.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isArabic ? 'السجلات المثبتة بالمنطقة:' : 'Pinned Items:'}</span>
                  <span className="font-mono text-cyan-300 font-bold">{hotspotPinnedRecords.length} Items</span>
                </div>
              </div>

              {/* Linked Compliance Document Card */}
              {hotspotDocuments.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {isArabic ? 'الوثائق الفنية والمعايير المربوطة بالمنطقة:' : 'Linked Zone Technical Standards:'}
                  </span>
                  {hotspotDocuments.map(doc => (
                    <div key={doc.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-300 text-[10px]">{doc.document_code}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{doc.revision}</span>
                      </div>
                      <p className="font-bold text-slate-200 text-[11px] line-clamp-1">{doc.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : selectedPinRecord ? (
            /* Selected Pin Record Details Panel */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {selectedPinRecord.rid}
                </span>
                <button
                  onClick={() => setSelectedPinRecord(null)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white leading-snug">
                  {selectedPinRecord.title}
                </h3>
                {selectedPinRecord.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                    {selectedPinRecord.description}
                  </p>
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isArabic ? 'القسم:' : 'Department:'}</span>
                  <span className="font-semibold text-slate-200">{selectedPinRecord.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isArabic ? 'الحالة:' : 'Status:'}</span>
                  <span className="font-bold text-cyan-300 font-mono text-[11px]">
                    {selectedPinRecord.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onSelectRecord(selectedPinRecord)}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isArabic ? 'فتح تفاصيل السجل الكاملة' : 'View Full Record'}</span>
                </button>

                <button
                  onClick={() => onShowQrModal(selectedPinRecord)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isArabic ? 'استخراج بطاقة رمز QR' : 'Generate Rig QR Tag'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unselected Default State / Unpinned Tray */
            <div className="space-y-4 flex flex-col h-full">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{isArabic ? 'سجلات جاهزة للتثبيت' : 'Records Ready to Pin'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isArabic ? 'اختر سجلاً أو انقر على منطقة حيّة بالخريطة لاستكشافها' : 'Select a record to drop pin or click a hotspot zone'}
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'بحث بالسجل أو الكود...' : 'Search records...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[400px] custom-scrollbar pr-1 flex-1">
                {availableToPinRecords.map(rec => (
                  <div
                    key={rec.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-cyan-800 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {rec.rid}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {rec.department}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                      {rec.title}
                    </p>

                    <button
                      onClick={() => setPinningModeRecord(rec)}
                      className="w-full py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'تثبيت على الخريطة' : 'Pin to CAD Deck Map'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
