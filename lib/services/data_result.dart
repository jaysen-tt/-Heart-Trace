class DataResult<T> {
  final T? data;
  final String? error;

  DataResult.success(this.data) : error = null;
  DataResult.error(this.error) : data = null;
}