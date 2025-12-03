import { useEffect, useRef } from 'react';
import { useCartAnimation } from '../../contexts/CartAnimationContext';

/**
 * FlyingItem Component
 * 
 * This component creates a cool animation where a product image "flies" 
 * from the add to cart button to the cart icon in the header.
 * 
 * How it works:
 * 1. When add to cart is clicked, we get the button's position (startX, startY)
 * 2. We calculate the cart icon's position in the header
 * 3. The product image animates from start position to cart icon position
 * 4. After animation completes, it disappears
 */
const FlyingItem = () => {
  const { animationData, clearAnimation } = useCartAnimation();
  const flyingItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animationData || !flyingItemRef.current) return;

    // Find the cart icon in the header to get its position
    const cartIcon = document.querySelector('[data-cart-icon]') as HTMLElement;
    if (!cartIcon) {
      // If cart icon not found, just clear the animation
      clearAnimation();
      return;
    }

    // Get the cart icon's position relative to viewport
    const cartRect = cartIcon.getBoundingClientRect();
    const cartX = cartRect.left + cartRect.width / 2;
    const cartY = cartRect.top + cartRect.height / 2;

    // Set the starting position (from the button that was clicked)
    const startX = animationData.startX;
    const startY = animationData.startY;

    // Calculate the distance and angle for the animation
    const deltaX = cartX - startX;
    const deltaY = cartY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Set initial position
    const element = flyingItemRef.current;
    element.style.left = `${startX}px`;
    element.style.top = `${startY}px`;
    element.style.transform = 'translate(-50%, -50%) scale(1)';

    // Trigger the animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.left = `${cartX}px`;
        element.style.top = `${cartY}px`;
        element.style.transform = 'translate(-50%, -50%) scale(0.3)';
        element.style.opacity = '0.8';
      });
    });

    // Clean up after animation
    const timeout = setTimeout(() => {
      clearAnimation();
    }, 600);

    return () => clearTimeout(timeout);
  }, [animationData, clearAnimation]);

  if (!animationData) return null;

  return (
    <div
      ref={flyingItemRef}
      className="fixed z-[9999] pointer-events-none"
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        border: '2px solid #0A400C',
        backgroundColor: '#FEFAE0',
      }}
    >
      {animationData.imageUrl ? (
        <img
          src={animationData.imageUrl}
          alt={animationData.productName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-lgreen text-cream font-bold text-xs">
          {animationData.productName.charAt(0)}
        </div>
      )}
    </div>
  );
};

export default FlyingItem;

