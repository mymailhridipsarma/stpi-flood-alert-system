import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final _urlController = TextEditingController();
  bool _sendPush = true;
  bool _sendSms = true;

  @override
  void initState() {
    super.initState();
    _urlController.text = ApiService.baseUrl;
  }

  void _saveSettings() async {
    if (_urlController.text.isEmpty) return;
    
    await ApiService.setBaseUrl(_urlController.text.trim());
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Settings saved successfully!'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Console Settings', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0B0F19),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // API Settings Card
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.cloud_sync, color: Color(0xFF00E5FF)),
                        SizedBox(width: 8),
                        Text(
                          'Backend Connectivity',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _urlController,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'API Endpoint URL',
                        border: OutlineInputBorder(),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: Color(0xFF00E5FF)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Notifications toggles Card
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.notifications_active, color: Color(0xFF00E5FF)),
                        SizedBox(width: 8),
                        Text(
                          'Notification Integrations',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SwitchListTile(
                      title: const Text('Push Alerts'),
                      subtitle: const Text('Receive warnings for danger water levels'),
                      value: _sendPush,
                      activeColor: const Color(0xFF00E5FF),
                      onChanged: (val) => setState(() => _sendPush = val),
                    ),
                    SwitchListTile(
                      title: const Text('SMS Broadcasts (Beta)'),
                      subtitle: const Text('Relay alerts directly to rescue units'),
                      value: _sendSms,
                      activeColor: const Color(0xFF00E5FF),
                      onChanged: (val) => setState(() => _sendSms = val),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _saveSettings,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00E5FF),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'SAVE SETTINGS',
                style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.0, fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
