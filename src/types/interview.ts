export type Category = 'CS' | '백엔드' | 'DB' | '네트워크';

export interface Question {
  id: number;
  category: Category;
  content: string;
  explanation?: string;
}

export interface Answer {
  questionId: number;
  content: string;
  timestamp: number;
}

export interface InterviewState {
  selectedCategory: Category | null;
  currentQuestion: Question | null;
  userAnswer: string;
  isExplanationVisible: boolean;
  setSelectedCategory: (category: Category | null) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setUserAnswer: (answer: string) => void;
  toggleExplanation: () => void;
  generateNewQuestion: () => void;
} 