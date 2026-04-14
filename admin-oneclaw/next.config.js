/** @type {import('next').NextConfig} */
const nextConfig = {
  // 设置部署域名
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || '.oneclaw.shop',
    MAIN_DOMAIN: process.env.MAIN_DOMAIN || 'oneclaw.shop',
    ADMIN_DOMAIN: process.env.ADMIN_DOMAIN || 'admin.oneclaw.shop',
  },
};

module.exports = nextConfig;
