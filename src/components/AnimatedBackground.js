import React from 'react';
import styles from './AnimatedBackground.module.css';

/**
 * AnimatedBackground component creates a subtle animated gradient background
 * with floating particles for a modern look
 */
const AnimatedBackground = () => {
  return (
    <div className={styles.wrapper}>
      {/* Base gradient layer */}
      <div className={`${styles.gradient} absolute inset-0 z-0`}></div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
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
      <div className={`${styles.grid} absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]`}></div>
    </div>
  );
};

export default AnimatedBackground;