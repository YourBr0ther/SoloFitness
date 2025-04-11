# Install shadcn
npx shadcn@latest init

# Install additional dependencies
npm install @radix-ui/react-icons
npm install @radix-ui/react-slot
npm install class-variance-authority
npm install clsx
npm install tailwind-merge
npm install framer-motion
npm install lucide-react

# Create necessary directories
New-Item -ItemType Directory -Force -Path "src/components/ui"
New-Item -ItemType Directory -Force -Path "src/lib"
New-Item -ItemType Directory -Force -Path "src/styles"
New-Item -ItemType Directory -Force -Path "src/contexts" 