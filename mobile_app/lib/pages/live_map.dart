import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class LiveMapPage extends StatelessWidget {
  final List<Map<String, dynamic>> devices;

  const LiveMapPage({super.key, required this.devices});

  Color _getMarkerColor(String status) {
    switch (status.toUpperCase()) {
      case 'SAFE': return const Color(0xFF10B981);
      case 'RISKY': return const Color(0xFFF59E0B);
      case 'DANGER': return const Color(0xFFEF4444);
      default: return Colors.cyanAccent;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Default center point
    final defaultPos = LatLng(37.7749, -122.4194);

    // Build markers from active device list
    final List<Marker> markers = devices
        .where((d) => d['last_latitude'] != null && d['last_longitude'] != null)
        .map((d) {
          final lat = d['last_latitude'] as double;
          final lng = d['last_longitude'] as double;
          final color = _getMarkerColor(d['status']);
          
          return Marker(
            point: LatLng(lat, lng),
            width: 80,
            height: 80,
            child: GestureDetector(
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  backgroundColor: const Color(0xFF151C2C),
                  shape: const RoundedRectangleBorder(
                    borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  ),
                  builder: (context) => Container(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            Text(
                              d['name'] ?? 'Flood Node',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: color.withOpacity(0.1),
                                border: Border.all(color: color),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                d['status'],
                                style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                            ),
                          ],
                        ),
                        const Divider(color: Colors.white10, height: 24),
                        Text('Device ID: ${d['device_id']}', style: const TextStyle(color: Colors.white70)),
                        const SizedBox(height: 6),
                        Text('Latitude: $lat', style: const TextStyle(color: Colors.white70)),
                        const SizedBox(height: 6),
                        Text('Longitude: $lng', style: const TextStyle(color: Colors.white70)),
                        const SizedBox(height: 6),
                        Text('Last Active: ${DateTime.parse(d['last_seen']).toLocal()}', style: const TextStyle(color: Colors.white70)),
                      ],
                    ),
                  ),
                );
              },
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Outer glowing rings
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.2),
                      shape: BoxShape.circle,
                      border: Border.all(color: color.withOpacity(0.4), width: 1.5),
                    ),
                  ),
                  // Inner solid marker dot
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                  ),
                ],
              ),
            ),
          );
        })
        .toList();

    return Scaffold(
      body: FlutterMap(
        options: MapOptions(
          initialCenter: markers.isNotEmpty ? markers.first.point : defaultPos,
          initialZoom: 13.0,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            subdomains: const ['a', 'b', 'c', 'd'],
            userAgentPackageName: 'com.smartfloodsystem.app',
          ),
          MarkerLayer(markers: markers),
        ],
      ),
    );
  }
}
