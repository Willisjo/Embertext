"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Download,
  Printer,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  DollarSign,
  Bitcoin,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Hash,
  Calendar,
  Percent,
  Tag,
  Pencil,
  Wallet,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { cn, formatNumber, generateReceiptNumber } from "@/lib/utils";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Currency = {
  code: string;
  symbol: string;
  name: string;
  type: "fiat" | "crypto";
};

const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", type: "fiat" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", type: "fiat" },
  { code: "EUR", symbol: "€", name: "Euro", type: "fiat" },
  { code: "GBP", symbol: "£", name: "British Pound", type: "fiat" },
  { code: "BTC", symbol: "₿", name: "Bitcoin", type: "crypto" },
  { code: "ETH", symbol: "Ξ", name: "Ethereum", type: "crypto" },
  { code: "USDT", symbol: "₮", name: "Tether (USDT)", type: "crypto" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", type: "fiat" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", type: "fiat" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", type: "fiat" },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", type: "fiat" },
  { code: "ZAR", symbol: "R", name: "South African Rand", type: "fiat" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", type: "fiat" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", type: "fiat" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", type: "fiat" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", type: "fiat" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", type: "fiat" },
  { code: "CUSTOM", symbol: "", name: "Custom Currency", type: "fiat" },
];

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ReceiptData {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string;
  companyLogo: string;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  receiptNumber: string;
  date: string;
  currency: string;
  customSymbol: string;
  items: LineItem[];
  taxRate: number;
  discount: number;
  discountType: "percentage" | "fixed";
  notes: string;
  terms: string;
  paymentMethod: string;
  signature: string;
  signatureTitle: string;
}

const initialItems: LineItem[] = [
  { id: "1", description: "", quantity: 1, rate: 0, amount: 0 },
];

const defaultData: ReceiptData = {
  companyName: "Your Company",
  companyAddress: "123 Business Avenue, Suite 100",
  companyEmail: "hello@company.com",
  companyPhone: "+1 (555) 123-4567",
  companyWebsite: "www.company.com",
  companyLogo: "",
  customerName: "",
  customerAddress: "",
  customerEmail: "",
  receiptNumber: generateReceiptNumber(),
  date: new Date().toISOString().split("T")[0],
  currency: "USD",
  customSymbol: "",
  items: initialItems,
  taxRate: 0,
  discount: 0,
  discountType: "percentage",
  notes: "Thank you for your business!",
  terms: "Payment due within 30 days.",
  paymentMethod: "Bank Transfer",
  signature: "",
  signatureTitle: "Authorized Signature",
};

export default function ReceiptGeneratorPage() {
  const [data, setData] = useState<ReceiptData>(defaultData);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const currency = CURRENCIES.find((c) => c.code === data.currency) || CURRENCIES[0];
  const symbol = data.currency === "CUSTOM" ? data.customSymbol : currency.symbol;

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setData((prev) => {
      const items = prev.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      });
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: String(Date.now()),
          description: "",
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setData((prev) => ({ ...prev, companyLogo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSignatureUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Signature must be under 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setData((prev) => ({ ...prev, signature: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount =
    data.discountType === "percentage"
      ? subtotal * (data.discount / 100)
      : data.discount;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (data.taxRate / 100);
  const total = taxableAmount + taxAmount;

  const formatCurrency = (amount: number) => {
    if (data.currency === "BTC") {
      return `₿ ${amount.toFixed(8)}`;
    }
    if (data.currency === "ETH") {
      return `Ξ ${amount.toFixed(6)}`;
    }
    return `${symbol}${symbol ? "" : ""} ${formatNumber(amount, 2)}`;
  };

  const handlePrint = () => {
    trackReceiptGeneration();
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    trackReceiptGeneration();
    toast.loading("Generating PDF...", { id: "pdf" });
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt-${data.receiptNumber}.pdf`);
      toast.success("PDF downloaded!", { id: "pdf" });
    } catch {
      toast.error("Failed to generate PDF", { id: "pdf" });
    }
  };

  const trackReceiptGeneration = useCallback(async () => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "receipt",
          data: {
            currencyType: data.currency,
            amount: total,
            senderName: data.companyName,
            receiverName: data.customerName,
          },
        }),
      });
    } catch {
      // Silently fail tracking
    }
  }, [data.currency, total, data.companyName, data.customerName]);

  const handleCopyReceiptNumber = () => {
    navigator.clipboard.writeText(data.receiptNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Receipt number copied");
  };

  const setField = <K extends keyof ReceiptData>(key: K, value: ReceiptData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Receipt Generator</h1>
        <p className="text-muted-foreground">
          Create professional, printable receipts for any currency
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab("edit")}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
            activeTab === "edit"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
              : "glass-card hover:bg-accent"
          )}
        >
          <Pencil className="w-4 h-4 inline mr-2" />
          Edit Details
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
            activeTab === "preview"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
              : "glass-card hover:bg-accent"
          )}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Preview & Export
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Edit Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: activeTab === "edit" ? 1 : 0,
            x: activeTab === "edit" ? 0 : -20,
          }}
          className={cn(
            "xl:col-span-2 space-y-6",
            activeTab !== "edit" && "hidden xl:block xl:opacity-0 xl:pointer-events-none"
          )}
        >
          {/* Company Details */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Company Details</h2>
            </div>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Company Logo</label>
                <div className="flex items-center gap-4">
                  {data.companyLogo ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                      <img
                        src={data.companyLogo}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => setField("companyLogo", "")}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Company Name</label>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="Your Company Ltd"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Address</label>
                <input
                  type="text"
                  value={data.companyAddress}
                  onChange={(e) => setField("companyAddress", e.target.value)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="123 Business Ave"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={data.companyEmail}
                    onChange={(e) => setField("companyEmail", e.target.value)}
                    className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder="hello@co.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Phone</label>
                  <input
                    type="text"
                    value={data.companyPhone}
                    onChange={(e) => setField("companyPhone", e.target.value)}
                    className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    placeholder="+1 555 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Website</label>
                <input
                  type="text"
                  value={data.companyWebsite}
                  onChange={(e) => setField("companyWebsite", e.target.value)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="www.company.com"
                />
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Customer Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Customer Name</label>
                <input
                  type="text"
                  value={data.customerName}
                  onChange={(e) => setField("customerName", e.target.value)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Address</label>
                <input
                  type="text"
                  value={data.customerAddress}
                  onChange={(e) => setField("customerAddress", e.target.value)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="456 Client Street"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={data.customerEmail}
                  onChange={(e) => setField("customerEmail", e.target.value)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Receipt Info</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Receipt #</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={data.receiptNumber}
                      onChange={(e) => setField("receiptNumber", e.target.value)}
                      className="flex-1 rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyReceiptNumber}
                      className="p-2.5 rounded-xl bg-muted/50 hover:bg-accent transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setField("date", e.target.value)}
                    className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Currency</label>
                <select
                  value={data.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <optgroup label="Fiat Currencies">
                    {CURRENCIES.filter((c) => c.type === "fiat" && c.code !== "CUSTOM").map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code} - {c.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Cryptocurrencies">
                    {CURRENCIES.filter((c) => c.type === "crypto").map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code} - {c.name}
                      </option>
                    ))}
                  </optgroup>
                  <option value="CUSTOM">Custom Currency</option>
                </select>
                {data.currency === "CUSTOM" && (
                  <div className="mt-2">
                    <label className="text-sm text-muted-foreground mb-1.5 block">Custom Symbol</label>
                    <input
                      type="text"
                      value={data.customSymbol}
                      onChange={(e) => setField("customSymbol", e.target.value)}
                      className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      placeholder="e.g. R, Fr, etc."
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Payment Method</label>
                <select
                  value={data.paymentMethod}
                  onChange={(e) => setField("paymentMethod", e.target.value)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bitcoin">Bitcoin</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="USDT">USDT</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-semibold">Items</h2>
              </div>
              <button
                onClick={addItem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>
            <div className="space-y-3">
              {data.items.map((item, index) => (
                <div key={item.id} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">Item {index + 1}</span>
                    {data.items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="w-full rounded-lg bg-muted/50 border-0 py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      placeholder="Item description"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg bg-muted/50 border-0 py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">Rate</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg bg-muted/50 border-0 py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">Amount</label>
                        <div className="w-full rounded-lg bg-muted/30 border border-border/50 py-2 px-3 text-sm font-medium truncate">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Discount */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Tax & Discount</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={data.taxRate}
                  onChange={(e) => setField("taxRate", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Discount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.discount}
                    onChange={(e) => setField("discount", parseFloat(e.target.value) || 0)}
                    className="flex-1 rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <select
                    value={data.discountType}
                    onChange={(e) => setField("discountType", e.target.value as "percentage" | "fixed")}
                    className="w-24 rounded-xl bg-muted/50 border-0 py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">{symbol}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Notes & Terms</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Notes</label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  placeholder="Thank you message..."
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Terms & Conditions</label>
                <textarea
                  value={data.terms}
                  onChange={(e) => setField("terms", e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  placeholder="Payment terms..."
                />
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-semibold">Signature</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Signature Image</label>
                <div className="flex items-center gap-4">
                  {data.signature ? (
                    <div className="relative w-40 h-16 rounded-xl overflow-hidden border border-border bg-white">
                      <img
                        src={data.signature}
                        alt="Signature"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => setField("signature", "")}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="w-40 h-16 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-0.5">Upload Signature</span>
                      <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Signature Title</label>
                <input
                  type="text"
                  value={data.signatureTitle}
                  onChange={(e) => setField("signatureTitle", e.target.value)}
                  className="w-full rounded-xl bg-muted/50 border-0 py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="Authorized Signature"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: activeTab === "preview" ? 1 : 0,
            x: activeTab === "preview" ? 0 : 20,
          }}
          className={cn(
            "xl:col-span-3",
            activeTab !== "preview" && "hidden xl:block xl:opacity-0 xl:pointer-events-none"
          )}
        >
          {/* Actions */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Receipt Preview</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card text-sm font-medium hover:bg-accent transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-green-500/25"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Receipt */}
          <div
            ref={receiptRef}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden print:shadow-none print:border-0 print:rounded-none"
          >
            {/* Receipt Header */}
            <div className="p-8 sm:p-10 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {data.companyLogo ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50">
                      <img
                        src={data.companyLogo}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{data.companyName}</h1>
                    <div className="mt-1 space-y-0.5 text-sm text-gray-500">
                      {data.companyAddress && <p>{data.companyAddress}</p>}
                      {data.companyEmail && <p>{data.companyEmail}</p>}
                      <div className="flex gap-3">
                        {data.companyPhone && <span>{data.companyPhone}</span>}
                        {data.companyWebsite && <span>| {data.companyWebsite}</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-2">
                    {data.currency === "CUSTOM" ? data.customSymbol : currency.code}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">RECEIPT</h2>
                  <p className="text-sm text-gray-500 mt-1">#{data.receiptNumber}</p>
                </div>
              </div>
            </div>

            {/* Customer & Date */}
            <div className="px-8 sm:px-10 py-6 border-b border-gray-100 flex justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bill To</p>
                <p className="font-semibold text-gray-900">{data.customerName || "—"}</p>
                {data.customerAddress && (
                  <p className="text-sm text-gray-500">{data.customerAddress}</p>
                )}
                {data.customerEmail && (
                  <p className="text-sm text-gray-500">{data.customerEmail}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {data.paymentMethod && (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1">Payment</p>
                    <p className="text-sm text-gray-700">{data.paymentMethod}</p>
                  </>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="px-8 sm:px-10 py-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left pb-3 font-semibold text-gray-900 text-xs uppercase tracking-wider">Description</th>
                    <th className="text-center pb-3 font-semibold text-gray-900 text-xs uppercase tracking-wider w-16">Qty</th>
                    <th className="text-right pb-3 font-semibold text-gray-900 text-xs uppercase tracking-wider w-28">Rate</th>
                    <th className="text-right pb-3 font-semibold text-gray-900 text-xs uppercase tracking-wider w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 text-gray-800">{item.description || "—"}</td>
                      <td className="py-3 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-700">{formatCurrency(item.rate)}</td>
                      <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-8 sm:px-10 py-6 border-t border-gray-100">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  {data.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Discount {data.discountType === "percentage" ? `(${data.discount}%)` : ""}
                      </span>
                      <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  {data.taxRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax ({data.taxRate}%)</span>
                      <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-900 pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(data.notes || data.terms) && (
              <div className="px-8 sm:px-10 py-6 border-t border-gray-100 bg-gray-50/50">
                <div className="grid grid-cols-2 gap-8">
                  {data.notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-sm text-gray-600">{data.notes}</p>
                    </div>
                  )}
                  {data.terms && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Terms</p>
                      <p className="text-sm text-gray-600">{data.terms}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Signature */}
            <div className="px-8 sm:px-10 py-6 border-t border-gray-100">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{data.signatureTitle}</p>
                  {data.signature ? (
                    <div className="w-40 h-14 mt-1">
                      <img
                        src={data.signature}
                        alt="Signature"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-14 mt-1 border-b-2 border-gray-300" />
                  )}
                  <p className="text-sm text-gray-700 mt-1 font-medium">{data.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mt-0.5">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
