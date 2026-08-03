"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, BarChart3, Users, FileText, ImageIcon, Search, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface DashboardData {
  totalVisitors: number;
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  totalToolUsage: number;
  toolBreakdown: { type: string; count: number }[];
  totalWordsProcessed: number;
  totalReceipts: number;
  recentVisitors: { pagePath: string; referrer: string; createdAt: string }[];
  hourlyVisitors: number[];
}

const toolTypes = [
  { key: "humanize", label: "AI Humanizer", icon: FileText, color: "from-blue-500 to-cyan-500" },
  { key: "detect", label: "AI Detector", icon: Search, color: "from-purple-500 to-pink-500" },
  { key: "image-detector", label: "Image Detector", icon: ImageIcon, color: "from-pink-500 to-rose-500" },
];

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const init = async () => {
      const sessionRes = await fetch("/api/admin/session");
      const sessionData = await sessionRes.json();

      if (!sessionData.authenticated) {
        router.push("/admin/login");
        return;
      }

      setUsername(sessionData.username);

      const dashRes = await fetch("/api/admin/dashboard");
      const dashData = await dashRes.json();

      if (!dashRes.ok) {
        toast.error(dashData.error || "Failed to load dashboard");
        setLoading(false);
        return;
      }

      setData(dashData);
      setLoading(false);
    };

    init();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Loading...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-3" />
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-muted-foreground">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Visitors", value: data.totalVisitors.toString(), icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Daily Visitors", value: data.dailyVisitors.toString(), icon: BarChart3, color: "from-green-500 to-emerald-500" },
    { label: "Weekly Visitors", value: data.weeklyVisitors.toString(), icon: BarChart3, color: "from-purple-500 to-pink-500" },
    { label: "Monthly Visitors", value: data.monthlyVisitors.toString(), icon: BarChart3, color: "from-orange-500 to-amber-500" },
    { label: "Total Tool Uses", value: data.totalToolUsage.toString(), icon: FileText, color: "from-cyan-500 to-blue-500" },
    { label: "Words Processed", value: data.totalWordsProcessed.toLocaleString(), icon: FileText, color: "from-violet-500 to-purple-500" },
    { label: "Receipts Generated", value: data.totalReceipts.toString(), icon: Receipt, color: "from-emerald-500 to-teal-500" },
  ];

  const toolUsageMap = new Map(data.toolBreakdown.map((t) => [t.type, t.count]));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Tool Usage Breakdown</h3>
            <div className="space-y-4">
              {toolTypes.map((tool) => {
                const count = toolUsageMap.get(tool.key) || 0;
                const percentage = data.totalToolUsage > 0 ? Math.round((count / data.totalToolUsage) * 100) : 0;
                return (
                  <div key={tool.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <tool.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tool.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count} uses ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${tool.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Visitors</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Page</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Referrer</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentVisitors.map((visitor, index) => (
                    <tr key={visitor.createdAt + index} className="border-b border-border/30 last:border-0">
                      <td className="py-2 px-3 font-medium">{visitor.pagePath}</td>
                      <td className="py-2 px-3 text-muted-foreground">{visitor.referrer || "Direct"}</td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {new Date(visitor.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Today&apos;s Visitors (Hourly)</h3>
          <div className="flex items-end gap-1 h-32">
            {data.hourlyVisitors.map((count, hour) => (
              <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(count * 10, 2)}px` }}
                  transition={{ duration: 0.5, delay: hour * 0.02 }}
                  className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm min-h-[2px]"
                />
                <span className="text-[10px] text-muted-foreground">{hour}:00</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
