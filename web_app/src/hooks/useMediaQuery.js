import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    // Khởi tạo giá trị ban đầu
    setMatches(mediaQueryList.matches);

    const listener = (event) => setMatches(event.matches);
    
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    } else {
      // Hỗ trợ trình duyệt cũ
      mediaQueryList.addListener(listener);
      return () => mediaQueryList.removeListener(listener);
    }
  }, [query]);

  return matches;
};

export const useResponsive = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1199px)");
  const isDesktop = useMediaQuery("(min-width: 1200px)");

  return { isMobile, isTablet, isDesktop };
};
