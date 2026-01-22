'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileNode } from '@/lib/fs';
import { createNode } from '@/app/actions';
import { Folder, FileText, ChevronRight, ChevronDown, Plus, FolderPlus } from 'lucide-react';
import GitControls from './GitControls';
import styles from './Sidebar.module.css';
import clsx from 'clsx';

interface FileTreeItemProps {
  node: FileNode;
  level: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const decodedPathname = decodeURIComponent(pathname);
  
  const href = `/${node.path}`; 
  const isActive = decodedPathname === href;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const paddingLeft = `${level * 12 + 12}px`;

  if (node.type === 'directory') {
    return (
      <div className={styles.itemContainer}>
        <div 
          className={styles.item} 
          onClick={handleToggle}
          style={{ paddingLeft }}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Folder size={14} className={styles.icon} />
          <span className={styles.label}>{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div className={styles.children}>
            {node.children.map((child) => (
              <FileTreeItem key={child.path} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link 
      href={href} 
      className={clsx(styles.item, isActive && styles.active)}
      style={{ paddingLeft }}
    >
      <FileText size={14} className={styles.icon} />
      <span className={styles.label}>{node.name}</span>
    </Link>
  );
};

export default function Sidebar({ initialTree }: { initialTree: FileNode[] }) {
    const router = useRouter();

    const handleCreate = async (type: 'file' | 'folder') => {
        const name = prompt(`Enter ${type} name (e.g. folder/note.md):`);
        if (!name) return;
        
        // If it's a file and has no extension, add .md
        let finalName = name;
        if (type === 'file' && !finalName.includes('.')) {
            finalName += '.md';
        }

        const result = await createNode(finalName, type);
        if (result.success) {
            if (type === 'file') {
                router.push(`/${finalName}`);
            } else {
                router.refresh(); // Refresh to show folder? or re-fetch tree.
                // Sidebar tree is passed from server. We need to refresh the route.
                location.reload(); // Hard refresh to get new tree for now, or just router.refresh()
            }
        } else {
            alert(`Error: ${result.error}`);
        }
    };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.title}>
          <span>Notas Nocea</span>
      </div>
      <div className={styles.toolbar}>
          <button onClick={() => handleCreate('file')} className={styles.toolBtn} title="New File">
              <Plus size={16} />
          </button>
          <button onClick={() => handleCreate('folder')} className={styles.toolBtn} title="New Folder">
              <FolderPlus size={16} />
          </button>
      </div>
      <div className={styles.tree}>
        {initialTree.map((node) => (
          <FileTreeItem key={node.path} node={node} level={0} />
        ))}
      </div>
      <GitControls />
    </aside>
  );
}
