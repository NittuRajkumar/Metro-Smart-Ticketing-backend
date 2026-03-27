const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

const router = express.Router();

const STATIONS = [
  { name: 'Miyapur', line: 'Red', area: 'Northwest Corridor' },
  { name: 'JNTU College', line: 'Red', area: 'Kukatpally Zone' },
  { name: 'KPHB Colony', line: 'Red', area: 'KPHB' },
  { name: 'Kukatpally', line: 'Red', area: 'Housing Board' },
  { name: 'Balanagar', line: 'Red', area: 'Industrial Stretch' },
  { name: 'Moosapet', line: 'Red', area: 'Industrial Stretch' },
  { name: 'Bharat Nagar', line: 'Red', area: 'Central West' },
  { name: 'Erragadda', line: 'Red', area: 'Medical District' },
  { name: 'ESI Hospital', line: 'Red', area: 'Medical District' },
  { name: 'Ameerpet', line: 'Interchange', area: 'Core Interchange' },
  { name: 'Begumpet', line: 'Blue', area: 'Business District' },
  { name: 'Paradise', line: 'Blue', area: 'Secunderabad Cantonment' },
  { name: 'Secunderabad East', line: 'Blue', area: 'Transit Hub' },
  { name: 'Panjagutta', line: 'Blue', area: 'Central Hyderabad' },
  { name: 'Khairatabad', line: 'Blue', area: 'Secretariat Belt' },
  { name: 'Lakdikapul', line: 'Blue', area: 'Administrative District' },
  { name: 'Assembly', line: 'Blue', area: 'Assembly Circle' },
  { name: 'Nampally', line: 'Blue', area: 'Railway District' },
  { name: 'Gandhi Bhavan', line: 'Blue', area: 'Old City Edge' },
  { name: 'Osmania Medical College', line: 'Blue', area: 'Medical Heritage Zone' },
  { name: 'MGBS', line: 'Interchange', area: 'Central Bus Terminal' },
  { name: 'Malakpet', line: 'Green', area: 'East Hyderabad' },
  { name: 'Dilsukhnagar', line: 'Green', area: 'Commercial Belt' },
  { name: 'L B Nagar', line: 'Green', area: 'South East Corridor' },
  { name: 'Madhura Nagar', line: 'Blue', area: 'Inner West' },
  { name: 'Jubilee Hills Check Post', line: 'Blue', area: 'Jubilee Hills' },
  { name: 'Peddamma Gudi', line: 'Blue', area: 'Jubilee Hills' },
  { name: 'Madhapur', line: 'Blue', area: 'Tech Corridor' },
  { name: 'Hitec City', line: 'Blue', area: 'Cyber Towers' },
  { name: 'Raidurg', line: 'Blue', area: 'Financial District Link' }
];

const CONNECTIONS = [
  ['Miyapur', 'JNTU College', 2.5],
  ['JNTU College', 'KPHB Colony', 1.6],
  ['KPHB Colony', 'Kukatpally', 1.8],
  ['Kukatpally', 'Balanagar', 2.4],
  ['Balanagar', 'Moosapet', 1.7],
  ['Moosapet', 'Bharat Nagar', 1.5],
  ['Bharat Nagar', 'Erragadda', 1.3],
  ['Erragadda', 'ESI Hospital', 1.0],
  ['ESI Hospital', 'Ameerpet', 1.8],
  ['Ameerpet', 'Begumpet', 1.9],
  ['Begumpet', 'Paradise', 2.6],
  ['Paradise', 'Secunderabad East', 1.7],
  ['Ameerpet', 'Panjagutta', 1.2],
  ['Panjagutta', 'Khairatabad', 1.4],
  ['Khairatabad', 'Lakdikapul', 1.1],
  ['Lakdikapul', 'Assembly', 1.0],
  ['Assembly', 'Nampally', 1.3],
  ['Nampally', 'Gandhi Bhavan', 0.9],
  ['Gandhi Bhavan', 'Osmania Medical College', 1.2],
  ['Osmania Medical College', 'MGBS', 1.1],
  ['MGBS', 'Malakpet', 1.8],
  ['Malakpet', 'Dilsukhnagar', 3.4],
  ['Dilsukhnagar', 'L B Nagar', 4.2],
  ['Ameerpet', 'Madhura Nagar', 0.9],
  ['Madhura Nagar', 'Jubilee Hills Check Post', 2.8],
  ['Jubilee Hills Check Post', 'Peddamma Gudi', 1.2],
  ['Peddamma Gudi', 'Madhapur', 2.0],
  ['Madhapur', 'Hitec City', 1.8],
  ['Hitec City', 'Raidurg', 2.0]
];

const stationMap = new Map(STATIONS.map((station) => [station.name, station]));
const adjacencyMap = new Map();

for (const station of STATIONS) {
  adjacencyMap.set(station.name, []);
}

for (const [from, to, distance] of CONNECTIONS) {
  adjacencyMap.get(from).push({ station: to, distance });
  adjacencyMap.get(to).push({ station: from, distance });
}

const calculateFare = (distanceKm) => {
  if (distanceKm <= 2) return 10;
  if (distanceKm <= 5) return 15;
  if (distanceKm <= 10) return 25;
  if (distanceKm <= 16) return 35;
  if (distanceKm <= 24) return 45;
  if (distanceKm <= 32) return 55;
  return 65;
};

const calculateRoute = (fromStation, toStation) => {
  if (!stationMap.has(fromStation) || !stationMap.has(toStation)) {
    return null;
  }

  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set(stationMap.keys());

  for (const stationName of stationMap.keys()) {
    distances.set(stationName, Number.POSITIVE_INFINITY);
  }

  distances.set(fromStation, 0);

  while (unvisited.size > 0) {
    let currentStation = null;
    let currentDistance = Number.POSITIVE_INFINITY;

    for (const stationName of unvisited) {
      const distance = distances.get(stationName);
      if (distance < currentDistance) {
        currentDistance = distance;
        currentStation = stationName;
      }
    }

    if (!currentStation || currentStation === toStation) {
      break;
    }

    unvisited.delete(currentStation);

    for (const neighbor of adjacencyMap.get(currentStation)) {
      if (!unvisited.has(neighbor.station)) {
        continue;
      }

      const candidateDistance = currentDistance + neighbor.distance;
      if (candidateDistance < distances.get(neighbor.station)) {
        distances.set(neighbor.station, candidateDistance);
        previous.set(neighbor.station, currentStation);
      }
    }
  }

  const finalDistance = distances.get(toStation);
  if (!Number.isFinite(finalDistance)) {
    return null;
  }

  const routeStations = [];
  let cursor = toStation;
  while (cursor) {
    routeStations.unshift(cursor);
    cursor = previous.get(cursor);
  }

  const distanceKm = Number(finalDistance.toFixed(1));
  const fare = calculateFare(distanceKm);
  const durationMinutes = Math.max(8, Math.round(distanceKm * 2.2 + Math.max(routeStations.length - 1, 0)));

  return {
    distanceKm,
    fare,
    durationMinutes,
    routeStations
  };
};

const generateTicketNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `HM${Date.now()}${random}`;
};

const generatePaymentRef = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `UPI${Date.now()}${random}`;
};

router.get('/stations', authMiddleware, (req, res) => {
  res.json({ success: true, stations: STATIONS });
});

router.post('/fare', authMiddleware, [
  body('fromStation').notEmpty().withMessage('From station is required'),
  body('toStation').notEmpty().withMessage('To station is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { fromStation, toStation } = req.body;

  if (fromStation === toStation) {
    return res.status(400).json({ message: 'From and To stations must be different' });
  }

  const fareInfo = calculateRoute(fromStation, toStation);
  if (!fareInfo) {
    return res.status(400).json({ message: 'Invalid station selection' });
  }

  return res.json({
    success: true,
    fromStation,
    toStation,
    distanceKm: fareInfo.distanceKm,
    fare: fareInfo.fare,
    durationMinutes: fareInfo.durationMinutes,
    routeStations: fareInfo.routeStations
  });
});

router.post('/book', authMiddleware, [
  body('fromStation').notEmpty().withMessage('From station is required'),
  body('toStation').notEmpty().withMessage('To station is required'),
  body('journeyDate').notEmpty().withMessage('Journey date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { fromStation, toStation, journeyDate } = req.body;

    if (fromStation === toStation) {
      return res.status(400).json({ message: 'From and To stations must be different' });
    }

    const fareInfo = calculateRoute(fromStation, toStation);
    if (!fareInfo) {
      return res.status(400).json({ message: 'Invalid station selection' });
    }

    const journeyDateObj = new Date(journeyDate);
    if (Number.isNaN(journeyDateObj.getTime())) {
      return res.status(400).json({ message: 'Invalid journey date' });
    }

    if (journeyDateObj.getTime() < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Journey date cannot be in the past' });
    }

    const ticket = await Ticket.create({
      user: req.user.id,
      ticketNumber: generateTicketNumber(),
      fromStation,
      toStation,
      distanceKm: fareInfo.distanceKm,
      fare: fareInfo.fare,
      durationMinutes: fareInfo.durationMinutes,
      routeStations: fareInfo.routeStations,
      journeyDate: journeyDateObj
    });

    return res.status(201).json({
      success: true,
      message: 'Ticket reserved. Complete payment to confirm.',
      ticket
    });
  } catch (error) {
    console.error('Book ticket error:', error);
    return res.status(500).json({ message: 'Unable to book ticket right now' });
  }
});

router.post('/pay', authMiddleware, [
  body('ticketId').notEmpty().withMessage('Ticket ID is required'),
  body('upiId').trim().isLength({ min: 5 }).withMessage('Valid UPI ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { ticketId, upiId } = req.body;

    if (!upiId.includes('@')) {
      return res.status(400).json({ message: 'UPI ID must include @' });
    }

    const ticket = await Ticket.findOne({ _id: ticketId, user: req.user.id });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.status === 'PAID') {
      return res.status(400).json({ message: 'Ticket is already paid' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.walletBalance < ticket.fare) {
      return res.status(400).json({ message: 'Insufficient balance in your metro wallet' });
    }

    const paymentRef = generatePaymentRef();
    const qrPayload = JSON.stringify({
      ticketNumber: ticket.ticketNumber,
      from: ticket.fromStation,
      to: ticket.toStation,
      fare: ticket.fare,
      routeStations: ticket.routeStations,
      journeyDate: ticket.journeyDate,
      paidAt: new Date().toISOString(),
      paymentRef
    });

    user.walletBalance = Number((user.walletBalance - ticket.fare).toFixed(2));
    user.defaultUpiId = upiId;
    await user.save();

    ticket.status = 'PAID';
    ticket.paymentRef = paymentRef;
    ticket.upiId = upiId;
    ticket.qrPayload = qrPayload;
    ticket.paidAt = new Date();
    ticket.validUntil = new Date(ticket.journeyDate.getTime() + 2 * 60 * 60 * 1000);
    await ticket.save();

    return res.json({
      success: true,
      message: 'Payment successful. Ticket generated.',
      ticket,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        walletBalance: user.walletBalance,
        metroCardNumber: user.metroCardNumber,
        defaultUpiId: user.defaultUpiId
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ message: 'Payment processing failed' });
  }
});

router.get('/my-tickets', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({ success: true, tickets });
  } catch (error) {
    console.error('Get tickets error:', error);
    return res.status(500).json({ message: 'Unable to fetch tickets' });
  }
});

router.get('/ticket/:ticketId', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.ticketId,
      user: req.user.id
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.json({ success: true, ticket });
  } catch (error) {
    console.error('Get ticket details error:', error);
    return res.status(500).json({ message: 'Unable to fetch ticket details' });
  }
});

module.exports = router;
