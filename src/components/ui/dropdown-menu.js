import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

const DropdownMenu = ({ children, onOpenChange }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, handleClose]);

  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            ref: triggerRef,
            onClick: handleToggle,
            'aria-expanded': open,
            'aria-haspopup': true,
          });
        }
        if (child.type === DropdownMenuContent) {
          return React.cloneElement(child, {
            ref: contentRef,
            open,
            onClose: handleClose,
          });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
    });
  }
  
  return (
    <button ref={ref} {...props}>
      {children}
    </button>
  );
});

const DropdownMenuContent = React.forwardRef(({ 
  children, 
  open, 
  onClose, 
  align = 'center',
  className,
  ...props 
}, ref) => {
  if (!open) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        alignmentClasses[align],
        'top-full mt-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const DropdownMenuItem = React.forwardRef(({ 
  children, 
  className, 
  onClick,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
DropdownMenuContent.displayName = 'DropdownMenuContent';
DropdownMenuItem.displayName = 'DropdownMenuItem';
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};