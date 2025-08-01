import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle,
  Zap,
  Brain,
  Target,
  Video,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";

export default function SimplifiedLandingPage() {
  const features = [
    {
      icon: <Brain className="h-6 w-6 text-purple-500" />,
      title: "AI-Powered Generation",
      description:
        "Just describe what you want to teach, and our AI creates a complete course structure",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
      title: "Multi-Chapter Courses",
      description:
        "Automatically organized into chapters and lessons for better learning flow",
    },
    {
      icon: <Zap className="h-6 w-6 text-green-500" />,
      title: "Ready in Minutes",
      description:
        "From idea to complete course in under 5 minutes - no technical skills needed",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Describe Your Course",
      description: "Tell us what you want to teach in simple words",
    },
    {
      number: "2",
      title: "AI Creates Content",
      description: "Our AI generates structured lessons and chapters",
    },
    {
      number: "3",
      title: "Review & Share",
      description: "Edit if needed, then share with your learners",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white/80 to-blue-50/40 dark:from-purple-900/20 dark:via-gray-900/80 dark:to-blue-900/15"></div>

          {/* Subtle animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full px-4 py-2 text-sm font-medium border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm shadow-lg mb-8">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                AI Course Builder
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-400">
                Create Courses
              </span>
              <br />
              <span className="text-gray-900 dark:text-gray-100">
                with AI in Minutes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-10">
              Transform your knowledge into structured, engaging courses. Just
              describe what you want to teach, and our AI handles the rest.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 group px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <Link href="/auth/sign-up" className="flex items-center gap-3">
                  <Target className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Try It Free - Create Your First Course</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-purple-300/70 dark:border-purple-600/70 text-purple-700 dark:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-900/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group backdrop-blur-sm px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <Link href="#demo" className="flex items-center gap-3">
                  <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Watch Demo</span>
                </Link>
              </Button>
            </div>

            {/* Trust indicator */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ✨ No credit card required • 50 free credits to start • Create
              unlimited courses
            </p>
          </div>
        </section>

        {/* Demo Video Section */}
        <section
          id="demo"
          className="py-20 bg-gradient-to-r from-gray-50 to-purple-50/50 dark:from-gray-800/50 dark:to-purple-900/20"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full px-4 py-2 text-sm font-medium border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm shadow-lg mb-6">
                <Video className="h-4 w-4 text-blue-500" />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  Live Demo
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                See It In Action
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Watch how easy it is to create a complete course with our
                AI-powered platform
              </p>
            </div>

            {/* YouTube Video Embed */}
            <div className="relative max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-2">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/swiE2AZZA1I?rel=0&modestbranding=1&showinfo=0"
                    title="Nexable AI Course Builder Demo"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Decorative elements around video */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -top-2 -right-6 w-6 h-6 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full opacity-60 animate-pulse delay-1000"></div>
              <div className="absolute -bottom-4 -left-6 w-10 h-10 bg-gradient-to-r from-teal-400 to-purple-400 rounded-full opacity-40 animate-pulse delay-2000"></div>
              <div className="absolute -bottom-2 -right-4 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60 animate-pulse delay-500"></div>
            </div>

            {/* Call to action after video */}
            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Ready to create your own course like this?
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-300 group px-8 py-4 text-lg font-semibold rounded-xl"
              >
                <Link href="/auth/sign-up" className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Start Creating Now</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Creating professional courses has never been easier. Follow
                these simple steps:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 dark:from-purple-600 dark:to-pink-600"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Why Choose Our AI Course Builder?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Built for educators, trainers, and knowledge sharers who want to
                create impactful learning experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardHeader className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800 text-white relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to Create Your First Course?
            </h2>
            <p className="text-xl mb-10 text-purple-100">
              Join thousands of educators who are already using AI to create
              amazing learning experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <Link href="/auth/sign-up" className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Get Started Free</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-purple-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>50 free credits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Start in 2 minutes</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © 2024 Nexable. Built for educators, by educators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
