import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'diary_entry.dart';
import 'diary_repository.dart';

/// 本地存储实现（Hive数据库）
class DiaryLocalStorage implements DiaryRepository {
  static const String _boxName = 'diaries';
  static bool _initialized = false;

  /// 初始化Hive（需在App启动时调用一次）
  @override
  Future<void> init() async {
    if (_initialized) return;
    try {
      final dir = await getApplicationDocumentsDirectory();
      await Hive.initFlutter(dir.path);
      await Hive.openBox<Map>(_boxName);
      _initialized = true;
    } catch (e) { // 移除了未使用的stackTrace参数
      // ignore: avoid_print
      debugPrint('Error initializing Hive: \$e');
    }
  }

  /// 新增日记
  @override
  Future<void> createDiary(DiaryEntry diary) async {
    await init();
    final box = Hive.box<Map>(_boxName);
    // 直接使用DiaryEntry的id和toJson()方法
    await box.put(diary.id, diary.toJson());
  }

  /// 获取所有日记
  @override
  Future<List<DiaryEntry>> fetchDiaries() async {
    await init();
    final box = Hive.box<Map>(_boxName);
    final List<DiaryEntry> diaries = [];
    
    // ignore: avoid_print
    debugPrint('开始加载日记，Hive box中有 ${box.length} 条数据');
    
    for (final entry in box.values) {
      try {
        // ignore: avoid_print
        // ignore: avoid_print
      debugPrint('原始数据: $entry');
        final Map<String, dynamic> data = Map<String, dynamic>.from(entry);
        // ignore: avoid_print
        debugPrint('转换后数据: $data');
        
        // 确保ID是字符串类型
        if (data['id'] is int) {
          data['id'] = data['id'].toString();
          // ignore: avoid_print
          debugPrint('ID已转换为字符串: ${data['id']}');
        }
        
        // 检查必需字段
        if (data['title'] == null) data['title'] = '';
        if (data['content'] == null) data['content'] = '';
        if (data['date'] == null) data['date'] = DateTime.now().toIso8601String();
        if (data['mood'] == null) data['mood'] = 'neutral';
        if (data['images'] == null) data['images'] = [];
        if (data['files'] == null) data['files'] = [];
        if (data['audios'] == null) data['audios'] = [];
        
        // ignore: avoid_print
        debugPrint('处理后的数据: $data');
        diaries.add(DiaryEntry.fromJson(data));
        // ignore: avoid_print
        debugPrint('成功解析日记: ${data['title']}');
      } catch (e, stackTrace) {
        // ignore: avoid_print
        // ignore: avoid_print
      debugPrint('解析日记数据失败: $e');
        // ignore: avoid_print
        debugPrint('错误堆栈: $stackTrace');
        // ignore: avoid_print
        debugPrint('问题数据: $entry');
        // 跳过损坏的数据
        continue;
      }
    }
    
    // ignore: avoid_print
    debugPrint('成功加载 ${diaries.length} 条日记');
    return diaries;
  }

  /// 根据ID获取日记
  @override
  Future<DiaryEntry?> getDiaryById(String id) async {
    await init();
    final box = Hive.box<Map>(_boxName);
    
    // 尝试直接获取
    var data = box.get(id);
    
    // 如果没找到，尝试将字符串ID转换为整数ID
    if (data == null && int.tryParse(id) != null) {
      final intId = int.parse(id) % 0xFFFFFFFF;
      data = box.get(intId);
    }
    
    if (data != null) {
      try {
        final Map<String, dynamic> diaryData = Map<String, dynamic>.from(data);
        // 确保ID是字符串类型
        if (diaryData['id'] is int) {
          diaryData['id'] = diaryData['id'].toString();
        }
        return DiaryEntry.fromJson(diaryData);
      } catch (e) {
        debugPrint('解析日记数据失败: $e');
        return null;
      }
    }
    return null;
  }

  /// 更新日记
  @override
  Future<void> updateDiary(DiaryEntry diary) async {
    await init();
    final box = Hive.box<Map>(_boxName);
    // 直接使用DiaryEntry的id和toJson()方法
    await box.put(diary.id, diary.toJson());
  }

  /// 删除日记
  @override
  Future<void> deleteDiary(String id) async {
    await init();
    final box = Hive.box<Map>(_boxName);
    // 如果ID是整数，确保在Hive支持的范围内
    final safeId = id;
    await box.delete(safeId);
  }

  /// 搜索日记
  @override
  Future<List<DiaryEntry>> searchDiaries(String query) async {
    final allDiaries = await fetchDiaries();
    if (query.isEmpty) return allDiaries;
    
    return allDiaries.where((diary) {
      final searchText = query.toLowerCase();
      return diary.title.toLowerCase().contains(searchText) ||
             diary.content.toLowerCase().contains(searchText);
    }).toList();
  }

  /// 根据日期获取日记
  @override
  Future<List<DiaryEntry>> fetchDiariesByDate(DateTime date) async {
    final allDiaries = await fetchDiaries();
    return allDiaries.where((diary) {
      return diary.date.year == date.year &&
             diary.date.month == date.month &&
             diary.date.day == date.day;
    }).toList();
  }

  /// 获取指定日期范围的日记
  @override
  Future<List<DiaryEntry>> fetchDiariesByDateRange(DateTime start, DateTime end) async {
    final allDiaries = await fetchDiaries();
    return allDiaries.where((diary) {
      return diary.date.isAfter(start) && diary.date.isBefore(end.add(const Duration(days: 1)));
    }).toList();
  }

  // ========== 兼容性方法（用于平滑迁移） ==========
  
  /// 兼容旧版本的Map格式创建日记
  Future<void> createDiaryFromMap(Map<String, dynamic> diaryMap) async {
    final diary = DiaryEntry.fromMap(diaryMap);
    await createDiary(diary);
  }

  /// 兼容旧版本的Map格式更新日记
  Future<void> updateDiaryFromMap(Map<String, dynamic> diaryMap) async {
    final diary = DiaryEntry.fromMap(diaryMap);
    await updateDiary(diary);
  }

  /// 获取所有日记（Map格式，兼容旧版本）
  Future<List<Map<String, dynamic>>> fetchDiariesAsMap() async {
    final diaries = await fetchDiaries();
    return diaries.map((diary) => diary.toJson()).toList();
  }

  /// 测试数据解析（调试用）
  Future<void> testDataParsing() async {
    await init();
    final box = Hive.box<Map>(_boxName);
    
    // ignore: avoid_print
    print('=== 数据解析测试 ===');
    // ignore: avoid_print
    print('Hive box中有 ${box.length} 条数据');
    
    if (box.isEmpty) {
      // ignore: avoid_print
      print('没有数据，创建一个测试日记');
      final testDiary = {
        'id': DateTime.now().millisecondsSinceEpoch % 0xFFFFFFFF,
        'title': '测试日记',
        'content': '这是一个测试日记',
        'date': DateTime.now().toIso8601String(),
        'mood': 'neutral',
        'images': [],
        'files': [],
        'audios': [],
      };
      await box.put(testDiary['id'], testDiary);
      // ignore: avoid_print
      debugPrint('测试日记已创建');
    }
    
    for (final entry in box.values) {
      debugPrint('原始数据: $entry');
      try {
        final diary = DiaryEntry.fromJson(Map<String, dynamic>.from(entry));
        // ignore: avoid_print
        // ignore: avoid_print
      print('解析成功: ${diary.title}');
      } catch (e) {
        // ignore: avoid_print
        // ignore: avoid_print
      print('解析失败: $e');
      }
    }
  }
}