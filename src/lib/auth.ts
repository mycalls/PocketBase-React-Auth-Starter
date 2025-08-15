// src/lib/auth.ts

import { redirect, type ParsedLocation } from '@tanstack/react-router';
import pb from './pocketbase';

// Query-string key to remember where to go after sign-in.
// 로그인 후 돌아갈 위치를 저장하는 쿼리스트링 키.
const REDIRECT_PARAM = 'redirect';

// Guard: if not authenticated, redirect to /signin and include the current URL.
// 인증 가드: 미인증 시 /signin 으로 리디렉션하며 현재 URL을 함께 전달.
export const protectPage = (location?: ParsedLocation): void => {
  if (!pb.authStore.isValid) {
    throw redirect({
      to: '/signin',
      search: {
        // carry current location (optional)
        // 현재 위치 전달(선택적)
        [REDIRECT_PARAM]: location?.href,
      },
    });
  }
};

// Read redirect target from the URL, defaulting to "/".
// URL에서 리디렉션 대상 경로를 읽고, 없으면 "/"로 기본 처리.
export const getRedirectAfterSignIn = (): string => {
  return new URLSearchParams(location.search).get(REDIRECT_PARAM) || '/';
};
