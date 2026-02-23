import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Scale,
  ShieldCheck,
  BrainCircuit,
  FileSearch,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Research",
    desc: "Automate legal research with LLM agents trained on millions of case documents.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Security",
    desc: "Enterprise-grade RBAC ensures every user sees only what they're authorized to.",
  },
  {
    icon: FileSearch,
    title: "Document Intelligence",
    desc: "Extract clauses, risks, and insights from contracts in seconds, not hours.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Veritas AI</span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-1 items-center justify-center px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs uppercase tracking-widest">
              <Sparkles className="mr-1.5 h-3 w-3" /> Next-Gen Legal AI
            </Badge>
          </Motion.div>

          <Motion.h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Legal Intelligence,{" "}
            <span className="text-primary">Reinvented</span>
          </Motion.h1>

          <Motion.p
            className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Veritas AI supercharges your firm with AI-driven research,
            automated document review, and enterprise-grade security — so you
            can focus on what matters most: your clients.
          </Motion.p>

          <Motion.div
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Button size="lg" asChild>
              <Link to="/register">
                Start Free Trial <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </Motion.div>
        </div>
      </section>

      <Separator />

      {/* ── Features ── */}
      <section className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-2xl font-bold sm:text-3xl">
            Everything Your Firm Needs
          </h2>
          <p className="mx-auto mb-14 max-w-lg text-center text-muted-foreground">
            A unified platform that keeps your workflow secure, intelligent, and fast.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full border-border/50 bg-card/60 backdrop-blur transition-colors hover:border-primary/40">
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Scale className="h-4 w-4" /> Veritas AI &copy;{" "}
            {new Date().getFullYear()}
          </div>
          <p className="text-xs text-muted-foreground">
            Built for modern law firms.
          </p>
        </div>
      </footer>
    </div>
  );
}
