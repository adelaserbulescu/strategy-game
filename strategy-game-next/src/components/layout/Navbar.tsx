import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-amber-400">
          ⚔️ Strategy Game
        </span>

        <div className="flex gap-6">
          <Link href="/lobby" className="hover:text-amber-400">
            Lobby
          </Link>
          <Link href="/profile" className="hover:text-amber-400">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
