'use server';

import path from 'path';
import fs from 'fs/promises';
import { revalidatePath } from 'next/cache';

// Basic file operations

export async function createNode(name: string, type: 'file' | 'folder') {
  const fullPath = path.join(process.cwd(), 'content', name);
  
  try {
    // Ensure parent directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    if (type === 'folder') {
      await fs.mkdir(fullPath, { recursive: true });
    } else {
      // Check if file exists to avoid overwriting? 
      // For now let's assume if it exists we might overwrite or error.
      // Better to check.
      try {
        await fs.access(fullPath);
        return { success: false, error: 'File already exists' };
      } catch {
        // File doesn't exist, proceed
        await fs.writeFile(fullPath, '# ' + path.basename(name, '.md') + '\n\n');
      }
    }
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function saveContent(filePath: string, content: string) {
  const fullPath = path.join(process.cwd(), 'content', filePath);
  try {
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    revalidatePath(`/${filePath}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function moveNode(sourcePath: string, targetPath: string) {
    const fullSource = path.join(process.cwd(), 'content', sourcePath);
    const fullTarget = path.join(process.cwd(), 'content', targetPath);

    try {
        const fileName = path.basename(sourcePath);
        const newPath = path.join(targetPath, fileName); // targetPath is the folder
        
        const destFull = path.join(process.cwd(), 'content', newPath);
        
        await fs.rename(fullSource, destFull);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

export async function renameNode(oldPath: string, newPath: string) {
    const fullOld = path.join(process.cwd(), 'content', oldPath);
    const fullNew = path.join(process.cwd(), 'content', newPath);
    
    try {
        await fs.rename(fullOld, fullNew);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

export async function deleteNode(pathStr: string) {
    const fullPath = path.join(process.cwd(), 'content', pathStr);
    try {
        await fs.rm(fullPath, { recursive: true, force: true });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}
