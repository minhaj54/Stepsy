'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Store, UploadCloud, BarChart3, Truck, CreditCard, TrendingUp,
  ChevronDown, Package, ShoppingCart, Users,
  CheckCircle2, Zap, Eye,
  RefreshCw, Phone, FileText, MapPin, Building2,
  LayoutDashboard, PieChart,
  Megaphone, Award, BookOpen, Camera, Tag, MessageCircle,
  ChevronUp, Globe, Layers, Hash, Plus, Trash2,
  X, Loader2, Image as ImageIcon
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { SocialHandle, PickupAddress } from '../../types';

type IdType = 'aadhar' | 'pan' | 'voter' | 'passport' | 'driving' | '';

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
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

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative pt-12 lg:pt-16 overflow-hidden bg-gradient-to-b from-[#FAFAFA] to-white">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #6366F1 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <img 
            src="/seller/seller-banner.png" 
            alt="Zarwinto Seller - Start your footwear business"
            className="w-full h-auto rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Trust Strip ──────────────────────────────────────────────────────────────
function TrustStrip() {
  const benefits = [
    { icon: UploadCloud, title: 'Easy Onboarding', desc: 'Start selling with a simple seller setup.' },
    { icon: Store, title: 'Built for Footwear', desc: 'Designed specifically around footwear sellers and products.' },
    { icon: CreditCard, title: 'Secure Payments', desc: 'Manage your earnings and settlements from one place.' },
    { icon: BarChart3, title: 'Seller Dashboard', desc: 'Products, orders, inventory and insights in one platform.' },
  ];
  return (
    <section className="py-12 bg-white border-y border-zinc-100">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0"><b.icon className="w-5 h-5 text-[#6366F1]" /></div>
              <div><h3 className="text-sm font-semibold text-[#09090B]">{b.title}</h3><p className="text-xs text-zinc-500 mt-0.5">{b.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why Sell Section ─────────────────────────────────────────────────────────
function WhySellSection() {
  const cards = [
    { icon: Users, title: 'Reach More Customers', desc: 'Put your footwear products in front of customers actively looking for their next pair.' },
    { icon: Layers, title: 'Built for Footwear', desc: 'Sell sneakers, formal shoes, sports shoes, sandals, slippers, boots and more.' },
    { icon: LayoutDashboard, title: 'Manage Everything in One Place', desc: 'Manage products, inventory, orders, payments and store performance from a single dashboard.' },
    { icon: TrendingUp, title: 'Grow Your Brand', desc: 'Use insights, promotions and seller tools to turn products into a growing business.' },
  ];
  return (
    <section className="py-20 lg:py-28 bg-[#FAFAFA]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09090B] tracking-tight">Everything You Need to Sell Smarter</h2>
          <p className="mt-4 text-lg text-zinc-600">Zarwinto gives footwear businesses the tools they need to move from offline selling to online growth.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="group bg-white rounded-2xl p-8 border border-zinc-100 hover:border-[#6366F1]/20 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center mb-5"><card.icon className="w-6 h-6 text-[#6366F1]" /></div>
              <h3 className="text-xl font-bold text-[#09090B] mb-2">{card.title}</h3>
              <p className="text-zinc-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Category Showcase ────────────────────────────────────────────────────────
function CategoryShowcase() {
  const categories = [
    { name: 'Sneakers', emoji: '👟' }, { name: 'Casual Shoes', emoji: '👞' },
    { name: 'Formal Shoes', emoji: '🥿' }, { name: 'Sports Shoes', emoji: '🏃' },
    { name: 'Sandals', emoji: '🩴' }, { name: 'Slippers', emoji: '🥾' },
    { name: 'Boots', emoji: '⛸️' }, { name: 'Kids Footwear', emoji: '🧒' },
  ];
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09090B] tracking-tight">Every Kind of Step. One Marketplace.</h2>
          <p className="mt-4 text-lg text-zinc-600">From sneakers to sandals — list every type of footwear in one place.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="group relative bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl p-6 text-center border border-zinc-100 hover:border-[#6366F1]/30 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative"><div className="text-4xl mb-3">{cat.emoji}</div><h3 className="text-sm font-semibold text-[#09090B]">{cat.name}</h3></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Create Your Store', desc: 'Register your business and complete your seller profile.' },
    { num: '02', title: 'Add Your Products', desc: 'Upload product images, descriptions, sizes, pricing and inventory.' },
    { num: '03', title: 'Get Discovered', desc: 'Your products become available to customers shopping on Zarwinto.' },
    { num: '04', title: 'Receive Orders', desc: 'Manage new orders directly from your seller dashboard.' },
    { num: '05', title: 'Ship & Get Paid', desc: 'Dispatch your products, track deliveries and manage your earnings.' },
  ];
  return (
    <section className="py-20 lg:py-28 bg-[#FAFAFA]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09090B] tracking-tight">Start Selling in 5 Simple Steps</h2>
          <p className="mt-4 text-lg text-zinc-600">From registration to your first sale — we make it easy.</p>
        </div>
        <div className="hidden lg:block relative">
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-zinc-200" />
          <div className="grid grid-cols-5 gap-4 relative">
            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white border-2 border-[#6366F1] flex items-center justify-center mb-4 relative z-10 shadow-sm"><span className="text-lg font-bold text-[#6366F1]">{step.num}</span></div>
                <h3 className="text-sm font-bold text-[#09090B] mb-1">{step.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:hidden space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-[#6366F1] flex items-center justify-center flex-shrink-0"><span className="text-sm font-bold text-white">{step.num}</span></div>
                {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-[#6366F1]/20 mt-2" />}
              </div>
              <div className="pb-6"><h3 className="text-base font-bold text-[#09090B] mb-1">{step.title}</h3><p className="text-sm text-zinc-500">{step.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Showcase ───────────────────────────────────────────────────────
function DashboardShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09090B] tracking-tight">Your Entire Business. One Dashboard.</h2>
          <p className="mt-4 text-lg text-zinc-600">Stay in control of your store without juggling multiple tools.</p>
        </div>
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-100">
          <img 
            src="/seller/dashboard-poster.png" 
            alt="Zarwinto Seller Dashboard - Manage your products, orders, inventory and more"
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Orders & Logistics ───────────────────────────────────────────────────────
function OrdersLogistics() {
  const timeline = ['Order Received', 'Order Confirmed', 'Packed', 'Picked Up', 'In Transit', 'Delivered'];
  const features = [
    { icon: Truck, title: 'Easy Shipping', desc: 'Prepare and dispatch orders through your seller workflow.' },
    { icon: Eye, title: 'Real-Time Tracking', desc: 'Monitor shipments from pickup to delivery.' },
    { icon: RefreshCw, title: 'Returns Management', desc: 'Keep returns organized and visible from your seller dashboard.' },
  ];
  return (
    <section className="py-20 lg:py-28 bg-[#FAFAFA]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09090B] tracking-tight">From Order to Doorstep</h2>
          <p className="mt-4 text-lg text-zinc-600">Manage your entire fulfillment process from one place.</p>
        </div>
        <div className="mb-16 overflow-x-auto pb-4">
          <div className="flex items-center justify-center min-w-[600px] gap-2">
            {timeline.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                  <p className="text-xs font-medium text-zinc-700 mt-2 text-center whitespace-nowrap">{step}</p>
                </div>
                {i < timeline.length - 1 && <div className="w-12 h-0.5 bg-[#6366F1]/30 mt-[-20px]" />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-zinc-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-[#6366F1]/10 flex items-center justify-center mb-4"><f.icon className="w-5 h-5 text-[#6366F1]" /></div>
              <h3 className="text-base font-bold text-[#09090B] mb-2">{f.title}</h3><p className="text-sm text-zinc-600">{f.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-zinc-400 mt-8">Powered by your logistics partner</p>
      </div>
    </section>
  );
}

// ─── Seller Resources ─────────────────────────────────────────────────────────
function SellerResources() {
  const resources = [
    { icon: BookOpen, title: 'Seller Guide', desc: 'Learn how to start and manage your Zarwinto store.' },
    { icon: Camera, title: 'Product Photography', desc: 'Learn how to create better footwear product images.' },
    { icon: Tag, title: 'Pricing Guide', desc: 'Understand how to price products competitively.' },
    { icon: Tag, title: 'Selling Tips', desc: 'Practical strategies for increasing your online sales.' },
    { icon: MessageCircle, title: 'Seller Support', desc: 'Get help whenever you need it.' },
  ];
  return (
    <section className="py-20 lg:py-28 bg-[#FAFAFA]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09090B] tracking-tight">Everything You Need to Sell Better</h2>
          <p className="mt-4 text-lg text-zinc-600">Resources and support to help you succeed on Zarwinto.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {resources.map((r, i) => (
            <div key={i} className="group bg-white rounded-2xl p-5 border border-zinc-100 hover:border-[#6366F1]/20 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#6366F1]/10 flex items-center justify-center mb-3 group-hover:bg-[#6366F1] transition-colors">
                <r.icon className="w-5 h-5 text-[#6366F1] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-[#09090B] mb-1">{r.title}</h3><p className="text-xs text-zinc-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ──────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: 'Who can sell on Zarwinto?', a: 'Any footwear brand, retailer, manufacturer, or authorized seller can apply to sell on Zarwinto.' },
    { q: 'How do I open a Zarwinto store?', a: 'Click "Open Your Store", create an account, complete your seller profile, and submit for review.' },
    { q: 'What documents are required?', a: 'Business registration, GST details, bank account information, and identity verification.' },
    { q: 'Do I need GST to sell?', a: 'GST requirements depend on your business type and location. Consult a tax professional.' },
    { q: 'How much does Zarwinto charge?', a: 'Zarwinto charges a small commission on successful sales. Details shared during onboarding.' },
    { q: 'How do I add products?', a: 'From your seller dashboard, navigate to Products → Add Product.' },
    { q: 'How do I manage inventory?', a: 'Your dashboard provides real-time inventory tracking with low-stock alerts.' },
    { q: 'How are orders shipped?', a: 'Pack the product and hand it to our logistics partner. Tracking updates automatically.' },
    { q: 'How do payments work?', a: 'Payments are settled to your bank account on a regular cycle.' },
    { q: 'How do returns work?', a: 'Returns are managed through your dashboard according to our returns policy.' },
    { q: 'How can I contact seller support?', a: 'Support is available through the Help section in your dashboard or via email.' },
  ];
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09090B] tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-zinc-600">Everything you need to know about selling on Zarwinto.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-zinc-200 rounded-xl overflow-hidden hover:border-[#6366F1]/30 transition-colors">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="text-sm font-semibold text-[#09090B] pr-4">{faq.q}</span>
                {openIndex === i ? <ChevronUp className="w-5 h-5 text-[#6366F1] flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />}
              </button>
              {openIndex === i && <div className="px-5 pb-5 -mt-1"><p className="text-sm text-zinc-600 leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ onOpenStore, onLogin }: { onOpenStore: () => void; onLogin: () => void }) {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1] to-[#4F46E5]" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Ready to Take Your Footwear Business Online?</h2>
          <p className="mt-5 text-lg text-indigo-100">Open your Zarwinto store and take the next step toward growing your business online.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onOpenStore} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#6366F1] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">Open Your Store →</button>
            <button onClick={onLogin} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl transition-all duration-200 cursor-pointer">Already selling on Zarwinto? Login</button>
          </div>
        </div>

        {/* YouTube Tutorial Video */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/20">
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/CeLVlvszCVM"
                title="How to Open Your Store - Zarwinto Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
          <p className="text-center text-indigo-200 text-sm mt-4">Watch how to get started with your Zarwinto store</p>
        </div>
      </div>
    </section>
  );
}

// ─── Store Form ───────────────────────────────────────────────────────────────
function StoreForm({ user, onBack }: { user: any; onBack: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [customerSupportPhone, setCustomerSupportPhone] = useState('');
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>([]);
  const [newPlatform, setNewPlatform] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [idType, setIdType] = useState<IdType>('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState('');
  const [pickupAddress, setPickupAddress] = useState<PickupAddress>({ addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', landmark: '' });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  const pickBanner = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); } };
  const pickLogo = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } };
  const pickIdFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { setIdFile(f); setIdPreview(URL.createObjectURL(f)); } };

  const uploadImage = async (file: File, folder: string, userId: string) => {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'png';
    const path = `${userId}/${folder}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('store-assets').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('store-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const uploadDocument = async (file: File, userId: string) => {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'pdf';
    const path = `${userId}/gov-id-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('store-assets').upload(path, file, { upsert: true, cacheControl: '3600' });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('store-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const addSocialHandle = () => {
    if (!newPlatform || !newHandle.trim()) return;
    const platform = SOCIAL_PLATFORMS.find(p => p.value === newPlatform);
    setSocialHandles(prev => [...prev, { platform: newPlatform, handle: newHandle.trim().replace(/^@/, ''), url: platform?.prefix ? `${platform.prefix}${newHandle.trim().replace(/^@/, '')}` : undefined }]);
    setNewPlatform(''); setNewHandle('');
  };

  const removeSocialHandle = (index: number) => { setSocialHandles(prev => prev.filter((_, i) => i !== index)); };

  const validateStep = (stepNum: number): boolean => {
    setError('');
    if (stepNum === 1) { if (!name.trim()) { setError('Store name is required.'); return false; } }
    else if (stepNum === 2) {
      if (!customerSupportPhone.trim()) { setError('Customer support phone number is required.'); return false; }
      if (!/^[+]?[\d\s-]{10,15}$/.test(customerSupportPhone.trim())) { setError('Please enter a valid phone number.'); return false; }
    } else if (stepNum === 3) { if (!idType) { setError('Please select a government ID type.'); return false; } if (!idFile) { setError('Please upload your government ID.'); return false; } }
    else if (stepNum === 4) { if (!pickupAddress.addressLine1.trim()) { setError('Pickup address is required.'); return false; } if (!pickupAddress.city.trim()) { setError('City is required.'); return false; } if (!pickupAddress.state) { setError('State is required.'); return false; } }
    return true;
  };

  const handleNext = () => { if (validateStep(step)) setStep(s => s + 1); };
  const handleBack = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      let bannerUrl = '', logoUrl = '', govIdUrl = '';
      if (bannerFile) bannerUrl = await uploadImage(bannerFile, 'banner', user.id);
      if (logoFile) logoUrl = await uploadImage(logoFile, 'logo', user.id);
      if (idFile) govIdUrl = await uploadDocument(idFile, user.id);
      const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6);
      const { error: insertError } = await supabase.from('stores').insert({
        owner_id: user.id, name: name.trim(), slug, description: description.trim(),
        business_name: businessName.trim() || null, gst_number: gstNumber.trim() || null,
        social_handle: socialHandles.length > 0 ? `@${socialHandles[0].handle}` : '',
        social_handles: socialHandles, customer_support_phone: customerSupportPhone.trim(),
        government_id_url: govIdUrl, government_id_type: idType, pickup_address: pickupAddress,
        pickup_pincode: pickupAddress.pincode, pickup_city: pickupAddress.city,
        pickup_state: pickupAddress.state, banner_url: bannerUrl, logo_url: logoUrl, status: 'pending',
      });
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong creating your store.');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 max-w-md text-center shadow-xl border border-zinc-100">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-emerald-600" /></div>
          <h1 className="text-2xl font-extrabold text-[#09090B] mb-3">Store Submitted!</h1>
          <p className="text-zinc-600 mb-6">Your store has been sent for approval. We will notify you within 24-48 hours.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/')} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-3 rounded-xl font-semibold transition-all">Back to Home</button>
            <button onClick={onBack} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 py-3 rounded-xl font-semibold transition-all">View Landing Page</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <button onClick={onBack} className="text-sm text-[#6366F1] hover:text-[#4F46E5] font-medium mb-4 inline-flex items-center gap-1">← Back to landing page</button>
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#6366F1]/10 flex items-center justify-center"><Store className="h-6 w-6 text-[#6366F1]" /></div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09090B]">Open Your Store</h1>
        <p className="text-zinc-500 text-sm mt-1">Set up your storefront and start selling your footwear.</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-[#6366F1] text-white' : 'bg-zinc-100 text-zinc-400'}`}>{s}</div>
            {s < 4 && <div className={`w-8 sm:w-12 h-0.5 ${step > s ? 'bg-[#6366F1]' : 'bg-zinc-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-100 space-y-6">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#09090B] flex items-center gap-2"><Store className="h-5 w-5 text-[#6366F1]" /> Basic Information</h2>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Store Banner</label><input ref={bannerInputRef} type="file" accept="image/*" onChange={pickBanner} className="hidden" />
              {bannerPreview ? (<div className="relative rounded-xl overflow-hidden border border-zinc-200"><img src={bannerPreview} alt="Banner" className="w-full h-40 object-cover" /><button type="button" onClick={() => { setBannerFile(null); setBannerPreview(''); }} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full"><X className="h-4 w-4" /></button></div>) : (
                <button type="button" onClick={() => bannerInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-zinc-200 hover:border-[#6366F1]/40 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-[#6366F1] transition-colors"><ImageIcon className="h-6 w-6" /><span className="text-sm">Upload banner (1200×300)</span></button>)}
            </div>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Store Logo</label><input ref={logoInputRef} type="file" accept="image/*" onChange={pickLogo} className="hidden" />
              <div className="flex items-center gap-4">
                {logoPreview ? (<div className="relative"><img src={logoPreview} alt="Logo" className="h-20 w-20 rounded-xl object-cover border border-zinc-200" /><button type="button" onClick={() => { setLogoFile(null); setLogoPreview(''); }} className="absolute -top-2 -right-2 p-1 bg-black/60 text-white rounded-full"><X className="h-3 w-3" /></button></div>) : (
                  <button type="button" onClick={() => logoInputRef.current?.click()} className="h-20 w-20 border-2 border-dashed border-zinc-200 hover:border-[#6366F1]/40 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-[#6366F1] transition-colors"><UploadCloud className="h-5 w-5" /></button>)}
                <button type="button" onClick={() => logoInputRef.current?.click()} className="text-sm text-[#6366F1] font-medium">{logoPreview ? 'Change' : 'Upload logo'}</button>
              </div>
            </div>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Store Name *</label><input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sole Society" className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm outline-none transition-all" /></div>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Business Name</label><div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /><input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Sole Society Pvt. Ltd." className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all" /></div></div>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">GST Number</label><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /><input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} placeholder="27AABCT1234R1ZX" className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all" /></div></div>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Store Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Tell customers what makes your store special..." className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none" /></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#09090B] flex items-center gap-2"><Phone className="h-5 w-5 text-[#6366F1]" /> Contact & Social</h2>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Customer Support Phone *</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /><input type="tel" required value={customerSupportPhone} onChange={(e) => setCustomerSupportPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all" /></div></div>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Social Media Handles</label>
              {socialHandles.length > 0 && (
                <div className="space-y-2 mb-4">
                  {socialHandles.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5">
                      <span>{SOCIAL_PLATFORMS.find(p => p.value === h.platform)?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold capitalize">{h.platform}</p>
                        <p className="text-xs text-zinc-500 truncate">@{h.handle}</p>
                      </div>
                      <button type="button" onClick={() => removeSocialHandle(idx)} className="p-1 text-zinc-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <select value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} className="bg-zinc-50 text-[#09090B] border border-zinc-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#6366F1]"><option value="">Platform</option>{SOCIAL_PLATFORMS.map(p => (<option key={p.value} value={p.value}>{p.icon} {p.label}</option>))}</select>
                <div className="relative flex-1"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /><input type="text" value={newHandle} onChange={(e) => setNewHandle(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))} placeholder="handle" className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all" /></div>
                <button type="button" onClick={addSocialHandle} disabled={!newPlatform || !newHandle.trim()} className="inline-flex items-center justify-center gap-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"><Plus className="h-4 w-4" /> Add</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#09090B] flex items-center gap-2"><FileText className="h-5 w-5 text-[#6366F1]" /> Identity Verification</h2>
            <p className="text-xs text-zinc-500">Upload a government-issued ID for verification.</p>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">ID Type *</label><select value={idType} onChange={(e) => setIdType(e.target.value as IdType)} className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm outline-none transition-all"><option value="">Select ID type</option><option value="aadhar">Aadhar Card</option><option value="pan">PAN Card</option><option value="voter">Voter ID</option><option value="passport">Passport</option><option value="driving">Driving License</option></select></div>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Upload ID *</label><input ref={idInputRef} type="file" accept="image/*,.pdf" onChange={pickIdFile} className="hidden" />
              {idPreview ? (<div className="relative rounded-xl overflow-hidden border border-zinc-200"><img src={idPreview} alt="ID" className="w-full h-48 object-contain bg-zinc-50" /><button type="button" onClick={() => { setIdFile(null); setIdPreview(''); }} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full"><X className="h-4 w-4" /></button></div>) : (
                <button type="button" onClick={() => idInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-zinc-200 hover:border-[#6366F1]/40 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-[#6366F1] transition-colors"><FileText className="h-8 w-8" /><span className="text-sm">Upload {idType ? idType.toUpperCase() : 'ID'} (JPG, PNG, PDF)</span></button>)}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#09090B] flex items-center gap-2"><MapPin className="h-5 w-5 text-[#6366F1]" /> Pickup Address</h2>
            <p className="text-xs text-zinc-500">Where delivery partners will pick up orders.</p>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Address Line 1 *</label><input type="text" required value={pickupAddress.addressLine1} onChange={(e) => setPickupAddress(prev => ({ ...prev, addressLine1: e.target.value }))} placeholder="Shop no., Building, Street" className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm outline-none transition-all" /></div>
            <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Address Line 2</label><input type="text" value={pickupAddress.addressLine2} onChange={(e) => setPickupAddress(prev => ({ ...prev, addressLine2: e.target.value }))} placeholder="Area, Locality" className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm outline-none transition-all" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">City *</label><input type="text" required value={pickupAddress.city} onChange={(e) => setPickupAddress(prev => ({ ...prev, city: e.target.value }))} placeholder="e.g. Mumbai" className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm outline-none transition-all" /></div>
              <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">State *</label><select required value={pickupAddress.state} onChange={(e) => setPickupAddress(prev => ({ ...prev, state: e.target.value }))} className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm outline-none transition-all"><option value="">Select state</option>{INDIAN_STATES.map(s => (<option key={s} value={s}>{s}</option>))}</select></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Pincode *</label><input type="text" required value={pickupAddress.pincode} onChange={(e) => setPickupAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="400001" maxLength={6} className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm outline-none transition-all" /></div>
              <div><label className="block text-sm font-semibold text-[#09090B] mb-1.5">Landmark</label><input type="text" value={pickupAddress.landmark} onChange={(e) => setPickupAddress(prev => ({ ...prev, landmark: e.target.value }))} placeholder="Near..." className="w-full bg-zinc-50 text-[#09090B] border border-zinc-200 focus:border-[#6366F1] rounded-xl px-4 py-3 text-sm outline-none transition-all" /></div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (<button type="button" onClick={handleBack} className="px-6 py-3 rounded-xl font-semibold text-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-all">Back</button>) : (<div />)}
          {step < 4 ? (<button type="button" onClick={handleNext} className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-all">Next Step</button>) : (
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-all disabled:opacity-60">
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}{submitting ? 'Creating...' : 'Create Store'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function OpenStoreClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      setUser(data.user);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (searchParams.get('showForm') === 'true' && user) {
      setShowForm(true);
    }
  }, [searchParams, user]);

  const handleOpenStore = () => {
    if (user) {
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/auth/signup?redirect=%2Fopen-store%3FshowForm%3Dtrue');
    }
  };

  const handleLogin = () => {
    router.push('/auth/login?redirect=%2Fopen-store');
  };

  const handleBackToLanding = () => {
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loadingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366F1]" />
      </div>
    );
  }

  if (showForm && user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased">
        <StoreForm user={user} onBack={handleBackToLanding} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <HeroSection />
      <TrustStrip />
      <WhySellSection />
      <CategoryShowcase />
      <HowItWorks />
      <DashboardShowcase />
      <OrdersLogistics />
      <SellerResources />
      <FAQSection />
      <FinalCTA onOpenStore={handleOpenStore} onLogin={handleLogin} />
      <MobileStickyCTA onOpenStore={handleOpenStore} />
    </div>
  );
}

// ─── Mobile Sticky CTA ────────────────────────────────────────────────────────
function MobileStickyCTA({ onOpenStore }: { onOpenStore: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-zinc-100 p-4 shadow-2xl">
      <button onClick={onOpenStore} className="flex items-center justify-center w-full py-3.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold rounded-xl transition-all">Open Your Store →</button>
    </div>
  );
}
