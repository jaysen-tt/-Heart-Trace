import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DiaryEditPage extends StatefulWidget {
  final Map<String, dynamic>? entry;

  const DiaryEditPage({super.key, this.entry});

  @override
  State<DiaryEditPage> createState() => _DiaryEditPageState();
}

class _DiaryEditPageState extends State<DiaryEditPage> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  String? _selectedMood;
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    // 如果是编辑模式，初始化表单数据
    if (widget.entry != null) {
      _titleController.text = widget.entry!['title'];
      _contentController.text = widget.entry!['content'];
      _selectedMood = widget.entry!['mood'];
      _selectedDate = widget.entry!['date'];
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  void _saveDiary() {
    final newEntry = {
      'id': widget.entry?['id'] ?? DateTime.now().millisecondsSinceEpoch,
      'title': _titleController.text,
      'content': _contentController.text,
      'date': _selectedDate,
      'mood': _selectedMood ?? 'neutral',
    };

    Navigator.pop(context, newEntry);
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );

    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.entry == null ? '新建日记' : '编辑日记'),
        actions: [
          TextButton(
            onPressed: _saveDiary,
            child: const Text('保存'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children:
          [
            // 日期选择
            InkWell(
              onTap: _selectDate,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Text(
                  DateFormat('yyyy年MM月dd日 EEEE').format(_selectedDate),
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
              ),
            ),

            // 标题输入
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: '标题',
                hintText: '输入日记标题',
                border: InputBorder.none,
                hintStyle: TextStyle(fontSize: 24, color: Colors.grey),
                labelStyle: TextStyle(fontSize: 24),
              ),
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 1,
              autofocus: widget.entry == null,
            ),

            const Divider(height: 1),
            const SizedBox(height: 16),

            // 内容输入
            TextField(
              controller: _contentController,
              decoration: const InputDecoration(
                border: InputBorder.none,
                hintText: '开始写日记...',
              ),
              style: const TextStyle(fontSize: 16),
              maxLines: null,
              minLines: 15,
            ),

            const SizedBox(height: 24),

            // 心情选择
            const Text(
              '今日心情',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 12),
            _buildMoodSelector(),
          ],
        ),
      ),
    );
  }

  Widget _buildMoodSelector() {
    final moods = [
      {'name': 'happy', 'icon': Icons.emoji_emotions, 'color': Colors.yellow},
      {'name': 'sad', 'icon': Icons.emoji_events, 'color': Colors.blueGrey},
      {'name': 'angry', 'icon': Icons.emoji_emotions_outlined, 'color': Colors.red},
      {'name': 'calm', 'icon': Icons.accessibility_new, 'color': Colors.blue},
      {'name': 'productive', 'icon': Icons.check_circle, 'color': Colors.green},
      {'name': 'worried', 'icon': Icons.warning, 'color': Colors.orange},
    ];

    return Wrap(
      spacing: 16,
      children: moods.map((mood) {
        final isSelected = _selectedMood == mood['name'];

        return InkWell(
          onTap: () => setState(() => _selectedMood = mood['name'] as String),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.grey[100] : Colors.transparent,
                  borderRadius: BorderRadius.circular(50),
                ),
                child: Icon(
                  mood['icon'] as IconData,
                  color: isSelected ? mood['color'] as Color : Colors.grey[400],
                  size: 32,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                mood['name'] as String,
                style: TextStyle(
                  fontSize: 12,
                  color: isSelected ? mood['color'] as Color : Colors.grey[600],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}