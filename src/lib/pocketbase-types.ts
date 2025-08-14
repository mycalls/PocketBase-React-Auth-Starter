// src/lib/pocketbase-types.ts

import type { collectionNames, CollectionName } from '../constants';

export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// 모든 PocketBase 레코드의 기본 시스템 필드
type BaseSystemFields<T = unknown> = {
  id: RecordIdString;
  collectionId: string;
  collectionName: CollectionName;
  created: IsoDateString;
  updated: IsoDateString;
  expand?: T;
};

// 공통 인증 필드 추출 (DRY)
// 모든 인증 가능 레코드(users, admins)가 공유하는 필드
type BaseAuthRecord = {
  email: string;
  verified: boolean;
  emailVisibility: boolean;
};

// 'users' 컬렉션의 레코드 타입
// @template Texpand 확장될 필드의 타입을 지정합니다.
export type UsersResponse<Texpand = unknown> = BaseAuthRecord &
  Omit<BaseSystemFields<Texpand>, 'collectionName'> & {
    collectionName: typeof collectionNames.users;
    avatar: string;
    name: string;
  };

// '_superusers' 컬렉션의 레코드 타입 (Admins)
// @template Texpand 확장될 필드의 타입을 지정합니다.
export type AdminsResponse<Texpand = unknown> = BaseAuthRecord &
  Omit<BaseSystemFields<Texpand>, 'collectionName'> & {
    collectionName: typeof collectionNames.admins;
    // Admin 레코드에는 avatar, name 필드가 없음
  };

// 식별 가능한 유니온 타입 (Discriminated Union)
// 비밀번호, OAuth2, 또는 관리자 로그인 후 받을 수 있는 모든 응답 타입을 통합합니다.
// `collectionName` 필드를 통해 타입이 자동으로 추론됩니다.
export type AuthResponse = UsersResponse | AdminsResponse;

// OAuth2 공급자로부터 받은 추가 메타 정보
export type OAuth2Meta = {
  id: string;
  name: string;
  username: string;
  email: string;
  isNew: boolean;
  avatarURL: string;
  rawUser: object;
  accessToken: string;
  refreshToken: string;
  expiry: IsoDateString;
};
