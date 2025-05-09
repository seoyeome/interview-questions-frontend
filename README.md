# 📚 Interview Questions Frontend

면접 질문을 관리하고 학습할 수 있는 웹 애플리케이션의 프론트엔드 프로젝트입니다.

## 🛠 기술 스택

### 프레임워크 & 라이브러리
- [Next.js](https://nextjs.org/) - React 프레임워크
- [React](https://reactjs.org/) - UI 라이브러리
- [TailwindCSS](https://tailwindcss.com/) - CSS 프레임워크
- [Framer Motion](https://www.framer.com/motion/) - 애니메이션 라이브러리

### 상태 관리
- [Zustand](https://zustand-demo.pmnd.rs/) - 전역 상태 관리

### 개발 도구
- [TypeScript](https://www.typescriptlang.org/) - 정적 타입 지원
- [ESLint](https://eslint.org/) - 코드 린팅
- [PostCSS](https://postcss.org/) - CSS 전처리기

### 패키지 매니저
- [pnpm](https://pnpm.io/) - 빠르고 디스크 효율적인 패키지 매니저

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- pnpm 8.15.4 이상

### 설치 방법

1. 저장소 클론
```bash
git clone git@github.com:seoyeome/interview-questions-frontend.git
cd interview-questions-frontend
```

2. 의존성 설치
```bash
pnpm install
```

3. 개발 서버 실행
```bash
pnpm dev
```

이제 [http://localhost:3000](http://localhost:3000)에서 프로젝트를 확인할 수 있습니다.

## 📦 자동화된 의존성 관리

이 프로젝트는 GitHub Actions를 통해 자동화된 의존성 관리를 제공합니다:

- 매주 월요일마다 자동으로 의존성 업데이트 체크
- 보안 업데이트 발생 시 자동 PR 생성
- 버그 수정(패치) 업데이트 시 자동 PR 생성
- 메이저/마이너 버전 업데이트는 이슈로 생성

## 📁 프로젝트 구조

```
src/
├── app/              # Next.js 13+ App Router
├── components/       # 재사용 가능한 컴포넌트
├── store/           # Zustand 상태 관리
├── types/           # TypeScript 타입 정의
└── styles/          # 전역 스타일
```

## 🔧 설정 파일

- `next.config.ts` - Next.js 설정
- `tailwind.config.ts` - TailwindCSS 설정
- `postcss.config.mjs` - PostCSS 설정
- `tsconfig.json` - TypeScript 설정
- `.npmrc` - pnpm 설정
- `eslint.config.mjs` - ESLint 설정

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. `feature/기능이름` 또는 `fix/버그이름` 형식으로 브랜치 생성
3. 변경사항 커밋
4. Pull Request 생성

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
