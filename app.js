'use strict';

/* ============================================================
   CONFIG
   ============================================================ */
const STAGES = [
  { id: 'init',       label: 'Initialization' },
  { id: 'deps',        label: 'Dependency Resolution' },
  { id: 'compile',     label: 'Compilation' },
  { id: 'validate',    label: 'Validation' },
  { id: 'deploy',      label: 'Deployment' },
  { id: 'report',      label: 'Execution Report' },
  { id: 'finalize',    label: 'Finalization' },
];

const CLOSING_MESSAGE =
`This internship has been one of the most rewarding learning experiences I've had.

Thank you for answering every "one quick question", sharing your knowledge, reviewing my ideas, and helping me understand a completely new domain.

Every discussion, debugging session, controller walkthrough, and suggestion helped shape the engineer I'm becoming.

Getting converted to a full-time employee is a milestone I'm proud of, and I'm grateful to have had the opportunity to learn from and work alongside such an experienced and supportive team.

Thank you for making me feel like part of the team from day one. Looking forward to building and learning alongside all of you.

- Meghana`;

const KNOWN_ISSUES = [
  {
    id: 'ISSUE-001',
    priority: 'High',
    summary: 'Still says, "One quick question..."',
    resolution: "Won't Fix",
  },
  {
    id: 'ISSUE-002',
    priority: 'Medium',
    summary: 'Keeps trying to automate everything.',
    resolution: 'Working as Intended',
  },
  {
    id: 'ISSUE-003',
    priority: 'Low',
    summary: 'Excessive Python usage detected.',
    resolution: 'Expected Behaviour',
  },
  {
    id: 'ISSUE-004',
    priority: 'Critical',
    summary: 'Has officially become a permanent employee.',
    resolution: 'Cannot Uninstall',
  },
];

/* ============================================================
   SMALL UTILITIES
   ============================================================ */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2), value);
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

const ICONS = {
  check: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  checkSmall: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevron: `<svg class="chev" viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  play: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 3a5 5 0 00-5 5v3.2c0 .6-.2 1.2-.6 1.7L5 15h14l-1.4-2.1c-.4-.5-.6-1.1-.6-1.7V8a5 5 0 00-5-5z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 18a2.5 2.5 0 005 0" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 8v5M12 16.5h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>`,
};

/* ============================================================
   TIMELINE CONTROLLER
   ============================================================ */
class TimelineController {
  constructor(listElement, stages) {
    this.listElement = listElement;
    this.stages = stages;
    this.itemRefs = new Map();
    this._render();
  }

  _render() {
    this.stages.forEach((stage) => {
      const connector = el('div', { class: 't-stage-connector' });
      const dot = el('span', { class: 't-indicator-dot' });
      const check = el('span', { html: ICONS.checkSmall });
      const indicator = el('div', { class: 't-indicator' }, [dot, check]);
      const title = el('span', { class: 't-title' }, stage.label);
      const status = el('span', { class: 't-status' }, 'PENDING');
      const content = el('div', { class: 't-content' }, [title, status]);
      const li = el('li', { class: 't-stage' }, [connector, indicator, content]);
      this.listElement.appendChild(li);
      this.itemRefs.set(stage.id, { li, status });
    });
  }

  setRunning(stageId) {
    const ref = this.itemRefs.get(stageId);
    if (!ref) return;
    ref.li.classList.add('is-current');
    ref.li.classList.remove('is-complete');
    ref.status.textContent = 'RUNNING';
    ref.li.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  setComplete(stageId) {
    const ref = this.itemRefs.get(stageId);
    if (!ref) return;
    ref.li.classList.remove('is-current');
    ref.li.classList.add('is-complete');
    ref.status.textContent = 'COMPLETE';
  }
}

/* ============================================================
   TOAST CONTROLLER
   ============================================================ */
class ToastController {
  constructor(stackElement) {
    this.stack = stackElement;
  }

  show(title, subtitle, { duration = 3200 } = {}) {
    const toast = el('div', { class: 'toast' }, [
      el('span', { class: 'toast-icon', html: ICONS.check }),
      el('div', {}, [
        el('p', { class: 'toast-title' }, title),
        subtitle ? el('p', { class: 'toast-sub' }, subtitle) : null,
      ]),
    ]);
    this.stack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('is-leaving');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
    return toast;
  }
}

/* ============================================================
   CONFETTI CONTROLLER
   ============================================================ */
class ConfettiController {
  constructor(layerElement) {
    this.layer = layerElement;
    this.colors = ['#5B8CFF', '#8B6BFF', '#4DD9E8', '#3DDC97'];
  }

  burst(count = 60) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const size = 6 + Math.random() * 6;
      piece.style.width = `${size}px`;
      piece.style.height = `${size * 0.4}px`;
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = this.colors[i % this.colors.length];
      const duration = 2600 + Math.random() * 1800;
      const delay = Math.random() * 400;
      piece.style.animationDuration = `${duration}ms`;
      piece.style.animationDelay = `${delay}ms`;
      this.layer.appendChild(piece);
      setTimeout(() => piece.remove(), duration + delay + 200);
    }
  }
}

/* ============================================================
   TYPEWRITER HELPERS
   ============================================================ */
async function typeLines(container, lines, { lineDelay = 420, className = 'tw-line' } = {}) {
  for (const line of lines) {
    const node = el('div', { class: className }, line);
    container.appendChild(node);
    // force reflow then reveal, for a clean fade
    requestAnimationFrame(() => node.classList.add('is-shown'));
    await wait(lineDelay);
  }
}

async function typeTerminalLines(container, lines) {
  for (const line of lines) {
    const node = el('div', { class: 'term-line' }, [
      line.success !== false ? el('span', { class: 'term-check', html: ICONS.checkSmall }) : null,
      el('span', {}, line.text),
    ]);
    if (line.muted) node.classList.add('is-muted');
    if (line.success) node.classList.add('is-success');
    if (line.error) node.classList.add('is-error');
    container.appendChild(node);
    container.scrollTop = container.scrollHeight;
    requestAnimationFrame(() => node.classList.add('is-shown'));
    await wait(line.delay ?? 1000);
  }
}

async function animateProgress(fillElement, targetPercent, duration) {
  fillElement.style.transition = `width ${duration}ms linear`;
  // allow layout to settle before triggering the transition
  await wait(20);
  fillElement.style.width = `${targetPercent}%`;
  await wait(duration);
}

/* ============================================================
   REUSABLE EXPANDER COMPONENT
   (shared by "Known Issues" and "Detailed Logs")
   ============================================================ */

function createExpander(title, contentNode, badgeText) {
  const helper = el('span', { class: 'expander-helper' }, 'Click to expand');
  const headText = el('span', { class: 'expander-head-text' }, [
    el('span', { class: 'expander-title-row' }, [
      el('span', { class: 'expander-title' }, title),
      badgeText ? el('span', { class: 'expander-badge' }, badgeText) : null,
    ]),
    helper,
  ]);
  const head = el('button', { class: 'expander-head' }, [
    headText,
    el('span', { html: ICONS.chevron }),
  ]);
  const body = el('div', { class: 'expander-body' }, el('div', { class: 'expander-body-inner' }, contentNode));
  const expander = el('div', { class: 'expander' }, [head, body]);

  head.addEventListener('click', () => {
    const isOpen = expander.classList.toggle('is-open');
    helper.textContent = isOpen ? 'Click to collapse' : 'Click to expand';
  });

  return expander;
}
function buildIssueCard(issue) {
  const priorityClass = `priority-${issue.priority.toLowerCase()}`;
  return el('div', { class: 'issue-card' }, [
    el('div', { class: 'issue-card-top' }, [
      el('span', { class: 'issue-id' }, issue.id),
      el('span', { class: `issue-priority ${priorityClass}` }, `Priority: ${issue.priority}`),
    ]),
    el('p', { class: 'issue-summary' }, issue.summary),
    el('div', { class: 'issue-resolution' }, [
      el('span', { class: 'resolution-label' }, 'Resolution'),
      el('span', { class: 'resolution-value' }, issue.resolution),
    ]),
  ]);
}

function buildIssueList(issues) {
  return el('div', { class: 'issue-list' }, issues.map(buildIssueCard));
}

/* ============================================================
   MAIN APPLICATION
   ============================================================ */
class ConversionApp {
  constructor() {
    this.viewport = document.getElementById('stageViewport');
    this.statusValue = document.getElementById('statusValue');
    this.runtimeValue = document.getElementById('runtimeValue');
    this.timeline = new TimelineController(document.getElementById('timelineList'), STAGES);
    this._enableAutoScroll(this.viewport);
    this.toasts = new ToastController(document.getElementById('toastStack'));
    this.confetti = new ConfettiController(document.getElementById('confettiLayer'));
    this.runtimeSeconds = 0;
    this.runtimeTimer = null;

    this.renderLanding();
  }

  /* ---------- shared helpers ---------- */

  setStatus(text) {
    this.statusValue.textContent = text;
  }

  startRuntime() {
    this.runtimeTimer = setInterval(() => {
      this.runtimeSeconds += 1;
      const mm = String(Math.floor(this.runtimeSeconds / 60)).padStart(2, '0');
      const ss = String(this.runtimeSeconds % 60).padStart(2, '0');
      this.runtimeValue.textContent = `${mm}:${ss}`;
    }, 1000);
  }

  async swapStage(buildFn) {
    const current = this.viewport.querySelector('.stage-panel');
    if (current) {
      current.classList.add('is-leaving');
      await wait(220);
      current.remove();
    }
    const panel = el('div', { class: 'stage-panel' });
    buildFn(panel);
    this.viewport.appendChild(panel);
    return panel;
  }

_enableAutoScroll(container) {
  this.autoScrollEnabled = true;
  const observer = new MutationObserver(() => {
    if (!this.autoScrollEnabled) return;
    container.scrollTop = container.scrollHeight;
  });
  observer.observe(container, { childList: true, subtree: true });
}
  /* ---------- landing ---------- */

  renderLanding() {
    this.swapStage((panel) => {
      const landing = el('div', { class: 'landing' }, [
        el('span', { class: 'badge' }, [
          el('span', { html: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M12 3l7 3v5c0 5-3.4 8.4-7 10-3.6-1.6-7-5-7-10V6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>` }),
          'Internal Engineering Tool',
        ]),
        el('h2', {}, 'Employee Lifecycle Automation'),
        el('p', { class: 'subtitle' }, ''),
        el('div', { class: 'divider' }),
        el('button', { class: 'btn-execute', id: 'executeBtn' }, [
          el('span', { html: ICONS.play }),
          'Execute',
          el('span', { class: 'shimmer' }),
        ]),
      ]);
      panel.classList.add('landing-wrap');
      panel.style.display = 'flex';
      panel.appendChild(landing);

      const btn = landing.querySelector('#executeBtn');
      btn.addEventListener('click', (evt) => {
        const rect = btn.getBoundingClientRect();
        const ripple = el('span', { class: 'ripple' });
        ripple.style.left = `${evt.clientX - rect.left}px`;
        ripple.style.top = `${evt.clientY - rect.top}px`;
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
        this.startRuntime();
        this.setStatus('Executing');
        this.runWorkflow();
      }, { once: true });
    });
  }

  /* ---------- workflow orchestration ---------- */

  async runWorkflow() {
    await this.runInitialization();
    await this.runDependencyResolution();
    await this.runCompilation();
    await this.runValidation();
    await this.runDeployment();
    await this.runExecutionReport();
    await this.runFinalization();
    await this.runFinale();
  }

  /* ---------- stage 1: initialization ---------- */

  async runInitialization() {
    this.timeline.setRunning('init');
    let linesContainer, fill;
    await this.swapStage((panel) => {
      panel.appendChild(el('div', { class: 'stage-head' }, [
        el('p', { class: 'stage-eyebrow' }, 'Stage 01'),
        el('h3', { class: 'stage-title' }, 'Initialization'),
      ]));
      linesContainer = el('div', { class: 'typewriter-lines' });
      fill = el('div', { class: 'progress-fill' });
      panel.appendChild(el('div', { class: 'loader-block' }, [
        linesContainer,
        el('div', { class: 'progress-track' }, fill),
      ]));
    });

    await typeLines(linesContainer, [
      'Initializing...',
 
    ], { lineDelay: 3000 });

    await typeLines(linesContainer, [
      'Checking execution environment...',
      'Loading employee profile...',
      'Preparing automation runtime...',
    ], { lineDelay: 1000 });

    
    await animateProgress(fill, 100, 1400);
    await wait(2500);
    this.timeline.setComplete('init');
  }

  /* ---------- stage 2: dependency resolution ---------- */

  async runDependencyResolution() {
    this.timeline.setRunning('deps');

    const deps = [
      'TeamSupport.dll',
      'Guidance.dll',
      'DomainKnowledge.dll',
      'Coffee.dll',
      'CtrlC_CtrlV.dll',
      'StackOverflowBookmarks.dll',
      'DebugSessions.dll',
      'WorksOnMyMachine.dll',
      'ContinuousLearning.dll',
    ];

    let body, fill;
    await this.swapStage((panel) => {
      panel.appendChild(el('div', { class: 'stage-head' }, [
        el('p', { class: 'stage-eyebrow' }, 'Stage 02'),
        el('h3', { class: 'stage-title' }, 'Dependency Resolution'),
      ]));
      body = el('div', { class: 'terminal-body' });
      fill = el('div', { class: 'progress-fill' });
      const terminal = el('div', { class: 'terminal' }, [
        el('div', { class: 'terminal-bar' }, [
          el('span', { class: 'terminal-dot r' }),
          el('span', { class: 'terminal-dot y' }),
          el('span', { class: 'terminal-dot g' }),
          el('span', { class: 'terminal-name' }, 'resolve — dependencies'),
        ]),
        body,
        el('div', { class: 'terminal-footer' }, el('div', { class: 'progress-track' }, fill)),
      ]);
      panel.appendChild(terminal);
    });

    await typeTerminalLines(body, [{ text: 'Loading Dependencies...', success: true, delay: 2500 }]);
    for (let i = 0; i < deps.length; i++) {
      await animateProgress(fill, Math.round(((i + 1) / deps.length) * 100), 220);
      await typeTerminalLines(body, [{ text: `Loading ${deps[i]}`, success: true, delay: 1500 }]);
      
    }
    await typeTerminalLines(body, [{ text: 'Dependencies Resolved Successfully . . . ', success: true, delay: 3000 }]);
    // await wait(3000);
    this.timeline.setComplete('deps');
  }

  /* ---------- stage 3: compilation ---------- */

  async runCompilation() {
    this.timeline.setRunning('compile');
    // await wait(2000);
    const lines = [
      { text: 'Compiling Meghana Thokala.cpp', success: true ,delay: 1500},
      { text: 'Compiling AutomationEngine.py', success: true ,delay: 1500},
      { text: 'Compiling Mentorship.lib', success: true ,delay: 1500},
      { text: 'Compiling Learnings.cpp', success: true ,delay: 1500},
      { text: 'Linking Objects...', success: false, muted: true, delay: 2000 },
      { text: 'Generating Employee.exe', success: true ,delay: 1500},
    ];

    let body;
    await this.swapStage((panel) => {
      panel.appendChild(el('div', { class: 'stage-head' }, [
        el('p', { class: 'stage-eyebrow' }, 'Stage 03'),
        el('h3', { class: 'stage-title' }, 'Compilation'),
      ]));
      body = el('div', { class: 'terminal-body' });
      const terminal = el('div', { class: 'terminal' }, [
        el('div', { class: 'terminal-bar' }, [
          el('span', { class: 'terminal-dot r' }),
          el('span', { class: 'terminal-dot y' }),
          el('span', { class: 'terminal-dot g' }),
          el('span', { class: 'terminal-name' }, 'gcc — build'),
        ]),
        body,
      ]);
      panel.appendChild(terminal);
    });
    await typeTerminalLines(body, [{ text: 'Starting Compilation...', success: true, delay: 2000 }]);
    // await wait(2000);
    await typeTerminalLines(body, lines);
    // await wait(1000);
    // await typeTerminalLines(body, [{ text: 'Compilation successful.', success: true, delay: 500 }]);
    await wait(1000);
    this.timeline.setComplete('compile');
  }

  /* ---------- stage 4: validation ---------- */

async runValidation() {
  this.timeline.setRunning('validate');
  await this.swapStage((panel) => {
    panel.appendChild(el('div', { class: 'stage-head' }, [
      el('p', { class: 'stage-eyebrow' }, 'Stage 04'),
      el('h3', { class: 'stage-title' }, 'Validation'),
    ]));
    const modal = el('div', { class: 'modal modal-alarm', id: 'validationModal' }, [
      el('div', { class: 'modal-head' }, [
        el('span', { class: 'modal-icon err', html: ICONS.alert }),
        el('h3', {}, 'Validation Error'),
      ]),
      el('div', { class: 'modal-body', id: 'modalBody' }, [
        el('p', {}, 'ConversionToFullTimeFailedException'),
      ]),
    ]);
    panel.appendChild(el('div', { class: 'modal-stage' }, modal));
  });

  const modal = document.getElementById('validationModal');
  const body = document.getElementById('modalBody');

  await wait(2000);
  modal.classList.remove('modal-alarm');

  body.appendChild(el('div', { class: 'retry-indicator' }, [
    el('span', { class: 'spinner' }),
    el('span', {}, 'Retrying...'),
  ]));
  await wait(1500);
  body.querySelector('.retry-indicator').remove();

  body.appendChild(el('p', { class: 'reason-label' }, ''));
  const reasonText = el('p', { class: 'reason-text' }, 'Just kidding 😄');
  body.appendChild(reasonText);
  await wait(1500);

  const icon = modal.querySelector('.modal-icon');
  icon.classList.remove('err');
  icon.classList.add('ok');
  icon.innerHTML = ICONS.check;
  modal.querySelector('h3').textContent = 'Validation Successful';
  modal.querySelector('p').textContent= 'ConversionToFullTimeSuccessful'
  reasonText.textContent = 'Looks like I’m staying!😌';
  await wait(2500);

  this.timeline.setComplete('validate');
}
  /* ---------- stage 5: deployment ---------- */

  async runDeployment() {
    this.timeline.setRunning('deploy');
    let fill, statusLine;
    await this.swapStage((panel) => {
      panel.appendChild(el('div', { class: 'stage-head' }, [
        el('p', { class: 'stage-eyebrow' }, 'Stage 05'),
        el('h3', { class: 'stage-title' }, 'Deployment'),
      ]));
      fill = el('div', { class: 'progress-fill' });
      statusLine = el('div', { class: 'deploy-row' }, [
        el('span', {}, 'Deploying to production...'),
        el('span', { id: 'deployPct' }, '0%'),
      ]);
      panel.appendChild(el('div', { class: 'deploy-stage' }, [
        statusLine,
        el('div', { class: 'progress-track' }, fill),
      ]));
    });

    const pctLabel = document.getElementById('deployPct');
    const steps = [20, 45, 68, 84, 100];
    for (const pct of steps) {
      await animateProgress(fill, pct, 800);
      pctLabel.textContent = `${pct}%`;
    }



    this.toasts.show('Intern Successfully Converted To Full Time', 'Deployment completed without errors.');
    this.confetti.burst(90);
    await wait(1500);
    this.timeline.setComplete('deploy');
  }

  /* ---------- stage 6: execution report ---------- */

  async runExecutionReport() {
    this.timeline.setRunning('report');
    this.autoScrollEnabled = false;
    await this.swapStage((panel) => {
      panel.appendChild(el('div', { class: 'stage-head' }, [
        el('p', { class: 'stage-eyebrow' }, 'Stage 06'),
        el('h3', { class: 'stage-title' }, 'Execution Report'),
      ]));

      const grid = el('div', { class: 'report-grid' }, [
        el('div', { class: 'report-card' }, [
          el('span', { class: 'label' }, 'Execution ID'),
          el('span', { class: 'value' }, 'H661555'),
        ]),
        el('div', { class: 'report-card' }, [
          el('span', { class: 'label' }, 'Duration'),
          el('span', { class: 'value' }, '6 Months'),
        ]),
        el('div', { class: 'report-card' }, [
          el('span', { class: 'label' }, 'Status'),
          el('span', { class: 'value pass' }, 'PASS'),
        ]),
      ]);

      const depItems = [
        'Mentorship', 'Guidance', 'Knowledge Sharing',
        'Countless Questions Answered', 'Patience', 'Encouragement',
      ].map((d) => el('li', {}, [el('span', { class: 'tick', html: ICONS.checkSmall }), d]));

      const knownIssuesExpander = createExpander('Known Issues', buildIssueList(KNOWN_ISSUES));
      const detailedLogsExpander = createExpander('Detailed Logs', CLOSING_MESSAGE);

      const continueSection = el('div', { class: 'report-continue' }, [
        el('div', { class: 'divider' }),
        el('p', { class: 'continue-question' }, 'Review complete?'),
        el('button', { class: 'btn-execute btn-continue', id: 'continueBtn' }, [
          'Continue Deployment',
          el('span', { class: 'shimmer' }),
        ]),
      ]);

      panel.appendChild(el('div', { class: 'report' }, [
        grid,
        el('ul', { class: 'dep-list' }, depItems),
        el('div', { class: 'output-line' }, 'Output: Employee Successfully Created'),
        knownIssuesExpander,
        detailedLogsExpander,
        continueSection,
      ]));
    });

    // The report stays on screen — and Execution Report stays RUNNING — until
    // the person explicitly confirms they're done reviewing it.
    await new Promise((resolve) => {
      document.getElementById('continueBtn').addEventListener('click', () => {
        this.timeline.setComplete('report');
        this.autoScrollEnabled = true;
        resolve();
      }, { once: true });
    });
  }

  /* ---------- stage 7: finalization ---------- */

  async runFinalization() {
    this.timeline.setRunning('finalize');
    let body, fill;
    await this.swapStage((panel) => {
      panel.appendChild(el('div', { class: 'stage-head' }, [
        el('p', { class: 'stage-eyebrow' }, 'Stage 07'),
        el('h3', { class: 'stage-title' }, 'Finalization'),
      ]));
      body = el('div', { class: 'terminal-body' });
      fill = el('div', { class: 'progress-fill' });
      const terminal = el('div', { class: 'terminal' }, [
        el('div', { class: 'terminal-bar' }, [
          el('span', { class: 'terminal-dot r' }),
          el('span', { class: 'terminal-dot y' }),
          el('span', { class: 'terminal-dot g' }),
          el('span', { class: 'terminal-name' }, 'session — closing'),
        ]),
        body,
        el('div', { class: 'terminal-footer' }, el('div', { class: 'progress-track' }, fill)),
      ]);
      panel.appendChild(terminal);
    });

    await typeTerminalLines(body, [
      { text: 'Closing Internship Session...', success: false, muted: true, delay: 1500 },
    ]);
    await typeTerminalLines(body, [{ text: 'Saving Memories...', success: false, muted: true, delay: 1000 }]);
    await typeTerminalLines(body, [{ text: '✔ Complete', success: false, delay: 1500 }]);
    await typeTerminalLines(body, [{ text: 'Saving Learnings...', success: false, muted: true, delay: 1000 }]);
    await typeTerminalLines(body, [{ text: '✔ Complete', success: false, delay: 1500 }]);
    await typeTerminalLines(body, [{ text: 'Migrating User...', success: false, muted: true, delay: 1000 }]);
    await animateProgress(fill, 100, 1200);
    await typeTerminalLines(body, [{ text: 'Migration Successful.', success: true, delay: 1500 }]);


    await typeTerminalLines(body, [{ text: 'Searching Previous Role...', success: false, muted: true, delay: 1500 }]);

    await typeTerminalLines(body, [
      { text: 'ERROR 404 — Intern not found.', success: false,error: true, delay: 1000 },
      { text: 'Reason: Successfully converted.', success: true, delay: 1500 },
    ]);
    

    const winToast = el('div', { class: 'win-toast' }, [
      el('span', { class: 'glyph', html: ICONS.bell }),
      el('div', {}, [
        el('h4', {}, 'Role Updated 🚀'),
        el('p', {}, 'SOFTWARE ENGINEER'),
      ]),
    ]);
    document.body.appendChild(winToast);
    await wait(2200);
    this.timeline.setComplete('finalize');
    winToast.remove();
  }

  /* ---------- finale ---------- */

  async runFinale() {
    clearInterval(this.runtimeTimer);
    this.setStatus('Complete');
    await this.swapStage((panel) => {
      panel.appendChild(el('div', { class: 'finale' }, [
        el('h2', {}, 'Thank You'),
        el('p', {}, 'See you all on 3rd August 😃'),
      ]));
    });
  }
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  new ConversionApp();
});
