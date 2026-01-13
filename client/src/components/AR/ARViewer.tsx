import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, ZoomIn, ZoomOut, Camera, RefreshCcw } from 'lucide-react';
import { is3DModel } from '../../utils/modelUtils';
import AR2DImage, { type AR2DImageRef } from './AR2DImage';
import AR3DModel, { type AR3DModelRef } from './AR3DModel';

interface ARViewerProps {
  productImage: string;
  productName: string;
  onClose: () => void;
}

/**
 * Main AR Viewer component that orchestrates camera, UI, and 2D/3D rendering
 * Handles camera initialization, controls, and capture functionality
 */
const ARViewer: React.FC<ARViewerProps> = ({ productImage, productName, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCapturing, setIsCapturing] = useState(false);

  // Refs for 2D and 3D components to access their canvas/renderer for capture
  const ar2DImageRef = useRef<AR2DImageRef>(null);
  const ar3DModelRef = useRef<AR3DModelRef>(null);

  // Detect if product is 3D model immediately (synchronously)
  const is3D = is3DModel(productImage);

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

  // Handle mouse/touch events for dragging (2D images only)
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

  // Handle rotation (2D images only)
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Handle 3D model rotation (continuous)
  const handle3DRotate = (delta: number) => {
    setRotation(prev => prev + delta);
  };

  // Reset position and scale
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Capture AR view as image
  const handleCapture = async () => {
    setIsCapturing(true);

    try {
      let canvasToCapture: HTMLCanvasElement | null = null;

      if (is3D && ar3DModelRef.current) {
        // For 3D models, capture from Three.js renderer
        const renderer = ar3DModelRef.current.getRenderer();
        if (!renderer) {
          throw new Error('3D renderer not available');
        }

        const canvas = renderer.domElement;

        // Create a temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) {
          throw new Error('Could not get canvas context');
        }

        // Draw video background
        if (videoRef.current && videoRef.current.videoWidth > 0) {
          tempCtx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Draw 3D render on top
        tempCtx.drawImage(canvas, 0, 0);
        canvasToCapture = tempCanvas;
      } else if (ar2DImageRef.current) {
        // For 2D images, use existing canvas
        canvasToCapture = ar2DImageRef.current.getCanvas();
        if (!canvasToCapture) {
          throw new Error('2D canvas not available');
        }
      }

      if (!canvasToCapture) {
        throw new Error('No canvas available for capture');
      }

      // Convert to blob and download
      canvasToCapture.toBlob((blob) => {
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
    <div className="fixed inset-0 z-50 flex h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 text-white p-3 flex items-center justify-between z-10">
        <div>
          <h2 className="text-lg font-semibold">AR Preview</h2>
          <p className="text-sm text-gray-300">{productName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer bg-black/50"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative min-h-0 w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="text-center text-white">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              <p>{is3D ? 'Loading 3D model...' : 'Starting camera...'}</p>
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

        {/* 2D Image Overlay */}
        {!is3D && (
          <AR2DImage
            ref={ar2DImageRef}
            videoRef={videoRef}
            productImage={productImage}
            scale={scale}
            rotation={rotation}
            position={position}
            onLoadComplete={() => setIsLoading(false)}
            onError={(error) => setError(error)}
            onStart={handleStart}
            onMove={handleMove}
            onEnd={handleEnd}
          />
        )}

        {/* 3D Model Overlay */}
        {is3D && (
          <AR3DModel
            ref={ar3DModelRef}
            videoRef={videoRef}
            productImage={productImage}
            scale={scale}
            onLoadComplete={() => setIsLoading(false)}
            onError={(error) => setError(error)}
          />
        )}
      </div>

      {/* Controls - Right Side */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white p-3 z-10">
        <div className="flex flex-col items-center space-y-3">
          <button
            onClick={() => handleZoom(0.2)}
            className="p-3 hover:bg-white/20 rounded-full transition-colors cursor-pointer bg-black/50"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            onClick={is3D ? () => handle3DRotate(15) : handleRotate}
            className="p-3 hover:bg-white/20 rounded-full transition-colors cursor-pointer bg-black/50"
            title={is3D ? "Rotate 3D Model" : "Rotate"}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleReset}
            className="p-3 hover:bg-white/20 rounded-full transition-colors cursor-pointer bg-black/50"
            title="Reset"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleZoom(-0.2)}
            className="p-3 hover:bg-white/20 rounded-full transition-colors cursor-pointer bg-black/50"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className="bg-dgreen hover:bg-dgreen/90 disabled:bg-gray-500 disabled:cursor-not-allowed text-white p-3 rounded-full font-semibold transition-colors flex items-center justify-center"
            title="Capture"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Instructions - Bottom Left */}
      <div className="absolute bottom-4 left-4 text-white z-10">
        <p className="text-xs text-gray-300 bg-black/50 px-3 py-2 rounded-lg">
          {is3D
            ? 'Drag to rotate • Pinch to zoom • Use buttons for controls'
            : 'Drag to move • Pinch to zoom • Tap to rotate'
          }
        </p>
      </div>
    </div>
  );
};

export default ARViewer;
