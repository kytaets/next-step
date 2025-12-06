import React from 'react';

const NextImage = ({ src, alt, ...rest }) => {
  // Викидаємо ВСІ нестандартні пропи
  const {
    priority,
    fill,
    loader,
    quality,
    placeholder,
    blurDataURL,
    sizes,
    style,
    ...safeProps
  } = rest;

  return <img src={src} alt={alt} {...safeProps} />;
};

export default NextImage;
