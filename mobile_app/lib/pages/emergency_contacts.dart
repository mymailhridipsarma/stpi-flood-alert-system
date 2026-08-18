import 'package:flutter/material.dart';

class EmergencyContactsPage extends StatefulWidget {
  const EmergencyContactsPage({super.key});

  @override
  State<EmergencyContactsPage> createState() => _EmergencyContactsPageState();
}

class _EmergencyContactsPageState extends State<EmergencyContactsPage> {
  final List<Map<String, String>> _contacts = [
    {'name': 'National Disaster Response (NDRF)', 'phone': '1078', 'type': 'Disaster Control'},
    {'name': 'Highway Patrol Division', 'phone': '+91 98642 80012', 'type': 'Police Dispatch'},
    {'name': 'Municipal Drainage Control', 'phone': '+91 98765 01880', 'type': 'Primary Service'}
  ];

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  String _contactType = 'Primary Service';

  void _addContact() {
    if (_nameController.text.trim().isEmpty || _phoneController.text.trim().isEmpty) return;
    
    setState(() {
      _contacts.add({
        'name': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'type': _contactType,
      });
      _nameController.clear();
      _phoneController.clear();
    });

    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Contact added successfully!'),
        backgroundColor: Color(0xFF10B981),
      ),
    );
  }

  void _showAddContactDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF151C2C),
        title: const Text('Add Dispatch Contact', style: TextStyle(color: Colors.white, fontFamily: 'Outfit')),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Agency Name'),
              style: const TextStyle(color: Colors.white),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Phone Number / Hotline'),
              style: const TextStyle(color: Colors.white),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _contactType,
              dropdownColor: const Color(0xFF151C2C),
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(labelText: 'Contact Priority Category'),
              items: ['Primary Service', 'Police Dispatch', 'Disaster Control', 'Auxiliary Units']
                  .map((type) => DropdownMenuItem(value: type, child: Text(type)))
                  .toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() {
                    _contactType = val;
                  });
                }
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
            onPressed: () => Navigator.pop(context),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00E5FF)),
            onPressed: _addContact,
            child: const Text('Add Contact', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Disaster Contacts', style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0B0F19),
      ),
      body: _contacts.isEmpty
          ? const Center(
              child: Text('No distress contacts listed.', style: TextStyle(color: Colors.white30)),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _contacts.length,
              itemBuilder: (context, index) {
                final item = _contacts[index];
                return Card(
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Color(0xFF1D283F),
                      child: Icon(Icons.emergency, color: Color(0xFFEF4444)),
                    ),
                    title: Text(item['name']!, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    subtitle: Text('${item['phone']} (${item['type']})', style: const TextStyle(color: Colors.white70)),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                      onPressed: () {
                        setState(() {
                          _contacts.removeAt(index);
                        });
                      },
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF00E5FF),
        foregroundColor: Colors.black,
        onPressed: _showAddContactDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}
