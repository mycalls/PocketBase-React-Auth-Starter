// src/routes/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';

// EN: Register the root ("/") route for the app using TanStack Router.
// KO: TanStack Router로 앱의 루트("/") 라우트를 등록합니다.
export const Route = createFileRoute('/')({
  component: Index,
});

// EN: Top-level landing page component.
// KO: 최상위 랜딩 페이지 컴포넌트.
function Index() {
  // EN: Pull auth state and actions from context.
  // KO: 인증 상태와 액션을 컨텍스트에서 가져옵니다.
  const { isAuthed, isSuperuser, logout, deleteAccount } = useAuth();

  // EN: Reusable button class names (kept as simple constants; no extra deps).
  // KO: 재사용 가능한 버튼 클래스 (의존성 추가 없이 단순 상수로 관리)
  const btnBase =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';
  const btnPrimary =
    btnBase + ' bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700';
  const btnDanger =
    btnBase + ' bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700';

  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mx-auto max-w-2xl py-16 text-center sm:py-24">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-2xl lg:text-2xl">
            PocketBase React Auth Starter
          </h1>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
            Authentication starter built with PocketBase, React, Vite, TanStack Router, and Tailwind
            CSS.
          </p>

          <div className="mt-10 rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-gray-200 backdrop-blur-sm dark:bg-gray-900/60 dark:ring-gray-800 sm:p-8">
            <nav
              aria-label="Primary"
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Link
                to="/"
                className="[&.active]:font-bold text-gray-700 hover:underline dark:text-gray-300"
              >
                Home
              </Link>

              {/* EN: If authenticated, show Log Out (and optional Close Account); otherwise show Sign In.
                  KO: 로그인 상태면 로그아웃(필요 시 계정삭제) 표시, 아니면 로그인 링크를 표시합니다. */}
              {isAuthed ? (
                <div className="flex items-center gap-3">
                  <button type="button" onClick={logout} className={btnPrimary}>
                    Log Out
                  </button>

                  {/* EN: Superusers cannot self-delete their accounts.
                      KO: 슈퍼유저는 자기 계정 삭제가 금지됩니다. */}
                  {!isSuperuser && (
                    <button
                      type="button"
                      onClick={() => {
                        void deleteAccount();
                      }}
                      className={btnDanger}
                    >
                      Close Account
                    </button>
                  )}
                </div>
              ) : (
                <Link
                  to="/signin"
                  className="[&.active]:font-bold text-blue-700 hover:underline dark:text-blue-300"
                >
                  Sign In
                </Link>
              )}
            </nav>

            {/* EN: Instructions below the buttons.
                KO: 버튼 하단 인스트럭션 영역 */}
            <hr className="my-6 border-gray-200 dark:border-gray-800" />
            <div className="text-left">
              <ul
                role="list"
                className="list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700 dark:text-gray-300"
              >
                <li>
                  An authentication demo built with <b>PocketBase</b>, <b>React</b>, <b>Vite</b>,{' '}
                  <b>TanStack Router</b>, and <b>Tailwind CSS</b>.
                </li>
                <li>
                  Implements{' '}
                  <b>
                    Identity/Password, Email one-time password (OTP), OAuth 2.0, and multi-factor
                    authentication (MFA)
                  </b>
                  .
                </li>
                <li>
                  <b className="text-red-700">Important:</b> Download the appropriate{' '}
                  <a
                    href="https://pocketbase.io/docs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 underline decoration-dotted underline-offset-4 hover:decoration-solid dark:text-blue-300"
                  >
                    PocketBase release
                  </a>{' '}
                  for your platform and place the executable inside the project’s{' '}
                  <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.9em] dark:bg-gray-800">
                    ./pocketbase/
                  </code>{' '}
                  folder.
                </li>
                <li>Enable each authentication method in PocketBase.</li>
                <li>Email OTP requires SMTP to be configured.</li>
                <li>OAuth 2.0 requires provider configuration.</li>
                <li>
                  MFA uses Identity/Password + Email OTP. Both must be enabled for MFA to work.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
