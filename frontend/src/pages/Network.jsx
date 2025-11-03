import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserMinus, MessageSquare, Search, X, Check, Clock } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Network() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [connectingUsers, setConnectingUsers] = useState(new Set());

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);

      const [connectionsRes, suggestionsRes, pendingRes] = await Promise.all([
        usersAPI.getConnections().catch(() => ({ data: [] })),
        usersAPI.getSuggestedUsers().catch(() => ({ data: [] })),
        usersAPI.getPendingRequests().catch(() => ({ data: [] }))
      ]);
      
      setConnections(connectionsRes.data || []);
      setSuggestedUsers(suggestionsRes.data || []);
      setPendingRequests(pendingRes.data || []);
    } catch (error) {
      console.error('Error fetching network data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    if (connectingUsers.has(userId)) return;

    setConnectingUsers(prev => new Set(prev).add(userId));

    try {
      const userToConnect = suggestedUsers.find(u => u._id === userId);
      
      // Optimistic update
      setSuggestedUsers(prev => prev.filter(u => u._id !== userId));
      
      await usersAPI.sendConnectionRequest(userId);
      
      toast.success(`Connection request sent to ${userToConnect?.name}!`);
      
      // Refresh data
      await fetchNetworkData();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
      
      // Revert on error
      await fetchNetworkData();
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await usersAPI.acceptConnectionRequest(requestId);
      toast.success('Connection request accepted!');
      await fetchNetworkData();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await usersAPI.rejectConnectionRequest(requestId);
      toast.success('Connection request rejected');
      await fetchNetworkData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) {
      return;
    }

    try {
      await usersAPI.removeConnection(connectionId);
      toast.success('Connection removed');
      await fetchNetworkData();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Failed to remove connection');
    }
  };

  const handleSearch = async (query) => {
    setSearchTerm(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await usersAPI.searchUsers(query);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleMessageUser = (userId) => {
    navigate('/messages', { state: { userId } });
  };

  const filteredConnections = connections.filter(conn =>
    conn.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className={`rounded-xl shadow-sm p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4 md:mb-0`}>My Network</h1>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Manage your connections and grow your professional network</p>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className={`mt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Search Results</h3>
              <div className="space-y-2">
                {searchResults.map((searchUser) => (
                  <div key={searchUser._id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-center space-x-3">
                      <img
                        src={searchUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(searchUser.name)}&size=40&background=0077b5&color=fff`}
                        alt={searchUser.name}
                        className={`w-12 h-12 rounded-full border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                      />
                      <div>
                        <Link 
                          to={`/profile/${searchUser._id}`} 
                          className={`font-medium ${theme === 'dark' ? 'text-white hover:text-linkedin-400' : 'text-gray-900 hover:text-linkedin-500'}`}
                        >
                          {searchUser.name}
                        </Link>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {searchUser.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConnect(searchUser._id)}
                      disabled={connectingUsers.has(searchUser._id)}
                      className="px-4 py-2 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {connectingUsers.has(searchUser._id) ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={`rounded-xl shadow-sm overflow-hidden mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'suggestions'
                    ? 'border-linkedin-500 text-linkedin-600 dark:text-linkedin-400'
                    : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:border-gray-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserPlus size={18} />
                  <span>Suggestions ({suggestedUsers.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('connections')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'connections'
                    ? 'border-linkedin-500 text-linkedin-600 dark:text-linkedin-400'
                    : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:border-gray-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users size={18} />
                  <span>Connections ({connections.length})</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pending'
                    ? 'border-linkedin-500 text-linkedin-600 dark:text-linkedin-400'
                    : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300 hover:border-gray-500' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Clock size={18} />
                  <span>Pending ({pendingRequests.length})</span>
                </div>
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-linkedin-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading network...</p>
            </div>
          ) : (
            <div className="p-6">
              {/* Suggestions Tab */}
              {activeTab === 'suggestions' && (
                <>
                  {suggestedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {suggestedUsers.map((suggestedUser) => (
                        <div key={suggestedUser._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                          <div className="p-6">
                            <div className="flex flex-col items-center text-center">
                              <img
                                src={suggestedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestedUser.name)}&size=80&background=0077b5&color=fff`}
                                alt={suggestedUser.name}
                                className="w-20 h-20 rounded-full border-2 border-gray-200 shadow-sm mb-3"
                              />
                              <Link to={`/profile/${suggestedUser._id}`} className="font-semibold text-gray-900 hover:text-linkedin-500 mb-1">
                                {suggestedUser.name}
                              </Link>
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {suggestedUser.headline || suggestedUser.email}
                              </p>
                              <button
                                onClick={() => handleConnect(suggestedUser._id)}
                                disabled={connectingUsers.has(suggestedUser._id)}
                                className="w-full flex items-center justify-center px-4 py-2.5 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                {connectingUsers.has(suggestedUser._id) ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Connecting...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Connect
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No suggestions available</h3>
                      <p className="text-gray-600">Check back later for new connection suggestions</p>
                    </div>
                  )}
                </>
              )}

              {/* Connections Tab */}
              {activeTab === 'connections' && (
                <>
                  {filteredConnections.length > 0 ? (
                    <div className="space-y-4">
                      {filteredConnections.map((connection) => (
                        <div key={connection._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <img
                              src={connection.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.name)}&size=64&background=0077b5&color=fff`}
                              alt={connection.name}
                              className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                            />
                            <div>
                              <Link to={`/profile/${connection._id}`} className="font-semibold text-gray-900 hover:text-linkedin-500">
                                {connection.name}
                              </Link>
                              <p className="text-sm text-gray-600">{connection.headline || connection.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleMessageUser(connection._id)}
                              className="px-4 py-2 border border-linkedin-500 text-linkedin-500 rounded-lg hover:bg-linkedin-50 transition-colors font-medium flex items-center space-x-2"
                            >
                              <MessageSquare size={18} />
                              <span>Message</span>
                            </button>
                            <button
                              onClick={() => handleRemoveConnection(connection._id)}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove connection"
                            >
                              <UserMinus size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No connections yet</h3>
                      <p className="text-gray-600 mb-4">Start building your professional network</p>
                      <button
                        onClick={() => setActiveTab('suggestions')}
                        className="px-6 py-2 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors font-medium"
                      >
                        Find people to connect with
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Pending Requests Tab */}
              {activeTab === 'pending' && (
                <>
                  {pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div key={request._id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-4">
                            <img
                              src={request.from?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.from?.name)}&size=64&background=0077b5&color=fff`}
                              alt={request.from?.name}
                              className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                            />
                            <div>
                              <Link to={`/profile/${request.from?._id}`} className="font-semibold text-gray-900 hover:text-linkedin-500">
                                {request.from?.name}
                              </Link>
                              <p className="text-sm text-gray-600">{request.from?.headline || request.from?.email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Sent {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAcceptRequest(request._id)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x-2"
                            >
                              <Check size={18} />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2"
                            >
                              <X size={18} />
                              <span>Ignore</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                      <p className="text-gray-600">Connection requests will appear here</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}