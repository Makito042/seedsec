import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:seedsec_mobile/config/theme.dart';
import 'package:seedsec_mobile/models/diagnostic_result.dart';

class ScanHistoryTile extends StatelessWidget {
  final DiagnosticResult result;
  final VoidCallback onTap;

  const ScanHistoryTile({
    super.key,
    required this.result,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('yyyy-MM-dd HH:mm').format(result.timestamp);
    final confPct = '${(result.confidence * 100).toStringAsFixed(1)}%';

    return Card(
      margin: const EdgeInsets.only(bottom: 8.0),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: result.isOffline
                ? AppTheme.accentOrange.withOpacity(0.1)
                : AppTheme.accentGreen.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: result.isOffline ? AppTheme.accentOrange : AppTheme.accentGreen,
              width: 1.0,
            ),
          ),
          alignment: Alignment.center,
          child: Icon(
            result.toolId == 'maize_vigor'
                ? Icons.grass_rounded
                : result.toolId == 'veg_tomato'
                    ? Icons.grain_rounded
                    : result.toolId == 'seed_defect'
                        ? Icons.verified_user_rounded
                        : Icons.volume_up_rounded,
            color: result.isOffline ? AppTheme.accentOrange : AppTheme.accentGreen,
            size: 24,
          ),
        ),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                result.toolName,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textMain,
                  fontSize: 15,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: (result.isOffline ? AppTheme.accentOrange : AppTheme.accentGreen).withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                result.isOffline ? 'OFFLINE' : 'ONLINE',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: result.isOffline ? AppTheme.accentOrange : AppTheme.accentGreen,
                ),
              ),
            ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 6.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Class: ${result.resultClass}',
                style: const TextStyle(
                  color: AppTheme.textMain,
                  fontSize: 13,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Conf: $confPct  •  Lat: ${result.metadata["latency"] ?? "N/A"}',
                      style: const TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 11,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    dateStr,
                    style: const TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        trailing: const Icon(
          Icons.chevron_right,
          color: AppTheme.textMuted,
        ),
      ),
    );
  }
}
