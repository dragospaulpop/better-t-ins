export default function buildPaths(
  folders: { folderId: number; folderName: string; parentId: number | null }[]
): Map<number, string> {
  const pathMap = new Map<number, string>();
  const folderMap = new Map(folders.map((f) => [f.folderId, f]));

  function getPath(id: number): string {
    if (pathMap.has(id)) {
      return pathMap.get(id) ?? "";
    }
    const f = folderMap.get(id);
    if (!f) {
      return "";
    }
    const parentPath = f.parentId ? getPath(f.parentId) : "";
    const path = parentPath ? `${parentPath}/${f.folderName}` : f.folderName;
    pathMap.set(id, path);
    return path;
  }

  for (const f of folders) {
    getPath(f.folderId);
  }
  return pathMap;
}
