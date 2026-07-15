import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/constants.dart';
import 'core/theme.dart';
import 'providers/whishkhu_store.dart';
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
  runApp(WhishkhuApp(prefs: prefs));
}

class WhishkhuApp extends StatefulWidget {
  const WhishkhuApp({super.key, required this.prefs});

  final SharedPreferences prefs;

  @override
  State<WhishkhuApp> createState() => _WhishkhuAppState();
}

class _WhishkhuAppState extends State<WhishkhuApp> {
  late final WhishkhuStore store;

  @override
  void initState() {
    super.initState();
    store = WhishkhuStore(widget.prefs)..bootstrap();
  }

  @override
  Widget build(BuildContext context) {
    return WhishkhuScope(
      store: store,
      child: MaterialApp(
        title: 'Whishkhu',
        debugShowCheckedModeBanner: false,
        theme: WhishkhuTheme.dark,
        home: const WhishkhuShell(),
      ),
    );
  }
}
