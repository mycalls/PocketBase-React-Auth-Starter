import { createRootRouteWithContext, Outlet, redirect, useRouter } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useAuth, type AuthState } from '../contexts/AuthContext';
import AppConfig from '../config';
import { useEffect } from 'react';

export interface RouterContext {
  auth: Readonly<AuthState>;
}

const AUTH_ROUTES = new Set(['/signin']);

export const Route = createRootRouteWithContext<RouterContext>()({
  // Redirect non-logged-in users to the authentication page if isAuthRequired in AppConfig is true
  // AppConfig에서 isAuthRequired가 true일 경우 로그인하지 상태는 인증페이지로 리다이렉트
  beforeLoad: AppConfig.isAuthRequired
    ? ({ context, location }) => {
        if (!AUTH_ROUTES.has(location.pathname) && !context.auth.isAuthed) {
          redirect({
            to: '/signin',
            search: { redirect: location.href },
            replace: true,
            throw: true,
          });
        }
      }
    : undefined,
  component: RootComponent,
});

function RootComponent() {
  const auth = useAuth();
  const router = useRouter();

  // If the authentication status changes to unauthenticated, refresh the router state and re-invoke beforeLoad to redirect.
  // 인증되지 않은 상태로 변경될 경우, 라우터 상태를 갱신시키고 beforeLoad를 다시 호출해 리다이렉트
  useEffect(() => {
    if (
      AppConfig.isAuthRequired &&
      !auth.isAuthed &&
      !AUTH_ROUTES.has(router.state.location.pathname)
    ) {
      void router.invalidate({ sync: true });
    }
  }, [auth, router]);

  return (
    <div>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" initialIsOpen={false} />
    </div>
  );
}
