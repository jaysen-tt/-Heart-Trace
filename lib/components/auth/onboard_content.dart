import 'package:flutter/material.dart';
import 'landed_content.dart';
import 'sign_up_form.dart';
import 'login_form.dart';
import 'package:jishiqi/utils/constants.dart';

class OnboardContent extends StatefulWidget {
  final VoidCallback? onComplete;
  final PageController pageController;
  final Function(String)? onError;
  const OnboardContent({
    super.key,
    this.onComplete,
    required this.pageController,
    this.onError,
  });

  @override
  State<OnboardContent> createState() => _OnboardContentState();
}

class _OnboardContentState extends State<OnboardContent> {
  late PageController _pageController;
  bool isLoginMode = false;
  // double _progress;
  @override
  void initState() {
    _pageController = widget.pageController;
    _pageController.addListener(() {
      setState(() {});
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final double progress =
        _pageController.hasClients ? (_pageController.page ?? 0) : 0;

    return SizedBox(
      height: 400 + progress * 160,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Column(
            children: [
              const SizedBox(height: 16),
              Expanded(
                child: PageView(
                  controller: _pageController,
                  children: [
  LandingContent(),
  Container(
    key: ValueKey(isLoginMode),
    child: isLoginMode ? LoginForm(
      key: UniqueKey(),
      onComplete: widget.onComplete,
      onSwitchToSignUp: () => setState(() => isLoginMode = false),
      onError: widget.onError,
    ) : SignUpForm(
      key: UniqueKey(),
      onComplete: widget.onComplete,
      onSwitchToLogin: () => setState(() => isLoginMode = true),
    ),
  ),
],
                ),
              ),
            ],
          ),
          Positioned(
            height: 56,
            bottom: 120 - progress * 40,
            right: 16,
            child: GestureDetector(
              onTap: () {
                if (_pageController.page! < 0.5) {
                  _pageController.animateToPage(1,
                      duration: const Duration(milliseconds: 400),
                      curve: Curves.ease);
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.all(Radius.circular(25)),
                  gradient: LinearGradient(
                    begin: Alignment.bottomLeft,
                    end: Alignment.topRight,
                    stops: [0.4, 0.8],
                    colors: [
                      Color.fromARGB(255, 239, 104, 80),
                      Color.fromARGB(255, 139, 33, 146)
                    ],
                  ),
                ),
                child: DefaultTextStyle(
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 92 + progress * 32,
                        child: Stack(
                          fit: StackFit.passthrough,
                          children: [
                            FadeTransition(
                              opacity: AlwaysStoppedAnimation(1 - progress),
                              child: const Text("开始使用"),
                            ),
                            FadeTransition(
                              opacity: AlwaysStoppedAnimation(progress),
                              child: Text(
                              isLoginMode ? "登录" : "创建账户",
                              maxLines: 1,
                              overflow: TextOverflow.fade,
                              softWrap: false,
                            ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right,
                        size: 24,
                        color: Colors.white,
                      )
                    ],
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}
