import React, { useState } from 'react';
import { GameState, Post } from '../types';
import { Send, Heart, MessageCircle, Share2, Eye, Award, TrendingUp, Sparkles } from 'lucide-react';

interface InstaverseProps {
  gameState: GameState;
  onPostCreated: (postText: string) => Promise<void>;
  isAnalyzing: boolean;
}

const Instaverse: React.FC<InstaverseProps> = ({
  gameState,
  onPostCreated,
  isAnalyzing
}) => {
  const [postText, setPostText] = useState('');
  const { instaverse, posts, trendingTopics } = gameState;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() || isAnalyzing) return;
    await onPostCreated(postText);
    setPostText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Profile & Create Post */}
      <div className="space-y-6 lg:col-span-1">
        {/* Profile Card */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-vought-blue/10 to-transparent rounded-full blur-xl"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-vought-red to-vought-blue flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {instaverse.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-1.5">
                @{instaverse.username}
                {instaverse.verified && (
                  <span className="text-xs bg-vought-blue/20 text-vought-blue px-2 py-0.5 rounded-full border border-vought-blue/30">Onaylı</span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Instaverse Profili</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-4 italic">"{instaverse.bio}"</p>

          <div className="grid grid-cols-3 gap-2 text-center border-t border-vought-border pt-4">
            <div>
              <span className="text-lg font-bold text-white block">{instaverse.followers.toLocaleString()}</span>
              <span className="text-xs text-slate-400">Takipçi</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white block">{instaverse.following.toLocaleString()}</span>
              <span className="text-xs text-slate-400">Takip</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white block">%{instaverse.engagementRate}</span>
              <span className="text-xs text-slate-400">Etkileşim</span>
            </div>
          </div>
        </div>

        {/* Create Post Form */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6">
          <h3 className="text-md font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-vought-blue" /> Yeni Gönderi Paylaş
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Bugün ne düşünüyorsun? Vought hakkında bir şeyler yaz, gücünü göster ya da sitem et..."
              maxLength={280}
              rows={4}
              className="w-full bg-vought-dark border border-vought-border rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-vought-blue resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">{postText.length}/280 karakter</span>
              <button
                type="submit"
                disabled={!postText.trim() || isAnalyzing}
                className="bg-vought-blue hover:bg-vought-blue/80 text-vought-dark font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>Analiz Ediliyor...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Paylaş
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Trending Topics */}
        <div className="bg-vought-card border border-vought-border rounded-xl p-6">
          <h3 className="text-md font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-vought-red" /> Gündemdekiler (Trends)
          </h3>
          <div className="space-y-3">
            {trendingTopics.map((topic, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 border-b border-vought-border/30 last:border-0">
                <span className="text-sm font-semibold text-vought-blue hover:underline cursor-pointer">{topic}</span>
                <span className="text-xs text-slate-400">{(15000 - idx * 2000).toLocaleString()} gönderi</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Instaverse Feed */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-vought-gold" /> Instaverse Akışı
        </h2>

        {posts.length === 0 ? (
          <div className="bg-vought-card border border-vought-border rounded-xl p-8 text-center text-slate-400">
            Henüz hiç gönderi yok. İlk gönderini yukarıdan paylaş!
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-vought-card border border-vought-border rounded-xl p-6 space-y-4">
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-vought-red to-vought-blue flex items-center justify-center font-bold text-white">
                      {post.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-sm block">@{post.username}</span>
                      <span className="text-xs text-slate-400">{post.timestamp}</span>
                    </div>
                  </div>
                  {post.isPlayer && (
                    <span className="text-xs bg-vought-red/20 text-vought-red px-2 py-0.5 rounded-full border border-vought-red/30">Senin Gönderin</span>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{post.content}</p>

                {/* Post Stats */}
                <div className="flex items-center gap-6 text-xs text-slate-400 border-y border-vought-border/50 py-2.5">
                  <span className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
                    <Heart className="w-4 h-4" /> {post.likes.toLocaleString()} Beğeni
                  </span>
                  <span className="flex items-center gap-1 hover:text-vought-blue cursor-pointer">
                    <MessageCircle className="w-4 h-4" /> {post.comments.length} Yorum
                  </span>
                  <span className="flex items-center gap-1 hover:text-emerald-500 cursor-pointer">
                    <Share2 className="w-4 h-4" /> {post.shares.toLocaleString()} Paylaşım
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Eye className="w-4 h-4" /> {post.views.toLocaleString()} Görüntülenme
                  </span>
                </div>

                {/* Comments Section */}
                {post.comments.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-400 block">Yorumlar</span>
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-vought-dark/40 border border-vought-border/50 rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-vought-blue">@{comment.username}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {comment.likes}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Instaverse;
