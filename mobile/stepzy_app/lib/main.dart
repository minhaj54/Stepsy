import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/constants.dart';
import 'core/theme.dart';
import 'providers/zarwinto_store.dart';
import 'screens/shell.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty) {
    await Supabase.initialize(
      url: supabaseUrl,
      publishableKey: supabaseAnonKey,
    );
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

  @override
  void initState() {
    super.initState();
    store = ZarwintoStore(widget.prefs)..bootstrap();
  }

  @override
  Widget build(BuildContext context) {
    return ZarwintoScope(
      store: store,
      child: MaterialApp(
        title: 'Zarwinto',
        debugShowCheckedModeBanner: false,
        theme: ZarwintoTheme.dark,
        home: const ZarwintoShell(),
      ),
    );
  }
}
