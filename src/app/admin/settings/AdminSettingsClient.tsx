'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Globe, Mail, Phone, MapPin, Palette, LayoutGrid } from 'lucide-react';

export default function AdminSettingsClient() {
  const [saving, setSaving] = useState(false);
  
  // Website Settings
  const [siteName, setSiteName] = useState('Whishkhu');
  const [siteTagline, setSiteTagline] = useState('World of Shoes Marketplace');
  const [siteLogo, setSiteLogo] = useState('');
  const [siteBanner, setSiteBanner] = useState('');
  const [favicon, setFavicon] = useState('');
  
  // Contact Settings
  const [contactEmail, setContactEmail] = useState('support@whishkhu.com');
  const [contactPhone, setContactPhone] = useState('+91 9876543210');
  const [contactAddress, setContactAddress] = useState('');
  
  // Social Settings
  const [facebookUrl, setFacebookUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  
  // Appearance Settings
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [accentColor, setAccentColor] = useState('#f97316');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate saving - in production, this would save to database
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleImageUpload = (type: 'logo' | 'banner' | 'favicon') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        if (type === 'logo') setSiteLogo(url);
        else if (type === 'banner') setSiteBanner(url);
        else if (type === 'favicon') setFavicon(url);
      }
    };
    input.click();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Website Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage your store's appearance and contact information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> General Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Site Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Site Tagline
              </label>
              <input
                type="text"
                value={siteTagline}
                onChange={e => setSiteTagline(e.target.value)}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mt-6 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Site Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-zinc-900 rounded-xl border border-white/[0.06] flex items-center justify-center overflow-hidden">
                {siteLogo ? (
                  <img src={siteLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-zinc-600" />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleImageUpload('logo')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Upload className="h-4 w-4" /> Upload Logo
              </button>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="mt-6 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Hero Banner
            </label>
            <div className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer" onClick={() => handleImageUpload('banner')}>
              {siteBanner ? (
                <img src={siteBanner} alt="Banner" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">Click to upload banner image</p>
                  <p className="text-xs text-zinc-500 mt-1">Recommended: 1920x600px</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Business Address
            </label>
            <textarea
              rows={3}
              value={contactAddress}
              onChange={e => setContactAddress(e.target.value)}
              placeholder="Enter your business address"
              className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" /> Social Media
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Facebook URL
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={e => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/yourstore"
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Twitter/X URL
              </label>
              <input
                type="url"
                value={twitterUrl}
                onChange={e => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/yourstore"
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Instagram URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourstore"
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Appearance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-white/[0.06] cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="flex-1 bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-white/[0.06] cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="flex-1 bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
