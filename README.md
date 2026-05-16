# FreeFlow - Freelancer OS

The operating system for freelancers who'd rather be doing the work.

Manage clients, projects, invoices, and analytics in one beautiful, simple platform. Stop juggling spreadsheets.

## Features

- **Client CRM** - Keep all your clients organized with contacts, history, and a branded client portal
- **Project Pipeline** - Visual kanban boards, milestone tracking, and time logging
- **Smart Invoicing** - Beautiful professional invoices in 30 seconds with auto-reminders
- **Revenue Analytics** - See exactly where your money comes from and spot trends
- **Client Portal** - Give clients a branded space to view updates and approve work
- **Bank-Grade Security** - AES-256 encryption, SOC2 compliant, daily backups

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe integration
- **Hosting**: Vercel (frontend), Supabase (backend)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bytewhisker/freeflow.git
   cd freeflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Configure your Supabase URL and API key in `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── views/            # Page components
├── lib/              # Utilities and helpers
├── types.ts          # TypeScript type definitions
├── db.ts             # Database operations
└── App.tsx           # Main app component
```

## Environment Variables

Required variables in `.env.local`:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For support, email hello@freeflow.io or open an issue on GitHub.

---

Built with ❤️ by bytewhisker
