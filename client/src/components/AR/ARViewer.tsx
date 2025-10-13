import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, ZoomIn, ZoomOut, Camera } from 'lucide-react';

interface ARViewerProps {
  productImage: string;
  productName: string;
  onClose: () => void;
}

const ARViewer: React.FC<ARViewerProps> = ({ productImage, productName, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCapturing, setIsCapturing] = useState(false);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera if available
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => {
              console.error('Video play error:', err);
            });
          };
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please ensure camera permissions are granted.');
        setIsLoading(false);
      }
    };

    initCamera();

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle mobile viewport issues
  useEffect(() => {
    // Prevent body scroll when AR is open
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      // Restore body scroll when AR is closed
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // Draw AR overlay
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
      };
      productImg.onerror = (e) => {
        console.error('Failed to load product image with CORS, trying without:', e);
        // Retry without CORS
        const retryImg = new Image();
        retryImg.onload = () => {
          console.log('Product image loaded without CORS', retryImg.width, 'x', retryImg.height);
          productImg = retryImg;
        };
        retryImg.onerror = (retryErr) => {
          console.error('Failed to load product image completely:', retryErr);
          console.error('Image URL:', productImage);
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
  }, [productImage, scale, rotation, position]);

  // Handle mouse/touch events for dragging
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Handle rotation
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Reset position and scale
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Capture AR view as image
  const handleCapture = async () => {
    if (!canvasRef.current) return;
    
    setIsCapturing(true);
    
    try {
      // Create a temporary canvas to capture the current AR view
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size to match the AR canvas
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;

      // Draw the current AR view to temporary canvas
      tempCtx.drawImage(canvasRef.current, 0, 0);

      // Convert to blob and download
      tempCanvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ar-preview-${productName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log('AR image captured and saved successfully');
      }, 'image/png', 0.9);
      
    } catch (error) {
      console.error('Failed to capture AR image:', error);
      alert('Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Camera Access Required</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-dgreen text-white py-3 px-6 rounded-lg hover:bg-dgreen/90 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="text-white p-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold">AR Preview</h2>
          <p className="text-sm text-gray-300">{productName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative min-h-0">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              <p>Starting camera...</p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleEnd();
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-black/75 text-white p-3 flex-shrink-0">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-2 hover:bg-white hover:bg-white/70 rounded-full transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRotate}
            className="p-2 hover:bg-white hover:bg-white/70 rounded-full transition-colors cursor-pointer"
            title="Rotate"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 hover:bg-white hover:bg-white/70 rounded-full transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleZoom(0.2)}
            className="p-2 hover:bg-white hover:bg-white/70 rounded-full transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        
        {/* Capture Button */}
        <div className="flex justify-center mb-2">
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className="bg-dgreen hover:bg-dgreen/90 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 text-sm"
          >
            <Camera className="w-4 h-4" />
            <span>{isCapturing ? 'Capturing...' : 'Capture'}</span>
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-300">
            Drag to move • Pinch to zoom • Tap to rotate
          </p>
        </div>
      </div>
    </div>
  );
};

export default ARViewer;
