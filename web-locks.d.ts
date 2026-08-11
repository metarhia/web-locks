export type LockMode = 'exclusive';

export interface Lock {
  name: string;
  mode: LockMode;
}

export interface LockOptions {
  mode?: LockMode;
  signal?: AbortSignal;
}

export interface LockInfo {
  name: string;
  mode: LockMode;
}

export interface LockManagerSnapshot {
  held: Array<LockInfo>;
  pending: Array<LockInfo>;
}

export type LockGrantedCallback = (lock: Lock) => void | Promise<void>;

export declare class AbortError extends Error {
  name: 'AbortError';
  constructor(message?: string);
}

export declare class AbortSignal {
  aborted: boolean;
  reason?: unknown;
  addEventListener?(
    type: 'abort',
    listener: () => void,
    options?: { once?: boolean },
  ): void;
  removeEventListener?(type: 'abort', listener: () => void): void;
  on?(event: 'abort', listener: (...args: unknown[]) => void): this;
  once?(event: 'abort', listener: (...args: unknown[]) => void): this;
  off?(event: 'abort', listener: (...args: unknown[]) => void): this;
}

export declare class AbortController {
  signal: AbortSignal;
  abort(): void;
}

export interface LockManager {
  request(name: string, handler: LockGrantedCallback): Promise<undefined>;
  request(
    name: string,
    options: LockOptions,
    handler: LockGrantedCallback,
  ): Promise<undefined>;
  query(): Promise<LockManagerSnapshot>;
  attach(worker: import('node:worker_threads').Worker): void;
}

export declare const locks: LockManager;
