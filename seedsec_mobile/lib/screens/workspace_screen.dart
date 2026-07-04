import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:seedsec_mobile/config/theme.dart';
import 'package:seedsec_mobile/models/diagnostic_result.dart';
import 'package:seedsec_mobile/services/app_state.dart';
import 'package:seedsec_mobile/services/api_service.dart';
import 'package:seedsec_mobile/services/tflite_service.dart';
import 'package:seedsec_mobile/widgets/premium_card.dart';
import 'package:seedsec_mobile/screens/scan_result_screen.dart';

class WorkspaceScreen extends StatefulWidget {
  const WorkspaceScreen({super.key});

  @override
  State<WorkspaceScreen> createState() => _WorkspaceScreenState();
}

class _WorkspaceScreenState extends State<WorkspaceScreen> {
  final ApiService _apiService = ApiService();
  final TfliteService _tfliteService = TfliteService();
  final ImagePicker _picker = ImagePicker();

  String _selectedToolId = 'maize_vigor';
  File? _selectedImage;
  bool _isLoading = false;
  bool _isPlayingAudio = false;

  final List<Map<String, dynamic>> _tools = [
    {
      'id': 'maize_vigor',
      'name': 'Maize Vigor YOLOv8',
      'desc': 'Germination root counting & vigor assessment',
      'icon': Icons.grass_rounded,
    },
    {
      'id': 'seed_defect',
      'name': 'Maize Seed Defect MobileNet',
      'desc': 'Classifies seed quality (broken, discolored, pure, silkcut)',
      'icon': Icons.verified_user_rounded,
    },
    {
      'id': 'veg_tomato',
      'name': 'Vegetable Species MobileNet',
      'desc': 'Classifies 14 different vegetable seed species',
      'icon': Icons.grain_rounded,
    },
    {
      'id': 'bioacoustic',
      'name': 'Soil Bioacoustic Monitor',
      'desc': 'Assesses soil fauna activity & soil health',
      'icon': Icons.volume_up_rounded,
    },
  ];

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );
      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to acquire photo: $e')),
      );
    }
  }

  Future<void> _runDiagnosis() async {
    final state = Provider.of<AppState>(context, listen: false);

    if (_selectedToolId != 'bioacoustic' && _selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select or capture a seed photo first.')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final currentTool = _tools.firstWhere((t) => t['id'] == _selectedToolId);
    final toolName = currentTool['name']!;

    try {
      DiagnosticResult result;

      if (!state.isOfflineMode && (_selectedToolId == 'maize_vigor' || _selectedToolId == 'veg_tomato' || _selectedToolId == 'seed_defect')) {
        try {
          result = await _apiService.diagnose(
            toolId: _selectedToolId,
            toolName: toolName,
            mediaPath: _selectedImage!.path,
          );
        } catch (e) {
          print('Cloud diagnostics failed, falling back to local TFLite... $e');
          result = await _tfliteService.runInference(
            toolId: _selectedToolId,
            toolName: toolName,
            mediaPath: _selectedImage?.path ?? '',
          );
        }
      } else {
        result = await _tfliteService.runInference(
          toolId: _selectedToolId,
          toolName: toolName,
          mediaPath: _selectedImage?.path ?? '',
        );
      }

      await state.addScanResult(result);

      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ScanResultScreen(result: result),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Diagnosis execution failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final activeTool = _tools.firstWhere((t) => t['id'] == _selectedToolId);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'WORKSPACE',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 4.0,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.accentGreen,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Diagnostic Lab',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 28),
              ),
              const SizedBox(height: 16),

              Text(
                'CHOOSE DIAGNOSTIC TOOL',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 2.0,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                      fontSize: 12,
                    ),
              ),
              const SizedBox(height: 8),
              PremiumCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedToolId,
                    isExpanded: true,
                    dropdownColor: AppTheme.surface,
                    icon: const Icon(Icons.arrow_drop_down, color: AppTheme.accentGreen),
                    items: _tools.map((t) {
                      return DropdownMenuItem<String>(
                        value: t['id'],
                        child: Row(
                          children: [
                            Icon(t['icon'] as IconData, color: AppTheme.accentGreen, size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                t['name']!,
                                style: const TextStyle(
                                  color: AppTheme.textMain,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedToolId = val;
                          _selectedImage = null;
                        });
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Text(
                  activeTool['desc']!,
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                ),
              ),
              const SizedBox(height: 20),

              PremiumCard(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          state.isOfflineMode ? Icons.cloud_off_rounded : Icons.cloud_queue_rounded,
                          color: state.isOfflineMode ? AppTheme.accentOrange : AppTheme.accentGreen,
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Connection Mode',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textMain,
                                fontSize: 14,
                              ),
                            ),
                            Text(
                              state.isOfflineMode
                                  ? 'Offline Edge (Local TFLite)'
                                  : 'Online Cloud (FastAPI Backend)',
                              style: const TextStyle(
                                color: AppTheme.textMuted,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Switch.adaptive(
                      value: !state.isOfflineMode,
                      activeColor: AppTheme.accentGreen,
                      inactiveTrackColor: AppTheme.accentOrange.withOpacity(0.3),
                      inactiveThumbColor: AppTheme.accentOrange,
                      onChanged: (val) {
                        state.setOfflineMode(!val);
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              Text(
                _selectedToolId == 'bioacoustic' ? 'AUDIO SAMPLE PROBE' : 'SEED IMAGE SOURCE',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      letterSpacing: 2.0,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textMuted,
                      fontSize: 12,
                    ),
              ),
              const SizedBox(height: 8),

              PremiumCard(
                padding: EdgeInsets.zero,
                child: Container(
                  height: 240,
                  width: double.infinity,
                  alignment: Alignment.center,
                  child: _selectedToolId == 'bioacoustic'
                      ? _buildBioacousticWorkspace()
                      : _buildImageWorkspace(),
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _runDiagnosis,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.accentGreen,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.black,
                            strokeWidth: 2.5,
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _selectedToolId == 'bioacoustic'
                                  ? Icons.bar_chart_rounded
                                  : Icons.center_focus_strong_rounded,
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              'Run Crop Diagnosis',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImageWorkspace() {
    if (_selectedImage != null) {
      return Stack(
        fit: StackFit.expand,
        children: [
          Image.file(_selectedImage!, fit: BoxFit.cover),
          Positioned(
            bottom: 12,
            right: 12,
            child: FloatingActionButton.small(
              backgroundColor: AppTheme.surface.withOpacity(0.8),
              onPressed: () {
                setState(() {
                  _selectedImage = null;
                });
              },
              child: const Icon(Icons.delete_forever, color: Colors.redAccent),
            ),
          ),
        ],
      );
    }

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.photo_camera_back_outlined,
          size: 48,
          color: AppTheme.textMuted.withOpacity(0.5),
        ),
        const SizedBox(height: 16),
        const Text(
          'No seed image selected',
          style: TextStyle(color: AppTheme.textMain, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            OutlinedButton.icon(
              onPressed: () => _pickImage(ImageSource.camera),
              icon: const Icon(Icons.camera_alt),
              label: const Text('Camera'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.accentGreen,
                side: const BorderSide(color: AppTheme.accentGreen),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(width: 12),
            OutlinedButton.icon(
              onPressed: () => _pickImage(ImageSource.gallery),
              icon: const Icon(Icons.photo_library),
              label: const Text('Gallery'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.accentGreen,
                side: const BorderSide(color: AppTheme.accentGreen),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBioacousticWorkspace() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: AppTheme.accentGreen.withOpacity(0.1),
            shape: BoxShape.circle,
            border: Border.all(
              color: AppTheme.accentGreen.withOpacity(0.5),
              width: 1.5,
            ),
          ),
          child: IconButton(
            icon: Icon(
              _isPlayingAudio ? Icons.stop_circle_rounded : Icons.play_circle_fill_rounded,
              color: AppTheme.accentGreen,
              size: 36,
            ),
            onPressed: () {
              setState(() {
                _isPlayingAudio = !_isPlayingAudio;
              });
            },
          ),
        ),
        const SizedBox(height: 12),
        Text(
          _isPlayingAudio ? 'Listening to soil probe node...' : 'Soil acoustic probe offline',
          style: const TextStyle(color: AppTheme.textMain, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        if (_isPlayingAudio)
          Container(
            height: 60,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(20, (index) {
                final heights = [15.0, 35.0, 10.0, 50.0, 25.0, 70.0, 20.0, 45.0, 8.0, 40.0];
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 4,
                  height: heights[index % heights.length],
                  decoration: BoxDecoration(
                    color: AppTheme.accentGreen,
                    borderRadius: BorderRadius.circular(2),
                  ),
                );
              }),
            )
          )
        else
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              'Place probe node in soil and press play to monitor fauna',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ),
      ],
    );
  }
}
