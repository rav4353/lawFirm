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
  Server,
  Workflow,
  Network,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Activity,
  FileText,
  Lock,
  Star
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
    icon: Workflow,
    title: "Visual Workflow Builder",
    desc: "Design complex compliance logic with a seamless drag-and-drop interface powered by React Flow.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Network,
    title: "AI Reasoning Path",
    desc: "Every AI decision is fully traceable. Click any rule to see the specific text analyzed and confidence score.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: ShieldCheck,
    title: "OPA-Powered RBAC",
    desc: "Fine-grained, policy-as-code access control using Open Policy Agent. Ensure absolute data privacy.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Server,
    title: "100% Local & Open Source",
    desc: "Zero reliance on external cloud APIs. Veritas AI runs entirely offline on a local k3s cluster for absolute security.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Activity,
    title: "Full Observability",
    desc: "Built-in Prometheus & Grafana dashboards for monitoring system health, AI latency, and business metrics.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* ── Background Effects ── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-start overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse duration-8000" />
         <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen opacity-50 duration-10000" />
      </div>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/60 transition-all duration-300">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20 shadow-inner">
               <Scale className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">Veritas AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" className="hidden sm:flex text-sm font-medium hover:text-primary transition-colors" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="rounded-full shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 text-sm font-medium px-6" asChild>
              <Link to="/register">
                Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="mx-auto w-full max-w-7xl grid gap-16 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left Column: Text Content */}
          <div className="text-center lg:text-left">
            <Motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest bg-primary/5 border-primary/20 text-primary backdrop-blur-md rounded-full shadow-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5 fill-primary/20" /> Next-Gen Legal Compliance
              </Badge>
            </Motion.div>

            <Motion.h1
              className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-[4.5rem] lg:leading-[1.1] text-foreground"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              Legal Intelligence,{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-br from-primary via-purple-500 to-blue-500">
                Visualized.
              </span>
            </Motion.h1>

            <Motion.p
              className="mx-auto lg:mx-0 mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              Design compliance logic visually. Process documents locally. Trust every decision with fully auditable AI reasoning paths. Built for the modern, security-conscious law firm.
            </Motion.p>

            <Motion.div
              className="mt-10 flex flex-col items-center lg:items-start justify-center lg:justify-start gap-4 sm:flex-row"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              <Button size="lg" className="w-full sm:w-auto rounded-full h-12 px-8 text-base shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/30 active:translate-y-0" asChild>
                <Link to="/register">
                  Deploy Locally <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-12 px-8 text-base backdrop-blur-md bg-background/50 border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all" asChild>
                <a href="#features">Explore Platform</a>
              </Button>
            </Motion.div>
          </div>

          {/* Right Column: Dynamic Abstract Workflow Graphic */}
          <Motion.div 
            className="relative hidden lg:flex items-center justify-center w-full h-[500px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
             <div className="relative w-full h-full text-sm font-medium">
                
                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-xl" strokeDasharray="5,5">
                   {/* Line 1 -> 2 */}
                   <path d="M 120 220 C 200 220, 220 250, 280 250" fill="none" className="stroke-primary/40 stroke-2 animate-[dash_20s_linear_infinite]" />
                   <circle cx="120" cy="220" r="4" className="fill-primary" />
                   
                   {/* Line 2 -> 3 */}
                   <path d="M 400 230 C 470 230, 480 140, 520 140" fill="none" className="stroke-emerald-500/50 stroke-2 animate-[dash_20s_linear_infinite]" />
                   <circle cx="520" cy="140" r="4" className="fill-emerald-500" />
                   
                   {/* Line 2 -> 4 */}
                   <path d="M 390 280 C 460 280, 480 360, 520 360" fill="none" className="stroke-destructive/50 stroke-2 animate-[dash_20s_linear_infinite]" />
                   <circle cx="520" cy="360" r="4" className="fill-destructive" />
                </svg>

                {/* Node 1: Input Document */}
                <Motion.div 
                   className="absolute top-[35%] left-[2%] z-20 flex flex-col items-center gap-2 bg-card/80 backdrop-blur-xl border border-border/50 p-4 rounded-2xl shadow-2xl"
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-500 shadow-inner">
                      <FileText className="h-6 w-6" />
                   </div>
                   <span className="font-semibold">Ingest Contract</span>
                </Motion.div>

                {/* Node 2: AI Reasoning (Mistral 7B) */}
                <Motion.div 
                   className="absolute top-[50%] left-[50%] z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 bg-card/90 backdrop-blur-2xl border border-primary/40 shadow-[0_0_40px_-10px_var(--primary)] p-6 rounded-3xl"
                   animate={{ scale: [1, 1.05, 1] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                   <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-purple-600 text-primary-foreground shadow-lg">
                      <Network className="h-8 w-8" />
                   </div>
                   <div className="flex flex-col items-center">
                       <span className="font-bold text-foreground text-base">Mistral 7B Analysis</span>
                       <Badge variant="secondary" className="mt-1 text-[10px] bg-primary/10 text-primary uppercase font-bold tracking-wider">Local inference</Badge>
                   </div>
                </Motion.div>

                {/* Node 3: GDPR Compliance Check */}
                <Motion.div 
                   className="absolute top-[18%] right-[8%] z-20 flex flex-col items-center gap-2 bg-card/80 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl shadow-xl hover:border-emerald-500 transition-colors cursor-pointer"
                   animate={{ y: [0, 8, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500 shadow-inner">
                      <ShieldCheck className="h-5 w-5" />
                   </div>
                   <div className="flex flex-col items-center gap-0.5">
                       <span className="font-semibold text-foreground">GDPR Rule</span>
                       <Badge className="bg-emerald-500 text-white hover:bg-emerald-600/90 text-[10px] px-2 shadow-sm">PASS</Badge>
                   </div>
                </Motion.div>

                {/* Node 4: CCPA Compliance Check */}
                <Motion.div 
                   className="absolute bottom-[23%] right-[8%] z-20 flex flex-col items-center gap-2 bg-card/80 backdrop-blur-xl border border-destructive/30 p-4 rounded-2xl shadow-xl hover:border-destructive transition-colors cursor-pointer"
                   animate={{ y: [0, -8, 0] }}
                   transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20 text-destructive shadow-inner">
                      <Lock className="h-5 w-5" />
                   </div>
                   <div className="flex flex-col items-center gap-0.5">
                       <span className="font-semibold text-foreground">CCPA Rule</span>
                       <Badge variant="destructive" className="text-[10px] px-2 shadow-sm font-medium">FAIL</Badge>
                   </div>
                </Motion.div>

             </div>
          </Motion.div>

        </div>
      </section>

      {/* ── Key Differentiators ── */}
      <section id="features" className="relative z-10 px-4 py-24 bg-linear-to-b from-transparent to-muted/20 border-y border-border/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
               Built for uncompromising legal teams.
             </h2>
             <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
               We completely re-engineered document review by combining node-based logic pathways, transparent AI trails, and on-premise security.
             </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="group h-full overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)] hover:bg-card/60">
                  <CardContent className="flex flex-col gap-6 p-8">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${f.bg} ${f.color} transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-sm`}>
                      <f.icon className="h-7 w-7 stroke-[1.5]" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">{f.title}</h3>
                        <p className="text-[15px] leading-relaxed text-muted-foreground">
                          {f.desc}
                        </p>
                    </div>
                  </CardContent>
                </Card>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials / Social Proof ── */}
      <section className="relative z-10 px-4 pt-12 pb-16 sm:pt-16 sm:pb-24 bg-muted/20 border-t border-border/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
             <h2 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">Trusted by Top Legal Professionals</h2>
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
                <Card className="h-full border-border/40 bg-card/60 backdrop-blur-xl transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
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
                        className="h-10 w-10 rounded-full object-cover border border-primary/20 shadow-sm"
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
      <footer className="relative z-10 border-t border-border/40 bg-background/80 backdrop-blur-lg px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4 lg:gap-12 pl-2">
            
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl text-foreground">
                <Scale className="h-6 w-6 text-primary" />
                <span>Veritas AI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                The unified, secure, and intelligent platform built exclusively for modern law firms. Open source, powered by Mistral 7B and k3s.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground tracking-wide uppercase">Architecture</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><span className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"><Server className="w-3.5 h-3.5"/> Local Kubernetes (k3s)</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"><Network className="w-3.5 h-3.5"/> Mistral 7B Reasoning</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> OPA Security Policies</span></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground tracking-wide uppercase">Legal & Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><span className="hover:text-primary transition-colors cursor-pointer">Documentation</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>
            
          </div>

          <Separator className="my-10 opacity-50" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground pl-2 pb-4">
            <div className="font-medium">
              &copy; {new Date().getFullYear()} LexFlow AI Inc. / Open Source.
            </div>
            <div className="flex items-center gap-8 font-medium">
              <span className="hover:text-primary transition-colors cursor-pointer">Twitter</span>
              <span className="hover:text-primary transition-colors cursor-pointer">LinkedIn</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Contact Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
