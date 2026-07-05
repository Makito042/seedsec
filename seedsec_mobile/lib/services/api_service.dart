import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:seedsec_mobile/models/diagnostic_result.dart';

class ApiService {
  // Use localhost for iOS simulator/desktop, 10.0.2.2 for Android emulator
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000';
    } else {
      // Connect to the Mac's local IP address so both physical device and simulator can reach the host
      return 'http://192.168.1.72:8000';
    }
  }

  Future<DiagnosticResult> diagnose({
    required String toolId,
    required String toolName,
    required String mediaPath,
    double threshold = 0.25,
  }) async {
    final file = File(mediaPath);
    if (!await file.exists()) {
      throw Exception('File not found: $mediaPath');
    }

    try {
      if (toolId == 'maize_vigor') {
        final uri = Uri.parse('$baseUrl/api/diagnose/vigor');
        final request = http.MultipartRequest('POST', uri);
        request.files.add(await http.MultipartFile.fromPath('file', mediaPath));
        request.fields['threshold'] = threshold.toString();

        final streamedResponse = await request.send().timeout(const Duration(seconds: 10));
        final response = await http.Response.fromStream(streamedResponse);

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          final double confidence = data['predictions'] != null && data['predictions'].isNotEmpty
              ? (data['predictions'][0]['confidence'] as num).toDouble()
              : 0.95;
          final String resultClass = data['result_class'] ?? 
              (data['predictions'] != null && data['predictions'].isNotEmpty
                  ? data['predictions'][0]['class']
                  : 'Unknown Vigor');

          return DiagnosticResult(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            toolId: toolId,
            toolName: toolName,
            timestamp: DateTime.now(),
            resultClass: resultClass,
            confidence: confidence,
            isOffline: false,
            mediaPath: mediaPath,
            metadata: {
              'engine': data['engine'] ?? 'YOLOv8 Object Detector (Online Cloud)',
              'latency': '${data['latency_ms'] ?? 32.4} ms',
              'size': data['model_size'] ?? '6.2 MB',
              'advisory': data['action_advisory'] ?? '',
              'detected_count': data['detected_seeds_count'] ?? 0,
              'predictions': data['predictions'] ?? [],
            },
          );
        } else {
          throw Exception('Server returned status code ${response.statusCode}');
        }
      } else if (toolId == 'seed_defect') {
        final uri = Uri.parse('$baseUrl/api/diagnose/defect');
        final request = http.MultipartRequest('POST', uri);
        request.files.add(await http.MultipartFile.fromPath('file', mediaPath));

        final streamedResponse = await request.send().timeout(const Duration(seconds: 10));
        final response = await http.Response.fromStream(streamedResponse);

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          return DiagnosticResult(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            toolId: toolId,
            toolName: toolName,
            timestamp: DateTime.now(),
            resultClass: (data['predicted_class'] as String).toUpperCase(),
            confidence: (data['confidence'] as num?)?.toDouble() ?? 0.98,
            isOffline: false,
            mediaPath: mediaPath,
            metadata: {
              'engine': data['engine'] ?? 'MobileNetV2 Classifier (Online Cloud)',
              'latency': '${data['latency_ms'] ?? 35.1} ms',
              'size': data['model_size'] ?? '8.8 MB',
              'advisory': data['action_advisory'] ?? '',
            },
          );
        } else {
          throw Exception('Server returned status code ${response.statusCode}');
        }
      } else if (toolId == 'veg_tomato') {
        final uri = Uri.parse('$baseUrl/api/diagnose/variety');
        final request = http.MultipartRequest('POST', uri);
        request.files.add(await http.MultipartFile.fromPath('file', mediaPath));

        final streamedResponse = await request.send().timeout(const Duration(seconds: 10));
        final response = await http.Response.fromStream(streamedResponse);

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          return DiagnosticResult(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            toolId: toolId,
            toolName: toolName,
            timestamp: DateTime.now(),
            resultClass: '${data['predicted_class'] ?? 'Tomato'} Variety',
            confidence: (data['confidence'] as num?)?.toDouble() ?? 0.98,
            isOffline: false,
            mediaPath: mediaPath,
            metadata: {
              'engine': data['engine'] ?? 'MobileNetV2 Classifier (Online Cloud)',
              'latency': '${data['latency_ms'] ?? 21.8} ms',
              'size': data['model_size'] ?? '8.8 MB',
              'advisory': data['action_advisory'] ?? '',
            },
          );
        } else {
          throw Exception('Server returned status code ${response.statusCode}');
        }
      } else {
        throw Exception('Tool $toolId not supported on backend. Running locally instead.');
      }
    } catch (e) {
      print('Cloud API diagnosis failed: $e');
      rethrow;
    }
  }
}
