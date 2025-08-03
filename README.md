# Fertility Bot

A modern web application that provides fertility-related assistance and information through an interactive chat interface.

## Features

- **User Authentication**: Secure sign-up and login functionality
- **AI-Powered Chat**: Interactive chat interface with AI assistance
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between light and dark themes
- **Secure**: Environment-based configuration for sensitive data

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account
- Google Gemini API key

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Venjix007/Fertility-Bot.git
   cd Fertility-Bot/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase and Gemini API credentials
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   The application will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the `project` directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key-here
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Supabase Auth
- **Backend**: Supabase Edge Functions
- **AI**: Google Gemini API

## Project Structure

```
project/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── lib/           # Utility functions and configurations
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── supabase/          # Supabase functions and migrations
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ by [Your Name]
