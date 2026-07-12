import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/constants.dart';
import 'core/theme.dart';
import 'providers/stepzy_store.dart';
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
  runApp(StepzyApp(prefs: prefs));
}

class StepzyApp extends StatefulWidget {
  const StepzyApp({super.key, required this.prefs});

  final SharedPreferences prefs;

  @override
  State<StepzyApp> createState() => _StepzyAppState();
}

class _StepzyAppState extends State<StepzyApp> {
  late final StepzyStore store;

  @override
  void initState() {
    super.initState();
    store = StepzyStore(widget.prefs)..bootstrap();
  }

  @override
  Widget build(BuildContext context) {
    return StepzyScope(
      store: store,
      child: MaterialApp(
        title: 'Stepzy',
        debugShowCheckedModeBanner: false,
        theme: StepzyTheme.dark,
        home: const StepzyShell(),
      ),
    );
  }
}
