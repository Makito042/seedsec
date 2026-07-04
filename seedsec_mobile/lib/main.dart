import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:seedsec_mobile/config/theme.dart';
import 'package:seedsec_mobile/services/app_state.dart';
import 'package:seedsec_mobile/screens/home_screen.dart';
import 'package:seedsec_mobile/screens/workspace_screen.dart';
import 'package:seedsec_mobile/screens/agro_tools_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppState(),
      child: const SeedSecApp(),
    ),
  );
}

class SeedSecApp extends StatelessWidget {
  const SeedSecApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SeedSec Rwanda',
      theme: AppTheme.darkTheme,
      debugShowCheckedModeBanner: false,
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      HomeScreen(
        onStartScan: () {
          setState(() {
            _currentIndex = 1; // Switch to Workspace Screen
          });
        },
      ),
      const WorkspaceScreen(),
      const AgroToolsScreen(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(
              color: AppTheme.border,
              width: 0.5,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home_rounded),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.center_focus_weak_outlined),
              activeIcon: Icon(Icons.center_focus_strong_rounded),
              label: 'Workspace',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calculate_outlined),
              activeIcon: Icon(Icons.calculate_rounded),
              label: 'Agro-Tools',
            ),
          ],
        ),
      ),
    );
  }
}
