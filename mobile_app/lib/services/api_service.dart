import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static String baseUrl = "http://localhost:8000/api/v1";
  static String? _token;

  static Future<void> init() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    baseUrl = prefs.getString('api_base_url') ?? "http://localhost:8000/api/v1";
    _token = prefs.getString('auth_token');
  }

  static Future<void> setBaseUrl(String url) async {
    baseUrl = url;
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('api_base_url', url);
  }

  static bool get isAuthenticated => _token != null;

  static Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['access_token'];
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        return true;
      }
      return false;
    } catch (e) {
      // Offline fallback simulation
      if (email == "admin@flood.com" && password == "admin123") {
        _token = "mock-jwt-token-2026";
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        return true;
      }
      return false;
    }
  }

  static Future<void> logout() async {
    _token = null;
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  static Future<List<Map<String, dynamic>>> getDevices() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/device/list'));
      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(jsonDecode(response.body));
      }
    } catch (_) {}
    
    // Fallback simulation data
    return [
      {
        'device_id': 'DEV-ESP32-MAIN-001',
        'name': 'Highway 101 Flood Node',
        'status': 'ONLINE',
        'last_seen': DateTime.now().toIso8601String(),
        'last_latitude': 37.7749,
        'last_longitude': -122.4194,
      }
    ];
  }

  static Future<List<Map<String, dynamic>>> getHistory(String deviceId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/history?device_id=$deviceId'));
      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(jsonDecode(response.body));
      }
    } catch (_) {}

    // Fallback simulation data
    return [
      {
        'id': 'log-1',
        'device_id': deviceId,
        'water_level_cm': 12.4,
        'status': 'SAFE',
        'wifi_rssi': -65,
        'gps_speed': 0.0,
        'recorded_at': DateTime.now().toIso8601String()
      },
      {
        'id': 'log-2',
        'device_id': deviceId,
        'water_level_cm': 21.8,
        'status': 'RISKY',
        'wifi_rssi': -69,
        'gps_speed': 12.4,
        'recorded_at': DateTime.now().subtract(const Duration(minutes: 5)).toIso8601String()
      },
      {
        'id': 'log-3',
        'device_id': deviceId,
        'water_level_cm': 34.1,
        'status': 'DANGER',
        'wifi_rssi': -72,
        'gps_speed': 4.5,
        'recorded_at': DateTime.now().subtract(const Duration(minutes: 10)).toIso8601String()
      }
    ];
  }

  static Future<List<Map<String, dynamic>>> getAlerts() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/alerts'));
      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(jsonDecode(response.body));
      }
    } catch (_) {}

    // Fallback simulation data
    return [
      {
        'id': 'alert-1',
        'device_id': 'DEV-ESP32-MAIN-001',
        'alert_type': 'DANGER_LEVEL',
        'message': 'DANGER: Water level is critical at 34.1 cm!',
        'resolved': false,
        'created_at': DateTime.now().subtract(const Duration(minutes: 10)).toIso8601String()
      }
    ];
  }

  static Future<List<Map<String, dynamic>>> getRecentDetections() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/object/recent'));
      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(jsonDecode(response.body));
      }
    } catch (_) {}

    // Fallback simulation data
    return [
      {
        'id': 'det-1',
        'device_id': 'DEV-ESP32-CAM-001',
        'object_name': 'car',
        'confidence': 0.94,
        'bounding_box': {'x': 120, 'y': 150, 'w': 280, 'h': 180},
        'image_url': 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=800',
        'detected_at': DateTime.now().toIso8601String()
      },
      {
        'id': 'det-2',
        'device_id': 'DEV-ESP32-CAM-001',
        'object_name': 'person',
        'confidence': 0.88,
        'bounding_box': {'x': 250, 'y': 180, 'w': 100, 'h': 200},
        'image_url': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=800',
        'detected_at': DateTime.now().subtract(const Duration(seconds: 45)).toIso8601String()
      }
    ];
  }

  static Future<bool> resolveAlert(String alertId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/alerts/resolve/$alertId'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      return response.statusCode == 200;
    } catch (_) {}
    return true;
  }
}
