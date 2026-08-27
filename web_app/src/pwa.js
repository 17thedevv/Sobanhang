import { registerSW } from 'virtual:pwa-register';

export function setupPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Logic when there is an update available
      if (confirm('Có phiên bản mới của Sổ Bán Hàng. Nhấn OK để tải lại ứng dụng.')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('Ứng dụng đã sẵn sàng hoạt động ngoại tuyến');
    },
  });
}
