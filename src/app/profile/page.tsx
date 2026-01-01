'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { apiClient } from '@/lib/api';
import Header from '@/components/Header';

interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  provider: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 닉네임 수정
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  // 비밀번호 변경
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // 회원 탈퇴
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadProfile();
  }, []);

  const isDarkMode = mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'));

  const loadProfile = async () => {
    try {
      const response = await apiClient.get<UserProfile>('/user/profile');
      if (response.data) {
        setProfile(response.data);
        setNewNickname(response.data.nickname);
      }
    } catch (err) {
      setError('프로필을 불러올 수 없습니다');
      if (err instanceof Error && err.message.includes('401')) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNickname = async () => {
    setNicknameError('');
    setSuccessMessage('');

    if (!newNickname || newNickname.length < 2) {
      setNicknameError('닉네임은 최소 2자 이상이어야 합니다');
      return;
    }

    if (newNickname.length > 50) {
      setNicknameError('닉네임은 최대 50자까지 입력 가능합니다');
      return;
    }

    try {
      await apiClient.patch('/user/nickname', { nickname: newNickname });
      setProfile(prev => prev ? { ...prev, nickname: newNickname } : null);
      setIsEditingNickname(false);
      setSuccessMessage('닉네임이 변경되었습니다');
    } catch (err) {
      setNicknameError(err instanceof Error ? err.message : '닉네임 변경에 실패했습니다');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setSuccessMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('비밀번호는 최소 8자 이상이어야 합니다');
      return;
    }

    try {
      await apiClient.patch('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      setSuccessMessage('비밀번호가 변경되었습니다');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiClient.delete('/user');
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원 탈퇴에 실패했습니다');
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      router.push('/');
    } catch (err) {
      setError('로그아웃에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fff]'}`}>
        <p className="text-[var(--text-primary)]">로딩 중...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fff]'}`}>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const isLocalUser = profile.provider === 'LOCAL';

  return (
    <>
      <Header />
      <div className={`min-h-screen pt-20 ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fff]'} py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">마이페이지</h1>
          </div>

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

        {/* 프로필 정보 */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 space-y-4`}>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">프로필 정보</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">이메일</label>
              <p className="mt-1 text-[var(--text-primary)]">{profile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">닉네임</label>
              {isEditingNickname ? (
                <div className="mt-1 space-y-2">
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    className="block w-full px-3 py-2 border border-[var(--border-color)] rounded-md text-[var(--text-primary)] bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {nicknameError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{nicknameError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateNickname}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingNickname(false);
                        setNewNickname(profile.nickname);
                        setNicknameError('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-[var(--text-primary)]">{profile.nickname}</p>
                  <button
                    onClick={() => setIsEditingNickname(true)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">로그인 방식</label>
              <p className="mt-1 text-[var(--text-primary)]">
                {profile.provider === 'LOCAL' ? '이메일' : profile.provider}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">가입일</label>
              <p className="mt-1 text-[var(--text-primary)]">
                {new Date(profile.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 (LOCAL 사용자만) */}
        {isLocalUser && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 space-y-4`}>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">비밀번호 변경</h2>

            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                비밀번호 변경하기
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{passwordError}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--text-secondary)]">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-[var(--border-color)] rounded-md text-[var(--text-primary)] bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--text-secondary)]">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-[var(--border-color)] rounded-md text-[var(--text-primary)] bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-secondary)]">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-[var(--border-color)] rounded-md text-[var(--text-primary)] bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    변경하기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  >
                    취소
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 회원 탈퇴 */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6 space-y-4`}>
          <h2 className="text-xl font-bold text-red-600">회원 탈퇴</h2>

          <div className="space-y-3">
            <div className={`${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border-l-4 border-yellow-400 p-4`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200 font-medium">
                    데이터 보관 정책 안내
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
                    회원 탈퇴 신청 후 <span className="font-bold">30일간 데이터가 보관</span>됩니다.
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-300 mt-2 space-y-1">
                    <li>30일 이내에는 데이터 복구가 가능합니다</li>
                    <li>30일 경과 후 모든 데이터가 자동으로 완전히 삭제됩니다</li>
                    <li>이는 개인정보보호법에 따른 법적 보관 기간입니다</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)]">
              탈퇴 신청 시 즉시 로그인이 불가능하며, 30일 후 모든 개인정보가 영구적으로 삭제됩니다.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              회원 탈퇴
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                정말로 탈퇴하시겠습니까? 탈퇴 신청 후 30일간은 데이터가 보관되며, 이후 영구 삭제됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  확인
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
