import React from 'react';
import { useApp } from '@/context/AppContext';
import { bnNum } from '@/utils/formatters';

export const VendorReportPage: React.FC = () => {
  const { orders, deliveryChallans, addToast } = useApp();

  const vendorOrders = orders.filter(
    (o) =>
      o.party_code === 'abc' ||
      o.party === 'abc' ||
      o.v === 'abc' ||
      (o.party && o.party.includes('ABC'))
  );

  const totalDelivered = vendorOrders.reduce(
    (a, o) => a + (o.delivered || 0),
    0
  );
  const totalBilled = 126000;
  const totalPaid = 70000;
  const totalDue = totalBilled - totalPaid;

  const handleExportExcel = () => {
    addToast({
      type: 'success',
      title: 'Excel রিপোর্ট ডাউনলোড হয়েছে',
      message: 'ABC_Knit_Daily_Summary_2026-10-03.xlsx প্রস্তুত হয়েছে।',
    });
  };

  return (
    <div style={{ maxWidth: '100%', width: '100%' }}>
      {/* Top Banner */}
      <div className="vbanner" style={{ marginBottom: 16 }}>
        ABC Knit Composite-এর জন্য এক্সিকিউটিভ প্রোডাকশন ও কোয়ালিটি সামারি।
      </div>

      {/* Header */}
      <div className="head">
        <div>
          <h2>দৈনিক এক্সিকিউটিভ রিপোর্ট</h2>
          <p>০৩ অক্টোবর ২০২৬ · রহমান নিটিং ইন্ডাস্ট্রিজে আপনার কাজের অবস্থা</p>
        </div>
        <div className="row no-pdf" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn sm"
            onClick={() => window.print()}
          >
            প্রিন্ট
          </button>
          <button
            type="button"
            className="btn pri sm"
            onClick={handleExportExcel}
          >
            Excel নামান
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="kpis">
        <div className="kpi">
          <span>আজকের মোট উৎপাদন</span>
          <b>৫৭৩ kg</b>
          <i>৩টি মেশিনে বোনা হয়েছে</i>
        </div>
        <div className="kpi">
          <span>QC পাস রেট</span>
          <b style={{ color: 'var(--ok)' }}>৯৮.২%</b>
          <i>দুই পক্ষের সম্মতিতে পাস</i>
        </div>
        <div className="kpi">
          <span>মোট ডেলিভারি চালান</span>
          <b>{bnNum(totalDelivered)} kg</b>
          <i>{bnNum(deliveryChallans.length)}টি চালানে পাঠানো</i>
        </div>
        <div className="kpi">
          <span>বর্তমান বাকি বিল</span>
          <b style={{ color: 'var(--bad)' }}>৳ {bnNum(totalDue)}</b>
          <i>BL-2610-001</i>
        </div>
      </div>

      <div className="grid g2" style={{ marginBottom: 20 }}>
        {/* Shift Breakdown Card */}
        <div className="card">
          <h3>আজকের শিফট অনুযায়ী উৎপাদন</h3>
          <div className="tw" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>শিফট</th>
                  <th>মেশিন</th>
                  <th>অপারেটর</th>
                  <th className="n">রোল</th>
                  <th className="n">ওজন (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="pill p-acc">শিফট A</span>
                  </td>
                  <td className="mono">M-03</td>
                  <td>জসিম উদ্দিন</td>
                  <td className="n">৮</td>
                  <td className="n">১৮৬</td>
                </tr>
                <tr>
                  <td>
                    <span className="pill p-acc">শিফট A</span>
                  </td>
                  <td className="mono">M-04</td>
                  <td>সোহেল রানা</td>
                  <td className="n">৮</td>
                  <td className="n">১৯১</td>
                </tr>
                <tr>
                  <td>
                    <span className="pill p-acc">শিফট A</span>
                  </td>
                  <td className="mono">M-07</td>
                  <td>আলমগীর কবির</td>
                  <td className="n">৭</td>
                  <td className="n">১৭২</td>
                </tr>
                <tr>
                  <td>
                    <span className="pill p-yarn">শিফট A (কিলিং)</span>
                  </td>
                  <td className="mono">M-08</td>
                  <td>রিপন মাহমুদ</td>
                  <td className="n">৬</td>
                  <td className="n">২৪ (কলার)</td>
                </tr>
                <tr className="totrow" style={{ fontWeight: 700, background: 'var(--surface2)' }}>
                  <td colSpan={3}>মোট উৎপাদন</td>
                  <td className="n">২৯</td>
                  <td className="n">৫৭৩ kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Yarn Status & Loss Statement */}
        <div className="card">
          <h3>সুতা গ্রহণ ও প্রসেস লস ট্র্যাকার</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface2)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>Square Yarns · 30/1 Combed Cotton</b>
                <span className="pill p-ok">লট SQ-88419</span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '.88rem' }}>
                প্রাপ্ত সুতা: <b>৫,০০০ kg</b> · বোনা হয়েছে: <b>৪,৭৮০ kg</b>
                <br />
                প্রসেস লস: <b>২.৮%</b> (অনুমোদিত ৩% সীমার মধ্যে রয়েছে) · বাড়তি সুতা ফেরত প্রস্তুত
              </p>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'var(--surface2)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>Hyosung · 20D Spandex</b>
                <span className="pill p-ok">লট HY-2207</span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '.88rem' }}>
                প্রাপ্ত সুতা: <b>২০০ kg</b> · বোনা হয়েছে: <b>১৯২ kg</b>
                <br />
                ব্যালেন্স: <b>৮ kg</b> অবশিষ্টাংশ সংরক্ষিত
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

