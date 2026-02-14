import React, { useState } from 'react';
import { FaLock, FaArrowRight, FaShieldAlt, FaFingerprint, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import config from '../../config';
import { toast } from 'sonner';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleClose = () => {
        router.push('/');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            toast.error('Identity Verification Required', {
                description: 'Please enter your access password'
            });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${config.API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Access Authenticated', {
                    description: 'Decrypting dashboard systems...'
                });
                onLoginSuccess(data.token);
            } else {
                toast.error('Authentication Failed', {
                    description: 'Incorrect security credentials provided'
                });
                setPassword('');
            }
        } catch (err) {
            console.error(err);
            toast.error('System Timeout', {
                description: 'Communication with security server lost'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-hidden font-bricolage">
            {/* Dynamic Background Noise/Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />
            
            {/* Ambient Background Light */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] animate-pulse rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] animate-pulse rounded-full pointer-events-none z-0" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="relative w-full max-w-[440px] z-10"
            >
                {/* Vistara Floating Tag */}
                <div className="absolute -top-4 left-8 z-50">
                    <div className="bg-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.2)] border border-white">
                        <FaShieldAlt className="text-black text-[10px]" />
                        <span className="text-[10px] font-black text-black uppercase tracking-[0.1em] font-bricolage">
                            Authorised by Vistara
                        </span>
                    </div>
                </div>

                {/* Close Button */}
                <div className="absolute -top-4 right-8 z-50">
                    <button 
                        onClick={handleClose}
                        className="group bg-[#0c0c0c] border-2 border-zinc-800 p-2.5 rounded-full text-zinc-500 hover:text-white transition-all hover:border-white/20 active:scale-90 shadow-xl"
                        title="Return to Home"
                    >
                        <FaTimes size={12} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Primary Card with double-border technique */}
                <div className="bg-[#080808] border-2 border-zinc-800/80 rounded-[32px] p-1.5 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-20">
                    <div className="bg-[#0c0c0c] border border-white/5 rounded-[26px] overflow-hidden relative">
                        
                        {/* Scanline Effect */}
                        <motion.div 
                            className="absolute top-0 left-0 right-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-[100px] z-0"
                            initial={{ y: "-100%" }}
                            animate={{ y: "400%" }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Content Wrapper explicitly on top */}
                        <div className="p-8 sm:p-10 relative z-30">
                            {/* Header Section */}
                            <div className="flex flex-col items-center mb-12">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full scale-110" />
                                    <div className="relative w-20 h-20 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl border-2 border-white/10 flex items-center justify-center group pointer-events-none">
                                        <FaFingerprint className="text-purple-400 text-3xl" />
                                        
                                        {/* Corner Accents */}
                                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-purple-500 rounded-tl-[1px]" />
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-purple-500 rounded-br-[1px]" />
                                    </div>
                                </div>

                                <h2 
                                    className="text-4xl font-black text-white tracking-tight uppercase leading-none text-center bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent"
                                    style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
                                >
                                    Admin<br/>Console
                                </h2>
                            </div>

                            {/* Form Section */}
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end px-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Access Portal</label>
                                        <span className="text-[9px] font-bold text-zinc-700 tracking-widest uppercase text-opacity-50">Encrypted</span>
                                    </div>
                                    
                                    <div className="relative group">
                                        {/* Glow effect that appears on focus */}
                                        <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />
                                        
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-black/60 border-2 border-zinc-800 rounded-xl py-4 pl-6 pr-14 text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500/40 transition-all font-inter text-lg relative z-10"
                                            placeholder="Enter password"
                                            autoComplete="current-password"
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                                            <FaLock className="text-zinc-700 group-focus-within:text-purple-500/50 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full group overflow-hidden bg-white rounded-xl h-16 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                <span className="text-black font-black uppercase text-sm tracking-tight font-bricolage">Validating</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-black font-black uppercase text-sm tracking-tight font-bricolage">Access Dashboard</span>
                                                <FaArrowRight className="text-black group-hover:translate-x-1.5 transition-transform duration-300" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>

                            {/* Footer Status Indicators */}
                            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between opacity-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active</span>
                                </div>
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Protocol: XC-9</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
