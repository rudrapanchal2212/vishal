import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import InvoicePreview from '../invoice/InvoicePreview';
import { templateService } from '../../services/templateService';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import { todayInputValue } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/amountToWords';
import { generatePDF, printInvoice } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

export default function QuickGenerateModal({
  isOpen,
  onClose,
  initialTemplateId = null,
  onGenerated = null
}) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId || '');
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(todayInputValue());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setGeneratedInvoice(null);
      return;
    }

    setLoading(true);
    Promise.all([
      templateService.getAll(),
      customerService.getAll()
    ])
      .then(([tplRes, custRes]) => {
        const tpls = tplRes.data.data || [];
        setTemplates(tpls);
        setCustomers(custRes.data.data || []);

        if (initialTemplateId) {
          setSelectedTemplateId(initialTemplateId);
        } else if (tpls.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(tpls[0]._id);
        }
      })
      .catch((err) => {
        console.error('Failed to load templates/customers', err);
        toast.error('Failed to load templates');
      })
      .finally(() => setLoading(false));
  }, [isOpen, initialTemplateId]);

  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

  const handleSelectCustomer = (e) => {
    const custId = e.target.value;
    if (!custId) return;
    const cust = customers.find((c) => c._id === custId);
    if (cust) {
      setCustomerName(cust.name);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!selectedTemplateId) {
      return toast.error('Please select an estimate template');
    }
    if (!customerName.trim()) {
      return toast.error('Please enter Customer / Panchayat Name');
    }
    if (!date) {
      return toast.error('Please select a document date');
    }

    setGenerating(true);
    try {
      const res = await templateService.instantiate(selectedTemplateId, {
        customerName: customerName.trim(),
        date
      });

      const invoice = res.data.data;
      setGeneratedInvoice(invoice);
      toast.success('Document generated successfully!');
      if (onGenerated) onGenerated(invoice);
    } catch (err) {
      console.error('Document generation error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedInvoice) return;
    setDownloadingPDF(true);
    try {
      await generatePDF(
        'quick-doc-preview',
        `Estimate-${generatedInvoice.customerName}-Bill${generatedInvoice.billNumber}.pdf`
      );
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={generatedInvoice ? 'xl' : 'lg'}
      title={
        generatedInvoice
          ? 'Final Document Ready (Print / PDF Export)'
          : '⚡ Instant Document from Template'
      }
    >
      {generatedInvoice ? (
        // Generated Document View
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div>
              <p className="text-sm font-bold text-green-900 dark:text-green-300">
                ✅ Generated Bill #{generatedInvoice.billNumber} for {generatedInvoice.customerName}
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                Total: {formatCurrency(generatedInvoice.grandTotal || generatedInvoice.totalAmount)} · {generatedInvoice.items?.length || 0} work items
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                disabled={downloadingPDF}
                className="btn-primary text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {downloadingPDF ? 'Downloading...' : 'Download PDF'}
              </button>
              <button
                onClick={() => printInvoice('quick-doc-preview')}
                className="btn-secondary text-xs sm:text-sm py-2 px-3 flex items-center gap-1.5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print
              </button>
              <button
                onClick={() => {
                  setGeneratedInvoice(null);
                  setCustomerName('');
                }}
                className="btn-secondary text-xs sm:text-sm py-2 px-3"
              >
                Create Another
              </button>
            </div>
          </div>

          <div
            id="quick-doc-preview-wrapper"
            className="overflow-auto max-h-[65vh] border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-100 dark:bg-slate-900 p-2"
          >
            <div id="quick-doc-preview">
              <InvoicePreview invoice={generatedInvoice} contractor={user} />
            </div>
          </div>
        </div>
      ) : (
        // Input Form
        <form onSubmit={handleGenerate} className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Select a saved template and provide the <strong>Customer Name</strong> and <strong>Date</strong>. The system will instantly compile the static items into a printable document.
          </p>

          {/* 1. Template Dropdown */}
          <div>
            <label className="form-label font-bold text-gray-800 dark:text-slate-200">
              1. Select Estimate Template *
            </label>
            <select
              className="form-input font-medium"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">-- Choose Template --</option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({formatCurrency(t.totalAmount)})
                </option>
              ))}
            </select>
          </div>

          {/* Static Data Summary */}
          {selectedTemplate && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 border border-gray-100 dark:border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  Static Data (Fixed & Pre-filled)
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                  Fixed Total: {formatCurrency(selectedTemplate.totalAmount)}
                </span>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {selectedTemplate.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start text-xs text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded-lg border border-gray-100 dark:border-slate-700"
                  >
                    <span className="flex-1 font-medium pr-2">
                      {idx + 1}. {item.description}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 px-2 flex-shrink-0">
                      Qty: {item.quantity !== undefined && item.quantity !== null ? item.quantity : 1}{item.unit ? ` ${item.unit}` : ''}
                    </span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white flex-shrink-0">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Dynamic Input Fields: Customer Name & Date */}
          <div className="border-t border-gray-100 dark:border-slate-700 pt-3 space-y-3">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
              Dynamic Data (Enter to Instantiate)
            </span>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="form-label !mb-0 font-bold text-gray-800 dark:text-slate-200">
                  2. Customer / Panchayat Name *
                </label>
                {customers.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>or pick existing:</span>
                    <select
                      className="text-xs bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded px-1.5 py-0.5"
                      onChange={handleSelectCustomer}
                      defaultValue=""
                    >
                      <option value="">Select...</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <input
                type="text"
                className="form-input text-base"
                placeholder="e.g. Gram Panchayat Bholav / Shri Ramesh Patel"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="form-label font-bold text-gray-800 dark:text-slate-200">
                3. Document Date *
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={generating || !selectedTemplateId || !customerName.trim()}
              className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Document...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Generate Final Document
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
