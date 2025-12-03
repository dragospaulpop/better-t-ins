import {
  boolean,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { user } from "./auth";

export const allowedHost = mysqlTable("allowed_host", {
  host: varchar("host", { length: 255 }).notNull().primaryKey(),
  description: text("description").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  addedBy: varchar("added_by", { length: 36 }).references(() => user.id),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type AllowedHost = typeof allowedHost.$inferSelect;
export type NewAllowedHost = typeof allowedHost.$inferInsert;
