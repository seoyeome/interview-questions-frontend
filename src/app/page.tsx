'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 타이핑 애니메이션 상태
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingQuestion, setIsTypingQuestion] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 커서 깜빡임
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    // 데모 질문과 답변
    const demoQuestion = "React의 useState와 useReducer의 차이점을 설명해주세요.";
    const demoAnswer = "useState는 단순한 상태 관리에 적합하며, 하나의 값을 관리합니다. useReducer는 복잡한 상태 로직이나 여러 하위 값을 포함하는 상태를 관리할 때 유용합니다. useReducer는 현재 상태와 action을 받아 새로운 상태를 반환하는 reducer 함수를 사용하여 상태를 업데이트합니다.";

    let questionIndex = 0;
    let answerIndex = 0;
    let questionTypingTimer: NodeJS.Timeout;
    let answerTypingTimer: NodeJS.Timeout;
    let restartTimer: NodeJS.Timeout;

    // 질문 타이핑
    const typeQuestion = () => {
      if (questionIndex < demoQuestion.length) {
        setQuestionText(demoQuestion.slice(0, questionIndex + 1));
        questionIndex++;
        questionTypingTimer = setTimeout(typeQuestion, 50);
      } else {
        // 질문 완료 후 1초 대기 후 답변 시작
        setTimeout(() => {
          setIsTypingQuestion(false);
          typeAnswer();
        }, 1000);
      }
    };

    // 답변 타이핑
    const typeAnswer = () => {
      if (answerIndex < demoAnswer.length) {
        setAnswerText(demoAnswer.slice(0, answerIndex + 1));
        answerIndex++;
        answerTypingTimer = setTimeout(typeAnswer, 30);
      } else {
        // 답변 완료 후 3초 대기 후 재시작
        restartTimer = setTimeout(() => {
          setQuestionText('');
          setAnswerText('');
          setIsTypingQuestion(true);
          questionIndex = 0;
          answerIndex = 0;
          typeQuestion();
        }, 3000);
      }
    };

    // 최초 시작
    const initialDelay = setTimeout(typeQuestion, 500);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(questionTypingTimer);
      clearTimeout(answerTypingTimer);
      clearTimeout(restartTimer);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        {/* 로딩 중 */}
      </div>
    );
  }

  const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-[#0f172a]' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* 헤더 */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDarkMode
          ? 'bg-[#1e293b]/70 border-[#334155]'
          : 'bg-white/70 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            면접 질문 생성기
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-[#2d3a4f]'
                  : 'hover:bg-gray-100'
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI와 함께하는
            </span>
            <br />
            면접 연습
          </h2>
          <p className={`text-xl md:text-2xl mb-12 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            실시간 질문 생성과 상세한 해설로<br />
            효과적인 면접 준비를 시작하세요
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="px-8 py-4 bg-[#3b82f6] text-white rounded-xl font-bold text-lg hover:bg-[#2563eb] transition-all shadow-lg hover:shadow-xl"
            >
              무료로 시작하기
            </button>
            <button
              onClick={() => {
                const demoSection = document.getElementById('demo');
                demoSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                isDarkMode
                  ? 'bg-[#1e293b] text-white hover:bg-[#2d3a4f] border border-[#334155]'
                  : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              데모 보기
            </button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className={`text-3xl font-bold text-center mb-12 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            이렇게 사용합니다
          </h3>

          {/* 데모 인터페이스 */}
          <div className="space-y-6">
            {/* 질문 카드 */}
            <div className={`rounded-3xl shadow-2xl p-8 transition-all ${
              isDarkMode
                ? 'bg-[#1e293b]/80 text-white'
                : 'bg-white text-[#1e293b]'
            }`}>
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? 'bg-[#3182f6]/20 text-[#60a5fa]'
                    : 'bg-[#dbeafe] text-[#1e40af]'
                }`}>
                  프론트엔드 &gt; React
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  보통
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  ✨ AI 생성
                </span>
              </div>
              <div className="font-bold text-xl mb-4 min-h-[60px]">
                {questionText}
                {isTypingQuestion && showCursor && <span className="animate-pulse">|</span>}
              </div>
            </div>

            {/* 답변 카드 */}
            <div className={`rounded-3xl shadow-2xl p-8 transition-all ${
              isDarkMode
                ? 'bg-[#1e293b]/80 text-white'
                : 'bg-white text-[#1e293b]'
            }`}>
              <div className="font-bold text-lg mb-4">나의 답변</div>
              <div className={`w-full p-5 rounded-2xl border min-h-[200px] ${
                isDarkMode
                  ? 'bg-[#0f172a] border-[#334155] text-white'
                  : 'bg-[#f8fafc] border-[#e2e8f0] text-[#1e293b]'
              }`}>
                {answerText}
                {!isTypingQuestion && showCursor && <span className="animate-pulse">|</span>}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/auth/login')}
              className="px-10 py-4 bg-[#3b82f6] text-white rounded-xl font-bold text-lg hover:bg-[#2563eb] transition-all shadow-lg hover:shadow-xl"
            >
              지금 바로 시작하기 →
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 px-6 transition-colors ${
        isDarkMode
          ? 'bg-gradient-to-br from-[#1e293b]/30 to-[#0f172a]/30'
          : 'bg-gradient-to-br from-blue-50/50 to-purple-50/50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <h3 className={`text-3xl font-bold text-center mb-16 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            왜 면접 질문 생성기인가요?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`p-8 rounded-2xl transition-all ${
              isDarkMode ? 'bg-[#1e293b]/50' : 'bg-white'
            } shadow-lg hover:shadow-xl`}>
              <div className="text-4xl mb-4">🤖</div>
              <h4 className={`text-xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                AI 기반 질문 생성
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Gemini AI가 카테고리와 난이도에 맞춘 실전 면접 질문을 실시간으로 생성합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-8 rounded-2xl transition-all ${
              isDarkMode ? 'bg-[#1e293b]/50' : 'bg-white'
            } shadow-lg hover:shadow-xl`}>
              <div className="text-4xl mb-4">📚</div>
              <h4 className={`text-xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                체계적인 카테고리
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                프론트엔드, 백엔드, 데이터베이스 등 분야별로 정리된 질문으로 효율적인 학습이 가능합니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-8 rounded-2xl transition-all ${
              isDarkMode ? 'bg-[#1e293b]/50' : 'bg-white'
            } shadow-lg hover:shadow-xl`}>
              <div className="text-4xl mb-4">💡</div>
              <h4 className={`text-xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                상세한 해설
              </h4>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                모든 질문에 대한 모범 답변과 해설을 제공하여 깊이 있는 학습을 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className={`text-4xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            면접 준비, 이제 쉽고 효과적으로
          </h3>
          <p className={`text-xl mb-10 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            카카오 계정으로 간편하게 시작하세요
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-12 py-5 bg-[#3b82f6] text-white rounded-xl font-bold text-xl hover:bg-[#2563eb] transition-all shadow-lg hover:shadow-2xl"
          >
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 px-6 border-t ${
        isDarkMode ? 'border-[#334155] text-gray-400' : 'border-gray-200 text-gray-600'
      }`}>
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2025 면접 질문 생성기. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
