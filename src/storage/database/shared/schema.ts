import { pgTable, index, unique, pgPolicy, serial, varchar, integer, timestamp, check, foreignKey, bigint, numeric, text, jsonb, boolean, bigserial } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("categories_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("categories_name_unique").on(table.name),
	unique("categories_slug_unique").on(table.slug),
	pgPolicy("categories_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("categories_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("categories_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("categories_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const searchHistory = pgTable("search_history", {
	id: serial().primaryKey().notNull(),
	keyword: varchar({ length: 100 }).notNull(),
	count: integer().default(1).notNull(),
	lastSearchedAt: timestamp("last_searched_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("search_history_count_idx").using("btree", table.count.asc().nullsLast().op("int4_ops")),
	index("search_history_keyword_idx").using("btree", table.keyword.asc().nullsLast().op("text_ops")),
	pgPolicy("search_history_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("search_history_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("search_history_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("search_history_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const tags = pgTable("tags", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("tags_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	unique("tags_name_unique").on(table.name),
	pgPolicy("tags_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("tags_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("tags_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("tags_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const members = pgTable("members", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	level: varchar({ length: 20 }).default('free').notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_members_level").using("btree", table.level.asc().nullsLast().op("text_ops")),
	index("idx_members_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	unique("members_user_id_key").on(table.userId),
	check("members_level_check", sql`(level)::text = ANY ((ARRAY['free'::character varying, 'pro'::character varying, 'enterprise'::character varying])::text[])`),
]);

export const userFavorites = pgTable("user_favorites", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	toolId: integer("tool_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_favorites_tool_id_idx").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
	index("user_favorites_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.toolId],
			foreignColumns: [tools.id],
			name: "user_favorites_tool_id_tools_id_fk"
		}).onDelete("cascade"),
	pgPolicy("user_favorites_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("user_favorites_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("user_favorites_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("user_favorites_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const userHistory = pgTable("user_history", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	toolId: integer("tool_id").notNull(),
	viewedAt: timestamp("viewed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_history_tool_id_idx").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
	index("user_history_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("user_history_viewed_at_idx").using("btree", table.viewedAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.toolId],
			foreignColumns: [tools.id],
			name: "user_history_tool_id_tools_id_fk"
		}).onDelete("cascade"),
	pgPolicy("user_history_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("user_history_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("user_history_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("user_history_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const monthlyRankings = pgTable("monthly_rankings", {
	id: serial().primaryKey().notNull(),
	rank: integer().notNull(),
	rankChange: integer("rank_change").default(0),
	toolId: integer("tool_id"),
	toolName: varchar("tool_name", { length: 200 }).notNull(),
	toolUrl: varchar("tool_url", { length: 500 }).notNull(),
	toolLogo: varchar("tool_logo", { length: 500 }),
	toolLogoBackup: varchar("tool_logo_backup", { length: 500 }),
	toolDescription: varchar("tool_description", { length: 500 }),
	monthlyVisits: varchar("monthly_visits", { length: 50 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	monthlyVisitsNum: bigint("monthly_visits_num", { mode: "number" }),
	growth: varchar({ length: 50 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	growthNum: bigint("growth_num", { mode: "number" }),
	growthRate: varchar("growth_rate", { length: 20 }),
	growthRateNum: numeric("growth_rate_num", { precision: 10, scale:  2 }),
	globalRank: integer("global_rank"),
	globalRankChange: integer("global_rank_change").default(0),
	countryRank: integer("country_rank"),
	countryRankChange: integer("country_rank_change").default(0),
	category: varchar({ length: 100 }),
	tags: text().array(),
	sourceFlag: varchar("source_flag", { length: 50 }).default('manual'),
	dataStatus: varchar("data_status", { length: 20 }).default('valid'),
	statsMonth: varchar("stats_month", { length: 7 }).notNull(),
	updateTime: timestamp("update_time", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("monthly_rankings_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("monthly_rankings_growth_rate_idx").using("btree", table.growthRateNum.asc().nullsLast().op("numeric_ops")),
	index("monthly_rankings_rank_idx").using("btree", table.rank.asc().nullsLast().op("int4_ops")),
	index("monthly_rankings_stats_month_idx").using("btree", table.statsMonth.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.toolId],
			foreignColumns: [tools.id],
			name: "monthly_rankings_tool_id_fkey"
		}).onDelete("set null"),
	unique("monthly_rankings_tool_name_stats_month_key").on(table.toolName, table.statsMonth),
]);

export const subCategories = pgTable("sub_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	parentId: integer("parent_id"),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("sub_categories_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
	index("sub_categories_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [categories.id],
			name: "sub_categories_parent_id_categories_id_fk"
		}),
	pgPolicy("sub_categories_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("sub_categories_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("sub_categories_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("sub_categories_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const userRatings = pgTable("user_ratings", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	toolId: integer("tool_id").notNull(),
	effectScore: integer("effect_score").notNull(),
	usabilityScore: integer("usability_score").notNull(),
	quotaScore: integer("quota_score").notNull(),
	stabilityScore: integer("stability_score").notNull(),
	overallScore: varchar("overall_score", { length: 10 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_ratings_tool_id_idx").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
	index("user_ratings_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.toolId],
			foreignColumns: [tools.id],
			name: "user_ratings_tool_id_tools_id_fk"
		}).onDelete("cascade"),
	pgPolicy("user_ratings_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("user_ratings_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("user_ratings_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("user_ratings_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const userReviews = pgTable("user_reviews", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	toolId: integer("tool_id").notNull(),
	content: text().notNull(),
	likes: integer().default(0).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_reviews_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("user_reviews_tool_id_idx").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
	index("user_reviews_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.toolId],
			foreignColumns: [tools.id],
			name: "user_reviews_tool_id_tools_id_fk"
		}).onDelete("cascade"),
	pgPolicy("user_reviews_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("user_reviews_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("user_reviews_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("user_reviews_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const prompts = pgTable("prompts", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	toolId: integer("tool_id"),
	category: varchar({ length: 50 }).notNull(),
	tags: jsonb().default([]).notNull(),
	author: varchar({ length: 100 }),
	uses: integer().default(0).notNull(),
	likes: integer().default(0).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("prompts_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("prompts_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("prompts_tool_id_idx").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.toolId],
			foreignColumns: [tools.id],
			name: "prompts_tool_id_fkey"
		}).onDelete("set null"),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	orderNo: varchar("order_no", { length: 50 }).notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	productType: varchar("product_type", { length: 20 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_orders_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_orders_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	unique("orders_order_no_key").on(table.orderNo),
	check("orders_product_type_check", sql`(product_type)::text = ANY ((ARRAY['monthly'::character varying, 'yearly'::character varying, 'lifetime'::character varying])::text[])`),
	check("orders_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])`),
]);

export const loginRequests = pgTable("login_requests", {
	id: serial().primaryKey().notNull(),
	sceneId: varchar("scene_id", { length: 100 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	userId: varchar("user_id", { length: 100 }),
	token: text(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_login_requests_expires_at").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_login_requests_scene_id").using("btree", table.sceneId.asc().nullsLast().op("text_ops")),
	index("idx_login_requests_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	unique("login_requests_scene_id_key").on(table.sceneId),
]);

export const tutorials = pgTable("tutorials", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	content: text().notNull(),
	toolId: integer("tool_id"),
	category: varchar({ length: 50 }).notNull(),
	difficulty: varchar({ length: 20 }).notNull(),
	coverImage: varchar("cover_image", { length: 500 }),
	author: varchar({ length: 100 }),
	views: integer().default(0).notNull(),
	likes: integer().default(0).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("tutorials_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("tutorials_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("tutorials_tool_id_idx").using("btree", table.toolId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.toolId],
			foreignColumns: [tools.id],
			name: "tutorials_tool_id_fkey"
		}).onDelete("set null"),
]);

export const adminUsers = pgTable("admin_users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	email: varchar({ length: 100 }),
	role: varchar({ length: 20 }).default('admin'),
	isActive: boolean("is_active").default(true),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	mustChangePassword: boolean("must_change_password").default(false),
}, (table) => [
	index("idx_admin_users_username").using("btree", table.username.asc().nullsLast().op("text_ops")),
	unique("admin_users_username_key").on(table.username),
	check("admin_users_role_check", sql`(role)::text = ANY ((ARRAY['admin'::character varying, 'super_admin'::character varying])::text[])`),
]);

export const adminSessions = pgTable("admin_sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_admin_sessions_expires").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_admin_sessions_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [adminUsers.id],
			name: "admin_sessions_user_id_fkey"
		}).onDelete("cascade"),
	unique("admin_sessions_token_key").on(table.token),
]);

export const users = pgTable("users", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	openid: varchar({ length: 100 }),
	unionid: varchar({ length: 100 }),
	nickname: varchar({ length: 100 }),
	avatarUrl: varchar("avatar_url", { length: 500 }),
	phone: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
	email: varchar({ length: 255 }),
	encryptedPassword: text("encrypted_password"),
}, (table) => [
	index("idx_users_openid").using("btree", table.openid.asc().nullsLast().op("text_ops")),
	index("idx_users_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	unique("users_user_id_key").on(table.userId),
	unique("users_openid_key").on(table.openid),
	unique("users_email_key").on(table.email),
]);

export const userSessions = pgTable("user_sessions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 100 }).notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_sessions_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("idx_user_sessions_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const wechatConfig = pgTable("wechat_config", {
	id: integer().default(1).primaryKey().notNull(),
	appId: varchar("app_id", { length: 100 }),
	appSecret: varchar("app_secret", { length: 100 }),
	qrCodeUrl: varchar("qr_code_url", { length: 500 }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	token: varchar({ length: 100 }),
	encodingAesKey: varchar("encoding_aes_key", { length: 100 }),
});

export const tools = pgTable("tools", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	logo: varchar({ length: 500 }).notNull(),
	producer: varchar({ length: 100 }).notNull(),
	highlight: varchar({ length: 50 }).notNull(),
	categoryId: integer("category_id").notNull(),
	subCategoryIds: jsonb("sub_category_ids").default([]),
	freeType: varchar("free_type", { length: 20 }).notNull(),
	freeQuotaDesc: varchar("free_quota_desc", { length: 200 }),
	featureTags: jsonb("feature_tags").default([]).notNull(),
	maxDuration: varchar("max_duration", { length: 50 }).notNull(),
	officialUrl: varchar("official_url", { length: 500 }).notNull(),
	promotionUrl: varchar("promotion_url", { length: 500 }),
	isOfficial: boolean("is_official").default(false).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	advantages: jsonb().default([]).notNull(),
	limitations: jsonb().default([]).notNull(),
	commercialLicense: varchar("commercial_license", { length: 20 }).notNull(),
	launchDate: timestamp("launch_date", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	clickCount: integer("click_count").default(0).notNull(),
	fts: text(),
	sponsorType: varchar("sponsor_type", { length: 20 }),
	sponsorExpiresAt: timestamp("sponsor_expires_at", { withTimezone: true, mode: 'string' }),
	coverImage: text("cover_image"),
}, (table) => [
	index("idx_tools_sponsor_type").using("btree", table.sponsorType.asc().nullsLast().op("text_ops")).where(sql`(sponsor_type IS NOT NULL)`),
	index("tools_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("tools_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("tools_free_type_idx").using("btree", table.freeType.asc().nullsLast().op("text_ops")),
	index("tools_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("tools_is_featured_idx").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "tools_category_id_categories_id_fk"
		}),
	pgPolicy("tools_允许公开写入", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`true`  }),
	pgPolicy("tools_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("tools_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("tools_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
	check("tools_sponsor_type_check", sql`(sponsor_type)::text = ANY ((ARRAY['basic'::character varying, 'premium'::character varying, 'diamond'::character varying])::text[])`),
]);

export const monthlyRankingsArchive = pgTable("monthly_rankings_archive", {
	id: serial().primaryKey().notNull(),
	backupMonth: varchar("backup_month", { length: 7 }).notNull(),
	data: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("monthly_rankings_archive_backup_month_idx").using("btree", table.backupMonth.asc().nullsLast().op("text_ops")),
]);

export const rankingConfigs = pgTable("ranking_configs", {
	id: serial().primaryKey().notNull(),
	configKey: varchar("config_key", { length: 100 }).notNull(),
	configValue: jsonb("config_value").notNull(),
	description: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("ranking_configs_config_key_key").on(table.configKey),
]);

export const rankingUpdateLogs = pgTable("ranking_update_logs", {
	id: serial().primaryKey().notNull(),
	updateMonth: varchar("update_month", { length: 7 }).notNull(),
	updateType: varchar("update_type", { length: 20 }).notNull(),
	status: varchar({ length: 20 }).notNull(),
	totalCount: integer("total_count").default(0),
	errorCount: integer("error_count").default(0),
	errorDetails: jsonb("error_details"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("ranking_update_logs_month_idx").using("btree", table.updateMonth.asc().nullsLast().op("text_ops")),
	index("ranking_update_logs_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

export const skillCategories = pgTable("skill_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	icon: varchar({ length: 100 }),
	color: varchar({ length: 20 }).default('#FF6B35'),
	sortOrder: integer("sort_order").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("skill_categories_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("skill_categories_sort_order_idx").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
	unique("skill_categories_slug_key").on(table.slug),
]);

export const skills = pgTable("skills", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	description: text(),
	icon: varchar({ length: 500 }),
	logo: varchar({ length: 500 }),
	categoryId: integer("category_id"),
	officialUrl: varchar("official_url", { length: 500 }),
	documentationUrl: varchar("documentation_url", { length: 500 }),
	githubUrl: varchar("github_url", { length: 500 }),
	pricing: varchar({ length: 50 }).default('免费'),
	difficulty: varchar({ length: 20 }).default('入门'),
	tags: jsonb().default([]),
	featureList: jsonb("feature_list").default([]),
	isFeatured: boolean("is_featured").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	clickCount: integer("click_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("skills_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("skills_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("skills_is_featured_idx").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
	index("skills_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [skillCategories.id],
			name: "skills_category_id_fkey"
		}).onDelete("cascade"),
	unique("skills_slug_key").on(table.slug),
]);

export const toolsBackup = pgTable("tools_backup", {
	id: integer(),
	name: varchar({ length: 100 }),
	logo: varchar({ length: 500 }),
	producer: varchar({ length: 100 }),
	highlight: varchar({ length: 50 }),
	categoryId: integer("category_id"),
	subCategoryIds: jsonb("sub_category_ids"),
	freeType: varchar("free_type", { length: 20 }),
	freeQuotaDesc: varchar("free_quota_desc", { length: 200 }),
	featureTags: jsonb("feature_tags"),
	maxDuration: varchar("max_duration", { length: 50 }),
	officialUrl: varchar("official_url", { length: 500 }),
	promotionUrl: varchar("promotion_url", { length: 500 }),
	isOfficial: boolean("is_official"),
	isFeatured: boolean("is_featured"),
	isActive: boolean("is_active"),
	advantages: jsonb(),
	limitations: jsonb(),
	commercialLicense: varchar("commercial_license", { length: 20 }),
	launchDate: timestamp("launch_date", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
	viewCount: integer("view_count"),
	clickCount: integer("click_count"),
	fts: text(),
	sponsorType: varchar("sponsor_type", { length: 20 }),
	sponsorExpiresAt: timestamp("sponsor_expires_at", { withTimezone: true, mode: 'string' }),
});

export const advertisements = pgTable("advertisements", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	imageUrl: text("image_url"),
	linkUrl: text("link_url").notNull(),
	position: varchar({ length: 50 }).notNull(),
	priority: integer().default(0),
	clicks: integer().default(0),
	impressions: integer().default(0),
	startsAt: timestamp("starts_at", { withTimezone: true, mode: 'string' }).notNull(),
	endsAt: timestamp("ends_at", { withTimezone: true, mode: 'string' }).notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	description: text(),
	isHighlight: boolean("is_highlight").default(false),
	targetCategory: text("target_category"),
}, (table) => [
	index("idx_advertisements_is_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_advertisements_position").using("btree", table.position.asc().nullsLast().op("text_ops")),
	index("idx_advertisements_priority").using("btree", table.priority.desc().nullsFirst().op("int4_ops")),
]);

export const utilityUsageLogs = pgTable("utility_usage_logs", {
	id: serial().primaryKey().notNull(),
	toolType: varchar("tool_type", { length: 50 }).notNull(),
	userId: varchar("user_id", { length: 100 }),
	inputData: jsonb("input_data"),
	outputData: jsonb("output_data"),
	status: varchar({ length: 20 }).default('success'),
	errorMessage: text("error_message"),
	ipAddress: varchar("ip_address", { length: 50 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_utility_logs_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_utility_logs_tool_type").using("btree", table.toolType.asc().nullsLast().op("text_ops")),
	index("idx_utility_logs_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const verificationCodes = pgTable("verification_codes", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	emailKey: varchar("email_key", { length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 10 }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	used: boolean().default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_verification_codes_email_key").using("btree", table.emailKey.asc().nullsLast().op("text_ops")),
	unique("unique_email_key").on(table.emailKey, table.code),
]);

export const apiKeys = pgTable("api_keys", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	key: varchar({ length: 100 }).notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("api_keys_key_key").on(table.key),
]);

export const apiCallLogs = pgTable("api_call_logs", {
	id: serial().primaryKey().notNull(),
	apiKeyId: integer("api_key_id"),
	endpoint: varchar({ length: 255 }),
	status: varchar({ length: 50 }),
	recordsImported: integer("records_imported").default(0),
	calledAt: timestamp("called_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.apiKeyId],
			foreignColumns: [apiKeys.id],
			name: "api_call_logs_api_key_id_fkey"
		}).onDelete("cascade"),
]);
