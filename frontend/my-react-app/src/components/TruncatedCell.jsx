import React, { useState, useRef, useEffect } from "react";

const TruncatedCell = ({ content }) => {
    const [expanded, setExpanded] = useState(false);
    const containerRef = useRef(null);

    const text = String(content || "");
    const words = text.split(/\s+/).filter(Boolean);

    // Default rule: 2 lines max
    // Line 1: Max 4 words
    // Line 2: Max 3 words
    const MAX_LINE_1_WORDS = 4;
    const MAX_LINE_2_WORDS = 3;
    const TOTAL_VISIBLE_WORDS = MAX_LINE_1_WORDS + MAX_LINE_2_WORDS;

    const shouldTruncate = words.length > TOTAL_VISIBLE_WORDS;

    // Handle click outside to collapse
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setExpanded(false);
            }
        };

        if (expanded) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [expanded]);

    if (!content) return <span>-</span>;

    if (!shouldTruncate) {
        return <span className="whitespace-pre-wrap break-words">{text}</span>;
    }

    const renderContent = () => {
        const line1 = words.slice(0, MAX_LINE_1_WORDS).join(" ");
        const line2 = words.slice(MAX_LINE_1_WORDS, TOTAL_VISIBLE_WORDS).join(" ");

        return (
            <div className="relative">
                {/* Base (Always present, maintains layout) */}
                <div className="flex flex-col opacity-100">
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{line1}</span>
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1">
                        {line2}
                        <span className="text-blue-600 font-bold ml-1 text-[10px]">Read more...</span>
                    </span>
                </div>

                {/* Overlay (Shown when expanded) */}
                {expanded && (
                    <div
                        className="fixed sm:absolute z-[100] bg-white shadow-2xl p-4 rounded-lg border border-blue-200 min-w-[300px] max-w-[90vw] max-h-[400px] overflow-auto left-0 top-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider border-b pb-1">Full Content</div>
                        <div className="whitespace-pre-wrap break-words text-sm text-gray-800 leading-relaxed font-urbanist">
                            {text}
                        </div>
                        <button
                            onClick={() => setExpanded(false)}
                            className="mt-4 text-[10px] uppercase font-bold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Close [×]
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            onClick={() => !expanded && setExpanded(true)}
            className="cursor-pointer group relative"
            title={!expanded ? "Click to expand" : ""}
        >
            {renderContent()}
        </div>
    );
};

export default TruncatedCell;
