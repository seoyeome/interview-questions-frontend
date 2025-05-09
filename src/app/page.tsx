'use client';

import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const categories = [
  { name: 'CS', sub: ['자료구조', '알고리즘', '운영체제', '네트워크'] },
  { name: '백엔드', sub: ['Spring', 'Node.js', 'DB', 'API 설계'] },
  { name: 'DB', sub: ['RDBMS', 'NoSQL', '인덱스', '트랜잭션'] },
  { name: '네트워크', sub: ['HTTP', 'TCP/IP', 'OSI 7계층'] },
];

// 샘플 질문/해설 데이터
const questions = [
  { category: 'CS', sub: '자료구조', question: '스택과 큐의 차이점을 설명하세요.', explanation: '스택은 LIFO, 큐는 FIFO 구조입니다.' },
  { category: 'CS', sub: '알고리즘', question: '정렬 알고리즘의 종류와 특징을 설명하세요.', explanation: '버블, 선택, 삽입, 퀵, 병합 등이 있습니다.' },
  { category: '백엔드', sub: 'Spring', question: 'Spring DI란 무엇인가요?', explanation: 'DI는 의존성 주입으로, 객체 간 결합도를 낮춥니다.' },
  { category: 'DB', sub: 'RDBMS', question: '트랜잭션의 ACID란?', explanation: '원자성, 일관성, 고립성, 지속성을 의미합니다.' },
  { category: '네트워크', sub: 'HTTP', question: 'HTTP와 HTTPS의 차이점은?', explanation: 'HTTPS는 SSL/TLS로 암호화된 HTTP입니다.' },
  // ...더 추가 가능
];

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedSub, setSelectedSub] = useState('전체');
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentExplanation, setCurrentExplanation] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
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
    let filtered = questions;
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }
    if (selectedSub !== '전체') {
      filtered = filtered.filter(q => q.sub === selectedSub);
    }
    if (filtered.length > 0) {
      const picked = filtered[Math.floor(Math.random() * filtered.length)];
      setCurrentQuestion(picked.question);
      setCurrentExplanation(picked.explanation);
      setShowExplanation(false);
      setUserAnswer('');
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
  const categoryOptions = ['전체', ...categories.map(c => c.name)];
  const subOptions = selectedCategory === '전체'
    ? ['전체']
    : ['전체', ...(categories.find(c => c.name === selectedCategory)?.sub || [])];

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
            답변 저장하기
          </button>
        </section>
      </main>
    </div>
  );
}
