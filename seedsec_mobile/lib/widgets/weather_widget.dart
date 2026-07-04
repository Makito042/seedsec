import 'package:flutter/material.dart';
import 'package:seedsec_mobile/config/theme.dart';
import 'package:seedsec_mobile/models/weather_info.dart';
import 'package:seedsec_mobile/widgets/premium_card.dart';

class WeatherWidget extends StatelessWidget {
  final List<CityWeather> weatherData;
  final int selectedCityIndex;
  final int selectedDayIndex;
  final ValueChanged<int> onCityChanged;
  final ValueChanged<int> onDayChanged;

  const WeatherWidget({
    super.key,
    required this.weatherData,
    required this.selectedCityIndex,
    required this.selectedDayIndex,
    required this.onCityChanged,
    required this.onDayChanged,
  });

  LinearGradient _getGradient(int code) {
    if (code == 0) {
      return const LinearGradient(
        colors: [Color(0xFFFF9500), Color(0xFFFF5E3A)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (code >= 1 && code <= 3) {
      return const LinearGradient(
        colors: [Color(0xFF64B5F6), Color(0xFF42A5F5)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (code >= 45 && code <= 48) {
      return const LinearGradient(
        colors: [Color(0xFF90A4AE), Color(0xFF78909C)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (code >= 51 && code <= 67) {
      return const LinearGradient(
        colors: [Color(0xFF5C6BC0), Color(0xFF3949AB)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (code >= 71 && code <= 77) {
      return const LinearGradient(
        colors: [Color(0xFFE0E0E0), Color(0xFFBDBDBD)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (code >= 80 && code <= 82) {
      return const LinearGradient(
        colors: [Color(0xFF7986CB), Color(0xFF5C6BC0)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (code >= 85 && code <= 86) {
      return const LinearGradient(
        colors: [Color(0xFFB0BEC5), Color(0xFF90A4AE)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    if (code >= 95 && code <= 99) {
      return const LinearGradient(
        colors: [Color(0xFF7E57C2), Color(0xFF5E35B1)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );
    }
    return const LinearGradient(
      colors: [Color(0xFFFF9500), Color(0xFFFF5E3A)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (weatherData.isEmpty) {
      return const PremiumCard(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(24.0),
            child: CircularProgressIndicator(color: AppTheme.accentGreen),
          ),
        ),
      );
    }

    final city = weatherData[selectedCityIndex];
    final forecast = city.forecasts[selectedDayIndex];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // City Selector Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  city.name,
                  style: Theme.of(context).textTheme.displayMedium,
                ),
                const SizedBox(height: 2),
                Text(
                  '${city.region} • Alt: ${city.elevation}m',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            // Popup Menu Button for City Selector
            Theme(
              data: Theme.of(context).copyWith(
                cardColor: AppTheme.surface,
              ),
              child: PopupMenuButton<int>(
                initialValue: selectedCityIndex,
                onSelected: onCityChanged,
                icon: const Icon(Icons.location_on, color: AppTheme.accentGreen),
                itemBuilder: (context) {
                  return List.generate(weatherData.length, (idx) {
                    return PopupMenuItem<int>(
                      value: idx,
                      child: Text(
                        weatherData[idx].name,
                        style: const TextStyle(color: AppTheme.textMain),
                      ),
                    );
                  });
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Day Selector Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: List.generate(city.forecasts.length, (idx) {
              final f = city.forecasts[idx];
              final isSelected = idx == selectedDayIndex;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(f.dayLabel),
                  selected: isSelected,
                  onSelected: (val) {
                    if (val) onDayChanged(idx);
                  },
                  backgroundColor: AppTheme.surface.withOpacity(0.3),
                  selectedColor: AppTheme.accentGreen.withOpacity(0.2),
                  checkmarkColor: AppTheme.accentGreen,
                  labelStyle: TextStyle(
                    color: isSelected ? AppTheme.accentGreen : AppTheme.textMuted,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    fontSize: 13,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: isSelected ? AppTheme.accentGreen : AppTheme.border.withOpacity(0.1),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
        const SizedBox(height: 12),

        // Weather Advisory Card with Linear Gradient Background
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: _getGradient(forecast.code),
            borderRadius: BorderRadius.circular(20),
            boxShadow: const [
              BoxShadow(
                color: Color(0x33000000),
                blurRadius: 15,
                offset: Offset(0, 5),
              ),
            ],
          ),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.25),
              borderRadius: BorderRadius.circular(20),
            ),
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Text(
                            forecast.emoji,
                            style: const TextStyle(fontSize: 32),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  forecast.weatherDescription,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                Text(
                                  'Rain Prob: ${forecast.rainProb}%',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.white.withOpacity(0.8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${forecast.maxTemp}°C / ${forecast.minTemp}°C',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(color: Colors.white24, height: 1),
                const SizedBox(height: 12),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 2.0),
                      child: Icon(
                        Icons.agriculture_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        forecast.advisory,
                        style: const TextStyle(
                          fontSize: 14,
                          height: 1.4,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
