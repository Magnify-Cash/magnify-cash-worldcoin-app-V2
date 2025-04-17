
// Type definitions for the application

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: string;
  export default content;
}

// Declare global window interface extensions
interface Window {
  // Add any window extensions here
  ethereum?: any;
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
}

// Define the interfaces needed for requestIdleCallback
interface IdleRequestOptions {
  timeout: number;
}

interface IdleRequestCallback {
  (deadline: IdleDeadline): void;
}

interface IdleDeadline {
  didTimeout: boolean;
  timeRemaining: () => number;
}
