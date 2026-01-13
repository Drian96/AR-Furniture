import React, { useRef, useEffect } from 'react';

interface AR2DImageProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  productImage: string;
  scale: number;
  rotation: number;
  position: { x: number; y: number };
  onLoadComplete: () => void;
  onError: (error: string) => void;
  onStart: (clientX: number, clientY: number) => void;
  onMove: (clientX: number, clientY: number) => void;
  onEnd: () => void;
}

// Expose canvas ref for capture functionality
export type AR2DImageRef = {
  getCanvas: () => HTMLCanvasElement | null;
};

/**
 * Component for rendering 2D images as AR overlay on camera feed
 * Handles canvas drawing, image loading, and positioning
 */
const AR2DImage = React.forwardRef<AR2DImageRef, AR2DImageProps>(({
  videoRef,
  productImage,
  scale,
  rotation,
  position,
  onLoadComplete,
  onError,
  onStart,
  onMove,
  onEnd,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Expose canvas ref to parent
  React.useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  useEffect(() => {
    let animationId: number;
    let productImg: HTMLImageElement | null = null;

    const drawAR = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
        animationId = requestAnimationFrame(drawAR);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw product image overlay if loaded
      if (productImg && productImg.complete) {
        const imgWidth = 200 * scale;
        const imgHeight = (productImg.height / productImg.width) * imgWidth;

        const centerX = canvas.width / 2 + position.x;
        const centerY = canvas.height / 2 + position.y;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(productImg, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        ctx.restore();
      }

      animationId = requestAnimationFrame(drawAR);
    };

    // Load product image
    if (productImage) {
      console.log('Loading product image:', productImage);
      productImg = new Image();

      // Try with CORS first
      productImg.crossOrigin = 'anonymous';
      productImg.onload = () => {
        console.log('Product image loaded successfully', productImg?.width, 'x', productImg?.height);
        onLoadComplete();
      };
      productImg.onerror = (e) => {
        console.error('Failed to load product image with CORS, trying without:', e);
        // Retry without CORS
        const retryImg = new Image();
        retryImg.onload = () => {
          console.log('Product image loaded without CORS', retryImg.width, 'x', retryImg.height);
          productImg = retryImg;
          onLoadComplete();
        };
        retryImg.onerror = (retryErr) => {
          console.error('Failed to load product image completely:', retryErr);
          console.error('Image URL:', productImage);
          onError('Failed to load product image.');
        };
        retryImg.src = productImage;
      };
      productImg.src = productImage;
    }

    // Start animation loop
    animationId = requestAnimationFrame(drawAR);

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [productImage, scale, rotation, position, onLoadComplete, onError]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      onMouseDown={(e) => onStart(e.clientX, e.clientY)}
      onMouseMove={(e) => onMove(e.clientX, e.clientY)}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        onStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onEnd();
      }}
    />
  );
});

AR2DImage.displayName = 'AR2DImage';

export default AR2DImage;
