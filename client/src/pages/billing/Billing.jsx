import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Clock,
  Plus,
  CheckCircle2,
  DollarSign,
  FileText,
  CreditCard,
  Building,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import api from '../../api/axios';

export default function Billing() {
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'timesheets'
  const [invoices, setInvoices] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);

  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [payModalInvoice, setPayModalInvoice] = useState(null);
  const [processingPay, setProcessingPay] = useState(false);

  // New Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    caseId: '',
    clientId: '',
    description: 'Legal Representation & Senior Advocate Appearance Dues',
    rate: '50000',
    quantity: '1',
    isInterState: false,
    notes: 'Legal Professional Services under HSN/SAC Code 998211.',
  });

  // New Timesheet Form
  const [timesheetForm, setTimesheetForm] = useState({
    caseId: '',
    description: '',
    hours: '2.5',
    ratePerHour: '4500',
  });

  const fetchData = async () => {
    try {
      const [invRes, tsRes, casesRes, clientRes] = await Promise.all([
        api.get('/billing/invoices'),
        api.get('/billing/timesheets'),
        api.get('/cases'),
        api.get('/clients'),
      ]);
      setInvoices(invRes.data || []);
      setTimesheets(tsRes.data || []);
      setCases(casesRes.data || []);
      setClients(clientRes.data || []);
    } catch (e) {
      console.error('Failed to fetch billing data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        caseId: invoiceForm.caseId,
        clientId: invoiceForm.clientId,
        items: [
          {
            description: invoiceForm.description,
            sacCode: '998211',
            quantity: parseFloat(invoiceForm.quantity),
            rate: parseFloat(invoiceForm.rate),
          },
        ],
        isInterState: invoiceForm.isInterState,
        notes: invoiceForm.notes,
      };

      await api.post('/billing/invoices', payload);
      setShowInvoiceModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to generate GST invoice.');
    }
  };

  const handleCreateTimesheet = async (e) => {
    e.preventDefault();
    try {
      await api.post('/billing/timesheets', timesheetForm);
      setShowTimesheetModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to log timesheet.');
    }
  };

  const handleSimulatePayment = async () => {
    if (!payModalInvoice) return;
    setProcessingPay(true);
    try {
      const res = await api.post('/billing/pay-stub', {
        invoiceId: payModalInvoice.id,
        paymentMethod: 'Razorpay UPI / NetBanking Stub',
        transactionRef: `RZP_LIVE_${Math.floor(100000 + Math.random() * 900000)}`,
      });
      alert(res.data.message);
      setPayModalInvoice(null);
      fetchData();
    } catch (err) {
      alert('Payment processing failed');
    } finally {
      setProcessingPay(false);
    }
  };

  const totalBilled = invoices.reduce((acc, i) => acc + i.netPayable, 0);
  const totalCollected = invoices.filter((i) => i.status === 'PAID').reduce((acc, i) => acc + i.netPayable, 0);

  return (
    <div className="space-y-6">
      {/* Top Title & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            GST Invoicing & Time Tracking
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            SAC 998211 legal billing, CGST/SGST/IGST breakdown, Sec 194J TDS deductions, and Razorpay checkout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#111113] p-1 rounded-full border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'invoices'
                  ? 'bg-white text-black shadow'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              GST Invoices
            </button>
            <button
              onClick={() => setActiveTab('timesheets')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'timesheets'
                  ? 'bg-white text-black shadow'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              Timesheets
            </button>
          </div>

          {activeTab === 'invoices' ? (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-4 py-2 bg-white text-[#0A0A0A] font-bold text-xs rounded-full hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Issue GST Invoice</span>
            </button>
          ) : (
            <button
              onClick={() => setShowTimesheetModal(true)}
              className="px-4 py-2 bg-white text-[#0A0A0A] font-bold text-xs rounded-full hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Hours</span>
            </button>
          )}
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-1">
          <span className="text-xs text-[#9CA3AF]">Total Net Billed (Post TDS 194J)</span>
          <div className="text-2xl font-extrabold text-white">
            ₹{totalBilled.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-1">
          <span className="text-xs text-[#9CA3AF]">Collected Revenue</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-1">
          <span className="text-xs text-[#9CA3AF]">Outstanding Dues</span>
          <div className="text-2xl font-extrabold text-amber-400">
            ₹{(totalBilled - totalCollected).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* TAB 1: GST INVOICES */}
      {activeTab === 'invoices' && (
        <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#9CA3AF] border-b border-white/[0.08]">
                <th className="pb-3 font-semibold">Invoice No.</th>
                <th className="pb-3 font-semibold">Client Name</th>
                <th className="pb-3 font-semibold">SAC Code & Subtotal</th>
                <th className="pb-3 font-semibold">GST (18%)</th>
                <th className="pb-3 font-semibold">TDS 194J (10%)</th>
                <th className="pb-3 font-semibold">Net Payable</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 pr-3 font-bold text-white font-mono">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 text-gray-300">
                    <div className="font-bold text-white">
                      {inv.client?.companyName || inv.client?.name}
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]">GST: {inv.client?.gstNo || 'N/A'}</div>
                  </td>
                  <td className="py-3.5 font-mono text-gray-300">
                    <div>₹{inv.subtotal?.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-[#9CA3AF]">SAC: {inv.sacCode}</div>
                  </td>
                  <td className="py-3.5 font-mono text-[#9CA3AF]">
                    ₹{(inv.cgst + inv.sgst + inv.igst).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 font-mono text-amber-400">
                    -₹{inv.tdsAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 font-mono font-bold text-white">
                    ₹{inv.netPayable?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    {inv.status !== 'PAID' ? (
                      <button
                        onClick={() => setPayModalInvoice(inv)}
                        className="px-3 py-1 bg-white text-black font-bold text-[11px] rounded-full hover:bg-gray-100 transition-all inline-flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-amber-500" /> Pay Stub
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: TIMESHEETS */}
      {activeTab === 'timesheets' && (
        <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#9CA3AF] border-b border-white/[0.08]">
                <th className="pb-3 font-semibold">Advocate</th>
                <th className="pb-3 font-semibold">Case Matter</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold">Hours</th>
                <th className="pb-3 font-semibold">Rate/Hr</th>
                <th className="pb-3 font-semibold text-right">Billable Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {timesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-bold text-white">{ts.user?.fullName}</td>
                  <td className="py-3.5 text-gray-300">
                    <div className="font-bold text-white">{ts.case?.caseNumber}</div>
                    <div className="text-[10px] text-[#9CA3AF] max-w-[180px] truncate">
                      {ts.case?.title}
                    </div>
                  </td>
                  <td className="py-3.5 text-[#9CA3AF] max-w-[220px] truncate">
                    {ts.description}
                  </td>
                  <td className="py-3.5 font-mono text-amber-300 font-bold">{ts.hours} hrs</td>
                  <td className="py-3.5 font-mono text-gray-300">
                    ₹{ts.ratePerHour?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-white">
                    ₹{(ts.hours * ts.ratePerHour).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE GST INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.15] rounded-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-white">Generate Indian GST Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Select Case Matter</label>
                <select
                  required
                  value={invoiceForm.caseId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const cItem = cases.find((cs) => cs.id === cId);
                    setInvoiceForm({
                      ...invoiceForm,
                      caseId: cId,
                      clientId: cItem?.clientId || '',
                    });
                  }}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                >
                  <option value="">Select Case...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Line Item Description</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Rate (INR)</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.rate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, rate: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Quantity / Hours</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.quantity}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, quantity: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="interstate"
                  checked={invoiceForm.isInterState}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, isInterState: e.target.checked })}
                  className="w-4 h-4 accent-white rounded"
                />
                <label htmlFor="interstate" className="text-gray-300 font-medium">
                  Inter-State Client (Apply 18% IGST instead of CGST/SGST)
                </label>
              </div>

              <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/[0.08] text-[11px] text-[#9CA3AF] space-y-1 font-mono">
                <div>SAC Code: 998211 (Legal Services)</div>
                <div>Subtotal: ₹{(parseFloat(invoiceForm.rate || 0) * parseFloat(invoiceForm.quantity || 1)).toLocaleString('en-IN')}</div>
                <div>GST (18%): ₹{((parseFloat(invoiceForm.rate || 0) * parseFloat(invoiceForm.quantity || 1)) * 0.18).toLocaleString('en-IN')}</div>
                <div className="text-amber-400 font-bold">Less TDS Sec 194J (10%): -₹{((parseFloat(invoiceForm.rate || 0) * parseFloat(invoiceForm.quantity || 1)) * 0.10).toLocaleString('en-IN')}</div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-1/2 py-2.5 bg-white/10 text-white font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-100"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG TIMESHEET MODAL */}
      {showTimesheetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.15] rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-white">Log Advocate Billable Hours</h3>
              <button onClick={() => setShowTimesheetModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTimesheet} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Select Case Matter</label>
                <select
                  required
                  value={timesheetForm.caseId}
                  onChange={(e) => setTimesheetForm({ ...timesheetForm, caseId: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                >
                  <option value="">Select Case...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Activity / Research Description</label>
                <input
                  type="text"
                  required
                  placeholder="High Court Oral Arguments & Case Law Research"
                  value={timesheetForm.description}
                  onChange={(e) => setTimesheetForm({ ...timesheetForm, description: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={timesheetForm.hours}
                    onChange={(e) => setTimesheetForm({ ...timesheetForm, hours: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={timesheetForm.ratePerHour}
                    onChange={(e) => setTimesheetForm({ ...timesheetForm, ratePerHour: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowTimesheetModal(false)}
                  className="w-1/2 py-2.5 bg-white/10 text-white font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-100"
                >
                  Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAZORPAY / PAYU PAYMENT CHECKOUT STUB MODAL */}
      {payModalInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.15] rounded-2xl max-w-md w-full p-6 space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full">
                Razorpay / PayU India Gateway Stub
              </span>
              <h3 className="text-xl font-bold text-white mt-2">
                Clear Invoice {payModalInvoice.invoiceNumber}
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Net Payable (Post 10% TDS 194J Deduction):
              </p>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-2">
                ₹{payModalInvoice.netPayable?.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/[0.08] text-xs text-left space-y-2 text-gray-300 font-mono">
              <div>Client: {payModalInvoice.client?.companyName || payModalInvoice.client?.name}</div>
              <div>GSTIN: {payModalInvoice.client?.gstNo || 'N/A'}</div>
              <div>SAC Code: 998211</div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayModalInvoice(null)}
                className="w-1/2 py-3 bg-white/10 text-white font-bold rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={processingPay}
                className="w-1/2 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-100 shadow-lg"
              >
                {processingPay ? 'Verifying...' : 'Simulate Payment ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
