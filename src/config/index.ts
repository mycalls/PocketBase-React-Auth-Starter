// src/config/index.ts

interface AppConfig {
  // Restrict access for users who are not logged in
  // 로그인하지 않은 사용자에 대한 접근 제한을 설정
  isAuthRequired: boolean;
}

const AppConfig = {
  isAuthRequired: false,
};

export default AppConfig;
