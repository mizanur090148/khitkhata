import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { bnNum } from '@/utils/formatters';
import { QrCodeSvg } from '@/components/common/QrCodeSvg';
import {
  Search,
  ChevronDown,
  Check,
  X,
  Building2,
  Printer,
  QrCode,
  Edit3,
  Save,
  Plus,
  Layers,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

// The exact 16 faults from KnitKhata.html
const FAULTS = [
  'Hole',
  'Needle Mark',
  'Needle Broken',
  'Oil Spot',
  'Ink Spot',
  'Star Mark',
  'Lycra Out',
  'Patta (Barre)',
  'Missing Yarn',
  'Shade Up',
  'Yarn Fault',
  'Y/D Design',
  'Foreign Fiber',
  'Slab Yarn',
  'Thick Thin',
  'Sinker Mark',
];

interface OrderLineNormalized {
  place: string;
  fab: string;
  color: string;
  qty: number;
  done: number;
  dia: string;
  kt: 'c' | 'f';
  yd: boolean;
  unit: string;
  machines: string[];
  yarns: Array<{ count?: string; brand?: string; lot?: string; pct?: string }>;
}

function normalizeOrderLines(o: any): OrderLineNormalized[] {
  if (!o) return [];
  if (!o.lines || !o.lines.length) {
    return [
      {
        place: 'Body',
        fab: o.fabric || 'Single Jersey',
        color: o.color || '—',
        qty: Number(o.qty || o.totalKg || 0),
        done: Number(o.done || 0),
        dia: o.dia || '30" × 24G',
        kt: 'c',
        yd: false,
        unit: 'kg',
        machines: Array.isArray(o.machines) && o.machines.length ? o.machines : ['M-01'],
        yarns: [],
      },
    ];
  }

  return o.lines.map((l: any, i: number) => {
    let machinesList: string[] = [];
    if (Array.isArray(l.machines)) {
      machinesList = l.machines;
    } else if (typeof l.machine === 'string') {
      machinesList = l.machine.split(',').map((m: string) => m.trim()).filter(Boolean);
    }
    if (!machinesList.length) machinesList = ['M-01'];

    return {
      place: l.place || l.placement || (i === 0 ? 'Body' : `অংশ ${i + 1}`),
      fab: l.fab || l.fabrication || l.fabric || 'Single Jersey',
      color: l.color || o.color || '—',
      qty: Number(l.qty || l.orderKg || 0),
      done: Number(l.done || l.knitKg || 0),
      dia: l.dia || l.dia_gauge || o.dia || '30" × 24G',
      kt: (l.kt || l.knit_type || 'c') as 'c' | 'f',
      yd: Boolean(l.yd || l.is_yarn_dyed),
      unit: l.unit || 'kg',
      machines: machinesList,
      yarns: Array.isArray(l.yarns) ? l.yarns : [],
    };
  });
}

function parseNum(val: any): number {
  if (val == null || val === '') return 0;
  const cleaned = String(val).replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

export const FactoryJobCardPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: paramOrderId } = useParams<{ id?: string }>();
  const {
    role,
    orders,
    parties,
    rolls,
    prodLogs,
    factoryProfile,
    fetchRolls,
    saveJobCardGrid,
    fetchOrders,
    addToast,
  } = useApp();

  const isVendor = role === 'vendor' || (role as string) === 'ven';

  // Load fresh orders and rolls on mount
  useEffect(() => {
    fetchOrders?.();
    fetchRolls?.();
  }, []);

  // Filter orders with machines assigned (isolated to vendor when in vendor view)
  const validOrders = useMemo(() => {
    const list = orders.filter((o) => {
      if (isVendor) {
        const isBelongsToVendor =
          o.party_code === 'abc' ||
          o.party === 'abc' ||
          o.v === 'abc' ||
          (o.party && o.party.includes('ABC'));
        if (!isBelongsToVendor) return false;
      }
      const isNotDone = (o.status as string) !== 'done' && o.status !== 'Completed';
      const lines = normalizeOrderLines(o);
      const hasMachines = lines.some((l) => (l.machines || []).length > 0);
      return isNotDone && hasMachines;
    });
    return list.length > 0 ? list : orders;
  }, [orders, isVendor]);

  // Selected Order State
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    if (paramOrderId && orders.some((o) => o.id === paramOrderId)) return paramOrderId;
    return validOrders[0]?.id || orders[0]?.id || '';
  });

  // Keep selectedOrderId in sync with route params or list
  useEffect(() => {
    if (paramOrderId && orders.some((o) => o.id === paramOrderId)) {
      setSelectedOrderId(paramOrderId);
    } else if (!validOrders.some((o) => o.id === selectedOrderId) && validOrders[0]) {
      setSelectedOrderId(validOrders[0].id);
    }
  }, [paramOrderId, validOrders, orders]);

  const activeOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || validOrders[0] || orders[0];
  }, [orders, validOrders, selectedOrderId]);

  // Searchable Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'completed'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside or Esc key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Status badge helper
  const getOrderStatusBadge = (status?: string) => {
    const st = String(status || '').toLowerCase();
    if (st === 'running' || st === 'run') {
      return { label: 'চলছে', className: 'p-acc' };
    }
    if (st === 'completed' || st === 'done' || st === 'delivered') {
      return { label: 'সম্পন্ন', className: 'p-ok' };
    }
    if (st === 'pending' || st === 'wait') {
      return { label: 'অপেক্ষায়', className: 'p-warn' };
    }
    return { label: status || 'অন্যান্য', className: 'p-idle' };
  };

  // Orders count for dropdown tabs
  const orderCounts = useMemo(() => {
    const baseList = isVendor
      ? orders.filter(
          (o) =>
            o.party_code === 'abc' ||
            o.party === 'abc' ||
            o.v === 'abc' ||
            (o.party && o.party.includes('ABC'))
        )
      : orders;
    const runningCount = baseList.filter((o) => {
      const st = String(o.status || '').toLowerCase();
      return st === 'running' || st === 'run';
    }).length;
    const completedCount = baseList.filter((o) => {
      const st = String(o.status || '').toLowerCase();
      return st === 'completed' || st === 'done' || st === 'delivered';
    }).length;
    return { all: baseList.length, running: runningCount, completed: completedCount };
  }, [orders, isVendor]);

  // Filtered orders in dropdown
  const filteredDropdownOrders = useMemo(() => {
    let list = orders;
    if (isVendor) {
      list = list.filter((o) => {
        return (
          o.party_code === 'abc' ||
          o.party === 'abc' ||
          o.v === 'abc' ||
          (o.party && o.party.includes('ABC'))
        );
      });
    }

    if (statusFilter === 'running') {
      list = list.filter((o) => {
        const st = String(o.status || '').toLowerCase();
        return st === 'running' || st === 'run';
      });
    } else if (statusFilter === 'completed') {
      list = list.filter((o) => {
        const st = String(o.status || '').toLowerCase();
        return st === 'completed' || st === 'done' || st === 'delivered';
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((o) => {
        const idMatch = String(o.id || '').toLowerCase().includes(q);
        const partyMatch = String(o.party || '').toLowerCase().includes(q);
        const buyerMatch = String(o.buyer || '').toLowerCase().includes(q);
        const fabricMatch = String(o.fabric || '').toLowerCase().includes(q);
        const styleMatch = String(o.style || '').toLowerCase().includes(q);
        const machineMatch = (o.machines || []).some((m: string) => m.toLowerCase().includes(q));
        return idMatch || partyMatch || buyerMatch || fabricMatch || styleMatch || machineMatch;
      });
    }

    return list;
  }, [orders, isVendor, statusFilter, searchTerm]);

  // Normalized order lines
  const lines = useMemo(() => normalizeOrderLines(activeOrder), [activeOrder]);

  // Flattened machines with line index
  const ms = useMemo(() => {
    return lines.flatMap((l, i) => (l.machines || []).map((m) => ({ m, i })));
  }, [lines]);

  // Selected Machine State
  const [selectedMachine, setSelectedMachine] = useState<string>('');

  useEffect(() => {
    if (!ms.some((x) => x.m === selectedMachine) && ms[0]) {
      setSelectedMachine(ms[0].m);
    }
  }, [ms, selectedMachine]);

  const curMachine = useMemo(() => {
    return ms.find((x) => x.m === selectedMachine) || ms[0] || { m: 'M-01', i: 0 };
  }, [ms, selectedMachine]);

  // Fetch rolls whenever active order or machine changes
  useEffect(() => {
    if (activeOrder?.id && curMachine?.m) {
      fetchRolls?.(activeOrder.id, curMachine.m);
    }
  }, [activeOrder?.id, curMachine?.m]);

  const curLine = lines[curMachine.i] || lines[0] || {
    place: 'Body',
    fab: 'Single Jersey',
    color: '—',
    qty: 0,
    done: 0,
    dia: '30" × 24G',
    kt: 'c',
    yd: false,
    unit: 'kg',
    machines: ['M-01'],
    yarns: [],
  };

  // UI States
  const [stickerOn, setStickerOn] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Machine Rolls from Database
  const machineDbRolls = useMemo(() => {
    if (!activeOrder?.id || !curMachine.m) return [];
    return rolls.filter(
      (r: any) =>
        (r.o === activeOrder.id || r.order_no === activeOrder.id) &&
        (r.m === curMachine.m || r.machine_code === curMachine.m)
    );
  }, [rolls, activeOrder, curMachine]);

  // Grid State for Job Card
  const [cols, setCols] = useState<number>(() => Math.max(machineDbRolls.length, 10));
  const [rollNums, setRollNums] = useState<string[]>([]);
  const [weights, setWeights] = useState<(string | number)[]>([]);
  const [operators, setOperators] = useState<string[]>([]);
  const [faultMap, setFaultMap] = useState<Record<string, (string | number)[]>>({});
  const [remarks, setRemarks] = useState<string>('');

  // Sync Grid with Database rolls when active order/machine changes
  const populateGridFromRolls = () => {
    const count = Math.max(machineDbRolls.length, 10);
    setCols(count);

    const rArr: string[] = [];
    const wArr: (string | number)[] = [];
    const opArr: string[] = [];
    const fObj: Record<string, (string | number)[]> = {};
    FAULTS.forEach((f) => (fObj[f] = []));

    for (let i = 0; i < count; i++) {
      const dbR: any = machineDbRolls[i];
      rArr[i] = dbR?.jc || dbR?.jc_seq || String(i + 1).padStart(3, '0');
      wArr[i] = dbR ? (dbR.kg ?? dbR.weight_kg ?? '') : '';
      opArr[i] = dbR ? (dbR.op ?? dbR.operator_name ?? '') : '';

      FAULTS.forEach((f) => {
        const fVal = dbR?.f ? dbR.f[f] : undefined;
        fObj[f][i] = fVal != null && fVal !== 0 ? fVal : '';
      });
    }

    setRollNums(rArr);
    setWeights(wArr);
    setOperators(opArr);
    setFaultMap(fObj);
    setEditMode(false);
  };

  useEffect(() => {
    populateGridFromRolls();
  }, [machineDbRolls, activeOrder?.id, curMachine.m]);

  // Vendor display name
  const vendorName = useMemo(() => {
    if (!activeOrder) return '—';
    const found = parties.find(
      (p) =>
        p.code === activeOrder.party_code ||
        p.code === (activeOrder as any).v ||
        p.id === activeOrder.party_id ||
        p.name === activeOrder.party
    );
    return found?.name || activeOrder.party || (activeOrder as any).v || '—';
  }, [activeOrder, parties]);

  // Production Log details (operator, shift, date)
  const lastProdLog = useMemo(() => {
    if (!activeOrder?.id || !curMachine.m) return null;
    return prodLogs.find(
      (p: any) =>
        (p.o === activeOrder.id || p.order_no === activeOrder.id) &&
        (p.m === curMachine.m || p.machine_code === curMachine.m)
    );
  }, [prodLogs, activeOrder, curMachine]);

  // Calculations matching KnitKhata.html
  const usedCols = useMemo(() => {
    return Array.from({ length: cols }, (_, i) => i).filter(
      (i) => Boolean(rollNums[i]) || parseNum(weights[i]) > 0
    );
  }, [cols, rollNums, weights]);

  const inQty = Math.round(curLine.qty / (curLine.machines.length || 1));
  const outQty = usedCols.reduce((acc, i) => acc + parseNum(weights[i]), 0);

  const rollTotalFaults = (i: number): number => {
    return FAULTS.reduce((acc, f) => acc + parseNum(faultMap[f]?.[i]), 0);
  };

  const notOkCount = usedCols.filter((i) => rollTotalFaults(i) > 0).length;
  const slIndex = ms.findIndex((x) => x.m === curMachine.m) + 1;

  // Add more columns (+5)
  const handleAddMoreCols = () => {
    const newCount = cols + 5;
    setCols(newCount);
    setRollNums((prev) => {
      const arr = [...prev];
      for (let i = prev.length; i < newCount; i++) {
        arr.push(String(i + 1).padStart(3, '0'));
      }
      return arr;
    });
  };

  // Toggle edit and save
  const handleToggleEdit = async () => {
    if (editMode) {
      // Save grid changes to MySQL Database
      setIsSaving(true);
      try {
        const payloadRolls: any[] = [];
        for (let i = 0; i < cols; i++) {
          const wt = parseNum(weights[i]);
          const rollNo = rollNums[i];
          const faults: Record<string, number> = {};
          FAULTS.forEach((f) => {
            const cnt = parseNum(faultMap[f]?.[i]);
            if (cnt > 0) faults[f] = cnt;
          });

          if (wt > 0 || rollNo) {
            payloadRolls.push({
              seq: rollNo || String(i + 1).padStart(3, '0'),
              wt,
              op: operators[i] || (lastProdLog as any)?.operator_name || (lastProdLog as any)?.op || (lastProdLog as any)?.operator || '—',
              lot: (machineDbRolls[0] as any)?.lot || (machineDbRolls[0] as any)?.yarn_lot || (curLine.yarns && curLine.yarns[0]?.lot) || '—',
              shift: (lastProdLog as any)?.shift || (lastProdLog as any)?.sh || 'A',
              faults,
            });
          }
        }

        await saveJobCardGrid({
          order_no: activeOrder.id,
          machine_code: curMachine.m,
          placement_index: curMachine.i,
          rolls: payloadRolls,
          remarks,
        });

        addToast({
          type: 'success',
          title: 'সংরক্ষিত',
          message: 'জব কার্ড ফল্ট ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে।',
        });
        setEditMode(false);
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'সেভ ব্যর্থ',
          message: err.message || 'জব কার্ড ডাটাবেজে সংরক্ষণ করা যায়নি।',
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      setEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    populateGridFromRolls();
    setEditMode(false);
  };

  // Print helper for Job Card document
  const handlePrintJobCard = () => {
    const jcEl = document.querySelector('.jc');
    if (!jcEl) {
      window.print();
      return;
    }
    const printArea = document.getElementById('printArea');
    if (printArea) {
      printArea.innerHTML = jcEl.outerHTML;
      document.body.classList.add('printing');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing');
        printArea.innerHTML = '';
      }, 600);
    } else {
      window.print();
    }
  };

  // Print helper for Roll Stickers
  const handlePrintStickers = () => {
    const stkGridEl = document.querySelector('#jcStk .stk-grid');
    if (!stkGridEl) return;
    const printArea = document.getElementById('printArea');
    if (printArea) {
      printArea.innerHTML = `
        <div style="padding: 16px;">
          <h3 style="margin-bottom: 12px;">রোল স্টিকার · ${activeOrder.id} (${curMachine.m})</h3>
          ${stkGridEl.outerHTML}
        </div>
      `;
      document.body.classList.add('printing');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing');
        printArea.innerHTML = '';
      }, 600);
    } else {
      window.print();
    }
  };

  if (!activeOrder) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center', borderRadius: 12, border: '1px solid var(--line)' }}>
        <AlertCircle size={42} style={{ color: 'var(--muted)', margin: '0 auto 12px', opacity: 0.7 }} />
        <h3 style={{ marginBottom: 6, fontSize: '1.2rem' }}>কোনো সক্রিয় অর্ডার পাওয়া যায়নি</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: '0.9rem' }}>
          জব কার্ড তৈরি করতে প্রথমে একটি অর্ডার এন্ট্রি করুন এবং মেশিন অ্যাসাইন করুন।
        </p>
        <button
          className="btn pri"
          onClick={() => navigate('/dashboard/neworder')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: '0 auto' }}
        >
          <Plus size={16} /> নতুন অর্ডার এন্ট্রি
        </button>
      </div>
    );
  }

  return (
    <div className="jobcard-page" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 48 }}>
      {/* 1. TOP HEADER & QR STICKER TOGGLE */}
      <div
        className="head"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: 'var(--surface)',
          padding: '16px 20px',
          borderRadius: 12,
          border: '1px solid var(--line)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)' }}>জব কার্ড</h2>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              QC ট্র্যাকিং
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--muted)' }}>
            মেশিন অ্যাসাইন হলেই জব কার্ড তৈরি হয়। রোল নামলে QC ঘরে ডাটা উঠে যায়,{' '}
            {isVendor ? 'আর আপনি সহজেই প্রতিটি রোলের বিস্তারিত পর্যবেক্ষণ করতে পারেন।' : 'আর ভেন্ডরও সাথে সাথে দেখে কোন রোলে কী সমস্যা।'}
          </p>
        </div>

        {!isVendor && (
          <div
            className="st-sw"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--surface2)',
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid var(--line)',
            }}
          >
            <QrCode size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>QR রোল স্টিকার</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                {stickerOn ? 'চালু আছে' : 'বন্ধ · হাতে লিখে চলবে'}
              </div>
            </div>
            <button
              className={`switch ${stickerOn ? 'on' : ''}`}
              type="button"
              id="stkSw"
              onClick={() => {
                setStickerOn(!stickerOn);
                addToast({
                  type: 'info',
                  message: !stickerOn ? 'QR স্টিকার চালু হলো' : 'QR স্টিকার বন্ধ · রোল নম্বর হাতে লিখে চলবে',
                });
              }}
              aria-pressed={stickerOn}
              aria-label="QR রোল স্টিকার চালু বা বন্ধ"
              style={{ marginLeft: 4 }}
            />
          </div>
        )}
      </div>

      {/* 2. CONTROL PANEL (SEARCHABLE ORDER DROPDOWN & ACTIONS & MACHINE CHIPS) */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '18px 20px',
          borderRadius: 12,
          border: '1px solid var(--line)',
          background: 'var(--surface)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Top Control Row: Searchable Dropdown & Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          
          {/* SEARCHABLE ORDER DROPDOWN */}
          <div ref={dropdownRef} style={{ position: 'relative', flex: '1 1 360px', maxWidth: 480 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 600, fontSize: '0.86rem', color: 'var(--ink)' }}>
              <span>অর্ডার নির্বাচন করুন</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted)' }}>(ড্রপডাউনে সার্চ করুন)</span>
            </label>

            {/* Hidden fallback select for tests / screen readers */}
            <select
              id="jcO"
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                setSelectedMachine('');
                setEditMode(false);
              }}
              style={{ display: 'none' }}
              aria-hidden="true"
              tabIndex={-1}
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} · {o.party || ''}
                </option>
              ))}
            </select>

            {/* Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              style={{
                width: '100%',
                padding: '9px 14px',
                background: 'var(--surface)',
                border: isDropdownOpen ? '1px solid var(--accent)' : '1px solid var(--line)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                boxShadow: isDropdownOpen ? '0 0 0 3px var(--accent-soft)' : '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontFamily: 'var(--f-mono)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeOrder.id}
                </span>

                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Building2 size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{vendorName}</span>
                    {activeOrder.buyer && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 400, flexShrink: 0 }}>
                        ({activeOrder.buyer})
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {curLine.place} · {curLine.fab} · {bnNum(Math.round(curLine.qty))} {curLine.unit || 'kg'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {(() => {
                  const badge = getOrderStatusBadge(activeOrder.status);
                  return <span className={`pill ${badge.className}`}>{badge.label}</span>;
                })()}
                <ChevronDown
                  size={18}
                  style={{
                    color: 'var(--muted)',
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </div>
            </button>

            {/* Dropdown Floating Popover */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '100%',
                  minWidth: 340,
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 12,
                  boxShadow: '0 14px 34px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.05)',
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                {/* Search Bar & Tabs */}
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)', background: 'var(--surface2)' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={15} style={{ position: 'absolute', left: 10, color: 'var(--muted)' }} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="অর্ডার নং, ভেন্ডর বা বায়ার দিয়ে খুঁজুন..."
                      style={{
                        width: '100%',
                        padding: '8px 32px 8px 32px',
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                        background: 'var(--surface)',
                        color: 'var(--ink)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        style={{
                          position: 'absolute',
                          right: 8,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 4,
                        }}
                        title="ক্লিয়ার করুন"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      style={{
                        padding: '3px 9px',
                        fontSize: '0.74rem',
                        borderRadius: 6,
                        border: 'none',
                        background: statusFilter === 'all' ? 'var(--accent)' : 'transparent',
                        color: statusFilter === 'all' ? '#ffffff' : 'var(--muted)',
                        fontWeight: statusFilter === 'all' ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      সব ({orderCounts.all})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('running')}
                      style={{
                        padding: '3px 9px',
                        fontSize: '0.74rem',
                        borderRadius: 6,
                        border: 'none',
                        background: statusFilter === 'running' ? 'var(--accent)' : 'transparent',
                        color: statusFilter === 'running' ? '#ffffff' : 'var(--muted)',
                        fontWeight: statusFilter === 'running' ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      চলমান ({orderCounts.running})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('completed')}
                      style={{
                        padding: '3px 9px',
                        fontSize: '0.74rem',
                        borderRadius: 6,
                        border: 'none',
                        background: statusFilter === 'completed' ? 'var(--accent)' : 'transparent',
                        color: statusFilter === 'completed' ? '#ffffff' : 'var(--muted)',
                        fontWeight: statusFilter === 'completed' ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      সম্পন্ন ({orderCounts.completed})
                    </button>
                  </div>
                </div>

                {/* Filtered Order Options */}
                <div style={{ maxHeight: 290, overflowY: 'auto' }}>
                  {filteredDropdownOrders.length === 0 ? (
                    <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                      <Search size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      <div style={{ fontWeight: 600 }}>কোনো অর্ডার পাওয়া যায়নি</div>
                      <div style={{ fontSize: '0.76rem', marginTop: 4, opacity: 0.8 }}>অন্য কোনো কি-ওয়ার্ড বা নম্বর দিয়ে খুঁজুন</div>
                    </div>
                  ) : (
                    filteredDropdownOrders.map((o) => {
                      const isSelected = o.id === selectedOrderId;
                      const badge = getOrderStatusBadge(o.status);
                      const pName =
                        parties.find(
                          (p) =>
                            p.code === o.party_code ||
                            p.code === (o as any).v ||
                            p.id === (o as any).party_id ||
                            p.name === o.party
                        )?.name ||
                        o.party ||
                        (o as any).v ||
                        '—';

                      const oLines = normalizeOrderLines(o);
                      const oMachines = oLines.flatMap((l) => l.machines || []);
                      const uniqueMachines = Array.from(new Set(oMachines));

                      return (
                        <div
                          key={o.id}
                          onClick={() => {
                            setSelectedOrderId(o.id);
                            setSelectedMachine('');
                            setEditMode(false);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--line)',
                            background: isSelected ? 'var(--accent-soft)' : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            transition: 'background 0.12s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'var(--surface2)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontFamily: 'var(--f-mono)',
                                  fontSize: '0.85rem',
                                  color: isSelected ? 'var(--accent)' : 'var(--ink)',
                                }}
                              >
                                {o.id}
                              </span>
                              <span className={`pill ${badge.className}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                {badge.label}
                              </span>
                              {o.orderDate && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginLeft: 'auto' }}>
                                  {o.orderDate}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 500 }}>
                              <Building2 size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {pName}
                              </span>
                              {o.buyer && (
                                <span style={{ color: 'var(--muted)', fontSize: '0.78rem', flexShrink: 0 }}>
                                  · বায়ার: {o.buyer}
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: '0.74rem', color: 'var(--muted)', marginTop: 3 }}>
                              <span>{o.fabric || oLines[0]?.fab || 'Single Jersey'}</span>
                              <span>·</span>
                              <span>{bnNum(Math.round(Number(o.qty || (o as any).totalKg || 0)))} kg</span>
                              {uniqueMachines.length > 0 && (
                                <>
                                  <span>·</span>
                                  <span style={{ fontFamily: 'var(--f-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                                    {uniqueMachines.join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <div style={{ color: 'var(--accent)', flexShrink: 0 }}>
                              <Check size={18} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS GROUP */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, alignSelf: 'flex-end', paddingTop: 6 }}>
            {editMode ? (
              <>
                <button
                  type="button"
                  className="btn sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--surface2)',
                    color: 'var(--ink)',
                    border: '1px solid var(--line)',
                    fontWeight: 600,
                    padding: '8px 14px',
                  }}
                >
                  <RotateCcw size={14} /> বাতিল
                </button>
                <button
                  type="button"
                  className="btn sm"
                  onClick={handleToggleEdit}
                  disabled={isSaving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#10b981',
                    color: '#ffffff',
                    border: '1px solid #059669',
                    fontWeight: 600,
                    padding: '8px 16px',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <Save size={15} /> {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn sm"
                id="jcEdit"
                onClick={handleToggleEdit}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  fontWeight: 600,
                  padding: '8px 14px',
                }}
              >
                <Edit3 size={15} style={{ color: 'var(--accent)' }} /> ফল্ট লিখুন
              </button>
            )}

            <button
              type="button"
              className="btn sm no-pdf"
              onClick={handlePrintJobCard}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--accent)',
                color: '#ffffff',
                border: '1px solid var(--accent)',
                fontWeight: 600,
                padding: '8px 15px',
                boxShadow: '0 2px 6px rgba(47, 91, 234, 0.25)',
              }}
            >
              <Printer size={15} /> প্রিন্ট জব কার্ড
            </button>
          </div>
        </div>

        {/* Machine Selector Chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 6, borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={14} /> অ্যাসাইন করা মেশিনসমূহ ({ms.length} টি):
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              বর্তমান নির্বাচিত: <b style={{ color: 'var(--accent)', fontFamily: 'var(--f-mono)' }}>{curMachine.m}</b> ({curLine.place})
            </span>
          </div>

          <div className="chips" id="jcM" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: 0, position: 'static' }}>
            {ms.map((x, idx) => {
              const isSelected = x.m === curMachine.m;
              const partLine = lines[x.i];
              const colorVar = `var(--l${(x.i % 5) + 1})`;

              // Count rolls saved in database for this specific machine
              const mRolls = rolls.filter(
                (r: any) =>
                  (r.o === activeOrder.id || r.order_no === activeOrder.id) &&
                  (r.m === x.m || r.machine_code === x.m)
              );

              return (
                <button
                  key={`${x.m}-${idx}`}
                  type="button"
                  className={isSelected ? 'on' : ''}
                  data-m={x.m}
                  onClick={() => {
                    setSelectedMachine(x.m);
                    setEditMode(false);
                  }}
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '7px 14px',
                    borderRadius: 10,
                    fontSize: '0.86rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'var(--surface)' : 'var(--surface2)',
                    color: isSelected ? 'var(--ink)' : 'var(--muted)',
                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--line)',
                    boxShadow: isSelected ? '0 2px 8px rgba(47, 91, 234, 0.15)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: isSelected ? 'var(--accent)' : colorVar,
                      display: 'inline-block',
                      boxShadow: isSelected ? '0 0 0 3px var(--accent-soft)' : 'none',
                    }}
                  />
                  <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 700 }}>{x.m}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 400 }}>·</span>
                  <span>{partLine?.place || 'Body'}</span>

                  {mRolls.length > 0 && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        background: isSelected ? 'var(--accent-soft)' : 'var(--surface)',
                        color: isSelected ? 'var(--accent)' : 'var(--muted)',
                        padding: '1px 6px',
                        borderRadius: 999,
                        fontWeight: 600,
                        border: '1px solid var(--line)',
                      }}
                    >
                      {bnNum(mRolls.length)} রোল
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. THE JOB CARD PAPER SHEET (.jc) */}
      <div
        className="jc"
        style={{
          background: 'var(--paper, #ffffff)',
          color: 'var(--paper-ink, #1e2124)',
          border: '1px solid var(--paper-line, #cdd0cc)',
          borderRadius: 12,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Job Card Paper Header (.jc-h) */}
        <div className="jc-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, borderBottom: '2px solid var(--paper-ink)', paddingBottom: 14 }}>
          <div>
            <b style={{ fontSize: '1.25rem', color: 'var(--paper-ink)', fontWeight: 800 }}>{factoryProfile?.name || 'রহমান নিটিং ইন্ডাস্ট্রিজ'}</b>
            <span style={{ fontSize: '0.85rem', color: 'var(--paper-muted)', marginTop: 2 }}>{factoryProfile?.address || 'কোনাবাড়ি, গাজীপুর'}</span>
            <em style={{ display: 'inline-block', marginTop: 6, fontStyle: 'normal', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--accent, #2563eb)', background: 'var(--accent-soft, #eff6ff)', padding: '2px 8px', borderRadius: 4, fontSize: '0.82rem' }}>
              জব কার্ড (JOB CARD)
            </em>
          </div>

          <div className="jc-r" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div className="row no-pdf jc-tools">
              <button
                className="btn sm no-pdf prn-btn"
                type="button"
                onClick={handlePrintJobCard}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  fontSize: '0.82rem',
                }}
              >
                <Printer size={14} /> প্রিন্ট
              </button>
            </div>
            <div style={{ background: '#ffffff', padding: 4, borderRadius: 6, border: '1px solid var(--paper-line)' }}>
              <QrCodeSvg value={`${activeOrder.id}-${curMachine.m}`} size={72} />
            </div>
          </div>
        </div>

        {/* Facts Spec Grid (.jc-g) */}
        <div
          className="jc-g"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '8px 24px',
            background: 'var(--surface2, #f8fafc)',
            padding: '16px 20px',
            borderRadius: 10,
            border: '1px solid var(--paper-line, #e2e8f0)',
          }}
        >
          <div>
            <span>SL / লট নং</span>
            <b className="mono">
              {slIndex} / ({ms.length})
            </b>
          </div>
          <div>
            <span>ভেন্ডর / পার্টি</span>
            <b>{vendorName}</b>
          </div>
          <div>
            <span>অর্ডার নং</span>
            <b className="mono" style={{ color: 'var(--accent)' }}>{activeOrder.id}</b>
          </div>
          <div>
            <span>অংশ ও ফেব্রিক</span>
            <b>
              {curLine.place} · {curLine.fab}{' '}
              {curLine.kt === 'f' ? (
                <span className="kb kb-f" style={{ marginLeft: 4 }}>ফ্ল্যাট নিট</span>
              ) : null}
              {curLine.yd ? (
                <span className="kb kb-y" style={{ marginLeft: 4 }}>Y/D</span>
              ) : (
                <span className="kb" style={{ marginLeft: 4 }}>গ্রে</span>
              )}
            </b>
          </div>
          <div>
            <span>বায়ার</span>
            <b>{activeOrder.buyer || '—'}</b>
          </div>
          <div>
            <span>মেশিন ও ডায়া</span>
            <b className="mono">
              {curMachine.m} · {curLine.dia || (activeOrder as any).dia || '30" × 24G'}
            </b>
          </div>
          <div>
            <span>তারিখ</span>
            <b className="mono">
              {(() => {
                const rawDate =
                  (lastProdLog as any)?.date_label ||
                  (lastProdLog as any)?.d ||
                  (lastProdLog as any)?.date ||
                  (machineDbRolls[0] as any)?.date_label ||
                  (machineDbRolls[0] as any)?.d ||
                  activeOrder.orderDate;
                if (!rawDate) return '—';
                const s = String(rawDate);
                return s.includes('202') ? s : `${s} 2026`;
              })()}
            </b>
          </div>
          <div>
            <span>শিফট</span>
            <b>{lastProdLog ? (lastProdLog as any).shift || (lastProdLog as any).sh : (machineDbRolls[0] as any)?.shift || 'A'}</b>
          </div>
          <div>
            <span>অপারেটর</span>
            <b>
              {(lastProdLog &&
                ((lastProdLog as any).operator_name ||
                  (lastProdLog as any).op ||
                  (lastProdLog as any).operator)) ||
                (machineDbRolls[0] as any)?.operator_name ||
                (machineDbRolls[0] as any)?.op ||
                operators.find((op) => Boolean(op)) ||
                '—'}
            </b>
          </div>
          <div>
            <span>সুতা লট</span>
            <b className="mono">
              {(machineDbRolls[0] as any)?.lot ||
                (machineDbRolls[0] as any)?.yarn_lot ||
                (curLine.yarns && curLine.yarns[0]?.lot) ||
                '—'}
            </b>
          </div>
          <div>
            <span>ইন কোয়ান্টিটি</span>
            <b className="mono">
              {bnNum(inQty)} {curLine.unit === 'pcs' || curLine.kt === 'f' ? 'পিস' : 'kg'}
            </b>
          </div>
          <div>
            <span>আউট কোয়ান্টিটি</span>
            <b className="mono">
              {bnNum(Math.round(outQty))} kg · {usedCols.length} রোল
            </b>
          </div>
          <div>
            <span>সমস্যাযুক্ত রোল (Not OK)</span>
            <b
              className="mono"
              style={{
                color: notOkCount > 0 ? '#b91c1c' : '#10b981',
                background: notOkCount > 0 ? '#fee2e2' : '#ecfdf5',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {notOkCount} টি
            </b>
          </div>
          <div>
            <span>বাকি (WIP)</span>
            <b className="mono" style={{ color: inQty - Math.round(outQty) > 0 ? '#f59e0b' : 'inherit' }}>
              {bnNum(Math.max(0, inQty - Math.round(outQty)))} kg
            </b>
          </div>
        </div>

        {/* QC Section Bar (.jc-qh) */}
        <div
          className="jc-qh"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 4px 4px',
            borderBottom: '1px solid var(--paper-line)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <b style={{ fontSize: '1rem', color: 'var(--paper-ink)' }}>রোল অনুযায়ী কোয়ালিটি কন্ট্রোল (QC)</b>
            {editMode && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: '#dcfce7',
                  color: '#16a34a',
                  padding: '2px 8px',
                  borderRadius: 999,
                }}
              >
                এডিটিং চলছে...
              </span>
            )}
          </div>

          <span className="row no-pdf" style={{ display: 'flex', gap: 8 }}>
            {editMode ? (
              <>
                <button
                  className="btn sm"
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  style={{
                    background: 'var(--paper)',
                    color: 'var(--paper-ink)',
                    border: '1px solid var(--paper-line)',
                    fontWeight: 600,
                  }}
                >
                  বাতিল
                </button>
                <button
                  className="btn sm"
                  type="button"
                  onClick={handleToggleEdit}
                  disabled={isSaving}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: '1px solid #059669',
                    fontWeight: 600,
                  }}
                >
                  {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </>
            ) : (
              <button
                className="btn sm"
                id="jcEdit"
                type="button"
                onClick={handleToggleEdit}
                disabled={isSaving}
                style={{
                  background: 'var(--paper)',
                  color: 'var(--paper-ink)',
                  border: '1px solid var(--paper-line)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Edit3 size={14} /> ফল্ট লিখুন
              </button>
            )}
          </span>
        </div>

        {/* Table (.tw > table.jc-t) with Sticky First Column for horizontal scrolling */}
        <div className="tw" style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--paper-line)' }}>
          <table className="jc-t" style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
            <tbody>
              {/* Roll Numbers Row */}
              <tr className="jc-roll" style={{ background: '#F1F3F2' }}>
                <td
                  style={{
                    fontWeight: 700,
                    position: 'sticky',
                    left: 0,
                    background: '#F1F3F2',
                    zIndex: 3,
                    borderRight: '2px solid var(--paper-line)',
                    whiteSpace: 'nowrap',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                  }}
                >
                  রোল নং
                </td>
                {Array.from({ length: cols }, (_, i) => (
                  <td key={`r-${i}`} className="n mono" style={{ textAlign: 'center', minWidth: 46 }}>
                    {editMode ? (
                      <input
                        className="jc-in"
                        value={rollNums[i] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRollNums((prev) => {
                            const arr = [...prev];
                            arr[i] = val;
                            return arr;
                          });
                        }}
                        style={{
                          width: '100%',
                          minWidth: 44,
                          textAlign: 'center',
                          padding: '3px 4px',
                          fontSize: 12,
                          border: '1px solid var(--paper-line)',
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      rollNums[i] || ''
                    )}
                  </td>
                ))}
              </tr>

              {/* Weight Row */}
              <tr style={{ background: 'var(--paper)' }}>
                <td
                  style={{
                    fontWeight: 700,
                    position: 'sticky',
                    left: 0,
                    background: 'var(--paper)',
                    zIndex: 3,
                    borderRight: '2px solid var(--paper-line)',
                    whiteSpace: 'nowrap',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                  }}
                >
                  ওজন (kg)
                </td>
                {Array.from({ length: cols }, (_, i) => (
                  <td key={`w-${i}`} className="n mono" style={{ textAlign: 'center', minWidth: 46 }}>
                    {editMode ? (
                      <input
                        className="jc-in"
                        type="number"
                        step="0.1"
                        value={weights[i] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWeights((prev) => {
                            const arr = [...prev];
                            arr[i] = val;
                            return arr;
                          });
                        }}
                        style={{
                          width: '100%',
                          minWidth: 44,
                          textAlign: 'center',
                          padding: '3px 4px',
                          fontSize: 12,
                          border: '1px solid var(--paper-line)',
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      weights[i] || ''
                    )}
                  </td>
                ))}
              </tr>

              {/* All 16 Fault Rows */}
              {FAULTS.map((fault) => (
                <tr key={fault}>
                  <td
                    style={{
                      fontWeight: 600,
                      position: 'sticky',
                      left: 0,
                      background: 'var(--paper)',
                      zIndex: 3,
                      borderRight: '2px solid var(--paper-line)',
                      whiteSpace: 'nowrap',
                      padding: '6px 12px',
                      fontSize: '0.84rem',
                    }}
                  >
                    {fault}
                  </td>
                  {Array.from({ length: cols }, (_, i) => {
                    const cnt = parseNum(faultMap[fault]?.[i]);
                    return editMode ? (
                      <td key={`${fault}-${i}`} className="n" style={{ textAlign: 'center', minWidth: 46 }}>
                        <input
                          className="jc-in"
                          type="number"
                          min="0"
                          value={faultMap[fault]?.[i] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFaultMap((prev) => {
                              const fArr = [...(prev[fault] || [])];
                              fArr[i] = val;
                              return { ...prev, [fault]: fArr };
                            });
                          }}
                          style={{
                            width: '100%',
                            minWidth: 40,
                            textAlign: 'center',
                            padding: '3px 4px',
                            fontSize: 12,
                            border: '1px solid var(--paper-line)',
                            borderRadius: 4,
                            background: cnt > 0 ? '#fee2e2' : '#ffffff',
                          }}
                        />
                      </td>
                    ) : (
                      <td
                        key={`${fault}-${i}`}
                        className={`n ${cnt > 0 ? 'jc-bad' : ''}`}
                        style={{
                          textAlign: 'center',
                          minWidth: 46,
                          background: cnt > 0 ? '#fee2e2' : undefined,
                          color: cnt > 0 ? '#b91c1c' : undefined,
                          fontWeight: cnt > 0 ? 700 : undefined,
                        }}
                      >
                        {cnt > 0 ? cnt : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Total Faults Row (.jc-tot) */}
              <tr className="jc-tot" style={{ fontWeight: 700, borderTop: '2px solid var(--paper-ink)', background: '#F1F3F2' }}>
                <td
                  style={{
                    fontWeight: 700,
                    position: 'sticky',
                    left: 0,
                    background: '#F1F3F2',
                    zIndex: 3,
                    borderRight: '2px solid var(--paper-line)',
                    whiteSpace: 'nowrap',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                  }}
                >
                  মোট ফল্ট
                </td>
                {Array.from({ length: cols }, (_, i) => {
                  const tot = rollTotalFaults(i);
                  const hasRoll = Boolean(rollNums[i]) || parseNum(weights[i]) > 0;
                  return (
                    <td
                      key={`tot-${i}`}
                      className={`n ${tot > 0 ? 'jc-bad' : ''}`}
                      style={{
                        textAlign: 'center',
                        minWidth: 46,
                        background: tot > 0 ? '#fee2e2' : undefined,
                        color: tot > 0 ? '#b91c1c' : undefined,
                      }}
                    >
                      {hasRoll ? tot : ''}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Remarks Box (.jc-remb) */}
        <div className="jc-remb" style={{ marginTop: 8 }}>
          <b style={{ fontSize: '0.88rem', color: 'var(--paper-ink)' }}>মন্তব্য ও বিশেষ নির্দেশনা:</b>
          {editMode ? (
            <textarea
              className="jc-ta"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="যেমন: রোল ৭-এ হোল পাওয়া গিয়েছে, নিডল বদলানো হয়েছে..."
              style={{
                width: '100%',
                minHeight: 64,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--paper-line)',
                marginTop: 6,
                fontFamily: 'inherit',
                fontSize: '0.85rem',
              }}
            />
          ) : (
            <div
              className="jc-remt"
              style={{
                minHeight: 38,
                color: remarks ? 'inherit' : 'var(--paper-muted)',
                marginTop: 6,
                padding: '8px 12px',
                background: 'var(--surface2)',
                borderRadius: 8,
                border: '1px solid var(--paper-line)',
                fontSize: '0.86rem',
              }}
            >
              {remarks || 'কোনো বিশেষ মন্তব্য রেকর্ড করা হয়নি।'}
            </div>
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div
          className="row no-pdf"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 8,
            paddingTop: 12,
            borderTop: '1px solid var(--paper-line)',
          }}
        >
          <span className="small muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            প্রোডাকশন এন্ট্রিতে রোল লিখলে এখানে অটোমেটিক চলে আসে। "ফল্ট লিখুন" চেপে কাগজের ব্যাচ কার্ডের মতো ফল্ট ও ওজন এন্ট্রি করা যায়।
          </span>
          <button
            className="btn sm"
            id="jcMore"
            type="button"
            onClick={handleAddMoreCols}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--surface2)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
            }}
          >
            <Plus size={14} /> আরও ৫টি রোল যোগ করুন
          </button>
        </div>
      </div>

      {/* 4. STICKER SECTION (#jcStk) */}
      {stickerOn && machineDbRolls.length > 0 && (
        <div
          className="card"
          id="jcStk"
          style={{
            marginTop: 8,
            padding: '20px',
            borderRadius: 12,
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div className="row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <QrCode size={18} style={{ color: 'var(--accent)' }} /> এই মেশিনের রোল স্টিকার ({curMachine.m})
              </h3>
              <p className="small muted" style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>
                রোল ট্র্যাকিং স্টিকার প্রিন্ট করে রোলের প্যাকেটে সাঁটানো যায়।
              </p>
            </div>
            <button
              className="btn sm no-pdf"
              type="button"
              onClick={handlePrintStickers}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--accent)',
                color: '#ffffff',
                border: '1px solid var(--accent)',
                fontWeight: 600,
                padding: '7px 14px',
              }}
            >
              <Printer size={14} /> স্টিকার প্রিন্ট
            </button>
          </div>

          <div className="stk-grid" style={{ marginTop: 12 }}>
            {machineDbRolls.slice(-6).map((r: any, idx: number) => {
              const rollCode = r.no || r.roll_no || `${curMachine.m}/${r.jc || r.jc_seq || '001'}`;
              return (
                <div
                  key={r.id || idx}
                  className="stk"
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    background: '#ffffff',
                    color: '#1e2124',
                    border: '1.5px dashed #9ca3af',
                    borderRadius: 10,
                    padding: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ background: '#ffffff', padding: 2, borderRadius: 4, border: '1px solid #e5e7eb', flexShrink: 0 }}>
                    <QrCodeSvg value={rollCode} size={64} />
                  </div>
                  <div className="stk-t" style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                    <b className="mono" style={{ fontSize: '0.95rem', color: '#111827' }}>
                      {rollCode}
                    </b>
                    <span style={{ fontSize: '0.78rem', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeOrder.id} · {vendorName}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {curLine.place} · {curLine.fab}
                    </span>
                    <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af', marginTop: 2 }}>
                      {r.kg || r.weight_kg} kg · {r.lot || r.yarn_lot || (curLine.yarns && curLine.yarns[0]?.lot) || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
