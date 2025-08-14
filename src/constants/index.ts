// src/constants/index.ts

export const collectionNames = {
  users: 'users',
  admins: '_superusers',
} as const;

// 필요한 경우, 컬렉션 이름들의 유니온 타입도 여기서 export 가능
export type CollectionName = (typeof collectionNames)[keyof typeof collectionNames];
