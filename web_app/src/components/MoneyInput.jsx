import { useState, useEffect } from 'react';
import { formatMoney, parseMoney } from '../utils/moneyUtils';
import { numberToWords } from '../utils/numberToWords';

/**
 * Input tiền tệ tự động format 1.000.000 và hiển thị bằng chữ
 * 
 * Props:
 * - value: number (giá trị thực, VD: 1500000)
 * - onChange: (numericValue: number) => void
 * - showWords: boolean (hiển thị bằng chữ hay không, mặc định true)
 * - placeholder: string
 * - className: string
 * - ...rest: các props khác truyền vào <input>
 */
export default function MoneyInput({ value, onChange, showWords = true, placeholder = '0', className = '', ...rest }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Sync from outside (e.g. form reset)
    if (value !== undefined && value !== null && value !== '') {
      setDisplayValue(formatMoney(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    
    // Chỉ cho phép số và dấu chấm
    const digitsOnly = raw.replace(/[^\d]/g, '');
    
    if (digitsOnly === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const numericValue = parseInt(digitsOnly, 10);
    setDisplayValue(formatMoney(numericValue));
    onChange(numericValue);
  };

  const numericValue = typeof value === 'number' ? value : parseMoney(displayValue);

  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        className={className}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        {...rest}
      />
      {showWords && numericValue > 0 && (
        <div style={{
          fontSize: '0.78rem',
          color: '#888',
          fontStyle: 'italic',
          marginTop: 4,
          paddingLeft: 2,
        }}>
          {numberToWords(numericValue)}
        </div>
      )}
    </div>
  );
}
