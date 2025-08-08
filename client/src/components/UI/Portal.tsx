// client/src/components/UI/Portal.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  targetId?: string;
}

const Portal: React.FC<PortalProps> = ({ children, targetId = 'portal-root' }) => {
  const [mounted, setMounted] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Ищем существующий элемент или создаем новый
    let element = document.getElementById(targetId);
    
    if (!element) {
      element = document.createElement('div');
      element.id = targetId;
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      element.style.width = '100%';
      element.style.height = '100%';
      element.style.pointerEvents = 'none';
      element.style.zIndex = '10000';
      document.body.appendChild(element);
    }

    setPortalElement(element);
    setMounted(true);

    return () => {
      // Очищаем только если элемент пустой
      if (element && element.children.length === 0 && element.id === targetId) {
        document.body.removeChild(element);
      }
    };
  }, [targetId]);

  if (!mounted || !portalElement) {
    return null;
  }

  return createPortal(
    <div style={{ pointerEvents: 'auto' }}>
      {children}
    </div>,
    portalElement
  );
};

export default Portal;