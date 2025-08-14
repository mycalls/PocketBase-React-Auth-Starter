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

export const Route = createLazyFileRoute('/signin')({
  component: UserAuthForm,
});

const otpDurationInSeconds: number = 180;

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(email, password, isAdmin);
      if (isMfaChallenge(result)) {
        // 부모에게 MFA가 필요하다고 알림
        onMfaRequired(result.mfaId, email);
        setError('MFA required. An OTP has been sent to your email.');
      } else {
        // 부모에게 성공했다고 알림
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
        // 부모에게 MFA가 필요하다고 알림
        onMfaRequired(result.mfaId, email);
      } else {
        // 부모에게 성공했다고 알림
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
    // 시간이 0이 되면 타이머를 더 이상 실행하지 않음
    if (timeLeft === 0) return;

    // 1초마다 timeLeft를 1씩 감소
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // 컴포넌트가 언마운트될 때 인터벌 정리
    return () => clearInterval(timerId);
  }, [timeLeft]); // timeLeft가 변경될 때마다 이펙트 재실행

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
          {/* 남은 시간 표시 */}
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
          disabled={isTimerExpired || isLoading} // 시간 만료 시 비활성화
        />
      </div>
      {/* 에러 메시지 또는 시간 만료 메시지 표시 */}
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

type FormState =
  | 'signIn'
  | 'signUp'
  | 'forgotPassword'
  | 'otpRequest' // OTP 요청 단계
  | 'otpInput' // OTP 입력 단계
  | 'mfaSignIn' // MFA 활성화시 OTP 입력 단계
  | 'mfaSignUp' // MFA 활성화시 OTP 입력 단계
  | 'noAuthWithError'
  | 'initial';

// MFA/OTP 전환 시 필요한 데이터를 담을 상태 인터페이스
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

  // auth providers 받아와서 어떤 것을 지원할 지 결정
  useEffect(() => {
    const fetchAuthMethods = async () => {
      try {
        const result: AuthMethodsList = await listAuthMethods();
        const isMfaError: boolean =
          result.mfa.enabled && (!result.password.enabled || !result.otp.enabled);
        customLog('auth-methods-list:', result);
        setAuthProviders(result);
        // 초기 폼 상태 결정
        if (isMfaError) {
          setFormState('noAuthWithError');
        } else if (result.password.enabled) {
          setFormState('signIn');
        } else if (result.otp.enabled && !result.mfa.enabled) {
          setFormState('otpRequest');
        } else {
          setFormState('initial'); // 폼 없이 OAuth 버튼만 표시
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

  const handleMfaRequiredForSignIn = async (mfaId: string, email: string) => {
    setError('MFA required. An OTP has been sent to your email.');
    const otpRequest = await requestOtp(email);
    setTempAuthData({ mfaId, email, otpRequest });
    setFormState('mfaSignIn');
  };

  const handleMfaRequiredForSignUp = async (mfaId: string, email: string) => {
    setError(
      'Account created. MFA is required for the first login. An OTP has been sent to your email.',
    );
    const otpRequest = await requestOtp(email);
    setTempAuthData({ mfaId, email, otpRequest });
    setFormState('mfaSignUp');
  };

  const handleMfaSubmit = async (otp: string) => {
    if (!tempAuthData?.mfaId || !tempAuthData?.otpRequest) {
      setError('MFA session expired. Please try again.');
      setFormState('signIn'); // 오류 발생 시 로그인 폼으로
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

  const handleRequestOtp = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const otpRequest = await requestOtp(email);
      setTempAuthData({ email, otpRequest });
      setFormState('otpInput'); // 상태를 OTP 입력 단계로 전환
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
              setFormState('otpRequest'); // 이전 단계(OTP 요청)로 돌아가기
            }}
            cancelButtonText="Resend OTP"
          />
        );
      case 'forgotPassword':
        // 기존 ForgotPasswordForm 컴포넌트 사용
        return <ForgotPasswordForm />;

      // otpLogin 등 다른 케이스 추가 가능
      // case 'otpLogin':
      //   return <UserOtpForm ... />;
      case 'noAuthWithError':
        return (
          <NoAuthWithError
            title="MFA Setup Error"
            description="Both Identity/Password and One-Time Password (OTP) must be enabled to configure MFA."
          ></NoAuthWithError>
        );
      case 'initial':
      default:
        return null; // 로딩 중이거나 폼이 없는 경우
    }
  };

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

        {/* 비밀번호 찾기 - sign in 페이지에서만 렌더링 */}
        {formState === 'signIn' && (
          <div className="mt-4 text-center text-sm">
            <TextButton onClick={() => setFormState('forgotPassword')}>
              Forgot your password?
            </TextButton>
          </div>
        )}
        {/* 비밀번호 찾기 또는 비밀번호 가입을 지원하는 otp에서 뒤로 가기 버튼 지원 */}
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
        {/* sign in, sign up 스위치 */}
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
        {/* 구분선 */}
        {showDivider && <Divider />}
        {/* AuthWithOtp button 렌더링 */}
        {showOtpButton && (
          <PrimaryActionButton className="mt-4" onClick={() => setFormState('otpRequest')}>
            Sign in with Email OTP
          </PrimaryActionButton>
        )}
        {/* OAuth2 렌더링 */}
        {showOAuthButtons && (
          <OAuthButtons providers={authProviders?.oauth2.providers} onClick={handleAuthWithOAuth} />
        )}
      </FormCard>
    </CenterDiv>
  );
}
