import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, BookOpen, Star, Users, ArrowRight, Sparkles, Trophy, Target, Mic, Presentation, GraduationCap, Briefcase, Rocket, Clock, DollarSign, Brain, Headphones, Play, ChevronRight, Layers, Zap as ZapIcon } from 'lucide-react';
import { Navbar } from "@/components/landing/Navbar";
import bannerImage from "../public/assets/images/banner.png";

export default function LandingPage() {
  const howItWorksSteps = [
    {
      step: "1",
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      title: "Describe your goal",
      description: "Input your topic, goal, and learning style.",
      detail: "Simply tell us what you want to learn and we'll handle the rest"
    },
    {
      step: "2", 
      icon: <Sparkles className="h-8 w-8 text-purple-500" />,
      title: "Let Nexable generate",
      description: "AI builds courses, slides, and voice coaches instantly.",
      detail: "Our AI creates structured content tailored to your needs"
    },
    {
      step: "3",
      icon: <Rocket className="h-8 w-8 text-purple-500" />,
      title: "Learn your way", 
      description: "Study through structured content or live audio sessions.",
      detail: "Choose your preferred learning method and start growing"
    }
  ];

  const coreFeatures = [
    {
      icon: <GraduationCap className="h-12 w-12 text-purple-500" />,
      title: "AI Course Builder",
      description: "Generate multi-chapter, multi-lesson courses from natural language prompts or PDF uploads. Auto-save and edit your content with ease.",
      features: ["Multi-chapter course generation", "PDF upload support", "Auto-save functionality", "Export as printable PDF"],
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: <Presentation className="h-12 w-12 text-blue-500" />,
      title: "Presentation Builder", 
      description: "Create clean, AI-generated slide decks from prompts or PDFs. Auto-structured format perfect for professional presentations.",
      features: ["AI-generated slide decks", "Professional formatting", "Preview and present mode", "Export capabilities"],
      gradient: "from-blue-500 to-teal-500",
      bgGradient: "from-blue-50 to-teal-50"
    },
    {
      icon: <Mic className="h-12 w-12 text-teal-500" />,
      title: "Live Voice AI Coach",
      description: "Build your own voice coach based on your learning goals. Interactive real-time training sessions for skill practice.",
      features: ["Custom voice coaching", "Real-time interaction", "Interview preparation", "Q&A support sessions"],
      gradient: "from-teal-500 to-green-500",
      bgGradient: "from-teal-50 to-green-50"
    }
  ];

  const subscriptionPlans = [
    {
      name: "Basic",
      price: "€10",
      period: "per month",
      credits: "300",
      costPerCredit: "€0.033",
      description: "Perfect for getting started with AI learning.",
      features: [
        "300 credits per month",
        "AI Course Builder access",
        "Presentation Builder",
        "Voice AI Coach",
        "Email Support"
      ],
      cta: "Start Basic Plan",
      href: "/auth/sign-up?plan=basic",
      popular: false,
      savings: null
    },
    {
      name: "Pro",
      price: "€25", 
      period: "per month",
      credits: "1000",
      costPerCredit: "€0.025",
      description: "Best value for regular learners and professionals.",
      features: [
        "1000 credits per month",
        "All Basic features",
        "Priority support",
        "Advanced analytics",
        "Custom voice training"
      ],
      cta: "Get Pro Plan",
      href: "/auth/sign-up?plan=pro",
      popular: true,
      savings: "Save 24%"
    },
    {
      name: "Ultimate",
      price: "€50",
      period: "per month", 
      credits: "2200",
      costPerCredit: "€0.0227",
      description: "For power users and small teams.",
      features: [
        "2200 credits per month",
        "All Pro features", 
        "Dedicated account manager",
        "Advanced security & compliance",
        "Team collaboration tools"
      ],
      cta: "Get Ultimate",
      href: "/auth/sign-up?plan=ultimate",
      popular: false,
      savings: "Save 31%"
    }
  ];

  const creditPacks = [
    {
      name: "Starter",
      price: "€9.99",
      credits: "250",
      costPerCredit: "€0.039",
      description: "Perfect for trying out Nexable",
      icon: <Target className="h-6 w-6" />,
      color: "purple"
    },
    {
      name: "Popular", 
      price: "€19.99",
      credits: "600",
      costPerCredit: "€0.033",
      description: "Great for occasional use",
      icon: <Star className="h-6 w-6" />,
      color: "orange",
      badge: "Most Popular"
    },
    {
      name: "Professional",
      price: "€39.99", 
      credits: "1100",
      costPerCredit: "€0.036",
      description: "For professional projects",
      icon: <Briefcase className="h-6 w-6" />,
      color: "blue"
    },
    {
      name: "Enterprise",
      price: "€69.99",
      credits: "2000", 
      costPerCredit: "€0.035",
      description: "Maximum value pack",
      icon: <Trophy className="h-6 w-6" />,
      color: "green"
    }
  ];

  const targetAudience = [
    {
      icon: <Rocket className="h-8 w-8 text-purple-500" />,
      title: "Early-career professionals",
      description: "Looking to skill up quickly",
      stat: "65% faster skill acquisition"
    },
    {
      icon: <Target className="h-8 w-8 text-blue-500" />,
      title: "Job seekers",
      description: "Prepping for new industries",
      stat: "3x higher interview success"
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-teal-500" />,
      title: "Students", 
      description: "Supplementing study tracks",
      stat: "40% better retention rates"
    },
    {
      icon: <Briefcase className="h-8 w-8 text-pink-500" />,
      title: "Freelancers & entrepreneurs",
      description: "Learning fast for success",
      stat: "2x faster project delivery"
    }
  ];

  const testimonials = [
    {
      quote: "Nexable helped me learn UX in a week for a freelance gig. No fluff, just results.",
      author: "Fatima",
      location: "Tunisia",
      role: "UX Designer",
      rating: 5,
      avatar: "F"
    },
    {
      quote: "Voice coach was surprisingly helpful — I practiced tech interviews with it daily.",
      author: "Khaled", 
      location: "Morocco",
      role: "Software Engineer",
      rating: 5,
      avatar: "K"
    }
  ];

  const whyNexableFeatures = [
    {
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      title: "Credit-based pricing",
      description: "Scalable and fair - only pay for what you use",
      highlight: "Fair & Flexible",
      metric: "Save up to 60%",
      color: "green"
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      title: "AI + Voice integration",
      description: "Unique training edge with built-in AI and voice coaching",
      highlight: "Cutting Edge",
      metric: "3x more effective",
      color: "purple"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "All skill levels supported",
      description: "From learners to professionals - all use cases covered",
      highlight: "Universal",
      metric: "1000+ learners",
      color: "blue"
    },
    {
      icon: <Target className="h-8 w-8 text-teal-500" />,
      title: "Focused content",
      description: "No filler, just structured, actionable learning material",
      highlight: "Quality First",
      metric: "90% completion rate",
      color: "teal"
    },
    {
      icon: <Headphones className="h-8 w-8 text-pink-500" />,
      title: "Your learning style",
      description: "Personalized approach - your knowledge, your way",
      highlight: "Personalized",
      metric: "5x better retention",
      color: "pink"
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-500" />,
      title: "Instant generation",
      description: "Create courses, presentations, and coaches in minutes",
      highlight: "Lightning Fast",
      metric: "< 2 minutes",
      color: "orange"
    }
  ];

  const stats = [
    { number: "1000+", label: "Active Learners", icon: <Users className="h-6 w-6" /> },
    { number: "50K+", label: "Courses Created", icon: <BookOpen className="h-6 w-6" /> },
    { number: "95%", label: "Success Rate", icon: <Trophy className="h-6 w-6" /> },
    { number: "4.9/5", label: "User Rating", icon: <Star className="h-6 w-6" /> }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-purple-50/50 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 text-gray-800 dark:text-gray-200 overflow-x-hidden">
      <Navbar />

      {/* Ultra-Enhanced Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 relative overflow-hidden">
          {/* Advanced Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 via-white/95 to-blue-50/80 dark:from-purple-900/40 dark:via-gray-900/90 dark:to-blue-900/30"></div>
          
          {/* Animated Mesh Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-400/10 via-transparent to-blue-400/10 animate-pulse"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-teal-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce delay-1000"></div>
            <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400/60 rounded-full animate-bounce delay-2000"></div>
            <div className="absolute bottom-40 left-40 w-2 h-2 bg-teal-400/60 rounded-full animate-bounce delay-3000"></div>
            <div className="absolute top-60 left-1/2 w-1 h-1 bg-pink-400/60 rounded-full animate-bounce delay-4000"></div>
            <div className="absolute bottom-60 right-20 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce delay-500"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Enhanced Left Content */}
              <div className="text-center lg:text-left space-y-8">
                {/* Premium Brand Badge */}
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full px-6 py-3 text-sm font-medium border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="relative">
                    <Sparkles className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg animate-pulse"></div>
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                    AI-Powered Learning Platform
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                {/* Enhanced Main Headline */}
                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-400 drop-shadow-sm">
                      Revolutionize
                    </span>
                    <br />
                    <span className="text-gray-900 dark:text-gray-100 drop-shadow-sm">
                      How You Learn.
                    </span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-purple-600 to-pink-500 dark:from-teal-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm">
                      One Prompt at a Time.
                    </span>
                  </h1>
                </div>

                {/* Enhanced Subheadline */}
                <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-sm">
                  Create structured courses, presentations, and voice-based coaching — powered by AI and tailored to your growth.
                </p>
                
                {/* Premium CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 group px-12 py-6 text-lg font-semibold rounded-2xl overflow-hidden">
                    <Link href="#pricing" className="flex items-center gap-3 relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <Trophy className="h-6 w-6 group-hover:scale-110 transition-transform duration-300 relative z-10" />
                      <span className="relative z-10">Start Free with 50 Credits</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="relative border-2 border-purple-300/70 dark:border-purple-600/70 text-purple-700 dark:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-900/30 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group backdrop-blur-sm px-12 py-6 text-lg font-semibold rounded-2xl">
                    <Link href="#demo" className="flex items-center gap-3">
                      <Play className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                      <span>Watch Demo</span>
                    </Link>
                  </Button>
                </div>

                {/* Enhanced Trust Indicators */}
                <div className="flex flex-col sm:flex-row items-center gap-8 text-sm text-gray-500 dark:text-gray-400 justify-center lg:justify-start">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-3 border-white dark:border-gray-800 shadow-lg"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 border-3 border-white dark:border-gray-800 shadow-lg"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-purple-400 border-3 border-white dark:border-gray-800 shadow-lg"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 border-3 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-white font-bold text-xs">
                        +
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-700 dark:text-gray-300">1000+ learners</div>
                      <div className="text-xs text-gray-500">joined this month</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current drop-shadow-sm" />
                      ))}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-700 dark:text-gray-300">4.9/5 rating</div>
                      <div className="text-xs text-gray-500">from 500+ reviews</div>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-purple-200/30 dark:border-purple-700/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <div className="flex justify-center mb-2 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </div>
                      <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{stat.number}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ultra-Enhanced Hero Image */}
              <div className="relative group">
                {/* Enhanced Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-3xl blur-3xl scale-110 group-hover:scale-125 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-l from-blue-400/30 to-teal-400/30 rounded-3xl blur-2xl scale-105 group-hover:scale-115 transition-transform duration-500 delay-200"></div>
                
                {/* Main Image Container with Advanced Effects */}
                <div className="relative rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm bg-white/20 dark:bg-gray-800/20 transform hover:scale-105 transition-all duration-700 group-hover:shadow-purple-500/25">
                  <Image
                    src={bannerImage}
                    alt="Nexable dashboard showing course, presentation, and voice tools"
                    width={1920}
                    height={1080}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  
                  {/* Enhanced Floating Elements */}
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl border border-purple-200/50 dark:border-purple-700/50 group-hover:scale-110 transition-all duration-300">
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 bg-green-400/30 rounded-full blur-sm animate-pulse"></div>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">AI Active</span>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-500"></div>
                    </div>
                  </div>

                  {/* Demo Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
                    <Button size="lg" className="bg-white/90 hover:bg-white text-purple-700 shadow-2xl rounded-full p-6 transform hover:scale-110 transition-all duration-300">
                      <Play className="h-8 w-8 ml-1" />
                    </Button>
                  </div>

                  {/* Floating Feature Badges */}
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <div className="bg-purple-500/90 text-white text-xs font-semibold px-3 py-2 rounded-full backdrop-blur-sm shadow-lg">
                      AI-Powered
                    </div>
                    <div className="bg-blue-500/90 text-white text-xs font-semibold px-3 py-2 rounded-full backdrop-blur-sm shadow-lg">
                      Real-time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced How It Works Section */}
        <section className="py-16 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-gray-900/50 dark:via-purple-900/10 dark:to-gray-900/50"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full px-4 py-2 text-sm font-medium mb-6 border border-purple-200/50 dark:border-purple-700/50">
                <Layers className="h-4 w-4 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">Simple Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-400">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Get started with AI-powered learning in three simple steps
              </p>
            </div>

            <div className="relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-blue-200 to-teal-200 dark:from-purple-700 dark:via-blue-700 dark:to-teal-700 -translate-y-1/2 z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
                {howItWorksSteps.map((step, index) => (
                  <Card key={index} className="relative overflow-hidden bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400/70 dark:hover:border-purple-500/70 group hover:scale-[1.02] rounded-2xl">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                          <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                            {step.icon}
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                      <CardTitle className="text-xl font-semibold mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">{step.title}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">{step.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">{step.detail}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ultra-Enhanced Core Features Section */}
        <section id="features" className="py-16 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white/90 to-blue-50/60 dark:from-purple-900/30 dark:via-gray-900/80 dark:to-blue-900/20"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full px-4 py-2 text-sm font-medium mb-6 border border-purple-200/50 dark:border-purple-700/50">
                <ZapIcon className="h-4 w-4 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">Powerful Tools</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-400">
                Core Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Three powerful AI tools to transform your learning experience
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {coreFeatures.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400/70 dark:hover:border-purple-500/70 group hover:scale-[1.02] rounded-2xl">
                  {/* Feature Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} dark:from-gray-800/50 dark:to-gray-700/50 opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <CardHeader className="text-center relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                        <div className={`relative p-4 bg-gradient-to-r ${feature.bgGradient} dark:from-purple-900/50 dark:to-blue-900/50 rounded-xl group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <ul className="space-y-3">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Feature Preview Button */}
                    <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <Button variant="ghost" size="sm" className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/30 transition-all duration-300 group/btn">
                        <span>Preview Feature</span>
                        <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Ultra-Enhanced Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-gray-900/50 dark:via-purple-900/10 dark:to-gray-900/50"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full px-4 py-2 text-sm font-medium mb-6 border border-purple-200/50 dark:border-purple-700/50">
                <DollarSign className="h-4 w-4 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">Transparent Pricing</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-teal-600 to-blue-500 dark:from-purple-400 dark:via-teal-400 dark:to-blue-400">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
                Choose between subscriptions for best value or credit packs for one-off needs.
              </p>
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/50 dark:to-blue-900/50 rounded-full px-6 py-3 text-sm font-medium border border-green-200/50 dark:border-green-700/50 shadow-lg">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300 font-semibold">Start with 50 free credits</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Ultra-Enhanced Subscriptions */}
            <div className="mb-24">
              <h3 className="text-2xl font-bold text-center mb-16 text-gray-800 dark:text-gray-200">
                Monthly Subscriptions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {subscriptionPlans.map((plan) => (
                  <div key={plan.name} className="relative">
                    {/* Enhanced Badge Positioning */}
                    {plan.popular && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border-3 border-white dark:border-gray-900">
                            <Star className="h-4 w-4 fill-current animate-pulse" />
                            <span>BEST VALUE</span>
                            <Sparkles className="h-4 w-4 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Savings Badge */}
                    {plan.savings && (
                      <div className="absolute -top-3 -right-3 z-20">
                        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
                          {plan.savings}
                        </div>
                      </div>
                    )}

                    <Card className={`relative h-full flex flex-col overflow-visible backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] ${
                      plan.popular 
                        ? 'border-3 border-purple-500 dark:border-purple-400 shadow-2xl bg-white/98 dark:bg-gray-800/95 hover:shadow-purple-500/25 ring-4 ring-purple-200/50 dark:ring-purple-700/50' 
                        : 'border-2 border-gray-200/50 dark:border-gray-700/50 shadow-xl bg-white/95 dark:bg-gray-800/80 hover:shadow-2xl hover:border-purple-300/50 dark:hover:border-purple-600/50'
                    } rounded-3xl group`}>
                      
                      <CardHeader className={`relative pb-6 ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                        <div className="text-center">
                          <CardTitle className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">{plan.name}</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400 mb-8 h-12 flex items-center justify-center leading-relaxed">
                            {plan.description}
                          </CardDescription>
                          
                          {/* Ultra-Enhanced Price Display */}
                          <div className="mb-6">
                            <div className="flex items-baseline justify-center gap-2">
                              <span className="text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                                {plan.price}
                              </span>
                              <span className="text-xl font-medium text-gray-500 dark:text-gray-400">
                                {plan.period}
                              </span>
                            </div>
                            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-50/80 dark:bg-gray-800/50 rounded-full px-4 py-2 inline-block">
                              {plan.credits} credits • {plan.costPerCredit} per credit
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-grow px-8">
                        <ul className="space-y-4">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter className="mt-8 px-8 pb-8">
                        <Button asChild className={`w-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl py-4 text-base font-semibold rounded-2xl ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25' 
                            : 'bg-gradient-to-r from-gray-100 to-purple-100 hover:from-purple-100 hover:to-pink-100 text-purple-700 dark:from-gray-700 dark:to-purple-800 dark:text-purple-200 hover:text-purple-800 dark:hover:text-white'
                        }`}>
                          <Link href={plan.href} className="flex items-center justify-center gap-3">
                            <span>{plan.cta}</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Ultra-Enhanced Credit Packs */}
            <div>
              <h3 className="text-2xl font-bold text-center mb-16 text-gray-800 dark:text-gray-200">
                One-Time Credit Packs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {creditPacks.map((pack, index) => (
                  <Card key={pack.name} className="relative overflow-hidden bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/70 dark:hover:border-purple-600/70 group hover:scale-[1.02] rounded-2xl">
                    {/* Enhanced Pack Badge */}
                    {pack.badge && (
                      <div className="absolute -top-3 -right-3 z-20">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
                          {pack.badge}
                        </div>
                      </div>
                    )}
                    
                    {/* Pack Icon with Color */}
                    <div className="absolute top-4 right-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ${
                        pack.color === 'orange' ? 'bg-gradient-to-r from-orange-400 to-red-400' :
                        pack.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                        pack.color === 'green' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        'bg-gradient-to-r from-purple-400 to-purple-500'
                      }`}>
                        {pack.icon}
                      </div>
                    </div>
                    
                    <CardHeader className="pb-4 pt-8">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{pack.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400 h-10 flex items-center leading-relaxed">
                        {pack.description}
                      </CardDescription>
                      
                      <div className="mt-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {pack.price}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 bg-gray-50/80 dark:bg-gray-800/50 rounded-full px-3 py-1 inline-block">
                          {pack.credits} credits • {pack.costPerCredit} per credit
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardFooter className="pt-2">
                      <Button asChild variant="outline" className="w-full border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-300 hover:scale-105 rounded-xl py-3">
                        <Link href="/dashboard/credit/purchase" className="flex items-center justify-center gap-2">
                          <span>Purchase Pack</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ultra-Enhanced Why Nexable Section */}
        <section className="py-16 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white/90 to-blue-50/60 dark:from-purple-900/30 dark:via-gray-900/80 dark:to-blue-900/20"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full px-4 py-2 text-sm font-medium mb-6 border border-purple-200/50 dark:border-purple-700/50">
                <Trophy className="h-4 w-4 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">Why Choose Us</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-400">
                Why Choose Nexable?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Discover what makes Nexable the ultimate AI-powered learning platform for modern learners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyNexableFeatures.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400/70 dark:hover:border-purple-500/70 group hover:scale-[1.02] rounded-2xl">
                  {/* Enhanced Highlight Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`bg-gradient-to-r ${
                      feature.color === 'green' ? 'from-green-100 to-green-200 text-green-700 border-green-200' :
                      feature.color === 'blue' ? 'from-blue-100 to-blue-200 text-blue-700 border-blue-200' :
                      feature.color === 'teal' ? 'from-teal-100 to-teal-200 text-teal-700 border-teal-200' :
                      feature.color === 'pink' ? 'from-pink-100 to-pink-200 text-pink-700 border-pink-200' :
                      feature.color === 'orange' ? 'from-orange-100 to-orange-200 text-orange-700 border-orange-200' :
                      'from-purple-100 to-purple-200 text-purple-700 border-purple-200'
                    } dark:from-${feature.color}-900/50 dark:to-${feature.color}-800/50 dark:text-${feature.color}-300 dark:border-${feature.color}-700/50 text-xs font-semibold px-3 py-2 rounded-full border shadow-sm`}>
                      {feature.highlight}
                    </span>
                  </div>

                  {/* Metric Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
                      {feature.metric}
                    </span>
                  </div>
                  
                  <CardHeader className="pb-4 pt-16">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${
                          feature.color === 'green' ? 'from-green-400/20 to-green-500/20' :
                          feature.color === 'blue' ? 'from-blue-400/20 to-blue-500/20' :
                          feature.color === 'teal' ? 'from-teal-400/20 to-teal-500/20' :
                          feature.color === 'pink' ? 'from-pink-400/20 to-pink-500/20' :
                          feature.color === 'orange' ? 'from-orange-400/20 to-orange-500/20' :
                          'from-purple-400/20 to-purple-500/20'
                        } rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
                        <div className={`relative p-4 bg-gradient-to-r ${
                          feature.color === 'green' ? 'from-green-100 to-green-200' :
                          feature.color === 'blue' ? 'from-blue-100 to-blue-200' :
                          feature.color === 'teal' ? 'from-teal-100 to-teal-200' :
                          feature.color === 'pink' ? 'from-pink-100 to-pink-200' :
                          feature.color === 'orange' ? 'from-orange-100 to-orange-200' :
                          'from-purple-100 to-purple-200'
                        } dark:from-${feature.color}-900/50 dark:to-${feature.color}-800/50 rounded-xl group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                          {feature.icon}
                        </div>
                      </div>
                      <div className="flex-1 pt-2">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Bottom CTA */}
            <div className="text-center mt-20">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full px-8 py-4 text-sm font-medium border border-purple-200/50 dark:border-purple-700/50 mb-10 shadow-lg">
                <Trophy className="h-5 w-5 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300 font-semibold">Ready to experience the difference?</span>
                <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
              </div>
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 px-12 py-6 text-lg font-semibold rounded-2xl">
                <Link href="#pricing" className="flex items-center gap-3">
                  <span>Get Started Today</span>
                  <ArrowRight className="h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Enhanced Target Audience Section */}
        <section className="py-16 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-gray-900/50 dark:via-purple-900/10 dark:to-gray-900/50"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full px-4 py-2 text-sm font-medium mb-6 border border-purple-200/50 dark:border-purple-700/50">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">Target Audience</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-400">
                For Whom?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Nexable is designed for ambitious learners at every stage
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {targetAudience.map((audience, index) => (
                <Card key={index} className="text-center p-8 bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50 dark:border-purple-700/50 hover:border-purple-400/70 dark:hover:border-purple-500/70 group hover:scale-[1.02] rounded-2xl">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {audience.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-lg">{audience.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{audience.description}</p>
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-full px-3 py-2 inline-block">
                    {audience.stat}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section className="py-16 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50/80 via-white/90 to-blue-50/60 dark:from-purple-900/30 dark:via-gray-900/80 dark:to-blue-900/20"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full px-4 py-2 text-sm font-medium mb-6 border border-purple-200/50 dark:border-purple-700/50">
                <Star className="h-4 w-4 text-purple-500" />
                <span className="text-purple-700 dark:text-purple-300">User Reviews</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 dark:from-purple-400 dark:via-blue-400 dark:to-teal-400">
                What Our Users Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-8 bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border border-purple-200/50 dark:border-purple-700/50 rounded-2xl hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-0">
                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <blockquote className="text-lg text-gray-700 dark:text-gray-300 mb-6 italic leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{testimonial.author}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{testimonial.location}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Ultra-Enhanced Final CTA Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 dark:from-purple-700 dark:via-blue-700 dark:to-teal-700"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/95 to-blue-600/95 dark:from-purple-800/95 dark:to-blue-700/95"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse delay-3000"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 text-white">
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
                  <Sparkles className="h-10 w-10 text-white animate-pulse" />
                </div>
              </div>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-white drop-shadow-lg">
              Everything you need to master any skill.
            </h2>
            <p className="text-xl sm:text-2xl opacity-90 mb-12 leading-relaxed drop-shadow-sm">
              Join thousands of learners building the future with AI-powered education. Start your journey today!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Button asChild size="lg" className="relative bg-white/95 hover:bg-white text-purple-700 hover:text-purple-800 font-semibold shadow-2xl hover:shadow-white/25 transform hover:scale-110 transition-all duration-300 px-16 py-6 text-lg rounded-3xl backdrop-blur-sm border border-white/30 group">
                <Link href="/auth/sign-up" className="flex items-center gap-4">
                  <Trophy className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  <span>Create Your First Course</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="relative border-3 border-white/40 text-white hover:bg-white/15 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group backdrop-blur-sm px-12 py-6 text-lg rounded-3xl">
                <Link href="/dashboard/voice" className="flex items-center gap-3">
                  <Mic className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  <span>Explore the Voice Coach</span>
                </Link>
              </Button>
            </div>
            
            <p className="mt-10 text-sm opacity-80 backdrop-blur-sm bg-white/15 rounded-full px-8 py-3 inline-block border border-white/30 shadow-lg">
              Start with 50 free credits. No credit card required.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

