"use client";

import FloatMenu from "@/components/site/layouts/FloatMenu/FloatMenu";


export default function FavoritesPage() {
    return (
        <div className="py-3">
            <div className="page-container">
                <div className="d-flex align-items-center gap-2 mb-3">
                    <button 
                        className="btn-back" 
                        onClick={() => history.back()} 
                        aria-label="Quay lại"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M15 19l-7-7 7-7" stroke="#2b2b2b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <h5 className="mb-0 fw-bold">Món yêu thích</h5>
                </div>
                
                <div className="text-center text-body-secondary py-5">
                    <div className="mb-2">❤️</div>
                    <div>Chưa có món yêu thích nào</div>
                </div>
            </div>
            
            <FloatMenu />
        </div>
    );
}

