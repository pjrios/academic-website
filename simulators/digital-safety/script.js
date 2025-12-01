// Digital Safety Simulator

// Progress tracking
let completedLessons = JSON.parse(localStorage.getItem('digitalSafetyProgress') || '[]');
let viewedLessons = JSON.parse(localStorage.getItem('digitalSafetyViewed') || '[]');

// Save progress
function saveProgress() {
  localStorage.setItem('digitalSafetyProgress', JSON.stringify(completedLessons));
  localStorage.setItem('digitalSafetyViewed', JSON.stringify(viewedLessons));
  updateProgressIndicators();
}

// Mark lesson as viewed
function markLessonViewed(tab, lessonId) {
  const lessonKey = `${tab}-${lessonId}`;
  if (!viewedLessons.includes(lessonKey)) {
    viewedLessons.push(lessonKey);
    saveProgress();
    console.log('Marked as viewed:', lessonKey, 'Total viewed:', viewedLessons.length);
  }
}

// Mark lesson as completed
function markLessonCompleted(tab, lessonId) {
  const lessonKey = `${tab}-${lessonId}`;
  if (!completedLessons.includes(lessonKey)) {
    completedLessons.push(lessonKey);
    // Also mark as viewed if not already
    if (!viewedLessons.includes(lessonKey)) {
      viewedLessons.push(lessonKey);
    }
    saveProgress();
    console.log('Marked as completed:', lessonKey, 'Total completed:', completedLessons.length);
    // Force update indicators
    setTimeout(() => {
      updateProgressIndicators();
    }, 100);
  }
}

// Update progress indicators
function updateProgressIndicators() {
  // Map tab IDs (handle singular/plural differences)
  const tabIdMap = {
    'passwords': 'passwords',
    'personal': 'personal',
    'websites': 'websites',
    'etiquette': 'etiquette'
  };
  
  document.querySelectorAll('.lesson-nav-item').forEach(item => {
    const tabContent = item.closest('.tab-content');
    if (!tabContent) return;
    
    const tabId = tabContent.id.replace('Tab', '');
    const tab = tabIdMap[tabId] || tabId;
    const lessonId = item.getAttribute('data-lesson');
    
    if (!lessonId) return;
    
    const lessonKey = `${tab}-${lessonId}`;
    
    // Remove existing indicators and classes
    item.classList.remove('viewed', 'completed');
    const existingIndicator = item.querySelector('.progress-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    if (completedLessons.includes(lessonKey)) {
      item.classList.add('completed');
      // Don't add extra checkmark - CSS ::after handles it
    } else if (viewedLessons.includes(lessonKey)) {
      item.classList.add('viewed');
    }
  });
}

// Tab switching
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'digital-safety';
};

const SIMULATOR_NAME = getSimulatorName();
const TAB_STORAGE_KEY = `tabState_${SIMULATOR_NAME}`;

// Save tab state to localStorage
function saveTabState(tabId) {
  try {
    localStorage.setItem(TAB_STORAGE_KEY, tabId);
  } catch (e) {
    console.warn('Failed to save tab state:', e);
  }
}

// Restore tab state from localStorage
function restoreTabState() {
  try {
    const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
    if (savedTab) {
      const tabButton = document.querySelector(`.tab-button[data-tab="${savedTab}"]`);
      const tabContent = document.getElementById(`${savedTab}Tab`);
      
      if (tabButton && tabContent) {
        tabButtons.forEach(btn => btn.classList.remove('tab-active'));
        tabContents.forEach(content => content.classList.remove('tab-active'));
        tabButton.classList.add('tab-active');
        tabContent.classList.add('tab-active');
        
        // Load first lesson of the tab
        const firstNavItem = document.querySelector(`#${savedTab}Tab .lesson-nav-item.active`);
        if (firstNavItem) {
          const lessonId = firstNavItem.getAttribute('data-lesson');
          loadLesson(savedTab, lessonId);
        }
        
        // Update progress indicators
        setTimeout(() => {
          updateProgressIndicators();
        }, 100);
        
        return savedTab;
      }
    }
  } catch (e) {
    console.warn('Failed to restore tab state:', e);
  }
  return null;
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab');
    
    tabButtons.forEach(btn => btn.classList.remove('tab-active'));
    button.classList.add('tab-active');
    
    tabContents.forEach(content => {
      content.classList.remove('tab-active');
      if (content.id === `${targetTab}Tab`) {
        content.classList.add('tab-active');
      }
    });
    
    // Save tab state
    saveTabState(targetTab);
    
    // Load first lesson of the tab
    const firstNavItem = document.querySelector(`#${targetTab}Tab .lesson-nav-item.active`);
    if (firstNavItem) {
      const lessonId = firstNavItem.getAttribute('data-lesson');
      loadLesson(targetTab, lessonId);
    }
    
    // Update progress indicators when switching tabs
    setTimeout(() => {
      updateProgressIndicators();
    }, 100);
  });
});

// Restore tab state on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    restoreTabState();
  });
} else {
  restoreTabState();
}

// Lesson navigation - use event delegation to handle clicks
function initLessonNavigation() {
  // Use event delegation on each tab content area
  document.querySelectorAll('.tab-content').forEach(tabContent => {
    const lessonNav = tabContent.querySelector('.lesson-nav');
    if (lessonNav && !lessonNav.hasAttribute('data-initialized')) {
      lessonNav.setAttribute('data-initialized', 'true');
      lessonNav.addEventListener('click', (e) => {
        const item = e.target.closest('.lesson-nav-item');
        if (!item) return;
        
        e.preventDefault();
        const tab = tabContent.id.replace('Tab', '');
        const lessonId = item.getAttribute('data-lesson');
        
        if (!lessonId) return;
        
        // Update active state
        lessonNav.querySelectorAll('.lesson-nav-item').forEach(nav => {
          nav.classList.remove('active');
        });
        item.classList.add('active');
        
        loadLesson(tab, lessonId);
      });
    }
  });
}

// Load lesson content
function loadLesson(tab, lessonId) {
  // Map tab names to content div IDs (handle singular/plural differences)
  const contentIdMap = {
    'passwords': 'passwordContent',
    'personal': 'personalContent',
    'websites': 'websitesContent',
    'etiquette': 'etiquetteContent'
  };
  
  const contentId = contentIdMap[tab] || `${tab}Content`;
  const contentDiv = document.getElementById(contentId);
  
  if (!contentDiv) {
    console.error(`Content div not found: ${contentId}`);
    return;
  }
  
  if (!lessons[tab]) {
    console.error(`Tab lessons not found: ${tab}`);
    return;
  }
  
  const lesson = lessons[tab][lessonId];
  if (!lesson) {
    console.error(`Lesson not found: ${tab}/${lessonId}`);
    return;
  }
  
  contentDiv.innerHTML = lesson.content;
  
  // Mark lesson as viewed
  markLessonViewed(tab, lessonId);
  
  // Add interactive question if it exists
  if (lesson.activity) {
    const activityHTML = renderActivity(lesson.activity, tab, lessonId);
    contentDiv.innerHTML += activityHTML;
  }
  
  // Initialize interactive elements
  if (lesson.init) {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      lesson.init();
    }, 10);
  }
  
  // Initialize activity if it exists
  if (lesson.activity) {
    setTimeout(() => {
      initActivity(tab, lessonId, lesson.activity);
    }, 50);
  }
  
  // Update progress indicators
  updateProgressIndicators();
}

// Render activity/question
function renderActivity(activity, tab, lessonId) {
  if (!activity) return '';
  
  const activityId = `activity-${tab}-${lessonId}`;
  
  if (activity.type === 'multiple-choice') {
    return `
      <div class="activity-section" id="${activityId}">
        <h3 style="margin-top: 40px; padding-top: 30px; border-top: 2px solid var(--border-subtle);">🎯 Check Your Understanding</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">Answer this question to complete the lesson:</p>
        <div class="activity-question">
          <p><strong>${activity.question}</strong></p>
          <div class="activity-options">
            ${activity.options.map((option, index) => `
              <div class="activity-option" data-index="${index}">
                ${option}
              </div>
            `).join('')}
          </div>
          <div class="activity-feedback" id="${activityId}-feedback"></div>
        </div>
      </div>
    `;
  } else if (activity.type === 'true-false') {
    return `
      <div class="activity-section" id="${activityId}">
        <h3 style="margin-top: 40px; padding-top: 30px; border-top: 2px solid var(--border-subtle);">🎯 Check Your Understanding</h3>
        <p style="color: var(--text-muted); margin-bottom: 20px;">Answer this question to complete the lesson:</p>
        <div class="activity-question">
          <p><strong>${activity.question}</strong></p>
          <div class="activity-options">
            <div class="activity-option" data-answer="true">True</div>
            <div class="activity-option" data-answer="false">False</div>
          </div>
          <div class="activity-feedback" id="${activityId}-feedback"></div>
        </div>
      </div>
    `;
  }
  
  return '';
}

// Initialize activity
function initActivity(tab, lessonId, activity) {
  const activityId = `activity-${tab}-${lessonId}`;
  const activityEl = document.getElementById(activityId);
  if (!activityEl) return;
  
  const feedbackEl = document.getElementById(`${activityId}-feedback`);
  const options = activityEl.querySelectorAll('.activity-option');
  let answered = false;
  
  // Check if already completed
  const lessonKey = `${tab}-${lessonId}`;
  if (completedLessons.includes(lessonKey)) {
    // Show correct answer
    if (activity.type === 'multiple-choice') {
      const correctIndex = activity.correct;
      options.forEach((opt, idx) => {
        if (idx === correctIndex) {
          opt.classList.add('correct');
        }
      });
    } else if (activity.type === 'true-false') {
      const correctAnswer = activity.correct ? 'true' : 'false';
      options.forEach(opt => {
        if (opt.getAttribute('data-answer') === correctAnswer) {
          opt.classList.add('correct');
        }
      });
    }
    if (feedbackEl) {
      feedbackEl.className = 'activity-feedback correct';
      feedbackEl.innerHTML = '<strong>✓ Correct!</strong> ' + (activity.explanation || 'Great job!');
    }
    return;
  }
  
  options.forEach(option => {
    option.addEventListener('click', function() {
      if (answered) return;
      answered = true;
      
      let isCorrect = false;
      
      if (activity.type === 'multiple-choice') {
        const selectedIndex = parseInt(this.getAttribute('data-index'));
        isCorrect = selectedIndex === activity.correct;
        
        // Show all options
        options.forEach((opt, idx) => {
          opt.classList.remove('selected');
          if (idx === activity.correct) {
            opt.classList.add('correct');
          } else if (idx === selectedIndex && !isCorrect) {
            opt.classList.add('incorrect');
          }
        });
        this.classList.add('selected');
      } else if (activity.type === 'true-false') {
        const selectedAnswer = this.getAttribute('data-answer') === 'true';
        isCorrect = selectedAnswer === activity.correct;
        
        options.forEach(opt => {
          opt.classList.remove('selected');
          const optAnswer = opt.getAttribute('data-answer') === 'true';
          if (optAnswer === activity.correct) {
            opt.classList.add('correct');
          } else if (opt.getAttribute('data-answer') === this.getAttribute('data-answer') && !isCorrect) {
            opt.classList.add('incorrect');
          }
        });
        this.classList.add('selected');
      }
      
      // Show feedback
      if (feedbackEl) {
        feedbackEl.className = `activity-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackEl.innerHTML = `<strong>${isCorrect ? '✓ Correct!' : '✗ Not quite right.'}</strong> ${activity.explanation || ''}`;
      }
      
      // Mark as completed if correct
      if (isCorrect) {
        markLessonCompleted(tab, lessonId);
        setTimeout(() => {
          updateProgressIndicators();
        }, 100);
      }
    });
  });
}

// Password Lessons
const passwordLessons = {
  'password-intro': {
    content: `
      <h2>🔑 Password Security</h2>
      <p>Passwords are your first line of defense against unauthorized access to your accounts. A strong password can protect your personal information, financial data, and digital identity.</p>
      
      <h3>Why Passwords Matter</h3>
      <p>Think of your password like a key to your house. If someone gets your key, they can enter your house and take your belongings. Similarly, if someone gets your password, they can access your accounts and steal your information.</p>
      
      <div class="example-box bad">
        <strong>❌ Weak Password Example:</strong> "password123"
        <p>This is one of the most common passwords. Hackers try these first!</p>
      </div>
      
      <div class="example-box good">
        <strong>✅ Strong Password Example:</strong> "Tr0ub@dor&3"
        <p>This password uses uppercase, lowercase, numbers, and special characters. It's much harder to guess or crack.</p>
      </div>
      
      <h3>Common Password Mistakes</h3>
      <ul>
        <li>Using personal information (name, birthday, pet's name)</li>
        <li>Using common words or phrases</li>
        <li>Reusing the same password for multiple accounts</li>
        <li>Writing passwords down in plain sight</li>
        <li>Sharing passwords with friends</li>
      </ul>
      
      <p><strong>Next:</strong> Learn about password strength and how to create secure passwords.</p>
    `,
    activity: {
      type: 'multiple-choice',
      question: 'Why is "password123" a weak password?',
      options: [
        'It\'s too long and complex',
        'It\'s one of the most common passwords hackers try first',
        'It contains numbers',
        'It\'s easy to remember'
      ],
      correct: 1,
      explanation: 'Correct! "password123" is extremely common and is one of the first passwords hackers try. Always use unique, unpredictable passwords.'
    }
  },
  
  'password-strength': {
    content: `
      <h2>Password Strength</h2>
      <p>A strong password is difficult for others to guess or crack. Here's what makes a password strong:</p>
      
      <h3>Password Strength Factors</h3>
      <ul class="checklist">
        <li><strong>Length:</strong> At least 12-16 characters (longer is better!)</li>
        <li><strong>Uppercase letters:</strong> A-Z</li>
        <li><strong>Lowercase letters:</strong> a-z</li>
        <li><strong>Numbers:</strong> 0-9</li>
        <li><strong>Special characters:</strong> !@#$%^&*()_+-=[]{}|;:,.<>?</li>
        <li><strong>Unpredictability:</strong> Not based on personal information or common patterns</li>
      </ul>
      
      <h3>Password Strength Levels</h3>
      <div class="example-box bad">
        <strong>Weak Password:</strong> "password" or "123456"
        <p>Too short, too common, easily guessed. Can be cracked in seconds.</p>
      </div>
      
      <div class="example-box warning">
        <strong>Medium Password:</strong> "Password123"
        <p>Has some variety but still predictable. Can be cracked in hours or days.</p>
      </div>
      
      <div class="example-box good">
        <strong>Strong Password:</strong> "K9#mP2$vL8@xQ!"
        <p>Long, complex, unpredictable. Would take years or decades to crack.</p>
      </div>
      
      <h3>Creating Memorable Strong Passwords</h3>
      <p>You don't have to use random characters! Try these techniques:</p>
      <ul>
        <li><strong>Passphrase method:</strong> "Coffee#Makes#Me#Happy2024!" (combine words with numbers and symbols)</li>
        <li><strong>Substitution method:</strong> "P@ssw0rd!" (replace letters with similar-looking numbers/symbols)</li>
        <li><strong>Sentence method:</strong> "MyDogLovesToPlayInThePark!" (use a memorable sentence)</li>
      </ul>
    `,
    activity: {
      type: 'multiple-choice',
      question: 'What is the minimum recommended length for a strong password?',
      options: [
        '6 characters',
        '8 characters',
        '12 characters',
        '16 characters'
      ],
      correct: 2,
      explanation: 'Correct! 12 characters is the minimum recommended length. Longer passwords are even better!'
    }
  },
  
  'password-practices': {
    content: `
      <h2>Password Best Practices</h2>
      <p>Creating a strong password is just the first step. Here are essential practices to keep your accounts secure:</p>
      
      <h3>✅ Do's</h3>
      <ul class="checklist">
        <li>Use a unique password for each account</li>
        <li>Change passwords regularly (every 3-6 months)</li>
        <li>Use a password manager to store passwords securely</li>
        <li>Enable two-factor authentication (2FA) when available</li>
        <li>Use passphrases for important accounts</li>
        <li>Check if your password has been compromised (haveibeenpwned.com)</li>
      </ul>
      
      <h3>❌ Don'ts</h3>
      <ul class="checklist">
        <li class="missing">Don't reuse passwords across multiple accounts</li>
        <li class="missing">Don't share passwords with anyone</li>
        <li class="missing">Don't write passwords on sticky notes or in plain text files</li>
        <li class="missing">Don't use personal information (name, birthday, address)</li>
        <li class="missing">Don't use common patterns (qwerty, 12345, abc123)</li>
        <li class="missing">Don't use dictionary words alone</li>
      </ul>
      
      <h3>Password Managers</h3>
      <p>Password managers are tools that securely store all your passwords. They:</p>
      <ul>
        <li>Generate strong, unique passwords for you</li>
        <li>Remember all your passwords so you don't have to</li>
        <li>Encrypt your passwords with a master password</li>
        <li>Auto-fill passwords on websites</li>
      </ul>
      <p><strong>Popular password managers:</strong> LastPass, 1Password, Bitwarden, Dashlane</p>
      
      <h3>Two-Factor Authentication (2FA)</h3>
      <p>2FA adds an extra layer of security. Even if someone gets your password, they need a second code (usually from your phone) to log in.</p>
      <p><strong>Example:</strong> When you log in, you enter your password, then you receive a code on your phone that you must enter to complete login.</p>
    `,
    activity: {
      type: 'true-false',
      question: 'It\'s safe to reuse the same password for multiple accounts if it\'s a strong password.',
      correct: false,
      explanation: 'False! Never reuse passwords, even strong ones. If one account is compromised, all your accounts become vulnerable. Use a unique password for each account.'
    }
  },
  
  'password-checker': {
    content: `
      <h2>Password Strength Checker</h2>
      <p>Test your password strength below. Try different passwords to see how they rate!</p>
      
      <div class="password-checker">
        <input type="text" id="passwordInput" placeholder="Enter a password to check..." />
        <div class="password-strength">
          <div class="strength-bar">
            <div class="strength-fill" id="strengthFill"></div>
          </div>
          <div class="strength-text" id="strengthText">Enter a password to check strength</div>
          <div id="passwordFeedback" style="margin-top: 12px; font-size: 0.9rem; color: var(--text-muted);"></div>
        </div>
      </div>
      
      <h3>What Makes a Password Strong?</h3>
      <ul>
        <li>✅ At least 12 characters long</li>
        <li>✅ Contains uppercase and lowercase letters</li>
        <li>✅ Contains numbers</li>
        <li>✅ Contains special characters (!@#$%^&*)</li>
        <li>✅ Not a common password or dictionary word</li>
        <li>✅ Not based on personal information</li>
      </ul>
    `,
    init: function() {
      const input = document.getElementById('passwordInput');
      const strengthFill = document.getElementById('strengthFill');
      const strengthText = document.getElementById('strengthText');
      const feedback = document.getElementById('passwordFeedback');
      
      if (!input) return;
      
      input.addEventListener('input', () => {
        const password = input.value;
        const result = checkPasswordStrength(password);
        
        strengthFill.className = `strength-fill ${result.strength}`;
        strengthText.className = `strength-text ${result.strength}`;
        strengthText.textContent = result.text;
        
        let feedbackHTML = '<strong>Feedback:</strong><ul style="margin-top: 8px; margin-left: 20px;">';
        result.checks.forEach(check => {
          feedbackHTML += `<li style="${check.pass ? 'color: var(--success)' : 'color: var(--danger)'}">${check.pass ? '✓' : '✗'} ${check.message}</li>`;
        });
        feedbackHTML += '</ul>';
        feedback.innerHTML = feedbackHTML;
      });
    },
    activity: {
      type: 'multiple-choice',
      question: 'You test a password and it shows as "Weak". What should you do?',
      options: [
        'Use it anyway - weak passwords are easier to remember',
        'Make it stronger by adding length, uppercase, lowercase, numbers, and special characters',
        'Share it with a friend to get their opinion',
        'Write it down on a sticky note'
      ],
      correct: 1,
      explanation: 'Correct! If a password is weak, make it stronger by adding length (12+ characters), mixing uppercase and lowercase letters, numbers, and special characters.'
    }
  },
  
  'password-quiz': {
    content: `
      <h2>Password Security Quiz</h2>
      <p>Test your knowledge about password security!</p>
      
      <div class="quiz-container" id="passwordQuiz"></div>
    `,
    init: function() {
      const quiz = [
        {
          question: "What is the minimum recommended length for a strong password?",
          options: ["6 characters", "8 characters", "12 characters", "16 characters"],
          correct: 2,
          explanation: "12 characters is the minimum recommended length. Longer passwords are even better!"
        },
        {
          question: "Which password is the strongest?",
          options: ["password123", "MyDog2024", "K9#mP2$vL8@xQ!", "12345678"],
          correct: 2,
          explanation: "K9#mP2$vL8@xQ! is the strongest because it's long, uses mixed case, numbers, and special characters, and is unpredictable."
        },
        {
          question: "Is it safe to reuse the same password for multiple accounts?",
          options: ["Yes, if it's a strong password", "No, never reuse passwords", "Only for unimportant accounts", "Only if you change it regularly"],
          correct: 1,
          explanation: "Never reuse passwords! If one account is compromised, all your accounts become vulnerable."
        },
        {
          question: "What is two-factor authentication (2FA)?",
          options: ["Using two passwords", "An extra security step requiring a code from your phone", "Having two accounts", "Using a password manager"],
          correct: 1,
          explanation: "2FA adds an extra layer of security by requiring both your password and a code from your phone or authenticator app."
        },
        {
          question: "Should you share your password with a trusted friend?",
          options: ["Yes, if they promise not to tell anyone", "No, never share passwords", "Only for social media accounts", "Only if you change it after"],
          correct: 1,
          explanation: "Never share passwords, even with trusted friends. You can't control what happens after you share it."
        }
      ];
      
      renderQuiz('passwordQuiz', quiz);
    }
  }
};

// Personal Info Lessons
const personalLessons = {
  'personal-intro': {
    content: `
      <h2>👤 Protecting Personal Information</h2>
      <p>Your personal information is valuable. Scammers and identity thieves want to steal it to commit fraud, access your accounts, or impersonate you.</p>
      
      <h3>What is Personal Information?</h3>
      <p>Personal information is any data that can identify you or be used to access your accounts. This includes:</p>
      <ul>
        <li>Full name</li>
        <li>Date of birth</li>
        <li>Social Security Number (SSN)</li>
        <li>Address and phone number</li>
        <li>Email address</li>
        <li>Bank account numbers</li>
        <li>Credit card numbers</li>
        <li>Passwords</li>
        <li>Mother's maiden name</li>
        <li>School name or workplace</li>
      </ul>
      
      <h3>Why It Matters</h3>
      <p>Once someone has your personal information, they can:</p>
      <ul>
        <li>Open credit cards in your name</li>
        <li>Access your bank accounts</li>
        <li>Steal your identity</li>
        <li>Pretend to be you online</li>
        <li>Target you with scams</li>
      </ul>
      
      <div class="example-box warning">
        <strong>⚠️ Remember:</strong> Once you share personal information online, you can't take it back. Always think carefully before sharing!
      </div>
    `,
    activity: {
      type: 'multiple-choice',
      question: 'Which of the following is considered personal information?',
      options: [
        'Your favorite color',
        'Your full name and date of birth',
        'Your favorite movie',
        'Your general interests'
      ],
      correct: 1,
      explanation: 'Correct! Your full name and date of birth are personal information that can be used to identify you. Favorite colors, movies, and general interests are safer to share.'
    }
  },
  
  'personal-safe': {
    content: `
      <h2>Information Safe to Share</h2>
      <p>Not all information is dangerous to share. Here's what's generally safe to share publicly or with trusted people:</p>
      
      <h3>✅ Generally Safe to Share</h3>
      <ul class="checklist">
        <li><strong>First name only</strong> (not full name with last name)</li>
        <li><strong>General interests</strong> (favorite movies, hobbies, music)</li>
        <li><strong>City or state</strong> (not full address)</li>
        <li><strong>Age range</strong> (not exact birthday)</li>
        <li><strong>School name</strong> (if it's a large school, not your specific class or schedule)</li>
        <li><strong>General opinions</strong> (on topics, not personal details)</li>
      </ul>
      
      <h3>⚠️ Share with Caution</h3>
      <ul>
        <li><strong>Photos:</strong> Only share with people you trust. Be careful about location data in photos.</li>
        <li><strong>Email address:</strong> Use a separate email for public forums and social media.</li>
        <li><strong>Phone number:</strong> Only share with close friends and family.</li>
        <li><strong>Social media:</strong> Keep profiles private and only accept friend requests from people you know.</li>
      </ul>
      
      <div class="example-box good">
        <strong>✅ Safe Sharing Example:</strong>
        <p>"Hi! I'm Sarah, I'm 16 and I love playing guitar. I live in California."</p>
        <p>This shares general information without revealing specific details that could be used to identify or locate you.</p>
      </div>
    `,
    activity: {
      type: 'true-false',
      question: 'It\'s safe to share your full home address on social media if your profile is set to private.',
      correct: false,
      explanation: 'False! Even with a private profile, you should never share your full address. Information can be leaked, accounts can be hacked, or friends might share it without realizing the risk.'
    }
  },
  
  'personal-private': {
    content: `
      <h2>Information to Keep Private</h2>
      <p>Some information should NEVER be shared online or with strangers. Here's what to keep private:</p>
      
      <h3>🔒 Never Share Online</h3>
      <ul class="checklist">
        <li class="missing"><strong>Full name</strong> (especially with last name)</li>
        <li class="missing"><strong>Exact address</strong> (home, school, or work address)</li>
        <li class="missing"><strong>Phone number</strong></li>
        <li class="missing"><strong>Date of birth</strong> (especially year)</li>
        <li class="missing"><strong>Social Security Number (SSN)</strong></li>
        <li class="missing"><strong>Bank account or credit card numbers</strong></li>
        <li class="missing"><strong>Passwords</strong></li>
        <li class="missing"><strong>School schedule</strong> (when you're alone)</li>
        <li class="missing"><strong>Parent's names and workplaces</strong></li>
        <li class="missing"><strong>Current location</strong> (especially if you're alone)</li>
      </ul>
      
      <h3>Why These Are Dangerous</h3>
      <div class="example-box bad">
        <strong>❌ Dangerous Example:</strong>
        <p>"Hey everyone! I'm John Smith, I live at 123 Main St, and my birthday is March 15, 2008. My mom works at ABC Company."</p>
        <p>This gives scammers everything they need to steal your identity or find you in person!</p>
      </div>
      
      <h3>Red Flags</h3>
      <p>Be suspicious if someone asks for:</p>
      <ul>
        <li>Your password "to help you"</li>
        <li>Your address "to send you something"</li>
        <li>Your SSN "to verify your identity"</li>
        <li>Your parent's information</li>
        <li>Money or gift cards</li>
      </ul>
      <p><strong>Remember:</strong> Legitimate companies and websites will NEVER ask for your password or SSN via email or chat.</p>
    `,
    activity: {
      type: 'multiple-choice',
      question: 'Someone online asks for your Social Security Number to "verify your identity". What should you do?',
      options: [
        'Provide it - they need it for verification',
        'Provide it only if the website looks professional',
        'Never provide your SSN online - this is likely a scam',
        'Ask your parents first, then provide it'
      ],
      correct: 2,
      explanation: 'Correct! Legitimate websites and services never need your Social Security Number for basic verification. This is almost always a scam. Never share your SSN online.'
    }
  },
  
  'personal-scenarios': {
    content: `
      <h2>Personal Information Scenarios</h2>
      <p>Practice identifying what information is safe to share in different situations.</p>
      
      <div id="personalScenarios"></div>
    `,
    init: function() {
      const scenarios = [
        {
          question: "A new friend online asks for your full name and address to send you a birthday card. What should you do?",
          options: [
            "Share your full name and address - they're being nice!",
            "Share only your first name and city",
            "Don't share any personal information",
            "Share your address but not your name"
          ],
          correct: 2,
          explanation: "Never share your full name and address with someone you just met online. You don't know if they're really who they say they are."
        },
        {
          question: "A website asks for your email, password, and Social Security Number to create an account. What should you do?",
          options: [
            "Provide all the information - it's a legitimate website",
            "Provide email and password, but not SSN",
            "Don't create the account - legitimate sites don't need your SSN",
            "Provide SSN but use a fake password"
          ],
          correct: 2,
          explanation: "Legitimate websites never need your Social Security Number to create an account. This is likely a scam."
        },
        {
          question: "Someone claiming to be from your bank calls and asks for your account number to 'verify your identity'. What should you do?",
          options: [
            "Give them your account number - they're from the bank",
            "Ask for their name and call the bank back using the number on your card",
            "Give them partial information",
            "Hang up and ignore it"
          ],
          correct: 1,
          explanation: "Never give account information to someone who calls you. Always call the bank yourself using the number on your card or statement."
        }
      ];
      
      renderScenarios('personalScenarios', scenarios);
    },
    activity: {
      type: 'multiple-choice',
      question: 'A friend you just met online asks for your full name and address to send you a gift. What should you do?',
      options: [
        'Share your full name and address - they\'re being nice!',
        'Share only your first name and city',
        'Don\'t share any personal information with someone you just met online',
        'Share your address but not your name'
      ],
      correct: 2,
      explanation: 'Correct! Never share your full name and address with someone you just met online. You don\'t know if they\'re really who they say they are.'
    }
  },
  
  'personal-quiz': {
    content: `
      <h2>Personal Information Quiz</h2>
      <p>Test your knowledge about protecting personal information!</p>
      
      <div class="quiz-container" id="personalQuiz"></div>
    `,
    init: function() {
      const quiz = [
        {
          question: "Is it safe to share your full name and address on social media?",
          options: ["Yes, if your profile is private", "No, never share your full address", "Yes, if you only share with friends", "Only if you're over 18"],
          correct: 1,
          explanation: "Never share your full address online, even with friends. Information can be leaked or accounts can be hacked."
        },
        {
          question: "A website asks for your Social Security Number. Should you provide it?",
          options: ["Yes, if it's a government website", "No, legitimate websites don't need your SSN", "Yes, if it's for verification", "Only if the website looks professional"],
          correct: 1,
          explanation: "Legitimate websites (except for specific government services) never need your SSN. This is a red flag for a scam."
        },
        {
          question: "What information is generally safe to share publicly?",
          options: ["Full name and city", "First name and general interests", "Address and phone number", "Date of birth and school name"],
          correct: 1,
          explanation: "First name and general interests are generally safe. Never share your full name, address, phone, or exact personal details publicly."
        }
      ];
      
      renderQuiz('personalQuiz', quiz);
    }
  }
};

// Secure Websites Lessons
const websitesLessons = {
  'websites-intro': {
    content: `
      <h2>🌐 Secure Websites</h2>
      <p>Not all websites are safe to visit or share information with. Learning to identify secure websites protects you from scams, malware, and identity theft.</p>
      
      <h3>Why Website Security Matters</h3>
      <p>When you visit a website, you might:</p>
      <ul>
        <li>Enter your password to log in</li>
        <li>Enter credit card information to make a purchase</li>
        <li>Share personal information in forms</li>
        <li>Download files or software</li>
      </ul>
      <p>If a website is not secure, hackers can intercept this information and steal it!</p>
      
      <h3>Types of Unsafe Websites</h3>
      <ul>
        <li><strong>Phishing sites:</strong> Fake websites that look like real ones to steal your login information</li>
        <li><strong>Malware sites:</strong> Websites that try to install viruses or malicious software on your device</li>
        <li><strong>Scam sites:</strong> Websites selling fake products or services</li>
        <li><strong>Unencrypted sites:</strong> Websites that don't protect your data when you send it</li>
      </ul>
      
      <div class="example-box warning">
        <strong>⚠️ Warning:</strong> Even if a website looks professional and legitimate, it might not be secure. Always check for security indicators!
      </div>
    `
  },
  
  'websites-https': {
    content: `
      <h2>HTTPS & SSL Certificates</h2>
      <p>HTTPS (HyperText Transfer Protocol Secure) is the secure version of HTTP. It encrypts data between your browser and the website.</p>
      
      <h3>How to Identify HTTPS</h3>
      <ul class="checklist">
        <li>Look for <strong>https://</strong> at the beginning of the URL (not just http://)</li>
        <li>Look for a <strong>lock icon</strong> 🔒 in the address bar</li>
        <li>The URL bar may be <strong>green</strong> or show "Secure"</li>
        <li>Click the lock icon to see certificate details</li>
      </ul>
      
      <div class="example-box good">
        <strong>✅ Secure Website:</strong>
        <div class="code-block">https://www.example.com</div>
        <p>Has "https://" and a lock icon. Your data is encrypted!</p>
      </div>
      
      <div class="example-box bad">
        <strong>❌ Insecure Website:</strong>
        <div class="code-block">http://www.example.com</div>
        <p>Only has "http://" (no 's'). Your data is NOT encrypted and can be intercepted!</p>
      </div>
      
      <h3>What is SSL/TLS?</h3>
      <p>SSL (Secure Sockets Layer) and TLS (Transport Layer Security) are encryption protocols that:</p>
      <ul>
        <li>Encrypt data so only you and the website can read it</li>
        <li>Verify that the website is who it claims to be</li>
        <li>Prevent hackers from intercepting your information</li>
      </ul>
      
      <h3>When HTTPS is Critical</h3>
      <p>Always use HTTPS when:</p>
      <ul>
        <li>Logging into accounts</li>
        <li>Entering credit card information</li>
        <li>Filling out forms with personal information</li>
        <li>Accessing banking or financial websites</li>
        <li>Sending sensitive data</li>
      </ul>
      
      <p><strong>Note:</strong> Modern browsers often warn you if you try to enter information on an insecure (HTTP) website.</p>
    `,
    activity: {
      type: 'true-false',
      question: 'A website with "http://" (without the "s") is secure for entering passwords and credit card information.',
      correct: false,
      explanation: 'False! HTTP (without the "s") is NOT secure. Your data is not encrypted and can be intercepted. Always look for HTTPS when entering sensitive information.'
    }
  },
  
  'websites-signs': {
    content: `
      <h2>Warning Signs of Unsafe Websites</h2>
      <p>Learn to recognize red flags that indicate a website might be unsafe or a scam.</p>
      
      <h3>🔴 Red Flags</h3>
      <ul class="checklist">
        <li class="missing"><strong>No HTTPS:</strong> URL starts with http:// instead of https://</li>
        <li class="missing"><strong>Misspelled URLs:</strong> "amaz0n.com" instead of "amazon.com"</li>
        <li class="missing"><strong>Too good to be true:</strong> Unrealistic deals, free expensive items</li>
        <li class="missing"><strong>Poor design:</strong> Broken images, spelling errors, looks unprofessional</li>
        <li class="missing"><strong>Urgent pressure:</strong> "Act now or lose your account!"</li>
        <li class="missing"><strong>Asks for unusual information:</strong> SSN, passwords, gift cards</li>
        <li class="missing"><strong>No contact information:</strong> Can't find a real address or phone number</li>
        <li class="missing"><strong>Suspicious pop-ups:</strong> Too many ads, fake virus warnings</li>
      </ul>
      
      <h3>Phishing Website Examples</h3>
      <div class="example-box bad">
        <strong>❌ Suspicious URL Examples:</strong>
        <ul>
          <li>amaz0n-login.com (looks like Amazon but isn't)</li>
          <li>paypa1-security.com (fake PayPal site)</li>
          <li>faceb00k-verify.com (fake Facebook site)</li>
        </ul>
        <p>Scammers create URLs that look similar to real websites to trick you!</p>
      </div>
      
      <h3>How to Verify a Website</h3>
      <ul>
        <li>Check the URL carefully - look for typos or extra characters</li>
        <li>Look for HTTPS and the lock icon</li>
        <li>Check if the website has a privacy policy and terms of service</li>
        <li>Look for contact information (real address, phone number)</li>
        <li>Read reviews from other users</li>
        <li>If in doubt, search for the company name + "scam" or "reviews"</li>
      </ul>
      
      <div class="example-box good">
        <strong>✅ Safe Website Indicators:</strong>
        <ul>
          <li>HTTPS with lock icon</li>
          <li>Professional design and spelling</li>
          <li>Clear contact information</li>
          <li>Privacy policy and terms of service</li>
          <li>Positive reviews from trusted sources</li>
        </ul>
      </div>
    `
  },
  
  'websites-checker': {
    content: `
      <h2>Website Safety Checker</h2>
      <p>Practice identifying safe and unsafe websites. Enter a URL below to check its safety indicators!</p>
      
      <div class="website-checker">
        <input type="text" id="websiteInput" placeholder="Enter a URL (e.g., https://www.example.com)" />
        <button class="btn" onclick="checkWebsite()">Check Website</button>
        <div id="websiteResult"></div>
      </div>
      
      <h3>What to Look For</h3>
      <ul>
        <li>✅ HTTPS in the URL</li>
        <li>✅ Lock icon in browser</li>
        <li>✅ Professional domain name (no typos)</li>
        <li>❌ HTTP (not secure)</li>
        <li>❌ Suspicious domain names</li>
        <li>❌ Too many redirects</li>
      </ul>
    `,
    init: function() {
      window.checkWebsite = function() {
        const input = document.getElementById('websiteInput');
        const result = document.getElementById('websiteResult');
        if (!input || !result) return;
        
        const url = input.value.trim();
        if (!url) {
          result.innerHTML = '<div class="website-result warning">Please enter a URL</div>';
          return;
        }
        
        // Basic URL validation
        let analysis = {
          hasHttps: url.toLowerCase().startsWith('https://'),
          hasHttp: url.toLowerCase().startsWith('http://'),
          hasProtocol: url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://'),
          suspiciousPatterns: [],
          safe: true
        };
        
        // Check for suspicious patterns
        const suspicious = ['amaz0n', 'paypa1', 'faceb00k', 'g00gle', 'app1e', 'micr0soft'];
        suspicious.forEach(pattern => {
          if (url.toLowerCase().includes(pattern)) {
            analysis.suspiciousPatterns.push(`Contains suspicious pattern: ${pattern}`);
            analysis.safe = false;
          }
        });
        
        // Check for common typos
        const commonTypos = ['amazom', 'amzon', 'ebayy', 'gooogle'];
        commonTypos.forEach(typo => {
          if (url.toLowerCase().includes(typo)) {
            analysis.suspiciousPatterns.push(`Possible typo detected: ${typo}`);
            analysis.safe = false;
          }
        });
        
        let resultHTML = '';
        if (!analysis.hasProtocol) {
          resultHTML = '<div class="website-result warning"><strong>⚠️ Warning:</strong> URL should start with http:// or https://</div>';
        } else if (analysis.hasHttp && !analysis.hasHttps) {
          resultHTML = '<div class="website-result unsafe"><strong>❌ Insecure:</strong> This website uses HTTP (not HTTPS). Your data is not encrypted and could be intercepted!</div>';
          analysis.safe = false;
        } else if (analysis.hasHttps && analysis.suspiciousPatterns.length === 0) {
          resultHTML = '<div class="website-result safe"><strong>✅ Looks Secure:</strong> This website uses HTTPS. However, always verify it\'s the legitimate website before entering personal information!</div>';
        } else {
          resultHTML = '<div class="website-result unsafe"><strong>❌ Suspicious:</strong> ' + analysis.suspiciousPatterns.join('<br>') + '<br><br>This website may be a phishing attempt. Do not enter any personal information!</div>';
        }
        
        result.innerHTML = resultHTML;
      };
      
      const input = document.getElementById('websiteInput');
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            checkWebsite();
          }
        });
      }
    },
    activity: {
      type: 'multiple-choice',
      question: 'You need to check if a website is secure. What should you look for?',
      options: [
        'A lot of ads on the page',
        'HTTPS in the URL and a lock icon in the browser',
        'A colorful design',
        'Many links on the page'
      ],
      correct: 1,
      explanation: 'Correct! Look for HTTPS in the URL (not just HTTP) and a lock icon in your browser\'s address bar. These indicate the website uses encryption to protect your data.'
    }
  },
  
  'websites-quiz': {
    content: `
      <h2>Secure Websites Quiz</h2>
      <p>Test your knowledge about website security!</p>
      
      <div class="quiz-container" id="websitesQuiz"></div>
    `,
    init: function() {
      const quiz = [
        {
          question: "What does HTTPS indicate about a website?",
          options: ["It's faster", "It's encrypted and secure", "It's more popular", "It has more features"],
          correct: 1,
          explanation: "HTTPS means the website uses encryption to protect your data. Always look for HTTPS when entering personal information!"
        },
        {
          question: "Which URL is most likely a phishing attempt?",
          options: ["https://www.amazon.com", "https://www.amaz0n-login.com", "https://www.paypal.com", "https://www.bankofamerica.com"],
          correct: 1,
          explanation: "amaz0n-login.com uses a zero instead of 'o' and adds '-login' - this is a common phishing technique to trick users."
        },
        {
          question: "Is it safe to enter your credit card on a website that uses HTTP (not HTTPS)?",
          options: ["Yes, if the website looks professional", "No, never enter sensitive information on HTTP sites", "Yes, if it's a well-known company", "Only if you trust the website"],
          correct: 1,
          explanation: "Never enter sensitive information on HTTP sites. Your data is not encrypted and can be intercepted by hackers."
        }
      ];
      
      renderQuiz('websitesQuiz', quiz);
    }
  }
};

// Digital Etiquette Lessons
const etiquetteLessons = {
  'etiquette-intro': {
    content: `
      <h2>💬 Digital Etiquette</h2>
      <p>Digital etiquette (also called "netiquette") is the code of good behavior online. Just like in real life, being respectful and considerate online makes the internet a better place for everyone.</p>
      
      <h3>Why Digital Etiquette Matters</h3>
      <p>Good digital etiquette:</p>
      <ul>
        <li>Creates a positive online environment</li>
        <li>Prevents misunderstandings and conflicts</li>
        <li>Protects your reputation</li>
        <li>Shows respect for others</li>
        <li>Helps you build positive relationships</li>
      </ul>
      
      <h3>The Golden Rule</h3>
      <p><strong>Treat others online as you would like to be treated in person.</strong></p>
      <p>Remember: There's a real person behind every screen, with real feelings.</p>
      
      <div class="example-box good">
        <strong>✅ Good Digital Etiquette:</strong>
        <p>Being kind, respectful, and considerate in all your online interactions.</p>
      </div>
      
      <div class="example-box bad">
        <strong>❌ Poor Digital Etiquette:</strong>
        <p>Saying things online you wouldn't say in person, being rude, or spreading rumors.</p>
      </div>
    `,
    activity: {
      type: 'multiple-choice',
      question: 'What is digital etiquette?',
      options: [
        'Using the latest technology',
        'The rules of polite behavior when communicating online',
        'Having the fastest internet connection',
        'Using social media every day'
      ],
      correct: 1,
      explanation: 'Correct! Digital etiquette is the set of rules for polite and respectful behavior when communicating online.'
    }
  },
  
  'etiquette-communication': {
    content: `
      <h2>Online Communication</h2>
      <p>How you communicate online affects how others perceive you and how they respond. Here are guidelines for good online communication:</p>
      
      <h3>✅ Do's</h3>
      <ul class="checklist">
        <li>Use proper grammar and spelling when possible</li>
        <li>Be clear and concise</li>
        <li>Use appropriate tone (formal for emails, casual for friends)</li>
        <li>Think before you send</li>
        <li>Respect others' opinions, even if you disagree</li>
        <li>Use emojis appropriately (not in formal communication)</li>
        <li>Respond in a timely manner</li>
        <li>Ask before sharing someone else's content</li>
      </ul>
      
      <h3>❌ Don'ts</h3>
      <ul class="checklist">
        <li class="missing">Don't TYPE IN ALL CAPS (it looks like you're shouting)</li>
        <li class="missing">Don't send multiple messages in a row (spamming)</li>
        <li class="missing">Don't use offensive language or slurs</li>
        <li class="missing">Don't spread rumors or gossip</li>
        <li class="missing">Don't share private conversations without permission</li>
        <li class="missing">Don't ignore messages for long periods without explanation</li>
        <li class="missing">Don't send unsolicited photos or files</li>
        <li class="missing">Don't tag people in embarrassing photos without asking</li>
      </ul>
      
      <h3>Email Etiquette</h3>
      <ul>
        <li>Use a clear subject line</li>
        <li>Start with a greeting (Hi, Hello, Dear)</li>
        <li>Be professional and polite</li>
        <li>End with a closing (Best regards, Sincerely, Thanks)</li>
        <li>Proofread before sending</li>
        <li>Don't use all caps or excessive exclamation marks</li>
      </ul>
      
      <h3>Social Media Etiquette</h3>
      <ul>
        <li>Think before you post - once it's online, it's hard to take back</li>
        <li>Don't overshare personal information</li>
        <li>Respect others' privacy - ask before posting photos of others</li>
        <li>Be authentic but considerate</li>
        <li>Don't engage in arguments publicly</li>
        <li>Use privacy settings appropriately</li>
      </ul>
    `,
    activity: {
      type: 'true-false',
      question: 'It\'s okay to use all caps (LIKE THIS) in online messages to show enthusiasm.',
      correct: false,
      explanation: 'False! Using all caps online is considered shouting and is poor digital etiquette. Use normal capitalization and punctuation.'
    }
  },
  
  'etiquette-privacy': {
    content: `
      <h2>Respecting Privacy Online</h2>
      <p>Privacy is a fundamental right. Respecting others' privacy online is essential for good digital etiquette.</p>
      
      <h3>What is Privacy?</h3>
      <p>Privacy means having control over your personal information and who can see it. Everyone has the right to privacy.</p>
      
      <h3>✅ Respecting Others' Privacy</h3>
      <ul class="checklist">
        <li>Ask permission before sharing someone's photo or information</li>
        <li>Don't share private messages or conversations</li>
        <li>Respect others' privacy settings</li>
        <li>Don't tag people in photos without permission</li>
        <li>Don't share someone's location without their consent</li>
        <li>Respect "do not share" requests</li>
        <li>Don't screenshot private conversations to share</li>
        <li>Ask before adding someone to a group chat</li>
      </ul>
      
      <h3>❌ Privacy Violations</h3>
      <ul class="checklist">
        <li class="missing">Sharing someone's personal information without permission</li>
        <li class="missing">Posting photos of others without asking</li>
        <li class="missing">Sharing private messages publicly</li>
        <li class="missing">Tagging people in embarrassing content</li>
        <li class="missing">Creating fake accounts pretending to be someone else</li>
        <li class="missing">Sharing someone's location or schedule</li>
      </ul>
      
      <h3>Your Own Privacy</h3>
      <p>You also have the right to privacy. You can:</p>
      <ul>
        <li>Set your social media profiles to private</li>
        <li>Block or unfriend people who make you uncomfortable</li>
        <li>Ask others to remove photos or posts about you</li>
        <li>Report privacy violations to platform moderators</li>
        <li>Control who can see your posts and information</li>
      </ul>
      
      <div class="example-box good">
        <strong>✅ Good Privacy Practice:</strong>
        <p>"Hey, I took a great photo of you at the party. Can I post it on Instagram?"</p>
        <p>Always ask before sharing photos or information about others!</p>
      </div>
      
      <div class="example-box bad">
        <strong>❌ Privacy Violation:</strong>
        <p>Posting a photo of a friend without asking, especially if it's embarrassing or they're in a private setting.</p>
      </div>
    `,
    activity: {
      type: 'multiple-choice',
      question: 'Is it okay to post a photo of a friend without asking them first?',
      options: [
        'Yes, if it\'s a good photo',
        'Yes, if they\'re in the background',
        'No, always ask permission first',
        'Only if it\'s on a private account'
      ],
      correct: 2,
      explanation: 'Correct! Always ask permission before posting photos of others. It\'s respectful and protects their privacy.'
    }
  },
  
  'etiquette-cyberbullying': {
    content: `
      <h2>Cyberbullying</h2>
      <p>Cyberbullying is using technology to harass, threaten, embarrass, or target another person. It's a serious issue that affects many people.</p>
      
      <h3>What is Cyberbullying?</h3>
      <p>Cyberbullying includes:</p>
      <ul>
        <li>Sending mean, threatening, or hurtful messages</li>
        <li>Spreading rumors or lies online</li>
        <li>Posting embarrassing photos or videos</li>
        <li>Creating fake accounts to harass someone</li>
        <li>Excluding someone from online groups</li>
        <li>Sharing someone's private information</li>
        <li>Threatening or intimidating someone online</li>
      </ul>
      
      <h3>Impact of Cyberbullying</h3>
      <p>Cyberbullying can cause:</p>
      <ul>
        <li>Emotional distress and anxiety</li>
        <li>Depression and low self-esteem</li>
        <li>Problems at school or work</li>
        <li>Social isolation</li>
        <li>In severe cases, self-harm or suicide</li>
      </ul>
      
      <h3>What to Do If You're Being Cyberbullied</h3>
      <ul class="checklist">
        <li><strong>Don't respond</strong> to the bully - it often makes things worse</li>
        <li><strong>Save evidence</strong> - take screenshots of messages, posts, or comments</li>
        <li><strong>Block the bully</strong> on all platforms</li>
        <li><strong>Tell a trusted adult</strong> - parent, teacher, counselor, or school administrator</li>
        <li><strong>Report it</strong> to the platform (social media, gaming, etc.)</li>
        <li><strong>Don't blame yourself</strong> - cyberbullying is never your fault</li>
        <li><strong>Seek support</strong> from friends, family, or counselors</li>
      </ul>
      
      <h3>What to Do If You See Cyberbullying</h3>
      <ul class="checklist">
        <li><strong>Don't participate</strong> - don't like, share, or comment on bullying content</li>
        <li><strong>Support the victim</strong> - reach out privately to offer support</li>
        <li><strong>Report it</strong> to the platform and to a trusted adult</li>
        <li><strong>Stand up</strong> - if safe, tell the bully to stop (but don't engage in arguments)</li>
        <li><strong>Be an ally</strong> - create a positive online environment</li>
      </ul>
      
      <h3>Preventing Cyberbullying</h3>
      <ul>
        <li>Think before you post - would you say this in person?</li>
        <li>Be kind and respectful in all online interactions</li>
        <li>Don't share or forward hurtful content</li>
        <li>Stand up for others who are being bullied</li>
        <li>Create positive online communities</li>
      </ul>
      
      <div class="example-box warning">
        <strong>⚠️ Important:</strong> If you or someone you know is being cyberbullied, tell a trusted adult immediately. Cyberbullying is serious and help is available.
      </div>
      
      <div class="example-box good">
        <strong>✅ Being an Upstander:</strong>
        <p>If you see someone being cyberbullied, you can help by:</p>
        <ul>
          <li>Not participating in the bullying</li>
          <li>Reporting it to the platform</li>
          <li>Supporting the victim privately</li>
          <li>Telling a trusted adult</li>
        </ul>
      </div>
    `,
    activity: {
      type: 'multiple-choice',
      question: 'What should you do if you see someone being cyberbullied?',
      options: [
        'Ignore it - it\'s not your problem',
        'Like or share the bullying content',
        'Report it to the platform and support the victim',
        'Join in to fit in with the group'
      ],
      correct: 2,
      explanation: 'Correct! If you see cyberbullying, report it to the platform and a trusted adult, and support the victim privately. Be an upstander, not a bystander.'
    }
  },
  
  'etiquette-quiz': {
    content: `
      <h2>Digital Etiquette Quiz</h2>
      <p>Test your knowledge about digital etiquette!</p>
      
      <div class="quiz-container" id="etiquetteQuiz"></div>
    `,
    init: function() {
      const quiz = [
        {
          question: "Is it okay to share someone's private message with others without their permission?",
          options: ["Yes, if it's funny", "No, never share private messages", "Yes, if they're not a close friend", "Only if you change their name"],
          correct: 1,
          explanation: "Never share private messages without permission. It violates privacy and trust."
        },
        {
          question: "What should you do if you see someone being cyberbullied?",
          options: ["Ignore it - it's not your problem", "Like or share the bullying content", "Report it and support the victim", "Join in to fit in"],
          correct: 2,
          explanation: "If you see cyberbullying, report it to the platform and a trusted adult, and support the victim privately."
        },
        {
          question: "Is it good digital etiquette to TYPE IN ALL CAPS?",
          options: ["Yes, it shows enthusiasm", "No, it looks like shouting", "Only in emails", "Only on social media"],
          correct: 1,
          explanation: "Typing in all caps is considered shouting online and is poor digital etiquette."
        },
        {
          question: "Should you ask permission before posting a photo of someone else?",
          options: ["No, if it's a good photo", "Yes, always ask first", "Only if they're in the background", "Only if it's embarrassing"],
          correct: 1,
          explanation: "Always ask permission before posting photos of others. It's respectful and protects their privacy."
        }
      ];
      
      renderQuiz('etiquetteQuiz', quiz);
    }
  }
};

// Combine all lessons
const lessons = {
  passwords: passwordLessons,
  personal: personalLessons,
  websites: websitesLessons,
  etiquette: etiquetteLessons
};

// Password strength checker
function checkPasswordStrength(password) {
  if (!password) {
    return {
      strength: 'weak',
      text: 'Enter a password to check strength',
      checks: []
    };
  }
  
  const checks = [];
  let score = 0;
  
  // Length check
  if (password.length >= 12) {
    checks.push({ pass: true, message: 'At least 12 characters long' });
    score += 2;
  } else if (password.length >= 8) {
    checks.push({ pass: false, message: 'Should be at least 12 characters (currently ' + password.length + ')' });
    score += 1;
  } else {
    checks.push({ pass: false, message: 'Too short (minimum 8 characters, recommended 12+)' });
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    checks.push({ pass: true, message: 'Contains uppercase letters' });
    score += 1;
  } else {
    checks.push({ pass: false, message: 'Add uppercase letters (A-Z)' });
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    checks.push({ pass: true, message: 'Contains lowercase letters' });
    score += 1;
  } else {
    checks.push({ pass: false, message: 'Add lowercase letters (a-z)' });
  }
  
  // Numbers check
  if (/\d/.test(password)) {
    checks.push({ pass: true, message: 'Contains numbers' });
    score += 1;
  } else {
    checks.push({ pass: false, message: 'Add numbers (0-9)' });
  }
  
  // Special characters check
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    checks.push({ pass: true, message: 'Contains special characters' });
    score += 1;
  } else {
    checks.push({ pass: false, message: 'Add special characters (!@#$%^&*)' });
  }
  
  // Common password check
  const commonPasswords = ['password', '123456', 'password123', 'qwerty', 'abc123', 'letmein', 'welcome'];
  const isCommon = commonPasswords.some(common => password.toLowerCase().includes(common));
  if (!isCommon) {
    checks.push({ pass: true, message: 'Not a common password' });
    score += 1;
  } else {
    checks.push({ pass: false, message: 'Avoid common passwords' });
  }
  
  // Determine strength
  let strength, text;
  if (score >= 6) {
    strength = 'strong';
    text = 'Strong Password ✓';
  } else if (score >= 4) {
    strength = 'medium';
    text = 'Medium Strength - Could be stronger';
  } else {
    strength = 'weak';
    text = 'Weak Password - Needs improvement';
  }
  
  return { strength, text, checks };
}

// Render quiz
function renderQuiz(containerId, quiz) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Determine which tab and lesson this quiz belongs to
  const tabContent = container.closest('.tab-content');
  const tab = tabContent ? tabContent.id.replace('Tab', '') : '';
  const lessonNav = tabContent ? tabContent.querySelector('.lesson-nav-item.active') : null;
  const lessonId = lessonNav ? lessonNav.getAttribute('data-lesson') : '';
  
  let html = '';
  let currentQuestion = 0;
  let score = 0;
  let answered = false;
  
  function renderQuestion() {
    if (currentQuestion >= quiz.length) {
      const percentage = Math.round((score / quiz.length) * 100);
      const passed = percentage >= 70; // 70% to pass
      
      // Mark lesson as completed if passed
      if (passed && tab && lessonId) {
        markLessonCompleted(tab, lessonId);
        // Update indicators immediately
        setTimeout(() => {
          updateProgressIndicators();
        }, 100);
      }
      
      html = `
        <div class="quiz-result">
          <h3>Quiz Complete!</h3>
          <p>You scored ${score} out of ${quiz.length} (${percentage}%)</p>
          ${passed ? '<p style="color: var(--accent); margin-top: 8px;">✓ Great job! Lesson marked as completed.</p>' : '<p style="color: var(--warning); margin-top: 8px;">Try to get 70% or higher to complete this lesson.</p>'}
          <button class="btn" onclick="location.reload()">Try Again</button>
        </div>
      `;
      container.innerHTML = html;
      return;
    }
    
    const q = quiz[currentQuestion];
    html = `
      <div class="quiz-question">
        <h4>Question ${currentQuestion + 1} of ${quiz.length}</h4>
        <p><strong>${q.question}</strong></p>
        <div class="quiz-options">
          ${q.options.map((option, index) => `
            <div class="quiz-option" data-index="${index}">
              ${option}
            </div>
          `).join('')}
        </div>
        ${answered ? `<div class="feedback ${q.options.indexOf(q.options[q.correct]) === selectedIndex ? 'correct' : 'incorrect'}">
          ${q.explanation}
        </div>
        <button class="btn" style="margin-top: 12px;" onclick="nextQuestion()">${currentQuestion < quiz.length - 1 ? 'Next Question' : 'See Results'}</button>` : ''}
      </div>
    `;
    container.innerHTML = html;
    
    if (!answered) {
      document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
          if (answered) return;
          answered = true;
          selectedIndex = parseInt(this.getAttribute('data-index'));
          const isCorrect = selectedIndex === q.correct;
          
          if (isCorrect) score++;
          
          document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.remove('selected');
            if (parseInt(opt.getAttribute('data-index')) === q.correct) {
              opt.classList.add('correct');
            } else if (parseInt(opt.getAttribute('data-index')) === selectedIndex && !isCorrect) {
              opt.classList.add('incorrect');
            }
          });
          
          this.classList.add('selected');
          renderQuestion();
        });
      });
    }
  }
  
  let selectedIndex = -1;
  window.nextQuestion = function() {
    currentQuestion++;
    answered = false;
    selectedIndex = -1;
    renderQuestion();
  };
  
  renderQuestion();
}

// Render scenarios
function renderScenarios(containerId, scenarios) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let html = '';
  scenarios.forEach((scenario, index) => {
    html += `
      <div class="scenario-box">
        <h4>Scenario ${index + 1}</h4>
        <p>${scenario.question}</p>
        <div class="scenario-options">
          ${scenario.options.map((option, optIndex) => `
            <div class="scenario-option" data-index="${optIndex}">
              ${option}
            </div>
          `).join('')}
        </div>
        <div id="scenario-feedback-${index}" class="feedback" style="display: none;"></div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  scenarios.forEach((scenario, index) => {
    document.querySelectorAll(`#personalScenarios .scenario-box:nth-child(${index + 1}) .scenario-option`).forEach(option => {
      option.addEventListener('click', function() {
        const selectedIndex = parseInt(this.getAttribute('data-index'));
        const isCorrect = selectedIndex === scenario.correct;
        const feedback = document.getElementById(`scenario-feedback-${index}`);
        
        // Remove previous selections
        this.parentElement.querySelectorAll('.scenario-option').forEach(opt => {
          opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Mark selected and correct/incorrect
        this.classList.add('selected');
        if (isCorrect) {
          this.classList.add('correct');
        } else {
          this.classList.add('incorrect');
          // Show correct answer
          this.parentElement.querySelectorAll('.scenario-option')[scenario.correct].classList.add('correct');
        }
        
        // Show feedback
        feedback.style.display = 'block';
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = `<strong>${isCorrect ? 'Correct!' : 'Not quite right.'}</strong> ${scenario.explanation}`;
      });
    });
  });
}

// Generate Progress Report
function generateReport() {
  // Calculate statistics
  const allLessons = [
    // Passwords
    'passwords-password-intro', 'passwords-password-strength', 'passwords-password-practices',
    'passwords-password-checker', 'passwords-password-quiz',
    // Personal Info
    'personal-personal-intro', 'personal-personal-safe', 'personal-personal-private',
    'personal-personal-scenarios', 'personal-personal-quiz',
    // Websites
    'websites-websites-intro', 'websites-websites-https', 'websites-websites-signs',
    'websites-websites-checker', 'websites-websites-quiz',
    // Etiquette
    'etiquette-etiquette-intro', 'etiquette-etiquette-communication',
    'etiquette-etiquette-privacy', 'etiquette-etiquette-cyberbullying', 'etiquette-etiquette-quiz'
  ];
  
  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;
  const viewedCount = viewedLessons.length;
  const completionRate = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const viewRate = totalLessons > 0 ? Math.round((viewedCount / totalLessons) * 100) : 0;
  
  // Debug: Log what's being tracked
  console.log('Report Debug:');
  console.log('Total lessons:', totalLessons);
  console.log('Completed lessons:', completedLessons);
  console.log('Viewed lessons:', viewedLessons);
  console.log('Completed count:', completedCount);
  console.log('Viewed count:', viewedCount);
  
  // Calculate by section
  const bySection = {
    'Passwords': { total: 5, completed: 0, viewed: 0 },
    'Personal Info': { total: 5, completed: 0, viewed: 0 },
    'Secure Websites': { total: 5, completed: 0, viewed: 0 },
    'Digital Etiquette': { total: 5, completed: 0, viewed: 0 }
  };
  
  completedLessons.forEach(lesson => {
    if (lesson.startsWith('passwords-')) bySection['Passwords'].completed++;
    else if (lesson.startsWith('personal-')) bySection['Personal Info'].completed++;
    else if (lesson.startsWith('websites-')) bySection['Secure Websites'].completed++;
    else if (lesson.startsWith('etiquette-')) bySection['Digital Etiquette'].completed++;
  });
  
  viewedLessons.forEach(lesson => {
    if (lesson.startsWith('passwords-')) bySection['Passwords'].viewed++;
    else if (lesson.startsWith('personal-')) bySection['Personal Info'].viewed++;
    else if (lesson.startsWith('websites-')) bySection['Secure Websites'].viewed++;
    else if (lesson.startsWith('etiquette-')) bySection['Digital Etiquette'].viewed++;
  });
  
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const reportHTML = `
    <div class="report-container" id="reportContent">
      <div class="report-header">
        <h1>Digital Safety Progress Report</h1>
        <div class="report-date">Generated on ${reportDate}</div>
      </div>
      
      <div class="report-section">
        <h2>Overall Progress</h2>
        <div style="background: var(--bg-subtle); padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid var(--accent);">
          <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">
            <strong style="color: var(--accent);">Completed</strong> = Passed quiz with 70% or higher<br>
            <strong style="color: var(--text-muted);">Viewed</strong> = Opened/read the lesson
          </p>
        </div>
        <div class="report-stats">
          <div class="report-stat-card">
            <div class="report-stat-value">${completedCount}</div>
            <div class="report-stat-label">Completed Lessons</div>
          </div>
          <div class="report-stat-card">
            <div class="report-stat-value">${viewedCount}</div>
            <div class="report-stat-label">Viewed Lessons</div>
          </div>
          <div class="report-stat-card">
            <div class="report-stat-value">${totalLessons}</div>
            <div class="report-stat-label">Total Lessons</div>
          </div>
          <div class="report-stat-card">
            <div class="report-stat-value">${completionRate}%</div>
            <div class="report-stat-label">Completion Rate</div>
          </div>
        </div>
        <div class="report-progress-bar">
          <div class="report-progress-fill" style="width: ${completionRate}%">
            ${completionRate}%
          </div>
        </div>
      </div>
      
      <div class="report-section">
        <h2>Progress by Section</h2>
        <div class="report-difficulty-breakdown">
          ${Object.entries(bySection).map(([section, data]) => `
            <div class="report-difficulty-card">
              <div class="report-difficulty-title">${section}</div>
              <div class="report-difficulty-count">${data.completed}/${data.total}</div>
              <div class="report-difficulty-total">Completed</div>
              <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-muted);">
                ${data.viewed} viewed
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="report-section">
        <h2>Completed Lessons (${completedCount})</h2>
        ${completedCount > 0 ? `
        <div class="report-projects-list">
          ${completedLessons.map(lesson => {
            const parts = lesson.split('-');
            const section = parts[0];
            const lessonName = parts.slice(1).join('-');
            const sectionName = section === 'passwords' ? 'Passwords' : 
                              section === 'personal' ? 'Personal Info' :
                              section === 'websites' ? 'Secure Websites' : 'Digital Etiquette';
            // Better name formatting
            let displayName = lessonName
              .replace(/password-/g, '')
              .replace(/personal-/g, '')
              .replace(/websites-/g, '')
              .replace(/etiquette-/g, '')
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace(/Intro/g, 'Introduction')
              .replace(/Quiz/g, 'Quiz')
              .trim();
            
            return `
              <div class="report-project-item completed">
                <div class="report-project-number">✓</div>
                <div class="report-project-info">
                  <div class="report-project-title">${displayName}</div>
                  <div class="report-project-difficulty">${sectionName}</div>
                </div>
                <div class="report-project-status">✓</div>
              </div>
            `;
          }).join('')}
        </div>
        ` : '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No lessons completed yet. Keep learning!</p>'}
      </div>
      
      <div class="report-section">
        <h2>Viewed Lessons (${viewedCount})</h2>
        ${viewedCount > 0 ? `
        <div class="report-projects-list">
          ${viewedLessons.map(lesson => {
            const parts = lesson.split('-');
            const section = parts[0];
            const lessonName = parts.slice(1).join('-');
            const sectionName = section === 'passwords' ? 'Passwords' : 
                              section === 'personal' ? 'Personal Info' :
                              section === 'websites' ? 'Secure Websites' : 'Digital Etiquette';
            const isCompleted = completedLessons.includes(lesson);
            let displayName = lessonName
              .replace(/password-/g, '')
              .replace(/personal-/g, '')
              .replace(/websites-/g, '')
              .replace(/etiquette-/g, '')
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace(/Intro/g, 'Introduction')
              .replace(/Quiz/g, 'Quiz')
              .trim();
            
            return `
              <div class="report-project-item ${isCompleted ? 'completed' : ''}">
                <div class="report-project-number">${isCompleted ? '✓' : '○'}</div>
                <div class="report-project-info">
                  <div class="report-project-title">${displayName}</div>
                  <div class="report-project-difficulty">${sectionName}</div>
                </div>
                <div class="report-project-status">${isCompleted ? '✓' : '○'}</div>
              </div>
            `;
          }).join('')}
        </div>
        ` : '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No lessons viewed yet.</p>'}
      </div>
      
      <div class="report-section">
        <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-top: 30px;">
          Keep up the great work! 🎉
        </div>
      </div>
    </div>
  `;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'report-modal';
  modal.innerHTML = `
    <div class="report-modal-content">
      <button class="report-modal-close" onclick="this.closest('.report-modal').remove()">×</button>
      ${reportHTML}
      <div class="report-actions">
        <button class="btn btn-primary" id="exportReportBtn" style="flex: 1;">
          <span>📥 Download as Image</span>
        </button>
        <button class="btn btn-secondary" onclick="this.closest('.report-modal').remove()" style="flex: 1;">
          <span>Close</span>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Export as image
  const exportBtn = modal.querySelector('#exportReportBtn');
  exportBtn.addEventListener('click', async () => {
    exportBtn.textContent = '⏳ Generating...';
    exportBtn.disabled = true;
    
    try {
      const reportContent = modal.querySelector('#reportContent');
      
      // Check if html2canvas is loaded
      if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas library not loaded');
      }
      
      const canvas = await html2canvas(reportContent, {
        backgroundColor: '#1e293b',
        scale: 2,
        logging: false,
        useCORS: true,
        windowWidth: reportContent.scrollWidth,
        windowHeight: reportContent.scrollHeight
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digital-safety-progress-report-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        exportBtn.textContent = '✓ Downloaded!';
        setTimeout(() => {
          exportBtn.textContent = '📥 Download as Image';
          exportBtn.disabled = false;
        }, 2000);
      }, 'image/png');
    } catch (error) {
      console.error('Error generating report image:', error);
      alert('Error generating report image. Please try again.');
      exportBtn.textContent = '📥 Download as Image';
      exportBtn.disabled = false;
    }
  });
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Export/Import Progress Functions
function exportProgress() {
  try {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      completedLessons: completedLessons,
      viewedLessons: viewedLessons
    };
    
    // Convert to JSON and download
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-safety-progress-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showNotification('Progress exported successfully!', 'success');
  } catch (error) {
    console.error('Error exporting progress:', error);
    showNotification('Error exporting progress. Please try again.', 'error');
  }
}

async function importProgress(file) {
  try {
    const text = await file.text();
    const importData = JSON.parse(text);
    
    // Validate structure
    if (!importData.version || !importData.completedLessons || !importData.viewedLessons) {
      throw new Error('Invalid file format. Please select a valid progress export file.');
    }
    
    // Confirm import
    const confirmed = confirm(
      `This will replace your current progress with the imported data.\n\n` +
      `Completed Lessons: ${importData.completedLessons.length}\n` +
      `Viewed Lessons: ${importData.viewedLessons.length}\n\n` +
      `Do you want to continue?`
    );
    
    if (!confirmed) {
      return;
    }
    
    // Import progress
    completedLessons = importData.completedLessons || [];
    viewedLessons = importData.viewedLessons || [];
    saveProgress();
    
    // Update UI
    updateProgressIndicators();
    
    // Show success message
    showNotification('Progress imported successfully!', 'success');
    
    // Reset file input
    const importFileInput = document.getElementById('importFileInput');
    if (importFileInput) {
      importFileInput.value = '';
    }
  } catch (error) {
    console.error('Error importing progress:', error);
    showNotification(`Error importing progress: ${error.message}`, 'error');
    
    // Reset file input
    const importFileInput = document.getElementById('importFileInput');
    if (importFileInput) {
      importFileInput.value = '';
    }
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'var(--accent)' : type === 'error' ? 'var(--danger)' : 'var(--bg-subtle)'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    font-size: 0.95rem;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  if (!document.querySelector('#notification-style')) {
    style.id = 'notification-style';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Initialize first lesson on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize lesson navigation
  initLessonNavigation();
  
  // Load first lesson of passwords tab
  loadLesson('passwords', 'password-intro');
  
  // Update progress indicators
  updateProgressIndicators();
  
  // Progress menu modal
  const progressMenuBtn = document.getElementById('progressMenuBtn');
  const progressMenuModal = document.getElementById('progressMenuModal');
  const closeProgressMenu = document.getElementById('closeProgressMenu');
  const exportBtn = document.getElementById('exportProgressBtn');
  const importBtn = document.getElementById('importProgressBtn');
  const importFileInput = document.getElementById('importFileInput');
  const generateReportBtn = document.getElementById('generateReportBtn');
  
  // Open progress menu
  if (progressMenuBtn && progressMenuModal) {
    progressMenuBtn.addEventListener('click', () => {
      progressMenuModal.style.display = 'flex';
    });
  }
  
  // Close progress menu
  if (closeProgressMenu && progressMenuModal) {
    closeProgressMenu.addEventListener('click', () => {
      progressMenuModal.style.display = 'none';
    });
  }
  
  // Close on outside click
  if (progressMenuModal) {
    progressMenuModal.addEventListener('click', (e) => {
      if (e.target === progressMenuModal) {
        progressMenuModal.style.display = 'none';
      }
    });
  }
  
  // Export/Import buttons
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportProgress();
      if (progressMenuModal) progressMenuModal.style.display = 'none';
    });
  }
  
  if (importBtn && importFileInput) {
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importProgress(e.target.files[0]);
        if (progressMenuModal) progressMenuModal.style.display = 'none';
      }
    });
  }
  
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      generateReport();
      if (progressMenuModal) progressMenuModal.style.display = 'none';
    });
  }
  
  // Also set up click handlers for lesson nav items that might be added dynamically
  // Re-initialize when tab changes
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      setTimeout(() => {
        initLessonNavigation();
        updateProgressIndicators();
      }, 200);
    });
  });
  
  // Update progress indicators periodically to catch any missed updates
  setInterval(() => {
    updateProgressIndicators();
  }, 2000);
});

