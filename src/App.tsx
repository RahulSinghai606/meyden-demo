'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import HomePage from '@/components/HomePage';
import LoginPage from '@/components/LoginPage';
import VendorsPage from '@/components/VendorsPage';
import AIReadinessPage from '@/components/AIReadinessPage';
import AdminDashboard from '@/components/AdminDashboard';
import VendorDashboard from '@/components/VendorDashboard';
import CommunityPage from '@/components/CommunityPage';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'vendors':
        return <VendorsPage onNavigate={handleNavigate} />;
      case 'readiness':
        return <AIReadinessPage onNavigate={handleNavigate} />;
      case 'community':
        return <CommunityPage />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'dashboard':
        return <RoleBasedDashboard onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="App">
          {currentPage === 'login' ? (
            <LoginPage onNavigate={handleNavigate} />
          ) : (
            <Layout currentPage={currentPage} onNavigate={handleNavigate}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </Layout>
          )}
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

function RoleBasedDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 mb-8">Please log in to access the dashboard</p>
          <button
            onClick={() => onNavigate('login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // Show different dashboards based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard onNavigate={onNavigate} />;
    case 'vendor':
      return <VendorDashboard onNavigate={onNavigate} />;
    case 'user':
    default:
      return <UserDashboard onNavigate={onNavigate} />;
  }
}

function UserDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">Your personalized dashboard</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Readiness Assessment</h3>
              <p className="text-gray-600 mb-4">Evaluate your organization's AI preparedness</p>
              <button
                onClick={() => onNavigate('readiness')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Assessment
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Vendors</h3>
              <p className="text-gray-600 mb-4">Find AI service providers and consultants</p>
              <button
                onClick={() => onNavigate('vendors')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Explore Vendors
              </button>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate('home')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}