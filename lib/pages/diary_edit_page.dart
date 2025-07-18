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
    final XFile? image = await _picker.pickImage(
      source: await showModalBottomSheet<ImageSource>(
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
                title: Text('相册'),
                onTap: () => Navigator.pop(ctx, ImageSource.gallery),
              ),
            ],
          ),
        ),
      ) ?? ImageSource.gallery,
      imageQuality: 90,
      maxWidth: 1200,
    );
    if (image != null) {
      // 复制到私有目录
      final newPath = await ImageUtils.copyToPrivateDir(image.path);
      setState(() {
        _images.add(XFile(newPath));
      });
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
        actions: [],
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
                  if (_images.isNotEmpty || _files.isNotEmpty || _audioPaths.isNotEmpty || true)
                    SizedBox(
                      height: 90,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _images.length + _files.length + _audioPaths.length + 3,
                        separatorBuilder: (_, __) => SizedBox(width: 12),
                        itemBuilder: (context, idx) {
                          // 图片
                          if (idx < _images.length) {
                            final img = _images[idx];
                            return Stack(
                              children: [
                                GestureDetector(
                                  onTap: () => showDialog(
                                    context: context,
                                    barrierDismissible: true,
                                    builder: (_) => Dialog(
                                      backgroundColor: Colors.transparent,
                                      insetPadding: EdgeInsets.zero,
                                      child: SizedBox.expand(
                                        child: Stack(
                                          children: [
                                            PhotoViewGallery(
                                              pageOptions: _images.map((img) => PhotoViewGalleryPageOptions(
                                                imageProvider: FileImage(File(img.path)),
                                                minScale: PhotoViewComputedScale.contained,
                                                maxScale: PhotoViewComputedScale.covered * 3.0,
                                              )).toList(),
                                              backgroundDecoration: BoxDecoration(color: Colors.black),
                                              pageController: PageController(initialPage: idx),
                                              loadingBuilder: (context, event) => Center(child: CircularProgressIndicator()),
                                            ),
                                            Positioned(
                                              top: 40,
                                              right: 20,
                                              child: IconButton(
                                                icon: Icon(Icons.close, color: Colors.white, size: 32),
                                                onPressed: () => Navigator.of(context).pop(),
                                              ),
                                            ),
                                          ],
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
                                Positioned(
                                  top: 2,
                                  right: 2,
                                  child: GestureDetector(
                                    onTap: () => setState(() => _images.removeAt(idx)),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: Colors.black54,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(Icons.close, color: Colors.white, size: 18),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          }
                          // 文件
                          if (idx < _images.length + _files.length) {
                            final file = _files[idx - _images.length];
                            return Stack(
                              children: [
                                GestureDetector(
                                  onTap: () => _openFile(file),
                                  child: Container(
                                    width: 80,
                                    height: 80,
                                    decoration: BoxDecoration(
                                      color: Colors.blueGrey[50],
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(Icons.insert_drive_file, color: Colors.blueGrey, size: 32),
                                          SizedBox(height: 4),
                                          Text(
                                            file.name,
                                            style: TextStyle(fontSize: 11, color: Colors.black54),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: 2,
                                  right: 2,
                                  child: GestureDetector(
                                    onTap: () => setState(() => _files.removeAt(idx - _images.length)),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: Colors.black54,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(Icons.close, color: Colors.white, size: 18),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          }
                          // 录音
                          if (idx < _images.length + _files.length + _audioPaths.length) {
                            final audio = _audioPaths[idx - _images.length - _files.length];
                            final isPlaying = _playingAudio == audio;
                            return Stack(
                              children: [
                                GestureDetector(
                                  onTap: () => _playAudio(audio),
                                  child: Container(
                                    width: 80,
                                    height: 80,
                                    decoration: BoxDecoration(
                                      color: Colors.deepPurple[50],
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Center(
                                      child: Icon(
                                        isPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill,
                                        color: Colors.deepPurple,
                                        size: 36,
                                      ),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: 2,
                                  right: 2,
                                  child: GestureDetector(
                                    onTap: () => setState(() => _audioPaths.removeAt(idx - _images.length - _files.length)),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: Colors.black54,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(Icons.close, color: Colors.white, size: 18),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          }
                          // 添加图片按钮
                          if (idx == _images.length + _files.length + _audioPaths.length) {
                            return GestureDetector(
                              onTap: _pickImage,
                              child: Container(
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  color: Colors.grey[200],
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Icon(Icons.add_a_photo, color: Colors.black38, size: 32),
                              ),
                            );
                          }
                          // 添加文件按钮
                          if (idx == _images.length + _files.length + _audioPaths.length + 1) {
                            return GestureDetector(
                              onTap: _pickFile,
                              child: Container(
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  color: Colors.grey[200],
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Icon(Icons.attach_file, color: Colors.black38, size: 32),
                              ),
                            );
                          }
                          // 添加录音按钮
                          return GestureDetector(
                            onTap: _toggleRecord,
                            child: Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: _isRecording ? Colors.red[100] : Colors.grey[200],
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Icon(_isRecording ? Icons.stop : Icons.mic, color: _isRecording ? Colors.red : Colors.black38, size: 32),
                            ),
                          );
                        },
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