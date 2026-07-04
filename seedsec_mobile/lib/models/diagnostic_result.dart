class DiagnosticResult {
  final String id;
  final String toolId; // maize_vigor, tomato_species, seed_surface, bioacoustic
  final String toolName;
  final DateTime timestamp;
  final String resultClass;
  final double confidence; // 0.0 to 1.0
  final bool isOffline;
  final String? mediaPath; // local file path
  final Map<String, dynamic> metadata; // e.g. latency, count, recommended action

  DiagnosticResult({
    required this.id,
    required this.toolId,
    required this.toolName,
    required this.timestamp,
    required this.resultClass,
    required this.confidence,
    required this.isOffline,
    this.mediaPath,
    required this.metadata,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'toolId': toolId,
      'toolName': toolName,
      'timestamp': timestamp.toIso8601String(),
      'resultClass': resultClass,
      'confidence': confidence,
      'isOffline': isOffline,
      'mediaPath': mediaPath,
      'metadata': metadata,
    };
  }

  factory DiagnosticResult.fromJson(Map<String, dynamic> json) {
    return DiagnosticResult(
      id: json['id'],
      toolId: json['toolId'],
      toolName: json['toolName'],
      timestamp: DateTime.parse(json['timestamp']),
      resultClass: json['resultClass'],
      confidence: (json['confidence'] as num).toDouble(),
      isOffline: json['isOffline'] ?? false,
      mediaPath: json['mediaPath'],
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
    );
  }
}
