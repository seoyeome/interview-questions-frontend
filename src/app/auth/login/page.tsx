'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface ValidationErrors {
  email?: string;
  password?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setMounted(true);
    // 회원가입 성공 시 메시지 표시
    if (searchParams.get('signup') === 'success') {
      setSuccessMessage('회원가입이 완료되었습니다. 로그인해주세요.');
    }
  }, [searchParams]);

  const isDarkMode = mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'));

  // 이메일 유효성 검사
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return '이메일은 필수입니다';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return '올바른 이메일 형식이 아닙니다';
    }
    return undefined;
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return '비밀번호는 필수입니다';
    }
    return undefined;
  };

  // 실시간 유효성 검사
  const validateField = (name: string, value: string) => {
    let error: string | undefined;

    if (name === 'email') {
      error = validateEmail(value);
    } else if (name === 'password') {
      error = validatePassword(value);
    }

    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      validateField('email', value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      validateField('password', value);
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 모든 필드 터치 처리
    setTouched({ email: true, password: true });

    // 모든 필드 유효성 검사
    const errors: ValidationErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setValidationErrors(errors);

    // 에러가 하나라도 있으면 제출 중단
    if (Object.values(errors).some(error => error !== undefined)) {
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/login', { email, password });
      // 쿠키는 백엔드에서 HttpOnly로 설정됨
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    // Vercel Rewrites를 통해 Same-Site 구조로 요청 (보안 강화)
    window.location.href = '/oauth2/authorization/kakao';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fff]'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            또는{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              회원가입하기
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* 카카오 로그인 */}
          <button
            onClick={handleKakaoLogin}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
            </svg>
            카카오 로그인
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--background)] text-[var(--text-secondary)]">또는</span>
            </div>
          </div>

          {/* 이메일 로그인 */}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {successMessage && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email', email)}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.email && touched.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-[var(--border-color)] focus:ring-blue-500 focus:border-blue-500'
                  } placeholder-[var(--text-secondary)] text-[var(--text-primary)] bg-[var(--input-background)] rounded-md focus:outline-none focus:z-10 sm:text-sm`}
                  placeholder="이메일"
                />
                {validationErrors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password', password)}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.password && touched.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-[var(--border-color)] focus:ring-blue-500 focus:border-blue-500'
                  } placeholder-[var(--text-secondary)] text-[var(--text-primary)] bg-[var(--input-background)] rounded-md focus:outline-none focus:z-10 sm:text-sm`}
                  placeholder="비밀번호"
                />
                {validationErrors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <LoginForm />
    </Suspense>
  );
}
