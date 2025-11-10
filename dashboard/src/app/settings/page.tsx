import { DashboardLayout } from '@/components/layout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application settings.</p>
      </div>
    </DashboardLayout>
  );
}