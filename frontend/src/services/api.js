// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add token to requests if available
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// // Auth API
// export const authAPI = {
//   signup: (data) => api.post('/auth/signup', data),
//   login: (data) => api.post('/auth/login', data),
//   getMe: () => api.get('/auth/me'),
//   logout: () => api.post('/auth/logout'),
// };

// // Posts API
// export const postsAPI = {
//   getAllPosts: () => api.get('/posts'),
//   createPost: (data) => api.post('/posts', data),
//   updatePost: (id, data) => api.put(`/posts/${id}`, data),
//   deletePost: (id) => api.delete(`/posts/${id}`),
//   likePost: (id) => api.post(`/posts/${id}/like`),
//   addComment: (id, data) => api.post(`/posts/${id}/comment`, data),
//   deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`),
// };

// // Users API
// export const usersAPI = {
//   // Get all connections
//   getConnections: () => api.get('/users/connections'),
  
//   // Get suggested users
//   getSuggestedUsers: () => api.get('/users/suggestions'),
  
//   // Get pending requests
//   getPendingRequests: () => api.get('/users/requests/pending'),
  
//   // Send connection request
//   sendConnectionRequest: (userId) => 
//     api.post(`/users/${userId}/connect`),
  
//   // Accept connection request
//   acceptConnectionRequest: (requestId) => 
//     api.post(`/users/requests/${requestId}/accept`),
  
//   // Reject connection request
//   rejectConnectionRequest: (requestId) => 
//     api.post(`/users/requests/${requestId}/reject`),
  
//   // Remove connection
//   removeConnection: (connectionId) => 
//     api.delete(`/users/connections/${connectionId}`),
  
//   // Search users
//   searchUsers: (query) => 
//     api.get('/users/search', { params: { q: query } })
// };

// // Messaging API
// export const messagingAPI = {
//   // Get all conversations
//   getConversations: () => api.get('/messaging/conversations'),
  
//   // Get messages for a conversation
//   getMessages: (conversationId) => 
//     api.get(`/messaging/conversations/${conversationId}/messages`),
  
//   // Send a message
//   sendMessage: (conversationId, content) => 
//     api.post(`/messaging/conversations/${conversationId}/messages`, { content }),
  
//   // Start new conversation
//   startNewConversation: (userId, content) => 
//     api.post('/messaging/conversations', { userId, content }),
  
//   // Search users
//   searchUsers: (query) => 
//     api.get('/users/search', { params: { q: query } }),
  
//   // Mark as read
//   markAsRead: (conversationId) => 
//     api.put(`/messaging/conversations/${conversationId}/read`)
// };

// // Jobs API
// export const jobsAPI = {
//   getAllJobs: (params = {}) => {
//     // Handle search query separately
//     const { q, ...restParams } = params;
//     const queryParams = new URLSearchParams();
    
//     // Add search query if it exists
//     if (q) queryParams.append('search', q);
    
//     // Add other params
//     Object.entries(restParams).forEach(([key, value]) => {
//       if (value !== undefined && value !== '') {
//         queryParams.append(key, value);
//       }
//     });
    
//     return api.get(`/jobs?${queryParams.toString()}`);
//   },
//   getJob: (id) => api.get(`/jobs/${id}`),
//   createJob: (data) => api.post('/jobs', data),
//   updateJob: (id, data) => api.put(`/jobs/${id}`, data),
//   deleteJob: (id) => api.delete(`/jobs/${id}`),
//   applyToJob: (id) => api.post(`/jobs/${id}/apply`),
//   saveJob: (id) => api.post(`/jobs/${id}/save`)
// };

// export default api;


import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Posts API
export const postsAPI = {
  getAllPosts: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  addComment: (id, data) => api.post(`/posts/${id}/comment`, data),
  updateComment: (postId, commentId, data) => api.put(`/posts/${postId}/comment/${commentId}`, data),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`),
  sharePost: (id) => api.post(`/posts/${id}/share`),
  reportPost: (id, reason) => api.post(`/posts/${id}/report`, { reason }),
  savePost: (id) => api.post(`/posts/${id}/save`),
  unsavePost: (id) => api.delete(`/posts/${id}/save`),
};

// Users API
export const usersAPI = {
  // Profile
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadCover: (formData) => api.post('/users/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Connections
  getConnections: () => api.get('/users/connections'),
  getSuggestedUsers: () => api.get('/users/suggestions'),
  getPendingRequests: () => api.get('/users/requests/pending'),
  sendConnectionRequest: (userId) => api.post(`/users/${userId}/connect`),
  acceptConnectionRequest: (requestId) => api.post(`/users/requests/${requestId}/accept`),
  rejectConnectionRequest: (requestId) => api.post(`/users/requests/${requestId}/reject`),
  removeConnection: (connectionId) => api.delete(`/users/connections/${connectionId}`),
  
  // Search
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  
  // User posts
  getUserPosts: (userId) => api.get(`/users/${userId}/posts`),
};

// Messaging API
export const messagingAPI = {
  // Conversations
  getConversations: () => api.get('/messaging/conversations'),
  getConversation: (conversationId) => api.get(`/messaging/conversations/${conversationId}`),
  createConversation: (userId) => api.post('/messaging/conversations', { userId }),
  deleteConversation: (conversationId) => api.delete(`/messaging/conversations/${conversationId}`),
  
  // Messages
  getMessages: (conversationId, params) => api.get(`/messaging/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, content) => api.post(`/messaging/conversations/${conversationId}/messages`, { content }),
  deleteMessage: (conversationId, messageId) => api.delete(`/messaging/conversations/${conversationId}/messages/${messageId}`),
  
  // Actions
  startNewConversation: (userId, content) => api.post('/messaging/conversations', { userId, content }),
  markAsRead: (conversationId) => api.put(`/messaging/conversations/${conversationId}/read`),
  markAsUnread: (conversationId) => api.put(`/messaging/conversations/${conversationId}/unread`),
  
  // Search
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
  
  // Typing indicator (if implemented)
  sendTypingIndicator: (conversationId) => api.post(`/messaging/conversations/${conversationId}/typing`),
};

// Jobs API
export const jobsAPI = {
  // Get jobs
  getAllJobs: (params = {}) => {
    const { q, ...restParams } = params;
    const queryParams = new URLSearchParams();
    
    if (q) queryParams.append('search', q);
    
    Object.entries(restParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    return api.get(`/jobs?${queryParams.toString()}`);
  },
  getJob: (id) => api.get(`/jobs/${id}`),
  
  // Job actions
  applyToJob: (id, data) => api.post(`/jobs/${id}/apply`, data),
  saveJob: (id) => api.post(`/jobs/${id}/save`),
  unsaveJob: (id) => api.delete(`/jobs/${id}/save`),
  
  // User's jobs
  getAppliedJobs: () => api.get('/jobs/applied'),
  getSavedJobs: () => api.get('/jobs/saved'),
  
  // Employer actions (if user can post jobs)
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getJobApplications: (id) => api.get(`/jobs/${id}/applications`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Analytics API (Optional)
export const analyticsAPI = {
  getProfileViews: () => api.get('/analytics/profile-views'),
  getPostAnalytics: (postId) => api.get(`/analytics/posts/${postId}`),
  getDashboard: () => api.get('/analytics/dashboard'),
};

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  updatePrivacy: (data) => api.put('/settings/privacy', data),
  updateNotifications: (data) => api.put('/settings/notifications', data),
  deleteAccount: (password) => api.delete('/settings/account', { data: { password } }),
};

// Helper function to handle file uploads with progress
export const uploadWithProgress = (endpoint, file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      if (onProgress) {
        onProgress(percentCompleted);
      }
    }
  });
};

// Export the axios instance for custom requests
export default api;