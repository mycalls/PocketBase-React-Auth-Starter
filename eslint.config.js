// eslint.config.js

// 1. 필요한 패키지 임포트
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tailwind from 'eslint-plugin-tailwindcss';
import prettier from 'eslint-config-prettier';
// import vitest from 'eslint-plugin-vitest'; // 예시: 테스트 프레임워크 플러그인
import globals from 'globals';

// 2. tseslint.config() 헬퍼 함수로 전체 설정 시작
export default tseslint.config(
  // 3. 전역적으로 무시할 파일/폴더 설정
  {
    ignores: [
      'dist',
      'build',
      'node_modules',
      'coverage', // 테스트 커버리지 리포트
      '.next', // Next.js 빌드 폴더
      'public', // 정적 파일 폴더
      'pb_migrations', // PocketBase 마이그레이션 (자동 생성)
      'pb_data', // PocketBase 데이터 (DB, 로그 등)
      'old',
      // "pocketbase",
    ],
  },

  // 4. ESLint 기본 권장 규칙 (모든 파일에 적용)
  js.configs.recommended,

  // 5. TypeScript 타입 체크 규칙 (TS 파일에만 적용)
  // 이 한 줄에 파서, 플러그인, 규칙, 타입 검사를 위한 project 설정까지 모두 포함됨
  ...tseslint.configs.recommended,

  // 6. React 관련 규칙 (JSX/TSX 파일에 적용)
  {
    files: ['**/*.{jsx,tsx}'],
    ...react.configs.flat.recommended, // React의 공식 Flat Config 프리셋
    // rules: { ... } // 여기서 react.configs.flat.recommended 규칙을 덮어쓸 수 있음
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // 7. React Hooks 규칙 (JSX/TSX 파일에 적용)
  {
    files: ['**/*.{jsx,tsx}'],
    ...reactHooks.configs.recommended, // Hooks는 아직 flat 프리셋이 없지만, 플러그인 객체는 flat을 지원함
    plugins: {
      'react-hooks': reactHooks, // 플러그인 명시적 등록
    },
  },

  // 8. Tailwind CSS 규칙 (모든 관련 파일에 적용)
  {
    ...tailwind.configs['flat/recommended'],
    plugins: {
      tailwindcss: tailwind, // 플러그인 명시적 등록 (규칙 커스텀을 위해)
    },
    rules: {
      // Prettier 플러그인으로 클래스 정렬을 할 경우 ESLint 규칙은 끈다.
      'tailwindcss/classnames-order': 'off',
    },
  },

  // 9. 테스트 파일 전용 설정 (Vitest 예시)
  // {
  //   files: ['**/*.test.{ts,tsx,js,jsx}'],
  //   ...vitest.configs.recommended,
  //   plugins: {
  //     vitest,
  //   },
  //   rules: {},
  // },

  // 10. 전역 변수 및 파서 재지정 (가장 중요한 부분!)
  // ★ 다른 설정들이 languageOptions를 덮어쓰지 않도록, 별도 객체로 분리하여 관리
  {
    languageOptions: {
      // tseslint.configs.strictTypeChecked가 이미 파서와 project 설정을 했지만,
      // 혹시 모를 충돌을 방지하고 명시적으로 하기 위해 한 번 더 설정.
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser, // 브라우저 환경 전역 변수
        ...globals.node, // Node.js 환경 전역 변수 (필요 시)
      },
    },
    // 사용자 정의 규칙 추가
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // 11. Prettier 충돌 방지 설정 (★ 반드시 가장 마지막에 위치)
  prettier,
);
