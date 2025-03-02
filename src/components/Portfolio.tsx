'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Github, Linkedin, Mail, ExternalLink, FileText, Download } from 'lucide-react';
import Image from 'next/image';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const Portfolio = () => {
  const [isDark, setIsDark] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Improved scroll tracking for active navigation
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check for preferred color scheme on initial load and set up scroll watchers
  // Check for preferred color scheme on initial load and set up scroll watchers
useEffect(() => {
  if (!isMounted) return; // Skip this effect during SSR

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    // Use the saved preference
    setIsDark(savedTheme === 'dark');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Fall back to system preference if no saved preference
    setIsDark(true);
  }

  // Mark theme as loaded
  setThemeLoaded(true);
  emailjs.init("QGk71WG1DOtpHH9ZO");

  // Function to determine active section based on scroll position
  const handleScrollForNav = () => {
    const scrollPosition = window.scrollY + 100; // Add offset for navbar height
    
    // Get all sections and determine which one is current
    const sections = document.querySelectorAll('section[id]');
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionBottom = sectionTop + section.getBoundingClientRect().height;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        currentSection = section.id;
      }
    });
    
    if (currentSection !== '') {
      setActiveSection(currentSection);
    }
  };

  // Scroll to top button visibility
  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300);
    handleScrollForNav(); // Call the nav update function on every scroll
  };

  window.addEventListener('scroll', handleScroll);

  // Call once on initial load to set the correct active section
  handleScrollForNav();

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, [isMounted]); // Add isMounted as a dependency

  // Enhanced color schemes with more vibrant gradients and better contrast
  const colors = {
    light: {
      background: "bg-gradient-to-br from-blue-50 via-white to-amber-50",
      nav: "bg-white/90 backdrop-blur-md border-blue-100 !text-slate-900",
      text: "text-gray-900",
      textSecondary: "text-gray-700",
      accent: "text-blue-600",
      gradientText: "from-blue-600 via-blue-500 to-teal-500",
      card: "bg-white/80 border-blue-100",
      cardBg: "bg-white/80",
      button: "from-blue-600 to-teal-500 text-white",
      buttonOutline: "border-blue-200 text-blue-700",
      tagBg: "from-blue-100 to-teal-100",
      tagText: "text-blue-700",
      iconBg: "bg-white/80",
      activeNav: "text-blue-600 font-medium"
    },
    dark: {
      background: "bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950",
      nav: "bg-gray-900/90 backdrop-blur-md border-blue-900/40 text-gray-300",
      text: "text-gray-100",
      textSecondary: "text-gray-300",
      accent: "text-blue-400",
      gradientText: "from-blue-400 via-blue-300 to-teal-300",
      card: "bg-gray-800/70 border-blue-900/40",
      cardBg: "bg-gray-800/40",
      button: "from-blue-600 to-teal-500 text-white",
      buttonOutline: "border-blue-700 text-blue-300",
      tagBg: "from-blue-900/60 to-teal-900/60",
      tagText: "text-blue-300",
      iconBg: "bg-gray-800/70",
      activeNav: "text-blue-400 font-medium"
    }
  };

  // Get current theme - but provide a default for server-side rendering
  const theme = isMounted ? (isDark ? colors.dark : colors.light) : colors.light;

  const toggleTheme = () => {
    if (!isMounted) return; // Skip during SSR
    const newTheme = !isDark;
    setIsDark(newTheme);
    // Save to localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, sectionId: string) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    if (!isMounted) return; // Skip during SSR
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (e: { target: { id: any; value: any; }; }) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "messages"), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        timestamp: serverTimestamp()
      });

      // Also send email notification using Email.js
      await emailjs.send(
        'service_5xos8qb',
        'template_vr3nerb',
        {
          name: formData.name,
          email: formData.email,
          message: formData.message
        },
        'QGk71WG1DOtpHH9ZO'
      );

      // Reset form
      setFormData({ name: '', email: '', message: '' });
      setFormStatus({
        submitted: true,
        error: false,
        message: 'Message sent successfully! I\'ll get back to you soon.'
      });
    } catch (error) {
      console.error("Error sending message: ", error);
      setFormStatus({
        submitted: true,
        error: true,
        message: 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove this function as it uses localStorage which causes hydration errors
  // const getSplashTheme = () => {
  //   if (typeof window === 'undefined') return false; // For SSR
  //   return localStorage.getItem('theme') === 'dark';
  // };

  // Use isMounted check instead
  const splashIsDark = isMounted && isDark;

  // Return a minimal loading state during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 relative">
            <div className="absolute top-0 left-0 w-full h-full border-8 border-blue-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-8 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="mt-8 text-2xl font-semibold bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 bg-clip-text text-transparent">
            dishita.dev
          </h2>
        </div>
      </div>
    );
  }

  return (
    <>
      {!themeLoaded ? (
        <div className={`min-h-screen flex items-center justify-center ${splashIsDark ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 relative">
              <div className={`absolute top-0 left-0 w-full h-full border-8 ${splashIsDark ? 'border-blue-400/30' : 'border-blue-500/30'} rounded-full`}></div>
              <div className={`absolute top-0 left-0 w-full h-full border-8 border-transparent ${splashIsDark ? 'border-t-blue-400' : 'border-t-blue-500'} rounded-full animate-spin`}></div>
            </div>
            <h2 className={`mt-8 text-2xl font-semibold bg-gradient-to-r ${splashIsDark ? 'from-blue-400 via-blue-300 to-teal-300' : 'from-blue-600 via-blue-500 to-teal-500'} bg-clip-text text-transparent`}>
              dishita.dev
            </h2>
          </div>
        </div>
      ) : (
        <div className={`min-h-screen ${theme.background} ${theme.text} transition-all duration-500`}>
          {/* Navigation - Improved with active state indicators */}
          <nav className={`fixed top-0 w-full ${theme.nav} z-50 border-b shadow-sm transition-all duration-300`}>
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
              <span className={`text-xl font-bold bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent`}>
                dishita.dev
              </span>
              <div className="hidden md:flex items-center gap-8">
                <button
                  onClick={() => scrollToSection(aboutRef, 'about')}
                  className={`transition-all duration-300 relative ${activeSection === 'about' ? theme.activeNav : ''}`}
                >
                  About
                  {activeSection === 'about' && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => scrollToSection(projectsRef, 'projects')}
                  className={`transition-all duration-300 relative ${activeSection === 'projects' ? theme.activeNav : ''}`}
                >
                  Projects
                  {activeSection === 'projects' && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => scrollToSection(contactRef, 'contact')}
                  className={`transition-all duration-300 relative ${activeSection === 'contact' ? theme.activeNav : ''}`}
                >
                  Contact
                  {activeSection === 'contact' && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></span>
                  )}
                </button>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300 flex items-center gap-1 font-medium hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <FileText size={16} />
                  Resume
                </a>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile menu overlay - New addition */}
          <div className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`w-64 h-full ${isDark ? 'bg-gray-900' : 'bg-white'} p-6 flex flex-col gap-6 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <button
                className="self-end p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => scrollToSection(aboutRef, 'about')}
                  className={`p-2 rounded transition-colors ${activeSection === 'about' ? theme.activeNav : ''} hover:bg-gray-100 dark:hover:bg-gray-800`}
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection(projectsRef, 'projects')}
                  className={`p-2 rounded transition-colors ${activeSection === 'projects' ? theme.activeNav : ''} hover:bg-gray-100 dark:hover:bg-gray-800`}
                >
                  Projects
                </button>
                <button
                  onClick={() => scrollToSection(contactRef, 'contact')}
                  className={`p-2 rounded transition-colors ${activeSection === 'contact' ? theme.activeNav : ''} hover:bg-gray-100 dark:hover:bg-gray-800`}
                >
                  Contact
                </button>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FileText size={16} />
                  Resume
                </a>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </div>

          {/* Hero Section - Enhanced with better animations and layout */}
          <section id="hero" className="min-h-screen flex flex-col justify-center relative overflow-hidden">
            {/* Enhanced background elements with more natural animation */}
            <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
            <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse-slow"></div>
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-float"></div>

            <div className="max-w-6xl mx-auto px-6 py-16 pt-32 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:gap-12">
                {/* Image container with improved shadow and border effects */}
                <div className="mb-12 md:mb-0 md:w-2/5 flex justify-center md:justify-start">
                  <div className="relative group">
                    <div style={{ width: '370px', height: '565px' }} className="rounded-md overflow-hidden shadow-xl transition-all duration-500 group-hover:shadow-2xl">
                      <Image
                        src="/images/portrait.png"
                        alt="Dishita Madani"
                        fill
                        objectFit="cover"
                        objectPosition="center top"
                        className="rounded-md transition-all duration-700 group-hover:scale-105"
                        priority
                      />
                    </div>
                    <div className="absolute -bottom-2.5 -right-2.5 w-[390px] h-[585px] border-2 border-blue-500 dark:border-blue-400 rounded-md z-[-1] transition-all duration-500 group-hover:-bottom-4 group-hover:-right-4"></div>
                    <div className="absolute -top-6 -left-6 w-16 h-16 grid grid-cols-4 grid-rows-4 gap-2 transition-all duration-500 group-hover:rotate-12">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse-slow"></div>
                      ))}
                    </div>
                    <div className="absolute top-1/2 -right-8 w-2 h-64 bg-gradient-to-b from-blue-500 to-teal-500 rounded-full transition-all duration-500 group-hover:h-72"></div>
                  </div>
                </div>

                {/* Text content with improved typography and animations */}
                <div className="space-y-6 md:w-3/5">
                  <span className={`${theme.accent} font-medium text-lg inline-block relative overflow-hidden group`}>
                    <span className="relative z-10">Frontend | Full Stack Developer</span>
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400/30 dark:bg-blue-600/30 group-hover:animate-pulse"></span>
                  </span>
                  <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent leading-tight`}>
                    Hi, I&apos;m Dishita Madani
                  </h1>
                  <p className={`text-xl md:text-2xl ${theme.textSecondary} max-w-2xl`}>
                    A passionate developer crafting scalable web applications with modern technologies
                  </p>
                  <div className="flex flex-wrap gap-4 pt-6">
                    <button onClick={() => scrollToSection(projectsRef, 'projects')}
                      className={`px-6 py-3 bg-gradient-to-r ${theme.button} rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 hover:scale-105`}>
                      View My Work
                    </button>
                    <a href="/resume.pdf" target="_blank" rel="noopener noreferrer"
                      className={`px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 hover:scale-105 flex items-center gap-2`}>
                      <FileText size={18} />
                      Download Resume
                    </a>
                    <button onClick={() => scrollToSection(contactRef, 'contact')}
                      className={`px-6 py-3 border rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 ${theme.buttonOutline} hover:bg-blue-50 dark:hover:bg-blue-900/20`}>
                      Get in Touch
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll indicator animation - Enhanced */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer group"
              onClick={() => scrollToSection(aboutRef, 'about')}>
              <span className={`text-sm ${theme.textSecondary} mb-2 transition-all duration-300 group-hover:text-blue-500 dark:group-hover:text-blue-400`}>
                Scroll Down
              </span>
              <div className="w-6 h-10 border-2 rounded-full border-blue-400 dark:border-blue-500 flex justify-center p-1 transition-all duration-300 group-hover:border-blue-600 dark:group-hover:border-blue-300">
                <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce-slow transition-all duration-300 group-hover:bg-blue-600 dark:group-hover:bg-blue-300"></div>
              </div>
            </div>
          </section>

          {/* About Section - Improved card hover effects and layout */}
          <section id="about" ref={aboutRef} className="min-h-screen flex items-center relative py-20">
            <div className="absolute w-96 h-96 bg-blue-300/10 rounded-full blur-3xl right-20 top-20 animate-float"></div>
            <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
              <h2 className={`text-4xl font-bold bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent mb-8`}>
                About Me
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-6">
                  <p className={`text-xl ${theme.textSecondary} leading-relaxed`}>
                    I&apos;m a Full Stack Developer with 2+ years of experience, specializing in React, Next.js, Angular, and Node.js.
                    Currently working at Playpower Labs as a Frontend Developer.
                  </p>
                  <p className={`text-xl ${theme.textSecondary} leading-relaxed`}>
                    My focus is on creating scalable web applications with great user experiences,
                    maintaining high standards of performance and accessibility.
                  </p>
                  <div className="pt-6">
                    <a href="/resume.pdf" target="_blank" rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 ${theme.accent} border border-blue-400 dark:border-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group`}>
                      <Download size={18} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                      <span className="relative overflow-hidden">
                        <span className="relative z-10">View Full Resume</span>
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400/30 dark:bg-blue-600/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                      </span>
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Enhanced skill cards with better hover effects */}
                  <div className={`p-6 ${theme.cardBg} backdrop-blur-sm rounded-lg shadow-md border hover:shadow-lg transition-all duration-300 ${theme.card} transform hover:-translate-y-1 group hover:border-blue-300 dark:hover:border-blue-700`}>
                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>Frontend</h3>
                    <p className={theme.textSecondary}>React, Next.js, Angular, TypeScript</p>
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mt-4 transform origin-left scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  </div>
                  <div className={`p-6 ${theme.cardBg} backdrop-blur-sm rounded-lg shadow-md border hover:shadow-lg transition-all duration-300 ${theme.card} transform hover:-translate-y-1 group hover:border-blue-300 dark:hover:border-blue-700`}>
                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>Backend</h3>
                    <p className={theme.textSecondary}>Node.js, MongoDB, GraphQL</p>
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mt-4 transform origin-left scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  </div>
                  <div className={`p-6 ${theme.cardBg} backdrop-blur-sm rounded-lg shadow-md border hover:shadow-lg transition-all duration-300 ${theme.card} transform hover:-translate-y-1 group hover:border-blue-300 dark:hover:border-blue-700`}>
                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>Tools</h3>
                    <p className={theme.textSecondary}>Git, AWS, Jenkins</p>
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mt-4 transform origin-left scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  </div>
                  <div className={`p-6 ${theme.cardBg} backdrop-blur-sm rounded-lg shadow-md border hover:shadow-lg transition-all duration-300 ${theme.card} transform hover:-translate-y-1 group hover:border-blue-300 dark:hover:border-blue-700`}>
                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>Other</h3>
                    <p className={theme.textSecondary}>WCAG, Agile, JIRA</p>
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mt-4 transform origin-left scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Projects Section - Enhanced cards with better hover effects */}
          <section id="projects" ref={projectsRef} className={`min-h-screen flex items-center relative overflow-hidden py-20 ${isDark ? 'bg-gradient-to-tr from-gray-900 to-blue-950' : 'bg-gradient-to-tr from-blue-50 to-teal-50'}`}>
            <div className="absolute w-96 h-96 bg-blue-300/10 rounded-full blur-3xl -bottom-20 left-20 animate-pulse-slow"></div>
            <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
              <h2 className={`text-4xl font-bold mb-12 bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent`}>
                Featured Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Project 1: Lifeline Blood & Plasma */}
                <div className={`p-6 ${theme.card} backdrop-blur-sm rounded-lg shadow-md border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group hover:border-blue-300 dark:hover:border-blue-700`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-2xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>Lifeline Blood & Plasma</h3>
                    <div className="flex gap-2">
                      <a href="https://github.com/shivanikadam910/lifeline-blood-app" target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors transform hover:scale-110 duration-300">
                        <Github size={20} />
                      </a>
                      <a href="https://www.figma.com/design/kJjEfntV6XbgplBxmOcfLc/SE-project?node-id=0-1&t=6cWiqOzvWVf7OnQL-1" target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors transform hover:scale-110 duration-300">
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                  <p className={`${theme.textSecondary} mb-6`}>
                    Led a team to create a blood and plasma donation website using React and Firebase.
                    Features donor registration, blood type matching, and donation scheduling.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-3 py-1 bg-gradient-to-r ${theme.tagBg} ${theme.tagText} rounded-full text-sm shadow-sm group-hover:shadow transition-all duration-300`}>
                      React
                    </span>
                    <span className={`px-3 py-1 bg-gradient-to-r ${theme.tagBg} ${theme.tagText} rounded-full text-sm shadow-sm group-hover:shadow transition-all duration-300`}>
                      Firebase
                    </span>
                    <span className={`px-3 py-1 bg-gradient-to-r ${theme.tagBg} ${theme.tagText} rounded-full text-sm shadow-sm group-hover:shadow transition-all duration-300`}>
                      HTML/CSS
                    </span>
                  </div>
                  {/* View project link */}
                  <div className="mt-6 pt-4 border-t border-blue-100 dark:border-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="https://github.com/shivanikadam910/lifeline-blood-app" target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 flex items-center gap-1 text-sm hover:underline">
                      View Project <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Project 2: Toys Xchange UI */}
                <div className={`p-6 ${theme.card} backdrop-blur-sm rounded-lg shadow-md border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group hover:border-blue-300 dark:hover:border-blue-700`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-2xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>Toys Xchange UI</h3>
                    <div className="flex gap-2">
                      <a href="https://www.figma.com/design/GmdK510wnvKPq3xCpdYFif/Toys-Xchange-UI?node-id=0-1&t=QLy5YP8TZmrBOCLV-1" target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors transform hover:scale-110 duration-300">
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
                  <p className={`${theme.textSecondary} mb-6`}>
                    Designed a comprehensive UI/UX for a toy exchange application.
                    Created user flows, wireframes, and high-fidelity mockups for an intuitive experience.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-3 py-1 bg-gradient-to-r ${theme.tagBg} ${theme.tagText} rounded-full text-sm shadow-sm group-hover:shadow transition-all duration-300`}>
                      Figma
                    </span>
                    <span className={`px-3 py-1 bg-gradient-to-r ${theme.tagBg} ${theme.tagText} rounded-full text-sm shadow-sm group-hover:shadow transition-all duration-300`}>
                      UI/UX
                    </span>
                    <span className={`px-3 py-1 bg-gradient-to-r ${theme.tagBg} ${theme.tagText} rounded-full text-sm shadow-sm group-hover:shadow transition-all duration-300`}>
                      Prototyping
                    </span>
                  </div>
                  {/* View project link */}
                  <div className="mt-6 pt-4 border-t border-blue-100 dark:border-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="https://www.figma.com/design/GmdK510wnvKPq3xCpdYFif/Toys-Xchange-UI?node-id=0-1&t=QLy5YP8TZmrBOCLV-1" target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 flex items-center gap-1 text-sm hover:underline">
                      View Design <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Project 3: E-Shop Web Application */}
                <div className={`p-6 ${theme.card} backdrop-blur-sm rounded-lg shadow-md border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group hover:border-blue-300 dark:hover:border-blue-700`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-2xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>E-Shop Web Application</h3>
                    <div className="flex gap-2">
                      <a href="https://github.com/dishiita/upgradeshopapp" target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors transform hover:scale-110 duration-300">
                        <Github size={20} />
                      </a>
                    </div>
                  </div>
                  <p className={`${theme.textSecondary} mb-6`}>
                    A responsive e-commerce platform with React Router for seamless navigation and Redux Thunk for state management.
                    Features product listings, cart functionality, and user authentication.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-3 py-1 bg-gradient-to-r ${theme.tagBg} ${theme.tagText} rounded-full text-sm shadow-sm group-hover:shadow transition-all duration-300`}>
                      React
                    </span>
                    <span className={`px-3 py-1 bg-gradient-to-r ${theme.tagBg} ${theme.tagText} rounded-full text-sm shadow-sm group-hover:shadow transition-all duration-300`}>
                      Redux
                    </span>
                    <span className={`px-3 py-1 bg-gradient-to-r ${theme.tagBg} ${theme.tagText} rounded-full text-sm shadow-sm group-hover:shadow transition-all duration-300`}>
                      CSS
                    </span>
                  </div>
                  {/* View project link */}
                  <div className="mt-6 pt-4 border-t border-blue-100 dark:border-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="https://github.com/dishiita/upgradeshopapp" target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 flex items-center gap-1 text-sm hover:underline">
                      View Project <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              {/* "View All Projects" button */}
              <div className="flex justify-center mt-12">
                <a
                  href="https://github.com/dishiita"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-6 py-3 border-2 rounded-lg ${theme.buttonOutline} hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                >
                  <Github size={18} />
                  View All Projects
                </a>
              </div>
            </div>
          </section>

          {/* Contact Section - Enhanced with better hover effects and animations */}
          <section id="contact" ref={contactRef} className={`min-h-screen flex items-center relative overflow-hidden ${isDark ? 'bg-gradient-to-bl from-gray-900 via-blue-950 to-slate-950' : 'bg-gradient-to-bl from-white via-blue-50 to-teal-50'}`}>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-float"></div>
            <div className="max-w-6xl mx-auto px-6 py-16">
              <h2 className={`text-4xl font-bold mb-8 bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent`}>
                Let&apos;s Connect
              </h2>
              <p className={`text-xl ${theme.textSecondary} mb-12 max-w-2xl`}>
                Open to new opportunities and collaborations. Feel free to reach out!
              </p>

              {/* Enhanced contact icons with better hover effects */}
              <div className="flex flex-wrap gap-6">
                {[
                  { href: "https://github.com/dishiita", icon: Github },
                  { href: "https://www.linkedin.com/in/dishita-madani", icon: Linkedin },
                  { href: "mailto:dishitamadani131@gmail.com", icon: Mail },
                  { href: "/resume.pdf", icon: FileText }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={index}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.7)' : '#ffffff',
                        color: isDark ? '#60a5fa' : '#2563eb',
                        borderColor: isDark ? 'rgba(30, 58, 138, 0.4)' : '#dbeafe'
                      }}
                      className="group p-4 rounded-full backdrop-blur-sm border shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
                      <Icon size={24} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    </a>
                  );
                })}
              </div>

              {/* Contact form */}
              <div className={`mt-16 max-w-xl ${theme.card} rounded-lg shadow-lg p-6 backdrop-blur-sm border transition-all duration-300 hover:shadow-xl`}>
                <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Send me a message</h3>

                {formStatus.submitted ? (
                  <div className={`p-4 rounded-lg ${formStatus.error ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                    {formStatus.message}
                    {formStatus.error && (
                      <button
                        onClick={() => setFormStatus({ submitted: false, error: false, message: '' })}
                        className="mt-2 text-sm underline"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="name" className={`block mb-2 ${theme.textSecondary}`}>Name</label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800/60' : 'bg-white'} border ${isDark ? 'border-blue-900/40' : 'border-blue-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300`}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={`block mb-2 ${theme.textSecondary}`}>Email</label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800/60' : 'bg-white'} border ${isDark ? 'border-blue-900/40' : 'border-blue-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300`}
                        placeholder="Your email"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className={`block mb-2 ${theme.textSecondary}`}>Message</label>
                      <textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800/60' : 'bg-white'} border ${isDark ? 'border-blue-900/40' : 'border-blue-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300`}
                        placeholder="Your message"
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className={`px-6 py-3 bg-gradient-to-r ${theme.button} rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 w-full md:w-auto flex items-center justify-center`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* Footer - New addition */}
          <footer className={`py-8 border-t ${isDark ? 'border-blue-900/40 bg-gray-900/80' : 'border-blue-100 bg-white/80'} backdrop-blur-sm`}>
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <span className={`text-lg font-bold bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent`}>
                  dishita.dev
                </span>
                <p className={`${theme.textSecondary} text-sm mt-2`}>
                  &copy; {new Date().getFullYear()} Dishita Madani. All rights reserved.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a href="https://github.com/dishiita" target="_blank" rel="noopener noreferrer"
                  className={`text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors`}>
                  <Github size={18} />
                </a>
                <a href="https://www.linkedin.com/in/dishita-madani" target="_blank" rel="noopener noreferrer"
                  className={`text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors`}>
                  <Linkedin size={18} />
                </a>
                <a href="mailto:dishitamadani131@gmail.com"
                  className={`text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors`}>
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </footer>

          {/* Scroll to top button - Fixed implementation */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className={`fixed bottom-6 right-6 p-3 rounded-full ${theme.iconBg} border ${isDark ? 'border-blue-900/40' : 'border-blue-100'} shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ${theme.accent} z-20`}
              aria-label="Scroll to top"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Portfolio;
