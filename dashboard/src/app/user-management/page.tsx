"use client";

import { DashboardLayout } from '@/components/layout';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "SUPERADMIN") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [requestsRes, usersRes] = await Promise.all([
        fetch("/api/admin/registration-requests"),
        fetch("/api/admin/users"),
      ]);

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setPendingRequests(requestsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, role: string) => {
    setActionLoading(requestId);
    try {
      const response = await fetch("/api/admin/approve-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, role }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const response = await fetch("/api/admin/reject-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      const response = await fetch("/api/admin/toggle-user-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (session?.user?.role !== "SUPERADMIN") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and registration requests</p>
        </div>

        {/* Pending Registration Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Registration Requests ({pendingRequests.length})
          </h2>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.name}</h3>
                    <p className="text-sm text-gray-600">{request.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      id={`role-${request.id}`}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      defaultValue="STAFF"
                    >
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      onClick={() => {
                        const select = document.getElementById(`role-${request.id}`) as HTMLSelectElement;
                        handleApprove(request.id, select.value);
                      }}
                      disabled={actionLoading === request.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={actionLoading === request.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Existing Users */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            All Users ({users.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {user.role !== 'SUPERADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          disabled={actionLoading === user.id}
                          className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-xs"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}