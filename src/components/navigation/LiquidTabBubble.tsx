import { useEffect, useRef } from 'react';

export interface LiquidTabBubbleProps {
  activeIndex: number;
  dragPosition?: { index: number; stepPx: number } | null;
}

/**
 * One persistent selection lens shared by all primary tabs. Keeping the same
 * element mounted lets CSS move it continuously instead of cross-fading pills.
 */
export function LiquidTabBubble({ activeIndex, dragPosition }: LiquidTabBubbleProps) {
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const dropletRef = useRef<HTMLSpanElement>(null);
  const previousIndex = useRef(activeIndex);

  useEffect(() => {
    const from = previousIndex.current;
    previousIndex.current = activeIndex;
    if (from === activeIndex) return;

    const reducedMotion = document.documentElement.dataset.reducedMotion === 'true'
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    bubbleRef.current?.animate?.([
      { scale: '1', borderRadius: '999px' },
      { scale: '1.13 .86', borderRadius: '42% 58% 54% 46% / 54% 46% 54% 46%', offset: 0.36 },
      { scale: '.97 1.06', borderRadius: '56% 44% 48% 52% / 46% 54% 46% 54%', offset: 0.72 },
      { scale: '1', borderRadius: '999px' },
    ], {
      duration: 560,
      easing: 'cubic-bezier(.22, .9, .24, 1)',
    });

    const direction = activeIndex > from ? -1 : 1;
    dropletRef.current?.animate?.([
      { opacity: 0, transform: `translateX(${direction * 3}px) scale(.45)` },
      { opacity: 0.72, transform: `translateX(${direction * 10}px) scale(.82)`, offset: 0.38 },
      { opacity: 0, transform: `translateX(${direction * 17}px) scale(.28)` },
    ], {
      duration: 500,
      easing: 'cubic-bezier(.2, .78, .2, 1)',
    });
  }, [activeIndex]);

  return (
    <span
      ref={bubbleRef}
      className="liquid-tab-bubble"
      data-active-index={activeIndex}
      data-dragging={dragPosition ? 'true' : undefined}
      style={dragPosition ? {
        transform: `translate3d(${dragPosition.index * dragPosition.stepPx}px, 0, 0)`,
        scale: `${1 + Math.min(Math.abs(dragPosition.index - Math.round(dragPosition.index)), .5) * .24} ${1 - Math.min(Math.abs(dragPosition.index - Math.round(dragPosition.index)), .5) * .18}`,
      } : undefined}
      aria-hidden="true"
    >
      <span className="liquid-tab-bubble-lens" />
      <span ref={dropletRef} className="liquid-tab-bubble-droplet" />
    </span>
  );
}
