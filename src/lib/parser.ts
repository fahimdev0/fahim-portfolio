/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IPTVChannel, IPTVPlaylist } from "../types";

export function parseM3U(content: string): IPTVPlaylist {
  const lines = content.split("\n");
  const channels: IPTVChannel[] = [];
  const categoriesSet = new Set<string>();

  let currentChannel: Partial<IPTVChannel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("#EXTINF:")) {
      // Parse metadata case-insensitively and handle both single/double quotes
      const logoMatch = line.match(/tvg-logo=["']([^"']+)["']/i);
      const groupMatch = line.match(/group-title=["']([^"']+)["']/i);
      
      // Some playlists use commas to separate info from name
      const nameParts = line.split(",");
      const name = nameParts[nameParts.length - 1].trim();

      currentChannel.name = name || "Unnamed Channel";
      currentChannel.logo = logoMatch ? logoMatch[1] : "";
      currentChannel.group = groupMatch ? groupMatch[1] : "General";
      
      if (currentChannel.group) {
        categoriesSet.add(currentChannel.group);
      }
    } else if (line.startsWith("http") || line.startsWith("rtmp") || line.startsWith("rtsp") || line.startsWith("https")) {
      // Stream URL
      currentChannel.url = line;
      currentChannel.id = Math.random().toString(36).substring(2, 11);
      
      if (!currentChannel.name) {
        currentChannel.name = "Channel " + currentChannel.id.substring(0, 4).toUpperCase();
      }
      if (!currentChannel.group) {
        currentChannel.group = "General";
        categoriesSet.add("General");
      }
      
      if (currentChannel.url) {
        channels.push(currentChannel as IPTVChannel);
      }
      currentChannel = {};
    }
  }

  const categories = Array.from(categoriesSet).sort();
  if (categories.length === 0 && channels.length > 0) {
    categories.push("General");
  }

  return {
    name: "Imported Playlist",
    channels,
    categories: ["All", "Favorites", "Recently Watched", ...categories],
  };
}
