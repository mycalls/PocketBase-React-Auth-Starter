// src/routes/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '../contexts/AuthContext';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { isAuthed, isSuperuser, logout, deleteAccount } = useAuth();

  // 재사용 가능한 버튼 클래스 (의존성 추가 없이 단순 상수로 관리)
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
            Pocketbase + React Authentication
          </h1>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
            Authentication Example with PocketBase + React + Tanstack Router + Tailwindcss
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

              {isAuthed ? (
                <div className="flex items-center gap-3">
                  <button type="button" onClick={logout} className={btnPrimary}>
                    Log Out
                  </button>

                  {!isSuperuser && (
                    <button type="button" onClick={deleteAccount} className={btnDanger}>
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
          </div>
        </div>
      </div>
    </section>
  );
}
