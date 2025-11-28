'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, TrendingUp, MessageCircle, Eye, Heart, Calendar, Filter, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
  category?: {
    name: string;
    color: string;
  };
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://localhost:3002/api/v1/community/posts?status=PUBLISHED`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'QUESTION': return 'bg-blue-100 text-blue-800';
      case 'ARTICLE': return 'bg-green-100 text-green-800';
      case 'DISCUSSION': return 'bg-purple-100 text-purple-800';
      case 'ANNOUNCEMENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPosts = posts
    .filter((post) => filter === 'all' || post.type === filter)
    .filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likeCount - a.likeCount;
      if (sortBy === 'trending') return b.viewCount - a.viewCount;
      if (sortBy === 'discussed') return b.commentCount - a.commentCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-10 h-10" />
                <h1 className="text-4xl font-bold">AI Community Hub</h1>
              </div>
              <p className="text-blue-100 text-lg">Share knowledge, ask questions, and connect with AI professionals worldwide</p>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{posts.length} Posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>{posts.reduce((acc, p) => acc + p.commentCount, 0)} Discussions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{posts.reduce((acc, p) => acc + p.viewCount, 0)} Views</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.open('/community/create', '_blank')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Search Bar */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
                <option value="discussed">Most Discussed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All Posts', icon: TrendingUp },
              { key: 'QUESTION', label: 'Questions', icon: MessageCircle },
              { key: 'ARTICLE', label: 'Articles', icon: Calendar },
              { key: 'DISCUSSION', label: 'Discussions', icon: Users },
              { key: 'ANNOUNCEMENT', label: 'Announcements', icon: Sparkles }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filter === key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/community/${post.id}`}
                  className="block bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getTypeColor(post.type)}`}>
                          {post.type}
                        </span>
                        {post.category && (
                          <span
                            className="text-xs px-3 py-1 rounded-full font-semibold"
                            style={{ backgroundColor: post.category.color + '20', color: post.category.color }}
                          >
                            {post.category.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hover:from-blue-600 hover:to-purple-600 transition-all">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {post.content.substring(0, 200)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {post.user.firstName[0]}
                        </div>
                        <span className="font-medium">{post.user.firstName} {post.user.lastName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">{post.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="font-semibold">{post.likeCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-semibold">{post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredPosts.length === 0 && posts.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100 p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts match your filters</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl shadow-lg border border-blue-200 p-12 text-center">
            <Sparkles className="w-20 h-20 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Start the Conversation!</h3>
            <p className="text-gray-600 mb-6">Be the first to share your insights with the community</p>
            <button
              onClick={() => window.open('/community/create', '_blank')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Create First Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
