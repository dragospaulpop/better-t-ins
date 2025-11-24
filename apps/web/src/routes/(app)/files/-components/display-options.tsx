import { GridIcon, ListIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DisplayOptionsProps {
  displayMode: "grid" | "list";
  setDisplayMode: (mode: "grid" | "list") => void;
}

export default function DisplayOptions({
  displayMode,
  setDisplayMode,
}: DisplayOptionsProps) {
  return (
    <ToggleGroup
      onValueChange={(v: "grid" | "list" | "") => {
        setDisplayMode(v === "" ? displayMode : (v as "grid" | "list"));
      }}
      size="sm"
      type="single"
      value={displayMode}
    >
      <ToggleGroupItem aria-label="Toggle grid" value="grid">
        <GridIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle list" value="list">
        <ListIcon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
