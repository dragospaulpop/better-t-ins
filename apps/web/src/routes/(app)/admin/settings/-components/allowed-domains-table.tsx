import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AllowedDomainsTable() {
  return (
    <div className="mt-4 grid w-full place-items-center p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Domain</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Enabled</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    </div>
  );
}
