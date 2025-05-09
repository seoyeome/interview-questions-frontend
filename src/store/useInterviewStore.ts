'use client';

import { create } from 'zustand';
import { Category, InterviewState, Question } from '@/types/interview';

// 임시 질문 데이터 (나중에 백엔드 API로 대체)
const sampleQuestions: Question[] = [
  {
    id: 1,
    category: 'CS',
    content: '프로세스와 스레드의 차이점을 설명해주세요.',
    explanation: '프로세스는 실행 중인 프로그램의 인스턴스로 독립된 메모리 공간을 가지며, 스레드는 프로세스 내에서 실행되는 작업 단위로 프로세스의 메모리를 공유합니다.'
  },
  {
    id: 2,
    category: '백엔드',
    content: 'RESTful API의 특징과 장점을 설명해주세요.',
    explanation: 'REST는 Representational State Transfer의 약자로, 자원을 URI로 표현하고 HTTP 메서드를 통해 자원을 처리하는 아키텍처 스타일입니다. 확장성과 유연성이 뛰어나며 클라이언트-서버 분리가 용이합니다.'
  },
  {
    id: 3,
    category: 'DB',
    content: '인덱스(Index)의 개념과 장단점을 설명해주세요.',
    explanation: '인덱스는 데이터베이스 검색 속도를 향상시키기 위한 자료구조입니다. B-Tree 등의 구조로 구현되며, 검색은 빠르지만 추가/수정/삭제 시 인덱스 갱신 비용이 발생합니다.'
  },
  {
    id: 4,
    category: '네트워크',
    content: 'TCP와 UDP의 차이점을 설명해주세요.',
    explanation: 'TCP는 연결 지향형 프로토콜로 신뢰성 있는 데이터 전송을 보장하며, UDP는 비연결형 프로토콜로 신뢰성은 낮지만 빠른 전송이 가능합니다.'
  }
];

export const useInterviewStore = create<InterviewState>((set, get) => ({
  selectedCategory: null,
  currentQuestion: null,
  userAnswer: '',
  isExplanationVisible: false,

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    if (category) {
      get().generateNewQuestion();
    } else {
      set({ currentQuestion: null });
    }
  },

  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  
  setUserAnswer: (answer) => set({ userAnswer: answer }),
  
  toggleExplanation: () => set((state) => ({ 
    isExplanationVisible: !state.isExplanationVisible 
  })),

  generateNewQuestion: () => {
    const { selectedCategory } = get();
    const filteredQuestions = selectedCategory
      ? sampleQuestions.filter(q => q.category === selectedCategory)
      : sampleQuestions;
    
    if (filteredQuestions.length === 0) {
      set({ currentQuestion: null });
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    const newQuestion = filteredQuestions[randomIndex];
    
    set({ 
      currentQuestion: newQuestion,
      userAnswer: '',
      isExplanationVisible: false
    });
  }
})); 