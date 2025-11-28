'use client';

import { useState, useEffect } from 'react';

interface Vendor {
  id: string;
  companyName: string;
  businessName: string;
  description: string;
  email: string;
  city: string;
  country: string;
  businessType: string;
  status: string;
  createdAt: string;
}

export default function AdminVendorsPage() {
  const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/v1/admin/vendors/pending', {
        headers: {
          'Authorization': 'Bearer ADMIN_TOKEN' // TODO: Add real auth
        }
      });
      const data = await res.json();
      setPendingVendors(data.vendors || []);
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3002/api/v1/admin/vendors/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ADMIN_TOKEN'
        }
      });

      if (res.ok) {
        alert('Vendor approved successfully!');
        fetchPendingVendors();
      } else {
        alert('Failed to approve vendor');
      }
    } catch (error) {
      alert('Error approving vendor');
    }
  };

  const rejectVendor = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3002/api/v1/admin/vendors/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ADMIN_TOKEN'
        }
      });

      if (res.ok) {
        alert('Vendor rejected');
        fetchPendingVendors();
      } else {
        alert('Failed to reject vendor');
      }
    } catch (error) {
      alert('Error rejecting vendor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Pending Vendor Approvals</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : (
          <div className="space-y-4">
            {pendingVendors.map((vendor) => (
              <div key={vendor.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{vendor.companyName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{vendor.businessName}</p>
                    <p className="text-gray-700 mb-4">{vendor.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div><strong>Email:</strong> {vendor.email}</div>
                      <div><strong>Location:</strong> {vendor.city}, {vendor.country}</div>
                      <div><strong>Type:</strong> {vendor.businessType}</div>
                      <div><strong>Submitted:</strong> {new Date(vendor.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => approveVendor(vendor.id)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectVendor(vendor.id)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pendingVendors.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No pending vendor approvals
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
