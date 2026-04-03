import { pgTable, serial, varchar, text, boolean, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

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
  
  // 认证与推荐
  is_official: boolean("is_official").notNull().default(false), // 官方认证
  is_featured: boolean("is_featured").notNull().default(false), // 首页推荐
  is_active: boolean("is_active").notNull().default(true), // 是否上架
  
  // 核心优势与局限性
  advantages: jsonb("advantages").$type<string[]>().notNull().default([]), // 核心优势（最多3条）
  limitations: jsonb("limitations").$type<string[]>().notNull().default([]), // 局限性（最多2条）
  
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
