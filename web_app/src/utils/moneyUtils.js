/**
 * Format số tiền theo kiểu Việt Nam: 1.000.000
 * @param {number|string} value
 * @returns {string}
 */
export function formatMoney(value) {
  if (value === undefined || value === null || value === '') return '0';
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(/,/g, '')) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('vi-VN');
}

/**
 * Format số tiền kèm đơn vị "đ": 1.000.000đ
 * @param {number|string} value
 * @returns {string}
 */
export function formatMoneyVND(value) {
  return formatMoney(value) + 'đ';
}

/**
 * Parse chuỗi tiền (có dấu chấm phân cách) thành số
 * "1.000.000" → 1000000
 * @param {string} formatted
 * @returns {number}
 */
export function parseMoney(formatted) {
  if (!formatted) return 0;
  const cleaned = String(formatted).replace(/\./g, '').replace(/,/g, '').replace(/[^\d-]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Đọc số tiền thành chữ tiếng Việt
 * 1500000 → "Một triệu năm trăm nghìn đồng"
 * @param {number} n
 * @returns {string}
 */
export function moneyToWords(n) {
  if (n === 0) return 'Không đồng';
  if (n === undefined || n === null || isNaN(n)) return '';

  const isNegative = n < 0;
  n = Math.abs(Math.floor(n));

  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  
  function readGroup(num) {
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;
    let result = '';

    if (h > 0) {
      result += digits[h] + ' trăm';
      if (t === 0 && u > 0) result += ' linh';
    }

    if (t > 1) {
      result += ' ' + digits[t] + ' mươi';
      if (u === 1) result += ' mốt';
      else if (u === 4) result += ' tư';
      else if (u === 5) result += ' lăm';
      else if (u > 0) result += ' ' + digits[u];
    } else if (t === 1) {
      result += ' mười';
      if (u === 5) result += ' lăm';
      else if (u > 0) result += ' ' + digits[u];
    } else if (u > 0) {
      result += ' ' + digits[u];
    }

    return result.trim();
  }

  const units = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];
  const groups = [];

  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const groupText = readGroup(groups[i]);
    if (groupText) {
      result += groupText + units[i] + ' ';
    }
  }

  result = result.trim();
  // Viết hoa chữ cái đầu
  result = result.charAt(0).toUpperCase() + result.slice(1);
  
  return (isNegative ? 'Âm ' : '') + result + ' đồng';
}
