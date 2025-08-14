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

// MFA가 필요할 때 signIn 함수가 반환할 객체의 타입
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
  // auth 정보 초기화
  const [authState, setAuthState] = useState<AuthState>({
    isAuthed: pb.authStore.isValid,
    isSuperuser: pb.authStore.isSuperuser,
    user: pb.authStore.record,
    token: pb.authStore.token,
  });

  // onChange 리스너로 auth 정보 변경시 즉시 반영
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, record) => {
      customLog('Auth store changed!', token, record);
      // console.log('Auth store changed!', token, record);
      setAuthState({
        isAuthed: pb.authStore.isValid,
        isSuperuser: pb.authStore.isSuperuser,
        user: record as AuthRecord | null,
        token: token,
      });
    });

    return unsubscribe;
  }, []);

  // 이메일, 비밀번호로 사용자 등록
  const signUp = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<RecordAuthResponse<RecordModel> | MfaChallengeResponse> => {
      const userData = {
        email,
        password,
        passwordConfirm: password,
      };
      // 사용자 생성
      await pb.collection(collectionNames.users).create(userData);

      // 생성된 계정으로 로그인 시도
      try {
        const response = await pb
          .collection(collectionNames.users)
          .authWithPassword(email, password);
        if (response && !response.record.verified) {
          // 인증 이메일 요청
          await pb.collection(collectionNames.users).requestVerification(email);
        }
        return response;
      } catch (err) {
        const clientError = err as ClientResponseError;
        const mfaId = clientError.response?.mfaId;

        if (mfaId) {
          // MFA가 필요한 경우, mfaId와 함께 특별한 객체 반환
          customLog('MFA required after sign up, mfaId:', mfaId);
          // OTP를 발송해야 함을 클라이언트에게 알리기 위해 email도 함께 보낼 수 있습니다.
          // 혹은 클라이언트가 이미 email을 알고 있으므로 mfaId만으로도 충분합니다.
          return { mfa: true, mfaId: mfaId };
        }
        // 다른 에러는 그대로 throw
        throw err;
      }
    },
    [],
  );

  // 이메일, 비밀번호로 사용자 로그인
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
                /* 만료 30분 전 자동 재인증 */
                autoRefreshThreshold: 30 * 60,
              }
            : undefined,
        );
        return response;
      } catch (err) {
        // PocketBase 에러 타입인지 확인
        const clientError = err as ClientResponseError;

        customLog('Sign In Error:', clientError);

        const mfaId = clientError.response?.mfaId;

        // MFA ID가 있다면 MFA 인증이 필요하다는 의미
        if (mfaId) {
          customLog('MFA required, mfaId:', mfaId);
          return { mfa: true, mfaId: mfaId };
        }

        // MFA가 아니라면 일반 에러이므로 다시 throw
        throw err;
      }
    },
    [],
  );

  // send OTP email to the provided auth record
  const requestOtp = useCallback(async (email: string): Promise<OTPResponse> => {
    return pb.collection(collectionNames.users).requestOTP(email);
  }, []);

  // authenticate with the requested OTP id and the email password
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

  // auth with oauth2
  const authWithOAuth = useCallback(
    async (oAuthProvider: string): Promise<RecordAuthResponse<RecordModel>> => {
      return pb.collection(collectionNames.users).authWithOAuth2({ provider: oAuthProvider });
    },
    [],
  );

  // 사용자 로그아웃
  const logout = useCallback((): void => {
    pb.authStore.clear();
  }, []);

  // 로그인창에서 forgot passwod를 누를 시 비밀번호 재설정
  const resetPassword = useCallback(async (email: string, isAdmin?: boolean): Promise<boolean> => {
    const collection = isAdmin ? collectionNames.admins : collectionNames.users;
    return pb.collection(collection).requestPasswordReset(email);
  }, []);

  // 2. 사용자 계정 삭제 메서드를 구현합니다.
  const deleteAccount = useCallback(async (): Promise<void> => {
    // 로그인된 사용자가 있는지, 레코드 정보가 있는지 확인합니다.
    if (!pb.authStore.isValid || !pb.authStore.record) {
      throw new Error('User is not authenticated.');
    }

    try {
      // 현재 로그인된 사용자의 컬렉션 이름과 ID를 가져옵니다.
      // 이렇게 하면 일반 사용자와 슈퍼유저 모두에게 동작합니다.
      const collectionName = pb.authStore.record.collectionName;
      const userId = pb.authStore.record.id;

      // PocketBase에서 사용자 레코드를 삭제합니다.
      await pb.collection(collectionName).delete(userId);

      // 서버에서 계정이 삭제되었으므로 클라이언트에서도 로그아웃 처리합니다.
      // 기존 logout 함수를 호출하여 authStore를 깨끗하게 비웁니다.
      // logout함수를 사용시 의존성에 추가할 것.
      // logout();
      pb.authStore.clear();
    } catch (error) {
      customLog('Failed to delete account', error);
      // 에러를 다시 던져서 호출한 컴포넌트에서 처리할 수 있도록 합니다.
      throw error;
    }
  }, []); // logout 함수를 의존성 배열에 추가합니다.

  // 토큰 갱신
  // 서비스 진입시 실행. 추후 타이머 넣을 지 고려
  const refresh = useCallback(async (): Promise<RecordAuthResponse<RecordModel> | undefined> => {
    if (!pb.authStore.isValid) return;
    // 관리자의 경우 'users'가 아닌 '_superusers'로 접근햐야 하는 것인지 알 수 없음
    // _superusers로 접근해야 되는 경우

    // const coll = pb.authStore.isSuperuser ? '_superusers' : 'users';
    // return pb.collection(coll).authRefresh();

    // return pb.collection('users').authRefresh();

    // SDK v0.25+ ‑ 레코드에 항상 collectionName 이 들어오므로 그대로 사용
    return pb
      .collection(pb.authStore.record?.collectionName || collectionNames.users)
      .authRefresh();
  }, []);

  const listAuthMethods = useCallback(async (): Promise<AuthMethodsList> => {
    return pb.collection(collectionNames.users).listAuthMethods();
  }, []);

  // Context를 통해 전달할 값입니다.
  // useMemo를 사용하여 authState가 변경될 때만 객체가 재생성되도록 최적화합니다.
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

// 커스텀 훅: 컴포넌트에서 쉽게 Context 값에 접근할 수 있도록 합니다.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
