import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type DisplayMode = "grid" | "list";
export type ItemSize = "xs" | "sm" | "md" | "lg";
export type SortField = "name" | "type" | "size" | "date";
export type SortDirection = "asc" | "desc";

export const DISPLAY_MODE_LS_KEY = "tudbox-display-mode";
export const ITEM_SIZE_LS_KEY = "tudbox-item-size";
export const SORT_FIELD_LS_KEY = "tudbox-sort-field";
export const SORT_DIRECTION_LS_KEY = "tudbox-sort-direction";
export const FOLDERS_FIRST_LS_KEY = "tudbox-folders-first";

export const sizeMap = {
  xs: 12, // 3rem
  sm: 16, // 4rem
  md: 20, // 5rem
  lg: 24, // 6rem
} as const;
export type Size = keyof typeof sizeMap;
export type SizeValue = (typeof sizeMap)[Size];

export const sizeReverseMap = {
  12: "xs",
  16: "sm",
  20: "md",
  24: "lg",
} as const;

export const sizeClassMap: Record<Size, string> = {
  xs: "size-12",
  sm: "size-16",
  md: "size-20",
  lg: "size-24",
};
export const sizeClassMapLoading: Record<Size, string> = {
  xs: "size-2",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};
export const getSizeValue = (size: Size): SizeValue => sizeMap[size];

interface DisplaySettingsContextValue {
  displayMode: DisplayMode;
  itemSize: ItemSize;
  sortField: SortField;
  sortDirection: SortDirection;
  foldersFirst: boolean;
  setDisplayMode: (displayMode: DisplayMode) => void;
  setItemSize: (itemSize: ItemSize) => void;
  handleSortBy: (sortField: SortField) => void;
  setSortDirection: (sortDirection: SortDirection) => void;
  setFoldersFirst: (foldersFirst: boolean) => void;
}

const DisplaySettingsContext =
  createContext<DisplaySettingsContextValue | null>(null);

export default function DisplaySettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() =>
    lsOrDefault<DisplayMode>(DISPLAY_MODE_LS_KEY, "grid")
  );
  const [itemSize, setItemSize] = useState<ItemSize>(() =>
    lsOrDefault<ItemSize>(ITEM_SIZE_LS_KEY, "md")
  );

  const [sortField, setSortField] = useState<SortField>(
    lsOrDefault<SortField>(SORT_FIELD_LS_KEY, "name")
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(() =>
    lsOrDefault<SortDirection>(SORT_DIRECTION_LS_KEY, "asc")
  );
  const [foldersFirst, setFoldersFirst] = useState<boolean>(() =>
    lsOrDefault<boolean>(FOLDERS_FIRST_LS_KEY, true)
  );

  const handleSortBy = useCallback(
    (newField: SortField) => {
      const currentField = sortField;
      const currentDirection = sortDirection;

      if (currentField === newField) {
        setSortDirection(currentDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(newField);
        setSortDirection("asc");
      }
    },
    [sortDirection, sortField]
  );

  useEffect(() => {
    setLs<DisplayMode>(DISPLAY_MODE_LS_KEY, displayMode);
  }, [displayMode]);

  useEffect(() => {
    setLs<ItemSize>(ITEM_SIZE_LS_KEY, itemSize);
  }, [itemSize]);

  useEffect(() => {
    setLs<SortField>(SORT_FIELD_LS_KEY, sortField);
  }, [sortField]);

  useEffect(() => {
    setLs<SortDirection>(SORT_DIRECTION_LS_KEY, sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    setLs<boolean>(FOLDERS_FIRST_LS_KEY, foldersFirst);
  }, [foldersFirst]);

  const value = useMemo(
    () => ({
      displayMode,
      itemSize,
      sortField,
      sortDirection,
      foldersFirst,
      setDisplayMode,
      setItemSize,
      handleSortBy,
      setSortDirection,
      setFoldersFirst,
    }),
    [
      displayMode,
      itemSize,
      handleSortBy,
      sortField,
      sortDirection,
      foldersFirst,
    ]
  );
  return (
    <DisplaySettingsContext.Provider value={value}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}

export function useDisplaySettings() {
  const context = useContext(DisplaySettingsContext);
  if (!context) {
    throw new Error(
      "useDisplaySettings must be used within a DisplaySettingsProvider"
    );
  }
  return context;
}

function lsOrDefault<T>(key: string, defaultValue: T): T {
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (_) {
      return defaultValue;
    }
  }
  return defaultValue;
}

function setLs<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
