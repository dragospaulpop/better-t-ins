export interface FileInfo {
  fileId: number;
  fileName: string;
  s3Key: string;
}

export interface FolderNode {
  id: number;
  name: string;
  depth: number;
  files: FileInfo[];
  children: FolderNode[];
}

export default function buildTree(
  folders: {
    folderId: number;
    folderName: string;
    parentId: number | null;
    depth: number;
  }[],
  files: {
    fileId: number;
    fileName: string;
    s3Key: string;
    folderId: number | null;
  }[]
): FolderNode | null {
  const filesByFolder = Map.groupBy(files, (f) => f.folderId);
  const nodeMap = new Map<number, FolderNode>();

  // Create nodes
  for (const f of folders) {
    nodeMap.set(f.folderId, {
      id: f.folderId,
      name: f.folderName,
      depth: f.depth,
      files: filesByFolder.get(f.folderId) ?? [],
      children: [],
    });
  }

  // Link children (depth 0 is root)
  let root: FolderNode | null = null;
  for (const f of folders) {
    const node = nodeMap.get(f.folderId);
    if (!node) {
      continue;
    }
    if (f.depth === 0) {
      root = node ?? null;
    } else if (f.parentId !== null) {
      nodeMap.get(f.parentId)?.children.push(node);
    }
  }

  return root;
}
