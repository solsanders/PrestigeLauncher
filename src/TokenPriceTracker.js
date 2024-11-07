import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TokenPriceTracker = () => {
    const [agcPrice, setAgcPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await axios.get('https://token-price-backend.vercel.app/api/price');
                setAgcPrice(response.data.price);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching token price:', error);
                setError('Failed to fetch token price');
                setLoading(false);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 270000); // Refresh every 4.5 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="price-section" style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>
            <strong style={{ color: '#969696' }}>Live AGC Price: </strong>
            {loading ? (
                <span> Loading...</span>
            ) : error ? (
                <span style={{ color: 'red' }}> {error}</span>
            ) : agcPrice !== null ? (
                <span style={{ color: '#4CAF50' }}>&nbsp;${agcPrice.toFixed(2)} USD</span>
            ) : (
                <span style={{ color: 'red' }}> Price data unavailable</span>
            )}
        </div>
    );
};

export default TokenPriceTracker;
