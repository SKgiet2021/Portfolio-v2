import { motion } from "framer-motion";
import { Briefcase, Award, Code2, GraduationCap } from "lucide-react";

const stats = [
    {
        label: "Experience",
        value: "2+ yrs",
        icon: Briefcase,
    },
    {
        label: "Projects",
        value: "15+",
        icon: Code2,
    },
    {
        label: "Certifications",
        value: "10+",
        icon: Award,
    },
    {
        label: "CGPA",
        value: "6.98",
        icon: GraduationCap,
    },
];

export function AboutSection() {
    return (
        <section id="about" className="w-full max-w-6xl py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                        About Me
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                        Transforming ideas into scalable solutions
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Profile Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-foreground">
                                Full-Stack Developer & Data Enthusiast 👨‍💻
                            </h3>
                            <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                                <p>
                                    B.Tech CS graduate specializing in Data Science. Experience at <span className="text-primary font-medium">Wipro</span>, <span className="text-primary font-medium">Salesforce</span>, and <span className="text-primary font-medium">Logozon Edutech</span>.
                                </p>
                                <p>
                                    Skilled in <span className="font-medium text-foreground">Python, React, Django, .NET, ML</span>. Building innovative solutions bridging development and data science.
                                </p>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap gap-2">
                            <a href="https://github.com/swadhinkumar2004" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-border bg-background/50 hover:border-primary/50 transition-colors text-xs font-medium">GitHub</a>
                            <a href="https://linkedin.com/in/swadhin-kumar-400aa71a0" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-border bg-background/50 hover:border-primary/50 transition-colors text-xs font-medium">LinkedIn</a>
                            <a href="mailto:monarch@ethernetforge.xyz" className="px-3 py-1.5 rounded-lg border border-border bg-background/50 hover:border-primary/50 transition-colors text-xs font-medium">Email</a>
                        </div>
                    </motion.div>

                    {/* Education & Highlights */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        {/* Education */}
                        <div className="p-4 rounded-xl border border-border bg-background/50 backdrop-blur-sm space-y-3">
                            <div className="flex items-start gap-2">
                                <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
                                <div className="space-y-2 flex-1">
                                    <h4 className="text-sm font-semibold text-foreground">Education</h4>
                                    <div className="space-y-2 text-xs text-muted-foreground">
                                        <div>
                                            <p className="font-medium text-foreground">B.Tech CS (Data Science)</p>
                                            <p>GIET University • 2022-2025</p>
                                            <p>CGPA: 6.98/10</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="p-4 rounded-xl border border-border bg-background/50 backdrop-blur-sm space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Award className="w-4 h-4 text-primary" />
                                Highlights
                            </h4>
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                                <li className="flex items-start gap-1.5">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>Best Project winner (2023)</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>Top 5% Kaggle Python</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>Hackathon Finalist (2024)</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>Google Data Analytics Certified</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <div className="p-4 rounded-xl border border-border bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-all text-center space-y-1">
                                    <Icon className="w-6 h-6 mx-auto text-primary" />
                                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </motion.div>
        </section>
    );
}
