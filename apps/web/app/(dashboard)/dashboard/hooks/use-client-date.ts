'use client';

import { useState, useEffect } from 'react';

interface ClientDate {
  date: Date;
  hour: number;
  isMounted: boolean;
}

export function useClientDate(): ClientDate {
  const [state, setState] = useState<ClientDate>({
    date: new Date(0), // 初始值设为 1970-01-01，避免 hydration 差异
    hour: 0,
    isMounted: false,
  });

  useEffect(() => {
    const now = new Date();
    setState({
      date: now,
      hour: now.getHours(),
      isMounted: true,
    });
  }, []);

  return state;
}

// 获取问候语
export function useGreeting(): string {
  const [greeting, setGreeting] = useState('你好');
  const { isMounted, hour } = useClientDate();

  useEffect(() => {
    if (!isMounted) return;
    
    if (hour < 6) setGreeting('夜深了，注意休息');
    else if (hour < 9) setGreeting('早上好，开启美好的一天');
    else if (hour < 12) setGreeting('上午好，保持专注');
    else if (hour < 14) setGreeting('中午好，适当休息');
    else if (hour < 18) setGreeting('下午好，继续加油');
    else if (hour < 22) setGreeting('晚上好，复盘今天');
    else setGreeting('夜深了，早点休息');
  }, [isMounted, hour]);

  return greeting;
}
