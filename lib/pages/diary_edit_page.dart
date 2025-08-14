import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:async';

import 'package:path_provider/path_provider.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';
import '../services/diary_local_storage.dart';
import '../services/diary_entry.dart';

class DiaryEditPage extends StatefulWidget {
  final DiaryEntry? entry;
  const DiaryEditPage({super.key, this.entry});
  @override
  State<DiaryEditPage> createState() => _DiaryEditPageState();
}

class _DiaryEditPageState extends State<DiaryEditPage> with SingleTickerProviderStateMixin {
  // Mood definitions - moved to class level for access in initState
  final List<Map<String, dynamic>> moods = [
    {'name': '开心', 'icon': Icons.emoji_emotions, 'color': const Color(0xFFFFEB3B)},
    {'name': '平静', 'icon': Icons.accessibility_new, 'color': const Color(0xFF2196F3)},
    {'name': '高效', 'icon': Icons.check_circle, 'color': const Color(0xFF4CAF50)},
    {'name': '担忧', 'icon': Icons.warning, 'color': const Color(0xFFFF9800)},
    {'name': '生气', 'icon': Icons.emoji_emotions_outlined, 'color': const Color(0xFFF44336)},
    {'name': '难过', 'icon': Icons.emoji_events, 'color': const Color(0xFF607D8B)},
    {'name': 'neutral', 'icon': Icons.sentiment_neutral, 'color': const Color(0xFF9E9E9E)},
  ];

  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  String? _selectedMood;
  DateTime _selectedDate = DateTime.now();
  int _contentLength = 0;
  final List<XFile> _images = [];


  @override
  void initState() {
    super.initState();
    if (widget.entry != null) {
      _titleController.text = widget.entry!.title;
      _contentController.text = widget.entry!.content;
      // Handle mood conversion from old int type to new string type
        if (widget.entry!.mood is int) {
          final colorValue = widget.entry!.mood as int;
          final matchingMood = moods.firstWhere(
            (m) => (m['color'] as Color).value == colorValue,
            orElse: () => moods.firstWhere((m) => m['name'] == 'neutral'),
          );
          _selectedMood = matchingMood['name'] as String;
        } else if (widget.entry!.mood is String) {
          _selectedMood = widget.entry!.mood as String;
        } else {
          _selectedMood = 'neutral';
        }
      _selectedDate = widget.entry!.date;
      _images.addAll((widget.entry!.images).map((e) => XFile(e.toString())));

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

  Future<void> _saveDiary() async {
    // 处理新建日记时widget.entry为null的情况

    final newEntry = DiaryEntry(
      id: widget.entry?.id ?? DateTime.now().millisecondsSinceEpoch.toString(),
      title: _titleController.text,
      content: _contentController.text,
      date: _selectedDate,
      mood: _selectedMood ?? 'neutral',
      images: _images.map((e) => e.path).toList(),

      files: [],
      audios: [],
    );
    try {
      final storage = DiaryLocalStorage();
      if (widget.entry != null) {
        await storage.updateDiary(newEntry);
      } else {
        await storage.createDiary(newEntry);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('日记保存成功！'),
            duration: Duration(milliseconds: 500),
          ),
        );
      }
      if (mounted) Navigator.pop(context, newEntry);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('保存失败：$e')),
        );
      }
    }
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );
    if (!mounted) return;
    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _pickImage() async {
    final pickedFile = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (!mounted) return;
    if (pickedFile != null) {
      setState(() {
        _images.add(XFile(pickedFile.path));
      });
    }
  }



  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('yyyy MM dd').format(_selectedDate);
    return Scaffold(
      backgroundColor: const Color(0xFFF9F7F5),
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        shadowColor: Colors.black12,
        shape: const Border(bottom: BorderSide(color: Color(0x1A000000), width: 1)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black87),
          onPressed: () => Navigator.pop(context, {
            'id': widget.entry?.id ?? (DateTime.now().millisecondsSinceEpoch % 0xFFFFFFFF),
            'title': _titleController.text,
            'content': _contentController.text,
            'date': _selectedDate,
            'mood': _selectedMood ?? 'neutral',
            'images': _images.map((e) => e.path).toList(),
    
            
          }),
        ),
        title: GestureDetector(
          onTap: _selectDate,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                dateStr,
                style: const TextStyle(
                  color: Colors.black87,
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 0.3
                )
              ),
              const SizedBox(width: 6),
            ],
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert, color: Colors.black54),
            onPressed: () async {
              final action = await showModalBottomSheet<String>(
                context: context,
                builder: (ctx) => SafeArea(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ListTile(
                        leading: const Icon(Icons.photo_library),
                        title: const Text('添加照片'),
                        onTap: () => Navigator.pop(ctx, 'add_photo'),
                      ),
                      ListTile(
                        leading: const Icon(Icons.cancel),
                        title: const Text('取消'),
                        onTap: () => Navigator.pop(ctx, null),
                      ),
                    ],
                  ),
                ),
              );
              if (action == 'add_photo') {
                await _pickImage();
              }
            },
          ),
        ],
      ),
      body: GestureDetector(
        onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
        behavior: HitTestBehavior.translucent,
        child: SafeArea(
            child: Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 16, right: 16, bottom: 0, top: 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 标题
                      TextField(
                        controller: _titleController,
                        style: const TextStyle(
                          color: Colors.black87,
                          fontSize: 26,
                          fontWeight: FontWeight.w600,
                          height: 1.2,
                        ),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: '请输入标题',
                          hintStyle: TextStyle(
                            color: Color(0xFF9CA3AF),
                            fontSize: 26,
                            fontWeight: FontWeight.w400,
                          ),
                          contentPadding: EdgeInsets.zero,
                        ),
                        maxLines: 1,
                      ),
                      const SizedBox(height: 8),
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
                                    const SizedBox(width: 2),
                                    Text(
                                      mood['name'] as String,
                                      style: TextStyle(
                              color: isSelected ? mood['color'] as Color : const Color(0xFF6B7280),
                              fontSize: 14,
                              fontWeight: isSelected ? FontWeight.w500 : FontWeight.w400,
                            ),
                                    ),
                                  ],
                                ),
                                selected: isSelected,
                                selectedColor: (mood['color'] as Color).withOpacity(0.15),
                                backgroundColor: Colors.transparent,
                                side: BorderSide(
                                  color: isSelected ? (mood['color'] as Color) : Colors.transparent,
                                  width: 1.2,
                                ),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                onSelected: (_) => setState(() => _selectedMood = mood['name'] as String),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 8),
                      // 图片/附件区域
                      if (_images.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 12, bottom: 12),
                          child: SizedBox(
                            height: 100,
                            child: SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: List.generate(_images.length, (idx) {
                                  final img = _images[idx];
                                  return Padding(
                                    padding: const EdgeInsets.only(right: 16),
                                    child: Stack(
                                      children:
                                      [
                                        GestureDetector(
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
                                                    });
                                                  },
                                                ),
                                              ),
                                            ),
                                          ),
                                          child: ClipRRect(
                                            borderRadius: BorderRadius.circular(18),
                                            child: Image.file(
                                              File(img.path),
                                              width: 90,
                                              height: 90,
                                              fit: BoxFit.cover,
                                            ),
                                          ),
                                        ),
                                        Positioned(
                                          top: -8,
                                          right: -8,
                                          child: PopupMenuButton(
                                            icon: Container(
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius: BorderRadius.circular(50),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: Colors.black12,
                                                    blurRadius: 2,
                                                    spreadRadius: 1,
                                                  )
                                                ]
                                              ),
                                              child: const Icon(Icons.more_vert,
                                                color: Colors.black54,
                                                size: 18,
                                              ),
                                            ),
                                            itemBuilder: (context) => [
                                              PopupMenuItem(
                                                value: 'delete',
                                                child: Row(
                                                  children: const [
                                                    Icon(Icons.delete, size: 18, color: Colors.black54),
                                                    SizedBox(width: 8),
                                                    Text('删除照片', style: TextStyle(color: Colors.black54)),
                                                  ],
                                                ),
                                              ),
                                            ],
                                            onSelected: (value) {
                                              if (value == 'delete') {
                                                setState(() {
                                                  _images.removeAt(idx);
                                                });
                                              }
                                            },
                                          ),
                                        )
                                      ],
                                    ),
                                  );
                                }),
                              ),
                            ),
                          ),
                        ),
                      const SizedBox(height: 8),
                        // 正文
                        Expanded(
                          child: TextField(
                            controller: _contentController,
                            style: const TextStyle(
                              color: Colors.black87,
                              fontSize: 17,
                              height: 1.7,
                            ),
                            decoration: const InputDecoration(
                              border: InputBorder.none,
                              hintText: '请输入正文...',
                              hintStyle: TextStyle(color: Color(0xFF9CA3AF), fontSize: 17),
                              contentPadding: EdgeInsets.zero,
                            ),
                            keyboardType: TextInputType.multiline,
                            maxLines: null,
                            minLines: 10,
                          ),
                        ),
                        const SizedBox(height: 56), // 预留底部按钮空间
                    ],
                  ),
                ),
                // 左下角字数统计
                Positioned(
                  left: 24,
                  bottom: 24,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 2,
                          offset: const Offset(0, 1),
                        )
                      ]
                    ),
                    child: Text(
                      '字数 $_contentLength',
                      style: const TextStyle(
                        color: Color(0xFF4B5563),
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
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
                    backgroundColor: const Color(0xFF6366F1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 6,
                    highlightElevation: 10,
                    child: const Icon(Icons.check, color: Colors.white, size: 28),
                  ),
                ),
              ],
            ),
          ),
      ),
    );
  }
}

class _FullScreenImageGallery extends StatefulWidget {
  final List<XFile> images;
  final int initialIndex;
  final Function(int)? onDelete;

  const _FullScreenImageGallery({
    super.key,
    required this.images,
    required this.initialIndex,
    this.onDelete,
  });

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
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('图片保存功能暂时不可用')),
    );
  }

  void _onLongPress() async {
    final action = await showModalBottomSheet<String>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.save_alt),
              title: const Text('保存到相册'),
              onTap: () => Navigator.pop(ctx, 'save'),
            ),
            ListTile(
              leading: const Icon(Icons.cancel),
              title: const Text('取消'),
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
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PhotoViewGallery.builder(
            itemCount: widget.images.length,
            builder: (context, index) {
              return PhotoViewGalleryPageOptions(
                imageProvider: FileImage(File(widget.images[index].path)),
                minScale: PhotoViewComputedScale.contained,
                maxScale: PhotoViewComputedScale.covered * 3.0,
                heroAttributes: PhotoViewHeroAttributes(tag: widget.images[index].path),
              );
            },
            backgroundDecoration: const BoxDecoration(color: Colors.transparent),
            pageController: _pageController,
            loadingBuilder: (context, event) =>
                const Center(child: CircularProgressIndicator()),
            onPageChanged: (i) => setState(() => _currentIndex = i),
          ),
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
                if (widget.onDelete != null)
                  IconButton(
                    icon: const Icon(Icons.delete, color: Colors.white, size: 28),
                    onPressed: () {
                      Navigator.pop(context);
                      widget.onDelete!(_currentIndex);
                    },
                  ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white, size: 32),
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    '${_currentIndex + 1} / ${widget.images.length}',
                    style: const TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}