// src/constants/index.ts

// Canonical collection identifiers used across the app.
// 앱 전역에서 사용하는 표준 컬렉션 식별자.
export const collectionNames = {
  users: 'users',
  admins: '_superusers',
} as const;

// Union type of all collection name values derived from collectionNames.
// collectionNames에서 파생된 모든 컬렉션 이름 값의 유니온 타입.
export type CollectionName = (typeof collectionNames)[keyof typeof collectionNames];
