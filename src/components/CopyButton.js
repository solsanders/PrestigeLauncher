import React from 'react';
import '../App.css';

const CopyButton = ({ textToCopy, label }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert(`${label} copied to clipboard!`);
        }).catch((error) => {
            console.error('Failed to copy text:', error);
        });
    };

    return (
        <button onClick={handleCopy} className="copy-button">
            Copy
        </button>
    );
};


export default CopyButton;
