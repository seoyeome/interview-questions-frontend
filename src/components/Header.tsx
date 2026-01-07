'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface UserProfileSummary {
  provider: 'LOCAL' | 'KAKAO';
}

export default function Header() {
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authProvider, setAuthProvider] = useState<UserProfileSummary['provider'] | null>(null);

  useEffect(() => {
    setMounted(true);
    // 로그인 상태 확인
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await apiClient.get<UserProfileSummary>('/user/profile');
      setIsLoggedIn(true);
      setAuthProvider(response.data?.provider ?? null);
    } catch (err) {
      setIsLoggedIn(false);
      setAuthProvider(null);
    }
  };

  const handleLogout = async () => {
    try {
      let provider = authProvider;
      if (!provider) {
        try {
          const response = await apiClient.get<UserProfileSummary>('/user/profile');
          provider = response.data?.provider ?? null;
        } catch {
          provider = null;
        }
      }

      // 1. 백엔드 로그아웃 (Spring Security 세션 무효화)
      await apiClient.post('/auth/logout');

      // 2. Next.js HttpOnly 쿠키 삭제
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // 3. localStorage 정리 (기존 토큰이 있을 경우)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
      }

      // 4. 카카오 로그아웃 (카카오 세션도 삭제)
      if (provider === 'KAKAO') {
        // 카카오 로그아웃 API 호출 후 리다이렉트
        const KAKAO_LOGOUT_URL = 'https://kauth.kakao.com/oauth/logout';
        const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || 'c0ac7b5ce6c0f73e3f9c0ab2fb7c4a53';
        const LOGOUT_REDIRECT_URI = window.location.origin;

        window.location.href = `${KAKAO_LOGOUT_URL}?client_id=${KAKAO_CLIENT_ID}&logout_redirect_uri=${encodeURIComponent(LOGOUT_REDIRECT_URI)}`;
        return;
      }

      setIsLoggedIn(false);
      router.push('/');
    } catch (err) {
      console.error('로그아웃 실패:', err);
      // 에러가 발생해도 로컬 정리 후 홈으로
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt_token');
      }
      setIsLoggedIn(false);
      window.location.href = '/';
    }
  };

  if (!mounted) return null;

  const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b ${
      isDarkMode
        ? 'bg-[#0f172a] border-[#334155]'
        : 'bg-white border-[#e2e8f0]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* 로고 */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-[#3182f6] to-[#8b5cf6] bg-clip-text text-transparent">
            면접 질문 생성기
          </span>
        </button>

        {/* 우측 버튼들 */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => router.push('/community')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-[#1e293b] border border-[#334155] text-white hover:bg-[#2d3a4f]'
                    : 'bg-white border border-[#e2e8f0] text-gray-700 hover:bg-[#f8fafc]'
                }`}
              >
                커뮤니티
              </button>
              <button
                onClick={() => router.push('/profile')}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-[#1e293b] border border-[#334155] text-white hover:bg-[#2d3a4f]'
                    : 'bg-white border border-[#e2e8f0] text-gray-700 hover:bg-[#f8fafc]'
                }`}
                aria-label="프로필"
              >
                <UserCircleIcon className="w-6 h-6" />
              </button>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-[#1e293b] border border-[#334155] text-white hover:bg-[#2d3a4f]'
                    : 'bg-white border border-[#e2e8f0] text-gray-700 hover:bg-[#f8fafc]'
                }`}
              >
                로그아웃
              </button>
            </>
          ) : (
            <a
              href="/auth/login"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'
                  : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'
              }`}
            >
              로그인
            </a>
          )}
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-2xl shadow border transition-colors ${
              isDarkMode
                ? 'bg-[#1e293b] border-[#334155] hover:bg-[#2d3a4f]'
                : 'bg-white/80 border-[#f1f5f9] hover:bg-[#f8fafc]'
            }`}
            aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDarkMode ? (
              <SunIcon className="w-6 h-6 text-[#fbbf24]" />
            ) : (
              <MoonIcon className="w-6 h-6 text-[#64748b]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
