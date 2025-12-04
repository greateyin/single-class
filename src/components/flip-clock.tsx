"use client";

import { useEffect, useState } from "react";

interface FlipClockProps {
    targetDate: Date;
    label?: string;
}

export function FlipClock({ targetDate, label }: FlipClockProps) {
    const [timeLeft, setTimeLeft] = useState<{
        months: number;
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();

            if (difference > 0) {
                return {
                    months: Math.floor(difference / (1000 * 60 * 60 * 24 * 30)),
                    days: Math.floor((difference / (1000 * 60 * 60 * 24)) % 30),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-black/90 rounded-xl text-white shadow-2xl border border-gray-800">
            {label && (
                <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--brand-gold)]">
                    {label}
                </h3>
            )}
            <div className="flex gap-2 md:gap-4 text-center">
                {timeLeft.months > 0 && (
                    <div className="flex flex-col">
                        <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px] border border-gray-700 shadow-[0_4px_0_0_rgba(255,255,255,0.1)]">
                            <span className="text-2xl md:text-4xl font-mono font-bold text-white">
                                {formatNumber(timeLeft.months)}
                            </span>
                        </div>
                        <span className="text-xs md:text-sm mt-2 text-gray-400 uppercase">月</span>
                    </div>
                )}

                <div className="flex flex-col">
                    <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px] border border-gray-700 shadow-[0_4px_0_0_rgba(255,255,255,0.1)]">
                        <span className="text-2xl md:text-4xl font-mono font-bold text-white">
                            {formatNumber(timeLeft.days)}
                        </span>
                    </div>
                    <span className="text-xs md:text-sm mt-2 text-gray-400 uppercase">日</span>
                </div>

                <div className="flex flex-col">
                    <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px] border border-gray-700 shadow-[0_4px_0_0_rgba(255,255,255,0.1)]">
                        <span className="text-2xl md:text-4xl font-mono font-bold text-white">
                            {formatNumber(timeLeft.hours)}
                        </span>
                    </div>
                    <span className="text-xs md:text-sm mt-2 text-gray-400 uppercase">時</span>
                </div>

                <div className="flex flex-col">
                    <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px] border border-gray-700 shadow-[0_4px_0_0_rgba(255,255,255,0.1)]">
                        <span className="text-2xl md:text-4xl font-mono font-bold text-white">
                            {formatNumber(timeLeft.minutes)}
                        </span>
                    </div>
                    <span className="text-xs md:text-sm mt-2 text-gray-400 uppercase">分</span>
                </div>

                <div className="flex flex-col">
                    <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px] border border-gray-700 shadow-[0_4px_0_0_rgba(255,255,255,0.1)]">
                        <span className="text-2xl md:text-4xl font-mono font-bold text-[var(--brand-red)]">
                            {formatNumber(timeLeft.seconds)}
                        </span>
                    </div>
                    <span className="text-xs md:text-sm mt-2 text-gray-400 uppercase">秒</span>
                </div>
            </div>
            <div className="text-sm text-gray-400 pt-2">
                Until {targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} 23:59
            </div>
        </div>
    );
}
