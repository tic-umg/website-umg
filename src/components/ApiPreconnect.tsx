"use client";

import { useEffect } from "react";

export function ApiPreconnect() {
  useEffect(() => {
    // Safe manual injection for preconnect/dns-prefetch
    // This avoids "ReactDOM.preconnect is not a function" errors in some environments
    try {
        const linkPreconnect = document.createElement('link');
        linkPreconnect.rel = 'preconnect';
        linkPreconnect.href = 'https://api.mahajanga-univ.mg';
        linkPreconnect.crossOrigin = 'anonymous';
        document.head.appendChild(linkPreconnect);

        const linkDns = document.createElement('link');
        linkDns.rel = 'dns-prefetch';
        linkDns.href = 'https://api.mahajanga-univ.mg';
        document.head.appendChild(linkDns);
    } catch (e) {
        console.warn('Failed to inject preconnect links', e);
    }
  }, []);
  
  return null;
}
