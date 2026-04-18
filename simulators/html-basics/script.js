// Tab switching
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const prevTabBtn = document.getElementById('prevTabBtn');
const nextTabBtn = document.getElementById('nextTabBtn');
let htmlEditor = null;

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'html-basics';
};

const SIMULATOR_NAME = getSimulatorName();
const TAB_STORAGE_KEY = `tabState_${SIMULATOR_NAME}`;
const LESSON_STORAGE_KEY = `lessonState_${SIMULATOR_NAME}`;
const SCROLL_STORAGE_PREFIX = `scrollState_${SIMULATOR_NAME}`;
let isRestoringScroll = false;

function getActiveTabId() {
  return document.querySelector('.tab-button.tab-active')?.getAttribute('data-tab') || null;
}

function getTabIds() {
  return Array.from(tabButtons)
    .map(button => button.getAttribute('data-tab'))
    .filter(Boolean);
}

function updateTabArrowState(tabId = getActiveTabId()) {
  const tabIds = getTabIds();
  const activeIndex = tabIds.indexOf(tabId);

  if (prevTabBtn) {
    prevTabBtn.disabled = activeIndex <= 0;
  }

  if (nextTabBtn) {
    nextTabBtn.disabled = activeIndex === -1 || activeIndex >= tabIds.length - 1;
  }
}

function refreshHtmlEditor() {
  if (!htmlEditor || typeof htmlEditor.refresh !== 'function') {
    return;
  }

  requestAnimationFrame(() => {
    htmlEditor.refresh();
  });
}

function getScrollStorageKey(tabId) {
  return `${SCROLL_STORAGE_PREFIX}_${tabId}`;
}

function saveScrollState(tabId = getActiveTabId()) {
  if (!tabId || isRestoringScroll) {
    return;
  }

  try {
    localStorage.setItem(getScrollStorageKey(tabId), String(window.scrollY));
  } catch (e) {
    console.warn('Failed to save scroll state:', e);
  }
}

function restoreScrollState(tabId = getActiveTabId()) {
  if (!tabId) {
    return;
  }

  try {
    const savedScroll = localStorage.getItem(getScrollStorageKey(tabId));
    if (savedScroll === null) {
      return;
    }

    const targetY = Math.max(0, Number(savedScroll) || 0);
    isRestoringScroll = true;
    requestAnimationFrame(() => {
      window.scrollTo({ top: targetY, behavior: 'auto' });
      window.setTimeout(() => {
        isRestoringScroll = false;
      }, 120);
    });
  } catch (e) {
    isRestoringScroll = false;
    console.warn('Failed to restore scroll state:', e);
  }
}

let scrollSaveTimeout = null;
window.addEventListener('scroll', () => {
  window.clearTimeout(scrollSaveTimeout);
  scrollSaveTimeout = window.setTimeout(() => saveScrollState(), 120);
}, { passive: true });

window.addEventListener('beforeunload', () => {
  saveScrollState();
});

function activateTab(tabId) {
  const tabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
  const tabContent = document.getElementById(`${tabId}Tab`);

  if (!tabButton || !tabContent) {
    return false;
  }

  tabButtons.forEach(btn => btn.classList.remove('tab-active'));
  tabContents.forEach(content => content.classList.remove('tab-active'));
  tabButton.classList.add('tab-active');
  tabContent.classList.add('tab-active');
  updateTabArrowState(tabId);

  if (tabId === 'practice') {
    refreshHtmlEditor();
  }

  return true;
}

function switchTabByOffset(offset) {
  const tabIds = getTabIds();
  const activeIndex = tabIds.indexOf(getActiveTabId());

  if (activeIndex === -1) {
    return false;
  }

  const targetIndex = activeIndex + offset;
  const targetTab = tabIds[targetIndex];

  if (!targetTab) {
    return false;
  }

  saveScrollState(tabIds[activeIndex]);

  if (activateTab(targetTab)) {
    saveTabState(targetTab);
    restoreScrollState(targetTab);
    return true;
  }

  return false;
}

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
    if (savedTab && activateTab(savedTab)) {
      return savedTab;
    }
  } catch (e) {
    console.warn('Failed to restore tab state:', e);
  }
  return null;
}

function saveLessonState(lessonId) {
  try {
    localStorage.setItem(LESSON_STORAGE_KEY, lessonId);
  } catch (e) {
    console.warn('Failed to save lesson state:', e);
  }
}

function getSavedLessonState() {
  try {
    return localStorage.getItem(LESSON_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to restore lesson state:', e);
    return null;
  }
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab');
    const currentTab = getActiveTabId();

    saveScrollState(currentTab);

    if (activateTab(targetTab)) {
      saveTabState(targetTab);
      restoreScrollState(targetTab);
    }
  });
});

prevTabBtn?.addEventListener('click', () => {
  switchTabByOffset(-1);
});

nextTabBtn?.addEventListener('click', () => {
  switchTabByOffset(1);
});

restoreTabState();
updateTabArrowState();

// Lesson content
const lessons = {
  intro: {
    title: 'Introduction to HTML & Bootstrap 5',
    content: `
      <h2>Start Here: Your First Web Page</h2>
      <p>In this lesson, you will make the first working version of your personal website. Do one step, check it, then move to the next step.</p>

      <div class="intro-summary">
        <div>
          <strong>HTML</strong>
          <span>puts text, headings, and sections on the page.</span>
        </div>
        <div>
          <strong>Bootstrap</strong>
          <span>adds ready-made styling after you add its two links.</span>
        </div>
        <div>
          <strong>Your goal today</strong>
          <span>make a starter page with a centered content area.</span>
        </div>
      </div>

      <h3>Words You Need for This Lesson</h3>
      <div class="concept-strip">
        <div><strong>&lt;head&gt;</strong><span>Page setup visitors do not see.</span></div>
        <div><strong>&lt;body&gt;</strong><span>The visible page content.</span></div>
        <div><strong>container</strong><span>A Bootstrap class that centers content.</span></div>
      </div>

      <div class="student-path">
        <section class="student-step">
          <div class="student-step-header">
            <div class="step-label">Step 1</div>
            <div class="step-status step-status--pending" data-starter-status="structure" aria-label="Starter file not done yet" title="Not done yet">✓</div>
          </div>
          <h3>Make the Starter File</h3>
          <p class="step-action"><strong>Do this:</strong> Open the Practice Builder and replace the editor text with this code.</p>
          <div class="code-block">
            <code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  &lt;title&gt;My Personal Website&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Welcome to My Website&lt;/h1&gt;
  &lt;p&gt;This is where your content will go!&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code>
          </div>
          <div class="step-check">
            <strong>Check it:</strong> Click <strong>Refresh</strong>. You should see a heading that says "Welcome to My Website" and one short paragraph.
          </div>
          <p><strong>Personalize it:</strong> Change the page title, heading, and paragraph to match your own website.</p>
        </section>

        <div class="step-arrow" aria-hidden="true">↓</div>

        <section class="student-step">
          <div class="step-label">Step 2</div>
          <h3>Turn On Bootstrap</h3>
          <p class="step-action"><strong>Do this in two small parts.</strong> Copy only the line shown in each box.</p>

          <div class="micro-step" data-bootstrap-step="css">
            <div class="micro-step-header">
              <div class="micro-step-label">2A</div>
              <div class="step-status step-status--pending" data-bootstrap-status="css" aria-label="Bootstrap CSS not done yet" title="Not done yet">✓</div>
            </div>
            <p><strong>Find this line:</strong> <code>&lt;/head&gt;</code></p>
            <p><strong>Paste this line above it:</strong></p>
            <div class="code-block">
              <code>&lt;link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"&gt;</code>
            </div>
          </div>

          <div class="micro-step" data-bootstrap-step="js">
            <div class="micro-step-header">
              <div class="micro-step-label">2B</div>
              <div class="step-status step-status--pending" data-bootstrap-status="js" aria-label="Bootstrap JS not done yet" title="Not done yet">✓</div>
            </div>
            <p><strong>Find this line:</strong> <code>&lt;/body&gt;</code></p>
            <p><strong>Paste this line above it:</strong></p>
            <div class="code-block">
              <code>&lt;script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"&gt;&lt;/script&gt;</code>
            </div>
          </div>

          <div class="step-check">
            <strong>Check it:</strong> Your preview may look almost the same. That is okay. Bootstrap is now ready for the next step.
          </div>
        </section>

        <div class="step-arrow" aria-hidden="true">↓</div>

        <section class="student-step">
          <div class="step-label">Step 3</div>
          <h3>Put the Page Content in a Container</h3>
          <p class="step-action"><strong>Do this in two small parts.</strong> Copy only the line shown in each box.</p>

          <div class="micro-step" data-container-step="open">
            <div class="micro-step-header">
              <div class="micro-step-label">3A</div>
              <div class="step-status step-status--pending" data-container-status="open" aria-label="Container opening tag not done yet" title="Not done yet">✓</div>
            </div>
            <p><strong>Find your heading line:</strong> it starts with <code>&lt;h1</code> and ends with <code>&lt;/h1&gt;</code>.</p>
            <p><strong>Paste this line above it:</strong></p>
            <div class="code-block">
              <code>&lt;div class="container"&gt;</code>
            </div>
          </div>

          <div class="micro-step" data-container-step="close">
            <div class="micro-step-header">
              <div class="micro-step-label">3B</div>
              <div class="step-status step-status--pending" data-container-status="close" aria-label="Container closing tag not done yet" title="Not done yet">✓</div>
            </div>
            <p><strong>Find your paragraph line:</strong> it starts with <code>&lt;p</code> and ends with <code>&lt;/p&gt;</code>.</p>
            <p><strong>Paste this line below it:</strong></p>
            <div class="code-block">
              <code>&lt;/div&gt;</code>
            </div>
          </div>
          <div class="step-check">
            <strong>Check it:</strong> Click <strong>Refresh</strong>. The content should no longer touch the left edge of the preview.
          </div>
          <p><strong>Why:</strong> A Bootstrap <code>container</code> centers your page content and gives it breathing room.</p>
        </section>
      </div>

      <div class="mini-checklist">
        <h3>Before You Continue</h3>
        <ul>
          <li>Your file starts with <code>&lt;!DOCTYPE html&gt;</code>.</li>
          <li>The Bootstrap <code>&lt;link&gt;</code> is inside <code>&lt;head&gt;</code>.</li>
          <li>The Bootstrap <code>&lt;script&gt;</code> is near the bottom, before <code>&lt;/body&gt;</code>.</li>
          <li>Your visible heading and paragraph are inside <code>&lt;div class="container"&gt;</code>.</li>
        </ul>
      </div>

      <div class="alert alert-success mt-4">
        <strong>What's Next:</strong> In the next lesson, you will turn this starter content into a hero section: the first big section visitors see.
      </div>
    `
  },
  headings: {
    title: 'Headings with Bootstrap',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>&lt;h1&gt;</strong><span>The main page heading.</span></div>
        <div><strong>class</strong><span>Adds Bootstrap styles to an HTML tag.</span></div>
        <div><strong>display-3</strong><span>Makes the main heading bigger.</span></div>
        <div><strong>lead</strong><span>Makes the paragraph stand out.</span></div>
        <div><strong>bg-primary</strong><span>Adds a blue Bootstrap background.</span></div>
        <div><strong>text-white</strong><span>Makes text white.</span></div>
        <div><strong>text-center</strong><span>Centers the text.</span></div>
        <div><strong>py-5</strong><span>Adds space above and below.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Add the Hero Box</h3>
        <p class="step-action"><strong>Do this in two small parts.</strong> Copy only the line shown in each box.</p>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1A</div>
            <div class="step-status step-status--pending" data-heading-status="hero-open" aria-label="Hero box opening tag not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="container"&gt;</code></p>
          <p><strong>Paste this line below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="bg-primary text-white text-center py-5 mb-5"&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1B</div>
            <div class="step-status step-status--pending" data-heading-status="hero-close" aria-label="Hero box closing tag not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your paragraph line:</strong> it starts with <code>&lt;p</code> and ends with <code>&lt;/p&gt;</code>.</p>
          <p><strong>Paste this line below it:</strong></p>
          <div class="code-block">
            <code>&lt;/div&gt;</code>
          </div>
        </div>

        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your heading area should have a blue background.
        </div>
      </section>

      <div class="lesson-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Make the Heading Bigger</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2</div>
            <div class="step-status step-status--pending" data-heading-status="display" aria-label="Display heading not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your heading opening tag:</strong> it starts with <code>&lt;h1</code>.</p>
          <p><strong>Change only the opening tag to this:</strong></p>
          <div class="code-block">
            <code>&lt;h1 class="display-3"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your heading should look larger.
        </div>
      </section>

      <div class="lesson-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Make the Paragraph Stand Out</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3</div>
            <div class="step-status step-status--pending" data-heading-status="lead" aria-label="Lead paragraph not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your paragraph opening tag:</strong> it starts with <code>&lt;p</code>.</p>
          <p><strong>Change only the opening tag to this:</strong></p>
          <div class="code-block">
            <code>&lt;p class="lead"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your paragraph should look bigger than regular paragraph text.
        </div>
        <p><strong>Personalize it:</strong> You can change the heading words and paragraph words. The checks should stay green.</p>
      </section>

      <div class="mini-checklist">
        <h3>Before You Continue</h3>
        <ul>
          <li>Your hero box has <code>bg-primary</code>, <code>text-white</code>, <code>text-center</code>, and <code>py-5</code>.</li>
          <li>Your main heading uses <code>class="display-3"</code>.</li>
          <li>Your paragraph uses <code>class="lead"</code>.</li>
          <li>You can change the visible text without breaking the checks.</li>
        </ul>
      </div>

      <div class="next-lesson-note">
        <strong>What's Next:</strong> In the next lesson, you will add a section under this hero area.
      </div>
    `
  },
  layoutBasics: {
    title: 'Layout Basics: Bootstrap Grid System',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>container</strong><span>Centers a section on the page.</span></div>
        <div><strong>row</strong><span>Holds columns side by side.</span></div>
        <div><strong>col-md-4</strong><span>Makes three equal columns on medium screens and larger.</span></div>
        <div><strong>mt-5</strong><span>Adds space above a section.</span></div>
        <div><strong>mb-4</strong><span>Adds space below a heading.</span></div>
        <div><strong>text-center</strong><span>Centers text.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Start a New Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1</div>
            <div class="step-status step-status--pending" data-layout-status="section" aria-label="Interests section not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line near the bottom:</strong> <code>&lt;/body&gt;</code></p>
          <p><strong>Paste this line above it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="container mt-5"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> This starts a new centered section below your hero.
        </div>
      </section>

      <div class="lesson-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Add the Section Heading</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2</div>
            <div class="step-status step-status--pending" data-layout-status="heading" aria-label="Interests heading not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="container mt-5"&gt;</code></p>
          <p><strong>Paste this line below it:</strong></p>
          <div class="code-block">
            <code>&lt;h2 class="text-center mb-4"&gt;A Few Things About Me&lt;/h2&gt;</code>
          </div>
        </div>
        <p><strong>Personalize it:</strong> You may change the words between <code>&lt;h2&gt;</code> and <code>&lt;/h2&gt;</code>.</p>
      </section>

      <div class="lesson-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Add a Row</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3</div>
            <div class="step-status step-status--pending" data-layout-status="row" aria-label="Grid row not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your new <code>&lt;h2&gt;</code> line.</strong></p>
          <p><strong>Paste this line below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="row"&gt;</code>
          </div>
        </div>
      </section>

      <div class="lesson-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Add Three Columns</h3>
        <p class="step-action"><strong>Do this in three small parts.</strong> Paste each column inside <code>&lt;div class="row"&gt;</code>.</p>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4A</div>
            <div class="step-status step-status--pending" data-layout-status="column-one" aria-label="First column not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Paste this below the row line:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-4"&gt;
  &lt;h4&gt;What I Study&lt;/h4&gt;
  &lt;p&gt;Write one sentence about what you enjoy learning.&lt;/p&gt;
&lt;/div&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4B</div>
            <div class="step-status step-status--pending" data-layout-status="column-two" aria-label="Second column not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Paste this below the first column:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-4"&gt;
  &lt;h4&gt;My Hobbies&lt;/h4&gt;
  &lt;p&gt;Write one sentence about an activity you like.&lt;/p&gt;
&lt;/div&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4C</div>
            <div class="step-status step-status--pending" data-layout-status="column-three" aria-label="Third column not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Paste this below the second column:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-4"&gt;
  &lt;h4&gt;My Goals&lt;/h4&gt;
  &lt;p&gt;Write one sentence about something you want to do.&lt;/p&gt;
&lt;/div&gt;</code>
          </div>
        </div>
        <p><strong>Personalize it:</strong> You can change the <code>&lt;h4&gt;</code> words and paragraph words.</p>
      </section>

      <div class="lesson-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 5</div>
        <h3>Close the Row and Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5</div>
            <div class="step-status step-status--pending" data-layout-status="close" aria-label="Grid closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the end of your third column.</strong></p>
          <p><strong>Paste these two lines below it:</strong></p>
          <div class="code-block">
            <code>&lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. You should see a section with three columns under your hero.
        </div>
      </section>

      <div class="mini-checklist">
        <h3>Before You Continue</h3>
        <ul>
          <li>Your new section starts with <code>&lt;div class="container mt-5"&gt;</code>.</li>
          <li>Your section heading uses <code>text-center</code> and <code>mb-4</code>.</li>
          <li>Your row uses <code>class="row"</code>.</li>
          <li>You have three <code>col-md-4</code> columns.</li>
          <li>You can change the visible text without breaking the checks.</li>
        </ul>
      </div>

      <div class="next-lesson-note">
        <strong>What's Next:</strong> In the next lesson, you will turn these columns into Bootstrap cards.
      </div>
    `
  },
  cards: {
    title: 'Cards & Components',
    content: `
      <h2>Bootstrap Cards</h2>
      <p>In the last lesson, you used the grid to place content in columns. In this lesson, you'll make those columns look cleaner and more organized by turning them into cards.</p>
      <p>Cards are flexible containers for displaying content. They're one of Bootstrap's most useful components!</p>
      
      <h3>Basic Card Structure</h3>
      <div class="code-block">
        <code>&lt;div class="card"&gt;
  &lt;div class="card-body"&gt;
    &lt;h5 class="card-title"&gt;Card Title&lt;/h5&gt;
    &lt;p class="card-text"&gt;Card content goes here.&lt;/p&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      
      <h3>Card Components</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>card:</strong> The main container</li>
        <li><strong>card-body:</strong> Adds padding inside the card</li>
        <li><strong>card-title:</strong> Styles headings inside cards</li>
        <li><strong>card-text:</strong> Styles paragraphs inside cards</li>
        <li><strong>card-img-top:</strong> Places image at the top of the card</li>
        <li><strong>card-header:</strong> Optional header section</li>
        <li><strong>card-footer:</strong> Optional footer section</li>
      </ul>
      
      <h3>Card with Image</h3>
      <div class="code-block">
        <code>&lt;div class="card"&gt;
  &lt;img src="image.jpg" class="card-img-top" alt="..."&gt;
  &lt;div class="card-body"&gt;
    &lt;h5 class="card-title"&gt;Card Title&lt;/h5&gt;
    &lt;p class="card-text"&gt;Card content.&lt;/p&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      
      <h3>Card Styling Options</h3>
      <div class="code-block">
        <code>&lt;!-- Colored borders --&gt;
&lt;div class="card border-primary"&gt;...&lt;/div&gt;
&lt;div class="card border-success"&gt;...&lt;/div&gt;

&lt;!-- Background colors --&gt;
&lt;div class="card bg-primary text-white"&gt;...&lt;/div&gt;
&lt;div class="card bg-light"&gt;...&lt;/div&gt;

&lt;!-- Equal height cards in a row --&gt;
&lt;div class="card h-100"&gt;...&lt;/div&gt;</code>
      </div>
      
      <h2>Other Useful Components</h2>
      
      <h3>List Groups</h3>
      <p>Styled lists for displaying items:</p>
      <div class="code-block">
        <code>&lt;ul class="list-group"&gt;
  &lt;li class="list-group-item"&gt;First item&lt;/li&gt;
  &lt;li class="list-group-item"&gt;Second item&lt;/li&gt;
  &lt;li class="list-group-item"&gt;Third item&lt;/li&gt;
&lt;/ul&gt;

&lt;!-- List group inside card (no borders) --&gt;
&lt;ul class="list-group list-group-flush"&gt;
  &lt;li class="list-group-item"&gt;Item without border&lt;/li&gt;
&lt;/ul&gt;</code>
      </div>
      
      <h3>Blockquotes</h3>
      <p>For displaying quotes or testimonials:</p>
      <div class="code-block">
        <code>&lt;blockquote class="blockquote"&gt;
  &lt;p class="mb-0"&gt;"This is a quote."&lt;/p&gt;
  &lt;footer class="blockquote-footer"&gt;
    Author Name
  &lt;/footer&gt;
&lt;/blockquote&gt;</code>
      </div>
      
      <h2>🎯 Upgrade Your Website: Turn Your Interests Row into Cards</h2>
      <p><strong>Starting point:</strong> Your page already has the three-column interests row from the Layout Basics lesson.</p>
      <p><strong>What to do:</strong> Keep the same three-column grid, but replace the plain colored boxes inside each column with Bootstrap cards:</p>
      <div class="code-block">
        <code>&lt;!-- Interests section upgraded with Bootstrap cards --&gt;
&lt;div class="container mt-5"&gt;
  &lt;h2 class="text-center mb-4"&gt;A Few Things About Me&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;div class="card h-100 border-primary"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;What I Study&lt;/h5&gt;
          &lt;p class="card-text"&gt;Write one or two sentences about what you study or what you enjoy learning.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;div class="card h-100 border-success"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;My Hobbies&lt;/h5&gt;
          &lt;p class="card-text"&gt;Share a hobby, activity, or interest that is important to you.&lt;/p&gt;
          &lt;ul class="list-group list-group-flush"&gt;
            &lt;li class="list-group-item"&gt;Hobby 1&lt;/li&gt;
            &lt;li class="list-group-item"&gt;Hobby 2&lt;/li&gt;
          &lt;/ul&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;div class="card h-100 bg-light"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;My Goals&lt;/h5&gt;
          &lt;p class="card-text"&gt;Add something you hope to do, make, or achieve in the future.&lt;/p&gt;
          &lt;blockquote class="blockquote mb-0"&gt;
            &lt;p class="mb-0"&gt;"A short quote or motto that inspires me."&lt;/p&gt;
          &lt;/blockquote&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Replace the sample titles, text, hobbies, and quote with your own information.</p>
      <p><strong>Why:</strong> This keeps the same layout from the previous lesson, but makes each column feel more polished. It also prepares you for the biography section in the next lesson, which uses a larger card.</p>

      <div class="alert alert-info mt-4">
        <strong>✅ Progress Checkpoint:</strong> Your interests section should still have three columns, but now each column should look like a card. On medium and large screens, the cards should line up nicely and stay the same height.
      </div>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Add an image to one card using <code>card-img-top</code></li>
        <li>Try different border colors like <code>border-warning</code> or <code>border-info</code></li>
        <li>Change one card to <code>bg-primary text-white</code> and see how the look changes</li>
        <li>Add or remove list items to make the hobbies card fit you better</li>
      </ul>
      
      <div class="alert alert-success mt-4">
        <strong>📖 What's Next:</strong> Now that you understand grids and cards, you'll use them together in the next lesson to create your biography section!
      </div>
    `
  },
  paragraphs: {
    title: 'Paragraphs & Text with Bootstrap',
    content: `
      <h2>Paragraphs in HTML</h2>
      <p>You already have a hero section and a cards section on your page. In this lesson, you'll use paragraphs and text formatting to add a longer "About Me" section underneath them.</p>
      <p>The <code>&lt;p&gt;</code> tag creates paragraphs. Bootstrap adds helpful text utilities and classes.</p>
      
      <h3>Basic Paragraph</h3>
      <div class="code-block">
        <code>&lt;p&gt;This is a paragraph of text.&lt;/p&gt;
&lt;p class="lead"&gt;This is a lead paragraph - larger and more prominent.&lt;/p&gt;</code>
      </div>
      
      <h3>Example</h3>
      <div class="example-preview">
        <p class="lead">This is a lead paragraph - perfect for introductions!</p>
        <p>This is a regular paragraph. It can contain multiple sentences and will automatically wrap.</p>
        <p class="text-muted">This paragraph uses Bootstrap's muted text color.</p>
      </div>
      
      <h3>Bootstrap Text Utilities</h3>
      <div class="code-block">
        <code>&lt;p class="text-center"&gt;Centered text&lt;/p&gt;
&lt;p class="text-end"&gt;Right-aligned text&lt;/p&gt;
&lt;p class="text-primary"&gt;Primary color text&lt;/p&gt;
&lt;p class="text-success"&gt;Success color text&lt;/p&gt;
&lt;p class="fw-bold"&gt;Bold text&lt;/p&gt;
&lt;p class="fst-italic"&gt;Italic text&lt;/p&gt;</code>
      </div>
      
      <h2>🎯 Add to Your Website: Biography Section</h2>
      <p><strong>Starting point:</strong> Your page already has a hero section followed by the interests cards section.</p>
      <p><strong>📍 Placement:</strong> Add this biography section after the interests cards section so your page keeps growing from top to bottom:</p>
      <p><strong>💡 Remember:</strong> You've already learned about grids and cards in previous lessons. Now you'll use those skills again, but with more focus on writing and text formatting.</p>
      
      <div class="code-block">
        <code>&lt;!-- Biography section container with top margin --&gt;
&lt;div class="container mt-5" id="about"&gt;
  &lt;!-- Bootstrap grid row --&gt;
  &lt;div class="row"&gt;
    &lt;!-- Centered column: 8/12 width on medium+ screens --&gt;
    &lt;div class="col-md-8 mx-auto"&gt;
      &lt;!-- Bootstrap card component --&gt;
      &lt;div class="card"&gt;
        &lt;div class="card-body"&gt;
          &lt;h2 class="card-title"&gt;About Me&lt;/h2&gt;
          &lt;p class="card-text"&gt;
            Write a short biography about yourself here. 
            Include where you're from, what you study, your hobbies, 
            and what makes you unique!
          &lt;/p&gt;
          &lt;p class="card-text"&gt;
            Add another paragraph with more details about your interests, 
            goals, or anything else you'd like to share.
          &lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Replace the placeholder text with your actual biography. Write about your background, interests, goals, or anything that helps someone get to know you better.</p>
      <p><strong>Why:</strong> This section gives your website a stronger personal voice. <code>col-md-8 mx-auto</code> keeps the text centered and readable, <code>mt-5</code> adds spacing above the section, and <code>id="about"</code> prepares this section for the navbar link you'll add later.</p>
      
      <h3>HTML Text Formatting</h3>
      <div class="code-block">
        <code>&lt;p&gt;
  &lt;strong&gt;This is bold text&lt;/strong&gt;&lt;br&gt;
  &lt;em&gt;This is italic text&lt;/em&gt;&lt;br&gt;
  &lt;mark&gt;This is highlighted text&lt;/mark&gt;&lt;br&gt;
          &lt;small&gt;This is small text&lt;/small&gt;
&lt;/p&gt;</code>
      </div>
      
      <div class="alert alert-info mt-4">
        <strong>✅ Progress Checkpoint:</strong> Your page should now have three main parts in order: hero section, interests cards, and biography. Later, the navbar "About" link can point to this section using <code>href="#about"</code>.
      </div>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Change the card background color by adding <code>bg-light</code> or <code>bg-primary</code> to the <code>card</code> div</li>
        <li>Try changing <code>col-md-8</code> to <code>col-md-10</code> to make the biography wider</li>
        <li>Add a profile image inside your card using <code>&lt;img src="..." class="img-fluid rounded mb-3"&gt;</code></li>
        <li>Use <code>&lt;strong&gt;</code> or <code>&lt;em&gt;</code> inside one paragraph to emphasize an important detail</li>
      </ul>
      
      <div class="alert alert-success mt-3">
        <strong>📖 What's Next:</strong> In the next lesson, you'll add a navbar at the top of your page so visitors can move around your site.
      </div>
    `
  },
  navbar: {
    title: 'Navbar with Bootstrap',
    content: `
      <h2>Adding Navigation to Your Page</h2>
      <p>Your page already has a hero section, interests cards, and a biography section. In this lesson, you'll add a navigation bar at the very top so visitors can move around your site more easily.</p>

      <h3>What a Navbar Does</h3>
      <p>A navbar is a navigation bar. It usually sits at the top of the page and contains your site name plus links to important sections.</p>

      <h3>Basic Navbar Structure</h3>
      <div class="code-block">
        <code>&lt;nav class="navbar"&gt;
  &lt;a class="navbar-brand" href="#"&gt;My Site&lt;/a&gt;
  &lt;a class="nav-link" href="#about"&gt;About&lt;/a&gt;
&lt;/nav&gt;</code>
      </div>

      <h2>🎯 Add to Your Website: Navbar</h2>
      <div class="alert alert-warning">
        <strong>⚠️ Important Placement:</strong> The navbar should go at the very top of your <code>&lt;body&gt;</code>, before your hero section and everything else on the page.
      </div>
      <p><strong>Starting point:</strong> Your page already has several sections in the body, but no navigation yet.</p>
      <p><strong>What to do:</strong> Add this navbar code at the very beginning of your <code>&lt;body&gt;</code> tag:</p>
      <div class="code-block">
        <code>&lt;!-- Bootstrap navbar: dark theme, expands on large screens --&gt;
&lt;nav class="navbar navbar-expand-lg navbar-dark bg-dark"&gt;
  &lt;div class="container"&gt;
    &lt;a class="navbar-brand" href="#"&gt;
      &lt;strong&gt;YOUR NAME&lt;/strong&gt;
    &lt;/a&gt;
    &lt;button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"&gt;
      &lt;span class="navbar-toggler-icon"&gt;&lt;/span&gt;
    &lt;/button&gt;
    &lt;div class="collapse navbar-collapse" id="navbarNav"&gt;
      &lt;ul class="navbar-nav ms-auto"&gt;
        &lt;li class="nav-item"&gt;
          &lt;a class="nav-link active" href="#"&gt;Home&lt;/a&gt;
        &lt;/li&gt;
        &lt;li class="nav-item"&gt;
          &lt;a class="nav-link" href="#about"&gt;About&lt;/a&gt;
        &lt;/li&gt;
        &lt;li class="nav-item"&gt;
          &lt;a class="nav-link" href="#movies"&gt;Movies&lt;/a&gt;
        &lt;/li&gt;
        &lt;li class="nav-item"&gt;
          &lt;a class="nav-link" href="#music"&gt;Music&lt;/a&gt;
        &lt;/li&gt;
      &lt;/ul&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/nav&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Change "YOUR NAME" to your actual name. Keep the links as they are for now.</p>
      <p><strong>Why:</strong> The navbar gives visitors a clear starting point and helps them move around your page. <code>navbar-expand-lg</code> makes it collapse on smaller screens, and <code>ms-auto</code> pushes the links to the right.</p>
      <p><strong>Note:</strong> The "About" link already points to the biography section you built in the previous lesson. The "Movies" and "Music" links will start working once you add those sections later.</p>

      <h3>📚 Understanding Navbar Structure</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>navbar:</strong> Main container for the navigation bar</li>
        <li><strong>navbar-expand-lg:</strong> Shows the full menu on large screens and collapses it on smaller ones</li>
        <li><strong>navbar-brand:</strong> Your site name or logo area</li>
        <li><strong>navbar-toggler:</strong> The mobile menu button</li>
        <li><strong>collapse navbar-collapse:</strong> The part of the navbar that opens and closes on smaller screens</li>
        <li><strong>nav-link:</strong> A clickable navigation link</li>
        <li><strong>ms-auto:</strong> Pushes the links to the right side of the navbar</li>
      </ul>

      <div class="common-mistakes">
        <h4>⚠️ Common Mistakes to Avoid</h4>
        <ul>
          <li><strong>Navbar in the wrong place:</strong> Put it at the top of <code>&lt;body&gt;</code>, before the hero section</li>
          <li><strong>Navbar not collapsing on mobile:</strong> Check that the Bootstrap JS link from the Introduction lesson is still in your page</li>
          <li><strong>Toggle button not working:</strong> Make sure <code>data-bs-target="#navbarNav"</code> matches <code>id="navbarNav"</code></li>
          <li><strong>About link not working:</strong> Make sure your biography section still has <code>id="about"</code></li>
        </ul>
      </div>

      <div class="alert alert-info mt-4">
        <strong>✅ Progress Checkpoint:</strong> Your page should now start with a navbar, followed by the hero section, interests cards, and biography. The "About" link should jump to your biography section.
      </div>

      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Change the navbar color from <code>bg-dark</code> to <code>bg-primary</code> or <code>bg-success</code></li>
        <li>Add one more navigation link, like <code>Contact</code> or <code>Portfolio</code></li>
        <li>Remove <code>ms-auto</code> and see how the link alignment changes</li>
      </ul>

      <div class="alert alert-success mt-3">
        <strong>📖 What's Next:</strong> In the next lesson, you'll learn how to use real images in your page and add one to the content you've already built.
      </div>
    `
  },
  layoutMusic: {
    title: 'Advanced Layout: Music Section',
    content: `
      <h2>Interactive Components: Accordions</h2>
      <p>Accordions are collapsible panels that let you organize lots of information in a compact space. They're perfect for lists, FAQs, or detailed content.</p>
      
      <h3>How Accordions Work</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Click a header to expand/collapse content</li>
        <li>Multiple items can be open at once (or only one, depending on setup)</li>
        <li>Uses Bootstrap's JavaScript for smooth animations</li>
        <li>Great for organizing related information</li>
      </ul>
      
      <h2>🎯 Add to Your Website: Music/Podcast Section</h2>
      <p><strong>Starting point:</strong> Your page already has a navbar, hero section, interests cards, biography, image, footer, and a Movies section.</p>
      <p><strong>📍 Placement:</strong> Add this section after the Movies section, but before your footer so it becomes part of the main page content. <strong>Customize it with your favorite music or podcast.</strong></p>
      <div class="code-block">
        <code>&lt;!-- Music section: light background, 2-column layout --&gt;
&lt;div class="container bg-light py-5 my-5" id="music"&gt;
  &lt;div class="row"&gt;
    &lt;!-- Left column: 4/12 width (33%) with centered image --&gt;
    &lt;div class="col-lg-4 text-center mb-4"&gt;
      &lt;img src="assets/cat-example-main.jpg" class="img-fluid rounded-circle mb-3" alt="Album art or podcast cover"&gt;
      &lt;h3&gt;Artist/Podcast Name&lt;/h3&gt;
      &lt;p class="text-muted"&gt;Genre or Category&lt;/p&gt;
    &lt;/div&gt;
    &lt;!-- Right column: 8/12 width (67%) with accordion --&gt;
    &lt;div class="col-lg-8"&gt;
      &lt;h2&gt;My Favorite Music/Podcast&lt;/h2&gt;
      &lt;p class="lead"&gt;
        Write about your favorite artist, band, or podcast here. 
        What makes them special? When did you discover them?
      &lt;/p&gt;
      &lt;!-- Bootstrap accordion component --&gt;
      &lt;div class="accordion" id="musicAccordion"&gt;
        &lt;div class="accordion-item"&gt;
          &lt;h2 class="accordion-header"&gt;
            &lt;button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne"&gt;
              Favorite Songs/Episodes
            &lt;/button&gt;
          &lt;/h2&gt;
          &lt;div id="collapseOne" class="accordion-collapse collapse show"&gt;
            &lt;div class="accordion-body"&gt;
              &lt;ul class="list-group"&gt;
                &lt;li class="list-group-item"&gt;Song/Episode 1 - Why you like it&lt;/li&gt;
                &lt;li class="list-group-item"&gt;Song/Episode 2 - Why you like it&lt;/li&gt;
                &lt;li class="list-group-item"&gt;Song/Episode 3 - Why you like it&lt;/li&gt;
              &lt;/ul&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
        &lt;div class="accordion-item"&gt;
          &lt;h2 class="accordion-header"&gt;
            &lt;button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo"&gt;
              What I Love About It
            &lt;/button&gt;
          &lt;/h2&gt;
          &lt;div id="collapseTwo" class="accordion-collapse collapse"&gt;
            &lt;div class="accordion-body"&gt;
              Write more details about what draws you to this music or podcast. 
              The lyrics? The production? The hosts? The topics?
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Replace the sample text with your favorite artist, band, or podcast. You can keep the sample image for now or replace it with your own file later, and update the list with real songs or episodes.</p>
      <p><strong>Why:</strong> This section introduces a new interactive Bootstrap component while still building your same page. <code>bg-light</code> helps it stand out from the sections around it, <code>rounded-circle</code> makes the image circular, and <code>id="music"</code> lets the navbar "Music" link jump here.</p>
      
      <h3>📚 New Component: Accordion</h3>
      <p>Accordions are collapsible content panels. They use Bootstrap's JavaScript to expand/collapse. Key parts:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>accordion:</strong> Container for all accordion items</li>
        <li><strong>accordion-item:</strong> Each collapsible section</li>
        <li><strong>accordion-button:</strong> The clickable header</li>
        <li><strong>data-bs-toggle="collapse":</strong> Bootstrap JavaScript attribute</li>
        <li><strong>collapse show:</strong> Makes first item expanded by default</li>
      </ul>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Add a third accordion item by copying an <code>accordion-item</code> block</li>
        <li>Change the background from <code>bg-light</code> to <code>bg-primary text-white</code> for a different look</li>
        <li>Try changing <code>col-lg-4</code> and <code>col-lg-8</code> to <code>col-md-6</code> for equal columns</li>
      </ul>

      <div class="alert alert-info mt-4">
        <strong>✅ Progress Checkpoint:</strong> Your page should now include a Music section before the footer, and the "Music" link in the navbar should jump to it.
      </div>
      
      <div class="alert alert-success mt-4">
        <strong>📖 What's Next:</strong> In the final lesson, you'll add a quick facts section to showcase more about yourself!
      </div>
    `
  },
  images: {
    title: 'Images with Bootstrap',
    content: `
      <h2>Adding Images</h2>
      <p>Your page already has a navbar, hero section, interests cards, and a biography section. In this lesson, you'll learn how images work in HTML and then add one to the page content you already built.</p>
      <p>The <code>&lt;img&gt;</code> tag embeds images. Bootstrap provides classes for responsive images and styling.</p>
      
      <h3>Basic Image</h3>
      <div class="code-block">
        <code>&lt;img src="image.jpg" alt="Description" class="img-fluid"&gt;</code>
      </div>
      
      <h3>Bootstrap Image Classes</h3>
      <div class="code-block">
        <code>&lt;!-- Responsive image (scales with container) --&gt;
&lt;img src="image.jpg" alt="..." class="img-fluid"&gt;

&lt;!-- Rounded corners --&gt;
&lt;img src="image.jpg" alt="..." class="img-fluid rounded"&gt;

&lt;!-- Circular image --&gt;
&lt;img src="image.jpg" alt="..." class="img-fluid rounded-circle"&gt;

&lt;!-- Thumbnail --&gt;
&lt;img src="image.jpg" alt="..." class="img-thumbnail"&gt;</code>
      </div>
      
      <h3>Example</h3>
      <div class="example-preview">
        <img src="assets/cat-example-main.jpg" alt="Orange cat lounging on a blanket" class="img-fluid rounded mb-3">
        <img src="assets/cat-example-main.jpg" alt="Circular crop of an orange cat" class="img-fluid rounded-circle" style="width: 150px; height: 150px; object-fit: cover;">
      </div>
      
      <h2>🎯 Add to Your Website: Images for the Biography and Navbar</h2>
      <p><strong>Starting point:</strong> Your page already has a biography section with text inside a card.</p>
      <p><strong>What to do:</strong> Add an image near the top of your biography card, before the <code>About Me</code> heading:</p>
      <div class="code-block">
        <code>&lt;div class="card"&gt;
  &lt;div class="card-body"&gt;
    &lt;img src="assets/cat-example-main.jpg" alt="A profile photo or image that represents me" class="img-fluid rounded mb-3"&gt;
    &lt;h2 class="card-title"&gt;About Me&lt;/h2&gt;
    &lt;p class="card-text"&gt;Write your biography here...&lt;/p&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Replace the sample image path with your own image if you want, or use the live avatar builder below to create a character-style profile image. Update the <code>alt</code> text so it describes the image clearly.</p>
      <p><strong>Why:</strong> Images make your page feel more personal. <code>img-fluid</code> keeps the image responsive, <code>rounded</code> softens the corners, and <code>mb-3</code> adds spacing below the image.</p>

      <h3>Required: Add an Image in the Navbar Brand Area</h3>
      <p>Your navbar brand area should also use an image. Replace the text inside <code>navbar-brand</code> with an image like this:</p>
      <div class="code-block">
        <code>&lt;a class="navbar-brand" href="#"&gt;
  &lt;img src="assets/cat-example-main.jpg" alt="My site logo" height="40" class="rounded-circle"&gt;
&lt;/a&gt;</code>
      </div>
      <p>This connects the image lesson to the navbar you built earlier and gives the site a clear visual brand.</p>

      <h3>Live Avatar Builder</h3>
      <p>Use this live builder to create a simple character image you can use for both the biography section and the navbar brand area.</p>
      <div id="avatarBuilderMount"></div>
      
      <h3>Image Attributes</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>src:</strong> The path to the image file (required)</li>
        <li><strong>alt:</strong> Alternative text for accessibility (required)</li>
        <li><strong>class="img-fluid":</strong> Makes image responsive</li>
        <li><strong>class="rounded":</strong> Adds rounded corners</li>
        <li><strong>class="rounded-circle":</strong> Makes the image circular</li>
      </ul>
      
      <h3>Best Practices</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Always use <code>img-fluid</code> for responsive images</li>
        <li>Always include the <code>alt</code> attribute</li>
        <li>Use images that match the mood and purpose of your page</li>
      </ul>
      
      <div class="common-mistakes">
        <h4>⚠️ Common Mistakes to Avoid</h4>
        <ul>
          <li><strong>Image not displaying:</strong> Make sure the file path in <code>src</code> is correct and always include an <code>alt</code> description</li>
          <li><strong>Image too large:</strong> Use <code>img-fluid</code> so the image scales to fit its container</li>
          <li><strong>No spacing around the image:</strong> Add a class like <code>mb-3</code> so the text does not touch the image</li>
        </ul>
      </div>
      
      <div class="alert alert-info mt-4">
        <strong>✅ Progress Checkpoint:</strong> Your page should now have a visible image inside the biography card and an image in the navbar brand area. Both images should display correctly and resize cleanly.
      </div>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Try <code>rounded-circle</code> instead of <code>rounded</code> to see how the biography image changes</li>
        <li>Add another image somewhere else on the page, like inside one of the interests cards</li>
        <li>Swap the biography image for one of your own and update the <code>alt</code> text</li>
      </ul>
      
      <div class="alert alert-success mt-3">
        <strong>📖 What's Next:</strong> In the next lesson, you'll learn about links and buttons, and add a footer with social media links to complete your page structure!
      </div>
    `
  },
  links: {
    title: 'Links & Buttons with Bootstrap',
    content: `
      <h2>Creating Links</h2>
      <p>Your page already has a navbar, hero section, interests cards, biography, a biography image, and a navbar brand image. In this lesson, you'll use links and button-styled links to finish the main page structure with a footer.</p>
      <p>The <code>&lt;a&gt;</code> (anchor) tag creates hyperlinks. Bootstrap provides button classes that work with links.</p>
      
      <h3>Basic Link</h3>
      <div class="code-block">
        <code>&lt;a href="https://example.com"&gt;Click here&lt;/a&gt;</code>
      </div>
      
      <h3>Bootstrap Buttons (using links)</h3>
      <div class="code-block">
        <code>&lt;!-- Button styles --&gt;
&lt;a href="#" class="btn btn-primary"&gt;Primary Button&lt;/a&gt;
&lt;a href="#" class="btn btn-secondary"&gt;Secondary Button&lt;/a&gt;
&lt;a href="#" class="btn btn-success"&gt;Success Button&lt;/a&gt;
&lt;a href="#" class="btn btn-danger"&gt;Danger Button&lt;/a&gt;
&lt;a href="#" class="btn btn-outline-primary"&gt;Outline Button&lt;/a&gt;
&lt;a href="#" class="btn btn-lg"&gt;Large Button&lt;/a&gt;
&lt;a href="#" class="btn btn-sm"&gt;Small Button&lt;/a&gt;</code>
      </div>
      
      <h3>Example</h3>
      <div class="example-preview">
        <a href="#" class="btn btn-primary me-2">Primary</a>
        <a href="#" class="btn btn-secondary me-2">Secondary</a>
        <a href="#" class="btn btn-success me-2">Success</a>
        <a href="#" class="btn btn-danger me-2">Danger</a>
        <a href="#" class="btn btn-outline-primary me-2">Outline</a>
        <a href="#" class="btn btn-lg btn-primary me-2">Large</a>
        <a href="#" class="btn btn-sm btn-secondary">Small</a>
      </div>
      
      <h2>🎯 Add to Your Website: Footer with Social Links</h2>
      <p><strong>Starting point:</strong> Your page already has the main content sections. Now you are adding the final structural piece at the bottom.</p>
      <p><strong>📍 Placement:</strong> Add this footer at the very end of your page, before the closing <code>&lt;/body&gt;</code> tag:</p>
      <div class="code-block">
        <code>&lt;footer class="bg-dark text-white py-4 mt-5"&gt;
  &lt;div class="container"&gt;
    &lt;div class="row"&gt;
      &lt;div class="col-md-6"&gt;
        &lt;h5&gt;Your Name&lt;/h5&gt;
        &lt;p class="text-muted"&gt;Personal Website Project&lt;/p&gt;
      &lt;/div&gt;
      &lt;div class="col-md-6 text-md-end"&gt;
        &lt;h5&gt;Connect With Me&lt;/h5&gt;
        &lt;a href="mailto:your.email@example.com" class="btn btn-outline-light btn-sm me-2"&gt;Email&lt;/a&gt;
        &lt;a href="https://linkedin.com" class="btn btn-outline-light btn-sm me-2" target="_blank"&gt;LinkedIn&lt;/a&gt;
        &lt;a href="https://github.com" class="btn btn-outline-light btn-sm" target="_blank"&gt;GitHub&lt;/a&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;hr class="my-3"&gt;
    &lt;p class="text-center text-muted mb-0"&gt;&copy; 2024 Your Name. All rights reserved.&lt;/p&gt;
  &lt;/div&gt;
&lt;/footer&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Add your name, update the email and social media links, and change the copyright year.</p>
      <p><strong>Why:</strong> The footer provides contact info and gives your site a professional finish. <code>text-md-end</code> aligns content right on larger screens. <code>target="_blank"</code> opens links in new tabs.</p>
      
      <h3>Link Attributes</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>href:</strong> The URL or path (required)</li>
        <li><strong>class="btn":</strong> Makes link look like a button</li>
        <li><strong>class="btn-primary":</strong> Primary button style</li>
        <li><strong>target="_blank":</strong> Opens in new tab (use for external links)</li>
        <li><strong>mailto:</strong> Special link type that opens email client (e.g., <code>href="mailto:email@example.com"</code>)</li>
      </ul>
      
      <h3>📚 Understanding Email Links (mailto:)</h3>
      <p>Email links use the <code>mailto:</code> protocol to open the user's default email client:</p>
      <div class="code-block">
        <code>&lt;!-- Basic email link --&gt;
&lt;a href="mailto:your.email@example.com"&gt;Send Email&lt;/a&gt;

&lt;!-- Email link with subject --&gt;
&lt;a href="mailto:your.email@example.com?subject=Hello"&gt;Email with Subject&lt;/a&gt;

&lt;!-- Email link with subject and body --&gt;
&lt;a href="mailto:your.email@example.com?subject=Hello&body=Hi there!"&gt;Email with Subject and Body&lt;/a&gt;</code>
      </div>
      <p><strong>How it works:</strong> When clicked, <code>mailto:</code> links open the user's default email application (Gmail, Outlook, Mail, etc.) with a new message addressed to the specified email.</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>Basic:</strong> <code>mailto:email@example.com</code> - Opens email with recipient filled in</li>
        <li><strong>With subject:</strong> <code>mailto:email@example.com?subject=Your Subject</code> - Adds subject line</li>
        <li><strong>With body:</strong> <code>mailto:email@example.com?subject=Subject&body=Message</code> - Adds subject and message body</li>
        <li><strong>Multiple recipients:</strong> <code>mailto:email1@example.com,email2@example.com</code> - Separate with commas</li>
      </ul>
      <p><strong>Note:</strong> Spaces in subject/body should be replaced with <code>%20</code> or use <code>encodeURIComponent()</code> in JavaScript. For simple cases, you can just use spaces and the browser will handle it.</p>
      
      <h3>📚 Understanding Footer Structure</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>bg-dark:</strong> Dark background color</li>
        <li><strong>text-white:</strong> White text (for contrast)</li>
        <li><strong>py-4:</strong> Padding top and bottom</li>
        <li><strong>text-md-end:</strong> Right-align text on medium+ screens</li>
        <li><strong>target="_blank":</strong> Opens external links in a new tab (keeps users on your site)</li>
        <li><strong>mailto:</strong> Email link protocol - opens user's email client</li>
        <li><strong>btn-outline-light:</strong> Button with light border, transparent background</li>
      </ul>
      
      <div class="common-mistakes">
        <h4>⚠️ Common Mistakes to Avoid</h4>
        <ul>
          <li><strong>Forgetting target="_blank":</strong> External links should open in new tabs to keep users on your site</li>
          <li><strong>Wrong mailto format:</strong> Use <code>mailto:email@example.com</code> not <code>mailto://email@example.com</code></li>
          <li><strong>Missing href:</strong> Links without <code>href</code> won't work - use <code>href="#"</code> for placeholders</li>
          <li><strong>Button without link:</strong> If using <code>class="btn"</code> on a link, make sure it has an <code>href</code> attribute</li>
          <li><strong>Broken email links:</strong> Make sure there are no spaces in email addresses in <code>mailto:</code> links</li>
        </ul>
      </div>
      
      <div class="alert alert-info mt-4">
        <strong>✅ Progress Checkpoint:</strong> Your page should now include the full main structure: navbar, hero, interests cards, biography, image, and footer. Test the footer links and make sure your contact details are correct.
      </div>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Change button styles: try <code>btn-primary</code> instead of <code>btn-outline-light</code></li>
        <li>Add more social links (Twitter, Instagram, etc.) by copying a button and changing the URL</li>
        <li>Experiment with footer layout: try <code>text-center</code> on both columns for centered content</li>
      </ul>
      
      <div class="alert alert-success mt-3">
        <strong>📖 What's Next:</strong> In the next lessons, you'll add exciting content sections: movies, music, and quick facts. This will make your website complete!
      </div>
    `
  },
  layoutMovies: {
    title: 'Advanced Layout: Movies Section',
    content: `
      <h2>Building Complex Layouts</h2>
      <p>Your page already has the main site structure in place. In this lesson, you'll add a new content section that uses cards, images, list groups, and quotes together.</p>
      <p>Now that you understand grids and cards, let's build a more complex section combining multiple components.</p>
      
      <h3>What You'll Learn</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Using cards with images (<code>card-img-top</code>)</li>
        <li>Creating 2-column layouts with equal-height cards (<code>h-100</code>)</li>
        <li>Using list groups inside cards (<code>list-group-flush</code>)</li>
        <li>Styling quotes with blockquotes</li>
      </ul>
      
      <h2>🎯 Add to Your Website: Movies Section</h2>
      <p><strong>Starting point:</strong> Your page already has a navbar, hero section, interests cards, biography, image, and footer.</p>
      <p><strong>📍 Placement:</strong> Add this movies section after your biography section and before the footer. <strong>Replace it with your favorite movie series.</strong></p>
      <div class="code-block">
        <code>&lt;div class="container my-5" id="movies"&gt;
  &lt;h2 class="text-center mb-4"&gt;My Favorite Movie Series&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-6 mb-4"&gt;
      &lt;div class="card h-100"&gt;
        &lt;img src="assets/cat-example-main.jpg" class="card-img-top" alt="Movie poster or image related to the movie series"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;Movie Series Name&lt;/h5&gt;
          &lt;p class="card-text"&gt;
            Write why you love this movie series. What makes it special? 
            Which is your favorite film in the series?
          &lt;/p&gt;
          &lt;ul class="list-group list-group-flush"&gt;
            &lt;li class="list-group-item"&gt;&lt;strong&gt;Genre:&lt;/strong&gt; Action, Adventure&lt;/li&gt;
            &lt;li class="list-group-item"&gt;&lt;strong&gt;My Rating:&lt;/strong&gt; ⭐⭐⭐⭐⭐&lt;/li&gt;
          &lt;/ul&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-6 mb-4"&gt;
      &lt;div class="card h-100"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;Why I Love It&lt;/h5&gt;
          &lt;p class="card-text"&gt;
            Add more details about what draws you to this series. 
            Favorite characters? Memorable scenes? 
            What themes resonate with you?
          &lt;/p&gt;
          &lt;blockquote class="blockquote"&gt;
            &lt;p class="mb-0"&gt;"Add a favorite quote from the movie here!"&lt;/p&gt;
            &lt;footer class="blockquote-footer"&gt;Character Name&lt;/footer&gt;
          &lt;/blockquote&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Change the movie name, replace the sample image if you want, write your own thoughts, and add a real quote.</p>
      <p><strong>Why:</strong> Using <code>col-md-6</code> creates two equal columns (50% each). <code>h-100</code> makes cards the same height. <code>list-group</code> creates clean lists. <code>id="movies"</code> lets the navbar "Movies" link jump to this section.</p>
      
      <h3>📚 New Components Used</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>list-group:</strong> Creates styled lists. <code>list-group-flush</code> removes borders.</li>
        <li><strong>blockquote:</strong> Styles quoted text. <code>blockquote-footer</code> adds attribution.</li>
        <li><strong>card-img-top:</strong> Places image at top of card.</li>
      </ul>
      
      <div class="alert alert-info mt-4">
        <strong>✅ Progress Checkpoint:</strong> Your page should now have a Movies section before the footer, and the "Movies" link in the navbar should jump to it.
      </div>

      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Add a third card by changing <code>col-md-6</code> to <code>col-md-4</code> (creates 3 equal columns)</li>
        <li>Try different card styles: add <code>border-primary</code> or <code>bg-light</code> to cards</li>
        <li>Add more list items to the <code>list-group</code> (e.g., "Release Year", "Director")</li>
      </ul>
      
      <div class="alert alert-success mt-4">
        <strong>📖 What's Next:</strong> In the next lesson, you'll build a music or podcast section with interactive accordions.
      </div>
    `
  },
  layoutQuickFacts: {
    title: 'Advanced Layout: Quick Facts',
    content: `
      <h2>Multi-Column Card Layouts</h2>
      <p>By this point, your page already has several sections and a footer. This final lesson adds one more compact section of personal details before the footer.</p>
      <p>Sometimes you want to display multiple items in a row. Using <code>col-md-3</code> creates 4 equal columns (3+3+3+3=12).</p>
      
      <h3>Key Concepts</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>col-md-3:</strong> 4 equal columns (25% each on medium+ screens)</li>
        <li><strong>border-*:</strong> Colored borders for visual distinction</li>
        <li><strong>h-100:</strong> Makes all cards equal height in a row</li>
        <li><strong>text-center:</strong> Centers content within cards</li>
      </ul>
      
      <h2>🎯 Add to Your Website: Quick Facts Section</h2>
      <p><strong>Starting point:</strong> Your page already has the Movies and Music sections, plus a footer at the bottom.</p>
      <p><strong>📍 Placement:</strong> Add this section before your footer (before the <code>&lt;footer&gt;</code> tag) to showcase more about yourself.</p>
      <div class="code-block">
        <code>&lt;!-- Quick facts: 4-column grid layout --&gt;
&lt;div class="container my-5"&gt;
  &lt;h2 class="text-center mb-4"&gt;Quick Facts About Me&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;!-- Each column is 3/12 width (25%) = 4 columns total --&gt;
    &lt;div class="col-md-3 text-center mb-3"&gt;
      &lt;div class="card border-primary h-100"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="text-primary"&gt;🎓&lt;/h3&gt;
          &lt;h5&gt;Education&lt;/h5&gt;
          &lt;p class="text-muted"&gt;Your school/major&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-3 text-center mb-3"&gt;
      &lt;div class="card border-success h-100"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="text-success"&gt;🎯&lt;/h3&gt;
          &lt;h5&gt;Goals&lt;/h5&gt;
          &lt;p class="text-muted"&gt;Your aspirations&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-3 text-center mb-3"&gt;
      &lt;div class="card border-warning h-100"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="text-warning"&gt;💻&lt;/h3&gt;
          &lt;h5&gt;Skills&lt;/h5&gt;
          &lt;p class="text-muted"&gt;Your talents&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-3 text-center mb-3"&gt;
      &lt;div class="card border-info h-100"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="text-info"&gt;🌟&lt;/h3&gt;
          &lt;h5&gt;Fun Fact&lt;/h5&gt;
          &lt;p class="text-muted"&gt;Something interesting!&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Fill in your education, goals, skills, and a fun fact about yourself!</p>
      <p><strong>Why:</strong> This creates visual interest with colored borders. <code>col-md-3</code> makes 4 equal columns on medium+ screens (3+3+3+3=12). <code>h-100</code> makes all cards the same height. <code>border-primary</code>, <code>border-success</code>, etc. add colored borders.</p>
      
      <h3>📚 Understanding Border Colors</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>border-primary:</strong> Blue border (Bootstrap's primary color)</li>
        <li><strong>border-success:</strong> Green border</li>
        <li><strong>border-warning:</strong> Yellow/orange border</li>
        <li><strong>border-info:</strong> Light blue border</li>
      </ul>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Change to 3 columns by using <code>col-md-4</code> instead of <code>col-md-3</code></li>
        <li>Add a 5th card by creating another <code>col-md-3</code> div (they'll wrap to a new row)</li>
        <li>Try different emojis or icons for each card</li>
        <li>Experiment with card backgrounds: add <code>bg-light</code> or <code>bg-primary text-white</code></li>
      </ul>
      
      <div class="alert alert-info mt-4">
        <strong>✅ Progress Checkpoint:</strong> You have now added all major sections. Test your navbar links so "About," "Movies," and "Music" jump to the right places, and make sure your footer still appears last.
      </div>
      
      <h2>✅ Final Checklist</h2>
      <p>Before you export, make sure you've:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>✅ Set up basic HTML structure (Introduction lesson)</li>
        <li>✅ Added hero section with headings (Headings lesson)</li>
        <li>✅ Learned grid basics (Layout Basics lesson)</li>
        <li>✅ Learned cards and components (Cards lesson)</li>
        <li>✅ Added biography section with <code>id="about"</code> (Paragraphs lesson)</li>
        <li>✅ Added navbar at the top with working links (Navbar lesson)</li>
        <li>✅ Added images to the biography section and navbar brand area (Images lesson)</li>
        <li>✅ Added footer with social links (Links lesson)</li>
        <li>✅ Added movies section with <code>id="movies"</code> (Movies lesson)</li>
        <li>✅ Added music/podcast section with <code>id="music"</code> (Music lesson)</li>
        <li>✅ Added quick facts section (Quick Facts lesson)</li>
        <li>✅ Replaced all placeholder text with your own content!</li>
        <li>✅ Tested all navbar links (they should jump to sections)</li>
        <li>✅ Checked that everything looks good in the preview!</li>
        <li>✅ Updated social media links in footer (or removed unused ones)</li>
      </ul>
      
      <h3>🔧 Troubleshooting Tips</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>Navbar links not working:</strong> Make sure each section has the correct <code>id</code> attribute (about, movies, music)</li>
        <li><strong>Cards not aligned:</strong> Check that you're using <code>row</code> to wrap columns</li>
        <li><strong>Images not showing:</strong> Make sure image URLs are correct, or use placeholder images</li>
        <li><strong>Accordion not expanding:</strong> Bootstrap JS should be auto-loaded, but check browser console for errors</li>
        <li><strong>Layout looks broken on mobile:</strong> This is normal - Bootstrap's grid is responsive and will stack on small screens</li>
      </ul>
      
      <div class="alert alert-success mt-4">
        <strong>🎉 Congratulations!</strong> You've built a complete, professional-looking website! Use the <strong>Export HTML</strong> button in the Simulator to download your file. You can open it in any browser or host it online!
      </div>
      
      <h3>Bootstrap Components You Used</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>✅ Navbar (responsive navigation)</li>
        <li>✅ Cards (multiple styles)</li>
        <li>✅ Grid system (rows and columns)</li>
        <li>✅ Buttons (outline styles)</li>
        <li>✅ Lists (list-group)</li>
        <li>✅ Accordions (collapsible content)</li>
        <li>✅ Blockquotes</li>
        <li>✅ Images (rounded, circular, responsive)</li>
        <li>✅ Text utilities (colors, alignment)</li>
        <li>✅ Background utilities</li>
        <li>✅ Spacing utilities</li>
      </ul>
    `
  },
  project: {
    title: 'Guided Project: Build Your Personal Website',
    content: `
      <h2>🎯 Project Overview</h2>
      <p>In this guided project, you'll put all of the lessons together into one polished personal website. This walkthrough follows the same order as the course, so each step builds on the last one.</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>✅ A homepage with a hero section and biography</li>
        <li>✅ An interests section using the Bootstrap grid and cards</li>
        <li>✅ A navbar with working page links</li>
        <li>✅ A profile image, movies section, music section, and quick facts</li>
        <li>✅ A footer with contact links</li>
      </ul>
      
      <h2>📋 Step 1: Set Up the Basic Structure</h2>
      <p><strong>What to do:</strong> Start with the plain HTML structure from the Introduction lesson. This gives you a clean homepage file before Bootstrap is added.</p>
      <div class="code-block">
        <code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  &lt;title&gt;My Personal Website&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Welcome to My Website&lt;/h1&gt;
  &lt;p&gt;This is where your content will go!&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</code>
      </div>
      <p><strong>Why:</strong> Every HTML page needs this structure. At this stage, you are only making sure the page is valid HTML.</p>

      <h2>📋 Step 2: Add the Bootstrap CDN Links</h2>
      <p><strong>What to do:</strong> Keep the HTML from Step 1 and add these two Bootstrap CDN lines in the correct places.</p>
      <div class="code-block">
        <code>&lt;!-- Put this inside &lt;head&gt;, before &lt;/head&gt; --&gt;
&lt;link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"&gt;

&lt;!-- Put this right before &lt;/body&gt; --&gt;
&lt;script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"&gt;&lt;/script&gt;</code>
      </div>
      <p><strong>Why:</strong> Bootstrap classes only work after Bootstrap is loaded. The CSS link goes in <code>&lt;head&gt;</code>, and the JavaScript bundle goes before <code>&lt;/body&gt;</code>.</p>

      <h2>📋 Step 3: Add Your First Container</h2>
      <p><strong>What to do:</strong> Now that Bootstrap is loaded, wrap your starter content in a <code>container</code>.</p>
      <div class="code-block">
        <code>&lt;body&gt;
  &lt;div class="container"&gt;
    &lt;h1&gt;Welcome to My Website&lt;/h1&gt;
    &lt;p&gt;This is where your content will go!&lt;/p&gt;
  &lt;/div&gt;
&lt;/body&gt;</code>
      </div>
      <p><strong>Why:</strong> <code>container</code> is one of the most common Bootstrap classes. It centers your content and adds spacing on the left and right.</p>

      <h2>📋 Step 4: Create the Hero Section</h2>
      <p><strong>What to do:</strong> Replace the simple heading and paragraph inside your container with a hero section that introduces your website.</p>
      <div class="code-block">
        <code>&lt;div class="bg-primary text-white text-center py-5 mb-5"&gt;
  &lt;div class="container"&gt;
    &lt;h1 class="display-3"&gt;Welcome to My Website&lt;/h1&gt;
    &lt;p class="lead"&gt;Learn about me, my interests, and what I love!&lt;/p&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Change the heading and supporting text so it sounds like your own site.</p>
      <p><strong>Why:</strong> This combines headings and Bootstrap text classes to create a strong first section.</p>

      <h2>📋 Step 5: Add an Interests Grid</h2>
      <p><strong>What to do:</strong> Add a three-column section under the hero to practice the Bootstrap grid.</p>
      <div class="code-block">
        <code>&lt;div class="container"&gt;
  &lt;h2 class="text-center mb-4"&gt;A Few Things About Me&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;h3&gt;Hobby 1&lt;/h3&gt;
      &lt;p&gt;A short description of something you enjoy.&lt;/p&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;h3&gt;Hobby 2&lt;/h3&gt;
      &lt;p&gt;Another short description about your interests.&lt;/p&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;h3&gt;Hobby 3&lt;/h3&gt;
      &lt;p&gt;A third topic that helps people get to know you.&lt;/p&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>Why:</strong> The grid helps you place content side by side on larger screens while still stacking on smaller screens.</p>

      <h2>📋 Step 6: Turn the Grid into Cards</h2>
      <p><strong>What to do:</strong> Upgrade each interests column into a Bootstrap card so the section looks more polished.</p>
      <div class="code-block">
        <code>&lt;div class="container"&gt;
  &lt;h2 class="text-center mb-4"&gt;A Few Things About Me&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;div class="card h-100"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="card-title"&gt;Hobby 1&lt;/h3&gt;
          &lt;p class="card-text"&gt;A short description of something you enjoy.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;div class="card h-100"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="card-title"&gt;Hobby 2&lt;/h3&gt;
          &lt;p class="card-text"&gt;Another short description about your interests.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;div class="card h-100"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="card-title"&gt;Hobby 3&lt;/h3&gt;
          &lt;p class="card-text"&gt;A third topic that helps people get to know you.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>Why:</strong> Cards give each column a clear visual container and make the section easier to scan.</p>
      
      <h2>📋 Step 7: Add Your Biography Section</h2>
      <p><strong>What to do:</strong> Add a centered biography card after the interests cards. Give it <code>id="about"</code> so the navbar can link to it later.</p>
      <div class="code-block">
        <code>&lt;div class="container my-5" id="about"&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-8 mx-auto"&gt;
      &lt;div class="card"&gt;
        &lt;div class="card-body"&gt;
          &lt;h2 class="card-title"&gt;About Me&lt;/h2&gt;
          &lt;p class="card-text"&gt;
            Write a short biography about yourself here. Include where you are from,
            what you study, and some of your interests.
          &lt;/p&gt;
          &lt;p class="card-text"&gt;
            Add a second paragraph with more details, goals, or anything
            else you want visitors to know.
          &lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>Why:</strong> This gives the site a personal voice and creates a target for the future About link.</p>

      <h2>📋 Step 8: Add the Navbar</h2>
      <p><strong>What to do:</strong> Add this navbar at the very top of <code>&lt;body&gt;</code>, before your hero section.</p>
      <div class="code-block">
        <code>&lt;nav class="navbar navbar-expand-lg navbar-dark bg-dark"&gt;
  &lt;div class="container"&gt;
    &lt;a class="navbar-brand" href="#"&gt;
      &lt;strong&gt;YOUR NAME&lt;/strong&gt;
    &lt;/a&gt;
    &lt;button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"&gt;
      &lt;span class="navbar-toggler-icon"&gt;&lt;/span&gt;
    &lt;/button&gt;
    &lt;div class="collapse navbar-collapse" id="navbarNav"&gt;
      &lt;ul class="navbar-nav ms-auto"&gt;
        &lt;li class="nav-item"&gt;
          &lt;a class="nav-link" href="#about"&gt;About&lt;/a&gt;
        &lt;/li&gt;
        &lt;li class="nav-item"&gt;
          &lt;a class="nav-link" href="#movies"&gt;Movies&lt;/a&gt;
        &lt;/li&gt;
        &lt;li class="nav-item"&gt;
          &lt;a class="nav-link" href="#music"&gt;Music&lt;/a&gt;
        &lt;/li&gt;
      &lt;/ul&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/nav&gt;</code>
      </div>
      <p><strong>Why:</strong> The navbar organizes the page and helps visitors jump to the most important sections.</p>
      
      <h2>📋 Step 9: Add Images to the Biography and Navbar</h2>
      <p><strong>What to do:</strong> Place an image at the top of your biography card, before the <code>About Me</code> heading, and use an image inside the navbar brand area too.</p>
      <div class="code-block">
        <code>&lt;div class="card-body"&gt;
  &lt;img src="assets/cat-example-main.jpg" alt="A profile photo or image that represents me" class="img-fluid rounded mb-3"&gt;
  &lt;h2 class="card-title"&gt;About Me&lt;/h2&gt;
  &lt;p class="card-text"&gt;Write your biography here...&lt;/p&gt;
&lt;/div&gt;

&lt;a class="navbar-brand" href="#"&gt;
  &lt;img src="assets/cat-example-main.jpg" alt="My site logo" height="40" class="rounded-circle"&gt;
&lt;/a&gt;</code>
      </div>
      <p><strong>Why:</strong> Images make the page feel more personal, and they also give the navbar a clear visual brand. <code>img-fluid</code> keeps the biography image responsive, while <code>rounded-circle</code> creates a clean logo style in the navbar.</p>
      
      <h2>📋 Step 10: Add the Footer</h2>
      <p><strong>What to do:</strong> Add this footer at the very end of the page, before the closing <code>&lt;/body&gt;</code> tag.</p>
      <div class="code-block">
        <code>&lt;footer class="bg-dark text-white py-4 mt-5"&gt;
  &lt;div class="container"&gt;
    &lt;div class="row"&gt;
      &lt;div class="col-md-6"&gt;
        &lt;h5&gt;Your Name&lt;/h5&gt;
        &lt;p class="text-muted"&gt;Personal Website Project&lt;/p&gt;
      &lt;/div&gt;
      &lt;div class="col-md-6 text-md-end"&gt;
        &lt;h5&gt;Connect With Me&lt;/h5&gt;
        &lt;a href="#" class="btn btn-outline-light btn-sm me-2"&gt;Email&lt;/a&gt;
        &lt;a href="#" class="btn btn-outline-light btn-sm me-2"&gt;LinkedIn&lt;/a&gt;
        &lt;a href="#" class="btn btn-outline-light btn-sm"&gt;GitHub&lt;/a&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;hr class="my-3"&gt;
    &lt;p class="text-center text-muted mb-0"&gt;&copy; 2024 Your Name. All rights reserved.&lt;/p&gt;
  &lt;/div&gt;
&lt;/footer&gt;</code>
      </div>
      <p><strong>Why:</strong> The footer finishes the site with contact information and should stay as the last section on the page.</p>
      
      <h2>📋 Step 11: Add the Movies Section</h2>
      <p><strong>What to do:</strong> Add this section before the footer and connect it to the navbar using <code>id="movies"</code>.</p>
      <div class="code-block">
        <code>&lt;div class="container my-5" id="movies"&gt;
  &lt;h2 class="text-center mb-4"&gt;My Favorite Movie Series&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-6 mb-4"&gt;
      &lt;div class="card h-100"&gt;
        &lt;img src="assets/cat-example-main.jpg" class="card-img-top" alt="Movie poster or cover image"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;Movie Series Name&lt;/h5&gt;
          &lt;p class="card-text"&gt;
            Write why you love this movie series. Which film is your favorite?
          &lt;/p&gt;
          &lt;ul class="list-group list-group-flush"&gt;
            &lt;li class="list-group-item"&gt;&lt;strong&gt;Genre:&lt;/strong&gt; Action, Adventure&lt;/li&gt;
            &lt;li class="list-group-item"&gt;&lt;strong&gt;My Rating:&lt;/strong&gt; 5/5&lt;/li&gt;
          &lt;/ul&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-6 mb-4"&gt;
      &lt;div class="card h-100"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;Why I Love It&lt;/h5&gt;
          &lt;p class="card-text"&gt;
            Add more details about what draws you to this series, including favorite
            characters, scenes, or themes.
          &lt;/p&gt;
          &lt;blockquote class="blockquote"&gt;
            &lt;p class="mb-0"&gt;"Add a favorite quote from the movie here!"&lt;/p&gt;
            &lt;footer class="blockquote-footer"&gt;Character Name&lt;/footer&gt;
          &lt;/blockquote&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>Why:</strong> This section uses cards, lists, and blockquotes together while giving the Movies navbar link a real destination.</p>
      
      <h2>📋 Step 12: Add the Music Section</h2>
      <p><strong>What to do:</strong> Add this section after Movies and before the footer, then connect it with <code>id="music"</code>.</p>
      <div class="code-block">
        <code>&lt;div class="container bg-light py-5 my-5" id="music"&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-lg-4 text-center mb-4"&gt;
      &lt;img src="assets/cat-example-main.jpg" class="img-fluid rounded-circle mb-3" alt="Album art or podcast cover"&gt;
      &lt;h3&gt;Artist/Podcast Name&lt;/h3&gt;
      &lt;p class="text-muted"&gt;Genre or Category&lt;/p&gt;
    &lt;/div&gt;
    &lt;div class="col-lg-8"&gt;
      &lt;h2&gt;My Favorite Music/Podcast&lt;/h2&gt;
      &lt;p class="lead"&gt;
        Write about your favorite artist, band, or podcast here.
      &lt;/p&gt;
      &lt;div class="accordion" id="musicAccordion"&gt;
        &lt;div class="accordion-item"&gt;
          &lt;h2 class="accordion-header"&gt;
            &lt;button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne"&gt;
              Favorite Songs/Episodes
            &lt;/button&gt;
          &lt;/h2&gt;
          &lt;div id="collapseOne" class="accordion-collapse collapse show"&gt;
            &lt;div class="accordion-body"&gt;
              &lt;ul class="list-group"&gt;
                &lt;li class="list-group-item"&gt;Song/Episode 1 - Why you like it&lt;/li&gt;
                &lt;li class="list-group-item"&gt;Song/Episode 2 - Why you like it&lt;/li&gt;
                &lt;li class="list-group-item"&gt;Song/Episode 3 - Why you like it&lt;/li&gt;
              &lt;/ul&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>Why:</strong> This section introduces accordions and gives the Music navbar link a working target.</p>
      
      <h2>📋 Step 13: Add Quick Facts Before the Footer</h2>
      <p><strong>What to do:</strong> Add this quick facts section before the footer to showcase more about yourself.</p>
      <div class="code-block">
        <code>&lt;div class="container my-5"&gt;
  &lt;h2 class="text-center mb-4"&gt;Quick Facts About Me&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-3 text-center mb-3"&gt;
      &lt;div class="card border-primary"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="text-primary"&gt;🎓&lt;/h3&gt;
          &lt;h5&gt;Education&lt;/h5&gt;
          &lt;p class="text-muted"&gt;Your school/major&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-3 text-center mb-3"&gt;
      &lt;div class="card border-success"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="text-success"&gt;🎯&lt;/h3&gt;
          &lt;h5&gt;Goals&lt;/h5&gt;
          &lt;p class="text-muted"&gt;Your aspirations&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-3 text-center mb-3"&gt;
      &lt;div class="card border-warning"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="text-warning"&gt;💻&lt;/h3&gt;
          &lt;h5&gt;Skills&lt;/h5&gt;
          &lt;p class="text-muted"&gt;Your talents&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-3 text-center mb-3"&gt;
      &lt;div class="card border-info"&gt;
        &lt;div class="card-body"&gt;
          &lt;h3 class="text-info"&gt;🌟&lt;/h3&gt;
          &lt;h5&gt;Fun Fact&lt;/h5&gt;
          &lt;p class="text-muted"&gt;Something interesting!&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Fill in your education, goals, skills, and a fun fact about yourself.</p>
      <p><strong>Why:</strong> This is a final layout practice that adds a clean four-column section without changing the rest of the page structure.</p>
      
      <h2>✅ Final Checklist</h2>
      <p>Before you export, make sure you've:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>✅ Replaced "YOUR NAME" with your actual name</li>
        <li>✅ Added the Bootstrap CDN links in the correct places</li>
        <li>✅ Built a hero section, interests cards, and biography</li>
        <li>✅ Added a navbar with working About, Movies, and Music links</li>
        <li>✅ Added an image to your biography section and the navbar brand area</li>
        <li>✅ Written your biography</li>
        <li>✅ Added information about your favorite movie series</li>
        <li>✅ Added information about your favorite music/podcast</li>
        <li>✅ Replaced any sample text or sample images you no longer want</li>
        <li>✅ Added your social links in the footer</li>
        <li>✅ Filled in the Quick Facts section</li>
        <li>✅ Checked that everything looks good in the preview!</li>
      </ul>
      
      <h2>🎉 Congratulations!</h2>
      <p>You've built a complete, professional-looking website! Use the <strong>Export HTML</strong> button in the Simulator to download your file. You can open it in any browser or host it online!</p>
      
      <div class="alert alert-success mt-4">
        <strong>💡 Pro Tip:</strong> Try modifying colors, adding more sections, or experimenting with different Bootstrap components. The more you practice, the better you'll get!
      </div>
    `
  }
};

// Helper function to add copy buttons to code blocks
function addCopyButtons() {
  const codeBlocks = document.querySelectorAll('.code-block');
  codeBlocks.forEach(block => {
    // Check if button already exists
    if (block.querySelector('.copy-code-btn')) return;
    
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.textContent = 'Copy';
    button.addEventListener('click', () => {
      const code = block.querySelector('code');
      if (code) {
        const text = code.textContent;
        navigator.clipboard.writeText(text).then(() => {
          button.textContent = 'Copied';
          button.classList.add('copied');
          setTimeout(() => {
            button.textContent = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        });
      }
    });
    block.appendChild(button);
  });
}

// Helper function to add syntax highlighting (works with escaped HTML)
function addSyntaxHighlighting() {
  const codeBlocks = document.querySelectorAll('.code-block code');
  codeBlocks.forEach(code => {
    // Get the original innerHTML (which has escaped entities like &lt; and &gt;)
    let html = code.innerHTML;
    
    // Work directly with escaped HTML entities
    // Highlight HTML comments first
    html = html.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="html-comment">$1</span>');
    
    // Highlight HTML tags - work with &lt; and &gt; entities
    html = html.replace(/(&lt;\/?)([\w-]+)([^&]*?)(&gt;)/g, (match, open, tag, attrs, close) => {
      // Highlight attributes within the tag (work with escaped entities)
      let highlightedAttrs = attrs;
      if (attrs.trim()) {
        // Match attribute="value" patterns (with escaped quotes)
        highlightedAttrs = attrs.replace(/(\w+)(\s*=\s*)(&quot;.*?&quot;|&#39;.*?&#39;)/g, 
          '<span class="html-attr">$1</span>$2<span class="html-string">$3</span>');
      }
      // Return with escaped span tags
      return `${open}<span class="html-tag">${tag}</span>${highlightedAttrs}${close}`;
    });
    
    // Set the highlighted HTML
    code.innerHTML = html;
  });
}

const avatarBuilderOptions = {
  top: [
    'shortFlat',
    'shortRound',
    'shortCurly',
    'longButNotTooLong',
    'miaWallace',
    'curly',
    'bob',
    'bun',
    'fro',
    'bigHair',
    'theCaesar',
    'hat'
  ],
  eyes: ['default', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink'],
  mouth: ['default', 'smile', 'twinkle', 'tongue', 'serious', 'sad'],
  eyebrows: ['default', 'defaultNatural', 'raisedExcited', 'raisedExcitedNatural', 'sadConcerned', 'upDown'],
  accessories: ['', 'round', 'prescription01', 'prescription02', 'sunglasses', 'wayfarers', 'eyepatch'],
  facialHair: ['', 'beardLight', 'beardMedium', 'beardMajestic', 'moustacheFancy', 'moustacheMagnum'],
  clothing: ['hoodie', 'graphicShirt', 'shirtCrewNeck', 'shirtVNeck', 'shirtScoopNeck', 'overall', 'blazerAndShirt', 'blazerAndSweater']
};

const defaultAvatarBuilderState = {
  seed: 'student-avatar',
  top: 'shortFlat',
  eyes: 'happy',
  mouth: 'smile',
  eyebrows: 'defaultNatural',
  accessories: '',
  facialHair: '',
  clothing: 'hoodie',
  hairColor: '#6a4c2a',
  skinColor: '#f2d3b1',
  clothingColor: '#5bc0eb',
  backgroundColor: '#dcefff'
};

function formatAvatarOptionLabel(value) {
  if (!value) {
    return 'None';
  }

  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/\d+/g, match => ` ${match}`)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, char => char.toUpperCase());
}

function buildAvatarUrl(state) {
  const url = new URL('https://api.dicebear.com/9.x/avataaars/svg');
  const params = url.searchParams;

  params.set('seed', state.seed.trim() || defaultAvatarBuilderState.seed);
  params.set('top', state.top);
  params.set('eyes', state.eyes);
  params.set('mouth', state.mouth);
  params.set('eyebrows', state.eyebrows);
  params.set('clothing', state.clothing);
  params.set('hairColor', state.hairColor.replace('#', ''));
  params.set('skinColor', state.skinColor.replace('#', ''));
  params.set('clothingColor', state.clothingColor.replace('#', ''));
  params.set('backgroundColor', state.backgroundColor.replace('#', ''));

  if (state.accessories) {
    params.set('accessories', state.accessories);
  }

  if (state.facialHair) {
    params.set('facialHair', state.facialHair);
  }

  return url.toString();
}

function updateAvatarBuilderPreview(mount) {
  const controls = Array.from(mount.querySelectorAll('[data-avatar-control]'));
  const state = controls.reduce((accumulator, control) => {
    accumulator[control.name] = control.value;
    return accumulator;
  }, {});

  const avatarUrl = buildAvatarUrl(state);
  const previewLarge = mount.querySelector('[data-avatar-preview="bio"]');
  const previewSmall = mount.querySelector('[data-avatar-preview="nav"]');
  const urlOutput = mount.querySelector('[data-avatar-output="url"]');
  const bioSnippet = mount.querySelector('[data-avatar-output="bioSnippet"]');
  const navSnippet = mount.querySelector('[data-avatar-output="navSnippet"]');

  if (previewLarge) {
    previewLarge.src = avatarUrl;
  }

  if (previewSmall) {
    previewSmall.src = avatarUrl;
  }

  if (urlOutput) {
    urlOutput.value = avatarUrl;
  }

  if (bioSnippet) {
    bioSnippet.textContent = `<img src="${avatarUrl}" alt="A profile image that represents me" class="img-fluid rounded mb-3">`;
  }

  if (navSnippet) {
    navSnippet.textContent = `<a class="navbar-brand" href="#">
  <img src="${avatarUrl}" alt="My site logo" height="40" class="rounded-circle">
</a>`;
  }
}

async function copyAvatarBuilderOutput(text, title, message) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification(title, message, 'success');
  } catch (error) {
    showNotification('Copy failed', 'Your browser blocked clipboard access. Try copying manually instead.', 'warning');
  }
}

async function downloadAvatarSvg(url, filename) {
  try {
    const response = await fetch(url);
    const svgText = await response.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
    showNotification('Avatar downloaded', 'Your SVG avatar is ready to save or reuse in your page.', 'success');
  } catch (error) {
    showNotification('Download failed', 'The avatar could not be downloaded right now. Please try again.', 'warning');
  }
}

function initializeAvatarBuilder() {
  const mount = document.getElementById('avatarBuilderMount');

  if (!mount) {
    return;
  }

  const selectMarkup = Object.entries(avatarBuilderOptions).map(([name, values]) => `
    <label class="avatar-builder__field">
      <span>${formatAvatarOptionLabel(name)}</span>
      <select class="input-field" name="${name}" data-avatar-control>
        ${values.map(value => `
          <option value="${value}"${defaultAvatarBuilderState[name] === value ? ' selected' : ''}>${formatAvatarOptionLabel(value)}</option>
        `).join('')}
      </select>
    </label>
  `).join('');

  mount.innerHTML = `
    <div class="avatar-builder">
      <div class="avatar-builder__preview-panel">
        <div class="avatar-builder__preview-card">
          <p class="avatar-builder__preview-label">Biography Preview</p>
          <div class="avatar-builder__bio-preview">
            <img data-avatar-preview="bio" alt="Live avatar preview for biography card">
            <div>
              <h4>About Me</h4>
              <p>This avatar can sit above the student's biography text.</p>
            </div>
          </div>
        </div>
        <div class="avatar-builder__preview-card">
          <p class="avatar-builder__preview-label">Navbar Preview</p>
          <div class="avatar-builder__nav-preview">
            <img data-avatar-preview="nav" alt="Live avatar preview for navbar">
            <span>Student Site</span>
          </div>
        </div>
      </div>

      <div class="avatar-builder__controls-panel">
        <div class="avatar-builder__controls-grid">
          <label class="avatar-builder__field avatar-builder__field--wide">
            <span>Seed</span>
            <input class="input-field" type="text" name="seed" value="${defaultAvatarBuilderState.seed}" data-avatar-control>
          </label>
          ${selectMarkup}
          <label class="avatar-builder__field">
            <span>Hair Color</span>
            <input class="input-field avatar-builder__color" type="color" name="hairColor" value="${defaultAvatarBuilderState.hairColor}" data-avatar-control>
          </label>
          <label class="avatar-builder__field">
            <span>Skin Color</span>
            <input class="input-field avatar-builder__color" type="color" name="skinColor" value="${defaultAvatarBuilderState.skinColor}" data-avatar-control>
          </label>
          <label class="avatar-builder__field">
            <span>Clothing Color</span>
            <input class="input-field avatar-builder__color" type="color" name="clothingColor" value="${defaultAvatarBuilderState.clothingColor}" data-avatar-control>
          </label>
          <label class="avatar-builder__field">
            <span>Background Color</span>
            <input class="input-field avatar-builder__color" type="color" name="backgroundColor" value="${defaultAvatarBuilderState.backgroundColor}" data-avatar-control>
          </label>
        </div>

        <div class="avatar-builder__actions">
          <button type="button" class="btn-primary btn-small" data-avatar-action="copy-url">Copy Avatar URL</button>
          <button type="button" class="btn-ghost btn-small" data-avatar-action="copy-bio">Copy Biography Snippet</button>
          <button type="button" class="btn-ghost btn-small" data-avatar-action="copy-nav">Copy Navbar Snippet</button>
          <button type="button" class="btn-ghost btn-small" data-avatar-action="download-svg">Download SVG</button>
        </div>

        <label class="avatar-builder__field avatar-builder__field--wide">
          <span>Live Avatar URL</span>
          <input class="input-field avatar-builder__url-output" type="text" readonly data-avatar-output="url">
        </label>
      </div>

      <div class="avatar-builder__snippet-grid">
        <div>
          <h4>Biography Snippet</h4>
          <div class="code-block">
            <code data-avatar-output="bioSnippet"></code>
          </div>
        </div>
        <div>
          <h4>Navbar Snippet</h4>
          <div class="code-block">
            <code data-avatar-output="navSnippet"></code>
          </div>
        </div>
      </div>
    </div>
  `;

  mount.querySelectorAll('[data-avatar-control]').forEach(control => {
    control.addEventListener('input', () => updateAvatarBuilderPreview(mount));
    control.addEventListener('change', () => updateAvatarBuilderPreview(mount));
  });

  mount.addEventListener('click', async (event) => {
    const action = event.target.closest('[data-avatar-action]')?.getAttribute('data-avatar-action');
    if (!action) {
      return;
    }

    const url = mount.querySelector('[data-avatar-output="url"]')?.value || '';
    const bioSnippet = mount.querySelector('[data-avatar-output="bioSnippet"]')?.textContent || '';
    const navSnippet = mount.querySelector('[data-avatar-output="navSnippet"]')?.textContent || '';
    const seed = mount.querySelector('[name="seed"]')?.value.trim() || defaultAvatarBuilderState.seed;

    if (action === 'copy-url') {
      await copyAvatarBuilderOutput(url, 'Avatar URL copied', 'Paste it into an image src attribute anywhere in your project.');
    } else if (action === 'copy-bio') {
      await copyAvatarBuilderOutput(bioSnippet, 'Biography snippet copied', 'Paste it into your biography card above the About Me heading.');
    } else if (action === 'copy-nav') {
      await copyAvatarBuilderOutput(navSnippet, 'Navbar snippet copied', 'Paste it inside your navbar-brand link to use the avatar as your site logo.');
    } else if (action === 'download-svg') {
      await downloadAvatarSvg(url, `${seed.replace(/\s+/g, '-').toLowerCase() || 'student-avatar'}.svg`);
    }
  });

  updateAvatarBuilderPreview(mount);
}

// Progress tracking
const progressSections = {
  structure: ['intro'],
  hero: ['headings'],
  biography: ['paragraphs'],
  navbar: ['navbar'],
  footer: ['links'],
  movies: ['layoutMovies'],
  music: ['layoutMusic'],
  quickfacts: ['layoutQuickFacts']
};

function updateProgress(lessonId) {
  Object.keys(progressSections).forEach(section => {
    if (progressSections[section].includes(lessonId)) {
      const checkbox = document.querySelector(`input[data-section="${section}"]`);
      if (checkbox) {
        checkbox.checked = true;
        // Save to localStorage
        localStorage.setItem(`progress_${section}`, 'true');
      }
    }
  });
}

function loadProgress() {
  Object.keys(progressSections).forEach(section => {
    const checkbox = document.querySelector(`input[data-section="${section}"]`);
    if (checkbox && localStorage.getItem(`progress_${section}`) === 'true') {
      checkbox.checked = true;
    }
  });
}

// Lesson navigation
const lessonSearch = document.getElementById('lessonSearch');
const lessonDisplay = document.getElementById('lessonDisplay');
const lessonNavItems = Array.from(document.querySelectorAll('.lesson-nav-item'));
let activeLessonId = null;

function getVisibleLessonItems() {
  return lessonNavItems.filter(item => !item.classList.contains('hidden'));
}

function isLessonsTabActive() {
  return document.getElementById('lessonsTab')?.classList.contains('tab-active');
}

function isEditableTarget(target) {
  if (!target) {
    return false;
  }

  const tagName = target.tagName;
  return target.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    Boolean(target.closest('.CodeMirror'));
}

function renderLesson(lessonId, { persist = true, focusNav = false } = {}) {
  const lesson = lessons[lessonId];
  const targetItem = lessonNavItems.find(item => item.getAttribute('data-lesson') === lessonId);

  if (!lesson || !targetItem || !lessonDisplay) {
    return false;
  }

  lessonNavItems.forEach(item => item.classList.remove('active'));
  targetItem.classList.add('active');
  activeLessonId = lessonId;

  if (persist) {
    saveLessonState(lessonId);
  }

  updateProgress(lessonId);

  lessonDisplay.innerHTML = `
    <div class="lesson-section">
      ${lesson.content}
    </div>
  `;

  if (focusNav) {
    targetItem.focus();
  }

  setTimeout(() => {
    if (lessonId === 'images') {
      initializeAvatarBuilder();
    }
    addCopyButtons();
    addSyntaxHighlighting();
    updateStarterLessonStatus();
    updateBootstrapLessonStatus();
    updateContainerLessonStatus();
    updateHeadingLessonStatus();
    updateLayoutBasicsStatus();
  }, 10);

  return true;
}

function restoreLessonState() {
  const savedLessonId = getSavedLessonState();
  if (savedLessonId && renderLesson(savedLessonId, { persist: false })) {
    return savedLessonId;
  }

  const defaultLessonId = lessonNavItems[0]?.getAttribute('data-lesson');
  if (defaultLessonId) {
    renderLesson(defaultLessonId, { persist: false });
    return defaultLessonId;
  }

  return null;
}

if (lessonSearch) {
  lessonSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    lessonNavItems.forEach(item => {
      const matchesQuery = item.textContent.toLowerCase().includes(query);
      item.classList.toggle('hidden', !matchesQuery);
      item.setAttribute('aria-hidden', String(!matchesQuery));
    });
  });
}

lessonNavItems.forEach(item => {
  item.addEventListener('click', () => {
    renderLesson(item.getAttribute('data-lesson'));
  });
});

document.addEventListener('keydown', (e) => {
  const isSearchShortcut = (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'f';

  if (isSearchShortcut && isLessonsTabActive()) {
    e.preventDefault();
    lessonSearch?.focus();
    lessonSearch?.select();
    return;
  }

  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !isEditableTarget(e.target) && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    switchTabByOffset(e.key === 'ArrowLeft' ? -1 : 1);
    return;
  }

  if (!isLessonsTabActive() || isEditableTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }

  const visibleLessons = getVisibleLessonItems();
  if (!visibleLessons.length) {
    return;
  }

  const activeVisibleIndex = visibleLessons.findIndex(item => item.getAttribute('data-lesson') === activeLessonId);
  let targetItem = null;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    targetItem = activeVisibleIndex === -1
      ? visibleLessons[0]
      : visibleLessons[Math.min(activeVisibleIndex + 1, visibleLessons.length - 1)];
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    targetItem = activeVisibleIndex === -1
      ? visibleLessons[visibleLessons.length - 1]
      : visibleLessons[Math.max(activeVisibleIndex - 1, 0)];
  }

  if (targetItem) {
    renderLesson(targetItem.getAttribute('data-lesson'), { focusNav: true });
  }
});

// Load progress and current lesson on page load
loadProgress();
restoreLessonState();
restoreScrollState();

// IndexedDB setup for saving practice builder progress
const DB_NAME = 'htmlBasicsDB';
const DB_VERSION = 1;
const STORE_NAME = 'practiceContent';

let db = null;

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Save content to IndexedDB
async function saveContent(content) {
  try {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.put(content, 'htmlContent');
  } catch (error) {
    console.error('Error saving content:', error);
  }
}

// Load content from IndexedDB
async function loadContent() {
  try {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('htmlContent');
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading content:', error);
    return null;
  }
}

// Clear saved content
async function clearSavedContent() {
  try {
    if (!db) await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.delete('htmlContent');
  } catch (error) {
    console.error('Error clearing content:', error);
  }
}

// Initialize DB on page load
initDB().catch(console.error);

// Practice Builder
const htmlEditorElement = document.getElementById('htmlEditor');
const previewFrame = document.getElementById('previewFrame');
const refreshBtn = document.getElementById('refreshBtn');
const clearBtn = document.getElementById('clearBtn');

if (typeof CodeMirror !== 'undefined') {
  const codeMirrorEditor = CodeMirror.fromTextArea(htmlEditorElement, {
    mode: 'htmlmixed',
    theme: 'monokai',
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false
  });
  const codeMirrorWrapper = codeMirrorEditor.getWrapperElement();
  codeMirrorWrapper.setAttribute('data-placeholder', htmlEditorElement.getAttribute('placeholder') || '');

  const updateCodeMirrorPlaceholder = () => {
    codeMirrorWrapper.classList.toggle('CodeMirror-empty', !codeMirrorEditor.getValue().trim());
  };

  htmlEditor = {
    getValue: () => codeMirrorEditor.getValue(),
    setValue: (val) => {
      codeMirrorEditor.setValue(val);
      updateCodeMirrorPlaceholder();
      refreshHtmlEditor();
    },
    focus: () => codeMirrorEditor.focus(),
    refresh: () => codeMirrorEditor.refresh()
  };

  codeMirrorEditor.on('change', () => {
    updateCodeMirrorPlaceholder();
    updatePreview();
    debouncedSave();
  });
  updateCodeMirrorPlaceholder();
} else {
  htmlEditor = {
    getValue: () => htmlEditorElement.value,
    setValue: (val) => {
      htmlEditorElement.value = val;
    },
    focus: () => htmlEditorElement.focus()
  };

  htmlEditorElement.addEventListener('input', () => {
    updatePreview();
    debouncedSave();
  });
}

if (getActiveTabId() === 'practice') {
  refreshHtmlEditor();
}

// HTML validation
function validateHTML(html) {
  const errors = [];
  
  // Check for basic structure
  if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
    errors.push('Missing HTML structure. Add <!DOCTYPE html> and <html> tags.');
  }
  
  // Check for unclosed tags (improved check)
  // List of self-closing tags that don't need closing tags
  const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
    'link', 'meta', 'param', 'source', 'track', 'wbr'];
  
  // Remove DOCTYPE and comments from the check
  let cleanHtml = html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  
  // Extract all tags
  const allTags = cleanHtml.match(/<\/?[\w-]+[^>]*>/g) || [];
  
  // Count opening and closing tags, excluding self-closing ones
  let openCount = 0;
  let closeCount = 0;
  
  allTags.forEach(tag => {
    // Check if it's a closing tag
    if (tag.startsWith('</')) {
      closeCount++;
    } 
    // Check if it's a self-closing tag (ends with /> or is a known self-closing tag)
    else if (tag.endsWith('/>')) {
      // Explicitly self-closing, don't count
    }
    else {
      // Extract tag name
      const tagMatch = tag.match(/<([\w-]+)/);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        // Only count if it's not a self-closing tag
        if (!selfClosingTags.includes(tagName)) {
          openCount++;
        }
      }
    }
  });
  
  // Allow a small margin for edge cases, but flag if there's a significant imbalance
  if (openCount > closeCount + 3) {
    errors.push('Possible unclosed tags detected. Make sure all tags are properly closed.');
  }
  
  // Only ask for Bootstrap when the page is using Bootstrap-specific classes.
  const usesBootstrapClasses = /\bclass\s*=\s*["'][^"']*\b(container|row|col|btn|card|navbar|display-\d|lead|text-|bg-|mt-|mb-|py-|px-)/i.test(html);
  const hasBootstrap = /bootstrap/i.test(html);
  if (usesBootstrapClasses && !hasBootstrap) {
    errors.push('Bootstrap classes found, but Bootstrap links are missing. Add the Bootstrap CSS and JS links.');
  }
  
  return errors;
}

function getTagIndex(html, tagName, { last = false } = {}) {
  const method = last ? 'lastIndexOf' : 'indexOf';
  return html.toLowerCase()[method](`</${tagName}>`);
}

function findBootstrapCssLink(html) {
  return html.search(/<link\b[^>]*href=["'][^"']*bootstrap[^"']*\.css[^"']*["'][^>]*>/i);
}

function findBootstrapJsScript(html) {
  return html.search(/<script\b[^>]*src=["'][^"']*bootstrap[^"']*\.js[^"']*["'][^>]*>\s*<\/script>/i);
}

function getBootstrapSetupStatus(html) {
  const headCloseIndex = getTagIndex(html, 'head');
  const bodyCloseIndex = getTagIndex(html, 'body', { last: true });
  const cssIndex = findBootstrapCssLink(html);
  const jsIndex = findBootstrapJsScript(html);

  const cssFound = cssIndex !== -1;
  const jsFound = jsIndex !== -1;
  const cssCorrect = cssFound && headCloseIndex !== -1 && cssIndex < headCloseIndex;
  const jsCorrect = jsFound && bodyCloseIndex !== -1 && jsIndex < bodyCloseIndex;

  return {
    cssFound,
    jsFound,
    cssCorrect,
    jsCorrect,
    ready: cssCorrect && jsCorrect,
    checks: [
      cssCorrect
        ? { type: 'success', text: 'Bootstrap CSS is above </head>.' }
        : cssFound
          ? { type: 'error', text: 'Move the Bootstrap CSS line above </head>.' }
          : { type: 'pending', text: 'Bootstrap CSS is not added yet. Find </head> and paste the CSS line above it.' },
      jsCorrect
        ? { type: 'success', text: 'Bootstrap JS is above </body>.' }
        : jsFound
          ? { type: 'error', text: 'Move the Bootstrap JS line above </body>.' }
          : { type: 'pending', text: 'Bootstrap JS is not added yet. Find </body> and paste the JS line above it.' }
    ]
  };
}

function setStepStatus(element, state, label) {
  if (!element) {
    return;
  }

  element.classList.remove('step-status--pending', 'step-status--success', 'step-status--error');
  element.classList.add(`step-status--${state}`);
  element.textContent = state === 'error' ? '✕' : '✓';
  element.setAttribute('aria-label', label);
  element.setAttribute('title', label);
}

function getStarterSetupStatus(html) {
  const hasContent = html.trim().length > 0;
  const hasDoctype = /<!doctype\s+html>/i.test(html);
  const hasHtml = /<html\b[^>]*>/i.test(html) && /<\/html>/i.test(html);
  const hasHead = /<head\b[^>]*>/i.test(html) && /<\/head>/i.test(html);
  const hasBody = /<body\b[^>]*>/i.test(html) && /<\/body>/i.test(html);
  const hasTitle = /<title\b[^>]*>[\s\S]*?<\/title>/i.test(html);
  const hasHeading = /<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html);
  const hasParagraph = /<p\b[^>]*>[\s\S]*?<\/p>/i.test(html);
  const complete = hasDoctype && hasHtml && hasHead && hasBody && hasTitle && hasHeading && hasParagraph;

  return {
    hasContent,
    complete
  };
}

function updateStarterLessonStatus(status = null) {
  const currentStatus = status || getStarterSetupStatus(htmlEditor?.getValue?.() || '');
  const state = currentStatus.complete ? 'success' : currentStatus.hasContent ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-starter-status="structure"]'),
    state,
    state === 'success'
      ? 'Starter file has the required structure'
      : state === 'error'
        ? 'Starter file is started, but something is missing'
        : 'Starter file not done yet'
  );
}

function updateBootstrapLessonStatus(status = null) {
  const currentStatus = status || getBootstrapSetupStatus(htmlEditor?.getValue?.() || '');
  const cssState = currentStatus.cssCorrect ? 'success' : currentStatus.cssFound ? 'error' : 'pending';
  const jsState = currentStatus.jsCorrect ? 'success' : currentStatus.jsFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-bootstrap-status="css"]'),
    cssState,
    cssState === 'success'
      ? 'Bootstrap CSS is in the correct place'
      : cssState === 'error'
        ? 'Bootstrap CSS was added, but it is in the wrong place'
        : 'Bootstrap CSS not done yet'
  );

  setStepStatus(
    document.querySelector('[data-bootstrap-status="js"]'),
    jsState,
    jsState === 'success'
      ? 'Bootstrap JS is in the correct place'
      : jsState === 'error'
        ? 'Bootstrap JS was added, but it is in the wrong place'
        : 'Bootstrap JS not done yet'
  );
}

function getContainerSetupStatus(html) {
  const headingMatch = /<h1\b[^>]*>[\s\S]*?<\/h1>/i.exec(html);
  const paragraphMatch = /<p\b[^>]*>[\s\S]*?<\/p>/i.exec(html);
  const openMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcontainer\b[^"']*["'][^>]*>/gi));
  const closeMatches = Array.from(html.matchAll(/<\/div>/gi));

  const headingIndex = headingMatch?.index ?? -1;
  const paragraphAfterHeading = headingIndex !== -1
    ? Array.from(html.slice(headingIndex).matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi))[0]
    : null;
  const paragraphEndIndex = paragraphAfterHeading
    ? headingIndex + paragraphAfterHeading.index + paragraphAfterHeading[0].length
    : paragraphMatch
      ? paragraphMatch.index + paragraphMatch[0].length
      : -1;
  const openBeforeHeading = headingIndex !== -1
    ? openMatches.find(match => match.index < headingIndex)
    : null;
  const closeAfterParagraph = paragraphEndIndex !== -1
    ? closeMatches.find(match => match.index >= paragraphEndIndex)
    : null;

  const openFound = openMatches.length > 0;
  const closeFound = closeMatches.length > 0;
  const openCorrect = Boolean(openBeforeHeading);
  const closeCorrect = Boolean(openBeforeHeading && closeAfterParagraph);

  return {
    openFound,
    closeFound,
    openCorrect,
    closeCorrect
  };
}

function tagHasClass(tag, className) {
  const classMatch = /\bclass\s*=\s*["']([^"']*)["']/i.exec(tag);
  return Boolean(classMatch && classMatch[1].split(/\s+/).includes(className));
}

function tagHasClasses(tag, classNames) {
  return classNames.every(className => tagHasClass(tag, className));
}

function getHeadingLessonStatus(html) {
  const containerMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcontainer\b[^"']*["'][^>]*>/gi));
  const heroOpenMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*["'][^>]*>/gi))
    .filter(match => tagHasClasses(match[0], ['bg-primary', 'text-white', 'text-center', 'py-5']));
  const headingMatches = Array.from(html.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi));
  const paragraphMatches = Array.from(html.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi));
  const closeMatches = Array.from(html.matchAll(/<\/div>/gi));

  const heroOpen = heroOpenMatches[0];
  const heroOpenIndex = heroOpen?.index ?? -1;
  const containerBeforeHero = heroOpenIndex !== -1
    ? containerMatches.find(match => match.index < heroOpenIndex)
    : null;
  const headingAfterHero = heroOpenIndex !== -1
    ? headingMatches.find(match => match.index > heroOpenIndex)
    : headingMatches[0];
  const headingIndex = headingAfterHero?.index ?? -1;
  const paragraphAfterHeading = headingIndex !== -1
    ? paragraphMatches.find(match => match.index > headingIndex)
    : paragraphMatches[0];
  const paragraphEndIndex = paragraphAfterHeading
    ? paragraphAfterHeading.index + paragraphAfterHeading[0].length
    : -1;
  const closesAfterParagraph = paragraphEndIndex !== -1
    ? closeMatches.filter(match => match.index >= paragraphEndIndex)
    : [];

  const displayHeading = headingAfterHero && tagHasClass(headingAfterHero[0], 'display-3');
  const leadParagraph = paragraphAfterHeading && tagHasClass(paragraphAfterHeading[0], 'lead');

  return {
    heroOpenFound: heroOpenMatches.length > 0,
    heroOpenCorrect: Boolean(heroOpen && containerBeforeHero),
    heroCloseFound: closesAfterParagraph.length > 1,
    heroCloseCorrect: Boolean(heroOpen && closesAfterParagraph.length > 1),
    displayFound: headingMatches.some(match => tagHasClass(match[0], 'display-3')),
    displayCorrect: Boolean(displayHeading),
    leadFound: paragraphMatches.some(match => tagHasClass(match[0], 'lead')),
    leadCorrect: Boolean(leadParagraph)
  };
}

function getLayoutBasicsStatus(html) {
  const sectionMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*["'][^>]*>/gi))
    .filter(match => tagHasClasses(match[0], ['container', 'mt-5']));
  const headingMatches = Array.from(html.matchAll(/<h2\b[^>]*>[\s\S]*?<\/h2>/gi));
  const rowMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\brow\b[^"']*["'][^>]*>/gi));
  const columnMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcol-md-4\b[^"']*["'][^>]*>/gi));
  const closeMatches = Array.from(html.matchAll(/<\/div>/gi));

  const section = sectionMatches[0];
  const sectionIndex = section?.index ?? -1;
  const headingAfterSection = sectionIndex !== -1
    ? headingMatches.find(match => match.index > sectionIndex)
    : headingMatches.find(match => tagHasClasses(match[0], ['text-center', 'mb-4']));
  const headingIndex = headingAfterSection?.index ?? -1;
  const rowAfterHeading = headingIndex !== -1
    ? rowMatches.find(match => match.index > headingIndex)
    : rowMatches[0];
  const rowIndex = rowAfterHeading?.index ?? -1;
  const columnsAfterRow = rowIndex !== -1
    ? columnMatches.filter(match => match.index > rowIndex)
    : columnMatches;
  const closesAfterRow = rowIndex !== -1
    ? closeMatches.filter(match => match.index > rowIndex)
    : [];

  return {
    sectionFound: sectionMatches.length > 0,
    sectionCorrect: Boolean(section),
    headingFound: headingMatches.some(match => tagHasClasses(match[0], ['text-center', 'mb-4'])),
    headingCorrect: Boolean(headingAfterSection && tagHasClasses(headingAfterSection[0], ['text-center', 'mb-4'])),
    rowFound: rowMatches.length > 0,
    rowCorrect: Boolean(rowAfterHeading),
    columnCount: columnsAfterRow.length,
    closeFound: closesAfterRow.length > 3,
    closeCorrect: Boolean(rowAfterHeading && columnsAfterRow.length >= 3 && closesAfterRow.length >= 5)
  };
}

function updateContainerLessonStatus(status = null) {
  const currentStatus = status || getContainerSetupStatus(htmlEditor?.getValue?.() || '');
  const openState = currentStatus.openCorrect ? 'success' : currentStatus.openFound ? 'error' : 'pending';
  const closeState = currentStatus.closeCorrect ? 'success' : currentStatus.closeFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-container-status="open"]'),
    openState,
    openState === 'success'
      ? 'Container opening tag is in the correct place'
      : openState === 'error'
        ? 'Container opening tag was added, but it is in the wrong place'
        : 'Container opening tag not done yet'
  );

  setStepStatus(
    document.querySelector('[data-container-status="close"]'),
    closeState,
    closeState === 'success'
      ? 'Container closing tag is in the correct place'
      : closeState === 'error'
        ? 'Container closing tag was added, but it is in the wrong place'
        : 'Container closing tag not done yet'
  );
}

function updateHeadingLessonStatus(status = null) {
  const currentStatus = status || getHeadingLessonStatus(htmlEditor?.getValue?.() || '');
  const heroOpenState = currentStatus.heroOpenCorrect ? 'success' : currentStatus.heroOpenFound ? 'error' : 'pending';
  const heroCloseState = currentStatus.heroCloseCorrect ? 'success' : currentStatus.heroCloseFound ? 'error' : 'pending';
  const displayState = currentStatus.displayCorrect ? 'success' : currentStatus.displayFound ? 'error' : 'pending';
  const leadState = currentStatus.leadCorrect ? 'success' : currentStatus.leadFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-heading-status="hero-open"]'),
    heroOpenState,
    heroOpenState === 'success'
      ? 'Hero box opening tag is in the correct place'
      : heroOpenState === 'error'
        ? 'Hero box opening tag was added, but it should go below the container line'
        : 'Hero box opening tag not done yet'
  );

  setStepStatus(
    document.querySelector('[data-heading-status="hero-close"]'),
    heroCloseState,
    heroCloseState === 'success'
      ? 'Hero box closing tag is after the paragraph'
      : heroCloseState === 'error'
        ? 'Hero box closing tag is missing or in the wrong place'
        : 'Hero box closing tag not done yet'
  );

  setStepStatus(
    document.querySelector('[data-heading-status="display"]'),
    displayState,
    displayState === 'success'
      ? 'Heading uses display-3'
      : displayState === 'error'
        ? 'display-3 was added, but it should be on the main heading'
        : 'Display heading not done yet'
  );

  setStepStatus(
    document.querySelector('[data-heading-status="lead"]'),
    leadState,
    leadState === 'success'
      ? 'Paragraph uses lead'
      : leadState === 'error'
        ? 'lead was added, but it should be on the paragraph'
        : 'Lead paragraph not done yet'
  );
}

function updateLayoutBasicsStatus(status = null) {
  const currentStatus = status || getLayoutBasicsStatus(htmlEditor?.getValue?.() || '');
  const sectionState = currentStatus.sectionCorrect ? 'success' : currentStatus.sectionFound ? 'error' : 'pending';
  const headingState = currentStatus.headingCorrect ? 'success' : currentStatus.headingFound ? 'error' : 'pending';
  const rowState = currentStatus.rowCorrect ? 'success' : currentStatus.rowFound ? 'error' : 'pending';
  const firstColumnState = currentStatus.columnCount >= 1 ? 'success' : 'pending';
  const secondColumnState = currentStatus.columnCount >= 2 ? 'success' : 'pending';
  const thirdColumnState = currentStatus.columnCount >= 3 ? 'success' : 'pending';
  const closeState = currentStatus.closeCorrect ? 'success' : currentStatus.closeFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-layout-status="section"]'),
    sectionState,
    sectionState === 'success'
      ? 'Interests section starts with container mt-5'
      : sectionState === 'error'
        ? 'Interests section was started, but the class should include container and mt-5'
        : 'Interests section not done yet'
  );

  setStepStatus(
    document.querySelector('[data-layout-status="heading"]'),
    headingState,
    headingState === 'success'
      ? 'Interests heading is in the new section'
      : headingState === 'error'
        ? 'Heading was added, but it should go below the new section line'
        : 'Interests heading not done yet'
  );

  setStepStatus(
    document.querySelector('[data-layout-status="row"]'),
    rowState,
    rowState === 'success'
      ? 'Grid row is below the section heading'
      : rowState === 'error'
        ? 'Grid row was added, but it should go below the section heading'
        : 'Grid row not done yet'
  );

  setStepStatus(
    document.querySelector('[data-layout-status="column-one"]'),
    firstColumnState,
    firstColumnState === 'success' ? 'First column added' : 'First column not done yet'
  );

  setStepStatus(
    document.querySelector('[data-layout-status="column-two"]'),
    secondColumnState,
    secondColumnState === 'success' ? 'Second column added' : 'Second column not done yet'
  );

  setStepStatus(
    document.querySelector('[data-layout-status="column-three"]'),
    thirdColumnState,
    thirdColumnState === 'success' ? 'Third column added' : 'Third column not done yet'
  );

  setStepStatus(
    document.querySelector('[data-layout-status="close"]'),
    closeState,
    closeState === 'success'
      ? 'Row and section closing tags are present'
      : closeState === 'error'
        ? 'Closing tags are missing or in the wrong place'
        : 'Grid closing tags not done yet'
  );
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function updatePreview() {
  const htmlContent = htmlEditor.getValue();
  const errorDiv = document.getElementById('previewError');

  if (!htmlContent.trim()) {
    updateStarterLessonStatus(getStarterSetupStatus(''));
    updateBootstrapLessonStatus(getBootstrapSetupStatus(''));
    updateContainerLessonStatus(getContainerSetupStatus(''));
    updateHeadingLessonStatus(getHeadingLessonStatus(''));
    updateLayoutBasicsStatus(getLayoutBasicsStatus(''));
    errorDiv.style.display = 'block';
    errorDiv.className = 'preview-error preview-error--setup';
    errorDiv.innerHTML = '<strong>Editor is empty.</strong><ul><li>Go to Lessons and copy Step 1 when you are ready to start.</li></ul>';
  } else {
    // Validate HTML
    const errors = validateHTML(htmlContent);
    const starterStatus = getStarterSetupStatus(htmlContent);
    const bootstrapStatus = getBootstrapSetupStatus(htmlContent);
    updateStarterLessonStatus(starterStatus);
    updateBootstrapLessonStatus(bootstrapStatus);
    updateContainerLessonStatus();
    updateHeadingLessonStatus();
    updateLayoutBasicsStatus();

    if (errors.length > 0) {
      errorDiv.style.display = 'block';
      errorDiv.className = 'preview-error preview-error--issue';
      errorDiv.innerHTML = `<strong>Issues found:</strong><ul>${errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`;
    } else {
      errorDiv.style.display = 'none';
      errorDiv.className = 'preview-error';
    }
  }
  
  try {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    previewFrame.src = url;
    
    // Handle iframe errors
    previewFrame.onerror = () => {
      errorDiv.style.display = 'block';
      errorDiv.className = 'preview-error preview-error--issue';
      errorDiv.textContent = 'Error loading preview. Check your HTML syntax.';
    };
  } catch (error) {
    errorDiv.style.display = 'block';
    errorDiv.className = 'preview-error preview-error--issue';
    errorDiv.textContent = `Error: ${error.message}`;
  }
}

// Debounce function for auto-save
let saveTimeout = null;
function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveContent(htmlEditor.getValue());
  }, 1000); // Save 1 second after user stops typing
}

refreshBtn.addEventListener('click', () => {
  updatePreview();
});

// Toggle full-page preview
const toggleViewBtn = document.getElementById('toggleViewBtn');
const practiceContainer = document.querySelector('.practice-container');
let isFullPreview = false;

if (toggleViewBtn && practiceContainer) {
  toggleViewBtn.addEventListener('click', () => {
    isFullPreview = !isFullPreview;
    practiceContainer.classList.toggle('full-preview', isFullPreview);
    toggleViewBtn.textContent = isFullPreview ? 'Editor' : 'Full Page';
    toggleViewBtn.title = isFullPreview ? 'Show editor and preview' : 'Show full-page preview only';
    
    // Refresh preview when toggling to ensure it's up to date
    if (isFullPreview) {
      updatePreview();
    } else {
      refreshHtmlEditor();
    }
  });
}

let notificationStack = null;
let html2canvasLoadPromise = null;

function getNotificationStack() {
  if (!notificationStack) {
    notificationStack = document.createElement('div');
    notificationStack.className = 'app-notification-stack';
    notificationStack.setAttribute('aria-live', 'polite');
    document.body.appendChild(notificationStack);
  }

  return notificationStack;
}

function showNotification(title, message, variant = 'info', duration = 3200) {
  const stack = getNotificationStack();
  const notification = document.createElement('div');
  const body = document.createElement('div');
  const titleEl = document.createElement('p');
  const messageEl = document.createElement('p');
  const closeButton = document.createElement('button');

  notification.className = `app-notification app-notification--${variant}`;
  notification.setAttribute('role', 'status');

  body.className = 'app-notification__body';
  titleEl.className = 'app-notification__title';
  titleEl.textContent = title;
  messageEl.className = 'app-notification__message';
  messageEl.textContent = message;

  closeButton.className = 'app-notification__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Dismiss notification');
  closeButton.textContent = '×';

  body.append(titleEl, messageEl);
  notification.append(body, closeButton);
  stack.appendChild(notification);

  let dismissed = false;
  let timeoutId = null;

  const dismissNotification = () => {
    if (dismissed) {
      return;
    }

    dismissed = true;
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    notification.classList.add('app-notification--exiting');
    window.setTimeout(() => notification.remove(), 180);
  };

  closeButton.addEventListener('click', dismissNotification);
  timeoutId = window.setTimeout(dismissNotification, duration);
}

function loadHtml2Canvas() {
  if (typeof html2canvas !== 'undefined') {
    return Promise.resolve(html2canvas);
  }

  if (html2canvasLoadPromise) {
    return html2canvasLoadPromise;
  }

  html2canvasLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async = true;
    script.onload = () => {
      if (typeof html2canvas === 'undefined') {
        reject(new Error('Image export library did not finish loading.'));
        return;
      }

      resolve(html2canvas);
    };
    script.onerror = () => reject(new Error('Image export library could not be loaded. Check the internet connection and try again.'));
    document.head.appendChild(script);
  });

  return html2canvasLoadPromise;
}

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all code from the editor?')) {
    htmlEditor.setValue('');
    updatePreview();
    clearSavedContent();
    refreshHtmlEditor();
    htmlEditor.focus();
  }
});

// Load saved content on page load
async function loadSavedContent() {
  const saved = await loadContent();
  if (saved) {
    htmlEditor.setValue(saved);
    updatePreview();
    showNotification('Restored!', 'Your previous work has been loaded.');
  } else {
    htmlEditor.setValue('');
  }
  updatePreview();
  refreshHtmlEditor();
  restoreScrollState();
}

// Load saved content when page loads
loadSavedContent();

// Export functionality
const exportBtn = document.getElementById('exportBtn');
const exportImageBtn = document.getElementById('exportImageBtn');

function getExportTitle() {
  const htmlContent = htmlEditor.getValue();
  const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim();
  return title || 'My HTML Site';
}

exportBtn.addEventListener('click', () => {
  const title = getExportTitle();
  let htmlContent = htmlEditor.getValue().trim();
  
  if (!htmlContent) {
    alert('Please add HTML code in the editor before exporting.');
    return;
  }
  
  // Ensure it's a complete HTML document
  if (!htmlContent.includes('<!DOCTYPE') && !htmlContent.includes('<html')) {
    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
  }
  
  // Create and download file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Export as image
if (exportImageBtn) {
  exportImageBtn.addEventListener('click', async () => {
    const title = getExportTitle();
    const originalText = exportImageBtn.textContent;
    
    try {
      // Show loading state
      exportImageBtn.disabled = true;
      exportImageBtn.textContent = 'Preparing image...';
      const capturePage = await loadHtml2Canvas();
      exportImageBtn.textContent = 'Generating...';
      
      // Get HTML content from editor
      const htmlContent = htmlEditor.getValue();
      
      if (!htmlContent.trim()) {
        throw new Error('No HTML content to export. Please add some content in the editor.');
      }
      
      // Create a temporary container with the HTML content
      // This approach is more reliable than trying to capture the iframe
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '1200px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '20px';
      tempContainer.style.overflow = 'visible';
      
      // Create a temporary iframe to render the HTML properly
      const tempIframe = document.createElement('iframe');
      tempIframe.style.position = 'absolute';
      tempIframe.style.left = '-9999px';
      tempIframe.style.width = '1200px';
      tempIframe.style.border = 'none';
      tempIframe.srcdoc = htmlContent;
      
      document.body.appendChild(tempIframe);
      
      // Wait for iframe to load
      await new Promise((resolve, reject) => {
        tempIframe.onload = resolve;
        tempIframe.onerror = reject;
        setTimeout(resolve, 1000); // Fallback timeout
      });
      
      // Try to capture the iframe content
      let canvas;
      try {
        const iframeDoc = tempIframe.contentDocument || tempIframe.contentWindow.document;
        const iframeBody = iframeDoc.body || iframeDoc.documentElement;
        
        if (iframeBody) {
          canvas = await capturePage(iframeBody, {
            backgroundColor: '#ffffff',
            scale: 1.5,
            useCORS: true,
            logging: false,
            allowTaint: true,
            width: Math.max(iframeBody.scrollWidth, iframeBody.offsetWidth, 1200),
            height: Math.max(iframeBody.scrollHeight, iframeBody.offsetHeight, 800)
          });
        } else {
          throw new Error('Could not access iframe content');
        }
      } catch (iframeError) {
        // Fallback: render HTML directly in a div
        console.log('Iframe capture failed, using fallback method:', iframeError);
        tempContainer.innerHTML = htmlContent;
        document.body.appendChild(tempContainer);
        
        // Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        canvas = await capturePage(tempContainer, {
          backgroundColor: '#ffffff',
          scale: 1.5,
          useCORS: true,
          logging: false,
          allowTaint: true,
          width: Math.max(tempContainer.scrollWidth, 1200),
          height: Math.max(tempContainer.scrollHeight, 800)
        });
        
        document.body.removeChild(tempContainer);
      }
      
      // Clean up
      if (tempIframe.parentNode) {
        document.body.removeChild(tempIframe);
      }
      
      if (!canvas) {
        throw new Error('Failed to generate canvas');
      }
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // Reset button
          exportImageBtn.disabled = false;
          exportImageBtn.textContent = originalText;
        } else {
          throw new Error('Failed to create image blob');
        }
      }, 'image/png', 0.95);
      
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image: ' + error.message + '\n\nMake sure your HTML is valid and try again.');
      exportImageBtn.disabled = false;
      exportImageBtn.textContent = originalText;
    }
  });
}
