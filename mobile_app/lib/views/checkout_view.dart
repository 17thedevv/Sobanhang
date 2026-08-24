import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/cart_viewmodel.dart';
import 'invoice_view.dart';

class CheckoutView extends StatefulWidget {
  const CheckoutView({Key? key}) : super(key: key);

  @override
  State<CheckoutView> createState() => _CheckoutViewState();
}

class _CheckoutViewState extends State<CheckoutView> {
  bool _isDebt = false;
  String _selectedPaymentMethod = 'Tiền mặt';

  void _confirmCheckout() {
    // In MVP, we just navigate to Invoice view
    final cartVM = Provider.of<CartViewModel>(context, listen: false);
    final total = cartVM.totalAmount;
    
    // Clear cart and go to invoice
    cartVM.clear();
    
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => InvoiceView(
          totalAmount: total,
          isDebt: _isDebt,
          paymentMethod: _selectedPaymentMethod,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thanh toán'),
      ),
      body: Consumer<CartViewModel>(
        builder: (context, cartVM, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Tổng tiền', style: TextStyle(fontSize: 16, color: Colors.grey)),
                const SizedBox(height: 8),
                Text(
                  '${cartVM.totalAmount}đ',
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF00B14F)),
                ),
                const SizedBox(height: 32),
                
                SwitchListTile(
                  title: const Text('Ghi nợ đơn này', style: TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: const Text('Khách hàng sẽ thanh toán sau'),
                  value: _isDebt,
                  onChanged: (val) {
                    setState(() {
                      _isDebt = val;
                    });
                  },
                  contentPadding: EdgeInsets.zero,
                ),
                const Divider(),
                
                if (!_isDebt) ...[
                  const SizedBox(height: 16),
                  const Text('Nguồn tiền nhận', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _buildPaymentOption('Tiền mặt', Icons.money),
                  const SizedBox(height: 8),
                  _buildPaymentOption('Chuyển khoản (Ngân hàng)', Icons.account_balance),
                ],
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: _confirmCheckout,
            child: Text(_isDebt ? 'TẠO ĐƠN GHI NỢ' : 'XÁC NHẬN THU TIỀN'),
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentOption(String title, IconData icon) {
    final isSelected = _selectedPaymentMethod == title;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedPaymentMethod = title;
        });
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: isSelected ? const Color(0xFF00B14F) : Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
          color: isSelected ? const Color(0xFF00B14F).withOpacity(0.05) : Colors.white,
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? const Color(0xFF00B14F) : Colors.grey),
            const SizedBox(width: 12),
            Text(title, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
            const Spacer(),
            if (isSelected) const Icon(Icons.check_circle, color: Color(0xFF00B14F)),
          ],
        ),
      ),
    );
  }
}
