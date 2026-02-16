import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
}

export function LoadingScreen({ message = 'Memuat data', fullScreen = true }: LoadingScreenProps) {
    return (
        <div className={`${fullScreen ? 'fixed inset-0 z-[9999]' : 'absolute inset-0 z-40 rounded-[3rem]'} bg-white/80 backdrop-blur-md flex flex-col items-center justify-center`}>
            <div className="relative mb-8">
                {/* Animated Background Rings */}
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20 scale-150" />
                <div className="absolute inset-0 bg-blue-50 rounded-full animate-pulse opacity-40 scale-125" />

                {/* Logo Container */}
                <div className="relative w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center p-4 border border-blue-50 overflow-visible">
                    <img
                        src="/LogoSekolah.png"
                        alt="School Logo"
                        className="w-full h-full object-contain"
                    />

                    {/* Loading Line Trace along the border */}
                    <svg className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none" viewBox="0 0 104 104">
                        <rect
                            x="2"
                            y="2"
                            width="100"
                            height="100"
                            rx="34"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className="text-blue-600 animate-loading-border"
                        />
                    </svg>
                </div>
            </div>

            {/* Dynamic Message */}
            <div className="text-center space-y-2">
                <h3 className="text-blue-900 font-black uppercase tracking-[0.2em] text-sm animate-pulse">
                    {message}
                </h3>
                <div className="flex items-center justify-center gap-1">
                    <div className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-amber-400 rounded-full animate-bounce" />
                </div>
            </div>
        </div>
    );
}
