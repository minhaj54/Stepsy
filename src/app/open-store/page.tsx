'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store as StoreIcon, UploadCloud, CheckCircle2, Loader2, Image as ImageIcon, X, Phone, FileText, MapPin, Building2, Hash, Globe, Plus, Trash2 } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { SocialHandle, PickupAddress } from '../../types';

type IdType = 'aadhar' | 'pan' | 'voter' | 'passport' | 'driving' | '';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

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

export default function OpenStorePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  // Basic Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Contact
  const [customerSupportPhone, setCustomerSupportPhone] = useState('');

  // Social Handles
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>([]);
  const [newPlatform, setNewPlatform] = useState('');
  const [newHandle, setNewHandle] = useState('');

  // Government ID
  const [idType, setIdType] = useState<IdType>('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState('');

  // Pickup Address
  const [pickupAddress, setPickupAddress] = useState<PickupAddress>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    landmark: '',
  });

  // Images
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      setUser(data.user);
      setLoadingAuth(false);
    });
  }, []);

  const pickBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const pickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const pickIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
    }
  };

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

  const uploadDocument = async (file: File, userId: string) => {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'pdf';
    const path = `${userId}/gov-id-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('store-assets').getPublicUrl(path);
    return data.publicUrl;
  };

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

  const validateStep = (stepNum: number): boolean => {
    setError('');
    if (stepNum === 1) {
      if (!name.trim()) {
        setError('Store name is required.');
        return false;
      }
    } else if (stepNum === 2) {
      if (!customerSupportPhone.trim()) {
        setError('Customer support phone number is required.');
        return false;
      }
      if (!/^[+]?[\d\s-]{10,15}$/.test(customerSupportPhone.trim())) {
        setError('Please enter a valid phone number.');
        return false;
      }
    } else if (stepNum === 3) {
      if (!idType) {
        setError('Please select a government ID type.');
        return false;
      }
      if (!idFile) {
        setError('Please upload your government ID.');
        return false;
      }
    } else if (stepNum === 4) {
      if (!pickupAddress.addressLine1.trim()) {
        setError('Pickup address is required.');
        return false;
      }
      if (!pickupAddress.city.trim()) {
        setError('City is required.');
        return false;
      }
      if (!pickupAddress.state) {
        setError('State is required.');
        return false;
      }
      if (!pickupAddress.pincode.trim() || !/^\d{6}$/.test(pickupAddress.pincode.trim())) {
        setError('Please enter a valid 6-digit pincode.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('Please sign in to open a store.');
      return;
    }
    if (!validateStep(4)) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      let bannerUrl = '';
      let logoUrl = '';
      let govIdUrl = '';

      if (bannerFile) bannerUrl = await uploadImage(bannerFile, 'banner', user.id);
      if (logoFile) logoUrl = await uploadImage(logoFile, 'logo', user.id);
      if (idFile) govIdUrl = await uploadDocument(idFile, user.id);

      const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6);
      const { data: inserted, error: insertError } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          slug,
          description: description.trim(),
          business_name: businessName.trim() || null,
          gst_number: gstNumber.trim() || null,
          social_handle: socialHandles.length > 0 ? `@${socialHandles[0].handle}` : '',
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
          status: 'pending',
        })
        .select('slug')
        .single();

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong creating your store.');
      setSubmitting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-10 max-w-md text-center">
          <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-5">
            <StoreIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Open Your Store</h1>
          <p className="text-muted-foreground text-sm mt-2">
            You need to sign in before you can create a store on the marketplace.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-3xl mx-auto">
        <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
          <div className="p-4 bg-green-500/10 rounded-2xl w-fit mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-3">
            Store Submitted for Approval!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-6">
            Your store has been sent for approval. Our team will review your details and notify you once it's approved. This usually takes 24-48 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Back to Home
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-muted text-foreground px-6 py-3 rounded-xl font-semibold text-sm border border-border transition-all"
            >
              Go to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-8 text-center">
        <div className="p-3 sm:p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-3 sm:mb-4">
          <StoreIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Open Your Store</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-2">
          Set up your storefront and start selling your footwear to the world.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= s ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground border border-border'
            }`}>
              {s}
            </div>
            {s < 4 && (
              <div className={`w-8 sm:w-12 h-0.5 ${step > s ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <StoreIcon className="h-5 w-5 text-primary" /> Basic Information
            </h2>

            {/* Banner */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Store Banner</label>
              <input ref={bannerInputRef} type="file" accept="image/*" onChange={pickBanner} className="hidden" />
              {bannerPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setBannerFile(null); setBannerPreview(''); }}
                    className="absolute top-2 right-2 p-1.5 bg-zinc-900/70 hover:bg-zinc-900 text-foreground rounded-full"
                    aria-label="Remove banner"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-border hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-sm">Click to upload banner (recommended 1200×300)</span>
                </button>
              )}
            </div>

            {/* Logo */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Store Logo</label>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={pickLogo} className="hidden" />
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo preview" className="h-20 w-20 rounded-xl object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                      className="absolute -top-2 -right-2 p-1 bg-zinc-900/70 hover:bg-zinc-900 text-foreground rounded-full"
                      aria-label="Remove logo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="h-20 w-20 border-2 border-dashed border-border hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <UploadCloud className="h-5 w-5" />
                    <span className="text-[10px]">Logo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-sm text-primary hover:text-primary-hover font-medium"
                >
                  {logoPreview ? 'Change logo' : 'Upload logo'}
                </button>
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Store Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sole Society"
                className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Business / Legal Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sole Society Pvt. Ltd."
                  className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Optional: Your registered business name for invoices and GST.</p>
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">GST Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. 27AABCT1234R1ZX"
                  className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Optional: 15-digit GSTIN for tax purposes.</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Store Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell customers what makes your store special..."
                className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact & Social */}
        {step === 2 && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> Contact & Social
            </h2>

            {/* Customer Support Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Customer Support Phone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  required
                  value={customerSupportPhone}
                  onChange={(e) => setCustomerSupportPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">This number will be displayed to customers for support queries.</p>
            </div>

            {/* Social Handles */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Social Media Handles</label>
              <p className="text-[10px] text-muted-foreground mb-3">Add your social profiles to help customers connect with you.</p>

              {/* Existing handles */}
              {socialHandles.length > 0 && (
                <div className="space-y-2 mb-4">
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

              {/* Add new handle */}
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="bg-secondary text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
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
                    onChange={(e) => setNewHandle(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                    placeholder="your_handle"
                    className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all"
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
        )}

        {/* Step 3: Government ID */}
        {step === 3 && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Identity Verification
            </h2>
            <p className="text-xs text-muted-foreground">
              Upload a government-issued ID for verification. This helps us maintain a trusted marketplace.
            </p>

            {/* ID Type */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">ID Type *</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as IdType)}
                className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all"
              >
                <option value="">Select ID type</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="pan">PAN Card</option>
                <option value="voter">Voter ID Card</option>
                <option value="passport">Passport</option>
                <option value="driving">Driving License</option>
              </select>
            </div>

            {/* ID Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Upload ID Document *</label>
              <input ref={idInputRef} type="file" accept="image/*,.pdf" onChange={pickIdFile} className="hidden" />
              {idPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={idPreview} alt="ID preview" className="w-full h-48 object-contain bg-secondary" />
                  <button
                    type="button"
                    onClick={() => { setIdFile(null); setIdPreview(''); }}
                    className="absolute top-2 right-2 p-1.5 bg-zinc-900/70 hover:bg-zinc-900 text-foreground rounded-full"
                    aria-label="Remove ID"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => idInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-border hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <FileText className="h-8 w-8" />
                  <span className="text-sm">Click to upload {idType ? idType.toUpperCase() : 'ID'} (JPG, PNG, PDF)</span>
                </button>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">Max file size: 5MB. Supported: JPG, PNG, PDF.</p>
            </div>
          </div>
        )}

        {/* Step 4: Pickup Address */}
        {step === 4 && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Pickup Address
            </h2>
            <p className="text-xs text-muted-foreground">
              This is where delivery partners will pick up orders from your store. Make sure it's accurate for smooth delivery operations.
            </p>

            {/* Address Line 1 */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Address Line 1 *</label>
              <input
                type="text"
                required
                value={pickupAddress.addressLine1}
                onChange={(e) => setPickupAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                placeholder="Shop no., Building name, Street"
                className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Address Line 2</label>
              <input
                type="text"
                value={pickupAddress.addressLine2}
                onChange={(e) => setPickupAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                placeholder="Area, Locality (optional)"
                className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={pickupAddress.city}
                  onChange={(e) => setPickupAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Mumbai"
                  className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">State *</label>
                <select
                  required
                  value={pickupAddress.state}
                  onChange={(e) => setPickupAddress(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Pincode *</label>
                <input
                  type="text"
                  required
                  value={pickupAddress.pincode}
                  onChange={(e) => setPickupAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  placeholder="400001"
                  maxLength={6}
                  className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Country</label>
                <input
                  type="text"
                  value={pickupAddress.country}
                  onChange={(e) => setPickupAddress(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="India"
                  className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">Landmark</label>
              <input
                type="text"
                value={pickupAddress.landmark}
                onChange={(e) => setPickupAddress(prev => ({ ...prev, landmark: e.target.value }))}
                placeholder="Near... (optional)"
                className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all"
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 bg-secondary hover:bg-muted text-foreground px-6 py-3 rounded-xl font-semibold text-sm transition-all border border-border"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              {submitting ? 'Creating your store...' : 'Create Store'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
