import 'diary_entry.dart';

abstract class DiaryRepository {
  Future<void> init();
  Future<List<DiaryEntry>> fetchDiaries();
  Future<List<DiaryEntry>> fetchDiariesByDate(DateTime date);
  Future<List<DiaryEntry>> fetchDiariesByDateRange(DateTime start, DateTime end);
  Future<List<DiaryEntry>> searchDiaries(String keyword);
  Future<DiaryEntry?> getDiaryById(String id);
  Future<void> createDiary(DiaryEntry entry);
  Future<void> updateDiary(DiaryEntry entry);
  Future<void> deleteDiary(String id);
}
