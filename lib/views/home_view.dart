import 'package:flutter/material.dart';
import 'pos_view.dart';
import 'product_list_view.dart';

class HomeView extends StatefulWidget {
  const HomeView({Key? key}) : super(key: key);

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const DashboardTab(),
    const Center(child: Text('Đơn hàng')), // TODO: Orders Tab
    const ProductListView(),
    const Center(child: Text('Thêm')),     // TODO: More Tab
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: const Color(0xFF00B14F),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Tổng quan',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            activeIcon: Icon(Icons.receipt_long),
            label: 'Đơn hàng',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_2_outlined),
            activeIcon: Icon(Icons.inventory_2),
            label: 'Sản phẩm',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.more_horiz),
            label: 'Thêm',
          ),
        ],
      ),
      floatingActionButton: _selectedIndex == 0
          ? FloatingActionButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const POSView()),
                );
              },
              backgroundColor: const Color(0xFF00B14F),
              child: const Icon(Icons.add),
            )
          : null,
    );
  }
}

class DashboardTab extends StatelessWidget {
  const DashboardTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Xin chào, Cửa Hàng'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'HÔM NAY',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.calendar_today, size: 16),
                  label: const Text('Hôm nay'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildSummaryCard(
                    'Doanh thu',
                    '0',
                    Icons.monetization_on,
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildSummaryCard(
                    'Đơn hàng',
                    '0',
                    Icons.shopping_bag,
                    Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _buildSummaryCard(
              'Lợi nhuận',
              '0',
              Icons.trending_up,
              Colors.green,
              isFullWidth: true,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(
      String title, String value, IconData icon, Color color,
      {bool isFullWidth = false}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: color),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
