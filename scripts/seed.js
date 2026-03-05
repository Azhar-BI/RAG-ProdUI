import pg from 'pg';
import { randomUUID } from 'crypto';

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/auth-app'
});

async function seed() {
	const client = await pool.connect();
	try {
		console.log('Seeding database...');

		// Create admin user (password: Admin123)
		const adminId = randomUUID();
		await client.query(
			`INSERT INTO users (id, name, email, password, email_verified, role)
			 VALUES ($1, $2, $3, $4, NOW(), 'admin')
			 ON CONFLICT (email) DO NOTHING`,
			[
				adminId,
				'Admin User',
				'admin@example.com',
				'$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u'
			]
		);

		console.log('Seed complete.');
		console.log('Admin login: admin@example.com / Admin123');
	} finally {
		client.release();
		await pool.end();
	}
}

seed().catch(console.error);
