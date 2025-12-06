import { motion } from "framer-motion";
import { IconCloud } from "@/components/ui/interactive-icon-cloud";

const slugs = [
  "python",
  "javascript",
  "typescript",
  "react",
  "nextdotjs",
  "nodedotjs",
  "django",
  "flask",
  "tensorflow",
  "scikitlearn",
  "pandas",
  "opencv",
  "mysql",
  "postgresql",
  "mongodb",
  "html5",
  "css3",
  "tailwindcss",
  "bootstrap",
  "dotnet",
  "csharp",
  "java",
  "microsoftazure",
  "git",
  "github",
  "docker",
  "figma",
];

export function SkillsSection() {
  return (
    <section id="skills" className="w-full max-w-6xl py-20 px-4 sm:px-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Skills & Technologies
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Full-stack development meets data science - versatile toolkit for
            modern solutions
          </p>
        </div>

        {/* Icon Cloud */}
        <div className="relative flex w-full items-center justify-center overflow-hidden rounded-lg px-4 sm:px-12 md:px-20 pb-12 sm:pb-16 md:pb-20 pt-4 sm:pt-6 md:pt-8">
          <IconCloud iconSlugs={slugs} />
        </div>
      </motion.div>
    </section>
  );
}

