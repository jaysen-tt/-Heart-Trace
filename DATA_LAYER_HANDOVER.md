# 数据层移交文档

## 📋 项目概述

**项目名称：** 时光尺（TimeRuler）  
**数据层负责人：** [你的同伴姓名]  
**移交日期：** [当前日期]

## 🏗️ 数据层架构

### 核心文件结构
```
lib/services/
├── diary_repository.dart      # 数据仓库抽象接口
├── diary_local_storage.dart   # 本地存储实现（Hive）
├── diary_server_storage.dart  # 服务器存储实现（HTTP API）
├── diary_service.dart         # 数据服务管理器
└── [其他数据相关文件]
```

### 架构设计原则
1. **依赖倒置**：业务层依赖抽象接口，不依赖具体实现
2. **单一职责**：每个类只负责一个数据源
3. **开闭原则**：支持扩展新的数据源，无需修改现有代码
4. **兼容性**：保持与现有代码的向后兼容

## 📊 数据模型

### DiaryEntry 类
```dart
class DiaryEntry {
  final String id;           // 唯一标识符
  final String title;        // 日记标题
  final String content;      // 日记内容
  final DateTime date;       // 日记日期
  final String mood;         // 心情状态
  final List<String> images; // 图片路径列表
  final List<String> files;  // 文件路径列表
  final List<String> audios; // 音频路径列表
}
```

### 数据格式
- **本地存储**：Hive数据库，JSON格式
- **服务器传输**：JSON格式，UTF-8编码
- **日期格式**：ISO 8601标准

## 🔌 核心接口

### DiaryRepository 抽象接口
```dart
abstract class DiaryRepository {
  Future<void> init();
  Future<void> createDiary(DiaryEntry diary);
  Future<List<DiaryEntry>> fetchDiaries();
  Future<DiaryEntry?> fetchDiaryById(String id);
  Future<void> updateDiary(DiaryEntry diary);
  Future<void> deleteDiary(String id);
  Future<List<DiaryEntry>> searchDiaries(String query);
  Future<List<DiaryEntry>> fetchDiariesByDate(DateTime date);
  Future<List<DiaryEntry>> fetchDiariesByDateRange(DateTime start, DateTime end);
}
```

### DiaryService 服务管理器
```dart
class DiaryService {
  // 单例模式
  static DiaryService get instance;
  
  // 核心方法
  Future<DataResult<void>> createDiary({...});
  Future<DataResult<List<DiaryEntry>>> getAllDiaries();
  Future<DataResult<List<DiaryEntry>>> searchDiaries(String query);
  Future<DataResult<void>> updateDiary(DiaryEntry diary);
  Future<DataResult<void>> deleteDiary(String id);
  
  // 数据源切换
  Future<void> switchDataSource(DiaryRepository repository);
}
```

## 🚀 使用指南

### 1. 初始化数据服务
```dart
// 在 main.dart 中
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DiaryService.instance.init(useLocalStorage: true);
  runApp(MyApp());
}
```

### 2. 在页面中使用
```dart
// 获取所有日记
final result = await DiaryService.instance.getAllDiaries();
if (result.isSuccess) {
  final diaries = result.data!;
  // 处理数据
} else {
  print('错误: ${result.error}');
}

// 创建日记
final createResult = await DiaryService.instance.createDiary(
  title: '我的日记',
  content: '今天很开心...',
  date: DateTime.now(),
  mood: 'happy',
);
```

### 3. 切换数据源
```dart
// 切换到服务器存储
final serverStorage = DiaryServerStorage();
await DiaryService.instance.switchDataSource(serverStorage);
```

## 🔧 服务器接入任务

### 第一阶段：基础API实现
1. **配置服务器地址和API密钥**
   - 修改 `diary_server_storage.dart` 中的 `_baseUrl` 和 `_apiKey`
   - 实现 `init()` 方法的网络连接验证

2. **实现核心CRUD操作**
   - `createDiary()` - POST /api/diaries
   - `fetchDiaries()` - GET /api/diaries
   - `updateDiary()` - PUT /api/diaries/{id}
   - `deleteDiary()` - DELETE /api/diaries/{id}

3. **实现查询功能**
   - `searchDiaries()` - GET /api/diaries/search?q={query}
   - `fetchDiariesByDate()` - GET /api/diaries/date/{date}
   - `fetchDiariesByDateRange()` - GET /api/diaries/range?start={start}&end={end}

### 第二阶段：高级功能
1. **数据同步**
   - 实现 `syncToServer()` 和 `syncFromServer()` 方法
   - 处理离线数据缓存和冲突解决

2. **错误处理和重试机制**
   - 网络超时处理
   - 自动重试机制
   - 用户友好的错误提示

3. **性能优化**
   - 分页加载
   - 数据缓存
   - 图片/文件上传优化

### 第三阶段：生产环境
1. **安全性**
   - API密钥管理
   - 数据加密
   - 用户认证

2. **监控和日志**
   - 错误日志记录
   - 性能监控
   - 用户行为分析

## 📝 开发注意事项

### 1. 错误处理
- 所有网络请求都要有适当的错误处理
- 使用 `DataResult<T>` 包装返回结果
- 提供用户友好的错误信息

### 2. 数据一致性
- 确保本地和服务器数据同步
- 处理并发修改冲突
- 实现数据版本控制

### 3. 性能考虑
- 避免频繁的网络请求
- 实现适当的数据缓存
- 优化大文件上传

### 4. 测试
- 编写单元测试覆盖所有方法
- 进行网络异常测试
- 测试数据迁移场景

## 🔄 迁移策略

### 从本地存储到服务器存储
1. **渐进式迁移**
   ```dart
   // 先使用本地存储
   await DiaryService.instance.init(useLocalStorage: true);
   
   // 后续切换到服务器
   final serverStorage = DiaryServerStorage();
   await DiaryService.instance.switchDataSource(serverStorage);
   ```

2. **数据同步**
   - 首次连接时上传本地数据
   - 定期同步本地和服务器数据
   - 处理数据冲突

3. **回退机制**
   - 网络不可用时自动回退到本地存储
   - 保持离线功能可用

## 📞 联系方式

**移交人：** [你的姓名]  
**邮箱：** [你的邮箱]  
**微信：** [你的微信]  

**接手人：** [同伴姓名]  
**邮箱：** [同伴邮箱]  
**微信：** [同伴微信]  

## 📚 参考资料

- [Flutter HTTP 包文档](https://pub.dev/packages/http)
- [Hive 数据库文档](https://docs.hivedb.dev/)
- [RESTful API 设计指南](https://restfulapi.net/)
- [JSON 序列化最佳实践](https://dart.dev/guides/json)

---

**注意：** 此文档会随着项目发展持续更新，请保持同步。 