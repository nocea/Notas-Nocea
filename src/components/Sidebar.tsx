'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileNode } from '@/lib/fs';
import { createNode, moveNode, renameNode, deleteNode } from '@/app/actions';
import { Folder, FileText, ChevronRight, ChevronDown, Plus, FolderPlus, Trash, Edit, MoreVertical, SortAsc, Check, FoldVertical, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import styles from './Sidebar.module.css';
import clsx from 'clsx';
import { DndContext, useDraggable, useDroppable, DragEndEvent, pointerWithin, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import ThemeToggle from './ThemeToggle';

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  editingState: { path: string; type: 'file' | 'directory' } | null;
  creatingState: { parentPath: string; type: 'file' | 'directory' } | null;
  onSubmit: (val: string) => void;
  onCancel: () => void;
  collapseAllTick?: number;
  searchQuery?: string;
}

// Inline Input Component
const InlineInput = ({ 
    initialValue, 
    onSubmit, 
    onCancel, 
    placeholder 
}: { 
    initialValue: string, 
    onSubmit: (val: string) => void, 
    onCancel: () => void,
    placeholder?: string
}) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.stopPropagation(); // prevent dnd or other events
            onSubmit(value);
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    const handleBlur = () => {
        if (value.trim()) {
            onSubmit(value);
        } else {
            onCancel();
        }
    };

    return (
        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            className={styles.inlineInput}
            placeholder={placeholder}
        />
    );
};

// ... Drag/Drop components ...
const DraggableItem = ({ node, children }: { node: FileNode, children: React.ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: node.path,
        data: node
    });
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => setIsMounted(true), []);

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        position: 'relative' as const,
        opacity: 0.8
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...(isMounted ? listeners : {})} {...(isMounted ? attributes : {})}>
            {children}
        </div>
    );
};

const DroppableItem = ({ node, children }: { node: FileNode, children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: node.path,
        data: node,
        disabled: node.type !== 'directory'
    });
    return (
        <div ref={node.type === 'directory' ? setNodeRef : undefined} className={clsx(isOver && styles.dropTarget)}>
             {children}
        </div>
    );
};

const RootDropZone = ({ children }: { children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({ id: 'ROOT', data: { type: 'directory', path: '' } });
    return (
        <div ref={setNodeRef} className={clsx(styles.tree, isOver && styles.dropTarget)} style={{ minHeight: '100px' }}>
            {children}
        </div>
    );
}

const getDisplayName = (name: string, type: 'file' | 'directory') => {
    if (type === 'directory') return name;
    return name.replace(/\.md$/, '');
};

const FileTreeItem: React.FC<FileTreeItemProps> = (props) => {
    const { 
  node, level, onContextMenu, editingState, creatingState, onSubmit, onCancel, collapseAllTick, searchQuery 
} = props;
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const decodedPathname = pathname ? decodeURIComponent(pathname) : '';
  const href = `/${node.path}`; 
  const isActive = decodedPathname === href;
  
  // Force open if creating inside this folder
  useEffect(() => {
      if (creatingState && creatingState.parentPath === node.path) {
          setIsOpen(true);
      }
  }, [creatingState, node.path]);

  // Handle collapse all
  useEffect(() => {
      if (node.type === 'directory') {
          setIsOpen(false);
      }
  }, [node.type, props.collapseAllTick]);

  // Auto-expand on search
  useEffect(() => {
      if (props.searchQuery && node.type === 'directory') {
          setIsOpen(true);
      }
  }, [props.searchQuery, node.type]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const paddingLeft = `${level * 12 + 12}px`;
  const isEditing = editingState?.path === node.path;
  const isCreatingChild = creatingState?.parentPath === node.path;
  const isSearchMatch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

  // Render content
  let labelContent;
  if (isEditing) {
      labelContent = (
          <InlineInput 
              initialValue={getDisplayName(node.name, node.type)} 
              onSubmit={onSubmit} 
              onCancel={onCancel} 
          />
      );
  } else {
      labelContent = <span className={styles.label}>{getDisplayName(node.name, node.type)}</span>;
  }

  const content = node.type === 'directory' ? (
      <div className={styles.itemContainer}>
        <div 
          className={clsx(styles.item, isSearchMatch && styles.searchHighlight)} 
          onClick={handleToggle}
          onContextMenu={(e) => onContextMenu(e, node)}
          style={{ paddingLeft }}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Folder size={14} className={styles.icon} />
          {labelContent}
        </div>
        {isOpen && (
            <div className={styles.children}>
                {isCreatingChild && (
                    <div className={styles.item} style={{ paddingLeft: `${(level + 1) * 12 + 12}px` }}>
                        {creatingState.type === 'directory' ? <Folder size={14} className={styles.icon}/> : <FileText size={14} className={styles.icon}/>}
                         <InlineInput 
                            initialValue="" 
                            onSubmit={onSubmit} 
                            onCancel={onCancel} 
                            placeholder={creatingState.type === 'file' ? 'Nueva Nota...' : 'Nueva Carpeta...'} 
                         />
                    </div>
                )}
                {node.children?.map((child) => (
                    <FileTreeItem 
                        key={child.path} 
                        node={child} 
                        level={level + 1} 
                        onContextMenu={onContextMenu}
                        editingState={editingState}
                        creatingState={creatingState}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                        collapseAllTick={collapseAllTick}
                        searchQuery={searchQuery}
                    />
                ))}
            </div>
        )}
      </div>
  ) : (
    <Link 
      href={isEditing ? '#' : href} // Disable link when editing
      className={clsx(styles.item, isActive && styles.active, isSearchMatch && styles.searchHighlight)}
      style={{ paddingLeft }}
      onContextMenu={(e) => onContextMenu(e, node)}
      onClick={(e) => isEditing && e.preventDefault()}
    >
      <FileText size={14} className={styles.icon} />
      {labelContent}
    </Link>
  );

  if (isEditing) {
      // If editing, disable drag/drop wrapper to prevent interference
      return <>{content}</>;
  }

  return (
      <DroppableItem node={node}>
          <DraggableItem node={node}>
              {content}
          </DraggableItem>
      </DroppableItem>
  );
};

export default function Sidebar({ initialTree }: { initialTree: FileNode[] }) {
    const router = useRouter();
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: FileNode | null }>({ x: 0, y: 0, node: null });
    
    // Using 'directory' instead of 'folder' to match FileNode type
    const [editingState, setEditingState] = useState<{ path: string; type: 'file' | 'directory' } | null>(null);
    const [creatingState, setCreatingState] = useState<{ parentPath: string; type: 'file' | 'directory' } | null>(null);
    const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'mtime-asc' | 'mtime-desc' | 'birthtime-asc' | 'birthtime-desc'>('name-asc');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [collapseAllTick, setCollapseAllTick] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    // --- Actions ---

    const handleCreateStart = (type: 'file' | 'directory', parentPath: string = '') => {
        setCreatingState({ parentPath, type });
        setEditingState(null);
    };

    const handleRenameStart = (node: FileNode) => {
        setEditingState({ path: node.path, type: node.type });
        setCreatingState(null);
    };

    const handleSubmit = async (value: string) => {
        if (creatingState) {
            let finalName = value;
            if (creatingState.type === 'file' && !finalName.includes('.')) finalName += '.md';
            
            const fullPath = creatingState.parentPath // Creating child
                ? `${creatingState.parentPath}/${finalName}` 
                : finalName; // Creating at root

            // Convert type for API which expects 'folder' | 'file' usually, or check API def.
            // createNode expects 'file' | 'folder'. 
            const apiType = creatingState.type === 'directory' ? 'folder' : 'file';

            setCreatingState(null); 
            
            const result = await createNode(fullPath, apiType);
            if (result.success) {
                if (creatingState.type === 'file') router.push(`/${fullPath}`);
                else location.reload();
            } else {
                alert(result.error);
            }
        } else if (editingState) {
             const parts = editingState.path.split('/');
             const oldName = parts.pop() || '';
             const parentPath = parts.join('/');
             
             let newName = value;
             if (oldName.endsWith('.md') && !newName.endsWith('.md')) {
                 newName += '.md';
             }

             const newPath = parentPath ? `${parentPath}/${newName}` : newName;
             setEditingState(null);

             if (newPath !== editingState.path) {
                 await renameNode(editingState.path, newPath);
                 router.push(`/${newPath}`);
                 location.reload();
             }
        }
    };

    const handleCancel = () => {
        setEditingState(null);
        setCreatingState(null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
             const sourcePath = String(active.id);
             let targetPath = String(over.id);
             if (targetPath === 'ROOT') targetPath = '';
             if (sourcePath === targetPath) return; // ignore drop on self

             await moveNode(sourcePath, targetPath);
             location.reload(); 
        }
    };
    
    const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };
    const closeContextMenu = () => setContextMenu({ x: 0, y: 0, node: null });

    useEffect(() => {
        const clickHandler = () => {
            closeContextMenu();
            setShowSortMenu(false);
        };
        window.addEventListener('click', clickHandler);
        return () => window.removeEventListener('click', clickHandler);
    }, []);

    const sortNodes = (nodes: FileNode[]): FileNode[] => {
        const sorted = [...nodes].sort((a, b) => {
            // Directories always first? Let's check user preference or keep them first
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }

            switch (sortOption) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'mtime-desc':
                    return b.mtime - a.mtime;
                case 'mtime-asc':
                    return a.mtime - b.mtime;
                case 'birthtime-desc':
                    return b.birthtime - a.birthtime;
                case 'birthtime-asc':
                    return a.birthtime - b.birthtime;
                default:
                    return 0;
            }
        });

        return sorted.map(node => ({
            ...node,
            children: node.children ? sortNodes(node.children) : undefined
        }));
    };

    const filterNodes = (nodes: FileNode[], query: string): FileNode[] => {
        if (!query) return nodes;
        
        const lowerQuery = query.toLowerCase();
        
        return nodes.reduce((acc: FileNode[], node) => {
            const matchesItself = node.name.toLowerCase().includes(lowerQuery);
            const filteredChildren = node.children ? filterNodes(node.children, query) : undefined;
            const hasMatchingChildren = filteredChildren && filteredChildren.length > 0;
            
            if (matchesItself || hasMatchingChildren) {
                acc.push({
                    ...node,
                    children: filteredChildren
                });
            }
            return acc;
        }, []);
    };

    const filteredTree = filterNodes(initialTree, searchQuery);
    const sortedTree = sortNodes(filteredTree);

  return (
    <>
      {isCollapsed && (
        <button 
          className={styles.expandBtn} 
          onClick={() => setIsCollapsed(false)}
          title="Mostrar Sidebar"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}
      <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin} sensors={sensors}>
        <aside className={clsx(styles.sidebar, isCollapsed && styles.collapsed)}>
          <div style={{ opacity: isCollapsed ? 0 : 1, transition: 'opacity 0.2s', display: isCollapsed ? 'none' : 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className={styles.title}>
                <span>Notas</span>
                <button 
                  className={styles.collapseBtn} 
                  onClick={() => setIsCollapsed(true)}
                  title="Ocultar Sidebar"
                >
                  <PanelLeftClose size={18} />
                </button>
            </div>
        <div className={styles.searchContainer}>
            <input 
                type="text" 
                placeholder="Buscar notas..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div className={styles.toolbar}>
            <button onClick={() => handleCreateStart('file')} className={styles.toolBtn} title="Nueva Nota">
                <Plus size={16} />
            </button>
            <button onClick={() => handleCreateStart('directory')} className={styles.toolBtn} title="Nueva Carpeta">
                <FolderPlus size={16} />
            </button>
            <div className={styles.sortWrapper}>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }} 
                    className={clsx(styles.toolBtn, showSortMenu && styles.activeTool)} 
                    title="Ordenar"
                >
                    <SortAsc size={16} />
                </button>
                {showSortMenu && (
                    <div className={styles.sortMenu} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.sortOption} onClick={() => { setSortOption('name-asc'); setShowSortMenu(false); }}>
                            Ordenar por nombre de archivo (A-Z) {sortOption === 'name-asc' && <Check size={14} />}
                        </div>
                        <div className={styles.sortOption} onClick={() => { setSortOption('name-desc'); setShowSortMenu(false); }}>
                            Ordenar por nombre de archivo (Z-A) {sortOption === 'name-desc' && <Check size={14} />}
                        </div>
                        <div className={styles.sortDivider} />
                        <div className={styles.sortOption} onClick={() => { setSortOption('mtime-desc'); setShowSortMenu(false); }}>
                            Ordenar por fecha de edición (más reciente) {sortOption === 'mtime-desc' && <Check size={14} />}
                        </div>
                        <div className={styles.sortOption} onClick={() => { setSortOption('mtime-asc'); setShowSortMenu(false); }}>
                            Ordenar por fecha de edición (más antiguo) {sortOption === 'mtime-asc' && <Check size={14} />}
                        </div>
                        <div className={styles.sortDivider} />
                        <div className={styles.sortOption} onClick={() => { setSortOption('birthtime-desc'); setShowSortMenu(false); }}>
                            Creado (nuevo-antiguo) {sortOption === 'birthtime-desc' && <Check size={14} />}
                        </div>
                        <div className={styles.sortOption} onClick={() => { setSortOption('birthtime-asc'); setShowSortMenu(false); }}>
                            Creado (antiguo-nuevo) {sortOption === 'birthtime-asc' && <Check size={14} />}
                        </div>
                    </div>
                )}
            </div>
            <button 
                onClick={() => setCollapseAllTick(t => t + 1)} 
                className={styles.toolBtn} 
                title="Colapsar Todo"
            >
                <FoldVertical size={16} />
            </button>
            <div className={styles.themeToggleWrapper}>
                <ThemeToggle />
            </div>
        </div>
        <RootDropZone>
            {creatingState?.parentPath === '' && (
                 <div className={styles.item} style={{ paddingLeft: '12px' }}>
                    {creatingState.type === 'directory' ? <Folder size={14} className={styles.icon}/> : <FileText size={14} className={styles.icon}/>}
                     <InlineInput 
                        initialValue="" 
                        onSubmit={handleSubmit} 
                        onCancel={handleCancel} 
                        placeholder={creatingState.type === 'file' ? 'Nueva Nota...' : 'Nueva Carpeta...'} 
                     />
                </div>
            )}
            {sortedTree.map((node) => (
            <FileTreeItem 
                key={node.path} 
                node={node} 
                level={0} 
                onContextMenu={handleContextMenu}
                editingState={editingState}
                creatingState={creatingState}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                collapseAllTick={collapseAllTick}
                searchQuery={searchQuery}
            />
            ))}
        </RootDropZone>
        
        {contextMenu.node && (
            <div 
                className={styles.contextMenu} 
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onClick={(e) => e.stopPropagation()} 
            >
                {contextMenu.node.type === 'directory' && (
                    <>
                    <div onClick={() => { handleCreateStart('file', contextMenu.node!.path); closeContextMenu(); }} className={styles.contextMenuItem}>
                        <FileText size={14} /> Nueva Nota
                    </div>
                    <div onClick={() => { handleCreateStart('directory', contextMenu.node!.path); closeContextMenu(); }} className={styles.contextMenuItem}>
                        <FolderPlus size={14} /> Nueva Carpeta
                    </div>
                    </>
                )}
                <div onClick={() => { handleRenameStart(contextMenu.node!); closeContextMenu(); }} className={styles.contextMenuItem}>
                    <Edit size={14} /> Renombrar
                </div>
                <div onClick={async () => { 
                    if(confirm(`¿Eliminar ${getDisplayName(contextMenu.node!.name, contextMenu.node!.type)}?`)) { 
                        await deleteNode(contextMenu.node!.path); 
                        closeContextMenu();
                        router.push('/');
                    }
                }} className={styles.contextMenuItem}>
                    <Trash size={14} /> Eliminar
                </div>
            </div>
        )}
          </div>
        </aside>
      </DndContext>
    </>
  );
}
