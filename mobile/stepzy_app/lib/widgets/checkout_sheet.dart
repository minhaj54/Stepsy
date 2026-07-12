import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/shipping_address.dart';
import '../providers/stepzy_store.dart';

class CheckoutSheet extends StatefulWidget {
  const CheckoutSheet({super.key});

  @override
  State<CheckoutSheet> createState() => _CheckoutSheetState();
}

class _CheckoutSheetState extends State<CheckoutSheet> {
  final fullName = TextEditingController();
  final phone = TextEditingController();
  final address = TextEditingController();
  final city = TextEditingController();
  final state = TextEditingController();
  final pincode = TextEditingController();
  bool busy = false;

  @override
  Widget build(BuildContext context) {
    final store = StepzyScope.of(context);

    return Padding(
      padding: EdgeInsets.only(
        left: 18,
        right: 18,
        top: 18,
        bottom: MediaQuery.viewInsetsOf(context).bottom + 18,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Shipping address', style: titleStyle),
            const SizedBox(height: 14),
            TextField(
              controller: fullName,
              decoration: const InputDecoration(labelText: 'Full name'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: phone,
              decoration: const InputDecoration(labelText: 'Phone'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: address,
              decoration: const InputDecoration(labelText: 'Address'),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: city,
                    decoration: const InputDecoration(labelText: 'City'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: state,
                    decoration: const InputDecoration(labelText: 'State'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: pincode,
              decoration: const InputDecoration(labelText: 'Pincode'),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: busy
                  ? null
                  : () async {
                      setState(() => busy = true);
                      final message = await store.placeOrder(
                        ShippingAddress(
                          fullName: fullName.text,
                          phone: phone.text,
                          addressLine1: address.text,
                          city: city.text,
                          state: state.text,
                          pincode: pincode.text,
                        ),
                      );
                      setState(() => busy = false);
                      if (!context.mounted) return;
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(message ?? 'Order placed.')),
                      );
                    },
              child: const Text('Place order'),
            ),
          ],
        ),
      ),
    );
  }
}
