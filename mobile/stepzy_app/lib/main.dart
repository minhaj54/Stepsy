import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:app_links/app_links.dart';

import 'core/theme.dart';
import 'providers/zarwinto_store.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/shell.dart';
import 'screens/product_detail.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  try {
    await dotenv.load(fileName: '.env');
  } catch (e) {
    debugPrint('[Zarwinto] .env not loaded: $e');
  }

  final prefs = await SharedPreferences.getInstance();
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
  Uri? _pendingDeepLink;

  @override
  void initState() {
    super.initState();
    store = ZarwintoStore(widget.prefs);
    _initSupabaseThenBootstrap();
    _initDeepLinks();
  }

  Future<void> _initSupabaseThenBootstrap() async {
    final url = dotenv.env['SUPABASE_URL'] ?? '';
    final key = dotenv.env['SUPABASE_ANON_KEY'] ?? '';

    debugPrint('[Zarwinto] SUPABASE_URL = $url');
    debugPrint('[Zarwinto] SUPABASE_ANON_KEY = ${key.isNotEmpty ? "present" : "missing"}');

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
      debugPrint('[Zarwinto] Supabase initialized');
    } catch (e) {
      debugPrint('[Zarwinto] Supabase init failed: $e — using mock data.');
    }

    store.bootstrap();
  }

  void _initDeepLinks() {
    final appLinks = AppLinks();
    appLinks.uriLinkStream.listen((Uri uri) {
      debugPrint('[Zarwinto] Deep link received: $uri');
      if (!mounted) return;
      setState(() => _pendingDeepLink = uri);
      _handlePendingDeepLink();
    });
  }

  Future<void> _handlePendingDeepLink() async {
    final uri = _pendingDeepLink;
    if (uri == null) return;
    _pendingDeepLink = null;

    final context = navigatorKey.currentContext;
    if (context == null) return;
    final store = ZarwintoScope.of(context, listen: false);

    while (store.loading && mounted) {
      await Future.delayed(const Duration(milliseconds: 150));
    }
    if (!mounted) return;

    final segments = uri.pathSegments;
    if (segments.length == 2 && segments[0] == 'product') {
      final productId = segments[1];
      final product = store.products.where((p) => p.id == productId).toList();
      if (product.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Product not found. Please try again later.')),
          );
        }
        return;
      }

      if (mounted) {
        Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => ProductDetailPage(product: product.first)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return ZarwintoScope(
      store: store,
      child: MaterialApp(
        navigatorKey: navigatorKey,
        title: 'Zarwinto',
        debugShowCheckedModeBanner: false,
        theme: ZarwintoTheme.light,
        initialRoute: '/',
        routes: {
          '/': (context) => const SplashScreen(),
          '/login': (context) => const LoginScreen(),
          '/signup': (context) => const SignupScreen(),
          '/shell': (context) => const ZarwintoShell(),
        },
      ),
    );
  }
}
