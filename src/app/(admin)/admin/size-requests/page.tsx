"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ApiResponse } from "@/types";

interface SizeReq {
  _id: string;
  userId: { name: string; email: string };
  productId: { name: string; category: string; image: string };
  requestedSize: string;
  status: string;
  createdAt: string;
}

export default function AdminSizeRequestsPage() {
  const [requests, setRequests] = useState<SizeReq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/size-requests");
        const data: ApiResponse<SizeReq[]> = await res.json();
        if (!cancelled && data.success) setRequests(data.data);
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
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border p-5 h-20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        Size Requests ({requests.length})
      </h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Product", "Size", "Customer", "Status", "Date"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map((req) => (
              <tr key={req._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {req.productId?.image && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={req.productId.image}
                          alt={req.productId.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {req.productId?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {req.productId?.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs">
                    {req.requestedSize}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">
                    {req.userId?.name}
                  </p>
                  <p className="text-xs text-gray-400">{req.userId?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full
                    ${req.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">
            No size requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
