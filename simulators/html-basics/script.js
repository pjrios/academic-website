// Tab switching
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'html-basics';
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
    
    // Update buttons
    tabButtons.forEach(btn => btn.classList.remove('tab-active'));
    button.classList.add('tab-active');
    
    // Update content
    tabContents.forEach(content => {
      content.classList.remove('tab-active');
      if (content.id === `${targetTab}Tab`) {
        content.classList.add('tab-active');
      }
    });
    
    // Save tab state
    saveTabState(targetTab);
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

// Lesson content
const lessons = {
  intro: {
    title: 'Introduction to HTML & Bootstrap 5',
    content: `
      <h2>What is HTML?</h2>
      <p>HTML (HyperText Markup Language) is the standard language for creating web pages. It uses tags to structure content and tell browsers how to display it.</p>
      
      <h2>What is Bootstrap 5?</h2>
      <p>Bootstrap 5 is a popular CSS framework that provides pre-built styles and components. Instead of writing custom CSS, you can use Bootstrap classes to quickly create beautiful, responsive websites.</p>
      
      <h2>🎯 Your Project: Build Your Personal Website</h2>
      <p>As you go through these lessons, you'll build a complete website about yourself! Each lesson will add a new piece to your site.</p>
      
      <h3>📋 What You'll Build</h3>
      <p>By the end of these lessons, you'll have a complete personal website with:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>✅ A professional navbar with your name and navigation links</li>
        <li>✅ A hero section with a large heading and introduction</li>
        <li>✅ A biography section about yourself</li>
        <li>✅ A movies section showcasing your favorite film series</li>
        <li>✅ A music/podcast section with interactive accordions</li>
        <li>✅ A quick facts section with colorful cards</li>
        <li>✅ A footer with social media links</li>
        <li>✅ Beautiful Bootstrap styling throughout</li>
      </ul>
      <p><strong>All sections will be responsive</strong> - they'll look great on phones, tablets, and desktops!</p>
      
      <h3>📋 Step 1: Set Up Your Basic Structure</h3>
      <p><strong>What to do:</strong> Copy this code into your Practice Builder. This is the foundation of your website!</p>
      <div class="code-block">
        <code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  &lt;title&gt;My Personal Website&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div class="container"&gt;
    &lt;h1&gt;Welcome to My Website&lt;/h1&gt;
    &lt;p&gt;This is where your content will go!&lt;/p&gt;
  &lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Change the <code>&lt;title&gt;</code> to your name or site title!</p>
      <p><strong>Why:</strong> Every HTML page needs this structure. The <code>container</code> class is a Bootstrap class that centers your content and adds padding.</p>
      
      <h3>📋 Step 2: Add Bootstrap 5 CDN Links</h3>
      <p><strong>What to do:</strong> Add these Bootstrap CDN links inside your <code>&lt;head&gt;</code> tag (before the closing <code>&lt;/head&gt;</code>) and before the closing <code>&lt;/body&gt;</code> tag:</p>
      <div class="code-block">
        <code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  &lt;title&gt;My Personal Website&lt;/title&gt;
  &lt;!-- Bootstrap 5 CSS --&gt;
  &lt;link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div class="container"&gt;
    &lt;h1&gt;Welcome to My Website&lt;/h1&gt;
    &lt;p&gt;This is where your content will go!&lt;/p&gt;
  &lt;/div&gt;
  &lt;!-- Bootstrap 5 JS --&gt;
  &lt;script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"&gt;&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Make sure both links are added correctly! The CSS link goes in <code>&lt;head&gt;</code>, and the JS link goes before <code>&lt;/body&gt;</code>.</p>
      <p><strong>Why:</strong> Bootstrap is a library that needs to be loaded before you can use its classes. The CSS link loads Bootstrap's styles, and the JS link loads Bootstrap's JavaScript (needed for interactive components like accordions and navbar toggles).</p>
      <div class="alert alert-warning mt-3">
        <strong>⚠️ Important:</strong> Without these Bootstrap links, Bootstrap classes won't work! Always include both the CSS and JS links in your HTML.
      </div>
      
      <div class="alert alert-info mt-3">
        <strong>💡 Important:</strong> To use Bootstrap 5, you need to add the Bootstrap CDN links to your HTML. This is an important skill to learn! We'll show you how in the next step.
      </div>
      
      <h3>Key Concepts</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>HTML Tags:</strong> Structure your content with tags like <code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;div&gt;</code></li>
        <li><strong>Bootstrap Classes:</strong> Add styling with classes like <code>container</code>, <code>btn</code>, <code>card</code></li>
        <li><strong>Responsive Design:</strong> Bootstrap makes your site work on all screen sizes automatically</li>
        <li><strong>Components:</strong> Use pre-built components like buttons, cards, and navigation bars</li>
      </ul>
      
      <div class="common-mistakes">
        <h4>⚠️ Common Mistakes to Avoid</h4>
        <ul>
          <li><strong>Forgetting to close tags:</strong> Every opening tag needs a closing tag (e.g., <code>&lt;div&gt;</code> needs <code>&lt;/div&gt;</code>)</li>
          <li><strong>Missing Bootstrap links:</strong> Without Bootstrap CDN links, Bootstrap classes won't work</li>
          <li><strong>Wrong tag order:</strong> Make sure <code>&lt;head&gt;</code> comes before <code>&lt;body&gt;</code></li>
          <li><strong>Forgetting quotes:</strong> Attribute values need quotes: <code>class="container"</code> not <code>class=container</code></li>
        </ul>
      </div>
      
      <div class="alert alert-success mt-4">
        <strong>📖 What's Next:</strong> In the next lesson, you'll learn about HTML headings and Bootstrap display classes. You'll create your hero section - the first thing visitors see!
      </div>
    `
  },
  headings: {
    title: 'Headings with Bootstrap',
    content: `
      <h2>HTML Headings</h2>
      <p>Headings create hierarchy in your content. HTML provides six levels, from <code>&lt;h1&gt;</code> (most important) to <code>&lt;h6&gt;</code> (least important).</p>
      
      <h2>Bootstrap Display Headings</h2>
      <p>Bootstrap adds special display classes for larger, more prominent headings:</p>
      
      <h3>Basic Headings</h3>
      <div class="code-block">
        <code>&lt;h1&gt;Main Heading&lt;/h1&gt;
&lt;h2&gt;Section Heading&lt;/h2&gt;
&lt;h3&gt;Subsection Heading&lt;/h3&gt;</code>
      </div>
      
      <h3>Bootstrap Display Classes</h3>
      <div class="code-block">
        <code>&lt;h1 class="display-1"&gt;Display 1&lt;/h1&gt;
&lt;h1 class="display-2"&gt;Display 2&lt;/h1&gt;
&lt;h1 class="display-3"&gt;Display 3&lt;/h1&gt;
&lt;h1 class="display-4"&gt;Display 4&lt;/h1&gt;
&lt;h1 class="display-5"&gt;Display 5&lt;/h1&gt;
&lt;h1 class="display-6"&gt;Display 6&lt;/h1&gt;</code>
      </div>
      
      <h3>Example</h3>
      <div class="example-preview">
        <h1 class="display-1">Display 1</h1>
        <h1 class="display-4">Display 4</h1>
        <h2>Regular H2</h2>
        <h3>Regular H3</h3>
        <p class="lead">Use <code>lead</code> class for standout paragraphs</p>
      </div>
      
      <h3>Bootstrap Heading Utilities</h3>
      <div class="code-block">
        <code>&lt;h1 class="text-center"&gt;Centered Heading&lt;/h1&gt;
&lt;h2 class="text-muted"&gt;Muted Heading&lt;/h2&gt;
&lt;h3 class="text-primary"&gt;Primary Color Heading&lt;/h3&gt;</code>
      </div>
      
      <h2>🎯 Add to Your Website: Hero Section</h2>
      <p><strong>What to do:</strong> Replace the content inside your <code>&lt;div class="container"&gt;</code> with this hero section:</p>
      <div class="code-block">
        <code>&lt;div class="bg-primary text-white text-center py-5"&gt;
  &lt;h1 class="display-3"&gt;Welcome to My Website&lt;/h1&gt;
  &lt;p class="lead"&gt;Learn about me, my interests, and what I love!&lt;/p&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Change the heading and description to something personal about you!</p>
      <p><strong>Why:</strong> The hero section is the first thing visitors see. <code>display-3</code> makes a large heading, <code>lead</code> makes the paragraph stand out, and <code>bg-primary</code> adds a colored background.</p>
      
      <h3>📚 New Concepts Explained</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>display-3:</strong> Bootstrap's large display heading (smaller than display-1, larger than regular h1). Options: <code>display-1</code> (largest) through <code>display-6</code> (smallest)</li>
        <li><strong>lead:</strong> Makes paragraph text larger and more prominent - perfect for introductory text</li>
        <li><strong>bg-primary:</strong> Bootstrap's primary color background (usually blue). Other options: <code>bg-success</code> (green), <code>bg-danger</code> (red), <code>bg-warning</code> (yellow), <code>bg-info</code> (light blue), <code>bg-dark</code> (dark), <code>bg-light</code> (light gray)</li>
        <li><strong>text-white:</strong> White text color (for contrast on dark backgrounds). Other options: <code>text-primary</code>, <code>text-success</code>, <code>text-muted</code> (gray), <code>text-dark</code></li>
        <li><strong>text-center:</strong> Centers text horizontally. Other options: <code>text-start</code> (left), <code>text-end</code> (right)</li>
        <li><strong>py-5:</strong> Padding top and bottom (5 units = large spacing). Format: <code>p</code> (all sides), <code>pt</code> (top), <code>pb</code> (bottom), <code>px</code> (left/right), <code>py</code> (top/bottom). Numbers: 0-5 (0=none, 5=largest)</li>
      </ul>
      
      <div class="common-mistakes">
        <h4>⚠️ Common Mistakes to Avoid</h4>
        <ul>
          <li><strong>Using multiple h1 tags:</strong> Use only one <code>&lt;h1&gt;</code> per page for SEO</li>
          <li><strong>Forgetting text-white on colored backgrounds:</strong> Dark text on dark backgrounds is hard to read</li>
          <li><strong>Mixing display classes:</strong> Use <code>display-*</code> on <code>&lt;h1&gt;</code> tags, not on paragraphs</li>
        </ul>
      </div>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Change <code>display-3</code> to <code>display-1</code> to make the heading even larger</li>
        <li>Try different background colors: <code>bg-success</code>, <code>bg-danger</code>, or <code>bg-dark</code></li>
        <li>Change <code>py-5</code> to <code>py-3</code> to reduce vertical padding</li>
        <li>Add a second paragraph with the <code>lead</code> class below your first one</li>
      </ul>
      
      <div class="alert alert-success mt-4">
        <strong>📖 What's Next:</strong> In the next lesson, you'll learn about Bootstrap's grid system - the foundation of responsive layouts!
      </div>
      
      <h3>Best Practices</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Use only one <code>&lt;h1&gt;</code> per page</li>
        <li>Use <code>display-*</code> classes for hero sections</li>
        <li>Combine HTML headings with Bootstrap utility classes</li>
        <li>Use <code>lead</code> class for important paragraphs</li>
      </ul>
    `
  },
  layoutBasics: {
    title: 'Layout Basics: Bootstrap Grid System',
    content: `
      <h2>Understanding Bootstrap's Grid System</h2>
      <p>Bootstrap's grid system is the foundation of responsive layouts. It uses a 12-column system that automatically adapts to different screen sizes.</p>
      
      <h3>Basic Grid Structure</h3>
      <p>Every grid layout needs three parts:</p>
      <ol style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>container:</strong> Wraps everything, centers content, adds padding</li>
        <li><strong>row:</strong> Creates a horizontal group for columns</li>
        <li><strong>col-*:</strong> Defines column width (must add up to 12)</li>
      </ol>
      
      <div class="code-block">
        <code>&lt;!-- Basic grid structure: container wraps everything, row groups columns, col creates equal-width columns --&gt;
&lt;div class="container"&gt;
  &lt;!-- Row creates a horizontal group for columns --&gt;
  &lt;div class="row"&gt;
    &lt;!-- Each col creates an equal-width column (auto-layout) --&gt;
    &lt;div class="col"&gt;Column 1&lt;/div&gt;
    &lt;div class="col"&gt;Column 2&lt;/div&gt;
    &lt;div class="col"&gt;Column 3&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      
      <h3>Column Sizes</h3>
      <p>You can specify exact column widths. The numbers add up to 12:</p>
      <div class="code-block">
        <code>&lt;div class="container"&gt;
  &lt;!-- First row: 3 equal columns (4+4+4=12) --&gt;
  &lt;div class="row"&gt;
    &lt;!-- col-md-4 means 4/12 width (33%) on medium+ screens, stacks on small screens --&gt;
    &lt;div class="col-md-4"&gt;Column 1&lt;/div&gt;
    &lt;div class="col-md-4"&gt;Column 2&lt;/div&gt;
    &lt;div class="col-md-4"&gt;Column 3&lt;/div&gt;
  &lt;/div&gt;
  &lt;!-- Second row: 2 equal columns (6+6=12, 50% each) --&gt;
  &lt;div class="row"&gt;
    &lt;!-- col-md-6 means 6/12 width (50%) on medium+ screens --&gt;
    &lt;div class="col-md-6"&gt;Left Column&lt;/div&gt;
    &lt;div class="col-md-6"&gt;Right Column&lt;/div&gt;
  &lt;/div&gt;
  &lt;!-- Third row: wide main content + narrow sidebar (8+4=12) --&gt;
  &lt;div class="row"&gt;
    &lt;!-- col-md-8 means 8/12 width (67%) - main content area --&gt;
    &lt;div class="col-md-8"&gt;Main Content&lt;/div&gt;
    &lt;!-- col-md-4 means 4/12 width (33%) - sidebar --&gt;
    &lt;div class="col-md-4"&gt;Sidebar&lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      
      <h3>Responsive Breakpoints</h3>
      <p>Bootstrap uses breakpoints to make layouts responsive:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>col-sm-*:</strong> Small devices (≥576px) - phones in landscape</li>
        <li><strong>col-md-*:</strong> Medium devices (≥768px) - tablets</li>
        <li><strong>col-lg-*:</strong> Large devices (≥992px) - desktops</li>
        <li><strong>col-xl-*:</strong> Extra large devices (≥1200px) - large desktops</li>
      </ul>
      <p><strong>Example:</strong> <code>col-md-6</code> means "6 columns on medium screens and up". On smaller screens, columns stack vertically.</p>
      
      <h3>Centering Columns</h3>
      <p>Use <code>mx-auto</code> to center a column horizontally:</p>
      <div class="code-block">
        <code>&lt;div class="container"&gt;
  &lt;div class="row"&gt;
    &lt;!-- Centered column: col-md-8 (8/12 width = 67%) + mx-auto (margin auto = centers horizontally) --&gt;
    &lt;div class="col-md-8 mx-auto"&gt;
      Centered content
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      
      <h3>Spacing Utilities</h3>
      <p>Bootstrap provides spacing classes for margins and padding:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>mt-5:</strong> Margin-top (5 = large spacing)</li>
        <li><strong>mb-3:</strong> Margin-bottom (3 = medium spacing)</li>
        <li><strong>my-5:</strong> Margin top and bottom</li>
        <li><strong>py-4:</strong> Padding top and bottom</li>
        <li><strong>px-2:</strong> Padding left and right</li>
      </ul>
      <p>Numbers range from 0-5 (0 = none, 5 = largest)</p>
      
      <h2>🎯 Add to Your Website: Practice Grid Layout</h2>
      <p><strong>📍 Placement:</strong> Add this practice section after your hero section to experiment with grids:</p>
      <div class="code-block">
        <code>&lt;!-- Practice grid section --&gt;
&lt;div class="container mt-5"&gt;
  &lt;h2 class="text-center mb-4"&gt;Grid Practice&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-4"&gt;
      &lt;div style="background: #e3f2fd; padding: 20px; border-radius: 8px;"&gt;
        &lt;h4&gt;Column 1&lt;/h4&gt;
        &lt;p&gt;This is 4/12 width (33%)&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4"&gt;
      &lt;div style="background: #f3e5f5; padding: 20px; border-radius: 8px;"&gt;
        &lt;h4&gt;Column 2&lt;/h4&gt;
        &lt;p&gt;This is 4/12 width (33%)&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4"&gt;
      &lt;div style="background: #e8f5e9; padding: 20px; border-radius: 8px;"&gt;
        &lt;h4&gt;Column 3&lt;/h4&gt;
        &lt;p&gt;This is 4/12 width (33%)&lt;/p&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Try changing <code>col-md-4</code> to <code>col-md-6</code> to see 2 columns instead of 3. Or try <code>col-md-3</code> for 4 columns!</p>
      <p><strong>Why:</strong> This helps you understand how the grid works. You can remove this practice section later once you're comfortable with grids.</p>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Create a 2-column layout: change all <code>col-md-4</code> to <code>col-md-6</code></li>
        <li>Create a 4-column layout: change all <code>col-md-4</code> to <code>col-md-3</code></li>
        <li>Try an uneven layout: <code>col-md-8</code> and <code>col-md-4</code> (wide + narrow)</li>
        <li>Center a column: use <code>col-md-6 mx-auto</code> for a centered half-width column</li>
      </ul>
      
      <div class="alert alert-success mt-4">
        <strong>📖 What's Next:</strong> In the next lesson, you'll learn about Bootstrap cards and other components. Cards are perfect containers for content!
      </div>
    `
  },
  cards: {
    title: 'Cards & Components',
    content: `
      <h2>Bootstrap Cards</h2>
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
      
      <h2>🎯 Add to Your Website: Practice Cards</h2>
      <p><strong>📍 Placement:</strong> Add this practice section after your grid practice (or replace the grid practice with this):</p>
      <div class="code-block">
        <code>&lt;!-- Practice cards section --&gt;
&lt;div class="container mt-5"&gt;
  &lt;h2 class="text-center mb-4"&gt;Card Practice&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;div class="card"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;Card 1&lt;/h5&gt;
          &lt;p class="card-text"&gt;This is a basic card with some content.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;div class="card border-primary"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;Card 2&lt;/h5&gt;
          &lt;p class="card-text"&gt;This card has a colored border.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    &lt;div class="col-md-4 mb-4"&gt;
      &lt;div class="card bg-light"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;Card 3&lt;/h5&gt;
          &lt;p class="card-text"&gt;This card has a light background.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Experiment with different card styles. Try adding <code>border-success</code>, <code>bg-primary text-white</code>, or add images with <code>card-img-top</code>!</p>
      <p><strong>Why:</strong> Cards are versatile containers. Understanding them will help you build beautiful layouts. You can remove this practice section later.</p>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Add an image to a card using <code>card-img-top</code></li>
        <li>Try different border colors: <code>border-success</code>, <code>border-warning</code>, <code>border-info</code></li>
        <li>Add a list group inside a card using <code>list-group list-group-flush</code></li>
        <li>Create a card with a quote using <code>blockquote</code></li>
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
      <p><strong>📍 Placement:</strong> Add this biography section after your hero section (after the closing <code>&lt;/div&gt;</code> of the hero):</p>
      <p><strong>💡 Remember:</strong> You've already learned about grids and cards in previous lessons. Now you'll combine them to create a beautiful biography section!</p>
      
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
      <p><strong>What to modify:</strong> Replace the placeholder text with your actual biography! Write about yourself, your background, interests, and goals.</p>
      <p><strong>Why:</strong> Cards create nice visual containers. <code>col-md-8 mx-auto</code> makes it centered (8/12 width) and responsive. <code>mt-5</code> adds top margin for spacing. <code>id="about"</code> lets the navbar "About" link jump to this section.</p>
      
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
        <strong>✅ Progress Checkpoint:</strong> You now have a hero section and biography! Your navbar "About" link should work. Test it by clicking the link in your navbar.
      </div>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Change the card background color by adding <code>bg-light</code> or <code>bg-primary</code> to the <code>card</code> div</li>
        <li>Try changing <code>col-md-8</code> to <code>col-md-10</code> to make the biography wider</li>
        <li>Add a profile image inside your card using <code>&lt;img src="..." class="img-fluid rounded mb-3"&gt;</code></li>
      </ul>
      
      <div class="alert alert-success mt-3">
        <strong>📖 What's Next:</strong> In the next lesson, you'll add a music/podcast section with interactive accordions!
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
      <p><strong>📍 Placement:</strong> Add this section after the movies section (after the closing <code>&lt;/div&gt;</code> of the movies container). <strong>Customize with your favorite music or podcast!</strong></p>
      <div class="code-block">
        <code>&lt;!-- Music section: light background, 2-column layout --&gt;
&lt;div class="container bg-light py-5 my-5" id="music"&gt;
  &lt;div class="row"&gt;
    &lt;!-- Left column: 4/12 width (33%) with centered image --&gt;
    &lt;div class="col-lg-4 text-center mb-4"&gt;
      &lt;img src="https://via.placeholder.com/300x300/22c55e/ffffff?text=Album+Art" class="img-fluid rounded-circle mb-3" alt="Album art"&gt;
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
      <p><strong>What to modify:</strong> Replace with your favorite artist/podcast, add real album art URL, list your favorite songs/episodes!</p>
      <p><strong>Why:</strong> Accordions let you organize lots of information. <code>bg-light</code> adds a subtle background. <code>rounded-circle</code> makes the image circular. <code>id="music"</code> lets the navbar "Music" link jump here.</p>
      
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
      
      <div class="alert alert-success mt-4">
        <strong>📖 What's Next:</strong> In the final lesson, you'll add a quick facts section to showcase more about yourself!
      </div>
    `
  },
  images: {
    title: 'Images with Bootstrap',
    content: `
      <h2>Adding Images</h2>
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
        <img src="https://via.placeholder.com/300x200/38bdf8/ffffff?text=Responsive+Image" alt="Sample image" class="img-fluid rounded mb-3">
        <img src="https://via.placeholder.com/150x150/22c55e/ffffff?text=Circle" alt="Circular" class="img-fluid rounded-circle" style="max-width: 150px;">
      </div>
      
      <h2>🎯 Add to Your Website: Logo in Navbar</h2>
      <div class="alert alert-warning">
        <strong>⚠️ Important Placement:</strong> The navbar MUST be placed at the very top of your <code>&lt;body&gt;</code> tag, BEFORE your hero section. If you already have a hero section, you'll need to move this navbar code above it!
      </div>
      <p><strong>What to do:</strong> Add this navbar code at the very beginning of your <code>&lt;body&gt;</code> tag (before everything else, including the hero section):</p>
      <div class="code-block">
        <code>&lt;!-- Bootstrap navbar: dark theme, expands on large screens --&gt;
&lt;nav class="navbar navbar-expand-lg navbar-dark bg-dark"&gt;
  &lt;div class="container"&gt;
    &lt;!-- Brand/logo area --&gt;
    &lt;a class="navbar-brand" href="#"&gt;
      &lt;strong&gt;YOUR NAME&lt;/strong&gt;
    &lt;/a&gt;
    &lt;!-- Mobile menu toggle button --&gt;
    &lt;button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"&gt;
      &lt;span class="navbar-toggler-icon"&gt;&lt;/span&gt;
    &lt;/button&gt;
    &lt;!-- Collapsible menu content --&gt;
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
      <p><strong>What to modify:</strong> Change "YOUR NAME" to your actual name (this is your logo/brand). You can also replace it with an image logo if you have one!</p>
      <p><strong>Why:</strong> The navbar provides navigation. <code>navbar-expand-lg</code> makes it collapse on mobile. <code>ms-auto</code> pushes links to the right. The links will work once we add those sections later!</p>
      <p><strong>Note:</strong> The "About" link points to your biography section (we'll add an id there later). The "Movies" and "Music" links will work once we add those sections in the Layout lesson.</p>
      
      <h3>📚 Understanding Navbar Structure</h3>
      <p>The navbar has several key parts:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>navbar:</strong> Main container for the navigation bar</li>
        <li><strong>navbar-expand-lg:</strong> Navbar expands (shows full menu) on large screens, collapses on smaller screens</li>
        <li><strong>navbar-dark bg-dark:</strong> Dark theme (text is light, background is dark). Alternatives: <code>navbar-light bg-light</code> for light theme</li>
        <li><strong>navbar-brand:</strong> Your logo/brand name area (usually on the left)</li>
        <li><strong>navbar-toggler:</strong> The hamburger menu button (shows on mobile)</li>
        <li><strong>collapse navbar-collapse:</strong> The collapsible menu content (hides on mobile, shows when toggled)</li>
        <li><strong>navbar-nav:</strong> Container for navigation links</li>
        <li><strong>nav-item:</strong> Each individual navigation link container</li>
        <li><strong>nav-link:</strong> The actual clickable link</li>
        <li><strong>ms-auto:</strong> Margin-start auto - pushes links to the right side</li>
        <li><strong>active:</strong> Highlights the current page/section</li>
        <li><strong>data-bs-toggle="collapse":</strong> Bootstrap JavaScript attribute for toggling the mobile menu</li>
        <li><strong>data-bs-target="#navbarNav":</strong> Points to the element to collapse/expand (must match the <code>id</code> of the collapsible div)</li>
      </ul>
      
      <h3>Image Attributes</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>src:</strong> The path to the image file (required)</li>
        <li><strong>alt:</strong> Alternative text for accessibility (required)</li>
        <li><strong>class="img-fluid":</strong> Makes image responsive</li>
        <li><strong>class="rounded":</strong> Adds rounded corners</li>
      </ul>
      
      <h3>Best Practices</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Always use <code>img-fluid</code> for responsive images</li>
        <li>Always include the <code>alt</code> attribute</li>
        <li>Use Bootstrap classes instead of inline styles when possible</li>
      </ul>
      
      <div class="common-mistakes">
        <h4>⚠️ Common Mistakes to Avoid</h4>
        <ul>
          <li><strong>Navbar not showing:</strong> Make sure it's placed BEFORE the hero section in your HTML - at the very top of <code>&lt;body&gt;</code></li>
          <li><strong>Navbar not collapsing on mobile:</strong> Check that Bootstrap JS is loaded. The <code>data-bs-toggle</code> and <code>data-bs-target</code> attributes need Bootstrap JS to work</li>
          <li><strong>Links not working:</strong> The "Movies" and "Music" links will work once you add those sections with matching <code>id</code> attributes (e.g., <code>id="movies"</code>)</li>
          <li><strong>Toggle button not working:</strong> Make sure <code>data-bs-target="#navbarNav"</code> matches the <code>id="navbarNav"</code> on the collapsible div</li>
          <li><strong>Links on wrong side:</strong> Use <code>ms-auto</code> to push links right, or remove it to keep them left</li>
        </ul>
      </div>
      
      <div class="alert alert-info mt-4">
        <strong>✅ Progress Checkpoint:</strong> You now have a navbar! Make sure it appears at the top of your page. The "About" link should jump to your biography section.
      </div>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Change the navbar color from <code>bg-dark</code> to <code>bg-primary</code> or <code>bg-success</code></li>
        <li>Add an image logo by replacing the text with <code>&lt;img src="logo.png" alt="Logo" height="30"&gt;</code></li>
        <li>Add more navigation links (e.g., "Contact", "Portfolio") - just copy a <code>&lt;li class="nav-item"&gt;</code> block</li>
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
      <p><strong>📍 Placement:</strong> Add this footer at the very end of your page (before the closing <code>&lt;/body&gt;</code> tag):</p>
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
      <p><strong>What to modify:</strong> Add your name, update the email and social media links (or remove buttons you don't use), change the copyright year!</p>
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
        <strong>✅ Progress Checkpoint:</strong> You now have a complete page structure: navbar, hero, biography, and footer! Test all your links. Update the social media links with your real profiles (or remove buttons you don't use).
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
      <p>Now that you understand grids and cards, let's build a more complex section combining multiple components!</p>
      
      <h3>What You'll Learn</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Using cards with images (<code>card-img-top</code>)</li>
        <li>Creating 2-column layouts with equal-height cards (<code>h-100</code>)</li>
        <li>Using list groups inside cards (<code>list-group-flush</code>)</li>
        <li>Styling quotes with blockquotes</li>
      </ul>
      
      <h2>🎯 Add to Your Website: Movies Section</h2>
      <p><strong>📍 Placement:</strong> Add this movies section after your biography section (after the closing <code>&lt;/div&gt;</code> of the biography container). <strong>Replace with your favorite movie series!</strong></p>
      <div class="code-block">
        <code>&lt;div class="container my-5" id="movies"&gt;
  &lt;h2 class="text-center mb-4"&gt;My Favorite Movie Series&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-6 mb-4"&gt;
      &lt;div class="card h-100"&gt;
        &lt;img src="https://via.placeholder.com/400x300/38bdf8/ffffff?text=Movie+Poster" class="card-img-top" alt="Movie poster"&gt;
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
      <p><strong>What to modify:</strong> Change the movie name, add your own image URL, write your thoughts, and add a real quote!</p>
      <p><strong>Why:</strong> Using <code>col-md-6</code> creates two equal columns (50% each). <code>h-100</code> makes cards the same height. <code>list-group</code> creates clean lists. <code>id="movies"</code> lets the navbar "Movies" link jump to this section.</p>
      
      <h3>📚 New Components Used</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>list-group:</strong> Creates styled lists. <code>list-group-flush</code> removes borders.</li>
        <li><strong>blockquote:</strong> Styles quoted text. <code>blockquote-footer</code> adds attribution.</li>
        <li><strong>card-img-top:</strong> Places image at top of card.</li>
      </ul>
      
      <h3>🎯 Try It Yourself</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>Add a third card by changing <code>col-md-6</code> to <code>col-md-4</code> (creates 3 equal columns)</li>
        <li>Try different card styles: add <code>border-primary</code> or <code>bg-light</code> to cards</li>
        <li>Add more list items to the <code>list-group</code> (e.g., "Release Year", "Director")</li>
      </ul>
      
      <hr class="my-4" style="border-color: var(--border);">
      
      <h2>🎯 Add to Your Website: Music/Podcast Section</h2>
      <p><strong>📍 Placement:</strong> Add this section after the movies section (after the closing <code>&lt;/div&gt;</code> of the movies container). <strong>Customize with your favorite music or podcast!</strong></p>
      <div class="code-block">
        <code>&lt;!-- Music section: light background, 2-column layout --&gt;
&lt;div class="container bg-light py-5 my-5" id="music"&gt;
  &lt;div class="row"&gt;
    &lt;!-- Left column: 4/12 width (33%) with centered image --&gt;
    &lt;div class="col-lg-4 text-center mb-4"&gt;
      &lt;img src="https://via.placeholder.com/300x300/22c55e/ffffff?text=Album+Art" class="img-fluid rounded-circle mb-3" alt="Album art"&gt;
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
      <p><strong>What to modify:</strong> Replace with your favorite artist/podcast, add real album art URL, list your favorite songs/episodes!</p>
      <p><strong>Why:</strong> Accordions let you organize lots of information. <code>bg-light</code> adds a subtle background. <code>rounded-circle</code> makes the image circular. <code>id="music"</code> lets the navbar "Music" link jump here.</p>
      
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
      
      <div class="alert alert-success mt-4">
        <strong>📖 What's Next:</strong> In the final lesson, you'll add a quick facts section to showcase more about yourself!
      </div>
    `
  },
  layoutQuickFacts: {
    title: 'Advanced Layout: Quick Facts',
    content: `
      <h2>Multi-Column Card Layouts</h2>
      <p>Sometimes you want to display multiple items in a row. Using <code>col-md-3</code> creates 4 equal columns (3+3+3+3=12).</p>
      
      <h3>Key Concepts</h3>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li><strong>col-md-3:</strong> 4 equal columns (25% each on medium+ screens)</li>
        <li><strong>border-*:</strong> Colored borders for visual distinction</li>
        <li><strong>h-100:</strong> Makes all cards equal height in a row</li>
        <li><strong>text-center:</strong> Centers content within cards</li>
      </ul>
      
      <h2>🎯 Add to Your Website: Quick Facts Section</h2>
      <p><strong>📍 Placement:</strong> Add this section before your footer (before the <code>&lt;footer&gt;</code> tag) to showcase more about yourself!</p>
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
        <strong>✅ Progress Checkpoint:</strong> You've now added all major sections! Test your navbar links - "Movies" and "Music" should now jump to their sections. Make sure all your content is personalized!
      </div>
      
      <h2>✅ Final Checklist</h2>
      <p>Before you export, make sure you've:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>✅ Set up basic HTML structure (Introduction lesson)</li>
        <li>✅ Added hero section with headings (Headings lesson)</li>
        <li>✅ Learned grid basics (Layout Basics lesson)</li>
        <li>✅ Learned cards and components (Cards lesson)</li>
        <li>✅ Added biography section with <code>id="about"</code> (Paragraphs lesson)</li>
        <li>✅ Added navbar at the top with working links (Images lesson)</li>
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
        <strong>🎉 Congratulations!</strong> You've built a complete, professional-looking website! Now go to the <strong>Export Site</strong> tab to download your HTML file. You can open it in any browser or host it online!
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
      <p>In this guided project, you'll build a complete multi-page website about yourself! We'll create:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>✅ A homepage with your biography</li>
        <li>✅ A page about your favorite movie series</li>
        <li>✅ A page about music or podcasts you like</li>
        <li>✅ A professional navbar with logo</li>
        <li>✅ A footer with social links</li>
        <li>✅ Beautiful Bootstrap styling throughout</li>
      </ul>
      
      <h2>📋 Step 1: Set Up the Basic Structure</h2>
      <p><strong>What to do:</strong> Copy this starter code into your Practice Builder. This is your homepage (index.html).</p>
      <div class="code-block">
        <code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
  &lt;meta charset="UTF-8"&gt;
  &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
  &lt;title&gt;My Personal Website&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div class="container"&gt;
    &lt;h1&gt;Welcome to My Website&lt;/h1&gt;
    &lt;p&gt;This is where your content will go!&lt;/p&gt;
  &lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</code>
      </div>
      <p><strong>Why:</strong> Every HTML page needs this basic structure. The <code>container</code> class centers your content and adds padding.</p>
      
      <h2>📋 Step 2: Add the Navbar</h2>
      <p><strong>What to do:</strong> Replace the content inside <code>&lt;body&gt;</code> with this navbar code. <strong>Modify the links and your name!</strong></p>
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
          &lt;a class="nav-link active" href="#"&gt;Home&lt;/a&gt;
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
      <p><strong>What to modify:</strong> Change "YOUR NAME" to your actual name. This creates a logo/brand area.</p>
      <p><strong>Why:</strong> The navbar provides navigation. <code>navbar-expand-lg</code> makes it collapse on mobile. <code>ms-auto</code> pushes links to the right.</p>
      
      <h2>📋 Step 3: Create the Hero Section</h2>
      <p><strong>What to do:</strong> Add this hero section right after the closing <code>&lt;/nav&gt;</code> tag.</p>
      <div class="code-block">
        <code>&lt;div class="bg-primary text-white text-center py-5 mb-5"&gt;
  &lt;div class="container"&gt;
    &lt;h1 class="display-3"&gt;Welcome to My Website&lt;/h1&gt;
    &lt;p class="lead"&gt;Learn about me, my interests, and what I love!&lt;/p&gt;
  &lt;/div&gt;
&lt;/div&gt;</code>
      </div>
      <p><strong>What to modify:</strong> Change the heading and description to something personal!</p>
      <p><strong>Why:</strong> The hero section is the first thing visitors see. <code>display-3</code> makes a large heading, <code>lead</code> makes the paragraph stand out.</p>
      
      <h2>📋 Step 4: Add Your Biography Section</h2>
      <p><strong>What to do:</strong> Add this biography section after the hero section. <strong>Fill in your own information!</strong></p>
      <div class="code-block">
        <code>&lt;div class="container"&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-8 mx-auto"&gt;
      &lt;div class="card mb-4"&gt;
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
      <p><strong>What to modify:</strong> Replace the placeholder text with your actual biography!</p>
      <p><strong>Why:</strong> Cards create nice visual containers. <code>col-md-8 mx-auto</code> makes it centered and responsive.</p>
      
      <h2>📋 Step 5: Add the Movies Section</h2>
      <p><strong>What to do:</strong> Add this section after your biography. <strong>Replace with your favorite movie series!</strong></p>
      <div class="code-block">
        <code>&lt;div class="container" id="movies"&gt;
  &lt;h2 class="text-center mb-4"&gt;My Favorite Movie Series&lt;/h2&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-md-6 mb-4"&gt;
      &lt;div class="card h-100"&gt;
        &lt;img src="https://via.placeholder.com/400x300/38bdf8/ffffff?text=Movie+Poster" class="card-img-top" alt="Movie poster"&gt;
        &lt;div class="card-body"&gt;
          &lt;h5 class="card-title"&gt;Movie Series Name&lt;/h5&gt;
          &lt;p class="card-text"&gt;
            Write why you love this movie series. What makes it special? 
            Which is your favorite film in the series?
          &lt;/p&gt;
          &lt;ul class="list-group list-group-flush"&gt;
            &lt;li class="list-group-item"&gt;&lt;strong&gt;Genre:&lt;/strong&gt; Action, Adventure&lt;/li&gt;
            &lt;li class="list-group-item"&lt;&lt;strong&gt;My Rating:&lt;/strong&gt; ⭐⭐⭐⭐⭐&lt;/li&gt;
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
      <p><strong>What to modify:</strong> Change the movie name, add your own image URL, write your thoughts, and add a real quote!</p>
      <p><strong>Why:</strong> Using <code>col-md-6</code> creates two equal columns. <code>h-100</code> makes cards the same height. <code>list-group</code> creates clean lists.</p>
      
      <h2>📋 Step 6: Add the Music/Podcast Section</h2>
      <p><strong>What to do:</strong> Add this section after the movies section. <strong>Customize with your favorite music or podcast!</strong></p>
      <div class="code-block">
        <code>&lt;div class="container bg-light py-5 my-5" id="music"&gt;
  &lt;div class="row"&gt;
    &lt;div class="col-lg-4 text-center mb-4"&gt;
      &lt;img src="https://via.placeholder.com/300x300/22c55e/ffffff?text=Album+Art" class="img-fluid rounded-circle mb-3" alt="Album art"&gt;
      &lt;h3&gt;Artist/Podcast Name&lt;/h3&gt;
      &lt;p class="text-muted"&gt;Genre or Category&lt;/p&gt;
    &lt;/div&gt;
    &lt;div class="col-lg-8"&gt;
      &lt;h2&gt;My Favorite Music/Podcast&lt;/h2&gt;
      &lt;p class="lead"&gt;
        Write about your favorite artist, band, or podcast here. 
        What makes them special? When did you discover them?
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
      <p><strong>What to modify:</strong> Replace with your favorite artist/podcast, add real album art URL, list your favorite songs/episodes!</p>
      <p><strong>Why:</strong> Accordions let you organize lots of information. <code>bg-light</code> adds a subtle background. <code>rounded-circle</code> makes the image circular.</p>
      
      <h2>📋 Step 7: Add the Footer</h2>
      <p><strong>What to do:</strong> Add this footer at the very end, before the closing <code>&lt;/body&gt;</code> tag.</p>
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
      <p><strong>What to modify:</strong> Add your name, update social links (or remove buttons you don't use), change the copyright year!</p>
      <p><strong>Why:</strong> The footer provides contact info and gives your site a professional finish. <code>text-md-end</code> aligns content right on larger screens.</p>
      
      <h2>📋 Step 8: Add Some Final Touches</h2>
      <p><strong>What to do:</strong> Add this "Quick Facts" section before the footer to showcase more about yourself!</p>
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
      <p><strong>What to modify:</strong> Fill in your education, goals, skills, and a fun fact about yourself!</p>
      <p><strong>Why:</strong> This creates visual interest with colored borders. <code>col-md-3</code> makes 4 equal columns on medium+ screens.</p>
      
      <h2>✅ Final Checklist</h2>
      <p>Before you export, make sure you've:</p>
      <ul style="line-height: 1.8; color: var(--text-muted); margin-left: 20px;">
        <li>✅ Replaced "YOUR NAME" with your actual name</li>
        <li>✅ Written your biography</li>
        <li>✅ Added information about your favorite movie series</li>
        <li>✅ Added information about your favorite music/podcast</li>
        <li>✅ Updated all placeholder images (or kept placeholders)</li>
        <li>✅ Added your social links in the footer</li>
        <li>✅ Filled in the Quick Facts section</li>
        <li>✅ Checked that everything looks good in the preview!</li>
      </ul>
      
      <h2>🎉 Congratulations!</h2>
      <p>You've built a complete, professional-looking website! Now go to the <strong>Export Site</strong> tab to download your HTML file. You can open it in any browser or host it online!</p>
      
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
    button.textContent = '📋 Copy';
    button.addEventListener('click', () => {
      const code = block.querySelector('code');
      if (code) {
        const text = code.textContent;
        navigator.clipboard.writeText(text).then(() => {
          button.textContent = '✅ Copied!';
          button.classList.add('copied');
          setTimeout(() => {
            button.textContent = '📋 Copy';
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

// Progress tracking
const progressSections = {
  structure: ['intro'],
  hero: ['headings'],
  biography: ['paragraphs'],
  navbar: ['images'],
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

// Search functionality
const lessonSearch = document.getElementById('lessonSearch');
if (lessonSearch) {
  lessonSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const navItems = document.querySelectorAll('.lesson-nav-item');
    
    navItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(query)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
}

// Keyboard shortcuts
let currentLessonIndex = 0;
const lessonNavItems = document.querySelectorAll('.lesson-nav-item');
document.addEventListener('keydown', (e) => {
  // Only handle shortcuts when not typing in input/textarea
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      lessonSearch?.focus();
    }
    return;
  }
  
  const visibleLessons = Array.from(lessonNavItems).filter(item => !item.classList.contains('hidden'));
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    currentLessonIndex = Math.min(currentLessonIndex + 1, visibleLessons.length - 1);
    visibleLessons[currentLessonIndex]?.click();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    currentLessonIndex = Math.max(currentLessonIndex - 1, 0);
    visibleLessons[currentLessonIndex]?.click();
  }
});

// Lesson navigation
const lessonDisplay = document.getElementById('lessonDisplay');

lessonNavItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    const lessonId = item.getAttribute('data-lesson');
    
    // Update active state
    lessonNavItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    currentLessonIndex = index;
    
    // Update progress
    updateProgress(lessonId);
    
    // Display lesson
    if (lessons[lessonId]) {
      lessonDisplay.innerHTML = `
        <div class="lesson-section">
          ${lessons[lessonId].content}
        </div>
      `;
      
      // Add copy buttons and syntax highlighting after content is loaded
      setTimeout(() => {
        addCopyButtons();
        addSyntaxHighlighting();
      }, 10);
    }
  });
});

// Load progress on page load
loadProgress();

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

// Initialize CodeMirror for syntax highlighting
let htmlEditor;
if (typeof CodeMirror !== 'undefined') {
  htmlEditor = CodeMirror.fromTextArea(htmlEditorElement, {
    mode: 'htmlmixed',
    theme: 'monokai',
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    autoCloseTags: true,
    matchTags: true,
    autoCloseBrackets: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  });
  
  // Update preview when editor content changes
  htmlEditor.on('change', () => {
    updatePreview();
    debouncedSave();
  });
} else {
  // Fallback to regular textarea if CodeMirror fails to load
  htmlEditor = {
    getValue: () => htmlEditorElement.value,
    setValue: (val) => { htmlEditorElement.value = val; },
    on: () => {}
  };
  htmlEditorElement.addEventListener('input', () => {
    updatePreview();
    debouncedSave();
  });
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
  
  // Check for Bootstrap
  if (!html.includes('bootstrap') && !html.includes('Bootstrap')) {
    errors.push('Bootstrap CDN links not found. Add Bootstrap CSS and JS links.');
  }
  
  return errors;
}

function updatePreview() {
  const htmlContent = htmlEditor.getValue();
  const errorDiv = document.getElementById('previewError');
  
  // Validate HTML
  const errors = validateHTML(htmlContent);
  
  if (errors.length > 0) {
    errorDiv.style.display = 'block';
    errorDiv.innerHTML = `<strong>⚠️ Issues found:</strong><ul style="margin: 8px 0 0 20px; font-size: 0.9em;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
  } else {
    errorDiv.style.display = 'none';
  }
  
  try {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    previewFrame.src = url;
    
    // Handle iframe errors
    previewFrame.onerror = () => {
      errorDiv.style.display = 'block';
      errorDiv.textContent = 'Error loading preview. Check your HTML syntax.';
    };
  } catch (error) {
    errorDiv.style.display = 'block';
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

// CodeMirror handles Tab/Shift+Tab indentation automatically, so we don't need custom handlers
// The 'change' event is already set up above for CodeMirror

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
    toggleViewBtn.textContent = isFullPreview ? '✏️ Editor' : '🔍 Full Page';
    toggleViewBtn.title = isFullPreview ? 'Show editor and preview' : 'Show full-page preview only';
    
    // Refresh preview when toggling to ensure it's up to date
    if (isFullPreview) {
      updatePreview();
    }
  });
}

const defaultContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1 class="display-4">Hello World!</h1>
    <p class="lead">Start building with Bootstrap 5 classes...</p>
    <button class="btn btn-primary">Click Me</button>
  </div>
  <!-- Bootstrap 5 JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all content?')) {
    htmlEditor.setValue(defaultContent);
    updatePreview();
    clearSavedContent();
  }
});

// Load saved content on page load
async function loadSavedContent() {
  const saved = await loadContent();
  if (saved) {
    htmlEditor.setValue(saved);
    updatePreview();
    // Show a subtle notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';
    notification.innerHTML = `
      <strong>Restored!</strong> Your previous work has been loaded.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  } else {
    htmlEditor.setValue(defaultContent);
  }
  updatePreview();
}

// Load saved content when page loads
loadSavedContent();

// Export functionality
const exportBtn = document.getElementById('exportBtn');
const exportImageBtn = document.getElementById('exportImageBtn');
const siteTitleInput = document.getElementById('siteTitle');
const exportHtml = document.getElementById('exportHtml');

// Copy from practice builder to export
const practiceTab = document.getElementById('practiceTab');
const exportTab = document.getElementById('exportTab');

// Auto-sync Practice Builder to Export tab
const exportTabButton = document.querySelector('[data-tab="export"]');
if (exportTabButton) {
  exportTabButton.addEventListener('click', () => {
    if (htmlEditor.getValue().trim()) {
      exportHtml.value = htmlEditor.getValue();
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
      notification.style.zIndex = '9999';
      notification.style.maxWidth = '400px';
      notification.innerHTML = `
        <strong>Content synced!</strong> Your Practice Builder content has been copied to the export field.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  });
}

exportBtn.addEventListener('click', () => {
  const title = siteTitleInput.value || 'My HTML Site';
  let htmlContent = exportHtml.value.trim();
  
  if (!htmlContent) {
    alert('Please enter HTML content to export.');
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
    // Check if html2canvas is loaded
    if (typeof html2canvas === 'undefined') {
      alert('Image export library not loaded. Please refresh the page and try again.');
      return;
    }
    
    const title = siteTitleInput.value || 'My HTML Site';
    
    try {
      // Show loading state
      exportImageBtn.disabled = true;
      const originalText = exportImageBtn.textContent;
      exportImageBtn.textContent = '⏳ Generating...';
      
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
          canvas = await html2canvas(iframeBody, {
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
        
        canvas = await html2canvas(tempContainer, {
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
      exportImageBtn.textContent = '📸 Download as Image';
    }
  });
}


