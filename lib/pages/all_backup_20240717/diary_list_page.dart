import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'diary_edit_page.dart';

class DiaryListPage extends StatefulWidget {
  const DiaryListPage({super.key});

  @override
  State<DiaryListPage> createState() => _DiaryListPageState();
}

class _DiaryListPageState extends State<DiaryListPage> {
  // 示例日记数据
  final List<Map<String, dynamic>> _diaryEntries = [
    {
      'id': 1,
      'title': '春日野餐',
      'content': '今天和朋友去公园野餐，天气非常好...',
      'date': DateTime(2023, 4, 15),
      'mood': 'happy',
    },
    {
      'id': 2,
      'title': '项目进度',
      'content': 'Flutter项目终于完成了第一阶段...',
      'date': DateTime(2023, 4, 12),
      'mood': 'productive',
    },
    {
      'id': 3,
      'title': '雨夜读书',
      'content': '窗外下着雨，适合在家读一本好书...',
      'date': DateTime(2023, 4, 10),
      'mood': 'calm',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('日记列表'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _navigateToDiaryEdit(context),
          ),
        ],
      ),
      body: _buildDiaryList(),
    );
  }

  Widget _buildDiaryList() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
      itemCount: _diaryEntries.length,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) => _buildDiaryItem(_diaryEntries[index]),
    );
  }

  Widget _buildDiaryItem(Map<String, dynamic> entry) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      leading: _buildDateIndicator(entry['date']),
      title: Text(
        entry['title'],
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4),
        child: Text(
          entry['content'],
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 14,
          ),
        ),
      ),
      trailing: _buildMoodIndicator(entry['mood']),
      onTap: () => _navigateToDiaryEdit(context, entry: entry),
    );
  }

  Widget _buildDateIndicator(DateTime date) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children:
        [
          Text(
            DateFormat('MM').format(date),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            DateFormat('dd').format(date),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMoodIndicator(String mood) {
    IconData icon;
    Color color;

    switch (mood) {
      case 'happy':
        icon = Icons.emoji_emotions;
        color = Colors.yellow;
        break;
      case 'productive':
        icon = Icons.check_circle;
        color = Colors.green;
        break;
      case 'calm':
        icon = Icons.accessibility_new;
        color = Colors.blue;
        break;
      default:
        icon = Icons.emoji_emotions;
        color = Colors.grey;
    }

    return Icon(icon, color: color, size: 24);
  }

  void _navigateToDiaryEdit(BuildContext context, {Map<String, dynamic>? entry}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DiaryEditPage(entry: entry),
      ),
    );
  }
}

// 日记编辑页面（临时放在同一文件，后续会拆分）
class DiaryEditPage extends StatelessWidget {
  final Map<String, dynamic>? entry;

  const DiaryEditPage({super.key, this.entry});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(entry == null ? '新建日记' : '编辑日记'),
      ),
      body: const Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: '标题',
                hintText: '输入日记标题',
                border: InputBorder.none,
                hintStyle: TextStyle(fontSize: 24, color: Colors.grey),
                labelStyle: TextStyle(fontSize: 24),
              ),
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              maxLines: 1,
            ),
            Divider(height: 1),
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: '开始写日记...',
                ),
                style: TextStyle(fontSize: 16),
                maxLines: null,
                expands: true,
                textAlignVertical: TextAlignVertical.top,
              ),
            ),
          ],
        ),
      ),
    );
  }
}