import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, Copy, Check } from 'lucide-react'

import instanceDetails  from '../assets/instanceDetails.png'
import instanceDetails2 from '../assets/instanceDetails2.png'
import statusAlarms     from '../assets/StatusAlarams.png'
import networking       from '../assets/Netwroking.png'
import networking2      from '../assets/NEtwroking2.png'
import security         from '../assets/Security.png'
import storage          from '../assets/Storage.png'
import billingOne       from '../assets/billingOne.png'
import billMetrics      from '../assets/billMetrics.png'

/* ── Types ─────────────────────────────────────────────── */

interface Screenshot {
  src: string
  title: string
  caption: string
  highlight?: string
}

type LineType = 'comment' | 'cmd' | 'blank'
interface TerminalLine { type: LineType; text: string }

interface TerminalStep {
  title: string
  narrative: string
  lines: TerminalLine[]
}

interface ScreenshotSection {
  type: 'screenshots'
  id: string; label: string; color: string; intro: string
  shots: Screenshot[]
}

interface TerminalSection {
  type: 'terminal'
  id: string; label: string; color: string; intro: string
  steps: TerminalStep[]
}

type Section = ScreenshotSection | TerminalSection

/* ── Data ──────────────────────────────────────────────── */

const cmd  = (text: string): TerminalLine => ({ type: 'cmd',     text })
const cmt  = (text: string): TerminalLine => ({ type: 'comment', text })
const gap  = ():             TerminalLine => ({ type: 'blank',   text: '' })

const SECTIONS: Section[] = [
  {
    type: 'screenshots',
    id: 'instance', label: 'Instance', color: '#afa9ec',
    intro: 'The EC2 instance running the application — t2.micro on Ubuntu 22.04, us-east-1c. All health checks are passing and the instance is in a Running state.',
    shots: [
      {
        src: instanceDetails,
        title: 'Instance List & Summary',
        caption: 'EC2 console showing the appOne instance (i-00414c960e5ed2b38) in a Running state. The Details panel confirms the instance type as t2.micro, the public IPv4 address (100.31.139.37), and the availability zone us-east-1c.',
        highlight: 'Running · t2.micro · us-east-1c',
      },
      {
        src: instanceDetails2,
        title: 'Instance Summary — Full Detail',
        caption: 'Expanded view showing the full Instance ID, both public (100.31.139.37) and private (172.31.26.82) IPv4 addresses, the Public DNS hostname, and instance type t2.micro. Elastic IP is not yet associated.',
        highlight: 'Public IP: 100.31.139.37 · Private IP: 172.31.26.82',
      },
      {
        src: statusAlarms,
        title: 'Status Checks & Alarms',
        caption: 'Both the System status check and Instance status check are green (Check passed). System checks validate the underlying host hardware; instance checks validate the OS and network. Passing both confirms the instance is healthy and reachable.',
        highlight: 'System check ✓ · Instance check ✓',
      },
    ],
  },
  {
    type: 'screenshots',
    id: 'networking', label: 'Networking', color: '#5dcaa5',
    intro: 'Networking configuration for the EC2 instance — VPC assignment, subnet, public/private IP mappings, DNS hostnames, and the elastic network interface.',
    shots: [
      {
        src: networking,
        title: 'Networking Tab — IP & DNS',
        caption: 'Shows the VPC ID, Subnet ID (us-east-1c), and both public (100.31.139.37) and private (172.31.26.82) IPv4 addresses. The Public DNS resolves to ec2-100-31-139-37.compute-1.amazonaws.com — this is the hostname used to reach the instance over HTTP.',
        highlight: 'Public DNS: ec2-100-31-139-37.compute-1.amazonaws.com',
      },
      {
        src: networking2,
        title: 'Network Interface & Elastic IP',
        caption: 'Expanded networking view showing the primary elastic network interface (ENI), hostname resolution settings, and the Elastic IP addresses section. No Elastic IP is attached, so the public IP will reassign on stop/start.',
        highlight: 'ENI: eni-0 · No Elastic IP attached',
      },
    ],
  },
  {
    type: 'screenshots',
    id: 'security', label: 'Security', color: '#ef9f27',
    intro: 'Security Group configuration attached to the instance — the firewall rules controlling what traffic is allowed in and out at the VPC boundary.',
    shots: [
      {
        src: security,
        title: 'Security Group Inbound Rules',
        caption: 'The attached Security Group (sg-06c4c331e72f3b8cc, launch-wizard-1) has two inbound rules: port 22 (SSH) restricted to 122.171.19.40/32 (operator IP only), and port 80 (HTTP) open to 0.0.0.0/0. SSH is locked to a single IP while HTTP is public-facing.',
        highlight: 'SSH: 122.171.19.40/32 only · HTTP: 0.0.0.0/0',
      },
    ],
  },
  {
    type: 'screenshots',
    id: 'storage', label: 'Storage', color: '#f0997b',
    intro: 'Block storage configuration — the EBS volume attached to the instance, hosting the OS and the deployed React application bundle.',
    shots: [
      {
        src: storage,
        title: 'EBS Volume — Root Device',
        caption: 'Root EBS volume (vol-0748d2c605bf8b788) attached to /dev/sda1. Volume size is 8 GiB (gp2), state is In-use, attachment status is Attached. This volume holds Ubuntu 22.04, the Nginx installation, and the compiled React dist/ folder.',
        highlight: 'vol-0748d2c605bf8b788 · 8 GiB · /dev/sda1 · Attached',
      },
    ],
  },
  {
    type: 'screenshots',
    id: 'billing', label: 'Billing', color: '#fac775',
    intro: 'CloudWatch Billing Alert configuration — a cost guardrail that fires via SNS email when estimated AWS charges exceed the configured threshold.',
    shots: [
      {
        src: billingOne,
        title: 'CloudWatch Billing Alarm — Overview',
        caption: 'CloudWatch Alarms dashboard showing the Billing Alarm in an OK state. The alarm is active and monitoring — confirming the billing guardrail is in place and charges are within the expected free-tier range.',
        highlight: 'Status: OK · Metric: EstimatedCharges',
      },
      {
        src: billMetrics,
        title: 'Billing Metrics — EstimatedCharges Graph',
        caption: 'EstimatedCharges metric graphed from 2026-05-16 to 2026-05-23. Alarm fires when charges exceed $5 for 1 datapoint within 6 hours. The line stays near zero — confirming free-tier usage throughout the deployment period.',
        highlight: 'Threshold: $5 · Period: 6h · Statistic: Maximum',
      },
    ],
  },
  {
    type: 'terminal',
    id: 'deploy', label: 'Deploy Log', color: '#5dcaa5',
    intro: 'Every shell command used to go from a blank Ubuntu instance to a live React app served over HTTP — with context on what each command actually does and why.',
    steps: [
      {
        title: 'Get Through the Door',
        narrative: 'The .pem key file AWS gives you is intentionally too permissive out of the box — SSH will refuse to connect until you lock it down. Once the permissions are set, you SSH straight into the instance as the default ubuntu user.',
        lines: [
          cmt('# Lock the key file — SSH will flat-out refuse if anyone else can read it'),
          cmd('chmod 400 your-key.pem'),
          gap(),
          cmt('# Jump onto the server — swap in your EC2 public IP'),
          cmd('ssh -i "your-key.pem" ubuntu@<your-ec2-public-ip>'),
        ],
      },
      {
        title: 'Prep the Machine',
        narrative: "A freshly launched Ubuntu instance hasn't been updated since its AMI was built — there could be weeks of patches waiting. We update first, then pull in Node.js 18 via Nodesource's official setup script (Ubuntu's default apt repo ships an older version), and finally install Nginx which will be our web server.",
        lines: [
          cmt('# Grab the latest package index and apply any pending security patches'),
          cmd('sudo apt update && sudo apt upgrade -y'),
          gap(),
          cmt("# Ubuntu's built-in Node is outdated — Nodesource wires up the v18 repo for us"),
          cmd('curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -'),
          cmd('sudo apt install -y nodejs'),
          gap(),
          cmt('# Nginx will sit in front of the app and serve static files to the world'),
          cmd('sudo apt install -y nginx'),
          gap(),
          cmt('# Quick sanity check — confirm both installed and are the right versions'),
          cmd('node -v'),
          cmd('nginx -v'),
        ],
      },
      {
        title: 'Pull the Code & Build',
        narrative: "Clone the repository directly onto the server, install dependencies, then run the production build. Vite compiles everything — React, TypeScript, CSS — into a compact static bundle in dist/. That folder is all Nginx will ever need to serve; Node.js isn't involved at runtime.",
        lines: [
          cmt('# Pull the source code onto the EC2 instance'),
          cmd('git clone https://github.com/yourusername/your-react-app.git'),
          cmd('cd your-react-app'),
          gap(),
          cmt('# Install all JS dependencies exactly as declared in package-lock.json'),
          cmd('npm install'),
          gap(),
          cmt('# Compile React + TypeScript into a static dist/ folder — this is what gets served'),
          cmd('npm run build'),
        ],
      },
      {
        title: 'Wire Up Nginx & Go Live',
        narrative: 'Copy the compiled bundle to the directory Nginx is already watching, do a config dry-run to catch any syntax errors before applying, then restart the service and tell systemd to bring it back automatically if the instance ever reboots.',
        lines: [
          cmt('# Move the build output to where Nginx expects static files to live'),
          cmd('sudo cp -r /home/ubuntu/dist/* /var/www/html/'),
          gap(),
          cmt('# Dry run — Nginx validates its own config before touching anything live'),
          cmd('sudo nginx -t'),
          gap(),
          cmt('# Apply the config and get traffic flowing'),
          cmd('sudo systemctl restart nginx'),
          gap(),
          cmt("# Make sure Nginx comes back up automatically after a reboot — don't skip this"),
          cmd('sudo systemctl enable nginx'),
        ],
      },
    ],
  },
]

/* ── Copy hook ─────────────────────────────────────────── */
function useCopy(text: string) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return { copied, copy }
}

/* ── Terminal block ────────────────────────────────────── */
function TerminalBlock({ step, index, color }: { step: TerminalStep; index: number; color: string }) {
  const raw = step.lines
    .filter(l => l.type !== 'blank')
    .map(l => (l.type === 'cmd' ? `$ ${l.text}` : `# ${l.text}`))
    .join('\n')
  const { copied, copy } = useCopy(raw)

  return (
    <motion.div
      className="term-step"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.26 }}
    >
      {/* Step header */}
      <div className="term-step-header">
        <span className="term-step-num" style={{ background: color + '22', color, borderColor: color + '44' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="term-step-title">{step.title}</span>
      </div>

      {/* Human narrative */}
      <p className="term-narrative">{step.narrative}</p>

      {/* Terminal window */}
      <div className="term-window">
        <div className="term-titlebar">
          <span className="term-dot term-dot--red" />
          <span className="term-dot term-dot--yellow" />
          <span className="term-dot term-dot--green" />
          <span className="term-hostname">ubuntu@ec2-appone  —  bash</span>
          <button className="term-copy" onClick={copy} title="Copy commands">
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
        <div className="term-body">
          {step.lines.map((line, i) => {
            if (line.type === 'blank') return <div key={i} className="term-blank" />
            if (line.type === 'comment') return (
              <div key={i} className="term-line term-line--comment">
                <span className="term-comment-text">{line.text}</span>
              </div>
            )
            return (
              <div key={i} className="term-line term-line--cmd">
                <span className="term-prompt">$</span>
                <span className="term-cmd-text">{line.text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Screenshot card ───────────────────────────────────── */
function ShotCard({ shot, color, index, onExpand }: {
  shot: Screenshot; color: string; index: number; onExpand: () => void
}) {
  return (
    <motion.div
      className="ss-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.22 }}
    >
      <div className="ss-img-wrap" onClick={onExpand}>
        <img src={shot.src} alt={shot.title} className="ss-img" />
        <div className="ss-img-overlay">
          <ZoomIn size={20} />
          <span>Expand</span>
        </div>
      </div>
      <div className="ss-card-body">
        <div className="ss-card-title">{shot.title}</div>
        {shot.highlight && (
          <div className="ss-highlight" style={{ color, borderColor: color + '33', background: color + '10' }}>
            {shot.highlight}
          </div>
        )}
        <p className="ss-caption">{shot.caption}</p>
      </div>
    </motion.div>
  )
}

/* ── Main component ────────────────────────────────────── */
export default function ScreenshotsPage() {
  const [activeSection, setActiveSection] = useState(0)
  const [lightbox, setLightbox] = useState<Screenshot | null>(null)

  const section = SECTIONS[activeSection]
  const tabCount = (s: Section) => s.type === 'screenshots' ? s.shots.length : s.steps.length

  return (
    <div className="ss-shell">

      {/* Sub-tab strip */}
      <div className="ss-tabs">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            className={`ss-tab${activeSection === i ? ' ss-tab--active' : ''}`}
            onClick={() => setActiveSection(i)}
          >
            {activeSection === i && (
              <motion.span
                className="ss-tab-pill"
                layoutId="ss-pill"
                style={{ background: s.color + '22', borderColor: s.color + '55' }}
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            <span className="ss-tab-label">{s.label}</span>
            <span className="ss-tab-count" style={activeSection === i ? { color: s.color } : {}}>
              {tabCount(s)}
            </span>
          </button>
        ))}
      </div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="ss-section"
        >
          {/* Intro bar */}
          <div className="ss-intro" style={{ borderLeftColor: section.color }}>
            <span className="ss-intro-dot" style={{ background: section.color }} />
            {section.intro}
          </div>

          {/* Screenshot grid */}
          {section.type === 'screenshots' && (
            <div className={`ss-grid ss-grid--${
              section.shots.length === 1 ? 'single'
              : section.shots.length === 2 ? 'two'
              : 'three'
            }`}>
              {section.shots.map((shot, i) => (
                <ShotCard
                  key={shot.title}
                  shot={shot}
                  color={section.color}
                  index={i}
                  onExpand={() => setLightbox(shot)}
                />
              ))}
            </div>
          )}

          {/* Terminal steps */}
          {section.type === 'terminal' && (
            <div className="term-steps-list">
              {section.steps.map((step, i) => (
                <TerminalBlock
                  key={step.title}
                  step={step}
                  index={i}
                  color={section.color}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="ss-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="ss-lightbox-panel"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="ss-lightbox-close" onClick={() => setLightbox(null)}>
                <X size={18} />
              </button>
              <img src={lightbox.src} alt={lightbox.title} className="ss-lightbox-img" />
              <div className="ss-lightbox-footer">
                <div className="ss-lightbox-title">{lightbox.title}</div>
                <p className="ss-lightbox-caption">{lightbox.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
