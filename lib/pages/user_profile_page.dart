import 'package:flutter/material.dart';
import 'package:rive/rive.dart';
import '../components/animated_btn.dart';
import '../utils/rive_utils.dart';

import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_cropper_platform_interface/image_cropper_platform_interface.dart' as icpi;
import 'dart:io';
import 'dart:ui' as ui;
import 'package:shared_preferences/shared_preferences.dart';
import 'onboarding_wrapper.dart';

class UserProfilePage extends StatefulWidget {
  final Function(String?)? onAvatarChanged;

  const UserProfilePage({
    super.key,
    this.onAvatarChanged,
  });

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  final _formKey = GlobalKey<FormState>();
  String _userName = '张三';
  String _userGender = '男';
  String _userEmail = 'example@test.com';
  String _userPhone = '13800138000';
  File? _profileImage;
  bool _isEditing = false;
  late RiveAnimationController _btnAnimationController;

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
    _btnAnimationController = OneShotAnimation(
      "active",
      autoplay: false,
    );
  }

  Future<void> _loadUserInfo() async {
    // 从本地存储加载用户信息的实现
    // 这里使用默认值作为示例
    setState(() {
      _userName = '张三';
      _userGender = '男';
      _userEmail = 'example@test.com';
      _userPhone = '13800138000';
    });
  }

  Future<void> _saveUserInfoToStorage() async {
    // 保存用户信息到本地存储的实现
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      setState(() => _isEditing = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('个人信息更新成功')),
        );
      }
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final pickedFile = await ImagePicker().pickImage(source: source);
    if (pickedFile != null) {
      await _cropImage(pickedFile.path);
    }
  }

  Future<void> _cropImage(String imagePath) async {
    final croppedFile = await ImageCropper().cropImage(
      sourcePath: imagePath,
      uiSettings: [
        icpi.AndroidUiSettings(
          toolbarTitle: '裁剪图片',
          toolbarColor: Colors.blue,
          toolbarWidgetColor: Colors.white,
          initAspectRatio: icpi.CropAspectRatioPreset.original,
          lockAspectRatio: false,
          hideBottomControls: true,
        ),
        icpi.IOSUiSettings(
          title: '裁剪图片',
          minimumAspectRatio: 1.0,
        ),
      ],
    );

    if (croppedFile != null) {
      setState(() => _profileImage = File(croppedFile.path));
      widget.onAvatarChanged?.call(croppedFile.path);
      // 这里可以添加图片上传到服务器的逻辑
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('图片裁剪已取消')),
        );
      }
    }
  }

  void _showEditDialog() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('编辑个人信息'),
        content: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  initialValue: _userName,
                  decoration: const InputDecoration(labelText: '姓名'),
                  validator: (value) => value!.isEmpty ? '请输入姓名' : null,
                  onSaved: (value) => _userName = value!,
                ),
                DropdownButtonFormField<String>(
                  value: _userGender,
                  decoration: const InputDecoration(labelText: '性别'),
                  items: const [
                    DropdownMenuItem(value: '男', child: Text('男')),
                    DropdownMenuItem(value: '女', child: Text('女')),
                  ],
                  onChanged: (value) => setState(() => _userGender = value!),
                ),
                TextFormField(
                  initialValue: _userEmail,
                  decoration: const InputDecoration(labelText: '邮箱'),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) => value!.isEmpty ? '请输入邮箱' : null,
                  onSaved: (value) => _userEmail = value!,
                ),
                TextFormField(
                  initialValue: _userPhone,
                  decoration: const InputDecoration(labelText: '电话'),
                  keyboardType: TextInputType.phone,
                  validator: (value) => value!.isEmpty ? '请输入电话' : null,
                  onSaved: (value) => _userPhone = value!,
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () {
              _saveUserInfoToStorage();
              Navigator.pop(dialogContext);
            },
            child: const Text('保存'),
          ),
        ],
      ),
    );
  }

  void _showLogoutConfirmDialog() {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('确认退出'),
        content: const Text('确定要退出当前账号吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () async {
              // 清除登录状态和引导页状态
              final prefs = await SharedPreferences.getInstance();
              await prefs.remove('has_seen_onboarding');
              await prefs.remove('auth_token');
              
              // 导航回引导页，将显示登录界面
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const OnboardingWrapper()),
              );
              Navigator.pop(dialogContext);
            },
            child: const Text('退出'),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileImage() {
    return Center(
      child: Stack(
        alignment: Alignment.bottomRight,
        children: [
          CircleAvatar(
              radius: 60,
              backgroundImage: _profileImage != null ? FileImage(_profileImage!) : null,
              child: _profileImage == null ? const Icon(Icons.person, size: 60, color: Colors.white) : null,
              backgroundColor: Colors.grey,
            ),
          AnimatedBtn(
            btnAnimationController: _btnAnimationController,
            press: () {
              _btnAnimationController.isActive = true;
              Future.delayed(const Duration(milliseconds: 800), () {
                showModalBottomSheet(
                  context: context,
                  builder: (context) => SafeArea(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        ListTile(
                          leading: const Icon(Icons.photo_library),
                          title: const Text('从相册选择'),
                          onTap: () {
                            Navigator.pop(context);
                            _pickImage(ImageSource.gallery);
                          },
                        ),
                        ListTile(
                          leading: const Icon(Icons.camera),
                          title: const Text('拍照'),
                          onTap: () {
                            Navigator.pop(context);
                            _pickImage(ImageSource.camera);
                          },
                        ),
                      ],
                    ),
                  ),
                );
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProfileItem(String title, String value) {
    return ListTile(
      title: Text(title),
      trailing: Text(value),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('个人信息'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: _showEditDialog,
          ),
        ],
      ),
      body: ListView(
        children: [
          const SizedBox(height: 30),
          _buildProfileImage(),
          const SizedBox(height: 30),
          _buildProfileItem('姓名', _userName),
          _buildProfileItem('性别', _userGender),
          _buildProfileItem('邮箱', _userEmail),
          _buildProfileItem('电话', _userPhone),
          const Divider(height: 1),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('退出登录', style: TextStyle(color: Colors.red)),
            onTap: _showLogoutConfirmDialog,
          ),
        ],
      ),
    );
  }
}