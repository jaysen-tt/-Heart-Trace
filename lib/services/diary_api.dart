// 云端日记API接口预留
class DiaryApi {
  /// 新增日记
  Future<void> createDiary(Map<String, dynamic> diary) async {
    // TODO: 调用云端API
    throw UnimplementedError('createDiary 需对接云端实现');
  }

  /// 获取所有日记
  Future<List<Map<String, dynamic>>> fetchDiaries() async {
    // TODO: 调用云端API
    throw UnimplementedError('fetchDiaries 需对接云端实现');
  }

  /// 更新日记
  Future<void> updateDiary(Map<String, dynamic> diary) async {
    // TODO: 调用云端API
    throw UnimplementedError('updateDiary 需对接云端实现');
  }

  /// 删除日记
  Future<void> deleteDiary(String diaryId) async {
    // TODO: 调用云端API
    throw UnimplementedError('deleteDiary 需对接云端实现');
  }

  /// 上传附件（图片/音频/文件），返回云端URL
  Future<String> uploadAttachment(String localPath) async {
    // TODO: 上传到云端，返回云端URL
    throw UnimplementedError('uploadAttachment 需对接云端实现');
  }
} 