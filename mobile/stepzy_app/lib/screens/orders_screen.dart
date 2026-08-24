import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'dart:io';
import '../providers/zarwinto_store.dart';
import '../core/theme.dart';
import '../models/order.dart';
import '../screens/product_detail.dart';
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
  bool _loadingMore = false;
  String? _error;
  String? _expandedOrderId;
  int _currentPage = 1;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _expandedOrderId = widget.initialOrderId;
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadOrders(reset: true);
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _launchWhatsApp() async {
    final uri = Uri.parse(
      'https://wa.me/917982369183?text=${Uri.encodeComponent('Hi Zarwinto, I need help with my order.')}',
    );
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open WhatsApp: $e')),
        );
      }
    }
  }

  Future<void> _loadOrders({bool reset = true}) async {
    if (!mounted) return;
    if (reset) {
      setState(() {
        _orders = [];
        _loading = true;
        _error = null;
        _currentPage = 1;
        _hasMore = true;
      });
    } else if (_loadingMore || !_hasMore) {
      return;
    }

    try {
      final store = ZarwintoScope.of(context, listen: false);
      final newOrders = await store.repository.loadOrdersPage(page: _currentPage, pageSize: 10);

      if (mounted) {
        setState(() {
          _orders = reset ? newOrders : [..._orders, ...newOrders];
          _loading = false;
          _loadingMore = false;
          _hasMore = newOrders.length >= 10;
          _currentPage = _currentPage + 1;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = reset ? e.toString() : null;
          _loading = false;
          _loadingMore = false;
        });
      }
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      _loadOrders(reset: false);
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
          actions: const [],
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
        actions: const [],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _launchWhatsApp,
        backgroundColor: ZarwintoColors.whatsappGreen,
        tooltip: 'Chat on WhatsApp',
        child: HugeIcon(
          icon: HugeIcons.strokeRoundedWhatsapp,
          color: Colors.white,
          size: 26,
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadOrders,
        child: _loading
            ? ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: 3,
                itemBuilder: (context, index) => const ShimmerOrderCard(),
              )
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
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _orders.length + (_hasMore || _loadingMore ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index < _orders.length) {
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
                          }

                          if (_hasMore) {
                            return const Padding(
                              padding: EdgeInsets.symmetric(vertical: 20),
                              child: ShimmerOrderCard(),
                            );
                          }

                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 20),
                            child: Center(
                              child: Text(
                                'No more orders',
                                style: mutedStyle.copyWith(fontSize: 12),
                              ),
                            ),
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

  Widget _orderItemPlaceholder([double size = 52]) => Container(
        width: size,
        height: size,
        color: ZarwintoColors.background,
        child: HugeIcon(
          icon: HugeIcons.strokeRoundedImage01,
          size: size * 0.46,
          color: ZarwintoColors.muted,
        ),
      );

  String? _resolveItemImage(ZarwintoStore store, OrderItem item) {
    if (item.productImage != null && item.productImage!.isNotEmpty) {
      return item.productImage;
    }
    try {
      final product = store.products.firstWhere((p) => p.id == item.productId);
      if (product.images.isNotEmpty) return product.images.first;
    } catch (_) {
      // product not loaded in the store
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final moneyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    final statusColor = _getStatusColor(order.status);
    final shortId = order.id.length > 8 ? order.id.substring(0, 8) : order.id;
    final itemCount = order.items.fold<int>(0, (sum, item) => sum + item.quantity);
    final store = ZarwintoScope.of(context, listen: false);
    final headerImage = order.items.isNotEmpty ? _resolveItemImage(store, order.items.first) : null;

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
                  if (headerImage != null)
                    GestureDetector(
                      onTap: () {
                        try {
                          final product = store.products.firstWhere((p) => p.id == order.items.first.productId);
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => ProductDetailPage(product: product)),
                          );
                        } catch (e) {
                          // product not found in current catalog
                        }
                      },
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          headerImage,
                          width: 48,
                          height: 48,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => _orderItemPlaceholder(48),
                        ),
                      ),
                    ),
                  if (headerImage != null)
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
                    OrderStatusTracker(currentStatus: order.status, orderDate: order.createdAt),
                    const SizedBox(height: 14),
                    ...order.items.map((item) {
                      return Padding(
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
                    );
                    }),
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
                        Row(
                          children: [
                            Text('Payment: ${order.paymentMethod.toUpperCase()} ', style: const TextStyle(color: ZarwintoColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: _paymentStatusColor(order.paymentStatus).withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: _paymentStatusColor(order.paymentStatus).withValues(alpha: 0.3)),
                              ),
                              child: Text(
                                order.paymentStatus.toUpperCase(),
                                style: TextStyle(color: _paymentStatusColor(order.paymentStatus), fontSize: 11, fontWeight: FontWeight.w700),
                              ),
                            ),
                          ],
                        ),
                        Text(moneyFormat.format(order.totalAmount), style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: ZarwintoColors.primary)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        if (_isCancellable(order.status)) ...[
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => _showCancelDialog(context, order),
                              icon: HugeIcon(icon: HugeIcons.strokeRoundedDelete01, size: 18, color: ZarwintoColors.error),
                              label: const Text('Cancel Order', style: TextStyle(color: ZarwintoColors.error)),
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(color: ZarwintoColors.error.withValues(alpha: 0.3)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                        ],
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _downloadInvoice(context, order),
                            icon: HugeIcon(icon: HugeIcons.strokeRoundedDownload01, size: 18, color: ZarwintoColors.primary),
                            label: const Text('Download Invoice', style: TextStyle(color: ZarwintoColors.primary)),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: ZarwintoColors.primary.withValues(alpha: 0.3)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
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

  Color _paymentStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'paid':
        return ZarwintoColors.success;
      case 'unpaid':
      case 'pending':
        return ZarwintoColors.warning;
      case 'failed':
      case 'cancelled':
        return ZarwintoColors.error;
      case 'refunded':
        return ZarwintoColors.secondary;
      default:
        return ZarwintoColors.muted;
    }
  }

  bool _isCancellable(String status) {
    final lower = status.toLowerCase();
    return lower == 'pending' || lower == 'processing';
  }

  pw.Document _buildInvoicePdf(Order order) {
    final money = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);
    final addr = order.shippingAddress;
    final name = addr['fullName']?.toString() ?? '';
    final phone = addr['phone']?.toString() ?? '';
    final line1 = addr['addressLine1']?.toString() ?? '';
    final city = addr['city']?.toString() ?? '';
    final state = addr['state']?.toString() ?? '';
    final pincode = addr['pincode']?.toString() ?? '';
    final addressLine = [line1, city, state, pincode.isNotEmpty ? pincode : null]
        .where((e) => e != null && e.isNotEmpty)
        .join(', ');

    final subtotal = order.items.fold<double>(0, (sum, i) => sum + i.lineTotal);
    final discount = order.discountAmount;

    pw.Widget cell(String text,
        {bool bold = false, pw.TextAlign align = pw.TextAlign.left}) {
      return pw.Padding(
        padding: const pw.EdgeInsets.all(6),
        child: pw.Text(
          text,
          textAlign: align,
          style: pw.TextStyle(
            fontWeight: bold ? pw.FontWeight.bold : pw.FontWeight.normal,
            fontSize: 10,
          ),
        ),
      );
    }

    pw.Widget totalRow(String label, String value, {bool bold = false}) {
      final style = pw.TextStyle(
        fontWeight: bold ? pw.FontWeight.bold : pw.FontWeight.normal,
        fontSize: bold ? 13 : 11,
      );
      return pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [pw.Text(label, style: style), pw.Text(value, style: style)],
      );
    }

    final doc = pw.Document(title: 'Invoice ${order.id}');
    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text('ZARWINTO',
                        style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
                    pw.Text('Tax Invoice',
                        style: pw.TextStyle(fontSize: 12, color: PdfColors.grey700)),
                  ],
                ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Text('Invoice #${order.id}'),
                    pw.Text('Date: ${order.formattedDate}'),
                    pw.Text('Status: ${order.statusDisplay}'),
                  ],
                ),
              ],
            ),
            pw.SizedBox(height: 24),
            pw.Text('Bill To / Ship To',
                style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
            pw.SizedBox(height: 6),
            if (name.isNotEmpty) pw.Text(name, style: pw.TextStyle(fontSize: 12)),
            if (addressLine.isNotEmpty)
              pw.Text(addressLine, style: pw.TextStyle(fontSize: 12)),
            if (phone.isNotEmpty)
              pw.Text('Phone: $phone', style: pw.TextStyle(fontSize: 12)),
            pw.SizedBox(height: 24),
            pw.Table(
              border: pw.TableBorder.all(color: PdfColors.grey400),
              columnWidths: {
                0: const pw.FlexColumnWidth(4),
                1: const pw.FlexColumnWidth(2.5),
                2: const pw.FlexColumnWidth(1),
                3: const pw.FlexColumnWidth(1.5),
                4: const pw.FlexColumnWidth(1.5),
              },
              children: [
                pw.TableRow(
                  decoration: const pw.BoxDecoration(color: PdfColors.grey200),
                  children: [
                    cell('Product', bold: true),
                    cell('Size / Color', bold: true),
                    cell('Qty', bold: true, align: pw.TextAlign.center),
                    cell('Price', bold: true, align: pw.TextAlign.right),
                    cell('Total', bold: true, align: pw.TextAlign.right),
                  ],
                ),
                ...order.items.map(
                  (item) => pw.TableRow(
                    children: [
                      cell(item.productTitle ?? 'Product'),
                      cell(() {
                        final bits = <String>[];
                        if (item.variantSize != null && item.variantSize!.isNotEmpty) {
                          bits.add(item.variantSize!);
                        }
                        if (item.variantColor != null && item.variantColor!.isNotEmpty) {
                          bits.add(item.variantColor!);
                        }
                        return bits.join(' / ');
                      }()),
                      cell('${item.quantity}', align: pw.TextAlign.center),
                      cell(money.format(item.price), align: pw.TextAlign.right),
                      cell(money.format(item.lineTotal), align: pw.TextAlign.right),
                    ],
                  ),
                ),
              ],
            ),
            pw.SizedBox(height: 16),
            pw.Align(
              alignment: pw.Alignment.centerRight,
              child: pw.Container(
                width: 240,
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    totalRow('Subtotal', money.format(subtotal)),
                    totalRow('Discount', discount > 0 ? '- ${money.format(discount)}' : money.format(0)),
                    totalRow('Shipping', 'FREE'),
                    pw.SizedBox(height: 6),
                    pw.Divider(),
                    totalRow('Total', money.format(order.totalAmount), bold: true),
                  ],
                ),
              ),
            ),
            pw.SizedBox(height: 24),
            pw.Divider(),
            pw.SizedBox(height: 8),
            pw.Text(
              'Payment: ${order.paymentMethod.toUpperCase()}  •  ${order.paymentStatus.toUpperCase()}',
              style: pw.TextStyle(fontSize: 10, color: PdfColors.grey700),
            ),
            pw.SizedBox(height: 6),
            pw.Text('Thank you for shopping with Zarwinto!',
                style: pw.TextStyle(fontSize: 10, color: PdfColors.grey700)),
          ],
        ),
      ),
    );
    return doc;
  }

  Future<void> _downloadInvoice(BuildContext context, Order order) async {
    try {
      final doc = _buildInvoicePdf(order);
      final bytes = await doc.save();
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/Zarwinto_Invoice_${order.id}.pdf');
      await file.writeAsBytes(bytes);
      await Share.shareXFiles(
        [XFile(file.path)],
        subject: 'Zarwinto Invoice #${order.id}',
        text: 'Your Zarwinto invoice for order #${order.id}',
      );
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not generate invoice: $e')),
        );
      }
    }
  }

  Future<void> _showCancelDialog(BuildContext context, Order order) async {
    final reasons = [
      'Changed my mind',
      'Found better price elsewhere',
      'Ordered by mistake',
      'Need to change address',
      'Other',
    ];

    String? selectedReason;
    final rootContext = context;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: ZarwintoColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: HugeIcon(icon: HugeIcons.strokeRoundedDelete01, color: ZarwintoColors.error, size: 20),
                ),
                const SizedBox(width: 12),
                const Text('Cancel Order', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Are you sure you want to cancel order #${order.id.length > 8 ? order.id.substring(0, 8) : order.id}?',
                  style: const TextStyle(color: ZarwintoColors.muted, fontSize: 14),
                ),
                const SizedBox(height: 16),
                const Text('Please select a reason:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 10),
                ...reasons.map((reason) {
                  final isSelected = selectedReason == reason;
                  return GestureDetector(
                    onTap: () {
                      setState(() => selectedReason = reason);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? ZarwintoColors.error.withValues(alpha: 0.06) : ZarwintoColors.card,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? ZarwintoColors.error : ZarwintoColors.border,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            width: 20,
                            height: 20,
                            decoration: BoxDecoration(
                              color: isSelected ? ZarwintoColors.error : Colors.transparent,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected ? ZarwintoColors.error : ZarwintoColors.muted,
                                width: 2,
                              ),
                            ),
                            child: isSelected
                                ? const Icon(Icons.check, size: 12, color: Colors.white)
                                : null,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              reason,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                color: isSelected ? ZarwintoColors.error : ZarwintoColors.foreground,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Keep Order'),
              ),
              FilledButton(
                onPressed: selectedReason == null
                    ? null
                    : () async {
                        Navigator.pop(ctx);
                        final store = ZarwintoScope.of(rootContext, listen: false);
                        try {
                          await store.cancelOrder(order.id, selectedReason!);
                          if (rootContext.mounted) {
                            ScaffoldMessenger.of(rootContext).showSnackBar(
                              SnackBar(
                                content: Text('Order #${order.id.length > 8 ? order.id.substring(0, 8) : order.id} cancelled'),
                                backgroundColor: ZarwintoColors.error,
                              ),
                            );
                          }
                        } catch (e) {
                          if (rootContext.mounted) {
                            ScaffoldMessenger.of(rootContext).showSnackBar(
                              SnackBar(
                                content: Text('Failed to cancel order: $e'),
                                backgroundColor: ZarwintoColors.error,
                              ),
                            );
                          }
                        }
                      },
                style: FilledButton.styleFrom(
                  backgroundColor: ZarwintoColors.error,
                ),
                child: const Text('Cancel Order'),
              ),
            ],
          );
        },
      ),
    );
  }
}

class ShimmerOrderCard extends StatelessWidget {
  const ShimmerOrderCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: const Color(0xFFF2F2F3),
      highlightColor: const Color(0xFFFAFAFA),
      period: const Duration(milliseconds: 1200),
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    height: 14,
                    width: 120,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Container(
                      height: 12,
                      width: 56,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  Container(
                    height: 12,
                    width: 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    height: 12,
                    width: 80,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  const Spacer(),
                  Container(
                    height: 12,
                    width: 64,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Container(
                height: 48,
                width: 48,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              const SizedBox(height: 10),
              ...List.generate(2, (_) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 12,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      height: 12,
                      width: 60,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ],
                ),
              )),
              const SizedBox(height: 12),
              Container(
                height: 1,
                color: Colors.white,
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 12,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    height: 16,
                    width: 80,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
