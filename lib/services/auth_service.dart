import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String _baseUrl = 'https://api.example.com/auth';

  /// 用户登录API
  static Future<void> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body)['error'] ?? '登录失败';
      throw Exception('登录失败: $error');
    }

    // 解析并存储返回的token
    final data = jsonDecode(response.body);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', data['token']);
    print('登录成功: 用户ID: ${data['id']}, Token已保存');
  }

  /// 用户注册API
  static Future<void> register(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode != 201) {
      final error = jsonDecode(response.body)['error'] ?? '注册失败';
      throw Exception('注册失败: $error');
    }

    // 解析并存储返回的token
    final data = jsonDecode(response.body);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', data['token']);
    print('注册成功: 用户ID: ${data['id']}, Token已保存');
  }
}