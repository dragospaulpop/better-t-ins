import { foreignKey, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { user } from "./auth";

export const folder = mysqlTable(
  "folder",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    parent_id: int("parent_id"),
    owner_id: varchar("owner_id", { length: 36 }).references(() => user.id),
  },
  (table) => ({
    parentReference: foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
    }),
  })
);

export const file = mysqlTable("file", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  parent_id: int("parent_id").references(() => folder.id),
  owner_id: varchar("owner_id", { length: 36 }).references(() => user.id),
});

export const history = mysqlTable("history", {
  id: int("id").primaryKey().autoincrement(),
  file_id: int("file_id").references(() => file.id),
  size: int("size").notNull(),
  created_at: int("created_at").notNull(),
  author_id: varchar("author_id", { length: 36 }).references(() => user.id),
});
