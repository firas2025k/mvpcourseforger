import { ThemeSwitcher } from "@/components/theme-switcher";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle, Zap, BookOpen, BarChart2, Lightbulb, Star, Users, Shield } from 'lucide-react'; // Example icons
import { AuthButton } from "@/components/auth/auth-button";
import { Navbar } from "@/components/landing/Navbar";

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
      price: "$0",
      period: "per month",
      description: "Get started and create your first course.",
      features: [
        "1 Course Limit",
        "AI Course Generation (Basic)",
        "Standard Learning Interface",
        "Community Support"
      ],
      cta: "Start For Free",
      href: "/auth/sign-up",
      popular: false
    },
    {
      name: "Pro",
      price: "$49", 
      period: "per month",
      description: "For professionals creating multiple courses.",
      features: [
        "Unlimited Courses",
        "Advanced AI Course Generation",
        "Customizable Quizzes",
        "Priority Support",
        "Basic Analytics"
      ],
      cta: "Get Started with Pro",
      href: "/auth/sign-up?plan=pro", // Example, adjust as needed
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "Tailored to your needs",
      description: "For organizations requiring advanced features and support.",
      features: [
        "All Pro Features",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Security & Compliance",
        "Volume Discounts"
      ],
      cta: "Contact Sales",
      href: "#contact", // Placeholder
      popular: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-900/30 text-gray-800 dark:text-gray-200">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-purple-50 via-white to-white dark:from-purple-900/30 dark:via-gray-900 dark:to-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
              Transform Course Creation with Advanced AI
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10">
              Stop wrestling with tedious course outlines and content. CourseForger leverages the Gemini API to help you design and launch engaging online courses faster than ever before.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 shadow-lg transform hover:scale-105 transition-transform duration-150">
                <Link href="/auth/sign-up">Get Started For Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/30 shadow-lg transform hover:scale-105 transition-transform duration-150">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="ml-2">Loved by creators worldwide</span>
              </div>
            </div>
            {/* Placeholder for hero image/graphic */}
            <div className="mt-16">
              <div className="aspect-video bg-gradient-to-tr from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-xl shadow-2xl flex items-center justify-center p-8">
                <p className="text-white text-2xl font-semibold">[Placeholder: AI generating a course structure]</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-white dark:bg-gray-900/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">Powerful Features That Set Us Apart</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our cutting-edge AI technology helps you create superior learning experiences with ease.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800/70 shadow-lg hover:shadow-xl transition-shadow duration-300 border-transparent hover:border-purple-500/50 dark:hover:border-purple-600/50">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">{feature.icon}</div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                  {/* <CardFooter>
                    <Button variant="link" asChild className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 p-0">
                        <Link href={feature.linkHref}>{feature.linkText} &rarr;</Link>
                    </Button>
                  </CardFooter> */}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/30 dark:to-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-500 dark:from-purple-400 dark:to-teal-400">Simple, Transparent Pricing</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                Choose the plan that fits your needs. Start for free, upgrade anytime.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {pricingPlans.map((plan) => (
                <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-2 border-purple-500 dark:border-purple-400 shadow-2xl relative' : 'border-gray-200 dark:border-gray-700 shadow-lg'} bg-white dark:bg-gray-800/70 rounded-xl`}>
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">POPULAR</div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400 h-12">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                      {plan.price !== "Custom" && <span className="text-base font-medium text-gray-500 dark:text-gray-400">{plan.period}</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-6">
                    <Button asChild className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600' : 'bg-gray-100 hover:bg-gray-200 text-purple-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-purple-300'} shadow-md transform hover:scale-105 transition-transform duration-150`}>
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Revolutionize Your Course Creation?</h2>
            <p className="text-lg sm:text-xl opacity-90 mb-10">
              Join thousands of educators and creators building the future of learning with CourseForger. Get started today!
            </p>
            <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100 dark:bg-gray-100 dark:text-purple-700 dark:hover:bg-gray-200 font-semibold shadow-xl transform hover:scale-105 transition-transform duration-150 px-10 py-3">
              <Link href="/auth/sign-up">Sign Up Now & Start Creating</Link>
            </Button>
            <p className="mt-6 text-sm opacity-80">No credit card required for the free plan.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
