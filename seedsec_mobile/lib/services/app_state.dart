import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:seedsec_mobile/models/diagnostic_result.dart';
import 'package:seedsec_mobile/models/weather_info.dart';
import 'package:seedsec_mobile/services/weather_service.dart';

class AppState extends ChangeNotifier {
  final WeatherService _weatherService = WeatherService();
  
  List<DiagnosticResult> _scanHistory = [];
  List<CityWeather> _weatherData = [];
  bool _isOfflineMode = false;
  bool _isWeatherLoading = false;
  int _selectedCityIndex = 0;
  int _selectedDayIndex = 1; // Default to 'Today' (index 1)

  // Calculator states synced with scan history
  String _selectedCropId = 'maize';
  int _selectedVigor = 3;
  bool _isCropAutoDetected = false;
  bool _isVigorAutoDetected = false;

  List<DiagnosticResult> get scanHistory => _scanHistory;
  List<CityWeather> get weatherData => _weatherData;
  bool get isOfflineMode => _isOfflineMode;
  bool get isWeatherLoading => _isWeatherLoading;
  int get selectedCityIndex => _selectedCityIndex;
  int get selectedDayIndex => _selectedDayIndex;

  String get selectedCropId => _selectedCropId;
  int get selectedVigor => _selectedVigor;
  bool get isCropAutoDetected => _isCropAutoDetected;
  bool get isVigorAutoDetected => _isVigorAutoDetected;

  AppState() {
    _loadHistory();
    loadWeather();
  }

  void setOfflineMode(bool offline) {
    _isOfflineMode = offline;
    notifyListeners();
  }

  void setSelectedCity(int idx) {
    _selectedCityIndex = idx;
    notifyListeners();
  }

  void setSelectedDay(int idx) {
    _selectedDayIndex = idx;
    notifyListeners();
  }

  void selectCrop(String cropId, {bool isAuto = false}) {
    _selectedCropId = cropId;
    _isCropAutoDetected = isAuto;
    notifyListeners();
  }

  void selectVigor(int vigor, {bool isAuto = false}) {
    _selectedVigor = vigor;
    _isVigorAutoDetected = isAuto;
    notifyListeners();
  }

  // Parse vigor level from a scan class string
  int? parseVigorFromClass(String resultClass) {
    final lower = resultClass.toLowerCase();
    if (lower.contains('vigor 3') || lower.contains('high')) return 3;
    if (lower.contains('vigor 2') || lower.contains('medium') || lower.contains('moderate')) return 2;
    if (lower.contains('vigor 1') || lower.contains('low') || lower.contains('weak')) return 1;
    if (lower.contains('vigor 0') || lower.contains('non-viable') || lower.contains('dead')) return 0;
    if (lower.contains('pure')) return 3;
    if (lower.contains('broken') || lower.contains('mold') || lower.contains('crack')) return 1;
    return null;
  }

  // Parse crop type from class or tool name
  String? parseCropFromClass(String resultClass, String toolName) {
    final lower = (resultClass + ' ' + toolName).toLowerCase();
    if (lower.contains('maize') || lower.contains('corn') || lower.contains('defect')) return 'maize';
    if (lower.contains('tomato')) return 'tomato';
    if (lower.contains('cabbage')) return 'cabbage';
    if (lower.contains('spinach') && !lower.contains('malabar') && !lower.contains('water')) return 'spinach';
    if (lower.contains('carrot')) return 'carrot';
    if (lower.contains('chili')) return 'chili';
    if (lower.contains('onion')) return 'onion';
    if (lower.contains('cucumber')) return 'cucumber';
    if (lower.contains('cauliflower')) return 'cauliflower';
    if (lower.contains('radish')) return 'radish';
    if (lower.contains('bitter melon') || lower.contains('bitter_melon')) return 'bitter_melon';
    if (lower.contains('bottle gourd') || lower.contains('bottle_gourd')) return 'bottle_gourd';
    if (lower.contains('coriander')) return 'coriander';
    if (lower.contains('hyacinth bean') || lower.contains('hyacinth_bean')) return 'hyacinth_bean';
    if (lower.contains('malabar spinach') || lower.contains('water spinach')) return 'spinach';
    return null;
  }

  void loadScanResultIntoCalculator(DiagnosticResult result) {
    // Detect vigor
    final parsedVigor = parseVigorFromClass(result.resultClass);
    if (parsedVigor != null) {
      _selectedVigor = parsedVigor;
      _isVigorAutoDetected = true;
    }

    // Detect crop
    final parsedCrop = parseCropFromClass(result.resultClass, result.toolName);
    if (parsedCrop != null) {
      _selectedCropId = parsedCrop;
      _isCropAutoDetected = true;
    }

    notifyListeners();
  }

  Future<void> _loadHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyStr = prefs.getString('scan_history');
      if (historyStr != null) {
        final List<dynamic> decoded = json.decode(historyStr);
        _scanHistory = decoded.map((item) => DiagnosticResult.fromJson(item)).toList();
        _scanHistory.sort((a, b) => b.timestamp.compareTo(a.timestamp));
        notifyListeners();
      } else {
        _scanHistory = [];
        notifyListeners();
      }
    } catch (e) {
      print('Failed to load scan history: $e');
      _scanHistory = [];
      notifyListeners();
    }
  }

  Future<void> addScanResult(DiagnosticResult result) async {
    _scanHistory.insert(0, result);
    
    // Auto-detect vigor
    final parsedVigor = parseVigorFromClass(result.resultClass);
    if (parsedVigor != null) {
      _selectedVigor = parsedVigor;
      _isVigorAutoDetected = true;
    }

    // Auto-detect crop
    final parsedCrop = parseCropFromClass(result.resultClass, result.toolName);
    if (parsedCrop != null) {
      _selectedCropId = parsedCrop;
      _isCropAutoDetected = true;
    }

    notifyListeners();
    _saveHistory();
  }

  Future<void> _saveHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = _scanHistory.map((item) => item.toJson()).toList();
      await prefs.setString('scan_history', json.encode(list));
    } catch (e) {
      print('Failed to save scan history: $e');
    }
  }

  Future<void> clearHistory() async {
    _scanHistory.clear();
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('scan_history');
  }

  Future<void> loadWeather() async {
    _isWeatherLoading = true;
    notifyListeners();
    try {
      _weatherData = await _weatherService.fetchWeather();
    } catch (e) {
      print('Error loading weather: $e');
    } finally {
      _isWeatherLoading = false;
      notifyListeners();
    }
  }
}
