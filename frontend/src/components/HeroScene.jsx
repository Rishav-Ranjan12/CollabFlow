import React, { useEffect, useRef } from "react"

// WebGL scene: tasks glide left to right across the board, turning
// red (not done) -> yellow (in progress) -> green (done) as they go.
const HeroScene = ({ className = "", onFail, compact = false }) => {
  const mount = useRef(null)
  const failRef = useRef(onFail)
  failRef.current = onFail

  useEffect(() => {
    const el = mount.current
    if (!el) return
    let disposed = false
    let cleanup = () => {}

    import("three").then((THREE) => {
      if (disposed) return
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
      } catch (e) {
        failRef.current && failRef.current()
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setClearColor(0x000000, 0)
      el.appendChild(renderer.domElement)
      renderer.domElement.style.cssText = "width:100%;height:100%;display:block"

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60)
      camera.position.set(0, 0.2, 10.5)

      scene.add(new THREE.AmbientLight(0xffffff, 0.9))
      const key = new THREE.DirectionalLight(0xffffff, 1.6)
      key.position.set(3, 5, 6)
      scene.add(key)
      const rim = new THREE.PointLight(0x7c83ff, 18, 20)
      rim.position.set(-5, 2, 3)
      scene.add(rim)

      const board = new THREE.Group()
      scene.add(board)

      // rounded card body
      const W = 2.05, H = 1.2, R = 0.2
      const shape = new THREE.Shape()
      shape.moveTo(-W / 2 + R, -H / 2)
      shape.lineTo(W / 2 - R, -H / 2)
      shape.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + R)
      shape.lineTo(W / 2, H / 2 - R)
      shape.quadraticCurveTo(W / 2, H / 2, W / 2 - R, H / 2)
      shape.lineTo(-W / 2 + R, H / 2)
      shape.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - R)
      shape.lineTo(-W / 2, -H / 2 + R)
      shape.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + R, -H / 2)
      const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 10 })
      bodyGeo.translate(0, 0, -0.06)
      const lineGeo = new THREE.PlaneGeometry(1, 0.075)
      const dotGeo = new THREE.CircleGeometry(0.1, 24)

      const RED = new THREE.Color("#ef4444"), YEL = new THREE.Color("#eab308"), GRN = new THREE.Color("#22c55e")
      const tmp = new THREE.Color()
      const statusColor = (p, out) => {
        if (p < 0.5) return out.copy(RED).lerp(YEL, p / 0.5)
        return out.copy(YEL).lerp(GRN, (p - 0.5) / 0.5)
      }

      const N = compact ? 5 : 9
      const cards = []
      for (let i = 0; i < N; i++) {
        const g = new THREE.Group()
        const mat = new THREE.MeshStandardMaterial({ color: RED, roughness: 0.38, metalness: 0.08, emissive: RED, emissiveIntensity: 0.5 })
        const body = new THREE.Mesh(bodyGeo, mat)
        g.add(body)
        const wm = () => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
        const t1 = new THREE.Mesh(lineGeo, wm()); t1.scale.x = 1.15 - (i % 3) * 0.18; t1.position.set(-0.15 + (-0.0), 0.27, 0.1)
        t1.position.x = -W / 2 + 0.28 + t1.scale.x / 2
        const t2 = new THREE.Mesh(lineGeo, wm()); t2.scale.x = 0.8; t2.material.opacity = 0.5; t2.position.set(-W / 2 + 0.28 + 0.4, 0.1, 0.1)
        const track = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }))
        track.scale.x = 1.5; track.position.set(-W / 2 + 0.28 + 0.75, -0.3, 0.1)
        const fill = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }))
        fill.position.set(0, -0.3, 0.11)
        const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }))
        dot.position.set(W / 2 - 0.3, 0.27, 0.1)
        g.add(t1, t2, track, fill, dot)
        board.add(g)
        cards.push({ g, mat, fill, dot, body, row: compact ? i % 2 : i % 3, seed: i * 1.7, lift: 0 })
      }

      // soft ground glow lines (three lanes)
      const laneMat = new THREE.LineBasicMaterial({ color: 0x8f8cff, transparent: true, opacity: 0.18 })
      for (let r = 0; r < 3; r++) {
        const pts = [new THREE.Vector3(-5.2, (r - 1) * 1.45 - 0.75, -0.4), new THREE.Vector3(5.2, (r - 1) * 1.45 - 0.75, -0.4)]
        board.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), laneMat))
      }

      // floor labels so the colours are self-explanatory
      if (!compact) {
        const mk = (text, color, x) => {
          const cv = document.createElement("canvas"); cv.width = 512; cv.height = 96
          const cx = cv.getContext("2d")
          cx.fillStyle = color; cx.beginPath(); cx.arc(40, 48, 16, 0, 7); cx.fill()
          cx.shadowColor = color; cx.shadowBlur = 22; cx.fill()
          cx.shadowBlur = 0; cx.fillStyle = "rgba(255,255,255,0.9)"
          cx.font = "700 40px Sora, Plus Jakarta Sans, sans-serif"; cx.textBaseline = "middle"
          cx.fillText(text, 72, 50)
          const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4
          const m = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.64), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }))
          m.position.set(x, -2.8, 0.2); board.add(m)
        }
        mk("NOT DONE", "#ef4444", -3.2); mk("IN PROGRESS", "#eab308", 0.1); mk("DONE", "#22c55e", 3.3)
      }

      // drifting dust
      const DN = 260
      const pos = new Float32Array(DN * 3)
      for (let i = 0; i < DN; i++) { pos[i * 3] = (Math.random() - 0.5) * 16; pos[i * 3 + 1] = (Math.random() - 0.5) * 8; pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1 }
      const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(pos, 3))
      const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xb9bdff, size: 0.045, transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending }))
      scene.add(dust)

      const resize = () => {
        const w = el.clientWidth || 1, h = el.clientHeight || 1
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.position.z = compact ? 9 : (w / h < 1.2 ? 14 : 10.5)
        camera.updateProjectionMatrix()
      }
      resize()
      const ro = new ResizeObserver(resize); ro.observe(el)

      const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
      const onMove = (e) => {
        const r = el.getBoundingClientRect()
        mouse.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2))
        mouse.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2))
      }
      window.addEventListener("pointermove", onMove, { passive: true })

      const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2(9, 9)
      let hovered = null
      const onMove2 = (e) => {
        const r = el.getBoundingClientRect()
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
      }
      window.addEventListener("pointermove", onMove2, { passive: true })
      const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      let visible = true, raf = 0
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting }, { threshold: 0 }); io.observe(el)

      const clock = new THREE.Clock()
      const frame = () => {
        raf = requestAnimationFrame(frame)
        if (!visible || document.hidden) return
        const t = reduce ? 6 : clock.getElapsedTime()
        mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06
        board.rotation.y = -0.42 + mouse.x * 0.16
        board.rotation.x = 0.16 + mouse.y * 0.08
        dust.rotation.y = t * 0.02 + mouse.x * 0.05
        dust.position.y = Math.sin(t * 0.3) * 0.15
        rim.position.x = -5 + mouse.x * 3

        ray.setFromCamera(ndc, camera)
        const hit = ray.intersectObjects(cards.map((c) => c.body), false)[0]
        hovered = hit ? cards.find((c) => c.body === hit.object) : null
        for (const c of cards) {
          const p = ((c.seed / 1.7) / N + t * 0.045) % 1
          const ph = p
          const x = -4.6 + ph * 9.2
          const s = smooth(0, 0.1, ph) * smooth(1, 0.9, ph)
          c.g.position.set(x, (compact ? c.row - 0.5 : c.row - 1) * 1.45 + Math.sin(t * 1.1 + c.seed) * 0.07, (c.row - 1) * 0.35)
          c.g.rotation.z = Math.sin(t * 0.8 + c.seed) * 0.025
          c.lift += ((c === hovered ? 1 : 0) - c.lift) * 0.15
          c.g.position.z += c.lift * 0.9
          c.g.scale.setScalar(Math.max(0.0001, s * (1 + c.lift * 0.1)))
          statusColor(ph, tmp)
          c.mat.color.copy(tmp); c.mat.emissive.copy(tmp)
          c.fill.material.color.setRGB(1, 1, 1)
          const fw = 1.5 * Math.max(0.02, ph)
          c.fill.scale.x = fw
          c.fill.position.x = -W / 2 + 0.28 + fw / 2
        }
        renderer.render(scene, camera)
      }
      frame()

      cleanup = () => {
        cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
        window.removeEventListener("pointermove", onMove); window.removeEventListener("pointermove", onMove2)
        scene.traverse((o) => { o.geometry && o.geometry.dispose && o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()) })
        renderer.dispose()
        renderer.domElement.remove()
      }
    })

    return () => { disposed = true; cleanup() }
  }, [])

  return <div ref={mount} className={className} aria-hidden="true" />
}

export default HeroScene
