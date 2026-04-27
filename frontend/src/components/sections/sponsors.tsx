"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { InfiniteRibbon } from "../ui/infinite-ribbon";

const marqueeItems = [
  "Opportunity", "Exposure", "Visibility", "Branding", "Engagement",
  "Collaboration", "Impact", "Influence", "Reach", "Recognition",
  "Partnership", "Audience", "Connection", "Leadership", "Innovation",
  "Growth", "Exclusivity", "Prestige", "Momentum", "Trust"
];

const Sponsors = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const sponsorsRef = useRef(null);

  const isTitleInView = useInView(titleRef, { once: true, amount: 0.5 });
  const isSponsorsInView = useInView(sponsorsRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const sponsorY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <div className="my-8 min-h-screen w-full overflow-hidden bg-background" id="sponsors">
      <InfiniteRibbon words={marqueeItems} />

      <section ref={sectionRef} className="pb-[1rem] pt-[4rem] md:pt-[7rem] px-2">
        <motion.h2
          ref={titleRef}
          initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
          animate={isTitleInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-gradient-to-b from-white via-[#C0C0C0] to-[#505050] bg-clip-text text-transparent mix-blend-screen drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] flex justify-center text-center font-bricolage text-2xl md:text-4xl lg:text-5xl font-black mb-8 md:mb-8 tracking-tighter"
          style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
        >
          OUR SPONSORS
        </motion.h2>

        <motion.section 
          ref={sponsorsRef} 
          style={{ y: sponsorY }}
          className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-6 lg:gap-8 mt-4 md:mt-8 pb-10 md:pb-16"
        >
          {[1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 80, filter: "blur(10px)" }}
              animate={isSponsorsInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.7, delay: index * 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-center justify-center font-bricolage text-white w-full md:w-auto"
            >
              <motion.div
                className="relative group h-auto md:h-40 lg:h-52 px-4 md:px-4 py-4 md:py-6 flex items-center justify-center w-full md:w-auto md:cursor-pointer"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Outer Glow Effect on Hover (Desktop only) */}
                <div className="absolute inset-2 md:inset-4 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 md:group-hover:opacity-100 blur-xl transition-all duration-500 z-0" />
                
                {/* Main Card Container */}
                <div className="relative z-10 w-[85vw] sm:w-[70vw] md:w-56 lg:w-72 aspect-video md:aspect-auto md:h-full rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden transition-all duration-500 md:group-hover:border-white/20 md:group-hover:bg-white/[0.02]">
                  
                  {/* Inner Refined Shine (Top Edge) */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Image Container */}
                  <motion.div className="w-full h-full relative"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <img 
                      src={`/sponsors/${index}.png`} 
                      alt={`Sponsor ${index}`} 
                      className="w-full h-full object-cover filter brightness-100 contrast-125 saturate-100 md:saturate-50 md:group-hover:saturate-100 md:group-hover:brightness-110 transition-all duration-500" 
                    />
                    
                    {/* Thematic Vignette Overlay for Depth (Desktop only) */}
                    <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-50 md:group-hover:opacity-20 transition-opacity duration-500" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.section>
      </section>
    </div>
  );
};

export default Sponsors;