import 'package:flutter/material.dart';

class CameraFeedPage extends StatefulWidget {
  final List<Map<String, dynamic>> detections;

  const CameraFeedPage({super.key, required this.detections});

  @override
  State<CameraFeedPage> createState() => _CameraFeedPageState();
}

class _CameraFeedPageState extends State<CameraFeedPage> {
  Map<String, dynamic>? _selectedDetection;

  Color _getConfidenceColor(double conf) {
    if (conf >= 0.8) return const Color(0xFF10B981); // Green
    if (conf >= 0.5) return const Color(0xFFF59E0B); // Yellow
    return const Color(0xFFEF4444); // Red
  }

  @override
  Widget build(BuildContext context) {
    final activeDet = _selectedDetection ?? 
        (widget.detections.isNotEmpty ? widget.detections.first : null);

    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Latest Snapshot Card
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.camera_alt, color: Color(0xFF00E5FF)),
                          SizedBox(width: 8),
                          Text(
                            'Active AI Camera Snapshot',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      // Image Display Area with Bounding Box overlays
                      if (activeDet != null && activeDet['image_url'] != null)
                        Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: AspectRatio(
                                aspectRatio: 16 / 9,
                                child: Image.network(
                                  activeDet['image_url'],
                                  fit: BoxFit.cover,
                                  loadingBuilder: (context, child, loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return const Center(child: CircularProgressIndicator(color: Color(0xFF00E5FF)));
                                  },
                                  errorBuilder: (context, error, stackTrace) => Container(
                                    color: Colors.black45,
                                    child: const Center(child: Icon(Icons.broken_image, size: 48, color: Colors.white24)),
                                  ),
                                ),
                              ),
                            ),
                            // Drawing Bounding Box Overlay if coordinates are present
                            if (activeDet['bounding_box'] != null)
                              Positioned.fill(
                                child: LayoutBuilder(
                                  builder: (context, constraints) {
                                    final bbox = activeDet['bounding_box'] as Map<String, dynamic>;
                                    // Scale coordinates from original image resolution (640x480)
                                    final x = (bbox['x'] as num).toDouble() / 640.0 * constraints.maxWidth;
                                    final y = (bbox['y'] as num).toDouble() / 480.0 * constraints.maxHeight;
                                    final w = (bbox['w'] ?? bbox['width'] as num).toDouble() / 640.0 * constraints.maxWidth;
                                    final h = (bbox['h'] ?? bbox['height'] as num).toDouble() / 480.0 * constraints.maxHeight;

                                    return Stack(
                                      children: [
                                        Positioned(
                                          left: x,
                                          top: y,
                                          width: w,
                                          height: h,
                                          child: Container(
                                            decoration: BoxDecoration(
                                              border: Border.all(color: const Color(0xFFEF4444), width: 2),
                                            ),
                                            child: Align(
                                              alignment: Alignment.topLeft,
                                              child: Container(
                                                color: const Color(0xFFEF4444),
                                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                                child: Text(
                                                  '${activeDet['object_name'].toUpperCase()} ${(activeDet['confidence'] * 100).toStringAsFixed(0)}%',
                                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    );
                                  },
                                ),
                              ),
                          ],
                        )
                      else
                        AspectRatio(
                          aspectRatio: 16 / 9,
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.black26,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.white10),
                            ),
                            child: const Center(
                              child: Text('No media file loaded', style: TextStyle(color: Colors.white30)),
                            ),
                          ),
                        ),
                      const SizedBox(height: 16),
                      
                      // Metrics info
                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.02),
                                border: Border.all(color: Colors.white10),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('DETECTED THREAT', style: TextStyle(fontSize: 10, color: Colors.white54)),
                                  const SizedBox(height: 4),
                                  Text(
                                    activeDet != null ? activeDet['object_name'].toUpperCase() : 'NONE',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.02),
                                border: Border.all(color: Colors.white10),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('AI CONFIDENCE', style: TextStyle(fontSize: 10, color: Colors.white54)),
                                  const SizedBox(height: 4),
                                  Text(
                                    activeDet != null ? '${(activeDet['confidence'] * 100).toStringAsFixed(1)}%' : '0%',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold, 
                                      fontSize: 16, 
                                      color: activeDet != null ? _getConfidenceColor(activeDet['confidence']) : Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Threat Detections List
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
                child: Text(
                  'Recent Detections',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              if (widget.detections.isEmpty)
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Center(child: Text('No objects detected yet', style: TextStyle(color: Colors.white70))),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: widget.detections.length,
                  itemBuilder: (context, index) {
                    final det = widget.detections[index];
                    final isSelected = activeDet != null && activeDet['id'] == det['id'];
                    
                    return Card(
                      color: isSelected ? const Color(0xFF1D283F) : const Color(0xFF151C2C),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(
                          color: isSelected ? const Color(0xFF00E5FF) : Colors.transparent,
                          width: 1,
                        ),
                      ),
                      child: ListTile(
                        onTap: () => setState(() => _selectedDetection = det),
                        leading: const Icon(Icons.car_crash_rounded, color: Colors.cyanAccent),
                        title: Text(
                          det['object_name'].toUpperCase(),
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'ID: ${det['device_id']}',
                          style: const TextStyle(fontSize: 12, color: Colors.white54),
                        ),
                        trailing: Text(
                          '${(det['confidence'] * 100).toStringAsFixed(0)}% Conf.',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: _getConfidenceColor(det['confidence']),
                          ),
                        ),
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}
