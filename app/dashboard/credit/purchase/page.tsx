import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

import {
  Coins,
  ArrowLeft,
  Check,
  Star,
  Zap,
  Crown,
  Gift,
  CreditCard,
  Shield,
  Sparkles,
  TrendingUp,
  BookOpen,
  LayoutGrid,
  Users,
  Clock,
  Target,
  Rocket,
  DollarSign,
  Plus,
  Minus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CreditBalance from "@/components/dashboard/CreditBalance";
import CreditPurchaseForm from "@/components/dashboard/CreditPurchaseForm";

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

const creditPackages: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 250,
    price: 9.99,
    priceId: "price_starter_250",
    description: "Perfect for trying out our AI generation features",
    features: [
      "250 credits included",
      "Create 20-25 basic courses",
      "Generate 125+ presentations",
      "24/7 customer support",
      "No expiration date",
    ],
  },
  {
    id: "popular",
    name: "Popular Pack",
    credits: 600,
    price: 19.99,
    popular: true,
    priceId: "price_popular_600",
    description: "Most popular choice for regular users",
    features: [
      "600 credits included",
      "Create 50+ courses",
      "Generate 300+ presentations",
      "Priority customer support",
      "Advanced AI features",
      "No expiration date",
    ],
  },
  {
    id: "professional",
    name: "Professional Pack",
    credits: 1100,
    price: 39.99,
    priceId: "price_professional_1100",
    description: "Ideal for professionals and content creators",
    features: [
      "1100 credits included",
      "Create 90+ courses",
      "Generate 550+ presentations",
      "Premium customer support",
      "Advanced AI features",
      "Early access to new features",
      "No expiration date",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    credits: 2000,
    price: 69.99,
    priceId: "price_enterprise_2000",
    description: "Perfect for teams and heavy users",
    features: [
      "2000 credits included",
      "Create 160+ courses",
      "Generate 1000+ presentations",
      "Dedicated account manager",
      "Advanced AI features",
      "Early access to new features",
      "Custom integrations",
      "No expiration date",
    ],
  },
];

export default async function CreditsPurchasePage() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Get current user's credit balance
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
  }

  const currentCredits = profileData?.credits ?? 0;

  return (
    <div className="flex-1 w-full flex flex-col gap-8 py-8 md:py-12">
      {/* Enhanced Header */}
      <header className="px-4 md:px-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-3xl blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Link
                  href="/dashboard/credit"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Credits
                </Link>
              </Button>
            </div>

            {/* Current Balance */}
            <div className="hidden md:block">
              <CreditBalance
                initialCredits={currentCredits}
                showTopUpButton={false}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-yellow-900 to-orange-900 dark:from-slate-100 dark:via-yellow-100 dark:to-orange-100 bg-clip-text text-transparent">
                Purchase Credits
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Choose the perfect credit package for your needs
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Current Balance Card */}
      <section className="px-4 md:px-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Coins className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Current Balance
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    You have{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {currentCredits} credits
                    </span>{" "}
                    available
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentCredits}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  credits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Credit Usage Information */}
      <section className="px-4 md:px-6">
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              How Credits Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Course Generation
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Create comprehensive courses with AI. Cost varies by
                    complexity (3-15 credits per course).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                  <LayoutGrid className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Presentation Creation
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Generate beautiful presentations from PDFs or prompts (1-4
                    credits per presentation).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    No Expiration
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your credits never expire. Use them whenever you need to
                    create content.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Credit Packages */}
      <section className="px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 dark:from-slate-100 dark:to-purple-100 bg-clip-text text-transparent mb-4">
            Choose Your Credit Package
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Select the perfect package for your content creation needs. All
            packages include credits that never expire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col ${
                pkg.popular
                  ? "border-2 border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20"
                  : "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50"
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-2 text-sm font-semibold">
                    <Star className="inline h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className={`${pkg.popular ? "pt-12" : "pt-6"}`}>
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg ${
                      pkg.popular
                        ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                        : "bg-gradient-to-r from-blue-500 to-purple-600"
                    }`}
                  >
                    {pkg.popular ? (
                      <Crown className="h-8 w-8 text-white" />
                    ) : pkg.id === "enterprise" ? (
                      <Rocket className="h-8 w-8 text-white" />
                    ) : (
                      <Coins className="h-8 w-8 text-white" />
                    )}
                  </div>

                  <CardTitle className="text-xl font-bold mb-2">
                    {pkg.name}
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {pkg.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {pkg.credits}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      credits
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        €{pkg.price}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col">
                <Separator />

                <div className="space-y-3 flex-1">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="mt-auto">
                  <CreditPurchaseForm
                    packageData={pkg}
                    currentCredits={currentCredits}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Security & Trust */}
      <section className="px-4 md:px-6">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Secure & Trusted Payments
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your payment information is protected with industry-standard
                encryption
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Stripe Powered
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Secure payments processed by Stripe
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  SSL Encrypted
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  256-bit SSL encryption for all transactions
                </p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Trusted by Thousands
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Join thousands of satisfied customers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Section */}
      <section className="px-4 md:px-6">
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-center">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Do credits expire?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No, your credits never expire. You can use them whenever you
                  need to create content.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Can I get a refund?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We offer a 30-day money-back guarantee if you're not satisfied
                  with your purchase.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  How many courses can I create?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  It depends on the complexity. Basic courses use 3-5 credits,
                  while advanced courses may use 10-15 credits.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Is my payment secure?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Yes, all payments are processed securely through Stripe with
                  256-bit SSL encryption.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}