import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Share2, DollarSign, Calendar, FileText, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

export default function CustomerDebtDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null); // Optional: if paying specific debt

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`/api/debt/customers/${customerId}/transactions`);
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [customerId]);

  const activeDebts = transactions.filter(t => t.type === 'DEBT' && t.balance > 0);
  
  let totalReceivable = 0;
  let totalPayable = 0;

  activeDebts.forEach(t => {
    if (t.direction === 'GAVE') totalReceivable += t.balance;
    if (t.direction === 'RECEIVED') totalPayable += t.balance;
  });

  const netDebt = totalReceivable - totalPayable;
  const isReceivable = netDebt > 0;
  const isPayable = netDebt < 0;

  const handleShare = () => {
    alert('Tính năng chia sẻ đang phát triển');
  };

  const handleOpenPayment = () => {
    if (activeDebts.length === 1) {
      setSelectedDebt(activeDebts[0]);
    } else {
      setSelectedDebt(null); // Allow user to choose or handle FIFO
    }
    setShowPaymentModal(true);
  };

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <header className="page-header d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button className="btn-icon me-2" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="page-title mb-0">Chi tiết công nợ</h1>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={handleShare}>
          <Share2 size={16} /> <span className="ms-1">Chia sẻ</span>
        </button>
      </header>

      {/* Overview Card */}
      <div className="card p-4 mb-4 text-center">
        <h5 className="text-muted mb-2">
          {isReceivable ? 'TÔI PHẢI THU' : isPayable ? 'TÔI PHẢI TRẢ' : 'ĐÃ TẤT TOÁN'}
        </h5>
        <h1 className={`mb-3 ${isReceivable ? 'text-success' : isPayable ? 'text-danger' : 'text-muted'}`}>
          {Math.abs(netDebt).toLocaleString('vi-VN')}đ
        </h1>
        {netDebt !== 0 && (
          <button className="btn btn-primary" onClick={handleOpenPayment}>
            Thanh toán
          </button>
        )}
      </div>

      <h5 className="mb-3">Lịch sử giao dịch</h5>
      
      {loading ? (
        <div className="text-center py-4 text-muted">Đang tải...</div>
      ) : transactions.length === 0 ? (
        <div className="card p-4 text-center text-muted">Chưa có giao dịch nào</div>
      ) : (
        <div className="transactions-list">
          {transactions.map(t => {
            const isGave = t.direction === 'GAVE';
            const isPayment = t.type === 'PAYMENT';
            
            // Logic to display signs
            let amountDisplay = '';
            let colorClass = '';
            
            if (!isPayment) {
              amountDisplay = (isGave ? '+' : '-') + t.amount.toLocaleString('vi-VN') + 'đ';
              colorClass = isGave ? 'text-success' : 'text-danger';
            } else {
              // It's a payment
              amountDisplay = (isGave ? '-' : '+') + t.amount.toLocaleString('vi-VN') + 'đ';
              colorClass = isGave ? 'text-danger' : 'text-success';
            }

            return (
              <div key={t.id} className="card p-3 mb-2 d-flex flex-row justify-content-between align-items-center">
                <div>
                  <div className="fw-bold">
                    {isPayment ? 'Thanh toán' : (isGave ? 'Ghi nợ (Cho vay/Bán nợ)' : 'Ghi nợ (Vay/Mua nợ)')}
                  </div>
                  <div className="text-muted small d-flex align-items-center mt-1">
                    <Calendar size={14} className="me-1" />
                    {new Date(t.transactionDate).toLocaleString('vi-VN')}
                  </div>
                  {t.note && (
                    <div className="text-muted small mt-1 d-flex align-items-center">
                      <FileText size={14} className="me-1" />
                      {t.note}
                    </div>
                  )}
                </div>
                <div className="text-end">
                  <div className={`fw-bold fs-5 ${colorClass}`}>
                    {amountDisplay}
                  </div>
                  {t.type === 'DEBT' && t.balance > 0 && (
                    <div className="text-muted small mt-1">
                      Còn nợ: {t.balance.toLocaleString('vi-VN')}đ
                    </div>
                  )}
                  {t.type === 'DEBT' && t.balance === 0 && (
                    <span className="badge bg-success mt-1">Đã trả hết</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          activeDebts={activeDebts}
          preSelectedDebt={selectedDebt}
          customerId={customerId}
          onSuccess={() => {
            setShowPaymentModal(false);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}
