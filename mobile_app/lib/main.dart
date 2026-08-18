import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'pages/splash.dart';
import 'pages/login.dart';
import 'pages/dashboard.dart';
import 'pages/settings.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService.init();
  runApp(const SmartFloodApp());
}

class SmartFloodApp extends StatelessWidget {
  const SmartFloodApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Flood Guard',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19), // Deep midnight space blue
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00E5FF),      // Neon Cyan
          secondary: Color(0xFF4FACFE),    // Electric Blue
          surface: Color(0xFF151C2C),      // Glass card fill
          error: Color(0xFFEF4444),        // Hot Red
        ),
        textTheme: const TextTheme(
          titleLarge: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold),
          bodyLarge: TextStyle(fontFamily: 'Outfit'),
        ),
        cardTheme: const CardTheme(
          color: Color(0xFF151C2C),
          elevation: 4,
          margin: EdgeInsets.all(8),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashPage(),
        '/login': (context) => const LoginPage(),
        '/dashboard': (context) => const DashboardPage(),
        '/settings': (context) => const SettingsPage(),
      },
    );
  }
}
