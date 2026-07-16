'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createClient, isSupabaseConfigured } from '../../lib/supabase/client';
import { Product } from '../../types';
import { User, ShoppingBag, Heart, MapPin, Check, Plus, Edit3, LogOut, ArrowRight, Star, Store } from 'lucide-react';
import ShimmerImage from '../../components/ShimmerImage';

export default function AccountContent({ products }: { products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wishlist, toggleWishlist, orders } = useCart();
  const { user, signOut, updateProfile } = useAuth();

  // Selected tab (default is 'profile')
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile Form States
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);

  const configured = isSupabaseConfigured();

  // Address book state
  const [addresses, setAddresses] = useState<any[]>([]);

  // Current user's store (if they are a vendor)
  const [myStore, setMyStore] = useState<any>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');

  // Fetch addresses
  useEffect(() => {
    if (!user) return;

    if (!configured) {
      setAddresses([
        {
          id: 'addr_1',
          fullName: 'Minhaj Raza',
          phone: '+91 98765 43210',
          addressLine1: '100 Sneaker Plaza, Hype District',
          city: 'New York',
          state: 'NY',
          pincode: '10001',
          default: true
        }
      ]);
      return;
    }

    const fetchAddresses = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setAddresses(data.map((addr: any) => ({
          id: addr.id,
          fullName: addr.full_name,
          phone: addr.phone,
          addressLine1: addr.address_line1,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          default: addr.is_default
        })));
      }
    };

    fetchAddresses();
  }, [configured, user]);

  // Fetch the current user's store (vendor storefront)
  useEffect(() => {
    if (!user || !configured) return;
    const fetchStore = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('stores')
        .select('id, slug, name, logo_url')
        .eq('owner_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      setMyStore(data);
    };
    fetchStore();
  }, [configured, user]);

  // Sync tab with URL parameter changes
  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'profile');
  }, [searchParams]);

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    router.push(`/account?tab=${tabName}`);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateProfile({ full_name: fullName });
    if (!error) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError(null);
    
    if (!newAddrName || !newAddrLine1 || !newAddrCity || !newAddrPincode) {
      setAddrError('Please fill all required fields!');
      return;
    }

    const localAddr = {
      id: `addr_${Date.now()}`,
      fullName: newAddrName,
      phone: newAddrPhone,
      addressLine1: newAddrLine1,
      city: newAddrCity,
      state: newAddrState,
      pincode: newAddrPincode,
      default: false
    };

    if (configured && user) {
      try {
        const supabase = createClient();
        
        // Check if this is the first address
        const { count: existingCount } = await supabase
          .from('addresses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        const isFirstAddress = !existingCount || existingCount === 0;
        
        const { data, error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            full_name: newAddrName,
            phone: newAddrPhone,
            address_line1: newAddrLine1,
            city: newAddrCity,
            state: newAddrState,
            pincode: newAddrPincode,
            is_default: isFirstAddress
          })
          .select()
          .single();

        if (!error && data) {
          setAddresses(prev => [...prev, {
            id: data.id,
            fullName: data.full_name,
            phone: data.phone,
            addressLine1: data.address_line1,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            default: data.is_default
          }]);
        } else {
          console.error('[AccountContent:handleAddAddress] Error inserting address:', error);
          setAddrError(error?.message || 'Error saving address!');
          return; // Don't close form on error
        }
      } catch (err) {
        console.error('[AccountContent:handleAddAddress] Caught error:', err);
        setAddrError(err instanceof Error ? err.message : 'Unknown error!');
        return; // Don't close form on error
      }
    } else {
      setAddresses(prev => [...prev, localAddr]);
    }

    setIsAddingAddress(false);
    
    // Clear inputs
    setNewAddrName('');
    setNewAddrPhone('');
    setNewAddrLine1('');
    setNewAddrCity('');
    setNewAddrState('');
    setNewAddrPincode('');
  };

  const deleteAddress = async (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));

    if (configured && user) {
      const supabase = createClient();
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  // Get wishlisted products
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar Controls */}
      <aside className="lg:col-span-3 space-y-4">
        {/* User Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/[0.05] text-center space-y-3">
          <div className="h-16 w-16 bg-primary/20 text-primary font-bold text-2xl rounded-full flex items-center justify-center mx-auto border border-primary/20">
            {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base leading-tight">{fullName}</h2>
            <p className="text-zinc-500 text-xs mt-0.5">{user.phone || user.email}</p>
          </div>
          <span className="inline-block px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-wider bg-white/[0.04] text-zinc-400 border border-white/[0.06] rounded-md">
            Customer Profile
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="glass-card p-3 rounded-2xl border border-white/[0.05] flex flex-col gap-1">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <User className="h-4 w-4" />
            Profile Details
          </button>
          <button
            onClick={() => handleTabChange('orders')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4" />
              Order History
            </span>
            {orders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'orders' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'}`}>
                {orders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('wishlist')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'wishlist' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <span className="flex items-center gap-3">
              <Heart className="h-4 w-4" />
              Wishlist Manager
            </span>
            {wishlist.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'wishlist' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'}`}>
                {wishlist.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('addresses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'addresses' ? 'bg-primary text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Saved Addresses
          </button>

          {myStore ? (
            <Link
              href={`/store/${myStore.slug}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-primary hover:text-primary-hover hover:bg-primary/10 transition-all"
            >
              <Store className="h-4 w-4" />
              My Store
            </Link>
          ) : (
            <Link
              href="/open-store"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-primary hover:text-primary-hover hover:bg-primary/10 transition-all"
            >
              <Store className="h-4 w-4" />
              Open Your Store
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer mt-2 border-t border-white/[0.06] pt-4"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="lg:col-span-9 glass-card p-6 sm:p-8 rounded-2xl border border-white/[0.05] min-h-[400px]">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-white tracking-tight border-b border-white/[0.06] pb-3">Profile Details</h3>
            
            <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
              <div className="space-y-1">
                <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                <input
                  id="name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Mobile Number</label>
                <input
                  type="tel"
                  disabled
                  value={user.phone}
                  className="w-full bg-zinc-950/40 text-zinc-500 border border-white/[0.03] rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                />
                <span className="text-[10px] text-zinc-600">Your mobile number is verified via OTP and cannot be changed here.</span>
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Save Profile
              </button>

              {profileSuccess && (
                <p className="text-xs text-green-500 font-semibold animate-pulse">Profile data saved successfully!</p>
              )}
            </form>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-white tracking-tight border-b border-white/[0.06] pb-3">Order History</h3>

            {orders.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <p className="text-3xl">📦🚫</p>
                <h4 className="font-extrabold text-white">No orders recorded</h4>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">You haven't purchased any footwear yet. Check our store catalog to make your first order.</p>
                <Link href="/shop" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider inline-block">Browse Shop</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-zinc-950/30 border border-white/[0.05] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
                    {/* Header */}
                    <div className="p-4 sm:p-5 flex flex-wrap justify-between items-center gap-4 bg-zinc-950/50">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Order Reference</p>
                        <p className="text-sm font-bold text-white mt-0.5">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Date Placed</p>
                        <p className="text-sm font-semibold text-zinc-300 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Debited</p>
                        <p className="text-sm font-black text-primary mt-0.5">₹{order.total_amount}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-xs font-bold uppercase tracking-wide">
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 sm:p-5 space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            <ShimmerImage src={item.product_image} alt="" className="h-10 w-10" />
                            <div>
                              <p className="font-bold text-white text-xs">{item.product_title}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">Size {item.size} • Color {item.color} • Qty {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-bold text-white text-xs">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress tracking Bar */}
                    <div className="p-4 sm:p-5 bg-zinc-950/20">
                      <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-500 mb-2">
                        <span className="text-primary">Ordered</span>
                        <span className="text-primary">Processing</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 bg-primary h-full rounded-full w-[45%]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-white tracking-tight border-b border-white/[0.06] pb-3">Wishlist Manager</h3>

            {wishlistedProducts.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <p className="text-3xl">❤️🚫</p>
                <h4 className="font-extrabold text-white">Your wishlist is empty</h4>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">Save footwear you like by clicking the heart button on the shop page to monitor them here.</p>
                <Link href="/shop" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider inline-block">Explore Shop</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistedProducts.map((p) => (
                  <div key={p.id} className="bg-zinc-950/30 border border-white/[0.05] p-4 rounded-2xl flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3">
                      <ShimmerImage src={p.images[0]} alt="" className="h-12 w-12" />
                      <div>
                        <Link href={`/product/${p.slug}`}>
                          <h4 className="font-bold text-white text-xs hover:text-primary transition-colors line-clamp-1">{p.title}</h4>
                        </Link>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{p.brand_name} • ₹{p.sale_price || p.price}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-2 bg-zinc-900 border border-white/[0.06] text-accent hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Heart className="h-4 w-4 fill-accent" />
                      </button>
                      <Link
                        href={`/product/${p.slug}`}
                        className="p-2 bg-primary text-white rounded-xl transition-all font-bold text-xs"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADDRESSES TAB */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <h3 className="text-xl font-extrabold text-white tracking-tight border-b border-white/[0.06] pb-3">Saved Addresses</h3>
              <button
                onClick={() => {
                  setIsAddingAddress(!isAddingAddress);
                  setAddrError(null);
                }}
                className="bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add New
              </button>
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <form onSubmit={handleAddAddress} className="bg-zinc-950/40 border border-white/[0.05] p-5 rounded-2xl space-y-4 max-w-xl animate-in slide-in-from-top-5 duration-300">
                {addrError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl">
                    {addrError}
                  </div>
                )}
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">New Shipping Destination</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="addr-name" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                    <input
                      id="addr-name"
                      type="text"
                      required
                      placeholder="e.g. Minhaj Raza"
                      value={newAddrName}
                      onChange={(e) => setNewAddrName(e.target.value)}
                      className="w-full bg-zinc-950 text-white border border-white/[0.06] rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="addr-phone" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Phone</label>
                    <input
                      id="addr-phone"
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={newAddrPhone}
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      className="w-full bg-zinc-950 text-white border border-white/[0.06] rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="addr-line1" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Address Line 1</label>
                  <input
                    id="addr-line1"
                    type="text"
                    required
                    placeholder="e.g. 100 Sneaker Plaza"
                    value={newAddrLine1}
                    onChange={(e) => setNewAddrLine1(e.target.value)}
                    className="w-full bg-zinc-950 text-white border border-white/[0.06] rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="addr-city" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">City</label>
                    <input
                      id="addr-city"
                      type="text"
                      required
                      placeholder="New York"
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      className="w-full bg-zinc-950 text-white border border-white/[0.06] rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="addr-state" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">State</label>
                    <input
                      id="addr-state"
                      type="text"
                      required
                      placeholder="NY"
                      value={newAddrState}
                      onChange={(e) => setNewAddrState(e.target.value)}
                      className="w-full bg-zinc-950 text-white border border-white/[0.06] rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="addr-pincode" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pincode</label>
                    <input
                      id="addr-pincode"
                      type="text"
                      required
                      placeholder="10001"
                      value={newAddrPincode}
                      onChange={(e) => setNewAddrPincode(e.target.value)}
                      className="w-full bg-zinc-950 text-white border border-white/[0.06] rounded-xl px-4 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* List Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-zinc-950/30 border border-white/[0.05] p-5 rounded-2xl space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-extrabold text-white text-xs flex items-center gap-1.5">
                        {addr.fullName}
                        {addr.default && (
                          <span className="px-1.5 py-0.5 bg-primary/20 border border-primary/20 text-primary text-[8px] uppercase tracking-wider font-extrabold rounded-md">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{addr.phone}</p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 leading-normal">
                    <p>{addr.addressLine1}</p>
                    <p>{addr.city}, {addr.state} {addr.pincode}</p>
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-white/[0.04]">
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-[10px] font-bold text-destructive hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
