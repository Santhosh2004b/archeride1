
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export default function RevealRow({ children, delay = 0 }) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={controls}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      style={{ marginBottom: 32 }}
    >
      {children}
    </motion.section>
  );
}
