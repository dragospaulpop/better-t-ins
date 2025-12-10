import type { AllowedHost } from "@tud-box/db/schema/settings";
import { DataTable } from "@/components/data-table";
import { columns } from "./allowed-domains/columns";

export default function AllowedDomainsTable({ data }: { data: AllowedHost[] }) {
  return <DataTable columns={columns} data={data} />;
}
