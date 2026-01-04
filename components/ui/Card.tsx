import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'white' | 'glass' | 'highlight';
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'white', onClick }) => {
    const variants = {
        white: "bg-white border text-card-foreground shadow-sm",
        glass: "bg-white/80 backdrop-blur-md border border-white/20 shadow-xl", // Glassmorphism needs a background usually
        highlight: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-md",
    };

    // Improved Glass: usually needs a darker or colorful background behind it to show effect.
    // We'll trust the layout provides the background.

    return (
        <div
            className={`rounded-2xl p-6 ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
