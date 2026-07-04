import 'dart:convert';
import 'dart:math';
import 'package:http/http.dart' as http;
import 'package:seedsec_mobile/models/weather_info.dart';

class WeatherService {
  static const String _apiUrl =
      'https://api.open-meteo.com/v1/forecast?latitude=-1.9441,-1.5034,-2.5967,-1.9278,-1.6749,-1.2989,-2.1558,-2.1444&longitude=30.0619,29.6350,29.7394,30.5284,29.2636,30.3242,29.3524,30.1264&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&past_days=1&forecast_days=3&timezone=Africa/Cairo';

  static final List<Map<String, dynamic>> _locations = [
    {'name': 'Kigali', 'region': 'Central Province', 'elevation': 1567, 'baseTemp': 24.0},
    {'name': 'Musanze', 'region': 'Northern Province', 'elevation': 1850, 'baseTemp': 17.0},
    {'name': 'Huye', 'region': 'Southern Province', 'elevation': 1706, 'baseTemp': 21.0},
    {'name': 'Kayonza', 'region': 'Eastern Province', 'elevation': 1530, 'baseTemp': 27.0},
    {'name': 'Rubavu', 'region': 'Western Province', 'elevation': 1476, 'baseTemp': 22.0},
    {'name': 'Nyagatare', 'region': 'Eastern Province', 'elevation': 1513, 'baseTemp': 28.0},
    {'name': 'Karongi', 'region': 'Western Province', 'elevation': 1634, 'baseTemp': 23.0},
    {'name': 'Bugesera', 'region': 'Eastern Province', 'elevation': 1434, 'baseTemp': 26.0},
  ];

  static String _getAgriAdvisory(double maxTemp, int code, int rainProb) {
    if (code >= 95 && code <= 99) {
      return 'Severe storms expected — avoid seeding operations. Clear storm drains and protect nursery beds from wind damage.';
    }
    if ((code >= 51 && code <= 67) || rainProb > 70) {
      return 'Rainy conditions: excellent moisture for planting. Avoid applying surface chemical fertilizers — risk of runoff.';
    }
    if (rainProb > 40) {
      return 'Showers likely: favorable window for transplanting seedlings. Delay foliar pesticide spraying until dry.';
    }
    if (maxTemp > 28) {
      return 'Hot & dry: high evapotranspiration rates. Irrigate nurseries early morning; mulch to conserve soil moisture.';
    }
    if (maxTemp < 18) {
      return 'Cool temperatures: slower maize root growth expected. Favorable conditions for pea and legume seeding.';
    }
    return 'Stable conditions: optimal for seedbed tillage, field diagnostics, and precision seeding operations.';
  }

  Future<List<CityWeather>> fetchWeather() async {
    try {
      final response = await http.get(Uri.parse(_apiUrl)).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<CityWeather> list = [];

        for (int i = 0; i < _locations.length; i++) {
          final loc = _locations[i];
          final dynamic cityData = data is List ? data[i] : data;
          final Map<String, dynamic> daily = cityData['daily'] ?? {};
          final List<dynamic> times = daily['time'] ?? [];
          final List<dynamic> maxTemps = daily['temperature_2m_max'] ?? [];
          final List<dynamic> minTemps = daily['temperature_2m_min'] ?? [];
          final List<dynamic> codes = daily['weather_code'] ?? [];
          final List<dynamic> rainProbs = daily['precipitation_probability_max'] ?? [];

          final List<WeatherForecast> forecasts = [];
          for (int dayIdx = 0; dayIdx < 4; dayIdx++) {
            if (times.length <= dayIdx) continue;
            final String time = times[dayIdx];
            final double maxTemp = (maxTemps[dayIdx] as num?)?.toDouble() ?? 22.0;
            final double minTemp = (minTemps[dayIdx] as num?)?.toDouble() ?? 14.0;
            final int code = (codes[dayIdx] as num?)?.toInt() ?? 0;
            final int rainProb = (rainProbs[dayIdx] as num?)?.toInt() ?? 0;

            String dayLabel = 'Today';
            if (dayIdx == 0) {
              dayLabel = 'Yesterday';
            } else if (dayIdx == 1) {
              dayLabel = 'Today';
            } else if (dayIdx == 2) {
              dayLabel = 'Tomorrow';
            } else {
              try {
                final dateObj = DateTime.parse(time);
                final weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                dayLabel = weekdays[dateObj.weekday - 1];
              } catch (_) {
                dayLabel = 'Next';
              }
            }

            forecasts.add(WeatherForecast(
              date: time,
              dayLabel: dayLabel,
              maxTemp: (maxTemp * 10).round() / 10,
              minTemp: (minTemp * 10).round() / 10,
              code: code,
              rainProb: rainProb,
              advisory: _getAgriAdvisory(maxTemp, code, rainProb),
            ));
          }

          list.add(CityWeather(
            name: loc['name'],
            region: loc['region'],
            elevation: loc['elevation'],
            forecasts: forecasts,
          ));
        }

        return list;
      } else {
        throw Exception('Failed to load weather data');
      }
    } catch (e) {
      print('Weather fetch failed, using mock data: $e');
      return _getMockWeather();
    }
  }

  List<CityWeather> _getMockWeather() {
    final rand = Random();
    final List<CityWeather> list = [];

    for (var loc in _locations) {
      final double baseTemp = loc['baseTemp'];
      final List<WeatherForecast> forecasts = [];

      for (int dayIdx = 0; dayIdx < 4; dayIdx++) {
        final double tempOffset = (dayIdx == 0
                ? -1.2
                : dayIdx == 1
                    ? 0.0
                    : dayIdx == 2
                        ? 1.8
                        : -0.4) +
            (rand.nextDouble() - 0.5) * 1.5;

        final double maxTemp = baseTemp + tempOffset;
        final double minTemp = baseTemp - 7.0 + tempOffset;
        final int code = dayIdx == 2 ? 51 : dayIdx == 0 ? 3 : dayIdx == 1 ? 1 : 0;
        final int rainProb = dayIdx == 2 ? 80 : dayIdx == 0 ? 30 : 15;

        String dayLabel = 'Today';
        if (dayIdx == 0) {
          dayLabel = 'Yesterday';
        } else if (dayIdx == 1) {
          dayLabel = 'Today';
        } else if (dayIdx == 2) {
          dayLabel = 'Tomorrow';
        } else {
          final dateObj = DateTime.now().add(const Duration(days: 2));
          final weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          dayLabel = weekdays[dateObj.weekday - 1];
        }

        forecasts.add(WeatherForecast(
          date: DateTime.now().add(Duration(days: dayIdx - 1)).toIso8601String().split('T')[0],
          dayLabel: dayLabel,
          maxTemp: (maxTemp * 10).round() / 10,
          minTemp: (minTemp * 10).round() / 10,
          code: code,
          rainProb: rainProb,
          advisory: _getAgriAdvisory(maxTemp, code, rainProb),
        ));
      }

      list.add(CityWeather(
        name: loc['name'],
        region: loc['region'],
        elevation: loc['elevation'],
        forecasts: forecasts,
      ));
    }

    return list;
  }
}
