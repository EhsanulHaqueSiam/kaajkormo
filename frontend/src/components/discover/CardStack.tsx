import { AnimatePresence, motion } from "framer-motion";
import type { Job } from "../../types";
import { SwipeCard } from "./SwipeCard";

interface CardStackProps {
  jobs: Job[];
  onSwipe: (job: Job, direction: "left" | "right" | "up") => void;
}

export function CardStack({ jobs, onSwipe }: CardStackProps) {
  const visible = jobs.slice(0, 3);

  return (
    <div className="relative mx-auto h-[520px] w-full max-w-md">
      <AnimatePresence>
        {visible.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: 1 - i * 0.04,
              y: i * 8,
              opacity: 1 - i * 0.15,
              zIndex: visible.length - i,
            }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <SwipeCard job={job} isTop={i === 0} onSwipe={(dir) => onSwipe(job, dir)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
