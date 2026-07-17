import 'package:flutter/material.dart';

class HistoryPage extends StatefulWidget {
  final List<Map<String, dynamic>> statusLogs;

  const HistoryPage({super.key, required this.statusLogs});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  String _activeFilter = 'ALL';

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'SAFE': return const Color(0xFF10B981);
      case 'RISKY': return const Color(0xFFF59E0B);
      case 'DANGER': return const Color(0xFFEF4444);
      default: return Colors.cyanAccent;
    }
  }

  @override
  Widget build(BuildContext context) {
    // Filter the records based on the selection
    final filteredLogs = widget.statusLogs.where((log) {
      if (_activeFilter == 'ALL') return true;
      return log['status'].toString().toUpperCase() == _activeFilter;
    }).toList();

    return Scaffold(
      body: Column(
        children: [
          // Filter Choice Chips row
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 8.0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['ALL', 'SAFE', 'RISKY', 'DANGER'].map((filter) {
                  final isSelected = _activeFilter == filter;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4.0),
                    child: ChoiceChip(
                      label: Text(filter),
                      selected: isSelected,
                      selectedColor: const Color(0xFF00E5FF).withOpacity(0.2),
                      checkmarkColor: const Color(0xFF00E5FF),
                      labelStyle: TextStyle(
                        color: isSelected ? const Color(0xFF00E5FF) : Colors.white70,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                      onSelected: (selected) {
                        if (selected) {
                          setState(() {
                            _activeFilter = filter;
                          });
                        }
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // Logs List
          Expanded(
            child: filteredLogs.isEmpty
                ? const Center(
                    child: Text('No history logs match this filter', style: TextStyle(color: Colors.white30)),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    itemCount: filteredLogs.length,
                    itemBuilder: (context, index) {
                      final log = filteredLogs[index];
                      final status = log['status'] as String;
                      final level = log['water_level_cm'] as double;
                      final timeStr = log['recorded_at'] as String;
                      final formattedTime = DateTime.parse(timeStr).toLocal().toString().substring(0, 19);

                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.between,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Level: ${level.toStringAsFixed(1)} cm',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    formattedTime,
                                    style: const TextStyle(fontSize: 11, color: Colors.white38),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: _getStatusColor(status).withOpacity(0.1),
                                  border: Border.all(color: _getStatusColor(status).withOpacity(0.4)),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  status.toUpperCase(),
                                  style: TextStyle(
                                    color: _getStatusColor(status),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
