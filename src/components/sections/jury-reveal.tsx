"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { User } from 'lucide-react';
import Image from 'next/image';

const juryEvents = [
    { 
        id: 1, 
        title: "AnyBody Can Dance", 
        image: "/jury/Dance Jury.png",
        isRevealed: true 
    },
    { 
        id: 2, 
        title: "Voice Quest", 
        image: "/jury/Singing Jury.png",
        isRevealed: true 
    },
    { 
        id: 4, 
        title: "Walk Of Fame", 
        image: null,
        isRevealed: false 
    },
    { 
        id: 5, 
        title: "Frame By Frame", 
        image: null,
        isRevealed: false 
    },
];

const JuryReveal = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

    return (
        <section
            ref={sectionRef}
            className="relative w-full py-24 md:py-32 bg-black overflow-hidden flex flex-col items-center justify-center"
        >
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center mb-20"
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black font-bricolage tracking-widest uppercase bg-gradient-to-b from-white via-zinc-400 to-zinc-800 bg-clip-text text-transparent mb-4">
                        Meet Our Jury
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 w-full">
                    {juryEvents.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                            className="flex flex-col items-center group"
                        >
                            <div className="relative w-full aspect-square max-w-[280px] rounded-3xl bg-zinc-900/50 border-2 border-white/10 overflow-hidden backdrop-blur-xl group-hover:border-purple-500/50 transition-all duration-500 shadow-2xl group-hover:shadow-purple-500/20">
                                {event.isRevealed && event.image ? (
                                    <>
                                        <Image
                                            src={event.image}
                                            alt={event.title}
                                            fill
                                            className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                                            sizes="(max-width: 640px) 100vw, 280px"
                                            priority={index < 2}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                    </>
                                ) : (
                                    <>
                                        <Image
                                            src="/soon.svg"
                                            alt="Revealing Soon"
                                            fill
                                            className="object-cover opacity-10 transform group-hover:scale-105 transition-all duration-700 animate-pulse duration-[3000ms]"
                                            sizes="(max-width: 640px) 100vw, 280px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent animate-pulse duration-[2000ms]" />
                                    </>
                                )}
                            </div>

                            <div className="mt-6 text-center">
                                <h3 className="text-xl md:text-2xl font-black font-bricolage uppercase tracking-tighter mb-2 bg-gradient-to-b from-white via-[#C0C0C0] to-[#505050] bg-clip-text text-transparent mix-blend-screen drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                                    {event.title}
                                </h3>
                                <div className="flex items-center justify-center h-8">
                                    {event.isRevealed ? (
                                        <span 
                                            className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 font-inter"
                                            style={{ fontFamily: '"Inter", sans-serif' }}
                                        >
                                            Official Jury
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full animate-pulse transition-all">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-ping" />
                                            <span 
                                                className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-inter"
                                                style={{ fontFamily: '"Inter", sans-serif' }}
                                            >
                                                Revealing Soon
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default JuryReveal;
