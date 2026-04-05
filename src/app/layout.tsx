import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Newstok | AI Content Generator",
  description: "Generate highly engaging content variants from any news article using AI.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-bg text-dark-text relative">
        {/* Background decorations matching vibrant reference */}
        <div className="fixed top-[-100px] left-[-100px] w-64 h-64 bg-bright-blue rounded-full opacity-20 blur-3xl mix-blend-multiply pointer-events-none -z-10" />
        <div className="fixed bottom-[-50px] right-[-50px] w-80 h-80 bg-honey-yellow rounded-full opacity-20 blur-3xl mix-blend-multiply pointer-events-none -z-10" />
        <div className="fixed top-1/2 left-2/3 w-72 h-72 bg-fresh-green rounded-full opacity-10 blur-3xl mix-blend-multiply pointer-events-none -z-10" />
        
        {/* Header Navigation */}
        <header className="p-6 max-w-7xl w-full mx-auto animate-fade-in-down flex items-center justify-between">
            <div className="flex items-center gap-3 brutal-shadow bg-white px-4 py-2 rounded-2xl -rotate-2 transform hover:rotate-0 transition-transform cursor-pointer border-2 border-black">
                <img src="/logo.png" alt="Newstok Logo" className="h-8 w-8" />
                <h1 className="text-3xl font-extrabold tracking-tight text-primary-orange">
                    Newstok.
                </h1>
            </div>
            <nav className="flex gap-4">
                <a href="/" className="px-4 py-2 font-bold rounded-xl hover:bg-black/5 transition-colors">Home</a>
                <a href="/history" className="px-4 py-2 font-bold bg-dark-text text-white rounded-xl brutal-shadow hover-lift block">History</a>
            </nav>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 mb-16">
            {children}
        </main>
      </body>
    </html>
  );
}
