/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from "lucide-react";

export type ToolCategory = "All" | "Streaming" | "Security" | "Utilities" | "Web Tools";

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  url?: string;
  category: ToolCategory;
}

export type View = "hero" | "tools" | "iptv";

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
