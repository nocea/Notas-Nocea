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


export async function getGitConfig() {
  const repoRoot = process.cwd();
  try {
    const { stdout } = await execAsync('git remote get-url origin', { cwd: repoRoot });
    return { configured: true, remoteUrl: stdout.trim() };
  } catch (error) {
    return { configured: false, remoteUrl: '' };
  }
}

export async function setGitRemote(url: string) {
  const repoRoot = process.cwd();
  try {
    // Try to remove origin first in case it exists but is broken or we are changing it
    try {
        await execAsync('git remote remove origin', { cwd: repoRoot });
    } catch {}
    
    await execAsync(`git remote add origin ${url}`, { cwd: repoRoot });
    return { success: true };
  } catch (error) {
    console.error('Failed to set remote:', error);
    return { success: false, error: String(error) };
  }
}

export async function gitPull() {
  const repoRoot = process.cwd();
  try {
    // "pull"
    await execAsync('git pull origin master', { cwd: repoRoot });
    revalidatePath('/');
    return { success: true, message: 'Updated from master' };
  } catch (error) {
     console.error('Git pull failed:', error);
     return { success: false, error: String(error) };
  }
}

export async function gitPush() {
  const repoRoot = process.cwd();
  try {
    await execAsync('git add .', { cwd: repoRoot });
    try {
        await execAsync(`git commit -m "Auto-sync ${new Date().toISOString()}"`, { cwd: repoRoot });
    } catch {
        // Commit might fail if nothing to commit, that's fine, proceed to push
    }
    await execAsync('git push origin master', { cwd: repoRoot });
    
    return { success: true, message: 'Pushed to master' };
  } catch (error) {
    console.error('Git push failed:', error);
    return { success: false, error: String(error) };
  }
}
