
import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // This is part of react-use which is included in react-confetti

/**
 * A hook that provides a confetti component with automatic cleanup
 * @param isActive Whether the confetti should be shown
 * @param duration How long the confetti should run (in milliseconds)
 * @returns A component that renders the confetti
 */
const useConfetti = (isActive: boolean, duration: number = 5000) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (isActive) {
      setShowConfetti(true);
      
      // Auto-hide confetti after the duration
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isActive, duration]);

  // Colors from the project palette
  const colors = [
    '#9b87f5', // Primary Purple
    '#7E69AB', // Secondary Purple
    '#F2FCE2', // Soft Green
    '#FEF7CD', // Soft Yellow
    '#FEC6A1', // Soft Orange
    '#E5DEFF', // Soft Purple
    '#FFDEE2', // Soft Pink
    '#8B5CF6', // Vivid Purple
    '#D946EF', // Magenta Pink
    '#F97316', // Bright Orange
    '#0EA5E9'  // Ocean Blue
  ];

  const ConfettiComponent = showConfetti ? (
    <ReactConfetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.15}
      colors={colors}
    />
  ) : null;

  return { ConfettiComponent };
};

export default useConfetti;
