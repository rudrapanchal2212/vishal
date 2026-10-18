const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vishwa_construction_secret_jwt_key_2026', { 
    expiresIn: process.env.JWT_EXPIRE || '30d' 
  });
};

// @desc    Register new contractor
// @route   POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { companyName, contractorName, pan, accountName, bankName, accountNumber, ifsc, mobile, email, address, password, logo } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      companyName: companyName || 'GLOBAL ENTERPRISE',
      contractorName: contractorName || 'Vishal Chandrakant Panchal',
      pan: pan || 'DDYPP4105H',
      accountName: accountName || 'GLOBAL ENTERPRISE',
      bankName: bankName || 'Bank of Baroda, Vangad',
      accountNumber: accountNumber || '93610200001273',
      ifsc: ifsc || 'BARB0DBVANG',
      mobile,
      email,
      address: address || 'Fatepura, near Urban Bank, Vangad',
      password,
      logo: logo || null,
      gstEnabled: req.body.gstEnabled !== undefined ? req.body.gstEnabled : true,
      gstNumber: req.body.gstNumber || '24DDYPP4105H1Z9'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        companyName: user.companyName,
        contractorName: user.contractorName,
        pan: user.pan,
        accountName: user.accountName || 'GLOBAL ENTERPRISE',
        bankName: user.bankName || 'BOB ( Vangad)',
        accountNumber: user.accountNumber || '93610200001273',
        ifsc: user.ifsc || 'BARB0DBVANG',
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        logo: user.logo,
        signature: user.signature,
        darkMode: user.darkMode,
        gstEnabled: user.gstEnabled,
        gstNumber: user.gstNumber,
        categoryOfService: user.categoryOfService
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login contractor
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        companyName: user.companyName,
        contractorName: user.contractorName,
        pan: user.pan,
        accountName: user.accountName || 'GLOBAL ENTERPRISE',
        bankName: user.bankName || 'BOB ( Vangad)',
        accountNumber: user.accountNumber || '93610200001273',
        ifsc: user.ifsc || 'BARB0DBVANG',
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        logo: user.logo,
        signature: user.signature,
        darkMode: user.darkMode,
        gstEnabled: user.gstEnabled,
        gstNumber: user.gstNumber,
        categoryOfService: user.categoryOfService
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  if (req.user) {
    let modified = false;
    if (!req.user.accountName || req.user.companyName === 'Vishal App') {
      req.user.companyName = 'GLOBAL ENTERPRISE';
      req.user.accountName = 'GLOBAL ENTERPRISE';
      modified = true;
    }
    if (!req.user.bankName || req.user.bankName.includes('BOB')) {
      req.user.bankName = 'Bank of Baroda, Vangad';
      modified = true;
    }
    if (!req.user.accountNumber) {
      req.user.accountNumber = '93610200001273';
      modified = true;
    }
    if (!req.user.ifsc) {
      req.user.ifsc = 'BARB0DBVANG';
      modified = true;
    }
    if (req.user.pan === 'BMVPP3612B' || !req.user.pan) {
      req.user.pan = 'DDYPP4105H';
      modified = true;
    }
    if (req.user.contractorName === 'Rashminkumar R Patel' || !req.user.contractorName) {
      req.user.contractorName = 'Vishal Chandrakant Panchal';
      modified = true;
    }
    if (!req.user.gstNumber || req.user.gstNumber === '') {
      req.user.gstNumber = '24DDYPP4105H1Z9';
      modified = true;
    }
    if (req.user.address?.includes('Avdhoot') || req.user.address?.includes('Dahod') || !req.user.address) {
      req.user.address = 'Fatepura, near Urban Bank, Vangad';
      modified = true;
    }
    if (req.user.logo) {
      req.user.logo = null;
      modified = true;
    }
    if (modified) {
      await req.user.save();
    }
  }
  res.json({ success: true, user: req.user });
};

module.exports = { signup, login, getMe };
