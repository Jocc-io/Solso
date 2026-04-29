// No database used for this Solana application
// This file is kept to satisfy imports but throws if used
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Dummy pool and db
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy" 
});

// We only use this to export the type or if we actually had a DB
// Since we don't, we can just export a dummy or valid object if env is set
export const db = drizzle(pool, { schema });
