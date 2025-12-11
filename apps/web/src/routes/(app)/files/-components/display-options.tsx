import { GridIcon, ListIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type DisplayMode,
  useDisplaySettings,
} from "@/providers/display-settings-provider";

export default function DisplayOptions() {
  const { displayMode, setDisplayMode } = useDisplaySettings();
  return (
    <ToggleGroup
      onValueChange={(v: DisplayMode | "") => {
        setDisplayMode(v === "" ? displayMode : (v as DisplayMode));
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
