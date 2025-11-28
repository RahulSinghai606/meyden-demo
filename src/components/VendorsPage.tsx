'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  Mail,
  Phone,
  Award,
  Building2,
  X,
  ChevronRight,
  Heart,
  BookmarkPlus,
  Loader
} from 'lucide-react';

interface Vendor {
  id: string;
  companyName: string;
  businessName: string;
  description: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  businessType: string;
  yearEstablished?: number;
  employeeCount?: string;
  website?: string;
  status: string;
  averageRating: number;
  totalReviews: number;
  services: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string;
    basePrice?: number;
    priceUnit?: string;
    duration?: string;
    isActive: boolean;
    isFeatured: boolean;
  }>;
  reviews: Array<{
    id: string;
    reviewerName: string;
    reviewerEmail: string;
    title: string;
    content: string;
    overallRating: number;
    qualityRating?: number;
    communicationRating?: number;
    timelinessRating?: number;
    valueRating?: number;
    status: string;
    isVerified: boolean;
    isPublic: boolean;
  }>;
}

interface VendorsPageProps {
  onNavigate: (page: string) => void;
}

export default function VendorsPage({ onNavigate }: VendorsPageProps) {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiService.getVendors();
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setVendors(result.data.vendors);
        }
      } catch (err) {
        setError('Failed to fetch vendors');
        console.error('Error fetching vendors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(vendors.map(v => v.businessType))];
    return uniqueIndustries;
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.services.some(service => service.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesIndustry = selectedIndustry === 'all' || vendor.businessType === selectedIndustry;
      
      return matchesSearch && matchesIndustry;
    });
  }, [vendors, searchQuery, selectedIndustry]);

  const toggleFavorite = (vendorId: string) => {
    setFavorites(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const getTierColor = (rating: number) => {
    if (rating >= 4.5) return 'from-yellow-400 to-orange-500';
    if (rating >= 4.0) return 'from-blue-400 to-purple-500';
    return 'from-gray-400 to-gray-600';
  };

  const getTierBadgeColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (rating >= 4.0) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    return 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getTierName = (rating: number) => {
    if (rating >= 4.5) return 'Premium';
    if (rating >= 4.0) return 'Standard';
    return 'Basic';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t('vendors.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Discover premium AI vendors across the MENA region with verified credentials and proven expertise
            </p>
            <button
              onClick={() => window.open('/vendors/register', '_blank')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-flex items-center space-x-2"
            >
              <Building2 className="w-5 h-5" />
              <span>Register as Vendor</span>
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('vendors.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {(selectedIndustry !== 'all' || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedIndustry !== 'all' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Industry: {selectedIndustry}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        {/* Loading and Error States */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading vendors...</span>
          </motion.div>
        )}

        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6"
          >
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </motion.div>
        )}

        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6"
          >
            <p className="text-gray-600">
              Showing {filteredVendors.length} of {vendors.length} vendors
            </p>
          </motion.div>
        )}

        {/* Vendor Grid */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid lg:grid-cols-3 md:grid-cols-2 gap-6"
          >
            {filteredVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden"
                onClick={() => setSelectedVendor(vendor)}
              >
                {/* Header with tier badge */}
                <div className={`h-2 bg-gradient-to-r ${getTierColor(vendor.averageRating)}`}></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getTierBadgeColor(vendor.averageRating)}`}>
                      {getTierName(vendor.averageRating)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(vendor.id);
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${favorites.includes(vendor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                      />
                    </button>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {vendor.companyName}
                    </h3>
                    <p className="text-blue-600 font-medium text-sm mb-2">{vendor.businessType}</p>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {vendor.description}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(vendor.averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{vendor.averageRating}</span>
                    <span className="text-sm text-gray-500">({vendor.totalReviews} reviews)</span>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {vendor.services.slice(0, 3).map((service) => (
                        <span
                          key={service.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                        >
                          {service.name}
                        </span>
                      ))}
                      {vendor.services.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                          +{vendor.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{vendor.yearEstablished ? new Date().getFullYear() - vendor.yearEstablished : 'N/A'} years</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{vendor.employeeCount || 'N/A'} employees</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{vendor.city || vendor.country || 'Location not specified'}</span>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2">
                    <span>{t('vendors.contact')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {filteredVendors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </motion.div>
        )}
      </div>

      {/* Vendor Detail Modal */}
      <AnimatePresence>
        {selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedVendor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`h-3 bg-gradient-to-r ${getTierColor(selectedVendor.averageRating)}`}></div>
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-full text-white font-semibold ${getTierBadgeColor(selectedVendor.averageRating)}`}>
                      {getTierName(selectedVendor.averageRating)}
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(selectedVendor.averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-semibold">{selectedVendor.averageRating}</span>
                      <span className="ml-1 text-gray-500">({selectedVendor.totalReviews} reviews)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedVendor.companyName}</h1>
                    <p className="text-xl text-blue-600 font-medium mb-4">{selectedVendor.businessType}</p>
                    <p className="text-gray-600 mb-6 leading-relaxed">{selectedVendor.description}</p>

                    {/* Services */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedVendor.services.map((service) => (
                          <span
                            key={service.id}
                            className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                          >
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Reviews */}
                    {selectedVendor.reviews.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Reviews</h3>
                        <div className="space-y-3">
                          {selectedVendor.reviews.slice(0, 3).map((review) => (
                            <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.overallRating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 font-semibold text-sm">{review.overallRating}</span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                              <p className="text-gray-600 text-sm">{review.content}</p>
                              <p className="text-gray-500 text-xs mt-2">- {review.reviewerName}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div>
                    {/* Company Stats */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-600">
                            Established {selectedVendor.yearEstablished ? new Date().getFullYear() - selectedVendor.yearEstablished : 'N/A'} years ago
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-600">{selectedVendor.employeeCount || 'N/A'} employees</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-600">
                            {[selectedVendor.city, selectedVendor.state, selectedVendor.country].filter(Boolean).join(', ') || 'Location not specified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                      
                      <a
                        href={`mailto:${selectedVendor.email}`}
                        className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                      >
                        <Mail className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Email</div>
                          <div className="text-blue-600 group-hover:text-blue-700">{selectedVendor.email}</div>
                        </div>
                      </a>

                      {selectedVendor.phone && (
                        <a
                          href={`tel:${selectedVendor.phone}`}
                          className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                        >
                          <Phone className="w-5 h-5 text-green-600 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">Phone</div>
                            <div className="text-green-600 group-hover:text-green-700">{selectedVendor.phone}</div>
                          </div>
                        </a>
                      )}

                      {selectedVendor.website && (
                        <a
                          href={`https://${selectedVendor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                        >
                          <ExternalLink className="w-5 h-5 text-purple-600 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">Website</div>
                            <div className="text-purple-600 group-hover:text-purple-700">{selectedVendor.website}</div>
                          </div>
                        </a>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-3">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                        {t('vendors.contact')}
                      </button>
                      {selectedVendor.website && (
                        <a
                          href={`https://${selectedVendor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                          {t('vendors.website')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}