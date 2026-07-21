'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Globe, AtSign, Store as StoreIcon, Phone, MapPin, FileText, Building2, Hash, Plus, Trash2, Eye, Edit3, X } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Store, SocialHandle, PickupAddress } from '@/types';

const SOCIAL_PLATFORMS_DISPLAY: Record<string, { icon: string; label: string }> = {
  instagram: { icon: '📷', label: 'Instagram' },
  facebook: { icon: '📘', label: 'Facebook' },
  twitter: { icon: '🐦', label: 'Twitter / X' },
  youtube: { icon: '▶️', label: 'YouTube' },
  whatsapp: { icon: '💬', label: 'WhatsApp' },
  linkedin: { icon: '💼', label: 'LinkedIn' },
  other: { icon: '🌐', label: 'Other' },
};

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📷', prefix: 'https://instagram.com/' },
  { value: 'facebook', label: 'Facebook', icon: '📘', prefix: 'https://facebook.com/' },
  { value: 'twitter', label: 'Twitter / X', icon: '🐦', prefix: 'https://x.com/' },
  { value: 'youtube', label: 'YouTube', icon: '▶️', prefix: 'https://youtube.com/@' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬', prefix: 'https://wa.me/' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼', prefix: 'https://linkedin.com/in/' },
  { value: 'other', label: 'Other', icon: '🌐', prefix: '' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

interface StoreSettingsClientProps {
  store: Store;
  storeSlug: string;
}

export default function StoreSettingsClient({ store, storeSlug }: StoreSettingsClientProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description);
  const [businessName, setBusinessName] = useState(store.business_name || '');
  const [gstNumber, setGstNumber] = useState(store.gst_number || '');
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>(store.social_handles || []);
  const [customerSupportPhone, setCustomerSupportPhone] = useState(store.customer_support_phone || '');
  const [pickupAddress, setPickupAddress] = useState<PickupAddress>(
    store.pickup_address || { addressLine1: '', city: '', state: '', pincode: '', country: 'India', landmark: '' }
  );
  const [logoUrl, setLogoUrl] = useState(store.logo_url);
  const [bannerUrl, setBannerUrl] = useState(store.banner_url);

  const [newPlatform, setNewPlatform] = useState('');
  const [newHandle, setNewHandle] = useState('');

  const addSocialHandle = () => {
    if (!newPlatform || !newHandle.trim()) return;
    const platform = SOCIAL_PLATFORMS.find(p => p.value === newPlatform);
    setSocialHandles(prev => [...prev, {
      platform: newPlatform,
      handle: newHandle.trim().replace(/^@/, ''),
      url: platform?.prefix ? `${platform.prefix}${newHandle.trim().replace(/^@/, '')}` : undefined,
    }]);
    setNewPlatform('');
    setNewHandle('');
  };

  const removeSocialHandle = (index: number) => {
    setSocialHandles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase
        .from('stores')
        .update({
          name,
          description,
          business_name: businessName || null,
          gst_number: gstNumber || null,
          social_handles: socialHandles,
          customer_support_phone: customerSupportPhone,
          pickup_address: pickupAddress,
          pickup_pincode: pickupAddress.pincode,
          pickup_city: pickupAddress.city,
          pickup_state: pickupAddress.state,
          logo_url: logoUrl,
          banner_url: bannerUrl,
        })
        .eq('id', store.id);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to save settings' });
        console.error('Error updating store:', error);
      } else {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setIsEditing(false);
      }
    } else {
      // Simulate saving for demo
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setIsEditing(false);
        setSaving(false);
      }, 1000);
      return;
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImageUpload = (type: 'logo' | 'banner') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        if (type === 'logo') setLogoUrl(url);
        else setBannerUrl(url);
      }
    };
    input.click();
  };

  // View Mode
  if (!isEditing) {
    return (
      <div>
        <div className="mb-8">
          <Link
            href={`/store/${storeSlug}/manage`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Store Details</h1>
              <p className="text-muted-foreground text-sm mt-1">View your store information</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Edit3 className="h-4 w-4" />
              Edit Details
            </button>
          </div>
        </div>

        {/* Store Identity */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <StoreIcon className="h-5 w-5 text-primary" /> Store Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Store Name</p>
              <p className="text-sm font-medium text-foreground">{store.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Business / Legal Name</p>
              <p className="text-sm font-medium text-foreground">{store.business_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">GST Number</p>
              <p className="text-sm font-medium text-foreground font-mono">{store.gst_number || 'Not provided'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{store.description || 'No description provided'}</p>
          </div>
        </div>

        {/* Contact & Social */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" /> Contact & Social
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Customer Support Phone</p>
              <p className="text-sm font-medium text-foreground">{store.customer_support_phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Social Media Handles</p>
              {store.social_handles && store.social_handles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {store.social_handles.map((handle, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs">
                      <span>{SOCIAL_PLATFORMS_DISPLAY[handle.platform]?.icon || '🌐'}</span>
                      <span className="capitalize font-medium">{SOCIAL_PLATFORMS_DISPLAY[handle.platform]?.label || handle.platform}</span>
                      <span className="text-muted-foreground">@{handle.handle}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No social handles added</p>
              )}
            </div>
          </div>
        </div>

        {/* Pickup Address */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Pickup Address
          </h2>
          {store.pickup_address ? (
            <div className="space-y-2">
              {store.pickup_address.addressLine1 && <p className="text-sm text-foreground">{store.pickup_address.addressLine1}</p>}
              {store.pickup_address.addressLine2 && <p className="text-sm text-foreground">{store.pickup_address.addressLine2}</p>}
              {(store.pickup_address.city || store.pickup_address.state) && (
                <p className="text-sm text-foreground">
                  {store.pickup_address.city}{store.pickup_address.city && store.pickup_address.state ? ', ' : ''}{store.pickup_address.state} {store.pickup_address.pincode}
                </p>
              )}
              {store.pickup_address.landmark && <p className="text-xs text-muted-foreground">Near: {store.pickup_address.landmark}</p>}
              {store.pickup_address.country && <p className="text-xs text-muted-foreground">{store.pickup_address.country}</p>}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No pickup address provided</p>
          )}
        </div>

        {/* Government ID */}
        {store.government_id_url && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Identity Verification
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ID Type</p>
                <p className="text-sm font-medium text-foreground capitalize">{store.government_id_type || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Document</p>
                <div className="rounded-xl overflow-hidden border border-border bg-zinc-900">
                  <img src={store.government_id_url} alt="Government ID" className="w-full h-48 object-contain" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Store Images */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> Store Images
          </h2>
          <div className="flex flex-wrap gap-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Logo</p>
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-zinc-800 border border-border">
                {store.logo_url ? (
                  <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <StoreIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Banner</p>
              <div className="h-20 w-32 rounded-xl overflow-hidden bg-zinc-800 border border-border">
                {store.banner_url ? (
                  <img src={store.banner_url} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/store/${storeSlug}/manage`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Store Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your store's appearance and information</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center gap-2 bg-secondary hover:bg-muted text-foreground border border-border px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Identity */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <StoreIcon className="h-5 w-5 text-primary" /> Store Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Store Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Business / Legal Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Sole Society Pvt. Ltd."
                  className="w-full bg-card text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Contact & Social */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" /> Contact & Social
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Customer Support Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={customerSupportPhone}
                  onChange={e => setCustomerSupportPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-card text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Social Media Handles
              </label>

              {socialHandles.length > 0 && (
                <div className="space-y-2 mb-3">
                  {socialHandles.map((handle, index) => (
                    <div key={index} className="flex items-center gap-3 bg-secondary border border-border rounded-xl px-4 py-2.5">
                      <span className="text-lg">{SOCIAL_PLATFORMS.find(p => p.value === handle.platform)?.icon || '🌐'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground capitalize">{handle.platform}</p>
                        <p className="text-xs text-muted-foreground truncate">@{handle.handle}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSocialHandle(index)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={newPlatform}
                  onChange={e => setNewPlatform(e.target.value)}
                  className="bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select platform</option>
                  {SOCIAL_PLATFORMS.map(p => (
                    <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={newHandle}
                    onChange={e => setNewHandle(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                    placeholder="your_handle"
                    className="w-full bg-card text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={addSocialHandle}
                  disabled={!newPlatform || !newHandle.trim()}
                  className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Address */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Pickup Address
          </h2>
          <p className="text-xs text-muted-foreground mb-4">This is where delivery partners will pick up orders from your store.</p>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Address Line 1
              </label>
              <input
                type="text"
                value={pickupAddress.addressLine1}
                onChange={e => setPickupAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                placeholder="Shop no., Building name, Street"
                className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Address Line 2
              </label>
              <input
                type="text"
                value={pickupAddress.addressLine2}
                onChange={e => setPickupAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                placeholder="Area, Locality (optional)"
                className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  City
                </label>
                <input
                  type="text"
                  value={pickupAddress.city}
                  onChange={e => setPickupAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  State
                </label>
                <select
                  value={pickupAddress.state}
                  onChange={e => setPickupAddress(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pickupAddress.pincode}
                  onChange={e => setPickupAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  placeholder="400001"
                  maxLength={6}
                  className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Country
                </label>
                <input
                  type="text"
                  value={pickupAddress.country}
                  onChange={e => setPickupAddress(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="India"
                  className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Landmark
              </label>
              <input
                type="text"
                value={pickupAddress.landmark}
                onChange={e => setPickupAddress(prev => ({ ...prev, landmark: e.target.value }))}
                placeholder="Near... (optional)"
                className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Store Images */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> Store Images
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Store Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-zinc-800 border border-border shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <StoreIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleImageUpload('logo')}
                  className="px-4 py-2 bg-secondary hover:bg-muted border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Upload Logo
                </button>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Store Banner
              </label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-32 rounded-xl overflow-hidden bg-zinc-800 border border-border shrink-0">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleImageUpload('banner')}
                  className="px-4 py-2 bg-secondary hover:bg-muted border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Upload Banner
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
