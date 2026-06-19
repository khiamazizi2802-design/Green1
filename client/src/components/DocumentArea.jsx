import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Clock, Upload, Edit3 } from 'lucide-react';

const DocumentArea = ({ title, description, documents, onUpload, onAccept, onDeny }) => {
    const [uploadingId, setUploadingId] = React.useState(null);
    const [previewDoc, setPreviewDoc] = React.useState(null);
    const [showTermsModal, setShowTermsModal] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const handleUploadClick = (id) => {
        setUploadingId(id);
        // Simulate file selection and upload
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                alert("⚠️ PDF files are not supported because they are too large for the database. Please take a photo of your P-Schein (JPG/PNG) and upload it instead.");
                setUploadingId(null);
                e.target.value = null; // Reset input
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                const img = new Image();
                img.src = base64;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 800;
                    if (width > height) {
                        if (width > maxDim) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL('image/jpeg', 0.7);
                    setTimeout(() => {
                        if (onUpload) onUpload(uploadingId, compressed);
                        setUploadingId(null);
                        e.target.value = null; // Reset input
                    }, 800);
                };
                img.onerror = () => {
                    setTimeout(() => {
                        if (onUpload) onUpload(uploadingId, base64);
                        setUploadingId(null);
                        e.target.value = null; // Reset input
                    }, 800);
                };
            };
            reader.readAsDataURL(file);
        } else {
            setUploadingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{title}</h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 transition-all hover:border-brand/30 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${doc.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : doc.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <FileText size={24} />
                                </div>
                                {doc.file && (
                                    <div 
                                        onClick={() => setPreviewDoc(doc)}
                                        className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black/40 cursor-pointer hover:border-brand/40 hover:scale-105 active:scale-95 transition-all shadow-md"
                                        title="Click to preview photo"
                                    >
                                        <img src={doc.file} className="w-full h-full object-cover" alt="Thumbnail" />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {doc.status === 'verified' ? (
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                                        <CheckCircle2 size={10} /> Verified
                                    </span>
                                ) : doc.status === 'pending' ? (
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                                        <Clock size={10} /> Pending Review
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                                        <AlertCircle size={10} /> Missing
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg font-black tracking-tight text-white mb-1 uppercase italic">{doc.name}</h4>
                            <p className="text-gray-500 text-[10px] leading-relaxed font-bold uppercase tracking-wider">{doc.requirement}</p>
                        </div>

                        <div className="flex gap-2">
                            {doc.id === 'terms' ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <button
                                        onClick={() => setShowTermsModal(true)}
                                        className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        Read Agreement
                                    </button>
                                    {doc.status === 'verified' ? (
                                        <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest text-emerald-500 text-center">
                                            Agreement Accepted
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onAccept && onAccept(doc.id)}
                                                className="flex-1 py-3 bg-brand text-dark-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand/20"
                                            >
                                                Accept Terms
                                            </button>
                                            <button
                                                onClick={() => onDeny && onDeny(doc.id)}
                                                className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all"
                                            >
                                                Deny
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : doc.status === 'missing' ? (
                                <button
                                    onClick={() => handleUploadClick(doc.id)}
                                    disabled={uploadingId === doc.id}
                                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${uploadingId === doc.id ? 'bg-gray-700 text-gray-500' : 'bg-brand text-dark-900 hover:scale-105 shadow-brand/20'}`}
                                >
                                    {uploadingId === doc.id ? (
                                        <><Clock size={14} className="animate-spin" /> Uploading...</>
                                    ) : (
                                        <><Upload size={14} /> Upload Now</>
                                    )}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setPreviewDoc(doc)}
                                        className="flex-1 py-3 bg-white/5 border border-white/5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Clock size={14} /> Open Photo
                                    </button>
                                    <button
                                        onClick={() => handleUploadClick(doc.id)}
                                        disabled={uploadingId === doc.id}
                                        className={`flex-1 py-3 border border-white/5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${uploadingId === doc.id ? 'bg-white/5 text-gray-600' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {uploadingId === doc.id ? (
                                            <><Clock size={14} className="animate-spin" /> Updating...</>
                                        ) : (
                                            <><Edit3 size={14} /> Update</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Simulated Photo Preview */}
            {previewDoc && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
                        onClick={() => setPreviewDoc(null)}
                    />
                    <div className="relative w-full max-w-[400px] bg-neutral-950 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col p-6 space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-neutral-800/60">
                            <h4 className="font-black italic uppercase tracking-tighter text-white">{previewDoc.name}</h4>
                            <button onClick={() => setPreviewDoc(null)} className="text-white/50 hover:text-white"><CheckCircle2 size={24} /></button>
                        </div>
                        <div className="aspect-[4/3] bg-[#1e2520] rounded-2xl flex items-center justify-center overflow-hidden border border-neutral-800/40 relative">
                            {previewDoc.file ? (
                                <img src={previewDoc.file} className="w-full h-full object-cover animate-fade-in" alt={previewDoc.name} />
                            ) : (
                                <>
                                    {/* Simulated Document Photo */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent" />
                                    <FileText size={64} className="text-brand/20" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 italic text-center px-8">
                                            [ Document Photo Preview ]<br /><br />
                                            {previewDoc.name}<br />
                                            Status: {previewDoc.status.toUpperCase()}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-[#1e2520] rounded-2xl space-y-2">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Requirement</p>
                                <p className="text-xs text-white/70 font-medium leading-relaxed">{previewDoc.requirement}</p>
                            </div>
                            <button
                                onClick={() => setPreviewDoc(null)}
                                className="w-full py-4 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-xs"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Terms & Conditions Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
                        onClick={() => setShowTermsModal(false)}
                    />
                    <div className="relative w-full max-w-[500px] max-h-[80vh] bg-neutral-950 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col p-6 space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-neutral-800/60">
                            <h4 className="font-black italic uppercase tracking-tighter text-white">Partner Terms & Data Agreement</h4>
                            <button onClick={() => setShowTermsModal(false)} className="text-white/50 hover:text-white text-lg font-bold">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-white/70 leading-relaxed font-medium">
                            <p className="text-brand font-bold uppercase tracking-wider">Last Updated: June 2026</p>
                            <p>
                                Welcome to the GreenRide Platform. Please review the terms and conditions carefully before accepting. By accepting, you agree to enter a binding partnership agreement with GreenRide.
                            </p>
                            
                            <h5 className="font-black text-white uppercase tracking-tight">1. Partner Relationship & Scope</h5>
                            <p>
                                As a registered fleet driver partner on the GreenRide platform, you act as an independent service provider or an employee of an affiliated fleet manager. You agree to comply with all regional passenger transport permits, vehicle inspection schedules, and platform quality benchmarks.
                            </p>

                            <h5 className="font-black text-white uppercase tracking-tight">2. Compliance & Verification</h5>
                            <p>
                                Drivers must maintain valid and active driving credentials, passenger transport licenses (P-Schein), and registration documents. Any lapse in license validity or failure of safety standards will lead to immediate temporary suspension of dispatch access.
                            </p>

                            <h5 className="font-black text-white uppercase tracking-tight">3. Data Usage & Location Tracking</h5>
                            <p>
                                To enable rides dispatch, route optimization, and safety monitoring, the GreenRide app collects real-time location and GPS data while you are active or online. By accepting these terms, you grant consent for location streaming, telemetry analytics, and storage of dispatch histories.
                            </p>

                            <h5 className="font-black text-white uppercase tracking-tight">4. Safety & Standards</h5>
                            <p>
                                You agree to operate vehicles in a safe, lawful manner, adhering to traffic speed regulations and the platform’s zero-tolerance policy on substance abuse. Cleanliness, vehicle care, and professional customer etiquette must be upheld at all times.
                            </p>

                            <h5 className="font-black text-white uppercase tracking-tight">5. Commission & Settlement</h5>
                            <p>
                                Platform service fees, passenger fares, and driver/fleet manager payouts are calculated dynamically and cleared weekly through the Settlement Ledger, subject to verified ride compliance and platform provisions.
                            </p>
                        </div>
                        <div className="pt-4 border-t border-neutral-800/60">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="w-full py-4 bg-brand text-dark-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all"
                            >
                                Close & Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentArea;



