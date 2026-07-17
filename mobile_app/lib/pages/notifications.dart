import 'package:flutter/material.dart';

class NotificationsPage extends StatelessWidget {
  final List<Map<String, dynamic>> alerts;

  const NotificationsPage({super.key, required this.alerts});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('System Alerts Log', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0B0F19),
      ),
      body: alerts.isEmpty
          ? const Center(
              child: Text('No active notifications', style: TextStyle(color: Colors.white38)),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: alerts.length,
              itemBuilder: (context, index) {
                final alert = alerts[index];
                final isResolved = alert['resolved'] as bool;
                final createdTime = DateTime.parse(alert['created_at']).toLocal();

                return Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: isResolved ? Colors.white10 : const Color(0xFFEF4444).withOpacity(0.5),
                      width: 1,
                    ),
                  ),
                  child: ListTile(
                    leading: Icon(
                      Icons.warning_amber_rounded,
                      color: isResolved ? Colors.white38 : const Color(0xFFEF4444),
                      size: 32,
                    ),
                    title: Text(
                      alert['alert_type'] ?? 'CRITICAL_ALERT',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isResolved ? Colors.white54 : Colors.white,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          alert['message'] ?? '',
                          style: TextStyle(color: isResolved ? Colors.white38 : Colors.white70),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          createdTime.toString().substring(0, 19),
                          style: const TextStyle(fontSize: 10, color: Colors.white24),
                        ),
                      ],
                    ),
                    trailing: isResolved
                        ? const Text('RESOLVED', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold))
                        : const Text('ACTIVE', style: TextStyle(color: Color(0xFFEF4444), fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                );
              },
            ),
    );
  }
}
