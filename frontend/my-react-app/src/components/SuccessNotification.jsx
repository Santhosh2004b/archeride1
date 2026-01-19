import React, { useEffect, useState } from 'react';
import { Check } from 'phosphor-react';

const SuccessNotification = ({ isOpen, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Show immediately
            // Small delay to allow render before opacity transition
            requestAnimationFrame(() => setVisible(true));

            // Schedule fade out (Fast!)
            const fadeTimer = setTimeout(() => {
                setVisible(false);
            }, 1000); // Start fading out at 1.0s

            // Schedule close (unmount/hide)
            const closeTimer = setTimeout(() => {
                onClose();
            }, 1500); // Fully gone at 1.5s

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
            <div className="bg-[#1a1a1a] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 border border-gray-800 relative overflow-hidden">

                {/* Green Check Icon */}
                <div className="bg-green-500 p-1.5 rounded-full shadow-lg flex items-center justify-center">
                    <Check size={16} weight="bold" className="text-white" />
                </div>

                <div className="flex flex-col">
                    <p className="text-sm font-bold font-urbanist text-white tracking-wide leading-none">
                        Successfully Saved
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuccessNotification;
