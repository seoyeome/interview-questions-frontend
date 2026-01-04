'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import { Post } from '@/types/post';
import { apiClient } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

const CATEGORY_MAP: Record<string, string> = {
  QUESTION: '질문',
  FREE: '자유게시판',
};

export default function PostDetailPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPost();
      checkOwnership();
    }
  }, [mounted, postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/posts/${postId}`);
      setPost(data as unknown as Post);
    } catch (error) {
      console.error('게시글 조회 오류:', error);
      toast.error('게시글을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    try {
      const userData = await apiClient.get('/user/profile');
      if (post && (userData as any).data?.id === post.userId) {
        setIsOwner(true);
      }
    } catch (error) {
      // 로그인하지 않은 경우 무시
    }
  };

  const handleEdit = () => {
    router.push(`/community/${postId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`/posts/${postId}`);
      toast.success('게시글이 삭제되었습니다');
      router.push('/community');
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      toast.error('게시글 삭제에 실패했습니다');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen pt-20"
      style={{ background: isDarkMode ? '#0f172a' : '#f8fafc' }}
    >
      <Toaster position="top-right" />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: isDarkMode ? '#3b82f6' : '#2563eb' }}
            ></div>
          </div>
        ) : post ? (
          <>
            {/* 뒤로 가기 버튼 */}
            <button
              onClick={() => router.push('/community')}
              className="mb-6 flex items-center gap-2 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              목록으로
            </button>

            {/* 게시글 카드 */}
            <div
              className="p-8 rounded-lg"
              style={{
                background: isDarkMode ? '#1e293b' : '#ffffff',
                border: `1px solid var(--border-color)`,
              }}
            >
              {/* 헤더 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      background: isDarkMode ? '#334155' : '#e0f2fe',
                      color: isDarkMode ? '#93c5fd' : '#0369a1',
                    }}
                  >
                    {CATEGORY_MAP[post.category]}
                  </span>

                  {isOwner && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 rounded-lg text-sm transition-all"
                        style={{
                          background: isDarkMode ? '#334155' : '#e0f2fe',
                          color: isDarkMode ? '#93c5fd' : '#0369a1',
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 rounded-lg text-sm transition-all"
                        style={{
                          background: isDarkMode ? '#7f1d1d' : '#fee2e2',
                          color: isDarkMode ? '#fca5a5' : '#991b1b',
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                <h1
                  className="text-3xl font-bold mb-4"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {post.title}
                </h1>

                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    작성자 ID: {post.userId}
                  </span>
                  <div className="flex items-center gap-4">
                    <span
                      className="flex items-center gap-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {post.viewCount}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div
                className="my-6"
                style={{
                  height: '1px',
                  background: 'var(--border-color)',
                }}
              ></div>

              {/* 본문 */}
              <div
                className="prose prose-lg max-w-none whitespace-pre-wrap"
                style={{ color: 'var(--text-primary)' }}
              >
                {post.content}
              </div>

              {/* 수정 정보 */}
              {post.updatedAt !== post.createdAt && (
                <div className="mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  수정됨: {formatDate(post.updatedAt)}
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            className="text-center py-20 rounded-lg"
            style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              border: `1px solid var(--border-color)`,
            }}
          >
            <p style={{ color: 'var(--text-secondary)' }}>
              게시글을 찾을 수 없습니다
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
