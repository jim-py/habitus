import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  desc: string;
  locked?: boolean;
  onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  desc,
  locked,
  onClick,
}) => {
  return (
    <motion.div
      onClick={!locked ? onClick : undefined}
      className={[
        "rounded-2xl border p-4 text-left shadow-sm transition-transform duration-300",
        "border-slate-200 bg-white dark:border-white/10 dark:bg-[#11151c]",
        !locked && "cursor-pointer hover:scale-[1.02]",
        locked && "opacity-60 cursor-not-allowed",
      ].join(" ")}
      whileHover={!locked ? { scale: 1.03 } : undefined}
    >
      <h2 className="mb-2 text-xl font-bold text-[#5f99e8]">{title}</h2>
      <div className="whitespace-pre-line text-slate-600 dark:text-slate-300">
        {desc}
      </div>
      {locked && (
        <div className="mt-3 text-xs text-slate-400">Скоро доступно</div>
      )}
    </motion.div>
  );
};