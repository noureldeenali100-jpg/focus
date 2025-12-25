import React from 'react';

interface AppIconProps {
  appId: string;
  className?: string;
  colored?: boolean; // Kept for interface compatibility but ignored as per prompt
}

/**
 * Renders the full-color, official system icon for the specified app.
 * These are high-fidelity SVG recreations of launcher icons, including
 * brand-specific background shapes and foreground layers.
 */
const AppIcon: React.FC<AppIconProps> = ({ appId, className = "w-full h-full" }) => {
  const getIconContent = () => {
    switch (appId) {
      case 'fb': // Facebook: Official Blue Circle + White Glyph
        return (
          <g>
            <circle cx="12" cy="12" r="12" fill="#1877F2" />
            <path d="M15 12h-2v7h-3v-7H8v-2.5h2v-1.6c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V9.5h2.8L15 12z" fill="white" />
          </g>
        );
      case 'ig': // Instagram: Official Multi-layer Gradient Squircle + White Outline
        return (
          <g>
            <defs>
              <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f09433" />
                <stop offset="25%" stopColor="#e6683c" />
                <stop offset="50%" stopColor="#dc2743" />
                <stop offset="75%" stopColor="#cc2366" />
                <stop offset="100%" stopColor="#bc1888" />
              </linearGradient>
            </defs>
            <rect width="24" height="24" rx="5.4" fill="url(#ig-grad)" />
            <path d="M12 6.8c1.7 0 1.9 0 2.6.1 2.3.1 3.4 1.2 3.5 3.5.1.7.1.9.1 2.6s0 1.9-.1 2.6c-.1 2.3-1.2 3.4-3.5 3.5-.7.1-.9.1-2.6.1s-1.9 0-2.6-.1c-2.3-.1-3.4-1.2-3.5-3.5-.1-.7-.1-.9-.1-2.6s0-1.9.1-2.6c.1-2.3 1.2-3.4 3.5-3.5.7-.1.9-.1 2.6-.1m0-1.4c-1.7 0-1.9 0-2.6.1-3.3.1-5.1 2-5.3 5.3 0 .7-.1.9-.1 2.6s.1 1.9.1 2.6c.1 3.3 2 5.1 5.3 5.3.7 0 .9.1 2.6.1s1.9 0 2.6-.1c3.3-.1 5.1-2 5.3-5.3 0-.7.1-.9.1-2.6s-.1-1.9-.1-2.6c-.1-3.3-2-5.1-5.3-5.3-.7-.1-.9-.1-2.6-.1z" fill="white" />
            <path d="M12 9.1c-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9-1.3-2.9-2.9-2.9zm0 4.4c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" fill="white" />
            <circle cx="16.5" cy="7.5" r="0.7" fill="white" />
          </g>
        );
      case 'tt': // TikTok: Black Squircle + 3D-ish Logo
        return (
          <g>
            <rect width="24" height="24" rx="5.4" fill="black" />
            <path d="M12.5 4.5v11c0 1.9-1.6 3.5-3.5 3.5s-3.5-1.6-3.5-3.5S7.1 12 9 12v3c-0.6 0-1 0.4-1 1s0.4 1 1 1 1-0.4 1-1V4.5h3.5c0 2 1.6 3.5 3.5 3.5v-3c-0.3 0-0.6-0.1-0.8-0.2-1.1-0.5-1.7-1.7-1.7-2.8h-1z" fill="#25F4EE" />
            <path d="M12.5 4.5v11c0 1.9-1.6 3.5-3.5 3.5s-3.5-1.6-3.5-3.5S7.1 12 9 12v3c-0.6 0-1 0.4-1 1s0.4 1 1 1 1-0.4 1-1V4.5h3.5c0 2 1.6 3.5 3.5 3.5v-3c-0.3 0-0.6-0.1-0.8-0.2-1.1-0.5-1.7-1.7-1.7-2.8h-1z" fill="#FE2C55" transform="translate(-0.5, 0.5)" />
            <path d="M12.5 4.5v11c0 1.9-1.6 3.5-3.5 3.5s-3.5-1.6-3.5-3.5S7.1 12 9 12v3c-0.6 0-1 0.4-1 1s0.4 1 1 1 1-0.4 1-1V4.5h3.5c0 2 1.6 3.5 3.5 3.5v-3c-0.3 0-0.6-0.1-0.8-0.2-1.1-0.5-1.7-1.7-1.7-2.8h-1z" fill="white" transform="translate(-0.25, 0.25)" />
          </g>
        );
      case 'tw': // X: Black Squircle + White X
        return (
          <g>
            <rect width="24" height="24" rx="5.4" fill="#000000" />
            <path d="M14.3 4h2.4l-5.3 6 6.2 8h-4.8l-3.8-5-4.3 5H2.3l5.6-6.4L2 4h4.9l3.4 4.5L14.3 4zm-.9 12.6h1.3L6.4 5.4H5l8.4 11.2z" fill="white" />
          </g>
        );
      case 'sc': // Snapchat: Yellow Squircle + Black Outline Ghost
        return (
          <g>
            <rect width="24" height="24" rx="5.4" fill="#FFFC00" />
            <path d="M12 6c-2.4 0-4 1.4-4 3.7 0 .8.2 1.3.7 1.8-.1 0-.2.1-.3.2-.4.2-1.2.6-1.2 1.2 0 .3.2.5.6.7.7.3 1.4.3 1.9.3h.2c.1.3.3.5.7.7.3.2.6.3.9.3.3 0 .5-.1.8-.2.3-.1.5-.4.7-.7.1 0 .2 0 .3 0 .5 0 1.1 0 1.9-.3.4-.2.6-.4.6-.7 0-.7-.9-1.1-1.2-1.2-.1 0-.2-.1-.3-.2.5-.4.7-1 .7-1.8 0-2.3-1.6-3.7-4-3.7z" fill="white" stroke="black" strokeWidth="1" strokeLinejoin="round" />
          </g>
        );
      case 'wa': // WhatsApp: Green Circle + White Phone Glyph
        return (
          <g>
            <circle cx="12" cy="12" r="12" fill="#25D366" />
            <path d="M12 4.5c-4.1 0-7.5 3.4-7.5 7.5 0 1.3.3 2.6 1 3.7l-1 3.8 3.9-1c1.1.6 2.3.9 3.6.9 4.1 0 7.5-3.4 7.5-7.5s-3.4-7.5-7.5-7.5zm4.4 10.6c-.2.6-.9 1.1-1.5 1.2-.5.1-1.1.1-3.2-.8-2.6-1.1-4.3-3.8-4.4-4s-1-1.3-1-2.5c0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.9s0 .3-.2.5l-.5.6c-.2.2-.4.4-.2.7.2.3.9 1.5 1.9 2.4.9.8 1.6 1.3 1.9 1.5.3.2.5.1.7-.1.2-.2.8-1 1-1.3.2-.3.4-.2.7-.1.3.1 1.7.8 2 .9.3.2.5.2.6.4.1.2.1.8-.2 1.4z" fill="white" />
          </g>
        );
      case 'tg': // Telegram: Blue Circle + Paper Plane
        return (
          <g>
            <circle cx="12" cy="12" r="12" fill="#2AABEE" />
            <path d="M18.4 6.8l-2.8 13c-.2.9-.7 1.1-1.5.6l-4.3-3.2-2.1 2c-.2.2-.4.4-.9.4l.3-4.4 8-7.2c.3-.3-.1-.5-.5-.2l-9.9 6.2-4.2-1.3c-.9-.3-.9-.9.2-1.3l16.4-6.3c.8-.3 1.4.2 1.1 1.5z" fill="white" />
          </g>
        );
      case 'yt': // YouTube: White background with Official Red Squircle + Play Triangle
        return (
          <g>
            <rect width="24" height="24" rx="5.4" fill="white" />
            <path d="M22 12c0 2.6-.2 4-.5 5.1-.3 1.1-1 1.8-2.1 2.1-1.1.3-3.5.3-7.4.3s-6.3 0-7.4-.3c-1.1-.3-1.8-1-2.1-2.1C2.2 16 2 14.6 2 12s.2-4 .5-5.1c.3-1.1 1-1.8 2.1-2.1 1.1-.3 3.5-.3 7.4-.3s6.3 0 7.4.3c1.1.3 1.8 1 2.1 2.1.3 1.1.5 2.5.5 5.1z" fill="#FF0000" />
            <path d="M10 15.5l6-3.5-6-3.5v7z" fill="white" />
          </g>
        );
      case 'ch': // Chrome: White Background + 4-color Adaptive Icon
        return (
          <g>
            <rect width="24" height="24" rx="5.4" fill="white" />
            <circle cx="12" cy="12" r="9" fill="#E8EAED" />
            <path d="M12 3a9 9 0 0 0-7.8 4.5l3.9 6.7A4.5 4.5 0 0 1 12 7.5h7.8A9 9 0 0 0 12 3z" fill="#EA4335" />
            <path d="M4.2 7.5a9 9 0 0 0 0 9l3.9-6.8a4.5 4.5 0 0 1 1.4-2.2l-5.3 0z" fill="#34A853" />
            <path d="M12 21a9 9 0 0 0 7.8-4.5l-3.9-6.7a4.5 4.5 0 0 1-3.9 6.7l0 4.5z" fill="#FBBC05" />
            <circle cx="12" cy="12" r="4.5" fill="white" />
            <circle cx="12" cy="12" r="3.6" fill="#4285F4" />
          </g>
        );
      case 'nf': // Netflix: Black background + Red N
        return (
          <g>
            <rect width="24" height="24" rx="5.4" fill="black" />
            <path d="M7 4h3l4 9V4h3v16h-3l-4-9v9H7V4z" fill="#E50914" />
          </g>
        );
      case 'sp': // Spotify: Green circle + 3 black waves
        return (
          <g>
            <circle cx="12" cy="12" r="12" fill="#1DB954" />
            <path d="M17.3 16.5c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.8-9.3-1-.3.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 4.1-.9 7.6-.5 10.4 1.2.3.1.4.6.1.9zm1.3-3.1c-.3.4-.8.5-1.2.3-2.9-1.8-7.2-2.3-10.6-1.3-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.9-1.2 8.7-.6 12 1.4.4.2.5.7.3 1.1zm.1-3.2c-3.5-2.1-9.3-2.3-12.7-1.2-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3 4-1.2 10.4-1 14.5 1.4.5.3.6.9.3 1.4-.3.3-.9.5-1.4.3z" fill="black" />
          </g>
        );
      case 'li': // LinkedIn: Blue squircle + White Logo
        return (
          <g>
            <rect width="24" height="24" rx="5.4" fill="#0077B5" />
            <path d="M6.5 8.5H9v10H6.5v-10zm1.2-4.1c.8 0 1.5.6 1.5 1.5s-.6 1.5-1.5 1.5-1.5-.6-1.5-1.5.7-1.5 1.5-1.5zm10.3 4.1h-2.5v1.4h-.1c-.3-.6-1.1-1.4-2.5-1.4-2.6 0-3.1 1.7-3.1 4v6h2.5v-4.7c0-1.1.2-2.2 1.6-2.2 1.4 0 1.6 1 1.6 2.1V18.5H18v-6c0-2.8-.6-4-2.5-4z" fill="white" />
          </g>
        );
      case 'ds': // Discord: Blurple Squircle + Clyde
        return (
          <g>
            <rect width="24" height="24" rx="5.4" fill="#5865F2" />
            <path d="M17.8 5.6c-1.5-.7-3-1.1-4.7-1.4l-.2.5c1.8.5 3.5 1.2 5 2.2-2.2-1.1-4.6-1.8-7-1.8s-4.8.7-7 1.8c1.5-1 3.2-1.7 5-2.2l-.2-.5c-1.7.3-3.2.7-4.7 1.4-2.2 3.3-2.8 7.3-1.8 11.2 1.4.8 3 1.5 4.7 2 .4-.6.7-1.2 1-1.9-1-.3-1.9-.8-2.7-1.4.3.2.5.4.8.6 3.5 1.6 7.4 1.6 11 0 .3-.2.5-.4.8-.6-.8.6-1.7 1.1-2.7 1.4.3.7.6 1.3 1 1.9 1.7-.5 3.3-1.2 4.7-2 1-3.9.4-7.9-1.8-11.2zM8.5 14.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" fill="white" />
          </g>
        );
      case 'rd': // Reddit: Orange Circle + Snoo
        return (
          <g>
            <circle cx="12" cy="12" r="12" fill="#FF4500" />
            <path d="M12 18.2c-3.1 0-5.6-1.3-5.6-3 0-.1 0-.2.1-.3-.7-.3-1.2-.9-1.2-1.7 0-1 1-1.8 2.2-1.8.2 0 .4 0 .6.1.7-.9 1.8-1.5 3-1.6l.6-2.7c0-.1.1-.1.2-.1l1.8.4c.1-.4.4-.7.9-.7.5 0 1 .4 1 .9s-.4 1-1 1c-.3 0-.6-.2-.8-.4l-1.5-.3-.5 2.3c1.2.1 2.3.7 3 1.6.2-.1.4-.1.6-.1 1.2 0 2.2.8 2.2 1.8 0 .8-.5 1.4-1.2 1.7v.3c0 1.7-2.5 3-5.6 3zm-2.4-3.5c-.5 0-.9.4-.9.9s.4.9.9.9.9-.4.9-.9-.4-.9-.9-.9zm4.8 0c-.5 0-.9.4-.9.9s.4.9.9.9.9-.4.9-.9-.4-.9-.9-.9zm-2.4 2.5c1 0 1.9-.3 2.3-.8.1-.1.1-.3 0-.4-.1-.1-.3-.1-.4 0-.4.3-1.1.5-1.9.5s-1.5-.2-1.9-.5c-.1-.1-.3-.1-.4 0-.1.1-.1.3 0 .4.4.5 1.3.8 2.3.8z" fill="white" />
          </g>
        );
      default: // System Generic: Monochrome Adaptive Style
        return (
          <g>
            <rect width="24" height="24" rx="5.4" fill="#94A3B8" />
            <path d="M8 8h8v8H8z" fill="white" fillOpacity="0.8" />
          </g>
        );
    }
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {getIconContent()}
    </svg>
  );
};

export default AppIcon;