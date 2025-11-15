"use client";

import { ProtectedPage } from '@/components/wrappers/auth';
import { PageLoader } from '@/components/common';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FacebookPageModal } from './FacebookPageModal';
import { ConfirmDialog } from '@/components/common';
import { useFacebookPage } from '@/contexts/FacebookPageContext';

interface FacebookPage {
  id: string;
  name: string;
  description: string | null;
  pageId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function FacebookPagesContent() {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<FacebookPage | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<FacebookPage | null>(null);
  const { refreshPages } = useFacebookPage();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      // Include inactive pages for management view
      const response = await fetch("/api/facebook-pages?includeInactive=true");

      if (response.ok) {
        const data = await response.json();
        setPages(data);
      } else {
        toast.error("Failed to fetch Facebook pages");
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("An error occurred while loading Facebook pages");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = () => {
    setEditingPage(null);
    setShowModal(true);
  };

  const handleEditPage = (page: FacebookPage) => {
    setEditingPage(page);
    setShowModal(true);
  };

  const handleSavePage = async (pageData: Partial<FacebookPage>) => {
    setActionLoading(editingPage?.id || 'new');
    try {
      const url = editingPage 
        ? `/api/facebook-pages/${editingPage.id}`
        : "/api/facebook-pages";
      
      const method = editingPage ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });

      if (response.ok) {
        toast.success(`Facebook page ${editingPage ? 'updated' : 'created'} successfully!`);
        setShowModal(false);
        await fetchPages();
        // Refresh the Facebook pages in the context to update the header dropdown
        await refreshPages();
      } else {
        const data = await response.json();
        toast.error(data.message || `Failed to ${editingPage ? 'update' : 'create'} page`);
      }
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("An error occurred while saving the page");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (page: FacebookPage) => {
    setPageToDelete(page);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;

    setActionLoading(pageToDelete.id);
    setShowDeleteDialog(false);

    try {
      const response = await fetch(`/api/facebook-pages/${pageToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Facebook page deleted successfully");
        await fetchPages();
        // Refresh the Facebook pages in the context to update the header dropdown
        await refreshPages();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete page");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("An error occurred while deleting the page");
    } finally {
      setActionLoading(null);
      setPageToDelete(null);
    }
  };

  const handleToggleStatus = async (page: FacebookPage) => {
    setActionLoading(page.id);
    try {
      const response = await fetch(`/api/facebook-pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !page.isActive }),
      });

      if (response.ok) {
        toast.success(`Page ${!page.isActive ? 'activated' : 'deactivated'} successfully`);
        await fetchPages();
        // Refresh the Facebook pages in the context to update the header dropdown
        await refreshPages();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update page status");
      }
    } catch (error) {
      console.error("Error updating page status:", error);
      toast.error("An error occurred while updating page status");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <ProtectedPage requireRole={["SUPERADMIN"]}>
        <PageLoader />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage requireRole={["SUPERADMIN"]}>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleAddPage}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Add Facebook Page
          </button>
        </div>

        {/* Pages Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Facebook Pages ({pages.length})
          </h2>
          {pages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No Facebook pages configured yet</p>
              <button
                onClick={handleAddPage}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Your First Page
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Page ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{page.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {page.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                        {page.pageId || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          page.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {page.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPage(page)}
                            disabled={actionLoading === page.id}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(page)}
                            disabled={actionLoading === page.id}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-xs"
                          >
                            {actionLoading === page.id ? "..." : page.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(page)}
                            disabled={actionLoading === page.id}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <FacebookPageModal
          page={editingPage}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSavePage}
          loading={actionLoading !== null}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Facebook Page"
        message={`Are you sure you want to delete "${pageToDelete?.name}"? This will also delete all associated quotes and backgrounds. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setPageToDelete(null);
        }}
        danger={true}
      />
    </ProtectedPage>
  );
}
