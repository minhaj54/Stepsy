class ShippingAddress {
  const ShippingAddress({
    required this.fullName,
    required this.phone,
    required this.addressLine1,
    required this.city,
    required this.state,
    required this.pincode,
  });

  Map<String, dynamic> toJson() => {
    'fullName': fullName,
    'phone': phone,
    'addressLine1': addressLine1,
    'city': city,
    'state': state,
    'pincode': pincode,
  };

  final String fullName;
  final String phone;
  final String addressLine1;
  final String city;
  final String state;
  final String pincode;
}
