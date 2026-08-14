'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Store as StoreIcon, ExternalLink, CheckCircle, XCircle, Clock, Eye, Phone, MapPin, FileText, Globe, X, Trash2, Plus, Upload, Image as ImageIcon, Building2, Hash, Save } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import { SocialHandle, PickupAddress } from '../../../types';
import VerifiedBadge from '../../../components/VerifiedBadge';

interface AdminStoresClientProps {
  initialStores: any[];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'suspended': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-zinc-500/10 text-muted-foreground border-zinc-500/20';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active': return CheckCircle;
    case 'pending': return Clock;
    case 'suspended': return XCircle;
    default: return Eye;
  }
}

const SOCIAL_PLATFORMS: Record<string, { icon: string; label: string }> = {
  instagram: { icon: '📷', label: 'Instagram' },
  facebook: { icon: '📘', label: 'Facebook' },
  twitter: { icon: '🐦', label: 'Twitter / X' },
  youtube: { icon: '▶️', label: 'YouTube' },
  whatsapp: { icon: '💬', label: 'WhatsApp' },
  linkedin: { icon: '💼', label: 'LinkedIn' },
  other: { icon: '🌐', label: 'Other' },
};

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

type IdType = 'aadhar' | 'pan' | 'voter' | 'passport' | 'driving' | '';

function StoreEditModal({ store, onClose }: { store: any; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [name, setName] = useState(store.name || '');
  const [description, setDescription] = useState(store.description || '');
  const [businessName, setBusinessName] = useState(store.business_name || '');
  const [gstNumber, setGstNumber] = useState(store.gst_number || '');
  const [customerSupportPhone, setCustomerSupportPhone] = useState(store.customer_support_phone || '');
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>(store.social_handles || []);
  const [idType, setIdType] = useState<IdType>(store.government_id_type || '');
  const [status, setStatus] = useState(store.status || 'pending');

  const [pickupAddress, setPickupAddress] = useState<PickupAddress>(
    store.pickup_address || { addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', landmark: '' }
  );

  const [bannerPreview, setBannerPreview] = useState(store.banner_url || '');
  const [logoPreview, setLogoPreview] = useState(store.logo_url || '');
  const [idPreview, setIdPreview] = useState(store.government_id_url || '');

  const [newPlatform, setNewPlatform] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const bannerInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const idInputRef = React.useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, folder: string, userId: string) => {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'png';
    const path = `${userId}/${folder}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('store-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const addSocialHandle = () => {
    if (!newPlatform || !newHandle.trim()) return;
    const platform = SOCIAL_PLATFORMS[newPlatform as keyof typeof SOCIAL_PLATFORMS];
    setSocialHandles(prev => [...prev, {
      platform: newPlatform,
      handle: newHandle.trim().replace(/^@/, ''),
      url: platform ? `${newPlatform}.com/${newHandle.trim().replace(/^@/, '')}` : undefined,
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

    try {
      const supabase = createClient();
      let bannerUrl = bannerPreview;
      let logoUrl = logoPreview;
      let govIdUrl = idPreview;

      if (bannerFile) bannerUrl = await uploadImage(bannerFile, 'banner', store.owner_id);
      if (logoFile) logoUrl = await uploadImage(logoFile, 'logo', store.owner_id);
      if (idFile) govIdUrl = await uploadImage(idFile, 'gov-id', store.owner_id);

      const { error } = await supabase
        .from('stores')
        .update({
          name: name.trim(),
          description: description.trim(),
          business_name: businessName.trim() || null,
          gst_number: gstNumber.trim() || null,
          social_handles: socialHandles,
          customer_support_phone: customerSupportPhone.trim(),
          government_id_url: govIdUrl,
          government_id_type: idType,
          pickup_address: pickupAddress,
          pickup_pincode: pickupAddress.pincode,
          pickup_city: pickupAddress.city,
          pickup_state: pickupAddress.state,
          banner_url: bannerUrl,
          logo_url: logoUrl,
          status: status,
        })
        .eq('id', store.id);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to save changes' });
        console.error('Error updating store:', error);
      } else {
        setMessage({ type: 'success', text: 'Store updated successfully!' });
        onClose();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Something went wrong' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Edit Store</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-xl ${
              message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Basic Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Store Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">GST Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value.toUpperCase())} className="w-full bg-secondary text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact & Social</h4>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer Support Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="tel" value={customerSupportPhone} onChange={e => setCustomerSupportPhone(e.target.value)} className="w-full bg-secondary text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Social Media Handles</label>
              {socialHandles.length > 0 && (
                <div className="space-y-2 mb-3">
                  {socialHandles.map((handle, index) => (
                    <div key={index} className="flex items-center gap-3 bg-secondary border border-border rounded-xl px-4 py-2.5">
                      <span className="text-lg">{SOCIAL_PLATFORMS[handle.platform as keyof typeof SOCIAL_PLATFORMS]?.icon || '🌐'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground capitalize">{handle.platform}</p>
                        <p className="text-xs text-muted-foreground truncate">@{handle.handle}</p>
                      </div>
                      <button type="button" onClick={() => removeSocialHandle(index)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <select value={newPlatform} onChange={e => setNewPlatform(e.target.value)} className="bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Select platform</option>
                  {Object.entries(SOCIAL_PLATFORMS).map(([key, val]) => (
                    <option key={key} value={key}>{val.icon} {val.label}</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={newHandle} onChange={e => setNewHandle(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))} placeholder="your_handle" className="w-full bg-secondary text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <button type="button" onClick={addSocialHandle} disabled={!newPlatform || !newHandle.trim()} className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Government ID */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identity Verification</h4>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">ID Type</label>
              <select value={idType} onChange={e => setIdType(e.target.value as IdType)} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary">
                <option value="">Select ID type</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="pan">PAN Card</option>
                <option value="voter">Voter ID Card</option>
                <option value="passport">Passport</option>
                <option value="driving">Driving License</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Government ID Document</label>
              <input ref={idInputRef} type="file" accept="image/*,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) { setIdFile(f); setIdPreview(URL.createObjectURL(f)); } }} className="hidden" />
              {idPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={idPreview} alt="ID preview" className="w-full h-48 object-contain bg-secondary" />
                  <button type="button" onClick={() => { setIdFile(null); setIdPreview(''); }} className="absolute top-2 right-2 p-1.5 bg-zinc-900/70 hover:bg-zinc-900 text-foreground rounded-full">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => idInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-border hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Click to upload ID (JPG, PNG, PDF)</span>
                </button>
              )}
            </div>
          </div>

          {/* Pickup Address */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pickup Address (Shiprocket)</h4>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Address Line 1</label>
              <input type="text" value={pickupAddress.addressLine1} onChange={e => setPickupAddress(prev => ({ ...prev, addressLine1: e.target.value }))} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Address Line 2</label>
              <input type="text" value={pickupAddress.addressLine2} onChange={e => setPickupAddress(prev => ({ ...prev, addressLine2: e.target.value }))} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">City</label>
                <input type="text" value={pickupAddress.city} onChange={e => setPickupAddress(prev => ({ ...prev, city: e.target.value }))} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">State</label>
                <select value={pickupAddress.state} onChange={e => setPickupAddress(prev => ({ ...prev, state: e.target.value }))} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Pincode</label>
                <input type="text" value={pickupAddress.pincode} onChange={e => setPickupAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} maxLength={6} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</label>
                <input type="text" value={pickupAddress.country} onChange={e => setPickupAddress(prev => ({ ...prev, country: e.target.value }))} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Landmark</label>
              <input type="text" value={pickupAddress.landmark} onChange={e => setPickupAddress(prev => ({ ...prev, landmark: e.target.value }))} className="w-full bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          {/* Store Images */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Store Images</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Logo</label>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-zinc-800 border border-border shrink-0">
                    {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><StoreIcon className="h-6 w-6 text-muted-foreground" /></div>}
                  </div>
                  <button type="button" onClick={() => logoInputRef.current?.click()} className="px-3 py-2 bg-secondary hover:bg-muted border border-border rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {logoPreview ? 'Change' : 'Upload'}
                  </button>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} className="hidden" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Banner</label>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-24 rounded-xl overflow-hidden bg-zinc-800 border border-border shrink-0">
                    {bannerPreview ? <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>}
                  </div>
                  <button type="button" onClick={() => bannerInputRef.current?.click()} className="px-3 py-2 bg-secondary hover:bg-muted border border-border rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {bannerPreview ? 'Change' : 'Upload'}
                  </button>
                </div>
                <input ref={bannerInputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); } }} className="hidden" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-secondary hover:bg-muted text-foreground rounded-xl text-sm font-semibold transition-all border border-border">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StoreDetailsModal({ store, onClose, onEdit }: { store: any; onClose: () => void; onEdit: () => void }) {
  const StatusIcon = getStatusIcon(store.status);
  const [idImgError, setIdImgError] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with banner */}
        <div className="relative h-40 w-full bg-zinc-900 overflow-hidden">
          {store.banner_url ? (
            <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-zinc-900 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(store.status)}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {store.status}
            </span>
            <button onClick={onClose} className="p-2 bg-zinc-900/70 hover:bg-zinc-900 text-foreground rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          {/* Store Logo & Name */}
          <div className="flex items-end gap-4 mb-6">
            <div className="h-20 w-20 rounded-xl overflow-hidden bg-zinc-800 border-4 border-card shadow-lg shrink-0">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <StoreIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 pb-1">
              <h2 className="text-xl font-bold text-foreground truncate">{store.name}</h2>
              <VerifiedBadge className="ml-1" />
              <p className="text-sm text-muted-foreground">by {store.users?.full_name || 'Unknown'}</p>
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">{store.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Business Info */}
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" /> Business Information
              </h4>
              {store.business_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Business Name</p>
                  <p className="text-sm font-medium text-foreground">{store.business_name}</p>
                </div>
              )}
              {store.gst_number && (
                <div>
                  <p className="text-xs text-muted-foreground">GST Number</p>
                  <p className="text-sm font-medium text-foreground font-mono">{store.gst_number}</p>
                </div>
              )}
              {store.customer_support_phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Support Phone</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {store.customer_support_phone}
                  </p>
                </div>
              )}
              {!store.business_name && !store.gst_number && !store.customer_support_phone && (
                <p className="text-xs text-muted-foreground italic">No business info provided</p>
              )}
            </div>

            {/* Pickup Address */}
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Pickup Address
              </h4>
              {store.pickup_address ? (
                <>
                  {store.pickup_address.addressLine1 && <p className="text-sm text-foreground">{store.pickup_address.addressLine1}</p>}
                  {store.pickup_address.addressLine2 && <p className="text-sm text-foreground">{store.pickup_address.addressLine2}</p>}
                  {(store.pickup_address.city || store.pickup_address.state) && (
                    <p className="text-sm text-foreground">
                      {store.pickup_address.city}{store.pickup_address.city && store.pickup_address.state ? ', ' : ''}{store.pickup_address.state} {store.pickup_address.pincode}
                    </p>
                  )}
                  {store.pickup_address.landmark && <p className="text-xs text-muted-foreground">Near: {store.pickup_address.landmark}</p>}
                  {store.pickup_address.country && <p className="text-xs text-muted-foreground">{store.pickup_address.country}</p>}
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic">No pickup address provided</p>
              )}
            </div>
          </div>

          {/* Social Handles */}
          {store.social_handles && store.social_handles.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" /> Social Media Handles
              </h4>
              <div className="flex flex-wrap gap-2">
                {store.social_handles.map((handle: any, index: number) => (
                  <span key={index} className="inline-flex items-center gap-1.5 bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs">
                    <span>{SOCIAL_PLATFORMS[handle.platform as keyof typeof SOCIAL_PLATFORMS]?.icon || '🌐'}</span>
                    <span className="capitalize font-medium">{handle.platform}</span>
                    <span className="text-muted-foreground">@{handle.handle}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Government ID */}
          {store.government_id_url && (
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> Identity Verification
              </h4>
              <div className="bg-secondary/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2">ID Type: <span className="capitalize font-medium text-foreground">{store.government_id_type || 'Not specified'}</span></p>
                <div className="rounded-xl overflow-hidden border border-border bg-zinc-900">
                  {idImgError ? (
                    <div className="w-full h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <FileText className="h-8 w-8" />
                      <p className="text-xs">Failed to load image</p>
                      <a href={store.government_id_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Open in new tab</a>
                    </div>
                  ) : (
                    <img src={store.government_id_url} alt="Government ID" className="w-full h-48 object-contain" onError={() => setIdImgError(true)} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Store Images */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Store Images</h4>
            <div className="flex flex-wrap gap-4">
              {store.logo_url && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Logo</p>
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-zinc-800 border border-border">
                    <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {store.banner_url && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Banner</p>
                  <div className="h-16 w-32 rounded-xl overflow-hidden bg-zinc-800 border border-border">
                    <img src={store.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {!store.logo_url && !store.banner_url && (
                <p className="text-xs text-muted-foreground italic">No images uploaded</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-secondary hover:bg-muted text-foreground rounded-xl text-sm font-semibold transition-all border border-border"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <Eye className="h-4 w-4" />
              Edit Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminStoresClient({ initialStores }: AdminStoresClientProps) {
  const [stores, setStores] = useState<any[]>(initialStores);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<any | null>(null);
  const [viewingStore, setViewingStore] = useState<any | null>(null);

  const configured = isSupabaseConfigured();

  const refreshStores = async () => {
    if (!configured) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setStores(data);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) return;

    setDeletingId(storeId);
    setStores(prev => prev.filter(s => s.id !== storeId));

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) {
        console.error('Error deleting store in Supabase:', error);
        setStores(initialStores);
      }
    }

    setDeletingId(null);
  };

  const handleStatusChange = async (storeId: string, newStatus: string) => {
    setUpdatingId(storeId);

    setStores(prev =>
      prev.map(s => (s.id === storeId ? { ...s, status: newStatus } : s))
    );

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase
        .from('stores')
        .update({ status: newStatus })
        .eq('id', storeId);

      if (error) {
        console.error('Error updating store status in Supabase:', error);
      }
    }

    setUpdatingId(null);
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.users?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Stores Management</h1>
        <p className="text-muted-foreground text-sm mt-1">{filteredStores.length} of {stores.length} stores</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by store name or owner..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card/50 text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-card/50 text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Stores Grid */}
      {filteredStores.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <StoreIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No stores found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => {
            const StatusIcon = getStatusIcon(store.status);
            return (
              <div key={store.id} className="glass-card rounded-2xl overflow-hidden">
                {/* Store Banner */}
                <div className="h-32 w-full bg-zinc-900 relative overflow-hidden">
                  {store.banner_url ? (
                    <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-zinc-900 to-accent/20" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(store.status)}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {store.status}
                    </span>
                  </div>
                </div>

                {/* Store Info */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 border border-border shrink-0">
                      {store.logo_url ? (
                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <StoreIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                       <h3 className="font-bold text-foreground text-sm truncate">{store.name}</h3>
                       <VerifiedBadge className="ml-1 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">by {store.users?.full_name || 'Unknown'}</p>
                    </div>
                  </div>

                  {store.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{store.description}</p>
                  )}

                  {/* Quick Info */}
                  <div className="space-y-1.5 mb-4">
                    {store.customer_support_phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{store.customer_support_phone}</span>
                      </div>
                    )}
                    {store.pickup_city && store.pickup_state && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{store.pickup_city}, {store.pickup_state}</span>
                      </div>
                    )}
                    {store.social_handles && store.social_handles.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span>{store.social_handles.length} social {store.social_handles.length === 1 ? 'handle' : 'handles'}</span>
                      </div>
                    )}
                    {store.government_id_url && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span className="capitalize">{store.government_id_type || 'ID'} uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingStore(store)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-secondary hover:bg-muted border border-border rounded-lg px-3 py-2 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Details
                    </button>
                    {store.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(store.id, 'active')}
                        disabled={updatingId === store.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg px-3 py-2 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    )}
                    {store.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(store.id, 'suspended')}
                        disabled={updatingId === store.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg px-3 py-2 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Suspend
                      </button>
                    )}
                    {store.status === 'suspended' && (
                      <button
                        onClick={() => handleStatusChange(store.id, 'active')}
                        disabled={updatingId === store.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg px-3 py-2 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteStore(store.id)}
                      disabled={deletingId === store.id}
                      className="inline-flex items-center justify-center gap-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                      title="Delete store"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === store.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Store Details Modal */}
      {viewingStore && (
        <StoreDetailsModal
          store={viewingStore}
          onClose={() => setViewingStore(null)}
          onEdit={() => {
            setViewingStore(null);
            setEditingStore(viewingStore);
          }}
        />
      )}

      {/* Store Edit Modal */}
      {editingStore && (
        <StoreEditModal store={editingStore} onClose={() => { setEditingStore(null); refreshStores(); }} />
      )}
    </div>
  );
}
