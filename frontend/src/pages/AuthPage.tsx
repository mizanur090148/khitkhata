import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

type RoleKey = 'fac' | 'ven' | 'sup' | 'par';
type TabKey = 'in' | 'up';
type SuStep = 1 | 'plan' | 2;

interface SuData {
  name: string;
  ph: string;
  em: string;
  org: string;
  area: string;
  mc: string;
  pos: string;
  vt: string;
  desig: string;
  items: string[];
  pw: string;
  pw2: string;
  agree: boolean;
  plan: string;
  bill: 'm' | 'y';
  otp: string;
}

const ROLES: [RoleKey, string, string][] = [
  ['fac', 'ফ্যাক্টরি', 'নিটিং ফ্যাক্টরির মালিক বা স্টাফ — অর্ডার, প্রোডাকশন, বিল'],
  ['ven', 'ভেন্ডর', 'কম্পোজিট বা বায়িং হাউস — সব ফ্যাক্টরির কাজ এক জায়গায়'],
  ['sup', 'সাপ্লায়ার', 'মেশিন, নিডল, অয়েল, স্পেয়ার পার্টস'],
  ['par', 'পার্টনার', 'রেফারেল লিংক আর কমিশনের হিসাব'],
];

const SU_AREA = ['গাজীপুর', 'কোনাবাড়ি', 'সাভার', 'আশুলিয়া', 'নারায়ণগঞ্জ', 'টঙ্গী', 'মিরপুর', 'চট্টগ্রাম'];
const SU_SUP = ['মেশিন', 'নিডল', 'সিংকার', 'অয়েল', 'স্পেয়ার পার্টস', 'সুতা'];

const PLANS = [
  {
    k: 's',
    n: 'স্টার্টার',
    mc: '১ – ১০টা মেশিন',
    lo: 1,
    hi: 10,
    price: 1000,
    d: 'ছোট ফ্যাক্টরি, যারা খাতা থেকে প্রথমবার সফটওয়্যারে আসছেন।',
    h: 'যা যা পাবেন',
    f: [
      ['১০টা', 'পর্যন্ত মেশিন'],
      ['যত খুশি', 'স্টাফ লগইন'],
      ['অর্ডার,', 'প্রোডাকশন এন্ট্রি ও জব কার্ড'],
      ['রোল ধরে', 'QC — ফ্যাক্টরি ও ভেন্ডর দুই পক্ষের সাইন'],
      ['ডেলিভারি চালান', 'ও বিল, PDF আর WhatsApp-এ'],
      ['পার্টি লেজার', '— কার কাছে কত বাকি'],
      ['সুতা', 'ট্র্যাকার ও ব্যালেন্স'],
      ['ভেন্ডরকে', 'দৈনিক রিপোর্ট নিজে থেকে'],
      ['QR রোল স্টিকার,', 'স্টোর ও পার্টস'],
      ['WhatsApp', 'সাপোর্ট'],
    ],
    note: 'হাজিরা, বেতন, PI বা ব্যাংক-LC দরকার হলে গ্রোথ প্যাকেজ নিন — মেশিন ১০টার কম হলেও নেওয়া যায়।',
  },
  {
    k: 'g',
    n: 'গ্রোথ',
    mc: '১১ – ২৫টা মেশিন',
    lo: 11,
    hi: 25,
    price: 1500,
    d: 'নিটখাতার সব ফিচার, পুরো অফিসের হিসাবসহ।',
    h: 'স্টার্টারের সবকিছু, সাথে',
    f: [
      ['২৫টা', 'পর্যন্ত মেশিন'],
      ['হাজিরা', 'ও বেতন'],
      ['প্রোফর্মা ইনভয়েস', '(PI) তৈরি'],
      ['ব্যাংক ও LC', '-র হিসাব'],
      ['খরচ', 'ও ক্যাশ বুক'],
      ['আপনার লোগো', 'দিয়ে চালান, বিল ও PI'],
      ['Excel এক্সপোর্ট', 'ও মাসিক রিপোর্ট'],
      ['পদ অনুযায়ী', 'অনুমতি — কে কী দেখবে, কী বদলাবে'],
      ['একাধিক ইউনিট', 'এক অ্যাকাউন্টে'],
      ['ভেরিফায়েড ব্যাজ', '— ভেন্ডরের সার্চে আগে দেখাবে'],
    ],
    note: '',
  },
  {
    k: 'p',
    n: 'প্রো',
    mc: '২৬ – ৫০টা মেশিন',
    lo: 26,
    hi: 50,
    price: 2000,
    gift: 1,
    d: 'নিটখাতার সব ফিচার, সাথে বিশেষ সাপোর্ট।',
    h: 'গ্রোথের সব ফিচার, সাথে',
    f: [
      ['৫০টা', 'পর্যন্ত মেশিন'],
      ['অগ্রাধিকার', 'সাপোর্ট — আপনার প্রশ্নের উত্তর আগে'],
      ['ফোনে', 'সরাসরি সাপোর্ট'],
      ['ভিডিও কলে', 'নতুন স্টাফদের ট্রেনিং'],
    ],
    note: '',
  },
  {
    k: 'e',
    n: 'এন্টারপ্রাইজ',
    mc: '৫০টার বেশি মেশিন',
    lo: 51,
    hi: 1e9,
    price: 2500,
    gift: 1,
    d: 'নিটখাতার সব ফিচার, সাথে সবচেয়ে বেশি যত্ন।',
    h: 'প্রো-র সবকিছু, সাথে',
    f: [
      ['যত খুশি', 'মেশিন'],
      ['নিজস্ব', 'সাপোর্ট নম্বর — সবার আগে উত্তর'],
      ['যখন দরকার', 'ভিডিও কলে স্টাফ ট্রেনিং'],
      ['নতুন ফিচার', 'সবার আগে আপনার কাছে'],
    ],
    note: '',
  },
];

const ANNUAL_OFF = 0.10;
const tkB = (n: number) => '৳' + Math.round(n).toLocaleString('en-IN').replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);
const bnN = (n: number | string) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);
const planFor = (n: number) => PLANS.find((p) => n >= p.lo && n <= p.hi) || PLANS[0];
const planFits = (p: typeof PLANS[0], n: number) => !n || n <= p.hi;
const yearly = (p: typeof PLANS[0]) => p.price * 12 * (1 - ANNUAL_OFF);

const RoleSvg: React.FC<{ r: RoleKey }> = ({ r }) => {
  if (r === 'fac') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M3 21V9l6 4V9l6 4V5h6v16z" />
        <path d="M7 17h2M12 17h2M17 17h2" />
      </svg>
    );
  }
  if (r === 'ven') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M4 7h16v13H4z" />
        <path d="M8 7V4h8v3" />
        <path d="M4 12h16" />
      </svg>
    );
  }
  if (r === 'sup') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M3 7l9-4 9 4-9 4z" />
        <path d="M3 7v10l9 4 9-4V7" />
        <path d="M12 11v10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5" />
      <path d="M16 12v8M12 16h8" />
    </svg>
  );
};

export const AuthScreen: React.FC = () => {
  const {
    setScreen,
    setRole,
    setFactoryView,
    setVendorView,
    setSupplierView,
    addToast,
    loginUser,
    registerUser,
  } = useApp();

  const [loginRole, setLoginRole] = useState<RoleKey>('fac');
  const [lgTab, setLgTab] = useState<TabKey>('in');
  const [suStep, setSuStep] = useState<SuStep>(1);
  const [loginMsg, setLoginMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suErr, setSuErr] = useState<Record<string, string>>({});

  // Sign In inputs
  const [inPhone, setInPhone] = useState('01XXXXXXXXX');
  const [inPass, setInPass] = useState('demo1234');

  // Sign Up form state
  const [suD, setSuD] = useState<SuData>({
    name: 'মো. রফিকুল ইসলাম',
    ph: '01711223344',
    em: 'rafiqul@example.com',
    org: 'রহমান নিটিং ইন্ডাস্ট্রিজ',
    area: 'কোনাবাড়ি, গাজীপুর',
    mc: '24',
    pos: 'মালিক',
    vt: 'কম্পোজিট',
    desig: 'মার্চেন্ডাইজার',
    items: ['মেশিন', 'নিডল'],
    pw: 'demo1234',
    pw2: 'demo1234',
    agree: true,
    plan: 'g',
    bill: 'm',
    otp: '123456',
  });

  const suMc = () => {
    const s = String(suD.mc || '').replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
    return parseInt(s, 10) || 0;
  };

  const planDue = (p: typeof PLANS[0]) =>
    suD.bill === 'y' ? `${tkB(yearly(p))} প্রতি বছরে` : `${tkB(p.price)} প্রতি মাসে`;

  const trialEnd = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handlePortalJump = (role: RoleKey, customToast?: string) => {
    if (role === 'fac') {
      setRole('owner');
      setFactoryView('dash'); // SHOW FACTORY DASHBOARD
      setScreen('factory');
    } else if (role === 'ven') {
      setRole('vendor');
      setVendorView('dash'); // SHOW VENDOR DASHBOARD
      setScreen('vendor');
    } else if (role === 'sup') {
      setRole('supplier');
      setSupplierView('sdash'); // SHOW SUPPLIER DASHBOARD
      setScreen('supplier');
    } else {
      setRole('owner');
      setFactoryView('pdash');
      setScreen('factory');
    }

    addToast({
      type: 'success',
      title: 'লগইন সফল!',
      message:
        customToast ||
        `স্বাগতম! ${ROLES.find((x) => x[0] === role)?.[1]} পোর্টালে প্রবেশ করেছেন। ড্যাশবোর্ড সক্রিয়।`,
    });
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginMsg(`✓ ${ROLES.find((x) => x[0] === loginRole)?.[1]} যাচাই হচ্ছে…`);

    try {
      const res = await loginUser(inPhone, inPass, loginRole);
      setLoginMsg(`✓ ${ROLES.find((x) => x[0] === loginRole)?.[1]} ড্যাশবোর্ড খুলছে…`);

      setTimeout(() => {
        setIsLoading(false);
        handlePortalJump(loginRole);
      }, 350);
    } catch {
      setIsLoading(false);
      handlePortalJump(loginRole);
    }
  };


  const handleSignUpStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = loginRole;
    const errors: Record<string, string> = {};
    const v = (k: keyof SuData) => String(suD[k] || '').trim();

    if (!v('name')) errors.name = 'নাম লিখুন';

    const ph = v('ph')
      .replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
      .replace(/[\s-]/g, '')
      .replace(/^\+?88/, '');
    if (!/^01[3-9]\d{8}$/.test(ph)) {
      errors.ph = 'সঠিক মোবাইল নম্বর লিখুন (01 দিয়ে শুরু, ১১ সংখ্যা)';
    }

    if (r !== 'par' && !v('org')) {
      errors.org = r === 'fac' ? 'ফ্যাক্টরির নাম লিখুন' : 'প্রতিষ্ঠানের নাম লিখুন';
    }

    if ((r === 'fac' || r === 'sup') && !v('area')) {
      errors.area = 'এলাকা লিখুন';
    }

    if (r === 'fac' && !(suMc() > 0)) {
      errors.mc = 'মেশিনের সংখ্যা লিখুন — এটা দেখে প্যাকেজ ঠিক হবে';
    }

    if (r === 'sup' && !(suD.items || []).length) {
      errors.items = 'অন্তত একটা বাছুন';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('em'))) {
      errors.em = 'সঠিক ইমেইল লিখুন, যেমন: name@gmail.com';
    }

    if (v('pw').length < 8) {
      errors.pw = 'কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন';
    } else if (v('pw') !== v('pw2')) {
      errors.pw2 = 'দুটো পাসওয়ার্ড মিলছে না';
    }

    if (!suD.agree) {
      errors.agree = 'শর্তাবলি মেনে নিলে তবেই অ্যাকাউন্ট খোলা যাবে';
    }

    setSuErr(errors);

    if (Object.keys(errors).length === 0) {
      if (r === 'fac') {
        const mcCount = suMc();
        const rec = planFor(mcCount);
        setSuD((prev) => ({ ...prev, plan: rec.k }));
        setSuStep('plan');
      } else {
        setSuStep(2);
      }
      setLoginMsg('');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = suD.otp.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
    if (!/^\d{6}$/.test(v)) {
      setSuErr({ otp: '৬ সংখ্যার কোডটা লিখুন' });
      return;
    }
    setSuErr({});
    setIsLoading(true);
    setLoginMsg('অ্যাকাউন্ট তৈরি হচ্ছে…');

    const payload = {
      name: suD.name,
      phone: suD.ph,
      email: suD.em || undefined,
      password: suD.pw,
      role: loginRole,
      organization_name: suD.org,
      area: suD.area,
      machines_count: suMc(),
      designation: loginRole === 'fac' ? suD.pos : suD.desig,
      plan_code: suD.plan,
      billing_cycle: suD.bill,
      vendor_type: suD.vt,
      items: suD.items,
    };

    try {
      const res = await registerUser(payload);
      setIsLoading(false);
      const planObj = PLANS.find((p) => p.k === suD.plan);
      const toastMsg = `স্বাগতম ${suD.name}! অ্যাকাউন্ট খোলা হয়েছে${
        loginRole === 'fac' && planObj ? ` · ${planObj.n} প্যাকেজ, প্রথম মাস ফ্রি` : ''
      }`;
      handlePortalJump(loginRole, toastMsg);
    } catch {
      setIsLoading(false);
      handlePortalJump(loginRole);
    }
  };

  const updateSuField = (key: keyof SuData, value: any) => {
    setSuD((prev) => ({ ...prev, [key]: value }));
    if (suErr[key]) {
      setSuErr((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const toggleSupplierItem = (item: string) => {
    const list = [...suD.items];
    const idx = list.indexOf(item);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(item);
    }
    updateSuField('items', list);
  };

  const isUp = lgTab === 'up';
  const roleTitle = ROLES.find((x) => x[0] === loginRole)?.[1] || '';

  // Common Header matching kkdoc_ven.html
  const renderHeader = () => (
    <>
      <div className="lg-brand">
        <div className="logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M4 8c4 0 4 8 8 8s4-8 8-8" />
            <path d="M4 14c4 0 4 6 8 6s4-6 8-6" opacity=".6" />
            <path d="M4 3c4 0 4 7 8 7s4-7 8-7" opacity=".35" />
          </svg>
        </div>
        <div>
          <b>নিটখাতা</b>
          <div className="small muted">{isUp ? 'নতুন অ্যাকাউন্ট খুলুন' : 'আপনার অ্যাকাউন্টে ঢুকুন'}</div>
        </div>
        <span className="proto" style={{ marginLeft: 'auto' }}>
          প্রোটোটাইপ
        </span>
      </div>

      <div className="lg-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={!isUp}
          className={!isUp ? 'on' : ''}
          onClick={() => {
            setLgTab('in');
            setSuStep(1);
            setLoginMsg('');
            setSuErr({});
          }}
        >
          সাইন ইন
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isUp}
          className={isUp ? 'on' : ''}
          onClick={() => {
            setLgTab('up');
            setSuStep(1);
            setLoginMsg('');
            setSuErr({});
          }}
        >
          সাইন আপ
        </button>
      </div>
    </>
  );

  // Common 4-Role Selector
  const renderRoles = (question: string) => (
    <>
      <div className="lg-q">{question}</div>
      <div className="roles" role="radiogroup">
        {ROLES.map(([k, t, d]) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={k === loginRole}
            className={`rl ${k === loginRole ? 'on' : ''}`}
            onClick={() => {
              setLoginRole(k);
              setLoginMsg('');
              setSuErr({});
            }}
          >
            <span className="ic">
              <RoleSvg r={k} />
            </span>
            <span>
              <b>{t}</b>
              <small>{d}</small>
            </span>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar matching KnitKhata.html #kkOv .kkbar */}
      <div className="kkbar">
        <button type="button" onClick={() => setScreen('site')}>
          ← নিটখাতা হোম
        </button>
        <span>লগইন ও পোর্টাল (প্রোটোটাইপ)</span>
      </div>

      <div className="lg">
        {/* ==============================================================
            1. SIGN IN TAB
           ============================================================== */}
        {!isUp && (
          <form className="lg-box" onSubmit={handleSignInSubmit} noValidate>
            {renderHeader()}
            {renderRoles('আপনি কী হিসেবে লগইন করছেন?')}

            <div className="lg-f">
              <label className="fld">
                <span>মোবাইল নম্বর</span>
                <input
                  type="text"
                  inputMode="tel"
                  value={inPhone}
                  onChange={(e) => setInPhone(e.target.value)}
                  autoComplete="username"
                />
              </label>
              <label className="fld">
                <span>পাসওয়ার্ড</span>
                <input
                  type="password"
                  value={inPass}
                  onChange={(e) => setInPass(e.target.value)}
                  autoComplete="current-password"
                />
              </label>
            </div>

            {loginMsg && (
              <div className="lg-msg" role="status">
                {loginMsg}
              </div>
            )}

            <button className="btn pri" type="submit" disabled={isLoading} style={{ padding: '11px' }}>
              {isLoading ? 'সাইন ইন হচ্ছে…' : 'সাইন ইন'}
            </button>

            <div className="lg-foot">
              <span>
                পাসওয়ার্ড ভুলে গেছেন?{' '}
                <button
                  type="button"
                  className="lnk"
                  onClick={() =>
                    addToast({
                      type: 'info',
                      title: 'OTP সার্ভিস',
                      message: 'মোবাইলে ৬ সংখ্যার OTP পাঠানো হয়েছে (নমুনা ডেমো)।',
                    })
                  }
                >
                  OTP দিয়ে ঢুকুন
                </button>
              </span>
              <span>
                অ্যাকাউন্ট নেই?{' '}
                <button
                  type="button"
                  className="lnk"
                  onClick={() => {
                    setLgTab('up');
                    setSuStep(1);
                  }}
                >
                  সাইন আপ করুন
                </button>
              </span>
            </div>

            <p className="small muted" style={{ margin: 0 }}>
              মোবাইল নম্বর দেখেই সিস্টেম বুঝে নেয় আপনি কোন প্রতিষ্ঠানের। ডেমো: নমুনা নম্বর আর পাসওয়ার্ড বসানো আছে,
              যেকোনো ধরন বেছে সাইন ইন চাপলেই সেই পোর্টাল খুলবে।
            </p>
          </form>
        )}

        {/* ==============================================================
            2. SIGN UP: STEP 2 FOR FACTORY (PLAN SELECTION)
           ============================================================== */}
        {isUp && suStep === 'plan' && (
          <form
            className="lg-box plan"
            onSubmit={(e) => {
              e.preventDefault();
              setSuStep(2);
            }}
            noValidate
          >
            {renderHeader()}

            <div className="pl-top">
              <h2>আপনার ফ্যাক্টরির জন্য সঠিক প্যাকেজ বাছুন</h2>
              <p className="muted">
                {suD.org} · {bnN(suMc())}টা মেশিন · প্রথম ১ মাস সব প্যাকেজে ফ্রি, আজ কোনো টাকা লাগবে না
              </p>
            </div>

            {/* Bill switcher */}
            <div className="bill">
              <span className={suD.bill === 'm' ? 'on' : ''}>মাসিক পেমেন্ট</span>
              <button
                type="button"
                className={`bill-sw ${suD.bill === 'y' ? 'on' : ''}`}
                role="switch"
                aria-checked={suD.bill === 'y'}
                aria-label="বার্ষিক পেমেন্ট"
                onClick={() => updateSuField('bill', suD.bill === 'y' ? 'm' : 'y')}
              >
                <i />
              </button>
              <span className={suD.bill === 'y' ? 'on' : ''}>বার্ষিক পেমেন্ট</span>
              <em className="bill-off">১০% সাশ্রয়!</em>
              <span className="bill-gift">প্রো আর এন্টারপ্রাইজে সাথে ফ্রি ওয়েবসাইট ও ইমেইল</span>
            </div>

            {/* Plan Cards */}
            <div className="plans">
              {PLANS.map((p) => {
                const count = suMc();
                const fit = planFits(p, count);
                const on = p.k === suD.plan;
                const rec = count && planFor(count).k === p.k;
                const isYr = suD.bill === 'y';
                const price = isYr ? yearly(p) / 12 : p.price;

                return (
                  <div
                    key={p.k}
                    className={`pl ${on ? 'on' : ''} ${!fit ? 'off' : ''} pick`}
                    onClick={() => {
                      if (fit) updateSuField('plan', p.k);
                    }}
                    style={{ cursor: fit ? 'pointer' : 'not-allowed' }}
                  >
                    {rec && <span className="pl-rib">আপনার মেশিন অনুযায়ী</span>}
                    <div className="pl-l">
                      <b className="pl-n">{p.n}</b>
                      <span className="pl-mc">{p.mc}</span>
                      <p className="pl-d">{p.d}</p>
                      <div className="pl-pr">
                        {isYr && <s>{tkB(p.price)}</s>}
                        <b>{tkB(price)}</b>
                        <small>/মাস</small>
                      </div>
                      <div className="pl-sub">
                        {isYr
                          ? `বছরে ${tkB(yearly(p))} একবারে · ${tkB(p.price * 12 - yearly(p))} সাশ্রয়`
                          : 'প্রতি মাসে · যেকোনো মাসে বন্ধ করা যায়'}
                      </div>
                      {p.gift && (
                        <div className={`pl-gift ${isYr ? 'on' : ''}`}>
                          <svg
                            viewBox="0 0 24 24"
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path d="M20 12v9H4v-9" />
                            <path d="M2 7h20v5H2z" />
                            <path d="M12 21V7" />
                            <path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z" />
                          </svg>
                          <div>
                            <b>{isYr ? 'উপহার পাচ্ছেন:' : 'বার্ষিক পেমেন্টে উপহার:'} ফ্রি কোম্পানি ওয়েবসাইট</b>
                            <small>সাথে কোম্পানির নামে ইমেইল — যেমন info@আপনারকোম্পানি.com</small>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pl-r">
                      <hr />
                      <div className="pl-h">{p.h}</div>
                      <ul className="pl-f">
                        {p.f.map(([a, b], idx) => (
                          <li key={idx}>
                            <svg
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                            <span>
                              <b>{a}</b> {b}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {p.note && <p className="pl-note">{p.note}</p>}
                      <button
                        type="button"
                        className="pl-btn"
                        disabled={!fit}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (fit) updateSuField('plan', p.k);
                        }}
                      >
                        {!fit
                          ? `আপনার ${bnN(count)}টা মেশিনে চলবে না`
                          : on
                          ? '✓ বাছাই করা হয়েছে'
                          : 'এই প্যাকেজ বাছুন'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Plan Summary */}
            {(() => {
              const selPlan = PLANS.find((p) => p.k === suD.plan) || PLANS[0];
              return (
                <div className="pl-sum">
                  <div>
                    <span>আজ দিতে হবে</span>
                    <b>৳০</b>
                  </div>
                  <div>
                    <span>ফ্রি মাস শেষ</span>
                    <b>{trialEnd()}</b>
                  </div>
                  <div>
                    <span>তারপর · {selPlan.n}</span>
                    <b>{planDue(selPlan)}</b>
                  </div>
                  {selPlan.gift && suD.bill === 'y' && (
                    <div className="pl-sum-gift">
                      <span>উপহার</span>
                      <b>ফ্রি কোম্পানি ওয়েবসাইট + কোম্পানির ইমেইল</b>
                    </div>
                  )}
                </div>
              );
            })()}

            <p className="small muted" style={{ margin: 0 }}>
              দাম ঠিক হয় শুধু মেশিনের সংখ্যা দিয়ে — গ্রোথ থেকে সব প্যাকেজে একই ফিচার, প্রো আর এন্টারপ্রাইজে বাড়তি বিশেষ
              সাপোর্ট। মেশিন বাড়লে বা কমলে যেকোনো সময় প্যাকেজ বদলাতে পারবেন, আর বড় প্যাকেজ চাইলে আগেই নিতে পারেন। ফ্রি
              মাসের মধ্যে বাদ দিলে কোনো টাকা লাগবে না। পেমেন্ট বিকাশ, নগদ বা ব্যাংকে।
            </p>

            <div className="pl-go">
              <button type="button" className="lnk" onClick={() => setSuStep(1)}>
                ← তথ্য বদলান
              </button>
              <button className="btn pri" type="submit" style={{ padding: '11px 22px' }}>
                {(PLANS.find((p) => p.k === suD.plan) || PLANS[0]).n} প্যাকেজে এগিয়ে যান
              </button>
            </div>
          </form>
        )}

        {/* ==============================================================
            3. SIGN UP: STEP OTP (VERIFY PHONE)
           ============================================================== */}
        {isUp && suStep === 2 && (
          <form className="lg-box" onSubmit={handleOtpSubmit} noValidate>
            {renderHeader()}

            {loginRole === 'fac' && suD.plan && (
              <div className="pl-chosen">
                প্যাকেজ: <b>{PLANS.find((p) => p.k === suD.plan)?.n}</b> · প্রথম মাস ফ্রি · তারপর{' '}
                {planDue(PLANS.find((p) => p.k === suD.plan) || PLANS[0])}
                {PLANS.find((p) => p.k === suD.plan)?.gift && suD.bill === 'y'
                  ? ' · উপহার: ফ্রি ওয়েবসাইট ও ইমেইল'
                  : ''}
              </div>
            )}

            <div className="lg-otp">
              <b>মোবাইল নম্বর যাচাই</b>
              <p className="small muted">
                <span className="mono">{suD.ph}</span> নম্বরে ৬ সংখ্যার একটা কোড পাঠানো হয়েছে। কোডটা নিচে লিখুন।
              </p>
              <label className="fld">
                <span>OTP কোড</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="৬ সংখ্যা"
                  className={`otp ${suErr.otp ? 'bad' : ''}`}
                  value={suD.otp}
                  onChange={(e) => updateSuField('otp', e.target.value)}
                />
                {suErr.otp && <em className="ferr">{suErr.otp}</em>}
              </label>
              <p className="small muted" style={{ margin: 0 }}>
                ডেমো: যেকোনো ৬টা সংখ্যা লিখলেই হবে।
              </p>
            </div>

            <button className="btn pri" type="submit" style={{ padding: '11px' }} disabled={isLoading}>
              {isLoading ? 'যাচাই হচ্ছে…' : 'যাচাই করে অ্যাকাউন্ট খুলুন'}
            </button>

            {loginMsg && (
              <div className="lg-msg" role="status">
                {loginMsg}
              </div>
            )}

            <div className="lg-foot">
              <button
                type="button"
                className="lnk"
                onClick={() => setSuStep(loginRole === 'fac' ? 'plan' : 1)}
              >
                ← তথ্য বদলান
              </button>
              <span>
                কোড পাননি?{' '}
                <button
                  type="button"
                  className="lnk"
                  onClick={() =>
                    addToast({
                      type: 'info',
                      title: 'OTP কোড',
                      message: `${suD.ph} নম্বরে নতুন কোড পাঠানো হয়েছে।`,
                    })
                  }
                >
                  আবার পাঠান
                </button>
              </span>
            </div>
          </form>
        )}

        {/* ==============================================================
            4. SIGN UP: STEP 1 (INITIAL REGISTRATION FORM)
           ============================================================== */}
        {isUp && suStep === 1 && (
          <form className="lg-box" onSubmit={handleSignUpStep1Submit} noValidate>
            {renderHeader()}
            {renderRoles('আপনি কী হিসেবে অ্যাকাউন্ট খুলছেন?')}

            <datalist id="suAreaList">
              {SU_AREA.map((area) => (
                <option key={area} value={area} />
              ))}
            </datalist>

            <div className="lg-f">
              {/* Name */}
              <label className="fld full">
                <span>
                  আপনার নাম <b className="req">*</b>
                </span>
                <input
                  type="text"
                  placeholder="পুরো নাম"
                  autoComplete="name"
                  value={suD.name}
                  className={suErr.name ? 'bad' : ''}
                  onChange={(e) => updateSuField('name', e.target.value)}
                />
                {suErr.name && <em className="ferr">{suErr.name}</em>}
              </label>

              {/* Mobile Phone */}
              <label className="fld">
                <span>
                  মোবাইল নম্বর <b className="req">*</b>
                </span>
                <input
                  type="text"
                  inputMode="tel"
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel"
                  value={suD.ph}
                  className={suErr.ph ? 'bad' : ''}
                  onChange={(e) => updateSuField('ph', e.target.value)}
                />
                {suErr.ph && <em className="ferr">{suErr.ph}</em>}
              </label>

              {/* Email */}
              <label className="fld">
                <span>
                  ইমেইল <b className="req">*</b>
                </span>
                <input
                  type="email"
                  inputMode="email"
                  placeholder="যেমন: rahman@gmail.com"
                  autoComplete="email"
                  value={suD.em}
                  className={suErr.em ? 'bad' : ''}
                  onChange={(e) => updateSuField('em', e.target.value)}
                />
                {suErr.em && <em className="ferr">{suErr.em}</em>}
              </label>

              {/* Pricing Note */}
              <div className={`su-note ${loginRole === 'fac' ? '' : 'free'}`}>
                {loginRole === 'fac' ? (
                  <span>
                    ফ্যাক্টরির জন্য <b>প্রথম ১ মাস ফ্রি</b>। পরের ধাপে মেশিনের সংখ্যা অনুযায়ী প্যাকেজ বাছবেন।
                  </span>
                ) : (
                  <span>
                    {ROLES.find((x) => x[0] === loginRole)?.[1]}দের জন্য নিটখাতা <b>সম্পূর্ণ ফ্রি</b>, কোনো মাসিক ফি নেই।
                  </span>
                )}
              </div>

              {/* Role-Specific Fields */}
              {loginRole === 'fac' && (
                <>
                  <label className="fld full">
                    <span>
                      ফ্যাক্টরির নাম <b className="req">*</b>
                    </span>
                    <input
                      type="text"
                      placeholder="যেমন: রহমান নিটিং ইন্ডাস্ট্রিজ"
                      value={suD.org}
                      className={suErr.org ? 'bad' : ''}
                      onChange={(e) => updateSuField('org', e.target.value)}
                    />
                    {suErr.org && <em className="ferr">{suErr.org}</em>}
                  </label>

                  <label className="fld">
                    <span>
                      এলাকা <b className="req">*</b>
                    </span>
                    <input
                      type="text"
                      list="suAreaList"
                      placeholder="যেমন: কোনাবাড়ি, গাজীপুর"
                      value={suD.area}
                      className={suErr.area ? 'bad' : ''}
                      onChange={(e) => updateSuField('area', e.target.value)}
                    />
                    {suErr.area && <em className="ferr">{suErr.area}</em>}
                  </label>

                  <label className="fld">
                    <span>
                      কয়টা নিটিং মেশিন আছে <b className="req">*</b>
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="যেমন: 24"
                      value={suD.mc}
                      className={suErr.mc ? 'bad' : ''}
                      onChange={(e) => updateSuField('mc', e.target.value)}
                    />
                    {suErr.mc && <em className="ferr">{suErr.mc}</em>}
                  </label>

                  <div className="fld full">
                    <span>আপনার পদ</span>
                    <div className="seg2" role="radiogroup">
                      {['মালিক', 'ম্যানেজার'].map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          role="radio"
                          aria-checked={suD.pos === pos}
                          className={suD.pos === pos ? 'on' : ''}
                          onClick={() => updateSuField('pos', pos)}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                    <small className="muted hint">
                      স্টাফদের আলাদা করে সাইন আপ করতে হবে না। ফ্যাক্টরির অ্যাকাউন্ট খোলার পর মালিক বা ম্যানেজার সেটিংস
                      থেকে স্টাফ যোগ করবেন, স্টাফ SMS-এ লগইন পাবেন।
                    </small>
                  </div>
                </>
              )}

              {loginRole === 'ven' && (
                <>
                  <label className="fld full">
                    <span>
                      প্রতিষ্ঠানের নাম <b className="req">*</b>
                    </span>
                    <input
                      type="text"
                      placeholder="যেমন: ABC Knit Composite"
                      value={suD.org}
                      className={suErr.org ? 'bad' : ''}
                      onChange={(e) => updateSuField('org', e.target.value)}
                    />
                    {suErr.org && <em className="ferr">{suErr.org}</em>}
                  </label>

                  <div className="fld full">
                    <span>প্রতিষ্ঠানের ধরন</span>
                    <div className="seg2" role="radiogroup">
                      {['কম্পোজিট', 'বায়িং হাউস', 'গার্মেন্টস'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={suD.vt === type}
                          className={suD.vt === type ? 'on' : ''}
                          onClick={() => updateSuField('vt', type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="fld">
                    <span>
                      আপনার পদবি <i className="opt">(ঐচ্ছিক)</i>
                    </span>
                    <input
                      type="text"
                      placeholder="যেমন: মার্চেন্ডাইজার"
                      value={suD.desig}
                      onChange={(e) => updateSuField('desig', e.target.value)}
                    />
                  </label>

                  <label className="fld">
                    <span>
                      এলাকা <i className="opt">(ঐচ্ছিক)</i>
                    </span>
                    <input
                      type="text"
                      list="suAreaList"
                      placeholder="যেমন: আশুলিয়া"
                      value={suD.area}
                      onChange={(e) => updateSuField('area', e.target.value)}
                    />
                  </label>
                </>
              )}

              {loginRole === 'sup' && (
                <>
                  <label className="fld full">
                    <span>
                      প্রতিষ্ঠানের নাম <b className="req">*</b>
                    </span>
                    <input
                      type="text"
                      placeholder="যেমন: নিটপার্টস ট্রেডিং"
                      value={suD.org}
                      className={suErr.org ? 'bad' : ''}
                      onChange={(e) => updateSuField('org', e.target.value)}
                    />
                    {suErr.org && <em className="ferr">{suErr.org}</em>}
                  </label>

                  <div className="fld full">
                    <span>
                      কী কী সাপ্লাই করেন <b className="req">*</b>
                    </span>
                    <div className="chips2">
                      {SU_SUP.map((item) => (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={suD.items.includes(item)}
                          className={suD.items.includes(item) ? 'on' : ''}
                          onClick={() => toggleSupplierItem(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    {suErr.items && <em className="ferr">{suErr.items}</em>}
                  </div>

                  <label className="fld full">
                    <span>
                      এলাকা <b className="req">*</b>
                    </span>
                    <input
                      type="text"
                      list="suAreaList"
                      placeholder="যেমন: নারায়ণগঞ্জ"
                      value={suD.area}
                      className={suErr.area ? 'bad' : ''}
                      onChange={(e) => updateSuField('area', e.target.value)}
                    />
                    {suErr.area && <em className="ferr">{suErr.area}</em>}
                  </label>
                </>
              )}

              {/* Password & Confirm */}
              <div className="pwrow">
                <label className="fld">
                  <span>
                    পাসওয়ার্ড <b className="req">*</b>
                  </span>
                  <input
                    type="password"
                    placeholder="কমপক্ষে ৮ অক্ষর"
                    autoComplete="new-password"
                    value={suD.pw}
                    className={suErr.pw ? 'bad' : ''}
                    onChange={(e) => updateSuField('pw', e.target.value)}
                  />
                  {suErr.pw && <em className="ferr">{suErr.pw}</em>}
                </label>
                <label className="fld">
                  <span>
                    পাসওয়ার্ড আবার <b className="req">*</b>
                  </span>
                  <input
                    type="password"
                    placeholder="আবার লিখুন"
                    autoComplete="new-password"
                    value={suD.pw2}
                    className={suErr.pw2 ? 'bad' : ''}
                    onChange={(e) => updateSuField('pw2', e.target.value)}
                  />
                  {suErr.pw2 && <em className="ferr">{suErr.pw2}</em>}
                </label>
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <label className="lg-agree">
              <input
                type="checkbox"
                checked={suD.agree}
                onChange={(e) => updateSuField('agree', e.target.checked)}
              />
              <span>নিটখাতার শর্তাবলি আর গোপনীয়তা নীতি পড়েছি ও মেনে নিচ্ছি</span>
            </label>
            {suErr.agree && <em className="ferr">{suErr.agree}</em>}

            <button className="btn pri" type="submit" style={{ padding: '11px' }}>
              {roleTitle} হিসেবে সাইন আপ করুন
            </button>

            <div className="lg-foot">
              <span>
                আগেই অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  className="lnk"
                  onClick={() => {
                    setLgTab('in');
                    setSuStep(1);
                  }}
                >
                  সাইন ইন করুন
                </button>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const AuthPage = AuthScreen;

