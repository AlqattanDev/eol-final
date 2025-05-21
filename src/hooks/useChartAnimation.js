import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to animate chart data with configurable easing
 * 
 * @param {Array} targetData - The final data values to animate to
 * @param {Object} options - Animation configuration options
 * @param {number} options.duration - Animation duration in milliseconds (default: 1000)
 * @param {string} options.easingType - Type of easing function to use: 'cubic' or 'elastic' (default: 'cubic')
 * @param {number} options.framesPerSecond - Frames per second for animation (default: 60)
 * @returns {Object} - The animated data and animation state
 */
const useChartAnimation = (targetData, options = {}) => {
  const { 
    duration = 1000, 
    easingType = 'cubic',
    framesPerSecond = 60 
  } = options;

  const [animatedData, setAnimatedData] = useState([]);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Use refs to track previous values and prevent unnecessary re-renders
  const prevTargetDataRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const isAnimatingRef = useRef(true);

  // Initialize animated data when targetData changes shape
  // Initialize animated data on mount and when targetData changes structure
  useEffect(() => {
    // Make sure targetData is an array with values
    if (!Array.isArray(targetData)) {
      return;
    }
    
    // Initialize with zeros on first render
    if (animatedData.length === 0 || animatedData.length !== targetData.length) {
      setAnimatedData(Array(targetData.length).fill(0));
      prevTargetDataRef.current = [...targetData];
      return;
    }
    
    // Skip animation if data hasn't changed
    const hasDataChanged = !prevTargetDataRef.current || 
                          prevTargetDataRef.current.length !== targetData.length ||
                          !prevTargetDataRef.current.every((val, idx) => val === targetData[idx]);
                          
    if (!hasDataChanged) return;
    
    // Update ref to current targetData
    prevTargetDataRef.current = [...targetData];
    
    // No animation needed if no data
    if (targetData.length === 0) return;
    
    const totalFrames = framesPerSecond * (duration / 1000);
    let frame = 0;
    
    // Set animating state
    isAnimatingRef.current = true;
    setIsAnimating(true);
    
    const animate = () => {
      if (frame < totalFrames) {
        const progress = frame / totalFrames;
        
        // Apply easing based on the selected type
        let easedProgress;
        
        if (easingType === 'elastic') {
          // Elastic easing for a bounce effect
          easedProgress = progress === 1 
            ? 1 
            : -(Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * (2 * Math.PI) / 3)) + 1;
        } else {
          // Default cubic ease-out
          easedProgress = 1 - Math.pow(1 - progress, 3);
        }
        
        const newData = targetData.map(value => Math.round(value * easedProgress));
        setAnimatedData(newData);
        
        frame++;
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedData(targetData);
        isAnimatingRef.current = false;
        setIsAnimating(false);
      }
    };
    
    // Start animation
    animate();
    
    // Cleanup function
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      isAnimatingRef.current = false;
    };
  }, [targetData, duration, easingType, framesPerSecond]);

  return { animatedData, isAnimating };
};

export default useChartAnimation;