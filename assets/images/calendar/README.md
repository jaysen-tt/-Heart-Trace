# 日历相关PNG素材

在这个文件夹中放置日历相关的PNG素材文件。

## 建议的文件命名规范：
- `calendar_bg.png` - 日历背景
- `calendar_header.png` - 日历头部
- `calendar_grid.png` - 日历网格
- `calendar_icon.png` - 日历图标

## 使用示例：
```dart
// 在代码中使用
Container(
  decoration: BoxDecoration(
    image: DecorationImage(
      image: AssetImage('assets/images/calendar/calendar_bg.png'),
      fit: BoxFit.cover,
    ),
  ),
  child: YourWidget(),
)
```

## 注意事项：
1. 确保PNG文件已添加到pubspec.yaml的assets配置中
2. 运行 `flutter pub get` 更新资源
3. 使用 `AssetImage()` 加载图片
4. 支持不同分辨率的图片（@2x, @3x） 