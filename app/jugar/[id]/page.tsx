import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GamePlayer } from "@/components/game-player";
import { GAMES } from "@/lib/games";

interface GamePlayerPageProps {
  params: Promise<{ id: string }>;
}

function findGame(id: string) {
  return GAMES.find((g) => g.id === id);
}

export async function generateMetadata({ params }: GamePlayerPageProps): Promise<Metadata> {
  const { id } = await params;
  const game = findGame(id);
  return {
    title: game ? `${game.title} · Arcade Vault` : "Juego no encontrado · Arcade Vault",
  };
}

export default async function GamePlayerPage({ params }: GamePlayerPageProps) {
  const { id } = await params;
  const game = findGame(id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}
