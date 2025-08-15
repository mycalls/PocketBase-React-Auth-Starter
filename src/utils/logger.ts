// src/utils/debugLogger.ts

// DEV flag for Vite: true when running dev server, false in production builds.
// Vite의 개발 모드 플래그: 개발 서버에서 true, 프로덕션 빌드에서 false.
const isDevMode = import.meta.env.DEV;

/**
 * Dev-only console logger. Behaves like console.log (keeps object expansion).
 * 개발 모드에서만 동작하는 콘솔 로거. console.log처럼 객체 펼침/여러 인자를 그대로 유지합니다.
 *
 * @param {...any} args Values passed to console.log
 * @param {...any} args console.log에 전달할 값들
 */
export function customLog(...args: any[]) {
  if (isDevMode) {
    // Prefix to indicate dev debug logs.
    // 개발 디버그 로그임을 나타내는 접두사.
    console.log('[DEV-DEBUG]', ...args);
  }
}
