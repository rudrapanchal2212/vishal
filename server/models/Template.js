const mongoose = require('mongoose');

const TemplateItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: '' },
  rate: { type: Number, default: 0 },
  amount: { type: Number, required: true, default: 0 }
}, { _id: false });

const TemplateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  categoryOfService: {
    type: String,
    default: 'Civil Construction Work'
  },
  items: [TemplateItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  gstEnabled: {
    type: Boolean,
    default: false
  },
  gstPercent: {
    type: Number,
    default: 18
  },
  notes: {
    type: String,
    default: ''
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Template', TemplateSchema);
