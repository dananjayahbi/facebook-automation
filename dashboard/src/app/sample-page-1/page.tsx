import { DashboardLayout } from '@/components/layout';

export default function SamplePage1() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
        <p className="text-gray-600">Manage your automation workflows.</p>
      </div>
    </DashboardLayout>
  );
}