/**
 * Reusable Framer Motion animation wrappers for page transitions
 * and staggered card entrance animations throughout Orbit.
 */
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

// Page-level fade + slide up
export function AnimatedPage({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Staggered container — children animate one after another
export function StaggerContainer({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Individual card entrance — use inside StaggerContainer
export function StaggerItem({ children, className, ...props }: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.97 },
                visible: {
                    opacity: 1, y: 0, scale: 1,
                    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// Fade in on scroll — triggers when element enters viewport
export function FadeInView({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Scale up on hover — for interactive cards
export function HoverCard({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Counter animation — animates a number from 0 to target
export function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
    return (
        <motion.span
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {prefix}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
        </motion.span>
    );
}
