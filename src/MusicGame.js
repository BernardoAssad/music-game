import React, { useState } from 'react';
import { Play, Pause, ArrowLeft, Music } from 'lucide-react';

const MusicGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {!gameStarted ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Music Game</h1>
              <p className="text-gray-300">Escolha uma categoria para começar</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Categorias em cards */}
              {['Pop BR', 'Pop Internacional', 'Trap BR', 'Rap BR'].map((category) => (
                <button
                  key={category}
                  className="bg-purple-800 hover:bg-purple-700 transition-colors p-4 rounded-lg text-center"
                  onClick={() => setGameStarted(true)}
                >
                  <Music className="mx-auto mb-2" size={24} />
                  <span>{category}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Cabeçalho do jogo */}
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setGameStarted(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-white"
              >
                <ArrowLeft size={20} />
                Voltar
              </button>
              <div className="text-xl font-semibold">
                Rodada {currentRound + 1}/5 • Pontos: {score}
              </div>
            </div>

            {/* Player de música */}
            <div className="bg-purple-800/50 p-8 rounded-lg text-center">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-white text-purple-900 flex items-center justify-center mx-auto hover:bg-gray-200 transition-colors"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
            </div>

            {/* Grid de opções */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((option) => (
                <button
                  key={option}
                  className="bg-purple-800/30 hover:bg-purple-700/50 transition-colors rounded-lg overflow-hidden"
                >
                  <div className="aspect-square bg-purple-900/50">
                    <img
                      src="/api/placeholder/200/200"
                      alt="Album cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <p className="font-semibold">Nome da Música</p>
                    <p className="text-sm text-gray-300">Artista</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicGame;