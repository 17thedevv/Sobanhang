const defaultNumbers = ' hai ba bốn năm sáu bảy tám chín';
const units = ('1 một' + defaultNumbers).split(' ');
const ch = 'lẻ mười' + defaultNumbers;
const tr = 'không một' + defaultNumbers;
const tram = tr.split(' ');
const u = '2 nghìn triệu tỉ'.split(' ');
const chuc = ch.split(' ');

/**
 * Đọc block 3 số
 */
function readBlock(block, full) {
    let a = parseInt(block[0], 10);
    let b = parseInt(block[1], 10);
    let c = parseInt(block[2], 10);
    let result = '';

    if (a !== 0 || full) {
        result += tram[a] + ' trăm ';
    }
    
    if (b === 0) {
        if (c !== 0 && (a !== 0 || full)) result += 'lẻ ';
    } else {
        result += chuc[b] + ' ';
        if (b !== 1 && c === 1) {
            c = -1; // mốt
        }
    }
    
    if (c === -1) result += 'mốt';
    else if (c === 4 && b !== 0 && b !== 1) result += 'tư';
    else if (c === 5 && b !== 0) result += 'lăm';
    else if (c !== 0) result += units[c];
    
    return result.trim();
}

export function numberToWords(number) {
    if (number === 0 || number === '0') return 'Không đồng';
    if (!number || isNaN(number)) return '';
    
    let str = parseInt(number, 10).toString();
    if (str === '0') return 'Không đồng';
    
    // pad to length % 3 == 0
    let rem = str.length % 3;
    if (rem !== 0) {
        str = '0'.repeat(3 - rem) + str;
    }
    
    let blocks = [];
    for (let i = 0; i < str.length; i += 3) {
        blocks.push(str.substring(i, i + 3));
    }
    
    let result = '';
    let len = blocks.length;
    
    for (let i = 0; i < len; i++) {
        let block = blocks[i];
        if (block === '000') {
            if (len - i - 1 === 3) {
                result += 'tỉ ';
            }
            continue;
        }
        
        let blockText = readBlock(block, i > 0);
        result += blockText + ' ';
        
        let unitIndex = len - i - 1;
        if (unitIndex > 0) {
            let uIndex = unitIndex % 3;
            if (uIndex === 0) {
                // handle multi-billion correctly by grouping
                result += 'tỉ ';
            } else {
                result += u[uIndex] + ' ';
            }
        }
    }
    
    result = result.trim().replace(/\s+/g, ' ');
    if (result) {
        result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
    }
    
    return result;
}
