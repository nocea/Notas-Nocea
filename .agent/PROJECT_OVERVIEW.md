# Notas Nocea - Documentación del Proyecto

## 📋 Resumen

Aplicación web de gestión de notas personales construida con **Next.js 15 (App Router)**. Diseñada para reemplazar herramientas como Obsidian, ofreciendo un entorno web moderno, personalizable y 100% local.

## 🏗 Arquitectura Técnica

### Core

- **Framework**: Next.js 15
- **Lenguaje**: TypeScript
- **Estilos**: Elementos CSS Module (`.module.css`) + Tailwind (soporte básico).
- **Iconos**: Lucide React.

### Estructura de Archivos

- `src/app`: Rutas de la aplicación (App Router).
  - `layout.tsx`: Layout raíz, define tipografía y estructura global (Sidebar + Main Content).
  - `page.tsx`: Página de bienvenida vacía.
  - `api/`: Endpoints API (si los hubiera, actualmente usamos Server Actions).
  - `actions.ts`: **Server Actions** para operaciones de sistema de archivos (crear, guardar, mover, eliminar).
- `src/components`: Componentes reutilizables.
  - `Sidebar.tsx`: Gestor de archivos lateral (árbol, drag & drop, inline inputs).
  - `EditorLayout.tsx`: Layout del editor, gestiona estados de vista (Edit/View/Split).
  - `CodeEditor.tsx`: Editor de texto basado en Monaco/CodeMirror (actualmente textarea/custom).
  - `MarkdownViewer.tsx`: Renderizador de Markdown.
- `content/`: Carpeta raíz donde se almacenan físicamente las notas `.md` y carpetas del usuario.

## ✨ Funcionalidades Clave

### 1. Gestión de Archivos Sidebar ("Sidebar.tsx")

El componente más complejo. Implementa un árbol de archivos interactivo con:

- **Tecnología**: `@dnd-kit/core` para Drag & Drop.
- **Edición en Línea**:
  - No usa modales ni popups.
  - Al crear o renombrar, el nodo del árbol se convierte en un `<input>` (estilo VS Code).
  - Estado local `editingState` y `creatingState` para gestionar estos inputs efímeros.
- **Menú Contextual (Custom Context Menu)**:
  - Click derecho en carpetas/archivos.
  - Opciones: _Nueva Nota_, _Nueva Carpeta_, _Renombrar_, _Eliminar_.
  - Todo traducido al español.
- **Drag & Drop**:
  - Mover archivos dentro de carpetas.
  - Mover archivos a la raíz (`ROOT`).
  - Validación para evitar mover una carpeta dentro de sí misma.

### 2. Editor (`EditorLayout.tsx`)

- Gestiona el archivo abierto actualmente.
- **Modos de Vista**:
  - `Edit`: Solo editor de texto.
  - `View`: Solo vista previa renderizada.
  - `Split`: Doble columna (Editor + Vista previa).
- **Persistencia**:
  - Guarda automáticamente (`Ctrl+S`) o botón manual llamando a `saveContent` en `actions.ts`.

### 3. Persistencia Local (`actions.ts`)

- Todas las operaciones (`createNode`, `moveNode`, `renameNode`, `saveContent`) se ejecutan en el servidor (Node.js fs).
- Interactúan directamente con el sistema de archivos local del usuario en la carpeta `./content`.
- **Git Eliminado**: Se eliminó deliberadamente toda sincronización con Git para simplificar el flujo.

## 🔄 Flujo de Datos

1.  **Lectura**: `Sidebar` recibe el árbol de archivos inicial (`initialTree`) desde el servidor (`layout.tsx` hace el fetch).
2.  **Interacción**: Usuario realiza acción (ej. Crear Nota).
3.  **UI Optimista**: `Sidebar` gestiona la entrada del nombre.
4.  **Server Action**: Se llama a `createNode(path)`.
5.  **Actualización**: Si tiene éxito, se hace un `revalidatePath('/')` o `router.reload()` para refrescar el árbol de archivos con el estado real del disco.

## 🎨 UI/UX

- Tema oscuro por defecto.
- Estética minimalista "Premium".
- Feedback visual en Drag & Drop (indicadores de destino).
- Accesos rápidos y atajos de teclado estándar.
