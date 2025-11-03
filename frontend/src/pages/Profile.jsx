import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';
import { Calendar, Mail, MapPin, Briefcase, Edit2, Camera, Globe, X } from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    company: '',
    website: ''
  });

  useEffect(() => {
    fetchUserPosts();
    // Initialize edit form with user data
    if (user) {
      setEditForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        company: user.company || '',
        website: user.website || ''
      });
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const { data } = await postsAPI.getAllPosts();
      // Filter posts by current user
      const userPosts = data.filter(post => post.user._id === user._id);
      setPosts(userPosts);
    } catch (error) {
      toast.error('Failed to fetch your posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
    toast.success('Post updated successfully');
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
    toast.success('Post deleted successfully');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      setEditForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        company: user.company || '',
        website: user.website || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Add API call to update user profile
      // const response = await userAPI.updateProfile(editForm);
      // updateUser(response.data);
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Add image upload logic
      toast.success('Avatar upload feature coming soon!');
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // TODO: Add cover image upload logic
      toast.success('Cover image upload feature coming soon!');
    }
  };

  const stats = {
    posts: posts.length,
    likes: posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0),
    comments: posts.reduce((acc, post) => acc + (post.comments?.length || 0), 0),
    connections: 0 // TODO: Add connections count from backend
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-linkedin-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cover Image Section */}
        <div className="relative bg-gradient-to-r from-linkedin-500 via-linkedin-600 to-linkedin-700 h-48 rounded-t-xl">
          {!isEditing ? (
            <div className="absolute inset-0 bg-cover bg-center rounded-t-xl" 
                 style={{ backgroundImage: user?.coverImage ? `url(${user.coverImage})` : 'none' }}>
            </div>
          ) : (
            <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black hover:bg-opacity-30 transition-all rounded-t-xl group">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                <Camera size={24} />
                <span className="font-medium">Change Cover Image</span>
              </div>
            </label>
          )}
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-b-xl shadow-lg -mt-16 relative">
          <div className="px-8 pt-20 pb-8">
            
            {/* Avatar */}
            <div className="absolute -top-20 left-8">
              <div className="relative">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&size=160&background=0077b5&color=fff`}
                  alt={user?.name}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer hover:bg-opacity-70 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Camera size={24} className="text-white" />
                  </label>
                )}
              </div>
            </div>

            {/* Edit/Save Buttons */}
            <div className="flex justify-end mb-6">
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 px-4 py-2 border-2 border-linkedin-500 text-linkedin-500 rounded-lg hover:bg-linkedin-50 transition-colors font-medium"
                >
                  <Edit2 size={18} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors font-medium shadow-md"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div>
              {!isEditing ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.name}</h1>
                  
                  {user?.bio && (
                    <p className="text-gray-700 mb-4 text-base leading-relaxed max-w-3xl">
                      {user.bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                    {user?.company && (
                      <div className="flex items-center space-x-2">
                        <Briefcase size={18} />
                        <span>{user.company}</span>
                      </div>
                    )}
                    {user?.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin size={18} />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Mail size={18} />
                      <span>{user?.email}</span>
                    </div>
                    {user?.website && (
                      <div className="flex items-center space-x-2">
                        <Globe size={18} />
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-linkedin-500 hover:underline">
                          {user.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar size={18} />
                      <span>Joined {format(new Date(user?.createdAt || Date.now()), 'MMMM yyyy')}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                      maxLength="200"
                    />
                    <p className="text-sm text-gray-500 mt-1 text-right">
                      {editForm.bio.length}/200
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={editForm.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                        placeholder="Your company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={editForm.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-3xl font-bold text-linkedin-500">{stats.posts}</p>
                  <p className="text-sm text-gray-600 mt-1">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-linkedin-500">{stats.likes}</p>
                  <p className="text-sm text-gray-600 mt-1">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-linkedin-500">{stats.comments}</p>
                  <p className="text-sm text-gray-600 mt-1">Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-linkedin-500">{stats.connections}</p>
                  <p className="text-sm text-gray-600 mt-1">Connections</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6 bg-white rounded-xl shadow">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-linkedin-500 text-linkedin-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Posts ({stats.posts})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'activity'
                    ? 'border-linkedin-500 text-linkedin-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'about'
                    ? 'border-linkedin-500 text-linkedin-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <>
                {posts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📝</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-6">Start sharing your thoughts with the community!</p>
                    <a
                      href="/"
                      className="inline-block px-6 py-3 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors font-medium shadow-md"
                    >
                      Create Your First Post
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onPostUpdated={handlePostUpdated}
                        onPostDeleted={handlePostDeleted}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Activity Coming Soon</h3>
                <p className="text-gray-600">Track your interactions and engagement here.</p>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Bio</p>
                    <p className="text-gray-900">{user?.bio || 'No bio added yet'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Company</p>
                      <p className="text-gray-900">{user?.company || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                      <p className="text-gray-900">{user?.location || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Website</p>
                    {user?.website ? (
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-linkedin-500 hover:underline">
                        {user.website}
                      </a>
                    ) : (
                      <p className="text-gray-900">Not specified</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Member Since</p>
                    <p className="text-gray-900">{format(new Date(user?.createdAt || Date.now()), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;