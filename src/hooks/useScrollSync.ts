import React from 'react';

export const useScrollSync = () => {
  const headerRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const isSyncing = React.useRef(false);

  React.useEffect(() => {
    const headerEl = headerRef.current;
    const bodyEl = bodyRef.current;

    if (!headerEl || !bodyEl) return;

    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      target.scrollLeft = source.scrollLeft;
      // Use requestAnimationFrame to ensure sync happens after browser paint
      requestAnimationFrame(() => {
        isSyncing.current = false;
      });
    };

    const handleHeaderScroll = () => syncScroll(headerEl, bodyEl);
    const handleBodyScroll = () => syncScroll(bodyEl, headerEl);

    // Use passive listeners for better performance
    headerEl.addEventListener('scroll', handleHeaderScroll, { passive: true });
    bodyEl.addEventListener('scroll', handleBodyScroll, { passive: true });

    return () => {
      headerEl.removeEventListener('scroll', handleHeaderScroll);
      bodyEl.removeEventListener('scroll', handleBodyScroll);
    };
  }, []);

  return { headerRef, bodyRef };
};
