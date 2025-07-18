import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:open_file/open_file.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';
import '../utils/image_utils.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';
import 'package:flutter/services.dart';
import 'package:reorderables/reorderables.dart';

class DiaryEditPage extends StatefulWidget {
  final Map<String, dynamic>? entry;
  const DiaryEditPage({super.key, this.entry});
  @override
  State<DiaryEditPage> createState() => _DiaryEditPageState();
}

class _DiaryEditPageState extends State<DiaryEditPage> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  String? _selectedMood;
  DateTime _selectedDate = DateTime.now();
  int _contentLength = 0;
  final List<XFile> _images = [];
  final ImagePicker _picker = ImagePicker();
  final List<PlatformFile> _files = [];
  // 录音文件列表（可扩展）
  final List<String> _audioPaths = [];
  final AudioRecorder _recorder = AudioRecorder();
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isRecording = false;
  String? _playingAudio;
  bool _isMultiSelect = false;
  List<bool> _selectedImages = [];

  @override
  void initState() {
    super.initState();
    if (widget.entry != null) {
      _titleController.text = widget.entry!['title'];
      _contentController.text = widget.entry!['content'];
      _selectedMood = widget.entry!['mood'];
      _selectedDate = widget.entry!['date'];
      // 附件还原
      if (widget.entry!['images'] != null) {
        _images.addAll((widget.entry!['images'] as List).map((e) => XFile(e.toString())));
      }
      if (widget.entry!['files'] != null) {
        _files.addAll((widget.entry!['files'] as List).map((e) => PlatformFile(name: e.toString().split('/').last, path: e.toString(), size: 0)));
      }
      if (widget.entry!['audios'] != null) {
        _audioPaths.addAll((widget.entry!['audios'] as List).map((e) => e.toString()));
      }
    }
    _contentLength = _contentController.text.length;
    _contentController.addListener(() {
      setState(() {
        _contentLength = _contentController.text.length;
      });
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  void _saveDiary() {
    final newEntry = {
      'id': widget.entry?['id'] ?? DateTime.now().millisecondsSinceEpoch,
      'title': _titleController.text,
      'content': _contentController.text,
      'date': _selectedDate,
      'mood': _selectedMood ?? 'neutral',
      'images': _images.map((e) => e.path).toList(),
      'files': _files.map((e) => e.path).toList(),
      'audios': _audioPaths,
    };
    // 只保存，不自动返回
    // 可扩展保存成功提示
    // Navigator.pop(context, newEntry);
    // 你可以在需要时手动返回
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _pickImage() async {
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.camera_alt),
              title: Text('拍照'),
              onTap: () => Navigator.pop(ctx, ImageSource.camera),
            ),
            ListTile(
              leading: Icon(Icons.photo_library),
              title: Text('相册（多选）'),
              onTap: () => Navigator.pop(ctx, ImageSource.gallery),
            ),
          ],
        ),
      ),
    );
    if (source == ImageSource.camera) {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 90,
        maxWidth: 1200,
      );
      if (image != null) {
        final newPath = await ImageUtils.copyToPrivateDir(image.path);
        setState(() {
          _images.add(XFile(newPath));
          _selectedImages.add(false);
        });
      }
    } else if (source == ImageSource.gallery) {
      final List<XFile>? images = await _picker.pickMultiImage(
        imageQuality: 90,
        maxWidth: 1200,
      );
      if (images != null && images.isNotEmpty) {
        final List<XFile> copied = [];
        for (final img in images) {
          final newPath = await ImageUtils.copyToPrivateDir(img.path);
          copied.add(XFile(newPath));
        }
        setState(() {
          _images.addAll(copied);
          _selectedImages.addAll(List.generate(copied.length, (i) => false));
        });
      }
    }
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles();
    if (result != null && result.files.isNotEmpty) {
      setState(() {
        _files.add(result.files.first);
      });
    }
  }

  Future<void> _openFile(PlatformFile file) async {
    await OpenFile.open(file.path);
  }

  Future<void> _toggleRecord() async {
    if (_isRecording) {
      final path = await _recorder.stop();
      if (path != null) {
        setState(() {
          _audioPaths.add(path);
        });
      }
    } else {
      final dir = await getTemporaryDirectory();
      final filePath = path.join(dir.path, '${DateTime.now().millisecondsSinceEpoch}.m4a');
      await _recorder.start(const RecordConfig(), path: filePath);
    }
    setState(() {
      _isRecording = !_isRecording;
    });
  }

  Future<void> _playAudio(String path) async {
    if (_playingAudio == path) {
      await _audioPlayer.stop();
      setState(() => _playingAudio = null);
    } else {
      await _audioPlayer.play(DeviceFileSource(path));
      setState(() => _playingAudio = path);
      _audioPlayer.onPlayerComplete.listen((_) {
        setState(() => _playingAudio = null);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('yyyy MM dd').format(_selectedDate);
    final moods = [
      {'name': '开心', 'icon': Icons.emoji_emotions, 'color': Colors.yellow},
      {'name': '平静', 'icon': Icons.accessibility_new, 'color': Colors.blue},
      {'name': '高效', 'icon': Icons.check_circle, 'color': Colors.green},
      {'name': '担忧', 'icon': Icons.warning, 'color': Colors.orange},
      {'name': '生气', 'icon': Icons.emoji_emotions_outlined, 'color': Colors.red},
      {'name': '难过', 'icon': Icons.emoji_events, 'color': Colors.blueGrey},
    ];
    return Scaffold(
      backgroundColor: Color(0xFFDBD8D3),
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: Colors.black87),
          onPressed: () => Navigator.pop(context, {
            'id': widget.entry?['id'] ?? DateTime.now().millisecondsSinceEpoch,
            'title': _titleController.text,
            'content': _contentController.text,
            'date': _selectedDate,
            'mood': _selectedMood ?? 'neutral',
            'images': _images.map((e) => e.path).toList(),
            'files': _files.map((e) => e.path).toList(),
            'audios': _audioPaths,
          }),
        ),
        title: GestureDetector(
          onTap: _selectDate,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                dateStr,
                style: TextStyle(
                  color: Colors.black87,
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 1.2,
                ),
              ),
              SizedBox(width: 6),
              Icon(Icons.edit_calendar, color: Colors.black38, size: 18),
            ],
          ),
        ),
        centerTitle: true,
        // AppBar actions 恢复更多按钮，补充“添加照片”入口
        actions: [
          IconButton(
            icon: Icon(Icons.more_vert, color: Colors.black54),
            onPressed: () async {
              final action = await showModalBottomSheet<String>(
                context: context,
                builder: (ctx) => SafeArea(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ListTile(
                        leading: Icon(Icons.photo_library),
                        title: Text('添加照片'),
                        onTap: () => Navigator.pop(ctx, 'add_photo'),
                      ),
                      ListTile(
                        leading: Icon(Icons.insert_drive_file),
                        title: Text('添加文件'),
                        onTap: () => Navigator.pop(ctx, 'add_file'),
                      ),
                      ListTile(
                        leading: Icon(Icons.mic),
                        title: Text('录音'),
                        onTap: () => Navigator.pop(ctx, 'record'),
                      ),
                      ListTile(
                        leading: Icon(Icons.manage_accounts),
                        title: Text('批量管理/排序'),
                        onTap: () => Navigator.pop(ctx, 'manage'),
                      ),
                      ListTile(
                        leading: Icon(Icons.cancel),
                        title: Text('取消'),
                        onTap: () => Navigator.pop(ctx, null),
                      ),
                    ],
                  ),
                ),
              );
              if (action == 'add_photo') {
                await _pickImage();
              } else if (action == 'add_file') {
                await _pickFile();
              } else if (action == 'record') {
                await _toggleRecord();
              } else if (action == 'manage') {
                setState(() => _isMultiSelect = true);
              }
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Stack(
          children: [
            Padding(
              padding: EdgeInsets.only(left: 16, right: 16, bottom: 0, top: 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 标题
                  TextField(
                    controller: _titleController,
                    style: TextStyle(
                      color: Colors.black87,
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                    ),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintText: '请输入标题',
                      hintStyle: TextStyle(
                        color: Colors.black26,
                        fontSize: 24,
                      ),
                      contentPadding: EdgeInsets.zero,
                    ),
                    maxLines: 1,
                  ),
                  SizedBox(height: 8),
                  // 心情选择
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: moods.map((mood) {
                        final isSelected = _selectedMood == mood['name'];
                        return Padding(
                          padding: const EdgeInsets.only(right: 12),
                          child: ChoiceChip(
                            label: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(mood['icon'] as IconData, color: isSelected ? mood['color'] as Color : Colors.grey[400], size: 18),
                                SizedBox(width: 2),
                                Text(
                                  mood['name'] as String,
                                  style: TextStyle(
                                    color: isSelected ? mood['color'] as Color : Colors.grey[400],
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                            selected: isSelected,
                            selectedColor: Colors.grey[200],
                            backgroundColor: Colors.transparent,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            onSelected: (_) => setState(() => _selectedMood = mood['name'] as String),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  SizedBox(height: 8),
                  // 图片/附件区域
                  if (_images.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8, bottom: 8),
                      child: SizedBox(
                        height: 90,
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: List.generate(_images.length, (idx) {
                              final img = _images[idx];
                              return Padding(
                                padding: const EdgeInsets.only(right: 12),
                                child: GestureDetector(
                                  onTap: () => showDialog(
                                    context: context,
                                    barrierDismissible: true,
                                    builder: (_) => Dialog(
                                      backgroundColor: Colors.transparent,
                                      insetPadding: EdgeInsets.zero,
                                      child: SizedBox.expand(
                                        child: _FullScreenImageGallery(
                                          images: _images,
                                          initialIndex: idx,
                                          onDelete: (index) {
                                            setState(() {
                                              _images.removeAt(index);
                                              _selectedImages.removeAt(index);
                                            });
                                          },
                                        ),
                                      ),
                                    ),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(16),
                                    child: Image.file(
                                      File(img.path),
                                      width: 80,
                                      height: 80,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                              );
                            }),
                          ),
                        ),
                      ),
                    ),
                  SizedBox(height: 8),
                  // 正文
                  Expanded(
                    child: TextField(
                      controller: _contentController,
                      style: TextStyle(
                        color: Colors.black87,
                        fontSize: 17,
                        height: 1.7,
                      ),
                      decoration: InputDecoration(
                        border: InputBorder.none,
                        hintText: '请输入正文...',
                        hintStyle: TextStyle(color: Colors.black26, fontSize: 17),
                        contentPadding: EdgeInsets.zero,
                      ),
                      keyboardType: TextInputType.multiline,
                      maxLines: null,
                      minLines: 10,
                    ),
                  ),
                  SizedBox(height: 56), // 预留底部按钮空间
                ],
              ),
            ),
            // 左下角字数统计
            Positioned(
              left: 24,
              bottom: 24,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '字数 $_contentLength',
                  style: TextStyle(
                    color: Colors.black54,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
            // 右下角悬浮保存按钮
            Positioned(
              right: 24,
              bottom: 16,
              child: FloatingActionButton(
                onPressed: _saveDiary,
                backgroundColor: Colors.deepPurpleAccent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Icon(Icons.check, color: Colors.white, size: 32),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// 新增全屏图片浏览组件，支持下载和长按保存
class _FullScreenImageGallery extends StatefulWidget {
  final List<XFile> images;
  final int initialIndex;
  final Function(int)? onDelete;
  const _FullScreenImageGallery({required this.images, required this.initialIndex, this.onDelete});
  @override
  State<_FullScreenImageGallery> createState() => _FullScreenImageGalleryState();
}

class _FullScreenImageGalleryState extends State<_FullScreenImageGallery> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _currentIndex);
  }

  Future<void> _saveImage() async {
    final file = File(widget.images[_currentIndex].path);
    final bytes = await file.readAsBytes();
    final result = await ImageGallerySaver.saveImage(bytes);
    if (result['isSuccess'] == true || result['isSuccess'] == 1) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('已保存到相册')));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('保存失败')));
    }
  }

  void _onLongPress() async {
    final action = await showModalBottomSheet<String>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.save_alt),
              title: Text('保存到相册'),
              onTap: () => Navigator.pop(ctx, 'save'),
            ),
            ListTile(
              leading: Icon(Icons.cancel),
              title: Text('取消'),
              onTap: () => Navigator.pop(ctx, null),
            ),
          ],
        ),
      ),
    );
    if (action == 'save') {
      await _saveImage();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        PhotoViewGallery(
          pageOptions: widget.images.map((img) => PhotoViewGalleryPageOptions(
            imageProvider: FileImage(File(img.path)),
            minScale: PhotoViewComputedScale.contained,
            maxScale: PhotoViewComputedScale.covered * 3.0,
            heroAttributes: PhotoViewHeroAttributes(tag: img.path),
            // onTapUp: (_, __, ___) {},
          )).toList(),
          backgroundDecoration: BoxDecoration(color: Colors.black),
          pageController: _pageController,
          loadingBuilder: (context, event) => Center(child: CircularProgressIndicator()),
          onPageChanged: (i) => setState(() => _currentIndex = i),
        ),
        // 用手势包裹，支持长按
        Positioned.fill(
          child: GestureDetector(
            onLongPress: _onLongPress,
            behavior: HitTestBehavior.translucent,
            child: Container(),
          ),
        ),
        Positioned(
          top: 40,
          right: 20,
          child: Row(
            children: [
              IconButton(
                icon: Icon(Icons.save_alt, color: Colors.white, size: 28),
                onPressed: _saveImage,
                tooltip: '保存到相册',
              ),
              SizedBox(width: 8),
              IconButton(
                icon: Icon(Icons.close, color: Colors.white, size: 32),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
        if (widget.images.length > 1)
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  '${_currentIndex + 1} / ${widget.images.length}',
                  style: TextStyle(color: Colors.white, fontSize: 16),
                ),
              ),
            ),
          ),
      ],
    );
  }
}