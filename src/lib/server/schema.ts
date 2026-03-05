import { pgTable, text, timestamp, uuid, integer, primaryKey } from 'drizzle-orm/pg-core';

/**
 * USERS TABLE
 */
export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name'),
	email: text('email').notNull().unique(),
	password: text('password'),
	emailVerified: timestamp('email_verified'),
	image: text('image'),
	role: text('role').notNull().default('user'),
	disabled: text('disabled').notNull().default('false'),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * ACCOUNTS TABLE (required by Auth.js)
 */
export const accounts = pgTable(
	'accounts',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('provider_account_id').notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: text('token_type'),
		scope: text('scope'),
		id_token: text('id_token'),
		session_state: text('session_state')
	},
	(account) => ({
		compoundKey: primaryKey(account.provider, account.providerAccountId)
	})
);

/**
 * SESSIONS TABLE (database sessions)
 */
export const sessions = pgTable('sessions', {
	sessionToken: text('session_token').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires').notNull()
});

/**
 * VERIFICATION TOKENS
 */
export const verificationTokens = pgTable(
	'verification_tokens',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: timestamp('expires').notNull()
	},
	(vt) => ({
		compoundKey: primaryKey(vt.identifier, vt.token)
	})
);

/**
 * PASSWORD RESET TOKENS
 */
/**
 * CONVERSATIONS TABLE
 */
export const conversations = pgTable('conversations', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text('title').notNull().default('New Chat'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

/**
 * CHAT MESSAGES TABLE
 */
export const chatMessages = pgTable('chat_messages', {
	id: uuid('id').defaultRandom().primaryKey(),
	conversationId: uuid('conversation_id')
		.notNull()
		.references(() => conversations.id, { onDelete: 'cascade' }),
	role: text('role').notNull(), // 'user' | 'assistant'
	content: text('content').notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * PASSWORD RESET TOKENS
 */
export const passwordResetTokens = pgTable(
	'password_reset_tokens',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: timestamp('expires').notNull()
	},
	(prt) => ({
		compoundKey: primaryKey(prt.identifier, prt.token)
	})
);
