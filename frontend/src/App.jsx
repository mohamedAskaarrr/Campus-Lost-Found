import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import Home from './pages/Home'
import ReportLost from './pages/ReportLost'
import ReportFound from './pages/ReportFound'
import MyReports from './pages/MyReports'
import MatchResults from './pages/MatchResults'
import MatchDetail from './pages/MatchDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toast />
      <main>
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/report-lost"         element={<ReportLost />} />
          <Route path="/report-found"        element={<ReportFound />} />
          <Route path="/my-reports"          element={<MyReports />} />
          <Route path="/matches/:lostId"     element={<MatchResults />} />
          <Route path="/match/:lostId/:foundId" element={<MatchDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
