import { AwardCard } from "@/components/ui/achievement-cards";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const certificationsData = [
  {
    icon: (
      <img
        src="https://cdn.simpleicons.org/google"
        alt="Google logo"
        className="h-8 w-8 object-contain"
      />
    ),
    title: "Certification",
    description: "Google Data Analytics",
  },
  {
    icon: (
      <img
        src="https://cdn.simpleicons.org/wipro"
        alt="Wipro logo"
        className="h-8 w-8 object-contain dark:invert"
      />
    ),
    title: "Certification",
    description: "Wipro TalentNext DotNet",
  },
  {
    icon: (
      <img
        src="https://cdn.simpleicons.org/hackerrank"
        alt="HackerRank logo"
        className="h-8 w-8 object-contain"
      />
    ),
    title: "Certification",
    description: "HackerRank Python",
  },
  {
    icon: (
      <img
        src="https://svgl.app/library/microsoft.svg"
        alt="Microsoft logo"
        className="h-8 w-8 object-contain"
      />
    ),
    title: "Certification",
    description: "Microsoft Cloud Fundamentals",
  },

  {
    icon: (
      <img
        src="https://cdn.simpleicons.org/kaggle"
        alt="Kaggle logo"
        className="h-8 w-8 object-contain"
      />
    ),
    title: "Certification",
    description: "Kaggle Python",
  },
];

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {},
  },
};

export default function Certifications() {
  return (
    <div className="w-full py-10" aria-label="Certifications">
      <div className="flex items-center gap-3 justify-center mb-8">
        <Trophy className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">
          Certifications
        </h3>
      </div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
        role="list"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {certificationsData.map((cert, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            role="listitem"
            className="h-full"
          >
            <AwardCard
              icon={cert.icon}
              title={cert.title}
              description={cert.description}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
