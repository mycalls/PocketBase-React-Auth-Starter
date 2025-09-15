// eslint.config.js

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  {
    ignores: [
      'dist',
      'build',
      'node_modules',
      'coverage',
      '.next',
      'public',
      'pb_migrations', // PocketBase 마이그레이션 (자동 생성),
      'pb_data', // PocketBase 데이터 (DB, 로그 등),
      'old',
    ],
  },

  // 기본 자바스크립트 및 타입스크립트 규칙
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,

  // 브라우저 전역: 앱 소스 전반
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
  },
  // Node 전역: 설정/스크립트만 정확히 매칭
  {
    files: [
      '*.{js,cjs,mjs}',
      'scripts/**/*.{js,ts,cjs,mjs}',
      'tools/**/*.{js,ts,cjs,mjs}',
      '**/*.config.{js,ts,cjs,mjs,cts,mts}',
      '**/.*rc.{js,cjs,mjs}',
    ],
    languageOptions: { globals: { ...globals.node } },
  },

  // 타입스크립트 특정 설정
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // JS 등엔 타입드 린팅 끄기 (예시)
  { files: ['**/*.js'], extends: [tseslint.configs.disableTypeChecked] },

  // React 및 JSX 특정 설정
  {
    files: ['**/*.{jsx,tsx}'],
    settings: { react: { version: 'detect' } },
    // React는 flat config 제공, Hooks는 플러그인/룰 직접 등록
    extends: [
      react.configs.flat.recommended,
      // eslint-plugin-react-hooks v5.2.0
      reactHooks.configs['recommended-latest'],
      // eslint-plugin-react-hooks v6 부터 사용가능
      // reactHooks.configs.recommended,
      react.configs.flat['jsx-runtime'],
    ],
  },

  // custom rules
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {},
  },

  // 포맷터 설정
  prettier,
);
