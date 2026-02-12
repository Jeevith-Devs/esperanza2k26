'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqItems = [
    {
        id: 'item-1',
        question: 'What is Esperanza 2k26?',
        answer: "VTMT's annual cultural festival on March 6th, 2026, featuring dance, music, film, and fashion events.",
    },
    {
        id: 'item-2',
        question: 'What events are available?',
        answer: "6 events - Solo/Group Dance, Solo/Group Singing, Short Film, and Ramp Walk.",
    },
    {
        id: 'item-3',
        question: 'How do I register?',
        answer: "Contact event coordinators: Jervin (Dance), Darshan (Singing), Sai Santhosh (Media), Silviya (Ramp Walk).",
    },
    {
        id: 'item-4',
        question: 'Who organizes this festival?',
        answer: "Vistara Club at VTMT, led by President Ganesh K and General Secretary Arshandhan S U.",
    },
    {
        id: 'item-5',
        question: 'Where can I find event details?',
        answer: "Visit our Events page for complete rules, timings, and downloadable brochure with all information.",
    },
]

export default function FAQs() {
    const sectionRef = useRef(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
    const [openItem, setOpenItem] = useState<string | null>(null)

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id)
    }

    return (
        <section ref={sectionRef} className="bg-black py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden">
            {/* Subtle Background Gradient */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[500px] md:w-[600px] h-[200px] sm:h-[250px] md:h-[300px] bg-gradient-to-b from-purple-600/30 via-transparent to-transparent blur-3xl" />
            </div>

            <div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl px-4 sm:px-6 md:px-8 lg:px-12 relative z-10">
                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight bg-gradient-to-b from-white via-[#C0C0C0] to-[#505050] bg-clip-text text-transparent mix-blend-screen drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] uppercase font-bricolage mb-3 sm:mb-4 leading-tight">
                    Your Questions Answered
                </motion.h2>
                
                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="text-center text-white/50 text-sm sm:text-base md:text-lg font-normal font-bricolage px-2 mb-8 sm:mb-10 md:mb-12 lg:mb-16">
                    Everything you need to know about Esperanza 2k26
                </motion.p>
                
                {/* FAQ Items */}
                <div className="mt-6 sm:mt-8 md:mt-12 space-y-0">
                    {faqItems.map((item, index) => {
                        const isOpen = openItem === item.id

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                                className="group">
                                <div className="peer rounded-lg border-none px-3 sm:px-4 md:px-5 py-0.5 sm:py-1">
                                    {/* Question Button */}
                                    <button
                                        onClick={() => toggleItem(item.id)}
                                        className={`w-full cursor-pointer py-3 sm:py-3.5 md:py-4 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-left leading-snug flex items-center justify-between gap-4 transition-all duration-300 ${
                                            isOpen
                                                ? 'bg-gradient-to-b from-white to-[#C0C0C0] bg-clip-text text-transparent'
                                                : 'text-white/90 hover:text-white'
                                        } font-bricolage`}>
                                        <span>{item.question}</span>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="shrink-0">
                                            <ChevronDown className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300 ${
                                                isOpen ? 'text-white/80' : 'text-white/40'
                                            }`} />
                                        </motion.div>
                                    </button>

                                    {/* Answer Content */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            height: isOpen ? 'auto' : 0,
                                            opacity: isOpen ? 1 : 0,
                                        }}
                                        transition={{
                                            height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                                            opacity: { duration: 0.3, delay: isOpen ? 0.1 : 0 },
                                        }}
                                        className="overflow-hidden">
                                        <div className="pt-1 sm:pt-1.5 md:pt-2">
                                            <p className="text-white/60 pb-2 sm:pb-2.5 md:pb-3 text-sm sm:text-base md:text-lg leading-relaxed font-bricolage font-normal">
                                                {item.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                                
                                {/* Divider */}
                                <motion.hr
                                    animate={{ opacity: isOpen ? 0 : 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="mx-3 sm:mx-4 md:mx-5 group-last:hidden border-white/10 border-t-2"
                                />
                            </motion.div>
                        )
                    })}
                </div>
                
                {/* Bottom CTA */}
                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
                    className="mt-8 sm:mt-10 md:mt-12 lg:mt-14 text-center text-sm sm:text-base md:text-lg lg:text-xl text-white/50 font-bricolage px-2">
                    Still have questions?{' '}
                    <a
                        href="mailto:technical.vistara25@gmail.com"
                        className="bg-gradient-to-b from-white to-[#C0C0C0] bg-clip-text text-transparent font-semibold hover:from-white hover:to-white transition-all duration-300 inline-block">
                        Contact our team
                    </a>
                </motion.p>
            </div>
        </section>
    )
}
