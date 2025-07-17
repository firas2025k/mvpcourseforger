"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Loader2,
  ShoppingCart,
  Zap,
  Star,
  Gift,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "../ui/use-toast";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  bonus?: number;
  features: string[];
  priceId: string;
  description: string;
}

interface CreditPurchaseFormProps {
  packageData: CreditPackage;
  currentCredits: number;
}

export default function CreditPurchaseForm({
  packageData,
  currentCredits,
}: CreditPurchaseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/create-credit-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price_id: packageData.priceId,
          credit_amount: packageData.credits + (packageData.bonus || 0),
          package_name: packageData.name,
          success_url: `${window.location.origin}/dashboard/credit?purchase=success`,
          cancel_url: `${window.location.origin}/dashboard/credits/purchase?purchase=cancelled`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { checkout_url } = await response.json();

      if (checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalCredits = packageData.credits + (packageData.bonus || 0);
  const newBalance = currentCredits + totalCredits;

  return (
    <div className="space-y-4">
      {/* Credit Summary */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            Base Credits:
          </span>
          <span className="font-medium">{packageData.credits}</span>
        </div>
        {packageData.bonus && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              Bonus Credits:
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              +{packageData.bonus}
            </span>
          </div>
        )}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total Credits:</span>
            <span className="text-blue-600 dark:text-blue-400">
              {totalCredits}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            New Balance:
          </span>
          <span className="font-medium">{newBalance} credits</span>
        </div>
      </div>

      {/* Purchase Button */}
      <Button
        onClick={handlePurchase}
        disabled={isLoading}
        className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
          packageData.popular
            ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase for ${packageData.price}
          </div>
        )}
      </Button>

      {/* Value Proposition */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-1 text-sm text-slate-600 dark:text-slate-400">
          <CreditCard className="h-4 w-4" />
          Secure payment via Stripe
        </div>

        {packageData.discount && (
          <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400">
            <Gift className="h-4 w-4" />
            You save $
            {(packageData.originalPrice! - packageData.price).toFixed(2)}
          </div>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Credits never expire • Instant activation
        </div>
      </div>

      {/* Special Badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        {packageData.popular && (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
          >
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        )}
        {packageData.bonus && (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          >
            <Zap className="h-3 w-3 mr-1" />
            Bonus Credits
          </Badge>
        )}
        {packageData.discount && (
          <Badge variant="destructive">{packageData.discount}% OFF</Badge>
        )}
      </div>
    </div>
  );
}
