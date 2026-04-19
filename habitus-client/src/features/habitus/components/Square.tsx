import { motion } from "framer-motion";
import { baseCell, cellBorder } from "@/features/habitus/constants";

interface SquareProps {
  active: number;
  onClick: () => void;
  isToday?: boolean;
}

export const Square: React.FC<SquareProps> = ({
  active,
  onClick,
  isToday,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className={[
        baseCell,
        cellBorder,
        "cursor-pointer",
        active
          ? "bg-[#0f172a] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_1px_rgba(100,100,100,0.3)]"
          : "bg-white dark:bg-[#111318]",
        isToday ? "ring-1 ring-black/40" : "",
        "hover:border-black hover:shadow-[inset_0_0_3px_-1px_rgba(0,0,0,1)]",
      ].join(" ")}
    />
  );
};