import { LibraryScreen } from "@/components/library-screen";
import { CATEGORIES, GAMES } from "@/lib/games";

export default function Home() {
  return <LibraryScreen games={GAMES} categories={CATEGORIES} />;
}
