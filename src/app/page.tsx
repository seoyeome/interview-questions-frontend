'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

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

export default function Home() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // API 데이터 상태
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI 상태
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedSub, setSelectedSub] = useState('전체');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentExplanation, setCurrentExplanation] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  // 백엔드 API에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 카테고리 데이터 가져오기
        const categoryRes = await fetch('/api/v1/categories');
        if (!categoryRes.ok) {
          console.error('카테고리 데이터를 불러오는데 실패했습니다');
          return;
        }
        const categoryData = await categoryRes.json();
        setCategories(categoryData);
        
        // 서브카테고리 데이터 가져오기
        const subCategoryRes = await fetch('/api/v1/sub-categories');
        if (!subCategoryRes.ok) {
          console.error('서브카테고리 데이터를 불러오는데 실패했습니다');
          return;
        }
        const subCategoryData = await subCategoryRes.json();
        setSubCategories(subCategoryData);
        
        // 질문 데이터 가져오기
        const questionRes = await fetch('/api/v1/questions');
        if (!questionRes.ok) {
          console.error('질문 데이터를 불러오는데 실패했습니다');
          return;
        }
        const questionData = await questionRes.json();
        setQuestions(questionData);
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
    setCurrentQuestion(null);
    setShowExplanation(false);
    setUserAnswer('');
  };

  // 세부 카테고리 변경
  const handleSub = (sub: string) => {
    setSelectedSub(sub);
    setCurrentQuestion(null);
    setShowExplanation(false);
    setUserAnswer('');
  };

  // 질문 생성 (랜덤)
  const generateQuestion = () => {
    // API 데이터가 있으면 API 데이터 사용
    if (questions.length > 0) {
      let filtered = [...questions];
      
      if (selectedCategory !== '전체') {
        // 선택된 카테고리의 ID 찾기
        const categoryId = categories.find(c => c.name === selectedCategory)?.id;
        if (categoryId) {
          // 카테고리 ID로 서브카테고리 필터링 후, 해당 서브카테고리에 속한 질문 필터링
          const subCategoryIds = subCategories
            .filter(s => s.categoryId === categoryId)
            .map(s => s.id);
          filtered = filtered.filter(q => subCategoryIds.includes(q.subCategoryId));
        }
      }
      
      if (selectedSub !== '전체') {
        // 선택된 서브카테고리의 ID 찾기
        const subCategoryId = subCategories.find(s => s.name === selectedSub)?.id;
        if (subCategoryId) {
          filtered = filtered.filter(q => q.subCategoryId === subCategoryId);
        }
      }
      
      if (filtered.length > 0) {
        const picked = filtered[Math.floor(Math.random() * filtered.length)];
        setCurrentQuestion(picked.content);
        setCurrentExplanation(picked.explanation || null);
        setShowExplanation(false);
        setUserAnswer('');
      } else {
        setCurrentQuestion('해당 카테고리에 질문이 없습니다');
        setCurrentExplanation(null);
        setShowExplanation(false);
        setUserAnswer('');
      }
    } else {
      setCurrentQuestion('질문을 불러오세요');
      setCurrentExplanation(null);
      setShowExplanation(false);
      setUserAnswer('');
    }
  };

  // 해설 보기
  const handleShowExplanation = () => setShowExplanation((v) => !v);

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
      <main className="w-full max-w-xl px-4 py-12 flex flex-col gap-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-2">
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
          <div className="font-bold text-lg mb-2">
            {currentQuestion ? currentQuestion : '질문을 불러오세요'}
          </div>
          {currentQuestion && (
            <button
              className="self-end text-xs text-[#64748b] hover:underline"
              onClick={handleShowExplanation}
            >
              {showExplanation ? '해설 닫기' : '해설 보기'}
            </button>
          )}
          {showExplanation && currentExplanation && (
            <div className={`w-full rounded-xl p-4 text-sm mt-2 ${
              isDarkMode 
                ? 'bg-[#0f172a]/50 text-[#cbd5e1]' 
                : 'bg-[#f1f5f9] text-[#64748b]'
            }`}>
              {currentExplanation}
            </div>
          )}
        </section>

        {/* 카테고리/세부카테고리 + 버튼 */}
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
          <button
            className="rounded-2xl bg-[#3182f6] text-white font-bold px-6 py-3 shadow hover:bg-[#2563eb] transition-all text-base"
            onClick={generateQuestion}
          >
            랜덤 질문 생성
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
            disabled={!currentQuestion || currentQuestion === '질문을 불러오세요'}
          />
          <button
            className={`w-full rounded-2xl font-bold px-6 py-3 mt-4 transition-all ${
              isDarkMode
                ? 'bg-[#3182f6]/20 text-[#60a5fa] hover:bg-[#3182f6]/30'
                : 'bg-[#bcdcff] text-[#1e293b] hover:bg-[#a5c9ff]'
            } disabled:opacity-60`}
            disabled={!currentQuestion || currentQuestion === '질문을 불러오세요'}
          >
            답변 확인하기
          </button>
        </section>
      </main>
    </div>
  );
}
