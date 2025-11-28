'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';
import { motion } from 'framer-motion';
import AddVendorModal from './AddVendorModal';
import {
  Users,
  Building2,
  TrendingUp,
  Award,
  Shield,
  Plus,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Activity
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

interface DashboardStats {
  totalVendors: number;
  activeVendors: number;
  totalUsers: number;
  totalSurveys: number;
  averageRating: number;
}

interface Vendor {
  id: string;
  companyName: string;
  businessName: string;
  email: string;
  status: string;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { t, isRTL } = useLanguage();
  const { tokens, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'users' | 'surveys' | 'pending'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pendingVendors, setPendingVendors] = useState<Vendor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!tokens?.accessToken) return;
    
    try {
      setLoading(true);
      
      // Load vendors
      const vendorsResponse = await apiService.getVendors({ limit: 100 });
      if (vendorsResponse.data?.vendors) {
        setVendors(vendorsResponse.data.vendors);
      }

      // Load pending vendors
      const pendingResponse = await fetch('http://localhost:3002/api/v1/admin/vendors/pending');
      const pendingData = await pendingResponse.json();
      if (pendingData.vendors) {
        setPendingVendors(pendingData.vendors);
      }

      // Load users (admin endpoint)
      const usersResponse = await apiService.getUserProfile(tokens.accessToken);
      if (usersResponse.data?.user) {
        // Load all users via admin endpoint if available
        setUsers([usersResponse.data.user]);
      }
      
      // Calculate stats
      if (vendorsResponse.data?.vendors) {
        const vendorStats = {
          totalVendors: vendorsResponse.data.vendors.length,
          activeVendors: vendorsResponse.data.vendors.filter((v: Vendor) => v.status === 'active').length,
          totalUsers: 150, // Mock data
          totalSurveys: 3, // Mock data
          averageRating: 4.2 // Mock data
        };
        setStats(vendorStats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorCreated = () => {
    // Reload vendors data to show the new vendor
    loadDashboardData();
  };

  useEffect(() => {
    loadDashboardData();
  }, [tokens]);

  const filteredVendors = vendors.filter(vendor =>
    vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddVendorModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add New Vendor
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: TrendingUp },
                { key: 'vendors', label: 'Vendors', icon: Building2 },
                { key: 'pending', label: `Pending (${pendingVendors.length})`, icon: Clock },
                { key: 'users', label: 'Users', icon: Users },
                { key: 'surveys', label: 'Surveys', icon: Award }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Vendors</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalVendors}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeVendors}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.averageRating}/5</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100">
              <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-gray-600">New vendor "TechSolutions Ltd" registered</p>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <p className="text-sm text-gray-600">AI Readiness survey completed by 5 users</p>
                    <span className="text-xs text-gray-400">4 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <p className="text-sm text-gray-600">Review submitted for "Digital Marketing Pro"</p>
                    <span className="text-xs text-gray-400">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Vendors Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVendors.map((vendor) => (
                      <tr key={vendor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{vendor.companyName}</div>
                            <div className="text-sm text-gray-500">{vendor.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vendor.status)}`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-900">{vendor.averageRating}/5</span>
                            <span className="text-sm text-gray-500 ml-1">({vendor.totalReviews})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(vendor.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pending Vendors Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                <h3 className="text-lg font-medium text-gray-900">Pending Vendor Approvals</h3>
                <p className="text-sm text-gray-600 mt-1">Review and approve vendor registrations</p>
              </div>
              <div className="divide-y divide-gray-200">
                {pendingVendors.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending vendor approvals</p>
                  </div>
                ) : (
                  pendingVendors.map((vendor) => (
                    <div key={vendor.id} className="px-6 py-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{vendor.companyName}</h4>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending Approval
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{vendor.businessName}</p>
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Email:</span>
                              <span className="ml-2 text-gray-600">{vendor.email}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Submitted:</span>
                              <span className="ml-2 text-gray-600">{formatDate(vendor.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-6">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`http://localhost:3002/api/v1/admin/vendors/${vendor.id}/approve`, {
                                  method: 'PATCH',
                                  headers: { 'Authorization': `Bearer ${tokens?.accessToken}` }
                                });
                                if (res.ok) {
                                  loadDashboardData();
                                } else {
                                  alert('Failed to approve vendor');
                                }
                              } catch (error) {
                                console.error('Error approving vendor:', error);
                                alert('Error approving vendor');
                              }
                            }}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`http://localhost:3002/api/v1/admin/vendors/${vendor.id}/reject`, {
                                  method: 'PATCH',
                                  headers: { 'Authorization': `Bearer ${tokens?.accessToken}` }
                                });
                                if (res.ok) {
                                  loadDashboardData();
                                } else {
                                  alert('Failed to reject vendor');
                                }
                              } catch (error) {
                                console.error('Error rejecting vendor:', error);
                                alert('Error rejecting vendor');
                              }
                            }}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            <XCircle className="w-4 h-4 inline mr-2" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
            <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">User Management</h3>
            <p className="text-gray-600">User management functionality coming soon...</p>
          </div>
        )}

        {/* Surveys Tab */}
        {activeTab === 'surveys' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6">
            <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Survey Management</h3>
            <p className="text-gray-600">Survey management functionality coming soon...</p>
          </div>
        )}
      </div>
      
      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={showAddVendorModal}
        onClose={() => setShowAddVendorModal(false)}
        onSuccess={handleVendorCreated}
      />
    </div>
  );
}