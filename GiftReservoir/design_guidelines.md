# Design Guidelines: Family Wishlist Sharing App

## Design Approach
**Hybrid Reference + System Approach**: Drawing from Airbnb's warm, approachable aesthetic for the wishlist cards, Linear's clean typography and spacing for the interface structure, and Pinterest's visual grid layouts for item displays. This creates a friendly, family-oriented experience while maintaining clarity for the functional claim/reserve system.

## Core Design Principles
1. **Clarity First**: Claimed vs. available status must be immediately obvious through layout and visual hierarchy
2. **Approachable Warmth**: Family-friendly interface that feels inviting, not corporate
3. **Effortless Sharing**: Copy-link functionality should be prominent and foolproof
4. **Mobile-Optimized**: Family members will access from various devices

## Typography System

**Font Families**: 
- Primary: Inter (headings, UI elements, buttons)
- Secondary: System font stack (body text, descriptions)

**Type Scale**:
- Hero/Page Titles: text-4xl md:text-5xl font-bold
- Section Headers: text-2xl md:text-3xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base
- Metadata/Labels: text-sm font-medium
- Tiny Text: text-xs

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, and 12 consistently
- Micro spacing (gaps, padding within cards): p-4, gap-2
- Component spacing: p-6, gap-4
- Section spacing: py-8, py-12
- Page margins: px-4 md:px-6 lg:px-8

**Container Strategy**:
- Max-width wrapper: max-w-7xl mx-auto
- Content areas: max-w-4xl for forms and single-column content
- Grid layouts: Full width with inner max-w-7xl

## Component Library

### Navigation
**Top Navigation Bar**: Sticky header with logo, wishlist name/selector, user profile, and "Create Wishlist" CTA
- Height: h-16
- Layout: Horizontal flex with space-between alignment
- Mobile: Hamburger menu for navigation items

### Dashboard/Home View
**Wishlist Grid**: 
- Desktop: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Card-based layout showing wishlist thumbnails, item counts, last updated
- Each card includes: Title, item count badge, "Share" button, "View" CTA

### Wishlist Detail Page
**Hero Section** (h-64 to h-80):
- Wishlist title (text-4xl font-bold)
- Description if provided
- Prominent "Share Link" button with copy functionality
- "Add Item" CTA button
- Item count and claimed count indicators

**Item Grid**:
- Desktop: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Each item card includes:
  - Product image placeholder (aspect-square or aspect-video)
  - Item name (text-xl font-semibold)
  - Price if available (text-lg font-medium)
  - Description (text-sm, max 2-3 lines with ellipsis)
  - Link preview/domain (text-xs)
  - Status badge (Available/Claimed)
  - Action button ("Claim This" or "Claimed by [Name]")

**Visual Status System**:
- Available items: Full opacity, prominent "Claim This" button
- Claimed items: Reduced opacity overlay, disabled state button showing claimer name, subtle "Claimed" badge

### Add Item Modal/Form
**Full-screen overlay** on mobile, centered modal (max-w-2xl) on desktop
- Form fields: Item name, URL, description, price (optional), image upload (optional)
- Large textarea for description
- Real-time URL preview showing domain/favicon
- Clear CTAs: "Add to Wishlist" and "Cancel"

### Share Link Interface
**Copy Link Component**:
- Input field displaying full shareable URL (read-only)
- "Copy Link" button with success state feedback
- Additional share options: Email, WhatsApp, Facebook (icon buttons)
- QR code option for in-person sharing

### Authentication Pages
**Login/Signup Flows**:
- Centered card layout (max-w-md)
- Single-column form design
- Social login options if using Replit Auth (Google, GitHub, Apple icons)
- Warm welcome messaging for family context

### Empty States
- Friendly illustrations or icons for:
  - No wishlists created yet
  - No items in wishlist
  - No claimed items yet
- Clear CTAs to guide next action

## Interactive States

**Buttons**:
- Primary: Large, rounded-lg, font-semibold
- Secondary: Outlined variant
- Disabled: Reduced opacity, no pointer events
- All buttons include subtle scale transform on hover (desktop)

**Cards**:
- Hover: Subtle shadow elevation increase
- Active: Slight scale down
- Claimed items: Greyed overlay, cursor-not-allowed

**Copy Actions**:
- Default: "Copy Link" with icon
- Loading: Brief spinner or animation
- Success: Checkmark icon + "Copied!" text (2-second feedback)

## Images

**Hero Section**: No large hero image for this app - functionality-first approach

**Item Cards**: 
- Product images from URLs (when available via Open Graph)
- Fallback: Generic gift icon or product placeholder
- Aspect ratio: aspect-square preferred for consistency
- Placement: Top of each item card

**Empty State Graphics**:
- Gift box illustration for empty wishlists
- Celebration/confetti graphic when all items claimed
- Simple, friendly line art style

## Responsive Behavior

**Breakpoints**:
- Mobile-first approach
- md: 768px (2-column grids)
- lg: 1024px (3-column grids, side-by-side layouts)

**Mobile Optimizations**:
- Full-width cards with vertical stacking
- Bottom sheet for item details
- Fixed bottom CTA bars for critical actions
- Simplified navigation with drawer

**Desktop Enhancements**:
- Multi-column grid layouts
- Hover states and tooltips
- Side-by-side content (form + preview)

## Accessibility Requirements
- Focus indicators on all interactive elements (ring-2 ring-offset-2)
- Aria-labels for icon-only buttons
- Keyboard navigation throughout
- Screen reader announcements for claim status changes
- Sufficient color contrast (assuming proper color implementation later)
- Touch targets minimum 44x44px