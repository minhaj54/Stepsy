import 'dart:convert';

import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

import '../data/india_locations.dart';

/// Result of resolving the device location into a structured address.
class ResolvedLocation {
  const ResolvedLocation({
    this.state,
    this.district,
    this.pincode,
  });

  final IndiaState? state;
  final IndiaDistrict? district;
  final String? pincode;

  bool get hasAny => state != null || district != null || pincode != null;
}

/// Handles "use my current location": requests GPS permission + position, then
/// reverse-geocodes the coordinates via OpenStreetMap Nominatim (free, no API key).
class LocationResolver {
  const LocationResolver._();

  /// Returns null when permission is denied or geocoding fails.
  static Future<ResolvedLocation?> resolveCurrent() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      return null;
    }

    final Position position;
    try {
      position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );
    } catch (_) {
      return null;
    }

    try {
      final uri = Uri.https(
        'nominatim.openstreetmap.org',
        '/reverse',
        {
          'format': 'json',
          'lat': position.latitude.toString(),
          'lon': position.longitude.toString(),
          'zoom': '18',
          'addressdetails': '1',
        },
      );
      final response = await http
          .get(uri, headers: {'User-Agent': 'Zarwinto/1.0'})
          .timeout(const Duration(seconds: 15));

      if (response.statusCode != 200) return null;
      final data = json.decode(response.body) as Map<String, dynamic>;
      final addr = data['address'] as Map<String, dynamic>? ?? {};

      final rawState = _firstNonEmpty([
        addr['state'],
        addr['state_district'],
      ]);
      final rawDistrict = _firstNonEmpty([
        addr['city_district'],
        addr['county'],
        addr['city'],
        addr['town'],
        addr['village'],
        addr['suburb'],
        addr['municipality'],
      ]);
      final rawPincode = _firstNonEmpty([addr['postcode']]);

      final state = IndiaLocationData.findState(rawState);
      final district = state != null ? IndiaLocationData.findDistrict(state, rawDistrict) : null;
      final pincode = (rawPincode ?? '').trim().isEmpty ? null : rawPincode!.trim();

      return ResolvedLocation(state: state, district: district, pincode: pincode);
    } catch (_) {
      return null;
    }
  }

  static String? _firstNonEmpty(List<dynamic> values) {
    for (final v in values) {
      if (v is String && v.trim().isNotEmpty) return v.trim();
    }
    return null;
  }
}
