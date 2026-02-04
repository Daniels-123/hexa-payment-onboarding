import type { ReactNode } from 'react';

interface BackdropProps {
    backLayer: ReactNode;
    frontLayer: ReactNode;
    /**
     * If true, the front layer is "active" (visible/expanded).
     * If false, it might be minimized or hidden depending on design.
     * For this usage: "Pay" button opens modal -> The generic Backdrop might just be the layout.
     * Let's assume Back Layer is always visible at top, Front Layer enters from bottom.
     */
    revealed?: boolean; 
    // headerHeight?: string; // removed unused
}

export const Backdrop: React.FC<BackdropProps> = ({ 
    backLayer, 
    frontLayer, 
    revealed = false, 
    // headerHeight = 'h-16' 
}) => {
    return (
        <div className="relative w-full h-screen bg-primary-800 overflow-hidden flex flex-col">
            {/* Back Layer */}
            <div className={`w-full text-white z-0 flex-shrink-0 transition-all duration-300 ${revealed ? 'h-full' : 'h-auto'}`}>
                {backLayer}
            </div>

            {/* Front Layer */}
            <div 
                className={`
                    absolute left-0 right-0 bottom-0 
                    bg-white rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] 
                    z-10 overflow-auto transition-transform duration-300 ease-in-out
                    flex flex-col
                `}
                style={{ 
                    // Back Layer = Context (Product Summary?)
                    // Front Layer = Form.
                    // Let's implement standard sliding sheet behavior.
                     height: 'calc(100% - 60px)', // Leave some back layer visible
                     top: '60px'
                }}
            >
                {frontLayer}
            </div>
        </div>
    );
};
