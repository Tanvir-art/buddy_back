
import pkg from 'pg';
const { Pool } = pkg;
import { env } from './env.js';
import logger from '../utils/logger.js';

// Create connection pool
// const pool = new Pool({
//   host: env.DB_HOST,
//   port: env.DB_PORT,
//   user: env.DB_USER,
//   password: env.DB_PASSWORD,
//   database: env.DB_NAME,
//   max: 20,  
//   idleTimeoutMillis: 30000, 
//   connectionTimeoutMillis: 2000, 
// });

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


export const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');
    client.release();
    
    logger.info(' PostgreSQL connected successfully');
    logger.info(` Server Time: ${result.rows[0].time}`);
    logger.info(` PostgreSQL Version: ${result.rows[0].version.split(',')[0]}`);
    
    return true;
  } catch (error) {
    logger.error(' PostgreSQL connection failed:', error.message);
    logger.error('Please check your database configuration in .env file');
    process.exit(1);
  }
};


export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (more than 100ms)
    if (duration > 100) {
      logger.warn(`Slow Query (${duration}ms):`, {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        params
      });
    }
    
    return res;
  } catch (error) {
    logger.error('Database query error:', {
      query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      params,
      error: error.message
    });
    throw error;
  }
};


export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

 
export default pool;