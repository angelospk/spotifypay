import { useState, useEffect } from "react";
import { PaymentChart } from "./components/PaymentChart";
import { PaymentCalculator } from "./components/PaymentCalculator";
import { Button } from "./components/ui/button";
import { ImageWithFallback } from "./components/ImageWithFallback";

const jokes = [
  "The time has come, my friend, for me to pay the piper - or in this case, the Spotify Family plan! 🎵💰",
  "Μπορεί να μοιραζόμαστε τη μουσική, αλλά ας μοιραστούμε και τον λογαριασμό! 🎶",
  "Spotify: Bringing people together through music... and payment reminders! 😄",
  "Remember: Good friends share playlists. Great friends share the bill! 💸",
];

export default function App() {
  const [randomJoke, setRandomJoke] = useState("");

  useEffect(() => {
    // Simulate random joke from backend
    const randomIndex = Math.floor(Math.random() * jokes.length);
    setRandomJoke(jokes[randomIndex]);
  }, []);

  const handleRevolutClick = () => {
    window.open("https://revolut.me/angelokyn", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl mb-6">Spotify Family Pay Data</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {randomJoke}
          </p>
        </header>

        <section className="mb-12">
          <PaymentChart />
        </section>

        <section className="mb-12">
          <PaymentCalculator />
        </section>

        {/* Revolut Button */}
        <div className="flex justify-center mb-12">
          <Button
            onClick={handleRevolutClick}
            size="large"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 rounded-full gap-3"
          >
            <span className="text-2xl">Πλερώ</span>
          </Button>
        </div>

        {/* Meme Section */}
        <div className="flex justify-center mb-12">
          <div className="max-w-2xl w-full rounded-lg overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://raw.githubusercontent.com/angelospk/spot_cache/refs/heads/main/meme.jpg"
              alt="Payment reminder meme"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-400 py-8 border-t border-gray-700">
          <p className="mb-2">
            Made with love using{" "}
            <a
              href="https://ui.shadcn.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              shadcn/ui
            </a>{" "}
            and{" "}
            <a
              href="https://react.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              React
            </a>
          </p>
          <p className="text-sm mb-1">1. Prompts are randomly generated.</p>
          <p className="text-sm mb-1">
            2. Payment costs increased: 13€ (Sep 2023), 15€ (Sep 2025).
          </p>
        </footer>
      </div>
    </div>
  );
}
