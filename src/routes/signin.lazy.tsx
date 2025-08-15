// src/routes/signin.lazy.tsx

import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getRedirectAfterSignIn } from '../lib/auth';
import { CenterDiv } from '../components/ui/CenterDiv';
import { FormCard, FormCardDescription, FormCardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { InputField } from '../components/ui/InputField';
import { SubmitButton } from '../components/ui/SubmitButton';
import { useAuth, type MfaChallengeResponse } from '../contexts/AuthContext';
import type { AuthMethodsList, OTPResponse } from 'pocketbase';
import { customLog } from '../utils/logger';
import { CheckboxWithLabel } from '../components/ui/CheckboxWithLabel';
import { TextButton } from '../components/ui/TextButton';
import { Divider } from '../components/ui/Divider';
import { AlertText } from '../components/ui/AlertText';
import { PrimaryActionButton } from '../components/ui/PrimaryActionButton';
import { OAuthButtons } from '../components/ui/OAuthButtons';
import { TimeBadge } from '../components/ui/TimeBadge';

// Auth screen with password, OTP, and MFA flows.
// 비밀번호, OTP, MFA 흐름을 포함한 인증 화면.

export const Route = createLazyFileRoute('/signin')({
  component: UserAuthForm,
});

// OTP input validity window (seconds).
// OTP 입력 유효 시간(초)
// it must be same with the setting value of pocketbase
// pocketbase 설정과 똑같이 설정할 것.
const otpDurationInSeconds: number = 180;

// Narrow any to MFA-challenge result.
// any 응답이 MFA 챌린지인지 판별하는 타입 가드.
function isMfaChallenge(response: any): response is MfaChallengeResponse {
  return response && response.mfa === true && typeof response.mfaId === 'string';
}

interface UserSignInFormProps {
  onMfaRequired: (mfaId: string, email: string) => void;
  onSignInSuccess: () => void;
}

function UserSignInForm({ onMfaRequired, onSignInSuccess }: UserSignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  // Handle password sign-in and branch to MFA if needed.
  // 비밀번호 로그인 처리 및 필요 시 MFA 단계로 분기
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(email, password, isAdmin);
      if (isMfaChallenge(result)) {
        // Notify parent to start MFA flow.
        // 상위 컴포넌트에 MFA 진행 필요 알림
        onMfaRequired(result.mfaId, email);
        setError('MFA required. An OTP has been sent to your email.');
      } else {
        // On success, let parent navigate.
        // 성공 시 상위 컴포넌트에 알림(네비게이션)
        onSignInSuccess();
      }
    } catch (error) {
      console.error('Error handleSignIn:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSignIn} action="#">
      <div>
        <FormCardTitle>Sign In</FormCardTitle>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <InputField
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <InputField
          id="password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <CheckboxWithLabel
        id="admin-auth"
        label="Admin"
        checked={isAdmin}
        onChange={(e) => setIsAdmin((e.target as HTMLInputElement).checked)}
      />
      {error && <AlertText variant="error">{error}</AlertText>}
      <div>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Sign In'}
        </SubmitButton>
      </div>
    </form>
  );
}

interface UserSignUpFormProps {
  onMfaRequired: (mfaId: string, email: string) => void;
  onSignUpSuccess: () => void;
}

function UserSignUpForm({ onMfaRequired, onSignUpSuccess }: UserSignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  // Create account, then branch to MFA if required.
  // 계정 생성 후 필요 시 MFA 단계로 분기
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password);
      if (isMfaChallenge(result)) {
        // Notify parent to start MFA flow.
        // 상위 컴포넌트에 MFA 진행 필요 알림
        onMfaRequired(result.mfaId, email);
      } else {
        // On success, let parent navigate.
        // 성공 시 상위 컴포넌트에 알림(네비게이션)
        onSignUpSuccess();
      }
    } catch (error) {
      console.error('Error handleSignUp:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSignUp} action="#">
      <div>
        <FormCardTitle>Sign up</FormCardTitle>
        <FormCardDescription>Create a new account</FormCardDescription>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <InputField
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <InputField
          id="password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Repeat Password</Label>
        <InputField
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
        />
      </div>
      {error && <AlertText variant="error">{error}</AlertText>}
      <div>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Creating an account...' : 'Sign Up'}
        </SubmitButton>
      </div>
    </form>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { resetPassword } = useAuth();

  // Send reset link to email.
  // 비밀번호 재설정 링크 이메일 발송
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(email, isAdmin);
      setMessage('Please check your email and follow the instructions provided.');
    } catch (error) {
      console.error('Error handleResetPassword:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleResetPassword} action="#">
      <div>
        <FormCardTitle>Reset Your Password</FormCardTitle>
        <FormCardDescription>
          Type in your email and we&apos;ll send you a link to reset your password
        </FormCardDescription>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <InputField
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <CheckboxWithLabel
        id="admin-auth"
        label="Admin"
        checked={isAdmin}
        onChange={(e) => setIsAdmin((e.target as HTMLInputElement).checked)}
      />
      {message && <AlertText variant="success">{message}</AlertText>}
      {error && <AlertText variant="error">{error}</AlertText>}
      <div>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send reset email'}
        </SubmitButton>
      </div>
    </form>
  );
}

interface OtpInputFormProps {
  title: string;
  description: string;
  isLoading: boolean;
  error: string | null;
  onSubmit: (otp: string) => Promise<void>;
  onCancel?: () => void;
  cancelButtonText?: string;
}

function OtpInputForm({
  title,
  description,
  isLoading,
  error,
  onSubmit,
  onCancel,
  cancelButtonText = 'Cancel',
}: OtpInputFormProps) {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(otpDurationInSeconds);

  useEffect(() => {
    // Stop when timer hits 0.
    // 남은 시간이 0이면 타이머 중지
    if (timeLeft === 0) return;

    // Decrease every second.
    // 1초마다 1씩 감소
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup interval on unmount.
    // 언마운트 시 인터벌 정리
    return () => clearInterval(timerId);
    // Re-run when timeLeft changes. timeLeft 변경 시 재실행
  }, [timeLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft > 0) {
      onSubmit(otp);
    }
  };

  const isTimerExpired = timeLeft === 0;

  return (
    <form className="space-y-6" onSubmit={handleSubmit} action="#">
      <div>
        <FormCardTitle>{title}</FormCardTitle>
        <FormCardDescription>{description}</FormCardDescription>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor="otp">One-Time Password</Label>
          {/* Remaining time badge */}
          {/* 남은 시간 배지 */}
          {!isTimerExpired && <TimeBadge seconds={timeLeft} />}
        </div>
        <InputField
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Enter your OTP number..."
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={isTimerExpired || isLoading}
          // Disable if expired or loading.
          // 만료 또는 로딩 시 비활성화
        />
      </div>
      {/* Show error or expiry message. */}
      {/* 에러 또는 만료 메시지 표시 */}
      {isTimerExpired ? (
        <AlertText variant="error">Input time has expired. Please try again.</AlertText>
      ) : (
        error && <AlertText variant="error">{error}</AlertText>
      )}
      <div>
        <SubmitButton type="submit" disabled={isLoading || isTimerExpired}>
          {isLoading ? 'Verifying...' : 'Verify & Submit'}
        </SubmitButton>
      </div>
      {onCancel && (
        <div className="mt-4 text-center text-sm">
          <TextButton onClick={onCancel}>{cancelButtonText}</TextButton>
        </div>
      )}
    </form>
  );
}

interface OtpRequestFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function OtpRequestForm({ onSubmit, isLoading, error }: OtpRequestFormProps) {
  const [email, setEmail] = useState('');

  // Request an OTP for the given email.
  // 입력한 이메일로 OTP 요청
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} action="#">
      <div>
        <FormCardTitle>Request OTP</FormCardTitle>
        <FormCardDescription>Enter your email to receive a one-time password.</FormCardDescription>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <InputField
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Request OTP'}
        </SubmitButton>
      </div>
    </form>
  );
}

type NoAuthWithErrorProps = {
  title: string;
  description: string;
};

function NoAuthWithError({ title, description }: NoAuthWithErrorProps) {
  return (
    <div>
      <FormCardTitle>{title}</FormCardTitle>
      <FormCardDescription>{description}</FormCardDescription>
    </div>
  );
}

// All possible UI states in the auth flow.
// 인증 UI 흐름의 모든 상태
type FormState =
  | 'signIn'
  | 'signUp'
  | 'forgotPassword'
  | 'otpRequest' // Requesting OTP. (OTP 요청 단계)
  | 'otpInput' // Entering OTP. (OTP 입력 단계)
  | 'mfaSignIn' // MFA OTP for sign-in. (MFA 활성 시 로그인 OTP)
  | 'mfaSignUp' // MFA OTP for first login. (MFA 활성 시 최초 로그인 OTP)
  | 'noAuthWithError'
  | 'initial';

// Temp data shared across MFA/OTP steps.
// MFA/OTP 단계 간 공유되는 임시 데이터
interface TempAuthData {
  mfaId?: string;
  email?: string;
  otpRequest?: OTPResponse;
}

function UserAuthForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const navigate = useNavigate();
  const { listAuthMethods, authWithOAuth, requestOtp, authWithOtp } = useAuth();

  const [authProviders, setAuthProviders] = useState<AuthMethodsList | null>(null);
  const [formState, setFormState] = useState<FormState>('initial');
  const [tempAuthData, setTempAuthData] = useState<TempAuthData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPasswordAuth = !!authProviders?.password.enabled;
  const hasOtpAuth = !!authProviders?.otp.enabled;
  const hasSocialAuth = !!authProviders?.oauth2.providers.length;
  const hasMfaAuth = !!authProviders?.mfa.enabled;

  // Fetch auth methods and decide initial UI flow.
  // 지원 인증 방법 조회 후 초기 UI 흐름 결정
  useEffect(() => {
    const fetchAuthMethods = async () => {
      try {
        const result: AuthMethodsList = await listAuthMethods();
        const isMfaError: boolean =
          result.mfa.enabled && (!result.password.enabled || !result.otp.enabled);
        customLog('auth-methods-list:', result);
        setAuthProviders(result);
        // Initial form selection.
        // 초기 폼 상태 결정
        if (isMfaError) {
          // MFA requires both password and OTP to be enabled.
          // MFA는 비밀번호와 OTP 둘 다 필요
          setFormState('noAuthWithError');
        } else if (result.password.enabled) {
          setFormState('signIn');
        } else if (result.otp.enabled && !result.mfa.enabled) {
          setFormState('otpRequest');
        } else {
          // OAuth-only UI (no form).
          // 폼 없이 OAuth만 표시
          setFormState('initial');
        }
      } catch (error) {
        console.error('Error fetchAuthMethods:', error);
      }
    };
    fetchAuthMethods();
  }, [listAuthMethods]);

  const handleSuccessNavigation = () => {
    navigate({ to: getRedirectAfterSignIn(), replace: true });
  };

  // Start MFA for sign-in.
  // 로그인 중 MFA 시작
  const handleMfaRequiredForSignIn = async (mfaId: string, email: string) => {
    setError('MFA required. An OTP has been sent to your email.');
    const otpRequest = await requestOtp(email);
    setTempAuthData({ mfaId, email, otpRequest });
    setFormState('mfaSignIn');
  };

  // Start MFA for first login after sign-up.
  // 회원가입 후 최초 로그인에서 MFA 시작
  const handleMfaRequiredForSignUp = async (mfaId: string, email: string) => {
    setError(
      'Account created. MFA is required for the first login. An OTP has been sent to your email.',
    );
    const otpRequest = await requestOtp(email);
    setTempAuthData({ mfaId, email, otpRequest });
    setFormState('mfaSignUp');
  };

  // Complete MFA with OTP.
  // OTP로 MFA 완료
  const handleMfaSubmit = async (otp: string) => {
    if (!tempAuthData?.mfaId || !tempAuthData?.otpRequest) {
      setError('MFA session expired. Please try again.');
      setFormState('signIn');
      // Fallback to sign-in.
      // 오류 시 로그인으로 복귀
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authWithOtp(tempAuthData.otpRequest, otp, tempAuthData.mfaId);
      handleSuccessNavigation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Request OTP for email-only auth.
  // 이메일 기반 OTP 인증 요청
  const handleRequestOtp = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const otpRequest = await requestOtp(email);
      setTempAuthData({ email, otpRequest });
      // Move to OTP entry.
      // OTP 입력 단계로 전환
      setFormState('otpInput');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete email OTP auth.
  // 이메일 OTP 인증 완료
  const handleAuthWithOtp = async (otp: string) => {
    if (!tempAuthData?.otpRequest) {
      setError('OTP session expired. Please request a new one.');
      setFormState('otpRequest');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await authWithOtp(tempAuthData.otpRequest, otp);
      handleSuccessNavigation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Start OAuth flow with selected provider.
  // 선택한 공급자로 OAuth 흐름 시작
  const handleAuthWithOAuth = async (providerName: string) => {
    try {
      await authWithOAuth(providerName);
      await navigate({ to: getRedirectAfterSignIn(), replace: true });
    } catch (error) {
      console.error('Error handleAuthWithOAuth:', error);
      const errorMessage: string = error instanceof Error ? error.message : 'An error occurred';
      alert(errorMessage);
    }
  };

  // Render proper form by state machine.
  // 상태 머신에 따라 적절한 폼 렌더링
  const renderForm = () => {
    switch (formState) {
      case 'signIn':
        return (
          <UserSignInForm
            onSignInSuccess={handleSuccessNavigation}
            onMfaRequired={handleMfaRequiredForSignIn}
          />
        );
      case 'signUp':
        return (
          <UserSignUpForm
            onSignUpSuccess={handleSuccessNavigation}
            onMfaRequired={handleMfaRequiredForSignUp}
          />
        );
      case 'mfaSignIn':
      case 'mfaSignUp':
        return (
          <OtpInputForm
            title="Enter MFA Code"
            description={
              formState === 'mfaSignIn'
                ? 'A one-time password has been sent to your email to complete the sign-in.'
                : 'Your account was created. Please enter the OTP sent to your email to complete the first sign-in.'
            }
            isLoading={isLoading}
            error={error}
            onSubmit={handleMfaSubmit}
            onCancel={() => {
              setError(null);
              setTempAuthData(null);
              setFormState('signIn');
            }}
          />
        );
      case 'otpRequest':
        return <OtpRequestForm onSubmit={handleRequestOtp} isLoading={isLoading} error={error} />;

      case 'otpInput':
        return (
          <OtpInputForm
            title="Enter OTP"
            description={`A one-time password has been sent to ${tempAuthData?.email}.`}
            isLoading={isLoading}
            error={error}
            onSubmit={handleAuthWithOtp}
            onCancel={() => {
              setError(null);
              setTempAuthData(null);
              // Back to request.
              // 요청 단계로 돌아가기
              setFormState('otpRequest');
            }}
            cancelButtonText="Resend OTP"
          />
        );
      case 'forgotPassword':
        return <ForgotPasswordForm />;
      case 'noAuthWithError':
        return (
          <NoAuthWithError
            title="MFA Setup Error"
            description="Both Identity/Password and One-Time Password (OTP) must be enabled to configure MFA."
          ></NoAuthWithError>
        );
      case 'initial':
      default:
        // Loading or OAuth-only.
        // 로딩 중이거나 OAuth-only
        return null;
    }
  };

  // UI feature flags computed from providers/state.
  // 제공자/상태에 따라 UI 표시 여부 결정
  const showDivider =
    !hasMfaAuth &&
    ((['signIn', 'signUp'].includes(formState) && (hasOtpAuth || hasSocialAuth)) ||
      (!hasPasswordAuth && formState === 'otpRequest' && hasSocialAuth));

  const showOtpButton = !hasMfaAuth && ['signIn', 'signUp'].includes(formState) && hasOtpAuth;

  const showOAuthButtons =
    !hasMfaAuth &&
    hasSocialAuth &&
    (['signIn', 'signUp', 'initial'].includes(formState) ||
      (!hasPasswordAuth && formState === 'otpRequest'));

  return (
    <CenterDiv className={className}>
      <FormCard {...props}>
        {renderForm()}
        {hasSocialAuth && !hasPasswordAuth && !hasOtpAuth && !hasMfaAuth && (
          <div>
            <FormCardTitle>Sign in with OAuth2</FormCardTitle>
          </div>
        )}

        {/* Forgot-password link (sign-in only). */}
        {/* 비밀번호 찾기 링크(로그인 화면에서만) */}
        {formState === 'signIn' && (
          <div className="mt-4 text-center text-sm">
            <TextButton onClick={() => setFormState('forgotPassword')}>
              Forgot your password?
            </TextButton>
          </div>
        )}

        {/* Back button for forgot-password or OTP (when password auth exists). */}
        {/* 비밀번호 찾기/OTP에서 뒤로가기(비번 인증 지원 시) */}
        {(formState === 'forgotPassword' || (hasPasswordAuth && formState === 'otpRequest')) && (
          <div className="mt-4 text-center text-sm">
            <TextButton
              onClick={() => {
                setError(null);
                setTempAuthData(null);
                setFormState('signIn');
              }}
            >
              Go back
            </TextButton>
          </div>
        )}

        {/* Toggle between sign-in and sign-up. */}
        {/* 로그인/회원가입 전환 */}
        {(formState === 'signIn' || formState === 'signUp') && (
          <div
            className={
              formState === 'signIn' ? 'mt-2 text-center text-sm' : 'mt-4 text-center text-sm'
            }
          >
            <TextButton onClick={() => setFormState(formState === 'signIn' ? 'signUp' : 'signIn')}>
              {formState === 'signIn' ? 'Create an account' : 'Already have an account? Sign In'}
            </TextButton>
          </div>
        )}

        {/* Divider between primary and alternative methods. */}
        {/* 기본/대체 인증 방법 구분선 */}
        {showDivider && <Divider />}

        {/* Entry point for email OTP login. */}
        {/* 이메일 OTP 로그인 진입 버튼 */}
        {showOtpButton && (
          <PrimaryActionButton className="mt-4" onClick={() => setFormState('otpRequest')}>
            Sign in with Email OTP
          </PrimaryActionButton>
        )}

        {/* OAuth2 providers. */}
        {/* OAuth2 공급자 버튼 */}
        {showOAuthButtons && (
          <OAuthButtons providers={authProviders?.oauth2.providers} onClick={handleAuthWithOAuth} />
        )}
      </FormCard>
    </CenterDiv>
  );
}
