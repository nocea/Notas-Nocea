
import { getFileContent } from '@/lib/fs';
import EditorLayout from '@/components/EditorLayout';
import path from 'path';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const filePath = slug.map(p => decodeURIComponent(p)).join('/');
  const ext = path.extname(filePath).toLowerCase();
  
  // Basic content type check
  const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext);
  
  if (isImage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
        <p>Image Preview not fully implemented yet.</p>
        <p style={{ fontFamily: 'monospace' }}>{filePath}</p>
        {/* We would need an API route to serve the image blob here */}
      </div>
    );
  }

  const content = await getFileContent(filePath);

  return (
    <EditorLayout 
      initialContent={content} 
      filePath={filePath} 
    />
  );
}
