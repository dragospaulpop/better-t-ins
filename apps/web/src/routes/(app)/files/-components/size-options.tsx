import { ScalingIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  getSizeValue,
  sizeReverseMap,
  useDisplaySettings,
} from "@/providers/display-settings-provider";

export default function SizeOptions() {
  const { itemSize, setItemSize } = useDisplaySettings();
  return (
    <div className="flex w-48 items-center space-x-4">
      {/* <Label className="font-medium text-sm">Size</Label> */}
      <ScalingIcon className="size-4 shrink-0" />
      <Slider
        defaultValue={[getSizeValue(itemSize)]}
        max={24}
        min={12}
        onValueChange={(value) =>
          setItemSize(
            sizeReverseMap[value[0] as keyof typeof sizeReverseMap] ?? "md"
          )
        }
        step={4}
      />
      <div className="w-8 shrink-0 text-left font-medium text-sm">
        {itemSize}
      </div>
    </div>
  );
}
