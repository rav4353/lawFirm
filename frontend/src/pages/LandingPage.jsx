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
  UploadCloud,
  FileText,
  Brain,
  CheckCircle2,
  Star,
} from "lucide-react";

const testimonials = [
  {
    quote: "Veritas AI cut our document review time in half. The actionable insights are incredibly accurate and save us countless hours.",
    author: "Sarah Jenkins",
    role: "Managing Partner, Jenkins & Co.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    quote: "Enterprise-grade security combined with cutting-edge AI. This is exactly what modern law firms need to stay competitive.",
    author: "David Chen",
    role: "Senior Associate, Global Law",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    quote: "The automated research has transformed how we prepare for cases. Our associates can focus on strategy instead of manual review.",
    author: "Emily Rodriguez",
    role: "Chief Technology Officer, LegalTech Solutions",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
  }
];

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
      <section className="flex flex-col items-center justify-center px-4 py-12 sm:py-16 border-b border-border/40">
        <div className="mx-auto w-full max-w-6xl grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left Column: Text Content */}
          <div className="text-center lg:text-left">
            <Motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs uppercase tracking-widest">
                <Sparkles className="mr-1.5 h-3 w-3" /> Next-Gen Legal AI
              </Badge>
            </Motion.div>

            <Motion.h1
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              Legal Intelligence,{" "}
              <span className="text-primary">Reinvented</span>
            </Motion.h1>

            <Motion.p
              className="mx-auto lg:mx-0 mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
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
              className="mt-8 flex flex-col items-center lg:items-start justify-center lg:justify-start gap-3 sm:flex-row"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/register">
                  Start Free Trial <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </Motion.div>
          </div>

          {/* Right Column: Flow Diagram */}
          <Motion.div 
            className="relative hidden lg:flex items-center justify-center w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative w-full max-w-md aspect-square rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-xl flex flex-col items-center justify-center p-8 overflow-hidden">
               {/* Background Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[14px_24px] pointer-events-none"></div>

               {/* Top: Upload Document */}
               <Motion.div 
                 className="relative z-10 flex flex-col items-center gap-2 mb-8"
                 animate={{ y: [0, -5, 0] }}
                 transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
               >
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-sm shadow-orange-500/5">
                   <UploadCloud className="h-8 w-8 text-orange-500" />
                 </div>
                 <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">1. Secure Upload</span>
               </Motion.div>

               {/* Connecting Line 1 */}
               <div className="absolute top-[32%] left-[50%] h-12 border-l-2 border-dashed border-primary/30 z-0"></div>

               {/* Middle: AI Processing */}
               <Motion.div 
                 className="relative z-10 flex flex-col items-center gap-2 mb-8"
                 animate={{ scale: [1, 1.05, 1] }}
                 transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
               >
                 <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 bg-linear-to-br from-primary to-orange-600 border border-primary/20">
                   <Brain className="h-10 w-10 text-white" />
                 </div>
                 <span className="text-xs font-semibold text-foreground uppercase tracking-wider">2. AI Analysis</span>
                 
                 {/* Floating particles around AI */}
                 <Motion.div 
                    className="absolute -right-4 top-0 h-2 w-2 rounded-full bg-orange-400"
                    animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                 />
                 <Motion.div 
                    className="absolute -left-4 bottom-4 h-2 w-2 rounded-full bg-primary"
                    animate={{ y: [0, -15, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                 />
               </Motion.div>

               {/* Connecting Line 2 */}
               <div className="absolute top-[65%] left-[50%] h-12 border-l-2 border-dashed border-primary/30 z-0"></div>

               {/* Bottom: Insights / Result */}
               <Motion.div 
                 className="relative z-10 flex flex-col items-center gap-2"
                 animate={{ y: [0, 5, 0] }}
                 transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1 }}
               >
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                   <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                 </div>
                 <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">3. Actionable Insights</span>
               </Motion.div>

            </div>
          </Motion.div>

        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16 items-center">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Everything Your Firm Needs
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                A unified platform that keeps your workflow secure, intelligent, and fast. 
                Instead of jumping between disconnected apps, empower your team with a 
                single, AI-driven command center built specifically for modern legal practices.
              </p>
              
              <ul className="mt-8 space-y-4">
                 <li className="flex items-center gap-3 text-foreground font-medium">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                     <CheckCircle2 className="h-4 w-4" />
                   </div>
                   <span>Automated document processing</span>
                 </li>
                 <li className="flex items-center gap-3 text-foreground font-medium">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                     <CheckCircle2 className="h-4 w-4" />
                   </div>
                   <span>Bank-grade security protocols</span>
                 </li>
                 <li className="flex items-center gap-3 text-foreground font-medium">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                     <CheckCircle2 className="h-4 w-4" />
                   </div>
                   <span>Real-time collaborative workspace</span>
                 </li>
              </ul>
            </div>

            {/* Right Column: Cards */}
            <div className="lg:col-span-3 grid gap-6 sm:grid-cols-2">
            {features.map((f, i) => (
              <Motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="group relative h-full overflow-hidden border-border/50 bg-card/60 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardContent className="relative z-10 flex flex-col gap-5 p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF2EA] dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 transition-transform duration-300 group-hover:scale-110 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20">
                      <f.icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold tracking-tight text-foreground">{f.title}</h3>
                        <p className="text-base leading-relaxed text-muted-foreground">
                          {f.desc}
                        </p>
                    </div>
                  </CardContent>
                </Card>
              </Motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials / Social Proof ── */}
      <section className="px-4 pt-12 pb-16 sm:pt-16 sm:pb-24 bg-muted/20 border-t border-border/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Trusted by Top Legal Professionals</h2>
            <p className="mt-2 text-sm text-muted-foreground">See how forward-thinking firms are leveraging Veritas AI.</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Motion.div
                key={t.author}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="h-full border-border/40 bg-card/60 backdrop-blur transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4 text-orange-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                      "{t.quote}"
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <img 
                        src={t.image} 
                        alt={t.author} 
                        className="h-10 w-10 rounded-full object-cover border border-primary/20"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{t.author}</h4>
                        <p className="text-[11px] text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-card/20 px-4 py-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4 lg:gap-12">
            
            {/* Brand */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                <Scale className="h-5 w-5 text-primary" />
                <span>Veritas AI</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                The unified, secure, and intelligent platform built exclusively for modern law firms.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Product</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            
          </div>

          <Separator className="my-6" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
            <div>
              &copy; {new Date().getFullYear()} Veritas AI Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
