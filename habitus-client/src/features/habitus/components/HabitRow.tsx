import { motion } from "framer-motion";
import { Square } from "@/features/habitus/components/Square";
import { cellBorder } from "@/features/habitus/constants";
import type { Habit } from "@/features/habitus/model";

interface HabitRowProps {
  habit: Habit;
  gi: number;
  hi: number;
  todayIndex: number;
  toggleCell: (gi: number, hi: number, di: number) => void;
  gridTemplateColumns: string;
}

export const HabitRow: React.FC<HabitRowProps> = ({
  habit,
  gi,
  hi,
  todayIndex,
  toggleCell,
  gridTemplateColumns,
}) => {
  return (
    <motion.div
      className="grid gap-x-2 gap-y-1"
      style={{
        gridColumn: "1 / -1",
        gridTemplateColumns,
      }}
      initial={{ opacity: 0, height: 0, y: -6 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div
        className={[
          "ml-4 pr-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400",
          "flex items-center h-7 px-2 font-semibold overflow-hidden text-ellipsis",
          cellBorder,
          "rounded-sm bg-white dark:bg-[#0b0d10]",
        ].join(" ")}
      >
        {habit.name}
      </div>

      {habit.data.map((val, di) => (
        <motion.div
          key={di}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18, delay: di * 0.004 }}
        >
          <Square
            active={val}
            isToday={di === todayIndex}
            onClick={() => toggleCell(gi, hi, di)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};