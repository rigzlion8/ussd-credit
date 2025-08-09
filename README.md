# USSD Auto-Credit for Influencers

A SaaS platform that enables Kenyan influencers to receive recurring micro-payments from followers via USSD, without requiring internet or smartphones.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser

### Setup & Run
```bash
# 1. Clone and install
git clone <your-repo-url>
cd ussd-auto-credit
npm install

# 2. Start development servers
npm run dev          # Frontend (http://localhost:5173)
npm run mock-api     # Mock API (http://localhost:3001)
```

### First Time Setup
```bash
# Install recommended dependencies
npm install react-router-dom zustand @tanstack/react-query
npm install tailwindcss @headlessui/react lucide-react
npm install chart.js react-chartjs-2
npm install -D json-server
```

## 📋 Project Overview

### The Problem
- Influencers struggle with inconsistent revenue from followers
- Manual, one-time USSD donations are forgotten or inconvenient
- No automated recurring micro-payments via USSD in Kenya

### The Solution
- **Influencers** get unique USSD shortcodes (e.g., `*123*JANE#`)
- **Followers** subscribe once via USSD for automatic monthly payments
- **Platform** handles recurring billing, dashboard, and M-Pesa withdrawals

### Target Users
1. **Influencers**: Content creators needing passive income
2. **Subscribers**: Fans wanting to support creators automatically  
3. **Admins**: Platform operators managing the system

## 📁 Documentation

| File | Purpose |
|------|---------|
| [`docs/rough-overview.md`](docs/rough-overview.md) | Business context and problem definition |
| [`docs/technical-setup.md`](docs/technical-setup.md) | Tech stack and development setup |
| [`docs/project-structure.md`](docs/project-structure.md) | Folder organization and naming conventions |
| [`docs/api-integration.md`](docs/api-integration.md) | Mock API setup and authentication patterns |
| [`docs/wireframes.md`](docs/wireframes.md) | Simple layout ideas (non-restrictive) |

### User Personas & Features
| Persona | Documentation | Key Features |
|---------|---------------|--------------|
| **Influencer** | [`docs/roadmap/frontend/influencer-persona.md`](docs/roadmap/frontend/influencer-persona.md) | Dashboard, shortcode management, withdrawals |
| **Subscriber** | [`docs/roadmap/frontend/subscriber-persona.md`](docs/roadmap/frontend/subscriber-persona.md) | OTP login, subscription management, payment history |
| **Admin** | [`docs/roadmap/frontend/admin-persona.md`](docs/roadmap/frontend/admin-persona.md) | User management, system monitoring, integration health |

## 🛠 Tech Stack (Recommended)

### Frontend
- **React 18+** with **Vite** (fast development)
- **TailwindCSS** (rapid styling)
- **React Router v6** (page navigation)
- **Zustand** (state management)
- **Chart.js** (revenue visualization)

### Development
- **json-server** (mock API)
- **TypeScript** (optional, but recommended)
- **TanStack Query** (server state management)

## 🎯 Development Approach

### This is Frontend-Only
- **No backend required** - use mock APIs for all data
- **Focus on UI/UX** - make it beautiful and intuitive
- **Mobile-first** - most users will be on phones
- **Creative freedom** - wireframes are suggestions, not requirements

### Key Development Principles
1. **Page-based navigation** (avoid modal-heavy flows)
2. **Mock realistic data** (phone numbers, dates, amounts)
3. **Handle loading states** (important for slow networks)
4. **Responsive design** (mobile → tablet → desktop)
5. **Accessibility** (keyboard navigation, screen readers)

## 📱 User Flows

### Influencer Journey
```
Register → Dashboard → Create Shortcode → Share with Followers → Track Revenue → Withdraw Funds
```

### Subscriber Journey  
```
Dial USSD → Phone Login → OTP Verify → Subscribe → Auto-payments → Manage Subscriptions
```

### Admin Journey
```
Login → Monitor System Health → Manage Influencers → Handle Issues → Configure Settings
```

## 🎨 Design Guidelines

### Mobile-First Approach
- **Primary target**: Android phones with basic internet
- **Network consideration**: Optimize for slower connections
- **Touch-friendly**: Large buttons, easy navigation

### UI Suggestions
- **Colors**: Safaricom green or custom brand colors
- **Typography**: Clear, readable fonts (Inter, Poppins)
- **Components**: Cards, clean forms, data tables
- **Charts**: Simple line/bar charts for revenue trends

## 🔧 Development Tips

### Getting Started
1. **Read all documentation** in `docs/` folder first
2. **Set up mock API** using json-server
3. **Start with authentication flow** (login → dashboard)
4. **Build one persona at a time** (influencer → subscriber → admin)
5. **Test on mobile devices** regularly

### Mock Data Strategy
- **Realistic phone numbers**: `+2547XXXXXXXX` format
- **Kenyan currency**: Always show `KSh` prefix
- **Realistic amounts**: KSh 10, 20, 50 (common micro-payments)
- **USSD codes**: `*123*NAME#` format

### Performance Considerations
- **Lazy load** charts and heavy components
- **Optimize images** for mobile networks
- **Cache API responses** during development
- **Use skeleton screens** for loading states

## 🚦 Next Steps

### Phase 1: Core Setup
- [ ] Initialize React project with recommended stack
- [ ] Set up mock API with json-server
- [ ] Create basic routing structure
- [ ] Build authentication flow

### Phase 2: Influencer Features
- [ ] Dashboard with revenue cards
- [ ] Shortcode management pages
- [ ] Revenue charts and trends
- [ ] Withdrawal request flow

### Phase 3: Subscriber Features
- [ ] Phone/OTP authentication
- [ ] Subscription management
- [ ] Payment history
- [ ] New subscription flow

### Phase 4: Admin Features
- [ ] System health dashboard
- [ ] Influencer management
- [ ] Integration monitoring
- [ ] Audit logs

## 🤝 Contributing

This is a learning project! Feel free to:
- ✅ **Experiment** with different UI frameworks
- ✅ **Add creative features** not mentioned in docs
- ✅ **Improve the user experience** with animations, micro-interactions
- ✅ **Optimize for performance** and accessibility
- ✅ **Document your decisions** and learnings

## 📞 Support

If you get stuck:
1. **Check the documentation** in `docs/` folder
2. **Review the wireframes** for layout inspiration
3. **Look at the mock API examples** for data structure
4. **Focus on one feature at a time** - don't try to build everything at once

---

**Remember**: This is your chance to showcase creativity and technical skills. The documentation provides structure, but the implementation is entirely up to you! 🎨✨
