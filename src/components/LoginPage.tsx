'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockUsers } from '@/data/mockData';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Chrome, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'vendor' | 'admin' | 'learner'>('vendor');

  const handleDemoLogin = async (role: 'vendor' | 'admin' | 'learner') => {
    // Demo credentials for testing
    const demoCredentials = {
      vendor: { email: 'vendor@meyden.com', password: 'vendor123' },
      admin: { email: 'admin@meyden.com', password: 'admin123' },
      learner: { email: 'user@meyden.com', password: 'user123' }
    };

    const credentials = demoCredentials[role];
    const result = await login(credentials.email, credentials.password);
    
    if (result.success) {
      onNavigate(role === 'admin' ? 'admin' : 'dashboard');
    } else {
      // Handle login error (could show a toast notification)
      console.error('Demo login failed:', result.error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      onNavigate('dashboard');
    } else {
      // Handle login error (could show a toast notification)
      console.error('Login failed:', result.error);
    }
  };

  const demoAccounts = [
    {
      role: 'vendor' as const,
      title: 'Demo Vendor Account',
      description: 'Access vendor dashboard and profile management',
      user: mockUsers.find(u => u.role === 'vendor'),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      role: 'admin' as const,
      title: 'Demo Admin Account',
      description: 'Full platform administration and analytics',
      user: mockUsers.find(u => u.role === 'admin'),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      role: 'learner' as const,
      title: 'Demo Learner Account',
      description: 'Explore vendors and take AI assessments',
      user: mockUsers.find(u => u.role === 'learner'),
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Meyden</h1>
                <p className="text-blue-200">AI Marketplace</p>
              </div>
            </div>
            
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Welcome to the Future of AI in MENA
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Connect with top AI vendors, assess your organization's readiness, and join a thriving community of AI innovators across the region.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-blue-100">Premium AI vendor directory</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-blue-100">AI readiness assessment tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Professional community network</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 right-10 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 left-10 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.title')}</h2>
            <p className="text-gray-600">{t('auth.subtitle')}</p>
          </div>

          {/* Demo Accounts */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              {t('auth.demo.accounts')}
            </h3>
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <motion.button
                  key={account.role}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDemoLogin(account.role)}
                  className={`w-full p-4 rounded-xl bg-gradient-to-r ${account.gradient} text-white hover:shadow-lg transition-all duration-300 group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold">{account.title}</div>
                      <div className="text-sm opacity-90">{account.description}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group">
              <Chrome className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="w-5 h-5 bg-gray-600 rounded mr-2 flex items-center justify-center text-white text-xs font-bold">M</div>
              <span className="text-sm font-medium text-gray-700">Microsoft</span>
            </button>
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}