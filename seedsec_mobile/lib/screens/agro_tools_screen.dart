import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:seedsec_mobile/config/theme.dart';
import 'package:seedsec_mobile/models/crop_spec.dart';
import 'package:seedsec_mobile/models/diagnostic_result.dart';
import 'package:seedsec_mobile/services/app_state.dart';
import 'package:seedsec_mobile/widgets/premium_card.dart';
import 'package:seedsec_mobile/widgets/vigor_selector.dart';
import 'package:seedsec_mobile/widgets/scan_history_tile.dart';
import 'package:seedsec_mobile/screens/scan_result_screen.dart';

class AgroToolsScreen extends StatefulWidget {
  const AgroToolsScreen({super.key});

  @override
  State<AgroToolsScreen> createState() => _AgroToolsScreenState();
}

class _AgroToolsScreenState extends State<AgroToolsScreen> {
  final TextEditingController _plotSizeController = TextEditingController(text: '1.0');

  double get _plotSize => double.tryParse(_plotSizeController.text) ?? 0.0;

  double _getVigorMultiplier(int vigor) {
    switch (vigor) {
      case 3:
        return 1.0;
      case 2:
        return 1.15;
      case 1:
        return 1.35;
      default:
        return 0.0;
    }
  }

  void _exportCsv(List<DiagnosticResult> history) {
    if (history.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No audit logs available to export.')),
      );
      return;
    }

    final buffer = StringBuffer();
    buffer.writeln('ScanID,Timestamp,Tool,Connection,ResultClass,Confidence');
    for (var r in history) {
      buffer.writeln(
        '${r.id},${r.timestamp.toIso8601String()},"${r.toolName}",${r.isOffline ? 'OFFLINE' : 'ONLINE'},"${r.resultClass}",${r.confidence}',
      );
    }

    final csvText = buffer.toString();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppTheme.surface,
          title: const Text('Exported CSV Audit Logs', style: TextStyle(color: AppTheme.textMain)),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'CSV audit report generated successfully. Copy details or share with regional agronomists:',
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Text(
                    csvText,
                    style: const TextStyle(
                      fontFamily: 'Courier',
                      fontSize: 10,
                      color: AppTheme.accentGreen,
                    ),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close', style: TextStyle(color: AppTheme.accentGreen)),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    _plotSizeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final String selectedCropId = state.selectedCropId;
    final int selectedVigor = state.selectedVigor;
    final selectedCrop = CropSpec.crops.firstWhere((c) => c.id == selectedCropId);

    final double density = selectedCrop.density;
    final double seedsRequired = density * _plotSize * _getVigorMultiplier(selectedVigor);
    final double seedWeightKg = (seedsRequired * selectedCrop.thousandSeedWeight) / 1000000;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'AGRO-TOOLS',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 4.0,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.accentGreen,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Sowing Rate Calculator',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 28),
              ),
              const SizedBox(height: 16),

              PremiumCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'PLOT SIZE (HECTARES)',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textMuted,
                                ),
                              ),
                              const SizedBox(height: 6),
                              TextField(
                                controller: _plotSizeController,
                                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                style: const TextStyle(
                                  color: AppTheme.textMain,
                                  fontWeight: FontWeight.bold,
                                ),
                                decoration: InputDecoration(
                                  filled: true,
                                  fillColor: AppTheme.background.withOpacity(0.5),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: const BorderSide(color: AppTheme.border),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: const BorderSide(color: AppTheme.accentGreen),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                onChanged: (_) => setState(() {}),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 3,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                               Row(
                                  children: [
                                    const Text(
                                      'SELECT TARGET CROP',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.textMuted,
                                      ),
                                    ),
                                    if (state.isCropAutoDetected) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppTheme.accentGreen,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: const Text(
                                          'AUTO',
                                          style: TextStyle(
                                            color: Colors.black,
                                            fontSize: 8,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 4),
                                DropdownButtonHideUnderline(
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10),
                                    decoration: BoxDecoration(
                                      color: AppTheme.background.withOpacity(0.5),
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: AppTheme.border),
                                    ),
                                    child: DropdownButton<String>(
                                      value: selectedCropId,
                                      isExpanded: true,
                                      dropdownColor: AppTheme.surface,
                                      items: CropSpec.crops.map((c) {
                                        return DropdownMenuItem(
                                          value: c.id,
                                          child: Text(
                                            c.name,
                                            style: const TextStyle(
                                              color: AppTheme.textMain,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                            ),
                                          ),
                                        );
                                      }).toList(),
                                      onChanged: (val) {
                                        if (val != null) {
                                          state.selectCrop(val);
                                        }
                                      },
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    Row(
                      children: [
                        const Text(
                          'SEED VIGOR DIAGNOSTIC FACTOR',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textMuted,
                          ),
                        ),
                        if (state.isVigorAutoDetected) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.accentGreen,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'AUTO',
                              style: TextStyle(
                                color: Colors.black,
                                fontSize: 8,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 8),
                    VigorSelector(
                      selectedVigor: selectedVigor,
                      onChanged: (val) {
                        state.selectVigor(val);
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              Text(
                'RECOMMENDED SPECIFICATIONS',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 2.0,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                    ),
              ),
              const SizedBox(height: 8),
              PremiumCard(
                color: selectedVigor == 0
                    ? Colors.red.withOpacity(0.05)
                    : AppTheme.accentGreen.withOpacity(0.05),
                border: BorderSide(
                  color: selectedVigor == 0 ? Colors.red : AppTheme.accentGreen,
                  width: 1.0,
                ),
                child: Column(
                  children: [
                    _buildResultRow(
                      icon: Icons.grid_on_rounded,
                      label: 'Planting Density',
                      value: '${density.toStringAsFixed(0)} plants / Ha',
                    ),
                    const Divider(color: AppTheme.border, height: 16),
                    _buildResultRow(
                      icon: Icons.space_bar_rounded,
                      label: 'Spacing Scheme',
                      value: selectedCrop.spacing,
                    ),
                    const Divider(color: AppTheme.border, height: 16),
                    _buildResultRow(
                      icon: Icons.fitness_center_rounded,
                      label: 'Total Seeds Required',
                      value: selectedVigor == 0 ? 'WARNING: Non-Viable' : '${seedWeightKg.toStringAsFixed(2)} kg',
                      valColor: selectedVigor == 0 ? Colors.red : AppTheme.accentGreen,
                    ),
                  ],
                ),
              ),
              if (selectedVigor == 0) ...[
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.0),
                  child: Text(
                    'Seed lot is non-viable. Sowing will lead to germination failure. Discard or return to supplier.',
                    style: TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
              const SizedBox(height: 24),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'AUDIT & SCANS REGISTRY',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          letterSpacing: 2.0,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textMuted,
                        ),
                  ),
                  if (state.scanHistory.isNotEmpty)
                    TextButton.icon(
                      onPressed: () => _exportCsv(state.scanHistory),
                      icon: const Icon(Icons.download_rounded, size: 16),
                      label: const Text('Export CSV', style: TextStyle(fontSize: 12)),
                      style: TextButton.styleFrom(
                        foregroundColor: AppTheme.accentGreen,
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(60, 30),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),

              if (state.scanHistory.isEmpty)
                const PremiumCard(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(24.0),
                      child: Text(
                        'No diagnostics scanned yet. Run diagnostics in the Workspace tab.',
                        style: TextStyle(color: AppTheme.textMuted),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                )
              else ...[
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: state.scanHistory.length,
                  itemBuilder: (context, idx) {
                    final res = state.scanHistory[idx];
                    return ScanHistoryTile(
                      result: res,
                      onTap: () {
                        state.loadScanResultIntoCalculator(res);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Loaded ${res.resultClass} (${res.toolName}) into Sowing Calculator'),
                            backgroundColor: AppTheme.accentGreen.withOpacity(0.85),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                    );
                  },
                ),
                const SizedBox(height: 12),
                Center(
                  child: TextButton.icon(
                    onPressed: state.clearHistory,
                    icon: const Icon(Icons.delete_rounded, size: 16, color: Colors.redAccent),
                    label: const Text('Clear Scan Registry', style: TextStyle(color: Colors.redAccent, fontSize: 13)),
                  ),
                ),
              ],
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultRow({
    required IconData icon,
    required String label,
    required String value,
    Color? valColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, color: AppTheme.textMuted, size: 18),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          ],
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
