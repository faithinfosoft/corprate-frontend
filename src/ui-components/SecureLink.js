import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import print_toast from '../utilities/Toaster';

const SecureLink = ({ href, children, className, style, download = false, fileName, title }) => {
    const handleClick = async (e) => {
        e.preventDefault();
        
        if (!href) {
            print_toast('error', 'Document not found');
            return;
        }

        // Ensure the Authorization header is always set before making the request.
        // axios.defaults.headers is only an in-memory setting — it is lost on page
        // reload. Re-read the token from the cookie every time so that refreshing
        // the page does not break document access.
        const token = Cookies.get('token') || localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            print_toast('error', 'Session expired. Please log in again.');
            return;
        }
        let targetUrl = href;
        if (targetUrl.includes('token=') && (targetUrl.endsWith('token=') || targetUrl.includes('token=&'))) {
            targetUrl = targetUrl.replace('token=', `token=${token}`);
        } else if (!targetUrl.includes('token=') && token) {
            targetUrl += (targetUrl.includes('?') ? '&' : '?') + `token=${token}`;
        }
        
        try {
            print_toast('success', download ? 'Downloading document...' : 'Opening document...');
            // Fetch file via axios with explicit Authorization header
            let response;
            try {
                response = await axios.get(targetUrl, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                });
            } catch (firstErr) {
                // Automatic fallback between candidate_documents and notifications if 404
                let fallbackHref = null;
                if (firstErr.response?.status === 404) {
                    if (href.includes('/secure_file/candidate_documents/')) {
                        fallbackHref = href.replace('/secure_file/candidate_documents/', '/secure_file/notifications/');
                    } else if (href.includes('/secure_file/notifications/')) {
                        fallbackHref = href.replace('/secure_file/notifications/', '/secure_file/candidate_documents/');
                    }
                }
                if (fallbackHref) {
                    response = await axios.get(fallbackHref, {
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: 'blob'
                    });
                } else {
                    throw firstErr;
                }
            }
            
            // Create a temporary Blob URL
            const file = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            
            if (download) {
                const link = document.createElement('a');
                link.href = fileURL;
                const downloadName = fileName || href.split('/').pop() || 'document.pdf';
                link.setAttribute('download', downloadName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Open the document in a new tab
                const newWin = window.open(fileURL, '_blank');
                if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
                    // Popup blocked: download directly instead
                    const link = document.createElement('a');
                    link.href = fileURL;
                    const downloadName = fileName || href.split('/').pop() || 'document.pdf';
                    link.setAttribute('download', downloadName);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
            
            // Clean up the URL to prevent memory leaks
            setTimeout(() => {
                URL.revokeObjectURL(fileURL);
            }, 60000);
            
        } catch (error) {
            console.error('Error fetching secure document:', error);
            if (error.response?.status === 401) {
                print_toast('error', 'Session expired. Please log in again.');
            } else if (error.response?.status === 404) {
                print_toast('error', 'Document file not found on server.');
            } else {
                print_toast('error', 'Error loading document. You might not have permission.');
            }
        }
    };

    return (
        <a href="#" onClick={handleClick} className={className} style={style} title={title}>
            {children}
        </a>
    );
};

export default SecureLink;
