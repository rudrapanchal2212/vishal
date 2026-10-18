const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    default: 'GLOBAL ENTERPRISE',
    trim: true
  },
  contractorName: {
    type: String,
    required: [true, 'Contractor name is required'],
    default: 'Vishal Chandrakant Panchal',
    trim: true
  },
  pan: {
    type: String,
    required: [true, 'PAN number is required'],
    default: 'CRGPV7742H',
    uppercase: true,
    trim: true
  },
  accountName: {
    type: String,
    default: 'GLOBAL ENTERPRISE',
    trim: true
  },
  bankName: {
    type: String,
    default: 'BANK OF BARODA ( VANGAD )',
    trim: true
  },
  accountNumber: {
    type: String,
    default: '93610200001314',
    trim: true
  },
  ifsc: {
    type: String,
    default: 'BARB0DBVANG',
    uppercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    default: '8200172009',
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    default: 'ZALOD RAOD,\nFATEPURA, DAHOD\nPINCODE-389172'
  },
  logo: {
    type: String,
    default: null
  },
  signature: {
    type: String,
    default: null
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  gstEnabled: {
    type: Boolean,
    default: true
  },
  gstNumber: {
    type: String,
    default: '24DDYPP4105H1Z9'
  },
  categoryOfService: {
    type: String,
    default: 'Civil Construction Work'
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
