
import React, { useState } from 'react';
import { Post, User } from '../types';
import { Heart, MessageSquare, Share2, Plus, Search, X, Send } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface CommunityProps {
  user: User;
  posts: Post[];
  onAddPost: (content: string, tag: string) => void;
  lang: Language;
}

const Community: React.FC<CommunityProps> = ({ user, posts, onAddPost, lang }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'squad' | 'style'>('all');
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTag, setNewPostTag] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const t = translations[lang];

  const handleLike = (id: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) {
        newLiked.delete(id);
    } else {
        newLiked.add(id);
    }
    setLikedPosts(newLiked);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPostContent) return;
      onAddPost(newPostContent, newPostTag || 'General');
      setNewPostContent('');
      setNewPostTag('');
      setShowPostModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-space-900 relative">
      {/* Header */}
      <div className="p-6 pb-2 pt-10">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t.forumTitle}</h2>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Search size={20} className="text-slate-300" />
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-4">
            <button 
                onClick={() => setActiveTab('all')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-neon-blue text-white shadow-lg shadow-neon-blue/25' : 'bg-white/5 text-slate-400 border border-white/10'}`}
            >
                {t.allPosts}
            </button>
            <button 
                onClick={() => setActiveTab('style')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'style' ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/25' : 'bg-white/5 text-slate-400 border border-white/10'}`}
            >
                {user.learningStyle} {t.squad}
            </button>
            <button 
                onClick={() => setActiveTab('squad')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'squad' ? 'bg-neon-cyan text-black shadow-lg shadow-neon-cyan/25' : 'bg-white/5 text-slate-400 border border-white/10'}`}
            >
                {t.myGroups}
            </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
          {posts.map((post) => (
              <div key={post.id} className="bg-space-800/50 backdrop-blur-sm border border-white/5 p-5 rounded-3xl shadow-xl animate-float" style={{ animationDuration: '0s' }}>
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-3">
                      <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      <div className="flex-1">
                          <h3 className="font-bold text-sm text-slate-200">{post.author}</h3>
                          <p className="text-xs text-slate-500">{post.timestamp} • <span className="text-neon-cyan">{post.tag}</span></p>
                      </div>
                  </div>
                  
                  {/* Content */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {post.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex gap-6">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 transition-colors group ${likedPosts.has(post.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                          >
                              <Heart size={18} className={likedPosts.has(post.id) ? "fill-current" : "group-hover:fill-red-400"} />
                              <span className="text-xs">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                          </button>
                          <button className="flex items-center gap-2 text-slate-400 hover:text-neon-blue transition-colors">
                              <MessageSquare size={18} />
                              <span className="text-xs">{post.comments}</span>
                          </button>
                      </div>
                      <button className="text-slate-400 hover:text-white">
                          <Share2 size={18} />
                      </button>
                  </div>
              </div>
          ))}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setShowPostModal(true)}
        className="absolute bottom-24 right-6 rtl:left-6 rtl:right-auto w-14 h-14 rounded-full bg-gradient-to-r from-neon-cyan to-neon-blue flex items-center justify-center shadow-lg shadow-neon-blue/40 text-white hover:scale-105 active:scale-95 transition-transform z-30"
      >
          <Plus size={28} />
      </button>

      {/* New Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="bg-space-800 border border-white/10 w-full max-w-md rounded-3xl p-6 relative">
                <button 
                    onClick={() => setShowPostModal(false)}
                    className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-slate-400 hover:text-white"
                >
                    <X size={24} />
                </button>
                <h3 className="text-xl font-bold mb-4">{t.createPost}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea 
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        placeholder={t.postPlaceholder}
                        className="w-full h-32 bg-space-700 border border-white/10 rounded-xl p-4 focus:border-neon-cyan focus:outline-none text-white resize-none"
                    />
                    <div>
                        <label className="text-xs text-slate-400 ml-1">{t.tag}</label>
                        <input 
                            type="text"
                            value={newPostTag}
                            onChange={e => setNewPostTag(e.target.value)}
                            placeholder="e.g. Physics"
                            className="w-full bg-space-700 border border-white/10 rounded-xl p-3 mt-1 focus:border-neon-cyan focus:outline-none text-white"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!newPostContent}
                        className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        <Send size={18} className="rtl:rotate-180" />
                        {t.postBtn}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Community;
