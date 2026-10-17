import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { PageLoader } from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import QuickGenerateModal from '../components/template/QuickGenerateModal';
import { templateService } from '../services/templateService';
import { formatCurrency } from '../utils/amountToWords';
import toast from 'react-hot-toast';

const EMPTY_ITEM = { description: '', quantity: 1, unit: '', rate: 0, amount: '' };

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [selectedTemplateForQuick, setSelectedTemplateForQuick] = useState(null);

  // Edit / Create Template Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryOfService: 'Civil Construction Work',
    items: [{ ...EMPTY_ITEM }]
  });

  const loadTemplates = async () => {
    try {
      const res = await templateService.getAll();
      setTemplates(res.data.data || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
      toast.error('Failed to load estimate templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openQuickGenerate = (template = null) => {
    setSelectedTemplateForQuick(template ? template._id : null);
    setQuickModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      categoryOfService: 'Civil Construction Work',
      items: [{ ...EMPTY_ITEM }]
    });
    setEditModalOpen(true);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      categoryOfService: template.categoryOfService || 'Civil Construction Work',
      items: template.items.map((i) => ({
        description: i.description,
        quantity: i.quantity || 1,
        unit: i.unit || '',
        rate: i.rate || 0,
        amount: i.amount
      }))
    });
    setEditModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...EMPTY_ITEM }]
    }));
  };

  const removeItemRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return toast.error('Please enter a template name');
    }
    if (formData.items.length === 0) {
      return toast.error('Please add at least one work item');
    }
    if (formData.items.some((i) => !i.description.trim())) {
      return toast.error('All item descriptions are required');
    }
    if (formData.items.some((i) => !i.amount || isNaN(i.amount))) {
      return toast.error('All items must have valid amounts');
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        items: formData.items.map((i) => ({
          ...i,
          amount: parseFloat(i.amount),
          quantity: parseFloat(i.quantity) || 1
        }))
      };

      if (editingTemplate) {
        await templateService.update(editingTemplate._id, payload);
        toast.success('Template updated successfully!');
      } else {
        await templateService.create(payload);
        toast.success('Template created successfully!');
      }

      setEditModalOpen(false);
      loadTemplates();
    } catch (err) {
      console.error('Failed to save template:', err);
      toast.error(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return;
    try {
      await templateService.delete(id);
      toast.success('Template deleted');
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Delete template error:', err);
      toast.error('Failed to delete template');
    }
  };

  const formTotalAmount = formData.items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  if (loading) {
    return (
      <MainLayout>
        <PageLoader />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-primary-600">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              Estimate Templates
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Reusable construction estimates with fixed static items. Instantly generate printable bills in 2 clicks.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => openQuickGenerate()}
              className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-600/20"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Quick Generate Bill
            </button>
            <button
              onClick={openCreateModal}
              className="btn-secondary flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Template
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <p className="text-lg font-medium text-gray-700 dark:text-slate-300">No templates found</p>
            <p className="text-sm mt-1">Create a new template to start generating quick documents.</p>
            <button onClick={openCreateModal} className="btn-primary mt-4">
              + Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <div
                key={tpl._id}
                className="card flex flex-col justify-between overflow-hidden border border-gray-100 dark:border-slate-700/80 hover:shadow-xl transition-all duration-300"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                        {tpl.name}
                      </h3>
                      {tpl.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          {tpl.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 whitespace-nowrap">
                      {formatCurrency(tpl.totalAmount)}
                    </span>
                  </div>

                  {/* Static Items Summary */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                        Fixed Items ({tpl.items?.length || 0})
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {tpl.categoryOfService}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {tpl.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start text-xs bg-gray-50 dark:bg-slate-700/40 p-2 rounded-lg"
                        >
                          <span className="text-gray-700 dark:text-slate-300 font-medium pr-2 line-clamp-2">
                            {idx + 1}. {item.description}
                          </span>
                          <span className="font-mono font-bold text-gray-900 dark:text-white flex-shrink-0">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openQuickGenerate(tpl)}
                    className="btn-primary text-xs sm:text-sm py-2 px-3.5 flex-1 flex items-center justify-center gap-1.5 font-bold"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Generate Document
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(tpl)}
                      className="p-2 text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      title="Edit Template"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tpl._id, tpl.name)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete Template"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Document Generation Modal */}
        <QuickGenerateModal
          isOpen={quickModalOpen}
          onClose={() => setQuickModalOpen(false)}
          initialTemplateId={selectedTemplateForQuick}
        />

        {/* Create / Edit Template Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          size="lg"
          title={editingTemplate ? 'Edit Estimate Template' : 'Create New Estimate Template'}
        >
          <form onSubmit={handleSaveTemplate} className="space-y-4">
            <div>
              <label className="form-label font-bold">Template Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 2 Lakh Road Costing, 3 Lakh Road Costing, Standard Shed"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Category of Service</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Civil Construction Work"
                  value={formData.categoryOfService}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryOfService: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label">Description Note (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gram Panchayat Road work estimate"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>

            {/* Static Item Descriptions & Quantities */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  Static Work Items (Fixed Pre-filled Data)
                </span>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Item
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {formData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-slate-700/40 rounded-xl space-y-2 border border-gray-200 dark:border-slate-600"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                        Item #{idx + 1}
                      </span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <textarea
                        className="form-input text-xs"
                        rows={2}
                        placeholder="Item description (e.g., Excavation of road surface & earthwork)"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 block">Quantity</label>
                        <input
                          type="number"
                          className="form-input text-xs py-1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block">Unit</label>
                        <input
                          type="text"
                          className="form-input text-xs py-1"
                          placeholder="cu.m / sq.ft"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 block">Amount (₹) *</label>
                        <input
                          type="number"
                          className="form-input text-xs py-1 font-bold"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total preview */}
              <div className="mt-3 flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                <span className="text-xs font-semibold text-primary-800 dark:text-primary-300">
                  Total Static Amount:
                </span>
                <span className="text-sm font-bold text-primary-900 dark:text-primary-100">
                  {formatCurrency(formTotalAmount)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-6"
              >
                {saving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Save Template'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}
