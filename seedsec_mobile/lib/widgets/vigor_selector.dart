import 'package:flutter/material.dart';
import 'package:seedsec_mobile/config/theme.dart';

class VigorSelector extends StatelessWidget {
  final int selectedVigor;
  final ValueChanged<int> onChanged;

  const VigorSelector({
    super.key,
    required this.selectedVigor,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> options = [
      {'val': 3, 'label': 'Vigor 3', 'desc': 'High Germination', 'color': AppTheme.accentGreen},
      {'val': 2, 'label': 'Vigor 2', 'desc': 'Medium', 'color': Colors.blue},
      {'val': 1, 'label': 'Vigor 1', 'desc': 'Weak/Dormant', 'color': AppTheme.accentOrange},
      {'val': 0, 'label': 'Vigor 0', 'desc': 'Non-Viable', 'color': Colors.red},
    ];

    return Row(
      children: options.map((opt) {
        final val = opt['val'] as int;
        final isSelected = selectedVigor == val;
        final Color optColor = opt['color'] as Color;

        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: InkWell(
              onTap: () => onChanged(val),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
                decoration: BoxDecoration(
                  color: isSelected ? optColor.withOpacity(0.2) : AppTheme.surface.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? optColor : AppTheme.border.withOpacity(0.2),
                    width: isSelected ? 1.5 : 1.0,
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      opt['label'],
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: isSelected ? optColor : AppTheme.textMain,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      opt['desc'],
                      style: TextStyle(
                        fontSize: 9,
                        color: isSelected ? optColor.withOpacity(0.8) : AppTheme.textMuted,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
