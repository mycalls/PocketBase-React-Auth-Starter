import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createRouter, RouterProvider } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { AuthProvider, useAuth, type AuthState } from './contexts/AuthContext';

// Create a new router instance
const router = createRouter({
  routeTree,
  // Set to preload data for the corresponding path when a user hovers over a link
  // 사용자가 링크 위로 마우스를 올렸을 때(hover) 해당 경로의 데이터를 미리 로드하도록 설정
  defaultPreload: 'intent',
  // Enable restoring the previous page's scroll position when the user clicks the back or forward buttons
  // 사용자가 뒤로 가기 또는 앞으로 가기 버튼을 클릭했을 때 이전 페이지의 스크롤 위치를 복원하는 기능을 활성화
  scrollRestoration: true,
  // Assign initial value to auth property defined in __root.tsx via context: { auth: undefined! }
  // Without this step, the router wouldn't know where the auth property actually is.
  // context: { auth: undefined! }를 통해 __root.tsx에서 정의된 auth 속성에 초기값을 할당
  // 이 과정이 없다면 라우터는 auth 속성이 실제로 어디에 있는지 알 수 없게 됨
  context: {
    // Appending '!' after undefined assures the TypeScript compiler that "this value will never be null or undefined."
    // undefined 뒤에 !를 붙이는 것은 "이 값은 절대 null이나 undefined가 아닐 것" 이라고 TypeScript 컴파일러에게 확신시키는 역할
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// AuthProvider is a state management system for React components, and the context of RouterProvider serves as a channel for injecting state into the TanStack Router system.
// AuthProvider manages state through pure React context.
// RouterProvider efficiently provides data needed by the router system, fulfilling its role.
// Access the auth state within route components using the useRouteContext hook provided by TanStack Router.
// This makes it easier to utilize the authentication state in router-related logic, such as route guards.
// AuthProvider는 React 컴포넌트를 위한 상태 관리 시스템이고,
// RouterProvider의 context는 TanStack Router 시스템을 위한 상태 주입 통로
// AuthProvider는 순수한 React 컨텍스트를 통해 상태를 관리
// RouterProvider는 라우터 시스템에 필요한 데이터를 효율적으로 제공하여 역할
// 라우트 컴포넌트 내에서 TanStack Router가 제공하는 useRouteContext 훅을 사용해 auth 상태에 접근
// 라우터와 관련된 로직(예: 라우트 가드)에서 인증 상태를 활용하기가 더 용이

function InnerApp() {
  const state = useAuth();
  const routerAuth: AuthState = {
    isAuthed: state.isAuthed,
    isSuperuser: state.isSuperuser,
    user: state.user,
    token: state.token,
  } as const;
  // The context property of RouterProvider injects state into TanStack Router's own context system.
  // RouterProvider in the InnerApp component directly injects the auth state into the router's context via context={{ auth }}.
  // RouterProvider의 context 속성은 TanStack Router 자체의 컨텍스트 시스템에 상태를 주입하는 역할
  // InnerApp 컴포넌트의 RouterProvider는 context={{ auth }}를 통해 auth 상태를 라우터의 컨텍스트로 직접 주입
  return <RouterProvider router={router} context={{ auth: routerAuth }} />;
}

function App() {
  return (
    // AuthProvider uses React's Context API to provide authentication status to all child components within the component tree (including routers and their child routes).
    // AuthProvider는 React의 Context API를 사용하여 컴포넌트 트리 내부에 있는 모든 자식 컴포넌트(라우터와 그 자식 라우트들 포함)에게 인증 상태를 제공
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
