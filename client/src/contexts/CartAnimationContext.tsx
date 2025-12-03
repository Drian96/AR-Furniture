import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Type for animation data
type AnimationData = {
  imageUrl?: string;
  productName: string;
  startX: number;
  startY: number;
};

type CartAnimationContextValue = {
  triggerAnimation: (data: AnimationData) => void;
  animationData: AnimationData | null;
  clearAnimation: () => void;
};

const CartAnimationContext = createContext<CartAnimationContextValue | undefined>(undefined);

export const CartAnimationProvider = ({ children }: { children: ReactNode }) => {
  const [animationData, setAnimationData] = useState<AnimationData | null>(null);

  // Function to trigger the flying animation
  const triggerAnimation = useCallback((data: AnimationData) => {
    setAnimationData(data);
    // Auto-clear after animation completes (800ms)
    setTimeout(() => {
      setAnimationData(null);
    }, 800);
  }, []);

  // Function to manually clear animation
  const clearAnimation = useCallback(() => {
    setAnimationData(null);
  }, []);

  const value: CartAnimationContextValue = {
    triggerAnimation,
    animationData,
    clearAnimation,
  };

  return <CartAnimationContext.Provider value={value}>{children}</CartAnimationContext.Provider>;
};

export const useCartAnimation = () => {
  const ctx = useContext(CartAnimationContext);
  if (!ctx) throw new Error('useCartAnimation must be used within CartAnimationProvider');
  return ctx;
};

