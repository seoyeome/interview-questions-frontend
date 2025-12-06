'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { getBackendUrl, apiClient } from '@/lib/api';

interface ValidationErrors {
  email?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // 이름 유효성 검사
  const validateName = (name: string): string | undefined => {
    if (!name) {
      return '이름은 필수입니다';
    }
    if (name.length < 2) {
      return '이름은 최소 2자 이상이어야 합니다';
    }
    if (name.length > 50) {
      return '이름은 최대 50자까지 입력 가능합니다';
    }
    return undefined;
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return '비밀번호는 필수입니다';
    }
    if (password.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다';
    }
    if (password.length > 100) {
      return '비밀번호는 최대 100자까지 입력 가능합니다';
    }
    return undefined;
  };

  // 비밀번호 확인 유효성 검사
  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return '비밀번호 확인은 필수입니다';
    }
    if (confirmPassword !== password) {
      return '비밀번호가 일치하지 않습니다';
    }
    return undefined;
  };

  // 실시간 유효성 검사
  const validateField = (name: string, value: string) => {
    let error: string | undefined;

    switch (name) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'name':
        error = validateName(value);
        break;
      case 'password':
        error = validatePassword(value);
        // 비밀번호가 변경되면 confirmPassword도 다시 검사
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value);
          setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
    }

    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 이미 터치된 필드만 실시간 검사
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 모든 필드 터치 처리
    setTouched({
      email: true,
      name: true,
      password: true,
      confirmPassword: true,
    });

    // 모든 필드 유효성 검사
    const errors: ValidationErrors = {
      email: validateEmail(formData.email),
      name: validateName(formData.name),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };

    setValidationErrors(errors);

    // 에러가 하나라도 있으면 제출 중단
    if (Object.values(errors).some(error => error !== undefined)) {
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/auth/signup', {
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });
      // 쿠키는 백엔드에서 HttpOnly로 설정됨
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = `${getBackendUrl()}/oauth2/authorization/kakao`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fff]'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              로그인하기
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
            카카오로 시작하기
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--background)] text-[var(--text-secondary)]">또는</span>
            </div>
          </div>

          {/* 이메일 회원가입 */}
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
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
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
                <label htmlFor="name" className="sr-only">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.name && touched.name
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-[var(--border-color)] focus:ring-blue-500 focus:border-blue-500'
                  } placeholder-[var(--text-secondary)] text-[var(--text-primary)] bg-[var(--input-background)] rounded-md focus:outline-none focus:z-10 sm:text-sm`}
                  placeholder="이름 (2자 이상)"
                />
                {validationErrors.name && touched.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.password && touched.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-[var(--border-color)] focus:ring-blue-500 focus:border-blue-500'
                  } placeholder-[var(--text-secondary)] text-[var(--text-primary)] bg-[var(--input-background)] rounded-md focus:outline-none focus:z-10 sm:text-sm`}
                  placeholder="비밀번호 (8자 이상)"
                />
                {validationErrors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    validationErrors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-[var(--border-color)] focus:ring-blue-500 focus:border-blue-500'
                  } placeholder-[var(--text-secondary)] text-[var(--text-primary)] bg-[var(--input-background)] rounded-md focus:outline-none focus:z-10 sm:text-sm`}
                  placeholder="비밀번호 확인"
                />
                {validationErrors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {loading ? '가입 중...' : '회원가입'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
