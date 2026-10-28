import SceneManager from "@/components/organisms/SceneManager/SceneManager";
import { GameStoreProvider } from "@/store/GameStore";
import { SoundManagerProvider } from "@/contexts/SoundManagerContext";

export default function Home() {
  return (
    <GameStoreProvider>
      <SoundManagerProvider>
        <main className="game-container">
          <SceneManager />
        </main>
      </SoundManagerProvider>
    </GameStoreProvider>
  );
}
