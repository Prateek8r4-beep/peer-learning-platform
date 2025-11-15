'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, FileText, Video, Sparkles, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PeerLearn
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Welcome to the Future of Learning</span>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Learn Together,
            <br />
            Grow Together
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students collaborating in real-time study rooms, sharing notes, 
            and learning from each other. Your peer learning journey starts here.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Start Learning Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/rooms">
              <Button size="lg" variant="outline">
                Explore Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Excel</h2>
          <p className="text-gray-600 text-lg">Powerful features designed for collaborative learning</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Study Rooms"
            description="Join subject-specific rooms and collaborate with peers in real-time"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="Share Notes"
            description="Upload and access study materials, PDFs, and documents instantly"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<Video className="w-8 h-8" />}
            title="Live Sessions"
            description="Attend premium lectures from skilled students and mentors"
            gradient="from-green-500 to-emerald-500"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI Matching"
            description="Get matched with compatible peers based on your interests"
            gradient="from-orange-500 to-red-500"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-purple-100">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-purple-100">Study Rooms</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-purple-100">Notes Shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join our community of learners today and experience the power of collaborative education
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 PeerLearn. Made with ❤️ for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }: any) {
  return (
    <div className="group p-6 rounded-2xl bg-white border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300">
      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
