import 'package:flutter/material.dart';
import 'package:rive/rive.dart';
import '../utils/rive_utils.dart';

class AnimatedBtn extends StatelessWidget {
  final RiveAnimationController btnAnimationController;
  final VoidCallback press;

  const AnimatedBtn({
    super.key,
    required this.btnAnimationController,
    required this.press,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: press,
      child: SizedBox(
        height: 56,
        width: 200,
        child: Stack(
          children: [
            RiveAnimation.asset(
              "assets/RiveAssets/button.riv",
              controllers: [btnAnimationController],
            ),
            Positioned.fill(
              top: 8,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.arrow_right_alt),
                  SizedBox(width: 8),
                  Text(
                    "更换头像",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}