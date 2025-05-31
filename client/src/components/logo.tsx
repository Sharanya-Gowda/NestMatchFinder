import { Home } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Logo Icon - Professional nest design */}
      <div className={`${sizeClasses[size]} relative rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg flex items-center justify-center`}>
        <svg 
          viewBox="0 0 24 24" 
          className="w-3/5 h-3/5 text-white"
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Modern building/nest icon */}
          <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.21 2.31-.54 3.42-1.01C18.68 24.65 22 20.58 22 17V7l-10-5z"/>
          <path d="M12 4.5L4.5 8.5V17c0 3.5 2.5 6.5 7.5 7.5 5-1 7.5-4 7.5-7.5V8.5L12 4.5z" fill="rgba(255,255,255,0.2)"/>
          <circle cx="12" cy="14" r="3" fill="rgba(255,255,255,0.8)"/>
          <path d="M10 12h4v4h-4z" fill="rgba(255,255,255,0.6)"/>
        </svg>
      </div>
      
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          NestMatch
        </span>
      )}
    </div>
  );
}