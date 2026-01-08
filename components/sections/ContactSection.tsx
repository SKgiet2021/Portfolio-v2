import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Phone, Send, MapPin } from "lucide-react";
import { useState } from "react";
import {
  PopoverForm,
  PopoverFormButton,
  PopoverFormCutOutLeftIcon,
  PopoverFormCutOutRightIcon,
  PopoverFormSeparator,
  PopoverFormSuccess,
} from "@/components/ui/popover-form";

const socialLinks = [
  {
    name: "Email",
    icon: Mail,
    href: "mailto:monarch@ethernetforge.xyz",
    label: "monarch@ethernetforge.xyz",
  },
  {
    name: "GitHub",
    icon: Github,
    href: "https://github.com/SKgiet2021",
    label: "@SKgiet2021",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com/in/swadhin-kumar-400aa71a0",
    label: "/swadhin-kumar-400aa71a0",
  },
  {
    name: "Phone",
    icon: Phone,
    href: "tel:+919040444559",
    label: "+91 9040444559",
  },
];

type FormState = "idle" | "loading" | "success";

export function ContactSection() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit() {
    setFormState("loading");
    setTimeout(() => {
      setFormState("success");
    }, 1500);

    setTimeout(() => {
      setOpen(false);
      setFormState("idle");
      setName("");
      setEmail("");
      setMessage("");
    }, 3300);
  }

  return (
    <section
      id="contact"
      className="w-full max-w-6xl py-16 pb-24 px-4 sm:px-6 md:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Let's Connect
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Seeking opportunities in software development and data science.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>Puri, Odisha • Remote & Hybrid</span>
          </div>
        </div>

        {/* Contact Form Popover */}
        <div className="flex justify-center">
          <PopoverForm
            title="Send Message"
            open={open}
            setOpen={setOpen}
            width="364px"
            height="372px"
            showCloseButton={formState !== "success"}
            showSuccess={formState === "success"}
            showGlow={formState === "loading"}
            openChild={
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!name || !email || !message) return;
                  submit();
                }}
                className=" space-y-4"
              >
                <div className="px-4 pt-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-muted-foreground mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-black"
                    required
                  />
                </div>
                <div className="px-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-muted-foreground mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border  rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-black"
                    required
                  />
                </div>
                <div className="px-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-muted-foreground mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-black"
                    rows={3}
                    required
                  />
                </div>
                <div className="relative flex h-12 items-center px-[10px]">
                  <PopoverFormSeparator />
                  <div className="absolute left-0 top-0 -translate-x-[1.5px] -translate-y-1/2">
                    <PopoverFormCutOutLeftIcon />
                  </div>
                  <div className="absolute right-0 top-0 translate-x-[1.5px] -translate-y-1/2 rotate-180">
                    <PopoverFormCutOutRightIcon />
                  </div>
                  <PopoverFormButton
                    loading={formState === "loading"}
                    text="Submit"
                  />
                </div>
              </form>
            }
            successChild={
              <PopoverFormSuccess
                title="Message Sent"
                description="Thank you for contacting me. I'll get back to you soon!"
              />
            }
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: index % 2 === 0 ? -15 : 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                viewport={{ once: true }}
                className="group relative block p-4 rounded-xl border border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10 cursor-pointer rounded-xl"
                  aria-label={`Contact via ${link.name}`}
                >
                  <span className="sr-only">
                    {link.name}: {link.label}
                  </span>
                </a>
                <div className="relative flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">
                      {link.name}
                    </div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {link.label}
                    </div>
                  </div>
                  <Send className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center pt-4 space-y-1.5">
          <p className="text-xs text-muted-foreground">
            💼 Currently seeking opportunities • 🎓 B.Tech Graduate 2025
          </p>
        </div>
      </motion.div>
    </section>
  );
}
