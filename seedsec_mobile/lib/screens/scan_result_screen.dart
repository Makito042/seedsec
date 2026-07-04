import 'dart:io';
import 'package:flutter/material.dart';
import 'package:seedsec_mobile/config/theme.dart';
import 'package:seedsec_mobile/models/diagnostic_result.dart';
import 'package:seedsec_mobile/widgets/premium_card.dart';

class ScanResultScreen extends StatelessWidget {
  final DiagnosticResult result;

  const ScanResultScreen({
    super.key,
    required this.result,
  });

  @override
  Widget build(BuildContext context) {
    final hasBoxes = result.metadata['predictions'] != null &&
        (result.metadata['predictions'] as List).isNotEmpty &&
        (result.metadata['predictions'] as List)[0]['box_coordinates'] != null;

    final confPct = (result.confidence * 100).toStringAsFixed(1);

    return Scaffold(
      appBar: AppBar(
        title: const Text('DIAGNOSTIC REPORT'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Media Preview Card
              PremiumCard(
                padding: EdgeInsets.zero,
                child: AspectRatio(
                  aspectRatio: 4 / 3,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // Image rendering
                      if (result.mediaPath != null && result.mediaPath!.isNotEmpty)
                        if (result.mediaPath!.startsWith('http'))
                          Image.network(
                            result.mediaPath!,
                            fit: BoxFit.cover,
                          )
                        else
                          Image.file(
                            File(result.mediaPath!),
                            fit: BoxFit.cover,
                          )
                      else if (result.toolId == 'bioacoustic')
                        Container(
                          color: AppTheme.surface.withOpacity(0.5),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.volume_up_rounded,
                                color: AppTheme.accentGreen,
                                size: 48,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                result.metadata['audioName'] ?? 'Sensor_Node_24A_Kigali.wav',
                                style: const TextStyle(
                                  fontFamily: 'Courier',
                                  color: AppTheme.textMain,
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        Container(
                          color: AppTheme.surface.withOpacity(0.5),
                          child: const Icon(
                            Icons.image_not_supported_rounded,
                            color: AppTheme.textMuted,
                            size: 48,
                          ),
                        ),

                      // Bounding box overlays (YOLOv8)
                      if (hasBoxes && result.mediaPath != null)
                        LayoutBuilder(
                          builder: (context, constraints) {
                            final preds = result.metadata['predictions'] as List;
                            return Stack(
                              children: preds.map<Widget>((p) {
                                final box = p['box_coordinates'] as Map<String, dynamic>;
                                final double ymin = (box['ymin'] as num).toDouble();
                                final double xmin = (box['xmin'] as num).toDouble();
                                final double ymax = (box['ymax'] as num).toDouble();
                                final double xmax = (box['xmax'] as num).toDouble();

                                final top = (ymin / 100) * constraints.maxHeight;
                                final left = (xmin / 100) * constraints.maxWidth;
                                final width = ((xmax - xmin) / 100) * constraints.maxWidth;
                                final height = ((ymax - ymin) / 100) * constraints.maxHeight;

                                return Positioned(
                                  top: top,
                                  left: left,
                                  width: width,
                                  height: height,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      border: Border.all(
                                        color: AppTheme.accentGreen,
                                        width: 2.0,
                                      ),
                                      color: AppTheme.accentGreen.withOpacity(0.15),
                                    ),
                                    padding: const EdgeInsets.all(2),
                                    child: Text(
                                      '${p['class']} ${(p['confidence'] * 100).toStringAsFixed(0)}%',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        backgroundColor: Colors.black54,
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Result Overview Card
              PremiumCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                result.toolName.toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.accentGreen,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                result.resultClass,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textMain,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Circular Confidence Indicator
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppTheme.accentGreen,
                              width: 3.0,
                            ),
                            color: AppTheme.accentGreen.withOpacity(0.1),
                          ),
                          alignment: Alignment.center,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '$confPct%',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14,
                                  color: AppTheme.accentGreen,
                                ),
                              ),
                              const Text(
                                'Conf',
                                style: TextStyle(
                                  fontSize: 8,
                                  color: AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Agricultural Advisory Card
              Text(
                'AGRONOMIC RECOMMENDATION',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 2.0,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                    ),
              ),
              const SizedBox(height: 8),
              PremiumCard(
                border: const BorderSide(color: AppTheme.accentGreen, width: 1.0),
                color: AppTheme.accentGreen.withOpacity(0.05),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.tips_and_updates_rounded,
                      color: AppTheme.accentGreen,
                      size: 24,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        result.metadata['advisory'] ?? 'No advisory available for this scan result.',
                        style: const TextStyle(
                          fontSize: 14,
                          height: 1.4,
                          color: AppTheme.textMain,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Technical Metadata details
              Text(
                'DIAGNOSTIC METADATA',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 2.0,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                    ),
              ),
              const SizedBox(height: 8),
              PremiumCard(
                child: Column(
                  children: [
                    _buildMetaRow(
                      label: 'Inference Engine',
                      value: result.metadata['engine'] ?? 'Unknown Engine',
                    ),
                    const Divider(color: AppTheme.border, height: 16),
                    _buildMetaRow(
                      label: 'Latency',
                      value: result.metadata['latency'] ?? 'N/A',
                    ),
                    const Divider(color: AppTheme.border, height: 16),
                    _buildMetaRow(
                      label: 'Model Weights File Size',
                      value: result.metadata['size'] ?? 'N/A',
                    ),
                    const Divider(color: AppTheme.border, height: 16),
                    _buildMetaRow(
                      label: 'Mode',
                      value: result.isOffline ? 'Offline Edge (On-Device)' : 'Online Cloud (FastAPI)',
                      valColor: result.isOffline ? AppTheme.accentOrange : AppTheme.accentGreen,
                    ),
                    const Divider(color: AppTheme.border, height: 16),
                    _buildMetaRow(
                      label: 'Timestamp',
                      value: result.timestamp.toString().substring(0, 19),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetaRow({
    required String label,
    required String value,
    Color? valColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
        ),
        Text(
          value,
          style: TextStyle(
            color: valColor ?? AppTheme.textMain,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
      ],
    );
  }
}
