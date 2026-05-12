export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[FB_PIXEL] Event: PageView');
    }
    (window as any).fbq('track', 'PageView');
  }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name: string, options = {}) => {
  if (typeof window !== 'undefined') {
    if ((window as any).fbq) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[FB_PIXEL] Event: ${name}`, options);
      }
      (window as any).fbq('track', name, options);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[FB_PIXEL] fbq not found. Event ${name} was NOT tracked.`, options);
      }
    }
  }
};
