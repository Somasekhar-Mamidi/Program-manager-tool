"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function AnimeThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted) return null

    const isDark = resolvedTheme === "dark"

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark")
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative w-16 h-8 rounded-full p-1 cursor-pointer transition-colors duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
                background: isDark
                    ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)"
                    : "linear-gradient(135deg, #bae6fd 0%, #7dd3fc 50%, #38bdf8 100%)",
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {/* Stars (visible in dark mode) */}
            <AnimatePresence>
                {isDark && (
                    <>
                        <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="absolute top-1.5 left-2 w-1 h-1 rounded-full bg-white"
                        />
                        <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ delay: 0.35, duration: 0.3 }}
                            className="absolute top-2.5 left-5 w-0.5 h-0.5 rounded-full bg-yellow-200"
                        />
                        <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                            className="absolute bottom-2 left-3 w-0.5 h-0.5 rounded-full bg-white/80"
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Clouds (visible in light mode) */}
            <AnimatePresence>
                {!isDark && (
                    <>
                        <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 0.8, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ delay: 0.15, duration: 0.4 }}
                            className="absolute top-1 right-2 w-3 h-1.5 rounded-full bg-white/80"
                        />
                        <motion.span
                            initial={{ opacity: 0, x: 4 }}
                            animate={{ opacity: 0.6, x: 0 }}
                            exit={{ opacity: 0, x: 4 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="absolute bottom-1.5 right-4 w-2.5 h-1 rounded-full bg-white/60"
                        />
                    </>
                )}
            </AnimatePresence>

            {/* The Sun/Moon orb */}
            <motion.div
                layout
                className="relative w-6 h-6 rounded-full shadow-lg"
                style={{
                    background: isDark
                        ? "linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)"
                        : "linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #f97316 100%)",
                    boxShadow: isDark
                        ? "0 0 12px 3px rgba(253, 230, 138, 0.4)"
                        : "0 0 16px 4px rgba(251, 191, 36, 0.4)",
                }}
                animate={{
                    x: isDark ? 32 : 0,
                    rotate: isDark ? 360 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                }}
            >
                {/* Moon craters (dark mode) */}
                <AnimatePresence>
                    {isDark && (
                        <>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-amber-600/30"
                            />
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-1.5 right-1 w-1 h-1 rounded-full bg-amber-600/25"
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* Sun rays (light mode) */}
                <AnimatePresence>
                    {!isDark && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0"
                        >
                            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                                <motion.span
                                    key={deg}
                                    className="absolute w-0.5 h-1 bg-amber-400/60 rounded-full"
                                    style={{
                                        top: "50%",
                                        left: "50%",
                                        transformOrigin: "center",
                                        transform: `rotate(${deg}deg) translateY(-10px) translateX(-1px)`,
                                    }}
                                    animate={{
                                        opacity: [0.4, 0.8, 0.4],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: deg / 360,
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </button>
    )
}
