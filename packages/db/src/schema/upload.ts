import {
  bigint,
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
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    parent_id: int("parent_id"),
    owner_id: varchar("owner_id", { length: 36 }).references(() => user.id),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
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

export type Folder = typeof folder.$inferSelect;

export const folderClosure = mysqlTable(
  "folder_closure",
  {
    id: int("id").autoincrement().primaryKey(),
    ancestor: int("ancestor")
      .notNull()
      .references(() => folder.id),
    descendant: int("descendant")
      .notNull()
      .references(() => folder.id),
    depth: int("depth").notNull(),
  },
  (table) => [
    unique("folder_closure_unique").on(table.ancestor, table.descendant),
  ]
);

export const file = mysqlTable("file", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  size: bigint("size", { mode: "number" }),
  s3_key: varchar("s3_key", { length: 512 }).notNull(),
  folder_id: int("folder_id").references(() => folder.id),
  owner_id: varchar("owner_id", { length: 36 }).references(() => user.id),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type File = typeof file.$inferSelect;
export type FileInsert = typeof file.$inferInsert;

export const history = mysqlTable("history", {
  id: int("id").autoincrement().primaryKey(),
  file_id: int("file_id").references(() => file.id),
  size: int("size").notNull(),
  author_id: varchar("author_id", { length: 36 }).references(() => user.id),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
