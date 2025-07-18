【项目名称】时光尺（TimeRuler）  ios版本
【核心定位】时间管理+日记App，通过「生命倒计时」和「日记记录」传递“珍惜当下”的理念。  

### 一、UI与功能拆解（对应3个页面）  
#### 1. 首页（TodayPage）  
- **视觉布局**：  
  - 顶部区域：  
    - 大字体显示 **倒计时（年、月、日）**（如47 years / 10 months / 03 days），下方标题“BEFOR I TURN 80”，底部日期“2025 07 12” + 标语“梦想不会逃跑，逃跑的往往是我们自己。”  
    - 字体风格：粗体、无衬线，深色主题（背景浅灰，文字黑色）。  
  - 中间区域：  
    - 日历式 **圆点矩阵**：顶部显示星期（M/T/W/T/F/S/S），圆点按日期排列（如示例中橙色圆点标记“今日”）。  
    - 交互：点击圆点 → 跳转到**日记预览页**（查看该日期的日记，若无则提示“今日还没记录”）。  
  - 底部导航：  
    - 两个按钮：「今日 TODAY」（默认选中，高亮）、「轨迹 TRAIL」（跳转到其他页面，暂不实现，先占位）。  

- **核心逻辑**：  
  - 倒计时 **每秒自动更新**：根据用户设置的“生日”和“目标寿命（80岁）”，计算剩余时间（需处理闰年、月份天数差异）。  
  - 圆点标记：若当天有日记，圆点显示**橙色**；否则灰色（通过查询Firebase日记数据判断）。  


#### 2. 日记预览页（DiaryListPage）  
- **视觉布局**：  
  - 顶部：倒计时（同首页） + **搜索栏**（灰色圆角，左侧放大镜图标）。  
  - 中间：**日记列表**（可滚动），每条日记显示「日期（如2024 07 07） + 标题（如“攀登一座雪山”） + 省略号」，背景深色卡片，圆角设计。  
  - 底部：**橙色圆形+号按钮**（居中，点击跳转到**日记编辑页**，新建日记）。  

- **核心逻辑**：  
  - 搜索功能：根据标题/内容关键词，过滤日记列表。  
  - 交互：点击列表项 → 跳转到**日记编辑页**（编辑已有日记）。  


#### 3. 日记编辑页（DiaryEditPage）  
- **视觉布局**：  
  - 顶部：日期显示（如2024 07 07，默认取当前日期，可修改？）。  
  - 中间：**标题输入框**（单行，粗体） + **正文输入框**（多行，浅色文字）。  
  - 底部左侧：**字数统计**（如“200”，实时更新）；右侧 **紫色对勾按钮**（点击保存日记到Firebase）。  
  - 底部居中：橙色圆形+号按钮（返回日记预览页，或新建？需明确交互）。  

- **核心逻辑**：  
  - 保存功能：将「日期、标题、正文」存入Firebase，自动关联当前用户（匿名登录，通过设备ID区分）。  
  - 字数统计：实时计算正文的字符数（不含空格？需明确规则）。  


### 二、技术需求  
1. **跨平台**：用 **Flutter（Dart语言）** 开发，同时支持iOS和Android（优先选Flutter，因为UI定制灵活，适配你设计的深色风格和特殊布局）。  
2. **数据存储**：  
   - 云端：**Firebase Realtime Database**（免费，支持实时同步，适合日记存储）。  
   - 认证：**匿名登录**（无需注册，通过设备ID自动关联用户数据，降低使用门槛）。  
3. **实时功能**：  
   - 倒计时：用 `Stream.periodic(Duration(seconds: 1))` 实现每秒更新。  
   - 日历标记：监听Firebase数据变化，实时更新圆点颜色。  
4. **UI适配**：参考设计图的 **深色主题、大字体、圆角卡片、圆点矩阵布局**，需还原视觉细节（如橙色圆点的位置、按钮样式）。  


### 三、我的背景与诉求  
- 完全无编程经验，需要 **从0开始的步骤指导**（如：先装什么软件？怎么运行第一个页面？）。  
- 优先实现 **核心功能**（倒计时、日记增删改查、日历标记），视觉细节可逐步优化。  
- 需明确 **“每一步做什么”**（如：第一步搭建Flutter环境，第二步写首页布局，第三步集成Firebase），并附带 **代码示例+注释**（解释关键代码的作用）。  
- 提醒 **开发中的常见坑**（如：时间计算的时区问题、Firebase初始化失败、UI布局溢出屏幕）。  


### 四、输出要求  
1. **技术栈决策**：告诉我为什么选Flutter+Firebase，对比其他方案（如React Native）的优势。  
2. **步骤化开发指南**：  
   - Step 1：环境搭建（Windows/macOS的Flutter安装、VS Code配置）。  
   - Step 2：创建项目，初始化Firebase。  
   - Step 3：编写首页（TodayPage）的UI和倒计时逻辑。  
   - Step 4：集成Firebase，实现日记的增删改查。  
   - Step 5：运行App到模拟器/真机测试。  
3. **核心代码片段**：  
   - 倒计时计算的Dart函数（处理生日→目标年龄的时间差）。  
   - Firebase匿名登录+数据存储的代码。  
   - 日历圆点的动态渲染逻辑（根据日记存在与否改变颜色）。  
4. **避坑 checklist**：开发时需要注意的关键问题（如：iOS的隐私权限、Firebase的安全规则配置）。  


请基于以上信息，帮我规划开发路径，并生成可运行的初始代码框架 

---

## 1. 页面结构与效果说明

- 顶部：左侧3个竖直属性条（年/月/日余额，渐变色），右侧大号倒计时数字（年/月/日）。
- 属性条高度和颜色随余额动态变化。
- 支持自适应刷新（每秒更新）。

---

## 2. 代码实现

### 2.1 新建 TodayPage 页面

在 `lib/pages/today_page.dart` 新建如下代码：

```dart
import 'dart:async';
import 'package:flutter/material.dart';

class TodayPage extends StatefulWidget {
  @override
  State<TodayPage> createState() => _TodayPageState();
}

class _TodayPageState extends State<TodayPage> {
  // 假设用户生日和目标寿命
  final DateTime birthday = DateTime(1997, 7, 12); // 你的生日
  final int targetAge = 80;

  late Timer _timer;
  late Map<String, int> countdown;

  @override
  void initState() {
    super.initState();
    countdown = getCountdown(birthday, targetAge);
    _timer = Timer.periodic(Duration(seconds: 1), (_) {
      setState(() {
        countdown = getCountdown(birthday, targetAge);
      });
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  // 计算倒计时
  Map<String, int> getCountdown(DateTime birthday, int targetAge) {
    final now = DateTime.now();
    final target = DateTime(birthday.year + targetAge, birthday.month, birthday.day);
    int years = target.year - now.year;
    int months = target.month - now.month;
    int days = target.day - now.day;
    if (days < 0) {
      months -= 1;
      days += DateTime(now.year, now.month + 1, 0).day;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return {'years': years, 'months': months, 'days': days};
  }

  @override
  Widget build(BuildContext context) {
    // 余额百分比
    double yearPercent = countdown['years']! / targetAge;
    double monthPercent = countdown['months']! / 12;
    double dayPercent = countdown['days']! / 30;

    return Scaffold(
      backgroundColor: Color(0xFFEEEDE8),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // 左侧属性条
              Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  AttributeBar(
                    percent: yearPercent.clamp(0.0, 1.0),
                    gradientColors: [Colors.orange, Colors.yellow],
                    height: 80,
                    label: '年',
                  ),
                  SizedBox(height: 12),
                  AttributeBar(
                    percent: monthPercent.clamp(0.0, 1.0),
                    gradientColors: [Colors.purple, Colors.blue],
                    height: 60,
                    label: '月',
                  ),
                  SizedBox(height: 12),
                  AttributeBar(
                    percent: dayPercent.clamp(0.0, 1.0),
                    gradientColors: [Colors.yellow, Colors.orange],
                    height: 40,
                    label: '日',
                  ),
                ],
              ),
              SizedBox(width: 32),
              // 右侧倒计时数字
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildCountdownNumber(countdown['years']!, 'years'),
                  _buildCountdownNumber(countdown['months']!, 'months'),
                  _buildCountdownNumber(countdown['days']!, 'days'),
                  SizedBox(height: 16),
                  Text(
                    'BEFORE I TURN 80',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    '2025 07 12',
                    style: TextStyle(fontSize: 18, color: Colors.black54),
                  ),
                  SizedBox(height: 4),
                  Text(
                    '梦想不会逃跑，逃跑的往往是我们自己。',
                    style: TextStyle(fontSize: 14, color: Colors.black54),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // 倒计时数字组件
  Widget _buildCountdownNumber(int value, String label) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          value.toString().padLeft(2, '0'),
          style: TextStyle(fontSize: 64, fontWeight: FontWeight.bold),
        ),
        SizedBox(width: 8),
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(
            label,
            style: TextStyle(fontSize: 16, color: Colors.black54),
          ),
        ),
      ],
    );
  }
}

// 属性条组件
class AttributeBar extends StatelessWidget {
  final double percent; // 0.0~1.0
  final List<Color> gradientColors;
  final double height;
  final String label;

  const AttributeBar({
    required this.percent,
    required this.gradientColors,
    required this.height,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            Container(
              width: 16,
              height: height,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: Colors.grey[300],
              ),
            ),
            Container(
              width: 16,
              height: height * percent,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: gradientColors,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 12)),
      ],
    );
  }
}
```

---

## 3. 说明与扩展

- 你可以把 `TodayPage` 作为 `main.dart` 的首页，或集成到你的主页面导航中。
- 生日、目标寿命可后续做成用户可设置的参数。
- 属性条和倒计时数字的样式、颜色、间距可根据实际UI进一步微调。
- 其它页面（日历、日记列表、编辑页）可用类似方式逐步实现。

---

如需**日历圆点矩阵**、**日记功能**等其它页面的详细实现，或遇到任何Flutter开发问题，欢迎随时提问！ 