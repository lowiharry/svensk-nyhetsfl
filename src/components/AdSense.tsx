import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  adLayoutKey?: string;
  fullWidthResponsive?: boolean;
  className?: string;
}

const AdSense = ({ 
  adSlot, 
  adFormat = "auto",
  adLayoutKey,
  fullWidthResponsive = true,
  className = ""
}: AdSenseProps) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3000410248339228"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        {...(adLayoutKey && { 'data-ad-layout-key': adLayoutKey })}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
};

export default AdSense;
