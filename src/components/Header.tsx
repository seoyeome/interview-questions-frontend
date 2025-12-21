'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 로그인 상태 확인
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // 간단하게 API 호출로 로그인 여부 확인
      const response = await apiClient.get('/user/tutorial-status');
      setIsLoggedIn(true);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      setIsLoggedIn(false);
      window.location.href = '/';
    } catch (err) {
      console.error('로그아웃 실패:', err);
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
