// src/utils/debugLogger.ts

// DEV flag for Vite: true when running dev server, false in production builds.
// Vite의 개발 모드 플래그: 개발 서버에서 true, 프로덕션 빌드에서 false.
const isDevMode = import.meta.env.DEV;

/**
 * Dev-only console logger. Behaves like console.log (keeps object expansion).
 */
export function customLog<T extends readonly unknown[]>(...args: T): void {
  if (!isDevMode) return;
  // console.log의 타입(any[])과 충돌하지 않도록 시그니처만 좁혀서 사용
  (console.log as (...data: unknown[]) => void)('[DEV-DEBUG]', ...args);
}
