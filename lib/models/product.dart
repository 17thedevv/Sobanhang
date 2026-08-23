class Product {
  final String id;
  final String name;
  final String unit;
  final double price;
  final double? cost;
  final String? code;
  final String? categoryId;
  final int stock;

  Product({
    required this.id,
    required this.name,
    this.unit = 'Cái',
    required this.price,
    this.cost,
    this.code,
    this.categoryId,
    this.stock = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'unit': unit,
      'price': price,
      'cost': cost,
      'code': code,
      'categoryId': categoryId,
      'stock': stock,
    };
  }

  factory Product.fromMap(Map<String, dynamic> map, String id) {
    return Product(
      id: id,
      name: map['name'] ?? '',
      unit: map['unit'] ?? 'Cái',
      price: (map['price'] ?? 0).toDouble(),
      cost: map['cost']?.toDouble(),
      code: map['code'],
      categoryId: map['categoryId'],
      stock: map['stock'] ?? 0,
    );
  }
}
