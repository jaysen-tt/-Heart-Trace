import 'package:flutter/material.dart';
import '../../services/auth_service.dart';

class SignUpForm extends StatefulWidget {
  final VoidCallback? onComplete;
  final VoidCallback onSwitchToLogin;
  final void Function(String)? onError;

  const SignUpForm({
    Key? key,
    this.onComplete,
    required this.onSwitchToLogin,
    this.onError,
  }) : super(key: key);

  @override
  _SignUpFormState createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

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
              "创建账户",
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
                    keyboardType: TextInputType.emailAddress,
  controller: _emailController,
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
                      return null; // 虚拟登录：跳过邮箱格式验证
                    },
                  ),
                  const SizedBox(height: 24),
                  TextFormField(
                    obscureText: true,
  controller: _passwordController,
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
                      return null; // 虚拟登录：跳过密码长度验证
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
              final String email = _emailController.text.trim();
              final String password = _passwordController.text.trim();
              // 调用注册服务接口
              await AuthService.register(email, password);
              widget.onComplete?.call();
            } catch (e) {
              if (widget.onError != null) {
                widget.onError!(e.toString());
              } else {
                print('注册错误: $e');
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
                "注册",
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
          behavior: HitTestBehavior.opaque,
          onTap: () => widget.onSwitchToLogin?.call(),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: RichText(
              text: TextSpan(
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.blueGrey.shade300,
                ),
                children: [
                  TextSpan(text: "已有账户？"),
                  TextSpan(
                    text: "登录",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  TextSpan(text: "。"),
                ],
              ),
            ),
          ),
        ),
    )
          ],
        ),
      ),
    );
  }
}
