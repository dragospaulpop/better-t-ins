import {
  boolean,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { user } from "./auth";

export const allowedHosts = mysqlTable("allowed_hosts", {
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

export type AllowedHosts = typeof allowedHosts.$inferSelect;
export type NewAllowedHosts = typeof allowedHosts.$inferInsert;
