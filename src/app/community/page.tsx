'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Header from '@/components/Header';
import { Post, PostListResponse } from '@/types/post';
import toast, { Toaster } from 'react-hot-toast';

const CATEGORY_MAP: Record<string, string> = {
  QUESTION: '질문',
  FREE: '자유게시판',
};

export default function CommunityPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPosts();
    }
  }, [mounted, selectedCategory, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
        sort: 'createdAt,desc',
      });
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const data = await apiClient.get<PostListResponse>(`/posts?${params}`);
      const postListResponse = data as unknown as PostListResponse;
      setPosts(postListResponse.content);
      setTotalPages(postListResponse.totalPages);
    } catch (error) {
      console.error('게시글 조회 오류:', error);
      toast.error('게시글을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen pt-20"
      style={{ background: isDarkMode ? '#0f172a' : '#f8fafc' }}
    >
      <Toaster position="top-right" />
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            커뮤니티
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            면접 질문과 경험을 공유하세요
          </p>
        </div>

        {/* 카테고리 필터 & 작성 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === null
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={
                selectedCategory !== null
                  ? { border: `1px solid var(--border-color)` }
                  : {}
              }
            >
              전체
            </button>
            <button
              onClick={() => handleCategoryChange('QUESTION')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === 'QUESTION'
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={
                selectedCategory !== 'QUESTION'
                  ? { border: `1px solid var(--border-color)` }
                  : {}
              }
            >
              질문
            </button>
            <button
              onClick={() => handleCategoryChange('FREE')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === 'FREE'
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={
                selectedCategory !== 'FREE'
                  ? { border: `1px solid var(--border-color)` }
                  : {}
              }
            >
              자유게시판
            </button>
          </div>

          <button
            onClick={() => router.push('/community/new')}
            className="px-6 py-2 rounded-lg font-medium transition-all"
            style={{
              background: isDarkMode ? '#3b82f6' : '#2563eb',
              color: 'white',
            }}
          >
            글쓰기
          </button>
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <div className="text-center py-20">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: isDarkMode ? '#3b82f6' : '#2563eb' }}
            ></div>
          </div>
        ) : posts.length === 0 ? (
          <div
            className="text-center py-20 rounded-lg"
            style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              border: `1px solid var(--border-color)`,
            }}
          >
            <p style={{ color: 'var(--text-secondary)' }}>
              아직 게시글이 없습니다. 첫 번째 글을 작성해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/community/${post.id}`)}
                className="p-6 rounded-lg cursor-pointer transition-all hover:shadow-lg"
                style={{
                  background: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid var(--border-color)`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        background: isDarkMode ? '#334155' : '#e0f2fe',
                        color: isDarkMode ? '#93c5fd' : '#0369a1',
                      }}
                    >
                      {CATEGORY_MAP[post.category]}
                    </span>
                  </div>
                  <span
                    className="text-sm flex items-center gap-2"
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
                </div>

                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {post.title}
                </h2>

                <p
                  className="mb-4 line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {post.content}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    작성자 ID: {post.userId}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isDarkMode ? '#1e293b' : '#ffffff',
                color: 'var(--text-primary)',
                border: `1px solid var(--border-color)`,
              }}
            >
              이전
            </button>
            <span
              className="px-4 py-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isDarkMode ? '#1e293b' : '#ffffff',
                color: 'var(--text-primary)',
                border: `1px solid var(--border-color)`,
              }}
            >
              다음
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
