// Example component demonstrating centralized styling patterns
// This file serves as a reference for using the design system

import React from 'react';
import { 
  cn, 
  cardStyles, 
  buttonStyles, 
  inputStyles,
  headingStyles,
  textStyles,
  getStatusStyles,
  animationPresets,
  hoverEffects,
  spacing,
  borderRadius
} from '../../utils/styleUtils';

/**
 * StyleExample - Reference component for styling patterns
 * This component is for development reference only
 */
export function StyleExample() {
  return (
    <div className={cn("space-y-", spacing.xl)}>
      {/* Card Examples */}
      <section>
        <h2 className={headingStyles.h2}>Card Styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className={cardStyles.base}>
            <h3 className={headingStyles.h4}>Base Card</h3>
            <p className={textStyles.muted}>Standard card styling</p>
          </div>
          
          <div className={cardStyles.elevated}>
            <h3 className={headingStyles.h4}>Elevated Card</h3>
            <p className={textStyles.muted}>Card with enhanced shadow</p>
          </div>
          
          <div className={cardStyles.glass}>
            <h3 className={headingStyles.h4}>Glass Card</h3>
            <p className={textStyles.muted}>Glassmorphism effect</p>
          </div>
        </div>
      </section>

      {/* Status Examples */}
      <section>
        <h2 className={headingStyles.h2}>Status Styles</h2>
        <div className="flex flex-wrap gap-sm">
          {['expired', 'expiring', 'supported'].map(status => {
            const styles = getStatusStyles(status);
            return (
              <div 
                key={status}
                className={cn(
                  "px-md py-sm rounded-default",
                  styles.background,
                  styles.text,
                  styles.border,
                  "border"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            );
          })}
        </div>
      </section>

      {/* Animation Examples */}
      <section>
        <h2 className={headingStyles.h2}>Animations</h2>
        <div className="flex flex-wrap gap-md">
          <div className={cn(cardStyles.base, animationPresets.fadeIn)}>
            Fade In
          </div>
          <div className={cn(cardStyles.base, animationPresets.slideUp)}>
            Slide Up
          </div>
          <div className={cn(cardStyles.base, animationPresets.scaleIn)}>
            Scale In
          </div>
        </div>
      </section>

      {/* Hover Effects */}
      <section>
        <h2 className={headingStyles.h2}>Hover Effects</h2>
        <div className="flex flex-wrap gap-md">
          <div className={cn(cardStyles.base, hoverEffects.lift)}>
            Lift on Hover
          </div>
          <div className={cn(cardStyles.base, hoverEffects.glow)}>
            Glow on Hover
          </div>
          <div className={cn(cardStyles.base, hoverEffects.scale)}>
            Scale on Hover
          </div>
        </div>
      </section>

      {/* Typography Examples */}
      <section>
        <h2 className={headingStyles.h2}>Typography</h2>
        <div className={cn("space-y-", spacing.sm)}>
          <h1 className={headingStyles.h1}>Heading 1</h1>
          <h2 className={headingStyles.h2}>Heading 2</h2>
          <h3 className={headingStyles.h3}>Heading 3</h3>
          <p className={textStyles.body}>Body text style</p>
          <p className={textStyles.muted}>Muted text style</p>
          <p className={textStyles.small}>Small text style</p>
        </div>
      </section>

      {/* Spacing Examples */}
      <section>
        <h2 className={headingStyles.h2}>Spacing Scale</h2>
        <div className="flex items-end gap-sm">
          {Object.entries(spacing).map(([key, value]) => (
            <div key={key} className="text-center">
              <div 
                className="bg-primary/20 border border-primary"
                style={{ width: value, height: value }}
              />
              <span className={textStyles.small}>{key}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius Examples */}
      <section>
        <h2 className={headingStyles.h2}>Border Radius</h2>
        <div className="flex flex-wrap gap-md">
          {Object.entries(borderRadius).map(([key, value]) => (
            <div 
              key={key}
              className="w-24 h-24 bg-primary/20 border border-primary flex items-center justify-center"
              style={{ borderRadius: value }}
            >
              <span className={textStyles.small}>{key}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}