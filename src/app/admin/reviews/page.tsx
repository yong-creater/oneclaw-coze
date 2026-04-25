'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, X, MessageSquare, Clock, User, AlertTriangle } from 'lucide-react';

interface Review {
  id: number;
  user_id: string;
  tool_id: number;
  content: string;
  status: string;
  likes: number;
  created_at: string;
  tools?: {
    id: number;
    name: string;
    logo: string;
  };
  user_ratings?: {
    effect_score: number;
    usability_score: number;
    quota_score: number;
    stability_score: number;
    overall_score: string;
  };
}

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: action === 'approve' ? 'approved' : 'rejected' })
      });
      
      const data = await res.json();
      if (data.success) {
        fetchReviews();
        setDetailOpen(false);
      } else {
        alert('操作失败: ' + data.error);
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-700',
    'approved': 'bg-green-100 text-green-700',
    'rejected': 'bg-red-100 text-red-700',
  };

  const STATUS_LABELS: Record<string, string> = {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝',
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">评论审核</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">审核用户提交的评论</p>
        </div>
      </div>

      {/* 状态筛选 */}
      <div className="flex items-center gap-2">
        {['pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-gradient-to-r slate-600 dark:bg-slate-500 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {STATUS_LABELS[status]}
            {status === 'pending' && reviews.length > 0 && (
              <Badge className="ml-2 bg-white/20">{reviews.length}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* 评论列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
              setSelectedReview(review);
              setDetailOpen(true);
            }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* 用户头像 */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r slate-600 dark:bg-slate-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                    {review.user_id.slice(-2).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        用户{review.user_id.slice(-4)}
                      </span>
                      {review.user_ratings && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-slate-600">★</span>
                          <span>{review.user_ratings.overall_score}</span>
                        </div>
                      )}
                      <Badge className={STATUS_COLORS[review.status]}>
                        {STATUS_LABELS[review.status]}
                      </Badge>
                    </div>
                    
                    {/* 工具信息 */}
                    {review.tools && (
                      <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                        <img src={review.tools.logo} alt="" className="w-4 h-4 rounded" />
                        <span>{review.tools.name}</span>
                      </div>
                    )}
                    
                    {/* 评论内容 */}
                    <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                      {review.content}
                    </p>
                    
                    {/* 时间 */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(review.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  {review.status === 'pending' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReview(review.id, 'approve');
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReview(review.id, 'reject');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-slate-500">
            {statusFilter === 'pending' ? (
              <>
                <MessageSquare className="w-8 h-8 mb-2 text-slate-300" />
                <span>暂无待审核评论</span>
              </>
            ) : (
              <span>暂无{STATUS_LABELS[statusFilter]}评论</span>
            )}
          </CardContent>
        </Card>
      )}

      {/* 详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>评论详情</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              {/* 用户信息 */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r slate-600 dark:bg-slate-500 flex items-center justify-center text-white font-medium">
                  {selectedReview.user_id.slice(-2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">用户{selectedReview.user_id.slice(-4)}</p>
                  <p className="text-xs text-slate-500">{selectedReview.user_id}</p>
                </div>
              </div>

              {/* 评分 */}
              {selectedReview.user_ratings && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">生成效果</span>
                      <span className="font-medium">{selectedReview.user_ratings.effect_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">易用性</span>
                      <span className="font-medium">{selectedReview.user_ratings.usability_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">免费额度</span>
                      <span className="font-medium">{selectedReview.user_ratings.quota_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">稳定性</span>
                      <span className="font-medium">{selectedReview.user_ratings.stability_score}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 评论内容 */}
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">评论内容</p>
                <p className="text-slate-600 dark:text-slate-300">{selectedReview.content}</p>
              </div>

              {/* 操作按钮 */}
              {selectedReview.status === 'pending' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleReview(selectedReview.id, 'reject')}
                  >
                    <X className="w-4 h-4 mr-2" />
                    拒绝
                  </Button>
                  <Button
                    className="bg-gradient-to-r slate-600 dark:bg-slate-500"
                    onClick={() => handleReview(selectedReview.id, 'approve')}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    通过
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
