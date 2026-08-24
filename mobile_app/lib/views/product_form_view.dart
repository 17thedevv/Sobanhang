import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../models/product.dart';
import '../viewmodels/product_viewmodel.dart';

class ProductFormView extends StatefulWidget {
  final Product? product;
  const ProductFormView({Key? key, this.product}) : super(key: key);

  @override
  State<ProductFormView> createState() => _ProductFormViewState();
}

class _ProductFormViewState extends State<ProductFormView> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameCtrl;
  late TextEditingController _priceCtrl;
  late TextEditingController _unitCtrl;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.product?.name ?? '');
    _priceCtrl = TextEditingController(text: widget.product?.price.toString() ?? '');
    _unitCtrl = TextEditingController(text: widget.product?.unit ?? 'Cái');
  }

  void _save() {
    if (_formKey.currentState!.validate()) {
      final viewModel = Provider.of<ProductViewModel>(context, listen: false);
      final product = Product(
        id: widget.product?.id ?? const Uuid().v4(),
        name: _nameCtrl.text,
        price: double.tryParse(_priceCtrl.text) ?? 0,
        unit: _unitCtrl.text,
      );

      if (widget.product == null) {
        viewModel.addProduct(product);
      } else {
        viewModel.updateProduct(product);
      }
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.product == null ? 'Tạo sản phẩm' : 'Sửa sản phẩm'),
        actions: [
          TextButton(
            onPressed: _save,
            child: const Text('LƯU', style: TextStyle(color: Color(0xFF00B14F), fontWeight: FontWeight.bold)),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Tên sản phẩm *'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(hintText: 'Nhập tên sản phẩm'),
                validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập tên' : null,
              ),
              const SizedBox(height: 16),
              const Text('Đơn vị cơ bản'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _unitCtrl,
                decoration: const InputDecoration(hintText: 'Cái, Hộp, Thùng...'),
              ),
              const SizedBox(height: 16),
              const Text('Giá bán *'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _priceCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(hintText: '0', suffixText: 'đ'),
                validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập giá' : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
