import React from 'react';

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  srcSet?: string;
  lazy?: boolean;
  placeholderSrc?: string;
  blurClassName?: string; // tailwind blur class, default 'blur-sm'
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  srcSet,
  lazy = true,
  placeholderSrc,
  blurClassName = 'blur-sm',
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const hasObjectFit = /object-(cover|contain|fill|scale-down|none)/.test(className);
  const finalClass = `${className} ${hasObjectFit ? '' : 'object-cover'}`.trim();
  const loading = lazy && !priority ? 'lazy' : 'eager';
  const fetchpriority = priority ? 'high' : undefined;

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{
        aspectRatio: `${width} / ${height}`,
        ...(placeholderSrc && !loaded ? { backgroundImage: `url(${placeholderSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
      }}
      onLoad={() => setLoaded(true)}
      loading={loading as any}
      decoding="async"
      {...(fetchpriority ? { fetchpriority } : {})}
      {...(sizes ? { sizes } : {})}
      {...(srcSet ? { srcSet } : {})}
      className={`${finalClass} ${!loaded ? blurClassName : ''}`.trim()}
    />
  );
};

export default ResponsiveImage;
