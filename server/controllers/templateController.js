const Template = require('../models/Template');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const amountToWords = require('../utils/amountToWords');

const DEFAULT_TEMPLATES = [
  {
    name: '2 Lakh Material Estimate (Panchayat)',
    description: 'Panchayat estimate - METAL, CEMENT, RETI, CONCRETE, LABOUR - ₹2,00,000',
    categoryOfService: 'Civil Construction Work',
    gstEnabled: false,
    gstPercent: 18,
    items: [
      {
        description: 'METAL',
        quantity: null,
        unit: '',
        rate: 50000,
        amount: 50000
      },
      {
        description: 'CEMENT',
        quantity: 100,
        unit: '',
        rate: 400,
        amount: 40000
      },
      {
        description: 'RETI',
        quantity: 1,
        unit: '',
        rate: 40000,
        amount: 40000
      },
      {
        description: 'CONCRETE',
        quantity: 1,
        unit: '',
        rate: 30000,
        amount: 30000
      },
      {
        description: 'LABOUR',
        quantity: null,
        unit: '',
        rate: 40000,
        amount: 40000
      }
    ],
    totalAmount: 200000,
    isDefault: true
  },
  {
    name: '2 Lakh Road Costing',
    description: 'Standard Panchayat road construction estimate - ₹2,00,000',
    categoryOfService: 'Civil Construction Work',
    gstEnabled: false,
    gstPercent: 18,
    items: [
      {
        description: 'Excavation of road surface & earthwork (Qty: 180 cu.m)',
        quantity: 180,
        unit: 'cu.m',
        rate: 194.44,
        amount: 35000
      },
      {
        description: 'Supply & compaction of Granular Sub-Base (GSB) (Qty: 120 cu.m)',
        quantity: 120,
        unit: 'cu.m',
        rate: 541.67,
        amount: 65000
      },
      {
        description: 'Wet Mix Macadam (WMM) base course laying (Qty: 90 cu.m)',
        quantity: 90,
        unit: 'cu.m',
        rate: 611.11,
        amount: 55000
      },
      {
        description: 'Bituminous tack coat & surface dressing work (Qty: 450 sq.m)',
        quantity: 450,
        unit: 'sq.m',
        rate: 100,
        amount: 45000
      }
    ],
    totalAmount: 200000,
    isDefault: true
  },
  {
    name: '3 Lakh Road Costing',
    description: 'Standard Panchayat road construction estimate - ₹3,00,000',
    categoryOfService: 'Civil Construction Work',
    gstEnabled: false,
    gstPercent: 18,
    items: [
      {
        description: 'Excavation & site clearance including leveling (Qty: 250 cu.m)',
        quantity: 250,
        unit: 'cu.m',
        rate: 200,
        amount: 50000
      },
      {
        description: 'Granular Sub-Base (GSB) supply & machine compaction (Qty: 180 cu.m)',
        quantity: 180,
        unit: 'cu.m',
        rate: 527.78,
        amount: 95000
      },
      {
        description: 'Wet Mix Macadam (WMM) base course with grading (Qty: 140 cu.m)',
        quantity: 140,
        unit: 'cu.m',
        rate: 607.14,
        amount: 85000
      },
      {
        description: 'Premix carpet bituminous surfacing & seal coat (Qty: 650 sq.m)',
        quantity: 650,
        unit: 'sq.m',
        rate: 107.69,
        amount: 70000
      }
    ],
    totalAmount: 300000,
    isDefault: true
  },
  {
    name: 'Standard Shed',
    description: 'Standard Industrial / Agricultural Shed estimate - ₹3,00,000',
    categoryOfService: 'Civil Construction Work',
    gstEnabled: false,
    gstPercent: 18,
    items: [
      {
        description: 'Excavation, foundation footing & PCC work (Qty: 40 cu.m)',
        quantity: 40,
        unit: 'cu.m',
        rate: 1125,
        amount: 45000
      },
      {
        description: 'Fabrication & erection of structural steel truss frame (Qty: 3.5 MT)',
        quantity: 3.5,
        unit: 'MT',
        rate: 34285.71,
        amount: 120000
      },
      {
        description: 'Supply & fixing of color-coated profile roofing sheets (Qty: 1800 sq.ft)',
        quantity: 1800,
        unit: 'sq.ft',
        rate: 41.67,
        amount: 75000
      },
      {
        description: 'Brick masonry wall up to plinth & cement plaster (Qty: 25 cu.m)',
        quantity: 25,
        unit: 'cu.m',
        rate: 2400,
        amount: 60000
      }
    ],
    totalAmount: 300000,
    isDefault: true
  }
];

// @desc    Get all templates (auto-seed standard ones if none exist)
// @route   GET /api/templates
const getTemplates = async (req, res, next) => {
  try {
    let templates = await Template.find({ userId: req.user._id }).sort({ createdAt: -1 });

    if (templates.length === 0) {
      // Seed default templates for this user
      const seeded = DEFAULT_TEMPLATES.map(tpl => ({
        ...tpl,
        userId: req.user._id
      }));
      templates = await Template.insertMany(seeded);
    }

    res.json({ success: true, data: templates, count: templates.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
const getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findOne({ _id: req.params.id, userId: req.user._id });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

// @desc    Create template
// @route   POST /api/templates
const createTemplate = async (req, res, next) => {
  try {
    const { name, description, categoryOfService, items, gstEnabled, gstPercent, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Template name is required' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    const template = await Template.create({
      userId: req.user._id,
      name: name.trim(),
      description: description || '',
      categoryOfService: categoryOfService || 'Civil Construction Work',
      items,
      totalAmount,
      gstEnabled: !!gstEnabled,
      gstPercent: gstPercent || 18,
      notes: notes || '',
      isDefault: false
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
const updateTemplate = async (req, res, next) => {
  try {
    const { name, description, categoryOfService, items, gstEnabled, gstPercent, notes } = req.body;

    let template = await Template.findOne({ _id: req.params.id, userId: req.user._id });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const totalAmount = (items || template.items).reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    template.name = name ? name.trim() : template.name;
    template.description = description !== undefined ? description : template.description;
    template.categoryOfService = categoryOfService || template.categoryOfService;
    if (items) template.items = items;
    template.totalAmount = totalAmount;
    if (gstEnabled !== undefined) template.gstEnabled = gstEnabled;
    if (gstPercent !== undefined) template.gstPercent = gstPercent;
    if (notes !== undefined) template.notes = notes;

    await template.save();

    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
const deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Instantiate a template into a final invoice document
// @route   POST /api/templates/:id/instantiate
const instantiateTemplate = async (req, res, next) => {
  try {
    const {
      customerName,
      date,
      customerId,
      customerAddress,
      customerPan,
      customerMobile
    } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer Name is required' });
    }

    const template = await Template.findOne({ _id: req.params.id, userId: req.user._id });
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Resolve customer: either by customerId or customerName (find or auto-create)
    let customer;
    const cleanCustomerName = customerName.trim();

    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, userId: req.user._id });
    }

    if (!customer) {
      customer = await Customer.findOne({
        userId: req.user._id,
        name: { $regex: `^${cleanCustomerName}$`, $options: 'i' }
      });
    }

    if (!customer) {
      customer = await Customer.create({
        userId: req.user._id,
        name: cleanCustomerName,
        address: customerAddress || '',
        pan: customerPan || '',
        mobile: customerMobile || '',
        nextBillNumber: 1
      });
    }

    const billNumber = customer.nextBillNumber || 1;

    // Use static items from template
    const items = template.items.map(item => ({
      description: item.description,
      quantity: item.quantity || 1,
      unit: item.unit || '',
      rate: item.rate || 0,
      amount: parseFloat(item.amount) || 0
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const gstAmt = template.gstEnabled ? (totalAmount * (template.gstPercent || 0)) / 100 : 0;
    const grandTotal = totalAmount + gstAmt;
    const amountWords = amountToWords(grandTotal);

    const invoice = await Invoice.create({
      userId: req.user._id,
      customerId: customer._id,
      customerName: customer.name,
      customerAddress: customer.address || customerAddress || '',
      customerPan: customer.pan || customerPan || '',
      customerMobile: customer.mobile || customerMobile || '',
      billNumber,
      date: date ? new Date(date) : new Date(),
      dueDate: null,
      items,
      totalAmount,
      amountInWords: amountWords,
      status: 'Pending',
      notes: template.notes || '',
      categoryOfService: template.categoryOfService || 'Civil Construction Work',
      gstEnabled: template.gstEnabled || false,
      gstPercent: template.gstPercent || 0,
      gstAmount: gstAmt,
      grandTotal
    });

    // Increment customer's next bill number
    await Customer.findByIdAndUpdate(customer._id, { $inc: { nextBillNumber: 1 } });

    res.status(201).json({
      success: true,
      message: 'Document generated successfully from template',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  instantiateTemplate
};
