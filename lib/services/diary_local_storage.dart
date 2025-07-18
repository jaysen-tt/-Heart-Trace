import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';

class DiaryLocalStorage {
  static const String _boxName = 'diaries';
  static bool _initialized = false;

  /// 初始化Hive（需在App启动时调用一次）
  static Future<void> init() async {
    if (_initialized) return;
    final dir = await getApplicationDocumentsDirectory();
    await Hive.initFlutter(dir.path);
    await Hive.openBox<Map>(_boxName);
    _initialized = true;
  }

  /// 新增日记
  Future<void> createDiary(Map<String, dynamic> diary) async {
    await init();
    final box = Hive.box<Map>(_boxName);
    await box.put(diary['id'].toString(), diary);
  }

  /// 获取所有日记
  Future<List<Map<String, dynamic>>> fetchDiaries() async {
    await init();
    final box = Hive.box<Map>(_boxName);
    return box.values.map((e) => Map<String, dynamic>.from(e)).toList();
  }

  /// 更新日记
  Future<void> updateDiary(Map<String, dynamic> diary) async {
    await init();
    final box = Hive.box<Map>(_boxName);
    await box.put(diary['id'].toString(), diary);
  }

  /// 删除日记
  Future<void> deleteDiary(String diaryId) async {
    await init();
    final box = Hive.box<Map>(_boxName);
    await box.delete(diaryId);
  }
} 