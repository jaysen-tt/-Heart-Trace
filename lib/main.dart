import 'package:flutter/material.dart';

import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter/foundation.dart';
import 'pages/today_page.dart';
import 'pages/onboarding_wrapper.dart';
import 'utils/logger_utils.dart';
import 'utils/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // 根据环境设置日志级别
  Logger.setLevel(kDebugMode ? LogLevel.debug : LogLevel.info);
  // await DiaryLocalStorage.init(); // 已废弃或不存在，直接移除
  runApp(MaterialApp(
    scaffoldMessengerKey: scaffoldMessengerKey,
     
    home: const OnboardingWrapper(),
    debugShowCheckedModeBanner: false,
    localizationsDelegates: [
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
    ],
    supportedLocales: [
      Locale('zh', 'CN'),
      Locale('en', 'US'),
    ],
    locale: Locale('zh', 'CN'),
  ));
}