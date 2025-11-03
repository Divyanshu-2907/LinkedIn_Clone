import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  ThumbsUp, 
  MessageCircle, 
  Trash2, 
  Edit2, 
  Send, 
  MoreHorizontal,
  Share2,
  Bookmark,
  Copy,
  Flag,
  Eye,
  Heart,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showAllContent, setShowAllContent] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [commentToEdit, setCommentToEdit] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  
  const menuRef = useRef(null);
  const shareMenuRef = useRef(null);

  const isAuthor = user?._id === post.user._id;
  const isLiked = post.likes?.includes(user?._id);
  const contentLength = post.content?.length || 0;
  const shouldTruncate = contentLength > 300;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    setLikeAnimation(true);
    
    try {
      const { data } = await postsAPI.likePost(post._id);
      if (onPostUpdated) {
        onPostUpdated(data);
      }
      
      // Show different message based on action
      if (!isLiked) {
        toast.success('👍 Liked!', { duration: 2000 });
      }
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
      setTimeout(() => setLikeAnimation(false), 300);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await postsAPI.deletePost(post._id);
      toast.success('Post deleted successfully');
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!editContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    if (editContent.length > 500) {
      toast.error('Post cannot exceed 500 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await postsAPI.updatePost(post._id, { content: editContent });
      toast.success('Post updated successfully');
      setIsEditing(false);
      setShowMenu(false);
      if (onPostUpdated) {
        onPostUpdated(data);
      }
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const { data } = await postsAPI.addComment(post._id, { content: commentContent });
      setCommentContent('');
      toast.success('💬 Comment added');
      if (onPostUpdated) {
        onPostUpdated(data);
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const { data } = await postsAPI.deleteComment(post._id, commentId);
      toast.success('Comment deleted');
      if (onPostUpdated) {
        onPostUpdated(data);
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const { data } = await postsAPI.updateComment(post._id, commentId, { content: editCommentContent });
      toast.success('Comment updated');
      setCommentToEdit(null);
      setEditCommentContent('');
      if (onPostUpdated) {
        onPostUpdated(data);
      }
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success('Link copied to clipboard!');
    setShowShareMenu(false);
  };

  const handleSavePost = () => {
    // TODO: Implement save functionality
    toast.success('Post saved! (Feature coming soon)');
    setShowMenu(false);
  };

  const handleReportPost = () => {
    // TODO: Implement report functionality
    toast.success('Post reported. (Feature coming soon)');
    setShowMenu(false);
  };

  const getDisplayContent = () => {
    if (!shouldTruncate || showAllContent) {
      return post.content;
    }
    return post.content.slice(0, 300) + '...';
  };

  const renderContent = (content) => {
    // Simple hashtag and mention detection
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-linkedin-500 hover:underline cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      if (word.startsWith('@')) {
        return (
          <span key={index} className="text-linkedin-500 hover:underline cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md mb-4">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <img
              src={post.userAvatar || post.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.name)}&size=48&background=0077b5&color=fff`}
              alt={post.userName || post.user?.name}
              className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white hover:text-linkedin-500 dark:hover:text-linkedin-400 cursor-pointer transition-colors">
                {post.userName || post.user?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="More options"
            >
              <MoreHorizontal size={20} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-10">
                {isAuthor ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <Edit2 size={18} />
                      <span className="text-sm font-medium">Edit post</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                      <span className="text-sm font-medium">Delete post</span>
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  </>
                ) : null}
                
                <button
                  onClick={handleSavePost}
                  className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Bookmark size={18} />
                  <span className="text-sm font-medium">Save post</span>
                </button>
                
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Copy size={18} />
                  <span className="text-sm font-medium">Copy link</span>
                </button>

                {!isAuthor && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                      onClick={handleReportPost}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <Flag size={18} />
                      <span className="text-sm font-medium">Report post</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        {isEditing ? (
          <form onSubmit={handleUpdate} className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="4"
              disabled={loading}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {editContent.length}/500
              </span>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading || !editContent.trim()}
                  className="px-4 py-2 bg-linkedin-500 text-white rounded-lg hover:bg-linkedin-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(post.content);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap mb-2">
              {renderContent(getDisplayContent())}
            </p>
            
            {/* See More/Less Button */}
            {shouldTruncate && (
              <button
                onClick={() => setShowAllContent(!showAllContent)}
                className="text-sm text-linkedin-500 dark:text-linkedin-400 hover:text-linkedin-600 dark:hover:text-linkedin-300 font-medium flex items-center space-x-1"
              >
                <span>{showAllContent ? 'See less' : 'See more'}</span>
                {showAllContent ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </>
        )}
      </div>

      {/* Post Image */}
      {post.image && !imageError && (
        <div className="relative group cursor-pointer">
          <img
            src={post.image}
            alt="Post content"
            className="w-full max-h-[500px] object-cover"
            onError={() => setImageError(true)}
          />
          {/* Image Overlay on Hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div>
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowLikesModal(true)}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-linkedin-500 dark:hover:text-linkedin-400 transition-colors"
        >
          {post.likes?.length > 0 && (
            <div className="flex items-center -space-x-1">
              <div className="w-5 h-5 bg-linkedin-500 rounded-full flex items-center justify-center border-2 border-white">
                <ThumbsUp size={12} className="text-white" fill="white" />
              </div>
            </div>
          )}
          <span className="hover:underline">
            {post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}
          </span>
        </button>
        
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-linkedin-500 dark:hover:text-linkedin-400 hover:underline transition-colors"
        >
          {post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-2 flex items-center space-x-1 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-all ${
            likeAnimation ? 'scale-95' : 'scale-100'
          } ${
            isLiked
              ? 'text-linkedin-500 bg-linkedin-50 dark:bg-linkedin-900/20 hover:bg-linkedin-100 dark:hover:bg-linkedin-900/30'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ThumbsUp 
            size={20} 
            fill={isLiked ? 'currentColor' : 'none'}
            className={likeAnimation ? 'animate-bounce' : ''}
          />
          <span className="font-medium">{isLiked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${
            showComments
              ? 'text-linkedin-500 bg-linkedin-50 dark:bg-linkedin-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <MessageCircle size={20} />
          <span className="font-medium">Comment</span>
        </button>

        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Share2 size={20} />
            <span className="font-medium">Share</span>
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-10">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <Copy size={18} />
                <span className="text-sm font-medium">Copy link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="py-4">
            <div className="flex items-start space-x-2">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&size=32&background=0077b5&color=fff`}
                alt={user?.name}
                className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full pl-4 pr-12 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !commentContent.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-linkedin-500 dark:text-linkedin-400 hover:bg-linkedin-50 dark:hover:bg-linkedin-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {post.comments?.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              post.comments?.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-2 group">
                  <img
                    src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name)}&size=32&background=0077b5&color=fff`}
                    alt={comment.userName || comment.user?.name}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  
                  {commentToEdit === comment._id ? (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-linkedin-500 rounded-lg focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleUpdateComment(comment._id)}
                          className="px-3 py-1 bg-linkedin-500 text-white rounded text-sm hover:bg-linkedin-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setCommentToEdit(null);
                            setEditCommentContent('');
                          }}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                            {comment.userName || comment.user?.name}
                          </h4>
                          <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5 break-words">
                            {comment.content}
                          </p>
                        </div>
                        
                        {user?._id === comment.user?._id && (
                          <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setCommentToEdit(comment._id);
                                setEditCommentContent(comment.content);
                              }}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-linkedin-500 dark:hover:text-linkedin-400 transition-colors"
                              title="Edit comment"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;