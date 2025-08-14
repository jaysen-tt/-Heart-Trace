import 'dart:ui' as ui;
import 'dart:async';
// 移除: import 'dart:io';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
// 移除: import 'user_profile_page.dart';

// ========== 主页面结构 ==========

// 顶层倒计时计算函数
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

class MainPage extends StatefulWidget {
  const MainPage({super.key});
  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  late DateTime birthday;
  late int targetAge;
  bool _hasTriggeredInit = false; // 标记是否已初始化触发

  // 新增：保存生日到本地存储
  Future<void> _saveBirthdayToStorage(DateTime birthday) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_birthday', '${birthday.year}-${birthday.month.toString().padLeft(2, '0')}-${birthday.day.toString().padLeft(2, '0')}');
  }

  void updateCountdown(DateTime newBirthday, int newTargetAge) {
    setState(() {
      birthday = newBirthday;
      targetAge = newTargetAge;
    });
    _saveBirthdayToStorage(newBirthday); // 新增：同步保存
  }
  
  @override
  void initState() {
    super.initState();
    birthday = DateTime(1997, 7, 12);
    targetAge = 80;
    // 只在App启动时触发一次
    WidgetsBinding.instance.addPostFrameCallback((_) {
      updateCountdown(birthday, targetAge);
    });
  }
  
  @override
  Widget build(BuildContext context) {
    // 首次进入App时只触发一次onCountdownChanged
    if (!_hasTriggeredInit) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        updateCountdown(birthday, targetAge);
      });
      _hasTriggeredInit = true;
    }
    return Scaffold(
      backgroundColor: Color(0xFFDBD8D3),
      body: TodayPageContent(
        birthday: birthday,
        targetAge: targetAge,
        onCountdownChanged: updateCountdown,
      ),
    );
  }
}

// 首页内容部分（去掉Scaffold和bar，只保留Stack内容）
class TodayPageContent extends StatefulWidget {
  final DateTime birthday;
  final int targetAge;
  final void Function(DateTime, int) onCountdownChanged;
  const TodayPageContent({
    Key? key,
    required this.birthday,
    required this.targetAge,
    required this.onCountdownChanged,
  }) : super(key: key);
  @override
  State<TodayPageContent> createState() => _TodayPageContentState();
}

class _TodayPageContentState extends State<TodayPageContent> with TickerProviderStateMixin {
  late DateTime birthday;
  late int targetAge;
  late Timer _timer;
  late Map<String, int> countdown;
  late AnimationController _animController;
  late Animation<double> _yearAnim;
  late Animation<double> _monthAnim;
  late Animation<double> _dayAnim;
  late Animation<double> _targetAgeAnim;
  late List<AnimationController> _ballEntranceControllers;
  late List<Animation<double>> _ballEntranceAnims;
  late List<AnimationController> _ballBounceControllers;
  late List<Animation<double>> _ballBounceAnims;
  late AnimationController _pressController;
  late Animation<double> _pressAnim;
  late AnimationController _barPressController;
  late Animation<double> _barHeightAnim;
  int selectedYear = 2025;
  // 移除: File? userAvatar;

  @override
  void initState() {
    super.initState();
    birthday = widget.birthday;
    targetAge = widget.targetAge;
    countdown = getCountdown(birthday, targetAge);
    _timer = Timer.periodic(Duration(seconds: 1), (_) {
      setState(() {
        countdown = getCountdown(birthday, targetAge);
      });
    });
    // 移除: _loadAvatar();
    _initAnimations();
  }



  // 初始化动画控制器
  void _initAnimations() {
    _animController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 1800),
    );
    _yearAnim = Tween<double>(begin: -10, end: countdown['years']!.toDouble()).animate(
      CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
    );
    _monthAnim = Tween<double>(begin: -10, end: countdown['months']!.toDouble()).animate(
      CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
    );
    _dayAnim = Tween<double>(begin: -10, end: countdown['days']!.toDouble()).animate(
      CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
    );
    _targetAgeAnim = Tween<double>(begin: -10, end: targetAge.toDouble()).animate(
      CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
    );
    _ballEntranceControllers = List.generate(
      3,
      (index) => AnimationController(
        vsync: this,
        duration: Duration(milliseconds: 600 + index * 100),
      ),
    );
    _ballEntranceAnims = _ballEntranceControllers.map((controller) {
      return Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(parent: controller, curve: Curves.bounceOut),
      );
    }).toList();
    _ballBounceControllers = List.generate(
      3,
      (index) => AnimationController(
        vsync: this,
        duration: Duration(milliseconds: 800),
      ),
    );
    _ballBounceAnims = _ballBounceControllers.map((controller) {
      return Tween<double>(begin: 1.0, end: 1.15).animate(
        CurvedAnimation(parent: controller, curve: Curves.elasticOut),
      );
    }).toList();
    _pressController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 100),
    );
    _pressAnim = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _pressController, curve: Curves.easeInOut),
    );
    _barPressController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 150),
    );
    _barHeightAnim = Tween<double>(begin: 1.0, end: 0.85).animate(
      CurvedAnimation(parent: _barPressController, curve: Curves.easeInOut),
    );
    // 立即播放动画
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _animController.forward();
      for (int i = 0; i < _ballEntranceControllers.length; i++) {
        Future.delayed(Duration(milliseconds: i * 200), () {
          if (mounted) {
            _ballEntranceControllers[i].forward();
          }
        });
      }
    });
  }

  @override
  void didUpdateWidget(TodayPageContent oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.birthday != widget.birthday || oldWidget.targetAge != widget.targetAge) {
      birthday = widget.birthday;
      targetAge = widget.targetAge;
      countdown = getCountdown(birthday, targetAge);
      // 重新计算动画目标值
      _yearAnim = Tween<double>(begin: -10, end: countdown['years']!.toDouble()).animate(
        CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
      );
      _monthAnim = Tween<double>(begin: -10, end: countdown['months']!.toDouble()).animate(
        CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
      );
      _dayAnim = Tween<double>(begin: -10, end: countdown['days']!.toDouble()).animate(
        CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
      );
      _targetAgeAnim = Tween<double>(begin: -10, end: targetAge.toDouble()).animate(
        CurvedAnimation(parent: _animController, curve: Curves.elasticOut),
      );
      // 重新播放动画
      _animController.reset();
      _animController.forward();
    }
  }

  @override
  void dispose() {
    _timer.cancel();
    _animController.dispose();
    for (var controller in _ballEntranceControllers) {
      controller.dispose();
    }
    for (var controller in _ballBounceControllers) {
      controller.dispose();
    }
    _pressController.dispose();
    _barPressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final screenHeight = MediaQuery.of(context).size.height;
    final numberFontSize = (screenWidth * 0.2).clamp(70.0, 110.0);
    final labelFontSize = numberFontSize * 0.2;
    final ballSize = (screenWidth * 0.08).clamp(28.0, 36.0);
    final ballSpacing = screenWidth * 0.05;
    final barTop = screenHeight * 0.08;
    final barHeight = screenHeight * 0.5;
    final barSpacing = screenWidth * 0.06;
    return Stack(
      children: [
        // 背景色已在Scaffold设置
        // 数字倒计时（顶部居中）
        Positioned(
          left: 0,
          right: 0,
          top: barTop,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // YEARS 年
              Flexible(
                child: GestureDetector(
                  onTapDown: (_) => _barPressController.forward(),
                  onTapUp: (_) => _barPressController.reverse(),
                  onTapCancel: () => _barPressController.reverse(),
                  onTap: () {
                    _ballBounceControllers[0].forward().then((_) {
                      _ballBounceControllers[0].reverse();
                    });
                  },
                  child: AnimatedBuilder(
                    animation: _barHeightAnim,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _barHeightAnim.value,
                        child: Column(
                          children: [
                            AnimatedBuilder(
                              animation: _yearAnim,
                              builder: (context, child) {
                                return FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Text(
                                    _yearAnim.value.round().toString().padLeft(2, '0'),
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontSize: numberFontSize,
                                      fontFamily: 'Alibaba-PuHuiTi-Heavy',
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                );
                              },
                            ),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                'YEARS',
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: labelFontSize,
                                  fontFamily: 'Alibaba-PuHuiTi-Light',
                                  fontWeight: FontWeight.w100,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
              SizedBox(width: barSpacing.clamp(8.0, barSpacing)),
              // MONTHS 月
              Flexible(
                child: GestureDetector(
                  onTapDown: (_) => _barPressController.forward(),
                  onTapUp: (_) => _barPressController.reverse(),
                  onTapCancel: () => _barPressController.reverse(),
                  onTap: () {
                    _ballBounceControllers[1].forward().then((_) {
                      _ballBounceControllers[1].reverse();
                    });
                  },
                  child: AnimatedBuilder(
                    animation: _barHeightAnim,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _barHeightAnim.value,
                        child: Column(
                          children: [
                            AnimatedBuilder(
                              animation: _monthAnim,
                              builder: (context, child) {
                                return FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Text(
                                    _monthAnim.value.round().toString().padLeft(2, '0'),
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontSize: numberFontSize,
                                      fontFamily: 'Alibaba-PuHuiTi-Heavy',
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                );
                              },
                            ),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                'MONTHS',
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: labelFontSize,
                                  fontFamily: 'Alibaba-PuHuiTi-Light',
                                  fontWeight: FontWeight.w100,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
              SizedBox(width: barSpacing.clamp(8.0, barSpacing)),
              // DAYS 日
              Flexible(
                child: GestureDetector(
                  onTapDown: (_) => _barPressController.forward(),
                  onTapUp: (_) => _barPressController.reverse(),
                  onTapCancel: () => _barPressController.reverse(),
                  onTap: () {
                    _ballBounceControllers[2].forward().then((_) {
                      _ballBounceControllers[2].reverse();
                    });
                  },
                  child: AnimatedBuilder(
                    animation: _barHeightAnim,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _barHeightAnim.value,
                        child: Column(
                          children: [
                            AnimatedBuilder(
                              animation: _dayAnim,
                              builder: (context, child) {
                                return FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Text(
                                    _dayAnim.value.round().toString().padLeft(2, '0'),
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontSize: numberFontSize,
                                      fontFamily: 'Alibaba-PuHuiTi-Heavy',
                                      fontWeight: FontWeight.w400,
                                    ),
                                  ),
                                );
                              },
                            ),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                'DAYS',
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: labelFontSize,
                                  fontFamily: 'Alibaba-PuHuiTi-Light',
                                  fontWeight: FontWeight.w100,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
        // 'BEFORE I TURN' 英文标题
        Positioned(
          left: 0,
          right: 0,
          top: barTop + barHeight * 0.5,
          child: Column(
            children: [
              Text(
                'BEFORE I TURN',
                style: TextStyle(
                  color: Colors.black,
                  fontSize: 36.8,
                  fontFamily: 'Alibaba-PuHuiTi-Heavy',
                  fontWeight: FontWeight.w400,
                  letterSpacing: -0.5,
                ),
              ),
              SizedBox(height: 8),
              // 动画目标年龄
              GestureDetector(
                onTapDown: (_) => _pressController.forward(),
                onTapUp: (_) => _pressController.reverse(),
                onTapCancel: () => _pressController.reverse(),
                child: AnimatedBuilder(
                  animation: _pressAnim,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: _pressAnim.value,
                      child: AnimatedBuilder(
                        animation: _targetAgeAnim,
                        builder: (context, child) {
                          return Text(
                            _targetAgeAnim.value.round().toString(),
                            style: TextStyle(
                              color: Color(0xFFF86E00),
                              fontSize: 95,
                              fontFamily: 'Alibaba-PuHuiTi-Heavy',
                              fontWeight: FontWeight.w400,
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),

        // 日历区域（底部上方）
        Positioned(
          left: 0,
          right: 0,
          bottom: 20,
          child: SizedBox(
            height: 350,
            child: _CalendarSwiper(),
          ),
        ),
      ],
    );
  }
}

// 日历滑动组件，保持原UI不变，仅包裹滑动逻辑
class _CalendarSwiper extends StatefulWidget {
  const _CalendarSwiper({Key? key});
  @override
  State<_CalendarSwiper> createState() => _CalendarSwiperState();
}

class _CalendarSwiperState extends State<_CalendarSwiper> {
  late PageController _pageController;
  int _pageIndex = 1; // 0:上月 1:当前月 2:下月
  late DateTime _baseDate;
  final DateTime _today = DateTime(DateTime.now().year, DateTime.now().month);

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _baseDate = DateTime(now.year, now.month);
    _pageController = PageController(initialPage: _pageIndex);
  }

  void jumpToCurrentMonth() async {
    setState(() {
      _baseDate = _today;
    });
    int currentPage = _pageController.page?.round() ?? 1;
    if (currentPage < 1) {
      await _pageController.animateToPage(0, duration: Duration(milliseconds: 180), curve: Curves.linear);
      await Future.delayed(Duration(milliseconds: 30));
      await _pageController.animateToPage(1, duration: Duration(milliseconds: 420), curve: Curves.elasticOut);
    } else if (currentPage > 1) {
      await _pageController.animateToPage(2, duration: Duration(milliseconds: 180), curve: Curves.linear);
      await Future.delayed(Duration(milliseconds: 30));
      await _pageController.animateToPage(1, duration: Duration(milliseconds: 420), curve: Curves.elasticOut);
    } else {
      await _pageController.animateToPage(1, duration: Duration(milliseconds: 420), curve: Curves.elasticOut);
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  DateTime _getMonthDate(int offset) {
    return DateTime(_baseDate.year, _baseDate.month + offset);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      key: Key('calendar_container'),
      margin: EdgeInsets.symmetric(horizontal: 16),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Color(0xFF231815),
        borderRadius: BorderRadius.circular(40),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          return PageView.builder(
            controller: _pageController,
            itemCount: 3,
            physics: ClampingScrollPhysics(),
            onPageChanged: (index) {
              if (index == 0) {
                setState(() {
                  _baseDate = DateTime(_baseDate.year, _baseDate.month - 1);
                  _pageController.jumpToPage(1);
                });
              } else if (index == 2) {
                setState(() {
                  _baseDate = DateTime(_baseDate.year, _baseDate.month + 1);
                  _pageController.jumpToPage(1);
                });
              }
            },
            itemBuilder: (context, index) {
              int offset = index - 1;
              DateTime showDate = _getMonthDate(offset);
              return _CalendarStaticView(showDate: showDate);
            },
          );
        },
      ),
    );
  }
}

// 保持原日历UI不变，抽出为静态渲染组件
class _CalendarStaticView extends StatelessWidget {
  final DateTime showDate;
  const _CalendarStaticView({required this.showDate});

  @override
  Widget build(BuildContext context) {
    final year = showDate.year;
    final month = showDate.month;
    final today = DateTime.now();
    final isCurrentMonth = (today.year == year && today.month == month);
    final firstDayOfWeek = DateTime(year, month, 1).weekday % 7;
    final daysInMonth = DateTime(year, month + 1, 0).day;
    
    return Stack(
      children: [
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => Expanded(
                child: Text(
                  day,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w400,
                    color: ['M','T','W','T','F','S','S'].indexOf(day) == (DateTime.now().weekday % 7)
                        ? Color(0xFFF86E00)
                        : Color(0xFFC0BBB7),
                    letterSpacing: 1.5,
                  ),
                ),
              )).toList(),
            ),
            SizedBox(height: 8),
            Column(
              children: List.generate(5, (weekIndex) {
                return Padding(
                  padding: EdgeInsets.only(bottom: weekIndex < 4 ? 0.0 : 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(7, (dayIndex) {
                      final cellIndex = weekIndex * 7 + dayIndex;
                      int dayNumber = cellIndex - firstDayOfWeek + 1;
                      bool isPrevMonth = dayNumber <= 0;
                      bool isNextMonth = dayNumber > daysInMonth;
                      bool isCurrentMonth = !isPrevMonth && !isNextMonth;
                      bool isToday = isCurrentMonth && (year == today.year && month == today.month && dayNumber == today.day);
                      bool isPast = isCurrentMonth && (year < today.year || (year == today.year && month < today.month) || (year == today.year && month == today.month && dayNumber < today.day));
                      bool isFuture = isCurrentMonth && (year > today.year || (year == today.year && month > today.month) || (year == today.year && month == today.month && dayNumber > today.day));
                      
                      Color fillColor;
                      Color? borderColor;
                      if (isPrevMonth || isNextMonth) {
                        fillColor = Color(0xFF231815);
                        borderColor = Color(0xFF727171);
                      } else if (isToday) {
                        fillColor = Color(0xFFF86E00);
                        borderColor = null;
                      } else if (isPast) {
                        fillColor = Color(0xFFC0BBB7);
                        borderColor = null;
                      } else if (isFuture) {
                        fillColor = Color(0xFF727171);
                        borderColor = null;
                      } else {
                        fillColor = Color(0xFF231815);
                        borderColor = Color(0xFF727171);
                      }
                      
                      Widget dayCircle = Container(
                        margin: EdgeInsets.all(1.5),
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: fillColor,
                            shape: BoxShape.circle,
                            border: borderColor != null ? Border.all(color: borderColor, width: 1) : null,
                          ),
                        ),
                      );
                      
                      return Expanded(child: dayCircle);
                    }),
                  ),
                );
              }),
            ),
            SizedBox(height: 32),
          ],
        ),
        Positioned(
          left: 16,
          bottom: 2,
          child: Text(
            '${year.toString().padLeft(4, '0')}.${month.toString().padLeft(2, '0')}',
            style: TextStyle(
              color: Color(0xFFCBCAC7),
              fontSize: 13,
              fontFamily: 'Alibaba-PuHuiTi-Light',
              fontWeight: FontWeight.w400,
              letterSpacing: 0.5,
            ),
          ),
        ),
        if (!isCurrentMonth)
          Positioned(
            right: 16,
            bottom: 2,
            child: GestureDetector(
              onTap: () {
                final _calendarSwiperState = context.findAncestorStateOfType<_CalendarSwiperState>();
                _calendarSwiperState?.jumpToCurrentMonth();
              },
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                decoration: BoxDecoration(
                  color: Color(0xFFB0ADA9).withOpacity(0.13),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 6,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  '回到本月',
                  style: TextStyle(
                    color: Color(0xFFB0ADA9),
                    fontSize: 12,
                    fontFamily: 'Alibaba-PuHuiTi-Light',
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
