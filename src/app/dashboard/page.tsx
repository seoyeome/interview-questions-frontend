'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { apiClient } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

// API 응답 타입 정의
interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Question {
  id: string;
  content: string;
  difficulty: string;
  subCategoryId: string;
  explanation?: string;
}

interface CurrentQuestionInfo {
  content: string;
  explanation: string | null;
  categoryName: string;
  subCategoryName: string;
  difficulty: string;
  source?: 'AI' | 'DB'; // 질문 출처 표시
}

export default function Home() {
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // API 데이터 상태
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI 상태
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedSub, setSelectedSub] = useState('전체');
  const [currentQuestionInfo, setCurrentQuestionInfo] = useState<CurrentQuestionInfo | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState<number>(1); // AI 남은 횟수

  // 로그인 상태 확인
  useEffect(() => {
    setIsLoggedIn(true); // 미들웨어에서 이미 인증 확인됨
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      setIsLoggedIn(false);
      // 랜딩 페이지로 리다이렉트
      window.location.href = '/';
    } catch (err) {
      console.error('로그아웃 실패:', err);
      // 실패해도 로컬 상태 업데이트 및 리다이렉트
      setIsLoggedIn(false);
      window.location.href = '/';
    }
  };

  // 남은 quota 조회
  const fetchRemainingQuota = async () => {
    try {
      const response = await apiClient.get('/ai/remaining-quota');
      if (response && typeof response.data === 'number') {
        setRemainingQuota(response.data);
      }
    } catch (err) {
      console.error('Quota 조회 실패:', err);
    }
  };

  // 백엔드 API에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [categoryData, subCategoryData, questionData] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get('/sub-categories'),
          apiClient.get('/questions'),
        ]);

        setCategories(categoryData as unknown as Category[]);
        setSubCategories(subCategoryData as unknown as SubCategory[]);
        setQuestions(questionData as unknown as Question[]);

        // Quota 조회
        await fetchRemainingQuota();
      } catch (err) {
        console.error('데이터 로딩 중 오류 발생:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  // 카테고리 변경 시 세부 카테고리도 전체로 초기화
  const handleCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSub('전체');
    setCurrentQuestionInfo(null);
    setShowExplanation(false);
    setShowAnswer(false);
    setUserAnswer('');
  };

  // 세부 카테고리 변경
  const handleSub = (sub: string) => {
    setSelectedSub(sub);
    setCurrentQuestionInfo(null);
    setShowExplanation(false);
    setShowAnswer(false);
    setUserAnswer('');
  };

  // DB에서 랜덤 질문 가져오기 (폴백 함수)
  const getRandomQuestionFromDB = () => {
    let filtered = [...questions];

    if (selectedCategory !== '전체') {
      const categoryId = categories.find(c => c.name === selectedCategory)?.id;
      if (categoryId) {
        const subCategoryIds = subCategories
          .filter(s => s.categoryId === categoryId)
          .map(s => s.id);
        filtered = filtered.filter(q => subCategoryIds.includes(q.subCategoryId));
      }
    }

    if (selectedSub !== '전체') {
      const subCategoryId = subCategories.find(s => s.name === selectedSub)?.id;
      if (subCategoryId) {
        filtered = filtered.filter(q => q.subCategoryId === subCategoryId);
      }
    }

    if (filtered.length > 0) {
      const picked = filtered[Math.floor(Math.random() * filtered.length)];
      const subCat = subCategories.find(s => s.id === picked.subCategoryId);
      const cat = categories.find(c => c.id === subCat?.categoryId);

      return {
        content: picked.content,
        explanation: picked.explanation || '해설이 준비되지 않았습니다.',
        categoryName: cat?.name || '전체',
        subCategoryName: subCat?.name || '전체',
        difficulty: picked.difficulty,
        source: 'DB' as const
      };
    }

    return null;
  };

  // DB 질문 생성 (일반 질문)
  const generateDBQuestion = () => {
    setLoading(true);
    try {
      const dbQuestion = getRandomQuestionFromDB();

      if (dbQuestion) {
        setCurrentQuestionInfo(dbQuestion);
        setShowExplanation(false);
        setShowAnswer(false);
        setUserAnswer('');
      } else {
        setCurrentQuestionInfo(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // AI 질문 하이브리드 (DB 우선 → API fallback)
  const generateAIQuestion = async () => {
    setLoading(true);

    try {
      const difficulties: ('EASY' | 'MEDIUM' | 'HARD')[] = ['EASY', 'MEDIUM', 'HARD'];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

      const aiQuestion = await apiClient.post('/ai/question', {
        category: selectedCategory === '전체' ? '기술 면접' : selectedCategory,
        subCategory: selectedSub === '전체' ? '일반' : selectedSub,
        difficulty: randomDifficulty
      });

      if (aiQuestion.content) {
        setCurrentQuestionInfo({
          content: String(aiQuestion.content),
          explanation: aiQuestion.explanation ? String(aiQuestion.explanation) : null,
          categoryName: selectedCategory,
          subCategoryName: selectedSub,
          difficulty: String(aiQuestion.difficulty),
          source: aiQuestion.fromCache ? 'AI' : 'AI'
        });
        setShowExplanation(false);
        setShowAnswer(false);
        setUserAnswer('');

        // remainingQuota 업데이트
        if (typeof aiQuestion.remainingQuota === 'number') {
          setRemainingQuota(aiQuestion.remainingQuota);
        }

        // Toast 메시지
        if (aiQuestion.fromCache) {
          toast.success('저장된 AI 질문을 불러왔습니다! (횟수 차감 안됨)', {
            duration: 3000,
            icon: '💾'
          });
        } else {
          toast.success(`새로운 AI 질문 생성 완료! (남은 횟수: ${aiQuestion.remainingQuota}/1)`, {
            duration: 3000,
            icon: '✨'
          });
        }
      } else {
        toast.error('AI 질문 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('AI 질문 생성 실패:', error);

      if (error.response?.status === 429) {
        toast.error('오늘의 AI 질문 생성 횟수를 모두 사용했습니다. 내일 다시 시도해주세요.', {
          duration: 4000,
          icon: '⏰'
        });
      } else {
        toast.error('AI 질문 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 해설 보기
  const handleShowExplanation = () => setShowExplanation((v) => !v);

  // 답변 확인하기
  const handleShowAnswer = () => setShowAnswer((v) => !v);

  // 카테고리/세부카테고리 옵션
  const categoryOptions = categories.length > 0 
    ? ['전체', ...categories.map(c => c.name)] 
    : ['전체'];
  
  const subOptions = selectedCategory === '전체'
    ? ['전체']
    : ['전체', ...subCategories
        .filter(s => {
          const categoryId = categories.find(c => c.name === selectedCategory)?.id;
          return s.categoryId === categoryId;
        })
        .map(s => s.name)];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#fff]'} flex items-center justify-center`}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#1e293b',
            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <main className="w-full max-w-xl px-4 py-12 flex flex-col gap-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-2">
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
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">면접 질문 생성기</h1>
            <p className="text-base text-[#94a3b8]">카테고리를 선택하고 랜덤 질문을 받아보세요</p>
          </div>
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

        {/* 로딩 상태 표시 */}
        {loading && (
          <div className={`rounded-3xl shadow-xl p-8 text-center ${
            isDarkMode ? 'bg-[#1e293b]/80 text-white' : 'bg-white text-[#1e293b]'
          }`}>
            데이터를 불러오는 중입니다...
          </div>
        )}

        {/* 에러 상태 표시 */}
        {error && (
          <div className={`rounded-3xl shadow-xl p-8 text-center ${
            isDarkMode ? 'bg-[#1e293b]/80 text-red-400' : 'bg-white text-red-600'
          }`}>
            {error}
          </div>
        )}

        {/* 질문 카드 */}
        <section className={`rounded-3xl shadow-xl p-8 transition-colors ${
          isDarkMode
            ? 'bg-[#1e293b]/80 text-white'
            : 'bg-white text-[#1e293b]'
        }`}>
          {currentQuestionInfo && (
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDarkMode
                  ? 'bg-[#3182f6]/20 text-[#60a5fa]'
                  : 'bg-[#dbeafe] text-[#1e40af]'
              }`}>
                {currentQuestionInfo.categoryName} &gt; {currentQuestionInfo.subCategoryName}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentQuestionInfo.difficulty === 'EASY'
                  ? isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                  : currentQuestionInfo.difficulty === 'MEDIUM'
                  ? isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                  : isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
              }`}>
                {currentQuestionInfo.difficulty === 'EASY' ? '쉬움' : currentQuestionInfo.difficulty === 'MEDIUM' ? '보통' : '어려움'}
              </span>
              {currentQuestionInfo.source === 'AI' && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  ✨ AI 생성
                </span>
              )}
            </div>
          )}
          <div className="font-bold text-lg mb-2">
            {currentQuestionInfo ? currentQuestionInfo.content : '질문을 불러오세요'}
          </div>
          {currentQuestionInfo && (
            <button
              className="self-end text-xs text-[#64748b] hover:underline"
              onClick={handleShowExplanation}
            >
              {showExplanation ? '해설 닫기' : '해설 보기'}
            </button>
          )}
          {showExplanation && currentQuestionInfo && (
            <div className={`w-full rounded-xl p-4 text-sm mt-2 ${
              isDarkMode
                ? 'bg-[#0f172a]/50 text-[#cbd5e1]'
                : 'bg-[#f1f5f9] text-[#64748b]'
            }`}>
              {currentQuestionInfo.explanation}
            </div>
          )}
        </section>

        {/* 카테고리/세부카테고리 */}
        <section className="flex gap-3 w-full">
          <select
            className={`flex-1 rounded-2xl border px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-colors ${
              isDarkMode
                ? 'bg-[#1e293b]/80 border-[#334155] text-white'
                : 'bg-[#f8fafc] border-[#e2e8f0] text-[#1e293b]'
            }`}
            value={selectedCategory}
            onChange={e => handleCategory(e.target.value)}
          >
            {categoryOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select
            className={`flex-1 rounded-2xl border px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#3182f6] transition-colors ${
              isDarkMode
                ? 'bg-[#1e293b]/80 border-[#334155] text-white'
                : 'bg-[#f8fafc] border-[#e2e8f0] text-[#1e293b]'
            }`}
            value={selectedSub}
            onChange={e => handleSub(e.target.value)}
          >
            {subOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </section>

        {/* 질문 생성 버튼 2개 */}
        <section className="flex gap-3 w-full">
          <button
            className={`flex-1 rounded-2xl font-bold px-6 py-3 shadow transition-all text-base ${
              isDarkMode
                ? 'bg-[#1e293b]/80 border border-[#334155] text-white hover:bg-[#2d3a4f]'
                : 'bg-white border border-[#e2e8f0] text-[#1e293b] hover:bg-[#f8fafc]'
            }`}
            onClick={generateDBQuestion}
            disabled={loading}
          >
            💾 일반 질문
          </button>
          <button
            className="flex-1 rounded-2xl bg-gradient-to-r from-[#3182f6] to-[#8b5cf6] text-white font-bold px-6 py-3 shadow hover:from-[#2563eb] hover:to-[#7c3aed] transition-all text-base disabled:opacity-60"
            onClick={generateAIQuestion}
            disabled={loading || remainingQuota <= 0}
            title={remainingQuota > 0 ? "AI가 새로운 질문을 생성합니다 (약 2-3초 소요)" : "오늘의 AI 생성 횟수를 모두 사용했습니다"}
          >
            ✨ AI 질문 생성 ({remainingQuota}/1)
          </button>
        </section>

        {/* 답변 카드 */}
        <section className={`rounded-3xl shadow-xl p-8 transition-colors ${
          isDarkMode
            ? 'bg-[#1e293b]/80 text-white'
            : 'bg-white text-[#1e293b]'
        }`}>
          <div className="font-bold text-lg mb-2">나의 답변</div>
          <textarea
            placeholder="여기에 답변을 작성해주세요..."
            className={`w-full p-5 rounded-2xl border resize-none focus:outline-none focus:ring-2 focus:ring-[#3182f6] min-h-[120px] transition-colors ${
              isDarkMode
                ? 'bg-[#1e293b] border-[#334155] text-white placeholder-[#64748b]'
                : 'bg-[#f8fafc] border-[#e2e8f0] text-[#1e293b] placeholder-[#94a3b8]'
            }`}
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            disabled={!currentQuestionInfo}
          />
          <button
            className={`w-full rounded-2xl font-bold px-6 py-3 mt-4 transition-all ${
              isDarkMode
                ? 'bg-[#3182f6]/20 text-[#60a5fa] hover:bg-[#3182f6]/30'
                : 'bg-[#bcdcff] text-[#1e293b] hover:bg-[#a5c9ff]'
            } disabled:opacity-60`}
            disabled={!currentQuestionInfo}
            onClick={handleShowAnswer}
          >
            {showAnswer ? '답변 숨기기' : '답변 확인하기'}
          </button>

          {/* 모범 답변 아코디언 */}
          {showAnswer && currentQuestionInfo && (
            <div className={`mt-4 rounded-2xl p-5 border-2 transition-all ${
              isDarkMode
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div className={`font-bold text-base mb-2 ${
                isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
              }`}>
                💡 모범 답변
              </div>
              <div className={`text-sm whitespace-pre-wrap ${
                isDarkMode ? 'text-emerald-100' : 'text-emerald-900'
              }`}>
                {currentQuestionInfo.explanation}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
