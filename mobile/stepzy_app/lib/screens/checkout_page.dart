import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:shimmer/shimmer.dart';
import '../core/theme.dart';
import '../providers/zarwinto_store.dart';
import '../models/shipping_address.dart';
import '../models/address.dart';
import '../models/order.dart';
import '../services/payment_service.dart';
import '../services/location_resolver.dart';
import '../screens/order_confirmation_screen.dart';
import '../screens/checkout_failure_screen.dart';
import '../widgets/cart_row.dart';
import '../widgets/common.dart';
import '../widgets/z_button.dart';

class CheckoutPage extends StatefulWidget {
  const CheckoutPage({super.key});

  @override
  State<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final fullName = TextEditingController();
  final phone = TextEditingController();
  final address = TextEditingController();
  final city = TextEditingController();
  final state = TextEditingController();
  final pincode = TextEditingController();
  String paymentMethod = 'cod';
  bool busy = false;
  bool editing = false;
  bool _addressesLoaded = false;
  Address? selectedAddress;
  List<Address> addresses = [];

  @override
  void initState() {
    super.initState();
    pincode.addListener(_onPincodeChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadAddresses();
      }
    });
  }

  void _onPincodeChanged() async {
    final text = pincode.text.trim();
    if (text.length == 6 && RegExp(r'^\d{6}$').hasMatch(text)) {
      final loc = await LocationResolver.resolvePincode(text);
      if (loc != null && mounted) {
        if (loc.cityName != null && city.text.trim().isEmpty) {
          city.text = loc.cityName!;
        }
        if (loc.stateName != null && state.text.trim().isEmpty) {
          state.text = loc.stateName!;
        }
      }
    }
  }

  Future<void> _loadAddresses() async {
    try {
      final store = ZarwintoScope.of(context);
      if (store.addresses.isNotEmpty) {
        if (!mounted) return;
        setState(() {
          addresses = store.addresses;
          selectedAddress = addresses.isNotEmpty
              ? addresses.firstWhere((addr) => addr.isDefault, orElse: () => addresses.first)
              : null;
          _addressesLoaded = true;
          if (selectedAddress != null) {
            fullName.text = selectedAddress!.fullName;
            phone.text = selectedAddress!.phone;
            address.text = selectedAddress!.addressLine1;
            city.text = selectedAddress!.city;
            state.text = selectedAddress!.state;
            pincode.text = selectedAddress!.pincode;
          }
        });
        return;
      }

      await store.loadAddresses().timeout(
        const Duration(seconds: 5),
        onTimeout: () {},
      );

      if (!mounted) return;
      setState(() {
        addresses = store.addresses;
        selectedAddress = addresses.isNotEmpty
            ? addresses.firstWhere((addr) => addr.isDefault, orElse: () => addresses.first)
            : null;
        _addressesLoaded = true;
        if (selectedAddress != null) {
          fullName.text = selectedAddress!.fullName;
          phone.text = selectedAddress!.phone;
          address.text = selectedAddress!.addressLine1;
          city.text = selectedAddress!.city;
          state.text = selectedAddress!.state;
          pincode.text = selectedAddress!.pincode;
        }
      });
    } catch (_) {
      if (mounted) {
        setState(() => _addressesLoaded = true);
      }
    }
  }

  @override
  void dispose() {
    pincode.removeListener(_onPincodeChanged);
    fullName.dispose();
    phone.dispose();
    address.dispose();
    city.dispose();
    state.dispose();
    pincode.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    if (!mounted) return;
    final store = ZarwintoScope.of(context);
    final colors = ZarwintoColors.of(context);
    const shippingCost = 0.0;
    final grandTotal = store.total + shippingCost;

    if (selectedAddress == null &&
        (fullName.text.trim().isEmpty ||
         phone.text.trim().isEmpty ||
         address.text.trim().isEmpty ||
         city.text.trim().isEmpty ||
         state.text.trim().isEmpty ||
         pincode.text.trim().isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select or fill in your shipping address')),
      );
      return;
    }

    setState(() => busy = true);

    try {
      final addressData = selectedAddress != null
          ? ShippingAddress(
              fullName: selectedAddress!.fullName,
              phone: selectedAddress!.phone,
              addressLine1: selectedAddress!.fullAddress,
              addressLine2: '',
              city: selectedAddress!.city,
              state: selectedAddress!.state,
              pincode: selectedAddress!.pincode,
            )
          : ShippingAddress(
              fullName: fullName.text.trim(),
              phone: phone.text.trim(),
              addressLine1: address.text.trim(),
              addressLine2: '',
              city: city.text.trim(),
              state: state.text.trim(),
              pincode: pincode.text.trim(),
            );

      if (paymentMethod == 'cod') {
        String? orderId;
        try {
          orderId = await store.placeOrder(addressData, paymentMethod: 'cod');
        } catch (e) {
          debugPrint('[CheckoutPage] COD placeOrder error: $e');
        }
        if (!mounted || orderId == null) {
          if (!mounted) return;
          setState(() => busy = false);
          _navigateToFailure(context, 'Failed to place order. Please try again.');
          return;
        }

        /* Shiprocket integration disabled
        try {
          final paymentService = PaymentService(store.prefs);
          final shiprocketResult = await paymentService.syncOrderWithShiprocket(
            orderId: orderId,
            cartItems: store.cart,
            shippingAddress: addressData.toJson(),
            paymentMethod: 'cod',
            subtotal: store.subtotal,
            discount: store.discount,
            shippingCost: shippingCost.toDouble(),
            fullName: addressData.fullName,
            phone: addressData.phone,
            email: store.profile?.email ?? '',
          );
          if (shiprocketResult != null && mounted) {
            await store.repository.updateOrderShiprocketIds(
              orderId,
              shiprocketResult['order_id'] as int,
              shiprocketResult['shipment_id'] as int,
            );
          }
        } catch (e) {
          debugPrint('[CheckoutPage] Shiprocket sync error: $e');
        }
        */

        final order = await store.fetchOrder(orderId);
        if (!mounted) return;
        final displayOrder = order ?? _buildFallbackOrder(orderId, addressData, paymentMethod, store);
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => OrderConfirmationScreen(
              order: displayOrder,
              onContinueShopping: () {
                Navigator.popUntil(context, (route) => route.isFirst);
              },
            ),
          ),
          (route) => route.settings.name == '/shell',
        );
      } else {
        String? orderId;
        try {
          orderId = await store.createPendingOrder(addressData, paymentMethod: paymentMethod);
        } catch (e) {
          debugPrint('[CheckoutPage] Online createPendingOrder error: $e');
        }
        if (!mounted || orderId == null) {
          if (!mounted) return;
          setState(() => busy = false);
          _navigateToFailure(context, 'Failed to create order. Please try again.');
          return;
        }

        final order = await store.fetchOrder(orderId);
        if (!mounted) return;
        if (order == null) {
          setState(() => busy = false);
          _navigateToFailure(context, 'Order created but details not loaded. Please check My Orders.');
          return;
        }

        final paymentService = PaymentService(store.prefs);
        final cashfreeResult = await paymentService.createCashfreeOrder(
          orderId: order.id,
          amount: grandTotal,
          name: order.shippingAddress['fullName'] ?? '',
          email: store.profile?.email ?? 'customer@example.com',
          phone: order.shippingAddress['phone'] ?? '',
        );

        if (cashfreeResult != null && mounted) {
          final sessionId = cashfreeResult['paymentSessionId'] as String;
          final paymentResult = await paymentService.showCashfreeCheckout(
            context: context,
            paymentSessionId: sessionId,
            orderId: order.id,
          );

          if (paymentResult == PaymentResult.success && mounted) {
            final verification = await paymentService.verifyCashfreePayment(order.id);
            final paymentStatus = (verification?['paymentStatus'] ?? verification?['mappedPaymentStatus'] ?? verification?['order_status'] ?? '').toString().toLowerCase();
            final isPaid = verification != null && (paymentStatus == 'paid' || paymentStatus == 'success');

            if (isPaid) {
              /* Shiprocket integration disabled
              try {
                final shiprocketResult = await paymentService.syncOrderWithShiprocket(
                  orderId: order.id,
                  cartItems: store.cart,
                  shippingAddress: order.shippingAddress,
                  paymentMethod: paymentMethod,
                  subtotal: store.subtotal,
                  discount: store.discount,
                  shippingCost: shippingCost.toDouble(),
                  fullName: order.shippingAddress['fullName'] ?? '',
                  phone: order.shippingAddress['phone'] ?? '',
                  email: store.profile?.email ?? '',
                );
                if (shiprocketResult != null) {
                  await store.repository.updateOrderShiprocketIds(
                    order.id,
                    shiprocketResult['order_id'] as int,
                    shiprocketResult['shipment_id'] as int,
                  );
                }
              } catch (e) {
                debugPrint('[CheckoutPage] Shiprocket sync error: $e');
              }
              */

              await store.repository.updateOrderPaymentStatus(order.id, 'paid');
              await store.loadOrders();
              final updatedOrder = store.orders.firstWhere(
                (o) => o.id == order.id,
                orElse: () => order,
              );
              if (mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(
                    builder: (_) => OrderConfirmationScreen(order: updatedOrder),
                  ),
                  (route) => route.settings.name == '/shell',
                );
              }
            } else {
              if (mounted) {
                _navigateToFailure(context, 'Payment was not completed. Please try again.');
              }
            }
          } else if (paymentResult == PaymentResult.failure && mounted) {
            _navigateToFailure(context, 'Payment failed. Please try again.');
          } else if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Payment cancelled.'),
                backgroundColor: colors.error,
              ),
            );
          }
        } else if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Payment gateway unavailable. Please try Cash on Delivery.'),
              backgroundColor: colors.error,
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('[CheckoutPage] Unexpected error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Something went wrong: ${e.toString()}'),
            backgroundColor: colors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => busy = false);
      }
    }
  }

  void _navigateToFailure(BuildContext ctx, String message) {
    Navigator.of(ctx).pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (_) => CheckoutFailureScreen(
          errorMessage: message,
          onRetry: () => Navigator.pop(ctx),
        ),
      ),
      (route) => route.settings.name == '/shell',
    );
  }

  Order _buildFallbackOrder(String orderId, ShippingAddress address, String paymentMethod, ZarwintoStore store) {
    final items = store.cart.asMap().entries.map((entry) {
      final item = entry.value;
      return OrderItem(
        id: 'oi_fallback_${entry.key}',
        orderId: orderId,
        productId: item.product.id,
        variantId: item.variant.id,
        quantity: item.quantity,
        price: item.product.currentPrice,
        variantSize: item.variant.size,
        variantColor: item.color ?? item.variant.color,
      );
    }).toList();

    final status = paymentMethod == 'cod' ? 'processing' : 'pending';
    final paymentStatus = paymentMethod == 'cod' ? 'cod_pending' : 'unpaid';

    return Order(
      id: orderId,
      userId: '',
      status: status,
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      totalAmount: store.total,
      shippingAddress: address.toJson(),
      items: items,
      createdAt: DateTime.now(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    final colors = ZarwintoColors.of(context);
    final money = inrFormat;
    const shippingCost = 0.0;
    final grandTotal = store.total + shippingCost;

    // Total MRP vs the (sale) price actually charged, so we can surface savings.
    final mrpTotal = store.cart.fold<double>(
      0,
      (sum, item) => sum + item.product.price * item.quantity,
    );
    final productSavings = mrpTotal - store.subtotal;
    final totalSavings = productSavings + store.discount;
    final discountPercent = mrpTotal > 0 ? (totalSavings / mrpTotal * 100) : 0.0;
    final showDiscount = totalSavings > 0;

    if (store.profile == null) {
      return Scaffold(
        backgroundColor: ZarwintoColors.background,
        appBar: AppBar(
          title: const Text('Checkout'),
          backgroundColor: ZarwintoColors.background,
          foregroundColor: ZarwintoColors.foreground,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: ZarwintoColors.primary.withValues(alpha: .12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: ZarwintoColors.primary.withValues(alpha: .2)),
                  ),
                  child: HugeIcon(icon: HugeIcons.strokeRoundedLock, color: ZarwintoColors.primary, size: 32),
                ),
                const SizedBox(height: 24),
                Text(
                  'Sign in to checkout',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: colors.foreground),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please sign in to complete your purchase.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: ZarwintoColors.muted, fontSize: 14),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () {
                      Navigator.of(context).pushNamed('/login');
                    },
                    child: const Text('Sign In'),
                  ),
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
        title: const Text('Checkout'),
        actions: [
          if (store.cart.isNotEmpty)
            TextButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: HugeIcon(icon: HugeIcons.strokeRoundedShoppingBag01, size: 18, color: Colors.black),
              label: Text('${store.cart.length} items'),
            ),
        ],
      ),
      body: store.cart.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  HugeIcon(icon: 
                    HugeIcons.strokeRoundedShoppingBag01,
                    size: 64,
                    color: ZarwintoColors.muted,
                  ),
                  const SizedBox(height: ZarwintoSpacing.lg),
                  Text(
                    'Your cart is empty',
                    style: ZarwintoTypography.title.copyWith(color: colors.foreground),
                  ),
                  const SizedBox(height: ZarwintoSpacing.md),
                  ZButton.primary(
                    onPressed: () => Navigator.pop(context),
                    label: 'Continue Shopping',
                  ),
                ],
              ),
            )
          : !_addressesLoaded
              ? _buildShimmerCheckout(colors)
              : ListView(
                  padding: const EdgeInsets.all(ZarwintoSpacing.lg),
                  children: [
                    Text(
                      'Your Items',
                      style: ZarwintoTypography.title.copyWith(color: colors.foreground),
                    ),
                    const SizedBox(height: ZarwintoSpacing.md),
                    ...store.cart.map((item) => CartRow(item)),
                    const SizedBox(height: ZarwintoSpacing.lg),

                    Text(
                      'Shipping Address',
                      style: ZarwintoTypography.title.copyWith(color: colors.foreground),
                    ),
                    const SizedBox(height: ZarwintoSpacing.md),

                    if (!editing && selectedAddress != null) ...[
                      _AddressCard(
                        address: selectedAddress!,
                        onEdit: () => setState(() => editing = true),
                        colors: colors,
                      ),
                      const SizedBox(height: ZarwintoSpacing.sm),
                      TextButton.icon(
                        onPressed: () => setState(() => editing = true),
                        icon: HugeIcon(icon: HugeIcons.strokeRoundedEdit01, size: 18, color: Colors.black),
                        label: const Text('Change Address'),
                      ),
                    ] else ...[
                      TextField(
                        controller: fullName,
                        decoration: const InputDecoration(labelText: 'Full name'),
                        style: ZarwintoTypography.body.copyWith(color: colors.foreground),
                      ),
                      const SizedBox(height: ZarwintoSpacing.sm),
                      TextField(
                        controller: phone,
                        decoration: const InputDecoration(labelText: 'Phone'),
                        style: ZarwintoTypography.body.copyWith(color: colors.foreground),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: ZarwintoSpacing.sm),
                      TextField(
                        controller: address,
                        decoration: const InputDecoration(labelText: 'Street Address, Flat / House No.'),
                        style: ZarwintoTypography.body.copyWith(color: colors.foreground),
                      ),
                      const SizedBox(height: ZarwintoSpacing.sm),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: city,
                              decoration: const InputDecoration(labelText: 'City'),
                              style: ZarwintoTypography.body.copyWith(color: colors.foreground),
                            ),
                          ),
                          const SizedBox(width: ZarwintoSpacing.sm),
                          Expanded(
                            child: TextField(
                              controller: state,
                              decoration: const InputDecoration(labelText: 'State'),
                              style: ZarwintoTypography.body.copyWith(color: colors.foreground),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: ZarwintoSpacing.sm),
                      TextField(
                        controller: pincode,
                        decoration: const InputDecoration(
                          labelText: 'Pincode (6 digits)',
                          hintText: 'e.g. 110001',
                        ),
                        style: ZarwintoTypography.body.copyWith(color: colors.foreground),
                        keyboardType: TextInputType.number,
                      ),
                      const SizedBox(height: ZarwintoSpacing.xs),
                      if (addresses.isNotEmpty)
                        TextButton.icon(
                          onPressed: () {
                            setState(() {
                              editing = false;
                              final defaultAddr = addresses.firstWhere(
                                (addr) => addr.isDefault,
                                orElse: () => addresses.first,
                              );
                              selectedAddress = defaultAddr;
                              fullName.text = defaultAddr.fullName;
                              phone.text = defaultAddr.phone;
                              address.text = defaultAddr.addressLine1;
                              city.text = defaultAddr.city;
                              state.text = defaultAddr.state;
                              pincode.text = defaultAddr.pincode;
                            });
                          },
                          icon: HugeIcon(icon: HugeIcons.strokeRoundedArrowLeft01, size: 18, color: Colors.black),
                          label: const Text('Use saved address'),
                        ),
                    ],

                    const SizedBox(height: ZarwintoSpacing.lg),

                    Text(
                      'Payment Method',
                      style: ZarwintoTypography.title.copyWith(color: colors.foreground),
                    ),
                    const SizedBox(height: ZarwintoSpacing.md),
                    Column(
                      children: [
                        _PaymentOption(
                          label: 'UPI (GPay, PhonePe, Paytm)',
                          subtitle: 'Pay instantly with any UPI app',
                          icon: HugeIcons.strokeRoundedSmartPhone01,
                          selected: paymentMethod == 'cashfree_upi',
                          onTap: () => setState(() => paymentMethod = 'cashfree_upi'),
                          colors: colors,
                        ),
                        const SizedBox(height: ZarwintoSpacing.sm),
                        _PaymentOption(
                          label: 'Credit / Debit Card',
                          subtitle: 'Visa, Mastercard, RuPay',
                          icon: HugeIcons.strokeRoundedCreditCard,
                          selected: paymentMethod == 'card',
                          onTap: () => setState(() => paymentMethod = 'card'),
                          colors: colors,
                        ),
                        const SizedBox(height: ZarwintoSpacing.sm),
                        _PaymentOption(
                          label: 'Net Banking',
                          subtitle: 'All major banks supported',
                          icon: HugeIcons.strokeRoundedBuilding01,
                          selected: paymentMethod == 'netbanking',
                          onTap: () => setState(() => paymentMethod = 'netbanking'),
                          colors: colors,
                        ),
                        const SizedBox(height: ZarwintoSpacing.sm),
                        _PaymentOption(
                          label: 'Cash on Delivery (COD)',
                          subtitle: 'Pay when you receive',
                          icon: HugeIcons.strokeRoundedPayment01,
                          selected: paymentMethod == 'cod',
                          onTap: () => setState(() => paymentMethod = 'cod'),
                          colors: colors,
                        ),
                      ],
                    ),

                    const SizedBox(height: ZarwintoSpacing.lg),

                    Container(
                      padding: const EdgeInsets.all(ZarwintoSpacing.md),
                      decoration: BoxDecoration(
                        color: colors.card,
                        borderRadius: ZarwintoRadius.all12,
                        border: Border.all(color: colors.border),
                      ),
                      child: Column(
                        children: [
                          PriceLine(
                            label: showDiscount ? 'MRP' : 'Subtotal',
                            value: money.format(showDiscount ? mrpTotal : store.subtotal),
                          ),
                          if (showDiscount) ...[
                            const SizedBox(height: ZarwintoSpacing.xs),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Discount',
                                  style: ZarwintoTypography.caption.copyWith(
                                    fontWeight: FontWeight.w500,
                                    color: colors.success,
                                  ),
                                ),
                                Text(
                                  '-${money.format(totalSavings)} (${discountPercent.toStringAsFixed(0)}% off)',
                                  style: ZarwintoTypography.caption.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: colors.success,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: ZarwintoSpacing.xs),
                            PriceLine(
                              label: 'Sale Price',
                              value: money.format(store.subtotal),
                            ),
                          ],
                          const SizedBox(height: ZarwintoSpacing.xs),
                          PriceLine(
                            label: 'Delivery',
                            value: 'FREE',
                          ),
                          const Divider(height: 20),
                          PriceLine(
                            label: 'Total',
                            value: money.format(grandTotal),
                            emphasis: true,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: ZarwintoSpacing.lg),
                    ZButton.primary(
                      onPressed: busy ? null : _placeOrder,
                      label: paymentMethod == 'cod' ? 'Place Order (COD)' : 'Pay ₹${grandTotal.toInt()}',
                      isLoading: busy,
                    ),
                    const SizedBox(height: ZarwintoSpacing.lg),
                  ],
                ),
    );
  }

  Widget _buildShimmerCheckout(ZarwintoColorBundle colors) {
    return ListView(
      padding: const EdgeInsets.all(ZarwintoSpacing.lg),
      children: [
        Shimmer.fromColors(
          baseColor: colors.border,
          highlightColor: Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const ShimmerBox(width: 100, height: 20, borderRadius: 4),
              const SizedBox(height: ZarwintoSpacing.md),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: 3,
                itemBuilder: (context, index) => const Padding(
                  padding: EdgeInsets.only(bottom: ZarwintoSpacing.md),
                  child: ShimmerCheckoutItem(),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: ZarwintoSpacing.md),
        Shimmer.fromColors(
          baseColor: colors.border,
          highlightColor: Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const ShimmerBox(width: 140, height: 20, borderRadius: 4),
              const SizedBox(height: ZarwintoSpacing.md),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: 2,
                itemBuilder: (context, index) => const Padding(
                  padding: EdgeInsets.only(bottom: ZarwintoSpacing.sm),
                  child: ShimmerBox(
                    width: double.infinity,
                    height: 48,
                    borderRadius: 12,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: ZarwintoSpacing.md),
        Shimmer.fromColors(
          baseColor: colors.border,
          highlightColor: Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const ShimmerBox(width: 160, height: 20, borderRadius: 4),
              const SizedBox(height: ZarwintoSpacing.md),
              Column(
                children: List.generate(4, (i) => const Padding(
                  padding: EdgeInsets.only(bottom: ZarwintoSpacing.sm),
                  child: ShimmerBox(width: double.infinity, height: 13, borderRadius: 4),
                )),
              ),
              const SizedBox(height: ZarwintoSpacing.xs),
              const ShimmerBox(width: double.infinity, height: 48, borderRadius: 12),
            ],
          ),
        ),
      ],
    );
  }
}

class ShimmerCheckoutItem extends StatelessWidget {
  const ShimmerCheckoutItem({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(ZarwintoSpacing.md),
        child: Row(
          children: [
            const ShimmerBox(
              width: 76,
              height: 76,
              borderRadius: 12,
            ),
            const SizedBox(width: ZarwintoSpacing.md),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShimmerBox(width: double.infinity, height: 14, borderRadius: 4),
                  SizedBox(height: ZarwintoSpacing.xs),
                  ShimmerBox(width: 100, height: 12, borderRadius: 4),
                  SizedBox(height: ZarwintoSpacing.sm),
                  ShimmerBox(width: 60, height: 16, borderRadius: 4),
                ],
              ),
            ),
            Column(
              children: List.generate(3, (i) => const Padding(
                padding: EdgeInsets.only(bottom: ZarwintoSpacing.xs),
                child: ShimmerBox(width: 24, height: 24, borderRadius: 12),
              )),
            ),
          ],
        ),
      ),
    );
  }
}

class _AddressCard extends StatelessWidget {
  const _AddressCard({required this.address, required this.onEdit, required this.colors});

  final Address address;
  final VoidCallback onEdit;
  final ZarwintoColorBundle colors;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(ZarwintoSpacing.md),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: ZarwintoRadius.all12,
        border: Border.all(color: colors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(ZarwintoSpacing.xs),
            decoration: BoxDecoration(
              color: colors.primary.withValues(alpha: 0.08),
              borderRadius: ZarwintoRadius.all12,
            ),
            child: HugeIcon(icon: HugeIcons.strokeRoundedLocation01, size: 20, color: colors.primary),
          ),
          const SizedBox(width: ZarwintoSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      address.fullName,
                      style: ZarwintoTypography.caption.copyWith(
                        fontWeight: FontWeight.w700,
                        color: colors.foreground,
                      ),
                    ),
                    if (address.isDefault) ...[
                      const SizedBox(width: ZarwintoSpacing.xs),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: ZarwintoSpacing.xs, vertical: 2),
                        decoration: BoxDecoration(
                          color: colors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(ZarwintoRadius.sm),
                        ),
                        child: Text(
                          'Default',
                          style: ZarwintoTypography.small.copyWith(color: colors.primary),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: ZarwintoSpacing.xs),
                Text(
                  address.fullAddress,
                  style: ZarwintoTypography.caption.copyWith(
                    color: colors.secondaryText,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: ZarwintoSpacing.xs),
                Text(
                  address.phone,
                  style: ZarwintoTypography.small.copyWith(color: colors.secondaryText),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onEdit,
            icon: HugeIcon(icon: HugeIcons.strokeRoundedEdit01, size: 20, color: ZarwintoColors.primary),
            color: colors.primary,
          ),
        ],
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  const _PaymentOption({
    required this.label,
    this.subtitle,
    required this.icon,
    required this.selected,
    required this.onTap,
    required this.colors,
  });

  final String label;
  final String? subtitle;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  final ZarwintoColorBundle colors;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(ZarwintoSpacing.md),
        decoration: BoxDecoration(
          color: selected ? colors.primary.withValues(alpha: 0.04) : colors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? colors.primary : colors.border,
            width: selected ? 2 : 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: colors.primary.withValues(alpha: 0.12),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: selected ? colors.primary.withValues(alpha: 0.12) : colors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: HugeIcon(
                icon: icon,
                size: 22,
                color: selected ? colors.primary : colors.secondaryText,
              ),
            ),
            const SizedBox(width: ZarwintoSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: ZarwintoTypography.body.copyWith(
                      fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                      color: selected ? colors.primary : colors.foreground,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: ZarwintoTypography.caption.copyWith(
                        color: colors.muted,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (selected)
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: colors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: HugeIcon(
                  icon: HugeIcons.strokeRoundedCheckmarkCircle02,
                  size: 14,
                  color: Colors.white,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
