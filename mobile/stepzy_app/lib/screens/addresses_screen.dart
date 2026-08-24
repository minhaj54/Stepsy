import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import '../providers/zarwinto_store.dart';
import '../core/theme.dart';
import '../models/address.dart';
import '../services/location_resolver.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  List<Address> _addresses = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadAddresses();
    });
  }

  Future<void> _loadAddresses() async {
    final store = ZarwintoScope.of(context);
    setState(() => _loading = true);
    await store.loadAddresses();
    if (mounted) {
      setState(() {
        _addresses = store.addresses;
        _loading = false;
      });
    }
  }

  void _showAddAddressDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AddAddressBottomSheet(),
    ).then((_) => _loadAddresses());
  }

  void _editAddress(Address address) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AddAddressBottomSheet(address: address),
    ).then((_) => _loadAddresses());
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    
    if (store.profile == null) {
      return Scaffold(
        backgroundColor: ZarwintoColors.background,
        appBar: AppBar(
          title: const Text('My Addresses'),
          backgroundColor: ZarwintoColors.background,
          foregroundColor: ZarwintoColors.foreground,
          elevation: 0,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                HugeIcon(icon: HugeIcons.strokeRoundedLocation01, size: 64, color: ZarwintoColors.muted),
                const SizedBox(height: 16),
                Text(
                  'Sign in to manage addresses',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Please sign in to save and manage your addresses.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pushNamed('/login');
                  },
                  icon: HugeIcon(icon: HugeIcons.strokeRoundedUser02, color: Colors.white),
                  label: const Text('Sign In'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: ZarwintoColors.background,
      appBar: AppBar(
        title: const Text('My Addresses'),
        backgroundColor: ZarwintoColors.background,
        foregroundColor: ZarwintoColors.foreground,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _showAddAddressDialog,
            icon: HugeIcon(icon: HugeIcons.strokeRoundedLocationAdd01, color: ZarwintoColors.primary),
            tooltip: 'Add Address',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: ZarwintoColors.primary))
          : _addresses.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: ZarwintoColors.primary.withValues(alpha: 0.08),
                            shape: BoxShape.circle,
                          ),
                          child: HugeIcon(icon: HugeIcons.strokeRoundedLocation01, size: 40, color: ZarwintoColors.muted),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No addresses saved',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Add an address for quick and effortless checkout.',
                          style: TextStyle(color: ZarwintoColors.muted, fontSize: 13),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        FilledButton.icon(
                          onPressed: _showAddAddressDialog,
                          icon: HugeIcon(icon: HugeIcons.strokeRoundedAdd01, size: 18, color: Colors.white),
                          label: const Text('Add New Address'),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _addresses.length,
                  itemBuilder: (context, index) {
                    final address = _addresses[index];
                    return AddressCard(
                      address: address,
                      onEdit: () => _editAddress(address),
                      onDelete: () async {
                        final store = ZarwintoScope.of(context);
                        final confirmed = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Delete Address'),
                            content: const Text('Are you sure you want to delete this address?'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                style: TextButton.styleFrom(foregroundColor: ZarwintoColors.error),
                                child: const Text('Delete'),
                              ),
                            ],
                          ),
                        );
                        if (confirmed == true) {
                          await store.deleteAddress(address.id);
                          _loadAddresses();
                        }
                      },
                    );
                  },
                ),
    );
  }
}

class AddressCard extends StatelessWidget {
  const AddressCard({
    super.key,
    required this.address,
    required this.onEdit,
    required this.onDelete,
  });

  final Address address;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      address.fullName,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                    if (address.isDefault) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: ZarwintoColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'Default',
                          style: TextStyle(
                            color: ZarwintoColors.primary,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: onEdit,
                      icon: HugeIcon(icon: HugeIcons.strokeRoundedEdit01, size: 20, color: ZarwintoColors.primary),
                      color: ZarwintoColors.primary,
                    ),
                    IconButton(
                      onPressed: onDelete,
                      icon: HugeIcon(icon: HugeIcons.strokeRoundedDelete01, size: 20, color: ZarwintoColors.primary),
                      color: ZarwintoColors.error,
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              address.fullAddress,
              style: const TextStyle(color: ZarwintoColors.foregroundSecondary, fontSize: 14, height: 1.5),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                HugeIcon(icon: HugeIcons.strokeRoundedCall, size: 14, color: ZarwintoColors.muted),
                const SizedBox(width: 4),
                Text(
                  address.phone,
                  style: const TextStyle(color: ZarwintoColors.muted, fontSize: 13),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class AddAddressBottomSheet extends StatefulWidget {
  const AddAddressBottomSheet({super.key, this.address});

  final Address? address;

  @override
  State<AddAddressBottomSheet> createState() => _AddAddressBottomSheetState();
}

class _AddAddressBottomSheetState extends State<AddAddressBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressLine1Controller = TextEditingController();
  final _addressLine2Controller = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _pincodeController = TextEditingController();
  bool _isDefault = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _pincodeController.addListener(_onPincodeChanged);
    if (widget.address != null) {
      _fullNameController.text = widget.address!.fullName;
      _phoneController.text = widget.address!.phone;
      _addressLine1Controller.text = widget.address!.addressLine1;
      _addressLine2Controller.text = widget.address!.addressLine2;
      _cityController.text = widget.address!.city;
      _stateController.text = widget.address!.state;
      _pincodeController.text = widget.address!.pincode;
      _isDefault = widget.address!.isDefault;
    }
  }

  void _onPincodeChanged() async {
    final text = _pincodeController.text.trim();
    if (text.length == 6 && RegExp(r'^\d{6}$').hasMatch(text)) {
      final loc = await LocationResolver.resolvePincode(text);
      if (loc != null && mounted) {
        if (loc.cityName != null && _cityController.text.trim().isEmpty) {
          _cityController.text = loc.cityName!;
        }
        if (loc.stateName != null && _stateController.text.trim().isEmpty) {
          _stateController.text = loc.stateName!;
        }
      }
    }
  }

  @override
  void dispose() {
    _pincodeController.removeListener(_onPincodeChanged);
    _fullNameController.dispose();
    _phoneController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  Future<void> _saveAddress() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);
    final store = ZarwintoScope.of(context);

    final address = Address(
      id: widget.address?.id ?? '',
      userId: (widget.address?.userId ?? store.profile?.id ?? ''),
      fullName: _fullNameController.text.trim(),
      phone: _phoneController.text.trim(),
      addressLine1: _addressLine1Controller.text.trim(),
      addressLine2: _addressLine2Controller.text.trim(),
      city: _cityController.text.trim(),
      state: _stateController.text.trim(),
      pincode: _pincodeController.text.trim(),
      isDefault: _isDefault,
      createdAt: widget.address?.createdAt ?? DateTime.now(),
    );

    try {
      if (widget.address == null) {
        final newAddress = await store.addAddress(address);
        if (newAddress == null) throw Exception('Failed to save address');
      } else {
        await store.updateAddress(address);
      }

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Address saved')),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save address: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.address == null ? 'Add Delivery Address' : 'Edit Delivery Address',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: HugeIcon(icon: HugeIcons.strokeRoundedCancel01, color: ZarwintoColors.primary),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _fullNameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
                validator: (v) => v?.trim().isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone Number (10 digits)'),
                keyboardType: TextInputType.phone,
                validator: (v) => v?.trim().isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressLine1Controller,
                decoration: const InputDecoration(labelText: 'Address Line 1'),
                validator: (v) => v?.trim().isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressLine2Controller,
                decoration: const InputDecoration(labelText: 'Address Line 2 / Landmark'),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _cityController,
                      decoration: const InputDecoration(labelText: 'City'),
                      validator: (v) => v?.trim().isEmpty ?? true ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _stateController,
                      decoration: const InputDecoration(labelText: 'State'),
                      validator: (v) => v?.trim().isEmpty ?? true ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _pincodeController,
                decoration: const InputDecoration(
                  labelText: 'Pincode (6 digits)',
                  hintText: 'e.g. 110001',
                ),
                keyboardType: TextInputType.number,
                validator: (v) => v?.trim().length != 6 ? 'Enter 6-digit pin' : null,
              ),
              const SizedBox(height: 12),
              CheckboxListTile(
                title: const Text('Set as default delivery address', style: TextStyle(fontSize: 14)),
                value: _isDefault,
                onChanged: (v) => setState(() => _isDefault = v ?? false),
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton(
                  onPressed: _saving ? null : _saveAddress,
                  child: _saving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(widget.address == null ? 'Save Address' : 'Update Address'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
