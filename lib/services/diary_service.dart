import 'diary_repository.dart';
import 'diary_local_storage.dart';

import 'data_result.dart';
import 'diary_entry.dart';

/// 数据服务管理器
/// 负责统一管理数据源，处理业务逻辑
class DiaryService {
  static DiaryService? _instance;
  static DiaryService get instance => _instance ??= DiaryService._();
  
  DiaryService._();

  late DiaryRepository _repository;
  bool _isInitialized = false;

  /// 初始化数据服务
  /// [useLocalStorage] 是否使用本地存储（默认true，后续可切换为服务器）
  Future<void> init({bool useLocalStorage = true}) async {
    if (_isInitialized) return;
    
    if (useLocalStorage) {
      _repository = DiaryLocalStorage() as DiaryRepository;
    } else {
      // TODO: 后续接入服务器时，这里可以切换为服务器实现
      // _repository = DiaryServerRepository();
      _repository = DiaryLocalStorage() as DiaryRepository;
    }
    
    await _repository.init();
    _isInitialized = true;
  }

  /// 切换数据源（本地/服务器）
  Future<void> switchDataSource(DiaryRepository repository) async {
    _repository = repository;
    await _repository.init();
  }

  // ========== 业务方法 ==========

  /// 创建日记
  Future<DataResult<void>> createDiary({
    required String title,
    required String content,
    required DateTime date,
    String mood = 'neutral',
    List<String> images = const [],
    List<String> files = const [],
    List<String> audios = const [],
  }) async {
    try {
      final diary = DiaryEntry(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: title,
        content: content,
        date: date,
        mood: mood,
        images: images,
        files: files,
        audios: audios,
      );
      
      await _repository.createDiary(diary);
      return DataResult.success(null);
    } catch (e) {
      return DataResult.error('创建日记失败: $e');
    }
  }

  /// 获取所有日记
  Future<DataResult<List<DiaryEntry>>> getAllDiaries() async {
    try {
      final diaries = await _repository.fetchDiaries();
      // 按日期倒序排列
      diaries.sort((a, b) => b.date.compareTo(a.date));
      return DataResult.success(diaries);
    } catch (e) {
      return DataResult.error('获取日记失败: $e');
    }
  }

  /// 搜索日记
  Future<DataResult<List<DiaryEntry>>> searchDiaries(String query) async {
    try {
      final diaries = await _repository.searchDiaries(query);
      return DataResult.success(diaries);
    } catch (e) {
      return DataResult.error('搜索日记失败: $e');
    }
  }

  /// 更新日记
  Future<DataResult<void>> updateDiary(DiaryEntry diary) async {
    try {
      await _repository.updateDiary(diary);
      return DataResult.success(null);
    } catch (e) {
      return DataResult.error('更新日记失败: $e');
    }
  }

  /// 删除日记
  Future<DataResult<void>> deleteDiary(String id) async {
    try {
      await _repository.deleteDiary(id);
      return DataResult.success(null);
    } catch (e) {
      return DataResult.error('删除日记失败: $e');
    }
  }

  /// 获取指定日期的日记
  Future<DataResult<List<DiaryEntry>>> getDiariesByDate(DateTime date) async {
    try {
      final diaries = await _repository.fetchDiariesByDate(date);
      return DataResult.success(diaries);
    } catch (e) {
      return DataResult.error('获取日期日记失败: $e');
    }
  }

  /// 获取指定日期范围的日记
  Future<DataResult<List<DiaryEntry>>> getDiariesByDateRange(DateTime start, DateTime end) async {
    try {
      final diaries = await _repository.fetchDiariesByDateRange(start, end);
      return DataResult.success(diaries);
    } catch (e) {
      return DataResult.error('获取日期范围日记失败: $e');
    }
  }

  /// 检查指定日期是否有日记
  Future<bool> hasDiaryOnDate(DateTime date) async {
    try {
      final diaries = await _repository.fetchDiariesByDate(date);
      return diaries.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  // ========== 兼容性方法 ==========
  
  /// 兼容旧版本的Map格式创建日记
  Future<DataResult<void>> createDiaryFromMap(Map<String, dynamic> diaryMap) async {
    try {
      if (_repository is DiaryLocalStorage) {
        await (_repository as DiaryLocalStorage).createDiaryFromMap(diaryMap);
        return DataResult.success(null);
      } else {
        final diary = DiaryEntry.fromMap(diaryMap);
        await _repository.createDiary(diary);
        return DataResult.success(null);
      }
    } catch (e) {
      return DataResult.error('创建日记失败: $e');
    }
  }

  /// 兼容旧版本的Map格式更新日记
  Future<DataResult<void>> updateDiaryFromMap(Map<String, dynamic> diaryMap) async {
    try {
      if (_repository is DiaryLocalStorage) {
        await (_repository as DiaryLocalStorage).updateDiaryFromMap(diaryMap);
        return DataResult.success(null);
      } else {
        final diary = DiaryEntry.fromMap(diaryMap);
        await _repository.updateDiary(diary);
        return DataResult.success(null);
      }
    } catch (e) {
      return DataResult.error('更新日记失败: $e');
    }
  }

  /// 获取所有日记（Map格式，兼容旧版本）
  Future<DataResult<List<Map<String, dynamic>>>> getAllDiariesAsMap() async {
    try {
      if (_repository is DiaryLocalStorage) {
        final diaries = await (_repository as DiaryLocalStorage).fetchDiariesAsMap();
        return DataResult.success(diaries);
      } else {
        final diaries = await _repository.fetchDiaries();
        final maps = diaries.map((diary) => diary.toJson()).toList();
        return DataResult.success(maps);
      }
    } catch (e) {
      return DataResult.error('获取日记失败: $e');
    }
  }
}