"use client";

import Image from "next/image";

interface OmnitrixLogoProps {
    size?: number;
    className?: string;
}

export default function OmnitrixLogo({ size = 40, className = "" }: OmnitrixLogoProps) {
    return (
        <div 
            className={`relative flex items-center justify-center shrink-0 ${className}`}
            style={{ width: size, height: size }}
        >
            <Image
                src="/logo.png"
                alt="Omnitrix Logo"
                fill
                className="object-contain"
                sizes={`${size}px`}
                priority
            />
        </div>
    );
}
