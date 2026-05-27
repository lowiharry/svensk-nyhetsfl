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
  /** Reserved height in px to prevent CLS. Defaults based on adFormat. */
  reservedHeight?: number;
}

const AdSense = ({ 
  adSlot, 
  adFormat = "auto",
  adLayoutKey,
  fullWidthResponsive = true,
  className = "",
  reservedHeight,
}: AdSenseProps) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // Reserve vertical space up-front so the ad slot doesn't shift layout when it loads.
  const minHeight =
    reservedHeight ??
    (adFormat === 'fluid' ? 200 : adFormat === 'horizontal' ? 90 : 280);

  return (
    <div className={className} style={{ minHeight, contain: 'layout' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight, width: '100%' }}
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
