'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DistractionBlockerProps {
  isActive: boolean;
  onInterruption: () => void;
}

export function DistractionBlocker({ isActive, onInterruption }: DistractionBlockerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exitCode, setExitCode] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);

  // 监听页面可见性变化
  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        setIsVisible(true);
        onInterruption();
      }
    };

    // 监听窗口失焦
    const handleBlur = () => {
      if (isActive) {
        setIsVisible(true);
        onInterruption();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActive, onInterruption]);

  // 关闭遮罩
  const handleClose = () => {
    setIsVisible(false);
  };

  // 显示退出确认
  const handleShowExitConfirm = () => {
    setShowExitConfirm(true);
  };

  // 确认退出
  const handleConfirmExit = () => {
    if (exitCode === '确认退出') {
      setIsLeaving(true);
      setTimeout(() => {
        setShowExitConfirm(false);
        setIsVisible(false);
        setIsLeaving(false);
        setExitCode('');
      }, 500);
    }
  };

  // 取消退出
  const handleCancelExit = () => {
    setShowExitConfirm(false);
    setExitCode('');
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
          >
            {/* 背景遮罩 */}
            <motion.div
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />

            {/* 内容 */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 max-w-lg w-full mx-4"
            >
              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="absolute -top-12 right-0 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* 主卡片 */}
              <div className="bg-card border rounded-2xl p-8 text-center shadow-2xl">
                {/* 图标动画 */}
                <motion.div
                  className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Eye className="h-12 w-12 text-primary" />
                </motion.div>

                {/* 标题 */}
                <h2 className="text-2xl font-bold mb-3">保持专注</h2>

                {/* 提示语 */}
                <p className="text-muted-foreground mb-2">
                  检测到你可能分心了
                </p>
                <p className="text-lg font-medium text-primary mb-8">
                  深呼吸，回到你的任务上来
                </p>

                {/* 激励语 */}
                <div className="bg-muted/50 rounded-xl p-4 mb-8">
                  <p className="text-sm italic text-muted-foreground">
                    "专注是成功的秘诀。"
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={handleClose}
                    className="w-full"
                  >
                    <EyeOff className="h-5 w-5 mr-2" />
                    继续专注
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShowExitConfirm}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    紧急退出
                  </Button>
                </div>

                {/* 统计提示 */}
                <p className="mt-6 text-xs text-muted-foreground">
                  每次分心都会被记录，帮助你了解自己的专注模式
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 退出确认对话框 */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              确认退出专注模式？
            </DialogTitle>
            <DialogDescription>
              退出后本次专注将不会计入统计数据。如果必须离开，请输入"确认退出"。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <input
              type="text"
              value={exitCode}
              onChange={(e) => setExitCode(e.target.value)}
              placeholder="请输入：确认退出"
              className="w-full px-3 py-2 border rounded-md text-center"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirmExit();
                }
              }}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelExit}>
              继续专注
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmExit}
              disabled={exitCode !== '确认退出' || isLeaving}
            >
              {isLeaving ? '退出中...' : '确认退出'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 简单的离开页面提示
export function useLeaveWarning(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '你正在专注中，确定要离开吗？';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActive]);
}
