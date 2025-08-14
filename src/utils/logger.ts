// src/utils/debugLogger.ts

// Vite 환경에서 개발 모드 여부를 확인합니다.
// 'import.meta.env.DEV'는 개발 서버 실행 시 true, 프로덕션 빌드 시 false입니다.
const isDevMode = import.meta.env.DEV;

/**
 * 개발 모드(npm run dev)에서만 작동하는 콘솔 로거입니다.
 * console.log처럼 여러 인자를 받아 객체를 펼쳐서 표시합니다.
 *
 * @param {any[]} args - console.log에 전달할 인자들
 */
export function customLog(...args: any[]) {
  if (isDevMode) {
    // console.log에 인자들을 스프레드 문법으로 전달하여
    // console.log의 원래 동작(객체 펼쳐보기 등)을 유지합니다.
    console.log('[DEV-DEBUG]', ...args);
  }
}
