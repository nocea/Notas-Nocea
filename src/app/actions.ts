'use server';

import { saveFileContent } from '@/lib/fs';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export async function saveFile(filePath: string, content: string) {
  try {
    await saveFileContent(filePath, content);
    revalidatePath(`/${filePath}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to save file:', error);
    return { success: false, error: 'Failed to save file' };
  }
}

export async function createNode(pathStr: string, type: 'file' | 'folder') {
  const fullPath = path.join(process.cwd(), 'content', pathStr);
  try {
    if (type === 'folder') {
      await fs.mkdir(fullPath, { recursive: true });
    } else {
      // Check if file exists
      try {
        await fs.access(fullPath);
        return { success: false, error: 'File already exists' };
      } catch {
        // File doesn't exist, create it
        await fs.writeFile(fullPath, '', 'utf-8');
      }
    }
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to create node:', error);
    return { success: false, error: String(error) };
  }
}

import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export async function gitSync() {
  const contentDir = path.join(process.cwd(), 'content');
  // Git root might be the project root or the content dir depending on user setup.
  // User said "Con un plugin subo automaticamente las notas a el repositorio de git".
  // Assuming the WHOLE project or just content is git tracked.
  // "Desprenderme de obsidian ... subir cambios a git".
  // Let's assume the root of 'Notas Nocea' is the git repo (initialized by create-next-app),
  // OR the content storage is the repo.
  // Given `create-next-app` initialized git in root, we use root.
  const repoRoot = process.cwd();

  try {
    // 1. Add all
    await execAsync('git add .', { cwd: repoRoot });
    // 2. Commit
    await execAsync(`git commit -m "Sync from Notas Nocea at ${new Date().toISOString()}"`, { cwd: repoRoot });
    // 3. Push (might fail if no remote)
    // We'll try push, return warning if fails.
    try {
      await execAsync('git push', { cwd: repoRoot });
    } catch (pushError) {
       console.warn('Git push failed (maybe no remote?):', pushError);
       return { success: true, message: 'Committed locally. Push failed (no remote configured?).' };
    }
    
    return { success: true, message: 'Synced successfully' };
  } catch (error) {
    console.error('Git sync failed:', error);
    return { success: false, error: String(error) };
  }
}
