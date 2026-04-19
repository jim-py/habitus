import { motion, AnimatePresence } from "framer-motion";
import { cellBorder, baseCell } from "@/features/habitus/constants";
import type { Group } from "@/features/habitus/model";
import { HabitRow } from "@/features/habitus/components/HabitRow";

interface GroupRowProps {
  group: Group;
  gi: number;
  collapsed: boolean;
  toggleGroup: (gi: number) => void;
  toggleCell: (gi: number, hi: number, di: number) => void;
  todayIndex: number;
  gridTemplateColumns: string;
}

export const GroupRow: React.FC<GroupRowProps> = ({
  group,
  gi,
  collapsed,
  toggleGroup,
  toggleCell,
  todayIndex,
  gridTemplateColumns,
}) => {
  return (
    <div className="contents">
      {/* Header */}
      <motion.button
        type="button"
        onClick={() => toggleGroup(gi)}
        className={[
          "pr-4 text-sm font-semibold flex items-center gap-2 rounded-sm cursor-pointer",
          "bg-white dark:bg-[#0b0d10] h-7 px-2",
          cellBorder,
        ].join(" ")}
      >
        <motion.span
          animate={{ rotate: collapsed ? 0 : 90 }}
          className="text-xs opacity-60"
        >
          ▶
        </motion.span>
        {group.group}
      </motion.button>

      {/* Score */}
      {group.score.map((value, i) => (
        <div
          key={i}
          className={[baseCell, cellBorder, "bg-[rgb(194,255,194)]", "text-[12px]"].join(" ")}
        >
          {value}
        </div>
      ))}

      {/* Habits */}
      <AnimatePresence>
        {!collapsed &&
          group.habits.map((habit, hi) => (
            <HabitRow
              key={`${gi}-${hi}`}
              habit={habit}
              gi={gi}
              hi={hi}
              todayIndex={todayIndex}
              toggleCell={toggleCell}
              gridTemplateColumns={gridTemplateColumns}
            />
          ))}
      </AnimatePresence>
    </div>
  );
};