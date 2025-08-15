import React from "react";
import './loading.css';

type LoadingProps = {
    loading?: boolean;
    background?: string;
    loaderColor?: string;
};

export const Loading: React.FC<LoadingProps> = ({
    background = "rgba(236, 240, 241, 0.7)",
    loaderColor = "#e74c3c",
}) => {
    return (
        <div className="loading-background" style={{ background }}>
            <div className="loading-bar">
                <div className="loading-circle-1" style={{ background: loaderColor }} />
                <div className="loading-circle-2" style={{ background: loaderColor }} />
            </div>
        </div>
    );
};
