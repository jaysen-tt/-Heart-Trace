import 'package:flutter/foundation.dart';
enum LogLevel {
  debug,
  info,
  warn,
  error,
}

class Logger {
  static LogLevel _logLevel = LogLevel.debug;

  static void setLevel(LogLevel level) {
    _logLevel = level;
  }

  static void debug(String message) {
    if (_logLevel.index <= LogLevel.debug.index) {
      debugPrint('[DEBUG] ${DateTime.now()} $message');
    }
  }

  static void info(String message) {
    if (_logLevel.index <= LogLevel.info.index) {
      debugPrint('[INFO] ${DateTime.now()} $message');
    }
  }

  static void warn(String message) {
    if (_logLevel.index <= LogLevel.warn.index) {
      debugPrint('[WARN] ${DateTime.now()} $message');
    }
  }

  static void error(String message) {
    if (_logLevel.index <= LogLevel.error.index) {
      debugPrint('[ERROR] ${DateTime.now()} $message');
    }
  }
}