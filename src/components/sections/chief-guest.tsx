"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const ChiefGuest = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

    return (
        <section
            id="chief-guest"
            ref={sectionRef}
            className="relative w-full py-24 md:py-32 bg-black overflow-hidden flex flex-col items-center justify-center"
        >
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-7xl">
                {/* Section Header - Styled exactly like Jury Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center mb-16 md:mb-20"
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black font-bricolage tracking-widest uppercase bg-gradient-to-b from-white via-zinc-400 to-zinc-800 bg-clip-text text-transparent mb-4">
                        Chief Guest
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                </motion.div>

                {/* Big Banner Card with Re-implementation of the Spinning Border Effect */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-6xl px-4 md:px-0"
                >
                    {/* Outer wrapper — handles the spinning border via padding-trick */}
                    <div className="relative group/card rounded-xl md:rounded-2xl p-[2px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 ease-in-out cursor-default">
                        
                        {/* Outer base border color when not hovered */}
                        <div className="absolute inset-0 bg-white/10 transition-opacity duration-500 ease-in-out group-hover/card:opacity-0" />

                        {/* Hardware Accelerated Spinning Conic Gradient Border */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 ease-in-out pointer-events-none">
                            <div className="w-full h-full animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#A855F7_10%,transparent_40%,transparent_100%)] will-change-transform" />
                        </div>

                        {/* Core Inner Card */}
                        <div className="relative w-full bg-zinc-900/95 backdrop-blur-xl rounded-[calc(0.75rem-2px)] md:rounded-[calc(1rem-2px)] overflow-hidden z-10 transition-colors duration-500 ease-in-out">
                            
                            {/* Soft interior glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none" />

                            <div className="relative w-full overflow-hidden">
                                <img
                                    src="/images/Chief Guest Image.png"
                                    alt="Chief Guest Banner"
                                    className="w-full h-auto block relative z-10"
                                />
                                
                                {/* Refined Overlays for Depth */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-20" />
                                
                                {/* Inner Ring/Border */}
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[calc(0.75rem-2px)] md:rounded-[calc(1rem-2px)] pointer-events-none z-30" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black to-transparent z-20" />
        </section>
    );
};

export default ChiefGuest;
