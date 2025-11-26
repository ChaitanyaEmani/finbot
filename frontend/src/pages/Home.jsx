// pages/Home.jsx
import React from 'react';
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3, Brain, Wallet, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Get personalized financial advice and spending analysis powered by advanced AI"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Smart Analytics",
      description: "Visualize your spending patterns with intuitive charts and monthly trends"
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Budget Tracking",
      description: "Set budgets, track expenses, and get alerts when you're close to limits"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Bank-level encryption keeps your financial data safe and protected"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Updates",
      description: "Track your transactions instantly and get immediate financial insights"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Savings Goals",
      description: "Set and achieve your financial goals with smart recommendations"
    }
  ];

  const benefits = [
    "Automated transaction categorization",
    "Monthly financial summaries",
    "Personalized savings strategies",
    "Budget alerts and notifications",
    "Expense prediction models",
    "Natural language queries"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-semibold border border-purple-500/30">
                AI-Powered Financial Assistant
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Master Your Money<br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                With AI Intelligence
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Take control of your finances with smart insights, automated tracking, and personalized recommendations. 
              SaveUp helps you save more, spend wisely, and achieve your financial goals.
            </p>
            
            {!token && <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={()=>navigate('/login-signup')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center space-x-2">
                <span>Start Free Trial </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>}
            
            {token && <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={()=>navigate('/budget')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center space-x-2">
                <span>See your budgets</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>}
            
          </div>

          {/* Stats */} 
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {[
              { value: "50K+", label: "Active Users" },
              { value: "₹2.5Cr+", label: "Money Saved" },
              { value: "1M+", label: "Transactions" },
              { value: "4.9★", label: "User Rating" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features for Smart Finance
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to manage your money intelligently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition group hover:transform hover:scale-105">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-400">
              Simple setup, powerful results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create Account", description: "Sign up in seconds with your email" },
              { step: "02", title: "Add Transactions", description: "Import or manually add your financial data" },
              { step: "03", title: "Get Insights", description: "Receive AI-powered recommendations instantly" }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-xl border border-purple-500/20 text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
                {idx < 2 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-purple-500 w-8 h-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose SaveUp?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Experience the future of personal finance management with cutting-edge AI technology 
                that understands your spending habits and helps you make better financial decisions.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1 mt-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30">
              <div className="bg-slate-900 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Monthly Budget</span>
                  <span className="text-green-400 font-semibold">On Track</span>
                </div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-3/4"></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-400">₹45,000 spent</span>
                  <span className="text-gray-400">₹60,000 limit</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-xl p-4">
                  <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                  <div className="text-2xl font-bold text-white">+23%</div>
                  <div className="text-gray-400 text-sm">Savings Growth</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
                  <div className="text-2xl font-bold text-white">156</div>
                  <div className="text-gray-400 text-sm">Transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who are already saving more and spending smarter with SaveUp.
          </p>
          {token && <button onClick={()=>navigate('/chat')} className="bg-white text-purple-900 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-2 mx-auto">
            <span>See Your Budgets</span>
            <ArrowRight className="w-5 h-5" />
          </button>}
          {!token && <button className="bg-white text-purple-900 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-2 mx-auto">
            <span>Start your free trial</span>
            <ArrowRight className="w-5 h-5" />
          </button>}
          <p className="text-gray-400 mt-4">No credit card required • Free 14-day trial</p>
        </div>
      </div>
    </div>
  );
};

export default Home;