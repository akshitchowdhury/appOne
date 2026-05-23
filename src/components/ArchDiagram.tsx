import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Node {
  id: string
  label: string
  sub: string
  x: number
  y: number
  color: string
  border: string
  textColor: string
  subColor: string
  phase: string
  detail: string
}

const NODES: Node[] = [
  {
    id: 'aws',
    label: 'AWS Account',
    sub: 'Free tier · Billing alerts',
    x: 80, y: 60,
    color: '#08503f',
    border: '#5dcaa5',
    textColor: '#9fe1cb',
    subColor: '#5dcaa5',
    phase: 'Phase 1',
    detail: 'Create an AWS account with free tier access. Set up IAM user with least-privilege permissions. Enable MFA on root account. Configure billing alerts so you never get surprised.',
  },
  {
    id: 'ec2',
    label: 'EC2 Instance',
    sub: 'Ubuntu · t2.micro (free)',
    x: 340, y: 60,
    color: '#3c3489',
    border: '#afa9ec',
    textColor: '#cecbf6',
    subColor: '#afa9ec',
    phase: 'Phase 2',
    detail: 'Launch a t2.micro Ubuntu 22.04 instance — free tier eligible. Create a key pair for SSH access. Assign an Elastic IP so your public address stays stable across reboots.',
  },
  {
    id: 'nginx',
    label: 'React app + Nginx',
    sub: 'npm build · serve static',
    x: 340, y: 220,
    color: '#3c3489',
    border: '#afa9ec',
    textColor: '#cecbf6',
    subColor: '#afa9ec',
    phase: 'Phase 2',
    detail: 'SSH into the instance, clone your repo, run `npm run build`. Install Nginx and point its root to the `dist/` folder. Nginx serves the static bundle over port 80 to any browser.',
  },
  {
    id: 'sg',
    label: 'Security Group',
    sub: 'Port 80 · 443 · 22 open',
    x: 600, y: 140,
    color: '#633806',
    border: '#ef9f27',
    textColor: '#fac775',
    subColor: '#ef9f27',
    phase: 'Phase 2',
    detail: 'Security Groups act as virtual firewalls. Open port 22 (SSH) to your IP only, port 80 (HTTP) and 443 (HTTPS) to 0.0.0.0/0 so the world can reach the app.',
  },
  {
    id: 'billing',
    label: 'Billing Alert',
    sub: 'CloudWatch · SNS email',
    x: 80, y: 220,
    color: '#712b13',
    border: '#f0997b',
    textColor: '#f5c4b3',
    subColor: '#f0997b',
    phase: 'Phase 1',
    detail: 'Create a CloudWatch billing alarm that fires when estimated charges exceed $1. Wire it to an SNS topic that emails you. Keeps free-tier surprises to zero.',
  },
  {
    id: 'github',
    label: 'GitHub Repo',
    sub: 'Screenshots · README',
    x: 340, y: 380,
    color: '#444441',
    border: '#b4b2a9',
    textColor: '#d3d1c7',
    subColor: '#b4b2a9',
    phase: 'Phase 3',
    detail: 'Push your source code, architecture diagram, and screenshots to GitHub. A detailed README documents the setup steps — this is your proof-of-work and portfolio piece.',
  },
  {
    id: 'user',
    label: 'Internet User',
    sub: 'Public IP · browser',
    x: 600, y: 300,
    color: '#08503f',
    border: '#5dcaa5',
    textColor: '#9fe1cb',
    subColor: '#5dcaa5',
    phase: 'Phase 3',
    detail: 'Any browser worldwide hits the EC2 public IP (or domain). The request passes through the Security Group firewall, reaches Nginx, and the React SPA is returned as static HTML/JS/CSS.',
  },
]

interface Arrow {
  from: string
  to: string
  dashed?: boolean
}

const ARROWS: Arrow[] = [
  { from: 'aws', to: 'ec2' },
  { from: 'aws', to: 'billing' },
  { from: 'ec2', to: 'nginx' },
  { from: 'ec2', to: 'sg' },
  { from: 'nginx', to: 'github' },
  { from: 'sg', to: 'user' },
  { from: 'user', to: 'nginx', dashed: true },
]

const W = 160
const H = 56
const CX = W / 2
const CY = H / 2

function getCenter(node: Node) {
  return { x: node.x + CX, y: node.y + CY }
}

function getEdgePoint(from: Node, to: Node) {
  const fc = getCenter(from)
  const tc = getCenter(to)
  const dx = tc.x - fc.x
  const dy = tc.y - fc.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / len
  const ny = dy / len

  const hw = W / 2 + 4
  const hh = H / 2 + 4
  const tx = Math.abs(nx) > 0.001 ? hw / Math.abs(nx) : Infinity
  const ty = Math.abs(ny) > 0.001 ? hh / Math.abs(ny) : Infinity
  const t = Math.min(tx, ty)

  return {
    x1: fc.x + nx * t,
    y1: fc.y + ny * t,
    x2: tc.x - nx * t,
    y2: tc.y - ny * t,
  }
}

const NODE_MAP = Object.fromEntries(NODES.map(n => [n.id, n]))

const PHASE_COLORS: Record<string, string> = {
  'Phase 1': '#5dcaa5',
  'Phase 2': '#afa9ec',
  'Phase 3': '#b4b2a9',
}

interface Props {
  activeNode: string | null
  setActiveNode: (id: string | null) => void
}

export default function ArchDiagram({ activeNode, setActiveNode }: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const selected = activeNode ? NODE_MAP[activeNode] : null

  return (
    <div className="arch-wrapper">
      <div className="arch-canvas-outer">
        <svg
          viewBox="0 0 800 480"
          className="arch-svg"
          onClick={() => setActiveNode(null)}
        >
          <defs>
            <marker id="arrow-grey" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#4a4a5a" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="#a78bfa" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {ARROWS.map(({ from, to, dashed }) => {
            const fn = NODE_MAP[from]
            const tn = NODE_MAP[to]
            const { x1, y1, x2, y2 } = getEdgePoint(fn, tn)
            const isActive = activeNode === from || activeNode === to
            return (
              <line
                key={`${from}-${to}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isActive ? '#a78bfa' : '#3a3a4a'}
                strokeWidth={isActive ? 2 : 1.4}
                strokeDasharray={dashed ? '5 4' : undefined}
                markerEnd={`url(#${isActive ? 'arrow-active' : 'arrow-grey'})`}
                opacity={activeNode && !isActive ? 0.25 : 1}
                style={{ transition: 'all 0.2s' }}
              />
            )
          })}

          {NODES.map(node => {
            const isActive = activeNode === node.id
            const isHovered = hoveredNode === node.id
            const dimmed = activeNode && !isActive

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); setActiveNode(isActive ? null : node.id) }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <rect
                  width={W} height={H} rx={10}
                  fill={node.color}
                  stroke={isActive || isHovered ? node.border : node.border + '66'}
                  strokeWidth={isActive ? 2 : 1}
                  opacity={dimmed ? 0.3 : 1}
                  style={{ transition: 'all 0.2s', filter: isActive ? `drop-shadow(0 0 8px ${node.border}66)` : 'none' }}
                />
                {(isActive || isHovered) && (
                  <rect width={W} height={H} rx={10} fill={node.border} opacity={0.06} />
                )}
                <text x={CX} y={22} textAnchor="middle" dominantBaseline="central"
                  fill={node.textColor} fontSize={13} fontWeight={600}
                  opacity={dimmed ? 0.3 : 1} style={{ transition: 'opacity 0.2s' }}>
                  {node.label}
                </text>
                <text x={CX} y={40} textAnchor="middle" dominantBaseline="central"
                  fill={node.subColor} fontSize={11}
                  opacity={dimmed ? 0.3 : 1} style={{ transition: 'opacity 0.2s' }}>
                  {node.sub}
                </text>
                <text x={CX} y={H + 14} textAnchor="middle" dominantBaseline="central"
                  fill={PHASE_COLORS[node.phase] ?? '#888'} fontSize={10} opacity={0.55}>
                  {node.phase}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="node-detail"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            style={{ borderColor: selected.border + '55' }}
          >
            <div className="node-detail-phase" style={{ color: PHASE_COLORS[selected.phase] }}>
              {selected.phase}
            </div>
            <h3 className="node-detail-title" style={{ color: selected.textColor }}>
              {selected.label}
            </h3>
            <p className="node-detail-sub" style={{ color: selected.subColor }}>
              {selected.sub}
            </p>
            <p className="node-detail-body">{selected.detail}</p>
            <button className="node-detail-close" onClick={() => setActiveNode(null)}>✕ Close</button>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && (
        <p className="arch-hint">Click any node to explore details</p>
      )}
    </div>
  )
}
