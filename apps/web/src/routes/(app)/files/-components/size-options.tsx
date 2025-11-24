import { ScalingIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const sizeMap = {
  xs: 12, // 3rem
  sm: 16, // 4rem
  md: 20, // 5rem
  lg: 24, // 6rem
} as const;

const sizeReverseMap = {
  12: "xs",
  16: "sm",
  20: "md",
  24: "lg",
} as const;

export type Size = keyof typeof sizeMap;
export type SizeValue = (typeof sizeMap)[Size];
export const getSizeValue = (size: Size): SizeValue => sizeMap[size];

interface SizeOptionsProps {
  itemSize: Size;
  handleItemSize: (size: Size) => void;
}
export default function SizeOptions({
  itemSize,
  handleItemSize,
}: SizeOptionsProps) {
  return (
    <div className="flex w-48 items-center space-x-4">
      {/* <Label className="font-medium text-sm">Size</Label> */}
      <ScalingIcon className="size-4 shrink-0" />
      <Slider
        defaultValue={[getSizeValue(itemSize)]}
        max={24}
        min={12}
        onValueChange={(value) =>
          handleItemSize(
            sizeReverseMap[value[0] as keyof typeof sizeReverseMap] ?? "md"
          )
        }
        step={4}
      />
      <div className="w-8 shrink-0 text-left font-medium text-sm">
        {itemSize}
      </div>
    </div>
    // <ToggleGroup
    //   onValueChange={(v: Size | "") => {
    //     handleItemSize(v === "" ? itemSize : (v as Size));
    //   }}
    //   size="sm"
    //   type="single"
    //   value={itemSize}
    // >
    //   <ToggleGroupItem aria-label="Toggle xs" value="xs">
    //     xs
    //   </ToggleGroupItem>
    //   <ToggleGroupItem aria-label="Toggle sm" value="sm">
    //     sm
    //   </ToggleGroupItem>
    //   <ToggleGroupItem aria-label="Toggle md" value="md">
    //     md
    //   </ToggleGroupItem>
    //   <ToggleGroupItem aria-label="Toggle lg" value="lg">
    //     lg
    //   </ToggleGroupItem>
    // </ToggleGroup>
  );
}
