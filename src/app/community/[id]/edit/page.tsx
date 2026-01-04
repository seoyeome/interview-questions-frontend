'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import { Post, PostUpdateRequest } from '@/types/post';
import toast, { Toaster } from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  { value: 'QUESTION', label: '질문' },
  { value: 'FREE', label: '자유게시판' },
];

export default function EditPostPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PostUpdateRequest>({
    title: '',
    content: '',
    category: 'QUESTION',
  });
  const [submitting, setSubmitting] = useState(false);

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPost();
    }
  }, [mounted, postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) throw new Error('게시글 조회 실패');

      const data: Post = await response.json();
      setFormData({
        title: data.title,
        content: data.content,
        category: data.category,
      });
    } catch (error) {
      console.error('게시글 조회 오류:', error);
      toast.error('게시글을 불러오는데 실패했습니다');
      router.push('/community');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('내용을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('로그인이 필요합니다');
          router.push('/auth/signin');
          return;
        }
        if (response.status === 403) {
          toast.error('본인의 게시글만 수정할 수 있습니다');
          return;
        }
        throw new Error('게시글 수정 실패');
      }

      toast.success('게시글이 수정되었습니다');
      router.push(`/community/${postId}`);
    } catch (error) {
      console.error('게시글 수정 오류:', error);
      toast.error('게시글 수정에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen"
      style={{ background: isDarkMode ? '#0f172a' : '#f8fafc' }}
    >
      <Toaster position="top-right" />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로 가기 버튼 */}
        <button
          onClick={() => router.push(`/community/${postId}`)}
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
          뒤로 가기
        </button>

        {loading ? (
          <div className="text-center py-20">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: isDarkMode ? '#3b82f6' : '#2563eb' }}
            ></div>
          </div>
        ) : (
          <div
            className="p-8 rounded-lg"
            style={{
              background: isDarkMode ? '#1e293b' : '#ffffff',
              border: `1px solid var(--border-color)`,
            }}
          >
            <h1
              className="text-3xl font-bold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              게시글 수정
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 카테고리 선택 */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  카테고리
                </label>
                <div className="flex gap-4">
                  {CATEGORY_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={option.value}
                        checked={formData.category === option.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value as 'QUESTION' | 'FREE',
                          })
                        }
                        className="w-4 h-4"
                        style={{
                          accentColor: isDarkMode ? '#3b82f6' : '#2563eb',
                        }}
                      />
                      <span style={{ color: 'var(--text-primary)' }}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 제목 입력 */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  제목
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="제목을 입력하세요"
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    caretColor: 'var(--text-primary)',
                  }}
                />
                <div
                  className="text-sm mt-1 text-right"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {formData.title.length}/200
                </div>
              </div>

              {/* 내용 입력 */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  내용
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="내용을 입력하세요"
                  rows={15}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{
                    background: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    caretColor: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* 버튼 그룹 */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => router.push(`/community/${postId}`)}
                  className="px-6 py-3 rounded-lg font-medium transition-all"
                  style={{
                    background: isDarkMode ? '#334155' : '#e2e8f0',
                    color: 'var(--text-primary)',
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: isDarkMode ? '#3b82f6' : '#2563eb',
                    color: 'white',
                  }}
                >
                  {submitting ? '수정 중...' : '수정하기'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
