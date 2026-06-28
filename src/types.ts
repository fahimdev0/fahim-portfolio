/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from "lucide-react";

export type ToolCategory = "All" | "AI" | "Streaming" | "Security" | "Utilities" | "Web Tools" | "Sports" | "Developer Tools";

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  url?: string;
  category: ToolCategory;
  status?: "Live" | "Beta" | "Coming Soon";
  actionText?: string;
}

export type View = "hero" | "tools" | "iptv" | "freelancing" | "fifa" | "ai-helper" | "translator" | "api-tester" | "hacking" | "doc-cloner";

export interface IPTVChannel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

export interface IPTVPlaylist {
  name: string;
  channels: IPTVChannel[];
  categories: string[];
}
