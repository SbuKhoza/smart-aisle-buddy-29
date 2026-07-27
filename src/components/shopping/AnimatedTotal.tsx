import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export function AnimatedTotal({
  value,
  prefix = "R ",
  className,
}: {
  value: number;
  prefix?: string;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => `${prefix}${Math.round(v).toLocaleString()}`);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.4, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);
  return <motion.span className={className}>{rounded}</motion.span>;
}