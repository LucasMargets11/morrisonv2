import React, { useEffect, useRef, useState } from 'react';

export interface LazyVideoProps {
  poster?: string;
  sources: { src: string; type: string }[];
  className?: string;
  visibleMargin?: string; // e.g., "200px"
  aspectRatio?: string; // e.g., "16 / 9"
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  objectFitCover?: boolean;
}

const LazyVideo: React.FC<LazyVideoProps> = ({
  poster,
  sources,
  className = '',
  visibleMargin = '200px',
  aspectRatio = '16 / 9',
  controls = false,
  muted = true,
  loop = true,
  autoPlay = true,
  objectFitCover = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [gate, setGate] = useState(false);
  // Interaction marker (not in state to avoid re-renders)
  let interactedRef = useRef(false);

  const canStreamNow = () => {
    const c: any = (navigator as any).connection;
    if (!c) return false;
    const okType = ["4g"].includes(c.effectiveType);
    return okType && c.downlink >= 2.5 && !c.saveData;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              io.disconnect();
            }
          });
        },
        { root: null, rootMargin: visibleMargin, threshold: 0.01 }
      );
      io.observe(el);
      return () => io.disconnect();
    } else {
      // Fallback: mount immediately
      setIsVisible(true);
    }
  }, [visibleMargin]);

  // Gate triggers: user interaction, idle, timeout
  useEffect(() => {
    const mark = () => { interactedRef.current = true; setGate(true); };
    window.addEventListener('scroll', mark, { once: true, passive: true });
    window.addEventListener('pointerdown', mark, { once: true });
    window.addEventListener('keydown', mark, { once: true });
    const timer = window.setTimeout(() => setGate(true), 2000);
    const idleId: any = (window as any).requestIdleCallback?.(() => setGate(true));
    return () => {
      window.removeEventListener('scroll', mark);
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
      window.clearTimeout(timer);
      if (idleId) (window as any).cancelIdleCallback?.(idleId);
    };
  }, []);

  const shouldLoad = isVisible && (gate || canStreamNow());

  return (
    <div
      ref={containerRef}
      className={className}
      style={objectFitCover ? undefined : { aspectRatio }}
    >
      {isVisible ? (
        <video
          controls={controls}
          muted={muted}
          loop={loop}
          autoPlay={autoPlay}
          playsInline
          preload="none"
          {...(poster ? { poster } : {})}
          className={objectFitCover ? 'absolute inset-0 w-full h-full object-cover' : 'w-full h-full object-cover'}
        >
          {shouldLoad && sources.map((s, i) => (
            <source key={i} src={s.src} type={s.type} />
          ))}
          {/* Fallback text */}
          Your browser does not support the video tag.
        </video>
      ) : (
        // Placeholder preserves layout until video mounts
        poster ? (
          <img src={poster} alt="Video placeholder" className={objectFitCover ? 'absolute inset-0 w-full h-full object-cover' : 'w-full h-full object-cover'} />
        ) : (
          <div className={objectFitCover ? 'absolute inset-0 w-full h-full' : 'w-full h-full'} style={{ background: 'transparent' }} />
        )
      )}
    </div>
  );
};

export default LazyVideo;
