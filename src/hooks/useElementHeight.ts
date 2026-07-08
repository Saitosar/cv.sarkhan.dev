'use client';

import * as React from 'react';

export function useElementHeight<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setHeight(el.getBoundingClientRect().height);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return { ref, height };
}
