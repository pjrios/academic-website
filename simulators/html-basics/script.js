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
    document.body.classList.toggle('full-preview-active', Boolean(document.querySelector('.practice-container')?.classList.contains('full-preview')));
    refreshHtmlEditor();
  } else {
    document.body.classList.remove('full-preview-active');
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
    title: 'Hero and Headings',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>hero</strong><span>The big top section visitors see first.</span></div>
        <div><strong>&lt;h1&gt;</strong><span>The main page heading.</span></div>
        <div><strong>class</strong><span>Adds Bootstrap styles to an HTML tag.</span></div>
        <div><strong>display-3</strong><span>Makes the main heading bigger. You can try <code>display-1</code> to <code>display-6</code>.</span></div>
        <div><strong>lead</strong><span>Makes the paragraph stand out.</span></div>
        <div><strong>bg-primary</strong><span>Adds a Bootstrap background color.</span></div>
        <div><strong>text-white</strong><span>Makes text white.</span></div>
        <div><strong>text-center</strong><span>Centers the text.</span></div>
        <div><strong>d-flex</strong><span>Lets Bootstrap center the hero content as a group.</span></div>
        <div><strong>m-3</strong><span>Adds space around the hero. You can try <code>m-1</code> to <code>m-5</code>.</span></div>
        <div><strong>min-height</strong><span>Sets the actual height of the hero box.</span></div>
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
            <code>&lt;div class="bg-primary text-white text-center m-3"&gt;</code>
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
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your heading area should have a colored background.
        </div>
        <div class="next-lesson-note">
          <strong>Want another color?</strong> After this works, you can try another
          <a href="https://getbootstrap.com/docs/5.3/utilities/background/" target="_blank" rel="noopener">background color</a>.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Set the Hero Height</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2</div>
            <div class="step-status step-status--pending" data-heading-status="height" aria-label="Hero height not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your hero opening tag:</strong> it starts with <code>&lt;div class="bg-primary text-white text-center m-3"&gt;</code>.</p>
          <p><strong>Add this before the closing <code>&gt;</code>:</strong></p>
          <div class="code-block">
            <code>style="min-height: 300px;"</code>
          </div>
          <p><strong>It should look like this:</strong></p>
          <div class="code-block">
            <code>&lt;div class="bg-primary text-white text-center m-3" style="min-height: 300px;"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your hero box should be taller.
        </div>
        <div class="next-lesson-note">
          <strong>Want another height?</strong> Try <code>200px</code>, <code>300px</code>, or <code>400px</code> after this works.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Center the Hero Content</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3</div>
            <div class="step-status step-status--pending" data-heading-status="center" aria-label="Hero content centering not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your hero opening tag:</strong> it starts with <code>&lt;div class="bg-primary text-white text-center m-3"</code>.</p>
          <p><strong>Add these classes inside the quotes:</strong></p>
          <div class="code-block">
            <code>d-flex align-items-center justify-content-center flex-column</code>
          </div>
          <p><strong>It should look like this:</strong></p>
          <div class="code-block">
            <code>&lt;div class="bg-primary text-white text-center m-3 d-flex align-items-center justify-content-center flex-column" style="min-height: 300px;"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your heading and paragraph should sit in the center of the hero box.
        </div>
        <div class="next-lesson-note">
          <strong>Want to know more?</strong>
          <a href="https://getbootstrap.com/docs/5.3/utilities/flex/" target="_blank" rel="noopener">Flex centering</a>
          is what keeps the content centered inside a taller box.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Make the Heading Bigger</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4</div>
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
        <div class="next-lesson-note">
          <strong>Want another heading size?</strong> Try <code>display-1</code>, <code>display-2</code>, <code>display-4</code>, <code>display-5</code>, or <code>display-6</code> after this works.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 5</div>
        <h3>Make the Paragraph Stand Out</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5</div>
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
          <li>Your hero box has a <code>bg-*</code> color class and a <code>text-*</code> color class.</li>
          <li>Your hero box uses <code>style="min-height: 300px;"</code>.</li>
          <li>Your hero box uses <code>d-flex align-items-center justify-content-center flex-column</code>.</li>
          <li>Your main heading uses a <code>display-*</code> class.</li>
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
          <p><strong>Find the Bootstrap script line near the bottom:</strong> it starts with <code>&lt;script</code>.</p>
          <p><strong>Paste this line above the script:</strong></p>
          <div class="code-block">
            <code>&lt;div class="container mt-5"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> This starts a new centered section below your hero, before the Bootstrap script.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

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
        <p><strong>Personalize it:</strong> You may change the words, alignment, or spacing later. The check only needs the heading in the right place.</p>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

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

      <div class="step-arrow" aria-hidden="true">↓</div>

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

      <div class="step-arrow" aria-hidden="true">↓</div>

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
          <li>Your new section starts with <code>container</code> and an <code>mt-*</code> spacing class.</li>
          <li>Your section heading is below the new section line.</li>
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
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>card</strong><span>The outside box for one item.</span></div>
        <div><strong>h-100</strong><span>Makes cards the same height.</span></div>
        <div><strong>card-body</strong><span>Adds padding inside the card.</span></div>
        <div><strong>card-title</strong><span>Styles a card heading.</span></div>
        <div><strong>card-text</strong><span>Styles a card paragraph.</span></div>
        <div><strong>mb-4</strong><span>Adds space below each column.</span></div>
        <div><strong>border-primary</strong><span>Adds a Bootstrap border color.</span></div>
        <div><strong>border-success</strong><span>Adds another Bootstrap border color.</span></div>
        <div><strong>bg-light</strong><span>Adds a Bootstrap background color.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Add Space Under Each Column</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1</div>
            <div class="step-status step-status--pending" data-card-status="columns" aria-label="Column spacing not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find each column opening tag:</strong> <code>&lt;div class="col-md-4"&gt;</code></p>
          <p><strong>Change each one to this:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-4 mb-4"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> You should have three columns with <code>col-md-4</code> and an <code>mb-*</code> spacing class.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Add a Card Box Inside Each Column</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2A</div>
            <div class="step-status step-status--pending" data-card-status="cards" aria-label="Card boxes not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Inside each column, paste this line above the <code>&lt;h4&gt;</code>:</strong></p>
          <div class="code-block">
            <code>&lt;div class="card h-100"&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2B</div>
            <div class="step-status step-status--pending" data-card-status="card-closes" aria-label="Card closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Inside each column, paste this line below the paragraph:</strong></p>
          <div class="code-block">
            <code>&lt;/div&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Add the Card Body</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3A</div>
            <div class="step-status step-status--pending" data-card-status="bodies" aria-label="Card bodies not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Inside each card, paste this line above the <code>&lt;h4&gt;</code>:</strong></p>
          <div class="code-block">
            <code>&lt;div class="card-body"&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3B</div>
            <div class="step-status step-status--pending" data-card-status="body-closes" aria-label="Card body closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Inside each card, paste this line below the paragraph and above the card closing line:</strong></p>
          <div class="code-block">
            <code>&lt;/div&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Style the Text Inside the Cards</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4A</div>
            <div class="step-status step-status--pending" data-card-status="titles" aria-label="Card titles not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find each <code>&lt;h4&gt;</code> opening tag.</strong></p>
          <p><strong>Change each opening tag to this:</strong></p>
          <div class="code-block">
            <code>&lt;h4 class="card-title"&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4B</div>
            <div class="step-status step-status--pending" data-card-status="texts" aria-label="Card text not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find each <code>&lt;p&gt;</code> opening tag inside your columns.</strong></p>
          <p><strong>Change each opening tag to this:</strong></p>
          <div class="code-block">
            <code>&lt;p class="card-text"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your three columns should now look like cards.
        </div>
        <p><strong>Personalize it:</strong> You can change the card titles and paragraph words. The checks should stay green.</p>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 5</div>
        <h3>Make the Cards Look Different</h3>
        <p class="step-action"><strong>Do this in three small parts.</strong> Change only the card opening tags.</p>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5A</div>
            <div class="step-status step-status--pending" data-card-status="style-one" aria-label="First card style not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the first card opening tag:</strong> <code>&lt;div class="card h-100"&gt;</code></p>
          <p><strong>Change it to this:</strong></p>
          <div class="code-block">
            <code>&lt;div class="card h-100 border-primary"&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5B</div>
            <div class="step-status step-status--pending" data-card-status="style-two" aria-label="Second card style not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the second card opening tag:</strong> <code>&lt;div class="card h-100"&gt;</code></p>
          <p><strong>Change it to this:</strong></p>
          <div class="code-block">
            <code>&lt;div class="card h-100 border-success"&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5C</div>
            <div class="step-status step-status--pending" data-card-status="style-three" aria-label="Third card style not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the third card opening tag:</strong> <code>&lt;div class="card h-100"&gt;</code></p>
          <p><strong>Change it to this:</strong></p>
          <div class="code-block">
            <code>&lt;div class="card h-100 bg-light"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Each card should have a border color or background color.
        </div>
        <div class="next-lesson-note">
          <strong>Want more colors?</strong> Try other Bootstrap border or background classes after this works:
          <a href="https://getbootstrap.com/docs/5.3/utilities/borders/#color" target="_blank" rel="noopener">border colors</a>
          and
          <a href="https://getbootstrap.com/docs/5.3/utilities/background/" target="_blank" rel="noopener">background colors</a>.
        </div>
      </section>

      <div class="mini-checklist">
        <h3>Before You Continue</h3>
        <ul>
          <li>Your three columns use <code>col-md-4</code> and an <code>mb-*</code> spacing class.</li>
          <li>Each column has a <code>card h-100</code>.</li>
          <li>Each card has a <code>card-body</code>.</li>
          <li>Each card heading uses <code>card-title</code>.</li>
          <li>Each card paragraph uses <code>card-text</code>.</li>
          <li>Each card has a <code>border-*</code> color or a <code>bg-*</code> background color.</li>
          <li>You can change the visible text without breaking the checks.</li>
        </ul>
      </div>

      <div class="next-lesson-note">
        <strong>What's Next:</strong> In the next lesson, you will add a longer biography section.
      </div>
    `
  },
  paragraphs: {
    title: 'Paragraphs & Text with Bootstrap',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>paragraph</strong><span>A block of writing inside <code>&lt;p&gt;</code>.</span></div>
        <div><strong>id="about"</strong><span>Lets the navbar link jump to this section later.</span></div>
        <div><strong>col-md-8</strong><span>Makes a readable middle column.</span></div>
        <div><strong>mx-auto</strong><span>Centers the column.</span></div>
        <div><strong>card-title</strong><span>Styles the biography heading.</span></div>
        <div><strong>card-text</strong><span>Styles each biography paragraph.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Start the Biography Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1</div>
            <div class="step-status step-status--pending" data-paragraph-status="section" aria-label="Biography section not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the Bootstrap script line near the bottom:</strong> it starts with <code>&lt;script</code>.</p>
          <p><strong>Paste this line above the script:</strong></p>
          <div class="code-block">
            <code>&lt;div class="container mt-5" id="about"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> This starts your biography section before the Bootstrap script.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Add a Centered Column</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2A</div>
            <div class="step-status step-status--pending" data-paragraph-status="row" aria-label="Biography row not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="container mt-5" id="about"&gt;</code></p>
          <p><strong>Paste this line below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="row"&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2B</div>
            <div class="step-status step-status--pending" data-paragraph-status="column" aria-label="Centered biography column not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="row"&gt;</code></p>
          <p><strong>Paste this line below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-8 mx-auto"&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Add the Biography Card</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3A</div>
            <div class="step-status step-status--pending" data-paragraph-status="card" aria-label="Biography card not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="col-md-8 mx-auto"&gt;</code></p>
          <p><strong>Paste this line below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="card"&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3B</div>
            <div class="step-status step-status--pending" data-paragraph-status="body" aria-label="Biography card body not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="card"&gt;</code></p>
          <p><strong>Paste this line below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="card-body"&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Add Your Biography Text</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4A</div>
            <div class="step-status step-status--pending" data-paragraph-status="title" aria-label="Biography title not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Inside <code>&lt;div class="card-body"&gt;</code>, paste this line:</strong></p>
          <div class="code-block">
            <code>&lt;h2 class="card-title"&gt;About Me&lt;/h2&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4B</div>
            <div class="step-status step-status--pending" data-paragraph-status="paragraphs" aria-label="Biography paragraphs not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Below the heading, paste these paragraphs:</strong></p>
          <div class="code-block">
            <code>&lt;p class="card-text"&gt;Write a short biography about yourself.&lt;/p&gt;
&lt;p class="card-text"&gt;Add more details about your interests or goals.&lt;/p&gt;</code>
          </div>
        </div>
        <p><strong>Personalize it:</strong> Change the words inside the heading and paragraphs. The checks should stay green.</p>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 5</div>
        <h3>Close the Biography Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5</div>
            <div class="step-status step-status--pending" data-paragraph-status="close" aria-label="Biography closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the end of your second biography paragraph.</strong></p>
          <p><strong>Paste these five lines below it:</strong></p>
          <div class="code-block">
            <code>&lt;/div&gt;
&lt;/div&gt;
&lt;/div&gt;
&lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. You should see an About Me card under your interests cards.
        </div>
      </section>

      <div class="mini-checklist">
        <h3>Before You Continue</h3>
        <ul>
          <li>Your biography section starts with <code>container mt-5</code> and <code>id="about"</code>.</li>
          <li>Your row has a centered <code>col-md-8 mx-auto</code> column.</li>
          <li>Your biography uses a <code>card</code> and <code>card-body</code>.</li>
          <li>Your heading uses <code>card-title</code>.</li>
          <li>You have at least two <code>card-text</code> paragraphs.</li>
          <li>You can change the visible text without breaking the checks.</li>
        </ul>
      </div>

      <div class="next-lesson-note">
        <strong>What's Next:</strong> In the next lesson, you will add a navbar at the top of your page.
      </div>
    `
  },
  navbar: {
    title: 'Navbar with Bootstrap',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>navbar</strong><span>The menu at the top of the page.</span></div>
        <div><strong>navbar-brand</strong><span>Your site name or logo.</span></div>
        <div><strong>navbar-toggler</strong><span>The mobile menu button.</span></div>
        <div><strong>collapse</strong><span>The menu area that opens and closes.</span></div>
        <div><strong>nav-link</strong><span>A clickable menu link.</span></div>
        <div><strong>ms-auto</strong><span>Moves the links to the right.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Start the Navbar</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1</div>
            <div class="step-status step-status--pending" data-navbar-status="start" aria-label="Navbar start not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;body&gt;</code></p>
          <p><strong>Paste this right below it:</strong></p>
          <div class="code-block">
            <code>&lt;nav class="navbar navbar-expand-lg navbar-dark bg-dark"&gt;
  &lt;div class="container"&gt;
  </code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> The navbar should be at the top of <code>&lt;body&gt;</code>, before the hero.
        </div>
        <div class="next-lesson-note">
          <strong>Want another color?</strong> After this works, you can change <code>bg-dark</code> to another
          <a href="https://getbootstrap.com/docs/5.3/utilities/background/" target="_blank" rel="noopener">background color</a>.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Add Your Site Name</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2</div>
            <div class="step-status step-status--pending" data-navbar-status="brand" aria-label="Navbar brand not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="container"&gt;</code> inside the navbar.</p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;a class="navbar-brand" href="#"&gt;YOUR NAME&lt;/a&gt;</code>
          </div>
        </div>
        <p><strong>Personalize it:</strong> Change <code>YOUR NAME</code> to your name or site name.</p>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Add the Mobile Menu Button</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3</div>
            <div class="step-status step-status--pending" data-navbar-status="toggler" aria-label="Navbar mobile button not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your site name line:</strong> it starts with <code>&lt;a class="navbar-brand"</code>.</p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"&gt;
  &lt;span class="navbar-toggler-icon"&gt;&lt;/span&gt;
&lt;/button&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Start the Link Area</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4</div>
            <div class="step-status step-status--pending" data-navbar-status="collapse" aria-label="Navbar link area not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the mobile button closing line:</strong> <code>&lt;/button&gt;</code></p>
          <p><strong>Paste these lines below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="collapse navbar-collapse" id="navbarNav"&gt;
  &lt;ul class="navbar-nav ms-auto"&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 5</div>
        <h3>Add the Links</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5</div>
            <div class="step-status step-status--pending" data-navbar-status="links" aria-label="Navbar links not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;ul class="navbar-nav ms-auto"&gt;</code></p>
          <p><strong>Paste these links below it:</strong></p>
          <div class="code-block">
            <code>&lt;li class="nav-item"&gt;&lt;a class="nav-link active" href="#"&gt;Home&lt;/a&gt;&lt;/li&gt;
&lt;li class="nav-item"&gt;&lt;a class="nav-link" href="#about"&gt;About&lt;/a&gt;&lt;/li&gt;
&lt;li class="nav-item"&gt;&lt;a class="nav-link" href="#movies"&gt;Movies&lt;/a&gt;&lt;/li&gt;
&lt;li class="nav-item"&gt;&lt;a class="nav-link" href="#music"&gt;Music&lt;/a&gt;&lt;/li&gt;
&lt;li class="nav-item"&gt;&lt;a class="nav-link" href="#quickfacts"&gt;Quick Facts&lt;/a&gt;&lt;/li&gt;</code>
          </div>
        </div>
        <p><strong>Note:</strong> The About link works now. Movies, Music, and Quick Facts will work after those sections are added.</p>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 6</div>
        <h3>Close the Navbar</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">6</div>
            <div class="step-status step-status--pending" data-navbar-status="close" aria-label="Navbar closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the last link line:</strong> it says <code>Quick Facts&lt;/a&gt;&lt;/li&gt;</code>.</p>
          <p><strong>Paste these closing tags below it:</strong></p>
          <div class="code-block">
            <code>&lt;/ul&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/nav&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your page should start with a navbar.
        </div>
      </section>

      <div class="mini-checklist">
        <h3>Before You Continue</h3>
        <ul>
          <li>The navbar is right below <code>&lt;body&gt;</code>.</li>
          <li>Your navbar has a <code>navbar-brand</code>.</li>
          <li>The mobile button uses <code>data-bs-target="#navbarNav"</code>.</li>
          <li>The link area uses <code>id="navbarNav"</code>.</li>
          <li>You have links for Home, About, Movies, and Music.</li>
          <li>You can change the visible link words without breaking the checks.</li>
        </ul>
      </div>
    `
  },
  layoutMusic: {
    title: 'Advanced Layout: Music Section',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>id="music"</strong><span>Lets the navbar jump to this section.</span></div>
        <div><strong>col-lg-4</strong><span>A smaller left column.</span></div>
        <div><strong>col-lg-8</strong><span>A wider right column.</span></div>
        <div><strong>accordion</strong><span>A section that opens and closes.</span></div>
        <div><strong>rounded-circle</strong><span>Makes the image circular.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Start the Music Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1</div>
            <div class="step-status step-status--pending" data-music-status="section" aria-label="Music section not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your footer opening tag:</strong> it starts with <code>&lt;footer</code>.</p>
          <p><strong>Paste this above it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="container bg-light py-5 my-5" id="music"&gt;
  &lt;div class="row"&gt;</code>
          </div>
        </div>
        <div class="next-lesson-note">
          <strong>Want another background?</strong> Try a different
          <a href="https://getbootstrap.com/docs/5.3/utilities/background/" target="_blank" rel="noopener">Bootstrap background color</a>.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Add the Image Column</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2</div>
            <div class="step-status step-status--pending" data-music-status="image" aria-label="Music image column not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="row"&gt;</code></p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-lg-4 text-center mb-4"&gt;
  &lt;img src="assets/cat-example-main.jpg" class="img-fluid rounded-circle mb-3" alt="Album art or podcast cover" style="width: 220px; height: 220px; object-fit: cover;"&gt;
  &lt;h3&gt;Artist or Podcast Name&lt;/h3&gt;
  &lt;p&gt;Genre or Category&lt;/p&gt;
&lt;/div&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Add the Text Column</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3</div>
            <div class="step-status step-status--pending" data-music-status="text" aria-label="Music text column not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the image column closing tag.</strong></p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-lg-8"&gt;
  &lt;h2&gt;My Favorite Music or Podcast&lt;/h2&gt;
  &lt;p class="lead"&gt;Write what makes it special to you.&lt;/p&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Add the Accordion</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4</div>
            <div class="step-status step-status--pending" data-music-status="accordion" aria-label="Music accordion not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your music paragraph:</strong> it starts with <code>&lt;p class="lead"&gt;</code>.</p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="accordion" id="musicAccordion"&gt;
  &lt;div class="accordion-item"&gt;
    &lt;h2 class="accordion-header"&gt;
      &lt;button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne"&gt;
        Favorite Songs or Episodes
      &lt;/button&gt;
    &lt;/h2&gt;
    &lt;div id="collapseOne" class="accordion-collapse collapse show"&gt;
      &lt;div class="accordion-body"&gt;Add three favorites here.&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
  &lt;div class="accordion-item"&gt;
    &lt;h2 class="accordion-header"&gt;
      &lt;button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo"&gt;Why I Like It&lt;/button&gt;
    &lt;/h2&gt;
    &lt;div id="collapseTwo" class="accordion-collapse collapse"&gt;
      &lt;div class="accordion-body"&gt;Write one more detail here.&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 5</div>
        <h3>Close the Music Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5</div>
            <div class="step-status step-status--pending" data-music-status="close" aria-label="Music closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the accordion closing tag:</strong> <code>&lt;/div&gt;</code> from Step 4.</p>
          <p><strong>Paste these three lines below it:</strong></p>
          <div class="code-block">
            <code>&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your Music section should appear before the footer.
        </div>
      </section>
    `
  },
  images: {
    title: 'Images with Bootstrap',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>&lt;img&gt;</strong><span>Adds an image to the page.</span></div>
        <div><strong>src</strong><span>The image file path or image URL.</span></div>
        <div><strong>alt</strong><span>Words that describe the image.</span></div>
        <div><strong>img-fluid</strong><span>Makes the image fit its container.</span></div>
        <div><strong>rounded</strong><span>Adds rounded corners.</span></div>
        <div><strong>rounded-circle</strong><span>Makes a small logo image circular.</span></div>
        <div><strong>col-md-4</strong><span>Makes the image column.</span></div>
        <div><strong>col-md-8</strong><span>Makes the text column.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Optional Tool</div>
        <h3>Make an Avatar Image</h3>
        <p>Use this builder if you want a simple character image. You can also use the sample cat image in the steps below.</p>
        <p><strong>Sample image path:</strong> <code>assets/cat-example-main.jpg</code></p>
        <p><strong>Avatar builder:</strong> Make your avatar, download the SVG, then upload it in the Simulator.</p>
      </section>
      <div id="avatarBuilderMount"></div>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Start Two Columns in the Biography Card</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1</div>
            <div class="step-status step-status--pending" data-image-status="bio-layout" aria-label="Biography two-column layout not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line inside your biography card:</strong> <code>&lt;div class="card-body"&gt;</code></p>
          <p><strong>Paste these lines below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="row align-items-center"&gt;
  &lt;div class="col-md-4 text-center"&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Add an Image to the Left Column</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2</div>
            <div class="step-status step-status--pending" data-image-status="bio-image" aria-label="Biography image not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="col-md-4 text-center"&gt;</code></p>
          <p><strong>Paste this line below it:</strong></p>
          <div class="code-block">
            <code>&lt;img src="assets/cat-example-main.jpg" alt="A profile image that represents me" class="img-fluid rounded mb-3" style="max-width: 220px;"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. The image should appear on the left side of your biography card on wide screens.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Put the Text in the Right Column</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3A</div>
            <div class="step-status step-status--pending" data-image-status="bio-text-column" aria-label="Biography text column not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your image line:</strong> it starts with <code>&lt;img</code>.</p>
          <p><strong>Paste these lines below it:</strong></p>
          <div class="code-block">
            <code>  &lt;/div&gt;
  &lt;div class="col-md-8"&gt;</code>
          </div>
        </div>

        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3B</div>
            <div class="step-status step-status--pending" data-image-status="bio-row-close" aria-label="Biography row closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your second biography paragraph:</strong> it starts with <code>&lt;p class="card-text"&gt;</code>.</p>
          <p><strong>Paste these lines below it:</strong></p>
          <div class="code-block">
            <code>  &lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Check the Image Description</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4</div>
            <div class="step-status step-status--pending" data-image-status="bio-alt" aria-label="Biography image description not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your biography image line:</strong> it starts with <code>&lt;img</code>.</p>
          <p><strong>Make sure it has an <code>alt</code> description:</strong></p>
          <div class="code-block">
            <code>alt="A profile image that represents me"</code>
          </div>
        </div>
        <p><strong>Personalize it:</strong> You can change the words inside <code>alt=""</code> to describe your image.</p>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 5</div>
        <h3>Keep the Biography Image Responsive</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5</div>
            <div class="step-status step-status--pending" data-image-status="bio-style" aria-label="Biography image style not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your biography image line.</strong></p>
          <p><strong>Make sure the class includes:</strong></p>
          <div class="code-block">
            <code>img-fluid rounded mb-3</code>
          </div>
          <p><strong>Make sure the image line also includes:</strong></p>
          <div class="code-block">
            <code>style="max-width: 220px;"</code>
          </div>
        </div>
        <div class="next-lesson-note">
          <strong>Want a different shape?</strong> You can try <code>rounded-circle</code> or <code>img-thumbnail</code> after this works.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 6</div>
        <h3>Add an Image to the Navbar Brand</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">6</div>
            <div class="step-status step-status--pending" data-image-status="nav-image" aria-label="Navbar image not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your navbar brand line:</strong> it starts with <code>&lt;a class="navbar-brand"</code>.</p>
          <p><strong>Replace the brand text with this image:</strong></p>
          <div class="code-block">
            <code>&lt;img src="assets/cat-example-main.jpg" alt="My site logo" width="40" height="40" class="rounded-circle" style="object-fit: cover;"&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. The navbar should show a small circular image.
        </div>
      </section>

      <div class="mini-checklist">
        <h3>Before You Continue</h3>
        <ul>
          <li>Your biography card has an image column and a text column.</li>
          <li>Your biography card uses <code>row</code>, <code>col-md-4</code>, and <code>col-md-8</code>.</li>
          <li>The biography image has <code>src</code>, <code>alt</code>, and <code>img-fluid</code>.</li>
          <li>The biography image has spacing such as <code>mb-3</code>.</li>
          <li>Your navbar brand has a small image.</li>
          <li>You can change the image path and alt text without breaking the checks.</li>
        </ul>
      </div>

      <div class="next-lesson-note">
        <strong>What's Next:</strong> In the next lesson, you will add footer links and button-style links.
      </div>
    `
  },
  links: {
    title: 'Links & Buttons with Bootstrap',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>&lt;a&gt;</strong><span>Makes a link.</span></div>
        <div><strong>href</strong><span>Where the link goes.</span></div>
        <div><strong>mailto:</strong><span>Starts an email link.</span></div>
        <div><strong>btn</strong><span>Makes a link look like a button.</span></div>
        <div><strong>&lt;footer&gt;</strong><span>The bottom area of the page.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Start the Footer</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1</div>
            <div class="step-status step-status--pending" data-links-status="footer" aria-label="Footer start not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the Bootstrap script line:</strong> it starts with <code>&lt;script src="https://cdn.jsdelivr.net/npm/bootstrap</code>.</p>
          <p><strong>Paste these lines above it:</strong></p>
          <div class="code-block">
            <code>&lt;footer class="bg-dark text-white py-4 mt-5"&gt;
  &lt;div class="container"&gt;
    &lt;div class="row"&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Add Your Info</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2</div>
            <div class="step-status step-status--pending" data-links-status="info" aria-label="Footer info not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="row"&gt;</code></p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-6"&gt;
  &lt;h5&gt;Your Name&lt;/h5&gt;
  &lt;p&gt;Personal Website Project&lt;/p&gt;
&lt;/div&gt;</code>
          </div>
        </div>
        <p><strong>Personalize it:</strong> Change <code>Your Name</code> and the paragraph words.</p>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Add Button Links</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3</div>
            <div class="step-status step-status--pending" data-links-status="buttons" aria-label="Footer buttons not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your first footer column:</strong> it ends with <code>&lt;/div&gt;</code>.</p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-6 text-md-end"&gt;
  &lt;h5&gt;Connect With Me&lt;/h5&gt;
  &lt;a href="mailto:your.email@example.com" class="btn btn-outline-light btn-sm me-2"&gt;Email&lt;/a&gt;
  &lt;a href="https://github.com" class="btn btn-outline-light btn-sm" target="_blank"&gt;GitHub&lt;/a&gt;
&lt;/div&gt;</code>
          </div>
        </div>
        <div class="next-lesson-note">
          <strong>Want another button color?</strong> Try <code>btn-primary</code>, <code>btn-success</code>, or
          <a href="https://getbootstrap.com/docs/5.3/components/buttons/" target="_blank" rel="noopener">more Bootstrap buttons</a>.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Close the Footer</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4</div>
            <div class="step-status step-status--pending" data-links-status="close" aria-label="Footer closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the last footer link line:</strong> it ends with <code>GitHub&lt;/a&gt;</code>.</p>
          <p><strong>Paste this below the column closing tag:</strong></p>
          <div class="code-block">
            <code>    &lt;/div&gt;
    &lt;hr class="my-3"&gt;
    &lt;p class="text-center mb-0"&gt;© 2024 Your Name&lt;/p&gt;
  &lt;/div&gt;
&lt;/footer&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your footer should be at the bottom of the page.
        </div>
      </section>
    `
  },
  layoutMovies: {
    title: 'Advanced Layout: Movies Section',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>id="movies"</strong><span>Lets the navbar jump to this section.</span></div>
        <div><strong>col-md-6</strong><span>Makes two columns on wider screens.</span></div>
        <div><strong>card-img-top</strong><span>Puts an image at the top of a card.</span></div>
        <div><strong>list-group</strong><span>Makes a clean list.</span></div>
        <div><strong>blockquote</strong><span>Styles a quote.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Start the Movies Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1</div>
            <div class="step-status step-status--pending" data-movie-status="section" aria-label="Movies section not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your footer opening tag:</strong> it starts with <code>&lt;footer</code>.</p>
          <p><strong>Paste this above it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="container my-5" id="movies"&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Add the Heading and Row</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2</div>
            <div class="step-status step-status--pending" data-movie-status="heading" aria-label="Movies heading and row not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="container my-5" id="movies"&gt;</code></p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;h2 class="text-center mb-4"&gt;My Favorite Movie Series&lt;/h2&gt;
  &lt;div class="row"&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Add the Movie Card</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3</div>
            <div class="step-status step-status--pending" data-movie-status="first-card" aria-label="Movie card not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="row"&gt;</code></p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-6 mb-4"&gt;
  &lt;div class="card h-100"&gt;
    &lt;img src="assets/cat-example-main.jpg" class="card-img-top" alt="Movie poster"&gt;
    &lt;div class="card-body"&gt;
      &lt;h5 class="card-title"&gt;Movie Series Name&lt;/h5&gt;
      &lt;p class="card-text"&gt;Write why you love this movie series.&lt;/p&gt;
      &lt;ul class="list-group list-group-flush"&gt;
        &lt;li class="list-group-item"&gt;&lt;strong&gt;Genre:&lt;/strong&gt; Adventure&lt;/li&gt;
        &lt;li class="list-group-item"&gt;&lt;strong&gt;My Rating:&lt;/strong&gt; 5 stars&lt;/li&gt;
      &lt;/ul&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Add the Quote Card</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4</div>
            <div class="step-status step-status--pending" data-movie-status="second-card" aria-label="Quote card not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the first column closing tag:</strong> it is right after the first card.</p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-6 mb-4"&gt;
  &lt;div class="card h-100"&gt;
    &lt;div class="card-body"&gt;
      &lt;h5 class="card-title"&gt;Why I Love It&lt;/h5&gt;
      &lt;p class="card-text"&gt;Write more about your favorite characters or scenes.&lt;/p&gt;
      &lt;blockquote class="blockquote mt-3"&gt;
        &lt;p class="mb-2"&gt;"Add a favorite quote here!"&lt;/p&gt;
        &lt;footer class="blockquote-footer"&gt;Character Name&lt;/footer&gt;
      &lt;/blockquote&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 5</div>
        <h3>Close the Movies Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">5</div>
            <div class="step-status step-status--pending" data-movie-status="close" aria-label="Movies closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the quote card closing tag:</strong> it is the last <code>&lt;/div&gt;</code> from Step 4.</p>
          <p><strong>Paste these lines below it:</strong></p>
          <div class="code-block">
            <code>  &lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your Movies section should appear before the footer.
        </div>
      </section>
    `
  },
  layoutQuickFacts: {
    title: 'Advanced Layout: Quick Facts',
    content: `
      <h2>Words You Need for This Lesson</h2>
      <div class="concept-strip">
        <div><strong>id="quickfacts"</strong><span>Names this section.</span></div>
        <div><strong>col-md-3</strong><span>Makes four equal columns.</span></div>
        <div><strong>border-*</strong><span>Adds a colored border.</span></div>
        <div><strong>h-100</strong><span>Makes cards the same height.</span></div>
        <div><strong>text-center</strong><span>Centers each fact.</span></div>
      </div>

      <section class="student-step">
        <div class="step-label">Step 1</div>
        <h3>Start the Quick Facts Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">1</div>
            <div class="step-status step-status--pending" data-facts-status="section" aria-label="Quick facts section not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find your footer opening tag:</strong> it starts with <code>&lt;footer</code>.</p>
          <p><strong>Paste this above it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="container my-5" id="quickfacts"&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 2</div>
        <h3>Add the Heading and Row</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">2</div>
            <div class="step-status step-status--pending" data-facts-status="heading" aria-label="Quick facts heading not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="container my-5" id="quickfacts"&gt;</code></p>
          <p><strong>Paste this below it:</strong></p>
          <div class="code-block">
            <code>&lt;h2 class="text-center mb-4"&gt;Quick Facts About Me&lt;/h2&gt;
  &lt;div class="row"&gt;</code>
          </div>
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 3</div>
        <h3>Add Four Fact Cards</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">3</div>
            <div class="step-status step-status--pending" data-facts-status="cards" aria-label="Quick facts cards not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find this line:</strong> <code>&lt;div class="row"&gt;</code></p>
          <p><strong>Paste these four columns below it:</strong></p>
          <div class="code-block">
            <code>&lt;div class="col-md-3 text-center mb-3"&gt;
  &lt;div class="card border-primary h-100"&gt;
    &lt;div class="card-body"&gt;
      &lt;h3 class="text-primary"&gt;School&lt;/h3&gt;
      &lt;p&gt;Write one fact.&lt;/p&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;
&lt;div class="col-md-3 text-center mb-3"&gt;
  &lt;div class="card border-success h-100"&gt;
    &lt;div class="card-body"&gt;
      &lt;h3 class="text-success"&gt;Goal&lt;/h3&gt;
      &lt;p&gt;Write one goal.&lt;/p&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;
&lt;div class="col-md-3 text-center mb-3"&gt;
  &lt;div class="card border-warning h-100"&gt;
    &lt;div class="card-body"&gt;
      &lt;h3 class="text-warning"&gt;Skill&lt;/h3&gt;
      &lt;p&gt;Write one skill.&lt;/p&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;
&lt;div class="col-md-3 text-center mb-3"&gt;
  &lt;div class="card border-info h-100"&gt;
    &lt;div class="card-body"&gt;
      &lt;h3 class="text-info"&gt;Fun Fact&lt;/h3&gt;
      &lt;p&gt;Write one fun fact.&lt;/p&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
        <div class="next-lesson-note">
          <strong>Want different border colors?</strong> Try <code>border-danger</code>, <code>border-dark</code>, or
          <a href="https://getbootstrap.com/docs/5.3/utilities/borders/#color" target="_blank" rel="noopener">more Bootstrap border colors</a>.
        </div>
      </section>

      <div class="step-arrow" aria-hidden="true">↓</div>

      <section class="student-step">
        <div class="step-label">Step 4</div>
        <h3>Close the Quick Facts Section</h3>
        <div class="micro-step">
          <div class="micro-step-header">
            <div class="micro-step-label">4</div>
            <div class="step-status step-status--pending" data-facts-status="close" aria-label="Quick facts closing tags not done yet" title="Not done yet">✓</div>
          </div>
          <p><strong>Find the last fact card closing tag.</strong></p>
          <p><strong>Paste these lines below it:</strong></p>
          <div class="code-block">
            <code>  &lt;/div&gt;
&lt;/div&gt;</code>
          </div>
        </div>
        <div class="step-check">
          <strong>Check it:</strong> Click <strong>Refresh</strong>. Your Quick Facts section should appear before the footer.
        </div>
      </section>

      <div class="alert alert-success mt-4">
        <strong>Final check:</strong> Visit the Simulator, refresh the preview, then use <strong>Export Project</strong>.
      </div>
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
        <code>&lt;div class="bg-primary text-white text-center m-3"&gt;
  &lt;div class="container"&gt;
    &lt;h1 class="display-3"&gt;Welcome to My Website&lt;/h1&gt;
    &lt;p class="lead"&gt;Learn about me, my interests, and what I love!&lt;/p&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Change the heading and supporting text so it sounds like your own site.</p>
      <p><strong>Why:</strong> This combines headings and Bootstrap text classes to create a strong first section.</p>

      <h2>📋 Step 5: Add an Interests Grid</h2>
      <p><strong>What to do:</strong> Add a three-column section under the hero, above the Bootstrap <code>&lt;script&gt;</code> line.</p>
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
        &lt;li class="nav-item"&gt;
          &lt;a class="nav-link" href="#quickfacts"&gt;Quick Facts&lt;/a&gt;
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
  &lt;img src="assets/cat-example-main.jpg" alt="My site logo" width="40" height="40" class="rounded-circle" style="object-fit: cover;"&gt;
&lt;/a&gt;</code>
      </div>
      <p><strong>Why:</strong> Images make the page feel more personal, and they also give the navbar a clear visual brand. <code>img-fluid</code> keeps the biography image responsive, while <code>rounded-circle</code> creates a clean logo style in the navbar.</p>
      
      <h2>📋 Step 10: Add the Footer</h2>
      <p><strong>What to do:</strong> Add this footer near the bottom of the page, above the Bootstrap <code>&lt;script&gt;</code> line.</p>
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
          &lt;blockquote class="blockquote mt-3"&gt;
            &lt;p class="mb-2"&gt;"Add a favorite quote from the movie here!"&lt;/p&gt;
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
      &lt;img src="assets/cat-example-main.jpg" class="img-fluid rounded-circle mb-3" alt="Album art or podcast cover" style="width: 220px; height: 220px; object-fit: cover;"&gt;
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
      <p>You've built a complete, professional-looking website! Use the <strong>Export Project</strong> button in the Simulator to download your zip file.</p>
      
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
  params.set('clothesColor', state.clothingColor.replace('#', ''));
  params.set('backgroundColor', state.backgroundColor.replace('#', ''));

  if (state.accessories) {
    params.set('accessories', state.accessories);
    params.set('accessoriesProbability', '100');
  } else {
    params.set('accessoriesProbability', '0');
  }

  if (state.facialHair) {
    params.set('facialHair', state.facialHair);
    params.set('facialHairProbability', '100');
  } else {
    params.set('facialHairProbability', '0');
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
  <img src="${avatarUrl}" alt="My site logo" width="40" height="40" class="rounded-circle" style="object-fit: cover;">
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
          <button type="button" class="btn-primary btn-small" data-avatar-action="download-svg">Download SVG</button>
        </div>

        <input type="hidden" data-avatar-output="url">
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
    const seed = mount.querySelector('[name="seed"]')?.value.trim() || defaultAvatarBuilderState.seed;

    if (action === 'download-svg') {
      await downloadAvatarSvg(url, `${seed.replace(/\s+/g, '-').toLowerCase() || 'student-avatar'}.svg`);
    }
  });

  updateAvatarBuilderPreview(mount);
}

// Progress tracking
const progressSections = [
  'structure',
  'hero',
  'biography',
  'navbar',
  'footer',
  'movies',
  'music',
  'quickfacts'
];

function lessonStatusComplete(status, keys) {
  return keys.every(key => Boolean(status[key]));
}

function isSectionComplete(section, html) {
  switch (section) {
    case 'structure': {
      const starter = getStarterSetupStatus(html);
      const bootstrap = getBootstrapSetupStatus(html);
      const container = getContainerSetupStatus(html);
      return starter.complete && bootstrap.ready && container.openCorrect && container.closeCorrect;
    }
    case 'hero':
      return lessonStatusComplete(getHeadingLessonStatus(html), [
        'heroOpenCorrect',
        'heroCloseCorrect',
        'heightCorrect',
        'centerCorrect',
        'displayCorrect',
        'leadCorrect'
      ]);
    case 'biography':
      return lessonStatusComplete(getParagraphsLessonStatus(html), [
        'sectionCorrect',
        'rowCorrect',
        'columnCorrect',
        'cardCorrect',
        'bodyCorrect',
        'titleCorrect',
        'closeCorrect'
      ]) && getParagraphsLessonStatus(html).paragraphCount >= 2;
    case 'navbar':
      return lessonStatusComplete(getNavbarLessonStatus(html), [
        'startCorrect',
        'brandCorrect',
        'togglerCorrect',
        'collapseCorrect',
        'linksCorrect',
        'closeCorrect'
      ]);
    case 'footer':
      return lessonStatusComplete(getLinksLessonStatus(html), [
        'footerCorrect',
        'infoCorrect',
        'buttonsCorrect',
        'closeCorrect'
      ]);
    case 'movies':
      return lessonStatusComplete(getMoviesLessonStatus(html), [
        'sectionCorrect',
        'headingCorrect',
        'firstCardCorrect',
        'secondCardCorrect',
        'closeCorrect'
      ]);
    case 'music':
      return lessonStatusComplete(getMusicLessonStatus(html), [
        'sectionCorrect',
        'imageCorrect',
        'textCorrect',
        'accordionCorrect',
        'closeCorrect'
      ]);
    case 'quickfacts':
      return lessonStatusComplete(getQuickFactsLessonStatus(html), [
        'sectionCorrect',
        'headingCorrect',
        'cardsCorrect',
        'closeCorrect'
      ]);
    default:
      return false;
  }
};

function updateProgressFromHtml(html = htmlEditor?.getValue?.() || '') {
  progressSections.forEach(section => {
    const checkbox = document.querySelector(`input[data-section="${section}"]`);
    if (!checkbox) {
      return;
    }

    const complete = isSectionComplete(section, html);
    checkbox.checked = complete;
    localStorage.setItem(`progress_${section}`, complete ? 'true' : 'false');
  });
}

function updateProgress() {
  updateProgressFromHtml();
}

function loadProgress() {
  progressSections.forEach(section => {
    const checkbox = document.querySelector(`input[data-section="${section}"]`);
    if (checkbox) {
      checkbox.checked = localStorage.getItem(`progress_${section}`) === 'true';
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

function getLessonTitle(lessonId) {
  return lessons[lessonId]?.title ||
    lessonNavItems.find(item => item.getAttribute('data-lesson') === lessonId)?.textContent.trim() ||
    'Next lesson';
}

function getNextLessonId(lessonId) {
  const currentIndex = lessonNavItems.findIndex(item => item.getAttribute('data-lesson') === lessonId);
  const nextItem = currentIndex !== -1 ? lessonNavItems[currentIndex + 1] : null;
  return nextItem?.getAttribute('data-lesson') || null;
}

function getLessonFooter(lessonId) {
  const nextLessonId = getNextLessonId(lessonId);

  if (!nextLessonId) {
    return `
      <div class="lesson-next">
        <div>
          <strong>All done</strong>
          <span>You reached the end of the lessons.</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="lesson-next">
      <div>
        <strong>Next section</strong>
        <span>${getLessonTitle(nextLessonId)}</span>
      </div>
      <button class="lesson-next-button" type="button" data-next-lesson="${nextLessonId}">
        Next
      </button>
    </div>
  `;
}

function scrollLessonToTop() {
  const lessonContent = document.querySelector('.lesson-content');
  const navHeight = document.querySelector('.main-tabs')?.offsetHeight || 0;
  const navOffset = 24;
  const targetY = lessonContent
    ? Math.max(0, lessonContent.getBoundingClientRect().top + window.scrollY - navHeight - navOffset)
    : 0;

  window.scrollTo({ top: targetY, behavior: 'smooth' });
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

  lessonDisplay.innerHTML = `
    <div class="lesson-section">
      ${lesson.content}
      ${getLessonFooter(lessonId)}
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
    updateCardsLessonStatus();
    updateParagraphsLessonStatus();
    updateNavbarLessonStatus();
    updateImagesLessonStatus();
    updateLinksLessonStatus();
    updateMoviesLessonStatus();
    updateMusicLessonStatus();
    updateQuickFactsLessonStatus();
    updateProgressFromHtml();
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

lessonDisplay?.addEventListener('click', (e) => {
  const nextButton = e.target.closest('[data-next-lesson]');
  if (!nextButton) {
    return;
  }

  const nextLessonId = nextButton.getAttribute('data-next-lesson');
  if (renderLesson(nextLessonId)) {
    scrollLessonToTop();
  }
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
const formatCodeBtn = document.getElementById('formatCodeBtn');
const assetUploadBtn = document.getElementById('assetUploadBtn');
const assetUploadInput = document.getElementById('assetUploadInput');
const assetShelf = document.getElementById('assetShelf');
const previewToggleBtn = document.getElementById('previewToggleBtn');
const exportDialog = document.getElementById('exportDialog');
const exportForm = document.getElementById('exportForm');
const exportFirstName = document.getElementById('exportFirstName');
const exportLastName = document.getElementById('exportLastName');
const exportGrade = document.getElementById('exportGrade');
const exportDate = document.getElementById('exportDate');
const exportAssignment = document.getElementById('exportAssignment');
const exportFilenamePreview = document.getElementById('exportFilenamePreview');
const exportCancelBtn = document.getElementById('exportCancelBtn');
const exportCancelIconBtn = document.getElementById('exportCancelIconBtn');
const exportSubmitBtn = document.getElementById('exportSubmitBtn');
const ASSET_STORAGE_KEY = `${SIMULATOR_NAME}_assets`;
let simulatedAssets = [];
let currentPreviewUrl = null;

function setActionButtonLabel(button, label) {
  if (!button) return;

  const labelElement = button.querySelector('.action-button__label');
  if (labelElement) {
    labelElement.textContent = label;
  } else {
    button.textContent = label;
  }
}

function getActionButtonLabel(button) {
  return button?.querySelector('.action-button__label')?.textContent || button?.textContent || '';
}

function closeActionMenus(exceptMenu = null) {
  document.querySelectorAll('[data-action-menu].is-open').forEach((menu) => {
    if (menu === exceptMenu) return;

    menu.classList.remove('is-open');
    menu.querySelector('[data-action-menu-trigger]')?.setAttribute('aria-expanded', 'false');
  });
}

document.querySelectorAll('[data-action-menu-trigger]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const menu = trigger.closest('[data-action-menu]');
    if (!menu) return;

    const isOpen = menu.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
    closeActionMenus(isOpen ? menu : null);

    if (isOpen) {
      menu.querySelector('[data-action-menu-list] button')?.focus({ preventScroll: true });
    }
  });
});

document.querySelectorAll('[data-action-menu-list] button').forEach((button) => {
  button.addEventListener('click', () => {
    closeActionMenus();
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-action-menu]')) {
    closeActionMenus();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeActionMenus();
  }
});

function sanitizeAssetName(name) {
  const fallback = 'uploaded-image';
  const safeName = (name || fallback)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/^-+|-+$/g, '');

  return safeName || fallback;
}

function getUniqueAssetPath(name) {
  const safeName = sanitizeAssetName(name);
  const dotIndex = safeName.lastIndexOf('.');
  const base = dotIndex > 0 ? safeName.slice(0, dotIndex) : safeName;
  const extension = dotIndex > 0 ? safeName.slice(dotIndex) : '';
  let candidate = `assets/${safeName}`;
  let count = 2;

  while (simulatedAssets.some(asset => asset.path === candidate)) {
    candidate = `assets/${base}-${count}${extension}`;
    count += 1;
  }

  return candidate;
}

function saveSimulatedAssets() {
  try {
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(simulatedAssets));
  } catch (error) {
    console.warn('Could not save uploaded assets:', error);
    showNotification('Image saved for this session', 'The browser storage is full, so it may not stay after refresh.', 'warning');
  }
}

function loadSimulatedAssets() {
  try {
    const saved = JSON.parse(localStorage.getItem(ASSET_STORAGE_KEY) || '[]');
    simulatedAssets = Array.isArray(saved)
      ? saved.filter(asset => asset && asset.path && asset.dataUrl)
      : [];
  } catch (error) {
    simulatedAssets = [];
  }
}

function renderAssetShelf() {
  if (!assetShelf) {
    return;
  }

  assetShelf.classList.toggle('asset-shelf--visible', simulatedAssets.length > 0);
  assetShelf.innerHTML = simulatedAssets.length
    ? '<strong>assets/</strong>'
    : '';

  simulatedAssets.forEach(asset => {
    const button = document.createElement('button');
    button.className = 'asset-pill';
    button.type = 'button';
    button.textContent = asset.path;
    button.title = 'Copy image path';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(asset.path);
        showNotification('Image path copied', asset.path, 'success');
      } catch (error) {
        showNotification('Image path', asset.path, 'info');
      }
    });
    assetShelf.appendChild(button);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function resolveSimulatedAssets(html) {
  const assetMap = new Map(simulatedAssets.map(asset => [asset.path, asset.dataUrl]));
  return html.replace(/\bsrc=(["'])(assets\/[^"']+)\1/gi, (match, quote, path) => {
    const dataUrl = assetMap.get(path);
    const resolvedPath = dataUrl || new URL(path, window.location.href).href;
    return `src=${quote}${resolvedPath}${quote}`;
  });
}

function isSvgDataUrl(dataUrl) {
  return /^data:image\/svg\+xml/i.test(dataUrl || '');
}

function rasterizeSvgDataUrl(dataUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth || image.width || 512;
      const height = image.naturalHeight || image.height || 512;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = width;
      canvas.height = height;

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

async function resolveSimulatedAssetsForImageExport(html) {
  const assetEntries = await Promise.all(simulatedAssets.map(async (asset) => {
    const dataUrl = isSvgDataUrl(asset.dataUrl)
      ? await rasterizeSvgDataUrl(asset.dataUrl)
      : asset.dataUrl;

    return [asset.path, dataUrl];
  }));
  const assetMap = new Map(assetEntries);

  return html.replace(/\bsrc=(["'])(assets\/[^"']+)\1/gi, (match, quote, path) => {
    const dataUrl = assetMap.get(path);
    const resolvedPath = dataUrl || new URL(path, window.location.href).href;
    return `src=${quote}${resolvedPath}${quote}`;
  });
}

async function waitForRenderedImages(root) {
  const images = Array.from(root.querySelectorAll('img'));

  await Promise.all(images.map(image => {
    if (image.complete && image.naturalWidth > 0) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
      setTimeout(resolve, 1500);
    });
  }));
}

function getRenderedDocumentHeight(doc) {
  const body = doc.body;
  const html = doc.documentElement;

  if (!body) {
    return Math.max(html?.scrollHeight || 0, 1);
  }

  const bodyStyles = doc.defaultView?.getComputedStyle(body);
  const bodyPaddingTop = parseFloat(bodyStyles?.paddingTop || '0') || 0;
  const bodyPaddingBottom = parseFloat(bodyStyles?.paddingBottom || '0') || 0;
  let contentBottom = bodyPaddingTop + bodyPaddingBottom;

  Array.from(body.children).forEach((element) => {
    const rect = element.getBoundingClientRect();
    const elementStyles = doc.defaultView?.getComputedStyle(element);
    const marginBottom = parseFloat(elementStyles?.marginBottom || '0') || 0;

    contentBottom = Math.max(contentBottom, rect.bottom + marginBottom + bodyPaddingBottom);
  });

  if (body.children.length) {
    return Math.max(Math.ceil(contentBottom), 1);
  }

  return Math.max(body.scrollHeight || body.offsetHeight || html?.scrollHeight || 1, 1);
}

function getRenderedDocumentWidth(doc) {
  const body = doc.body;
  const html = doc.documentElement;

  return Math.max(
    body?.scrollWidth || 0,
    body?.offsetWidth || 0,
    html?.scrollWidth || 0,
    html?.offsetWidth || 0,
    1
  );
}

async function resizePreviewFrameToContent() {
  if (!previewFrame?.contentDocument) {
    return;
  }

  const iframeDoc = previewFrame.contentDocument;
  previewFrame.style.height = '1px';
  await waitForRenderedImages(iframeDoc);
  if (iframeDoc.fonts?.ready) {
    await iframeDoc.fonts.ready.catch(() => {});
  }

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  previewFrame.style.height = `${Math.ceil(getRenderedDocumentHeight(iframeDoc))}px`;
}

async function handleAssetUpload(files) {
  const imageFiles = Array.from(files || []).filter(file => file.type.startsWith('image/'));

  if (!imageFiles.length) {
    showNotification('No image selected', 'Choose a JPG, PNG, GIF, SVG, or WebP file.', 'warning');
    return;
  }

  for (const file of imageFiles) {
    const path = getUniqueAssetPath(file.name);
    const dataUrl = await readFileAsDataUrl(file);
    simulatedAssets.push({
      path,
      dataUrl,
      type: file.type,
      name: file.name
    });
  }

  saveSimulatedAssets();
  renderAssetShelf();
  updatePreview();
  showNotification('Image uploaded', `Use ${simulatedAssets[simulatedAssets.length - 1].path} in an img src.`, 'success');
}

loadSimulatedAssets();
renderAssetShelf();

if (typeof CodeMirror !== 'undefined') {
  const foldGutterAvailable = Boolean(CodeMirror.fold && CodeMirror.fold.auto);
  const codeMirrorEditor = CodeMirror.fromTextArea(htmlEditorElement, {
    mode: 'htmlmixed',
    theme: 'monokai',
    lineNumbers: true,
    lineWrapping: false,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    foldGutter: foldGutterAvailable,
    gutters: foldGutterAvailable
      ? ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
      : ['CodeMirror-linenumbers']
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

function tagHasClassPrefix(tag, prefix) {
  const classMatch = /\bclass\s*=\s*["']([^"']*)["']/i.exec(tag);
  return Boolean(classMatch && classMatch[1].split(/\s+/).some(className => className.startsWith(prefix)));
}

function tagHasAnyClassPrefix(tag, prefixes) {
  return prefixes.some(prefix => tagHasClassPrefix(tag, prefix));
}

function tagHasClassPattern(tag, pattern) {
  const classMatch = /\bclass\s*=\s*["']([^"']*)["']/i.exec(tag);
  return Boolean(classMatch && classMatch[1].split(/\s+/).some(className => pattern.test(className)));
}

function tagHasCardVisualStyle(tag) {
  return tagHasClass(tag, 'border') || tagHasAnyClassPrefix(tag, ['border-', 'bg-']);
}

function tagHasTextColorClass(tag) {
  return tagHasClassPattern(tag, /^text-(primary|secondary|success|danger|warning|info|light|dark|white|body|muted|black|black-50|white-50)$/);
}

function tagHasStyleProperty(tag, propertyName) {
  const styleMatch = /\bstyle\s*=\s*["']([^"']*)["']/i.exec(tag);
  const propertyPattern = new RegExp(`(^|;)\\s*${propertyName}\\s*:`, 'i');
  return Boolean(styleMatch && propertyPattern.test(styleMatch[1]));
}

function tagHasAttribute(tag, attributeName) {
  const attributePattern = new RegExp(`\\b${attributeName}\\s*=`, 'i');
  return attributePattern.test(tag);
}

function tagHasHeroFlexCentering(tag) {
  return tagHasClasses(tag, ['d-flex', 'align-items-center', 'justify-content-center', 'flex-column']);
}

function getHeadingLessonStatus(html) {
  const containerMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcontainer\b[^"']*["'][^>]*>/gi));
  const heroOpenMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*["'][^>]*>/gi))
    .filter(match => tagHasClassPrefix(match[0], 'bg-') && tagHasTextColorClass(match[0]));
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

  const displayHeading = headingAfterHero && tagHasClassPattern(headingAfterHero[0], /^display-[1-6]$/);
  const leadParagraph = paragraphAfterHeading && tagHasClass(paragraphAfterHeading[0], 'lead');

  return {
    heroOpenFound: heroOpenMatches.length > 0,
    heroOpenCorrect: Boolean(heroOpen && containerBeforeHero && tagHasClassPattern(heroOpen[0], /^m[xysebt]?-[0-5]$/)),
    heroCloseFound: closesAfterParagraph.length > 1,
    heroCloseCorrect: Boolean(heroOpen && closesAfterParagraph.length > 1),
    heightFound: Array.from(html.matchAll(/<div\b[^>]*style=["'][^"']*min-height\s*:[^"']*["'][^>]*>/gi)).length > 0,
    heightCorrect: Boolean(heroOpen && tagHasStyleProperty(heroOpen[0], 'min-height')),
    centerFound: Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*d-flex[^"']*["'][^>]*>/gi)).some(match => tagHasHeroFlexCentering(match[0])),
    centerCorrect: Boolean(heroOpen && tagHasHeroFlexCentering(heroOpen[0])),
    displayFound: headingMatches.some(match => tagHasClassPattern(match[0], /^display-[1-6]$/)),
    displayCorrect: Boolean(displayHeading),
    leadFound: paragraphMatches.some(match => tagHasClass(match[0], 'lead')),
    leadCorrect: Boolean(leadParagraph)
  };
}

function getLayoutBasicsStatus(html) {
  const sectionMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*["'][^>]*>/gi))
    .filter(match => tagHasClass(match[0], 'container') && tagHasClassPattern(match[0], /^mt-[0-5]$/));
  const headingMatches = Array.from(html.matchAll(/<h2\b[^>]*>[\s\S]*?<\/h2>/gi));
  const rowMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\brow\b[^"']*["'][^>]*>/gi));
  const columnMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcol-md-4\b[^"']*["'][^>]*>/gi));
  const closeMatches = Array.from(html.matchAll(/<\/div>/gi));

  const bootstrapScriptIndex = findBootstrapJsScript(html);
  const section = sectionMatches[0];
  const sectionIndex = section?.index ?? -1;
  const sectionBeforeScript = sectionIndex !== -1 && (bootstrapScriptIndex === -1 || sectionIndex < bootstrapScriptIndex);
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
    sectionCorrect: Boolean(section && sectionBeforeScript),
    headingFound: headingMatches.length > 0,
    headingCorrect: Boolean(sectionBeforeScript && headingAfterSection),
    rowFound: rowMatches.length > 0,
    rowCorrect: Boolean(sectionBeforeScript && rowAfterHeading),
    columnCount: columnsAfterRow.length,
    closeFound: closesAfterRow.length > 3,
    closeCorrect: Boolean(sectionBeforeScript && rowAfterHeading && columnsAfterRow.length >= 3 && closesAfterRow.length >= 5)
  };
}

function getCardsLessonStatus(html) {
  const columnMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcol-md-4\b[^"']*["'][^>]*>/gi));
  const cardMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcard\b[^"']*["'][^>]*>/gi));
  const bodyMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcard-body\b[^"']*["'][^>]*>/gi));
  const titleMatches = Array.from(html.matchAll(/<h[1-6]\b[^>]*class=["'][^"']*\bcard-title\b[^"']*["'][^>]*>[\s\S]*?<\/h[1-6]>/gi));
  const textMatches = Array.from(html.matchAll(/<p\b[^>]*class=["'][^"']*\bcard-text\b[^"']*["'][^>]*>[\s\S]*?<\/p>/gi));
  const closeMatches = Array.from(html.matchAll(/<\/div>/gi));

  const columnsWithSpacing = columnMatches.filter(match => tagHasClass(match[0], 'col-md-4') && tagHasClassPattern(match[0], /^mb-[0-5]$/));
  const equalHeightCards = cardMatches.filter(match => tagHasClasses(match[0], ['card', 'h-100']));
  const styledCards = equalHeightCards.filter(match => tagHasCardVisualStyle(match[0]));
  const firstCardIndex = equalHeightCards[0]?.index ?? -1;
  const closesAfterFirstCard = firstCardIndex !== -1
    ? closeMatches.filter(match => match.index > firstCardIndex)
    : [];

  return {
    columnCount: columnsWithSpacing.length,
    cardCount: equalHeightCards.length,
    cardCloseFound: closesAfterFirstCard.length >= 7,
    bodyCount: bodyMatches.length,
    bodyCloseFound: closesAfterFirstCard.length >= 10,
    titleCount: titleMatches.length,
    textCount: textMatches.length,
    firstCardStyled: Boolean(equalHeightCards[0] && tagHasCardVisualStyle(equalHeightCards[0][0])),
    secondCardStyled: Boolean(equalHeightCards[1] && tagHasCardVisualStyle(equalHeightCards[1][0])),
    thirdCardStyled: Boolean(equalHeightCards[2] && tagHasCardVisualStyle(equalHeightCards[2][0])),
    styledCardCount: styledCards.length
  };
}

function getParagraphsLessonStatus(html) {
  const sectionMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*["'][^>]*id=["']about["'][^>]*>|<div\b[^>]*id=["']about["'][^>]*class=["'][^"']*["'][^>]*>/gi))
    .filter(match => tagHasClasses(match[0], ['container', 'mt-5']));
  const rowMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\brow\b[^"']*["'][^>]*>/gi));
  const columnMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*["'][^>]*>/gi))
    .filter(match => tagHasClasses(match[0], ['col-md-8', 'mx-auto']));
  const cardMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcard\b[^"']*["'][^>]*>/gi));
  const bodyMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcard-body\b[^"']*["'][^>]*>/gi));
  const titleMatches = Array.from(html.matchAll(/<h2\b[^>]*class=["'][^"']*\bcard-title\b[^"']*["'][^>]*>[\s\S]*?<\/h2>/gi));
  const textMatches = Array.from(html.matchAll(/<p\b[^>]*class=["'][^"']*\bcard-text\b[^"']*["'][^>]*>[\s\S]*?<\/p>/gi));
  const closeMatches = Array.from(html.matchAll(/<\/div>/gi));

  const bootstrapScriptIndex = findBootstrapJsScript(html);
  const section = sectionMatches[0];
  const sectionIndex = section?.index ?? -1;
  const sectionBeforeScript = sectionIndex !== -1 && (bootstrapScriptIndex === -1 || sectionIndex < bootstrapScriptIndex);
  const rowAfterSection = sectionIndex !== -1
    ? rowMatches.find(match => match.index > sectionIndex)
    : rowMatches[0];
  const rowIndex = rowAfterSection?.index ?? -1;
  const columnAfterRow = rowIndex !== -1
    ? columnMatches.find(match => match.index > rowIndex)
    : columnMatches[0];
  const columnIndex = columnAfterRow?.index ?? -1;
  const cardAfterColumn = columnIndex !== -1
    ? cardMatches.find(match => match.index > columnIndex)
    : cardMatches[0];
  const cardIndex = cardAfterColumn?.index ?? -1;
  const bodyAfterCard = cardIndex !== -1
    ? bodyMatches.find(match => match.index > cardIndex)
    : bodyMatches[0];
  const bodyIndex = bodyAfterCard?.index ?? -1;
  const titleAfterBody = bodyIndex !== -1
    ? titleMatches.find(match => match.index > bodyIndex)
    : titleMatches[0];
  const titleIndex = titleAfterBody?.index ?? -1;
  const textsAfterTitle = titleIndex !== -1
    ? textMatches.filter(match => match.index > titleIndex)
    : textMatches;
  const closesAfterBody = bodyIndex !== -1
    ? closeMatches.filter(match => match.index > bodyIndex)
    : [];

  return {
    sectionFound: sectionMatches.length > 0,
    sectionCorrect: Boolean(section && sectionBeforeScript),
    rowFound: rowMatches.length > 0,
    rowCorrect: Boolean(sectionBeforeScript && rowAfterSection),
    columnFound: columnMatches.length > 0,
    columnCorrect: Boolean(sectionBeforeScript && columnAfterRow),
    cardFound: cardMatches.length > 0,
    cardCorrect: Boolean(sectionBeforeScript && cardAfterColumn),
    bodyFound: bodyMatches.length > 0,
    bodyCorrect: Boolean(sectionBeforeScript && bodyAfterCard),
    titleFound: titleMatches.length > 0,
    titleCorrect: Boolean(sectionBeforeScript && titleAfterBody),
    paragraphCount: textsAfterTitle.length,
    closeFound: closesAfterBody.length > 0,
    closeCorrect: Boolean(sectionBeforeScript && bodyAfterCard && textsAfterTitle.length >= 2 && closesAfterBody.length >= 5)
  };
}

function getNavbarLessonStatus(html) {
  const bodyOpenMatch = /<body\b[^>]*>/i.exec(html);
  const bodyOpenEnd = bodyOpenMatch ? bodyOpenMatch.index + bodyOpenMatch[0].length : -1;
  const navMatches = Array.from(html.matchAll(/<nav\b[^>]*class=["'][^"']*\bnavbar\b[^"']*["'][^>]*>/gi));
  const heroMatch = /<div\b[^>]*class=["'][^"']*\bbg-[^"']*["'][^>]*>[\s\S]*?<h1\b/i.exec(html);
  const brandMatches = Array.from(html.matchAll(/<a\b[^>]*class=["'][^"']*\bnavbar-brand\b[^"']*["'][^>]*>[\s\S]*?<\/a>/gi));
  const togglerMatches = Array.from(html.matchAll(/<button\b[^>]*class=["'][^"']*\bnavbar-toggler\b[^"']*["'][^>]*>[\s\S]*?<\/button>/gi));
  const collapseMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcollapse\b[^"']*\bnavbar-collapse\b[^"']*["'][^>]*id=["']navbarNav["'][^>]*>|<div\b[^>]*id=["']navbarNav["'][^>]*class=["'][^"']*\bcollapse\b[^"']*\bnavbar-collapse\b[^"']*["'][^>]*>/gi));
  const listMatches = Array.from(html.matchAll(/<ul\b[^>]*class=["'][^"']*\bnavbar-nav\b[^"']*["'][^>]*>/gi));
  const navCloseMatches = Array.from(html.matchAll(/<\/nav>/gi));
  const linkMatches = Array.from(html.matchAll(/<a\b[^>]*class=["'][^"']*\bnav-link\b[^"']*["'][^>]*href=["']([^"']*)["'][^>]*>[\s\S]*?<\/a>/gi));

  const nav = navMatches[0];
  const navIndex = nav?.index ?? -1;
  const heroIndex = heroMatch?.index ?? -1;
  const brand = brandMatches.find(match => navIndex !== -1 && match.index > navIndex) || brandMatches[0];
  const brandIndex = brand?.index ?? -1;
  const toggler = togglerMatches.find(match => brandIndex !== -1 && match.index > brandIndex) || togglerMatches[0];
  const togglerIndex = toggler?.index ?? -1;
  const collapse = collapseMatches.find(match => togglerIndex !== -1 && match.index > togglerIndex) || collapseMatches[0];
  const collapseIndex = collapse?.index ?? -1;
  const list = listMatches.find(match => collapseIndex !== -1 && match.index > collapseIndex) || listMatches[0];
  const listIndex = list?.index ?? -1;
  const navClose = navCloseMatches.find(match => listIndex !== -1 && match.index > listIndex);
  const linkHrefs = linkMatches
    .filter(match => listIndex === -1 || match.index > listIndex)
    .map(match => match[1]);
  const hasRequiredLinks = ['#', '#about', '#movies', '#music', '#quickfacts'].every(href => linkHrefs.includes(href));

  return {
    startFound: navMatches.length > 0,
    startCorrect: Boolean(nav && bodyOpenEnd !== -1 && navIndex >= bodyOpenEnd && (heroIndex === -1 || navIndex < heroIndex)),
    brandFound: brandMatches.length > 0,
    brandCorrect: Boolean(nav && brand && brandIndex > navIndex),
    togglerFound: togglerMatches.length > 0,
    togglerCorrect: Boolean(brand && toggler && togglerIndex > brandIndex && /data-bs-target\s*=\s*["']#navbarNav["']/i.test(toggler[0])),
    collapseFound: collapseMatches.length > 0,
    collapseCorrect: Boolean(toggler && collapse && collapseIndex > togglerIndex),
    linksFound: linkMatches.length > 0,
    linksCorrect: Boolean(list && hasRequiredLinks),
    closeFound: navCloseMatches.length > 0,
    closeCorrect: Boolean(nav && navClose && hasRequiredLinks)
  };
}

function getImageLessonStatus(html) {
  const aboutSectionMatch = /<div\b[^>]*(?:class=["'][^"']*\bcontainer\b[^"']*["'][^>]*id=["']about["']|id=["']about["'][^>]*class=["'][^"']*\bcontainer\b[^"']*["'])[^>]*>/i.exec(html);
  const cardBodyMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcard-body\b[^"']*["'][^>]*>/gi));
  const titleMatches = Array.from(html.matchAll(/<h2\b[^>]*class=["'][^"']*\bcard-title\b[^"']*["'][^>]*>[\s\S]*?<\/h2>/gi));
  const textMatches = Array.from(html.matchAll(/<p\b[^>]*class=["'][^"']*\bcard-text\b[^"']*["'][^>]*>[\s\S]*?<\/p>/gi));
  const imageMatches = Array.from(html.matchAll(/<img\b[^>]*>/gi));
  const brandMatches = Array.from(html.matchAll(/<a\b[^>]*class=["'][^"']*\bnavbar-brand\b[^"']*["'][^>]*>[\s\S]*?<\/a>/gi));
  const rowMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\brow\b[^"']*["'][^>]*>/gi));
  const imageColumnMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcol-md-4\b[^"']*["'][^>]*>/gi));
  const textColumnMatches = Array.from(html.matchAll(/<div\b[^>]*class=["'][^"']*\bcol-md-8\b[^"']*["'][^>]*>/gi));
  const closeMatches = Array.from(html.matchAll(/<\/div>/gi));

  const aboutIndex = aboutSectionMatch?.index ?? -1;
  const bodyAfterAbout = aboutIndex !== -1
    ? cardBodyMatches.find(match => match.index > aboutIndex)
    : cardBodyMatches[0];
  const bodyIndex = bodyAfterAbout?.index ?? -1;
  const titleAfterBody = bodyIndex !== -1
    ? titleMatches.find(match => match.index > bodyIndex)
    : titleMatches[0];
  const titleIndex = titleAfterBody?.index ?? -1;
  const bioImage = bodyIndex !== -1
    ? imageMatches.find(match => match.index > bodyIndex && (titleIndex === -1 || match.index < titleIndex))
    : imageMatches.find(match => tagHasClass(match[0], 'img-fluid'));
  const rowAfterBody = bodyIndex !== -1
    ? rowMatches.find(match => match.index > bodyIndex)
    : rowMatches[0];
  const rowIndex = rowAfterBody?.index ?? -1;
  const imageColumn = rowIndex !== -1
    ? imageColumnMatches.find(match => match.index > rowIndex && tagHasClass(match[0], 'text-center'))
    : imageColumnMatches.find(match => tagHasClass(match[0], 'text-center'));
  const imageColumnIndex = imageColumn?.index ?? -1;
  const textColumn = bioImage
    ? textColumnMatches.find(match => match.index > bioImage.index && (titleIndex === -1 || match.index < titleIndex))
    : textColumnMatches[0];
  const textColumnIndex = textColumn?.index ?? -1;
  const textParagraphsAfterTitle = titleIndex !== -1
    ? textMatches.filter(match => match.index > titleIndex)
    : textMatches;
  const lastBiographyParagraph = textParagraphsAfterTitle[textParagraphsAfterTitle.length - 1];
  const closesAfterLastParagraph = lastBiographyParagraph
    ? closeMatches.filter(match => match.index > lastBiographyParagraph.index + lastBiographyParagraph[0].length)
    : [];
  const bioImageAnyPosition = bodyIndex !== -1
    ? imageMatches.find(match => match.index > bodyIndex && tagHasClass(match[0], 'img-fluid')) ||
      imageMatches.find(match => match.index > bodyIndex)
    : imageMatches.find(match => tagHasClass(match[0], 'img-fluid'));
  const brandWithImage = brandMatches.find(match => /<img\b/i.test(match[0]));
  const hasAlt = bioImageAnyPosition ? /\balt\s*=\s*["'][^"']+["']/i.test(bioImageAnyPosition[0]) : false;
  const hasResponsiveStyle = bioImageAnyPosition
    ? tagHasClass(bioImageAnyPosition[0], 'img-fluid') && (tagHasClass(bioImageAnyPosition[0], 'rounded') || tagHasClass(bioImageAnyPosition[0], 'rounded-circle') || tagHasClass(bioImageAnyPosition[0], 'img-thumbnail'))
    : false;
  const hasSpacing = bioImageAnyPosition ? tagHasClassPattern(bioImageAnyPosition[0], /^m[btsexy]?-[0-5]$/) : false;
  const hasSizeLimit = bioImageAnyPosition
    ? tagHasStyleProperty(bioImageAnyPosition[0], 'max-width') ||
      tagHasStyleProperty(bioImageAnyPosition[0], 'width') ||
      /\bwidth\s*=\s*["'][^"']+["']/i.test(bioImageAnyPosition[0])
    : false;

  return {
    bioImageFound: imageMatches.some(match => tagHasClass(match[0], 'img-fluid')),
    bioLayoutFound: Boolean(rowAfterBody || imageColumn || textColumn),
    bioLayoutCorrect: Boolean(rowAfterBody && imageColumn && bodyAfterAbout && rowIndex > bodyIndex && imageColumnIndex > rowIndex),
    bioImageCorrect: Boolean(bioImage && imageColumn && bioImage.index > imageColumnIndex),
    bioTextColumnFound: Boolean(textColumn),
    bioTextColumnCorrect: Boolean(textColumn && bioImage && titleAfterBody && textColumnIndex > bioImage.index && textColumnIndex < titleIndex),
    bioRowCloseFound: closesAfterLastParagraph.length > 0,
    bioRowCloseCorrect: Boolean(textColumn && textParagraphsAfterTitle.length >= 2 && closesAfterLastParagraph.length >= 7),
    bioAltFound: imageMatches.some(match => /\balt\s*=\s*["'][^"']+["']/i.test(match[0])),
    bioAltCorrect: Boolean(bioImageAnyPosition && hasAlt),
    bioStyleFound: imageMatches.some(match => tagHasClass(match[0], 'img-fluid') || tagHasClass(match[0], 'rounded') || tagHasClass(match[0], 'rounded-circle') || tagHasClass(match[0], 'img-thumbnail')),
    bioStyleCorrect: Boolean(bioImageAnyPosition && hasResponsiveStyle && hasSpacing && hasSizeLimit),
    navImageFound: Boolean(brandWithImage || imageMatches.some(match => tagHasClass(match[0], 'rounded-circle'))),
    navImageCorrect: Boolean(brandWithImage && /<img\b[^>]*\balt\s*=\s*["'][^"']+["'][^>]*>/i.test(brandWithImage[0]))
  };
}

function getSectionBlock(html, id) {
  const sectionMatch = new RegExp(`<div\\b[^>]*(?:class=["'][^"']*\\bcontainer\\b[^"']*["'][^>]*id=["']${id}["']|id=["']${id}["'][^>]*class=["'][^"']*\\bcontainer\\b[^"']*["'])[^>]*>`, 'i').exec(html);
  if (!sectionMatch) {
    return { match: null, block: '', index: -1 };
  }

  const startIndex = sectionMatch.index;
  const footerIndex = html.slice(startIndex).search(/<footer\b(?![^>]*\bblockquote-footer\b)/i);
  const scriptIndex = html.slice(startIndex).search(/<script\b[^>]*src=["'][^"']*bootstrap[^"']*\.js[^"']*["'][^>]*>/i);
  const nextSectionIndex = html.slice(startIndex + sectionMatch[0].length).search(/<div\b[^>]*id=["'](?:movies|music|quickfacts)["']/i);
  const endCandidates = [footerIndex, scriptIndex]
    .concat(nextSectionIndex === -1 ? [] : [sectionMatch[0].length + nextSectionIndex])
    .filter(index => index > 0);
  const endIndex = endCandidates.length ? startIndex + Math.min(...endCandidates) : html.length;

  return {
    match: sectionMatch,
    block: html.slice(startIndex, endIndex),
    index: startIndex
  };
}

function getLinksLessonStatus(html) {
  const footerMatches = Array.from(html.matchAll(/<footer\b(?![^>]*\bblockquote-footer\b)[^>]*>/gi));
  const bootstrapScriptIndex = findBootstrapJsScript(html);
  const footer = footerMatches[0];
  const footerIndex = footer?.index ?? -1;
  const footerBlock = footerIndex !== -1
    ? html.slice(footerIndex, bootstrapScriptIndex !== -1 && bootstrapScriptIndex > footerIndex ? bootstrapScriptIndex : html.length)
    : '';
  const footerHasLayout = footer && tagHasClassPrefix(footer[0], 'bg-') && tagHasTextColorClass(footer[0]) && tagHasClassPattern(footer[0], /^py-[0-5]$/);
  const infoColumn = /<div\b[^>]*class=["'][^"']*\bcol-md-6\b[^"']*["'][^>]*>[\s\S]*?<h5\b[^>]*>[\s\S]*?<\/h5>[\s\S]*?<p\b[^>]*>[\s\S]*?<\/p>/i.test(footerBlock);
  const mailtoLink = /<a\b[^>]*href=["']mailto:[^"']+["'][^>]*class=["'][^"']*\bbtn\b[^"']*["'][^>]*>/i.test(footerBlock);
  const buttonLinks = Array.from(footerBlock.matchAll(/<a\b[^>]*class=["'][^"']*\bbtn\b[^"']*["'][^>]*>/gi));
  const footerCloseIndex = footerIndex !== -1 ? html.slice(footerIndex).search(/<\/footer>/i) : -1;

  return {
    footerFound: footerMatches.length > 0,
    footerCorrect: Boolean(footerHasLayout && (bootstrapScriptIndex === -1 || footerIndex < bootstrapScriptIndex)),
    infoFound: /<h5\b/i.test(footerBlock) || /<p\b/i.test(footerBlock),
    infoCorrect: Boolean(infoColumn),
    buttonsFound: buttonLinks.length > 0 || /mailto:/i.test(footerBlock),
    buttonsCorrect: Boolean(mailtoLink && buttonLinks.length >= 2),
    closeFound: footerCloseIndex !== -1,
    closeCorrect: Boolean(footer && footerCloseIndex !== -1)
  };
}

function getMoviesLessonStatus(html) {
  const { match, block, index } = getSectionBlock(html, 'movies');
  const footerIndex = html.search(/<footer\b(?![^>]*\bblockquote-footer\b)/i);
  const headingFound = /<h2\b[^>]*>[\s\S]*?<\/h2>/i.test(block);
  const rowFound = /<div\b[^>]*class=["'][^"']*\brow\b[^"']*["'][^>]*>/i.test(block);
  const firstCardCorrect = /<img\b[^>]*class=["'][^"']*\bcard-img-top\b[^"']*["'][^>]*>/i.test(block) &&
    /<ul\b[^>]*class=["'][^"']*\blist-group\b[^"']*["'][^>]*>/i.test(block);
  const secondCardCorrect = /<blockquote\b[^>]*class=["'][^"']*\bblockquote\b[^"']*["'][^>]*>[\s\S]*?<\/blockquote>/i.test(block);
  const colCount = Array.from(block.matchAll(/<div\b[^>]*class=["'][^"']*\bcol-md-6\b[^"']*["'][^>]*>/gi)).length;

  return {
    sectionFound: Boolean(match),
    sectionCorrect: Boolean(match && tagHasClass(match[0], 'container') && tagHasClassPattern(match[0], /^my-[0-5]$/) && (footerIndex === -1 || index < footerIndex)),
    headingFound,
    headingCorrect: Boolean(match && headingFound && rowFound),
    firstCardFound: /card-img-top|list-group/i.test(block),
    firstCardCorrect,
    secondCardFound: /blockquote/i.test(block),
    secondCardCorrect,
    closeFound: colCount > 0,
    closeCorrect: Boolean(match && colCount >= 2 && firstCardCorrect && secondCardCorrect)
  };
}

function getMusicLessonStatus(html) {
  const { match, block, index } = getSectionBlock(html, 'music');
  const footerIndex = html.search(/<footer\b(?![^>]*\bblockquote-footer\b)/i);
  const musicImageMatch = /<div\b[^>]*class=["'][^"']*\bcol-lg-4\b[^"']*["'][^>]*>[\s\S]*?(<img\b[^>]*>)/i.exec(block);
  const musicImageTag = musicImageMatch?.[1] || '';
  const imageHasSquareCrop = (tagHasStyleProperty(musicImageTag, 'width') || tagHasAttribute(musicImageTag, 'width')) &&
    (tagHasStyleProperty(musicImageTag, 'height') || tagHasAttribute(musicImageTag, 'height')) &&
    (tagHasStyleProperty(musicImageTag, 'object-fit') || tagHasClass(musicImageTag, 'object-fit-cover'));
  const imageCorrect = Boolean(
    musicImageTag &&
    tagHasClass(musicImageTag, 'img-fluid') &&
    tagHasClass(musicImageTag, 'rounded-circle') &&
    imageHasSquareCrop
  );
  const textCorrect = /<div\b[^>]*class=["'][^"']*\bcol-lg-8\b[^"']*["'][^>]*>[\s\S]*?<h2\b[^>]*>[\s\S]*?<\/h2>[\s\S]*?<p\b[^>]*class=["'][^"']*\blead\b[^"']*["'][^>]*>/i.test(block);
  const accordionItems = Array.from(block.matchAll(/<div\b[^>]*class=["'][^"']*\baccordion-item\b[^"']*["'][^>]*>/gi));
  const accordionCorrect = /<div\b[^>]*class=["'][^"']*\baccordion\b[^"']*["'][^>]*id=["']musicAccordion["'][^>]*>/i.test(block) &&
    accordionItems.length >= 2 &&
    /data-bs-toggle=["']collapse["']/i.test(block);
  const musicDivOpenCount = (block.match(/<div\b/gi) || []).length;
  const musicDivCloseCount = (block.match(/<\/div>/gi) || []).length;
  const musicDivsBalanced = musicDivOpenCount > 0 && musicDivOpenCount === musicDivCloseCount;

  return {
    sectionFound: Boolean(match),
    sectionCorrect: Boolean(match && tagHasClass(match[0], 'container') && tagHasClassPrefix(match[0], 'bg-') && (footerIndex === -1 || index < footerIndex)),
    imageFound: Boolean(musicImageTag),
    imageCorrect,
    textFound: /<h2\b/i.test(block) || /class=["'][^"']*\blead\b/i.test(block),
    textCorrect,
    accordionFound: /accordion/i.test(block),
    accordionCorrect,
    closeFound: musicDivCloseCount > 0,
    closeCorrect: Boolean(match && imageCorrect && textCorrect && accordionCorrect && musicDivsBalanced)
  };
}

function getQuickFactsLessonStatus(html) {
  const { match, block, index } = getSectionBlock(html, 'quickfacts');
  const footerIndex = html.search(/<footer\b(?![^>]*\bblockquote-footer\b)/i);
  const headingFound = /<h2\b[^>]*>[\s\S]*?<\/h2>/i.test(block);
  const rowFound = /<div\b[^>]*class=["'][^"']*\brow\b[^"']*["'][^>]*>/i.test(block);
  const factColumns = Array.from(block.matchAll(/<div\b[^>]*class=["'][^"']*\bcol-md-3\b[^"']*\btext-center\b[^"']*["'][^>]*>/gi));
  const factCards = Array.from(block.matchAll(/<div\b[^>]*class=["'][^"']*\bcard\b[^"']*\bh-100\b[^"']*["'][^>]*>/gi));
  const styledCards = factCards.filter(card => tagHasCardVisualStyle(card[0]));

  return {
    sectionFound: Boolean(match),
    sectionCorrect: Boolean(match && tagHasClass(match[0], 'container') && (footerIndex === -1 || index < footerIndex)),
    headingFound,
    headingCorrect: Boolean(match && headingFound && rowFound),
    cardsFound: factCards.length > 0,
    cardsCorrect: Boolean(factColumns.length >= 4 && factCards.length >= 4 && styledCards.length >= 4),
    closeFound: factCards.length > 0,
    closeCorrect: Boolean(match && factColumns.length >= 4 && factCards.length >= 4)
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
  const heightState = currentStatus.heightCorrect ? 'success' : currentStatus.heightFound ? 'error' : 'pending';
  const centerState = currentStatus.centerCorrect ? 'success' : currentStatus.centerFound ? 'error' : 'pending';
  const displayState = currentStatus.displayCorrect ? 'success' : currentStatus.displayFound ? 'error' : 'pending';
  const leadState = currentStatus.leadCorrect ? 'success' : currentStatus.leadFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-heading-status="hero-open"]'),
    heroOpenState,
    heroOpenState === 'success'
      ? 'Hero box opening tag is in the correct place'
      : heroOpenState === 'error'
        ? 'Hero box opening tag should go below the container line and include m-* spacing'
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
    document.querySelector('[data-heading-status="height"]'),
    heightState,
    heightState === 'success'
      ? 'Hero height is set on the hero opening tag'
      : heightState === 'error'
        ? 'min-height was added, but it should be on the hero opening tag'
        : 'Hero height not done yet'
  );

  setStepStatus(
    document.querySelector('[data-heading-status="center"]'),
    centerState,
    centerState === 'success'
      ? 'Hero content centering classes are on the hero opening tag'
      : centerState === 'error'
        ? 'Flex centering classes were added, but they should be on the hero opening tag'
        : 'Hero content centering not done yet'
  );

  setStepStatus(
    document.querySelector('[data-heading-status="display"]'),
    displayState,
    displayState === 'success'
      ? 'Heading uses a display size class'
      : displayState === 'error'
        ? 'A display size class was added, but it should be on the main heading'
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
        ? 'Interests section was started, but it should go above the Bootstrap script'
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

function updateCardsLessonStatus(status = null) {
  const currentStatus = status || getCardsLessonStatus(htmlEditor?.getValue?.() || '');
  const columnsState = currentStatus.columnCount >= 3 ? 'success' : currentStatus.columnCount > 0 ? 'error' : 'pending';
  const cardsState = currentStatus.cardCount >= 3 ? 'success' : currentStatus.cardCount > 0 ? 'error' : 'pending';
  const cardClosesState = currentStatus.cardCloseFound ? 'success' : currentStatus.cardCount > 0 ? 'error' : 'pending';
  const bodiesState = currentStatus.bodyCount >= 3 ? 'success' : currentStatus.bodyCount > 0 ? 'error' : 'pending';
  const bodyClosesState = currentStatus.bodyCloseFound ? 'success' : currentStatus.bodyCount > 0 ? 'error' : 'pending';
  const titlesState = currentStatus.titleCount >= 3 ? 'success' : currentStatus.titleCount > 0 ? 'error' : 'pending';
  const textsState = currentStatus.textCount >= 3 ? 'success' : currentStatus.textCount > 0 ? 'error' : 'pending';
  const firstStyleState = currentStatus.firstCardStyled ? 'success' : currentStatus.cardCount >= 1 ? 'error' : 'pending';
  const secondStyleState = currentStatus.secondCardStyled ? 'success' : currentStatus.cardCount >= 2 ? 'error' : 'pending';
  const thirdStyleState = currentStatus.thirdCardStyled ? 'success' : currentStatus.cardCount >= 3 ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-card-status="columns"]'),
    columnsState,
    columnsState === 'success'
      ? 'All three columns have bottom spacing'
      : columnsState === 'error'
        ? 'Add an mb-* spacing class to all three columns'
        : 'Column spacing not done yet'
  );

  setStepStatus(
    document.querySelector('[data-card-status="cards"]'),
    cardsState,
    cardsState === 'success'
      ? 'All three card boxes are added'
      : cardsState === 'error'
        ? 'Add a card h-100 box inside each column'
        : 'Card boxes not done yet'
  );

  setStepStatus(
    document.querySelector('[data-card-status="card-closes"]'),
    cardClosesState,
    cardClosesState === 'success'
      ? 'Card closing tags are present'
      : cardClosesState === 'error'
        ? 'Check the card closing tags'
        : 'Card closing tags not done yet'
  );

  setStepStatus(
    document.querySelector('[data-card-status="bodies"]'),
    bodiesState,
    bodiesState === 'success'
      ? 'All three card bodies are added'
      : bodiesState === 'error'
        ? 'Add card-body inside each card'
        : 'Card bodies not done yet'
  );

  setStepStatus(
    document.querySelector('[data-card-status="body-closes"]'),
    bodyClosesState,
    bodyClosesState === 'success'
      ? 'Card body closing tags are present'
      : bodyClosesState === 'error'
        ? 'Check the card-body closing tags'
        : 'Card body closing tags not done yet'
  );

  setStepStatus(
    document.querySelector('[data-card-status="titles"]'),
    titlesState,
    titlesState === 'success'
      ? 'All three card titles are styled'
      : titlesState === 'error'
        ? 'Add card-title to all three headings'
        : 'Card titles not done yet'
  );

  setStepStatus(
    document.querySelector('[data-card-status="texts"]'),
    textsState,
    textsState === 'success'
      ? 'All three card paragraphs are styled'
      : textsState === 'error'
        ? 'Add card-text to all three paragraphs'
        : 'Card text not done yet'
  );

  setStepStatus(
    document.querySelector('[data-card-status="style-one"]'),
    firstStyleState,
    firstStyleState === 'success'
      ? 'First card has a visual style'
      : firstStyleState === 'error'
        ? 'Add a border-* or bg-* class to the first card'
        : 'First card style not done yet'
  );

  setStepStatus(
    document.querySelector('[data-card-status="style-two"]'),
    secondStyleState,
    secondStyleState === 'success'
      ? 'Second card has a visual style'
      : secondStyleState === 'error'
        ? 'Add a border-* or bg-* class to the second card'
        : 'Second card style not done yet'
  );

  setStepStatus(
    document.querySelector('[data-card-status="style-three"]'),
    thirdStyleState,
    thirdStyleState === 'success'
      ? 'Third card has a visual style'
      : thirdStyleState === 'error'
        ? 'Add a border-* or bg-* class to the third card'
        : 'Third card style not done yet'
  );
}

function updateParagraphsLessonStatus(status = null) {
  const currentStatus = status || getParagraphsLessonStatus(htmlEditor?.getValue?.() || '');
  const sectionState = currentStatus.sectionCorrect ? 'success' : currentStatus.sectionFound ? 'error' : 'pending';
  const rowState = currentStatus.rowCorrect ? 'success' : currentStatus.rowFound ? 'error' : 'pending';
  const columnState = currentStatus.columnCorrect ? 'success' : currentStatus.columnFound ? 'error' : 'pending';
  const cardState = currentStatus.cardCorrect ? 'success' : currentStatus.cardFound ? 'error' : 'pending';
  const bodyState = currentStatus.bodyCorrect ? 'success' : currentStatus.bodyFound ? 'error' : 'pending';
  const titleState = currentStatus.titleCorrect ? 'success' : currentStatus.titleFound ? 'error' : 'pending';
  const paragraphsState = currentStatus.paragraphCount >= 2 ? 'success' : currentStatus.paragraphCount > 0 ? 'error' : 'pending';
  const closeState = currentStatus.closeCorrect ? 'success' : currentStatus.closeFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-paragraph-status="section"]'),
    sectionState,
    sectionState === 'success'
      ? 'Biography section is above the Bootstrap script'
      : sectionState === 'error'
        ? 'Biography section should include container mt-5, id about, and be above the Bootstrap script'
        : 'Biography section not done yet'
  );

  setStepStatus(
    document.querySelector('[data-paragraph-status="row"]'),
    rowState,
    rowState === 'success'
      ? 'Biography row is below the biography section line'
      : rowState === 'error'
        ? 'Biography row should go below the about section line'
        : 'Biography row not done yet'
  );

  setStepStatus(
    document.querySelector('[data-paragraph-status="column"]'),
    columnState,
    columnState === 'success'
      ? 'Centered biography column is below the row'
      : columnState === 'error'
        ? 'Centered biography column should go below the row'
        : 'Centered biography column not done yet'
  );

  setStepStatus(
    document.querySelector('[data-paragraph-status="card"]'),
    cardState,
    cardState === 'success'
      ? 'Biography card is inside the centered column'
      : cardState === 'error'
        ? 'Biography card should go inside the centered column'
        : 'Biography card not done yet'
  );

  setStepStatus(
    document.querySelector('[data-paragraph-status="body"]'),
    bodyState,
    bodyState === 'success'
      ? 'Biography card body is inside the card'
      : bodyState === 'error'
        ? 'Biography card body should go inside the card'
        : 'Biography card body not done yet'
  );

  setStepStatus(
    document.querySelector('[data-paragraph-status="title"]'),
    titleState,
    titleState === 'success'
      ? 'Biography title is inside the card body'
      : titleState === 'error'
        ? 'Biography title should go inside the card body'
        : 'Biography title not done yet'
  );

  setStepStatus(
    document.querySelector('[data-paragraph-status="paragraphs"]'),
    paragraphsState,
    paragraphsState === 'success'
      ? 'Two biography paragraphs are added'
      : paragraphsState === 'error'
        ? 'Add two card-text paragraphs'
        : 'Biography paragraphs not done yet'
  );

  setStepStatus(
    document.querySelector('[data-paragraph-status="close"]'),
    closeState,
    closeState === 'success'
      ? 'Biography closing tags are present'
      : closeState === 'error'
        ? 'Check the biography closing tags'
        : 'Biography closing tags not done yet'
  );
}

function updateNavbarLessonStatus(status = null) {
  const currentStatus = status || getNavbarLessonStatus(htmlEditor?.getValue?.() || '');
  const startState = currentStatus.startCorrect ? 'success' : currentStatus.startFound ? 'error' : 'pending';
  const brandState = currentStatus.brandCorrect ? 'success' : currentStatus.brandFound ? 'error' : 'pending';
  const togglerState = currentStatus.togglerCorrect ? 'success' : currentStatus.togglerFound ? 'error' : 'pending';
  const collapseState = currentStatus.collapseCorrect ? 'success' : currentStatus.collapseFound ? 'error' : 'pending';
  const linksState = currentStatus.linksCorrect ? 'success' : currentStatus.linksFound ? 'error' : 'pending';
  const closeState = currentStatus.closeCorrect ? 'success' : currentStatus.closeFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-navbar-status="start"]'),
    startState,
    startState === 'success'
      ? 'Navbar starts at the top of the body'
      : startState === 'error'
        ? 'Navbar was added, but it should go right below body before the hero'
        : 'Navbar start not done yet'
  );

  setStepStatus(
    document.querySelector('[data-navbar-status="brand"]'),
    brandState,
    brandState === 'success'
      ? 'Navbar brand is inside the navbar'
      : brandState === 'error'
        ? 'Navbar brand was added, but it should go inside the navbar container'
        : 'Navbar brand not done yet'
  );

  setStepStatus(
    document.querySelector('[data-navbar-status="toggler"]'),
    togglerState,
    togglerState === 'success'
      ? 'Mobile menu button is connected to navbarNav'
      : togglerState === 'error'
        ? 'Mobile button should be below the brand and use data-bs-target="#navbarNav"'
        : 'Navbar mobile button not done yet'
  );

  setStepStatus(
    document.querySelector('[data-navbar-status="collapse"]'),
    collapseState,
    collapseState === 'success'
      ? 'Navbar link area is below the mobile button'
      : collapseState === 'error'
        ? 'Link area should be below the mobile button and use id="navbarNav"'
        : 'Navbar link area not done yet'
  );

  setStepStatus(
    document.querySelector('[data-navbar-status="links"]'),
    linksState,
    linksState === 'success'
      ? 'Navbar links are added'
      : linksState === 'error'
        ? 'Add Home, About, Movies, Music, and Quick Facts links inside the navbar list'
        : 'Navbar links not done yet'
  );

  setStepStatus(
    document.querySelector('[data-navbar-status="close"]'),
    closeState,
    closeState === 'success'
      ? 'Navbar closing tags are present'
      : closeState === 'error'
        ? 'Check the navbar closing tags'
        : 'Navbar closing tags not done yet'
  );
}

function updateImagesLessonStatus(status = null) {
  const currentStatus = status || getImageLessonStatus(htmlEditor?.getValue?.() || '');
  const bioLayoutState = currentStatus.bioLayoutCorrect ? 'success' : currentStatus.bioLayoutFound ? 'error' : 'pending';
  const bioImageState = currentStatus.bioImageCorrect ? 'success' : currentStatus.bioImageFound ? 'error' : 'pending';
  const bioTextColumnState = currentStatus.bioTextColumnCorrect ? 'success' : currentStatus.bioTextColumnFound ? 'error' : 'pending';
  const bioRowCloseState = currentStatus.bioRowCloseCorrect ? 'success' : currentStatus.bioRowCloseFound ? 'error' : 'pending';
  const bioAltState = currentStatus.bioAltCorrect ? 'success' : currentStatus.bioAltFound ? 'error' : 'pending';
  const bioStyleState = currentStatus.bioStyleCorrect ? 'success' : currentStatus.bioStyleFound ? 'error' : 'pending';
  const navImageState = currentStatus.navImageCorrect ? 'success' : currentStatus.navImageFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-image-status="bio-layout"]'),
    bioLayoutState,
    bioLayoutState === 'success'
      ? 'Biography two-column row and image column are added'
      : bioLayoutState === 'error'
        ? 'Add row align-items-center and col-md-4 text-center inside the biography card body'
        : 'Biography two-column layout not done yet'
  );

  setStepStatus(
    document.querySelector('[data-image-status="bio-image"]'),
    bioImageState,
    bioImageState === 'success'
      ? 'Biography image is in the left column'
      : bioImageState === 'error'
        ? 'Biography image should go inside the col-md-4 text-center column'
        : 'Biography image not done yet'
  );

  setStepStatus(
    document.querySelector('[data-image-status="bio-text-column"]'),
    bioTextColumnState,
    bioTextColumnState === 'success'
      ? 'Biography text column starts before the heading'
      : bioTextColumnState === 'error'
        ? 'Add the col-md-8 text column below the image and before the About Me heading'
        : 'Biography text column not done yet'
  );

  setStepStatus(
    document.querySelector('[data-image-status="bio-row-close"]'),
    bioRowCloseState,
    bioRowCloseState === 'success'
      ? 'Biography two-column row is closed after the paragraphs'
      : bioRowCloseState === 'error'
        ? 'Add the closing tags for the text column and row after the biography paragraphs'
        : 'Biography row closing tags not done yet'
  );

  setStepStatus(
    document.querySelector('[data-image-status="bio-alt"]'),
    bioAltState,
    bioAltState === 'success'
      ? 'Biography image has alt text'
      : bioAltState === 'error'
        ? 'Alt text was added, but it should be on the biography image'
        : 'Biography image description not done yet'
  );

  setStepStatus(
    document.querySelector('[data-image-status="bio-style"]'),
    bioStyleState,
    bioStyleState === 'success'
      ? 'Biography image has responsive styling and spacing'
      : bioStyleState === 'error'
        ? 'Add img-fluid, a rounded style, spacing like mb-3, and a max-width style to the biography image'
        : 'Biography image style not done yet'
  );

  setStepStatus(
    document.querySelector('[data-image-status="nav-image"]'),
    navImageState,
    navImageState === 'success'
      ? 'Navbar brand has an image with alt text'
      : navImageState === 'error'
        ? 'Navbar image should go inside the navbar-brand link and include alt text'
        : 'Navbar image not done yet'
  );
}

function updateLinksLessonStatus(status = null) {
  const currentStatus = status || getLinksLessonStatus(htmlEditor?.getValue?.() || '');
  const footerState = currentStatus.footerCorrect ? 'success' : currentStatus.footerFound ? 'error' : 'pending';
  const infoState = currentStatus.infoCorrect ? 'success' : currentStatus.infoFound ? 'error' : 'pending';
  const buttonsState = currentStatus.buttonsCorrect ? 'success' : currentStatus.buttonsFound ? 'error' : 'pending';
  const closeState = currentStatus.closeCorrect ? 'success' : currentStatus.closeFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-links-status="footer"]'),
    footerState,
    footerState === 'success'
      ? 'Footer starts above the Bootstrap script'
      : footerState === 'error'
        ? 'Footer should be above the Bootstrap script and include background, text, and spacing classes'
        : 'Footer start not done yet'
  );

  setStepStatus(
    document.querySelector('[data-links-status="info"]'),
    infoState,
    infoState === 'success'
      ? 'Footer information column is added'
      : infoState === 'error'
        ? 'Add a footer column with a heading and paragraph'
        : 'Footer info not done yet'
  );

  setStepStatus(
    document.querySelector('[data-links-status="buttons"]'),
    buttonsState,
    buttonsState === 'success'
      ? 'Footer button links are added'
      : buttonsState === 'error'
        ? 'Add at least two btn links, including one mailto link'
        : 'Footer buttons not done yet'
  );

  setStepStatus(
    document.querySelector('[data-links-status="close"]'),
    closeState,
    closeState === 'success'
      ? 'Footer closing tag is present'
      : closeState === 'error'
        ? 'Check the footer closing tags'
        : 'Footer closing tags not done yet'
  );
}

function updateMoviesLessonStatus(status = null) {
  const currentStatus = status || getMoviesLessonStatus(htmlEditor?.getValue?.() || '');
  const sectionState = currentStatus.sectionCorrect ? 'success' : currentStatus.sectionFound ? 'error' : 'pending';
  const headingState = currentStatus.headingCorrect ? 'success' : currentStatus.headingFound ? 'error' : 'pending';
  const firstCardState = currentStatus.firstCardCorrect ? 'success' : currentStatus.firstCardFound ? 'error' : 'pending';
  const secondCardState = currentStatus.secondCardCorrect ? 'success' : currentStatus.secondCardFound ? 'error' : 'pending';
  const closeState = currentStatus.closeCorrect ? 'success' : currentStatus.closeFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-movie-status="section"]'),
    sectionState,
    sectionState === 'success'
      ? 'Movies section starts before the footer'
      : sectionState === 'error'
        ? 'Movies section should use container my-* and id="movies" before the footer'
        : 'Movies section not done yet'
  );

  setStepStatus(
    document.querySelector('[data-movie-status="heading"]'),
    headingState,
    headingState === 'success'
      ? 'Movies heading and row are added'
      : headingState === 'error'
        ? 'Add an h2 and row inside the Movies section'
        : 'Movies heading and row not done yet'
  );

  setStepStatus(
    document.querySelector('[data-movie-status="first-card"]'),
    firstCardState,
    firstCardState === 'success'
      ? 'Movie card has an image and list'
      : firstCardState === 'error'
        ? 'The first card should include card-img-top and list-group'
        : 'Movie card not done yet'
  );

  setStepStatus(
    document.querySelector('[data-movie-status="second-card"]'),
    secondCardState,
    secondCardState === 'success'
      ? 'Quote card has a blockquote'
      : secondCardState === 'error'
        ? 'The second card should include a blockquote'
        : 'Quote card not done yet'
  );

  setStepStatus(
    document.querySelector('[data-movie-status="close"]'),
    closeState,
    closeState === 'success'
      ? 'Movies section has both columns and closing tags'
      : closeState === 'error'
        ? 'Check the Movies section closing tags'
        : 'Movies closing tags not done yet'
  );
}

function updateMusicLessonStatus(status = null) {
  const currentStatus = status || getMusicLessonStatus(htmlEditor?.getValue?.() || '');
  const sectionState = currentStatus.sectionCorrect ? 'success' : currentStatus.sectionFound ? 'error' : 'pending';
  const imageState = currentStatus.imageCorrect ? 'success' : currentStatus.imageFound ? 'error' : 'pending';
  const textState = currentStatus.textCorrect ? 'success' : currentStatus.textFound ? 'error' : 'pending';
  const accordionState = currentStatus.accordionCorrect ? 'success' : currentStatus.accordionFound ? 'error' : 'pending';
  const closeState = currentStatus.closeCorrect ? 'success' : currentStatus.closeFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-music-status="section"]'),
    sectionState,
    sectionState === 'success'
      ? 'Music section starts before the footer'
      : sectionState === 'error'
        ? 'Music section should use container, a bg-* class, and id="music" before the footer'
        : 'Music section not done yet'
  );

  setStepStatus(
    document.querySelector('[data-music-status="image"]'),
    imageState,
    imageState === 'success'
      ? 'Music image column is added'
      : imageState === 'error'
        ? 'Add the col-lg-4 image column with img-fluid, rounded-circle, matching width/height, and object-fit: cover'
        : 'Music image column not done yet'
  );

  setStepStatus(
    document.querySelector('[data-music-status="text"]'),
    textState,
    textState === 'success'
      ? 'Music text column is added'
      : textState === 'error'
        ? 'Add the col-lg-8 text column with h2 and lead paragraph'
        : 'Music text column not done yet'
  );

  setStepStatus(
    document.querySelector('[data-music-status="accordion"]'),
    accordionState,
    accordionState === 'success'
      ? 'Music accordion has two items'
      : accordionState === 'error'
        ? 'Add an accordion with id musicAccordion and two accordion items'
        : 'Music accordion not done yet'
  );

  setStepStatus(
    document.querySelector('[data-music-status="close"]'),
    closeState,
    closeState === 'success'
      ? 'Music section closing tags are present'
      : closeState === 'error'
        ? 'Close the col-lg-8, row, and music container before the footer'
        : 'Music closing tags not done yet'
  );
}

function updateQuickFactsLessonStatus(status = null) {
  const currentStatus = status || getQuickFactsLessonStatus(htmlEditor?.getValue?.() || '');
  const sectionState = currentStatus.sectionCorrect ? 'success' : currentStatus.sectionFound ? 'error' : 'pending';
  const headingState = currentStatus.headingCorrect ? 'success' : currentStatus.headingFound ? 'error' : 'pending';
  const cardsState = currentStatus.cardsCorrect ? 'success' : currentStatus.cardsFound ? 'error' : 'pending';
  const closeState = currentStatus.closeCorrect ? 'success' : currentStatus.closeFound ? 'error' : 'pending';

  setStepStatus(
    document.querySelector('[data-facts-status="section"]'),
    sectionState,
    sectionState === 'success'
      ? 'Quick Facts section starts before the footer'
      : sectionState === 'error'
        ? 'Quick Facts section should use container and id="quickfacts" before the footer'
        : 'Quick Facts section not done yet'
  );

  setStepStatus(
    document.querySelector('[data-facts-status="heading"]'),
    headingState,
    headingState === 'success'
      ? 'Quick Facts heading and row are added'
      : headingState === 'error'
        ? 'Add an h2 and row inside the Quick Facts section'
        : 'Quick Facts heading not done yet'
  );

  setStepStatus(
    document.querySelector('[data-facts-status="cards"]'),
    cardsState,
    cardsState === 'success'
      ? 'Four Quick Facts cards are added'
      : cardsState === 'error'
        ? 'Add four col-md-3 cards with border-* styling and h-100'
        : 'Quick Facts cards not done yet'
  );

  setStepStatus(
    document.querySelector('[data-facts-status="close"]'),
    closeState,
    closeState === 'success'
      ? 'Quick Facts closing tags are present'
      : closeState === 'error'
        ? 'Check the Quick Facts section closing tags'
        : 'Quick Facts closing tags not done yet'
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
    updateCardsLessonStatus(getCardsLessonStatus(''));
    updateParagraphsLessonStatus(getParagraphsLessonStatus(''));
    updateNavbarLessonStatus(getNavbarLessonStatus(''));
    updateImagesLessonStatus(getImageLessonStatus(''));
    updateLinksLessonStatus(getLinksLessonStatus(''));
    updateMoviesLessonStatus(getMoviesLessonStatus(''));
    updateMusicLessonStatus(getMusicLessonStatus(''));
    updateQuickFactsLessonStatus(getQuickFactsLessonStatus(''));
    updateProgressFromHtml('');
    errorDiv.style.display = 'none';
    errorDiv.innerHTML = '';
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
    updateCardsLessonStatus();
    updateParagraphsLessonStatus();
    updateNavbarLessonStatus();
    updateImagesLessonStatus();
    updateLinksLessonStatus();
    updateMoviesLessonStatus();
    updateMusicLessonStatus();
    updateQuickFactsLessonStatus();
    updateProgressFromHtml(htmlContent);

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
    if (currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
      currentPreviewUrl = null;
    }

    const blob = new Blob([resolveSimulatedAssets(htmlContent)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    currentPreviewUrl = url;
    previewFrame.onload = () => {
      resizePreviewFrameToContent().catch(() => {});
    };
    
    // Handle iframe errors
    previewFrame.onerror = () => {
      errorDiv.style.display = 'block';
      errorDiv.className = 'preview-error preview-error--issue';
      errorDiv.textContent = 'Error loading preview. Check your HTML syntax.';
    };
    previewFrame.src = url;
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
let fullPreviewTransitionTimeout = null;

function runFullPreviewTransition(isEntering) {
  window.clearTimeout(fullPreviewTransitionTimeout);
  document.body.classList.remove('full-preview-entering', 'full-preview-exiting');
  document.body.classList.add('full-preview-transition', isEntering ? 'full-preview-entering' : 'full-preview-exiting');

  fullPreviewTransitionTimeout = window.setTimeout(() => {
    document.body.classList.remove('full-preview-transition', 'full-preview-entering', 'full-preview-exiting');
  }, 280);
}

function setPreviewToggleButtonState(isHidden) {
  if (!previewToggleBtn) return;

  const label = isHidden ? 'Show Preview' : 'Hide Preview';
  const iconPath = previewToggleBtn.querySelector('[data-preview-toggle-icon]');

  setActionButtonLabel(previewToggleBtn, label);
  previewToggleBtn.title = label;
  previewToggleBtn.setAttribute('aria-label', label);

  if (iconPath) {
    iconPath.setAttribute(
      'd',
      isHidden
        ? 'M4 5h16v14H4zM13 5v14'
        : 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.6 10.6 0 0 1 12 4c5 0 8.5 4.1 10 8a14.4 14.4 0 0 1-3.2 4.7M6.5 6.5A14.2 14.2 0 0 0 2 12c1.5 3.9 5 8 10 8a10.8 10.8 0 0 0 4.1-.8'
    );
  }
}

function setPreviewHidden(isHidden) {
  if (!practiceContainer) return;

  practiceContainer.classList.toggle('preview-hidden', isHidden);
  setPreviewToggleButtonState(isHidden);

  if (isHidden) {
    refreshHtmlEditor();
    htmlEditor.focus();
  } else {
    updatePreview();
    refreshHtmlEditor();
  }
}

previewToggleBtn?.addEventListener('click', () => {
  const shouldHide = !practiceContainer?.classList.contains('preview-hidden');

  if (isFullPreview) {
    isFullPreview = false;
    practiceContainer?.classList.remove('full-preview');
    document.body.classList.remove('full-preview-active');
    setActionButtonLabel(toggleViewBtn, 'Full Page');
  }

  setPreviewHidden(shouldHide);
});

if (toggleViewBtn && practiceContainer) {
  toggleViewBtn.addEventListener('click', () => {
    isFullPreview = !isFullPreview;
    setPreviewHidden(false);
    practiceContainer.classList.toggle('full-preview', isFullPreview);
    document.body.classList.toggle('full-preview-active', isFullPreview);
    runFullPreviewTransition(isFullPreview);
    setActionButtonLabel(toggleViewBtn, isFullPreview ? 'Editor' : 'Full Page');
    toggleViewBtn.title = isFullPreview ? 'Show editor and preview' : 'Show full-page preview only';
    toggleViewBtn.setAttribute('aria-label', isFullPreview ? 'Show editor and preview' : 'Show full-page preview only');
    
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

function formatHtmlContent(content) {
  if (typeof html_beautify !== 'function') {
    throw new Error('The local HTML formatter did not load.');
  }

  return html_beautify(content, {
    indent_size: 2,
    indent_char: ' ',
    indent_with_tabs: false,
    wrap_line_length: 0,
    preserve_newlines: true,
    max_preserve_newlines: 1,
    end_with_newline: true,
    extra_liners: []
  });
}

assetUploadBtn?.addEventListener('click', () => {
  assetUploadInput?.click();
});

assetUploadInput?.addEventListener('change', async (event) => {
  try {
    await handleAssetUpload(event.target.files);
  } catch (error) {
    showNotification('Image upload failed', error.message || 'Try another image file.', 'warning');
  } finally {
    event.target.value = '';
  }
});

formatCodeBtn?.addEventListener('click', async () => {
  const currentContent = htmlEditor.getValue();

  if (!currentContent.trim()) {
    showNotification('Nothing to format', 'Add or paste HTML code first.', 'info');
    htmlEditor.focus();
    return;
  }

  try {
    const formattedContent = formatHtmlContent(currentContent);

    htmlEditor.setValue(formattedContent);
    updatePreview();
    window.clearTimeout(saveTimeout);
    await saveContent(formattedContent);
    refreshHtmlEditor();
    htmlEditor.focus();

    showNotification(
      'Code formatted',
      formattedContent === currentContent ? 'The code was already neatly aligned.' : 'Indentation and tag spacing are cleaned up.',
      'success'
    );
  } catch (error) {
    showNotification('Format failed', error.message || 'Check the HTML and try again.', 'warning');
  }
});

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

function getExportTitle() {
  const htmlContent = htmlEditor.getValue();
  const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim();
  return title || 'My HTML Site';
}

function getCompleteHtmlContent() {
  const title = getExportTitle();
  let htmlContent = htmlEditor.getValue().trim();

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

  return htmlContent;
}

function sanitizeFilenamePart(value, fallback) {
  const cleanValue = (value || fallback)
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return cleanValue || fallback;
}

function getExportBaseName() {
  const assignment = sanitizeFilenamePart(exportAssignment?.value, 'HTML_Part_1');
  const firstName = sanitizeFilenamePart(exportFirstName?.value, 'First');
  const lastName = sanitizeFilenamePart(exportLastName?.value, 'Last');
  const grade = sanitizeFilenamePart(exportGrade?.value, 'Grade');

  return `${assignment}_${firstName}_${lastName}_${grade}`;
}

function updateExportFilenamePreview() {
  if (!exportFilenamePreview) return;

  exportFilenamePreview.textContent = `Files will use: ${getExportBaseName()}.html and ${getExportBaseName()}.png`;
}

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function openExportDialog() {
  if (!htmlEditor.getValue().trim()) {
    alert('Please add HTML code in the editor before exporting.');
    return;
  }

  if (!exportDialog || !exportForm) return;

  if (exportDate && !exportDate.value) {
    exportDate.value = getTodayInputValue();
  }

  updateExportFilenamePreview();
  exportDialog.hidden = false;
  exportFirstName?.focus();
}

function closeExportDialog() {
  if (exportDialog) {
    exportDialog.hidden = true;
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create image blob'));
      }
    }, 'image/png', 0.95);
  });
}

async function createRenderedPageImageBlob(htmlContent) {
  const capturePage = await loadHtml2Canvas();
  const renderHtmlContent = await resolveSimulatedAssetsForImageExport(htmlContent);
  const tempIframe = document.createElement('iframe');

  tempIframe.style.position = 'absolute';
  tempIframe.style.left = '-9999px';
  tempIframe.style.top = '0';
  tempIframe.style.width = '1200px';
  tempIframe.style.height = '1px';
  tempIframe.style.border = 'none';
  tempIframe.srcdoc = renderHtmlContent;
  document.body.appendChild(tempIframe);

  try {
    await new Promise((resolve, reject) => {
      tempIframe.onload = resolve;
      tempIframe.onerror = reject;
      setTimeout(resolve, 1200);
    });

    const iframeDoc = tempIframe.contentDocument || tempIframe.contentWindow.document;
    const iframeBody = iframeDoc.body || iframeDoc.documentElement;

    if (!iframeBody) {
      throw new Error('Could not access page content for image export.');
    }

    await waitForRenderedImages(iframeDoc);
    if (iframeDoc.fonts?.ready) {
      await iframeDoc.fonts.ready.catch(() => {});
    }
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const width = Math.max(getRenderedDocumentWidth(iframeDoc), 1200);
    const height = getRenderedDocumentHeight(iframeDoc);
    tempIframe.style.height = `${height}px`;

    const canvas = await capturePage(iframeBody, {
      backgroundColor: '#ffffff',
      scale: 1.5,
      useCORS: true,
      logging: false,
      allowTaint: true,
      width,
      height
    });

    return canvasToBlob(canvas);
  } finally {
    tempIframe.remove();
  }
}

function makeCrc32Table() {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    table[i] = crc >>> 0;
  }

  return table;
}

const crc32Table = makeCrc32Table();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crc32Table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function dateToDosTime(date) {
  return ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((Math.floor(date.getSeconds() / 2)) & 0x1f);
}

function dateToDosDate(date) {
  return (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f);
}

function writeUint16(buffer, offset, value) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(buffer, offset, value) {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
  buffer[offset + 2] = (value >>> 16) & 0xff;
  buffer[offset + 3] = (value >>> 24) & 0xff;
}

function concatUint8Arrays(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });

  return output;
}

function createZipBlob(files) {
  const encoder = new TextEncoder();
  const now = new Date();
  const fileParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const data = file.data instanceof Uint8Array ? file.data : encoder.encode(String(file.data));
    const checksum = crc32(data);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const centralHeader = new Uint8Array(46 + nameBytes.length);

    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 10, dateToDosTime(now));
    writeUint16(localHeader, 12, dateToDosDate(now));
    writeUint32(localHeader, 14, checksum);
    writeUint32(localHeader, 18, data.length);
    writeUint32(localHeader, 22, data.length);
    writeUint16(localHeader, 26, nameBytes.length);
    localHeader.set(nameBytes, 30);

    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 12, dateToDosTime(now));
    writeUint16(centralHeader, 14, dateToDosDate(now));
    writeUint32(centralHeader, 16, checksum);
    writeUint32(centralHeader, 20, data.length);
    writeUint32(centralHeader, 24, data.length);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(nameBytes, 46);

    fileParts.push(localHeader, data);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 8, files.length);
  writeUint16(endRecord, 10, files.length);
  writeUint32(endRecord, 12, centralDirectory.length);
  writeUint32(endRecord, 16, offset);

  return new Blob([...fileParts, centralDirectory, endRecord], { type: 'application/zip' });
}

function dataUrlToUint8Array(dataUrl) {
  const match = String(dataUrl).match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) {
    return new Uint8Array();
  }

  const isBase64 = Boolean(match[2]);
  const data = match[3] || '';
  const binary = isBase64 ? atob(data) : decodeURIComponent(data);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function getSubmissionInfo(baseName) {
  return [
    `Assignment: ${exportAssignment?.value || ''}`,
    `First name: ${exportFirstName?.value || ''}`,
    `Last name: ${exportLastName?.value || ''}`,
    `Grade: ${exportGrade?.value || ''}`,
    `Date: ${exportDate?.value || ''}`,
    `Files: ${baseName}.html, ${baseName}.png`,
    ''
  ].join('\n');
}

function collectReferencedAssetPaths(htmlContent) {
  const paths = new Set();
  htmlContent.replace(/\bsrc=(["'])(assets\/[^"']+)\1/gi, (match, quote, path) => {
    paths.add(path);
    return match;
  });

  return Array.from(paths);
}

async function fetchAssetBytes(path) {
  const response = await fetch(new URL(path, window.location.href));
  if (!response.ok) {
    throw new Error(`Could not include ${path}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function exportProjectZip() {
  const baseName = getExportBaseName();
  const htmlContent = getCompleteHtmlContent();
  const imageBlob = await createRenderedPageImageBlob(htmlContent);
  const simulatedAssetMap = new Map(simulatedAssets.map(asset => [asset.path, asset]));
  const missingAssets = [];
  const files = [
    { name: `${baseName}.html`, data: htmlContent },
    { name: `${baseName}.png`, data: new Uint8Array(await imageBlob.arrayBuffer()) },
    { name: 'submission_info.txt', data: getSubmissionInfo(baseName) }
  ];

  const assetPaths = new Set(collectReferencedAssetPaths(htmlContent));
  simulatedAssets.forEach(asset => assetPaths.add(asset.path));

  await Promise.all(Array.from(assetPaths).map(async (path) => {
    const simulatedAsset = simulatedAssetMap.get(path);
    if (simulatedAsset) {
      files.push({
        name: simulatedAsset.path,
        data: dataUrlToUint8Array(simulatedAsset.dataUrl)
      });
      return;
    }

    try {
      files.push({
        name: path,
        data: await fetchAssetBytes(path)
      });
    } catch (error) {
      missingAssets.push(path);
    }
  }));

  if (missingAssets.length) {
    files.push({
      name: 'missing_assets.txt',
      data: `These asset files were referenced but could not be included automatically:\n${missingAssets.join('\n')}\n`
    });
  }

  downloadBlob(createZipBlob(files), `${baseName}.zip`);
}

exportBtn?.addEventListener('click', openExportDialog);

[exportFirstName, exportLastName, exportGrade, exportAssignment].forEach((input) => {
  input?.addEventListener('input', updateExportFilenamePreview);
});

exportCancelBtn?.addEventListener('click', closeExportDialog);
exportCancelIconBtn?.addEventListener('click', closeExportDialog);
exportDialog?.addEventListener('click', (event) => {
  if (event.target === exportDialog) {
    closeExportDialog();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && exportDialog && !exportDialog.hidden) {
    closeExportDialog();
  }
});

exportForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const originalText = getActionButtonLabel(exportSubmitBtn);
  try {
    exportSubmitBtn.disabled = true;
    setActionButtonLabel(exportSubmitBtn, 'Preparing...');
    await exportProjectZip();
    closeExportDialog();
    showNotification('Export ready', 'Your HTML, page image, and assets were saved in one zip file.', 'success');
  } catch (error) {
    console.error('Error exporting project:', error);
    alert('Failed to export project: ' + error.message + '\n\nMake sure your HTML is valid and try again.');
  } finally {
    exportSubmitBtn.disabled = false;
    setActionButtonLabel(exportSubmitBtn, originalText);
  }
});
