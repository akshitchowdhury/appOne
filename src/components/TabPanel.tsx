import { motion } from 'framer-motion'
import { Server, ShieldCheck, GitBranch, Zap, Terminal, Globe, Bell } from 'lucide-react'

const PHASES = [
  {
    phase: 'Phase 1',
    color: '#5dcaa5',
    title: 'AWS Account Setup',
    steps: [
      { icon: '🔐', label: 'Create AWS account', desc: 'Sign up at aws.amazon.com — free tier gives you 750 hrs/month of t2.micro.' },
      { icon: '👤', label: 'IAM user + MFA', desc: 'Never use the root account. Create an IAM user with AdministratorAccess and enable MFA on both.' },
      { icon: '🔔', label: 'Billing alert', desc: 'CloudWatch alarm → SNS topic → email. Threshold: $1. Fires before you hit anything real.' },
    ],
  },
  {
    phase: 'Phase 2',
    color: '#afa9ec',
    title: 'EC2 + Nginx Deploy',
    steps: [
      { icon: '🖥️', label: 'Launch EC2 (t2.micro)', desc: 'Ubuntu 22.04, t2.micro, 8 GB gp2. Generate a .pem key pair. Note the public IP.' },
      { icon: '🛡️', label: 'Security Group rules', desc: 'Inbound: 22 (your IP only), 80 (0.0.0.0/0), 443 (0.0.0.0/0). Outbound: all.' },
      { icon: '🔗', label: 'Elastic IP', desc: 'Allocate and associate an Elastic IP so the address survives stop/start cycles.' },
      { icon: '📦', label: 'Install Node + Nginx', desc: 'sudo apt update && sudo apt install nginx nodejs npm -y' },
      { icon: '⚛️', label: 'Build React app', desc: 'Clone repo → npm install → npm run build. Output lands in dist/.' },
      { icon: '🌐', label: 'Configure Nginx', desc: 'root /var/www/app/dist; try_files $uri /index.html; — SPA fallback for React Router.' },
    ],
  },
  {
    phase: 'Phase 3',
    color: '#b4b2a9',
    title: 'Proof of Work',
    steps: [
      { icon: '📸', label: 'Screenshots', desc: 'Screenshot the running app in browser, the EC2 console, and the billing alarm.' },
      { icon: '📝', label: 'README', desc: 'Document every step: account setup, SSH commands, Nginx config, gotchas.' },
      { icon: '🐙', label: 'Push to GitHub', desc: 'Public repo with architecture SVG, screenshots folder, and the React source.' },
    ],
  },
]

const STACK = [
  { icon: <Server size={20} />, name: 'EC2 t2.micro', tag: 'Compute', color: '#afa9ec', desc: '1 vCPU, 1 GB RAM. Free for 750 hrs/month in the first 12 months. Enough to serve a static React app to thousands of users.' },
  { icon: <Globe size={20} />, name: 'Nginx 1.24', tag: 'Web Server', color: '#5dcaa5', desc: 'Serves the compiled React bundle as static files. Handles SPA routing via try_files. Extremely low memory footprint on a t2.micro.' },
  { icon: <ShieldCheck size={20} />, name: 'Security Group', tag: 'Firewall', color: '#ef9f27', desc: 'Stateful firewall at the VPC level. Only ports 22/80/443 are open inbound. SSH restricted to your IP.' },
  { icon: <Bell size={20} />, name: 'CloudWatch + SNS', tag: 'Observability', color: '#f0997b', desc: 'Billing alarm fires at $1 estimated monthly charges. SNS delivers the alert via email within minutes.' },
  { icon: <GitBranch size={20} />, name: 'GitHub', tag: 'Source Control', color: '#b4b2a9', desc: 'Source of truth for the React app. Clone directly onto EC2. Push screenshots and README for proof of work.' },
  { icon: <Zap size={20} />, name: 'Vite + React 19', tag: 'Frontend', color: '#c084fc', desc: 'Vite builds the app to a compact dist/ folder. React 19 with TypeScript. Output is pure static HTML/JS/CSS — no Node runtime needed at serve time.' },
]

const COMMANDS = [
  { label: 'SSH into instance', cmd: 'ssh -i your-key.pem ubuntu@<PUBLIC-IP>' },
  { label: 'Install deps', cmd: 'sudo apt update && sudo apt install -y nginx nodejs npm' },
  { label: 'Clone & build', cmd: 'git clone <REPO> app && cd app && npm i && npm run build' },
  { label: 'Deploy to Nginx root', cmd: 'sudo cp -r dist/* /var/www/html/' },
  { label: 'Nginx SPA config', cmd: `sudo tee /etc/nginx/sites-available/default << 'EOF'\nserver {\n  listen 80;\n  root /var/www/html;\n  try_files $uri /index.html;\n}\nEOF` },
  { label: 'Reload Nginx', cmd: 'sudo systemctl reload nginx' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }

function PhaseBreakdown() {
  return (
    <div className="tab-phases">
      {PHASES.map(p => (
        <motion.div key={p.phase} className="phase-block" variants={item}
          style={{ borderLeftColor: p.color }}>
          <div className="phase-label" style={{ color: p.color }}>{p.phase}</div>
          <h3 className="phase-title">{p.title}</h3>
          <div className="phase-steps">
            {p.steps.map(s => (
              <div key={s.label} className="phase-step">
                <span className="step-icon">{s.icon}</span>
                <div>
                  <div className="step-label">{s.label}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function StackDetails() {
  return (
    <motion.div className="stack-grid" variants={container} initial="hidden" animate="show">
      {STACK.map(s => (
        <motion.div key={s.name} className="stack-card" variants={item}
          style={{ borderTopColor: s.color }}>
          <div className="stack-icon" style={{ color: s.color }}>{s.icon}</div>
          <div className="stack-tag" style={{ color: s.color }}>{s.tag}</div>
          <div className="stack-name">{s.name}</div>
          <p className="stack-desc">{s.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

function LiveFlow() {
  return (
    <div className="flow-wrapper">
      <div className="flow-steps">
        {[
          { icon: <Globe size={18} />, label: 'Browser request', desc: 'User visits the public EC2 IP or domain in their browser.' },
          { icon: <ShieldCheck size={18} />, label: 'Security Group check', desc: 'AWS filters the packet — port 80 is open, request passes.' },
          { icon: <Server size={18} />, label: 'Nginx receives', desc: 'Nginx on port 80 matches the request and looks up the file.' },
          { icon: <Zap size={18} />, label: 'Static file served', desc: 'index.html + JS bundle returned — React hydrates in the browser.' },
          { icon: <Terminal size={18} />, label: 'SPA routing', desc: 'React Router handles all client-side navigation without hitting the server.' },
        ].map((step, i) => (
          <motion.div key={i} className="flow-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.3 }}>
            <div className="flow-num">{i + 1}</div>
            <div className="flow-icon">{step.icon}</div>
            <div>
              <div className="flow-label">{step.label}</div>
              <div className="flow-desc">{step.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flow-commands">
        <div className="commands-title">
          <Terminal size={15} /> Key Commands
        </div>
        {COMMANDS.map(c => (
          <div key={c.label} className="command-block">
            <div className="command-label">{c.label}</div>
            <pre className="command-pre">{c.cmd}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TabPanel({ tab }: { tab: number }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {tab === 1 && <PhaseBreakdown />}
      {tab === 2 && <StackDetails />}
      {tab === 3 && <LiveFlow />}
    </motion.div>
  )
}
