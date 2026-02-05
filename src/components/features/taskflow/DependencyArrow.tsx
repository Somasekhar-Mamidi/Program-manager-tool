import React from 'react';

interface DependencyArrowProps {
    start: { x: number; y: number };
    end: { x: number; y: number };
    status: 'pending' | 'satisfied';
}

export const DependencyArrow: React.FC<DependencyArrowProps> = ({ start, end, status }) => {
    // Simple curved path
    // Start is usually right edge of source
    // End is usually left edge of target

    const c1x = start.x + (end.x - start.x) / 2;
    const c1y = start.y;
    const c2x = end.x - (end.x - start.x) / 2;
    const c2y = end.y;

    const path = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;

    return (
        <svg
            className="absolute top-0 left-0 pointer-events-none overflow-visible w-full h-full z-0"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <defs>
                <marker
                    id={`arrowhead-${status}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={status === 'satisfied' ? '#22c55e' : '#9ca3af'}
                    />
                </marker>
            </defs>
            <path
                d={path}
                fill="none"
                stroke={status === 'satisfied' ? '#22c55e' : '#9ca3af'}
                strokeWidth="2"
                markerEnd={`url(#arrowhead-${status})`}
            />
        </svg>
    );
};
