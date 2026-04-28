import { Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SplineScene } from '@/components/ui/splite'

export default function CampusSplinePanel() {
  return (
    <Card className="campus-spline-card">
      <div className="campus-spline-copy">
        <div className="system-pill">
          <Sparkles size={15} />
          Matching engine
        </div>
        <h3>
          Did You lose or find something ?
          <br /> <h2>scroll up and down with the mouse on the robot.</h2>
        </h3>
        <p>
          The visual system keeps the AI layer present without pulling focus from the reporting flow.
        </p>
        <div className="spline-signal-list">
          <span><Search size={14} /> scan</span>
          <span><ShieldCheck size={14} /> verify</span>
          <span><Sparkles size={14} /> match</span>
        </div>
      </div>

      <div className="campus-spline-scene" aria-hidden="true">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
      </div>
    </Card>
  )
}
