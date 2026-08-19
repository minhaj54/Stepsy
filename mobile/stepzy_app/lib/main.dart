import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/theme.dart';
import 'providers/zarwinto_store.dart';
import 'screens/onboarding.dart';
import 'services/connectivity_gate.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load .env file (fast, local file read - safe to await)
  try {
    await dotenv.load(fileName: '.env');
  } catch (e) {
    debugPrint('[Zarwinto] .env not loaded: $e');
  }

  // Load shared preferences (fast, local - safe to await)
  final prefs = await SharedPreferences.getInstance();

  // Launch the app immediately — do NOT block on network calls
  runApp(ZarwintoApp(prefs: prefs));
}

class ZarwintoApp extends StatefulWidget {
  const ZarwintoApp({super.key, required this.prefs});

  final SharedPreferences prefs;

  @override
  State<ZarwintoApp> createState() => _ZarwintoAppState();
}

class _ZarwintoAppState extends State<ZarwintoApp> {
  late final ZarwintoStore store;

  @override
  void initState() {
    super.initState();
    store = ZarwintoStore(widget.prefs);
    _initSupabaseThenBootstrap();
  }

  /// Initialize Supabase in the background AFTER the UI is rendered.
  /// This way the app never freezes on launch, regardless of network state.
  Future<void> _initSupabaseThenBootstrap() async {
    final url = dotenv.env['SUPABASE_URL'] ?? '';
    final key = dotenv.env['SUPABASE_ANON_KEY'] ?? '';

    debugPrint('[Zarwinto] SUPABASE_URL = $url');
    debugPrint('[Zarwinto] SUPABASE_ANON_KEY = ${key.isNotEmpty ? "✓ present" : "✗ missing"}');

    if (url.isEmpty || key.isEmpty) {
      debugPrint('[Zarwinto] Supabase credentials missing — using mock data.');
      store.bootstrap();
      return;
    }

    try {
      debugPrint('[Zarwinto] Initializing Supabase...');
      await Supabase.initialize(
        url: url,
        publishableKey: key,
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          debugPrint('[Zarwinto] Supabase.initialize timed out after 30s — using mock data.');
          return Supabase.instance;
        },
      );
      debugPrint('[Zarwinto] Supabase initialized ✓');
    } catch (e) {
      debugPrint('[Zarwinto] Supabase init failed: $e — using mock data.');
    }

    store.bootstrap();
  }

  @override
  Widget build(BuildContext context) {
    return ZarwintoScope(
      store: store,
      child: MaterialApp(
        title: 'Zarwinto',
        debugShowCheckedModeBanner: false,
        theme: ZarwintoTheme.light,
        home: const ConnectivityGate(child: OnboardingScreen()),
      ),
    );
  }
}
