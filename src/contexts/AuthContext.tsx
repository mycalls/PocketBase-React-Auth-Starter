// src/contexts/AuthContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import pb from '../lib/pocketbase';
import type {
  AuthMethodsList,
  AuthRecord,
  ClientResponseError,
  OTPResponse,
  RecordAuthResponse,
  RecordModel,
} from 'pocketbase';
import { customLog } from '../utils/logger';
import { collectionNames } from '../constants';

interface AuthState {
  isAuthed: boolean;
  isSuperuser: boolean;
  user: AuthRecord | null;
  token: string;
}

// EN: Shape of the return value when MFA is required during auth flows.
// KR: 인증 과정에서 MFA가 필요한 경우 반환되는 객체의 형태입니다.
export interface MfaChallengeResponse {
  mfa: true;
  mfaId: string;
}

interface AuthContextType extends AuthState {
  signUp: (
    email: string,
    password: string,
  ) => Promise<RecordAuthResponse<RecordModel> | MfaChallengeResponse>;
  signIn: (
    email: string,
    password: string,
    isAdmin?: boolean,
  ) => Promise<RecordAuthResponse<RecordModel> | MfaChallengeResponse>;
  requestOtp: (email: string) => Promise<OTPResponse>;
  authWithOtp: (
    req: OTPResponse,
    otp: string,
    mfaId?: string,
  ) => Promise<RecordAuthResponse<RecordModel>>;
  authWithOAuth: (oAuthProvider: string) => Promise<RecordAuthResponse<RecordModel>>;
  logout: () => void;
  resetPassword: (email: string, isAdmin?: boolean) => Promise<boolean>;
  refresh: () => Promise<RecordAuthResponse<RecordModel> | undefined>;
  listAuthMethods: () => Promise<AuthMethodsList>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // EN: Initialize auth state from PocketBase authStore on first render.
  // KR: 첫 렌더 시 PocketBase authStore 값으로 인증 상태를 초기화합니다.
  const [authState, setAuthState] = useState<AuthState>({
    isAuthed: pb.authStore.isValid,
    isSuperuser: pb.authStore.isSuperuser,
    user: pb.authStore.record,
    token: pb.authStore.token,
  });

  // EN: Sync React state whenever PocketBase authStore changes.
  // KR: PocketBase authStore 변경 시 React 상태를 동기화합니다.
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, record) => {
      customLog('Auth store changed!', token, record);
      setAuthState({
        isAuthed: pb.authStore.isValid,
        isSuperuser: pb.authStore.isSuperuser,
        user: record as AuthRecord | null,
        token: token,
      });
    });

    return unsubscribe;
  }, []);

  // EN: Register user with email/password, then attempt login. If MFA is required, return mfaId.
  // KR: 이메일/비밀번호로 사용자 등록 후 로그인 시도. MFA 필요 시 mfaId를 반환합니다.
  const signUp = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<RecordAuthResponse<RecordModel> | MfaChallengeResponse> => {
      const userData = { email, password, passwordConfirm: password };

      await pb.collection(collectionNames.users).create(userData);

      try {
        const response = await pb
          .collection(collectionNames.users)
          .authWithPassword(email, password);

        if (response && !response.record.verified) {
          // EN: Send verification email if the account is not verified yet.
          // KR: 계정이 아직 미인증 상태면 인증 메일을 발송합니다.
          await pb.collection(collectionNames.users).requestVerification(email);
        }
        return response;
      } catch (err) {
        const clientError = err as ClientResponseError;
        const mfaId = clientError.response?.mfaId;

        if (mfaId) {
          // EN: Auth requires MFA; return mfaId to continue the flow on the client.
          // KR: MFA가 필요한 경우 클라이언트가 이어갈 수 있도록 mfaId를 반환합니다.
          customLog('MFA required after sign up, mfaId:', mfaId);
          return { mfa: true, mfaId };
        }
        throw err;
      }
    },
    [],
  );

  // EN: Authenticate with email/password (optionally against admin collection). Returns MFA hint if required.
  // KR: 이메일/비밀번호로 로그인(관리자 컬렉션 선택 가능). MFA 필요 시 해당 정보를 반환합니다.
  const signIn = useCallback(
    async (
      email: string,
      password: string,
      isAdmin?: boolean,
    ): Promise<RecordAuthResponse<RecordModel> | MfaChallengeResponse> => {
      const collection = isAdmin ? collectionNames.admins : collectionNames.users;
      try {
        const response = await pb.collection(collection).authWithPassword(
          email,
          password,
          isAdmin
            ? {
                // EN: Auto re-auth ~30 minutes before token expiration for admins.
                // KR: 관리자 토큰 만료 30분 전 자동 재인증 설정입니다.
                autoRefreshThreshold: 30 * 60,
              }
            : undefined,
        );
        return response;
      } catch (err) {
        const clientError = err as ClientResponseError;
        customLog('Sign In Error:', clientError);

        const mfaId = clientError.response?.mfaId;
        if (mfaId) {
          // EN: MFA required; pass mfaId back to caller.
          // KR: MFA 필요 시 mfaId를 호출자에게 전달합니다.
          customLog('MFA required, mfaId:', mfaId);
          return { mfa: true, mfaId: mfaId };
        }
        throw err;
      }
    },
    [],
  );

  // EN: Send an OTP email to the given address.
  // KR: 지정된 이메일로 OTP 메일을 전송합니다.
  const requestOtp = useCallback(async (email: string): Promise<OTPResponse> => {
    return pb.collection(collectionNames.users).requestOTP(email);
  }, []);

  // EN: Complete OTP authentication (optionally provide mfaId for MFA continuation).
  // KR: OTP 인증을 완료합니다(MFA 연속 처리를 위해 mfaId를 선택적으로 전달).
  const authWithOtp = useCallback(
    async (
      req: OTPResponse,
      otp: string,
      mfaId?: string,
    ): Promise<RecordAuthResponse<RecordModel>> => {
      const options = mfaId ? { mfaId } : undefined;
      return await pb.collection(collectionNames.users).authWithOTP(req.otpId, otp, options);
    },
    [],
  );

  // EN: OAuth2 authentication using the provided provider key.
  // KR: 지정한 공급자 키로 OAuth2 인증을 수행합니다.
  const authWithOAuth = useCallback(
    async (oAuthProvider: string): Promise<RecordAuthResponse<RecordModel>> => {
      return pb.collection(collectionNames.users).authWithOAuth2({ provider: oAuthProvider });
    },
    [],
  );

  // EN: Clear local auth state (logout).
  // KR: 로컬 인증 정보를 초기화하여 로그아웃합니다.
  const logout = useCallback((): void => {
    pb.authStore.clear();
  }, []);

  // EN: Trigger password reset email for users/admins depending on the flag.
  // KR: 사용자/관리자 여부에 따라 비밀번호 재설정 이메일을 발송합니다.
  const resetPassword = useCallback(async (email: string, isAdmin?: boolean): Promise<boolean> => {
    const collection = isAdmin ? collectionNames.admins : collectionNames.users;
    return pb.collection(collection).requestPasswordReset(email);
  }, []);

  // EN: Permanently delete the currently authenticated account, then clear local auth state.
  // KR: 현재 인증된 계정을 영구 삭제한 뒤 로컬 인증 상태를 초기화합니다.
  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!pb.authStore.isValid || !pb.authStore.record) {
      throw new Error('User is not authenticated.');
    }

    try {
      const collectionName = pb.authStore.record.collectionName;
      const userId = pb.authStore.record.id;

      await pb.collection(collectionName).delete(userId);

      // EN: After server-side deletion, ensure local session is cleared.
      // KR: 서버에서 삭제 후 로컬 세션을 정리합니다.
      pb.authStore.clear();
    } catch (error) {
      customLog('Failed to delete account', error);
      throw error;
    }
  }, []);

  // EN: Refresh auth token using the record's collection name (SDK v0.25+ provides it consistently).
  // KR: 레코드의 collectionName으로 토큰을 갱신합니다(SDK v0.25+에서 항상 제공).
  const refresh = useCallback(async (): Promise<RecordAuthResponse<RecordModel> | undefined> => {
    if (!pb.authStore.isValid) return;

    return pb
      .collection(pb.authStore.record?.collectionName || collectionNames.users)
      .authRefresh();
  }, []);

  const listAuthMethods = useCallback(async (): Promise<AuthMethodsList> => {
    return pb.collection(collectionNames.users).listAuthMethods();
  }, []);

  // EN: Memoize context value so consumers re-render only when authState or handlers change.
  // KR: authState나 핸들러가 바뀔 때만 컨텍스트 값이 재생성되도록 메모이제합니다.
  const contextValue = useMemo(
    () => ({
      ...authState,
      signUp,
      signIn,
      requestOtp,
      authWithOtp,
      authWithOAuth,
      logout,
      refresh,
      listAuthMethods,
      resetPassword,
      deleteAccount,
    }),
    [
      authState,
      signUp,
      signIn,
      requestOtp,
      authWithOtp,
      authWithOAuth,
      logout,
      refresh,
      listAuthMethods,
      resetPassword,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// EN: Custom hook to access the auth context safely.
// KR: 인증 컨텍스트에 안전하게 접근하기 위한 커스텀 훅입니다.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
