class WeatherForecast {
  final String date;
  final String dayLabel;
  final double maxTemp;
  final double minTemp;
  final int code;
  final int rainProb;
  final String advisory;

  WeatherForecast({
    required this.date,
    required this.dayLabel,
    required this.maxTemp,
    required this.minTemp,
    required this.code,
    required this.rainProb,
    required this.advisory,
  });

  String get weatherDescription {
    if (code == 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 85 && code <= 86) return 'Snow Showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Clear';
  }

  String get emoji {
    if (code == 0) return '☀️';
    if (code >= 1 && code <= 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '☀️';
  }
}

class CityWeather {
  final String name;
  final String region;
  final int elevation;
  final List<WeatherForecast> forecasts;

  CityWeather({
    required this.name,
    required this.region,
    required this.elevation,
    required this.forecasts,
  });
}
