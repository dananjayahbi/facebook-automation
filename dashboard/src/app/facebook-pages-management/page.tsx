import { DashboardLayout } from '@/components/layout';
import { FacebookPagesContent } from './components/FacebookPagesContent';

export default function FacebookPagesManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facebook Pages Management</h1>
          <p className="text-gray-600 mt-2">Manage Facebook pages for content generation and distribution.</p>
        </div>
        <FacebookPagesContent />
      </div>
    </DashboardLayout>
  );
}
