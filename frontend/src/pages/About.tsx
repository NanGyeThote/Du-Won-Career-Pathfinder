import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import Container from '../components/ui/Container';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-main-gradient text-white">
      <div className="flex-1">
        <Container size="md" className="section pt-24">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="heading-hero text-white mb-4">About Our Platform</h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Welcome to the AI-Powered Career Guidance Platform, a project developed by students from the University of Information Technology.
            </p>
          </motion.div>

          {/* Our Mission Section */}
          <motion.div 
            className="card-base card-content mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-career-accent mb-4">Our Mission</h2>
            <p className="text-white/80 leading-relaxed">
              Our mission is to empower students and professionals to make informed decisions about their career paths. We believe that everyone deserves to find a fulfilling career that aligns with their passions and skills. By leveraging the power of artificial intelligence and knowledge engineering, we provide personalized, data-driven insights to guide users through the complex and ever-changing landscape of the modern workforce.
            </p>
          </motion.div>

          {/* Our Team Section */}
          <motion.div 
            className="card-base card-content mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-developer-accent mb-4">Our Team</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Team Member 1 */}
              <div className="text-center">
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-4xl">👨‍💻</span>
                </div>
                <h3 className="font-semibold text-white">Shin Thant Phyo</h3>
                <p className="text-sm text-white/70">Lead Developer</p>
              </div>
              {/* Team Member 2 */}
              <div className="text-center">
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-4xl">👩‍🔬</span>
                </div>
                <h3 className="font-semibold text-white">Thet Hmue Khin</h3>
                <p className="text-sm text-white/70">AI/ML Engineer</p>
              </div>
              {/* Team Member 3 */}
              <div className="text-center">
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-4xl">👩‍🔬</span>
                </div>
                <h3 className="font-semibold text-white">Pyae Linn</h3>
                <p className="text-sm text-white/70">AI/ML Engineer</p>
              </div>
              {/* Team Member 4 */}
              <div className="text-center">
                <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-4xl">🎨</span>
                </div>
                <h3 className="font-semibold text-white">Kaung Myat Kyaw</h3>
                <p className="text-sm text-white/70">UX/UI Designer</p>
              </div>
            </div>
          </motion.div>

          {/* Our Technology Section */}
          <motion.div 
            className="card-base card-content mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-career-accent mb-4">Our Technology</h2>
            <p className="text-white/80 leading-relaxed mb-6">
              Our platform is built on a modern, robust technology stack to deliver a seamless and intelligent experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">React</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">TypeScript</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">Tailwind CSS</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">FastAPI</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">Python</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">LangChain</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">Ollama</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm">ChromaDB</span>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div 
            className="card-base card-content mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="w-12 h-12 bg-career-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-career-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-sm text-white/70">Advanced machine learning for personalized recommendations</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-developer-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-developer-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-2">Knowledge Base</h3>
                <p className="text-sm text-white/70">Comprehensive career information and industry insights</p>
              </div>
            </div>
          </motion.div>

        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default About;
