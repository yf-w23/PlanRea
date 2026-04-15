"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Sparkles, ArrowLeft } from "lucide-react";
import { BubblePop } from "../lib/mini-games/BubblePop";
import { MemoryGame } from "../lib/mini-games/MemoryGame";

type GameType = "menu" | "bubble" | "memory";

const GAMES = [
  {
    id: "bubble",
    name: "呼吸泡泡",
    description: "点击飘动的泡泡，配合呼吸节奏放松",
    emoji: "🫧",
    color: "from-cyan-400 to-blue-500",
    duration: "2-3分钟",
    benefits: ["放松眼睛", "调节呼吸"],
  },
  {
    id: "memory",
    name: "记忆翻牌",
    description: "轻松翻牌配对，锻炼记忆力的休闲游戏",
    emoji: "🎴",
    color: "from-violet-400 to-purple-500",
    duration: "3-5分钟",
    benefits: ["激活大脑", "转移注意"],
  },
];

export function MiniGameCard() {
  const [currentGame, setCurrentGame] = useState<GameType>("menu");
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const handleGameComplete = () => {
    setGamesPlayed((prev) => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      {currentGame === "menu" ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                轻松小游戏
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                简单有趣，放松身心
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {GAMES.map((game) => (
              <motion.button
                key={game.id}
                onClick={() => setCurrentGame(game.id as GameType)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl flex-shrink-0`}
                  >
                    {game.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                        {game.name}
                      </h4>
                      <Sparkles className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {game.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-full text-slate-600 dark:text-slate-300">
                        {game.duration}
                      </span>
                      {game.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="text-xs px-2 py-1 bg-teal-100 dark:bg-teal-900/30 rounded-full text-teal-600 dark:text-teal-400"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">今日游玩</span>
              <span className="font-medium text-pink-600 dark:text-pink-400">
                {gamesPlayed} 次
              </span>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              💡 小游戏旨在帮助放松，建议每次游玩不超过10分钟
            </p>
          </div>
        </>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGame}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setCurrentGame("menu")}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {GAMES.find((g) => g.id === currentGame)?.name}
              </h3>
            </div>

            {currentGame === "bubble" && (
              <BubblePop onComplete={handleGameComplete} />
            )}
            {currentGame === "memory" && (
              <MemoryGame onComplete={handleGameComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
