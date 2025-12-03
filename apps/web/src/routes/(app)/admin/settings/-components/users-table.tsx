import { DataTable } from "@/components/data-table";
import type { User } from "./users/columns";
import { columns } from "./users/columns";

export default function UsersTable({ data }: { data: User[] }) {
  return <DataTable columns={columns} data={data} />;
}
