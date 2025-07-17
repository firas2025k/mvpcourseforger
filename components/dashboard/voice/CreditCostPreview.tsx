"use client";

import { useEffect, useState } from "react";
import { calculateVoiceAgentCreditCost } from "@/lib/voice-agent-credits";
import { Coins, Info, AlertCircle } from "lucide-react";

interface CreditCostPreviewProps {
  duration: number;
  userCredits?: number;
  className?: string;
}

const CreditCostPreview = ({
  duration,
  userCredits,
  className = "",
}: CreditCostPreviewProps) => {
  const [creditCost, setCreditCost] = useState(0);
  const [breakdown, setBreakdown] = useState({
    baseCost: 2,
    durationCost: 0,
    total: 0,
  });

  useEffect(() => {
    if (duration >= 5 && duration <= 120) {
      const cost = calculateVoiceAgentCreditCost(duration);
      const durationCost = Math.ceil(duration / 10);

      setCreditCost(cost);
      setBreakdown({
        baseCost: 2,
        durationCost: durationCost,
        total: cost,
      });
    }
  }, [duration]);

  const hasInsufficientCredits =
    userCredits !== undefined && userCredits < creditCost;

  if (duration < 5 || duration > 120) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-br from-white/90 via-slate-50/90 to-blue-50/90 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-blue-900/90 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-2 rounded-lg">
          <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Credit Cost Estimate
        </h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 dark:text-slate-400">Base cost:</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {breakdown.baseCost} credits
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-600 dark:text-slate-400">
            Duration cost ({duration} min):
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {breakdown.durationCost} credits
          </span>
        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Total cost:
            </span>
            <span
              className={`font-bold text-lg ${
                hasInsufficientCredits
                  ? "text-red-600 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {creditCost} credits
            </span>
          </div>
        </div>

        {userCredits !== undefined && (
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600 dark:text-slate-400">
                Your balance:
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {userCredits} credits
              </span>
            </div>

            {hasInsufficientCredits ? (
              <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200/50 dark:border-red-700/50">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-red-700 dark:text-red-300 text-xs">
                  <p className="font-medium">Insufficient credits</p>
                  <p>
                    You need {creditCost - userCredits} more credits to create
                    this voice agent.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
                <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-green-700 dark:text-green-300 text-xs">
                  <p className="font-medium">Ready to create</p>
                  <p>
                    After creation, you'll have {userCredits - creditCost}{" "}
                    credits remaining.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <p>
            Credit cost is calculated based on a base fee plus duration. Longer
            sessions require more credits for AI processing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditCostPreview;
