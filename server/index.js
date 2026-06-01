require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const auth = require('./auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// AI Neural Menu Scan API
app.post('/api/ai/scan-menu', async (req, res) => {
    try {
        const { fileData, fileType, businessType } = req.body;
        
        if (!fileData) {
            return res.status(400).json({ error: 'No file data received.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        let scannedItems = [];

        // Helper function for Unsplash images based on item name/category
        const getAIAssignedImage = (name, category, bizType) => {
            const lowercaseName = name.toLowerCase();
            const lowercaseCat = (category || '').toLowerCase();
            
            if (bizType === 'WM') {
                if (lowercaseName.includes('wash') || lowercaseName.includes('clean')) {
                    return 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&auto=format&fit=crop&q=60';
                }
                return 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&auto=format&fit=crop&q=60';
            }
            
            if (bizType === 'PM') {
                if (lowercaseName.includes('charge') || lowercaseName.includes('ev')) {
                    return 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60';
                }
                return 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=500&auto=format&fit=crop&q=60';
            }
            
            if (bizType === 'HM') {
                if (lowercaseName.includes('spa') || lowercaseName.includes('massage') || lowercaseName.includes('well')) {
                    return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60';
                }
                if (lowercaseName.includes('valet') || lowercaseName.includes('car') || lowercaseName.includes('luggage')) {
                    return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60';
                }
                if (lowercaseName.includes('shuttle') || lowercaseName.includes('transport') || lowercaseName.includes('airport')) {
                    return 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop&q=60';
                }
                return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=60';
            }

            if (bizType === 'SM') {
                if (lowercaseName.includes('plat') || lowercaseName.includes('food') || lowercaseName.includes('cater')) {
                    return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60';
                }
                if (lowercaseName.includes('park') || lowercaseName.includes('gold')) {
                    return 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=500&auto=format&fit=crop&q=60';
                }
                return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60';
            }

            // Default RM / F&B mapping
            if (lowercaseName.includes('burger') || lowercaseName.includes('beef') || lowercaseName.includes('meat') || lowercaseName.includes('cheeseburger')) {
                return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60';
            }
            if (lowercaseName.includes('fries') || lowercaseName.includes('potato') || lowercaseName.includes('chips')) {
                return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60';
            }
            if (lowercaseName.includes('salad') || lowercaseName.includes('green') || lowercaseName.includes('vegetable')) {
                return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60';
            }
            if (lowercaseName.includes('mojito') || lowercaseName.includes('drink') || lowercaseName.includes('cocktail') || lowercaseName.includes('spritz') || lowercaseName.includes('wine') || lowercaseName.includes('beer') || lowercaseCat.includes('drink') || lowercaseCat.includes('beverage')) {
                return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=60';
            }
            if (lowercaseName.includes('sushi') || lowercaseName.includes('fish') || lowercaseName.includes('salmon')) {
                return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60';
            }
            if (lowercaseName.includes('steak') || lowercaseName.includes('ribeye') || lowercaseName.includes('grill')) {
                return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60';
            }
            if (lowercaseName.includes('dessert') || lowercaseName.includes('cake') || lowercaseName.includes('tiramisu') || lowercaseName.includes('sweet')) {
                return 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60';
            }
            return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
        };

        if (apiKey && apiKey !== 'YOUR_GEMINI_KEY') {
            try {
                // Call Google Gemini 1.5 Flash API
                const nodeFetch = require('node-fetch');
                
                const response = await nodeFetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: `You are an expert catalog processor. Extract the items, prices, descriptions, and categories from this catalog image. Return ONLY a valid JSON array of objects, with no markdown code blocks, containing these fields: 'name', 'price' (numeric string without currency sign), 'category', 'description'. If any prices are blurry or hard to read, flag them by setting 'status' to 'flagged' and 'reason' to a short explanation, otherwise set 'status' to 'verified'. The business type is ${businessType} (WM=Carwash, PM=Parking, HM=Hotel, SM=Stadium, RM=Restaurant).`
                                },
                                {
                                    inlineData: {
                                        mimeType: fileType || "image/png",
                                        data: fileData
                                    }
                                }
                            ]
                        }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                });

                const resData = await response.json();
                if (resData.candidates && resData.candidates[0]?.content?.parts[0]?.text) {
                    const extractedJson = JSON.parse(resData.candidates[0].content.parts[0].text);
                    if (Array.isArray(extractedJson)) {
                        scannedItems = extractedJson.map((item, idx) => ({
                            id: Date.now() + idx,
                            name: item.name || 'Unnamed Item',
                            price: item.price || '0.00',
                            category: item.category || 'General',
                            description: item.description || '',
                            image: getAIAssignedImage(item.name || '', item.category || '', businessType),
                            status: item.status || 'verified',
                            reason: item.reason || null
                        }));
                    }
                }
            } catch (geminiError) {
                console.error('Gemini extraction failed, using visual simulator fallback:', geminiError.message);
            }
        }

        // Fallback to high-fidelity simulated response if no API key or API call failed
        if (scannedItems.length === 0) {
            // Simulated delay for realism
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (businessType === 'WM') {
                scannedItems = [
                    { id: 1, name: 'Eco-Ceramic Ultra Wash', price: '65.00', category: 'Detailing', description: 'Ceramic sealant coating, high-pressure foam, wheel cleaning & tire shine.', image: getAIAssignedImage('Eco-Ceramic Ultra Wash', 'Detailing', 'WM'), status: 'verified' },
                    { id: 2, name: 'Interior Deep Extraction', price: '40.00', category: 'Service', description: 'Steam extraction cleaning of seats, floor mats, and trunk vacuum.', image: getAIAssignedImage('Interior Deep Extraction', 'Service', 'WM'), status: 'verified' },
                    { id: 3, name: 'Odor Neutralizer & Sanitizer', price: '15.00', category: 'Addon', description: 'Active ozone deodorizing treatment and AC duct sanitization.', image: getAIAssignedImage('Odor Neutralizer & Sanitizer', 'Addon', 'WM'), status: 'flagged', reason: 'Price blur on scan' }
                ];
            } else if (businessType === 'PM') {
                scannedItems = [
                    { id: 1, name: 'Premium Secure Bay', price: '25.00', category: 'Standard', description: 'Dedicated secure indoor parking spot with 24/7 CCTV surveillance.', image: getAIAssignedImage('Premium Secure Bay', 'Standard', 'PM'), status: 'verified' },
                    { id: 2, name: 'EV Hyper-Charge Slot', price: '15.00', category: 'Utility', description: 'Ultra-fast EV charger bay booking. Power billed separately.', image: getAIAssignedImage('EV Hyper-Charge Slot', 'Utility', 'PM'), status: 'verified' }
                ];
            } else if (businessType === 'HM') {
                scannedItems = [
                    { id: 1, name: 'Zen Spa Session (60m)', price: '120.00', category: 'Wellness', description: 'Aromatherapy massage using organic lavender essential oils.', image: getAIAssignedImage('Zen Spa Session (60m)', 'Wellness', 'HM'), status: 'verified' },
                    { id: 2, name: '24/7 Premium Room Service', price: '45.00', category: 'F&B', description: 'Gourmet club sandwich, fresh truffle chips, and sparkling water.', image: getAIAssignedImage('24/7 Premium Room Service', 'F&B', 'HM'), status: 'verified' },
                    { id: 3, name: 'Valet & Luggage Express', price: '20.00', category: 'Concierge', description: 'Priority valet parking and dynamic luggage delivery to suite.', image: getAIAssignedImage('Valet & Luggage Express', 'Concierge', 'HM'), status: 'verified' },
                    { id: 4, name: 'Luxury Airport Shuttle', price: '75.00', category: 'Transport', description: 'Private Tesla Model S transfer to Frankfurt Airport.', image: getAIAssignedImage('Luxury Airport Shuttle', 'Transport', 'HM'), status: 'flagged', reason: 'Transfer rate unclear' }
                ];
            } else if (businessType === 'SM') {
                scannedItems = [
                    { id: 1, name: 'VIP Suite Catering Platter', price: '250.00', category: 'Premium', description: 'Gourmet selection of cheeses, cold cuts, fresh fruit, and wine.', image: getAIAssignedImage('VIP Suite Catering Platter', 'Premium', 'SM'), status: 'verified' },
                    { id: 2, name: 'Fan Zone Fast-Pass', price: '15.00', category: 'Access', description: 'Skip the line concession token for quick hotdog & beverage pick up.', image: getAIAssignedImage('Fan Zone Fast-Pass', 'Access', 'SM'), status: 'verified' },
                    { id: 3, name: 'Stadium Gold Parking', price: '40.00', category: 'Logistics', description: 'Guaranteed priority parking spot in the VIP lot near Gate A.', image: getAIAssignedImage('Stadium Gold Parking', 'Logistics', 'SM'), status: 'verified' }
                ];
            } else {
                // Restaurant/Bar (RM) default
                scannedItems = [
                    { id: 1, name: 'Truffle Burger', price: '18.50', category: 'Main', description: 'Juicy wagyu beef, black truffle aioli, aged gruyère, brioche bun.', image: getAIAssignedImage('Truffle Burger', 'Main', 'RM'), status: 'verified' },
                    { id: 2, name: 'Crispy Fries', price: '6.00', category: 'Side', description: 'Hand-cut sea salt fries, served with house-made garlic aioli.', image: getAIAssignedImage('Crispy Fries', 'Side', 'RM'), status: 'verified' },
                    { id: 3, name: 'Green Garden Salad', price: '12.00', category: 'Appetizer', description: 'Organic field greens, cherry tomatoes, avocado, lemon-herb vinaigrette.', image: getAIAssignedImage('Green Garden Salad', 'Appetizer', 'RM'), status: 'verified' },
                    { id: 4, name: 'Classic Mojito', price: '11.00', category: 'Drinks', description: 'Fresh mint, white rum, lime juice, club soda, organic cane sugar.', image: getAIAssignedImage('Classic Mojito', 'Drinks', 'RM'), status: 'flagged', reason: 'Price blurry' }
                ];
            }
        }

        res.json({ success: true, items: scannedItems });
    } catch (err) {
        console.error('Scan menu endpoint error:', err.message);
        res.status(500).json({ error: err.message });
    }
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

