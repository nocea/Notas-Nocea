
import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  mtime: number;
  birthtime: number;
  children?: FileNode[];
};

export async function getFileTree(dir: string = ''): Promise<FileNode[]> {
  const fullPath = path.join(CONTENT_DIR, dir);
  try {
    const dirents = await fs.readdir(fullPath, { withFileTypes: true });
    
    const nodes = await Promise.all(
      dirents.map(async (dirent) => {
        const relativePath = path.join(dir, dirent.name);
        const absolutePath = path.join(fullPath, dirent.name);
        const stats = await fs.stat(absolutePath);
        
        const node: FileNode = {
          name: dirent.name,
          path: relativePath,
          type: dirent.isDirectory() ? 'directory' : 'file',
          mtime: stats.mtimeMs,
          birthtime: stats.birthtimeMs,
        };

        if (node.type === 'directory') {
          node.children = await getFileTree(relativePath);
        }

        return node;
      })
    );

    // Default sort: directories first, then files by name A-Z
    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'directory' ? -1 : 1;
    });
  } catch (error) {
    console.error('Error reading content directory:', error);
    // If content dir doesn't exist, return empty
    return [];
  }
}

export async function getFileContent(filePath: string): Promise<string> {
  const fullPath = path.join(CONTENT_DIR, filePath);
  try {
    return await fs.readFile(fullPath, 'utf-8');
  } catch (error) {
    return '';
  }
}

export async function saveFileContent(filePath: string, content: string): Promise<void> {
  const fullPath = path.join(CONTENT_DIR, filePath);
  // Ensure dir exists
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
}
