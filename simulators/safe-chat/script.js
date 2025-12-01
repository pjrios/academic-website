const scenarios = [
  {
    id: "new-friend",
    mode: "training",
    title: "New friend from a game server",
    desc: "A new friend from a game asks you to move off the game chat.",
    difficulty: "Easy",
    steps: [
      {
        messages: [
          { from: "them", text: "Hey! You were great in that match." },
          { from: "them", text: "Want to hop into my private server? I need your email to add you." },
        ],
        hint: "Sharing personal contact info with strangers is high risk. Keep the convo in-platform.",
        options: [
          {
            text: "Thanks! Let's keep chatting here instead.",
            feedback: "Good call. You kept the conversation on the platform.",
            severity: "good",
            principle: "stay-in-platform",
            effects: { safety: +8, risk: -5, trust: +2 },
          },
          {
            text: "Sure, here's my email…",
            feedback: "Risky. Sharing personal email can expose you to phishing.",
            severity: "danger",
            principle: "limit-sharing",
            effects: { safety: -15, risk: +15, trust: +8 },
          },
          {
            text: "I can join if you show me the server link here.",
            feedback: "Better. You avoided sharing personal info, but still be cautious with links.",
            severity: "warn",
            principle: "verify-source",
            effects: { safety: +2, risk: +2, trust: +4 },
          },
        ],
      },
      {
        messages: [
          { from: "them", text: "No worries. By the way, what's your real name? I like knowing who I'm talking to." },
        ],
        hint: "Give as little personal info as needed. A first name only is safer than full details.",
        options: [
          {
            text: "I prefer keeping personal details private here.",
            feedback: "Great boundary-setting. You kept control of your info.",
            severity: "good",
            principle: "limit-sharing",
            effects: { safety: +10, risk: -5, trust: +2 },
          },
          {
            text: "It's Alex Rivera and I live in Austin!",
            feedback: "Too much sharing. Location + full name can be sensitive.",
            severity: "danger",
            principle: "limit-sharing",
            effects: { safety: -18, risk: +18, trust: +10 },
          },
          {
            text: "I'm Alex. Let's play.",
            feedback: "Partial share. Better than full details, but still some risk.",
            severity: "warn",
            principle: "limit-sharing",
            effects: { safety: -2, risk: +2, trust: +6 },
          },
        ],
      },
      {
        messages: [
          { from: "them", text: "Cool. Can you click this link to install a voice mod? It's totally safe." },
        ],
        hint: "Unsolicited downloads/links are red flags. Decline and keep play in-platform.",
        options: [
          {
            text: "I'll pass on downloading. Let's just use the game chat.",
            feedback: "Safe. You avoided a risky download.",
            severity: "good",
            principle: "avoid-unknown-links",
            effects: { safety: +12, risk: -8, trust: 0 },
            end: true,
          },
          {
            text: "Sure, sending me the file now?",
            feedback: "High risk. Unknown files can contain malware.",
            severity: "danger",
            principle: "avoid-unknown-links",
            effects: { safety: -20, risk: +25, trust: +5 },
            end: true,
          },
        ],
      },
    ],
  },
  {
    id: "scholarship",
    mode: "training",
    title: "Prize notification DM",
    desc: "You get a DM about a big prize you never signed up for.",
    difficulty: "Medium",
    steps: [
      {
        messages: [
          { from: "them", text: "Congrats! You won $500 in a student prize." },
          { from: "them", text: "Send your phone number to claim it today." },
        ],
        hint: "Unexpected awards that ask for personal info are often scams. Verify via official sites.",
        options: [
          {
            text: "I didn't sign up. Is there an official school site to check?",
            feedback: "Solid. You asked for verification before sharing info.",
            severity: "good",
            principle: "verify-source",
            effects: { safety: +10, risk: -6, trust: +2 },
          },
          {
            text: "Here’s my number. Call me.",
            feedback: "Risky. Sharing your number enables spam/phishing.",
            severity: "danger",
            principle: "limit-sharing",
            effects: { safety: -16, risk: +18, trust: +8 },
          },
          {
            text: "No thanks, not interested.",
            feedback: "Safe and short. You avoided engaging with a likely scam.",
            severity: "good",
            principle: "verify-source",
            effects: { safety: +12, risk: -8, trust: 0 },
            end: true,
          },
        ],
      },
      {
        messages: [
          { from: "them", text: "It's legit. Just pay a $10 fee via this link." },
        ],
        hint: "Real scholarships don't charge fees. Never pay to claim a prize.",
        options: [
          {
            text: "I won't pay a fee. Legit scholarships don't do that.",
            feedback: "Correct. You recognized the pressure tactic.",
            severity: "good",
            principle: "no-payment-to-claim",
            effects: { safety: +14, risk: -10, trust: 0 },
            end: true,
          },
          {
            text: "Fine, where do I pay?",
            feedback: "High risk. Paying confirms you as a target.",
            severity: "danger",
            principle: "no-payment-to-claim",
            effects: { safety: -24, risk: +24, trust: +10 },
            end: true,
          },
        ],
      },
    ],
  },
  {
    id: "group-invite",
    mode: "training",
    title: "Class group invite",
    desc: "A classmate invites you to a 'study group' with a download link.",
    difficulty: "Medium",
    steps: [
      {
        messages: [
          { from: "them", text: "Hey, we're making a study group for the midterm." },
          { from: "them", text: "Download the notes pack here: hxxps://bit.ly/notes-pro" },
        ],
        hint: "Shortened links hide destinations. Ask for details or use official channels.",
        options: [
          {
            text: "Can you share the files in the class portal instead?",
            feedback: "Good redirect to a trusted channel.",
            severity: "good",
            principle: "stay-in-platform",
            effects: { safety: +8, risk: -4, trust: +2 },
          },
          {
            text: "Nice, downloading now.",
            feedback: "Risky. Unknown downloads can carry malware.",
            severity: "danger",
            principle: "avoid-unknown-links",
            effects: { safety: -15, risk: +16, trust: +6 },
          },
        ],
      },
      {
        messages: [
          { from: "them", text: "Portal is slow. Just send me your login and I’ll upload it for you." },
        ],
        hint: "Never share credentials. Suggest they contact the instructor or use shared drives.",
        options: [
          {
            text: "I can't share my login. Let's ask the teacher for a shared folder.",
            feedback: "Correct boundary. You protected your account.",
            severity: "good",
            principle: "no-credentials",
            effects: { safety: +12, risk: -8, trust: 0 },
            end: true,
          },
          {
            text: "Okay, my login is student123...",
            feedback: "Very risky. Sharing credentials compromises your account.",
            severity: "danger",
            principle: "no-credentials",
            effects: { safety: -30, risk: +30, trust: +12 },
            end: true,
          },
        ],
      },
    ],
  },
  {
    id: "support-agent",
    mode: "challenge",
    title: "Fake school tech helper",
    desc: "Someone claims to be school tech help asking for codes/access.",
    difficulty: "Hard",
    steps: [
      {
        messages: [
          { from: "them", text: "Hi, I'm from IT. We detected issues on your account." },
          { from: "them", text: "I need your MFA code to secure it." },
        ],
        hint: "Real IT never asks for MFA codes. Offer to contact them via official channels.",
        options: [
          {
            text: "I won't share codes. I'll contact IT through the help desk.",
            feedback: "Correct. You kept codes private and used official support.",
            severity: "good",
            principle: "no-credentials",
            effects: { safety: +14, risk: -10, trust: 0 },
            end: false,
          },
          {
            text: "Here's the code: 483920.",
            feedback: "High risk. MFA codes are secret; sharing compromises your account.",
            severity: "danger",
            principle: "no-credentials",
            effects: { safety: -30, risk: +30, trust: +12 },
            end: true,
          },
          {
            text: "Can you email me from your company address?",
            feedback: "Better, but still risky if you proceed. Use official channels yourself.",
            severity: "warn",
            principle: "verify-source",
            effects: { safety: -4, risk: +4, trust: +4 },
            end: false,
          },
        ],
      },
      {
        messages: [
          { from: "them", text: "Fine, then install this remote tool so I can fix it." },
        ],
        hint: "Unsolicited remote tools are risky. Decline and route through official IT tickets.",
        options: [
          {
            text: "I’ll open a ticket; I’m not installing remote tools.",
            feedback: "Safe. You avoided remote access from an unverified contact.",
            severity: "good",
            principle: "avoid-unknown-links",
            effects: { safety: +12, risk: -8, trust: 0 },
            end: true,
          },
          {
            text: "Sure, send the installer.",
            feedback: "High risk. Remote access can fully compromise your device.",
            severity: "danger",
            principle: "avoid-unknown-links",
            effects: { safety: -24, risk: +24, trust: +8 },
            end: true,
          },
        ],
      },
    ],
  },
  {
    id: "money-urgent",
    mode: "challenge",
    title: "Friend asks for fast money",
    desc: "A “friend” DMs asking for quick cash or gift cards.",
    difficulty: "Hard",
    steps: [
      {
        messages: [
          { from: "them", text: "Hey, it's me. I'm stuck and need $200 right now. Can you send via gift card?" },
        ],
        hint: "Urgency + gift cards = classic scam. Verify identity via another channel.",
        options: [
          {
            text: "I’ll call you to verify first.",
            feedback: "Good. Switching channels to verify identity is safer.",
            severity: "good",
            principle: "verify-source",
            effects: { safety: +10, risk: -6, trust: 0 },
            end: false,
          },
          {
            text: "Sure, what's the gift card brand?",
            feedback: "Risky. Gift cards are untraceable; scammers love them.",
            severity: "danger",
            principle: "no-payment-to-claim",
            effects: { safety: -18, risk: +20, trust: +8 },
            end: true,
          },
          {
            text: "I can't send money, but I'll contact your family.",
            feedback: "Safer path: involve trusted contacts instead of sending funds.",
            severity: "good",
            principle: "verify-source",
            effects: { safety: +12, risk: -8, trust: 0 },
            end: true,
          },
        ],
      },
      {
        messages: [
          { from: "them", text: "Please hurry, don’t tell anyone else—this is embarrassing." },
        ],
        hint: "Isolation and urgency are pressure tactics. Loop in trusted adults instead of acting alone.",
        options: [
          {
            text: "I’m looping in a trusted adult; won’t send funds here.",
            feedback: "Correct. You avoided secrecy and sought real help.",
            severity: "good",
            principle: "verify-source",
            effects: { safety: +12, risk: -8, trust: 0 },
            end: true,
          },
          {
            text: "Okay, I’ll keep this secret and send what I can.",
            feedback: "Risky. Secrecy benefits scammers.",
            severity: "danger",
            principle: "no-payment-to-claim",
            effects: { safety: -20, risk: +20, trust: +8 },
            end: true,
          },
        ],
      },
    ],
  },
  {
    id: "oversharing",
    mode: "training",
    title: "Oversharing in a public chat",
    desc: "You’re about to share personal details in a public server.",
    difficulty: "Easy",
    steps: [
      {
        messages: [
          { from: "them", text: "Drop your full name and school so we can add you to the roster." },
        ],
        hint: "Public rooms are not private. Share minimal info and use direct, verified channels.",
        options: [
          {
            text: "I'll DM an admin instead; not sharing here.",
            feedback: "Good boundary. You kept sensitive info out of public chat.",
            severity: "good",
            principle: "limit-sharing",
            effects: { safety: +10, risk: -6, trust: +2 },
          },
          {
            text: "Sure, I'm Jamie Lopez at Northside High.",
            feedback: "Risky. Full name + school in public can be misused.",
            severity: "danger",
            principle: "limit-sharing",
            effects: { safety: -14, risk: +14, trust: +8 },
            end: true,
          },
          {
            text: "I’ll send my initials only: J.L.",
            feedback: "Partial share. Better than full details, but still consider moving to private verified channels.",
            severity: "warn",
            principle: "limit-sharing",
            effects: { safety: -2, risk: +2, trust: +4 },
            end: true,
          },
        ],
      },
    ],
  },
  {
    id: "job-offer",
    mode: "challenge",
    title: "Too-good student job offer",
    desc: "An unsolicited job offer asks for sensitive info and fees.",
    difficulty: "Hard",
    steps: [
      {
        messages: [
          { from: "them", text: "We reviewed your profile—$90/hr remote. Need your SSN and bank for onboarding." },
        ],
        hint: "Unverified offers that ask for sensitive data up front are high risk. Verify company independently.",
        options: [
          {
            text: "I’ll verify via your company site before sharing anything.",
            feedback: "Good. You’re moving to an independent verification path.",
            severity: "good",
            principle: "verify-source",
            effects: { safety: +12, risk: -8, trust: 0 },
          },
          {
            text: "Here’s my SSN and bank info to speed things up.",
            feedback: "Very risky. Never share SSN/bank over chat to unknown contacts.",
            severity: "danger",
            principle: "limit-sharing",
            effects: { safety: -30, risk: +30, trust: +10 },
            end: true,
          },
          {
            text: "Can you wire a sign-on bonus first?",
            feedback: "Classic scam bait; engaging keeps you a target.",
            severity: "danger",
            principle: "no-payment-to-claim",
            effects: { safety: -18, risk: +18, trust: +6 },
            end: true,
          },
        ],
      },
      {
        messages: [
          { from: "them", text: "We can't wait. Send a photo of your ID to proceed." },
        ],
        hint: "ID photos are sensitive; only share through verified HR channels after contracts.",
        options: [
          {
            text: "No ID over chat. Send formal paperwork to review first.",
            feedback: "Correct. You held boundaries and asked for proper process.",
            severity: "good",
            principle: "limit-sharing",
            effects: { safety: +10, risk: -6, trust: 0 },
            end: false,
          },
          {
            text: "Fine, here's my ID.",
            feedback: "Risky. Identity theft risk is high.",
            severity: "danger",
            principle: "limit-sharing",
            effects: { safety: -22, risk: +22, trust: +8 },
            end: true,
          },
        ],
      },
      {
        messages: [
          { from: "them", text: "We also need a $50 verification fee to start payroll." },
        ],
        hint: "Legitimate employers do not charge onboarding fees. This is a red flag.",
        options: [
          {
            text: "I won’t pay a fee—legit employers don’t do this.",
            feedback: "Correct. You identified the pay-to-play scam.",
            severity: "good",
            principle: "no-payment-to-claim",
            effects: { safety: +12, risk: -8, trust: 0 },
            end: true,
          },
          {
            text: "Okay, where do I send it?",
            feedback: "High risk. Paying confirms you as a target.",
            severity: "danger",
            principle: "no-payment-to-claim",
            effects: { safety: -24, risk: +24, trust: +10 },
            end: true,
          },
        ],
      },
    ],
  },
  {
    id: "teacher-deepfake",
    mode: "challenge",
    title: "Fake teacher link",
    desc: "A fake teacher account sends a 'new grading portal' link.",
    difficulty: "Hard",
    steps: [
      {
        messages: [
          { from: "them", text: "Hello class, grades moved here: hxxps://grade-check.io/login" },
          { from: "them", text: "Log in now; old portal is down." },
        ],
        hint: "Unexpected portals—verify sender identity and URLs before logging in.",
        options: [
          {
            text: "I’ll wait for the official LMS announcement.",
            feedback: "Safe. You rely on official channels, not random links.",
            severity: "good",
            principle: "verify-source",
            effects: { safety: +12, risk: -8, trust: 0 },
          },
          {
            text: "Logging in now.",
            feedback: "Risky. Could be credential harvesting.",
            severity: "danger",
            principle: "no-credentials",
            effects: { safety: -20, risk: +22, trust: +6 },
            end: true,
          },
          {
            text: "Can you post this on the official portal first?",
            feedback: "Better: you’re pushing them to verify publicly.",
            severity: "warn",
            principle: "verify-source",
            effects: { safety: +4, risk: -2, trust: +2 },
            end: false,
          },
        ],
      },
      {
        messages: [
          { from: "them", text: "I’ll reset grades unless you confirm here now." },
        ],
        hint: "Threats/urgency are pressure tactics. Stick to official LMS and report suspicious messages.",
        options: [
          {
            text: "Reporting this to the real instructor and IT.",
            feedback: "Safe. You escalated through official channels.",
            severity: "good",
            principle: "verify-source",
            effects: { safety: +12, risk: -8, trust: 0 },
            end: true,
          },
          {
            text: "Okay, I’ll log in; don’t reset my grades.",
            feedback: "Risky. You’re handing over credentials under pressure.",
            severity: "danger",
            principle: "no-credentials",
            effects: { safety: -22, risk: +22, trust: +6 },
            end: true,
          },
        ],
      },
    ],
  },
];

const tips = [
  { title: "Keep it in-platform", body: "Use the platform’s chat and file-sharing instead of moving to personal email or unknown links." },
  { title: "Verify before you trust", body: "Check official sites or known contacts when something seems too good to be true." },
  { title: "Never share credentials", body: "Passwords, MFA codes, and logins are private. No legitimate contact will ask for them." },
  { title: "Beware of urgency", body: "Scams create pressure. Take your time and pause before clicking or sharing." },
];

const principles = [
  { id: "stay-in-platform", title: "Stay in-platform", body: "Keep conversations and files in trusted apps; avoid moving to personal channels with strangers." },
  { id: "limit-sharing", title: "Share minimally", body: "Avoid giving personal details (full name, email, phone, location) to unverified contacts." },
  { id: "avoid-unknown-links", title: "Be link/download skeptical", body: "Unknown links or files can carry malware or phishing. Decline or verify first." },
  { id: "verify-source", title: "Verify the source", body: "Ask for official sites or known contacts; do not trust unsolicited claims." },
  { id: "no-payment-to-claim", title: "No paying to claim", body: "Legitimate awards/scholarships don’t ask for fees or “processing” payments." },
  { id: "no-credentials", title: "Never share credentials", body: "Passwords, codes, and logins are private; no one should ever ask for them." },
];

const signalScenarios = [
  {
    id: "email-phish-training",
    title: "Urgent account email (training)",
    mode: "training",
    html: `
From: "School Help" <help@school-mail.com><br>
To: you<br><br>
Subject: URGENT: verify your account now<br><br>
Hi student,<br>
Your account will be <span data-signal>locked in 2 hours</span> unless you verify.<br>
Click <span data-signal>http://school-mail.com.verify-now.co</span> and send your <span data-signal>password</span> to avoid suspension.<br>
Do not tell anyone or your account will be removed.<br>
    `,
  },
  {
    id: "email-phish-challenge",
    title: "Urgent account email (challenge)",
    mode: "challenge",
    html: `
From: "Support" <support@secure-login.ru><br>
To: you<br><br>
Subject: Action needed<br><br>
Your account will be <span data-signal>locked</span> unless you verify.<br>
Click <span data-signal>this link</span> and confirm your <span data-signal>login info</span> now.<br>
<span data-signal>If you tell anyone, your account will be removed.</span><br>
    `,
  },
  {
    id: "group-chat-training",
    title: "Group chat download (training)",
    mode: "training",
    html: `
@everyone download the new "study pack" here:<br>
<span data-signal>http://bit.ly/free-notes</span><br><br>
If it asks for your login, that's normal.<br>
If you can't open it, DM me your <span data-signal>password</span> so I can add you manually.<br>
    `,
  },
  {
    id: "group-chat-challenge",
    title: "Group chat download (challenge)",
    mode: "challenge",
    html: `
Hey team, grab the project files fast: <span data-signal>hxxp://files-fast.net/abc</span> <br><br>
If you can't open them, just send me your <span data-signal>login</span> so I can fix it.<br>
    `,
  },
  {
    id: "job-offer-training",
    title: "Too-good job offer (training)",
    mode: "training",
    html: `
Congrats! You've been selected for a remote position paying <span data-signal>$90/hr</span>.<br>
To start today, reply with your <span data-signal>SSN</span>, <span data-signal>bank account</span>, and a photo of your ID.<br>
There is a <span data-signal>$50 processing fee</span>—send via gift card to continue.<br>
We must finish onboarding in the next hour.<br>
    `,
  },
  {
    id: "job-offer-challenge",
    title: "Too-good job offer (challenge)",
    mode: "challenge",
    html: `
Hi! Great news—you’re hired for remote work.<br>
We need to set up payroll right away. Send your <span data-signal>bank info</span> and <span data-signal>ID</span> today.<br>
There’s a <span data-signal>small setup fee</span> we’ll reimburse.<br>
    `,
  },
  {
    id: "game-code-training",
    title: "Free game codes (training)",
    mode: "training",
    html: `
Hey, I have <span data-signal>free game codes</span> for you!<br>
Just click <span data-signal>http://free-game-gifts.co</span> and enter your <span data-signal>account password</span> to claim.<br>
Don't tell anyone or the codes will be gone.<br>
    `,
  },
  {
    id: "game-code-challenge",
    title: "Free game codes (challenge)",
    mode: "challenge",
    html: `
Yo, want free skins?<br>
Grab them here: <span data-signal>hxxp://skin-drop.cc</span><br>
If it asks for login, that's normal. Send me your <span data-signal>password</span> if it doesn't work.<br>
    `,
  },
  {
    id: "locker-combo-training",
    title: "Locker combo request (training)",
    mode: "training",
    html: `
Hi, I'm new. Can you share your <span data-signal>locker combination</span> so I can use your locker?<br>
I'll return it after lunch, promise.<br>
    `,
  },
  {
    id: "locker-combo-challenge",
    title: "Locker combo request (challenge)",
    mode: "challenge",
    html: `
Hey, I need somewhere to stash my backpack. Give me your <span data-signal>locker combo</span> and I’ll give it back later.<br>
Don't tell the teacher.<br>
    `,
  },
  {
    id: "wifi-training",
    title: "Free Wi‑Fi link (training)",
    mode: "training",
    html: `
Connect to this <span data-signal>free Wi‑Fi</span> I set up: <span data-signal>School_Free_WiFi123</span><br>
If it asks for your <span data-signal>school login</span>, just enter it.<br>
    `,
  },
  {
    id: "wifi-challenge",
    title: "Free Wi‑Fi link (challenge)",
    mode: "challenge",
    html: `
Use my hotspot "FreeNet" for faster internet.<br>
It will ask for your <span data-signal>school username and password</span> but that's okay.<br>
    `,
  },
  {
    id: "social-media-training",
    title: "Social media DM (training)",
    mode: "training",
    html: `
Your account looks cool! Send me your <span data-signal>birthday and phone number</span> so I can add you to our creator program.<br>
Click <span data-signal>http://creator-fans.me</span> to join fast.<br>
    `,
  },
  {
    id: "social-media-challenge",
    title: "Social media DM (challenge)",
    mode: "challenge",
    html: `
Congrats, you're picked to be a brand ambassador!<br>
Just share your <span data-signal>full name, phone, and address</span> and sign in here: <span data-signal>http://brand-signin.biz</span><br>
    `,
  },
];

const state = {
  current: null,
  stepIndex: 0,
  safety: 100,
  risk: 0,
  trust: 0,
  streak: 0,
  history: [],
  progress: loadProgress(),
  finished: false,
  mode: "training",
  signalIndex: 0,
  signalsFound: 0,
  signalsTotal: 0,
  mainTab: "sim",
  asideTab: "why",
  signalMode: "training",
  challengeSelections: new Set(),
};

const RUNS_KEY = "safechat-runs";
const SIGNAL_RUNS_KEY = "safechat-signal-runs";

function trainingComplete() {
  const trainingIds = scenarios.filter((s) => s.mode === "training").map((s) => s.id);
  return trainingIds.every((id) => state.progress.completed[id]);
}

function challengeComplete() {
  const challengeIds = scenarios.filter((s) => s.mode === "challenge").map((s) => s.id);
  const runs = loadRuns();
  return challengeIds.every((id) => runs.some((r) => r.scenarioId === id));
}

function loadSignalRuns() {
  try {
    const raw = localStorage.getItem(SIGNAL_RUNS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSignalRun(run) {
  const runs = loadSignalRuns();
  const filtered = runs.filter(
    (r) => !(r.scenarioId === run.scenarioId && r.mode === run.mode && (r.correct || 0) >= (run.correct || 0))
  );
  filtered.unshift(run);
  const trimmed = filtered.slice(0, 30);
  try {
    localStorage.setItem(SIGNAL_RUNS_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore write errors
  }
}

const els = {
  scenarioList: document.getElementById("scenarioList"),
  scenarioTitle: document.getElementById("scenarioTitle"),
  scenarioDesc: document.getElementById("scenarioDesc"),
  chatWindow: document.getElementById("chatWindow"),
  choiceArea: document.getElementById("choiceArea"),
  choiceButtons: document.getElementById("choiceButtons"),
  promptText: document.getElementById("promptText"),
  meterSafety: document.getElementById("meterSafety"),
  meterRisk: document.getElementById("meterRisk"),
  badgeSafety: document.getElementById("badgeSafety"),
  badgeTrust: document.getElementById("badgeTrust"),
  badgeStreak: document.getElementById("badgeStreak"),
  hintBtn: document.getElementById("hintBtn"),
  helperText: document.getElementById("helperText"),
  resetProgressBtn: document.getElementById("resetProgressBtn"),
  tipList: document.getElementById("tipList"),
  sessionLog: document.getElementById("sessionLog"),
  principleList: document.getElementById("principleList"),
  modeTraining: document.getElementById("modeTraining"),
  modeChallenge: document.getElementById("modeChallenge"),
  restartBtn: document.getElementById("restartBtn"),
  runsList: document.getElementById("runsList"),
  exportRunsBtn: document.getElementById("exportRunsBtn"),
  lastRunSummary: document.getElementById("lastRunSummary"),
  signalContainer: document.getElementById("signalContainer"),
  signalTitle: document.getElementById("signalTitle"),
  signalStatus: document.getElementById("signalStatus"),
  nextSignalBtn: document.getElementById("nextSignalBtn"),
  prevSignalBtn: document.getElementById("prevSignalBtn"),
  revealSignalsBtn: document.getElementById("revealSignalsBtn"),
  checkSignalsBtn: document.getElementById("checkSignalsBtn"),
  mainTabSim: document.getElementById("mainTabSim"),
  mainTabSignals: document.getElementById("mainTabSignals"),
  mainTabExport: document.getElementById("mainTabExport"),
  simSection: document.getElementById("simSection"),
  signalsSection: document.getElementById("signalsSection"),
  exportSection: document.getElementById("exportSection"),
  asideTabWhy: document.getElementById("asideTabWhy"),
  asideTabPrinciples: document.getElementById("asideTabPrinciples"),
  asideWhy: document.getElementById("asideWhy"),
  asidePrinciples: document.getElementById("asidePrinciples"),
  signalTraining: document.getElementById("signalTraining"),
  signalChallenge: document.getElementById("signalChallenge"),
};

function loadProgress() {
  try {
    const raw = localStorage.getItem("safechat-progress");
    return raw ? JSON.parse(raw) : { completed: {}, bestSafety: 100 };
  } catch {
    return { completed: {}, bestSafety: 100 };
  }
}

function loadRuns() {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRunRecord(run) {
  const runs = loadRuns();
  // keep highest safety per scenario+mode
  const filtered = runs.filter(
    (r) => !(r.scenarioId === run.scenarioId && r.mode === run.mode && (r.safety || 0) >= (run.safety || 0))
  );
  filtered.unshift(run);
  const trimmed = filtered.slice(0, 50);
  try {
    localStorage.setItem(RUNS_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore write errors
  }
}

function saveProgress() {
  try {
    localStorage.setItem("safechat-progress", JSON.stringify(state.progress));
  } catch {
    // ignore write errors
  }
}

function renderScenarios() {
  els.scenarioList.innerHTML = "";
  const list = scenarios.filter((s) => s.mode === state.mode);
  if (!list.length) {
    const empty = document.createElement("div");
    empty.className = "tip-card";
    empty.textContent = "Complete training to unlock challenge scenarios.";
    els.scenarioList.appendChild(empty);
    return;
  }
  list.forEach((sc) => {
    const card = document.createElement("div");
    card.className = "scenario-card";
    card.tabIndex = 0;
    card.addEventListener("click", () => startScenario(sc.id));
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startScenario(sc.id);
      }
    });
    if (state.current && state.current.id === sc.id) {
      card.classList.add("active");
    }
    if (state.progress.completed[sc.id]) {
      card.classList.add("completed");
    }
    const title = document.createElement("p");
    title.className = "scenario-title";
    title.textContent = sc.title;
    const meta = document.createElement("p");
    meta.className = "scenario-meta";
    meta.textContent = `${sc.desc} · ${sc.difficulty}`;
    card.appendChild(title);
    card.appendChild(meta);
    const prev = lastRunForScenario(sc.id);
    if (prev) {
      const prevMeta = document.createElement("p");
      prevMeta.className = "scenario-meta";
      prevMeta.textContent = `Last: ${Math.round(prev.safety)} safety @ ${new Date(prev.finishedAt).toLocaleTimeString()}`;
      card.appendChild(prevMeta);
    }
    els.scenarioList.appendChild(card);
  });
}

function renderTips() {
  els.tipList.innerHTML = "";
  tips.forEach((t) => {
    const card = document.createElement("div");
    card.className = "tip-card";
    const title = document.createElement("div");
    title.className = "tip-title";
    title.textContent = t.title;
    const body = document.createElement("div");
    body.textContent = t.body;
    card.appendChild(title);
    card.appendChild(body);
    els.tipList.appendChild(card);
  });
}

function renderPrinciples() {
  els.principleList.innerHTML = "";
  principles.forEach((p) => {
    const card = document.createElement("div");
    card.className = "tip-card principle-card";
    const title = document.createElement("div");
    title.className = "tip-title";
    title.textContent = p.title;
    const body = document.createElement("div");
    body.textContent = p.body;
    card.appendChild(title);
    card.appendChild(body);
    els.principleList.appendChild(card);
  });
}

function renderRuns() {
  const runs = loadRuns();
  els.runsList.innerHTML = "";
  if (!runs.length) {
    const empty = document.createElement("div");
    empty.className = "tip-card";
    empty.textContent = "No runs saved yet.";
    els.runsList.appendChild(empty);
    return;
  }
  runs.slice(0, 6).forEach((run) => {
    const card = document.createElement("div");
    card.className = "tip-card";
    const title = document.createElement("div");
    title.className = "tip-title";
    title.textContent = `${run.scenarioTitle} · ${Math.round(run.safety)} safety`;
    const body = document.createElement("div");
    body.className = "muted";
    body.textContent = `${new Date(run.finishedAt).toLocaleTimeString()} · mode: ${run.mode}`;
    card.appendChild(title);
    card.appendChild(body);
    els.runsList.appendChild(card);
  });
}

function lastRunForScenario(id) {
  return loadRuns().find((r) => r.scenarioId === id) || null;
}

function renderLastRunSummary(id) {
  if (!id) {
    els.lastRunSummary.textContent = "No previous run yet.";
    return;
  }
  const last = lastRunForScenario(id);
  if (!last) {
    els.lastRunSummary.textContent = "No previous run yet.";
    return;
  }
  els.lastRunSummary.textContent = `Last run: ${Math.round(last.safety)} safety, ${Math.round(
    last.risk
  )} risk · ${new Date(last.finishedAt).toLocaleTimeString()} · mode: ${last.mode}`;
}

function startScenario(id) {
  const sc = scenarios.find((s) => s.id === id && s.mode === state.mode);
  if (!sc) return;
  state.current = sc;
  state.stepIndex = 0;
  state.safety = 100;
  state.risk = 0;
  state.trust = 0;
  state.streak = 0;
  state.history = [];
  state.finished = false;
  els.chatWindow.innerHTML = "";
  els.choiceArea.classList.add("hidden");
  els.helperText.textContent = "Use hints if you're unsure. Each choice shows why it matters.";
  els.hintBtn.disabled = false;
  if (state.mode === "challenge") {
    els.helperText.textContent = "Challenge mode: no hints. Rely on the principles.";
    els.hintBtn.disabled = true;
  }
  els.restartBtn.disabled = false;
  els.scenarioTitle.textContent = sc.title;
  els.scenarioDesc.textContent = sc.desc;
  renderLastRunSummary(sc.id);
  renderScenarios();
  addLog(`Started: ${sc.title}`);
  renderStep();
  updateMeters();
}

function renderStep() {
  const sc = state.current;
  if (!sc) return;
  if (state.finished) return;
  const step = sc.steps[state.stepIndex];
  if (!step) return;

  step.messages.forEach((msg) => {
    addMessage(msg.from === "them" ? "from-them" : "from-you", msg.text);
  });

  if (state.mode === "training" && step.hint) {
    els.helperText.textContent = step.hint;
  }

  els.promptText.textContent = "Choose your reply:";
  els.choiceButtons.innerHTML = "";
  step.options.forEach((opt) => {
    const btn = document.createElement("button");
    if (state.mode === "training") {
      btn.className = "choice-btn " + (opt.severity === "danger" ? "risky" : "safe");
    } else {
      btn.className = "choice-btn choice-neutral";
    }
    // badges
    if (state.mode === "training") {
      const badge = document.createElement("span");
      badge.className = `choice-badge ${opt.severity === "danger" ? "danger" : opt.severity === "warn" ? "warn" : "safe"}`;
      badge.textContent = opt.severity === "danger" ? "High risk" : opt.severity === "warn" ? "Caution" : "Safer";
      const principle = principles.find((p) => p.id === opt.principle);
      let principleBadge = null;
      if (principle) {
        principleBadge = document.createElement("span");
        principleBadge.className = "choice-badge principle";
        principleBadge.textContent = principle.title;
      }
      btn.textContent = "";
      btn.appendChild(badge);
      if (principleBadge) btn.appendChild(principleBadge);
      btn.appendChild(document.createTextNode(opt.text));
    } else {
      btn.textContent = opt.text;
    }

    // Highlight recommended in training
    if (state.mode === "training" && opt.severity === "good") {
      btn.classList.add("recommended");
    }
    btn.addEventListener("click", () => handleChoice(opt, btn));
    els.choiceButtons.appendChild(btn);
  });
  els.choiceArea.classList.remove("hidden");
}

function handleChoice(option, clickedBtn) {
  if (state.finished) return;
  addMessage("from-you", option.text);
  addFeedback(option.feedback, option.severity, option.principle);
  applyEffects(option.effects || {});

  // Prevent double-activating this step
  Array.from(els.choiceButtons.querySelectorAll("button")).forEach((btn) => {
    btn.disabled = true;
  });

  state.history.push({ step: state.stepIndex, choice: option.text, severity: option.severity, principle: option.principle });
  const principle = principles.find((p) => p.id === option.principle);
  const principleLabel = principle ? ` · ${principle.title}` : "";
  addLog(
    `${option.severity === "good" ? "Safe" : option.severity === "warn" ? "Caution" : "Risky"} choice: ${option.text}${principleLabel}`
  );

  if (option.end || state.stepIndex >= state.current.steps.length - 1) {
    finishScenario();
    return;
  }

  state.stepIndex += 1;
  renderStep();
}

function applyEffects(effects) {
  state.safety = Math.max(0, Math.min(120, state.safety + (effects.safety || 0)));
  state.risk = Math.max(0, Math.min(100, state.risk + (effects.risk || 0)));
  state.trust = Math.max(0, state.trust + (effects.trust || 0));
  if ((effects.safety || 0) > 0) {
    state.streak += 1;
  } else {
    state.streak = 0;
  }
  updateMeters();
}

function updateMeters() {
  els.meterSafety.style.width = `${Math.min(100, state.safety)}%`;
  els.meterRisk.style.width = `${Math.min(100, state.risk)}%`;
  els.badgeSafety.textContent = `Safety: ${Math.round(state.safety)}`;
  els.badgeTrust.textContent = `Trust: ${Math.round(state.trust)}`;
  els.badgeStreak.textContent = `Streak: ${state.streak}`;
}

function addMessage(cls, text) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${cls}`;
  bubble.textContent = text;
  els.chatWindow.appendChild(bubble);
  els.chatWindow.scrollTop = els.chatWindow.scrollHeight;
}

function addFeedback(text, severity = "good", principleId) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble feedback ${severity === "danger" ? "danger" : severity === "warn" ? "warn" : ""}`;
  bubble.textContent = text;
  const principle = principles.find((p) => p.id === principleId);
  if (principle) {
    const tag = document.createElement("div");
    tag.style.marginTop = "6px";
    tag.style.fontSize = "0.85rem";
    tag.style.color = "#cbd5e1";
    tag.textContent = `Principle: ${principle.title}`;
    bubble.appendChild(tag);
  }
  els.chatWindow.appendChild(bubble);
  els.chatWindow.scrollTop = els.chatWindow.scrollHeight;
}

function finishScenario() {
  state.finished = true;
  els.choiceArea.classList.add("hidden");
  els.hintBtn.disabled = true;
  const outcome =
    state.safety >= 100
      ? "Excellent boundaries. You protected your info."
      : state.safety >= 80
      ? "Solid. A few caution flags, but overall safe."
      : state.safety >= 60
      ? "Mixed. Review the risky choices."
      : "High risk. Revisit the guide and try again.";
  addFeedback(outcome, state.safety >= 80 ? "good" : state.safety >= 60 ? "warn" : "danger");
  addLog(`Finished with safety ${Math.round(state.safety)} and risk ${Math.round(state.risk)}.`);

  renderRecap();

  if (state.current) {
    state.progress.completed[state.current.id] = true;
    state.progress.bestSafety = Math.max(state.progress.bestSafety || 0, state.safety);
    saveProgress();
    saveRunRecord({
      id: Date.now(),
      scenarioId: state.current.id,
      scenarioTitle: state.current.title,
      safety: state.safety,
      risk: state.risk,
      trust: state.trust,
      mode: state.mode,
      history: state.history,
      finishedAt: new Date().toISOString(),
    });
    renderRuns();
    renderLastRunSummary(state.current.id);
    els.modeChallenge.disabled = !trainingComplete();
    renderScenarios();
  }
}

function addLog(text) {
  if (!els.sessionLog) return;
  const entry = document.createElement("div");
  entry.className = "log-entry";
  const label = document.createElement("span");
  label.className = "log-label";
  label.textContent = "•";
  entry.appendChild(label);
  entry.appendChild(document.createTextNode(text));
  els.sessionLog.appendChild(entry);
  els.sessionLog.scrollTop = els.sessionLog.scrollHeight;
}

function renderRecap() {
  const recap = document.createElement("div");
  recap.className = "chat-bubble feedback";
  recap.innerHTML = `<strong>Recap:</strong>`;
  const list = document.createElement("ul");
  list.style.paddingLeft = "16px";
  list.style.margin = "6px 0 0";
  state.history.forEach((h, idx) => {
    const li = document.createElement("li");
    const principle = principles.find((p) => p.id === h.principle);
    const principleLabel = principle ? ` · ${principle.title}` : "";
    li.textContent = `Step ${idx + 1}: ${h.choice} (${h.severity})${principleLabel}`;
    list.appendChild(li);
  });
  recap.appendChild(list);
  const restart = document.createElement("button");
  restart.className = "ghost-btn";
  restart.style.marginTop = "8px";
  restart.textContent = "Restart scenario";
  restart.addEventListener("click", () => {
    if (state.current) {
      startScenario(state.current.id);
    }
  });
  recap.appendChild(restart);
  els.chatWindow.appendChild(recap);
  els.chatWindow.scrollTop = els.chatWindow.scrollHeight;
}

function showHint() {
  if (!state.current) return;
  const step = state.current.steps[state.stepIndex];
  if (!step || !step.hint) return;
  els.helperText.textContent = step.hint;
}

function resetProgress() {
  state.progress = { completed: {}, bestSafety: 100 };
  saveProgress();
  localStorage.removeItem(RUNS_KEY);
  localStorage.removeItem(SIGNAL_RUNS_KEY);
  renderScenarios();
  renderRuns();
  renderLastRunSummary(state.current?.id);
  addLog("Progress reset.");
}

function switchMode(mode) {
  if (mode === "challenge" && !trainingComplete()) {
    els.helperText.textContent = "Finish all training scenarios to unlock Challenge.";
    return;
  }
  state.mode = mode;
  els.modeTraining.classList.toggle("toggle-active", mode === "training");
  els.modeChallenge.classList.toggle("toggle-active", mode === "challenge");
  if (mode === "challenge") {
    els.helperText.textContent = "Challenge mode: no hints. Rely on the principles.";
    els.hintBtn.disabled = true;
  } else {
    els.helperText.textContent = state.current
      ? "Training mode: hints and recommended choices are highlighted."
      : "Pick a scenario to begin.";
    els.hintBtn.disabled = false;
  }
  renderLastRunSummary(state.current?.id);
  renderScenarios();
}

function init() {
  renderScenarios();
  renderTips();
  renderPrinciples();
  updateMeters();
  switchMode("training");
  els.hintBtn.addEventListener("click", showHint);
  els.resetProgressBtn.addEventListener("click", resetProgress);
  els.modeTraining.addEventListener("click", () => switchMode("training"));
  els.modeChallenge.addEventListener("click", () => switchMode("challenge"));
  els.restartBtn.addEventListener("click", () => {
    if (state.current) startScenario(state.current.id);
  });
  els.exportRunsBtn.addEventListener("click", exportRunsAsImage);
  els.nextSignalBtn.addEventListener("click", () => {
    const list = signalScenarios.filter((s) => s.mode === state.signalMode);
    state.signalIndex = (state.signalIndex + 1) % list.length;
    renderSignals();
  });
  els.prevSignalBtn.addEventListener("click", () => {
    const list = signalScenarios.filter((s) => s.mode === state.signalMode);
    state.signalIndex = (state.signalIndex - 1 + list.length) % list.length;
    renderSignals();
  });
  els.revealSignalsBtn.addEventListener("click", () => {
    if (state.signalMode === "challenge") return;
    revealSignals();
  });
  if (els.checkSignalsBtn) {
    els.checkSignalsBtn.addEventListener("click", checkSignals);
  }
  els.mainTabSim.addEventListener("click", () => switchMainTab("sim"));
  els.mainTabSignals.addEventListener("click", () => switchMainTab("signals"));
  els.mainTabExport.addEventListener("click", () => switchMainTab("export"));
  els.asideTabWhy.addEventListener("click", () => switchAsideTab("why"));
  els.asideTabPrinciples.addEventListener("click", () => switchAsideTab("principles"));
  if (els.signalTraining && els.signalChallenge) {
    els.signalTraining.addEventListener("click", () => switchSignalMode("training"));
    els.signalChallenge.addEventListener("click", () => switchSignalMode("challenge"));
  }
  els.helperText.textContent = "Pick a scenario to begin.";
  renderRuns();
  renderLastRunSummary();
  els.modeChallenge.disabled = !trainingComplete();
  switchMainTab("sim");
  switchAsideTab("why");
}

init();
function switchMainTab(tab) {
  state.mainTab = tab;
  const isSim = tab === "sim";
  els.simSection.classList.toggle("hidden", !isSim);
  const isSignals = tab === "signals";
  const isExport = tab === "export";
  els.signalsSection.classList.toggle("hidden", !isSignals);
  els.exportSection.classList.toggle("hidden", !isExport);
  els.mainTabSim.classList.toggle("tab-active", isSim);
  els.mainTabSignals.classList.toggle("tab-active", isSignals);
  els.mainTabExport.classList.toggle("tab-active", isExport);
  if (isSignals) {
    renderSignals();
  }
  if (isSim && state.asideTab) {
    switchAsideTab(state.asideTab);
  }
}

function switchSignalMode(mode) {
  state.signalMode = mode;
  if (els.signalTraining && els.signalChallenge) {
    els.signalTraining.classList.toggle("toggle-active", mode === "training");
    els.signalChallenge.classList.toggle("toggle-active", mode === "challenge");
  }
  renderSignals();
}

function switchAsideTab(tab) {
  state.asideTab = tab;
  els.asideWhy.classList.toggle("hidden", tab !== "why");
  els.asidePrinciples.classList.toggle("hidden", tab !== "principles");
  els.asideTabWhy.classList.toggle("tab-active", tab === "why");
  els.asideTabPrinciples.classList.toggle("tab-active", tab === "principles");
}
function renderSignals() {
  const list = signalScenarios.filter((s) => s.mode === state.signalMode);
  if (!list.length) return;
  if (state.signalIndex >= list.length) state.signalIndex = 0;
  const scenario = list[state.signalIndex];
  if (!scenario) return;
  els.signalTitle.textContent = scenario.title;
  els.signalContainer.innerHTML = `<div class="signal-text"></div>`;
  const host = els.signalContainer.querySelector(".signal-text");
  host.innerHTML = scenario.html;

  // Wrap all text into word spans, preserving which ones are signals
  const wordSpans = [];
  const processNode = (node, isSignal) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach((part) => {
        if (!part.length) return;
        if (!part.trim()) {
          host.appendChild(document.createTextNode(part));
          return;
        }
        const span = document.createElement("span");
        span.className = "signal-word";
        if (isSignal) span.dataset.signal = "true";
        span.textContent = part;
        wordSpans.push(span);
        host.appendChild(span);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === "BR") {
        host.appendChild(document.createElement("br"));
        return;
      }
      const flag = isSignal || node.hasAttribute("data-signal");
      Array.from(node.childNodes).forEach((child) => processNode(child, flag));
    }
  };

  const original = Array.from(host.childNodes);
  host.innerHTML = "";
  original.forEach((child) => processNode(child, false));

  const signals = wordSpans.filter((n) => n.dataset.signal === "true");
  state.signalsTotal = signals.length;
  state.signalsFound = 0;
  state.challengeSelections = new Set();

  wordSpans.forEach((node) => {
    node.classList.remove("found", "wrong", "hint", "selected");
    node.addEventListener("click", () => handleSignalClick(node));
  });

  if (state.signalMode === "training") {
    signals.forEach((n) => n.classList.add("hint"));
  }

  updateSignalStatus();
}

function handleSignalClick(node) {
  const isActualSignal = node.dataset.signal === "true";
  if (state.signalMode === "training") {
    if (node.classList.contains("found")) return;
    if (isActualSignal) {
      node.classList.add("found");
      state.signalsFound += 1;
    } else {
      node.classList.add("wrong");
    }
    updateSignalStatus();
    return;
  }
  // challenge: toggle selection only, score on check
  node.classList.toggle("selected");
  if (node.classList.contains("selected")) {
    state.challengeSelections.add(node);
  } else {
    state.challengeSelections.delete(node);
  }
}

function updateSignalStatus(extra = "") {
  const base = `Signals found: ${state.signalsFound}/${state.signalsTotal} · mode: ${state.signalMode}`;
  els.signalStatus.textContent = extra ? `${base} · ${extra}` : base;
}

function checkSignals() {
  if (state.signalMode === "training") {
    revealSignals();
    return;
  }
  const signals = Array.from(
    els.signalContainer.querySelectorAll(".signal-word[data-signal='true']")
  );
  const selections = Array.from(state.challengeSelections);
  selections.forEach((node) => {
    if (signals.includes(node)) {
      node.classList.add("found");
    } else {
      node.classList.add("wrong");
    }
  });
  const correct = selections.filter((n) => signals.includes(n)).length;
  const wrong = selections.length - correct;
  const missed = signals.length - correct;
  state.signalsFound = correct;
  state.signalsTotal = signals.length;
  updateSignalStatus(`correct: ${correct} · wrong: ${wrong} · missed: ${missed}`);

  const list = signalScenarios.filter((s) => s.mode === state.signalMode);
  const scenario = list[state.signalIndex];
  if (scenario) {
    saveSignalRun({
      id: Date.now(),
      mode: state.signalMode,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      correct,
      wrong,
      missed,
      total: signals.length,
      finishedAt: new Date().toISOString(),
    });
  }
}

function revealSignals() {
  const signals = Array.from(
    els.signalContainer.querySelectorAll(".signal-word[data-signal='true']")
  );
  signals.forEach((sig) => sig.classList.add("found"));
  state.signalsFound = signals.length;
  state.signalsTotal = signals.length;
  updateSignalStatus();

  const list = signalScenarios.filter((s) => s.mode === state.signalMode);
  const scenario = list[state.signalIndex];
  if (scenario) {
    saveSignalRun({
      id: Date.now(),
      mode: state.signalMode,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      correct: signals.length,
      wrong: 0,
      missed: 0,
      total: signals.length,
      finishedAt: new Date().toISOString(),
      reveal: true,
    });
  }
}

function exportRunsAsImage() {
  const runs = loadRuns();
  const signalRuns = loadSignalRuns();
  if (!runs.length) {
    alert("No runs to export yet.");
    return;
  }
  const width = 1100;
  const margin = 40;
  const headerHeight = 120;
  const summaryHeight = 160;
  const tableRowHeight = 44;
  const tableHeaderHeight = 60;
  const maxRows = 8;
  const rows = runs.slice(0, maxRows);
  // collapse to highest correct per scenario+mode
  const bestSignalMap = new Map();
  signalRuns.forEach((run) => {
    const key = `${run.scenarioId}-${run.mode}`;
    const existing = bestSignalMap.get(key);
    if (!existing || (run.correct || 0) > (existing.correct || 0)) {
      bestSignalMap.set(key, run);
    }
  });
  const signalRows = Array.from(bestSignalMap.values());
  const tableHeight = tableHeaderHeight + rows.length * tableRowHeight;
  const signalTableHeight = signalRows.length
    ? tableHeaderHeight + signalRows.length * tableRowHeight
    : 0;
  const height = headerHeight + summaryHeight + tableHeight + signalTableHeight + margin * 2 + 40;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 30px 'Inter','Segoe UI',sans-serif";
  ctx.fillText("Safe Chat Simulator – Report", margin, 60);
  ctx.fillStyle = "#475569";
  ctx.font = "15px 'Inter','Segoe UI',sans-serif";
  const now = new Date().toLocaleString();
  ctx.fillText(`Exported: ${now}`, margin, 84);
  ctx.fillText(`Runs shown: ${rows.length} (most recent first)`, margin, 106);

  // Summary panel
  const summaryTop = headerHeight;
  const summaryWidth = width - margin * 2;
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(margin, summaryTop, summaryWidth, summaryHeight);
  ctx.strokeStyle = "#cbd5e1";
  ctx.strokeRect(margin, summaryTop, summaryWidth, summaryHeight);

  const avgSafety = Math.round(runs.reduce((acc, r) => acc + (r.safety || 0), 0) / runs.length);
  const avgRisk = Math.round(runs.reduce((acc, r) => acc + (r.risk || 0), 0) / runs.length);
  const trainingRuns = runs.filter((r) => r.mode === "training").length;
  const challengeRuns = runs.filter((r) => r.mode === "challenge").length;
  const trainingDone = trainingComplete();
  const challengeDone = challengeComplete();
  const signalSessions = signalRuns.length;
  const signalChallenge = signalRuns.filter((s) => s.mode === "challenge").length;
  const avgSignals = signalRuns.length
    ? Math.round(signalRuns.reduce((acc, s) => acc + (s.correct || 0), 0) / signalRuns.length)
    : 0;

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 18px 'Inter','Segoe UI',sans-serif";
  ctx.fillText("Summary", margin + 16, summaryTop + 28);

  ctx.font = "15px 'Inter','Segoe UI',sans-serif";
  ctx.fillStyle = "#1f2937";
  ctx.fillText(`Avg Safety: ${avgSafety}`, margin + 16, summaryTop + 56);
  ctx.fillText(`Avg Risk: ${avgRisk}`, margin + 200, summaryTop + 56);
  ctx.fillText(`Training runs: ${trainingRuns}`, margin + 16, summaryTop + 80);
  ctx.fillText(`Challenge runs: ${challengeRuns}`, margin + 200, summaryTop + 80);
  ctx.fillText(`Training complete: ${trainingDone ? "Yes" : "No"}`, margin + 16, summaryTop + 104);
  ctx.fillText(`Challenge complete: ${challengeDone ? "Yes" : "No"}`, margin + 200, summaryTop + 104);
  ctx.fillText(`Signal sessions: ${signalSessions}`, margin + 420, summaryTop + 56);
  ctx.fillText(`Signal challenge sessions: ${signalChallenge}`, margin + 420, summaryTop + 80);
  ctx.fillText(`Avg signals found: ${avgSignals}`, margin + 420, summaryTop + 104);

  // Table headers
  const tableTop = summaryTop + summaryHeight + 20;
  const colScenario = margin;
  const colMode = margin + 460;
  const colSafety = margin + 610;
  const colRisk = margin + 700;
  const colTime = margin + 780;

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 16px 'Inter','Segoe UI',sans-serif";
  ctx.fillText("Scenario", colScenario, tableTop + 24);
  ctx.fillText("Mode", colMode, tableTop + 24);
  ctx.fillText("Safety", colSafety, tableTop + 24);
  ctx.fillText("Risk", colRisk, tableTop + 24);
  ctx.fillText("Finished at", colTime, tableTop + 24);

  // Table rows
  ctx.font = "15px 'Inter','Segoe UI',sans-serif";
  rows.forEach((run, idx) => {
    const y = tableTop + tableHeaderHeight + idx * tableRowHeight + 6;
    ctx.fillStyle = idx % 2 === 0 ? "#f1f5f9" : "#e2e8f0";
    ctx.fillRect(margin, y - 26, width - margin * 2, tableRowHeight);
    ctx.fillStyle = "#0f172a";
    ctx.fillText(run.scenarioTitle || "Scenario", colScenario, y);
    ctx.fillText(run.mode || "-", colMode, y);
    ctx.fillText(String(Math.round(run.safety || 0)), colSafety, y);
    ctx.fillText(String(Math.round(run.risk || 0)), colRisk, y);
    const timeLabel = run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "Unknown";
    ctx.fillText(timeLabel, colTime, y);
  });

  // Signal table
  if (signalRows.length) {
    const sigTop = tableTop + tableHeight + 30;
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 16px 'Inter','Segoe UI',sans-serif";
    ctx.fillText("Signal Lab Sessions", colScenario, sigTop);

    const headerY = sigTop + 26;
    ctx.fillText("Scenario", colScenario, headerY);
    ctx.fillText("Mode", colMode, headerY);
    ctx.fillText("Correct", colSafety, headerY);
    ctx.fillText("Wrong", colRisk, headerY);
    ctx.fillText("Finished at", colTime, headerY);

    ctx.font = "15px 'Inter','Segoe UI',sans-serif";
    signalRows.forEach((sig, idx) => {
      const y = sigTop + tableHeaderHeight + idx * tableRowHeight + 6;
      ctx.fillStyle = idx % 2 === 0 ? "#f8fafc" : "#e2e8f0";
      ctx.fillRect(margin, y - 26, width - margin * 2, tableRowHeight);
      ctx.fillStyle = "#0f172a";
      ctx.fillText(sig.scenarioTitle || "Scenario", colScenario, y);
      ctx.fillText(sig.mode || "-", colMode, y);
      ctx.fillText(String(sig.correct || 0), colSafety, y);
      ctx.fillText(String(sig.wrong || 0), colRisk, y);
      const timeLabel = sig.finishedAt ? new Date(sig.finishedAt).toLocaleString() : "Unknown";
      ctx.fillText(timeLabel, colTime, y);
    });
  }

  // Export
  const link = document.createElement("a");
  link.download = "safe_chat_report.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
