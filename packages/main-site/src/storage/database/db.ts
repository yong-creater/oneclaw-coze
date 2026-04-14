import { loadEnv, getSupabaseClient, isSupabaseMode, isVolcengineMode } from './supabase-client';

// 统一的数据查询接口
export class Database {
  private supabase: ReturnType<typeof getSupabaseClient> | null = null;
  private pgPool: any = null;

  constructor() {}

  private async init() {
    if (isSupabaseMode()) {
      this.supabase = getSupabaseClient();
    } else if (isVolcengineMode()) {
      const { default: pg } = await import('pg');
      const { Pool } = pg;
      const config: any = {};
      
      if (process.env.DATABASE_URL) {
        config.connectionString = process.env.DATABASE_URL;
      } else {
        config.host = process.env.PGHOST;
        config.port = parseInt(process.env.PGPORT || '5432');
        config.user = process.env.PGUSER || 'postgres';
        config.password = process.env.PGPASSWORD;
        config.database = process.env.PGDATABASE || 'postgres';
      }
      
      this.pgPool = new Pool(config);
    }
  }

  async query(table: string, options?: {
    select?: string;
    eq?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  }) {
    await this.init();

    if (this.supabase) {
      // Supabase 模式
      let q = this.supabase.from(table).select(options?.select || '*');
      
      if (options?.eq) {
        for (const [key, value] of Object.entries(options.eq)) {
          q = q.eq(key, value);
        }
      }
      
      if (options?.order) {
        q = q.order(options.order.column, { ascending: options.order.ascending ?? true });
      }
      
      if (options?.limit) {
        q = q.limit(options.limit);
      }
      
      if (options?.single) {
        return await q.single();
      }
      
      return await q;
    } else if (this.pgPool) {
      // 火山引擎 PostgreSQL 模式
      const { Pool } = await import('pg');
      let sql = `SELECT ${options?.select || '*'} FROM ${table}`;
      const params: any[] = [];
      let paramIndex = 1;

      if (options?.eq) {
        const conditions: string[] = [];
        for (const [key, value] of Object.entries(options.eq)) {
          conditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
        if (conditions.length > 0) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }
      }

      if (options?.order) {
        sql += ` ORDER BY ${options.order.column} ${options.order.ascending ? 'ASC' : 'DESC'}`;
      }

      if (options?.limit) {
        sql += ` LIMIT ${options.limit}`;
      }

      const result = await this.pgPool.query(sql, params);
      
      if (options?.single) {
        return { data: result.rows[0] || null, error: result.rows.length === 0 ? { message: 'No rows found' } : null };
      }
      
      return { data: result.rows, error: null };
    }

    return { data: null, error: { message: 'No database configured' } };
  }

  async insert(table: string, data: any) {
    await this.init();

    if (this.supabase) {
      return await this.supabase.from(table).insert(data);
    } else if (this.pgPool) {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await this.pgPool.query(sql, values);
      return { data: result.rows[0], error: null };
    }

    return { data: null, error: { message: 'No database configured' } };
  }

  async update(table: string, data: any, id: number | string) {
    await this.init();

    if (this.supabase) {
      return await this.supabase.from(table).update(data).eq('id', id);
    } else if (this.pgPool) {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const updates = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
      
      const sql = `UPDATE ${table} SET ${updates} WHERE id = $${columns.length + 1} RETURNING *`;
      const result = await this.pgPool.query(sql, [...values, id]);
      return { data: result.rows[0], error: null };
    }

    return { data: null, error: { message: 'No database configured' } };
  }

  async delete(table: string, id: number | string) {
    await this.init();

    if (this.supabase) {
      return await this.supabase.from(table).delete().eq('id', id);
    } else if (this.pgPool) {
      const sql = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
      const result = await this.pgPool.query(sql, [id]);
      return { data: result.rows[0], error: null };
    }

    return { data: null, error: { message: 'No database configured' } };
  }

  async upsert(table: string, data: any, onConflict?: string) {
    await this.init();

    if (this.supabase) {
      return await this.supabase.from(table).upsert(data, { 
        onConflict: onConflict || 'id' 
      });
    } else if (this.pgPool) {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const updates = columns.map(col => `${col} = EXCLUDED.${col}`).join(', ');
      
      const conflictPart = onConflict ? `ON CONFLICT (${onConflict}) DO UPDATE SET ${updates}` : '';
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) ${conflictPart} RETURNING *`;
      
      const result = await this.pgPool.query(sql, values);
      return { data: result.rows, error: null };
    }

    return { data: null, error: { message: 'No database configured' } };
  }

  async close() {
    if (this.pgPool) {
      await this.pgPool.end();
    }
  }
}

// 导出单例
export const db = new Database();
export { isSupabaseMode, isVolcengineMode, loadEnv };
