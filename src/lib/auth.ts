// src/lib/auth.ts

import { redirect, type ParsedLocation } from '@tanstack/react-router';
import pb from './pocketbase';

const REDIRECT_PARAM = 'redirect';

export const protectPage = (location?: ParsedLocation): void => {
  if (!pb.authStore.isValid) {
    throw redirect({
      to: '/signin',
      search: {
        [REDIRECT_PARAM]: location?.href,
      },
    });
  }
};

export const getRedirectAfterSignIn = (): string => {
  return new URLSearchParams(location.search).get(REDIRECT_PARAM) || '/';
};
