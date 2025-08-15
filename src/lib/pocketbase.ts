// src/lib/pocketbase.ts

import PocketBase from 'pocketbase';

// EN: Choose API base URL: root in production, local server in development.
// KO: 환경별 API 기본 URL 설정: 프로덕션은 루트(/), 개발은 로컬 서버.
const baseUrl = import.meta.env.PROD ? '/' : 'http://127.0.0.1:8090/';

const pb = new PocketBase(baseUrl);

// EN: Disable client request auto-cancellation so multiple concurrent async calls aren't aborted.
// KO: 동시 비동기 요청이 중간에 취소되지 않도록 자동 취소를 비활성화.
pb.autoCancellation(false);

export default pb;
