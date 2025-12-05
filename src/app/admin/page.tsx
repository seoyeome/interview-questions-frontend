'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Question {
  id: string;
  content: string;
  difficulty: string;
  subCategoryId: string;
  explanation: string | null;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editExplanation, setEditExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  const questionsPerPage = 20;

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [questionsRes, categoriesRes, subCategoriesRes] = await Promise.all([
        fetch('/api/v1/questions'),
        fetch('/api/v1/categories'),
        fetch('/api/v1/sub-categories')
      ]);

      if (questionsRes.ok && categoriesRes.ok && subCategoriesRes.ok) {
        const questionsData = await questionsRes.json();
        const categoriesData = await categoriesRes.json();
        const subCategoriesData = await subCategoriesRes.json();

        setQuestions(questionsData);
        setCategories(categoriesData);
        setSubCategories(subCategoriesData);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setEditExplanation(question.explanation || '');
  };

  const handleCancel = () => {
    setEditingQuestion(null);
    setEditExplanation('');
  };

  const handleSave = async () => {
    if (!editingQuestion) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/v1/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editingQuestion.content,
          difficulty: editingQuestion.difficulty,
          explanation: editExplanation
        }),
      });

      if (response.ok) {
        // 성공 시 목록 갱신
        await fetchData();
        setEditingQuestion(null);
        setEditExplanation('');
      } else {
        alert('저장 실패');
      }
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장 중 오류 발생');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryInfo = (subCategoryId: string) => {
    const subCat = subCategories.find(s => s.id === subCategoryId);
    const cat = categories.find(c => c.id === subCat?.categoryId);
    return {
      categoryName: cat?.name || '알 수 없음',
      subCategoryName: subCat?.name || '알 수 없음'
    };
  };

  if (!mounted) return null;

  const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

  // 페이지네이션
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'} p-8`}>
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
              질문 관리
            </h1>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
              총 {questions.length}개의 질문 | {questions.filter(q => q.explanation).length}개 답변 완료
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-2xl shadow border transition-colors ${
              isDarkMode
                ? 'bg-[#1e293b] border-[#334155] hover:bg-[#2d3a4f]'
                : 'bg-white border-[#e2e8f0] hover:bg-[#f8fafc]'
            }`}
          >
            {isDarkMode ? (
              <SunIcon className="w-6 h-6 text-[#fbbf24]" />
            ) : (
              <MoonIcon className="w-6 h-6 text-[#64748b]" />
            )}
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
            로딩 중...
          </div>
        )}

        {/* 질문 목록 */}
        {!loading && (
          <div className="space-y-4">
            {currentQuestions.map((question) => {
              const { categoryName, subCategoryName } = getCategoryInfo(question.subCategoryId);
              const isEditing = editingQuestion?.id === question.id;

              return (
                <div
                  key={question.id}
                  className={`rounded-2xl p-6 transition-colors ${
                    isDarkMode ? 'bg-[#1e293b]' : 'bg-white'
                  } shadow-lg`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDarkMode
                          ? 'bg-[#3182f6]/20 text-[#60a5fa]'
                          : 'bg-[#dbeafe] text-[#1e40af]'
                      }`}>
                        {categoryName} &gt; {subCategoryName}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        question.difficulty === 'EASY'
                          ? isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                          : question.difficulty === 'MEDIUM'
                          ? isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                          : isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                      }`}>
                        {question.difficulty === 'EASY' ? '쉬움' : question.difficulty === 'MEDIUM' ? '보통' : '어려움'}
                      </span>
                      {question.explanation && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          ✓ 답변 있음
                        </span>
                      )}
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => handleEdit(question)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'hover:bg-[#334155] text-[#94a3b8]'
                            : 'hover:bg-[#f1f5f9] text-[#64748b]'
                        }`}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
                    {question.content}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={editExplanation}
                        onChange={(e) => setEditExplanation(e.target.value)}
                        placeholder="모범 답변을 입력하세요..."
                        className={`w-full p-4 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-[#3182f6] min-h-[150px] ${
                          isDarkMode
                            ? 'bg-[#0f172a] border-[#334155] text-white placeholder-[#64748b]'
                            : 'bg-[#f8fafc] border-[#e2e8f0] text-[#1e293b] placeholder-[#94a3b8]'
                        }`}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'bg-[#334155] text-white hover:bg-[#475569]'
                              : 'bg-[#e2e8f0] text-[#1e293b] hover:bg-[#cbd5e1]'
                          } disabled:opacity-50`}
                        >
                          <XMarkIcon className="w-5 h-5" />
                          취소
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3182f6] text-white hover:bg-[#2563eb] transition-colors disabled:opacity-50"
                        >
                          <CheckIcon className="w-5 h-5" />
                          {saving ? '저장 중...' : '저장'}
                        </button>
                      </div>
                    </div>
                  ) : question.explanation ? (
                    <div className={`text-sm rounded-xl p-4 ${
                      isDarkMode ? 'bg-[#0f172a] text-[#cbd5e1]' : 'bg-[#f1f5f9] text-[#64748b]'
                    }`}>
                      {question.explanation}
                    </div>
                  ) : (
                    <div className={`text-sm italic ${isDarkMode ? 'text-[#64748b]' : 'text-[#94a3b8]'}`}>
                      답변이 아직 작성되지 않았습니다.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-[#1e293b] text-white hover:bg-[#334155]'
                  : 'bg-white text-[#1e293b] hover:bg-[#f8fafc]'
              } disabled:opacity-50`}
            >
              이전
            </button>
            <span className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-[#1e293b]'}`}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-[#1e293b] text-white hover:bg-[#334155]'
                  : 'bg-white text-[#1e293b] hover:bg-[#f8fafc]'
              } disabled:opacity-50`}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
