import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	primaryKey,
	vector,
	index
} from 'drizzle-orm/pg-core';

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
	parentId: uuid('parent_id'),
	role: text('role').notNull(), // 'user' | 'assistant'
	content: text('content').notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * DOCUMENTS TABLE (RAG)
 */
export const documents = pgTable('documents', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	filename: text('filename').notNull(),
	mimeType: text('mime_type').notNull().default('text/plain'),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * DOCUMENT CHUNKS TABLE (RAG)
 */
export const documentChunks = pgTable(
	'document_chunks',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		documentId: uuid('document_id')
			.notNull()
			.references(() => documents.id, { onDelete: 'cascade' }),
		content: text('content').notNull(),
		chunkIndex: integer('chunk_index').notNull(),
		embedding: vector('embedding', { dimensions: 384 }),
		createdAt: timestamp('created_at').defaultNow()
	},
	(table) => ({
		embeddingIdx: index('embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops'))
	})
);

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
