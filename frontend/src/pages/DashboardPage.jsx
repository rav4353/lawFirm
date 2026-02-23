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
} from "lucide-react";

/* ── role config ── */
const roleConfig = {
  paralegal: {
    label: "Paralegal",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    quickActions: [
      { icon: Search, label: "Legal Research", desc: "AI-powered research" },
      { icon: FileText, label: "Draft Documents", desc: "Generate templates", link: "/documents" },
      { icon: Workflow, label: "Workflows", desc: "View compliance flows", link: "/workflows" },
    ],
  },
  associate: {
    label: "Associate",
    icon: Briefcase,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    quickActions: [
      { icon: Workflow, label: "Workflow Builder", desc: "Create compliance flows", link: "/workflows" },
      { icon: FileText, label: "Case Management", desc: "Active filings", link: "/documents" },
      { icon: BarChart3, label: "Analytics", desc: "Case performance" },
    ],
  },
  partner: {
    label: "Partner",
    icon: Crown,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    quickActions: [
      { icon: BarChart3, label: "Firm Analytics", desc: "Revenue & KPIs" },
      { icon: Workflow, label: "All Workflows", desc: "Review compliance flows", link: "/workflows" },
      { icon: Users, label: "Team Overview", desc: "Manage associates" },
    ],
  },
  it_admin: {
    label: "IT Admin",
    icon: Settings,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    quickActions: [
      { icon: Settings, label: "System Config", desc: "Manage settings" },
      { icon: Workflow, label: "All Workflows", desc: "View all compliance flows", link: "/workflows" },
      { icon: BarChart3, label: "Audit Logs", desc: "System activity" },
    ],
  },
};

const statCards = [
  { label: "Active Cases", value: "24", icon: FolderOpen, trend: "+3 this week" },
  { label: "Pending Reviews", value: "7", icon: Clock, trend: "2 urgent" },
  { label: "Documents", value: "142", icon: FileText, trend: "+12 today" },
  { label: "Efficiency", value: "94%", icon: TrendingUp, trend: "+2.1%" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">
              Veritas AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${cfg.bg} ${cfg.color} text-xs font-bold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline-block">
                  {user?.email}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {cfg.label}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
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
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Greeting */}
        <motion.div
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Here&apos;s an overview of your workspace
              </p>
            </div>
            <Badge
              variant="secondary"
              className={`flex w-fit items-center gap-1.5 px-3 py-1 ${cfg.color}`}
            >
              <RoleIcon className="h-3.5 w-3.5" />
              {cfg.label}
            </Badge>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i + 1}
            >
              <Card className="border-border/50 bg-card/60">
                <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {s.trend}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Separator className="mb-8" />

        {/* Quick actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
        >
          <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cfg.quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i + 6}
              >
                <Card
                  className="group cursor-pointer border-border/50 bg-card/60 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                  onClick={() => action.link && navigate(action.link)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.bg}`}>
                        <action.icon className={`h-4.5 w-4.5 ${cfg.color}`} />
                      </div>
                      <CardTitle className="text-base">{action.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{action.desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
