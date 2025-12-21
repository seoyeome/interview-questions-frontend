# 📚 Interview Questions Frontend

면접 질문을 관리하고 학습할 수 있는 웹 애플리케이션의 프론트엔드 프로젝트입니다.

## 🛠 기술 스택

### 프레임워크 & 라이브러리
- [Next.js](https://nextjs.org/) 15 - React 프레임워크 (App Router, Turbopack)
- [React](https://reactjs.org/) 19 - UI 라이브러리
- [TypeScript](https://www.typescriptlang.org/) - 정적 타입 지원
- [TailwindCSS](https://tailwindcss.com/) - 유틸리티 우선 CSS 프레임워크

### UI/UX
- [next-themes](https://github.com/pacocoursey/next-themes) - 다크모드/라이트모드 지원
- [Driver.js](https://driverjs.com/) - 튜토리얼 및 온보딩 가이드
- [react-hot-toast](https://react-hot-toast.com/) - 토스트 알림
- 반응형 디자인 (Mobile, Tablet, Desktop)

### 개발 도구
- [ESLint](https://eslint.org/) - 코드 린팅
- [PostCSS](https://postcss.org/) - CSS 전처리기
- [npm](https://www.npmjs.com/) - 패키지 매니저

## ✨ 주요 기능

### AI 질문 생성
- Google Gemini API를 활용한 맞춤형 면접 질문 생성
- 카테고리/서브카테고리/난이도별 질문 생성
- 일일 생성 횟수 제한 (할당량 관리)

### 질문 학습
- 카테고리별 질문 분류 (Backend, Frontend, Database, DevOps, CS)
- 서브카테고리별 상세 분류
- 난이도별 필터링 (쉬움, 보통, 어려움)

### 사용자 인증
- 카카오 OAuth 2.0 소셜 로그인
- JWT 쿠키 기반 인증 (HttpOnly, Secure)

### UI/UX
- 다크모드/라이트모드 자동 전환
- Driver.js 기반 튜토리얼 시스템
- react-hot-toast 알림
- 모바일 최적화 반응형 디자인

## 🚀 시작하기

### 필수 요구사항
- Node.js 18 이상
- npm

### 설치 방법

1. 저장소 클론
```bash
git clone git@github.com:seoyeome/interview-questions-frontend.git
cd interview-questions-frontend
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
# .env.local 파일 생성
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8080" > .env.local
```

4. 개발 서버 실행
```bash
npm run dev
```

이제 [http://localhost:3000](http://localhost:3000)에서 프로젝트를 확인할 수 있습니다.

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
src/
├── app/                      # Next.js 15 App Router
│   ├── layout.tsx            # 루트 레이아웃
│   ├── page.tsx              # 랜딩 페이지
│   ├── globals.css           # 전역 스타일 (다크모드 CSS 변수)
│   ├── dashboard/            # 대시보드 (AI 질문 생성)
│   │   └── page.tsx          # 카테고리/서브카테고리 선택, 질문 생성
│   ├── oauth2/               # OAuth2 리다이렉트 페이지
│   │   └── redirect/
│   └── api/                  # API 라우트 핸들러
├── components/               # 재사용 가능한 컴포넌트
├── lib/                      # 유틸리티 및 헬퍼
│   ├── api.ts                # API 클라이언트 (fetch wrapper)
│   └── logger.ts             # 환경별 로깅 시스템
└── types/                    # TypeScript 타입 정의
```

## 🎨 테마 시스템

### 다크모드/라이트모드
- `next-themes`를 사용한 테마 전환
- 시스템 테마 자동 감지
- CSS 변수 기반 색상 시스템
- 페이지별 테마 일관성 유지

### 색상 변수
```css
/* globals.css */
:root {
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --bg-primary: #ffffff;
  --border-color: #d1d5db;
}

.dark {
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --bg-primary: #0f172a;
  --border-color: #374151;
}
```

## 🌐 주요 페이지

### 공개 페이지
- `/` - 랜딩 페이지 (카카오 로그인)
- `/oauth2/redirect` - OAuth2 로그인 콜백

### 인증 필요 페이지
- `/dashboard` - AI 질문 생성 대시보드
  - 카테고리/서브카테고리 선택
  - 난이도 선택
  - AI 질문 생성 및 확인
  - 튜토리얼 가이드 (Driver.js)

## 🔌 API 통신

### API 클라이언트 구조
```typescript
// lib/api.ts
class ApiClient {
  private baseUrl = '/api/v1';
  private logger = createLogger('API Client');

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${normalizePath(endpoint)}`;
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include', // 쿠키 포함
    });

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'API 요청에 실패했습니다', data);
    }

    return data;
  }
}
```

### 환경별 로깅
```typescript
// lib/logger.ts
class Logger {
  debug(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.log(this.formatMessage('DEBUG', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    // ERROR는 항상 출력 (프로덕션에서도)
    console.error(this.formatMessage('ERROR', message), ...args);
  }
}
```

## 🔧 설정 파일

- `next.config.ts` - Next.js 설정
- `tailwind.config.ts` - TailwindCSS 설정
- `postcss.config.mjs` - PostCSS 설정
- `tsconfig.json` - TypeScript 설정
- `.npmrc` - pnpm 설정
- `eslint.config.mjs` - ESLint 설정

## 🌍 환경 변수

프로젝트 실행에 필요한 환경 변수:

### 개발 환경 (.env.local)
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### 프로덕션 환경
```bash
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

## 🎯 개발 가이드

### 새 페이지 추가
1. `src/app/[페이지명]/page.tsx` 생성
2. 다크모드 지원을 위해 `useTheme` 훅 사용
3. CSS 변수 활용 (`--text-primary`, `--bg-primary` 등)

### API 연동
1. `lib/api.ts`의 `apiClient` 사용
2. `lib/logger.ts`의 `createLogger`로 로깅
3. ApiError 클래스로 에러 처리


## 📊 성능 최적화

- **Next.js 15 Turbopack**: 빠른 개발 서버 시작 및 HMR
- **자동 코드 스플리팅**: 페이지별 번들 분리로 초기 로딩 최적화
- **동적 임포트**: 필요한 시점에 컴포넌트 로드
- **환경별 로깅**: 프로덕션에서 불필요한 로그 제거로 성능 향상

## 🔐 보안

- **JWT 토큰 보호**: HttpOnly, Secure 쿠키로 저장 (XSS 공격 방지)
- **쿠키 자동 포함**: `credentials: 'include'` 설정으로 인증 쿠키 자동 전송
- **환경 변수 분리**: `.env.local` 파일로 민감 정보 관리
- **타입 안전성**: TypeScript로 런타임 에러 최소화
- **에러 정보 보호**: 프로덕션에서 상세 에러 로그 숨김

## 📱 반응형 디자인

### 브레이크포인트
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### 다크모드/라이트모드
- 시스템 테마 자동 감지
- 사용자 선택 테마 localStorage 저장
- CSS 변수 기반 테마 전환으로 깜빡임 없음

### 테스트된 환경
- Chrome, Firefox, Safari (최신 버전)
- iOS Safari, Chrome Mobile
- 다양한 화면 크기 (375px ~ 1920px)
