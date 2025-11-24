import {
  foreignKey,
  int,
  mysqlTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { user } from "./auth";

export const folder = mysqlTable(
  "folder",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    parent_id: int("parent_id"),
    owner_id: varchar("owner_id", { length: 36 }).references(() => user.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
      name: "folder_parent_id_folder_id_fk",
    }),
    // fucking useless as mysql treats null as a different value / unknown for each combination
    unique("unique_name").on(table.parent_id, table.owner_id, table.name),
  ]
);

export const file = mysqlTable("file", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  folder_id: int("folder_id").references(() => folder.id),
  owner_id: varchar("owner_id", { length: 36 }).references(() => user.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const history = mysqlTable("history", {
  id: int("id").primaryKey().autoincrement(),
  file_id: int("file_id").references(() => file.id),
  size: int("size").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  author_id: varchar("author_id", { length: 36 }).references(() => user.id),
});
