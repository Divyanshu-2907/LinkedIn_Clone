import { useState, useEffect, useRef, useCallback } from 'react';
import { postsAPI } from '../services/api';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';
import { RefreshCw, TrendingUp, Clock, Filter, Search, X } from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'trending', 'oldest'
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter and sort posts whenever search, sort, or posts change
  useEffect(() => {
    let result = [...posts];

    // Apply search filter
    if (searchQuery.trim()) {
      result = result.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'latest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'trending':
        result.sort((a, b) => {
          const aEngagement = (a.likes?.length || 0) + (a.comments?.length || 0);
          const bEngagement = (b.likes?.length || 0) + (b.comments?.length || 0);
          return bEngagement - aEngagement;
        });
        break;
      default:
        break;
    }

    setFilteredPosts(result);
  }, [posts, searchQuery, sortBy]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore]);

  const fetchPosts = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const { data } = await postsAPI.getAllPosts();
      setPosts(data);
      setPage(1);
      setHasMore(data.length >= 10); // Assume 10 posts per page
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    try {
      // Simulate pagination - replace with actual API call
      // const { data } = await postsAPI.getAllPosts({ page: page + 1 });
      
      // For now, we'll just set hasMore to false after first load
      // In production, you'd append new posts here
      setTimeout(() => {
        setHasMore(false);
        setLoadingMore(false);
      }, 1000);
      
      // setPosts(prev => [...prev, ...data]);
      // setPage(prev => prev + 1);
      // setHasMore(data.length >= 10);
    } catch (error) {
      toast.error('Failed to load more posts');
      setLoadingMore(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    toast.success('Post created successfully! 🎉');
    // Scroll to top to show new post
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setSortBy('latest');
    fetchPosts(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'trending':
        return <TrendingUp size={18} />;
      case 'oldest':
        return <Clock size={18} className="rotate-180" />;
      default:
        return <Clock size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-linkedin-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Loading your feed...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Fetching latest posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feed</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 text-linkedin-500 dark:text-linkedin-400 hover:bg-linkedin-50 dark:hover:bg-linkedin-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh feed"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              <span className="font-medium hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search posts or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Filter size={18} />
                <span className="text-sm font-medium">Sort</span>
              </button>

              {showFilters && (
                <div className="flex items-center space-x-2 animate-fadeIn">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'latest'
                        ? 'bg-linkedin-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Clock size={16} />
                    <span>Latest</span>
                  </button>

                  <button
                    onClick={() => setSortBy('trending')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'trending'
                        ? 'bg-linkedin-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <TrendingUp size={16} />
                    <span>Trending</span>
                  </button>

                  <button
                    onClick={() => setSortBy('oldest')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === 'oldest'
                        ? 'bg-linkedin-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Clock size={16} className="rotate-180" />
                    <span>Oldest</span>
                  </button>
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {(searchQuery || sortBy !== 'latest') && (
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-linkedin-100 dark:bg-linkedin-900/20 text-linkedin-700 dark:text-linkedin-400">
                    Search: "{searchQuery}"
                  </span>
                )}
                {sortBy !== 'latest' && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-linkedin-100 dark:bg-linkedin-900/20 text-linkedin-700 dark:text-linkedin-400">
                    {getSortIcon()}
                    <span className="capitalize">{sortBy}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {filteredPosts.length === posts.length ? (
              <span>Showing all {posts.length} posts</span>
            ) : (
              <span>Found {filteredPosts.length} of {posts.length} posts</span>
            )}
          </div>
        </div>

        {/* Post Creation Form */}
        <PostForm onPostCreated={handlePostCreated} />

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchQuery ? (
                <Search size={32} className="text-gray-400" />
              ) : (
                <span className="text-4xl">📝</span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? `No posts match "${searchQuery}". Try a different search term.`
                : 'Be the first to share something!'
              }
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-2 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <div
                key={post._id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <PostCard
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                />
              </div>
            ))}

            {/* Infinite Scroll Loader */}
            {hasMore && (
              <div ref={observerTarget} className="py-8 text-center">
                {loadingMore && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-linkedin-500"></div>
                    <p className="text-sm text-gray-600">Loading more posts...</p>
                  </div>
                )}
              </div>
            )}

            {/* End of Feed Message */}
            {!hasMore && filteredPosts.length > 0 && (
              <div className="py-8 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-500">
                  <div className="h-px w-12 bg-gray-300"></div>
                  <span className="text-sm font-medium">You're all caught up! 🎉</span>
                  <div className="h-px w-12 bg-gray-300"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scroll to Top Button */}
        {filteredPosts.length > 5 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 p-4 bg-linkedin-500 text-white rounded-full shadow-lg hover:bg-linkedin-600 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:ring-offset-2"
            title="Scroll to top"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Feed;