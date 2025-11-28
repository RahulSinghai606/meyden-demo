'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';
import { motion } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  Star,
  Users,
  Eye,
  Edit,
  Plus,
  Calendar,
  Award,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  UserCheck,
  Activity,
  Target,
  Clock
} from 'lucide-react';

interface VendorDashboardProps {
  onNavigate: (page: string) => void;
}

interface VendorProfile {
  id: string;
  companyName: string;
  businessName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  averageRating: number;
  totalReviews: number;
  status: string;
  createdAt: string;
}

interface VendorStats {
  totalViews: number;
  totalInquiries: number;
  responseRate: number;
  averageResponseTime: string;
  monthlyGrowth: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceUnit: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface Review {
  id: string;
  reviewerName: string;
  title: string;
  content: string;
  overallRating: number;
  createdAt: string;
  isVerified: boolean;
}

export default function VendorDashboard({ onNavigate }: VendorDashboardProps) {
  const { t, isRTL } = useLanguage();
  const { tokens, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews' | 'profile'>('overview');
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [vendorStats, setVendorStats] = useState<VendorStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Load vendor dashboard data
  const loadVendorData = async () => {
    if (!tokens?.accessToken) return;
    
    try {
      setLoading(true);
      
      // Load vendor profile
      const vendorsResponse = await apiService.getVendors({ limit: 50 });
      if (vendorsResponse.data?.vendors) {
        const currentVendor = vendorsResponse.data.vendors.find(
          (v: VendorProfile) => v.email === user?.email
        );
        if (currentVendor) {
          setVendorProfile(currentVendor);
        }
      }
      
      // Mock vendor stats
      setVendorStats({
        totalViews: 1250,
        totalInquiries: 45,
        responseRate: 89,
        averageResponseTime: '2h',
        monthlyGrowth: 12.5
      });
      
      // Mock services
      setServices([
        {
          id: '1',
          name: 'AI Strategy Consulting',
          description: 'Comprehensive AI strategy development for your organization',
          category: 'Consulting',
          basePrice: 2500,
          priceUnit: 'per project',
          isActive: true,
          isFeatured: true
        },
        {
          id: '2',
          name: 'Machine Learning Implementation',
          description: 'End-to-end ML model development and deployment',
          category: 'Development',
          basePrice: 5000,
          priceUnit: 'per project',
          isActive: true,
          isFeatured: false
        }
      ]);
      
      // Mock reviews
      setReviews([
        {
          id: '1',
          reviewerName: 'Sarah Johnson',
          title: 'Excellent AI consulting services',
          content: 'Outstanding strategic guidance and implementation support. Highly recommend!',
          overallRating: 5,
          createdAt: '2024-01-15T10:30:00Z',
          isVerified: true
        },
        {
          id: '2',
          reviewerName: 'Michael Chen',
          title: 'Professional and knowledgeable',
          content: 'Great experience working with this team. They delivered exactly what was promised.',
          overallRating: 4,
          createdAt: '2024-01-10T14:20:00Z',
          isVerified: true
        }
      ]);
      
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [tokens, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your profile and services</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('profile')}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Add Service
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
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'services', label: 'Services', icon: Target },
                { key: 'reviews', label: 'Reviews', icon: Star },
                { key: 'profile', label: 'Profile', icon: Building2 }
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
        {activeTab === 'overview' && vendorStats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Profile Views</p>
                    <p className="text-2xl font-semibold text-gray-900">{vendorStats.totalViews}</p>
                    <p className="text-sm text-green-600">+{vendorStats.monthlyGrowth}% this month</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Inquiries</p>
                    <p className="text-2xl font-semibold text-gray-900">{vendorStats.totalInquiries}</p>
                    <p className="text-sm text-gray-600">{vendorStats.responseRate}% response rate</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Response</p>
                    <p className="text-2xl font-semibold text-gray-900">{vendorStats.averageResponseTime}</p>
                    <p className="text-sm text-gray-600">Response time</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {vendorProfile?.averageRating || 0}/5
                    </p>
                    <p className="text-sm text-gray-600">
                      {vendorProfile?.totalReviews || 0} reviews
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Plus className="w-5 h-5 text-blue-600 mr-3" />
                      <span>Add New Service</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <Edit className="w-5 h-5 text-green-600 mr-3" />
                      <span>Update Profile</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 text-purple-600 mr-3" />
                      <span>View Messages</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-900">New inquiry received</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-900">Profile viewed 5 times</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-900">New review received</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Services</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Add Service
              </button>
            </div>

            <div className="grid gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                        {service.isFeatured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          service.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Category: {service.category}</span>
                        <span>Price: ${service.basePrice} {service.priceUnit}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Customer Reviews</h2>
            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{review.title}</h4>
                        <div className="flex items-center">
                          {renderStars(review.overallRating)}
                        </div>
                        {review.isVerified && (
                          <UserCheck className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{review.content}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>By {review.reviewerName}</span>
                        <span>•</span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && vendorProfile && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <p className="text-gray-900">{vendorProfile.companyName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <p className="text-gray-900">{vendorProfile.businessName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{vendorProfile.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{vendorProfile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-gray-900">{vendorProfile.address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <p className="text-gray-900">{vendorProfile.city}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <p className="text-gray-900">{vendorProfile.country}</p>
                    </div>
                    {vendorProfile.website && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Website</label>
                        <p className="text-gray-900">{vendorProfile.website}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900">{vendorProfile.description}</p>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Profile
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Preview Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}