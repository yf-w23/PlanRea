"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy, Clock } from "lucide-react";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onComplete?: () => void;
}

const EMOJIS = ["🌸", "🍃", "🌊", "☀️", "🌙", "⭐", "🦋", "🌿"];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function MemoryGame({ onComplete }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameCompleted, setGameCompleted] = useState(false);

  const initializeGame = useCallback(() => {
    const gameEmojis = shuffleArray(EMOJIS).slice(0, 6);
    const cardPairs = [...gameEmojis, ...gameEmojis];
    const shuffledCards = shuffleArray(cardPairs).map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeLeft(90);
    setGameCompleted(false);
  }, []);

  const startGame = useCallback(() => {
    initializeGame();
    setIsPlaying(true);
  }, [initializeGame]);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setCards([]);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeLeft(90);
    setGameCompleted(false);
    onComplete?.();
  }, [onComplete]);

  const flipCard = useCallback(
    (cardId: number) => {
      if (
        !isPlaying ||
        flippedCards.length >= 2 ||
        cards[cardId].isFlipped ||
        cards[cardId].isMatched
      ) {
        return;
      }

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, isFlipped: true } : card
        )
      );

      if (newFlippedCards.length === 2) {
        setMoves((prev) => prev + 1);
        const [first, second] = newFlippedCards;

        if (cards[first].emoji === cards[second].emoji) {
          // Match found
          setTimeout(() => {
            setCards((prev) =>
              prev.map((card) =>
                card.id === first || card.id === second
                  ? { ...card, isMatched: true }
                  : card
              )
            );
            setMatches((prev) => prev + 1);
            setFlippedCards([]);
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            setCards((prev) =>
              prev.map((card) =>
                card.id === first || card.id === second
                  ? { ...card, isFlipped: false }
                  : card
              )
            );
            setFlippedCards([]);
          }, 1000);
        }
      }
    },
    [isPlaying, flippedCards, cards]
  );

  // Timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0 || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, gameCompleted]);

  // Check for game completion
  useEffect(() => {
    if (matches === 6 && isPlaying && !gameCompleted) {
      setGameCompleted(true);
      setTimeout(() => {
        setIsPlaying(false);
      }, 1000);
    }
  }, [matches, isPlaying, gameCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getFeedbackMessage = () => {
    const efficiency = moves > 0 ? (6 / moves) * 100 : 0;
    if (efficiency >= 80) return "记忆力惊人！你是记忆大师！🧠✨";
    if (efficiency >= 60) return "表现不错！继续保持！🌟";
    if (moves <= 20) return "很好的尝试，再玩一次？💪";
    return "放松最重要，享受游戏过程~ 🌸";
  };

  return (
    <div className="relative">
      {/* Game Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {matches}/6
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <RotateCcw className="w-4 h-4" />
            {moves} 步
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Game Grid */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 aspect-square max-w-[280px] mx-auto">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => flipCard(card.id)}
              whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative aspect-square rounded-xl transition-all duration-300 ${
                card.isMatched
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : card.isFlipped
                  ? "bg-violet-100 dark:bg-violet-900/30"
                  : "bg-gradient-to-br from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600"
              }`}
              disabled={!isPlaying || card.isFlipped || card.isMatched}
            >
              <AnimatePresence mode="wait">
                {card.isFlipped || card.isMatched ? (
                  <motion.span
                    key="front"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center text-2xl"
                  >
                    {card.emoji}
                  </motion.span>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Match indicator */}
              {card.isMatched && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {!isPlaying && (timeLeft === 0 || gameCompleted || cards.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center"
            >
              {cards.length === 0 ? (
                <>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 text-center px-4">
                    翻开卡片找到配对的图案<br />
                    轻松锻炼记忆力
                  </p>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-md"
                  >
                    <Play className="w-5 h-5" />
                    开始游戏
                  </button>
                </>
              ) : gameCompleted ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-4xl mb-2"
                  >
                    🎉
                  </motion.div>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    恭喜完成!
                  </p>
                  <p className="text-violet-600 dark:text-violet-400 mb-1">
                    用了 {moves} 步
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {getFeedbackMessage()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={startGame}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      再玩一次
                    </button>
                    <button
                      onClick={resetGame}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      返回
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    时间到!
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    完成了 {matches}/6 对配对
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={startGame}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      再试一次
                    </button>
                    <button
                      onClick={resetGame}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      返回
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900">
        <p className="text-xs text-violet-700 dark:text-violet-400">
          💡 提示: 这是一个轻松的记忆力游戏，不需要追求速度。
          慢慢玩，让大脑得到放松和激活。
        </p>
      </div>
    </div>
  );
}
