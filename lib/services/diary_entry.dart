class DiaryEntry {
  final String id;
  final String title;
  final String content;
  final DateTime date;
  final String mood;
  final List<String> images;
  final List<String> files;
  final List<String> audios;

  DiaryEntry({
    required this.id,
    required this.title,
    required this.content,
    required this.date,
    required this.mood,
    required this.images,
    required this.files,
    required this.audios,
  });

  factory DiaryEntry.fromJson(Map<String, dynamic> json) => DiaryEntry(
    id: json['id']?.toString() ?? '',
    title: json['title'] ?? '',
    content: json['content'] ?? '',
    date: DateTime.parse(json['date'].toString()),
    mood: json['mood'] ?? '',
    images: List<String>.from(json['images'] ?? []),
    files: List<String>.from(json['files'] ?? []),
    audios: List<String>.from(json['audios'] ?? []),
  );

  factory DiaryEntry.fromMap(Map<String, dynamic> map) {
    return DiaryEntry(
      id: map['id']?.toString() ?? '',
      title: map['title'] ?? '',
      content: map['content'] ?? '',
      date: DateTime.parse(map['date'].toString()),
      mood: map['mood'] ?? '',
      images: List<String>.from(map['images'] ?? []),
      files: List<String>.from(map['files'] ?? []),
      audios: List<String>.from(map['audios'] ?? []),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'content': content,
    'date': date.toIso8601String(),
    'mood': mood,
    'images': images,
    'files': files,
    'audios': audios,
  };
} 