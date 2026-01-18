import React, { useEffect, useState } from 'react';
import { Sparkle, Check } from 'phosphor-react';

const QUOTES = [
    "Excellence has been recorded.",
    "Your vision is secured.",
    "Another milestone achieved.",
    "Data successfully archived.",
    "Your impact is now logged.",
    "Seamlessly saved to the core.",
    "Precision locked in.",
    "Greatness is in the details.",
    "Update captured perfectly."
];

const SuccessNotification = ({ isOpen, onClose }) => {
    const [quote, setQuote] = useState("");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Pick a random quote
            setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

            // Show immediately
            // Small delay to allow render before opacity transition
            requestAnimationFrame(() => setVisible(true));

            // Schedule fade out
            const fadeTimer = setTimeout(() => {
                setVisible(false);
            }, 4500); // Start fading out at 4.5s

            // Schedule close (unmount/hide)
            const closeTimer = setTimeout(() => {
                onClose();
            }, 5000); // Fully gone at 5s

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(closeTimer);
            };
        } else {
            setVisible(false);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-500 ease-out flex flex-col items-center pointer-events-none
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        `}
        >
            <div className="bg-[#1a1a1a] text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-5 border border-gray-800 relative overflow-hidden group">

                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-lg shadow-lg">
                    <Sparkle size={24} weight="fill" className="text-white animate-pulse" />
                </div>

                <div className="flex flex-col">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 mb-1 font-urbanist">
                        System Update
                    </h4>
                    <p className="text-lg font-marcellus font-medium text-white tracking-wide leading-none pb-1">
                        {quote}
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-full bg-white/5" />
                <div className="absolute bottom-0 left-0 w-6 h-6 rounded-tr-full bg-blue-500/10" />
            </div>
        </div>
    );
};

export default SuccessNotification;
