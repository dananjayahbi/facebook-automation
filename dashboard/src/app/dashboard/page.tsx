import { DashboardLayout } from '@/components/layout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard.</p>
      </div>
    </DashboardLayout>
  );
}