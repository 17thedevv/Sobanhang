import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
// import 'package:firebase_core/firebase_core.dart';
import 'views/login_view.dart';
import 'utils/theme.dart';
import 'viewmodels/product_viewmodel.dart';
import 'viewmodels/cart_viewmodel.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // await Firebase.initializeApp();
  runApp(const SoBanHangApp());
}

class SoBanHangApp extends StatelessWidget {
  const SoBanHangApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ProductViewModel()),
        ChangeNotifierProvider(create: (_) => CartViewModel()),
      ],
      child: MaterialApp(
        title: 'Sổ Bán Hàng',
        theme: appTheme(),
        home: const LoginView(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
