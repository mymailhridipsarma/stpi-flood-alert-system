import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'live_map.dart';
import 'camera_feed.dart';
import 'history.dart';
import 'emergency_contacts.dart';
import 'notifications.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _currentIndex = 0;
  List<Map<String, dynamic>> _devices = [];
  List<Map<String, dynamic>> _statusLogs = [];
  List<Map<String, dynamic>> _alerts = [];
  List<Map<String, dynamic>> _detections = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    if (mounted) setState(() => _isLoading = true);
    
    final devList = await ApiService.getDevices();
    final devId = devList.isNotEmpty ? devList[0]['device_id'] : 'DEV-ESP32-MAIN-001';
    
    final logs = await ApiService.getHistory(devId);
    final alertList = await ApiService.getAlerts();
    final detList = await ApiService.getRecentDetections();

    if (mounted) {
      setState(() {
        _devices = devList;
        _statusLogs = logs;
        _alerts = alertList;
        _detections = detList;
        _isLoading = false;
      });
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'SAFE': return const Color(0xFF10B981);
      case 'RISKY': return const Color(0xFFF59E0B);
      case 'DANGER': return const Color(0xFFEF4444);
      default: return Colors.cyanAccent;
    }
  }

  Widget _buildOverviewTab() {
    final latestLog = _statusLogs.isNotEmpty ? _statusLogs[0] : {
      'water_level_cm': 12.4,
      'status': 'SAFE',
      'wifi_rssi': -65,
      'gps_speed': 0.0,
      'recorded_at': DateTime.now().toIso8601String()
    };

    final activeAlerts = _alerts.where((a) => a['resolved'] == false).toList();

    return RefreshIndicator(
      onRefresh: _fetchStats,
      color: const Color(0xFF00E5FF),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Summary Header Card
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    const Text(
                      'SYSTEM INTEGRITY STATUS',
                      style: TextStyle(fontSize: 12, color: Colors.white70, letterSpacing: 1.0, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      latestLog['status'].toUpperCase(),
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: _getStatusColor(latestLog['status']),
                        shadows: [
                          Shadow(
                            blurRadius: 10.0,
                            color: _getStatusColor(latestLog['status']).withOpacity(0.3),
                            offset: const Offset(0, 0),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Water Level Depth: ${latestLog['water_level_cm'].toStringAsFixed(1)} cm',
                      style: const TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Metrics Cards Grid (Custom Layout)
            Row(
              children: [
                Expanded(
                  child: _buildMetricItem(
                    title: 'Active Alerts',
                    value: activeAlerts.length.toString(),
                    icon: Icons.shield_alert,
                    color: activeAlerts.isNotEmpty ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                  ),
                ),
                Expanded(
                  child: _buildMetricItem(
                    title: 'Wifi Strength',
                    value: '${latestLog['wifi_rssi']} dBm',
                    icon: Icons.wifi,
                    color: (latestLog['wifi_rssi'] as int) > -70 ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: _buildMetricItem(
                    title: 'GPS Status',
                    value: latestLog['gps_speed'] > 0 ? '${latestLog['gps_speed'].toStringAsFixed(1)} km/h' : 'Stationary',
                    icon: Icons.gps_fixed,
                    color: const Color(0xFF00E5FF),
                  ),
                ),
                Expanded(
                  child: _buildMetricItem(
                    title: 'Detections Today',
                    value: _detections.length.toString(),
                    icon: Icons.camera_alt_outlined,
                    color: const Color(0xFF4FACFE),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Dynamic Recent Alerts Header
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
              child: Text(
                'Active Critical Alerts',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ),

            if (activeAlerts.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(24.0),
                  child: Center(
                    child: Text('All systems operating normally.', style: TextStyle(color: Colors.white70)),
                  ),
                ),
              )
            else
              ...activeAlerts.map((alert) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: Color(0xFFEF4444), width: 1),
                ),
                child: ListTile(
                  leading: const Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 36),
                  title: Text(alert['alert_type'], style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(alert['message'], style: const TextStyle(color: Colors.white70)),
                  trailing: IconButton(
                    icon: const Icon(Icons.check_circle_outline, color: Colors.green),
                    onPressed: () async {
                      bool ok = await ApiService.resolveAlert(alert['id']);
                      if (ok) _fetchStats();
                    },
                  ),
                ),
              )),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricItem({required String title, required String value, required IconData icon, required Color color}) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, color: Colors.white60, fontWeight: FontWeight.bold)),
                Icon(icon, color: color, size: 20),
              ],
            ),
            const SizedBox(height: 12),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> tabs = [
      _buildOverviewTab(),
      LiveMapPage(devices: _devices),
      CameraFeedPage(detections: _detections),
      HistoryPage(statusLogs: _statusLogs),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Flood Guard Console', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0B0F19),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF00E5FF)),
            onPressed: _fetchStats,
          ),
        ],
      ),
      drawer: Drawer(
        backgroundColor: const Color(0xFF0B0F19),
        child: Column(
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: Color(0xFF151C2C)),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.waves, size: 50, color: Color(0xFF00E5FF)),
                    const SizedBox(height: 10),
                    const Text('Smart Flood Guard', style: TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
                    Text('Node Control Hub', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5))),
                  ],
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.contacts, color: Colors.cyanAccent),
              title: const Text('Emergency Contacts'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (context) => const EmergencyContactsPage()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.notifications_active_outlined, color: Colors.cyanAccent),
              title: const Text('System Alerts'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (context) => NotificationsPage(alerts: _alerts)));
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings, color: Colors.cyanAccent),
              title: const Text('Console Settings'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/settings');
              },
            ),
            const Spacer(),
            const Divider(color: Colors.white10),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text('Sign Out'),
              onTap: () async {
                await ApiService.logout();
                if (mounted) Navigator.pushReplacementNamed(context, '/login');
              },
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF00E5FF)))
        : tabs[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xFF151C2C),
        selectedItemColor: const Color(0xFF00E5FF),
        unselectedItemColor: Colors.white54,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Overview'),
          BottomNavigationBarItem(icon: Icon(Icons.map_outlined), activeIcon: Icon(Icons.map), label: 'Live Map'),
          BottomNavigationBarItem(icon: Icon(Icons.camera_alt_outlined), activeIcon: Icon(Icons.camera_alt), label: 'Camera'),
          BottomNavigationBarItem(icon: Icon(Icons.history_outlined), activeIcon: Icon(Icons.history), label: 'History'),
        ],
      ),
    );
  }
}
