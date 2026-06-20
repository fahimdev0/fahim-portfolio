import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, Briefcase, Sparkles, CheckCircle2, MessageSquare, Send, BookOpen, 
  Clock, Award, Search, Filter, Compass, Clipboard, ShieldAlert, Check, 
  HelpCircle, ChevronRight, DollarSign, Calculator, AlertTriangle, ShieldCheck, 
  Bookmark, ArrowUpRight, CheckSquare, Target, Trophy, Play, Star, ExternalLink,
  RefreshCw, Smile, Users, HeartHandshake
} from "lucide-react";
import { freelancingData } from "../data/freelancingData";

const EN_TO_BN: Record<string, string> = {
  // Navigation tabs
  "Explore Overview": "ওভারভিউ এক্সপ্লোর করুন",
  "Career Finder": "ক্যারিয়ার সিলেক্টর",
  "Skill Roadmaps": "স্কিল রোডম্যাপ",
  "Platform Guides": "প্ল্যাটফর্ম গাইড",
  "Portfolio Guide": "পোর্টফোলিও গাইড",
  "App Toolkit": "অ্যাপ টুলকিট",
  "Scam Watcher": "স্ক্যাম ওয়াচার",
  "Action Checklists": "এক্সিকিউশন চেকলিস্ট",
  "CONTROL CONSOLE": "কন্ট্রোল কন্সোল",
  "Milestones Progress": "প্রোগ্রেস মাইলস্টোনস",
  "Search skills, timelines, roadmaps, Fiverr packages or FAQs...": "স্কিল, রোডম্যাপ, ফাইভার প্যাকেজ অথবা সাধারণ প্রশ্ন খুঁজুন...",
  "Clear": "মুছে ফেলুন",
  "Zero Experience Path": "শূন্য অভিজ্ঞতা পথ",
  "22 High Impact Modules": "২২টি রিয়েল মডিউল",
  "Interactive System Core": "ইন্টারেক্টিভ সিস্টেম কোর",
  "Fiverr + Proposal + Calculator Live": "ফাইভার + প্রপোজাল + ক্যালকুলেটর লাইভ",
  "PREMIUM ROADMAP HUBS": "প্রিমিয়াম ক্যারিয়ার হাবস",
  "Beginner Freelancer": "নতুন ফ্রিল্যান্সারদের জন্য",
  "Ultimate Workstation": "আল্টিমেট ওয়ার্কস্টেশন",
  "Last updated:": "সর্বশেষ আপডেট:",
  "Most profitable skills": "সর্বাধিক লাভজনক স্কিল",
  "Career Match Finder": "ক্যারিয়ার ম্যাচ সিলেক্টর",
  "Not sure where to start? Answer 4 quick questions to find your high-probability match.": "কোথা থেকে শুরু করবেন বুঝতে পারছেন না? আপনার জন্য পারফেক্ট ক্যারিয়ার ম্যাচ খুঁজতে ৪টি দ্রুত প্রশ্নের উত্তর দিন।",
  "Back to Dashboard": "ড্যাশবোর্ডে ফিরে যান",
  "Back to Dashboard Content": "ড্যাশবোর্ডে ফিরে যান",
  "Back to Categories": "ক্যাটাগরি লিস্টে ফিরে যান",
  "Enter Module": "মডিউলে প্রবেশ করুন",
  "First Client": "ফার্স্ট ক্লায়েন্ট",
  "Achieved": "অর্জিত",
  "DEMAND": "চাহিদা",
  "AVG. RATE": "গড় রেট",
  "TIMEFRAME": "সময়সীমা",
  "Why is it profitable?": "এটি কেন লাভজনক?",
  "Beginner friendly": "নতুনদের জন্য সহজ",
  "Intermediate+": "ইন্টারমিডিয়েট+",
  "Complete Career Finder": "সম্পূর্ণ ক্যারিয়ার ফাইন্ডার",
  "Find your best probability skill matches based on hours, difficulty, resources and your creative style.": "ঘণ্টা, সময়সীমা, কঠিন স্তর এবং আপনার সৃজনশীলতার ভিত্তিতে সবচেয়ে উপযোগী স্কিল খুঁজুন।",
  "Weekly Availability": "সাপ্তাহিক সময়",
  "10-15 Hours / week": "১০-১৫ ঘণ্টা / সপ্তাহ",
  "15-25 Hours / week": "১৫-২৫ ঘণ্টা / সপ্তাহ",
  "30+ Hours / week": "৩০+ ঘণ্টা / সপ্তাহ",
  "Difficulty Tolerance": "কঠিন স্তর সহনশীলতা",
  "Beginner Friendly Only": "শুধুমাত্র নতুনদের জন্য সহজ",
  "Any Level Ok": "যেকোনো লেভেল",
  "Timeframe Expectation": "সময়সীমার প্রত্যাশা",
  "Fast Client (1-4 Weeks)": "দ্রুত ক্লায়েন্ট (১-৪ সপ্তাহ)",
  "Moderate Progress (4-12 Weeks)": "মাঝারি অগ্রগতি (৪-১২ সপ্তাহ)",
  "Any Timeline Flexible": "যেকোনো ফ্লেক্সিবল সময়",
  "Preferred Work Style": "পছন্দের কাজের ধরন",
  "Creative & Visual (Graphics/Video)": "সৃজনশীল ও ভিজ্যুয়াল (গ্রাফিক্স/ভিডিও)",
  "Technical & Admin (VA/SEO)": "টেকনিক্যাল ও অ্যাডমিন (ভার্চুয়াল অ্যাসিস্ট্যান্ট/এসইও)",
  "Programming & Logic (Dev)": "প্রোগ্রামিং ও লজিক (ডেভেলপমেন্ট)",
  "Anything is fine": "যেকোনো কিছু চলবে",
  "Recommended Career Recommendations": "প্রস্তাবিত ক্যারিয়ার রেকমেন্ডেশন",
  "Match score:": "ম্যাচ স্কোর:",
  "Demand:": "চাহিদা:",
  "Avg. Rate:": "গড় রেট:",
  "Time to Client:": "ক্লায়েন্ট পাওয়ার সময়সীমা:",
  "Beginner Friendly:": "নতুনদের জন্য সহজ:",
  "YES": "হ্যাঁ",
  "NO": "না",
  "View full roadmap": "সম্পূর্ণ রোডম্যাপ দেখুন",
  "Interactive Skill Learning Roadmaps": "ইন্টারেক্টিভ স্কিল লার্নিং রোডম্যাপ",
  "Select a skill to load its step-by-step master learning path, curriculum milestones, and recommended resources.": "যেকোনো একটি স্কিল সিলেক্ট করে তার ধাপ-ধাপ মাস্টার লার্নিং পাথ, কারিকুলাম ও সঠিক রিসোর্স দেখুন।",
  "Select Learning Track": "লার্নিং ট্র্যাক সিলেক্ট করুন",
  "Free Learning Resources": "ফ্রি লার্নিং রিসোর্স",
  "Excellent curated YouTube channels and masterclass websites mapped to your chosen track to learn completely for free.": "সম্পূর্ণ ফ্রিতে শেখার জন্য আপনার নির্বাচিত ট্র্যাকের সাথে সম্পর্কিত সেরা ইউটিউব চ্যানেল এবং মাস্টারক্লাস ওয়েবসাইটসমূহ।",
  "Highly Recommended YouTube Channels": "রিসোর্স ইউটিউব চ্যানেলসমূহ",
  "Recommended Global Platforms": "রেকমেন্ডেড গ্লোবাল প্ল্যাটফর্মস",
  "Explore and register on standard platforms beyond Fiverr and Upwork for lesser competition.": "কম প্রতিযোগিতার জন্য ফাইভার এবং আপওয়ার্ক বাদে আরও কিছু গ্লোবাল প্ল্যাটফর্ম অন্বেষণ করুন।",
  "Visit": "ভিজিট করুন",
  "2026 Master Freelancer Platform Playbooks": "২০২৬ ফ্রিল্যান্সার প্ল্যাটফর্ম প্লেবুক",
  "Step-by-step playbooks for starting completely right on major systems and finding lesser-known freelance portals.": "প্রধান প্ল্যাটফর্মগুলোতে শুরু করার জন্য এবং কম প্রতিযোগিতার ফ্রিল্যান্স পোর্টাল খুঁজে পাওয়ার নির্দেশিকা।",
  "PROS": "সুবিধাসমূহ",
  "CONS": "অসুবিধাসমূহ",
  "SECRET KEY": "সিক্রেট টিপস",
  "Remote Job Board Alternatives": "বিকল্প রিমোট জব বোর্ডসমূহ",
  "Direct alternatives to Fiverr and Upwork with less noise and higher quality long-term retainer partners.": "ফাইভার এবং আপওয়ার্কের সরাসরি বিকল্প যেখানে প্রতিযোগিতা কম এবং দীর্ঘমেয়াদী ক্লায়েন্ট সহজে পাওয়া যায়।",
  "Zero-Client Portfolio Builder Strategy": "পোর্টফোলিও বিল্ডার স্ট্র্যাটেজি",
  "No clients? No problem. Follow our structured framework to design a premium, highly convincing visual portfolio without real clients.": "কোনো পূর্ব অভিজ্ঞতা বা ক্লায়েন্ট নেই? কোনো সমস্যা নেই। শূন্য থেকে একটি আকর্ষণীয় ও প্রিমিয়াম পোর্টফোলিও বানাতে আমাদের চার্ট অনুসরণ করুন।",
  "Step": "ধাপ",
  "Beginner Project Ideas to Build for Your Selected Track": "আপনার নির্বাচিত ট্র্যাকের জন্য বিগিনার প্রজেক্ট আইডিয়া",
  "Use these prompt templates to build real simulated works for your portfolio immediately.": "আপনার পোর্টফোলিওতে যোগ করতে এখনই এই প্রজেক্ট আইডিয়াগুলো বাস্তবায়ন করা শুরু করুন।",
  "Niche & Scope": "নিশ এবং স্কোপ",
  "Portfolio Prompt": "পোর্টফোলিও প্রম্পট",
  "Success Deliverables": "সফল ডেলিভারেবলস",
  "Workspace Toolkit": "ওয়ার্কস্পেস ডাবল টুলকিট",
  "Generate customized optimization blocks, high-conversion proposal cover letters, and run realistic income target simulations.": "কাস্টমাইজড গিগ টাইটেল, কভার লেটার এবং আপনার বাস্তবসম্মত আয়ের টার্গেট সিমুলেশন হিসাব করুন।",
  "Fiverr Gig Outline Customizer": "ফাইভার গিগ আউটলাইন কাস্টমাইজার",
  "Generate highly professional gig details ready to copy-paste.": "কপি-পেস্ট করার জন্য অত্যন্ত চমৎকার প্রফেশনাল গিগের বিবরণ তৈরি করুন।",
  "Skill Type": "স্কিলের ধরন",
  "Your Name": "আপনার নাম",
  "Target Search Keyword (Niche)": "টার্গেট সার্চ কিওয়ার্ড (নিশ)",
  "Pricing Target (Base tier $)": "বেসিক প্রাইসিং টার্গেট (ডলার)",
  "Unique Action Hook (Benefit)": "অনন্য অ্যাকশন হুক (সুবিধা)",
  "Generated Gig Preview Panel": "তৈরিকৃত গিগ প্রিভিউ প্যানেল",
  "Copy Title": "টাইটেল কপি করুন",
  "Copy Description": "ডেসক্রিপশন কপি করুন",
  "Copied!": "কপি হয়েছে!",
  "Delivery Deliverables:": "ডেলিভারেবলস:",
  "Tier:": "প্যাকেজ স্তর:",
  "High-Conversion Proposal Writer": "হাই-কনভার্সন প্রপোজাল রাইটার",
  "Fill gaps to craft a customized first proposal letter targeted directly at your client's needs.": "ক্লায়েন্টের চাহিদার ওপর ভিত্তি করে একটি কাস্টমাইজড প্রথম প্রপোজাল কভার লেটার তৈরি করুন।",
  "Client's Name": "ক্লায়েন্টের নাম",
  "Client's Specific Need (Problem)": "ক্লায়েন্টের নির্দিষ্ট সমস্যা/চাহিদা",
  "One-Sentence Relevant Result (Proof)": "প্রাসঙ্গিক অভিজ্ঞতার ফলাফল (প্রমাণ)",
  "Proposal Delivery Timeframe": "কাজের শেষ করার সময়সীমা",
  "Proposal Discount Offer": "প্রস্তাবিত ডিসকাউন্ট অফার",
  "Template Select": "টেমপ্লেট সিলেক্ট করুন",
  "Generated Proposal Cover Letter Preview": "তৈরিকৃত প্রপোজাল কভার লেটার প্রিভিউ",
  "Copy Full Letter": "সম্পূর্ণ প্রপোজাল কপি করুন",
  "Realistic Earnings Target Simulator": "বাস্তবসম্মত আয়ের সিমুলেটর",
  "Calculate your hourly rate targets and retainer client targets based on your financial goals.": "আপনার আর্থিক লক্ষ্যের ওপর ভিত্তি করে আপনার ঘণ্টার রেট এবং দীর্ঘমেয়াদী ক্লায়েন্টের হিসাব করুন।",
  "Hourly Freelancer Calculator": "আওয়ারলি ফ্রিল্যান্সার ক্যালকুলেটর",
  "Annual Earning Goal ($ or ৳)": "বাৎসরিক আয়ের লক্ষ্য ($ বা ৳)",
  "Active Working Weeks/Year": "বছরে কত সপ্তাহ কাজ করবেন",
  "Billable Hours per Week": "সপ্তাহে কত ঘণ্টা কাজ করবেন",
  "Platform Fee Cut percentage": "প্ল্যাটফর্ম ফি কাটার পারসেন্টেজ",
  "Calculated Target Rates": "হিসাবকৃত টার্গেট রেটসমূহ",
  "Required Raw Hourly Rate (Before fee):": "প্রয়োজনীয় গ্রস আওয়ারলি রেট (ফি বাদে):",
  "Required Adjusted Hourly Rate (To keep target after fee):": "সমন্বিত আওয়ারলি রেট (ফি কাটার পরও টার্গেট বজায় রাখতে):",
  "Retainer Client Calculator": "রিটেইনার ক্লায়েন্ট ক্যালকুলেটর",
  "Active Monthly Retainer Clients": "সক্রিয় মাসিক রিটেইনার ক্লায়েন্ট সংখ্যা",
  "Flat Rate Monthly Retainer per Client": "প্রতি ক্লায়েন্ট থেকে ফিক্সড মাসিক পেমেন্ট",
  "Total Estimated Retainer Revenue:": "মোট আনুমানিক রিটেইনার রেভিনিউ:",
  "Platform Cut:": "প্ল্যাটফর্ম কাট:",
  "Net Monthly Earnings Estimate:": "মাসিক নিট আয়ের আনুমানিক হিসাব:",
  "Client Scam Detector & Safety Center": "ক্লায়েন্ট স্ক্যাম ডিটেক্টর ও সেফটি সেন্টার",
  "Do not get scammed on Telegram or through WhatsApp. Check off immediate red flags to calculate client risk score.": "টেলিগ্রাম বা হোয়াটসঅ্যাপের কোনো স্ক্যামের ফাঁদে পড়বেন না। ক্লায়েন্টের আস্থার স্কোর হিসাব করতে নিচের রেড ফ্ল্যাগগুলো মিলিয়ে নিন।",
  "Client Red Flags Check": "ক্লায়েন্টের রেড ফ্ল্যাগ চেকলিস্ট",
  "Tap flags to toggle check status.": "চেক করতে যেকোনো পয়েন্টে ক্লিক করুন।",
  "Calculated Safety Score": "হিসাবকৃত সেফটি স্কোর",
  "Clean Safety Status": "নিরাপদ ক্লায়েন্ট স্ট্যাটাস",
  "Caution Advised": "সতর্কতা অবলম্বন করুন",
  "High Risk Danger": "মারাত্মক ঝুঁকির সম্ভাবনা",
  "Interactive Safety Checklist": "ইন্টারেক্টিভ সেফটি চেকলিস্ট",
  "Client Communication Foundations": "ক্লায়েন্ট কমিউনিকেশন ফাউন্ডেশনস",
  "Principles & Phrases for zero experience freelancers communicating confidently with western clients.": "পশ্চিমা ক্লায়েন্টদের সাথে আত্মবিশ্বাসের সাথে কথা বলার জন্য প্রয়োজনীয় নীতি এবং কিছু নমুনা বাক্য।",
  "COMMUNICATION PRINCIPLES": "কমিউনিকেশন প্রিন্সিপালস",
  "USEFUL ENGLISH PHRASES (Ready to modify and send)": "প্রয়োজনীয় ইংরেজি বাক্যসমূহ (সংশোধন করে পাঠাতে পারবেন)",
  "Scenario:": "পরিস্থিতি:",
  "What to send:": "যা পাঠাবেন:",
  "A-to-Z Execution Roadmap Checklists": "A-to-Z এক্সিকিউশন রোডম্যাপ চেকলিস্ট",
  "Check off tasks across 4 milestone stages to build momentum towards your very first freelance project sale.": "আপনার প্রথম ফ্রিল্যান্স প্রোজেক্টটি পাওয়ার লক্ষ্যে এগিয়ে যেতে ৪টি মাইলস্টোন স্টেজের কাজগুলো সম্পন্ন করুন।",
  "Save state permanently.": "ক্যারিয়ার ড্যাশবোর্টে স্থায়ীভাবে সেভ করুন।",
  "Milestones Checklist": "মাইলস্টোনস চেকলিস্ট",
  "Success Milestones": "সফল মাইলস্টোন",
  "Check off milestones as you achieve real career goals. Track your absolute progress.": "বাস্তব কর্মজীবনের লক্ষ্য অর্জনের সাথে সাথে মাইলস্টোনগুলো চেক করুন। আপনার সামগ্রিক অগ্রগতি ট্র্যাক করুন।",
  "Frequently Asked Questions": "সাধারণ জিজ্ঞাসা (FAQs)",
  "Answers to core questions with straight talk from successful freelancers.": "সফল ফ্রিল্যান্সারদের সরাসরি অভিজ্ঞতার ওপর ভিত্তি করে গুরুত্বপূর্ণ প্রশ্ন ও উত্তরের সংকলন।",
  "Done": "সম্পন্ন হয়েছে",
  "Pending": "বাকি আছে"
};

const DYNAMIC_MAP_BN: Record<string, string> = {
  "AI Tools & Automation": "এআই টুলস এবং অটোমেশন",
  "Web Development": "ওয়েব ডেভেলপমেন্ট",
  "Graphic Design": "গ্রাফিক ডিজাইন",
  "Copywriting & Content Writing": "কপিরাইটিং এবং কন্টেন্ট রাইটিং",
  "Video Editing": "ভিডিও এডিটিং",
  "Virtual Assistance": "ভার্চুয়াল অ্যাসিস্ট্যান্স",
  "Social Media Management": "সোশ্যাল মিডিয়া ম্যানেজমেন্ট",
  "SEO (Search Engine Optimization)": "এসইও (সার্চ ইঞ্জিন অপটিমাইজেশন)",
  "Building AI-powered workflows, chatbots, prompt systems, and automations (Make, Zapier, n8n, GPT/Claude APIs) that save businesses time and labor costs.": "এআই-চালিত ওয়ার্কফ্লো, চ্যাটবট, প্রম্পট সিস্টেম এবং অটোমেশন তৈরি করা (যেমন Make, Zapier, n8n, GPT/Claude APIs) যা ব্যবসার সময় এবং শ্রমের খরচ কমায়।",
  "Building websites and web apps using HTML/CSS/JavaScript, WordPress, Webflow, or modern frameworks like React.": "HTML/CSS/JavaScript, WordPress, Webflow বা আধুনিক ফ্রেমওয়ার্ক যেমন React ব্যবহার করে ওয়েবসাইট এবং ওয়েব অ্যাপ তৈরি করা।",
  "Logo design, social media graphics, branding kits, presentation design, and print materials using Canva, Figma, or Adobe tools.": "ক্যানভা, ফিগমা বা অ্যাডোবি টুলস ব্যবহার করে লোগো ডিজাইন, সোশ্যাল মিডিয়া গ্রাফিক্স, ব্র্যান্ডিং কিটস, প্রেজেন্টেশন ডিজাইন এবং প্রিন্ট সামগ্রী তৈরি করা।",
  "Writing website copy, email sequences, ad copy, blog posts, and product descriptions that persuade people to take action.": "ওয়েবসাইট কপি, ইমেল সিকোয়েন্স, বিজ্ঞাপন কপি, ব্লগ পোস্ট এবং পণ্যের বিবরণ লেখা যা মানুষকে কোনো নির্দিষ্ট অ্যাকশন নিতে রাজি করায়।",
  "Editing YouTube videos, short-form content (Reels/TikTok/Shorts), podcasts, and ads using CapCut, Premiere Pro, or DaVinci Resolve.": "CapCut, Premiere Pro বা DaVinci Resolve ব্যবহার করে ইউটিউব ভিডিও, শর্ট-ফর্ম কন্টেন্ট (Reels/TikTok/Shorts), পডকাস্ট এবং বিজ্ঞাপন এডিট করা।",
  "Inbox management, scheduling, data entry, customer support, research, and general admin support for entrepreneurs and small businesses.": "উদ্যোক্তা এবং ছোট ব্যবসার জন্য ইনবক্স ব্যবস্থাপনা, সময় নির্ধারণ, ডেটা এন্ট্রি, কাস্টমার সাপোর্ট, গবেষণা এবং সাধারণ অ্যাডমিন সাপোর্ট প্রদান করা।",
  "Managing content calendars, posting, community engagement, and basic analytics reporting for brands and creators.": "ব্র্যান্ড এবং ক্রিয়েটরদের জন্য কন্টেন্ট ক্যালেন্ডার ম্যানেজমেন্ট, পোস্টিং, কমিউনিটি এনগেজমেন্ট এবং প্রাথমিক অ্যানালিটিক্স রিপোর্টিং করা।",
  "Keyword research, on-page optimization, technical SEO audits, and content strategy to improve organic search rankings.": "অর্গানিক সার্চ র‍্যাঙ্কিং উন্নত করার জন্য কিওয়ার্ড রিসার্চ, অন-পেজ অপ্টিমাইজেশন, টেকনিক্যাল এসইও অডিট এবং কন্টেন্ট স্ট্র্যাটেজি গঠন করা।",
  "Very High": "উচ্চ পর্যায়ে",
  "High": "উচ্চ",
  "Beginner-Intermediate": "বিগিনার-ইন্টারমিডিয়েট",
  "Beginner": "বিগিনার",
  "Intermediate": "ইন্টারমিডিয়েট",
  "4-8 weeks": "৪-৮ সপ্তাহ",
  "3-6 months": "৩-৬ মাস",
  "4-10 weeks": "৪-১০ সপ্তাহ",
  "3-8 weeks": "৩-৮ সপ্তাহ",
  "1-4 weeks": "১-৪ সপ্তাহ",
  "2-4 months": "২-৪ মাস"
};

interface FreelancingAppProps {
  onBack: () => void;
}

type MainTab = "menu" | "overview" | "careers" | "roadmaps" | "platforms" | "portfolio" | "tools" | "scams" | "checklists";

export const FreelancingApp = ({ onBack }: FreelancingAppProps) => {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<MainTab>("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [isLoadingCat, setIsLoadingCat] = useState(false);
  const [loadingCatId, setLoadingCatId] = useState<MainTab | null>(null);

  const handleCategoryClick = (catId: MainTab) => {
    setLoadingCatId(catId);
    setIsLoadingCat(true);
    setTimeout(() => {
      setIsLoadingCat(false);
      setLoadingCatId(null);
      setActiveTab(catId);
      setSearchQuery("");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  // Translation System (English/Bangla)
  const [lang, setLang] = useState<"en" | "bn">("en");

  const trans = (str: string): string => {
    if (lang === "en" || !str) return str;
    const trimmed = str.trim();
    if (EN_TO_BN[trimmed]) return EN_TO_BN[trimmed];
    if (DYNAMIC_MAP_BN[trimmed]) return DYNAMIC_MAP_BN[trimmed];
    return str;
  };

  // Persistence Key
  const L_STORAGE_KEY_CHECKLISTS = "first_client_action_checklists";
  const L_STORAGE_KEY_MILESTONES = "first_client_success_milestones";

  // Persistent States
  const [localChecklists, setLocalChecklists] = useState<Record<string, string[]>>({});
  const [localMilestones, setLocalMilestones] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedCheck = localStorage.getItem(L_STORAGE_KEY_CHECKLISTS);
      const storedMiles = localStorage.getItem(L_STORAGE_KEY_MILESTONES);
      if (storedCheck) setLocalChecklists(JSON.parse(storedCheck));
      if (storedMiles) setLocalMilestones(JSON.parse(storedMiles));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveChecklists = (newChecklists: Record<string, string[]>) => {
    setLocalChecklists(newChecklists);
    localStorage.setItem(L_STORAGE_KEY_CHECKLISTS, JSON.stringify(newChecklists));
  };

  const saveMilestones = (newMiles: string[]) => {
    setLocalMilestones(newMiles);
    localStorage.setItem(L_STORAGE_KEY_MILESTONES, JSON.stringify(newMiles));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const menuCategories = [
    {
      id: "overview" as MainTab,
      serial: "01",
      label: "Explore Overview",
      desc: lang === "en" ? "Review the most profitable freelance skills in 2026 and standard entry-level market rates." : "২০২৬ সালের সবচেয়ে লাভজনক ও ডিমান্ডিং ফ্রিল্যান্স স্কিল এবং এন্ট্রি-লেভেল রেটগুলো দেখে নিন।",
      icon: Compass,
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
    },
    {
      id: "careers" as MainTab,
      serial: "02",
      label: "Career Finder",
      desc: lang === "en" ? "Take a 4-question test to match your weekly schedule, preferred styling, levels, and timeline." : "মাত্র ৪টি সহজ প্রশ্নের উত্তর দিয়ে আপনার জন্য একদম পারফেক্ট ফ্রিল্যান্সিং ট্র্যাক খুঁজে বের করুন।",
      icon: Users,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    },
    {
      id: "roadmaps" as MainTab,
      serial: "03",
      label: "Skill Roadmaps",
      desc: lang === "en" ? "Step-by-step sequential curriculum, course roadmaps and high-quality free learning streams." : "আপনার নির্বাচিত স্কিলের জন্য প্রথম দিন থেকে ক্লায়েন্ট পাওয়ার আগ পর্যন্ত সম্পূর্ণ ধাপে ধাপে রোডম্যাপ।",
      icon: BookOpen,
      color: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400",
    },
    {
      id: "platforms" as MainTab,
      serial: "04",
      label: "Platform Guides",
      desc: lang === "en" ? "Fiverr, Upwork, Contra, and non-restrictive platforms comparative analysis and registration guides." : "ফাইভার, আপওয়ার্ক এবং কনট্রা সহ বিভিন্ন মার্কেটপ্লেসে একাউন্ট খোলা ও কাজের জন্য তৈরি হওয়ার নির্দেশিকা।",
      icon: Briefcase,
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
    },
    {
      id: "portfolio" as MainTab,
      serial: "05",
      label: "Portfolio Guide",
      desc: lang === "en" ? "No clients? Design simulated weekend project ideas to build an eye-catching creative portfolio." : "কোনো ক্লায়েন্ট নেই? চমৎকার পোর্টফোলিও তৈরি করতে রিয়েল-লাইফ প্রজেক্ট আইডিয়া ও নির্দেশিকা।",
      icon: Bookmark,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    },
    {
      id: "tools" as MainTab,
      serial: "06",
      label: "App Toolkit",
      desc: lang === "en" ? "Live Fiverr gig description generators, real-time hourly rates and retainer salary estimators." : "ফাইভার গিগ কাস্টমাইজার, রিয়েল-টাইম প্রস্তাব কভার লেটার জেনারেটর এবং আর্নিং ক্যালকুলেটর।",
      icon: Calculator,
      color: "from-teal-500/20 to-sky-500/10 border-teal-500/30 text-teal-400",
    },
    {
      id: "scams" as MainTab,
      serial: "07",
      label: "Scam Watcher",
      desc: lang === "en" ? "Flag malicious client conversations, WhatsApp redirects, and check suspicious transaction threat scores." : "গ্রাহকদের সন্দেহজনক প্রতারণা, অফ-প্ল্যাটফর্ম লিংক বা কোনো ভুয়া চাকরির পোস্ট স্ক্যানিং গাইড।",
      icon: ShieldAlert,
      color: "from-red-500/20 to-orange-500/10 border-red-500/30 text-red-400",
    },
    {
      id: "checklists" as MainTab,
      serial: "08",
      label: "Action Checklists",
      desc: lang === "en" ? "Track your complete roadmap milestones towards securing your direct first paying client." : "মাইলস্টোন চেকলিস্ট এবং আপনার ফার্স্ট ক্লায়েন্ট অর্জনের সম্পূর্ণ অ্যাকশন নির্দেশিকা।",
      icon: CheckSquare,
      color: "from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400",
    },
  ];

  // 1. --- CAREER FINDER WORKSPACE STATEMENT & STATE ---
  const [finderAnswers, setFinderAnswers] = useState({
    weeklyHours: "15",
    difficulty: "Any",
    timeframe: "Flexible",
    style: "Any"
  });

  const recommendedSkills = useMemo(() => {
    return freelancingData.skills.categories.map(skill => {
      let score = 100;
      
      // Match difficulty level
      if (finderAnswers.difficulty !== "Any") {
        if (finderAnswers.difficulty === "Beginner" && !skill.beginnerFriendly) {
          score -= 40;
        } else if (finderAnswers.difficulty === "Advanced" && skill.difficulty === "Beginner") {
          score -= 20;
        }
      }

      // Match timeframe expectation
      if (finderAnswers.timeframe === "Fast") {
        if (skill.timeToFirstClient.includes("6-12") || skill.timeToFirstClient.includes("8-12")) {
          score -= 30;
        }
      } else if (finderAnswers.timeframe === "Moderate") {
        if (skill.timeToFirstClient.includes("6-12") || skill.timeToFirstClient.includes("8-12")) {
          score -= 15;
        }
      }

      // Match user preference tags
      const titleLower = skill.name.toLowerCase();
      if (finderAnswers.style === "Creative") {
        if (titleLower.includes("graphic") || titleLower.includes("video") || titleLower.includes("copywriting") || titleLower.includes("design")) {
          score += 15;
        } else {
          score -= 15;
        }
      } else if (finderAnswers.style === "Tech/Admin") {
        if (titleLower.includes("virtual") || titleLower.includes("social") || titleLower.includes("seo") || titleLower.includes("data")) {
          score += 15;
        } else {
          score -= 15;
        }
      } else if (finderAnswers.style === "Programming") {
        if (titleLower.includes("web") || titleLower.includes("app") || titleLower.includes("ml") || titleLower.includes("cybersecurity")) {
          score += 15;
        } else {
          score -= 25;
        }
      }

      const clampedScore = Math.max(30, Math.min(100, score));
      return { ...skill, score: clampedScore };
    }).sort((a, b) => b.score - a.score);
  }, [finderAnswers]);


  // 2. --- SKILL ROADMAP CONTAINER STATE ---
  const [selectedRoadmapSkill, setSelectedRoadmapSkill] = useState<string>("Virtual Assistance");

  // 3. --- GIG GENERATOR ENGINE STATE ---
  const [gigConfig, setGigConfig] = useState({
    skillType: "Graphic Design",
    userName: "Fahim",
    nicheKeyword: "Minimalist Business Logo",
    basePrice: 25,
    customBenefit: "Fast 24-Hour Express Delivery with premium vector formats"
  });

  const generatedGig = useMemo(() => {
    const original = freelancingData.fiverrGigExamples.examples.find(ex => ex.skill === gigConfig.skillType) || freelancingData.fiverrGigExamples.examples[0];
    
    // Customize title & shortDescription
    const customizedTitle = `I will design a professional ${gigConfig.nicheKeyword} for your creative business`;
    const customizedDesc = `Hi! I'm ${gigConfig.userName}. ${original.shortDescription.replace("modern minimalist logo", gigConfig.nicheKeyword)}. ${gigConfig.customBenefit}. We specialize in high quality aesthetic delivery.`;

    const customizedPackages = original.packages.map((pkg, idx) => {
      let label = pkg.tier;
      let calculatedPrice = gigConfig.basePrice;
      if (idx === 1) calculatedPrice = Math.round(gigConfig.basePrice * 2.4);
      if (idx === 2) calculatedPrice = Math.round(gigConfig.basePrice * 4.8);

      return {
        tier: label,
        price: `$${calculatedPrice}`,
        deliverables: pkg.deliverables.replace("logo", gigConfig.nicheKeyword)
      };
    });

    return {
      title: customizedTitle,
      description: customizedDesc,
      packages: customizedPackages
    };
  }, [gigConfig]);


  // 4. --- PROPOSAL TEMPLATE WRITER TOOL STATE ---
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [proposalInputs, setProposalInputs] = useState({
    clientName: "John",
    myName: "Fahim Montasir Siam",
    specificNeed: "building a secure business portfolio app with custom branding",
    relevantResult: "rebuilt a local gym's mobile interface, increasing inquiries by 40%",
    step1: "Audit your current application frameworks for user experience security roadblocks",
    step2: "Build clean, fully secure responsive screens using premium customized color palettes",
    step3: "Deploy onto high speed hosting pipelines & optimize image loading for 50%+ faster speeds",
    timeframe: "this upcoming weekend",
    discountPercent: "25%"
  });

  const processedProposalText = useMemo(() => {
    const orig = freelancingData.proposalTemplates.templates[selectedTemplateIndex]?.template || "";
    return orig
      .replace(/\[Client Name\]/g, proposalInputs.clientName || "[Client Name]")
      .replace(/\[Name\]/g, proposalInputs.clientName || "[Client Name]")
      .replace(/\[specific need from their job post\]/g, proposalInputs.specificNeed || "[Specific need]")
      .replace(/\[project\]/g, proposalInputs.specificNeed || "[Project scope]")
      .replace(/\[one-sentence relevant result or example\]/g, proposalInputs.relevantResult || "[Relevant experience]")
      .replace(/\[one relevant result\]/g, proposalInputs.relevantResult || "[Result indicator]")
      .replace(/\[Step one of your plan\]/g, proposalInputs.step1 || "[Step 1 outline]")
      .replace(/\[Step two of your plan\]/g, proposalInputs.step2 || "[Step 2 outline]")
      .replace(/\[Step three of your plan\]/g, proposalInputs.step3 || "[Step 3 outline]")
      .replace(/\[timeframe\]/g, proposalInputs.timeframe || "[Timeframe target]")
      .replace(/\[Your name\]/g, proposalInputs.myName || "[Your name]")
      .replace(/\[discounted rate\]/g, `${proposalInputs.discountPercent} discounted launch special` || "[Discount detail]")
      .replace(/\[specific observation, e.g., 'your homepage doesn't clearly explain your pricing'\]/g, `your layout doesn't cleanly communicate your unique value proposition on mobile viewports`)
      .replace(/\[Business Name\]/g, "your creative digital brand")
      .replace(/\[your skill\]/g, "expert digital development & visual interface design")
      .replace(/\[Portfolio link\]/g, "https://fahimmsiam.com/portfolio");
  }, [selectedTemplateIndex, proposalInputs]);


  // 5. --- SCAM RED FLAG DETECTOR STATE ---
  const [checkedScamFlags, setCheckedScamFlags] = useState<string[]>([]);
  const toggleScamFlag = (flagtext: string) => {
    setCheckedScamFlags(prev =>
      prev.includes(flagtext) ? prev.filter(f => f !== flagtext) : [...prev, flagtext]
    );
  };
  
  const scamRiskRating = useMemo(() => {
    const count = checkedScamFlags.length;
    if (count === 0) return { score: 0, rating: "Safe", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", progress: "w-0 bg-emerald-500", desc: "No red flags reported! Always maintain normal safety procedures." };
    if (count <= 2) return { score: count, rating: "Low Threat Level", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", progress: "w-[25%] bg-yellow-500", desc: "Slight suspicious signs detected. Proceed with client verification and read reviews carefully before proceeding." };
    if (count <= 4) return { score: count, rating: "Medium Risk Danger", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", progress: "w-[55%] bg-orange-500", desc: "High alert! Several classic scam patterns verified. DO NOT share direct email, WhatsApp, bank credentials or perform work off-platform." };
    return { score: count, rating: "EXTREME MALICIOUS Danger", color: "text-red-500 animate-pulse", bg: "bg-red-500/10 border-red-500/30", progress: "w-[100%] bg-red-600 animate-pulse", desc: "WARNING: High probability of financial scam! Stop communication immediately and do not pay any upfront setup or equipment fees." };
  }, [checkedScamFlags]);


  // 6. --- EARNINGS CALCULATOR LIVE STATE ---
  const [calcHourlyTarget, setCalcHourlyTarget] = useState(50000); // Target annual
  const [calcHourlyWeeks, setCalcHourlyWeeks] = useState(48); // active working weeks
  const [calcHourlyHours, setCalcHourlyHours] = useState(20); // billable hours weekly
  const [calcHourlyFees, setCalcHourlyFees] = useState(20); // platform fee (e.g. 20%)

  const estimatedHourlyOutput = useMemo(() => {
    const totalWorkingHours = calcHourlyWeeks * calcHourlyHours;
    if (totalWorkingHours <= 0) return { gross: 0, netRequired: 0 };
    const baseHourly = Math.round(calcHourlyTarget / totalWorkingHours);
    const platformMultiplier = 1 / (1 - calcHourlyFees / 100);
    const grossHourly = Math.round(baseHourly * platformMultiplier);
    return { gross: grossHourly, net: baseHourly, totalHours: totalWorkingHours };
  }, [calcHourlyTarget, calcHourlyWeeks, calcHourlyHours, calcHourlyFees]);

  const [calcRetainerClients, setCalcRetainerClients] = useState(3);
  const [calcRetainerMonthly, setCalcRetainerMonthly] = useState(500); // flat monthly retainer

  const estimatedRetainerOutput = useMemo(() => {
    const grossMonthly = calcRetainerClients * calcRetainerMonthly;
    const netMonthly = grossMonthly * (1 - calcHourlyFees / 100);
    return {
      grossMonthly,
      netMonthly,
      grossAnnual: grossMonthly * 12,
      netAnnual: netMonthly * 12
    };
  }, [calcRetainerClients, calcRetainerMonthly, calcHourlyFees]);

  const [openFaqKeys, setOpenFaqKeys] = useState<Record<string, boolean>>({});


  // General Search Filtering across Skills / Guides / Resources
  const filteredSkills = useMemo(() => {
    if (!searchQuery) return freelancingData.skills.categories;
    const query = searchQuery.toLowerCase();
    return freelancingData.skills.categories.filter(s => 
      s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredResources = useMemo(() => {
    const allRes = freelancingData.freeLearningResources.bySkill;
    if (!searchQuery) return allRes;
    const query = searchQuery.toLowerCase();
    return allRes.filter(r => 
      r.skill.toLowerCase().includes(query) || 
      r.resources.some(item => item.name.toLowerCase().includes(query) || item.type.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return freelancingData.faqs.items;
    const query = searchQuery.toLowerCase();
    return freelancingData.faqs.items.filter(f => 
      f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  if (activeTab === "menu") {
    return (
      <div className="h-full w-full bg-[#030303] text-white flex flex-col font-sans overflow-hidden relative">
        {/* Absolute futuristic ambient grid matching our portfolio's luxury aesthetic */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[5%] left-[25%] w-[450px] h-[450px] bg-purple-600/[0.04] rounded-full blur-[140px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />
        </div>

        {/* Styled Premium Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-[120] w-full border-b border-white/[0.05] backdrop-blur-xl bg-black/40 px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between shrink-0"
        >
          <div className="max-w-4xl w-full mx-auto flex items-center justify-between col-span-12">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[#a3e635]" />
              <span>{trans("Back to Dashboard")}</span>
            </button>

            <div className="flex items-center gap-4">
              {/* Premium Language Translation Switcher */}
              <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl">
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all select-none cursor-pointer ${lang === "en" ? "bg-purple-600 text-white shadow-md border border-purple-500/10" : "text-white/40 hover:text-white"}`}
                >
                  ENGLISH
                </button>
                <button
                  onClick={() => setLang("bn")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all select-none cursor-pointer ${lang === "bn" ? "bg-purple-600 text-white shadow-md border border-purple-500/10" : "text-white/40 hover:text-white"}`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Inner page scrollable area */}
        <div className="flex-grow overflow-y-auto no-scrollbar pb-24 relative z-10">
          {/* Clean minimalist header text */}
          <div className="relative w-full max-w-2xl mx-auto px-4 pt-6 text-center">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5 uppercase font-display">
              {trans("Beginner Freelancer")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a3e635] to-emerald-400">{trans("Ultimate Workstation")}</span>
            </h1>
            <p className="text-white/40 text-xs tracking-wider max-w-md mx-auto leading-relaxed">
              {lang === "en" ? "Select a workstation module step-by-step to start your path" : "শুরু করতে নিচের যেকোনো একটি মডিউল সিলেক্ট করুন"}
            </p>
          </div>

          {/* Serialized Navigation categories */}
          <div className="relative z-10 w-full max-w-2xl mx-auto px-4 mt-8 flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] font-mono text-center mb-1">
              {lang === "en" ? "CHOOSE A WORKSTATION MODULE TO LAUNCH" : "শুরু করতে যেকোনো একটি ওয়ার্কস্টেশন মডিউল সিলেক্ট করুন"}
            </p>

            <div className="grid grid-cols-1 gap-3.5">
              {menuCategories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    id={`cat-card-${cat.id}`}
                    onClick={() => handleCategoryClick(cat.id)}
                    disabled={isLoadingCat}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full text-left p-4 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900/85 border border-white/[0.05] hover:border-purple-500/35 transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-xl relative overflow-hidden"
                  >
                    <div className={`flex items-center gap-4 transition-opacity ${isLoadingCat && loadingCatId === cat.id ? 'opacity-0' : 'opacity-100'}`}>
                      {/* Unique serial bullet with border */}
                      <span className="font-mono text-[11px] font-bold text-white/40 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-lg">
                        {cat.serial}
                      </span>

                      {/* Left icon wrapper */}
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${cat.color} border shrink-0`}>
                        <IconComponent className="w-5 h-5 text-purple-400" />
                      </div>

                      {/* Title & brief explanation list */}
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-white group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                          {trans(cat.label)}
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed mt-0.5 max-w-md">
                          {cat.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right chevron indicator */}
                    <div className={`shrink-0 w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/30 group-hover:text-white group-hover:bg-purple-600/30 group-hover:border-purple-500/40 transition-all ${isLoadingCat && loadingCatId === cat.id ? 'opacity-0' : 'opacity-100'}`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>

                    {/* Loading State Overlay */}
                    {isLoadingCat && loadingCatId === cat.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-purple-900/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                          <span className="text-xs font-bold text-purple-300 tracking-widest uppercase animate-pulse">{trans("Loading")}...</span>
                        </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#030303] text-white flex flex-col font-sans overflow-hidden relative">
      {/* Absolute futuristic ambient grid matching our portfolio's luxury aesthetic */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[25%] w-[450px] h-[450px] bg-purple-600/[0.04] rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />
      </div>

      {/* Styled Premium Header Section */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-[120] w-full border-b border-white/[0.05] backdrop-blur-xl bg-black/40 px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between shrink-0"
      >
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <button 
            onClick={() => {
              setActiveTab("menu");
              setSearchQuery("");
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#a3e635]" />
            <span>{trans("Back to Categories")}</span>
          </button>

          <div className="flex items-center gap-4">
            {/* Premium Language Translation Switcher */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all select-none cursor-pointer ${lang === "en" ? "bg-purple-600 text-white shadow-md border border-purple-500/10" : "text-white/40 hover:text-white"}`}
              >
                ENGLISH
              </button>
              <button
                onClick={() => setLang("bn")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all select-none cursor-pointer ${lang === "bn" ? "bg-purple-600 text-white shadow-md border border-purple-500/10" : "text-white/40 hover:text-white"}`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Horizontal Category Carousel Menu */}
      <div className="md:hidden w-full overflow-x-auto no-scrollbar shrink-0 px-4 py-2.5 flex items-center gap-1.5 border-b border-white/[0.04] bg-neutral-900/10 z-20">
        {menuCategories.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setSearchQuery("");
              }}
              className={`flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-black tracking-tight transition-all border ${
                isActive 
                  ? "bg-purple-600 border-purple-500/30 text-white shadow-md shadow-purple-500/10" 
                  : "bg-white/[0.02] border-white/5 text-white/50 hover:text-white"
              }`}
            >
              <IconComponent className="w-3.5 h-3.5 text-purple-400" />
              <span>{trans(cat.label)}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Container Wrapper */}
      <div className="flex-grow overflow-y-auto no-scrollbar w-full relative z-10 pb-24">
        {/* Main SaaS Dashboard Container */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Desktop Sticky Sidebar Navigation Menu */}
          <aside className="hidden md:flex md:col-span-3 sticky top-4 z-10 flex-col gap-2.5">
          <div className="bg-neutral-900/40 border border-white/[0.04] p-3 rounded-2xl backdrop-blur-xl flex flex-col gap-1 w-full">
            <p className="text-[9px] font-black uppercase text-white/30 px-3 py-1 text-left tracking-widest font-mono">{trans("CONTROL CONSOLE")}</p>
            
            <button
              onClick={() => { setActiveTab("overview"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "overview" ? "bg-purple-600 text-white font-black shadow-md shadow-purple-500/15 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}
            >
              <Compass className="w-4 h-4" />
              <span>{trans("Explore Overview")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("careers"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "careers" ? "bg-purple-600 text-white font-black shadow-md shadow-purple-500/15 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}
            >
              <Users className="w-4 h-4" />
              <span>{trans("Career Finder")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("roadmaps"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "roadmaps" ? "bg-purple-600 text-white font-black shadow-md shadow-purple-500/15 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{trans("Skill Roadmaps")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("platforms"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "platforms" ? "bg-purple-600 text-white font-black shadow-md shadow-purple-500/15 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{trans("Platform Guides")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("portfolio"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "portfolio" ? "bg-purple-600 text-white font-black shadow-md shadow-purple-500/15 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{trans("Portfolio Guide")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("tools"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "tools" ? "bg-purple-600 text-white font-black shadow-md shadow-purple-500/15 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}
            >
              <Calculator className="w-4 h-4" />
              <span>{trans("App Toolkit")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("scams"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "scams" ? "bg-purple-600 text-white font-black shadow-md shadow-purple-500/15 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{trans("Scam Watcher")}</span>
            </button>

            <button
              onClick={() => { setActiveTab("checklists"); setSearchQuery(""); }}
              className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === "checklists" ? "bg-purple-600 text-white font-black shadow-md shadow-purple-500/15 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>{trans("Action Checklists")}</span>
            </button>
          </div>

          {/* Master Progress Indicator Widget */}
          <div className="bg-neutral-900/40 border border-white/[0.04] p-4 rounded-2xl backdrop-blur-xl flex flex-col gap-2 w-full text-left">
            <h3 className="text-xs font-black text-white flex items-center gap-1">
              <Trophy className="w-4 h-4 text-[#a3e635]" />
              <span>{trans("Milestones Progress")}</span>
            </h3>
            <p className="text-[10px] text-white/50 leading-relaxed">
              {lang === "en" ? "Track your complete roadmap milestones towards securing your direct first paying client." : "আপনাদের ফার্স্ট ক্লায়েন্ট অর্জনের সম্পূর্ণ মাইলস্টোন প্রোগ্রেস ওয়র্ড।"}
            </p>
            <div className="mt-1 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{trans("Achieved")}:</span>
              <span className="text-[#a3e635] font-bold">{localMilestones.length} / {freelancingData.successMilestones.milestones.length}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-[#a3e635] transition-all duration-300" 
                style={{ width: `${Math.round((localMilestones.length / freelancingData.successMilestones.milestones.length) * 100)}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Content Area - Right Aspect */}
        <main className="md:col-span-9 flex flex-col gap-6 w-full overflow-hidden">
          
          {/* Main search input bar */}
          <div className="relative w-full z-10 flex">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={trans("Search skills, timelines, roadmaps, Fiverr packages or FAQs...")}
              className="w-full bg-neutral-900/50 border border-white/[0.04] pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/40 transition-all font-medium backdrop-blur-md"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 hover:text-white text-xs select-none cursor-pointer"
              >
                {trans("Clear")}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div
                key="overview-panels"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="flex flex-col gap-6"
              >
                {/* 2026 Most Profitable Skills List */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                        {trans("Most profitable skills")}
                      </h2>
                      <p className="text-xs text-white/50 leading-relaxed mt-1">
                        {trans("Not sure where to start? Answer 4 quick questions to find your high-probability match.")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredSkills.map(skill => (
                      <div 
                        key={skill.id}
                        className="group relative p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all text-left flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-display font-black text-sm text-white group-hover:text-purple-400 transition-colors">
                              {trans(skill.name)}
                            </span>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${skill.beginnerFriendly ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"}`}>
                              {skill.beginnerFriendly ? trans("Beginner friendly") : trans("Intermediate+")}
                            </span>
                          </div>
                          <p className="text-white/60 text-xs leading-relaxed mb-3">
                            {trans(skill.description)}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/[0.03] grid grid-cols-3 gap-1 text-[10px] font-mono text-white/40">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">{trans("AVG. RATE")}</span>
                            <span className="text-[#a3e635] font-bold">{skill.avgRateRange}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">{trans("First Client")}</span>
                            <span className="text-teal-400 font-bold">{trans(skill.timeToFirstClient)}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-slate-500">{trans("Difficulty")}</span>
                            <span className="text-purple-400 font-bold">{trans(skill.difficulty)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TIMELINES & DIFFICULTY GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skill Difficulty Levels Exploder */}
                  <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left flex flex-col gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                        {trans("Difficulty Levels Explained")}
                      </h2>
                      <p className="text-xs text-white/50 mt-1">
                        {lang === "en" ? "realistic learning curve and tools required." : "বাস্তবসম্মত লার্নিং কার্ভ এবং প্রয়োজনীয় টুলস।"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {freelancingData.difficultyLevels.levels.map(level => (
                        <div key={level.level} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm shrink-0">{level.icon}</span>
                            <span className="font-bold text-xs text-white">{trans(level.level)}</span>
                          </div>
                          <p className="text-[11px] text-white/60 leading-normal mb-2">
                            {lang === "en" ? level.description : (EN_TO_BN[level.description] || level.description)}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {level.examples.map(ex => (
                              <span key={ex} className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning timelines */}
                  <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left flex flex-col gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                        Realistic timelines to Competency
                      </h2>
                      <p className="text-xs text-white/50 mt-1">
                        Based on 10-15 focused hours study per week.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2.5 max-h-[440px] overflow-y-auto pr-1 no-scrollbar">
                      {freelancingData.learningTimelines.timelines.map(time => (
                        <div key={time.skill} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.01] border border-white/5 gap-2 hover:bg-white/[0.02]">
                          <span className="text-xs font-bold text-white shrink-0">{time.skill}</span>
                          <div className="flex items-center gap-1 sm:gap-2.5 text-[10px] font-mono text-slate-300">
                            <div className="text-right">
                              <span className="block text-[8px] uppercase tracking-wider text-slate-500">To Competence</span>
                              <span className="text-blue-400 font-bold">{time.timeToBasicCompetency}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-[8px] uppercase tracking-wider text-slate-500">To 1st client</span>
                              <span className="text-[#a3e635] font-bold">{time.timeToFirstClient}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FAQ INTERACTIVE ACCORDION AREA */}
                <div id="quick-faqs" className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-purple-400" />
                    <span>Frequently Asked Questions</span>
                  </h2>

                  <div className="flex flex-col gap-3">
                    {filteredFaqs.map((faq, index) => {
                      const isOpen = openFaqKeys[faq.question] ?? (index === 0);
                      return (
                        <div key={faq.question} className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                          <button
                            onClick={() => {
                              setOpenFaqKeys(prev => ({
                                ...prev,
                                [faq.question]: !isOpen
                              }));
                            }}
                            className="w-full text-left flex items-center justify-between py-2 text-xs sm:text-sm font-bold text-slate-100 hover:text-purple-400 transition-colors"
                          >
                            <span>{faq.question}</span>
                            <span className="text-purple-400">{isOpen ? "−" : "+"}</span>
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <p className="text-xs text-white/65 leading-relaxed pt-1 pb-2">
                                  {faq.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* CAREER FINDER TAB */}
            {activeTab === "careers" && (
              <motion.div
                key="careers-finder"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-emerald-400" />
                    <span>{trans("Career Recommender")}</span>
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed mb-6">
                    আপনার সাপ্তাহিক সময়, বর্তমান সামর্থ্য এবং ক্যাটাগরি ইন্টারেস্ট অনুযায়ী পারফেক্ট ক্যারিয়ার ম্যাচ বের করুন!
                  </p>

                  {/* Questionnaire grid parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                        How many hours weekly can you practice?
                      </label>
                      <select 
                        value={finderAnswers.weeklyHours}
                        onChange={(e) => setFinderAnswers({...finderAnswers, weeklyHours: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="10">10 Hours (Part-time / Slow track)</option>
                        <option value="15">15 Hours (Standard study)</option>
                        <option value="25">25+ Hours (Aggressive study / Fast track)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                        What difficulty are you comfortable with?
                      </label>
                      <select 
                        value={finderAnswers.difficulty}
                        onChange={(e) => setFinderAnswers({...finderAnswers, difficulty: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Any">Any level (Show all opportunities)</option>
                        <option value="Beginner">Beginner (Fast startup, No prior background)</option>
                        <option value="Advanced">Advanced (High return value, Long-term commitment)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                        Time limit to land your 1st paying client?
                      </label>
                      <select 
                        value={finderAnswers.timeframe}
                        onChange={(e) => setFinderAnswers({...finderAnswers, timeframe: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Flexible">I have plenty of time (3-12 months)</option>
                        <option value="Moderate">Moderate requirement (1-3 months)</option>
                        <option value="Fast">Very Urgent (Under 1 month pathway)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                        What is your primary visual/functional style?
                      </label>
                      <select 
                        value={finderAnswers.style}
                        onChange={(e) => setFinderAnswers({...finderAnswers, style: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Any">Any Style / Balanced</option>
                        <option value="Creative">Creative (Graphic Design, Layout, Editing, Copy)</option>
                        <option value="Tech/Admin">Technical Admin (Virtual assist, Managing, SEO)</option>
                        <option value="Programming">Programming (Development, DB, Custom automation)</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.04] pt-5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#a3e635] text-left mb-4">
                      TOP RECOMMENDED SKILLS TO START IN 2026
                    </h3>

                    <div className="flex flex-col gap-3">
                      {recommendedSkills.map((skill, idx) => (
                        <div 
                          key={skill.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all text-left gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center font-bold font-mono text-sm border border-purple-500/25">
                              #{idx + 1}
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-white">{skill.name}</h4>
                              <p className="text-white/50 text-xs leading-relaxed max-w-lg">{skill.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-300">
                                  difficulty: {skill.difficulty}
                                </span>
                                <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-300">
                                  est. timeline: {skill.timeToFirstClient}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 justify-between">
                            <div className="text-right">
                              <span className="block text-[8px] uppercase tracking-wider text-slate-500">Demand level</span>
                              <span className="text-teal-400 font-black text-xs font-mono">{skill.demandLevel}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="block text-[8px] uppercase tracking-wider text-slate-500">Recommendation</span>
                              <span className="text-[#a3e635] font-black text-sm">{skill.score}% MATCH</span>
                            </div>
                            <button
                              onClick={() => {
                                const matched = freelancingData.learningRoadmaps.roadmaps.some(r => r.skill === skill.name);
                                if (matched) {
                                  setSelectedRoadmapSkill(skill.name);
                                  setActiveTab("roadmaps");
                                } else {
                                  setSelectedRoadmapSkill("Virtual Assistance");
                                  setActiveTab("roadmaps");
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold select-none cursor-pointer"
                            >
                              Open Roadmap
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* LEARNING & ROADMAPS TAB */}
            {activeTab === "roadmaps" && (
              <motion.div
                key="roadmaps"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="flex flex-col gap-6"
              >
                {/* Visual Step-by-Step interactive roadmap timeline */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        <span>Complete Step-by-Step Roadmap</span>
                      </h2>
                      <p className="text-xs text-white/50">
                        Choose your primary path to load concrete phases and learning targets.
                      </p>
                    </div>

                    {/* Skill select dropdown */}
                    <div className="shrink-0">
                      <select
                        value={selectedRoadmapSkill}
                        onChange={(e) => setSelectedRoadmapSkill(e.target.value)}
                        className="bg-black border border-white/15 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                      >
                        {freelancingData.learningRoadmaps.roadmaps.map(r => (
                          <option key={r.skill} value={r.skill}>{r.skill}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Render loaded roadmap */}
                  {(() => {
                    const roadmap = freelancingData.learningRoadmaps.roadmaps.find(r => r.skill === selectedRoadmapSkill);
                    if (!roadmap) return <p className="text-xs text-slate-400 text-center">No roadmap available.</p>;

                    return (
                      <div className="flex flex-col gap-6">
                        <div className="p-4 rounded-xl bg-purple-600/[0.05] border border-purple-500/10 flex items-center justify-between text-xs font-bold text-purple-300">
                          <span>Timeline expectation: {roadmap.totalDuration}</span>
                          <span className="text-[#a3e635]">Target: First Client Milestone</span>
                        </div>

                        {/* Staggered Timeline elements */}
                        <div className="flex flex-col gap-6 relative pl-4 border-l border-white/10 ml-2 py-2">
                          {roadmap.phases.map((phase, pIdx) => (
                            <div key={phase.phase} className="relative group text-left">
                              {/* Left dot representation */}
                              <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-black group-hover:bg-[#a3e635] transition-colors" />

                              <h3 className="text-sm font-black text-white mb-2 group-hover:text-purple-400 transition-colors">
                                {phase.phase}
                              </h3>
                              
                              <div className="flex flex-col gap-2">
                                {phase.goals.map((goal, gIdx) => {
                                  const storageKeyGoal = `${selectedRoadmapSkill}_p${pIdx}_g${gIdx}`;
                                  const isCheckedGoal = localChecklists[selectedRoadmapSkill]?.includes(storageKeyGoal) || false;
                                  
                                  const toggleGoal = () => {
                                    const currentList = localChecklists[selectedRoadmapSkill] || [];
                                    let newList;
                                    if (isCheckedGoal) {
                                      newList = currentList.filter(item => item !== storageKeyGoal);
                                    } else {
                                      newList = [...currentList, storageKeyGoal];
                                    }
                                    const updated = { ...localChecklists, [selectedRoadmapSkill]: newList };
                                    saveChecklists(updated);
                                  };

                                  return (
                                    <button 
                                      key={goal}
                                      onClick={toggleGoal}
                                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#111] hover:bg-neutral-900 border border-white/5 text-left transition-all w-full cursor-pointer"
                                    >
                                      <div className="shrink-0 mt-0.5">
                                        {isCheckedGoal ? (
                                          <CheckCircle2 className="w-4.5 h-4.5 text-[#a3e635]" />
                                        ) : (
                                          <div className="w-4.5 h-4.5 rounded bg-white/5 border border-white/20 hover:border-purple-400" />
                                        )}
                                      </div>
                                      <span className={`text-xs font-semibold ${isCheckedGoal ? "text-white/40 line-through" : "text-white/80"}`}>
                                        {goal}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Free Resource hubs dynamic panel */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white mb-2">
                    Free Professional Resources Database
                  </h2>
                  <p className="text-xs text-white/50 mb-6 font-medium">
                    {freelancingData.freeLearningResources.intro}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredResources.map(skillGroup => (
                      <div key={skillGroup.skill} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-3">
                        <div className="flex items-center gap-1.5 pb-2 border-b border-white/[0.04]">
                          <Play className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-extrabold text-xs text-slate-100">{skillGroup.skill}</span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {skillGroup.resources.map(res => (
                            <a
                              key={res.name}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2 rounded-lg bg-black/40 hover:bg-[#111] border border-white/5 hover:border-purple-500/20 text-xs transition-colors"
                            >
                              <div className="text-left">
                                <span className="font-bold text-white block truncate max-w-[180px]">{res.name}</span>
                                <span className="text-[9px] font-mono text-slate-400 uppercase">{res.type}</span>
                              </div>
                              <span className="text-purple-400 font-mono text-[9px] font-black uppercase flex items-center gap-0.5 shrink-0">
                                <span>Free Docs</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* YouTube Channels & Best Websites selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* YouTube list */}
                  <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                    <h3 className="font-black text-base text-white mb-4">Highly Recommended YouTube Channels</h3>
                    <div className="flex flex-col gap-3">
                      {freelancingData.youtubeChannels.bySkill.map(skillChan => (
                        <div key={skillChan.skill} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5">
                          <span className="text-[9px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full select-none block w-fit mb-2">
                            {skillChan.skill}
                          </span>
                          <div className="flex flex-col gap-2">
                            {skillChan.channels.map(chan => (
                              <div key={chan.name} className="p-2 bg-black/40 rounded-xl relative text-left">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white">{chan.name}</span>
                                  <span className="text-[10px] text-[#a3e635] font-semibold">{chan.host}</span>
                                </div>
                                <p className="text-[10px] text-white/50 leading-relaxed mt-1">
                                  {chan.focus}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best websites lists */}
                  <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                    <h3 className="font-black text-base text-white mb-4">Best Recommended Web Resource Engines</h3>
                    <div className="flex flex-col gap-2.5">
                      {freelancingData.bestLearningWebsites.websites.map(web => (
                        <a
                          key={web.name}
                          href={web.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-[#a3e635]/25 transition-all text-left"
                        >
                          <div>
                            <span className="font-bold text-xs text-white block">{web.name}</span>
                            <span className="text-[10px] text-white/45 block max-w-sm">{web.bestFor}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                            <span className={`font-mono font-black ${web.free ? "text-emerald-400" : "text-yellow-400"}`}>
                              {web.free ? "FREE" : "PAID"}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FREELANCE PLATFORMS TAB */}
            {activeTab === "platforms" && (
              <motion.div
                key="platforms"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="flex flex-col gap-6"
              >
                {/* Core digital marketplaces breakdown */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2">
                    {freelancingData.platformGuides.sectionTitle}
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed mb-6">
                    {freelancingData.platformGuides.intro}
                  </p>

                  <div className="flex flex-col gap-6">
                    {freelancingData.platformGuides.platforms.map(plat => (
                      <div 
                        key={plat.id}
                        className="p-5 sm:p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-4 text-left"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.03]">
                          <div>
                            <h3 className="text-lg font-black text-white">{plat.name}</h3>
                            <p className="text-xs text-white/50 font-mono mt-0.5">difficulty level: {plat.difficultyLevel}</p>
                          </div>

                          {/* Direct redirect buttons as requested! */}
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={plat.officialWebsite}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 select-none hover:shadow-lg transition-all"
                            >
                              <span>Open {plat.name}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href={plat.directSignupUrl}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              className="px-3.5 py-1.5 rounded-xl bg-[#a3e635] hover:bg-[#bbf7d0] text-black text-[11px] font-extrabold flex items-center gap-1.5 select-none hover:shadow-lg transition-all"
                            >
                              <span>Register / Sign up</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Best For block */}
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">BEST SUITED FOR</span>
                          <p className="text-xs text-slate-200 leading-relaxed">{plat.bestFor}</p>
                        </div>

                        {/* Approval workflow */}
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-1">APPROVAL PROCESS STATEMENT</span>
                          <p className="text-xs text-white/60 leading-relaxed">{plat.approvalProcess}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Pros & Cons */}
                          <div className="p-3 bg-black/40 rounded-xl">
                            <span className="block text-[9px] uppercase tracking-wider text-emerald-400 font-bold mb-1.5">PROS</span>
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-white/70">
                              {plat.pros.map(p => <li key={p}>{p}</li>)}
                            </ul>
                          </div>

                          <div className="p-3 bg-black/40 rounded-xl">
                            <span className="block text-[9px] uppercase tracking-wider text-red-400 font-bold mb-1.5">CONS</span>
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-white/70">
                              {plat.cons.map(c => <li key={c}>{c}</li>)}
                            </ul>
                          </div>
                        </div>

                        {/* Commission fees structure */}
                        <div className="p-3 bg-purple-900/[0.05] border border-purple-500/10 rounded-xl text-[11px]">
                          <span className="block text-[8px] uppercase tracking-wider text-purple-400 font-bold mb-2">FEE STRUCTURE INSIGHTS</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-sans">
                            <div>
                              <span className="text-slate-400 block font-bold">Commission fee:</span>
                              <span className="text-white">{plat.feeStructure.sellerCommission}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">Payout clear delay:</span>
                              <span className="text-white">{"payoutDelay" in plat.feeStructure ? (plat.feeStructure.payoutDelay as string) : "Immediate withdrawal via Stripe / ACH payment pipelines"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">Extra withdrawal costs:</span>
                              <span className="text-white">{plat.feeStructure.withdrawalFees}</span>
                            </div>
                          </div>
                        </div>

                        {/* Beginner tips */}
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold mb-2">BEGINNER CHEAT-SHEETS TIPS</span>
                          <div className="flex flex-col gap-2">
                            {plat.beginnerTips.map((tip, index) => (
                              <div key={index} className="flex gap-2 text-xs">
                                <span className="text-purple-400 font-bold font-mono">0{index + 1}.</span>
                                <span className="text-white/75">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Remote Job Websites */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h3 className="font-black text-base text-white mb-1">Alternative Remote Job Directory Websites</h3>
                  <p className="text-xs text-white/50 mb-4">Beyond the traditional freelance marketplaces, configure your profiles here for high-value contract scopes!</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {freelancingData.remoteJobWebsites.websites.map(web => (
                      <a
                        key={web.name}
                        href={web.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition-all"
                      >
                        <div>
                          <span className="font-extrabold text-xs text-white block">{web.name}</span>
                          <span className="text-[10px] text-white/40 block max-w-xs">{web.bestFor}</span>
                        </div>

                        <div className="text-right flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2 py-0.5 rounded-full uppercase">
                            {web.cost}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PORTFOLIO BUILDER TAB */}
            {activeTab === "portfolio" && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="flex flex-col gap-6"
              >
                {/* Portfolio Building Roadmap Steps */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2">
                    {freelancingData.portfolioRoadmap.sectionTitle}
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed mb-6">
                    {freelancingData.portfolioRoadmap.intro}
                  </p>

                  <div className="flex flex-col gap-4">
                    {freelancingData.portfolioRoadmap.steps.map(step => (
                      <div key={step.step} className="flex gap-4 p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-purple-500/20 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-300 flex items-center justify-center font-bold text-sm shrink-0 font-mono">
                          0{step.step}
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-xs sm:text-sm text-white mb-1">{step.title}</h4>
                          <p className="text-white/60 text-xs leading-relaxed">{step.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekend Project Ideas Organizer */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white mb-2">
                    Weekend Spec Project Ideas (By Skill)
                  </h2>
                  <p className="text-xs text-white/50 mb-6 font-medium">
                    আপনি যদি সম্পূর্ণ নতুন হন—তবে নিচের যেকোন একটি প্রোজেক্ট প্র্যাকটিস করে আজই পোর্টফোলিওতে সেট করতে পারেন।
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {freelancingData.beginnerProjectIdeas.bySkill.map(skillGroup => (
                      <div key={skillGroup.skill} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-3">
                        <span className="font-extrabold text-xs text-[#a3e635] pb-2 border-b border-white/[0.04] block text-left">
                          {skillGroup.skill}
                        </span>

                        <div className="flex flex-col gap-2">
                          {skillGroup.ideas.map((idea, idx) => (
                            <div key={idea} className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex items-start gap-2 text-xs">
                              <span className="text-purple-400 font-bold font-mono">0{idx + 1}.</span>
                              <span className="text-white/80 select-text leading-relaxed">{idea}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* APPS & INTERACTIVE TOOLKIT TAB */}
            {activeTab === "tools" && (
              <motion.div
                key="interactive-toolkit"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="flex flex-col gap-6 font-sans"
              >
                {/* EARNINGS CALCULATOR LIVE INTERACTIVE PANEL */}
                <div className="bg-neutral-900/40 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-1 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-teal-400" />
                    <span>Beginner's Income & Retainer Estimator</span>
                  </h2>
                  <p className="text-xs text-white/50 mb-6">
                    নিচের স্লাইডারগুলো ড্র্যাগ করে আপনার প্রজেক্ট রেট, প্ল্যাটফর্ম ট্যাক্স এবং চূড়ান্ত বাৎসরিক মুনাফা পরিমাপ করুন।
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/[0.04]">
                    {/* Hourly calculation panel */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xs font-black uppercase text-[#a3e635] tracking-widest flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Hourly Rates Estimator</span>
                      </h3>

                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1">
                          <span>Target Net Income (Annual):</span>
                          <span className="text-white">${calcHourlyTarget.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min={15000} 
                          max={150000} 
                          step={5000}
                          value={calcHourlyTarget}
                          onChange={(e) => setCalcHourlyTarget(Number(e.target.value))}
                          className="w-full accent-purple-500 h-1 bg-white/10 rounded-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold mb-1">Worked weeks/Yr:</span>
                          <input 
                            type="number"
                            min={20}
                            max={52}
                            value={calcHourlyWeeks}
                            onChange={(e) => setCalcHourlyWeeks(Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold mb-1">Billable Hours/Wk:</span>
                          <input 
                            type="number"
                            min={5}
                            max={60}
                            value={calcHourlyHours}
                            onChange={(e) => setCalcHourlyHours(Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between font-mono">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500">Gross Rate to charge</span>
                          <span className="text-white font-black text-xl">${estimatedHourlyOutput.gross}/hr</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500">take home salary</span>
                          <span className="text-[#a3e635] font-black text-sm">${estimatedHourlyOutput.net}/hr</span>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Retainer Calculations */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xs font-black uppercase text-[#a3e635] tracking-widest flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span>Retainer Agreement Estimator</span>
                      </h3>

                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1">
                          <span>Monthly Fee per Client:</span>
                          <span className="text-white">${calcRetainerMonthly}</span>
                        </div>
                        <input 
                          type="range" 
                          min={200} 
                          max={3500} 
                          step={100}
                          value={calcRetainerMonthly}
                          onChange={(e) => setCalcRetainerMonthly(Number(e.target.value))}
                          className="w-full accent-purple-500 h-1 bg-white/10 rounded-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold mb-1">Number of Clients:</span>
                          <input 
                            type="number"
                            min={1}
                            max={12}
                            value={calcRetainerClients}
                            onChange={(e) => setCalcRetainerClients(Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold mb-1">Est. Platform Tax (%):</span>
                          <input 
                            type="number"
                            min={0}
                            max={30}
                            value={calcHourlyFees}
                            onChange={(e) => setCalcHourlyFees(Number(e.target.value))}
                            className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between font-mono">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500">Gross monthly income</span>
                          <span className="text-white font-black text-base">${estimatedRetainerOutput.grossMonthly}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500">Net take home money</span>
                          <span className="text-emerald-400 font-black text-base">${estimatedRetainerOutput.netMonthly}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                    <span className="flex items-center gap-1">
                      <Smile className="w-4 h-4 text-purple-400" />
                      <span>{calcHourlyFees}% Fiverr / Upwork service fee model calculated above</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">Annual Net Retainer Projection: ${estimatedRetainerOutput.netAnnual.toLocaleString()}</span>
                  </div>
                </div>

                {/* DYNAMIC FIVERR GIG GENERATOR ENGINE */}
                <div className="bg-neutral-900/40 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span>Dynamic Fiverr Gig Creator Workspace</span>
                  </h2>
                  <p className="text-xs text-white/50 mb-6 leading-relaxed">
                    নিচের ইনপুটগুলো আপনার ভয়েস অনুযায়ী পরিবর্তন করুন। টুলটি আপনার জন্য সাথে সাথে ফাইভার গিগ স্ক্রিপ্ট লিখে সাজিয়ে দিবে!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Inputs aspects */}
                    <div className="md:col-span-1 flex flex-col gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                          Category reference skill
                        </label>
                        <select 
                          value={gigConfig.skillType}
                          onChange={(e) => setGigConfig({...gigConfig, skillType: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          {freelancingData.fiverrGigExamples.examples.map(e => (
                            <option key={e.skill} value={e.skill}>{e.skill}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                          Your Display First Name
                        </label>
                        <input 
                          type="text" 
                          value={gigConfig.userName}
                          onChange={(e) => setGigConfig({...gigConfig, userName: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                          Niche target keyword
                        </label>
                        <input 
                          type="text" 
                          value={gigConfig.nicheKeyword}
                          onChange={(e) => setGigConfig({...gigConfig, nicheKeyword: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                          Base Starting Price ($)
                        </label>
                        <input 
                          type="number" 
                          value={gigConfig.basePrice}
                          onChange={(e) => setGigConfig({...gigConfig, basePrice: Number(e.target.value)})}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                          Unique Selling Point (USP)
                        </label>
                        <textarea 
                          rows={2}
                          value={gigConfig.customBenefit}
                          onChange={(e) => setGigConfig({...gigConfig, customBenefit: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white resize-none font-medium text-left"
                        />
                      </div>
                    </div>

                    {/* Render aspect templates Output */}
                    <div className="md:col-span-2 bg-black/50 border border-white/5 rounded-2xl p-5 relative flex flex-col gap-4 text-left">
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                        <span className="text-[10px] font-black tracking-widest text-[#a3e635] uppercase">
                          GENERATED FIVERR SCRIPT
                        </span>
                        <button
                          onClick={() => handleCopy(`Title: ${generatedGig.title}\n\nDescription: ${generatedGig.description}\n\nPackages:\n${generatedGig.packages.map(p => `${p.tier}: ${p.price} - ${p.deliverables}`).join("\n")}`, "fiverrgig")}
                          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/5 text-[10px] text-slate-300 font-semibold cursor-pointer transition-all shrink-0 select-none"
                        >
                          {copiedText === "fiverrgig" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                          <span>{copiedText === "fiverrgig" ? "Copied Gig Data!" : "Copy Full Gig Script"}</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 font-medium select-text">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">GIG SEO TITLE:</span>
                          <p className="text-xs sm:text-sm font-extrabold text-white leading-snug">{generatedGig.title}</p>
                        </div>

                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">SHORT OVERVIEW DESCRIPTION:</span>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{generatedGig.description}</p>
                        </div>

                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-2">TIER PACKAGES:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                            {generatedGig.packages.map(p => (
                              <div key={p.tier} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="font-mono text-[9px] uppercase text-purple-400 tracking-wider block">{p.tier} Package</span>
                                <span className="font-extrabold text-white text-base block my-1">{p.price}</span>
                                <p className="text-white/60 text-[10px] leading-relaxed">{p.deliverables}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LIVE CLIENT PROPOSAL WRITER & PREVIEW PANEL */}
                <div className="bg-neutral-900/40 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#a3e635]" />
                    <span>Instant Bid Proposal Composer Workspace</span>
                  </h2>
                  <p className="text-xs text-white/50 mb-6 leading-relaxed">
                    নিচের বক্সগুলোতে আপনার প্যারামিটার সেট করুন। আপওয়ার্ক, ফাইভার কভার লেটারের জন্য আপনার প্রফেশনাল প্রস্তাবটি সাথে সাথে সাজানো হবে।
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Choose Template Type & Inputs */}
                    <div className="md:col-span-1 flex flex-col gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                          Choose Bid Style Base
                        </label>
                        <select 
                          value={selectedTemplateIndex}
                          onChange={(e) => setSelectedTemplateIndex(Number(e.target.value))}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          {freelancingData.proposalTemplates.templates.map((t, idx) => (
                            <option key={t.name} value={idx}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                          Client's Name / Brand
                        </label>
                        <input 
                          type="text" 
                          value={proposalInputs.clientName}
                          onChange={(e) => setProposalInputs({...proposalInputs, clientName: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                          My Display Name
                        </label>
                        <input 
                          type="text" 
                          value={proposalInputs.myName}
                          onChange={(e) => setProposalInputs({...proposalInputs, myName: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                          Specific client need
                        </label>
                        <input 
                          type="text" 
                          value={proposalInputs.specificNeed}
                          onChange={(e) => setProposalInputs({...proposalInputs, specificNeed: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                          One reference client result
                        </label>
                        <textarea 
                          rows={2}
                          value={proposalInputs.relevantResult}
                          onChange={(e) => setProposalInputs({...proposalInputs, relevantResult: e.target.value})}
                          className="w-full bg-black border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                            Timeframe Target
                          </label>
                          <input 
                            type="text" 
                            value={proposalInputs.timeframe}
                            onChange={(e) => setProposalInputs({...proposalInputs, timeframe: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                            Discount Special (%)
                          </label>
                          <input 
                            type="text" 
                            value={proposalInputs.discountPercent}
                            onChange={(e) => setProposalInputs({...proposalInputs, discountPercent: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Proposal previewer */}
                    <div className="md:col-span-2 bg-neutral-950/85 border border-white/5 rounded-2xl p-5 relative flex flex-col gap-4 text-left">
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#a3e635]" />
                          <span className="text-[10px] font-black text-slate-400 tracking-wider font-mono">LIVE COVER LETTER WRITER</span>
                        </div>
                        <button
                          onClick={() => handleCopy(processedProposalText, "proposal")}
                          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/5 text-[10px] text-slate-300 font-semibold cursor-pointer transition-all shrink-0 select-none"
                        >
                          {copiedText === "proposal" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                          <span>{copiedText === "proposal" ? "Copied Cover Letter!" : "Copy Proposal Text"}</span>
                        </button>
                      </div>

                      <div className="font-mono text-xs text-slate-300 leading-relaxed max-h-[350px] overflow-y-auto pr-1 whitespace-pre-wrap select-text selection:bg-purple-600 selection:text-white">
                        {processedProposalText}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Bio Examples panel */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h3 className="font-black text-base text-white mb-2">High Impact Profile Bio Presets</h3>
                  <p className="text-xs text-white/50 mb-4 font-medium">নিচের যেকোন একটি টেমপ্লেট আপনার ফাইভার ডেসক্রিপশন অথবা আপওয়ার্ক বায়োতে যুক্ত করতে পারেন।</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {freelancingData.profileBioExamples.examples.map(ex => (
                      <div key={ex.skill} className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-purple-500/20 transition-all flex flex-col justify-between gap-3 text-left">
                        <div>
                          <span className="text-[10px] font-mono uppercase bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full select-none block w-fit mb-2">
                            {ex.skill} Bio Preset
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans select-text">{ex.bio}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(ex.bio, `bio-${ex.skill}`)}
                          className="w-full mt-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-200 transition-colors cursor-pointer select-none"
                        >
                          {copiedText === `bio-${ex.skill}` ? "Copied bio preset!" : "Copy Description"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCAM DETECTION WATCH TAB */}
            {activeTab === "scams" && (
              <motion.div
                key="scam-advisor"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="flex flex-col gap-6 font-sans"
              >
                {/* Dynamic red flag interactive advisor workspace */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-1 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <span>Smart Red Flag client Scanner</span>
                  </h2>
                  <p className="text-xs text-white/50 mb-6 leading-relaxed">
                    আপনার পাওয়া অফারে নিচের লক্ষণগুলো কতটুকু বিদ্যমান তা সিলেক্ট করুন—অ্যাডভাইজার সাথে সাথে রিস্ক অ্যাসেসমেন্ট স্কোর তৈরি করবে।
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                    {/* Checklist options selection */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] tracking-widest uppercase font-black text-slate-500 mb-1">SELECT PRESENT BEHAVIORS:</span>
                      {freelancingData.scamDetectionGuide.redFlags.map(rf => {
                        const isChecked = checkedScamFlags.includes(rf.flag);
                        return (
                          <button
                            key={rf.flag}
                            onClick={() => toggleScamFlag(rf.flag)}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all text-left w-full cursor-pointer ${isChecked ? "bg-red-500/10 border-red-500/25 text-red-100" : "bg-black/30 border-white/5 text-slate-300 hover:border-white/10"}`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isChecked ? (
                                <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                              ) : (
                                <div className="w-4.5 h-4.5 rounded border-2 border-white/20" />
                              )}
                            </div>
                            <div className="text-left">
                              <span className="block text-xs font-bold leading-normal">{rf.flag}</span>
                              <span className="block text-[10px] text-white/40 leading-normal mt-0.5">{rf.explanation}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Threat level dashboard assessment */}
                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] tracking-widest uppercase font-black text-slate-500">CLIENT THREAT REPORT:</span>
                      
                      <div className={`p-6 rounded-3xl border flex flex-col gap-4 relative overflow-hidden ${scamRiskRating.bg}`}>
                        {/* Abstract red backdrop flash */}
                        <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

                        <div>
                          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase leading-none mb-1">SCAM SCAN RESULTS:</span>
                          <span className={`text-xl sm:text-2xl font-black block tracking-tight ${scamRiskRating.color}`}>
                            {scamRiskRating.rating}
                          </span>
                        </div>

                        {/* threat rating progress visualizer bar */}
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 rounded-full ${scamRiskRating.progress}`} />
                        </div>

                        <p className="text-xs text-white/70 leading-relaxed font-sans select-text">
                          {scamRiskRating.desc}
                        </p>

                        <div className="pt-3 border-t border-white/[0.04] text-[10px] text-slate-500 leading-normal flex justify-between font-mono">
                          <span>Reported red flags:</span>
                          <span className="text-white font-bold">{checkedScamFlags.length} of {freelancingData.scamDetectionGuide.redFlags.length} flags</span>
                        </div>
                      </div>

                      {/* General guide and details checklist */}
                      <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-3 text-left">
                        <span className="text-xs font-extrabold text-[#a3e635] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Strict Safety Action Checklist</span>
                        </span>
                        
                        <div className="flex flex-col gap-2 text-xs">
                          {freelancingData.scamDetectionGuide.safetyChecklist.map((scText, ind) => (
                            <div key={scText} className="flex gap-2 leading-relaxed">
                              <span className="text-[#a3e635] font-black">✔</span>
                              <span className="text-white/75">{scText}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Communication Guide Hab */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h3 className="font-black text-base text-white mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    <span>Client Communication Guide & standard responses</span>
                  </h3>
                  <p className="text-xs text-white/50 mb-6 font-medium">নিচের গুরুত্বপূর্ণ কনভারসেশন মেসেজগুলো ক্লিক করে সাথে সাথে কপি করুন ক্লায়েন্টকে পাঠানোর জন্য।</p>
                  
                  <div className="flex flex-col gap-3">
                    {freelancingData.clientCommunicationGuide.principles.map(princ => (
                      <div key={princ.title} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col gap-2">
                        <h4 className="font-extrabold text-xs sm:text-sm text-white">{princ.title}</h4>
                        <p className="text-[11px] text-white/55 leading-relaxed">{princ.details}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/[0.04] pt-5 mt-5">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">CONVERSATION PHRASE PREVIEWER:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {freelancingData.clientCommunicationGuide.samplePhrases.map((phrase, phIdx) => (
                        <div key={phrase} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-start justify-between gap-3 text-[11px] hover:border-purple-500/20 transition-all select-text font-mono">
                          <p className="text-white/80 leading-relaxed text-left">{phrase}</p>
                          <button
                            onClick={() => handleCopy(phrase, `phrase-${phIdx}`)}
                            className="bg-white/5 hover:bg-purple-600 hover:text-white p-1.5 rounded-lg text-slate-400 border border-white/5 transition-colors cursor-pointer shrink-0 select-none"
                          >
                            {copiedText === `phrase-${phIdx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ACTION CHECKLISTS & MILESTONES TAB */}
            {activeTab === "checklists" && (
              <motion.div
                key="checklists-milestones"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="flex flex-col gap-6 font-sans"
              >
                {/* Achievements block */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#a3e635] animate-bounce" />
                    <span>Success Achievement Milestones</span>
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed mb-6">
                    ফার্স্ট ক্লায়েন্ট পাওয়ার এই সফরে আপনার অর্জিত মাইলফলকগুলো ক্লিক করে চেক অফ করুন।
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {freelancingData.successMilestones.milestones.map(mile => {
                      const isChecked = localMilestones.includes(mile.milestone);
                      
                      const toggleMile = () => {
                        let newMiles;
                        if (isChecked) {
                          newMiles = localMilestones.filter(m => m !== mile.milestone);
                        } else {
                          newMiles = [...localMilestones, mile.milestone];
                        }
                        saveMilestones(newMiles);
                      };

                      return (
                        <button
                          key={mile.milestone}
                          onClick={toggleMile}
                          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between gap-3 cursor-pointer ${isChecked ? "bg-gradient-to-tr from-purple-950 to-neutral-900 border-purple-500/30" : "bg-black/30 border-white/5 text-slate-300 hover:border-white/10"}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-xs text-white block">{mile.milestone}</span>
                              {isChecked ? (
                                <Award className="w-5 h-5 text-[#a3e635] shrink-0" />
                              ) : (
                                <div className="w-4.5 h-4.5 rounded-full border border-white/20" />
                              )}
                            </div>
                            <p className="text-[10px] text-white/50 leading-relaxed font-sans">{mile.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Printable Action Checklists */}
                <div className="bg-neutral-900/30 border border-white/[0.04] rounded-3xl p-5 sm:p-6 text-left">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-2">
                    Printable Action State Checklists
                  </h2>
                  <p className="text-xs text-white/50 mb-6 font-medium">
                    সফরের প্রতিটি লেভেলের গুরুত্বপূর্ণ কাজের টাস্ক-প্ল্যান ফিল্টার।
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {freelancingData.actionChecklists.checklists.map(list => (
                      <div key={list.name} className="p-4 sm:p-5 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col gap-3">
                        <span className="font-extrabold text-xs text-slate-100 pb-2 border-b border-white/[0.04] block text-left">
                          {list.name}
                        </span>

                        <div className="flex flex-col gap-2">
                          {list.items.map((item, itemidx) => {
                            const uniqueKey = `${list.name}_i${itemidx}`;
                            const isChecked = localChecklists[list.name]?.includes(uniqueKey) || false;

                            const toggleListItem = () => {
                              const currentSelected = localChecklists[list.name] || [];
                              let updated;
                              if (isChecked) {
                                updated = currentSelected.filter(v => v !== uniqueKey);
                              } else {
                                updated = [...currentSelected, uniqueKey];
                              }
                              const saved = { ...localChecklists, [list.name]: updated };
                              saveChecklists(saved);
                            };

                            return (
                              <button
                                key={item}
                                onClick={toggleListItem}
                                className="flex items-start gap-2.5 p-3 rounded-xl bg-black/40 hover:bg-neutral-900 border border-white/5 text-left transition-all w-full select-text cursor-pointer"
                              >
                                <div className="shrink-0 mt-0.5 pointer-events-none">
                                  {isChecked ? (
                                    <CheckCircle2 className="w-4.5 h-4.5 text-[#a3e635]" />
                                  ) : (
                                    <div className="w-4.5 h-4.5 rounded border-2 border-white/20" />
                                  )}
                                </div>
                                <span className={`text-xs font-semibold leading-relaxed ${isChecked ? "text-white/40 line-through" : "text-white/85"}`}>
                                  {item}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
     </div>
    </div>
  );
};
