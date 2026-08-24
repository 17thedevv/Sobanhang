import 'package:flutter/material.dart';

class InvoiceView extends StatelessWidget {
  final double totalAmount;
  final bool isDebt;
  final String paymentMethod;

  const InvoiceView({
    Key? key,
    required this.totalAmount,
    required this.isDebt,
    required this.paymentMethod,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isDebt ? 'Hóa Đơn Tạm Tính' : 'Hóa Đơn Bán Hàng'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Icon(Icons.check_circle, color: Color(0xFF00B14F), size: 64),
            const SizedBox(height: 16),
            Text(
              isDebt ? 'TẠO ĐƠN GHI NỢ THÀNH CÔNG' : 'THANH TOÁN THÀNH CÔNG',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
              ),
              child: Column(
                children: [
                  Text(
                    '${totalAmount}đ',
                    style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold),
                  ),
                  const Divider(height: 32),
                  _buildInvoiceRow('Khách hàng', 'Khách lẻ'),
                  const SizedBox(height: 12),
                  _buildInvoiceRow('Trạng thái', isDebt ? 'Chưa thanh toán' : 'Đã thanh toán'),
                  const SizedBox(height: 12),
                  if (!isDebt) _buildInvoiceRow('Nguồn tiền', paymentMethod),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildActionButton(Icons.print, 'In hóa đơn', () {}),
                _buildActionButton(Icons.share, 'Chia sẻ', () {}),
              ],
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: () {
              Navigator.pop(context); // Go back to POS
            },
            child: const Text('TẠO ĐƠN MỚI'),
          ),
        ),
      ),
    );
  }

  Widget _buildInvoiceRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildActionButton(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: const Color(0xFF00B14F).withOpacity(0.1),
            child: Icon(icon, color: const Color(0xFF00B14F)),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
