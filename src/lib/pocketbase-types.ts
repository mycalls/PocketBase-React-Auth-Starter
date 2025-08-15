// src/lib/pocketbase-types.ts
// PocketBase response type definitions used across the app.
// 앱 전반에서 사용하는 PocketBase 응답 타입 정의.

import type { collectionNames, CollectionName } from '../constants';

export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// Core system fields present on every PocketBase record.
// 모든 PocketBase 레코드에 공통으로 존재하는 시스템 필드.
type BaseSystemFields<T = unknown> = {
  id: RecordIdString;
  collectionId: string;
  collectionName: CollectionName;
  created: IsoDateString;
  updated: IsoDateString;
  expand?: T;
};

// Auth fields shared by authenticatable records (users/admins). (DRY)
// 인증 가능한 레코드(users/admins)가 공유하는 공통 필드(DRY).
type BaseAuthRecord = {
  email: string;
  verified: boolean;
  emailVisibility: boolean;
};

// Record type for the 'users' collection.
// 'users' 컬렉션 레코드 타입.
// @template Texpand: type of expanded relations.
// @template Texpand: expand로 가져올 관계 필드의 타입.
export type UsersResponse<Texpand = unknown> = BaseAuthRecord &
  Omit<BaseSystemFields<Texpand>, 'collectionName'> & {
    collectionName: typeof collectionNames.users;
    avatar: string;
    name: string;
  };

// Record type for the '_superusers' collection (Admins).
// '_superusers' 컬렉션(Admins) 레코드 타입.
// @template Texpand: type of expanded relations.
// @template Texpand: expand로 가져올 관계 필드의 타입.
export type AdminsResponse<Texpand = unknown> = BaseAuthRecord &
  Omit<BaseSystemFields<Texpand>, 'collectionName'> & {
    collectionName: typeof collectionNames.admins;
    // Note: Admin records don't have avatar or name.
    // 참고: Admin 레코드에는 avatar, name 필드가 없음.
  };

// Discriminated union of all possible auth responses (password/OAuth2/admin).
// 가능한 모든 인증 응답 타입의 식별 가능한 유니온(비밀번호/OAuth2/관리자).
// The `collectionName` field discriminates between variants.
// `collectionName` 필드로 변형을 구분합니다.
export type AuthResponse = UsersResponse | AdminsResponse;

// Additional metadata returned by an OAuth2 provider.
// OAuth2 공급자로부터 반환되는 추가 메타데이터.
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
