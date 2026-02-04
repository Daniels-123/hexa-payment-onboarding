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
        <div className="relative w-full h-screen bg-primary-800 overflow-hidden flex flex-col md:flex-row">
            {/* Back Layer */}
            <div className={`w-full text-white z-0 flex-shrink-0 transition-all duration-300 ${revealed ? 'h-full' : 'h-auto'} md:w-5/12 md:h-full`}>
                {backLayer}
            </div>

            {/* Front Layer */}
            <div 
                className={`
                    absolute left-0 right-0 bottom-0 
                    h-[calc(100%-60px)] top-[60px]
                    bg-white rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] 
                    z-10 overflow-hidden transition-transform duration-300 ease-in-out
                    flex flex-col

                    md:static md:w-7/12 md:h-full md:rounded-none md:shadow-none md:top-0
                `}
            >
                {frontLayer}
            </div>
        </div>
    );
};
