/// Curated, offline dataset powering the dynamic address form.
///
/// Structure: State -> City/District -> sample pincodes. This is intentionally a
/// representative subset of major Indian locations (not exhaustive) so the form can
/// offer cascading dropdowns without a network round-trip. Free-text entry is still
/// allowed for unlisted areas.
class IndiaDistrict {
  const IndiaDistrict({required this.name, this.pincodes = const []});

  final String name;
  final List<String> pincodes;
}

class IndiaState {
  const IndiaState({required this.name, required this.districts});

  final String name;
  final List<IndiaDistrict> districts;

  List<String> get cities => districts.map((d) => d.name).toList();
}

class IndiaLocationData {
  const IndiaLocationData._();

  static const List<IndiaState> states = [
    IndiaState(name: 'Andhra Pradesh', districts: [
      IndiaDistrict(name: 'Visakhapatnam', pincodes: ['530001', '530002']),
      IndiaDistrict(name: 'Vijayawada', pincodes: ['520001', '520010']),
      IndiaDistrict(name: 'Guntur', pincodes: ['522001', '522002']),
      IndiaDistrict(name: 'Tirupati', pincodes: ['517501', '517502']),
    ]),
    IndiaState(name: 'Assam', districts: [
      IndiaDistrict(name: 'Guwahati', pincodes: ['781001', '781005']),
      IndiaDistrict(name: 'Silchar', pincodes: ['788001']),
    ]),
    IndiaState(name: 'Bihar', districts: [
      IndiaDistrict(name: 'Patna', pincodes: ['800001', '800002']),
      IndiaDistrict(name: 'Gaya', pincodes: ['823001']),
      IndiaDistrict(name: 'Muzaffarpur', pincodes: ['842001']),
    ]),
    IndiaState(name: 'Chhattisgarh', districts: [
      IndiaDistrict(name: 'Raipur', pincodes: ['492001']),
      IndiaDistrict(name: 'Bilaspur', pincodes: ['495001']),
    ]),
    IndiaState(name: 'Delhi', districts: [
      IndiaDistrict(name: 'New Delhi', pincodes: ['110001', '110011']),
      IndiaDistrict(name: 'Dwarka', pincodes: ['110075', '110077']),
      IndiaDistrict(name: 'Rohini', pincodes: ['110085']),
    ]),
    IndiaState(name: 'Goa', districts: [
      IndiaDistrict(name: 'Panaji', pincodes: ['403001']),
      IndiaDistrict(name: 'Margao', pincodes: ['403601']),
    ]),
    IndiaState(name: 'Gujarat', districts: [
      IndiaDistrict(name: 'Ahmedabad', pincodes: ['380001', '380009']),
      IndiaDistrict(name: 'Surat', pincodes: ['395001', '395003']),
      IndiaDistrict(name: 'Vadodara', pincodes: ['390001']),
      IndiaDistrict(name: 'Rajkot', pincodes: ['360001']),
    ]),
    IndiaState(name: 'Haryana', districts: [
      IndiaDistrict(name: 'Gurgaon', pincodes: ['122001', '122002']),
      IndiaDistrict(name: 'Faridabad', pincodes: ['121001']),
    ]),
    IndiaState(name: 'Himachal Pradesh', districts: [
      IndiaDistrict(name: 'Shimla', pincodes: ['171001']),
      IndiaDistrict(name: 'Manali', pincodes: ['175131']),
    ]),
    IndiaState(name: 'Jharkhand', districts: [
      IndiaDistrict(name: 'Ranchi', pincodes: ['834001']),
      IndiaDistrict(name: 'Jamshedpur', pincodes: ['831001']),
    ]),
    IndiaState(name: 'Karnataka', districts: [
      IndiaDistrict(name: 'Bengaluru', pincodes: ['560001', '560010', '560034']),
      IndiaDistrict(name: 'Mysuru', pincodes: ['570001']),
      IndiaDistrict(name: 'Mangaluru', pincodes: ['575001']),
    ]),
    IndiaState(name: 'Kerala', districts: [
      IndiaDistrict(name: 'Thiruvananthapuram', pincodes: ['695001']),
      IndiaDistrict(name: 'Kochi', pincodes: ['682001', '682011']),
      IndiaDistrict(name: 'Kozhikode', pincodes: ['673001']),
    ]),
    IndiaState(name: 'Madhya Pradesh', districts: [
      IndiaDistrict(name: 'Bhopal', pincodes: ['462001', '462003']),
      IndiaDistrict(name: 'Indore', pincodes: ['452001', '452010']),
      IndiaDistrict(name: 'Jabalpur', pincodes: ['482001']),
    ]),
    IndiaState(name: 'Maharashtra', districts: [
      IndiaDistrict(name: 'Mumbai', pincodes: ['400001', '400101', '400070']),
      IndiaDistrict(name: 'Pune', pincodes: ['411001', '411011', '411038']),
      IndiaDistrict(name: 'Nagpur', pincodes: ['440001']),
      IndiaDistrict(name: 'Thane', pincodes: ['400601', '400604']),
      IndiaDistrict(name: 'Nashik', pincodes: ['422001']),
    ]),
    IndiaState(name: 'Odisha', districts: [
      IndiaDistrict(name: 'Bhubaneswar', pincodes: ['751001', '751010']),
      IndiaDistrict(name: 'Cuttack', pincodes: ['753001']),
    ]),
    IndiaState(name: 'Punjab', districts: [
      IndiaDistrict(name: 'Ludhiana', pincodes: ['141001']),
      IndiaDistrict(name: 'Chandigarh', pincodes: ['160001']),
      IndiaDistrict(name: 'Amritsar', pincodes: ['143001']),
    ]),
    IndiaState(name: 'Rajasthan', districts: [
      IndiaDistrict(name: 'Jaipur', pincodes: ['302001', '302015']),
      IndiaDistrict(name: 'Jodhpur', pincodes: ['342001']),
      IndiaDistrict(name: 'Udaipur', pincodes: ['313001']),
    ]),
    IndiaState(name: 'Tamil Nadu', districts: [
      IndiaDistrict(name: 'Chennai', pincodes: ['600001', '600020', '600040']),
      IndiaDistrict(name: 'Coimbatore', pincodes: ['641001']),
      IndiaDistrict(name: 'Madurai', pincodes: ['625001']),
    ]),
    IndiaState(name: 'Telangana', districts: [
      IndiaDistrict(name: 'Hyderabad', pincodes: ['500001', '500029', '500081']),
      IndiaDistrict(name: 'Warangal', pincodes: ['506001']),
    ]),
    IndiaState(name: 'Uttar Pradesh', districts: [
      IndiaDistrict(name: 'Lucknow', pincodes: ['226001', '226010']),
      IndiaDistrict(name: 'Kanpur', pincodes: ['208001']),
      IndiaDistrict(name: 'Noida', pincodes: ['201301']),
      IndiaDistrict(name: 'Agra', pincodes: ['282001']),
    ]),
    IndiaState(name: 'Uttarakhand', districts: [
      IndiaDistrict(name: 'Dehradun', pincodes: ['248001']),
      IndiaDistrict(name: 'Haridwar', pincodes: ['249401']),
    ]),
    IndiaState(name: 'West Bengal', districts: [
      IndiaDistrict(name: 'Kolkata', pincodes: ['700001', '700020', '700064']),
      IndiaDistrict(name: 'Howrah', pincodes: ['711101']),
      IndiaDistrict(name: 'Siliguri', pincodes: ['734001']),
    ]),
  ];

  /// Case-insensitive best-match lookup for a state name returned by a geocoder.
  static IndiaState? findState(String? raw) {
    if (raw == null || raw.isEmpty) return null;
    final name = raw.trim().toLowerCase();
    for (final s in states) {
      if (s.name.toLowerCase() == name) return s;
    }
    for (final s in states) {
      if (s.name.toLowerCase().contains(name) || name.contains(s.name.toLowerCase())) {
        return s;
      }
    }
    return null;
  }

  /// Finds a district within [state] whose name best matches [raw].
  static IndiaDistrict? findDistrict(IndiaState state, String? raw) {
    if (raw == null || raw.isEmpty) return null;
    final name = raw.trim().toLowerCase();
    for (final d in state.districts) {
      if (d.name.toLowerCase() == name) return d;
    }
    for (final d in state.districts) {
      if (d.name.toLowerCase().contains(name) || name.contains(d.name.toLowerCase())) {
        return d;
      }
    }
    return null;
  }
}
