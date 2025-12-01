// Tab switching
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

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
  });
});

// Design examples data
const designExamples = {
  layout: {
    bad: `
      <div style="padding: 10px; background: #f0f0f0;">
        <h1 style="font-size: 24px; margin: 5px;">Welcome</h1>
        <p style="font-size: 12px; color: #666;">Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <div style="width: 100%; background: #ccc; padding: 5px; margin-top: 5px;">
          <button style="background: blue; color: white; border: none; padding: 3px 8px;">Click Here</button>
          <button style="background: red; color: white; border: none; padding: 3px 8px; margin-left: 2px;">Cancel</button>
        </div>
        <div style="margin-top: 10px;">
          <div style="background: #ddd; padding: 8px; margin: 2px 0;">Item 1</div>
          <div style="background: #ddd; padding: 8px; margin: 2px 0;">Item 2</div>
          <div style="background: #ddd; padding: 8px; margin: 2px 0;">Item 3</div>
        </div>
        <p style="font-size: 10px; color: #999; margin-top: 15px;">Footer text here</p>
      </div>
    `,
    badIssues: [
      "No clear visual hierarchy - all elements compete for attention",
      "Inconsistent spacing - elements are cramped together",
      "No grid structure - layout feels chaotic",
      "Poor use of whitespace - everything feels cluttered",
      "No clear content sections or grouping"
    ],
    good: `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, sans-serif;">
        <header style="margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
          <h1 style="font-size: 32px; font-weight: 700; color: #111827; margin: 0 0 8px 0;">Welcome</h1>
          <p style="font-size: 16px; color: #6b7280; margin: 0;">A well-structured page with clear hierarchy</p>
        </header>
        
        <main style="margin-bottom: 40px;">
          <p style="font-size: 18px; line-height: 1.7; color: #374151; margin-bottom: 24px;">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          
          <div style="display: flex; gap: 16px; margin-top: 32px;">
            <button style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer;">Primary Action</button>
            <button style="background: transparent; color: #3b82f6; border: 2px solid #3b82f6; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer;">Secondary</button>
          </div>
          
          <div style="margin-top: 48px;">
            <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin-bottom: 16px;">Content Section</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Item 1</h3>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">Description</p>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Item 2</h3>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">Description</p>
              </div>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">Item 3</h3>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">Description</p>
              </div>
            </div>
          </div>
        </main>
        
        <footer style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="font-size: 14px; color: #9ca3af; margin: 0;">© 2024 Example Site</p>
        </footer>
      </div>
    `,
    goodNotes: [
      "Clear visual hierarchy with proper heading sizes",
      "Consistent spacing using a grid system",
      "Proper use of whitespace for breathing room",
      "Content grouped into logical sections",
      "Responsive grid layout that adapts to screen size"
    ]
  },
  contrast: {
    bad: `
      <div style="background: #f5f5f5; padding: 30px; color: #e0e0e0;">
        <h1 style="color: #f0f0f0; font-size: 28px;">Low Contrast Heading</h1>
        <p style="color: #d0d0d0; font-size: 16px; line-height: 1.5;">
          This text is very hard to read because it doesn't have enough contrast with the background. 
          Users with vision impairments will struggle to read this content.
        </p>
        <button style="background: #cccccc; color: #dddddd; border: none; padding: 10px 20px; margin-top: 15px;">Low Contrast Button</button>
        <div style="background: #eeeeee; padding: 15px; margin-top: 20px; border: 1px solid #e5e5e5;">
          <p style="color: #d5d5d5;">Important information that's hard to see</p>
        </div>
      </div>
    `,
    badIssues: [
      "Text color (#e0e0e0) on light background (#f5f5f5) has very low contrast ratio",
      "Button text is barely visible against button background",
      "Does not meet WCAG AA contrast requirements (4.5:1 for normal text)",
      "Important information blends into the background",
      "Users with color blindness or low vision cannot read the content"
    ],
    good: `
      <div style="background: #ffffff; padding: 30px; color: #1f2937;">
        <h1 style="color: #111827; font-size: 32px; font-weight: 700; margin-bottom: 16px;">High Contrast Heading</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
          This text is easy to read because it has sufficient contrast with the background. 
          The contrast ratio meets WCAG AA standards, making it accessible to all users.
        </p>
        <button style="background: #2563eb; color: #ffffff; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; cursor: pointer;">High Contrast Button</button>
        <div style="background: #eff6ff; padding: 20px; margin-top: 24px; border-left: 4px solid #2563eb; border-radius: 4px;">
          <p style="color: #1e40af; font-weight: 500; margin: 0;">Important information that stands out clearly</p>
        </div>
      </div>
    `,
    goodNotes: [
      "Text color (#1f2937) on white background meets WCAG AA contrast (7:1 ratio)",
      "Button has high contrast between text and background",
      "Meets accessibility standards for users with vision impairments",
      "Important information uses color and visual weight to stand out",
      "All text is readable without straining"
    ]
  },
  spacing: {
    bad: `
      <div style="padding: 5px;">
        <h1 style="margin: 2px; font-size: 20px;">Cramped Layout</h1>
        <p style="margin: 2px; font-size: 14px; line-height: 1.2;">This paragraph has no breathing room. Everything feels cramped and hard to read. The text runs together making it difficult to scan.</p>
        <div style="margin: 2px; padding: 5px; background: #f0f0f0;">
          <p style="margin: 2px;">Tight spacing makes content feel cluttered</p>
          <button style="margin: 2px; padding: 4px 8px;">Button</button>
        </div>
        <ul style="margin: 2px; padding-left: 15px;">
          <li style="margin: 1px 0;">Item one with no spacing</li>
          <li style="margin: 1px 0;">Item two cramped together</li>
          <li style="margin: 1px 0;">Item three hard to distinguish</li>
        </ul>
      </div>
    `,
    badIssues: [
      "Insufficient padding and margins - elements are cramped together",
      "Line height too tight (1.2) - text is hard to read",
      "No visual separation between sections",
      "List items are too close together",
      "Overall feeling of clutter and overwhelm"
    ],
    good: `
      <div style="padding: 40px; max-width: 800px; margin: 0 auto;">
        <h1 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 700;">Comfortable Spacing</h1>
        <p style="margin: 0 0 32px 0; font-size: 18px; line-height: 1.7; color: #374151;">
          This paragraph has proper spacing. The line height allows text to breathe, making it easy to read and scan. 
          Adequate margins create visual separation between elements.
        </p>
        <div style="margin: 32px 0; padding: 24px; background: #f9fafb; border-radius: 8px;">
          <p style="margin: 0 0 16px 0; color: #111827;">Comfortable spacing makes content feel organized</p>
          <button style="margin-top: 16px; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Button</button>
        </div>
        <ul style="margin: 32px 0; padding-left: 24px; line-height: 1.8;">
          <li style="margin: 8px 0; color: #374151;">Item one with proper spacing</li>
          <li style="margin: 8px 0; color: #374151;">Item two clearly separated</li>
          <li style="margin: 8px 0; color: #374151;">Item three easy to distinguish</li>
        </ul>
      </div>
    `,
    goodNotes: [
      "Generous padding (40px) creates breathing room",
      "Proper line height (1.7) improves readability",
      "Consistent spacing rhythm (16px, 24px, 32px)",
      "List items have adequate margin (8px) for clarity",
      "Visual hierarchy through spacing, not just size"
    ]
  },
  accessibility: {
    bad: `
      <div style="padding: 20px;">
        <div style="font-size: 18px; color: blue;">Click here</div>
        <img src="image.jpg" style="width: 200px;">
        <div style="background: red; padding: 10px; margin-top: 10px;">
          <span style="font-size: 12px;">Important: Required field</span>
        </div>
        <button style="background: gray;">Submit</button>
        <div style="color: red; font-size: 14px; margin-top: 10px;">Error message</div>
      </div>
    `,
    badIssues: [
      "No alt text on image - screen readers can't describe it",
      "Link text 'Click here' is not descriptive",
      "Color-only indicators (red background) - not accessible to colorblind users",
      "No form labels - screen readers can't identify inputs",
      "Error messages only use color - no text or icons for clarity",
      "Button has no accessible name or aria-label",
      "No keyboard navigation support"
    ],
    good: `
      <div style="padding: 20px; max-width: 600px;">
        <a href="#" style="color: #2563eb; text-decoration: underline; font-size: 18px;">Learn more about accessibility</a>
        <img src="image.jpg" alt="A person using a screen reader on a laptop" style="width: 200px; margin: 20px 0; display: block;">
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin: 16px 0;">
          <span style="font-size: 14px; color: #991b1b; font-weight: 500;">⚠️ Important: This is a required field</span>
        </div>
        <form style="margin-top: 20px;">
          <label for="email" style="display: block; margin-bottom: 8px; font-weight: 500; color: #111827;">Email Address</label>
          <input type="email" id="email" name="email" style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 16px;" aria-required="true">
          <button type="submit" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; margin-top: 16px; cursor: pointer; font-size: 16px;">Submit Form</button>
        </form>
        <div role="alert" style="color: #dc2626; font-size: 14px; margin-top: 12px; display: flex; align-items: center; gap: 8px;">
          <span aria-hidden="true">❌</span>
          <span>Error: Please enter a valid email address</span>
        </div>
      </div>
    `,
    goodNotes: [
      "Descriptive link text that explains the destination",
      "Alt text describes the image content",
      "Multiple indicators (color, icon, text) for important information",
      "Proper form labels with 'for' attribute",
      "ARIA attributes (role='alert', aria-required) for screen readers",
      "Error messages are clear and accessible",
      "Keyboard navigation works properly"
    ]
  },
  navigation: {
    bad: `
      <div style="padding: 10px; background: #333;">
        <div style="display: flex; gap: 5px;">
          <a href="#" style="color: #999; text-decoration: none; padding: 5px;">Home</a>
          <a href="#" style="color: #999; text-decoration: none; padding: 5px;">About</a>
          <a href="#" style="color: #999; text-decoration: none; padding: 5px;">Products</a>
          <a href="#" style="color: #999; text-decoration: none; padding: 5px;">Contact</a>
        </div>
        <div style="margin-top: 20px; padding: 10px; background: #f0f0f0;">
          <p>You are here: Home > Products > Item</p>
          <div style="margin-top: 10px;">
            <a href="#" style="color: blue;">Back</a>
            <a href="#" style="color: blue; margin-left: 10px;">Next</a>
          </div>
        </div>
      </div>
    `,
    badIssues: [
      "Low contrast navigation links (#999 on #333) - hard to see",
      "No visual indication of current page",
      "No hover states - users can't tell what's clickable",
      "Breadcrumb text is unclear and not clickable",
      "Navigation structure is not obvious",
      "No mobile-friendly navigation"
    ],
    good: `
      <div style="padding: 20px; background: #1f2937;">
        <nav style="display: flex; gap: 32px; align-items: center;">
          <a href="#" style="color: #ffffff; text-decoration: none; padding: 8px 0; font-weight: 500; border-bottom: 2px solid #3b82f6;">Home</a>
          <a href="#" style="color: #d1d5db; text-decoration: none; padding: 8px 0; font-weight: 500; transition: color 0.2s;">About</a>
          <a href="#" style="color: #d1d5db; text-decoration: none; padding: 8px 0; font-weight: 500; transition: color 0.2s;">Products</a>
          <a href="#" style="color: #d1d5db; text-decoration: none; padding: 8px 0; font-weight: 500; transition: color 0.2s;">Contact</a>
        </nav>
        <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
          <nav aria-label="Breadcrumb" style="margin-bottom: 16px;">
            <ol style="display: flex; gap: 8px; list-style: none; padding: 0; margin: 0; font-size: 14px;">
              <li><a href="#" style="color: #2563eb; text-decoration: none;">Home</a></li>
              <li style="color: #6b7280;"> / </li>
              <li><a href="#" style="color: #2563eb; text-decoration: none;">Products</a></li>
              <li style="color: #6b7280;"> / </li>
              <li style="color: #111827; font-weight: 500;">Current Item</li>
            </ol>
          </nav>
          <div style="display: flex; gap: 12px;">
            <button style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">← Previous</button>
            <button style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">Next →</button>
          </div>
        </div>
      </div>
    `,
    goodNotes: [
      "High contrast navigation links - easy to see and read",
      "Current page clearly indicated with underline and different color",
      "Hover states provide visual feedback",
      "Breadcrumb navigation is clickable and accessible",
      "Clear navigation hierarchy and structure",
      "ARIA labels for screen readers"
    ]
  },
  forms: {
    bad: `
      <div style="padding: 20px; max-width: 400px;">
        <div style="margin-bottom: 10px;">
          <input type="text" placeholder="Name" style="width: 100%; padding: 5px; border: 1px solid #ccc;">
        </div>
        <div style="margin-bottom: 10px;">
          <input type="email" placeholder="Email" style="width: 100%; padding: 5px; border: 1px solid #ccc;">
        </div>
        <div style="margin-bottom: 10px;">
          <input type="password" placeholder="Password" style="width: 100%; padding: 5px; border: 1px solid #ccc;">
        </div>
        <div style="margin-bottom: 10px;">
          <input type="checkbox"> I agree
        </div>
        <button style="background: blue; color: white; border: none; padding: 8px 16px;">Submit</button>
        <div style="color: red; font-size: 12px; margin-top: 5px;">Error</div>
      </div>
    `,
    badIssues: [
      "No labels - screen readers can't identify fields",
      "Placeholders disappear when typing - users lose context",
      "No indication of required fields",
      "Tiny error text that's hard to read",
      "Checkbox label not associated with input",
      "No visual feedback for focus states",
      "Poor spacing between form elements"
    ],
    good: `
      <div style="padding: 20px; max-width: 500px;">
        <form>
          <div style="margin-bottom: 24px;">
            <label for="name" style="display: block; margin-bottom: 8px; font-weight: 500; color: #111827;">Full Name <span style="color: #dc2626;">*</span></label>
            <input type="text" id="name" name="name" required style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 16px;" aria-required="true">
          </div>
          <div style="margin-bottom: 24px;">
            <label for="email" style="display: block; margin-bottom: 8px; font-weight: 500; color: #111827;">Email Address <span style="color: #dc2626;">*</span></label>
            <input type="email" id="email" name="email" required style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 16px;" aria-required="true">
            <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0 0;">We'll never share your email</p>
          </div>
          <div style="margin-bottom: 24px;">
            <label for="password" style="display: block; margin-bottom: 8px; font-weight: 500; color: #111827;">Password <span style="color: #dc2626;">*</span></label>
            <input type="password" id="password" name="password" required style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 6px; font-size: 16px;" aria-required="true">
          </div>
          <div style="margin-bottom: 24px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="agree" name="agree" required style="width: 18px; height: 18px; cursor: pointer;">
              <span style="color: #374151;">I agree to the terms and conditions <span style="color: #dc2626;">*</span></span>
            </label>
          </div>
          <button type="submit" style="background: #3b82f6; color: white; border: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; width: 100%;">Create Account</button>
          <div role="alert" style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin-top: 16px; border-radius: 4px; display: none;">
            <p style="color: #991b1b; margin: 0; font-size: 14px; font-weight: 500;">⚠️ Please fill in all required fields</p>
          </div>
        </form>
      </div>
    `,
    goodNotes: [
      "Proper labels with 'for' attribute linking to inputs",
      "Required fields clearly marked with asterisk",
      "Helpful hint text below email field",
      "Checkbox label properly associated and clickable",
      "Clear error messages with icons and proper styling",
      "Adequate spacing (24px) between form elements",
      "ARIA attributes for screen reader support",
      "Focus states visible for keyboard navigation"
    ]
  }
};

// Principles content
const principlesContent = `
  <h2>Design Principles</h2>
  
  <h3>1. Visual Hierarchy</h3>
  <p>Visual hierarchy guides users' eyes through your content in order of importance. Use size, color, spacing, and positioning to create clear levels of importance.</p>
  <ul>
    <li><strong>Size:</strong> Larger elements draw more attention</li>
    <li><strong>Color:</strong> Contrasting colors create emphasis</li>
    <li><strong>Spacing:</strong> Whitespace separates and groups content</li>
    <li><strong>Position:</strong> Top-left area gets most attention (F-pattern reading)</li>
  </ul>
  
  <h3>2. Contrast & Readability</h3>
  <p>Contrast ensures text is readable and important elements stand out. Follow WCAG guidelines for accessibility.</p>
  <ul>
    <li><strong>Text Contrast:</strong> Minimum 4.5:1 ratio for normal text, 3:1 for large text</li>
    <li><strong>Color Blindness:</strong> Don't rely solely on color to convey information</li>
    <li><strong>Font Size:</strong> Use at least 16px for body text</li>
    <li><strong>Line Length:</strong> Keep lines between 50-75 characters for readability</li>
  </ul>
  
  <h3>3. Spacing & Typography</h3>
  <p>Proper spacing creates breathing room and makes content scannable. Typography choices affect readability and mood.</p>
  <ul>
    <li><strong>Whitespace:</strong> Generous spacing prevents visual clutter</li>
    <li><strong>Line Height:</strong> 1.5-1.7x font size for comfortable reading</li>
    <li><strong>Consistent Rhythm:</strong> Use a spacing scale (8px, 16px, 24px, 32px)</li>
    <li><strong>Font Pairing:</strong> Limit to 2-3 font families</li>
    <li><strong>Font Weight:</strong> Use different weights to create hierarchy</li>
  </ul>
  
  <h3>4. Accessibility</h3>
  <p>Accessible design ensures everyone can use your website, regardless of abilities. It's not just the right thing to do—it's often required by law.</p>
  <ul>
    <li><strong>Alt Text:</strong> All images need descriptive alt text</li>
    <li><strong>Labels:</strong> Form inputs must have associated labels</li>
    <li><strong>Keyboard Navigation:</strong> All interactive elements must be keyboard accessible</li>
    <li><strong>ARIA:</strong> Use ARIA attributes for complex components</li>
    <li><strong>Color Indicators:</strong> Don't use color alone to convey information</li>
    <li><strong>Focus States:</strong> Visible focus indicators for keyboard users</li>
  </ul>
  
  <h3>5. Navigation & Structure</h3>
  <p>Clear navigation helps users understand where they are and where they can go. Good structure makes content easy to find and understand.</p>
  <ul>
    <li><strong>Current Page:</strong> Always indicate the current page/location</li>
    <li><strong>Breadcrumbs:</strong> Show users their path through the site</li>
    <li><strong>Consistent Placement:</strong> Keep navigation in the same place</li>
    <li><strong>Clear Labels:</strong> Use descriptive, action-oriented link text</li>
    <li><strong>Mobile-Friendly:</strong> Navigation must work on all screen sizes</li>
  </ul>
  
  <h3>6. Forms & Inputs</h3>
  <p>Well-designed forms reduce errors and frustration. Clear labels, helpful hints, and good error handling are essential.</p>
  <ul>
    <li><strong>Labels:</strong> Every input needs a visible, associated label</li>
    <li><strong>Required Fields:</strong> Clearly mark required fields with asterisk or text</li>
    <li><strong>Placeholders:</strong> Use for hints, not as labels (they disappear)</li>
    <li><strong>Error Messages:</strong> Clear, specific, and placed near the field</li>
    <li><strong>Help Text:</strong> Provide context and examples when helpful</li>
    <li><strong>Validation:</strong> Show errors inline, not just on submit</li>
  </ul>
`;

// Quiz questions
const quizQuestions = [
  {
    question: "What's wrong with this navigation?",
    example: `
      <div style="padding: 20px; background: #2d3748;">
        <nav style="display: flex; gap: 20px;">
          <a href="#" style="color: #a0aec0; text-decoration: none;">Home</a>
          <a href="#" style="color: #a0aec0; text-decoration: none;">About</a>
          <a href="#" style="color: #a0aec0; text-decoration: none;">Services</a>
          <a href="#" style="color: #a0aec0; text-decoration: none;">Contact</a>
        </nav>
      </div>
    `,
    options: [
      { text: "Low contrast - links are hard to see", correct: true },
      { text: "Too many navigation items", correct: false },
      { text: "Links are in the wrong order", correct: false },
      { text: "Navigation should be vertical, not horizontal", correct: false }
    ],
    explanation: "The navigation links (#a0aec0) on the dark background (#2d3748) have low contrast, making them hard to read. This fails WCAG accessibility standards."
  },
  {
    question: "What spacing issue do you see here?",
    example: `
      <div style="padding: 5px;">
        <h1 style="margin: 2px; font-size: 24px;">Title</h1>
        <p style="margin: 2px; line-height: 1.1;">This paragraph has very tight spacing. The text feels cramped and is hard to read.</p>
        <button style="margin: 2px; padding: 4px 8px;">Button</button>
      </div>
    `,
    options: [
      { text: "Text is too large", correct: false },
      { text: "Insufficient spacing between elements", correct: true },
      { text: "Wrong font family", correct: false },
      { text: "Too much whitespace", correct: false }
    ],
    explanation: "The margins (2px) and line-height (1.1) are too small, creating a cramped feeling. Proper spacing improves readability and visual hierarchy."
  },
  {
    question: "What accessibility issue is present?",
    example: `
      <div style="padding: 20px;">
        <img src="chart.jpg" style="width: 300px;">
        <p>As you can see in the image above, sales increased by 25%.</p>
        <button style="background: red; padding: 10px;">Submit</button>
      </div>
    `,
    options: [
      { text: "Image is too large", correct: false },
      { text: "Missing alt text on image", correct: true },
      { text: "Button color is wrong", correct: false },
      { text: "Text is too small", correct: false }
    ],
    explanation: "The image has no alt text, so screen reader users can't understand what the image shows. Alt text is essential for accessibility."
  },
  {
    question: "What's the main problem with this form?",
    example: `
      <div style="padding: 20px; max-width: 400px;">
        <input type="text" placeholder="Enter your name" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc;">
        <input type="email" placeholder="Your email" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc;">
        <input type="password" placeholder="Password" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ccc;">
        <button style="background: blue; color: white; padding: 8px 16px; border: none;">Submit</button>
      </div>
    `,
    options: [
      { text: "Inputs are too wide", correct: false },
      { text: "Missing labels for form inputs", correct: true },
      { text: "Button should be larger", correct: false },
      { text: "Too many input fields", correct: false }
    ],
    explanation: "The form inputs have no labels, only placeholders. When users start typing, placeholders disappear, leaving them without context. Screen readers also can't identify what each field is for."
  },
  {
    question: "What visual hierarchy issue do you see?",
    example: `
      <div style="padding: 20px;">
        <h3 style="font-size: 32px; margin: 5px;">Important Notice</h3>
        <h1 style="font-size: 16px; margin: 5px;">Subtitle text here</h1>
        <h2 style="font-size: 24px; margin: 5px;">Regular content paragraph</h2>
        <p style="font-size: 20px; margin: 5px;">Small detail text</p>
      </div>
    `,
    options: [
      { text: "Heading sizes don't match their importance", correct: true },
      { text: "Text is too large", correct: false },
      { text: "Wrong font family", correct: false },
      { text: "Too many headings", correct: false }
    ],
    explanation: "The heading hierarchy is reversed - h3 is larger than h1, and h2 is larger than h1. This confuses users about what's most important. Headings should decrease in size as importance decreases."
  },
  {
    question: "What's wrong with this error message?",
    example: `
      <div style="padding: 20px;">
        <form>
          <input type="email" placeholder="Email" style="width: 100%; padding: 10px; border: 1px solid #ccc;">
          <div style="color: red; font-size: 10px; margin-top: 2px;">Error</div>
        </form>
      </div>
    `,
    options: [
      { text: "Error text is too small and not descriptive", correct: true },
      { text: "Error should be green, not red", correct: false },
      { text: "Error message is in the wrong position", correct: false },
      { text: "Form needs more inputs", correct: false }
    ],
    explanation: "The error message is too small (10px) and too vague ('Error'). Good error messages are readable, specific, and explain what went wrong and how to fix it."
  },
  {
    question: "What contrast problem exists here?",
    example: `
      <div style="background: #f0f0f0; padding: 30px;">
        <h1 style="color: #f5f5f5; font-size: 28px;">Light Gray Heading</h1>
        <p style="color: #e8e8e8; font-size: 16px; line-height: 1.5;">
          This text is very hard to read because the colors are too similar to the background.
        </p>
        <button style="background: #e0e0e0; color: #eeeeee; border: none; padding: 10px 20px; margin-top: 15px;">Low Contrast Button</button>
      </div>
    `,
    options: [
      { text: "Text colors are too light against light background", correct: true },
      { text: "Background is too dark", correct: false },
      { text: "Font size is too small", correct: false },
      { text: "Too much padding", correct: false }
    ],
    explanation: "Light gray text (#f5f5f5, #e8e8e8) on a light gray background (#f0f0f0) has extremely low contrast. This fails WCAG standards and makes text unreadable for many users."
  },
  {
    question: "What's the problem with this button design?",
    example: `
      <div style="padding: 20px;">
        <button style="background: gray; color: gray; border: 1px solid gray; padding: 5px 10px; font-size: 11px;">Click Me</button>
        <button style="background: gray; color: gray; border: 1px solid gray; padding: 5px 10px; font-size: 11px; margin-left: 5px;">Cancel</button>
      </div>
    `,
    options: [
      { text: "Buttons are too small and have low contrast", correct: true },
      { text: "Buttons should be rounded", correct: false },
      { text: "Too many buttons", correct: false },
      { text: "Buttons need icons", correct: false }
    ],
    explanation: "The buttons are too small (11px text, 5px padding), and gray text on gray background has no contrast. Buttons should be easily clickable with clear visual distinction."
  },
  {
    question: "What accessibility issue affects keyboard users?",
    example: `
      <div style="padding: 20px;">
        <div onclick="alert('Clicked')" style="background: blue; color: white; padding: 10px; display: inline-block; cursor: pointer;">Clickable Div</div>
        <div onclick="submitForm()" style="background: green; color: white; padding: 10px; display: inline-block; cursor: pointer; margin-left: 10px;">Submit</div>
      </div>
    `,
    options: [
      { text: "Using divs instead of buttons - not keyboard accessible", correct: true },
      { text: "Colors are too bright", correct: false },
      { text: "Text is too small", correct: false },
      { text: "Elements are too close together", correct: false }
    ],
    explanation: "Using divs with onclick instead of proper button elements means keyboard users can't tab to or activate these elements. Screen readers also won't identify them as interactive."
  },
  {
    question: "What typography issue makes this hard to read?",
    example: `
      <div style="padding: 20px; max-width: 200px;">
        <p style="font-size: 14px; line-height: 1.1; font-family: 'Times New Roman', serif;">
          This paragraph has very tight line spacing and a narrow width, making it difficult to read. The text feels cramped and the line height is too small for comfortable reading.
        </p>
      </div>
    `,
    options: [
      { text: "Line height too tight and container too narrow", correct: true },
      { text: "Font size is too large", correct: false },
      { text: "Wrong font family", correct: false },
      { text: "Text color is wrong", correct: false }
    ],
    explanation: "The line-height of 1.1 is too tight, and the 200px width creates very long lines of text. Good typography uses 1.5-1.7 line-height and 50-75 character line lengths."
  },
  {
    question: "What's wrong with this color-only indicator?",
    example: `
      <div style="padding: 20px;">
        <div style="background: red; padding: 15px; margin-bottom: 10px;">
          <p style="color: white; margin: 0;">Status: Active</p>
        </div>
        <div style="background: green; padding: 15px;">
          <p style="color: white; margin: 0;">Status: Inactive</p>
        </div>
        <p style="margin-top: 15px; color: red;">Required fields are marked in red</p>
      </div>
    `,
    options: [
      { text: "Relies only on color - not accessible to colorblind users", correct: true },
      { text: "Colors are too bright", correct: false },
      { text: "Text should be larger", correct: false },
      { text: "Too many status indicators", correct: false }
    ],
    explanation: "Using only color (red) to indicate required fields excludes users with color blindness. Good design uses icons, text, or patterns in addition to color."
  },
  {
    question: "What layout problem makes this confusing?",
    example: `
      <div style="padding: 10px;">
        <h2 style="font-size: 18px; margin: 3px;">Section Title</h2>
        <p style="font-size: 12px; margin: 3px;">Content here</p>
        <h1 style="font-size: 14px; margin: 3px;">Another Section</h1>
        <p style="font-size: 16px; margin: 3px;">More content</p>
        <h3 style="font-size: 20px; margin: 3px;">Third Section</h3>
        <p style="font-size: 11px; margin: 3px;">Final content</p>
      </div>
    `,
    options: [
      { text: "No clear visual hierarchy - heading sizes are inconsistent", correct: true },
      { text: "Too many sections", correct: false },
      { text: "Text is too small", correct: false },
      { text: "Wrong background color", correct: false }
    ],
    explanation: "The heading hierarchy is inconsistent - h2 is 18px, h1 is 14px (smaller!), and h3 is 20px. This creates confusion about what's most important. Headings should follow a consistent size hierarchy."
  },
  {
    question: "What form design issue will confuse users?",
    example: `
      <div style="padding: 20px;">
        <input type="text" placeholder="Name (required)" style="width: 100%; padding: 10px; border: 1px solid #ccc; margin-bottom: 10px;">
        <input type="email" placeholder="Email (optional)" style="width: 100%; padding: 10px; border: 1px solid #ccc; margin-bottom: 10px;">
        <input type="text" placeholder="Phone (required)" style="width: 100%; padding: 10px; border: 1px solid #ccc;">
        <button style="background: blue; color: white; padding: 10px 20px; border: none; margin-top: 10px;">Submit</button>
      </div>
    `,
    options: [
      { text: "Using placeholders to show required/optional - they disappear when typing", correct: true },
      { text: "Form needs more fields", correct: false },
      { text: "Button should be different color", correct: false },
      { text: "Inputs are too wide", correct: false }
    ],
    explanation: "Using placeholders to indicate required/optional fields is problematic because placeholders disappear when users start typing, losing that important information. Use visible labels with asterisks or text instead."
  },
  {
    question: "What makes this link inaccessible?",
    example: `
      <div style="padding: 20px;">
        <p>For more information, <a href="#" style="color: #0066cc;">click here</a>.</p>
        <p>To download the file, <a href="#" style="color: #0066cc;">click here</a>.</p>
        <p>To view our services, <a href="#" style="color: #0066cc;">click here</a>.</p>
      </div>
    `,
    options: [
      { text: "Non-descriptive link text - 'click here' doesn't explain the destination", correct: true },
      { text: "Links are the wrong color", correct: false },
      { text: "Too many links on the page", correct: false },
      { text: "Links need to be buttons", correct: false }
    ],
    explanation: "Using 'click here' as link text is not descriptive. Screen reader users often navigate by links, and 'click here' doesn't tell them where the link goes. Use descriptive text like 'download the file' or 'view our services'."
  },
  {
    question: "What spacing rhythm problem exists?",
    example: `
      <div style="padding: 7px;">
        <h1 style="margin: 3px 0 11px 0; font-size: 24px;">Title</h1>
        <p style="margin: 5px 0 13px 0; font-size: 16px;">Paragraph one with inconsistent spacing.</p>
        <p style="margin: 9px 0 7px 0; font-size: 16px;">Paragraph two with different spacing.</p>
        <p style="margin: 4px 0 15px 0; font-size: 16px;">Paragraph three with yet another spacing.</p>
      </div>
    `,
    options: [
      { text: "Inconsistent spacing values - no clear rhythm", correct: true },
      { text: "Too much spacing overall", correct: false },
      { text: "Text is too large", correct: false },
      { text: "Wrong font family", correct: false }
    ],
    explanation: "The spacing uses random values (3px, 5px, 7px, 9px, 11px, 13px, 15px) with no consistent pattern. Good design uses a spacing scale (8px, 16px, 24px, 32px) to create visual rhythm."
  }
];

// Initialize
const exampleSelect = document.getElementById('exampleSelect');
const revealBtn = document.getElementById('revealBtn');
const badExample = document.getElementById('badExample');
const goodExample = document.getElementById('goodExample');
const badIssues = document.getElementById('badIssues');
const goodNotes = document.getElementById('goodNotes');
const principlesContentDiv = document.getElementById('principlesContent');
const quizContentDiv = document.getElementById('quizContent');

// Load example
function loadExample(category) {
  const example = designExamples[category];
  if (!example) return;
  
  badExample.innerHTML = example.bad;
  goodExample.innerHTML = example.good;
  
  // Hide issues/notes initially
  badIssues.style.display = 'none';
  goodNotes.style.display = 'none';
  revealBtn.textContent = 'Reveal Issues';
}

// Reveal issues
revealBtn.addEventListener('click', () => {
  const category = exampleSelect.value;
  const example = designExamples[category];
  
  if (badIssues.style.display === 'none') {
    // Show issues
    badIssues.innerHTML = `
      <h4>Issues Found:</h4>
      <ul>
        ${example.badIssues.map(issue => `<li>${issue}</li>`).join('')}
      </ul>
    `;
    badIssues.style.display = 'block';
    
    goodNotes.innerHTML = `
      <h4>What Makes This Better:</h4>
      <ul>
        ${example.goodNotes.map(note => `<li>${note}</li>`).join('')}
      </ul>
    `;
    goodNotes.style.display = 'block';
    
    revealBtn.textContent = 'Hide Issues';
  } else {
    // Hide issues
    badIssues.style.display = 'none';
    goodNotes.style.display = 'none';
    revealBtn.textContent = 'Reveal Issues';
  }
});

// Load example when selection changes
exampleSelect.addEventListener('change', (e) => {
  loadExample(e.target.value);
  badIssues.style.display = 'none';
  goodNotes.style.display = 'none';
  revealBtn.textContent = 'Reveal Issues';
});

// Load principles content
if (principlesContentDiv) {
  principlesContentDiv.innerHTML = principlesContent;
}

// Load quiz
let currentQuizQuestion = 0;
let quizScore = 0;

function loadQuiz() {
  if (!quizContentDiv) return;
  
  if (currentQuizQuestion >= quizQuestions.length) {
    quizContentDiv.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2 style="color: var(--accent); margin-bottom: 24px;">Quiz Complete!</h2>
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 32px;">
          You scored ${quizScore} out of ${quizQuestions.length}
        </p>
        <button id="restartQuiz" class="btn-primary">🔄 Take Quiz Again</button>
      </div>
    `;
    
    document.getElementById('restartQuiz')?.addEventListener('click', () => {
      currentQuizQuestion = 0;
      quizScore = 0;
      loadQuiz();
    });
    return;
  }
  
  const question = quizQuestions[currentQuizQuestion];
  
  quizContentDiv.innerHTML = `
    <div class="quiz-question">
      <h3>Question ${currentQuizQuestion + 1} of ${quizQuestions.length}</h3>
      <p style="font-size: 1.1rem; color: var(--text); margin-bottom: 24px;">${question.question}</p>
      
      <div class="quiz-example">
        ${question.example}
      </div>
      
      <div class="quiz-options">
        ${question.options.map((option, index) => `
          <div class="quiz-option" data-index="${index}" data-correct="${option.correct}">
            ${option.text}
          </div>
        `).join('')}
      </div>
      
      <div class="quiz-feedback" id="quizFeedback"></div>
      
      <div style="margin-top: 24px; display: none;" id="nextQuestionBtn">
        <button class="btn-primary" style="width: 100%;">Next Question →</button>
      </div>
    </div>
  `;
  
  // Add click handlers
  const options = quizContentDiv.querySelectorAll('.quiz-option');
  const feedback = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('nextQuestionBtn');
  let answered = false;
  
  options.forEach(option => {
    option.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      
      const isCorrect = option.dataset.correct === 'true';
      const correctOption = Array.from(options).find(opt => opt.dataset.correct === 'true');
      
      // Mark all options
      options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        if (opt === option) {
          opt.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (opt === correctOption && !isCorrect) {
          opt.classList.add('correct');
        }
      });
      
      // Show feedback
      feedback.className = `quiz-feedback show ${isCorrect ? 'correct' : 'incorrect'}`;
      feedback.innerHTML = `
        <strong>${isCorrect ? '✅ Correct!' : '❌ Incorrect'}</strong>
        <p style="margin-top: 8px;">${question.explanation}</p>
      `;
      
      if (isCorrect) quizScore++;
      
      nextBtn.style.display = 'block';
      
      nextBtn.querySelector('button').addEventListener('click', () => {
        currentQuizQuestion++;
        loadQuiz();
      });
    });
  });
}

// Initialize
loadExample('layout');
if (quizContentDiv) {
  loadQuiz();
}

