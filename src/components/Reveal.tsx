"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Soft, one-time entrance used for every block, so all motion shares one rhythm. */
export default function Reveal({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
