
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Zap, BookOpen, BarChart2, Lightbulb, Star, Users, Shield, ArrowRight, Sparkles, Trophy, Target, TrendingUp } from 'lucide-react';
import { AuthButton } from "@/components/auth/auth-button";
import { Navbar } from "@/components/landing/Navbar";
import bannerImage from "../assets/images/banner.png";

export default function LandingPage() {
  const features = [
    {
      icon: <Lightbulb className="h-8 w-8 text-purple-500" />,
      title: "AI-Powered Course Creation",
      description: "Generate comprehensive course structures and initial content in minutes using advanced AI, powered by Gemini API.",
      linkText: "Learn More",
      linkHref: "#"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      title: "Intuitive Course Management",
      description: "Easily create, organize, publish, and archive your courses with a user-friendly interface.",
      linkText: "Explore Features",
      linkHref: "#"
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-500" />,
      title: "Engaging Learning Interface",
      description: "Provide learners with an interactive experience, including progress tracking and quizzes to enhance knowledge retention.",
      linkText: "See it in Action",
      linkHref: "#"
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-purple-500" />,
      title: "Subscription Tiers & Analytics",
      description: "Manage user access with flexible subscription plans (Free & Paid) and gain insights with basic admin analytics.",
      linkText: "View Plans",
      linkHref: "#pricing"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "€0",
      period: "per month",
      description: "Get started and create your first course for free.",
      features: [
        "Create up to 1 course",
        "Access your own created courses",
        "Limited to basic course generation",
        "Community Support",
      ],
      cta: "Start For Free",
      href: "/auth/sign-up",
      popular: false
    },
    {
      name: "Basic",
      price: "€10",
      period: "per month",
      description: "For individuals looking to create more.",
      features: [
        "Create up to 5 courses",
        "Advanced AI Course Generation",
        "Customizable Quizzes",
        "Email Support"
      ],
      cta: "Get Started",
      href: "/auth/sign-up?plan=basic",
      popular: false
    },
    {
      name: "Pro",
      price: "€25",
      period: "per month",
      description: "For professionals creating multiple courses.",
      features: [
        "Create up to 15 courses",
        "Advanced AI Course Generation",
        "Customizable Quizzes",
        "Priority Support",
        "Basic Analytics"
      ],
      cta: "Get Started with Pro",
      href: "/auth/sign-up?plan=pro",
      popular: true
    },
    {
      name: "Ultimate",
      price: "€50",
      period: "per month",
      description: "For power users and small teams.",
      features: [
        "Create up to 50 courses",
        "All Pro Features",
        "Dedicated Account Manager",
        "Advanced Security & Compliance",
      ],
      cta: "Get Started",
      href: "/auth/sign-up?plan=ultimate",
      popular: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-purple-50/50 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 text-gray-800 dark:text-gray-200">
      <Navbar />

      {/* Enhanced Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 relative overflow-hidden">
          {/* Background Gradient Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white/90 to-blue-50/60 dark:from-purple-900/30 dark:via-gray-900/80 dark:to-blue-900/20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Enhanced Header with Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-2xl blur-xl"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-pink-500 dark:from-purple-400 dark:via-blue-400 dark:to-pink-400">
              Transform Course Creation with Advanced AI
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
              Stop wrestling with tedious course outlines and content. NexusEd leverages the Gemini API to help you design and launch engaging online courses faster than ever before.
            </p>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
              <Button asChild size="lg" className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 group px-8 py-4">
                <Link href="/auth/sign-up" className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Get Started For Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="relative border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group backdrop-blur-sm px-8 py-4">
                <Link href="#features" className="flex items-center gap-3">
                  <Target className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Enhanced Social Proof */}
            <div className="mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent rounded-2xl blur-xl"></div>
              <div className="relative text-sm text-gray-500 dark:text-gray-400 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 border border-yellow-200/50 dark:border-yellow-700/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-400 animate-pulse" />
                  <Star className="h-5 w-5 text-yellow-400 animate-pulse delay-100" />
                  <Star className="h-5 w-5 text-yellow-400 animate-pulse delay-200" />
                </div>
                <span className="font-medium bg-gradient-to-r from-gray-700 to-purple-700 dark:from-gray-300 dark:to-purple-300 bg-clip-text text-transparent">
                  Loved by creators worldwide
                </span>
              </div>
            </div>

            {/* Enhanced Hero Image */}
            <div className="mt-12 md:mt-16 max-w-5xl mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl scale-105"></div>
              <div className="relative rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm bg-white/10 dark:bg-gray-800/10">
                <Image
                  src="/assets/images/banner.png"
                  alt="NexusEd application banner"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="py-16 md:py-24 relative">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-gray-900/50 dark:via-purple-900/10 dark:to-gray-900/50"></div>
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Enhanced Section Header */}
            <div className="text-center mb-12 md:mb-16 relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-xl blur-xl"></div>
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-400">
                Powerful Features That Set Us Apart
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our cutting-edge AI technology helps you create superior learning experiences with ease.
              </p>
            </div>

            {/* Enhanced Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden bg-white/90 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400/70 dark:hover:border-purple-500/70 group hover:scale-[1.02]">
                  {/* Card Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="relative flex flex-row items-start gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      <div className="relative p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-xl group-hover:scale-110 transition-transform duration-500">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-purple-800 dark:from-gray-100 dark:to-purple-100 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-blue-700 dark:group-hover:from-purple-300 dark:group-hover:to-blue-300 transition-all duration-500">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white/90 to-blue-50/60 dark:from-purple-900/30 dark:via-gray-900/80 dark:to-blue-900/20"></div>
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Enhanced Section Header */}
            <div className="text-center mb-12 md:mb-16 relative">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/30 to-purple-400/30 rounded-xl blur-xl"></div>
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-purple-600 flex items-center justify-center shadow-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-teal-600 to-blue-500 dark:from-purple-400 dark:via-teal-400 dark:to-blue-400">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                Choose the plan that fits your needs. Start for free, upgrade anytime.
              </p>
            </div>

            {/* Enhanced Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch">
              {pricingPlans.map((plan) => (
                <Card key={plan.name} className={`relative flex flex-col overflow-hidden backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] ${
                  plan.popular 
                    ? 'border-2 border-purple-500 dark:border-purple-400 shadow-2xl bg-white/95 dark:bg-gray-800/80 hover:shadow-purple-500/25' 
                    : 'border border-gray-200/50 dark:border-gray-700/50 shadow-xl bg-white/90 dark:bg-gray-800/70 hover:shadow-2xl hover:border-purple-300/50 dark:hover:border-purple-600/50'
                } rounded-2xl group`}>
                  
                  {/* Background Gradient Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg"></div>
                        <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                          <Star className="h-3 w-3" />
                          POPULAR
                          <Sparkles className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  )}

                  <CardHeader className="relative pb-4 pt-6">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-purple-800 dark:from-gray-100 dark:to-purple-100 bg-clip-text text-transparent">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400 h-12 leading-relaxed">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4 relative">
                      <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      {plan.price !== "Custom" && (
                        <span className="text-base font-medium text-gray-500 dark:text-gray-400 ml-1">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="relative flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start group/item">
                          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300" />
                          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="relative mt-6">
                    <Button asChild className={`w-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25' 
                        : 'bg-gradient-to-r from-gray-100 to-purple-100 hover:from-purple-100 hover:to-pink-100 text-purple-700 dark:from-gray-700 dark:to-purple-800 dark:hover:from-purple-700 dark:hover:to-pink-700 dark:text-purple-200 hover:text-purple-800 dark:hover:text-white'
                    }`}>
                      <Link href={plan.href} className="flex items-center justify-center gap-2">
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 dark:from-purple-700 dark:via-blue-700 dark:to-teal-700"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-blue-600/90 dark:from-purple-800/90 dark:to-blue-700/90"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-white/10 to-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 text-white">
            {/* Enhanced Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Ready to Revolutionize Your Course Creation?
            </h2>
            <p className="text-lg sm:text-xl opacity-90 mb-10 leading-relaxed">
              Join thousands of educators and creators building the future of learning with NexusEd. Get started today!
            </p>
            
            {/* Enhanced CTA Button */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl scale-110"></div>
              <Button asChild size="lg" className="relative bg-white/90 hover:bg-white text-purple-700 hover:text-purple-800 font-semibold shadow-2xl hover:shadow-white/25 transform hover:scale-110 transition-all duration-300 px-12 py-4 rounded-2xl backdrop-blur-sm border border-white/20 group">
                <Link href="/auth/sign-up" className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Sign Up Now & Start Creating
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
            
            <p className="mt-8 text-sm opacity-80 backdrop-blur-sm bg-white/10 rounded-full px-6 py-2 inline-block border border-white/20">
              No credit card required for the free plan.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
