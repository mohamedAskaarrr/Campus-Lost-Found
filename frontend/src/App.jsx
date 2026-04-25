import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import ReportLost from './pages/ReportLost'
import ReportFound from './pages/ReportFound'
import MyReports from './pages/MyReports'
import MatchResults from './pages/MatchResults'
import MatchDetail from './pages/MatchDetail'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/report-lost" element={<PageTransition><ReportLost /></PageTransition>} />
        <Route path="/report-found" element={<PageTransition><ReportFound /></PageTransition>} />
        <Route path="/my-reports" element={<PageTransition><MyReports /></PageTransition>} />
        <Route path="/matches/:lostId" element={<PageTransition><MatchResults /></PageTransition>} />
        <Route path="/match/:lostId/:foundId" element={<PageTransition><MatchDetail /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function AppShell() {
  const location = useLocation()
  const [navVisible, setNavVisible] = useState(true)
  const hideTimer = useRef(null)
  const isHome = location.pathname === '/'

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }

    const showForVideoInteraction = () => {
      const overVideo = isHome && window.scrollY < window.innerHeight * 0.85
      if (!overVideo) {
        setNavVisible(true)
        return
      }

      setNavVisible(true)
      clearHideTimer()
      hideTimer.current = window.setTimeout(() => setNavVisible(false), 1700)
    }

    const handleScroll = () => {
      const overVideo = isHome && window.scrollY < window.innerHeight * 0.85
      setNavVisible(!overVideo)
      if (overVideo) showForVideoInteraction()
    }

    if (!isHome) {
      setNavVisible(true)
      clearHideTimer()
      return clearHideTimer
    }

    setNavVisible(false)
    window.addEventListener('mousemove', showForVideoInteraction)
    window.addEventListener('touchstart', showForVideoInteraction)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearHideTimer()
      window.removeEventListener('mousemove', showForVideoInteraction)
      window.removeEventListener('touchstart', showForVideoInteraction)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isHome])

  return (
    <>
      <Navbar cinematic={isHome} visible={navVisible} />
      <Toast />
      <main className={isHome ? 'main-home' : 'main-app'}>
        <AnimatedRoutes />
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
