import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_cropper_platform_interface/image_cropper_platform_interface.dart' as icpi;
import 'dart:io';

import 'package:shared_preferences/shared_preferences.dart';
import 'today_page.dart';

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
  @override
  void initState() {
    super.initState();
    _loadUserInfo();
  }

  Future<void> _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userName = prefs.getString('user_name') ?? '';
      _userGender = prefs.getString('user_gender') ?? '';
      _userEmail = prefs.getString('user_email') ?? '';
      _userPhone = prefs.getString('user_phone') ?? '';
      
      // 加载头像
      final avatarPath = prefs.getString('user_avatar_path');
      if (avatarPath != null && File(avatarPath).existsSync()) {
        _profileImage = File(avatarPath);
      } else {
        _profileImage = null;
      }
    });
  }

  Future<void> _saveUserInfoToStorage() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_name', _userName);
      await prefs.setString('user_gender', _userGender);
      await prefs.setString('user_email', _userEmail);
      await prefs.setString('user_phone', _userPhone);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('个人信息更新成功')),
        );
      }
    }
  }

  Future<void> resetUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_name');
    await prefs.remove('user_gender');
    await prefs.remove('user_email');
    await prefs.remove('user_phone');
    await prefs.remove('user_avatar_path');
    // 清除倒计时相关数据
    await prefs.remove('target_age');
    await prefs.remove('user_birthday');
    

    
    setState(() {
      _userName = '';
      _userGender = '';
      _userEmail = '';
      _userPhone = '';
      _profileImage = null;
    });
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
            initAspectRatio: icpi.CropAspectRatioPreset.square,
            lockAspectRatio: true,
            hideBottomControls: true,
          ),
          icpi.IOSUiSettings(
            title: '裁剪图片',
            aspectRatioPresets: [icpi.CropAspectRatioPreset.square],
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
                  value: _userGender, // 默认选中初始化值
                  decoration: const InputDecoration(labelText: '性别'),
                  items: const [
                    DropdownMenuItem(value: '男', child: Text('男')),
                    DropdownMenuItem(value: '女', child: Text('女')),
                    DropdownMenuItem(value: '其他', child: Text('其他')),
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
                // 执行异步操作
                final prefs = await SharedPreferences.getInstance();
                await prefs.setBool('isLoggedIn', false);
                
                // 延迟到下一帧并在使用前捕获上下文
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) {
                    // 忽略安全上下文使用的lint误报
                    // ignore: use_build_context_synchronously
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const MainPage()),
                    );
                  }
                });
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
                  backgroundColor: Colors.grey,
                  child: _profileImage == null ? const Icon(Icons.person, size: 60, color: Colors.white) : null,
                ),
            // 添加Padding避免按钮与头像重叠
            Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.blue,
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: Icon(Icons.edit, color: Colors.white, size: 20),
                onPressed: () {
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
                },
              ),
            ),
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