import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:seedsec_mobile/config/theme.dart';
import 'package:seedsec_mobile/services/app_state.dart';
import 'package:seedsec_mobile/widgets/premium_card.dart';
import 'package:seedsec_mobile/widgets/weather_widget.dart';

class HomeScreen extends StatelessWidget {
  final VoidCallback onStartScan;

  const HomeScreen({
    super.key,
    required this.onStartScan,
  });

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Banner Section
              Container(
                height: 180,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: AppTheme.border.withOpacity(0.8),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.accentGreen.withOpacity(0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: Stack(
                    children: [
                      // Background Image of Rwanda Hills
                      Image.asset(
                        'assets/images/rwanda_hills.png',
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: double.infinity,
                      ),
                      // Dark Glassmorphic/Gradient Overlay
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.black.withOpacity(0.3),
                              Colors.black.withOpacity(0.85),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                      // Banner Content
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Top Row: Logo & Offline/Online Switch Status
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                // Logo and App Name
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withOpacity(0.5),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: AppTheme.accentGreen.withOpacity(0.6),
                                          width: 1.2,
                                        ),
                                      ),
                                      child: const Icon(
                                        Icons.eco_rounded,
                                        color: AppTheme.accentGreen,
                                        size: 20,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    const Text(
                                      'SEEDSEC',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 2.0,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                                // Mode Indicator Pill
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: (state.isOfflineMode ? AppTheme.accentOrange : AppTheme.accentGreen)
                                        .withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: state.isOfflineMode ? AppTheme.accentOrange : AppTheme.accentGreen,
                                      width: 1.0,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        state.isOfflineMode ? Icons.wifi_off_rounded : Icons.wifi_rounded,
                                        color: state.isOfflineMode ? AppTheme.accentOrange : AppTheme.accentGreen,
                                        size: 12,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        state.isOfflineMode ? 'OFFLINE' : 'ONLINE',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 0.5,
                                          color: state.isOfflineMode ? AppTheme.accentOrange : AppTheme.accentGreen,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            // Bottom Column: Headline
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'RWANDA PRECISION AGRICULTURE',
                                  style: TextStyle(
                                    fontSize: 9,
                                    letterSpacing: 2.5,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.accentGreen.withOpacity(0.9),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Smart Diagnostic Edge',
                                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                                        fontSize: 22,
                                        color: Colors.white,
                                        shadows: [
                                          const Shadow(
                                            offset: Offset(0, 2),
                                            blurRadius: 4,
                                            color: Colors.black54,
                                          ),
                                        ],
                                      ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0.0),
              const SizedBox(height: 20),

              // Weather Advisory Section
              if (state.isWeatherLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(40.0),
                    child: CircularProgressIndicator(color: AppTheme.accentGreen),
                  ),
                )
              else
                WeatherWidget(
                  weatherData: state.weatherData,
                  selectedCityIndex: state.selectedCityIndex,
                  selectedDayIndex: state.selectedDayIndex,
                  onCityChanged: state.setSelectedCity,
                  onDayChanged: state.setSelectedDay,
                ).animate().fadeIn(delay: 100.ms, duration: 400.ms),
              const SizedBox(height: 24),

              // Quick Action Launch Button
              PremiumCard(
                padding: EdgeInsets.zero,
                child: InkWell(
                  onTap: onStartScan,
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.all(20.0),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppTheme.accentGreen.withOpacity(0.15),
                          Colors.transparent,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppTheme.accentGreen.withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          alignment: Alignment.center,
                          child: const Icon(
                            Icons.center_focus_strong_rounded,
                            color: AppTheme.accentGreen,
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'Launch Diagnosis Workspace',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textMain,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Run real-time edge/cloud crop analysis',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.arrow_forward_ios_rounded,
                          color: AppTheme.accentGreen,
                          size: 16,
                        ),
                      ],
                    ),
                  ),
                ),
              ).animate().fadeIn(delay: 200.ms, duration: 400.ms),
              const SizedBox(height: 24),

              // Technical Backbones & Performance Indicators
              Text(
                'MODEL METRICS & ACCURACY',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 2.0,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                    ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: PremiumCard(
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                      child: Column(
                        children: const [
                          Text(
                            '94.2%',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.accentGreen,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'YOLOv8 F1-Score',
                            style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: PremiumCard(
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                      child: Column(
                        children: const [
                          Text(
                            '<30 ms',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.accentGreen,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Cloud Latency',
                            style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: PremiumCard(
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                      child: Column(
                        children: const [
                          Text(
                            '14 Class',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.accentGreen,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'MobileNet Classes',
                            style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ).animate().fadeIn(delay: 250.ms, duration: 400.ms),
              const SizedBox(height: 24),

              // Features Info Cards
              Text(
                'CORE CAPABILITIES',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 2.0,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                    ),
              ),
              const SizedBox(height: 12),
              _buildFeatureCard(
                context,
                title: 'Dual-Deployment Engine',
                desc: 'Intelligent switching between cloud processing (API) and local edge inference (TFLite) based on local GSM/Wifi signal strength.',
                icon: Icons.alt_route_rounded,
                color: Colors.blue,
              ),
              const SizedBox(height: 8),
              _buildFeatureCard(
                context,
                title: 'YOLOv8 Vigor Detection',
                desc: 'Detects maize kernel root tip emergence and grades viability class instantly from field photos.',
                icon: Icons.grid_view_rounded,
                color: AppTheme.accentGreen,
              ),
              const SizedBox(height: 8),
              _buildFeatureCard(
                context,
                title: 'MobileNet Purity Screening',
                desc: 'Identifies vegetable seed types and checks lot variety mix-ups to prevent planting degradation.',
                icon: Icons.grain_rounded,
                color: AppTheme.accentOrange,
              ),
              const SizedBox(height: 24),

              // Rwanda Agricultural Beauty Showcase
              Text(
                'AGRICULTURE IN THE LAND OF A THOUSAND HILLS',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                    ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 160,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _buildGalleryItem(
                      context,
                      imagePath: 'assets/images/rwanda_hills.png',
                      title: 'Terraced Hills',
                      subtitle: 'Northern Province, Rwanda',
                    ),
                    const SizedBox(width: 12),
                    _buildGalleryItem(
                      context,
                      imagePath: 'assets/images/rwanda_farming.png',
                      title: 'Sustainable Maize Farming',
                      subtitle: 'Eastern Province, Rwanda',
                    ),
                    const SizedBox(width: 12),
                    _buildGalleryItem(
                      context,
                      imagePath: 'assets/images/rwanda_seeds.png',
                      title: 'Seed Quality Inspection',
                      subtitle: 'Kigali Research Station',
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 350.ms, duration: 400.ms),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGalleryItem(
    BuildContext context, {
    required String imagePath,
    required String title,
    required String subtitle,
  }) {
    return Container(
      width: 260,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border.withOpacity(0.3), width: 1),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(19),
        child: Stack(
          children: [
            Image.asset(
              imagePath,
              fit: BoxFit.cover,
              width: 260,
              height: 160,
            ),
            // Dark overlay gradient
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.black.withOpacity(0.0),
                    Colors.black.withOpacity(0.75),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
            // Text details
            Positioned(
              bottom: 12,
              left: 12,
              right: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.75),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCard(
    BuildContext context, {
    required String title,
    required String desc,
    required IconData icon,
    required Color color,
  }) {
    return PremiumCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textMain,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  desc,
                  style: const TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: AppTheme.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 300.ms, duration: 400.ms);
  }
}
