import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthProvider } from '../contexts/AuthContext';

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <div>
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </AuthProvider>
  ),
});
