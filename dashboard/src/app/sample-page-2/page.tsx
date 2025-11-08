import { DashboardLayout } from '@/components/layout';

export default function SamplePage2() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Integrations</h1>
        <p className="text-gray-400">Connect and manage your integrations.</p>
      </div>
    </DashboardLayout>
  );
}