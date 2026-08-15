import 'dart:convert';
import 'package:http/http.dart' as http;
import '../data/india_locations.dart';

/// Result of resolving the location/pincode into a structured address.
class ResolvedLocation {
  const ResolvedLocation({
    this.state,
    this.district,
    this.pincode,
    this.cityName,
    this.stateName,
  });

  final IndiaState? state;
  final IndiaDistrict? district;
  final String? pincode;
  final String? cityName;
  final String? stateName;

  bool get hasAny =>
      state != null ||
      district != null ||
      pincode != null ||
      (cityName != null && cityName!.isNotEmpty);
}

/// Fast Postal PIN code resolver using India Post API + local dataset fallback.
class LocationResolver {
  const LocationResolver._();

  /// Resolve City, District and State from a 6-digit Indian PIN code.
  static Future<ResolvedLocation?> resolvePincode(String pincode) async {
    final cleanPin = pincode.trim().replaceAll(RegExp(r'\D'), '');
    if (cleanPin.length != 6) return null;

    try {
      final uri = Uri.parse('https://api.postalpincode.in/pincode/$cleanPin');
      final response = await http
          .get(uri)
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (data.isNotEmpty && data[0]['Status'] == 'Success') {
          final postOffices = data[0]['PostOffice'] as List<dynamic>?;
          if (postOffices != null && postOffices.isNotEmpty) {
            final primary = postOffices[0];
            final districtName = primary['District'] as String? ?? primary['Block'] as String? ?? '';
            final stateName = primary['State'] as String? ?? '';

            final state = IndiaLocationData.findState(stateName);
            final district = state != null ? IndiaLocationData.findDistrict(state, districtName) : null;

            return ResolvedLocation(
              state: state,
              district: district,
              pincode: cleanPin,
              cityName: districtName.isNotEmpty ? districtName : primary['Name'] as String?,
              stateName: stateName,
            );
          }
        }
      }
    } catch (_) {
      // Fall through to local lookup
    }

    // Local fallback matching
    for (final s in IndiaLocationData.states) {
      for (final d in s.districts) {
        if (d.pincodes.contains(cleanPin)) {
          return ResolvedLocation(
            state: s,
            district: d,
            pincode: cleanPin,
            cityName: d.name,
            stateName: s.name,
          );
        }
      }
    }

    return null;
  }

  /// Resolve current (alias to pincode lookup or empty)
  static Future<ResolvedLocation?> resolveCurrent() async {
    return null;
  }
}
