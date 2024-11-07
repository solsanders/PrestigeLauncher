import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TokenPriceTracker = () => {
    const [agcPrice, setAgcPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const FETCH_INTERVAL = 600000; // 10 minutes

    useEffect(() => {
        const fetchPrice = async () => {
            const cachedData = JSON.parse(localStorage.getItem('agcPriceData'));
            const now = Date.now();

            // Check if cached data exists and is not older than 4.5 minutes
            if (cachedData && now - cachedData.timestamp < FETCH_INTERVAL) {
                setAgcPrice(cachedData.price);
                setLoading(false);
            } else {
                try {
                    const response = await axios.get('https://token-price-backend.vercel.app/api/price');
                    const price = response.data.price; // Ensure this matches the response structure
                    setAgcPrice(price);

                    // Cache the data with a timestamp
                    localStorage.setItem('agcPriceData', JSON.stringify({ price, timestamp: now }));

                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching token price:', error);
                    setError('Failed to fetch token price');
                    setLoading(false);
                }
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, FETCH_INTERVAL); // Auto-refresh every 4.5 minutes
        return () => clearInterval(interval); // Clean up interval on component unmount
    }, []);

    return (
        <div className="price-section" style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>
            <strong style={{ color: '#969696' }}>Live AGC Price: </strong>
            {loading ? (
                <span> Loading...</span>
            ) : error ? (
                <span style={{ color: 'red' }}> {error}</span>
            ) : agcPrice !== null && agcPrice !== undefined ? (
                <span style={{ color: '#4CAF50' }}>&nbsp;${agcPrice.toFixed(2)} USD</span>
            ) : (
                <span style={{ color: 'red' }}> Price data unavailable</span>
            )}
        </div>
    );
};

export default TokenPriceTracker;
