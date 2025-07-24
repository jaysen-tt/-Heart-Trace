import 'package:flutter/material.dart';
import 'package:jishiqi/utils/constants.dart';


class LoginForm extends StatefulWidget {
  final VoidCallback? onComplete;
  final VoidCallback? onSwitchToSignUp;
  final Function(String message)? onError;

  const LoginForm({
      Key? key,
      this.onComplete,
      this.onSwitchToSignUp,
      this.onError,
    }) : super(key: key);

  @override
  _LoginFormState createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;


  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "登录",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 26,
              ),
            ),
            const SizedBox(height: 16),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                    decoration: InputDecoration(
                      hintText: "电子邮箱",
                      hintStyle: const TextStyle(
                        fontWeight: FontWeight.normal,
                        color: Colors.grey,
                      ),
                      suffixIcon: Icon(
                        Icons.mail,
                        color: Colors.grey.shade400,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return '请输入电子邮箱';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),
                  TextFormField(
                    controller: _passwordController,
                  obscureText: true,
                  decoration: InputDecoration(
                      hintText: "密码",
                      hintStyle: const TextStyle(
                        fontWeight: FontWeight.normal,
                        color: Colors.grey,
                      ),
                      suffixIcon: Icon(
                        Icons.lock,
                        color: Colors.grey.shade400,
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return '请输入密码';
                      }
                      return null;
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: const Color.fromARGB(255, 239, 104, 80),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                onPressed: _isLoading ? null : () async {
                  if (_formKey.currentState!.validate()) {
                    setState(() => _isLoading = true);
                    try {
                      // 模拟登录请求延迟
                      await Future.delayed(Duration(seconds: 1));
                      // 获取表单输入值
                    final email = _emailController.text;
                    final password = _passwordController.text;

                    // 模拟登录验证 (正确账号: user@example.com, 正确密码: password123)
                    if (email == "user@example.com" && password == "password123") {
                      // 模拟登录成功
                      print('模拟登录成功: {email: "$email", token: "mock_token_123456"}');
                      widget.onComplete?.call();
                    } else {
                      // 模拟登录失败
                      if (mounted) {
                        widget.onError?.call('账号或密码错误，请重试');
                      }
                    }
                    } finally {
                      setState(() => _isLoading = false);
                    }
                  }
                },
                child: _isLoading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        "登录",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: GestureDetector(
                onTap: () => widget.onSwitchToSignUp?.call(),
                child: Text(
                  "没有账户？注册。",
                  style: TextStyle(fontSize: 16, color: Colors.blueGrey.shade300),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}