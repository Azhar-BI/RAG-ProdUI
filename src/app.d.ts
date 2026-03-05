import type { Session } from '@auth/core/types';

declare module '@auth/core/types' {
	interface User {
		emailVerified?: Date | null;
	}
}

declare global {
	namespace App {
		interface Locals {
			auth(): Promise<Session | null>;
		}
	}
}

export {};
