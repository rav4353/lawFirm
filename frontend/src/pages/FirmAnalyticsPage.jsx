import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, 
  FileText, Users, DollarSign, Activity, AlertCircle, ChevronRight
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function FirmAnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await api.get("/analytics/dashboard");
      setMetrics(response.data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      // Give a highly visible error state if non-partner accesses
      if (err.response?.status === 403) {
        setError("You do not have permission to view firm analytics. Partner access required.");
      } else {
        setError("Failed to load analytics data.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fdfbf9] dark:bg-background justify-center items-center">
        <div className="text-center space-y-4 max-w-md p-6 bg-white dark:bg-card border border-red-100 dark:border-red-900/50 rounded-2xl shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <Link to="/dashboard" className="text-orange-500 font-medium hover:underline inline-block mt-4">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                 <BarChart3 className="h-4.5 w-4.5 text-orange-500" />
              </div>
              <span className="text-lg font-bold tracking-tight">Firm Analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Revenue & KPI Review</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor firm performance, client growth, and compliance metrics.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border-gray-100 dark:border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(metrics?.total_revenue || 0)}
                  </h3>
                </div>
                <div className="rounded-full bg-green-50 p-3 ring-1 ring-green-100 dark:bg-green-500/10 dark:ring-green-500/20">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-gray-100 dark:border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Documents Processed</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? <Skeleton className="h-8 w-16" /> : (metrics?.documents_processed?.toLocaleString() || 0)}
                  </h3>
                </div>
                <div className="rounded-full bg-blue-50 p-3 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-gray-100 dark:border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Compliance Score</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? <Skeleton className="h-8 w-16" /> : `${metrics?.avg_compliance_score || 0}%`}
                  </h3>
                </div>
                <div className="rounded-full bg-orange-50 p-3 ring-1 ring-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/20">
                  <Activity className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-gray-100 dark:border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Clients</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? <Skeleton className="h-8 w-12" /> : (metrics?.active_clients || 0)}
                  </h3>
                </div>
                <div className="rounded-full bg-purple-50 p-3 ring-1 ring-purple-100 dark:bg-purple-500/10 dark:ring-purple-500/20">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Trend */}
          <Card className="lg:col-span-2 rounded-2xl border-gray-100 dark:border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue generated over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-xl" />
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics?.revenue_trend || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6b7280', fontSize: 12}}
                        tickFormatter={(value) => `$${value/1000}k`}
                        dx={-10}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#f97316" 
                        strokeWidth={4}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#f97316' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Distribution */}
          <Card className="rounded-2xl border-gray-100 dark:border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Compliance Rate</CardTitle>
              <CardDescription>Overall GDPR & CCPA pass rate</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton className="h-64 w-64 rounded-full" />
                </div>
              ) : (
                <div className="h-[300px] w-full flex flex-col items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics?.compliance_distribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="percentage"
                      >
                        {metrics?.compliance_distribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.status === 'Pass' ? COLORS[0] : COLORS[1]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {metrics?.compliance_distribution?.find(c => c.status === 'Pass')?.percentage || 0}%
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">Pass Rate</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Clients by Revenue */}
          <Card className="lg:col-span-3 rounded-2xl border-gray-100 dark:border-border/50 shadow-sm mt-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Top Clients by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-xl" />
                </div>
              ) : (
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics?.client_revenues || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="client_name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#4b5563', fontSize: 13, fontWeight: 500}}
                        width={150}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                        cursor={{fill: '#f3f4f6'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
        </div>

        {/* Team Overview Entry Card */}
        <Card className="rounded-2xl border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 shadow-sm transition-all hover:shadow-md hover:bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/20">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Team Overview</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                    Monitor associate performance, workload distribution across departments, and billable hour targets.
                  </p>
                </div>
              </div>
              <Button asChild className="rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white px-8 gap-2 font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">
                <Link to="/team-overview">
                  Go to Team Overview <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
