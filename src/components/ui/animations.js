import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Fade-in animation component
 */
const FadeIn = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  className,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Slide up and fade in animation
 */
const SlideUp = ({ 
  children, 
  delay = 0,
  duration = 0.5,
  className,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 30,
        delay,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered children animation
 */
const Stagger = ({ 
  children, 
  staggerDelay = 0.1,
  childrenDelay = 0,
  className,
  ...props 
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childrenDelay,
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Child element for Stagger component
 */
const StaggerItem = ({ 
  children, 
  className,
  ...props 
}) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div
      variants={item}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Animate on scroll view component
 */
const AnimateOnView = ({
  children,
  className,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.6 
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export {
  FadeIn,
  SlideUp,
  Stagger,
  StaggerItem,
  AnimateOnView
};