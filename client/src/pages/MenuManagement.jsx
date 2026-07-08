import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Trash2, ArrowLeft, Loader2, ChevronRight,
    Utensils, PlusCircle, Sparkles, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const getCategoryOptionsForContext = (ctx) => {
    if (ctx === 'HM') {
        return [
            { value: 'Rooms', label: 'Suite / Room Service' },
            { value: 'Spa & Wellness', label: 'Spa & Wellness' },
            { value: 'Concierge', label: 'Concierge & Transport' },
            { value: 'Breakfast', label: 'Breakfast / Frühstück' },
            { value: 'Drinks', label: 'Drinks & Beverages' },
            { value: 'Food', label: 'Food / Dining' },
            { value: 'Coffee', label: 'Coffee & Hot Drinks' },
            { value: 'Dessert', label: 'Dessert & Sweets' }
        ];
    }
    if (ctx === 'SM') {
        return [
            { value: 'Access', label: 'Entry Tickets / Passes' },
            { value: 'Premium', label: 'VIP Suite / Premium Catering' },
            { value: 'Food', label: 'Concession / Food' },
            { value: 'Drinks', label: 'Concession / Drinks' },
            { value: 'Coffee', label: 'Coffee & Hot Drinks' },
            { value: 'Breakfast', label: 'Breakfast / Frühstück' },
            { value: 'Dessert', label: 'Dessert & Sweets' },
            { value: 'Logistics', label: 'Logistics / Fast-Pass' }
        ];
    }
    if (ctx === 'VM') {
        return [
            { value: 'Tickets', label: 'Entry Tickets / Passes' },
            { value: 'VIP', label: 'VIP Table / Premium Booking' },
            { value: 'Drinks', label: 'Drinks & Wine' },
            { value: 'Food', label: 'Food / Catering' },
            { value: 'Coffee', label: 'Coffee & Snacks' },
            { value: 'Dessert', label: 'Dessert & Sweets' }
        ];
    }
    if (ctx === 'WM') {
        return [
            { value: 'Detailing', label: 'Wash & Detailing' },
            { value: 'Service', label: 'Interior Service' },
            { value: 'Addon', label: 'Addon & Extras' },
            { value: 'Drinks', label: 'Lobby Drinks & Soda' },
            { value: 'Coffee', label: 'Lobby Coffee & Snacks' }
        ];
    }
    if (ctx === 'PM') {
        return [
            { value: 'Standard', label: 'Standard Parking Bay' },
            { value: 'Utility', label: 'EV Charger Bay' },
            { value: 'Drinks', label: 'Vending Drinks' },
            { value: 'Coffee', label: 'Vending Coffee' }
        ];
    }
    if (ctx === 'BM') {
        return [
            { value: 'Food', label: 'Food / Dining' },
            { value: 'Drinks', label: 'Drinks & Beverages' },
            { value: 'Shisha', label: 'Shisha / Hookah' },
            { value: 'Coffee', label: 'Coffee & Hot Drinks' },
            { value: 'Breakfast', label: 'Breakfast / Frühstück' },
            { value: 'Dessert', label: 'Dessert & Sweets' }
        ];
    }
    if (ctx === 'CM') {
        return [
            { value: 'Tickets', label: 'Entry Tickets / Passes' },
            { value: 'VIP', label: 'VIP Table / Premium Booking' },
            { value: 'Drinks', label: 'Drinks & Beverages' },
            { value: 'Food', label: 'Food / Dining' },
            { value: 'Shisha', label: 'Shisha / Hookah' }
        ];
    }
    // Default RM (Restaurant)
    return [
        { value: 'Food', label: 'Food / Dining' },
        { value: 'Drinks', label: 'Drinks & Beverages' },
        { value: 'Coffee', label: 'Coffee & Hot Drinks' },
        { value: 'Breakfast', label: 'Breakfast / Frühstück' },
        { value: 'Dessert', label: 'Dessert & Sweets' }
    ];
};

const getAIAssignedImage = (name, category, bizType) => {
    const lowercaseName = (name || '').toLowerCase();
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

    if (bizType === 'VM') {
        if (lowercaseName.includes('ticket') || lowercaseName.includes('pass') || lowercaseName.includes('entry')) {
            return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60';
        }
        if (lowercaseName.includes('vip') || lowercaseName.includes('table') || lowercaseName.includes('premium')) {
            return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60';
        }
        return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60';
    }

    // Default RM / BM / CM
    if (lowercaseName.includes('shisha') || lowercaseName.includes('hookah') || lowercaseCat.includes('shisha')) {
        return 'https://images.unsplash.com/photo-1542841791-1925b02a2bcb?w=500&auto=format&fit=crop&q=60';
    }
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
    if (lowercaseName.includes('dessert') || lowercaseName.includes('cake') || lowercaseName.includes('tiramisu') || lowercaseName.includes('sweet') || lowercaseCat.includes('dessert') || lowercaseCat.includes('sweet')) {
        return 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('coffee') || lowercaseName.includes('cappuccino') || lowercaseName.includes('espresso') || lowercaseName.includes('latte') || lowercaseName.includes('tea') || lowercaseCat.includes('coffee') || lowercaseCat.includes('hot drink')) {
        return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60';
    }
    if (lowercaseName.includes('breakfast') || lowercaseName.includes('egg') || lowercaseName.includes('frühstück') || lowercaseCat.includes('breakfast')) {
        return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60';
    }
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
};

const MenuManagement = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [manualItems, setManualItems] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    
    const userEmailKey = user?.email ? user.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default';
    const [managerContext, setManagerContext] = useState(() => localStorage.getItem(`green_manager_context_${userEmailKey}`) || 'RM');

    const getCategoryOptions = () => getCategoryOptionsForContext(managerContext);

    // Load existing menu from Firestore and localStorage
    useEffect(() => {
        const loadExistingMenu = async () => {
            if (loading || !user) return;
            
            const ctx = localStorage.getItem(`green_manager_context_${userEmailKey}`) || 'RM';
            setManagerContext(ctx);
            
            const categories = getCategoryOptionsForContext(ctx);
            const defaultCat = categories.length > 0 ? categories[0].value : 'Food';

            let loadedItems = [];

            // 1. Fetch from Firestore
            try {
                const docRef = doc(db, 'business_menus', user?.email?.toLowerCase() || userEmailKey);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data && Array.isArray(data.items)) {
                        loadedItems = data.items;
                    }
                }
            } catch (err) {
                console.warn('Firestore menu read failed:', err.message);
            }

            // 2. Fallback to local backup
            if (loadedItems.length === 0) {
                try {
                    const saved = localStorage.getItem(`green_published_menu_${ctx}_${userEmailKey}`);
                    if (saved) {
                        loadedItems = JSON.parse(saved);
                    }
                } catch (e) {
                    console.error('Failed to parse local menu backup:', e);
                }
            }

            // Set state. If empty, push a default row to start editing instantly.
            if (loadedItems.length > 0) {
                setManualItems(loadedItems);
            } else {
                setManualItems([{
                    id: Date.now(),
                    name: '',
                    price: '',
                    category: defaultCat,
                    description: '',
                    image: ''
                }]);
            }
        };

        loadExistingMenu();
    }, [user, loading, userEmailKey]);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-20">
                <div className="text-xl font-black italic uppercase text-[#00e5ff] animate-pulse">
                    Grid Intelligence Loading...
                </div>
            </div>
        );
    }

    const publishManualMenu = async () => {
        // Filter out empty rows (e.g., no name and no price)
        const validItems = manualItems.filter(item => item.name.trim() !== '' || item.price.trim() !== '');

        if (validItems.length === 0) {
            alert('Please fill out at least one product with a Name and Price.');
            return;
        }

        setIsPublishing(true);
        try {
            const formattedItems = validItems.map((item, idx) => ({
                id: item.id || (Date.now() + idx),
                name: item.name.trim(),
                price: item.price.trim(),
                category: item.category || 'Food',
                description: (item.description || '').trim(),
                image: (item.image || '').trim() || getAIAssignedImage(item.name, item.category || 'Food', managerContext),
                status: 'verified'
            }));

            await setDoc(doc(db, 'business_menus', user?.email?.toLowerCase() || userEmailKey), {
                items: formattedItems,
                updatedAt: new Date().toISOString()
            });

            localStorage.setItem(`green_published_menu_${managerContext}_${userEmailKey}`, JSON.stringify(formattedItems));
            alert(`Catalog finalized! ${formattedItems.length} items published live to the Green Grid.`);
            navigate(`/manager${window.location.search}`);
        } catch (err) {
            console.error('Failed to publish manual catalog:', err);
            localStorage.setItem(`green_published_menu_${managerContext}_${userEmailKey}`, JSON.stringify(validItems));
            alert(`Catalog finalized locally (${validItems.length} items).`);
            navigate(`/manager${window.location.search}`);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleFieldChange = (index, field, value) => {
        const updated = [...manualItems];
        updated[index][field] = value;
        setManualItems(updated);
    };

    const handleRowImageUpload = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 800000) {
            alert('Image file is too large. Please select an image smaller than 800KB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            handleFieldChange(index, 'image', reader.result);
        };
        reader.readAsDataURL(file);
    };

    const addNewRow = () => {
        const categories = getCategoryOptions();
        const defaultCat = categories.length > 0 ? categories[0].value : 'Food';
        setManualItems([...manualItems, {
            id: Date.now() + Math.random(),
            name: '',
            price: '',
            category: defaultCat,
            description: '',
            image: ''
        }]);
    };

    const removeItem = (id) => {
        // Keep at least one row
        if (manualItems.length === 1) {
            const categories = getCategoryOptions();
            const defaultCat = categories.length > 0 ? categories[0].value : 'Food';
            setManualItems([{
                id: Date.now(),
                name: '',
                price: '',
                category: defaultCat,
                description: '',
                image: ''
            }]);
            return;
        }
        setManualItems(manualItems.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-10 pb-20 w-full">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-[#ffffff]">Catalog <span className="text-[#00e5ff]">Manager</span></h1>
                    <p className="text-[#9ca3af] text-sm font-bold uppercase tracking-widest leading-none">Precision Manual Item Mapping</p>
                </div>
            </div>

            <div className="space-y-6">
                    {/* Bulk Spreadsheet Editor Grid */}
                    <div className="bg-[#0a0f1c80] backdrop-blur-xl border border-[#ffffff1a] rounded-[2rem] p-0.5 shadow-2xl relative overflow-hidden">
                        <div className="bg-[#0a0f1c] rounded-[1.9rem] p-4 md:p-6 overflow-hidden space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-[#00e5ff1a] border border-[#00e5ff33] rounded-xl flex items-center justify-center text-[#00e5ff] shadow-md">
                                        <Utensils size={18} />
                                    </div>
                                    <h3 className="text-lg font-black italic uppercase text-[#ffffff] tracking-tighter">Bulk Catalog <span className="text-[#00e5ff]">Definitions</span></h3>
                                </div>
                                <button 
                                    onClick={addNewRow}
                                    className="px-4 py-2 bg-[#00e5ff1a] border border-[#00e5ff33] hover:border-[#00e5ff80] rounded-xl text-[9px] font-black uppercase text-[#00e5ff] tracking-widest flex items-center gap-2 hover:scale-[1.03] transition-all"
                                >
                                    <Plus size={12} /> Add New Row
                                </button>
                            </div>

                            <div className="overflow-x-auto no-scrollbar rounded-2xl border border-[#ffffff1a]">
                                <table className="w-full text-left border-collapse min-w-[850px]">
                                    <thead>
                                        <tr className="border-b border-[#ffffff1a] bg-[#ffffff05] text-[8px] font-black text-[#9ca3af] uppercase tracking-[0.2em]">
                                            <th className="p-3 pl-4 w-[25%]">Product Nomenclature</th>
                                            <th className="p-3 w-[20%]">Catalog Category</th>
                                            <th className="p-3 w-[12%] text-center">Price (€)</th>
                                            <th className="p-3 w-[28%]">Operational Description</th>
                                            <th className="p-3 w-[12%]">Visual Asset</th>
                                            <th className="p-3 pr-4 w-[3%] text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ffffff1a]">
                                        {manualItems.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-white/[0.01] transition-all">
                                                {/* Name */}
                                                <td className="p-2.5 pl-4">
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. Premium Lager"
                                                            className="w-full bg-btn-sec border border-[#ffffff26] rounded-lg p-2 text-[10px] font-bold text-[#ffffff] focus:border-[#00e5ff] outline-none placeholder-[#4b5563]"
                                                            value={item.name}
                                                            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                        />
                                                </td>
                                                {/* Category */}
                                                <td className="p-2.5">
                                                    <select 
                                                        className="w-full bg-[#ffffff0d] border border-[#ffffff1a] rounded-xl p-2.5 text-xs font-black uppercase italic text-[#00e5ff] focus:border-[#00e5ff66] outline-none transition-all appearance-none"
                                                        value={item.category}
                                                        onChange={(e) => handleFieldChange(index, 'category', e.target.value)}
                                                        style={{
                                                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300ff88' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'right 12px center',
                                                            backgroundSize: '8px',
                                                            paddingRight: '24px'
                                                        }}
                                                    >
                                                        {getCategoryOptions().map(option => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                {/* Price */}
                                                <td className="p-2.5">
                                                    <input 
                                                        type="text" 
                                                        placeholder="0.00"
                                                        className="w-full bg-btn-sec/50 border border-main rounded-xl p-2.5 text-xs font-black text-brand focus:border-brand/40 outline-none transition-all placeholder:opacity-20 text-center"
                                                        value={item.price}
                                                        onChange={(e) => handleFieldChange(index, 'price', e.target.value)}
                                                    />
                                                </td>
                                                {/* Description */}
                                                <td className="p-2.5">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Internal notes..."
                                                            className="w-full bg-btn-sec border border-[#ffffff26] rounded-lg p-2 text-[9px] font-bold text-[#ffffff] focus:border-[#00e5ff] outline-none placeholder-[#4b5563]"
                                                            value={item.description || ''}
                                                            onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                                                        />
                                                </td>
                                                {/* Visual Asset Upload/URL */}
                                                <td className="p-2.5">
                                                    <div className="flex items-center gap-2">
                                                        {item.image ? (
                                                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#ffffff1a] shrink-0 group/rowthumb">
                                                                <img src={item.image} alt="Thumb" className="w-full h-full object-cover" />
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handleFieldChange(index, 'image', '')}
                                                                    className="absolute inset-0 bg-black/80 opacity-0 group-hover/rowthumb:opacity-100 flex items-center justify-center text-red-500 text-[8px] font-black uppercase transition-opacity"
                                                                >
                                                                    Clear
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2 items-center w-full">
                                                                <label htmlFor={`file-upload-${item.id}`} className="cursor-pointer px-2 py-2 bg-[#ffffff0d] border border-[#ffffff1a] rounded-lg hover:text-[#00e5ff] hover:border-[#00e5ff4d] transition-all flex items-center justify-center gap-1 shrink-0">
                                                                    <Upload size={10} className="text-[#9ca3af]" />
                                                                    <span className="text-[7px] font-black uppercase text-[#9ca3af] tracking-widest text-left">File</span>
                                                                </label>
                                                                <input 
                                                                    id={`file-upload-${item.id}`}
                                                                    type="file" 
                                                                    accept="image/*" 
                                                                    className="hidden" 
                                                                    onChange={(e) => handleRowImageUpload(index, e)} 
                                                                />
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Or URL"
                                                                    className="w-full bg-btn-sec border border-[#ffffff26] rounded-lg p-2 text-[9px] font-bold text-[#ffffff] focus:border-[#00e5ff] outline-none placeholder-[#4b5563]"
                                                                    value={item.image || ''}
                                                                    onChange={(e) => handleFieldChange(index, 'image', e.target.value)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                {/* Delete button */}
                                                <td className="p-2.5 pr-4 text-right">
                                                    <button 
                                                        onClick={() => removeItem(item.id)} 
                                                        className="w-8 h-8 bg-[#ffffff0d] border border-[#ffffff1a] rounded-lg text-[#9ca3af] hover:text-red-500 hover:border-red-500/40 transition-all flex items-center justify-center inline-flex"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Finalize Button */}
                    <div className="pb-16 pt-2">
                        <button 
                            onClick={publishManualMenu}
                            disabled={isPublishing}
                            className="w-full py-5 bg-[#000000] text-[#ffffff] border border-[#00e5ff] rounded-[1.5rem] text-xs font-black uppercase tracking-[0.3em] shadow-lg hover:bg-[#00e5ff1a] hover:text-[#00e5ff] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isPublishing ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} /> Saving Menu Catalog...
                                </>
                            ) : (
                                <>
                                    Finalize & Save Menu Catalog ({manualItems.filter(item => item.name.trim() !== '').length} Items) <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
        </div>
    );
};

export default MenuManagement;
