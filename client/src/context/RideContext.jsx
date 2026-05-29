import React, { createContext, useContext, useState, useEffect } from 'react';

const RideContext = createContext();

export const RideProvider = ({ children }) => {
    const [activeRides, setActiveRides] = useState([]); 
    const [isPoolingEnabled, setIsPoolingEnabled] = useState(() => localStorage.getItem('green_pooling_enabled') === 'true');
    const [isFTDOnly, setIsFTDOnly] = useState(false);
    const [serviceType, setServiceType] = useState(() => localStorage.getItem('green_service_type') || 'standard');
    
    const [allowDashboardView, setAllowDashboardView] = useState(false);
    const [friendRequests, setFriendRequests] = useState({}); // Outgoing: { riderId: 'pending' }
    const [incomingRequests, setIncomingRequests] = useState([
        { id: 'cr-mock-1', name: 'Julian R.', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julian', status: 'pending' }
    ]);
    const [mutualFriends, setMutualFriends] = useState([]);
    
    // Global Ride Status for persistence
    const [rideStatus, setRideStatus] = useState(() => localStorage.getItem('green_ride_status') || 'idle');
    const [driverInfo, setDriverInfo] = useState(() => {
        const saved = localStorage.getItem('green_ride_driver');
        return saved ? JSON.parse(saved) : null;
    });

    const [venueTickets, setVenueTickets] = useState(() => {
        const saved = localStorage.getItem('green_venue_tickets');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('green_venue_tickets', JSON.stringify(venueTickets));
    }, [venueTickets]);

    const addVenueTicket = (ticket) => {
        setVenueTickets(prev => [ticket, ...prev]);

        // Sync to active orders so that B2B dashboard sees it
        try {
            const managerOrders = JSON.parse(localStorage.getItem('green_active_orders') || '[]');
            
            const managerOrder = {
                id: ticket.id,
                guest: ticket.guestName || 'Anonymous Guest',
                items: [`${ticket.quantity}x ${ticket.event} (${ticket.tier})`],
                total: typeof ticket.price === 'number' ? ticket.price.toFixed(2) : String(ticket.price),
                status: 'Received',
                type: 'Stadium E-Ticket',
                time: 'Just now',
                payment: 'Online',
            };

            const updatedOrders = [managerOrder, ...managerOrders];
            localStorage.setItem('green_active_orders', JSON.stringify(updatedOrders));

            // Sync to stadium events sold counts
            const savedEvents = localStorage.getItem('green_stadium_events');
            if (savedEvents) {
                const events = JSON.parse(savedEvents);
                const updatedEvents = events.map(evt => {
                    if (evt.name === ticket.event || evt.title === ticket.event) {
                        return {
                            ...evt,
                            tiers: evt.tiers.map(t => {
                                if (t.name === ticket.tier) {
                                    return { ...t, sold: (t.sold || 0) + ticket.quantity };
                                }
                                return t;
                            })
                        };
                    }
                    return evt;
                });
                localStorage.setItem('green_stadium_events', JSON.stringify(updatedEvents));
            }

            // Dispatch cross-iframe events
            if (window.parent) {
                window.parent.dispatchEvent(new CustomEvent('green-orders-updated'));
                window.parent.dispatchEvent(new CustomEvent('green-stadium-events-updated'));
            }
        } catch (e) {
            console.error('Failed to sync ticket purchase with active orders:', e);
        }
    };

    useEffect(() => {
        localStorage.setItem('green_ride_status', rideStatus);
    }, [rideStatus]);
    
    useEffect(() => {
        localStorage.setItem('green_pooling_enabled', isPoolingEnabled);
    }, [isPoolingEnabled]);

    useEffect(() => {
        localStorage.setItem('green_service_type', serviceType);
    }, [serviceType]);

    useEffect(() => {
        if (driverInfo) {
            localStorage.setItem('green_ride_driver', JSON.stringify(driverInfo));
        } else {
            localStorage.removeItem('green_ride_driver');
        }
    }, [driverInfo]);

    // Pricing constants
    const BASE_FARE = 10.00;
    const PER_KM_RATE = 2.50;

    const calculatePrice = (distance, passengerCount) => {
        const originalPrice = BASE_FARE + (distance * PER_KM_RATE);
        let discount = 0;

        if (passengerCount === 2) {
            discount = 0.20; // 20% discount
        } else if (passengerCount >= 3) {
            discount = 0.40; // 40% discount
        }

        const discountedPrice = originalPrice * (1 - discount);
        const savings = originalPrice - discountedPrice;

        return {
            originalPrice: originalPrice.toFixed(2),
            discountedPrice: discountedPrice.toFixed(2),
            savings: savings.toFixed(2),
            discountPercent: (discount * 100).toFixed(0)
        };
    };

    const requestRide = (pickup, destination, distance, passengerCount, isPooled) => {
        const pricing = calculatePrice(distance, isPooled ? 2 : 1); // Mocking 2 if pooled for initial calculation
        const newRide = {
            id: `RIDE-${Date.now()}`,
            pickup,
            destination,
            distance,
            passengerCount,
            isPooled,
            status: 'searching',
            ...pricing
        };
        // In a real app, this would be sent to the server
        return newRide;
    };

    return (
        <RideContext.Provider value={{
            activeRides,
            setActiveRides,
            isPoolingEnabled,
            setIsPoolingEnabled,
            isFTDOnly,
            setIsFTDOnly,
            rideStatus,
            setRideStatus: (status) => {
                if (status === 'idle') setAllowDashboardView(false);
                setRideStatus(status);
            },
            driverInfo,
            setDriverInfo,
            venueTickets,
            setVenueTickets,
            addVenueTicket,
            allowDashboardView,
            setAllowDashboardView,
            calculatePrice,
            requestRide,
            serviceType,
            setServiceType,
            friendRequests,
            setFriendRequests,
            incomingRequests,
            setIncomingRequests,
            mutualFriends,
            setMutualFriends
        }}>
            {children}
        </RideContext.Provider>
    );
};

export const useRide = () => useContext(RideContext);



