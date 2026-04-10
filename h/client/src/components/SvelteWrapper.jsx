import { useEffect, useRef } from 'react';
import FloorplanEditor from '../svelte-components/FloorplanEditor.svelte';

export default function SvelteWrapper({ onSave, ...props }) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    instanceRef.current = new FloorplanEditor({
      target: containerRef.current,
      props: {
        ...props,
        onSave: (data) => onSave?.(data)
      }
    });

    return () => {
      instanceRef.current?.destroy?.();
      instanceRef.current = null;
    };
  }, [onSave]);

  return <div ref={containerRef} style={{ width: '100%', minHeight: '100vh' }} />;
}
