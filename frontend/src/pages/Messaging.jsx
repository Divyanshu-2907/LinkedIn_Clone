import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Send, 
  ChevronLeft,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  X,
  Plus,
  Image as ImageIcon,
  File,
  Mic
} from 'lucide-react';
import { messagingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Messaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Common emojis
  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💡', '👏', '🚀', '✨', '💪', '🌟', '😍', '🤔', '👌', '🙌'];

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagingAPI.getConversations();
      setConversations(response.data || []);
      
      if (selectedConversation && !selectedConversation.isNew) {
        const updatedConv = response.data?.find(c => c._id === selectedConversation._id);
        if (updatedConv) {
          setSelectedConversation(updatedConv);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await messagingAPI.getMessages(conversationId);
      setSelectedConversation(prev => ({
        ...prev,
        messages: response.data.messages || []
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation || sending) return;

    const content = message.trim();
    setMessage('');
    setSending(true);

    try {
      if (selectedConversation.isNew) {
        const response = await messagingAPI.startNewConversation(
          selectedConversation.user._id,
          content
        );
        
        toast.success('Conversation started!');
        await fetchConversations();
        
        const newConv = response.data.conversation;
        setSelectedConversation({
          ...newConv,
          messages: response.data.messages || []
        });
      } else {
        const tempId = 'temp-' + Date.now();
        const tempMessage = {
          _id: tempId,
          content,
          sender: user._id,
          timestamp: new Date().toISOString(),
          status: 'sending',
          isTemp: true
        };

        setSelectedConversation(prev => ({
          ...prev,
          messages: [...(prev.messages || []), tempMessage],
          lastMessage: content,
          timestamp: new Date().toISOString()
        }));

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        const response = await messagingAPI.sendMessage(selectedConversation._id, content);
        
        setSelectedConversation(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg._id === tempId ? { ...response.data, status: 'sent' } : msg
          )
        }));
      }
      
      await fetchConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      setSelectedConversation(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.isTemp ? { ...msg, status: 'failed' } : msg
        )
      }));
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  // Search users for new conversation
  const handleSearchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await messagingAPI.searchUsers(query);
      setSearchResults(response.data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    }
  };

  // Start a new conversation
  const startNewConversation = (selectedUser) => {
    setSelectedConversation({
      _id: 'new',
      isNew: true,
      user: {
        _id: selectedUser._id,
        name: selectedUser.name,
        avatar: selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&size=40&background=0077b5&color=fff`,
        status: 'offline'
      },
      messages: [],
      lastMessage: '',
      timestamp: new Date().toISOString(),
      unreadCount: 0
    });
    setShowNewChatModal(false);
    setSearchResults([]);
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    
    if (conversation.unreadCount > 0) {
      try {
        await messagingAPI.markAsRead(conversation._id);
        setConversations(prev => 
          prev.map(c => 
            c._id === conversation._id ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  // Handle file attachment
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      toast.success('File upload feature coming soon!');
    }
    setShowAttachMenu(false);
  };

  // Insert emoji
  const insertEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    return date.toLocaleDateString();
  };

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get message status icon
  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3" />;
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-linkedin-400" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation?._id && !selectedConversation.isNew) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation?._id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Filter conversations
  const filteredConversations = conversations.filter(conv => 
    conv.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-[calc(100vh-64px)] flex">
        {/* Sidebar */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-gray-200 bg-white`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              <button 
                onClick={() => setShowNewChatModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="New conversation"
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-linkedin-500 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Loading conversations...</p>
                </div>
              </div>
            ) : filteredConversations.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredConversations.map((conversation) => (
                  <li 
                    key={conversation._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedConversation?._id === conversation._id ? 'bg-linkedin-50 border-l-4 border-linkedin-500' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 relative">
                        <img
                          className="h-12 w-12 rounded-full border-2 border-gray-200"
                          src={conversation.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.user?.name)}&size=48&background=0077b5&color=fff`}
                          alt={conversation.user?.name}
                        />
                        {conversation.user?.status === 'online' && (
                          <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {conversation.user?.name}
                          </p>
                          <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTimestamp(conversation.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-linkedin-500 text-white text-xs font-semibold flex-shrink-0 ml-2">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No conversations found' : 'No messages yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Start a conversation to begin messaging'}
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors font-medium"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area - continued in next message due to length */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200 flex items-center bg-white shadow-sm">
              <button 
                className="md:hidden mr-3 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setSelectedConversation(null)}
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative">
                  <img
                    className="h-10 w-10 rounded-full border-2 border-gray-200"
                    src={selectedConversation.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.user?.name)}&size=40&background=0077b5&color=fff`}
                    alt={selectedConversation.user?.name}
                  />
                  {selectedConversation.user?.status === 'online' && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {selectedConversation.user?.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {selectedConversation.user?.status === 'online' 
                      ? 'Active now' 
                      : selectedConversation.user?.lastSeen 
                        ? `Last seen ${formatTimestamp(selectedConversation.user.lastSeen)}`
                        : 'Offline'}
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {selectedConversation.messages?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedConversation.messages?.map((msg, index) => {
                    const isMyMessage = msg.sender === user._id || msg.sender === 'me';
                    const showAvatar = !isMyMessage && (
                      index === 0 || 
                      selectedConversation.messages[index - 1]?.sender !== msg.sender
                    );

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                      >
                        {!isMyMessage && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <img
                                src={selectedConversation.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.user?.name)}&size=32&background=0077b5&color=fff`}
                                alt={selectedConversation.user?.name}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8"></div>
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl ${
                              isMyMessage
                                ? 'bg-linkedin-500 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                            }`}
                          >
                            <p className="text-sm break-words">{msg.content || msg.text}</p>
                          </div>
                          <div className={`flex items-center space-x-1 mt-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            <p className="text-xs text-gray-500">
                              {formatMessageTime(msg.timestamp || msg.createdAt)}
                            </p>
                            {isMyMessage && (
                              <span className="text-gray-500">
                                {getMessageStatusIcon(msg.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  {showAttachMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                      >
                        <ImageIcon size={18} />
                        <span className="text-sm">Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Document feature coming soon!')}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                      >
                        <File size={18} />
                        <span className="text-sm">Document</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Voice message feature coming soon!')}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                      >
                        <Mic size={18} />
                        <span className="text-sm">Voice</span>
                      </button>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    disabled={sending}
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                  >
                    <Smile className="h-5 w-5" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Quick Emojis</span>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-2">
                        {commonEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="text-2xl hover:bg-gray-100 p-2 rounded transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!message.trim() || sending}
                  className="p-2.5 rounded-lg text-white bg-linkedin-500 hover:bg-linkedin-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center p-8 max-w-md">
              <div className="w-20 h-20 bg-linkedin-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-10 w-10 text-linkedin-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Messages</h3>
              <p className="text-gray-600 mb-6">
                Select a conversation from the sidebar to start messaging, or create a new conversation to connect with someone.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-6 py-3 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                Start New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">New Conversation</h3>
                <button
                  onClick={() => {
                    setShowNewChatModal(false);
                    setSearchResults([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search people..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent"
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((searchUser) => (
                    <button
                      key={searchUser._id}
                      onClick={() => startNewConversation(searchUser)}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <img
                        src={searchUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(searchUser.name)}&size=48&background=0077b5&color=fff`}
                        alt={searchUser.name}
                        className="h-12 w-12 rounded-full border-2 border-gray-200"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">{searchUser.name}</p>
                        <p className="text-sm text-gray-600">{searchUser.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-600">
                    Search for people to start a conversation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}