import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Edit2, Trash2, PackageSearch } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import './Products.css';

export default function Products() {
  const { products, deleteProduct } = useApp();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || (p.barcode && p.barcode.toLowerCase().includes(term));
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCopy = (product) => {
    const copiedProduct = {
      ...product,
      id: undefined, // ensure it's a new product
      name: `${product.name} - copy`
    };
    setEditingProduct(copiedProduct);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Sản phẩm</h1>
          <p className="page-subtitle">Quản lý danh sách sản phẩm và kho hàng</p>
        </div>
        <button className="btn-primary" onClick={handleAddNew}>
          <Plus size={20} />
          Tạo sản phẩm
        </button>
      </header>

      <div className="card products-card">
        <div className="search-bar">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon glass">
              <PackageSearch size={40} className="text-muted" />
            </div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Bấm "Tạo sản phẩm" để thêm mặt hàng đầu tiên của bạn.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Tồn kho</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const totalStock = product.variants?.length 
                    ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0) 
                    : (product.stock || 0);
                  
                  return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-image-placeholder">
                        <PackageSearch size={24} color="#ccc" />
                      </div>
                    </td>
                    <td className="font-medium">
                      {product.name}
                      {product.variants?.length > 0 && <div className="text-sm text-muted">{product.variants.length} phân loại</div>}
                    </td>
                    <td>{product.category?.name || '---'}</td>
                    <td className="text-primary font-medium">
                      {product.promotionalPrice ? (
                        <>
                          <div>{product.promotionalPrice.toLocaleString('vi-VN')}đ</div>
                          <div className="text-sm text-muted" style={{textDecoration: 'line-through'}}>{product.price.toLocaleString('vi-VN')}đ</div>
                        </>
                      ) : (
                        <>{product.price.toLocaleString('vi-VN')}đ</>
                      )}
                    </td>
                    <td>{product.trackInventory ? `${totalStock} ${product.unit}` : 'Không theo dõi'}</td>
                    <td className="actions-cell">
                      <button className="btn-icon" onClick={() => handleEdit(product)}>
                        <Edit2 size={18} />
                      </button>
                      <button className="btn-icon text-danger" onClick={() => deleteProduct(product.id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onCopy={handleCopy}
        />
      )}
    </div>
  );
}
