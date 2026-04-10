import { pgTable, serial, varchar, text, boolean, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core"

// 系统健康检查表（必须保留）
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 一级分类表
export const categories = pgTable("categories", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("categories_slug_idx").on(table.slug),
]);

// 二级分类表
export const subCategories = pgTable("sub_categories", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull(),
  parent_id: integer("parent_id").references(() => categories.id),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("sub_categories_parent_id_idx").on(table.parent_id),
  index("sub_categories_slug_idx").on(table.slug),
]);

// AI工具库表
export const tools = pgTable("tools", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  logo: varchar("logo", { length: 500 }).notNull(),
  producer: varchar("producer", { length: 100 }).notNull(), // 出品方
  highlight: varchar("highlight", { length: 50 }).notNull(), // 一句话核心亮点
  
  // 描述信息
  short_desc: text("short_desc"), // 简短描述（首页展示）
  full_desc: text("full_desc"), // 完整描述（详情页）
  use_guide: text("use_guide"), // 使用指南
  
  // 分类
  category_id: integer("category_id").notNull().references(() => categories.id),
  sub_category_ids: jsonb("sub_category_ids").$type<number[]>().default([]), // 二级分类ID数组
  
  // 免费信息
  free_type: varchar("free_type", { length: 20 }).notNull(), // 完全免费、免费额度、限时免费、付费工具
  free_quota_desc: varchar("free_quota_desc", { length: 200 }), // 免费额度说明
  
  // 功能标签
  feature_tags: jsonb("feature_tags").$type<string[]>().notNull().default([]),
  
  // 生成能力
  max_duration: varchar("max_duration", { length: 50 }).notNull(), // 生成时长上限
  
  // 链接
  official_url: varchar("official_url", { length: 500 }).notNull(), // 官网直达链接
  promotion_url: varchar("promotion_url", { length: 500 }), // 专属推广链接
  customer_email: varchar("customer_email", { length: 200 }), // 联系邮箱
  feedback_link: varchar("feedback_link", { length: 500 }), // 反馈链接
  
  // 认证与推荐
  is_official: boolean("is_official").notNull().default(false), // 官方认证
  is_featured: boolean("is_featured").notNull().default(false), // 首页推荐
  is_active: boolean("is_active").notNull().default(true), // 是否上架
  
  // 付费收录（P2功能）
  sponsor_type: varchar("sponsor_type", { length: 20 }), // basic, premium, diamond
  sponsor_expires_at: timestamp("sponsor_expires_at", { withTimezone: true }), // 推广到期时间
  
  // 核心优势与局限性
  advantages: jsonb("advantages").$type<string[]>().notNull().default([]), // 核心优势（最多3条）
  limitations: jsonb("limitations").$type<string[]>().notNull().default([]), // 局限性（最多2条）
  
  // 适用场景
  scenes: jsonb("scenes").$type<{
    scene_no: string;
    user_group: string;
    scene_desc: string;
  }[]>().default([]),
  
  // 核心功能
  functions: jsonb("functions").$type<{
    func_name: string;
    func_desc: string;
  }[]>().default([]),
  
  // 常见问题
  faqs: jsonb("faqs").$type<{
    question: string;
    answer: string;
  }[]>().default([]),
  
  // 商用授权
  commercial_license: varchar("commercial_license", { length: 20 }).notNull(), // 可免费商用、需授权商用、不可商用
  
  // 时间
  launch_date: timestamp("launch_date", { withTimezone: true }).notNull(), // 上线时间
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  
  // 统计数据
  view_count: integer("view_count").notNull().default(0), // 浏览量
  click_count: integer("click_count").notNull().default(0), // 点击量
  
  // 全文搜索字段
  fts: text("fts"), // tsvector 全文搜索
}, (table) => [
  index("tools_category_id_idx").on(table.category_id),
  index("tools_is_featured_idx").on(table.is_featured),
  index("tools_is_active_idx").on(table.is_active),
  index("tools_free_type_idx").on(table.free_type),
  index("tools_created_at_idx").on(table.created_at),
]);

// 标签表
export const tags = pgTable("tags", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(), // feature, free_type, duration, scene, license
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("tags_type_idx").on(table.type),
]);

// 搜索历史表
export const searchHistory = pgTable("search_history", {
  id: serial().primaryKey(),
  keyword: varchar("keyword", { length: 100 }).notNull(),
  count: integer("count").notNull().default(1),
  last_searched_at: timestamp("last_searched_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("search_history_keyword_idx").on(table.keyword),
  index("search_history_count_idx").on(table.count),
]);

// 用户收藏表（预留P1功能）
export const userFavorites = pgTable("user_favorites", {
  id: serial().primaryKey(),
  user_id: varchar("user_id", { length: 100 }).notNull(), // 暂用OpenID
  tool_id: integer("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("user_favorites_user_id_idx").on(table.user_id),
  index("user_favorites_tool_id_idx").on(table.tool_id),
]);

// 用户浏览历史表（预留P1功能）
export const userHistory = pgTable("user_history", {
  id: serial().primaryKey(),
  user_id: varchar("user_id", { length: 100 }).notNull(),
  tool_id: integer("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  viewed_at: timestamp("viewed_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("user_history_user_id_idx").on(table.user_id),
  index("user_history_tool_id_idx").on(table.tool_id),
  index("user_history_viewed_at_idx").on(table.viewed_at),
]);

// 用户评分表（预留P1功能）
export const userRatings = pgTable("user_ratings", {
  id: serial().primaryKey(),
  user_id: varchar("user_id", { length: 100 }).notNull(),
  tool_id: integer("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  effect_score: integer("effect_score").notNull(), // 生成效果评分 1-5
  usability_score: integer("usability_score").notNull(), // 易用性评分 1-5
  quota_score: integer("quota_score").notNull(), // 免费额度评分 1-5
  stability_score: integer("stability_score").notNull(), // 稳定性评分 1-5
  overall_score: varchar("overall_score", { length: 10 }).notNull(), // 综合评分
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("user_ratings_user_id_idx").on(table.user_id),
  index("user_ratings_tool_id_idx").on(table.tool_id),
]);

// 用户短评表（预留P1功能）
export const userReviews = pgTable("user_reviews", {
  id: serial().primaryKey(),
  user_id: varchar("user_id", { length: 100 }).notNull(),
  tool_id: integer("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("user_reviews_user_id_idx").on(table.user_id),
  index("user_reviews_tool_id_idx").on(table.tool_id),
  index("user_reviews_status_idx").on(table.status),
]);

// 教程表（P1功能）
export const tutorials = pgTable("tutorials", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  tool_id: integer("tool_id").references(() => tools.id, { onDelete: "set null" }),
  category: varchar("category", { length: 50 }).notNull(), // 入门教程、进阶技巧、案例分享
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // 初级、中级、高级
  cover_image: varchar("cover_image", { length: 500 }),
  author: varchar("author", { length: 100 }),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  is_featured: boolean("is_featured").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("tutorials_tool_id_idx").on(table.tool_id),
  index("tutorials_category_idx").on(table.category),
  index("tutorials_status_idx").on(table.status),
]);

// Prompt模板表（P1功能）
export const prompts = pgTable("prompts", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  tool_id: integer("tool_id").references(() => tools.id, { onDelete: "set null" }),
  category: varchar("category", { length: 50 }).notNull(), // 角色扮演、场景描述、风格迁移
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  author: varchar("author", { length: 100 }),
  uses: integer("uses").notNull().default(0), // 使用次数
  likes: integer("likes").notNull().default(0),
  is_featured: boolean("is_featured").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("prompts_tool_id_idx").on(table.tool_id),
  index("prompts_category_idx").on(table.category),
  index("prompts_status_idx").on(table.status),
]);

// 会员表（P2功能）
export const members = pgTable("members", {
  id: serial().primaryKey(),
  user_id: varchar("user_id", { length: 100 }).notNull().unique(),
  level: varchar("level", { length: 20 }).notNull().default("free"), // free, pro, enterprise
  expires_at: timestamp("expires_at", { withTimezone: true }),
  points: integer("points").notNull().default(0), // 积分
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("members_user_id_idx").on(table.user_id),
  index("members_level_idx").on(table.level),
]);

// 广告位表（P2功能）
export const advertisements = pgTable("advertisements", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  image_url: varchar("image_url", { length: 500 }).notNull(),
  link_url: varchar("link_url", { length: 500 }).notNull(),
  position: varchar("position", { length: 50 }).notNull(), // home_banner, sidebar, tool_detail
  priority: integer("priority").notNull().default(0), // 权重
  clicks: integer("clicks").notNull().default(0),
  impressions: integer("impressions").notNull().default(0),
  starts_at: timestamp("starts_at", { withTimezone: true }).notNull(),
  ends_at: timestamp("ends_at", { withTimezone: true }).notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("advertisements_position_idx").on(table.position),
  index("advertisements_is_active_idx").on(table.is_active),
]);

// ============================================
// 月度榜单相关表（Toolify榜单功能）
// ============================================

// 月度榜单表
export const monthlyRankings = pgTable("monthly_rankings", {
  id: serial().primaryKey(),
  
  // 排名信息
  rank: integer("rank").notNull(),
  rankChange: integer("rank_change").default(0),
  
  // 工具基本信息
  toolId: integer("tool_id").references(() => tools.id, { onDelete: "set null" }),
  toolName: varchar("tool_name", { length: 200 }).notNull(),
  toolUrl: varchar("tool_url", { length: 500 }).notNull(),
  toolLogo: varchar("tool_logo", { length: 500 }),
  toolLogoBackup: varchar("tool_logo_backup", { length: 500 }),
  toolDescription: varchar("tool_description", { length: 500 }),
  
  // 流量数据
  monthlyVisits: varchar("monthly_visits", { length: 50 }).notNull(),
  monthlyVisitsNum: integer("monthly_visits_num"),
  growth: varchar("growth", { length: 50 }),
  growthNum: integer("growth_num"),
  growthRate: varchar("growth_rate", { length: 20 }),
  growthRateNum: varchar("growth_rate_num", { length: 20 }), // 使用 varchar 存储 DECIMAL
  
  // 排名信息
  globalRank: integer("global_rank"),
  globalRankChange: integer("global_rank_change").default(0),
  countryRank: integer("country_rank"),
  countryRankChange: integer("country_rank_change").default(0),
  
  // 分类标签
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // 数据来源
  sourceFlag: varchar("source_flag", { length: 50 }).default("manual"),
  dataStatus: varchar("data_status", { length: 20 }).default("valid"),
  
  // 时间信息
  statsMonth: varchar("stats_month", { length: 7 }).notNull(), // YYYY-MM
  updateTime: timestamp("update_time", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("monthly_rankings_stats_month_idx").on(table.statsMonth),
  index("monthly_rankings_rank_idx").on(table.rank),
  index("monthly_rankings_category_idx").on(table.category),
]);

// 月度榜单历史归档表
export const monthlyRankingsArchive = pgTable("monthly_rankings_archive", {
  id: serial().primaryKey(),
  backupMonth: varchar("backup_month", { length: 7 }).notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("monthly_rankings_archive_backup_month_idx").on(table.backupMonth),
]);

// 榜单配置表
export const rankingConfigs = pgTable("ranking_configs", {
  id: serial().primaryKey(),
  configKey: varchar("config_key", { length: 100 }).notNull().unique(),
  configValue: jsonb("config_value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 榜单更新日志表
export const rankingUpdateLogs = pgTable("ranking_update_logs", {
  id: serial().primaryKey(),
  updateMonth: varchar("update_month", { length: 7 }).notNull(),
  updateType: varchar("update_type", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  totalCount: integer("total_count").default(0),
  errorCount: integer("error_count").default(0),
  errorDetails: jsonb("error_details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("ranking_update_logs_month_idx").on(table.updateMonth),
  index("ranking_update_logs_status_idx").on(table.status),
]);

// ============================================
// Skill 技能导航相关表
// ============================================

// 技能分类表
export const skillCategories = pgTable("skill_categories", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // 图标名称或 emoji
  color: varchar("color", { length: 20 }).default("#FF6B35"), // 分类主题色
  sort_order: integer("sort_order").notNull().default(0),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("skill_categories_slug_idx").on(table.slug),
  index("skill_categories_sort_order_idx").on(table.sort_order),
]);

// 技能表
export const skills = pgTable("skills", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 500 }), // 图标 URL
  logo: varchar("logo", { length: 500 }), // Logo URL
  category_id: integer("category_id").references(() => skillCategories.id, { onDelete: "cascade" }),
  official_url: varchar("official_url", { length: 500 }),
  documentation_url: varchar("documentation_url", { length: 500 }), // 文档链接
  github_url: varchar("github_url", { length: 500 }), // GitHub 链接
  pricing: varchar("pricing", { length: 50 }).default("免费"), // 免费/付费/ Freemium
  difficulty: varchar("difficulty", { length: 20 }).default("入门"), // 入门/进阶/高级
  tags: jsonb("tags").$type<string[]>().default([]),
  feature_list: jsonb("feature_list").$type<string[]>().default([]), // 功能特性列表
  is_featured: boolean("is_featured").notNull().default(false),
  is_active: boolean("is_active").notNull().default(true),
  view_count: integer("view_count").notNull().default(0),
  click_count: integer("click_count").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("skills_category_id_idx").on(table.category_id),
  index("skills_slug_idx").on(table.slug),
  index("skills_is_featured_idx").on(table.is_featured),
  index("skills_is_active_idx").on(table.is_active),
]);
