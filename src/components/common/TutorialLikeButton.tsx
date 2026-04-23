'use client';

import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialLikeButtonProps {
  tutorialId: number;
  initialLikes: number;
}

export default function TutorialLikeButton({ tutorialId, initialLikes }: TutorialLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (liked || loading) return;
    
    setLoading(true);
    setLiked(true);
    setLikes(prev => prev + 1);
    
    try {
      await fetch(`/api/tutorials/${tutorialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });
    } catch (error) {
      // 回滚
      setLiked(false);
      setLikes(prev => prev - 1);
      console.error('点赞失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={liked || loading}
      className={`flex items-center gap-1.5 ${liked ? 'text-orange-500' : 'text-slate-500 hover:text-orange-500'}`}
    >
      <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-orange-500' : ''}`} />
      <span>{likes} 点赞</span>
    </Button>
  );
}
