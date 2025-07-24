import 'dart:convert';
import 'package:http/http.dart' as http;
import 'diary_repository.dart';
import 'diary_entry.dart';

/// 服务器存储实现（HTTP API）
/// TODO: 你的同伴需要根据实际服务器API实现这个方法
class DiaryServerStorage implements DiaryRepository {
  static const String _baseUrl = 'https://your-api-server.com/api'; // TODO: 替换为实际服务器地址
  static const String _apiKey = 'your-api-key'; // TODO: 替换为实际API密钥
  
  @override
  Future<void> init() async {
    // TODO: 初始化网络连接，验证API密钥等
  }

  @override
  Future<void> createDiary(DiaryEntry diary) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/diaries'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: jsonEncode(diary.toJson()),
      );

      if (response.statusCode != 201) {
        throw Exception('创建日记失败: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('网络请求失败: $e');
    }
  }

  @override
  Future<List<DiaryEntry>> fetchDiaries() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/diaries'),
        headers: {
          'Authorization': 'Bearer $_apiKey',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => DiaryEntry.fromJson(json)).toList();
      } else {
        throw Exception('获取日记失败: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('网络请求失败: $e');
    }
  }

  @override
  Future<DiaryEntry?> getDiaryById(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/diaries/$id'),
        headers: {
          'Authorization': 'Bearer $_apiKey',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return DiaryEntry.fromJson(data);
      } else if (response.statusCode == 404) {
        return null;
      } else {
        throw Exception('获取日记失败: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('网络请求失败: $e');
    }
  }

  @override
  Future<void> updateDiary(DiaryEntry diary) async {
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl/diaries/${diary.id}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: jsonEncode(diary.toJson()),
      );

      if (response.statusCode != 200) {
        throw Exception('更新日记失败: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('网络请求失败: $e');
    }
  }

  @override
  Future<void> deleteDiary(String id) async {
    try {
      final response = await http.delete(
        Uri.parse('$_baseUrl/diaries/$id'),
        headers: {
          'Authorization': 'Bearer $_apiKey',
        },
      );

      if (response.statusCode != 204) {
        throw Exception('删除日记失败: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('网络请求失败: $e');
    }
  }

  @override
  Future<List<DiaryEntry>> searchDiaries(String query) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/diaries/search?q=${Uri.encodeComponent(query)}'),
        headers: {
          'Authorization': 'Bearer $_apiKey',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => DiaryEntry.fromJson(json)).toList();
      } else {
        throw Exception('搜索日记失败: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('网络请求失败: $e');
    }
  }

  @override
  Future<List<DiaryEntry>> fetchDiariesByDate(DateTime date) async {
    try {
      final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      final response = await http.get(
        Uri.parse('$_baseUrl/diaries/date/$dateStr'),
        headers: {
          'Authorization': 'Bearer $_apiKey',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => DiaryEntry.fromJson(json)).toList();
      } else {
        throw Exception('获取日期日记失败: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('网络请求失败: $e');
    }
  }

  @override
  Future<List<DiaryEntry>> fetchDiariesByDateRange(DateTime start, DateTime end) async {
    try {
      final startStr = '${start.year}-${start.month.toString().padLeft(2, '0')}-${start.day.toString().padLeft(2, '0')}';
      final endStr = '${end.year}-${end.month.toString().padLeft(2, '0')}-${end.day.toString().padLeft(2, '0')}';
      
      final response = await http.get(
        Uri.parse('$_baseUrl/diaries/range?start=$startStr&end=$endStr'),
        headers: {
          'Authorization': 'Bearer $_apiKey',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => DiaryEntry.fromJson(json)).toList();
      } else {
        throw Exception('获取日期范围日记失败: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('网络请求失败: $e');
    }
  }

  // ========== 服务器特有功能 ==========
  
  /// 同步本地数据到服务器
  Future<void> syncToServer(List<DiaryEntry> localDiaries) async {
    // TODO: 实现数据同步逻辑
  }

  /// 从服务器同步数据到本地
  Future<List<DiaryEntry>> syncFromServer() async {
    // TODO: 实现数据同步逻辑
    return await fetchDiaries();
  }

  /// 检查网络连接
  Future<bool> checkConnection() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/health'),
        headers: {
          'Authorization': 'Bearer $_apiKey',
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}