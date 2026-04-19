import { useState } from "react";
import { motion } from "framer-motion";

import { initialData } from "@/features/habitus/model";
import { todayIndex, gridTemplateColumns, baseCell, cellBorder } from "@/features/habitus/constants";
import { GroupRow } from "@/features/habitus/components/GroupRow";

export const HabitusSection: React.FC = () => {
  const [data, setData] = useState(initialData);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggleCell = (gi: number, hi: number, di: number) => {
    setData((prev) =>
      prev.map((group, gIndex) =>
        gIndex !== gi
          ? group
          : {
              ...group,
              habits: group.habits.map((habit, hIndex) =>
                hIndex !== hi
                  ? habit
                  : {
                      ...habit,
                      data: habit.data.map((val, dIndex) =>
                        dIndex === di ? (val ? 0 : 1) : val
                      ),
                    }
              ),
            }
      )
    );
  };

  const toggleGroup = (gi: number) => {
    setCollapsed((prev) => ({ ...prev, [gi]: !prev[gi] }));
  };

  return (
    <div className="min-h-screen px-4 pt-24 flex justify-center bg-[#f7f9fc] dark:bg-[#0b0d10]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#f7f9fc] dark:bg-[#0b0d10]"
      >
        <div className="grid gap-x-2 gap-y-1" style={{ gridTemplateColumns }}>
          
          {/* Header */}
          <div
            className={[
              cellBorder,
              "flex items-center h-7 px-2 text-lg font-semibold rounded-sm justify-center",
            ].join(" ")}
          >
            Март
          </div>

          {Array.from({ length: 31 }).map((_, i) => (
            <div key={i} className={[baseCell, cellBorder].join(" ")}>
              {i + 1}
            </div>
          ))}

          {data.map((group, gi) => (
            <GroupRow
              key={gi}
              group={group}
              gi={gi}
              collapsed={!!collapsed[gi]}
              toggleGroup={toggleGroup}
              toggleCell={toggleCell}
              todayIndex={todayIndex}
              gridTemplateColumns={gridTemplateColumns}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};