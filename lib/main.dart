import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter/foundation.dart';
import 'utils/logger_utils.dart';
import 'utils/constants.dart';
import 'pages/today_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // 根据环境设置日志级别
  Logger.setLevel(kDebugMode ? LogLevel.debug : LogLevel.info);
  runApp(MaterialApp(
    scaffoldMessengerKey: scaffoldMessengerKey,
    home: const MainPage(),
    debugShowCheckedModeBanner: false,
    localizationsDelegates: [
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ],
    supportedLocales: [
      Locale('zh', 'CN'),
      Locale('en', 'US'),
    ],
    locale: Locale('zh', 'CN'),
  ));
}