import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

// 单例 Supabase 客户端
let supabaseClient: ReturnType<typeof createClient> | null = null;

function loadEnv(): void {
  // 如果已经有环境变量，直接使用
  if (process.env.COZE_SUPABASE_URL && process.env.COZE_SUPABASE_ANON_KEY) {
    return;
  }

  try {
    const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        print(f"{env_var.key}={env_var.value}")
except Exception as e:
    print(f"# Error: {e}", file=sys.stderr)
`;

    const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const eqIndex = line.indexOf('=');
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex);
        let value = line.substring(eqIndex + 1);
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // Silently fail
  }
}

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  loadEnv();

  const url = process.env.COZE_SUPABASE_URL;
  const key = process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('缺少 Supabase 配置: COZE_SUPABASE_URL 或 COZE_SUPABASE_ANON_KEY');
  }

  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return supabaseClient;
}
