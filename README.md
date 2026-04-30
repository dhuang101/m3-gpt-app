# M3 GPT App

This application contains both the frontend and middleware required to interface with  Ollama hosted LLM's to provide an easy platform to share LLMs. It also contains a primitive authentication setup

## Main Documentation
[Google Docs](https://docs.google.com/document/d/1hoizr7yDfuu7pSCjOcFZfXq7PDXYB2S1XqjrusBLiOo/edit?usp=sharing)

## Dependencies 

The app is currently built using [Node.js](https://nodejs.org/en) v22.11.0

It is recommended to use nvm 
- [UNIX](https://github.com/nvm-sh/nvm) 
- [Windows](https://github.com/coreybutler/nvm-windows) 
  
to manage your versions of node.

###  Tech Stack

| Category           | Tech |
|--------------------|------|
| **Framework**      | [Next.js](https://nextjs.org/) |
| **UI Library**     | [React](https://react.dev/) |
| **Language**       | [TypeScript](https://www.typescriptlang.org/) |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/) / [DaisyUI](https://daisyui.com/) |
| **Auth**           | [NextAuth.js](https://next-auth.js.org/) |
| **LLM Host**           | [Ollama](https://ollama.com/) |

## Getting Started

### Clone the repository
View the repository at [GitHub](https://github.com/dhuang101/m3-gpt-app)
```bash
git clone https://github.com/dhuang101/m3-gpt-appgit
cd m3-gpt-app
```

### Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Setup .env.local
Create a .env.local file in the root:
```bash
NEXTAUTH_URL = "URL for NextAuthJS"
NEXTAUTH_SECRET = "Secret for NextAuthJS"

NEXT_PUBLIC_AUTH0_CLIENT_ID = "Auth0's client ID made public to the frontend"
NEXT_PUBLIC_AUTH0_ISSUER = "Auth0's issuer URL made public to the frontend"
AUTH0_CLIENT_SECRET = "the secret key for Auth0"

NEXT_PUBLIC_FEEDBACK_FORM_URL = "the URL for the feedback form"
```

### Start dev server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
Your app is now running at http://localhost:3000

## Build

To build the app simply run ```npm run build```. This will create a built version of the application which can then be launched using ```npm start```. The app will then be running on [localhost:3000](http:localhost:3000) or the UNIX equivalent address.

## File Structure
```
.
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Next.js pages (routes)
│   ├── styles/         # TailwindCSS/DaisyUI dependencies
│   ├── types/          # Reusable TS Types
│   └── proxy.ts        # NextJS proxy function
├── .env.local          # Local environment variables
├── next.config.js      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
└── package.json
```

