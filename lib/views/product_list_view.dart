import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/product_viewmodel.dart';
import 'product_form_view.dart';

class ProductListView extends StatelessWidget {
  const ProductListView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sản phẩm'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Search
            },
          ),
        ],
      ),
      body: Consumer<ProductViewModel>(
        builder: (context, viewModel, child) {
          final products = viewModel.products;
          if (products.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text('Không có sản phẩm nào'),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ProductFormView()),
                      );
                    },
                    child: const Text('Tạo sản phẩm'),
                  )
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              return ListTile(
                leading: Container(
                  width: 48,
                  height: 48,
                  color: Colors.grey.shade200,
                  child: const Icon(Icons.image, color: Colors.grey),
                ),
                title: Text(product.name),
                subtitle: Text('Giá: ${product.price}đ - Tồn: ${product.stock}'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // TODO: View detail / Edit
                },
              );
            },
          );
        },
      ),
      floatingActionButton: Consumer<ProductViewModel>(
        builder: (context, viewModel, child) {
          if (viewModel.products.isNotEmpty) {
            return FloatingActionButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ProductFormView()),
                );
              },
              backgroundColor: const Color(0xFF00B14F),
              child: const Icon(Icons.add),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}
