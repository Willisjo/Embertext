"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  Bitcoin,
  Receipt,
  ImageIcon,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Eraser,
} from "lucide-react";

const tools = [
  {
    href: "/humanizer",
    title: "AI Humanizer",
    description: "Transform AI-generated text into natural, human-like writing with multiple tone modes.",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    href: "/detector",
    title: "AI Content Detector",
    description: "Analyze text and estimate AI vs human likelihood with detailed reports.",
    icon: Search,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    href: "/watermark-remover",
    title: "Image Watermark Remover",
    description: "Remove watermarks from images instantly with AI-powered detection.",
    icon: Eraser,
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-500/10",
  },
  {
    href: "/bitcoin",
    title: "Bitcoin Calculator",
    description: "Real-time BTC to USD/KES converter with live charts and Satoshi calculations.",
    icon: Bitcoin,
    color: "from-orange-500 to-yellow-500",
    bgColor: "bg-orange-500/10",
  },
  {
    href: "/receipts",
    title: "Receipt Generator",
    description: "Create professional printable receipts for Bitcoin, USD, and KES transactions.",
    icon: Receipt,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
  },
  {
    href: "/image-detector",
    title: "AI Image Detector",
    description: "Upload images to detect if they were AI-generated or real photographs.",
    icon: ImageIcon,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
  },
];

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed with instant results" },
  { icon: Shield, title: "100% Free", desc: "No subscriptions, no paywalls, no limits" },
  { icon: Globe, title: "Privacy First", desc: "Your data stays on your device" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left flex-1"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Zap className="w-4 h-4" />
                Completely Free - No Signup Required
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Embertext
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10">
                A premium suite of AI tools and Bitcoin utilities. Humanize text, detect AI content,
                calculate crypto conversions, and generate professional receipts — all for free.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link
                  href="/humanizer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/bitcoin"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors font-semibold"
                >
                  <Bitcoin className="w-4 h-4" />
                  Check BTC Price
                </Link>
              </div>
            </motion.div>

            {/* Right: Animated Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" />

                {/* Main image with floating animation */}
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <img
                    src="/cyborg.jpg"
                    alt="Embertext AI Tools"
                    className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl bg-remove"
                  />
                </motion.div>

                {/* Decorative floating dots */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                  className="absolute -top-4 -right-4 w-4 h-4 bg-blue-500 rounded-full"
                />
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute -bottom-4 -left-4 w-3 h-3 bg-purple-500 rounded-full"
                />
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5,
                  }}
                  className="absolute top-1/2 -right-8 w-2 h-2 bg-pink-500 rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Tools</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Everything you need in one place. Professional quality, zero cost.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={tool.href}>
                    <div className="group relative p-6 sm:p-8 rounded-2xl glass-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 bg-gradient-to-br ${tool.color} text-white rounded-lg p-1`} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-muted-foreground">{tool.description}</p>
                      <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Try it now <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
