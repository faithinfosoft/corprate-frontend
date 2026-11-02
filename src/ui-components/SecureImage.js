import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const SecureImage = ({ src, alt, className, style, fallbackSrc }) => {
    const [imgSrc, setImgSrc] = useState(fallbackSrc || '');

    useEffect(() => {
        let isMounted = true;
        
        const fetchImage = async () => {
            if (!src) return;
            
            // If the src is the fallback image, don't try to fetch it securely
            if (src === fallbackSrc) {
                setImgSrc(fallbackSrc);
                return;
            }

            try {
                const token = Cookies.get('token');
                const response = await axios.get(src, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: 'blob'
                });
                
                const url = URL.createObjectURL(response.data);
                if (isMounted) {
                    setImgSrc(url);
                }
            } catch (error) {
                console.error("Error fetching secure image:", error);
                if (isMounted) {
                    setImgSrc(fallbackSrc);
                }
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
        };
    }, [src, fallbackSrc]);

    return (
        <img 
            src={imgSrc || src} 
            alt={alt} 
            className={className} 
            style={style} 
            onError={(e) => {
                if (fallbackSrc && e.target.src !== fallbackSrc) {
                    e.target.onerror = null;
                    e.target.src = fallbackSrc;
                }
            }}
        />
    );
};

export default SecureImage;
