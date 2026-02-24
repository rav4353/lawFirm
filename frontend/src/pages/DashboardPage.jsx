import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Scale,
  LogOut,
  FileText,
  Search,
  BarChart3,
  ShieldCheck,
  Users,
  Settings,
  Briefcase,
  Crown,
  ChevronDown,
  Clock,
  TrendingUp,
  FolderOpen,
  Workflow,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileWarning,
} from "lucide-react";

/* ── role config ── */
const roleConfig = {
  paralegal: {
    label: "Paralegal",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    quickActions: [
      { icon: Search, label: "Legal Research", desc: "AI-powered case law search" },
      { icon: FileText, label: "Draft Documents", desc: "Generate templates via AI", link: "/documents" },
      { icon: Workflow, label: "Workflows", desc: "View compliance execution", link: "/workflows" },
    ],
  },
  associate: {
    label: "Associate",
    icon: Briefcase,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    quickActions: [
      { icon: Workflow, label: "Workflow Builder", desc: "Design compliance logic", link: "/workflows" },
      { icon: FileText, label: "Case Management", desc: "Review active filings", link: "/documents" },
      { icon: BarChart3, label: "Analytics", desc: "Monitor case performance" },
    ],
  },
  partner: {
    label: "Partner",
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    quickActions: [
      { icon: BarChart3, label: "Firm Analytics", desc: "Revenue & KPI review" },
      { icon: Workflow, label: "All Workflows", desc: "Audit active workflows", link: "/workflows" },
      { icon: Users, label: "Team Overview", desc: "Manage associate loads" },
      { icon: ShieldCheck, label: "Audit Logs", desc: "Review user actions", link: "/audit-logs" },
    ],
  },
  it_admin: {
    label: "IT Admin",
    icon: Settings,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    quickActions: [
      { icon: Settings, label: "System Config", desc: "Manage platform settings" },
      { icon: ShieldCheck, label: "RBAC Policies", desc: "Manage OPA rules" },
      { icon: BarChart3, label: "Audit Logs", desc: "Review system activity", link: "/audit-logs" },
    ],
  },
};

const statCards = [
  { label: "Active Compliance Cases", value: "24", icon: FolderOpen, trend: "Up 3 from last week", status: "good", color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Pending Reviews", value: "7", icon: Clock, trend: "Requires attention", status: "warning", color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Documents Analyzed", value: "1,242", icon: FileText, trend: "142 scanned today", status: "neutral", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { label: "AI Accuracy Score", value: "98.4%", icon: TrendingUp, trend: "Consistent performance", status: "good", color: "text-emerald-500", bg: "bg-emerald-500/10" },
];

const recentActivity = [
  { 
    id: 1, 
    type: "Document Review", 
    title: "Project Titan - NDA Analysis", 
    status: "Completed", 
    time: "10 mins ago",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  { 
    id: 2, 
    type: "Workflow Execution", 
    title: "GDPR Clause Verification (#4421)", 
    status: "Flagged", 
    time: "1 hour ago",
    icon: AlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  { 
    id: 3, 
    type: "System Update", 
    title: "Mistral 7B Model Weights Refreshed", 
    status: "Completed", 
    time: "3 hours ago",
    icon: Settings,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  { 
    id: 4, 
    type: "Risk Alert", 
    title: "CCPA Non-Compliance Detected in Acme Corp MSA", 
    status: "High Priority", 
    time: "Yesterday",
    icon: FileWarning,
    color: "text-red-500",
    bg: "bg-red-500/10"
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cfg = roleConfig[user?.role] || roleConfig.paralegal;
  const RoleIcon = cfg.icon;

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background overflow-hidden">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Veritas AI
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <div className="hidden h-5 w-px bg-border sm:block" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-9 items-center gap-2 px-2 hover:bg-muted/50">
                  <Avatar className="h-7 w-7 border border-border/50">
                    <AvatarFallback className={`${cfg.bg} ${cfg.color} text-[10px] font-bold`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate text-sm font-medium sm:inline-block">
                    {user?.email}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 backdrop-blur-xl bg-background/95">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1.5">
                    <p className="truncate text-sm font-medium" title={user?.email}>
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <RoleIcon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      <p className="text-xs text-muted-foreground capitalize">
                        {cfg.label} Workspace
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer p-3"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Greeting Section */}
        <motion.div
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/40 bg-card/20 p-5 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-foreground">
              Welcome back, {user?.email ? <span className="text-primary">{user.email.split("@")[0]}</span> : "User"}
            </h1>
            <p className="text-sm text-muted-foreground">
              You have <span className="font-medium text-foreground">7 pending reviews</span> today.
            </p>
          </div>
          <div className="flex items-center self-start sm:self-auto">
             <Badge variant="secondary" className={`flex w-fit items-center gap-1.5 px-3 py-1 ${cfg.color} ${cfg.bg}`}>
                <RoleIcon className="h-3.5 w-3.5" />
                {cfg.label}
              </Badge>
          </div>
        </motion.div>

        {/* Stat cards row */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i + 1}
            >
              <Card className="h-full border-border/40 bg-card/30 backdrop-blur-sm transition-all hover:bg-card/50 hover:border-border/60">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${s.bg}`}>
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    {/* Status indicator pill */}
                    {s.status === 'warning' && (
                        <div className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-2xl font-semibold tracking-tight text-foreground">{s.value}</p>
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  </div>
                  <div className="mt-1 pt-2 border-t border-border/30">
                     <p className={`text-[10px] font-semibold uppercase tracking-wide ${s.status === 'warning' ? 'text-amber-500/90' : 'text-muted-foreground/70'}`}>
                        {s.trend}
                     </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Two Column Layout for Details ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
           
           {/* Left Column: Recent Activity (Takes up 2/3) */}
           <motion.div
              className="lg:col-span-2 space-y-6"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={5}
           >
              <div className="flex items-center justify-between">
                 <h2 className="text-xl font-bold tracking-tight">Recent Intelligence Activity</h2>
              </div>
              
              <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                 <div className="divide-y divide-border/30">
                    {recentActivity.map((activity) => (
                       <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors gap-4">
                          <div className="flex items-center gap-4">
                             <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.bg}`}>
                                <activity.icon className={`h-5 w-5 ${activity.color}`} />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-foreground">{activity.title}</p>
                                <p className="text-[13px] text-muted-foreground mt-0.5">{activity.type}</p>
                             </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0 pt-1 sm:pt-0 border-t border-border/20 sm:border-t-0 ml-14 sm:ml-0">
                             <Badge variant="secondary" className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-muted text-foreground/80 border-transparent hover:bg-muted">
                                {activity.status}
                             </Badge>
                             <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 pt-1">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground/60" /> {activity.time}
                             </p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </motion.div>

           {/* Right Column: Quick Actions & Health */}
           <motion.div
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={6}
           >
              <h2 className="text-xl font-bold tracking-tight">System Menu</h2>
              <div className="grid gap-3">
                {cfg.quickActions.map((action, i) => (
                  <motion.div
                    key={action.label}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={i + 7}
                  >
                    <div
                      className="group flex cursor-pointer items-center gap-4 rounded-xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:border-border/80 hover:shadow-md"
                      onClick={() => action.link && navigate(action.link)}
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/30 ${cfg.bg} transition-transform duration-300 group-hover:scale-105`}>
                        <action.icon className={`h-5 w-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* System Health Card */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={8}
                className="mt-6 rounded-xl border border-border/40 bg-card p-5 shadow-sm"
              >
                 <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-bold text-foreground">System Health</p>
                    <div className="flex items-center gap-1.5">
                       <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                       <span className="text-[11px] uppercase font-bold tracking-wide text-emerald-500">All Systems Operational</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <div className="flex justify-between items-end mb-1.5">
                          <span className="text-[13px] text-muted-foreground font-medium">Local Cluster Status</span>
                          <span className="text-[13px] font-bold text-foreground">Healthy (k3s)</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-full" />
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between items-end mb-1.5">
                          <span className="text-[13px] text-muted-foreground font-medium">Model Server Load</span>
                          <span className="text-[13px] font-bold text-foreground">42%</span>
                       </div>
                       <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[42%]" />
                       </div>
                    </div>
                 </div>
              </motion.div>
           </motion.div>

        </div>
      </main>
    </div>
  );
}
