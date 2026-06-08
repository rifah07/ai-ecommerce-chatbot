"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Users, Ruler, DollarSign } from "lucide-react";
import type { IDashboardStats, ApiResponse } from "@/types";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const data: ApiResponse<IDashboardStats> = await res.json();
        if (!cancelled && data.success) setStats(data.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border p-5 h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Customers"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="w-5 h-5 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          label="Pending Size Requests"
          value={stats?.pendingSizeRequests ?? 0}
          icon={<Ruler className="w-5 h-5 text-orange-600" />}
          color="bg-orange-50"
        />
        <StatCard
          label="Total Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
        />
      </div>
    </div>
  );
}
