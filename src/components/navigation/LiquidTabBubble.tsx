import { useEffect, useRef, useState } from 'react';

export interface LiquidTabBubbleProps {
  activeIndex: number;
  dragPosition?: { index: number; stepPx: number } | null;
  onMotionFrame?: (position: number | null) => void;
}

/**
 * One persistent selection lens shared by all primary tabs. Keeping the same
 * element mounted lets CSS move it continuously instead of cross-fading pills.
 */
export function LiquidTabBubble({ activeIndex, dragPosition, onMotionFrame }: LiquidTabBubbleProps) {
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const dropletRef = useRef<HTMLSpanElement>(null);
  const previousIndex = useRef(activeIndex);
  const motionRef = useRef<{ index: number; velocity: number; target: number; stepPx: number } | null>(null);
  const frameRef = useRef(0);
  const transitionFrameRef = useRef(0);
  const draggingRef = useRef(Boolean(dragPosition));
  const onMotionFrameRef = useRef(onMotionFrame);
  const [motionPosition, setMotionPosition] = useState<{ index: number; stepPx: number } | null>(null);
  draggingRef.current = Boolean(dragPosition);
  onMotionFrameRef.current = onMotionFrame;

  useEffect(() => {
    const reducedMotion = document.documentElement.dataset.reducedMotion === 'true'
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      if (motionRef.current) setMotionPosition(null);
      motionRef.current = null;
      onMotionFrameRef.current?.(dragPosition?.index ?? null);
      return;
    }

    if (dragPosition) {
      if (!motionRef.current) {
        motionRef.current = { index: activeIndex, velocity: 0, target: dragPosition.index, stepPx: dragPosition.stepPx };
      } else {
        motionRef.current.target = dragPosition.index;
        motionRef.current.stepPx = dragPosition.stepPx;
      }
    } else if (motionRef.current) {
      motionRef.current.target = activeIndex;
    }

    if (!motionRef.current || frameRef.current) return;
    const advance = () => {
      frameRef.current = 0;
      const motion = motionRef.current;
      if (!motion) return;
      motion.velocity = (motion.velocity + (motion.target - motion.index) * .15) * .78;
      motion.index = Math.max(-.06, Math.min(2.06, motion.index + motion.velocity));
      if (Math.abs(motion.target - motion.index) < .002 && Math.abs(motion.velocity) < .002) {
        motion.index = motion.target;
        motion.velocity = 0;
        if (draggingRef.current) {
          setMotionPosition({ index: motion.index, stepPx: motion.stepPx });
        } else {
          motionRef.current = null;
          setMotionPosition(null);
        }
        onMotionFrameRef.current?.(draggingRef.current ? motion.index : null);
        return;
      }
      setMotionPosition({ index: motion.index, stepPx: motion.stepPx });
      onMotionFrameRef.current?.(motion.index);
      frameRef.current = requestAnimationFrame(advance);
    };
    frameRef.current = requestAnimationFrame(advance);
  }, [activeIndex, dragPosition]);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (transitionFrameRef.current) cancelAnimationFrame(transitionFrameRef.current);
  }, []);

  useEffect(() => {
    const from = previousIndex.current;
    previousIndex.current = activeIndex;
    if (from === activeIndex) return;
    if (transitionFrameRef.current) cancelAnimationFrame(transitionFrameRef.current);
    transitionFrameRef.current = 0;

    const reducedMotion = document.documentElement.dataset.reducedMotion === 'true'
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      onMotionFrameRef.current?.(null);
      return;
    }

    bubbleRef.current?.animate?.([
      { borderRadius: '999px' },
      { borderRadius: '47% 53% 52% 48% / 51% 49% 51% 49%', offset: 0.36 },
      { borderRadius: '52% 48% 49% 51% / 49% 51% 49% 51%', offset: 0.72 },
      { borderRadius: '999px' },
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

    // Tap navigation uses a CSS transform, so sample the lens position until
    // that transition ends. Drag navigation reports its spring position above.
    if (!onMotionFrameRef.current || motionRef.current) return;
    const startedAt = performance.now();
    const sampleTransition = (now: number) => {
      transitionFrameRef.current = 0;
      const bubble = bubbleRef.current;
      const links = bubble?.parentElement?.querySelectorAll<HTMLElement>('.mobile-tab-item');
      if (!bubble || !links || links.length < 2) {
        onMotionFrameRef.current?.(null);
        return;
      }
      const first = links[0].getBoundingClientRect();
      const second = links[1].getBoundingClientRect();
      const bubbleRect = bubble.getBoundingClientRect();
      const step = (second.left + second.width / 2) - (first.left + first.width / 2);
      if (step > 0) {
        const position = (bubbleRect.left + bubbleRect.width / 2 - first.left - first.width / 2) / step;
        onMotionFrameRef.current?.(Math.max(0, Math.min(2, position)));
      }
      if (now - startedAt < 650) {
        transitionFrameRef.current = requestAnimationFrame(sampleTransition);
      } else {
        onMotionFrameRef.current?.(null);
      }
    };
    transitionFrameRef.current = requestAnimationFrame(sampleTransition);
  }, [activeIndex]);

  const visiblePosition = motionPosition ?? dragPosition;

  return (
    <span
      ref={bubbleRef}
      className="liquid-tab-bubble"
      data-active-index={activeIndex}
      data-dragging={dragPosition ? 'true' : undefined}
      data-inertia={visiblePosition ? 'true' : undefined}
      style={visiblePosition ? {
        transform: `translate3d(${visiblePosition.index * visiblePosition.stepPx}px, 0, 0)`,
      } : undefined}
      aria-hidden="true"
    >
      <span className="liquid-tab-bubble-lens" />
      <span ref={dropletRef} className="liquid-tab-bubble-droplet" />
    </span>
  );
}
