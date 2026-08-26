import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Trash2, Tag, Percent, Archive, Package, Barcode, Copy, Settings } from 'lucide-react';
import axios from 'axios';
import ProductSettingsModal from './ProductSettingsModal';
import './ProductModal.css';

export default function ProductModal({ product, onClose, onCopy }) {
  const { addProduct, updateProduct, deleteProduct } = useApp();
  
  // Basic info
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('Cái');
  const [categoryId, setCategoryId] = useState('');
  const [barcode, setBarcode] = useState('');
  
  // Advanced pricing
  const [promotionalPrice, setPromotionalPrice] = useState('');
  const [enableWholesale, setEnableWholesale] = useState(false);
  const [wholesaleTiers, setWholesaleTiers] = useState([{ minQuantity: '', price: '' }]);
  
  // Inventory
  const [trackInventory, setTrackInventory] = useState(true);
  const [stock, setStock] = useState('');

  // Other (US-35, US-36)
  const [showOnWeb, setShowOnWeb] = useState(true);
  const [upsellIds, setUpsellIds] = useState([]);

  // Unit Conversions (US-29)
  const [enableUnitConversion, setEnableUnitConversion] = useState(false);
  const [unitConversions, setUnitConversions] = useState([{ fromUnit: '', toUnit: '', ratio: '' }]);
  
  // Variants
  const [enableVariants, setEnableVariants] = useState(false);
  const [attributes, setAttributes] = useState([]); // [{ name: 'Màu sắc', values: ['Đỏ', 'Xanh'] }]
  const [attributeTexts, setAttributeTexts] = useState({}); // { 0: 'Đỏ, Xanh', 1: 'L, XL' } — raw text per index
  const [variants, setVariants] = useState([]);

  // Data
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [formSettings, setFormSettings] = useState({
    showImage: true, showBarcode: true, showUnit: true,
    showPromotionalPrice: true, showWholesalePrice: true, showUnitConversion: false,
    showTrackInventory: true, showVariants: true, showUpsell: false, showWebSettings: false,
    showDescription: true, showSuggested: false, showProductLabels: false
  });

  useEffect(() => {
    // Fetch categories and settings
    axios.get('/api/categories').then(res => setCategories(res.data.categories)).catch(console.error);
    axios.get('/api/stores/settings').then(res => {
      if (res.data.productSettings) {
        setFormSettings(prev => ({ ...prev, ...res.data.productSettings }));
      }
    }).catch(console.error);

    if (product) {
      setName(product.name || '');
      setPrice(product.price || '');
      setUnit(product.unit || 'Cái');
      setCategoryId(product.categoryId || '');
      setBarcode(product.barcode || '');
      setPromotionalPrice(product.promotionalPrice || '');
      setTrackInventory(product.trackInventory !== false);
      setStock(product.stock || '');
      setShowOnWeb(product.showOnWeb !== false);
      
      if (product.upsellIds) {
        try {
          const parsed = JSON.parse(product.upsellIds);
          if (Array.isArray(parsed)) setUpsellIds(parsed);
        } catch(e) {}
      }

      if (product.wholesalePrice) {
        try {
          const parsed = JSON.parse(product.wholesalePrice);
          if (parsed && parsed.length > 0) {
            setEnableWholesale(true);
            setWholesaleTiers(parsed);
          }
        } catch(e) {}
      }

      if (product.variants && product.variants.length > 0) {
        setEnableVariants(true);
        // reconstruct attributes from variants?
        // In a real app, attributes should be stored separately in DB or parsed from variants.
        // For simplicity, we just set the variants array directly if they just want to edit price/stock.
        setVariants(product.variants.map(v => ({
          ...v,
          attributesObj: JSON.parse(v.attributes)
        })));
        // Reconstruct attributes (simplified)
        const attrMap = {};
        product.variants.forEach(v => {
          const attrs = JSON.parse(v.attributes);
          Object.entries(attrs).forEach(([k, val]) => {
            if (!attrMap[k]) attrMap[k] = new Set();
            attrMap[k].add(val);
          });
        });
        const reconstructedAttrs = Object.keys(attrMap).map(k => ({
          name: k,
          values: Array.from(attrMap[k])
        }));
        setAttributes(reconstructedAttrs);
        // Seed raw text for each reconstructed attribute
        const texts = {};
        reconstructedAttrs.forEach((a, i) => {
          texts[i] = a.values.join(', ');
        });
        setAttributeTexts(texts);
      }
    }
  }, [product]);

  // Variant generator
  useEffect(() => {
    if (!enableVariants || attributes.length === 0) {
      setVariants([]);
      return;
    }
    
    // Check if attributes have values
    const validAttrs = attributes.filter(a => a.name && a.values.length > 0);
    if (validAttrs.length === 0) {
      setVariants([]);
      return;
    }

    // Cartesian product
    const cartesian = (args) => {
      let r = [], max = args.length-1;
      function helper(arr, i) {
        for (let j=0, l=args[i].values.length; j<l; j++) {
          let a = arr.slice(0); // clone arr
          a.push({[args[i].name]: args[i].values[j]});
          if (i==max) r.push(a);
          else helper(a, i+1);
        }
      }
      helper([], 0);
      return r;
    };

    const combinations = cartesian(validAttrs);
    const newVariants = combinations.map(comb => {
      // Flatten comb array into object
      const attrsObj = Object.assign({}, ...comb);
      
      // Try to find existing variant to preserve price/stock
      const existing = variants.find(v => {
        return JSON.stringify(v.attributesObj || JSON.parse(v.attributes)) === JSON.stringify(attrsObj);
      });

      return existing || {
        attributesObj: attrsObj,
        price: '',
        stock: '',
        barcode: ''
      };
    });
    setVariants(newVariants);
  }, [attributes, enableVariants]);

  const handleAddAttribute = () => {
    if (attributes.length >= 3) return; // limit to 3 attributes
    setAttributes([...attributes, { name: '', values: [] }]);
    setAttributeTexts(prev => ({ ...prev, [attributes.length]: '' }));
  };

  const handleAttributeNameChange = (index, value) => {
    const newAttrs = [...attributes];
    newAttrs[index].name = value;
    setAttributes(newAttrs);
  };

  const handleAttributeValuesTextChange = (index, text) => {
    // Just update the raw text — don't parse yet
    setAttributeTexts(prev => ({ ...prev, [index]: text }));
  };

  const handleAttributeValuesBlur = (index) => {
    // Parse the raw text into the values array on blur
    const text = attributeTexts[index] || '';
    const parsed = text.split(',').map(s => s.trim()).filter(s => s);
    const newAttrs = [...attributes];
    newAttrs[index].values = parsed;
    setAttributes(newAttrs);
  };

  const removeAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
    // Re-index attributeTexts
    const newTexts = {};
    let j = 0;
    Object.keys(attributeTexts).forEach(k => {
      if (Number(k) !== index) {
        newTexts[j] = attributeTexts[k];
        j++;
      }
    });
    setAttributeTexts(newTexts);
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const preventInvalidNumber = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    
    setLoading(true);
    try {
      const productData = {
        name,
        price: Number(price),
        unit,
        categoryId: categoryId || null,
        barcode: barcode || null,
        promotionalPrice: promotionalPrice ? Number(promotionalPrice) : null,
        trackInventory,
        stock: trackInventory ? (Number(stock) || 0) : 0,
        showOnWeb,
        upsellIds: upsellIds.length > 0 ? JSON.stringify(upsellIds) : null,
        wholesalePrice: enableWholesale ? wholesaleTiers.filter(t => t.minQuantity && t.price) : null,
        variants: enableVariants ? variants.map(v => ({
          attributes: v.attributesObj,
          price: v.price ? Number(v.price) : null,
          stock: v.stock ? Number(v.stock) : 0,
          barcode: v.barcode || null
        })) : []
      };

      let success = false;
      if (product) {
        success = await updateProduct({ ...product, ...productData });
      } else {
        success = await addProduct(productData);
      }
      
      if (success) onClose();
      else alert('Có lỗi xảy ra, vui lòng thử lại');
    } catch (error) {
      console.error(error);
      alert('Lưu sản phẩm thất bại. Kiểm tra lại dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay glass" onClick={onClose}>
      <div className="modal-content product-modal-large card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <div className="modal-header-actions">
            <button type="button" className="btn-icon" title="Cài đặt form" onClick={() => setShowSettingsModal(true)}>
              <Settings size={18} />
            </button>
            {product && (
              <>
                <button type="button" className="btn-icon" title="Sao chép sản phẩm" onClick={() => {
                  if (onCopy) onCopy(product);
                  onClose();
                }}>
                  <Copy size={18} />
                </button>
                <button type="button" className="btn-icon text-danger" title="Xóa sản phẩm" onClick={async () => {
                  if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                    await deleteProduct(product.id);
                    onClose();
                  }
                }}>
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="modal-body-scroll">
          {/* Section 1: Basic Info */}
          <div className="form-section">
            <h3 className="section-title"><Package size={16}/> Thông tin cơ bản</h3>
            <div className="form-group">
              <label>Tên sản phẩm *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus className="input-field" placeholder="VD: Áo thun nam" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Danh mục</label>
                <select className="input-field" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              {formSettings.showDescription && (
                <div className="form-group">
                  <label>Mô tả sản phẩm</label>
                  <textarea className="input-field" rows="1" placeholder="Nhập mô tả sản phẩm..." />
                </div>
              )}
            </div>
            
            {formSettings.showSuggested && (
              <div className="form-group mb-0 mt-3">
                <label>Gợi ý sản phẩm tương tự</label>
                <input type="text" className="input-field" placeholder="Tìm và chọn sản phẩm gợi ý..." />
              </div>
            )}
          </div>

          {/* Section: Đơn vị quy đổi (US-29) */}
          {formSettings.showUnitConversion && (
            <div className="form-section">
              <h3 className="section-title"><Package size={16}/> Đơn vị quy đổi</h3>
            <div className="toggle-group mb-3">
              <label className="switch">
                <input type="checkbox" checked={enableUnitConversion} onChange={e => setEnableUnitConversion(e.target.checked)} />
                <span className="slider round"></span>
              </label>
              <span className="toggle-label">Thêm đơn vị quy đổi (VD: 1 Lốc = 6 Lon)</span>
            </div>

            {enableUnitConversion && (
              <div className="wholesale-box">
                {unitConversions.map((conv, index) => (
                  <div className="form-row align-items-center mb-2" key={index}>
                    <div className="form-group mb-0">
                      <input type="text" placeholder="Đơn vị gốc (VD: Lốc)" className="input-field" value={conv.fromUnit} onChange={e => {
                        const newConvs = [...unitConversions];
                        newConvs[index].fromUnit = e.target.value;
                        setUnitConversions(newConvs);
                      }} />
                    </div>
                    <span style={{padding: '0 8px', color: '#999'}}>=</span>
                    <div className="form-group mb-0">
                      <input type="number" placeholder="Số lượng" min="0" onKeyDown={preventInvalidNumber} className="input-field" value={conv.ratio} onChange={e => {
                        const newConvs = [...unitConversions];
                        newConvs[index].ratio = e.target.value;
                        setUnitConversions(newConvs);
                      }} />
                    </div>
                    <div className="form-group mb-0">
                      <input type="text" placeholder={`Đơn vị nhỏ (VD: ${unit})`} className="input-field" value={conv.toUnit} onChange={e => {
                        const newConvs = [...unitConversions];
                        newConvs[index].toUnit = e.target.value;
                        setUnitConversions(newConvs);
                      }} />
                    </div>
                    <button type="button" className="btn-icon delete" onClick={() => setUnitConversions(unitConversions.filter((_, i) => i !== index))}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-text" onClick={() => setUnitConversions([...unitConversions, { fromUnit: '', toUnit: '', ratio: '' }])}>
                  <Plus size={16}/> Thêm quy đổi khác
                </button>
              </div>
            )}
          </div>
          )}

          {/* Section 2: Pricing */}
          <div className="form-section">
            <h3 className="section-title"><Tag size={16}/> Giá bán</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Giá bán lẻ *</label>
                <input type="number" required min="0" onKeyDown={preventInvalidNumber} className="input-field" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              {formSettings.showPromotionalPrice && (
                <div className="form-group">
                  <label>Giá khuyến mãi</label>
                  <input type="number" min="0" onKeyDown={preventInvalidNumber} className="input-field" value={promotionalPrice} onChange={e => setPromotionalPrice(e.target.value)} />
                </div>
              )}
              {formSettings.showUnit && (
                <div className="form-group">
                  <label>Đơn vị tính</label>
                  <input type="text" className="input-field" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Cái, Hộp..." />
                </div>
              )}
            </div>

            {formSettings.showWholesalePrice && (
              <>
                <div className="toggle-group mt-3">
                  <label className="switch">
                    <input type="checkbox" checked={enableWholesale} onChange={e => setEnableWholesale(e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                  <span className="toggle-label">Áp dụng giá sỉ (Wholesale)</span>
                </div>

                {enableWholesale && (
                  <div className="wholesale-box mt-2">
                    {wholesaleTiers.map((tier, index) => (
                      <div className="form-row align-items-center mb-2" key={index}>
                        <div className="form-group mb-0">
                          <input type="number" placeholder="Từ số lượng..." min="0" onKeyDown={preventInvalidNumber} className="input-field" value={tier.minQuantity} onChange={e => {
                            const newTiers = [...wholesaleTiers];
                            newTiers[index].minQuantity = e.target.value;
                            setWholesaleTiers(newTiers);
                          }} />
                        </div>
                        <div className="form-group mb-0">
                          <input type="number" placeholder="Giá sỉ..." min="0" onKeyDown={preventInvalidNumber} className="input-field" value={tier.price} onChange={e => {
                            const newTiers = [...wholesaleTiers];
                            newTiers[index].price = e.target.value;
                            setWholesaleTiers(newTiers);
                          }} />
                        </div>
                        <button type="button" className="btn-icon delete" onClick={() => setWholesaleTiers(wholesaleTiers.filter((_, i) => i !== index))}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn-text" onClick={() => setWholesaleTiers([...wholesaleTiers, {minQuantity: '', price: ''}])}>
                      <Plus size={16}/> Thêm bậc giá sỉ
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section 3: Inventory */}
          {formSettings.showTrackInventory && !enableVariants && (
            <div className="form-section">
              <h3 className="section-title"><Archive size={16}/> Kho hàng</h3>
              <div className="toggle-group mb-3">
                <label className="switch">
                  <input type="checkbox" checked={trackInventory} onChange={e => setTrackInventory(e.target.checked)} />
                  <span className="slider round"></span>
                </label>
                <span className="toggle-label">Theo dõi số lượng tồn kho</span>
              </div>

              {trackInventory && (
                <div className="form-row">
                  <div className="form-group mb-0">
                    <label>Tồn kho hiện tại</label>
                    <input type="number" min="0" onKeyDown={preventInvalidNumber} className="input-field" value={stock} onChange={e => setStock(e.target.value)} placeholder="Nhập số lượng..." />
                  </div>
                  {formSettings.showBarcode && (
                    <div className="form-group mb-0">
                      <label>Mã vạch / Barcode</label>
                      <div className="input-with-icon">
                        <Barcode size={16} className="icon" />
                        <input type="text" className="input-field pl-8" value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Tự động sinh..." />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section 4: Variants */}
          {formSettings.showVariants && (
            <div className="form-section">
              <h3 className="section-title"><Percent size={16}/> Phân loại / Biến thể</h3>
            <div className="toggle-group mb-3">
              <label className="switch">
                <input type="checkbox" checked={enableVariants} onChange={e => setEnableVariants(e.target.checked)} />
                <span className="slider round"></span>
              </label>
              <span className="toggle-label">Sản phẩm có nhiều phân loại (Màu sắc, Size...)</span>
            </div>

            {enableVariants && (
              <div className="variants-builder">
                {attributes.map((attr, index) => (
                  <div className="attribute-row card-light p-3 mb-2" key={index}>
                    <div className="form-row mb-0">
                      <div className="form-group mb-0" style={{flex: 1}}>
                        <input type="text" placeholder="Tên thuộc tính (VD: Màu sắc)" className="input-field" value={attr.name} onChange={e => handleAttributeNameChange(index, e.target.value)} />
                      </div>
                      <div className="form-group mb-0" style={{flex: 2}}>
                        <input type="text" placeholder="Giá trị phân cách bằng dấu phẩy (VD: Đỏ, Xanh, Vàng)" className="input-field" value={attributeTexts[index] ?? attr.values.join(', ')} onChange={e => handleAttributeValuesTextChange(index, e.target.value)} onBlur={() => handleAttributeValuesBlur(index)} />
                      </div>
                      <button type="button" className="btn-icon delete mt-1" onMouseDown={(e) => { e.preventDefault(); removeAttribute(index); }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {attributes.length < 2 && (
                  <button type="button" className="btn-secondary mt-2 mb-4" onClick={handleAddAttribute}>
                    <Plus size={16} className="mr-1"/> Thêm thuộc tính
                  </button>
                )}

                {variants.length > 0 && (
                  <div className="variants-table-wrapper">
                    <h4>Danh sách biến thể ({variants.length})</h4>
                    <table className="data-table variants-table">
                      <thead>
                        <tr>
                          <th>Biến thể</th>
                          <th width="120">Giá riêng</th>
                          {trackInventory && <th width="100">Tồn kho</th>}
                          <th width="120">Mã vạch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v, i) => (
                          <tr key={i}>
                            <td>{Object.values(v.attributesObj).join(' - ')}</td>
                            <td><input type="number" min="0" onKeyDown={preventInvalidNumber} className="input-field-sm" placeholder={price} value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} /></td>
                            {trackInventory && <td><input type="number" min="0" onKeyDown={preventInvalidNumber} className="input-field-sm" placeholder="0" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} /></td>}
                            <td><input type="text" className="input-field-sm" placeholder="Mã..." value={v.barcode} onChange={e => updateVariant(i, 'barcode', e.target.value)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* Section: Website & Upsell (US-35, US-36) */}
          {(formSettings.showWebSettings || formSettings.showUpsell || formSettings.showProductLabels) && (
            <div className="form-section">
              <h3 className="section-title"><Package size={16}/> Cài đặt mở rộng</h3>
              {formSettings.showWebSettings && (
                <div className="toggle-group mb-3">
                  <label className="switch">
                    <input type="checkbox" checked={showOnWeb} onChange={e => setShowOnWeb(e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                  <span className="toggle-label">Hiển thị sản phẩm trên Website</span>
                </div>
              )}

              {formSettings.showProductLabels && (
                <div className="form-group">
                  <label>Nhãn dán sản phẩm</label>
                  <div className="category-chips">
                    <div className="chip">HOT</div>
                    <div className="chip">MỚI</div>
                    <div className="chip">SALE</div>
                  </div>
                </div>
              )}

              {formSettings.showUpsell && (
                <div className="form-group">
                  <label>Sản phẩm bán kèm (Upsell)</label>
                  <select 
                    className="input-field" 
                    onChange={e => {
                      if (e.target.value && !upsellIds.includes(e.target.value)) {
                        setUpsellIds([...upsellIds, e.target.value]);
                      }
                      e.target.value = '';
                    }}
                  >
                    <option value="">-- Chọn sản phẩm bán kèm --</option>
                    {/* Ideally pass products list down here, but hardcoding option or using global context */}
                    <option value="test_product_1">Ví dụ: Ly trà đá</option>
                    <option value="test_product_2">Ví dụ: Khăn lạnh</option>
                  </select>
                  {upsellIds.length > 0 && (
                    <div className="category-chips mt-2">
                      {upsellIds.map(id => (
                        <div key={id} className="chip active" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                          {id === 'test_product_1' ? 'Ly trà đá' : id === 'test_product_2' ? 'Khăn lạnh' : 'Sản phẩm đã chọn'}
                          <X size={12} onClick={() => setUpsellIds(upsellIds.filter(pid => pid !== id))} style={{cursor: 'pointer'}} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </form>

        <div className="modal-footer-fixed">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Hủy</button>
          <button type="submit" className="btn-primary" form="product-form" disabled={loading}>
            {loading ? 'Đang lưu...' : (product ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm')}
          </button>
        </div>
      </div>

      <ProductSettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        onSave={(newSettings) => setFormSettings(newSettings)}
      />
    </div>
  );
}
