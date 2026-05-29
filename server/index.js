require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const auth = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_51P8M1');

app.post('/api/payment/stripe/intent', async (req, res) => {
    try {
        const { amount, currency, partnerStripeAccountId, applicationFeeAmount } = req.body;
        
        const stripePayload = {
            amount: amount || 2450, // default €24.50 (in cents)
            currency: currency || 'eur',
            payment_method_types: ['card'],
            metadata: { app: 'green-dispatch' }
        };

        // Real-time Connect Split (Option B: partner absorbs card fees, platform receives clean provision)
        if (partnerStripeAccountId) {
            stripePayload.transfer_data = {
                destination: partnerStripeAccountId
            };
            if (applicationFeeAmount) {
                stripePayload.application_fee_amount = applicationFeeAmount;
            }
        }

        const paymentIntent = await stripe.paymentIntents.create(stripePayload);
        res.json({ 
            clientSecret: paymentIntent.client_secret,
            partnerStripeAccountId: partnerStripeAccountId || null,
            applicationFeeAmount: applicationFeeAmount || null
        });
    } catch (err) {
        console.error('Stripe PaymentIntent creation failed:', err.message);
        res.json({ 
            clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substring(2, 11),
            isMock: true,
            partnerStripeAccountId: req.body.partnerStripeAccountId || null,
            applicationFeeAmount: req.body.applicationFeeAmount || null,
            warning: 'Using mock payment intent because Stripe credentials are not set or invalid.'
        });
    }
});

app.post('/api/payment/paypal/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        res.json({ 
            id: 'PAY-' + Math.random().toString(36).substring(2, 14).toUpperCase(),
            status: 'CREATED',
            amount: amount || 24.50
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Secure Hashing and JWT Authentication APIs
app.post('/api/auth/register-hash', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }
        const hash = await auth.hashPassword(password);
        res.json({ hash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login-verify', async (req, res) => {
    try {
        const { user, password } = req.body;
        if (!user || !password) {
            return res.status(400).json({ error: 'User details and password required' });
        }
        
        // Secure comparison using bcrypt on the server
        const isValid = await auth.verifyPassword(password, user.password);
        if (!isValid) {
            return res.json({ success: false, error: 'BAD_KEY', message: 'Biometric authorization code invalid.' });
        }
        
        // Generate cryptographic JWT token with dynamic expiration
        const token = auth.generateToken(user);
        
        // Return details with sensitive password field omitted
        const sanitizedUser = { ...user };
        delete sanitizedUser.password;
        
        res.json({ success: true, token, user: sanitizedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/verify-token', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }
    const decoded = auth.verifyToken(token);
    if (!decoded) {
        return res.json({ success: false, message: 'Token invalid or expired.' });
    }
    res.json({ success: true, decoded });
});

const server = http.createServer(app);
const originUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
const io = new Server(server, {
    cors: {
        origin: originUrl === "*" ? true : originUrl,
        methods: ["GET", "POST"]
    }
});

let drivers = [];

// Simulate driver movement and availability
setInterval(() => {
    // Generate random drivers occasionally (Centered on Frankfurt: 50.1109, 8.6821)
    if (Math.random() > 0.7 && drivers.length < 15) {
        drivers.push({
            id: `DRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: ['Marcus V.', 'Sarah M.', 'Elena R.', 'Sergei K.', 'Jordan P.'][Math.floor(Math.random() * 5)],
            lat: 50.1109 + (Math.random() - 0.5) * 0.05,
            lng: 8.6821 + (Math.random() - 0.5) * 0.05,
            angle: Math.random() * 360,
            brand: ['Tesla', 'Mercedes', 'BMW', 'VW', 'Toyota'][Math.floor(Math.random() * 5)],
            type: Math.random() > 0.8 ? 'premium' : 'standard',
            rating: (4 + Math.random()).toFixed(1),
            status: 'available',
            trafficMultiplier: 1 + Math.random() * 1.5,
            goal: null // Destination for busy drivers
        });
    }

    // Move existing drivers
    drivers = drivers.map(d => {
        let newLat = d.lat;
        let newLng = d.lng;
        let currentStatus = d.status;

        // Randomly trigger traffic stalls for busy drivers
        if (d.status === 'busy' && !d.stallType && Math.random() > 0.98) {
            d.stallType = Math.random() > 0.7 ? 'TRAIN' : 'LIGHT';
            d.stallDuration = Math.floor(Math.random() * 8) + 5; // 5-13 seconds
        }

        if (d.stallDuration > 0) {
            d.stallDuration--;
            currentStatus = 'stalled';
            // Driver doesn't move while stalled
        } else {
            d.stallType = null;
            if (d.status === 'stalled') currentStatus = 'busy'; // Resume

            if (d.status === 'busy' && d.goal) {
                // Move towards goal
                const distLat = d.goal.lat - d.lat;
                const distLng = d.goal.lng - d.lng;
                const step = 0.0004; // Slightly slower for realism
                
                if (Math.abs(distLat) > step || Math.abs(distLng) > step) {
                    newLat += (distLat / Math.abs(distLat || 1)) * step;
                    newLng += (distLng / Math.abs(distLng || 1)) * step;
                } else {
                    // Arrived at goal
                    currentStatus = 'arrived';
                }
            } else {
                // Random drift for available drivers
                newLat += (Math.random() - 0.5) * 0.0002;
                newLng += (Math.random() - 0.5) * 0.0002;
            }
        }

        return {
            ...d,
            status: currentStatus,
            angle: (d.angle + 0.5) % 360,
            lat: newLat,
            lng: newLng
        };
    });

    io.emit('radar-update', drivers);
}, 1000);

// Helper function for distance calculation (Haversine)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

let activeRequests = [];

// Socket handshake token validation (compatible yet secure)
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (token) {
        const decoded = auth.verifyToken(token);
        if (!decoded) {
            console.log(`❌ Rejecting socket ${socket.id} due to invalid or expired JWT token.`);
            return next(new Error('Token invalid or expired'));
        }
        socket.user = decoded;
        console.log(`🔒 Secure socket connection for user: ${decoded.email} (${decoded.role})`);
    } else {
        console.log(`ℹ️ Socket connected as anonymous guest: ${socket.id}`);
    }
    next();
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Fetch initial list of active requests
    socket.on('get-active-requests', () => {
        socket.emit('active-requests-list', activeRequests);
    });

    socket.on('ride-request', (request) => {
        console.log('Ride request received:', request);
        
        const requestData = {
            passengerId: request.passengerId || 'alex-passenger-id',
            passengerName: request.passengerName || 'Alex Passenger',
            pickup: request.pickup || 'Zeil 10',
            destination: request.destination || 'Mainzer Landstraße 123',
            coords: request.coords || { lat: 50.1109, lng: 8.6821 },
            rideType: request.rideType || 'green',
            capacity: request.capacity || 3,
            price: request.price || 24.50,
            paymentType: request.paymentType || 'Digital',
            timestamp: Date.now()
        };

        // Check if request is already in list
        const exists = activeRequests.find(r => r.passengerId === requestData.passengerId);
        if (!exists) {
            activeRequests.push(requestData);
        }

        // Broadcast to all driver dashboards
        io.emit('new-ride-request', requestData);
        io.emit('active-requests-list', activeRequests);
        console.log('Broadcasted ride request. Active list count:', activeRequests.length);
    });

    socket.on('accept-ride', (data) => {
        console.log('Ride accepted by driver:', data);
        const { passengerId, driverName } = data;

        // Remove from active request list
        activeRequests = activeRequests.filter(r => r.passengerId !== passengerId);
        io.emit('active-requests-list', activeRequests);

        // Notify passenger that their ride is accepted
        io.emit('ride-accepted', {
            passengerId,
            driver: {
                id: 'drv-' + Date.now(),
                name: driverName || 'Mick Driver',
                rating: 4.9,
                car: 'Tesla Premium (Obsidian Black)',
                plate: 'F-GR 2026',
                color: 'Obsidian Black',
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${driverName || 'Mick Driver'}`,
                eta: '3 min',
                lat: 50.1109,
                lng: 8.6821
            }
        });
    });

    socket.on('driver-arrived', (data) => {
        console.log('Driver arrived notification received:', data);
        io.emit('driver-arrived', { passengerId: data.passengerId });
    });

    socket.on('start-ride', (data) => {
        console.log('Start ride notification received:', data);
        io.emit('start-ride', { passengerId: data.passengerId });
    });

    socket.on('complete-ride', (data) => {
        console.log('Complete ride notification received:', data);
        io.emit('complete-ride', { passengerId: data.passengerId });
    });

    // Payment & Table Sync
    socket.on('request-cash-payment', (data) => {
        console.log('Cash payment requested for table:', data.tableId);
        // Broadcast to all connected clients (especially staff)
        io.emit('cash-payment-alert', {
            tableId: data.tableId,
            orderId: data.orderId,
            amount: data.amount,
            guestName: data.guestName,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('confirm-cash-payment', (data) => {
        console.log('Cash payment confirmed by staff for order:', data.orderId);
        // Notify the specific customer that their payment is cleared
        io.emit('payment-cleared', {
            orderId: data.orderId,
            tableId: data.tableId,
            status: 'Paid'
        });
    });

    // Real-Time UX Lab Events Sync
    socket.on('submit-uxlab-event', (data) => {
        console.log(`📡 Broadcast event: submit-uxlab-event from client: ${data.id} of type: ${data.type}`);
        // Broadcast this ticket event to all connected sockets
        io.emit('new-uxlab-event', data);
    });

    // Real-Time B2B to B2C Guest Messages
    socket.on('send-guest-message', (data) => {
        console.log(`💬 Broadcast guest message: send-guest-message to order: ${data.orderId}`);
        io.emit('new-guest-message', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Green Dispatch Server running on port ${PORT}`);
});

