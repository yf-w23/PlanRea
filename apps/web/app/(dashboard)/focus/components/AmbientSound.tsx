'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  CloudRain,
  Coffee,
  Trees,
  Waves,
  Flame,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { AmbientSoundType } from '../types';

// 环境音效配置
const AMBIENT_SOUNDS: {
  id: AmbientSoundType;
  label: string;
  icon: React.ElementType;
  description: string;
  // 使用在线音频URL（实际项目中可以使用本地文件）
  audioUrl?: string;
}[] = [
  {
    id: 'none',
    label: '静音',
    icon: VolumeX,
    description: '无背景音效',
  },
  {
    id: 'rain',
    label: '雨声',
    icon: CloudRain,
    description: '舒缓的下雨声',
    audioUrl: 'https://www.soundjay.com/misc/sounds/rain-01.mp3',
  },
  {
    id: 'coffee',
    label: '咖啡厅',
    icon: Coffee,
    description: '咖啡厅背景氛围',
    audioUrl: 'https://www.soundjay.com/misc/sounds/coffee-shop-ambience-1.mp3',
  },
  {
    id: 'forest',
    label: '森林',
    icon: Trees,
    description: '鸟鸣和风吹树叶',
    audioUrl: 'https://www.soundjay.com/nature/sounds/forest-ambience-1.mp3',
  },
  {
    id: 'waves',
    label: '海浪',
    icon: Waves,
    description: '海浪拍打沙滩',
    audioUrl: 'https://www.soundjay.com/nature/sounds/ocean-waves-1.mp3',
  },
  {
    id: 'fire',
    label: '篝火',
    icon: Flame,
    description: '温暖的篝火声',
    audioUrl: 'https://www.soundjay.com/nature/sounds/fire-1.mp3',
  },
];

interface AmbientSoundProps {
  currentSound: AmbientSoundType;
  volume: number;
  isPlaying: boolean;
  onSoundChange: (sound: AmbientSoundType) => void;
  onVolumeChange: (volume: number) => void;
  onTogglePlay: () => void;
}

export function AmbientSound({
  currentSound,
  volume,
  isPlaying,
  onSoundChange,
  onVolumeChange,
  onTogglePlay,
}: AmbientSoundProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSoundConfig = AMBIENT_SOUNDS.find((s) => s.id === currentSound);

  // 处理音频播放
  useEffect(() => {
    const soundConfig = AMBIENT_SOUNDS.find((s) => s.id === currentSound);

    if (soundConfig?.audioUrl && currentSound !== 'none') {
      // 创建新的音频对象
      if (!audioRef.current || audioRef.current.src !== soundConfig.audioUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        audioRef.current = new Audio(soundConfig.audioUrl);
        audioRef.current.loop = true;
      }

      audioRef.current.volume = volume;

      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.log('Audio play failed:', error);
        });
      } else {
        audioRef.current.pause();
      }
    } else {
      // 静音或无时停止播放
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentSound, isPlaying, volume]);

  // 处理音量变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleSoundSelect = (soundId: AmbientSoundType) => {
    if (soundId === currentSound) {
      onTogglePlay();
    } else {
      onSoundChange(soundId);
      if (soundId !== 'none') {
        // 自动播放
      }
    }
  };

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'gap-2 transition-colors',
          isPlaying && currentSound !== 'none' && 'text-primary'
        )}
      >
        {currentSound === 'none' || !isPlaying ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {currentSound === 'none' ? '白噪音' : currentSoundConfig?.label}
        </span>
      </Button>

      {/* 展开面板 */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsExpanded(false)}
            />

            {/* 面板 */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-72 bg-card border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <span className="font-medium text-sm">环境音效</span>
                {currentSound !== 'none' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onTogglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* 音量控制 */}
              {currentSound !== 'none' && (
                <div className="p-3 border-b">
                  <div className="flex items-center gap-3">
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[volume * 100]}
                      onValueChange={(v) => onVolumeChange((v as number[])[0] / 100)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* 音效列表 */}
              <div className="p-2 max-h-[240px] overflow-y-auto">
                {AMBIENT_SOUNDS.map((sound) => {
                  const Icon = sound.icon;
                  const isSelected = currentSound === sound.id;
                  const isActive = isSelected && isPlaying;

                  return (
                    <button
                      key={sound.id}
                      onClick={() => handleSoundSelect(sound.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all',
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {sound.label}
                          </span>
                          {isActive && (
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-1.5 h-1.5 rounded-full bg-green-500"
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {sound.description}
                        </p>
                      </div>

                      {isSelected && (
                        <motion.div
                          layoutId="selected-indicator"
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 提示 */}
              <div className="p-3 bg-muted/30 text-xs text-muted-foreground text-center border-t">
                白噪音有助于提高专注力
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// 简单的音效按钮（用于紧凑布局）
interface AmbientSoundButtonProps {
  sound: AmbientSoundType;
  isPlaying: boolean;
  onClick: () => void;
}

export function AmbientSoundButton({
  sound,
  isPlaying,
  onClick,
}: AmbientSoundButtonProps) {
  const soundConfig = AMBIENT_SOUNDS.find((s) => s.id === sound);
  const Icon = soundConfig?.icon || VolumeX;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        'relative',
        isPlaying && sound !== 'none' && 'text-primary'
      )}
    >
      <Icon className="h-5 w-5" />
      {isPlaying && sound !== 'none' && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary"
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </Button>
  );
}
