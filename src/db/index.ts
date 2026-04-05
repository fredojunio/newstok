import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// If no connection string is provided (e.g. during build or just mocking), don't crash
export const client = connectionString ? postgres(connectionString, { prepare: false }) : null;
export const db = client ? drizzle(client, { schema }) : null as any;
