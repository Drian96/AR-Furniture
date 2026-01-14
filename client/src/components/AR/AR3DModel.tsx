import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Expose renderer ref for capture functionality
export type AR3DModelRef = {
  getRenderer: () => THREE.WebGLRenderer | null;
};

interface AR3DModelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  productImage: string;
  scale: number;
  onLoadComplete: () => void;
  onError: (error: string) => void;
}

/**
 * Component for rendering 3D models (GLB/GLTF) as AR overlay on camera feed
 * Handles Three.js scene setup, model loading, and interactive controls
 */
const AR3DModel = React.forwardRef<AR3DModelRef, AR3DModelProps>(({
  videoRef,
  productImage,
  scale,
  onLoadComplete,
  onError,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Track 3D model rotation for drag interactions
  const modelRotationRef = useRef({ x: 0, y: 0 });
  const isDragging3DRef = useRef(false);
  const dragStart3DRef = useRef({ x: 0, y: 0 });
  const baseModelScaleRef = useRef<number>(1); // Store initial model scale

  // Expose renderer ref to parent
  React.useImperativeHandle(ref, () => ({
    getRenderer: () => rendererRef.current,
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let video = videoRef.current;
    let cleanupThreeJS: (() => void) | undefined;

    const initializeThreeJS = (container: HTMLDivElement, video: HTMLVideoElement) => {
      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera setup - use container dimensions to match visible area (not raw video)
      // This is critical because video uses object-cover which crops on mobile
      const aspect = container.clientWidth / container.clientHeight;
      const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
      camera.position.set(0, 0, 3);
      camera.lookAt(0, 0, 0); // Ensure camera looks at origin
      cameraRef.current = camera;

      // Renderer setup - use container dimensions to match visible area
      // This ensures the 3D model aligns with what the user actually sees
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: container.querySelector('canvas') || undefined
      });
      const width = container.clientWidth;
      const height = container.clientHeight;
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

            // Scale to fit nicely in the view (reduced size for AR viewer)
            const modelScale = maxDim > 0 ? 1.2 / maxDim : 1;
            baseModelScaleRef.current = modelScale; // Store base scale for user scaling

            // Apply scale first
            model.scale.multiplyScalar(modelScale);

            // Center the model at origin (0, 0, 0)
            model.position.x = -center.x * modelScale;
            model.position.y = -center.y * modelScale;
            model.position.z = -center.z * modelScale;

            console.log('3D model loaded - Scale:', modelScale, 'Position:', model.position.x, model.position.y, model.position.z);

            scene.add(model);
            onLoadComplete();
            console.log('3D model loaded successfully');
          } catch (err) {
            console.error('Error processing 3D model:', err);
            onError('Failed to process 3D model. Please check the file format.');
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
          onError('Failed to load 3D model. Please check the file format and ensure the file is accessible.');
        }
      );

      // Mouse/touch handlers for 3D model rotation
      const handleMouseDown3D = (e: MouseEvent) => {
        isDragging3DRef.current = true;
        dragStart3DRef.current = { x: e.clientX, y: e.clientY };
      };

      const handleMouseMove3D = (e: MouseEvent) => {
        if (!isDragging3DRef.current) return;

        const deltaX = e.clientX - dragStart3DRef.current.x;
        const deltaY = e.clientY - dragStart3DRef.current.y;

        modelRotationRef.current.y += deltaX * 0.01;
        modelRotationRef.current.x -= deltaY * 0.01;

        // Limit vertical rotation
        modelRotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, modelRotationRef.current.x));

        dragStart3DRef.current = { x: e.clientX, y: e.clientY };
      };

      const handleMouseUp3D = () => {
        isDragging3DRef.current = false;
      };

      const handleTouchStart3D = (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          isDragging3DRef.current = true;
          dragStart3DRef.current = { x: touch.clientX, y: touch.clientY };
        }
      };

      const handleTouchMove3D = (e: TouchEvent) => {
        e.preventDefault();
        if (!isDragging3DRef.current) return;
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          const deltaX = touch.clientX - dragStart3DRef.current.x;
          const deltaY = touch.clientY - dragStart3DRef.current.y;

          modelRotationRef.current.y += deltaX * 0.01;
          modelRotationRef.current.x -= deltaY * 0.01;

          // Limit vertical rotation
          modelRotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, modelRotationRef.current.x));

          dragStart3DRef.current = { x: touch.clientX, y: touch.clientY };
        }
      };

      const handleTouchEnd3D = () => {
        isDragging3DRef.current = false;
      };

      // Handle window resize
      const handleResize = () => {
        if (!container || !camera || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };

      // Animation loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);

        if (modelRef.current && cameraRef.current && rendererRef.current && sceneRef.current) {
          // Apply drag-based rotation for 3D models
          modelRef.current.rotation.y = modelRotationRef.current.y;
          modelRef.current.rotation.x = modelRotationRef.current.x;

          // Apply user scale on top of base scale
          modelRef.current.scale.setScalar(baseModelScaleRef.current * scale);

          // Ensure camera always looks at origin (center of screen)
          camera.lookAt(0, 0, 0);

          // Update camera aspect ratio and renderer size based on container dimensions
          // This ensures alignment with the visible area (video with object-cover)
          const currentContainer = containerRef.current;
          if (currentContainer) {
            const containerWidth = currentContainer.clientWidth;
            const containerHeight = currentContainer.clientHeight;
            const newAspect = containerWidth / containerHeight;
            
            // Only update if dimensions changed significantly
            if (Math.abs(camera.aspect - newAspect) > 0.01 || 
                renderer.domElement.width !== containerWidth || 
                renderer.domElement.height !== containerHeight) {
              camera.aspect = newAspect;
              camera.updateProjectionMatrix();
              renderer.setSize(containerWidth, containerHeight);
            }
          }

          renderer.render(sceneRef.current, camera);
        }
      };
      animate();

      // Add event listeners to the container
      container.addEventListener('mousedown', handleMouseDown3D);
      container.addEventListener('mousemove', handleMouseMove3D);
      container.addEventListener('mouseup', handleMouseUp3D);
      container.addEventListener('mouseleave', handleMouseUp3D);
      container.addEventListener('touchstart', handleTouchStart3D);
      container.addEventListener('touchmove', handleTouchMove3D);
      container.addEventListener('touchend', handleTouchEnd3D);
      window.addEventListener('resize', handleResize);

      // Return cleanup function
      return () => {
        container.removeEventListener('mousedown', handleMouseDown3D);
        container.removeEventListener('mousemove', handleMouseMove3D);
        container.removeEventListener('mouseup', handleMouseUp3D);
        container.removeEventListener('mouseleave', handleMouseUp3D);
        container.removeEventListener('touchstart', handleTouchStart3D);
        container.removeEventListener('touchmove', handleTouchMove3D);
        container.removeEventListener('touchend', handleTouchEnd3D);
        window.removeEventListener('resize', handleResize);
      };
    };

    // Wait for video to be ready
    const initThreeJS = () => {
      video = videoRef.current;
      if (!video || video.videoWidth === 0) {
        setTimeout(initThreeJS, 100);
        return;
      }

      // Video is ready, proceed with Three.js initialization
      cleanupThreeJS = initializeThreeJS(container, video);
    };

    initThreeJS();

    // Cleanup function
    return () => {
      if (cleanupThreeJS) {
        cleanupThreeJS();
      }

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
    };
  }, [productImage, scale, onLoadComplete, onError]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
});

AR3DModel.displayName = 'AR3DModel';

export default AR3DModel;
