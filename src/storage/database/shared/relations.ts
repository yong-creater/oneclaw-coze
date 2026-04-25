import { relations } from "drizzle-orm/relations";
import { tools, userFavorites, userHistory, monthlyRankings, categories, subCategories, userRatings, userReviews, prompts, tutorials, adminUsers, adminSessions, skillCategories, skills, apiKeys, apiCallLogs } from "./schema";

export const userFavoritesRelations = relations(userFavorites, ({one}) => ({
	tool: one(tools, {
		fields: [userFavorites.toolId],
		references: [tools.id]
	}),
}));

export const toolsRelations = relations(tools, ({one, many}) => ({
	userFavorites: many(userFavorites),
	userHistories: many(userHistory),
	monthlyRankings: many(monthlyRankings),
	userRatings: many(userRatings),
	userReviews: many(userReviews),
	prompts: many(prompts),
	tutorials: many(tutorials),
	category: one(categories, {
		fields: [tools.categoryId],
		references: [categories.id]
	}),
}));

export const userHistoryRelations = relations(userHistory, ({one}) => ({
	tool: one(tools, {
		fields: [userHistory.toolId],
		references: [tools.id]
	}),
}));

export const monthlyRankingsRelations = relations(monthlyRankings, ({one}) => ({
	tool: one(tools, {
		fields: [monthlyRankings.toolId],
		references: [tools.id]
	}),
}));

export const subCategoriesRelations = relations(subCategories, ({one}) => ({
	category: one(categories, {
		fields: [subCategories.parentId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	subCategories: many(subCategories),
	tools: many(tools),
}));

export const userRatingsRelations = relations(userRatings, ({one}) => ({
	tool: one(tools, {
		fields: [userRatings.toolId],
		references: [tools.id]
	}),
}));

export const userReviewsRelations = relations(userReviews, ({one}) => ({
	tool: one(tools, {
		fields: [userReviews.toolId],
		references: [tools.id]
	}),
}));

export const promptsRelations = relations(prompts, ({one}) => ({
	tool: one(tools, {
		fields: [prompts.toolId],
		references: [tools.id]
	}),
}));

export const tutorialsRelations = relations(tutorials, ({one}) => ({
	tool: one(tools, {
		fields: [tutorials.toolId],
		references: [tools.id]
	}),
}));

export const adminSessionsRelations = relations(adminSessions, ({one}) => ({
	adminUser: one(adminUsers, {
		fields: [adminSessions.userId],
		references: [adminUsers.id]
	}),
}));

export const adminUsersRelations = relations(adminUsers, ({many}) => ({
	adminSessions: many(adminSessions),
}));

export const skillsRelations = relations(skills, ({one}) => ({
	skillCategory: one(skillCategories, {
		fields: [skills.categoryId],
		references: [skillCategories.id]
	}),
}));

export const skillCategoriesRelations = relations(skillCategories, ({many}) => ({
	skills: many(skills),
}));

export const apiCallLogsRelations = relations(apiCallLogs, ({one}) => ({
	apiKey: one(apiKeys, {
		fields: [apiCallLogs.apiKeyId],
		references: [apiKeys.id]
	}),
}));

export const apiKeysRelations = relations(apiKeys, ({many}) => ({
	apiCallLogs: many(apiCallLogs),
}));