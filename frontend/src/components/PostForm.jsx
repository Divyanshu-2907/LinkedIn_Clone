import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  Video,
  FileText,
  Calendar,
  Smile,
  MapPin,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const PostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const MAX_CHARS = 500;

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('postDraft');
    if (draft) {
      setContent(draft);
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim()) {
        localStorage.setItem('postDraft', content);
      } else {
        localStorage.removeItem('postDraft');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content]);

  // Update character count
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    if (content.length > MAX_CHARS) {
      toast.error(`Post cannot exceed ${MAX_CHARS} characters`);
      return;
    }

    setLoading(true);
    try {
      const { data } = await postsAPI.createPost({ content, image });
      
      // Clear form and draft
      setContent('');
      setImage('');
      setShowImageInput(false);
      setShowOptions(false);
      localStorage.removeItem('postDraft');
      
      toast.success('🎉 Post published successfully!');
      
      if (onPostCreated) {
        onPostCreated(data);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create post';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setShowImageInput(true);
        setImagePreviewError(false);
      };
      reader.readAsDataURL(file);
      
      // TODO: Upload to server and get URL
      toast.success('Image preview loaded');
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    setShowImageInput(false);
    setImagePreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + emoji + content.slice(end);
    setContent(newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💡', '👏', '🚀', '✨', '💪', '🌟'];

  const clearDraft = () => {
    setContent('');
    localStorage.removeItem('postDraft');
    toast.success('Draft cleared');
  };

  const getCharCountColor = () => {
    const percentage = (charCount / MAX_CHARS) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-500';
    return 'text-gray-500';
  };

  const isPostDisabled = loading || !content.trim() || content.length > MAX_CHARS;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Sparkles size={20} className="text-linkedin-500" />
          <span>Create a post</span>
        </h3>
        {content.trim() && (
          <button
            onClick={clearDraft}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Clear draft
          </button>
        )}
      </div>

      {/* Post Form */}
      <div className="flex items-start space-x-3">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&size=48&background=0077b5&color=fff`}
          alt={user?.name}
          className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
        />
        
        <form onSubmit={handleSubmit} className="flex-1">
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to talk about?"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent resize-none transition-all min-h-[80px] max-h-[300px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={loading}
              maxLength={MAX_CHARS + 50} // Allow some overflow for warning
            />
            
            {/* Character Counter */}
            <div className="absolute bottom-3 right-3">
              <span className={`text-xs font-medium ${getCharCountColor()}`}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Character Limit Progress Bar */}
          {charCount > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    charCount > MAX_CHARS
                      ? 'bg-red-500'
                      : charCount > MAX_CHARS * 0.9
                      ? 'bg-orange-500'
                      : 'bg-linkedin-500'
                  }`}
                  style={{ width: `${Math.min((charCount / MAX_CHARS) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          {charCount > MAX_CHARS && (
            <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">
                Post exceeds character limit by {charCount - MAX_CHARS}
              </span>
            </div>
          )}

          {/* Image Preview */}
          {image && !imagePreviewError && (
            <div className="mt-3 relative group">
              <img
                src={image}
                alt="Preview"
                className="w-full max-h-96 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                onError={() => {
                  setImagePreviewError(true);
                  toast.error('Failed to load image preview');
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                title="Remove image"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Image URL Input */}
          {showImageInput && !image && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Enter image URL or upload file below"
                  className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-linkedin-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowImageInput(false)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Cancel"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-linkedin-500 hover:bg-linkedin-50 dark:hover:bg-linkedin-900/20 transition-colors cursor-pointer"
              >
                <ImageIcon size={20} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Upload from device (Max 5MB)
                </span>
              </label>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Emojis</span>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="text-2xl hover:bg-white dark:hover:bg-gray-600 p-2 rounded transition-colors"
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              {/* Photo Button */}
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showImageInput
                    ? 'bg-linkedin-100 dark:bg-linkedin-900/20 text-linkedin-600 dark:text-linkedin-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Add photo"
              >
                <ImageIcon size={20} />
                <span className="text-sm font-medium hidden sm:inline">Photo</span>
              </button>

              {/* Emoji Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showEmojiPicker
                    ? 'bg-linkedin-100 dark:bg-linkedin-900/20 text-linkedin-600 dark:text-linkedin-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Add emoji"
              >
                <Smile size={20} />
                <span className="text-sm font-medium hidden sm:inline">Emoji</span>
              </button>

              {/* More Options */}
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                title="More options"
              >
                <span className="text-lg font-bold">•••</span>
              </button>

              {/* Additional Options (Coming Soon) */}
              {showOptions && (
                <div className="absolute mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                  <button
                    type="button"
                    disabled
                    className="flex items-center space-x-3 px-4 py-2 text-gray-400 cursor-not-allowed w-full"
                  >
                    <Video size={18} />
                    <span className="text-sm">Video (Coming Soon)</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex items-center space-x-3 px-4 py-2 text-gray-400 cursor-not-allowed w-full"
                  >
                    <FileText size={18} />
                    <span className="text-sm">Document (Coming Soon)</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex items-center space-x-3 px-4 py-2 text-gray-400 cursor-not-allowed w-full"
                  >
                    <MapPin size={18} />
                    <span className="text-sm">Location (Coming Soon)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Post Button */}
            <button
              type="submit"
              disabled={isPostDisabled}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                isPostDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-linkedin-500 text-white hover:bg-linkedin-600 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Suggestions (Optional Feature) */}
      {content.length > 50 && content.length < 100 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
          <TrendingUp size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-medium mb-1">
              💡 Tip for better engagement
            </p>
            <p className="text-xs text-blue-700">
              Posts between 100-250 characters tend to get more engagement. Consider expanding your thoughts!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostForm;