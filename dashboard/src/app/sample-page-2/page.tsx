import { DashboardLayout } from '@/components/layout';

export default function SamplePage2() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600">Connect and manage your integrations.</p>
      </div>
    </DashboardLayout>
  );
}