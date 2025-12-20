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
  onError?: React.ReactEventHandler<HTMLImageElement>;
  sources?: Array<{ srcSet: string; type?: string; media?: string; sizes?: string }>;
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
  onError,
  sources,
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const hasObjectFit = /object-(cover|contain|fill|scale-down|none)/.test(className);
  const finalClass = `${className} ${hasObjectFit ? '' : 'object-cover'}`.trim();
  const loading = lazy && !priority ? 'lazy' : 'eager';
  const fetchpriority = priority ? 'high' : undefined;

  const imgProps = {
    src,
    alt,
    width,
    height,
    style: {
      aspectRatio: `${width} / ${height}`,
      ...(placeholderSrc && !loaded ? { backgroundImage: `url(${placeholderSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
    },
    onLoad: () => setLoaded(true),
    onError,
    loading: loading as any,
    decoding: "async" as const,
    ...(fetchpriority ? { fetchpriority: fetchpriority as any } : {}),
    ...(sizes ? { sizes } : {}),
    ...(srcSet ? { srcSet } : {}),
    className: `${finalClass} ${!loaded ? blurClassName : ''}`.trim(),
  };

  if (sources && sources.length > 0) {
    return (
      <picture>
        {sources.map((s, i) => (
          <source key={i} {...s} />
        ))}
        <img {...imgProps} />
      </picture>
    );
  }

  return <img {...imgProps} />;
};

export default ResponsiveImage;
