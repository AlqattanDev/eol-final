import React from 'react';
import styles from './AnimatedBackground.module.css';
import { cn } from '../utils/styleUtils';

/**
 * AnimatedBackground component creates a subtle animated gradient background
 * with floating particles for a modern look
 */
const AnimatedBackground = ({ className }) => {
  return (
    <div className={cn(styles.wrapper, className)}>
      {/* Glow orbs layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className={`${styles.glowOrb} ${styles.glowOrb1}`}></div>
        <div className={`${styles.glowOrb} ${styles.glowOrb2}`}></div>
      </div>
      
      {/* Base gradient layer */}
      <div className={`${styles.gradient} z-10`}></div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 z-20 overflow-hidden">
        <div className={`${styles.particle} ${styles.particle1}`}></div>
        <div className={`${styles.particle} ${styles.particle2}`}></div>
        <div className={`${styles.particle} ${styles.particle3}`}></div>
        <div className={`${styles.particle} ${styles.particle4}`}></div>
        <div className={`${styles.particle} ${styles.particle5}`}></div>
        <div className={`${styles.floatingShape} ${styles.floatingShape1}`}></div>
        <div className={`${styles.floatingShape} ${styles.floatingShape2}`}></div>
        <div className={`${styles.floatingShape} ${styles.floatingShape3}`}></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className={`${styles.grid} absolute inset-0 z-30 opacity-[0.02] dark:opacity-[0.03]`}></div>
    </div>
  );
};

export default AnimatedBackground;