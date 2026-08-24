import 'package:flutter/material.dart';

class CashFlowView extends StatelessWidget {
  const CashFlowView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản lý nguồn tiền'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSourceCard('Tiền mặt', '2,500,000đ', Icons.money, Colors.green),
          const SizedBox(height: 12),
          _buildSourceCard('Ngân hàng', '15,000,000đ', Icons.account_balance, Colors.blue),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add new source
        },
        backgroundColor: const Color(0xFF00B14F),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildSourceCard(String name, String balance, IconData icon, Color iconColor) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: iconColor.withOpacity(0.1),
          child: Icon(icon, color: iconColor),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: const Text('Số dư hiện tại'),
        trailing: Text(balance, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF00B14F))),
      ),
    );
  }
}
