import Game from "./components/Game/Game";

export default function Home() {
  return (
    <main className="bg-black w-full h-[100vh]">
      <h1 className="text-xl text-white text-center py-4">Conways Game of Life</h1>
      <Game />
    </main>
  );
}
