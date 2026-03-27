const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  fromStation: {
    type: String,
    required: true
  },
  toStation: {
    type: String,
    required: true
  },
  distanceKm: {
    type: Number,
    required: true
  },
  fare: {
    type: Number,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  routeStations: {
    type: [String],
    default: []
  },
  validUntil: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'CANCELLED'],
    default: 'PENDING'
  },
  journeyDate: {
    type: Date,
    required: true
  },
  paymentRef: {
    type: String,
    default: null
  },
  upiId: {
    type: String,
    default: null
  },
  qrPayload: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
