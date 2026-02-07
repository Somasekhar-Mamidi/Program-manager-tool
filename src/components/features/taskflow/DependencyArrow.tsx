import React from 'react';

interface DependencyArrowProps {
    start: { x: number; y: number };
    end: { x: number; y: number };
    status: 'pending' | 'satisfied';
    color?: string;
}

export const DependencyArrow: React.FC<DependencyArrowProps> = ({ start, end, status, color }) => {
    // Smoother Bezier Curve logic
    // We want the line to exit right and enter left

    const dist = Math.abs(end.x - start.x);
    const controlPointOffset = Math.max(dist * 0.5, 50); // Minimum offset

    const cp1x = start.x + controlPointOffset;
    const cp1y = start.y;
    const cp2x = end.x - controlPointOffset;
    const cp2y = end.y;

    const path = `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
    const strokeColor = color || (status === 'satisfied' ? '#22c55e' : '#94a3b8');

    return (
        <svg
            className="absolute top-0 left-0 pointer-events-none overflow-visible w-full h-full z-0"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <defs>
                <marker
                    id={`arrowhead-${status}-${color || 'default'}`}
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                >
                    <path
                        d="M0,0 L0,6 L8,3 z"
                        fill={strokeColor}
                    />
                </marker>
            </defs>
            <path
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                markerEnd={`url(#arrowhead-${status}-${color || 'default'})`}
                style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.05))' }}
            />
        </svg>
    );
};
