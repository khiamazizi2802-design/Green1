import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, 
    Receipt, 
    ArrowLeft, 
    Share2, 
    Download, 
    ShieldCheck, 
    Zap,
    MapPin,
    Star
} from 'lucide-react';
import { triggerNotification } from '../components/NotificationToast';

const OrderReceiptPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart = [], venueName = "The Skyline Club", tableId = "Unknown", totalCost = 0, orderId = Date.now(), isHotel = false, guestName = null, paymentStatus = "PAID" } = location.state || {};

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-brand/30">
            {/* Backdrop Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto p-6 pt-16 pb-32">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand">Final Ticket</h2>
                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Ref #{orderId}</p>
                    </div>
                    <button 
                        onClick={() => triggerNotification("EXPORT SUCCESS", "Digital receipt saved to your vault.")}
                        className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand"
                    >
                        <Download size={20} />
                    </button>
                </header>

                {/* Success Banner */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 space-y-4"
                >
                    <div className="relative inline-block">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                            className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(0,0,0,0.2)]"
                        >
                            <CheckCircle2 size={48} strokeWidth={3} />
                        </motion.div>
                        <motion.div 
                            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-black rounded-full -z-10"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Mission Success</h1>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1 italic">
                            {isHotel ? 'Room' : 'Table'} {tableId} • {venueName}
                        </p>
                        {guestName && (
                            <p className="text-[9px] text-brand font-black uppercase tracking-widest mt-1">Verified Guest: {guestName}</p>
                        )}
                    </div>
                </motion.div>

                {/* Main Receipt Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white border border-black/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group"
                >
                    {/* Decorative Receipt Cutout */}
                    <div className="absolute -top-3 left-0 right-0 flex justify-center gap-2">
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className="w-4 h-6 bg-gray-50 rounded-full border border-black/5" />
                        ))}
                    </div>

                    <div className="space-y-8 pt-4">
                        <div className="flex items-center gap-3 pb-6 border-b border-black/5">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                                <Receipt size={20} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-black tracking-widest">Transaction Confirmed</h4>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                    {paymentStatus === 'BILLED TO ROOM' ? 'Settled to Room Folio' : 'Payment settled via Card'}
                                </p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-6">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center group/item">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-gray-200 italic">0{idx + 1}</span>
                                        <div>
                                            <p className="text-xs font-black italic uppercase text-black group-hover/item:text-brand transition-colors">{item.name}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.tags?.[0] || 'Premium Selection'}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black italic text-black group-hover/item:text-brand transition-colors">€{item.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Summary Footer */}
                        <div className="pt-8 border-t border-dashed border-black/10 space-y-4">
                            <div className="flex justify-between items-center text-gray-400">
                                <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                                <span className="text-sm font-black italic">€{totalCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-400">
                                <span className="text-[10px] font-black uppercase tracking-widest">Tax (VAT 19%)</span>
                                <span className="text-sm font-black italic">Inc.</span>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand">Total Settled</span>
                                    <span className="text-[7px] text-gray-300 font-bold uppercase tracking-widest">Verified by Green Hub</span>
                                </div>
                                <span className="text-4xl font-black italic text-black tracking-tighter">€{totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Scan Code */}
                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                        <div className="w-full h-12 bg-white flex items-center justify-center p-2 rounded-xl opacity-80 hover:opacity-100 transition-opacity">
                            <div className="w-full h-full border-y border-black flex gap-1 items-center justify-center">
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className={`h-full bg-black ${Math.random() > 0.5 ? 'w-0.5' : 'w-1'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-[7px] font-black text-gray-700 uppercase tracking-[0.5em]">TICKET-AUTH-SECURE-992-X</p>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 grid grid-cols-2 gap-4"
                >
                    <button 
                        onClick={() => triggerNotification("SENT", "Receipt shared to your secure contact list.")}
                        className="py-5 bg-black/5 border border-black/10 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-black hover:bg-black/10 transition-all flex items-center justify-center gap-3"
                    >
                        <Share2 size={16} /> Share
                    </button>
                    <button 
                        onClick={() => navigate('/greens')}
                        className="py-5 bg-black text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Zap size={16} fill="currentColor" /> {isHotel ? 'Close Folio' : 'Close Table'}
                    </button>
                </motion.div>

                {/* Footer Insight */}
                <div className="mt-12 text-center flex items-center justify-center gap-3 opacity-30">
                    <ShieldCheck size={14} className="text-brand" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-black italic">Green Hub Verified Transaction</p>
                </div>
            </div>
        </div>
    );
};

export default OrderReceiptPage;
