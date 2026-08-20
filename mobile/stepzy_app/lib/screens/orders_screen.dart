import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:intl/intl.dart';
import '../providers/zarwinto_store.dart';
import '../core/theme.dart';
import '../models/order.dart';
import '../widgets/order_status_tracker.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key, this.initialOrderId});

  final String? initialOrderId;

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<Order> _orders = [];
  bool _loading = true;
  String? _error;
  String? _expandedOrderId;

  @override
  void initState() {
    super.initState();
    _expandedOrderId = widget.initialOrderId;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadOrders();
    });
  }

  Future<void> _loadOrders() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final store = ZarwintoScope.of(context, listen: false);
      final orders = await store.repository.loadOrders();
      if (mounted) {
        setState(() {
          _orders = orders;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = ZarwintoScope.of(context);
    
    if (store.profile == null) {
      return Scaffold(
        backgroundColor: ZarwintoColors.background,
        appBar: AppBar(
          title: const Text('My Orders'),
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
                HugeIcon(icon: HugeIcons.strokeRoundedShoppingBag01, size: 64, color: ZarwintoColors.muted),
                const SizedBox(height: 16),
                Text(
                  'Sign in to view orders',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Please sign in to see your order history.',
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
        title: const Text('My Orders'),
        backgroundColor: ZarwintoColors.background,
        foregroundColor: ZarwintoColors.foreground,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: _loadOrders,
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: ZarwintoColors.primary))
            : _error != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          HugeIcon(icon: HugeIcons.strokeRoundedAlertCircle, size: 48, color: ZarwintoColors.error),
                          const SizedBox(height: 16),
                          Text(
                            'Failed to load orders',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _error!,
                            style: Theme.of(context).textTheme.bodySmall,
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            onPressed: _loadOrders,
                            icon: HugeIcon(icon: HugeIcons.strokeRoundedRefresh, color: Colors.white),
                            label: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  )
                : _orders.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            HugeIcon(icon: HugeIcons.strokeRoundedShoppingBag01, size: 64, color: ZarwintoColors.muted),
                            const SizedBox(height: 16),
                            Text(
                              'No orders yet',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Start shopping to see your orders here',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _orders.length,
                        itemBuilder: (context, index) {
                          final order = _orders[index];
                          final isExpanded = _expandedOrderId == order.id;
                          return OrderCard(
                            order: order,
                            isExpanded: isExpanded,
                            onToggleExpand: () {
                              setState(() {
                                _expandedOrderId = isExpanded ? null : order.id;
                              });
                            },
                          );
                        },
                      ),
      ),
    );
  }
}

class OrderCard extends StatelessWidget {
  const OrderCard({
    super.key,
    required this.order,
    this.isExpanded = false,
    this.onToggleExpand,
  });

  final Order order;
  final bool isExpanded;
  final VoidCallback? onToggleExpand;

  @override
  Widget build(BuildContext context) {
    final moneyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    final statusColor = _getStatusColor(order.status);
    final shortId = order.id.length > 8 ? order.id.substring(0, 8) : order.id;
    final itemCount = order.items.fold<int>(0, (sum, item) => sum + item.quantity);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onToggleExpand,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Order #$shortId',
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      order.statusDisplay,
                      style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  if (order.items.isNotEmpty && order.items.first.productImage != null && order.items.first.productImage!.isNotEmpty)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        order.items.first.productImage!,
                        width: 48,
                        height: 48,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 48,
                            height: 48,
                            color: ZarwintoColors.background,
                            child: HugeIcon(icon: HugeIcons.strokeRoundedImage01, size: 24, color: ZarwintoColors.muted),
                          );
                        },
                      ),
                    ),
                  if (order.items.isNotEmpty && order.items.first.productImage != null && order.items.first.productImage!.isNotEmpty)
                    const SizedBox(width: 12),
                  Expanded(
                    child: Text(order.formattedDate, style: const TextStyle(color: ZarwintoColors.muted, fontSize: 12)),
                  ),
                  Text('$itemCount item${itemCount == 1 ? '' : 's'}', style: const TextStyle(color: ZarwintoColors.muted, fontSize: 12)),
                  const SizedBox(width: 12),
                  Text(moneyFormat.format(order.totalAmount), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
                  const SizedBox(width: 4),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      key: ValueKey(isExpanded),
                      size: 18,
                      color: ZarwintoColors.muted,
                    ),
                  ),
                ],
              ),
              AnimatedCrossFade(
                crossFadeState: isExpanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
                duration: const Duration(milliseconds: 250),
                firstChild: const SizedBox.shrink(),
                secondChild: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 14),
                    const Divider(height: 1),
                    const SizedBox(height: 12),
                    OrderStatusTracker(currentStatus: order.status),
                    const SizedBox(height: 14),
                    ...order.items.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.productTitle ?? 'Product',
                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (item.variantSize != null || item.variantColor != null)
                                  Text(
                                    'Size: ${item.variantSize ?? '-'} • ${item.variantColor ?? ''}'.trim(),
                                    style: const TextStyle(color: ZarwintoColors.muted, fontSize: 12),
                                  ),
                                Text('Qty: ${item.quantity}', style: const TextStyle(color: ZarwintoColors.muted, fontSize: 12)),
                              ],
                            ),
                          ),
                          Text(
                            moneyFormat.format(item.lineTotal),
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                          ),
                        ],
                      ),
                    )),
                    if (order.shippingAddress.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      const Divider(height: 1),
                      const SizedBox(height: 10),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          HugeIcon(icon: HugeIcons.strokeRoundedLocation01, size: 16, color: ZarwintoColors.muted),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Deliver to: ${order.shippingAddress['fullName'] ?? ''}, ${order.shippingAddress['addressLine1'] ?? ''}, ${order.shippingAddress['city'] ?? ''} ${order.shippingAddress['pincode'] ?? ''}',
                              style: const TextStyle(color: ZarwintoColors.muted, fontSize: 12),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 12),
                    const Divider(height: 1),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Payment: ${order.paymentMethod.toUpperCase()}', style: const TextStyle(color: ZarwintoColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
                        Text(moneyFormat.format(order.totalAmount), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: ZarwintoColors.primary)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending': return ZarwintoColors.warning;
      case 'processing': return ZarwintoColors.info;
      case 'shipped': return ZarwintoColors.secondary;
      case 'delivered': return ZarwintoColors.success;
      case 'cancelled': return ZarwintoColors.error;
      default: return ZarwintoColors.muted;
    }
  }
}
