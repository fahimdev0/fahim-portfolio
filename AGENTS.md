# IMPORTANT ARCHITECTURE & PLATFORM RULES

This website is a highly scalable multi-tool platform containing independent interactive products.

## Current Tools
* **Fahim IPTV** (Live Sports & Global TV Client)
* **Start Freelancing** (Beginner Freelancer Roadmap & Workstation)

## Future Planned Tools
* Security Tools
* AI Tools
* OSINT Tools
* Automation Tools
* Web Utilities
* Additional Products

---

## 🏗️ CRITICAL ARCHITECTURAL RULES

1. **Modular Plug-In Style Architecture**
   - Every tool must be treated as an isolated application living inside the same ecosystem.
   - When a tool is modified, updated, redesigned, fixed, or replaced, **no other tool should ever be affected**.
   - Changes made to one tool **MUST NEVER** modify:
     * Other tool pages/components
     * Shared layouts or Navigation elements (unless explicitly requested)
     * General theme settings and existing functionalities of unrelated tools

2. **File & Directory Isolation Structure**
   - Keep tool-specific assets, states, sub-components, and logic completely scoped to their respective domains.
   - When creating or refactoring a tool, use a modular setup (e.g. `src/components/IPTVApp.tsx` and `src/components/FreelancingApp.tsx`). Do not cross-contaminate logic or assets between them.

3. **Protected Core Layout & Theme Rules**
   - The shared container/dashboard (`src/App.tsx`, parent headers) serves as the host.
   - Tools may use shared components/utilities but are **strictly forbidden** from modifying them in a way that breaks backward compatibility or alters other tools.
   - Core layouts, existing card designs, navigation tabs, color systems, and responsiveness configurations must **remain completely unchanged** unless a universal change is explicitly requested by the user.

4. **New Tool Creation Workflow**
   When requested to add a new tool:
   - Generate a new, fully isolated module/component.
   - Register it inside the tools directory config (e.g., in `src/App.tsx` tool definitions and categories).
   - Ensure a modular, modern card is added to the hub without modifying the visual styling of any existing tool cards.
   - Set up independent routing/tabs or state conditions supporting high performance.

5. **Responsive and Version Safety**
   - Desktop responsive modifications must never break mobile screens, and mobile styling updates must never break desktop layout precision.
   - Keep tool-specific styles and classes scoped locally inside the tool's component code.
   * **Version Lock:** Before applying any update, safeguard existing features, existing UI aesthetics, and existing user experiences. Only touch the target tool requested.
