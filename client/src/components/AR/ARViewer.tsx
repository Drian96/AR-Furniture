import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, ZoomIn, ZoomOut, Camera, RefreshCcw } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ARViewerProps {
  productImage: string;
  productName: string;
  onClose: () => void;
}

// Helper function to detect if URL is a 3D model
const is3DModel = (url: string): boolean => {
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.glb') || lowerUrl.endsWith('.gltf');
};

const ARViewer: React.FC<ARViewerProps> = ({ productImage, productName, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Detect if product is 3D model immediately (synchronously)
  const is3D = is3DModel(productImage);
  
  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  // Initialize Three.js for 3D models
  useEffect(() => {
    if (!is3D || !threeCanvasRef.current) return;

    const container = threeCanvasRef.current;
    let video = videoRef.current;
    
    // Wait for video to be ready
    const initThreeJS = () => {
      video = videoRef.current;
      if (!video || video.videoWidth === 0) {
        setTimeout(initThreeJS, 100);
        return;
      }
      
      // Video is ready, proceed with Three.js initialization
      initializeThreeJS(container, video);
    };
    
    const initializeThreeJS = (container: HTMLDivElement, video: HTMLVideoElement) => {
      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera setup - match video aspect ratio
      const aspect = video.videoWidth > 0 && video.videoHeight > 0 
        ? video.videoWidth / video.videoHeight 
        : container.clientWidth / container.clientHeight;
      const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      camera.position.set(0, 0, 2);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        canvas: container.querySelector('canvas') || undefined
      });
      const width = video.videoWidth > 0 ? video.videoWidth : container.clientWidth;
      const height = video.videoHeight > 0 ? video.videoHeight : container.clientHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0); // Transparent background
      rendererRef.current = renderer;

      // Add canvas to container if not already there
      if (!container.querySelector('canvas')) {
        container.appendChild(renderer.domElement);
      }

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Load 3D model
      const loader = new GLTFLoader();
      setIsLoading(true); // Ensure loading state is set
      loader.load(
        productImage,
        (gltf) => {
          try {
            const model = gltf.scene;
            modelRef.current = model;
            
            // Calculate bounding box to center and scale model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const modelScale = maxDim > 0 ? 1.5 / maxDim : 1; // Scale to fit in view, avoid division by zero
            
            model.scale.multiplyScalar(modelScale);
            model.position.sub(center.multiplyScalar(modelScale));
            
            scene.add(model);
            setIsLoading(false);
            console.log('3D model loaded successfully');
          } catch (err) {
            console.error('Error processing 3D model:', err);
            setError('Failed to process 3D model. Please check the file format.');
            setIsLoading(false);
          }
        },
        (progress) => {
          if (progress.total > 0) {
            const percent = (progress.loaded / progress.total) * 100;
            console.log('Loading progress:', percent.toFixed(2) + '%');
          }
        },
        (error) => {
          console.error('Error loading 3D model:', error);
          setError('Failed to load 3D model. Please check the file format and ensure the file is accessible.');
          setIsLoading(false);
        }
      );

      // Animation loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        
        if (modelRef.current && cameraRef.current && rendererRef.current && sceneRef.current) {
          // Apply user rotation
          modelRef.current.rotation.y = (rotation * Math.PI) / 180;
          // Apply user scale
          const baseScale = 1;
          modelRef.current.scale.setScalar(baseScale * scale);
          
          // Update camera aspect ratio if video dimensions changed
          const currentVideo = videoRef.current;
          if (currentVideo && currentVideo.videoWidth > 0 && currentVideo.videoHeight > 0) {
            const newAspect = currentVideo.videoWidth / currentVideo.videoHeight;
            if (Math.abs(camera.aspect - newAspect) > 0.01) {
              camera.aspect = newAspect;
              camera.updateProjectionMatrix();
              renderer.setSize(currentVideo.videoWidth, currentVideo.videoHeight);
            }
          }
          
          renderer.render(sceneRef.current, camera);
        }
      };
      animate();

      // Handle window resize
      const handleResize = () => {
        if (!container || !camera || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);
    };
    
    initThreeJS();
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (rendererRef.current) {
        const renderer = rendererRef.current;
        renderer.dispose();
        // Remove canvas from DOM
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        rendererRef.current = null;
      }
      if (modelRef.current && sceneRef.current) {
        const scene = sceneRef.current;
        scene.remove(modelRef.current);
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        modelRef.current = null;
      }
      window.removeEventListener('resize', () => {});
    };
  }, [is3D, productImage, scale, rotation]);

  // Draw AR overlay for 2D images
  useEffect(() => {
    // Skip 2D rendering if 3D model - check immediately to prevent image loading
    if (is3D) {
      return;
    }
    
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

    // Only load product image if it's NOT a 3D model
    if (productImage && !is3DModel(productImage)) {
      console.log('Loading product image:', productImage);
      productImg = new Image();
      
      // Try with CORS first
      productImg.crossOrigin = 'anonymous';
      productImg.onload = () => {
        console.log('Product image loaded successfully', productImg?.width, 'x', productImg?.height);
        setIsLoading(false);
      };
      productImg.onerror = (e) => {
        console.error('Failed to load product image with CORS, trying without:', e);
        // Retry without CORS
        const retryImg = new Image();
        retryImg.onload = () => {
          console.log('Product image loaded without CORS', retryImg.width, 'x', retryImg.height);
          productImg = retryImg;
          setIsLoading(false);
        };
        retryImg.onerror = (retryErr) => {
          console.error('Failed to load product image completely:', retryErr);
          console.error('Image URL:', productImage);
          setError('Failed to load product image.');
          setIsLoading(false);
        };
        retryImg.src = productImage;
      };
      productImg.src = productImage;
    } else if (productImage && is3DModel(productImage)) {
      // If it's a 3D model, don't try to load as image - wait for Three.js to handle it
      console.log('3D model detected, skipping 2D image loading');
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
      
      if (is3D && rendererRef.current) {
        // For 3D models, capture from Three.js renderer
        const renderer = rendererRef.current;
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
      } else if (canvasRef.current) {
        // For 2D images, use existing canvas
        canvasToCapture = canvasRef.current;
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
        )}
        
        {/* 3D Model Overlay */}
        {is3D && (
          <div
            ref={threeCanvasRef}
            className="absolute inset-0 w-full h-full"
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => {
              if (isDragging) {
                handleMove(e.clientX, e.clientY);
              }
            }}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              handleStart(touch.clientX, touch.clientY);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              if (e.touches.length === 1) {
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
              } else if (e.touches.length === 2) {
                // Pinch to zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = Math.hypot(
                  touch2.clientX - touch1.clientX,
                  touch2.clientY - touch1.clientY
                );
                // Simple zoom based on pinch distance (you can improve this)
                const zoomDelta = (distance - 100) * 0.01;
                setScale(prev => Math.max(0.5, Math.min(3, prev + zoomDelta * 0.1)));
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleEnd();
            }}
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
            ? 'Drag to move • Pinch to zoom • Rotate button to spin'
            : 'Drag to move • Pinch to zoom • Tap to rotate'
          }
        </p>
      </div>
    </div>
  );
};

export default ARViewer;
