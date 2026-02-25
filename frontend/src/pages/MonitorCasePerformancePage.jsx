import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, BarChart3, Activity, Clock, CheckCircle2, 
  TrendingUp, Filter, Download, ChevronRight, Search,
  BrainCircuit, Info, AlertTriangle, BarChart as BarChartIcon,
  AlertCircle
} from "lucide-react";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/services/api";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function MonitorCasePerformancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [caseType, setCaseType] = useState("all");
  const [status, setStatus] = useState("all");
  const [riskLevel, setRiskLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (caseType !== "all") params.case_type = caseType;
        if (status !== "all") params.status = status;
        if (riskLevel !== "all") params.risk_level = riskLevel;

        const response = await api.get("/analytics/case-performance", { params });
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch performance data", err);
        setError("Unable to load performance metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [caseType, status, riskLevel]);

  const handleClearFilters = () => {
    setCaseType("all");
    setStatus("all");
    setRiskLevel("all");
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fdfbf9] dark:bg-background justify-center items-center">
        <div className="text-center space-y-4 max-w-md p-6 bg-white dark:bg-card border border-red-100 dark:border-red-900/50 rounded-2xl shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Analytics Error</h2>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfbf9] dark:bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              asChild
              className="gap-2 text-muted-foreground hover:text-foreground h-9 px-3"
            >
              <Link to="/dashboard">
                <ArrowLeft className="h-4.5 w-4.5" />
                <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
              </Link>
            </Button>
            
            <div className="hidden h-5 w-px bg-border sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                 <BarChart3 className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight">Analytics</span>
            </div>
          </div>


          <div className="flex items-center gap-4">
             <Button variant="outline" size="sm" className="hidden sm:flex gap-2 rounded-xl border-border/60">
                <Download className="h-4 w-4" />
                Export Report
             </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Filters Section */}
        <section className="bg-white/50 dark:bg-card/30 backdrop-blur-md rounded-3xl border border-white/40 dark:border-white/5 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-primary font-bold mr-2">
              <Filter className="h-4.5 w-4.5" />
              <span className="text-sm">Quick Filters</span>
            </div>
            
            <Select value={caseType} onValueChange={setCaseType}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl bg-white dark:bg-card/50">
                <SelectValue placeholder="Case Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Case Types</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
                <SelectItem value="GDPR">GDPR Violations</SelectItem>
                <SelectItem value="Contract">Contract Law</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl bg-white dark:bg-card/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="litigation">In Litigation</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskLevel} onValueChange={setRiskLevel}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl bg-white dark:bg-card/50">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-muted-foreground hover:text-primary transition-colors h-10 px-4"
            >
              Clear All
            </Button>
          </div>
        </section>

        {/* 1. Case Performance Summary (KPIs) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Cases", value: data?.summary?.total_cases, icon: BarChart3, color: "blue" },
            { label: "Active Cases", value: data?.summary?.active_cases, icon: Activity, color: "emerald" },
            { label: "Delayed Cases", value: data?.summary?.delayed_cases, icon: Clock, color: "orange" },
            { label: "Success Rate", value: `${data?.summary?.success_rate_pct?.toFixed(1) || 0}%`, icon: CheckCircle2, color: "indigo" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="rounded-[2rem] border-white/40 dark:border-white/10 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden relative group">
                <div className={`absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 rounded-full bg-${kpi.color}-500/5 blur-2xl group-hover:bg-${kpi.color}-500/10 transition-all duration-500`} />
                <CardContent className="p-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2 tracking-tight">
                        {loading ? <Skeleton className="h-9 w-16" /> : kpi.value}
                      </h3>
                      {!loading && i === 3 && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> +2.4% from last qtr
                        </p>
                      )}
                    </div>
                    <div className={`rounded-2xl bg-${kpi.color}-500/10 p-4 ring-1 ring-${kpi.color}-500/20 shadow-lg shadow-${kpi.color}-500/5`}>
                      <kpi.icon className={`h-6 w-6 text-${kpi.color}-600 dark:text-${kpi.color}-400`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts: Distribution & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* 2. Case Status Distribution */}
          <Card className="lg:col-span-2 rounded-[2.5rem] border-white/60 dark:border-white/10 shadow-2xl shadow-gray-200/30 dark:shadow-none bg-white/70 dark:bg-card/50 backdrop-blur-xl">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-bold">Status Distribution</CardTitle>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <CardDescription>Allocation across legal departments</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              {loading ? (
                <div className="h-[320px] flex items-center justify-center"><Skeleton className="h-full w-full rounded-3xl" /></div>
              ) : (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.status_distribution || []}
                        cx="50%" cy="50%"
                        innerRadius={80} outerRadius={110}
                        paddingAngle={6}
                        dataKey="count"
                        nameKey="status"
                        stroke="none"
                      >
                        {data?.status_distribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.9)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Case Timeline Analysis */}
          <Card className="lg:col-span-3 rounded-[2.5rem] border-white/60 dark:border-white/10 shadow-2xl shadow-gray-200/30 dark:shadow-none bg-white/70 dark:bg-card/50 backdrop-blur-xl">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Case Timeline Analysis
              </CardTitle>
              <CardDescription>Average duration per litigation stage (Days)</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {loading ? (
                <div className="h-[320px] flex items-center justify-center"><Skeleton className="h-full w-full rounded-3xl" /></div>
              ) : (
                <div className="h-[320px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.timeline_analysis || []} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="stage" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fontWeight: 600, fill: '#64748B'}}
                        width={100}
                      />
                      <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} contentStyle={{borderRadius: '12px'}} />
                      <Bar 
                        dataKey="avg_duration_days" 
                        fill="url(#colorBar)" 
                        radius={[0, 10, 10, 0]} 
                        barSize={32}
                      >
                        <defs>
                          <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#60a5fa" />
                          </linearGradient>
                        </defs>
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lawyer Performance & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 4. Lawyer Performance Table */}
          <Card className="lg:col-span-2 rounded-[2.5rem] border-white/60 dark:border-white/10 shadow-xl bg-white/70 dark:bg-card/50 backdrop-blur-xl">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                <span>Lawyer Performance</span>
                <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 text-primary">
                  View Full Team <ChevronRight className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="pb-4 px-4 text-xs font-bold text-muted-foreground uppercase">Lawyer</th>
                      <th className="pb-4 px-4 text-xs font-bold text-muted-foreground uppercase text-center">Active</th>
                      <th className="pb-4 px-4 text-xs font-bold text-muted-foreground uppercase text-center">Closed</th>
                      <th className="pb-4 px-4 text-xs font-bold text-muted-foreground uppercase text-right">Avg Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={4} className="py-4"><Skeleton className="h-6 w-full" /></td></tr>
                      ))
                    ) : (
                      data?.lawyer_performance?.map((l, i) => (
                        <tr key={i} className="group hover:bg-primary/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs tracking-tight">
                                {l.lawyer_name.split(' ').map(n=>n[0]).join('')}
                              </div>
                              <span className="font-bold text-sm">{l.lawyer_name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-none font-bold">{l.active_cases}</Badge>
                          </td>
                          <td className="py-4 px-4 text-center">
                             <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none font-bold">{l.closed_cases}</Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                             <span className="text-sm font-semibold text-muted-foreground">{l.avg_resolution_days.toFixed(1)} days</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights & Risk */}
          <div className="space-y-8">
            {/* 8. AI Insights Section */}
            <Card className="rounded-[2.5rem] border-primary/20 bg-linear-to-br from-primary/5 to-indigo-500/5 shadow-xl dark:shadow-none relative overflow-hidden">
               <div className="absolute top-2 right-2 p-2">
                 <div className="bg-primary/20 rounded-full p-2"><BrainCircuit className="h-5 w-5 text-primary animate-pulse" /></div>
               </div>
               <CardHeader className="pb-4">
                 <CardTitle className="text-lg font-bold">AI Case Insights</CardTitle>
                 <CardDescription>Predictive analysis based on firm data</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {loading ? (
                   <Skeleton className="h-32 w-full rounded-2xl" />
                 ) : (
                   data?.ai_insights?.map((insight, i) => (
                     <div key={i} className="p-4 rounded-2xl bg-white/60 dark:bg-card/40 border border-primary/10">
                        <p className="text-sm font-medium leading-relaxed mb-2 text-gray-800 dark:text-gray-200">
                          "{insight.content}"
                        </p>
                        <div className="flex items-start gap-2 text-xs text-primary font-bold bg-primary/5 p-2 rounded-lg">
                           <Info className="h-3.5 w-3.5 mt-0.5" />
                           <span>REC: {insight.recommendation}</span>
                        </div>
                     </div>
                   ))
                 )}
               </CardContent>
            </Card>

            {/* 5. Case Risk Analysis */}
            <Card className="rounded-[2.5rem] border-white/60 dark:border-white/10 shadow-xl bg-white/70 dark:bg-card/50 backdrop-blur-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-orange-500" />
                  High Risk Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? <Skeleton className="h-40 w-full" /> : (
                  data?.risk_analysis?.length > 0 ? (
                    data?.risk_analysis?.map((rc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-orange-500/5 transition-colors border border-transparent hover:border-orange-500/10">
                         <div className="min-w-0">
                           <p className="text-xs font-bold truncate pr-2">{rc.title}</p>
                           <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{rc.reason || "Impending deadline"}</p>
                         </div>
                         <Badge 
                            variant="secondary" 
                            className={`text-[10px] font-black uppercase text-white bg-${rc.risk_level === 'high' ? 'red' : 'orange'}-500 shrink-0`}
                         >
                           {rc.risk_level}
                         </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-muted-foreground font-medium">No high risk cases detected.</div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 📄 Case Performance Table (Full Details) */}
        <Card className="rounded-[3rem] border-white/60 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-card/50 backdrop-blur-2xl overflow-hidden mt-4">
           <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Detailed Performance Log</CardTitle>
                <CardDescription className="text-sm font-medium">Full historical audit of all tracked cases</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input 
                     placeholder="Search Case ID, Client, or Associate..." 
                     className="pl-9 h-11 w-64 rounded-xl border-border/50 bg-background/50 focus:ring-primary/20" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>
              </div>
           </CardHeader>
           <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto px-10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="py-5 font-bold text-muted-foreground/80 uppercase text-[11px] tracking-widest pl-2">Case ID</th>
                      <th className="py-5 font-bold text-muted-foreground/80 uppercase text-[11px] tracking-widest">Client</th>
                      <th className="py-5 font-bold text-muted-foreground/80 uppercase text-[11px] tracking-widest">Type</th>
                      <th className="py-5 font-bold text-muted-foreground/80 uppercase text-[11px] tracking-widest">Associate</th>
                      <th className="py-5 font-bold text-muted-foreground/80 uppercase text-[11px] tracking-widest">Status</th>
                      <th className="py-5 font-bold text-muted-foreground/80 uppercase text-[11px] tracking-widest">Risk</th>
                      <th className="py-5 font-bold text-muted-foreground/80 uppercase text-[11px] tracking-widest text-right pr-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {loading ? (
                       Array(10).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={7} className="py-6"><Skeleton className="h-6 w-full rounded-lg" /></td></tr>
                       ))
                    ) : (
                      data?.cases?.filter(c => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                          c.case_id?.toString().toLowerCase().includes(query) ||
                          c.client_name?.toLowerCase().includes(query) ||
                          c.lawyer_name?.toLowerCase().includes(query)
                        );
                      })?.map((c, i) => (
                        <tr key={i} className="group hover:bg-primary/5 transition-all duration-300">
                           <td className="py-6 font-mono text-xs font-bold text-primary pl-2 group-hover:scale-105 transition-transform origin-left">#{c.case_id}</td>
                           <td className="py-6 font-bold text-gray-800 dark:text-gray-200">{c.client_name}</td>
                           <td className="py-6">
                              <Badge variant="outline" className="text-[10px] font-semibold border-border/40 bg-background/10 text-muted-foreground tracking-tight">{c.type}</Badge>
                           </td>
                           <td className="py-6">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-500/20">{c.lawyer_name[0]}</div>
                                <span className="font-medium text-xs">{c.lawyer_name}</span>
                              </div>
                           </td>
                           <td className="py-6">
                              <div className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full bg-${c.status === 'Closed' ? 'emerald' : c.status === 'Delayed' ? 'red' : 'blue'}-500 shadow-[0_0_8px] shadow-${c.status === 'Closed' ? 'emerald' : c.status === 'Delayed' ? 'red' : 'blue'}-500/40`} />
                                <span className="text-xs font-bold tracking-tight">{c.status}</span>
                              </div>
                           </td>
                           <td className="py-6">
                              <span className={`text-xs font-black uppercase ${c.risk === 'High' ? 'text-red-500' : c.risk === 'Medium' ? 'text-orange-500' : 'text-emerald-500'}`}>
                                {c.risk}
                              </span>
                           </td>
                           <td className="py-6 text-right font-bold text-muted-foreground pr-2 group-hover:text-primary transition-colors">{c.duration_days} days</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-10 pt-8 border-t border-border/10 bg-gray-50/50 dark:bg-card/20 flex items-center justify-between">
                 <p className="text-xs font-semibold text-muted-foreground">Showing {data?.cases?.length || 0} recent cases</p>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl font-bold h-9">Previous</Button>
                    <Button variant="outline" size="sm" className="rounded-xl font-bold h-9">Next</Button>
                 </div>
              </div>
           </CardContent>
        </Card>
      </main>
    </div>
  );
}
