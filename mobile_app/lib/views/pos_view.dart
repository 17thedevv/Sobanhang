import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/product_viewmodel.dart';
import '../viewmodels/cart_viewmodel.dart';
import 'checkout_view.dart';

class POSView extends StatelessWidget {
  const POSView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bán hàng'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () {},
          ),
        ],
      ),
      body: Consumer<ProductViewModel>(
        builder: (context, productVM, child) {
          final products = productVM.products;
          if (products.isEmpty) {
            return const Center(
              child: Text('Chưa có sản phẩm. Vui lòng thêm sản phẩm trước.'),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(12),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.8,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              return Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Colors.grey,
                          borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
                        ),
                        child: const Icon(Icons.image, size: 48, color: Colors.white),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(product.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 4),
                          Text('${product.price}đ', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00B14F))),
                          const SizedBox(height: 8),
                          Consumer<CartViewModel>(
                            builder: (context, cartVM, child) {
                              final cartItem = cartVM.items[product.id];
                              final quantity = cartItem?.quantity ?? 0;
                              return Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  if (quantity > 0)
                                    IconButton(
                                      icon: const Icon(Icons.remove_circle_outline),
                                      onPressed: () => cartVM.removeItem(product.id),
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(),
                                    )
                                  else
                                    const SizedBox(width: 24),
                                  
                                  if (quantity > 0)
                                    Text('$quantity', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  
                                  IconButton(
                                    icon: const Icon(Icons.add_circle, color: Color(0xFF00B14F)),
                                    onPressed: () => cartVM.addItem(product),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                  ),
                                ],
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
      bottomNavigationBar: Consumer<CartViewModel>(
        builder: (context, cartVM, child) {
          if (cartVM.itemCount == 0) return const SizedBox.shrink();
          
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Stack(
                    alignment: Alignment.topRight,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(right: 8.0, top: 8.0),
                        child: Icon(Icons.shopping_cart_outlined, size: 32),
                      ),
                      CircleAvatar(
                        radius: 10,
                        backgroundColor: Colors.red,
                        child: Text('${cartVM.itemCount}', style: const TextStyle(fontSize: 12, color: Colors.white)),
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      '${cartVM.totalAmount}đ',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF00B14F)),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const CheckoutView()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(120, 48),
                    ),
                    child: const Text('THANH TOÁN'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
