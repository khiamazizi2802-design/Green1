import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Clock, Upload, Edit3 } from 'lucide-react';

const DocumentArea = ({ title, description, documents, onUpload, onAccept, onDeny }) => {
    const [uploadingId, setUploadingId] = React.useState(null);
    const [previewDoc, setPreviewDoc] = React.useState(null);
    const fileInputRef = React.useRef(null);

    const handleUploadClick = (id) => {
        setUploadingId(id);
        // Simulate file selection and upload
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            // Simulate a delay for visual feedback
            setTimeout(() => {
                if (onUpload) onUpload(uploadingId);
                setUploadingId(null);
                e.target.value = null; // Reset input
            }, 1500);
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
                            <div className={`p-3 rounded-2xl ${doc.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : doc.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                                <FileText size={24} />
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
                                doc.status === 'verified' ? (
                                    <div className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest text-emerald-500 text-center">
                                        Agreement Accepted
                                    </div>
                                ) : (
                                    <>
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
                                    </>
                                )
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
                    <div className="relative w-full max-w-[400px] bg-dark-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col p-6 space-y-6">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <h4 className="font-black italic uppercase tracking-tighter text-white">{previewDoc.name}</h4>
                            <button onClick={() => setPreviewDoc(null)} className="text-gray-500 hover:text-white"><CheckCircle2 size={24} /></button>
                        </div>
                        <div className="aspect-[4/3] bg-dark-800 rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 relative">
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
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Requirement</p>
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
        </div>
    );
};

export default DocumentArea;



