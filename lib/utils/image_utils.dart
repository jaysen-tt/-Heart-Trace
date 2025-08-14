import 'dart:io';
import 'package:flutter/material.dart';

import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

/// 图片工具类 - 提供便捷的PNG素材加载方法
class ImageUtils {
  // 日历相关图片
  static const String calendarBg = 'assets/images/calendar/calendar_bg.png';
  static const String calendarHeader = 'assets/images/calendar/calendar_header.png';
  static const String calendarGrid = 'assets/images/calendar/calendar_grid.png';
  static const String calendarIcon = 'assets/images/calendar/calendar_icon.png';
  
  // 背景相关图片
  static const String mainBg = 'assets/images/backgrounds/main_bg.png';
  static const String cardBg = 'assets/images/backgrounds/card_bg.png';
  
  // 图标相关图片
  static const String customIcon = 'assets/images/icons/custom_icon.png';
  
  /// 创建背景装饰
  static BoxDecoration createBackgroundDecoration(String imagePath, {
    BoxFit fit = BoxFit.cover,
    Color? color,
    BorderRadius? borderRadius,
    List<BoxShadow>? boxShadow,
  }) {
    return BoxDecoration(
      image: DecorationImage(
        image: AssetImage(imagePath),
        fit: fit,
      ),
      color: color,
      borderRadius: borderRadius,
      boxShadow: boxShadow,
    );
  }
  
  /// 创建圆角背景装饰
  static BoxDecoration createRoundedBackgroundDecoration(String imagePath, {
    double radius = 16.0,
    BoxFit fit = BoxFit.cover,
  }) {
    return createBackgroundDecoration(
      imagePath,
      fit: fit,
      borderRadius: BorderRadius.circular(radius),
    );
  }
  
  /// 创建带阴影的背景装饰
  static BoxDecoration createShadowBackgroundDecoration(String imagePath, {
    double radius = 16.0,
    BoxFit fit = BoxFit.cover,
    Color shadowColor = Colors.black,
    double shadowOpacity = 0.1,
    double blurRadius = 10.0,
    Offset shadowOffset = const Offset(0, 5),
  }) {
    return createBackgroundDecoration(
      imagePath,
      fit: fit,
      borderRadius: BorderRadius.circular(radius),
      boxShadow: [
        BoxShadow(
          color: shadowColor.withAlpha((shadowOpacity * 255).round()),
          blurRadius: blurRadius,
          offset: shadowOffset,
        ),
      ],
    );
  }
  
  /// 检查图片是否存在（仅本地文件/asset路径）
  static Future<bool> imageExists(String imagePath) async {
    try {
      if (imagePath.startsWith('assets/')) {
        // asset图片，直接返回true（如需更严谨可用rootBundle.load判断）
      return true;
      } else {
        return await File(imagePath).exists();
      }
    } catch (e) {
      return false;
    }
  }

  /// 复制图片到App私有目录，返回新路径
  static Future<String> copyToPrivateDir(String originPath) async {
    final dir = await getApplicationDocumentsDirectory();
    final imagesDir = Directory(p.join(dir.path, 'app_images'));
    if (!await imagesDir.exists()) {
      await imagesDir.create(recursive: true);
    }
    final fileName = p.basename(originPath);
    final newPath = p.join(imagesDir.path, '${DateTime.now().millisecondsSinceEpoch}_$fileName');
    final newFile = await File(originPath).copy(newPath);
    return newFile.path;
  }
}