import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Users, Briefcase, Clock, CheckCircle2, 
  TrendingUp, BarChart3, PieChart as PieChartIcon, 
  Award, AlertCircle, Search as SearchIcon
} from "lucide-react";
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function TeamOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTeamOverview();
  }, []);

  const fetchTeamOverview = async () => {
    try {
      const response = await api.get("/analytics/team-overview");
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch team overview", err);
      if (err.response?.status === 403) {
        setError("Access Denied: Partner or Admin permissions required.");
      } else {
        setError("Failed to load team data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = data?.members?.filter(m => {
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) || 
      m.role.toLowerCase().includes(query) ||
      m.status.toLowerCase().includes(query)
    );
  }) || [];

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fdfbf9] dark:bg-background justify-center items-center">
        <div className="text-center space-y-4 max-w-md p-6 bg-white dark:bg-card border border-red-100 dark:border-red-900/50 rounded-2xl shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Access Restricted</h2>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <Link to="/dashboard" className="text-orange-500 font-medium hover:underline inline-block mt-4">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfbf9] dark:bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/dashboard'}
              className="gap-2 text-muted-foreground hover:text-foreground h-9 px-3"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
            </Button>
            
            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                 <Users className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <span className="text-lg font-bold tracking-tight">Team Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Performance & Workload</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor individual contributions and team distribution.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search member by name or role..." 
                className="pl-9 rounded-xl h-10 w-72 border-gray-200 dark:border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 1. Team Summary Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-5">
          <StatCard 
            label="Total Members" 
            value={data?.total_members} 
            loading={loading} 
            icon={Users} 
            color="blue"
          />
          <StatCard 
            label="Active Cases" 
            value={data?.active_cases} 
            loading={loading} 
            icon={Briefcase} 
            color="emerald"
          />
          <StatCard 
            label="Avg Case Load" 
            value={data?.avg_case_load} 
            loading={loading} 
            icon={TrendingUp} 
            color="amber"
          />
          <StatCard 
            label="Avg Billable Hours" 
            value={data?.avg_billable_hours} 
            loading={loading} 
            icon={Clock} 
            color="purple"
          />
          <StatCard 
            label="Completion Rate" 
            value={data?.completion_rate && `${data.completion_rate}%`} 
            loading={loading} 
            icon={CheckCircle2} 
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 2. Team Performance Chart */}
          <Card className="lg:col-span-2 rounded-2xl border-gray-100 dark:border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Team Productivity Mode</CardTitle>
                <CardDescription>Billable hours vs Tasks completed per month</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-blue-500 opacity-50" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.performance_chart || []} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-5} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={5} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="hours" 
                        name="Billable Hours"
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="tasks" 
                        name="Tasks Completed"
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. Workload Distribution */}
          <Card className="rounded-2xl border-gray-100 dark:border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Workload Distribution</CardTitle>
                <CardDescription>Cases per team member</CardDescription>
              </div>
              <PieChartIcon className="h-5 w-5 text-emerald-500 opacity-50" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full rounded-full" />
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.workload_distribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="cases"
                      >
                        {(data?.workload_distribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 5. Top Performers */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold">Top High Performers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PerformerCard 
              title="Highest Revenue" 
              member={data?.top_performers?.highest_revenue} 
              metricLabel="Revenue" 
              metricValue={data?.top_performers?.highest_revenue ? formatCurrency(data.top_performers.highest_revenue.revenue_generated) : "-"}
              loading={loading}
              icon={DollarSignIcon}
            />
            <PerformerCard 
              title="Most Cases Closed" 
              member={data?.top_performers?.most_cases_closed} 
              metricLabel="Active Cases" 
              metricValue={data?.top_performers?.most_cases_closed?.active_cases}
              loading={loading}
              icon={Briefcase}
            />
            <PerformerCard 
              title="Best Utilization" 
              member={data?.top_performers?.best_utilization} 
              metricLabel="Utilization" 
              metricValue={data?.top_performers?.best_utilization ? `${data.top_performers.best_utilization.utilization_rate}%` : "-"}
              loading={loading}
              icon={TrendingUp}
            />
          </div>
        </section>

        {/* 3. Team Member Table */}
        <Card className="rounded-2xl border-gray-100 dark:border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Team Members</CardTitle>
            <CardDescription>Individual performance metrics for the current period</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-muted/30 border-y border-gray-100 dark:border-border/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Member Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Cases</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Hours</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Revenue</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Utilization</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-border/50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    </tr>
                  ))
                ) : filteredMembers.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50/30 dark:hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{m.name}</div>
                    </td>
                    <td className="px-6 py-4 lowercase first-letter:uppercase text-gray-500">{m.role}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{m.active_cases}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{m.billable_hours}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{formatCurrency(m.revenue_generated)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-16 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${m.utilization_rate > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(m.utilization_rate, 100)}%` }} 
                          />
                        </div>
                        <span className="text-xs font-bold">{m.utilization_rate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition-all duration-300 ${
                        m.status === 'Overloaded' 
                          ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/10'
                      }`}>
                        {m.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}

function StatCard({ label, value, loading, icon: Icon, color }) {
  const colorMap = {
    blue: "bg-blue-50 ring-blue-100 text-blue-600 dark:bg-blue-500/10 dark:ring-blue-500/20 dark:text-blue-500",
    emerald: "bg-emerald-50 ring-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:ring-emerald-500/20 dark:text-emerald-500",
    amber: "bg-amber-50 ring-amber-100 text-amber-600 dark:bg-amber-500/10 dark:ring-amber-500/20 dark:text-amber-500",
    purple: "bg-purple-50 ring-purple-100 text-purple-600 dark:bg-purple-500/10 dark:ring-purple-500/20 dark:text-purple-500",
    indigo: "bg-indigo-50 ring-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:ring-indigo-500/20 dark:text-indigo-500",
  };

  return (
    <Card className="rounded-2xl border-gray-100 dark:border-border/50 shadow-sm overflow-hidden group">
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          {Icon && (
            <div className={`w-fit rounded-xl p-2.5 ring-1 ${colorMap[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {loading ? <Skeleton className="h-8 w-16" /> : value ?? 0}
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PerformerCard({ title, member, metricLabel, metricValue, loading, icon: Icon }) {
  if (loading) return <Skeleton className="h-32 w-full rounded-2xl" />;
  if (!member) return null;

  return (
    <Card className="rounded-2xl border-gray-100 dark:border-border/50 shadow-sm overflow-hidden bg-white/50 dark:bg-card/50 backdrop-blur-sm group hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-linear-to-tr from-orange-400 to-amber-300 flex items-center justify-center text-white font-black shadow-lg">
              {member.name.substring(0, 1).toUpperCase()}
            </div>
            {Icon && (
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm border border-gray-100 dark:border-gray-800">
                <Icon className="h-3 w-3 text-orange-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{title}</p>
            <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{member.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500 font-medium">{metricLabel}:</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-200">{metricValue}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DollarSignIcon(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
