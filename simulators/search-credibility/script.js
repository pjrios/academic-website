// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'search-credibility';
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
      const tabContent = document.getElementById(savedTab);
      
      if (tabButton && tabContent) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tabButton.classList.add('active');
        tabContent.classList.add('active');
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
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
    
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

// Search Strategy Lessons
const lessons = {
  intro: {
    title: 'Introduction to Effective Searching',
    content: `
      <h3>Why Search Strategy Matters</h3>
      <p>In today's information age, knowing how to search effectively is a crucial skill. The internet contains billions of web pages, but not all information is created equal. Learning proper search techniques helps you:</p>
      <ul>
        <li><strong>Find relevant information faster</strong> - Save time by getting better results on the first try</li>
        <li><strong>Access reliable sources</strong> - Identify credible information from trustworthy sources</li>
        <li><strong>Avoid misinformation</strong> - Recognize biased or inaccurate content</li>
        <li><strong>Research efficiently</strong> - Complete assignments and projects more effectively</li>
      </ul>
      
      <h4>What You'll Learn</h4>
      <p>This course will teach you:</p>
      <ol>
        <li>How to choose the right keywords</li>
        <li>Using search operators to refine results</li>
        <li>Applying filters and advanced search techniques</li>
        <li>Evaluating search results for credibility</li>
        <li>Practicing with real-world scenarios</li>
      </ol>
      
      <div class="example-box">
        <strong>Example:</strong> Instead of searching "dogs", try "dog training techniques for puppies" to get more specific and useful results.
      </div>
    `,
    questions: [
      {
        question: 'What is the main benefit of learning effective search strategies?',
        options: [
          'To find information faster and more reliably',
          'To use the internet less',
          'To avoid using search engines',
          'To only use one search engine'
        ],
        correct: 0,
        explanation: 'Effective search strategies help you find relevant, reliable information faster, saving time and improving the quality of your research.'
      },
      {
        question: 'Which of these is NOT a benefit mentioned in this lesson?',
        options: [
          'Finding relevant information faster',
          'Accessing reliable sources',
          'Avoiding misinformation',
          'Getting free products online'
        ],
        correct: 3,
        explanation: 'The lesson focuses on research skills, not getting free products. The benefits are about information quality and efficiency.'
      },
      {
        question: 'What should you search instead of just "dogs" for better results?',
        options: [
          '"dogs"',
          '"dog training techniques for puppies"',
          '"animals"',
          '"pets"'
        ],
        correct: 1,
        explanation: 'Being more specific with "dog training techniques for puppies" will give you more targeted and useful results than a general term like "dogs".'
      }
    ]
  },
  keywords: {
    title: 'Choosing Effective Keywords',
    content: `
      <h3>Keywords: The Foundation of Good Searches</h3>
      <p>Keywords are the words you use to tell search engines what you're looking for. Choosing the right keywords dramatically improves your results.</p>
      
      <h4>Tips for Better Keywords</h4>
      <ul>
        <li><strong>Be specific</strong> - Use precise terms related to your topic</li>
        <li><strong>Use synonyms</strong> - Try different words that mean the same thing</li>
        <li><strong>Include context</strong> - Add relevant details to narrow your search</li>
        <li><strong>Remove unnecessary words</strong> - Skip articles (a, an, the) and common words</li>
        <li><strong>Think like your source</strong> - What words would an expert use?</li>
      </ul>
      
      <h4>Keyword Examples</h4>
      <div class="example-box">
        <p><strong>Poor:</strong> "stuff about space"</p>
        <p><strong>Better:</strong> "Mars exploration missions NASA"</p>
        <p><strong>Best:</strong> "Mars rover missions 2020s scientific discoveries"</p>
      </div>
      
      <div class="example-box">
        <p><strong>Poor:</strong> "how to cook"</p>
        <p><strong>Better:</strong> "Italian pasta recipes beginners"</p>
        <p><strong>Best:</strong> "authentic Italian carbonara recipe step by step"</p>
      </div>
      
      <h4>Search Phrases</h4>
      <p>Sometimes using exact phrases helps. Put quotes around phrases you want to find exactly as written:</p>
      <div class="code-block">"climate change effects on agriculture"</div>
      <p>This will only show results containing that exact phrase, not just pages with those words scattered around.</p>
    `,
    questions: [
      {
        question: 'Which keyword strategy is most effective?',
        options: [
          'Using vague terms like "stuff"',
          'Being specific with precise terms',
          'Using only one word',
          'Including unnecessary articles like "a" and "the"'
        ],
        correct: 1,
        explanation: 'Being specific with precise terms related to your topic dramatically improves search results and helps you find exactly what you need.'
      },
      {
        question: 'What should you do with articles (a, an, the) in your search?',
        options: [
          'Always include them',
          'Remove them to make searches cleaner',
          'Use them only at the beginning',
          'They don\'t matter'
        ],
        correct: 1,
        explanation: 'Removing unnecessary words like articles helps focus your search on the important keywords and often improves results.'
      },
      {
        question: 'Which search query is the BEST example?',
        options: [
          '"stuff about space"',
          '"Mars exploration missions NASA"',
          '"Mars rover missions 2020s scientific discoveries"',
          '"space"'
        ],
        correct: 2,
        explanation: 'The best search includes specific terms (Mars rover), time context (2020s), and topic details (scientific discoveries), making it highly targeted.'
      },
      {
        question: 'What happens when you put quotes around a phrase?',
        options: [
          'It searches for each word separately',
          'It finds the exact phrase as written',
          'It excludes those words',
          'It only searches one website'
        ],
        correct: 1,
        explanation: 'Quotes tell the search engine to find the exact phrase in that order, which is useful when you need specific wording.'
      }
    ]
  },
  operators: {
    title: 'Search Operators',
    content: `
      <h3>Powerful Search Operators</h3>
      <p>Search operators are special symbols and words that help you control what results you get. They're like shortcuts for more precise searches.</p>
      
      <h4>Common Search Operators</h4>
      
      <div class="example-box">
        <strong>Quotes (" ")</strong> - Find exact phrases
        <div class="code-block">"artificial intelligence"</div>
        <p>Finds pages with this exact phrase in order.</p>
      </div>
      
      <div class="example-box">
        <strong>Minus (-)</strong> - Exclude words
        <div class="code-block">jaguar -car</div>
        <p>Finds pages about jaguars but excludes results about cars.</p>
      </div>
      
      <div class="example-box">
        <strong>Site:</strong> - Search within a specific website
        <div class="code-block">site:edu renewable energy</div>
        <p>Only searches educational websites (.edu domains).</p>
      </div>
      
      <div class="example-box">
        <strong>Filetype:</strong> - Find specific file types
        <div class="code-block">filetype:pdf research methods</div>
        <p>Only shows PDF files about research methods.</p>
      </div>
      
      <div class="example-box">
        <strong>OR</strong> - Search for either term
        <div class="code-block">(cats OR dogs) training</div>
        <p>Finds pages about training cats or training dogs.</p>
      </div>
      
      <div class="example-box">
        <strong>Wildcard (*)</strong> - Fill in the blank
        <div class="code-block">how to * a website</div>
        <p>Finds "how to build a website", "how to design a website", etc.</p>
      </div>
      
      <h4>Combining Operators</h4>
      <p>You can combine multiple operators for powerful searches:</p>
      <div class="code-block">site:gov "climate change" -politics filetype:pdf</div>
      <p>This searches government websites for PDFs about climate change, excluding political content.</p>
    `,
    questions: [
      {
        question: 'What does the minus (-) operator do?',
        options: [
          'Includes more results',
          'Excludes words from results',
          'Makes searches faster',
          'Searches only one website'
        ],
        correct: 1,
        explanation: 'The minus operator excludes specific words from your search results, helping you filter out unwanted content.'
      },
      {
        question: 'How do you search only educational websites?',
        options: [
          'Use site:edu',
          'Use site:gov',
          'Use filetype:pdf',
          'Use quotes'
        ],
        correct: 0,
        explanation: 'The site:edu operator limits your search to educational websites with .edu domains, which are often reliable sources.'
      },
      {
        question: 'What does filetype:pdf do?',
        options: [
          'Searches only PDF files',
          'Excludes PDF files',
          'Searches all file types',
          'Searches only images'
        ],
        correct: 0,
        explanation: 'The filetype:pdf operator restricts results to PDF files, which is useful when you need documents or research papers.'
      },
      {
        question: 'What would this search find: jaguar -car?',
        options: [
          'Only car-related jaguar results',
          'Jaguar results excluding cars',
          'Both jaguars and cars',
          'Nothing, it\'s invalid'
        ],
        correct: 1,
        explanation: 'This search finds information about jaguars (the animal) while excluding results about Jaguar cars, using the minus operator.'
      },
      {
        question: 'Which operator helps you find an exact phrase?',
        options: [
          'Minus (-)',
          'Quotes (" ")',
          'Site:',
          'OR'
        ],
        correct: 1,
        explanation: 'Quotes around a phrase tell the search engine to find that exact phrase in that specific order.'
      }
    ]
  },
  filters: {
    title: 'Filters & Advanced Search',
    content: `
      <h3>Using Filters to Refine Results</h3>
      <p>Most search engines offer filters to help you narrow down results. These are powerful tools for finding exactly what you need.</p>
      
      <h4>Common Filters</h4>
      <ul>
        <li><strong>Time</strong> - Find recent information (past hour, day, week, month, year)</li>
        <li><strong>Type</strong> - Filter by content type (images, videos, news, books)</li>
        <li><strong>Location</strong> - Results from specific countries or regions</li>
        <li><strong>Language</strong> - Results in specific languages</li>
        <li><strong>Usage Rights</strong> - Find content you can use or modify</li>
      </ul>
      
      <h4>When to Use Filters</h4>
      <div class="example-box">
        <strong>Recent News:</strong> Use time filter set to "Past month" when searching for current events
      </div>
      
      <div class="example-box">
        <strong>Academic Research:</strong> Use site:edu or site:org to find educational and organizational sources
      </div>
      
      <div class="example-box">
        <strong>Images for Projects:</strong> Use usage rights filter to find images you can legally use
      </div>
      
      <h4>Advanced Search Pages</h4>
      <p>Most search engines have an "Advanced Search" page that lets you combine multiple filters and operators in a user-friendly interface. Look for it in the search engine's settings or help menu.</p>
      
      <h4>Domain-Specific Searches</h4>
      <ul>
        <li><strong>.edu</strong> - Educational institutions (usually reliable)</li>
        <li><strong>.gov</strong> - Government websites (official information)</li>
        <li><strong>.org</strong> - Organizations (check for bias)</li>
        <li><strong>.com</strong> - Commercial sites (may have advertising bias)</li>
      </ul>
    `,
    questions: [
      {
        question: 'When should you use a time filter?',
        options: [
          'When searching for historical information',
          'When searching for recent news or current events',
          'When you want older results',
          'Time filters don\'t help'
        ],
        correct: 1,
        explanation: 'Time filters are especially useful when you need recent information, like current events or the latest research.'
      },
      {
        question: 'What does the usage rights filter help you find?',
        options: [
          'Any content online',
          'Content you can legally use or modify',
          'Only paid content',
          'Only free content'
        ],
        correct: 1,
        explanation: 'The usage rights filter helps you find content that you have permission to use, which is important for projects and presentations.'
      },
      {
        question: 'Which domain is typically most reliable for official information?',
        options: [
          '.com',
          '.org',
          '.gov',
          '.net'
        ],
        correct: 2,
        explanation: '.gov domains are government websites that provide official information, making them highly reliable sources.'
      },
      {
        question: 'What is the main purpose of filters?',
        options: [
          'To make searches slower',
          'To narrow down and refine search results',
          'To exclude all results',
          'To search only one website'
        ],
        correct: 1,
        explanation: 'Filters help you narrow down results to find exactly what you need by applying specific criteria like time, type, or location.'
      },
      {
        question: 'Where can you find the Advanced Search page?',
        options: [
          'It doesn\'t exist',
          'In the search engine\'s settings or help menu',
          'Only on mobile devices',
          'Only for paid accounts'
        ],
        correct: 1,
        explanation: 'Most search engines have an Advanced Search page accessible through their settings or help menu, allowing you to combine multiple filters easily.'
      }
    ]
  },
  evaluation: {
    title: 'Evaluating Search Results',
    content: `
      <h3>How to Evaluate Search Results</h3>
      <p>Not all search results are equal. Learning to evaluate results helps you find reliable, accurate information.</p>
      
      <h4>The CRAAP Test</h4>
      <p>Use the CRAAP test to evaluate sources:</p>
      <ul>
        <li><strong>Currency</strong> - Is the information recent? When was it last updated?</li>
        <li><strong>Relevance</strong> - Does it answer your question? Is it appropriate for your needs?</li>
        <li><strong>Authority</strong> - Who wrote it? Are they qualified? What are their credentials?</li>
        <li><strong>Accuracy</strong> - Is the information correct? Can it be verified elsewhere?</li>
        <li><strong>Purpose</strong> - Why was it written? Is there bias? Is it trying to sell something?</li>
      </ul>
      
      <h4>Red Flags to Watch For</h4>
      <ul>
        <li>⚠️ No author or organization listed</li>
        <li>⚠️ Extreme language or claims</li>
        <li>⚠️ Lots of ads or pop-ups</li>
        <li>⚠️ Poor spelling and grammar</li>
        <li>⚠️ No sources or citations</li>
        <li>⚠️ Outdated information</li>
        <li>⚠️ Trying to sell you something</li>
      </ul>
      
      <h4>Signs of Reliable Sources</h4>
      <ul>
        <li>✅ Author credentials clearly listed</li>
        <li>✅ Recent publication or update date</li>
        <li>✅ Citations and references provided</li>
        <li>✅ Balanced, factual presentation</li>
        <li>✅ Reputable organization or institution</li>
        <li>✅ Professional design and writing</li>
        <li>✅ Contact information available</li>
      </ul>
      
      <h4>Reading URLs</h4>
      <p>URLs can tell you a lot about a source:</p>
      <div class="code-block">
        https://www.nasa.gov/space-science/planets/
      </div>
      <ul>
        <li><strong>nasa.gov</strong> - Government website (usually reliable)</li>
        <li><strong>.gov</strong> - Official government domain</li>
        <li><strong>/space-science/</strong> - Organized content structure</li>
      </ul>
      
      <div class="code-block">
        https://randomblog.wordpress.com/aliens-are-real/
      </div>
      <ul>
        <li><strong>wordpress.com</strong> - Personal blog (verify credibility)</li>
        <li><strong>randomblog</strong> - Unknown author</li>
        <li>⚠️ Be cautious with personal blogs</li>
      </ul>
    `,
    questions: [
      {
        question: 'What does the "C" in CRAAP stand for?',
        options: [
          'Credibility',
          'Currency',
          'Citation',
          'Content'
        ],
        correct: 1,
        explanation: 'Currency refers to how recent the information is and when it was last updated, which is important for accuracy.'
      },
      {
        question: 'Which is a red flag indicating unreliable information?',
        options: [
          'Author credentials clearly listed',
          'Recent publication date',
          'No author or organization listed',
          'Citations and references provided'
        ],
        correct: 2,
        explanation: 'If there\'s no author or organization listed, you can\'t verify the source\'s credibility, which is a major red flag.'
      },
      {
        question: 'What does "Authority" in the CRAAP test check?',
        options: [
          'How old the information is',
          'Who wrote it and their qualifications',
          'Whether it answers your question',
          'If it has citations'
        ],
        correct: 1,
        explanation: 'Authority checks who wrote the information and whether they are qualified experts on the topic.'
      },
      {
        question: 'Which domain typically indicates a reliable government source?',
        options: [
          '.com',
          '.org',
          '.gov',
          '.net'
        ],
        correct: 2,
        explanation: '.gov domains are official government websites, which are typically reliable sources of information.'
      },
      {
        question: 'What is a sign of a reliable source?',
        options: [
          'Extreme language or claims',
          'No sources or citations',
          'Balanced, factual presentation',
          'Trying to sell you something'
        ],
        correct: 2,
        explanation: 'Reliable sources present information in a balanced, factual way without extreme claims or obvious bias.'
      },
      {
        question: 'What should you be cautious about with personal blogs?',
        options: [
          'They are always reliable',
          'They may lack authority and verification',
          'They are always wrong',
          'They don\'t need to be checked'
        ],
        correct: 1,
        explanation: 'Personal blogs may lack the authority, credentials, and fact-checking of established sources, so you should verify their credibility.'
      }
    ]
  },
  practice: {
    title: 'Practice Exercise',
    content: `
      <h3>Test Your Search Skills</h3>
      <p>Try these practice searches to improve your skills. Use the Search Simulator tab to practice!</p>
      
      <h4>Exercise 1: Finding Academic Sources</h4>
      <p><strong>Challenge:</strong> Find recent academic research about the effects of social media on teenagers.</p>
      <p><strong>Tips:</strong></p>
      <ul>
        <li>Use site:edu to search educational websites</li>
        <li>Add "research" or "study" to your keywords</li>
        <li>Use time filters for recent results</li>
      </ul>
      
      <h4>Exercise 2: Excluding Unwanted Results</h4>
      <p><strong>Challenge:</strong> Find information about Python (the programming language), not the snake.</p>
      <p><strong>Tips:</strong></p>
      <ul>
        <li>Use the minus operator: python -snake -animal</li>
        <li>Add context: python programming language</li>
        <li>Use quotes for exact phrases</li>
      </ul>
      
      <h4>Exercise 3: Finding Specific File Types</h4>
      <p><strong>Challenge:</strong> Find PDF guides about renewable energy.</p>
      <p><strong>Tips:</strong></p>
      <ul>
        <li>Use filetype:pdf operator</li>
        <li>Combine with site:gov or site:edu for reliable sources</li>
      </ul>
      
      <h4>Exercise 4: Recent News</h4>
      <p><strong>Challenge:</strong> Find news articles from the past week about space exploration.</p>
      <p><strong>Tips:</strong></p>
      <ul>
        <li>Use time filters (past week)</li>
        <li>Add "news" to your search or use News filter</li>
        <li>Try site:news for news websites</li>
      </ul>
      
      <div class="example-box">
        <strong>Ready to practice?</strong> Go to the Search Simulator tab and try these exercises!
      </div>
    `
  }
};

// Load lesson content
const strategyNavItems = document.querySelectorAll('.strategy-nav-item');
const lessonDisplay = document.getElementById('lessonDisplay');

strategyNavItems.forEach(item => {
  item.addEventListener('click', () => {
    strategyNavItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    const lessonId = item.getAttribute('data-lesson');
    const lesson = lessons[lessonId];
    
    if (lesson) {
      lessonDisplay.innerHTML = `
        <h3>${lesson.title}</h3>
        ${lesson.content}
      `;
    }
  });
});

// Load first lesson
if (strategyNavItems.length > 0) {
  strategyNavItems[0].click();
}

// Search Simulator
const searchBtn = document.getElementById('searchBtn');
const searchQuery = document.getElementById('searchQuery');
const resultsList = document.getElementById('resultsList');
const resultsCount = document.getElementById('resultsCount');
const searchTip = document.getElementById('searchTip');

// Sample search results database
const searchResultsDatabase = {
  'climate change effects': [
    {
      title: 'Climate Change: Effects on Global Ecosystems',
      url: 'https://www.nasa.gov/climate-change',
      snippet: 'NASA scientists study how climate change affects Earth\'s ecosystems, weather patterns, and sea levels. Learn about the latest research and data on global warming impacts.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: '10 Shocking Climate Change Effects You Need to Know',
      url: 'https://clickbait-news.com/climate-shocking',
      snippet: 'You won\'t believe what climate change is doing! Scientists are hiding the truth about these devastating effects. Click to learn more!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'Climate Change Impacts: A Comprehensive Scientific Review',
      url: 'https://science.journal.edu/climate-review',
      snippet: 'Peer-reviewed research examining the effects of climate change on biodiversity, agriculture, and human health. Published in Nature Climate Science.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'How Climate Change Affects Your Daily Life',
      url: 'https://news.example.com/climate-daily-life',
      snippet: 'Recent news coverage of how climate change impacts communities worldwide. Interviews with experts and affected residents.',
      type: 'news',
      credibility: 'medium',
      date: '2024'
    },
    {
      title: 'Climate Change: The Real Story They Don\'t Want You to Know',
      url: 'https://conspiracy-blog.net/climate-truth',
      snippet: 'The mainstream media is lying about climate change! Here\'s what they\'re hiding from you. Share this with everyone!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'EPA: Climate Change Effects and Adaptation Strategies',
      url: 'https://www.epa.gov/climate-change',
      snippet: 'Official Environmental Protection Agency information about climate change effects and what communities can do to adapt. Includes data and resources.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'Understanding Climate Change: Effects on Agriculture',
      url: 'https://research.university.edu/climate-agriculture',
      snippet: 'Academic study from State University examining how changing climate patterns affect crop yields and farming practices. Includes statistical analysis.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'Climate Change: My Personal Experience',
      url: 'https://myblog.wordpress.com/climate-story',
      snippet: 'A personal blog post about experiencing climate change effects in my hometown. Just my thoughts and observations.',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    }
  ],
  'artificial intelligence': [
    {
      title: 'What is Artificial Intelligence? | MIT Technology Review',
      url: 'https://www.technologyreview.com/ai-explained',
      snippet: 'Comprehensive guide to artificial intelligence, machine learning, and their applications. Written by experts at MIT.',
      type: 'academic',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'AI Will Replace All Jobs - Here\'s What to Do',
      url: 'https://scare-tactics.com/ai-jobs',
      snippet: 'URGENT: AI is coming for your job! Learn the secret methods to survive the AI takeover. Limited time offer!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'Artificial Intelligence: Current Applications and Future Prospects',
      url: 'https://www.nist.gov/ai-research',
      snippet: 'National Institute of Standards and Technology research on AI development, standards, and safety protocols.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'Breaking: Major AI Breakthrough Announced',
      url: 'https://tech-news.com/ai-breakthrough',
      snippet: 'Tech company announces revolutionary AI technology. Industry experts weigh in on potential impacts.',
      type: 'news',
      credibility: 'medium',
      date: '2024'
    }
  ],
  'renewable energy': [
    {
      title: 'Renewable Energy Explained | U.S. Energy Information Administration',
      url: 'https://www.eia.gov/renewable',
      snippet: 'Official government data and statistics on renewable energy sources including solar, wind, and hydroelectric power.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'The Future of Renewable Energy: Research Findings',
      url: 'https://energy.stanford.edu/renewable-future',
      snippet: 'Stanford University research on renewable energy technologies, efficiency improvements, and cost reduction strategies.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'Renewable Energy: Why Big Oil Doesn\'t Want You to Know',
      url: 'https://conspiracy-site.net/renewable-secrets',
      snippet: 'The truth about renewable energy that corporations are hiding! Discover the shocking facts they don\'t want you to know.',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    }
  ],
  'social media effects': [
    {
      title: 'Social Media and Mental Health: Research Findings',
      url: 'https://www.nih.gov/social-media-mental-health',
      snippet: 'National Institutes of Health study examining the relationship between social media use and mental health outcomes in adolescents and young adults.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'Social Media is RUINING Your Life - Here\'s How',
      url: 'https://scare-blog.com/social-media-ruin',
      snippet: 'URGENT: Social media is destroying your brain! Scientists have been hiding this from you. Click now to learn the shocking truth!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'The Impact of Social Media on Adolescent Development',
      url: 'https://journal.psychology.edu/social-media-adolescents',
      snippet: 'Peer-reviewed research from the Journal of Adolescent Psychology analyzing social media\'s effects on teen development, self-esteem, and social skills.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'Breaking: New Social Media Platform Launches',
      url: 'https://tech-news.com/social-platform-launch',
      snippet: 'Tech startup announces revolutionary social media platform. Industry experts discuss potential impacts on digital communication.',
      type: 'news',
      credibility: 'medium',
      date: '2024'
    }
  ],
  'python programming': [
    {
      title: 'Python Programming Language | Official Documentation',
      url: 'https://www.python.org/doc/',
      snippet: 'Official Python programming language documentation. Learn Python syntax, libraries, and best practices from the source.',
      type: 'academic',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'Learn Python in 10 Minutes - The Secret Method',
      url: 'https://get-rich-quick.com/learn-python-fast',
      snippet: 'Master Python programming instantly with this one weird trick! Programmers hate this! Click to discover the secret!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'Python Programming: A Comprehensive Guide',
      url: 'https://cs.mit.edu/python-guide',
      snippet: 'MIT Computer Science Department guide to Python programming. Covers fundamentals, data structures, and advanced topics.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'Python vs Other Languages: Which Should You Learn?',
      url: 'https://tech-comparison.com/python-vs-others',
      snippet: 'Comparison article examining Python against other programming languages. Expert opinions and use case analysis.',
      type: 'news',
      credibility: 'medium',
      date: '2024'
    }
  ],
  'vaccine safety': [
    {
      title: 'Vaccine Safety | Centers for Disease Control and Prevention',
      url: 'https://www.cdc.gov/vaccinesafety',
      snippet: 'CDC official information about vaccine safety, side effects, and monitoring systems. Based on extensive scientific research and data.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'Vaccines: The Hidden Dangers They Don\'t Tell You',
      url: 'https://alternative-medicine.net/vaccine-dangers',
      snippet: 'Doctors are hiding the truth about vaccines! Learn the real risks they don\'t want you to know. Natural alternatives revealed!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'Vaccine Safety and Efficacy: Meta-Analysis of Clinical Trials',
      url: 'https://medical-journal.org/vaccine-meta-analysis',
      snippet: 'Comprehensive meta-analysis of vaccine clinical trials published in the Journal of Medical Research. Examines safety profiles across multiple studies.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'New Vaccine Approved by FDA',
      url: 'https://health-news.com/vaccine-approval',
      snippet: 'Food and Drug Administration approves new vaccine after extensive testing. Medical experts discuss implications for public health.',
      type: 'news',
      credibility: 'medium',
      date: '2024'
    }
  ],
  'space exploration': [
    {
      title: 'NASA: Space Exploration Missions and Discoveries',
      url: 'https://www.nasa.gov/exploration',
      snippet: 'Official NASA information about current and future space exploration missions, discoveries, and scientific research.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'Aliens on Mars: NASA is Hiding the Truth!',
      url: 'https://ufo-news.com/mars-aliens',
      snippet: 'BREAKING: NASA found alien structures on Mars but won\'t tell you! See the photos they don\'t want you to see!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'Recent Advances in Space Exploration Technology',
      url: 'https://aerospace.university.edu/space-tech',
      snippet: 'University research on new propulsion systems and space exploration technologies. Published in Aerospace Engineering Journal.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'Private Company Launches Mission to Mars',
      url: 'https://space-news.com/mars-mission-launch',
      snippet: 'Commercial space company announces ambitious Mars mission. Industry analysts discuss feasibility and timeline.',
      type: 'news',
      credibility: 'medium',
      date: '2024'
    }
  ],
  'healthy eating': [
    {
      title: 'Dietary Guidelines for Americans | USDA',
      url: 'https://www.usda.gov/dietary-guidelines',
      snippet: 'Official USDA dietary guidelines based on scientific evidence. Recommendations for healthy eating patterns and nutrition.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'This ONE Food Will Change Your Life Forever!',
      url: 'https://miracle-diet.com/superfood-secret',
      snippet: 'Doctors hate this! One simple food cures everything! Lose weight, gain energy, reverse aging - all with this miracle food!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'Nutrition Science: Evidence-Based Dietary Recommendations',
      url: 'https://nutrition.harvard.edu/evidence-based-diet',
      snippet: 'Harvard School of Public Health research on evidence-based nutrition and dietary recommendations. Systematic review of nutritional studies.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'New Study Links Diet to Longevity',
      url: 'https://health-news.com/diet-longevity',
      snippet: 'Recent research suggests connection between dietary patterns and lifespan. Nutrition experts discuss findings.',
      type: 'news',
      credibility: 'medium',
      date: '2024'
    }
  ],
  'cybersecurity basics': [
    {
      title: 'Cybersecurity Basics | Cybersecurity and Infrastructure Security Agency',
      url: 'https://www.cisa.gov/cybersecurity-basics',
      snippet: 'Official CISA guide to cybersecurity fundamentals. Learn how to protect yourself and your devices from cyber threats.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'Hackers Can Access Your Computer RIGHT NOW!',
      url: 'https://scam-alert.com/hackers-access',
      snippet: 'URGENT WARNING: Hackers are watching you through your webcam! Click here to protect yourself immediately!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'Cybersecurity Education: Best Practices and Strategies',
      url: 'https://cs.research.edu/cybersecurity-education',
      snippet: 'Academic research on cybersecurity education and training methods. Published in Computer Security Journal.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'Major Data Breach Affects Millions',
      url: 'https://tech-news.com/data-breach-millions',
      snippet: 'Large company reports significant data breach. Security experts analyze the incident and provide recommendations.',
      type: 'news',
      credibility: 'medium',
      date: '2024'
    }
  ],
  'exercise benefits': [
    {
      title: 'Physical Activity and Health | CDC',
      url: 'https://www.cdc.gov/physicalactivity',
      snippet: 'Centers for Disease Control information about the health benefits of physical activity and exercise recommendations.',
      type: 'government',
      credibility: 'high',
      date: '2024'
    },
    {
      title: 'Lose 50 Pounds in 2 Weeks - No Exercise Required!',
      url: 'https://miracle-weight-loss.com/no-exercise',
      snippet: 'This revolutionary method helps you lose weight without any exercise! Doctors are amazed! Try it now!',
      type: 'blog',
      credibility: 'low',
      date: '2024'
    },
    {
      title: 'Exercise and Mental Health: Systematic Review',
      url: 'https://medicine.journal.edu/exercise-mental-health',
      snippet: 'Systematic review of research on exercise\'s effects on mental health, depression, and anxiety. Published in Medical Research Journal.',
      type: 'academic',
      credibility: 'high',
      date: '2023'
    },
    {
      title: 'New Study Shows Exercise Benefits for Brain Health',
      url: 'https://health-news.com/exercise-brain',
      snippet: 'Research suggests regular exercise may improve cognitive function. Neurologists discuss implications.',
      type: 'news',
      credibility: 'medium',
      date: '2024'
    }
  ]
};

// Default results if query not found
const defaultResults = [
  {
    title: 'Search Tips for Better Results',
    url: 'https://support.search.com/tips',
    snippet: 'Learn how to improve your search queries with better keywords, operators, and filters. Get the most relevant results every time.',
    type: 'academic',
    credibility: 'high',
    date: '2024'
  }
];

const searchTips = [
  'Try using specific keywords instead of general terms',
  'Use quotes around phrases to find exact matches',
  'Add site:edu or site:gov to find educational or government sources',
  'Use the minus sign (-) to exclude unwanted terms',
  'Try different synonyms if you\'re not getting good results',
  'Use filters to narrow down by date, type, or source'
];

let currentFilter = 'all';
const filterButtons = document.querySelectorAll('.filter-btn');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.id.replace('filter', '').toLowerCase();
    displayResults(currentResults);
  });
});

let currentResults = [];

function performSearch(query) {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Find matching results
  let results = [];
  for (const [key, value] of Object.entries(searchResultsDatabase)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery.split(' ')[0])) {
      results = value;
      break;
    }
  }
  
  // If no match, use default or generate generic results
  if (results.length === 0) {
    results = defaultResults;
  }
  
  // Shuffle results for realism
  results = [...results].sort(() => Math.random() - 0.5);
  
  currentResults = results;
  displayResults(results);
  
  // Update tip
  searchTip.textContent = searchTips[Math.floor(Math.random() * searchTips.length)];
}

function displayResults(results) {
  // Apply filter
  let filtered = results;
  if (currentFilter !== 'all') {
    filtered = results.filter(r => r.type === currentFilter);
  }
  
  // Update count
  const count = Math.floor(Math.random() * 1000000) + filtered.length * 1000;
  resultsCount.textContent = `About ${count.toLocaleString()} results`;
  
  // Display results
  resultsList.innerHTML = filtered.map((result, index) => {
    const credibilityClass = result.credibility;
    const credibilityText = result.credibility === 'high' ? 'High Credibility' : 
                           result.credibility === 'medium' ? 'Medium Credibility' : 'Low Credibility';
    
    return `
      <div class="result-item">
        <div class="result-url">
          <span class="result-type">${result.type}</span>
          <a href="#" onclick="return false;">${result.url}</a>
        </div>
        <div class="result-title">${result.title}</div>
        <div class="result-snippet">${result.snippet}</div>
        <div class="result-meta">
          <span>${result.date}</span>
          <span class="result-credibility">
            <span class="credibility-badge ${credibilityClass}">${credibilityText}</span>
          </span>
        </div>
      </div>
    `;
  }).join('');
}

searchBtn.addEventListener('click', () => {
  const query = searchQuery.value.trim();
  if (query) {
    performSearch(query);
  }
});

searchQuery.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

// Available queries for suggestions
const availableQueries = Object.keys(searchResultsDatabase);

// Display query suggestions
const suggestionTags = document.getElementById('suggestionTags');
availableQueries.forEach(query => {
  const tag = document.createElement('button');
  tag.className = 'suggestion-tag';
  tag.textContent = query;
  tag.addEventListener('click', () => {
    searchQuery.value = query;
    performSearch(query);
  });
  suggestionTags.appendChild(tag);
});

// Questions for each query
const queryQuestions = {
  'climate change effects': [
    {
      question: 'Which result would be most reliable for a school research paper?',
      options: [
        'NASA: Climate Change: Effects on Global Ecosystems',
        '10 Shocking Climate Change Effects You Need to Know',
        'Climate Change: The Real Story They Don\'t Want You to Know'
      ],
      correct: 0,
      explanation: 'NASA is a government organization with scientific expertise, making it the most reliable source for academic research.'
    },
    {
      question: 'What is a red flag that indicates a low-credibility source?',
      options: [
        'Author credentials clearly listed',
        'Extreme language like "shocking" or "they don\'t want you to know"',
        'Recent publication date',
        'Government or educational domain (.gov or .edu)'
      ],
      correct: 1,
      explanation: 'Extreme, sensational language is a red flag. Reliable sources use balanced, factual language.'
    },
    {
      question: 'How many high-credibility sources appear in these results?',
      options: ['2', '3', '4', '5'],
      correct: 2,
      explanation: 'There are 4 high-credibility sources: NASA, the scientific review, EPA, and the university agriculture study.'
    }
  ],
  'artificial intelligence': [
    {
      question: 'Which source would be best for learning about AI basics?',
      options: [
        'AI Will Replace All Jobs - Here\'s What to Do',
        'What is Artificial Intelligence? | MIT Technology Review',
        'Breaking: Major AI Breakthrough Announced'
      ],
      correct: 1,
      explanation: 'MIT Technology Review is a reputable academic source that would provide accurate, educational information about AI basics.'
    },
    {
      question: 'What makes the NIST source highly credible?',
      options: [
        'It has a catchy title',
        'It\'s a government organization (National Institute of Standards and Technology)',
        'It uses emotional language',
        'It\'s a personal blog'
      ],
      correct: 1,
      explanation: 'NIST is a government organization with expertise in technology standards, making it a highly credible source.'
    }
  ],
  'renewable energy': [
    {
      question: 'Which result should you avoid for reliable information?',
      options: [
        'Renewable Energy Explained | U.S. Energy Information Administration',
        'The Future of Renewable Energy: Research Findings',
        'Renewable Energy: Why Big Oil Doesn\'t Want You to Know'
      ],
      correct: 2,
      explanation: 'The third option uses conspiracy language ("doesn\'t want you to know") which is a red flag for low credibility.'
    },
    {
      question: 'What type of source is the Stanford University result?',
      options: ['Government', 'Academic', 'News', 'Blog'],
      correct: 1,
      explanation: 'Stanford University is an educational institution, making it an academic source.'
    }
  ],
  'social media effects': [
    {
      question: 'Which source would be most appropriate for a research paper?',
      options: [
        'Social Media is RUINING Your Life - Here\'s How',
        'Social Media and Mental Health: Research Findings',
        'Breaking: New Social Media Platform Launches'
      ],
      correct: 1,
      explanation: 'The NIH (National Institutes of Health) source is a government research organization, making it most appropriate for academic work.'
    },
    {
      question: 'What indicates the "RUINING Your Life" source is not credible?',
      options: [
        'It has a URL',
        'It uses ALL CAPS and sensational language',
        'It mentions social media',
        'It was published in 2024'
      ],
      correct: 1,
      explanation: 'Sensational language in ALL CAPS and dramatic claims are red flags indicating low credibility.'
    }
  ],
  'python programming': [
    {
      question: 'Which source is the official Python documentation?',
      options: [
        'Learn Python in 10 Minutes - The Secret Method',
        'Python Programming Language | Official Documentation',
        'Python vs Other Languages: Which Should You Learn?'
      ],
      correct: 1,
      explanation: 'The official Python documentation comes from python.org, the official source for the Python programming language.'
    },
    {
      question: 'What makes the MIT guide highly credible?',
      options: [
        'It promises quick results',
        'It\'s from a prestigious educational institution',
        'It has a catchy title',
        'It\'s a news article'
      ],
      correct: 1,
      explanation: 'MIT is a prestigious educational institution with expertise in computer science, making it highly credible.'
    }
  ],
  'vaccine safety': [
    {
      question: 'Which source should you trust for vaccine information?',
      options: [
        'Vaccines: The Hidden Dangers They Don\'t Tell You',
        'Vaccine Safety | Centers for Disease Control and Prevention',
        'Both sources are equally reliable'
      ],
      correct: 1,
      explanation: 'The CDC is the official government health organization with expertise in vaccines and public health.'
    },
    {
      question: 'What is a warning sign in the "Hidden Dangers" source?',
      options: [
        'It cites scientific studies',
        'It uses phrases like "they don\'t tell you" suggesting conspiracy',
        'It has an author name',
        'It was published recently'
      ],
      correct: 1,
      explanation: 'Language suggesting conspiracies or hidden information is a major red flag for unreliable sources.'
    }
  ],
  'space exploration': [
    {
      question: 'Which source is most reliable for space information?',
      options: [
        'Aliens on Mars: NASA is Hiding the Truth!',
        'NASA: Space Exploration Missions and Discoveries',
        'Private Company Launches Mission to Mars'
      ],
      correct: 1,
      explanation: 'NASA is the official government space agency and the most authoritative source for space exploration information.'
    },
    {
      question: 'What makes the "Aliens on Mars" source unreliable?',
      options: [
        'It mentions NASA',
        'It makes unverified conspiracy claims',
        'It has a URL',
        'It was published recently'
      ],
      correct: 1,
      explanation: 'Unverified conspiracy claims without evidence are a clear sign of unreliable information.'
    }
  ],
  'healthy eating': [
    {
      question: 'Which source provides official dietary guidelines?',
      options: [
        'This ONE Food Will Change Your Life Forever!',
        'Dietary Guidelines for Americans | USDA',
        'New Study Links Diet to Longevity'
      ],
      correct: 1,
      explanation: 'The USDA (U.S. Department of Agriculture) provides official government dietary guidelines.'
    },
    {
      question: 'What indicates the "ONE Food" source is not credible?',
      options: [
        'It mentions food',
        'It makes extreme claims like "change your life forever"',
        'It has a title',
        'It was published in 2024'
      ],
      correct: 1,
      explanation: 'Extreme, unrealistic claims are a red flag. No single food can "change your life forever."'
    }
  ],
  'cybersecurity basics': [
    {
      question: 'Which source is best for learning cybersecurity basics?',
      options: [
        'Hackers Can Access Your Computer RIGHT NOW!',
        'Cybersecurity Basics | Cybersecurity and Infrastructure Security Agency',
        'Major Data Breach Affects Millions'
      ],
      correct: 1,
      explanation: 'CISA is the official government cybersecurity agency, making it the best source for learning cybersecurity basics.'
    },
    {
      question: 'What makes the "Hackers Can Access" source unreliable?',
      options: [
        'It uses ALL CAPS and urgent language',
        'It mentions cybersecurity',
        'It has a URL',
        'It was published recently'
      ],
      correct: 0,
      explanation: 'ALL CAPS and urgent/scare tactics are red flags indicating unreliable, potentially scam content.'
    }
  ],
  'exercise benefits': [
    {
      question: 'Which source is most reliable for exercise information?',
      options: [
        'Lose 50 Pounds in 2 Weeks - No Exercise Required!',
        'Physical Activity and Health | CDC',
        'New Study Shows Exercise Benefits for Brain Health'
      ],
      correct: 1,
      explanation: 'The CDC is the official government health organization with expertise in physical activity and health.'
    },
    {
      question: 'What is unrealistic about the "Lose 50 Pounds" claim?',
      options: [
        'It promises rapid weight loss (50 pounds in 2 weeks)',
        'It mentions weight loss',
        'It has an exclamation mark',
        'It was published in 2024'
      ],
      correct: 0,
      explanation: 'Losing 50 pounds in 2 weeks is medically unrealistic and dangerous. Such extreme claims indicate unreliable information.'
    }
  ]
};

let currentQuestions = [];

function displayQuestions(query) {
  const questions = queryQuestions[query];
  const searchQuestions = document.getElementById('searchQuestions');
  const questionsContent = document.getElementById('questionsContent');
  const questionsFeedback = document.getElementById('questionsFeedback');
  
  if (!questions || questions.length === 0) {
    searchQuestions.style.display = 'none';
    return;
  }
  
  searchQuestions.style.display = 'block';
  currentQuestions = questions;
  questionsFeedback.innerHTML = '';
  questionsFeedback.classList.remove('show', 'correct', 'incorrect');
  
  questionsContent.innerHTML = questions.map((q, index) => `
    <div class="question-item" data-question-index="${index}">
      <h4>Question ${index + 1}: ${q.question}</h4>
      <div class="question-options">
        ${q.options.map((option, optIndex) => `
          <button class="question-option" data-question="${index}" data-option="${optIndex}">
            ${option}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
  
  // Add event listeners
  questionsContent.querySelectorAll('.question-option').forEach(option => {
    option.addEventListener('click', (e) => {
      const questionIndex = parseInt(option.dataset.question);
      const optionIndex = parseInt(option.dataset.option);
      
      // Remove previous selections for this question
      const questionItem = option.closest('.question-item');
      questionItem.querySelectorAll('.question-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      
      option.classList.add('selected');
      
      // Check if all questions answered
      checkAllQuestionsAnswered();
    });
  });
}

let questionAnswers = {};

function checkAllQuestionsAnswered() {
  const allAnswered = currentQuestions.every((q, index) => {
    const questionItem = document.querySelector(`[data-question-index="${index}"]`);
    return questionItem && questionItem.querySelector('.question-option.selected');
  });
  
  if (allAnswered) {
    showSubmitButton();
  }
}

function showSubmitButton() {
  const questionsFeedback = document.getElementById('questionsFeedback');
  if (!questionsFeedback.querySelector('#submitQuestionsBtn')) {
    const submitBtn = document.createElement('button');
    submitBtn.id = 'submitQuestionsBtn';
    submitBtn.className = 'btn-primary';
    submitBtn.textContent = 'Check Answers';
    submitBtn.style.marginTop = '20px';
    submitBtn.addEventListener('click', checkQuestionAnswers);
    questionsFeedback.appendChild(submitBtn);
  }
}

function checkQuestionAnswers() {
  const questionsFeedback = document.getElementById('questionsFeedback');
  let correctCount = 0;
  let totalQuestions = currentQuestions.length;
  
  // Collect answers
  currentQuestions.forEach((question, index) => {
    const questionItem = document.querySelector(`[data-question-index="${index}"]`);
    const selected = questionItem.querySelector('.question-option.selected');
    if (selected) {
      const selectedIndex = parseInt(selected.dataset.option);
      questionAnswers[index] = selectedIndex;
      
      // Mark correct/incorrect
      questionItem.querySelectorAll('.question-option').forEach((opt, optIndex) => {
        opt.classList.remove('correct', 'incorrect');
        if (optIndex === question.correct) {
          opt.classList.add('correct');
        } else if (optIndex === selectedIndex && optIndex !== question.correct) {
          opt.classList.add('incorrect');
        }
      });
      
      if (selectedIndex === question.correct) {
        correctCount++;
      }
    }
  });
  
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  
  // Show feedback
  questionsFeedback.innerHTML = `
    <div style="margin-top: 20px; padding: 20px; background: ${percentage >= 70 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 2px solid ${percentage >= 70 ? 'var(--success)' : 'var(--danger)'}; border-radius: 8px;">
      <h4 style="color: ${percentage >= 70 ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 15px;">
        ${percentage >= 70 ? '✓ Great Job!' : 'Keep Practicing'}
      </h4>
      <p><strong>Score: ${correctCount}/${totalQuestions} correct (${percentage}%)</strong></p>
      <div style="margin-top: 15px;">
        ${currentQuestions.map((q, index) => `
          <div style="margin-bottom: 15px; padding: 12px; background: var(--bg); border-radius: 6px;">
            <strong>Question ${index + 1}:</strong> ${q.explanation}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  questionsFeedback.classList.add('show');
}

// Initialize with default search
performSearch('climate change effects');

// Credibility Game
let gameScore = 0;
let gameRound = 1;
let gameStreak = 0;
const totalRounds = 10;

const gameSources = [
  {
    title: 'The Impact of Social Media on Teen Mental Health',
    url: 'https://www.nih.gov/social-media-teens',
    content: 'A comprehensive study published by the National Institutes of Health examining the correlation between social media usage and mental health outcomes in adolescents. The research followed 5,000 teenagers over three years and found significant associations between excessive social media use and increased anxiety and depression rates.',
    author: 'Dr. Sarah Johnson, Ph.D. in Psychology',
    organization: 'National Institutes of Health',
    date: '2024',
    credibility: 'high',
    bias: 'neutral',
    correctAnswers: {
      credibility: 'high',
      bias: 'neutral',
      author: 'yes',
      recent: 'yes',
      sources: 'yes'
    },
    explanation: 'This is a high-credibility source: government organization, qualified author with credentials, recent publication, and research-based content.'
  },
  {
    title: 'SHOCKING: Social Media is Destroying Your Brain!',
    url: 'https://scare-you.com/social-media-danger',
    content: 'You need to know the TRUTH about social media! Scientists are hiding the real dangers from you. My friend\'s cousin works at a tech company and told me everything. Social media is literally melting your brain! Share this immediately before they delete it!',
    author: 'Anonymous',
    organization: 'None listed',
    date: '2024',
    credibility: 'low',
    bias: 'high',
    correctAnswers: {
      credibility: 'low',
      bias: 'high',
      author: 'no',
      recent: 'yes',
      sources: 'no'
    },
    explanation: 'This is a low-credibility source: no author credentials, extreme language, no sources cited, and appears designed to create fear rather than inform.'
  },
  {
    title: 'Social Media and Adolescent Development: A Meta-Analysis',
    url: 'https://journal.psychology.edu/social-media-meta',
    content: 'This peer-reviewed meta-analysis examines 127 studies on social media\'s effects on adolescent development. Published in the Journal of Adolescent Psychology, the study finds mixed results with both positive and negative outcomes depending on usage patterns and individual factors.',
    author: 'Dr. Michael Chen, Professor of Psychology',
    organization: 'State University, Department of Psychology',
    date: '2023',
    credibility: 'high',
    bias: 'low',
    correctAnswers: {
      credibility: 'high',
      bias: 'low',
      author: 'yes',
      recent: 'yes',
      sources: 'yes'
    },
    explanation: 'This is a high-credibility source: peer-reviewed academic journal, qualified author, recent publication, and balanced presentation of research findings.'
  },
  {
    title: 'Why Social Media Companies Want to Control Your Mind',
    url: 'https://conspiracy-blog.net/social-control',
    content: 'The big tech companies are using social media to brainwash you! They\'re tracking everything you do and manipulating your thoughts. I\'ve done my own research and the evidence is clear. Wake up, people!',
    author: 'TruthSeeker99',
    organization: 'Personal Blog',
    date: '2024',
    credibility: 'low',
    bias: 'very-high',
    correctAnswers: {
      credibility: 'low',
      bias: 'very-high',
      author: 'no',
      recent: 'yes',
      sources: 'no'
    },
    explanation: 'This is a low-credibility source: anonymous author using a username, extreme claims without evidence, and clear conspiracy theory language.'
  },
  {
    title: 'Social Media Usage Trends Among Teens: 2024 Report',
    url: 'https://www.pewresearch.org/teens-social-media-2024',
    content: 'Pew Research Center\'s annual report on social media usage patterns among American teenagers. Based on surveys of 1,500 teens, the report provides statistics on platform preferences, usage frequency, and demographic differences.',
    author: 'Pew Research Center Staff',
    organization: 'Pew Research Center',
    date: '2024',
    credibility: 'high',
    bias: 'low',
    correctAnswers: {
      credibility: 'high',
      bias: 'low',
      author: 'yes',
      recent: 'yes',
      sources: 'yes'
    },
    explanation: 'This is a high-credibility source: reputable research organization, clear methodology, recent data, and objective presentation of findings.'
  },
  {
    title: 'My Experience: How Social Media Changed My Life',
    url: 'https://my-story-blog.com/social-media-journey',
    content: 'Hey everyone! I wanted to share my personal story about how social media affected my mental health. This is just my experience, so take it with a grain of salt. I started using Instagram when I was 14, and honestly, it made me feel really bad about myself...',
    author: 'Emma (personal blog)',
    organization: 'Personal Blog',
    date: '2024',
    credibility: 'low',
    bias: 'low',
    correctAnswers: {
      credibility: 'low',
      bias: 'low',
      author: 'no',
      recent: 'yes',
      sources: 'no'
    },
    explanation: 'This is a low-credibility source: personal blog with no credentials, anecdotal evidence only, and not suitable for research purposes (though not necessarily biased).'
  },
  {
    title: 'Social Media Regulation: What Politicians Need to Know',
    url: 'https://www.congress.gov/social-media-policy',
    content: 'Official congressional briefing document on social media regulation policies. Prepared by the Congressional Research Service, this document outlines current laws, proposed legislation, and policy considerations.',
    author: 'Congressional Research Service',
    organization: 'U.S. Congress',
    date: '2024',
    credibility: 'high',
    bias: 'neutral',
    correctAnswers: {
      credibility: 'high',
      bias: 'neutral',
      author: 'yes',
      recent: 'yes',
      sources: 'yes'
    },
    explanation: 'This is a high-credibility source: official government document, authoritative organization, recent publication, and factual policy information.'
  },
  {
    title: 'The REAL Truth About Social Media (They Don\'t Want You to Know)',
    url: 'https://alternative-news.com/social-media-secrets',
    content: 'Mainstream media is lying to you about social media! I\'ve uncovered the real story that big tech doesn\'t want you to see. The evidence is overwhelming, but they\'re suppressing it. Read this exclusive report now!',
    author: 'Independent Journalist',
    organization: 'Alternative News Network',
    date: '2024',
    credibility: 'low',
    bias: 'very-high',
    correctAnswers: {
      credibility: 'low',
      bias: 'very-high',
      author: 'no',
      recent: 'yes',
      sources: 'no'
    },
    explanation: 'This is a low-credibility source: vague author credentials, conspiracy language, claims of suppression, and no verifiable sources.'
  },
  {
    title: 'Social Media Effects on Youth: Systematic Review',
    url: 'https://pubmed.ncbi.nlm.nih.gov/social-media-review',
    content: 'A systematic review of 89 peer-reviewed studies examining social media\'s effects on youth mental health, published in the Journal of Child Psychology. The review follows PRISMA guidelines and includes quality assessment of included studies.',
    author: 'Dr. Lisa Park, M.D., Ph.D.',
    organization: 'Medical Research Institute',
    date: '2023',
    credibility: 'high',
    bias: 'low',
    correctAnswers: {
      credibility: 'high',
      bias: 'low',
      author: 'yes',
      recent: 'yes',
      sources: 'yes'
    },
    explanation: 'This is a high-credibility source: peer-reviewed medical journal, qualified author with M.D. and Ph.D., systematic review methodology, and recent publication.'
  },
  {
    title: 'Social Media is Making Kids Stupid - Here\'s Proof',
    url: 'https://opinion-blog.com/social-media-stupid',
    content: 'As a parent and former teacher, I\'ve seen firsthand how social media is dumbing down our children. Kids can\'t focus anymore, their attention spans are shot, and they\'re addicted to their phones. Something needs to be done!',
    author: 'Parent Advocate',
    organization: 'Parent Blog Network',
    date: '2024',
    credibility: 'low',
    bias: 'high',
    correctAnswers: {
      credibility: 'low',
      bias: 'high',
      author: 'no',
      recent: 'yes',
      sources: 'no'
    },
    explanation: 'This is a low-credibility source: opinion piece without credentials, anecdotal evidence, emotional language, and no research citations.'
  }
];

let currentGameSource = null;
let gameAnswers = {};
let gameShuffled = [];

const gameScoreEl = document.getElementById('gameScore');
const gameRoundEl = document.getElementById('gameRound');
const gameStreakEl = document.getElementById('gameStreak');
const sourceCard = document.getElementById('sourceCard');
const evaluationPanel = document.getElementById('evaluationPanel');
const gameFeedback = document.getElementById('gameFeedback');
const newGameBtn = document.getElementById('newGameBtn');

function startNewGame() {
  gameScore = 0;
  gameRound = 1;
  gameStreak = 0;
  gameShuffled = [...gameSources].sort(() => Math.random() - 0.5);
  loadGameRound();
}

function loadGameRound() {
  if (gameRound > totalRounds) {
    showGameComplete();
    return;
  }
  
  currentGameSource = gameShuffled[gameRound - 1];
  gameAnswers = {};
  gameFeedback.classList.remove('show');
  
  updateGameStats();
  displaySource();
  displayEvaluation();
}

function displaySource() {
  sourceCard.innerHTML = `
    <div class="source-header">
      <div>
        <div class="source-title">${currentGameSource.title}</div>
        <a href="#" class="source-url" onclick="return false;">${currentGameSource.url}</a>
      </div>
    </div>
    <div class="source-content">
      <p>${currentGameSource.content}</p>
    </div>
    <div class="source-meta">
      <span><strong>Author:</strong> ${currentGameSource.author}</span>
      <span><strong>Organization:</strong> ${currentGameSource.organization}</span>
      <span><strong>Date:</strong> ${currentGameSource.date}</span>
    </div>
  `;
}

function displayEvaluation() {
  evaluationPanel.innerHTML = `
    <div class="evaluation-question">
      <h4>1. What is the credibility level of this source?</h4>
      <div class="evaluation-options">
        <button class="evaluation-option" data-question="credibility" data-answer="high">High - Authoritative, well-sourced, reliable</button>
        <button class="evaluation-option" data-question="credibility" data-answer="medium">Medium - Somewhat reliable, but verify information</button>
        <button class="evaluation-option" data-question="credibility" data-answer="low">Low - Unreliable, questionable, or unverified</button>
      </div>
    </div>
    
    <div class="evaluation-question">
      <h4>2. What is the bias level of this source?</h4>
      <div class="evaluation-options">
        <button class="evaluation-option" data-question="bias" data-answer="low">Low - Balanced, objective presentation</button>
        <button class="evaluation-option" data-question="bias" data-answer="neutral">Neutral - Factual, no clear bias</button>
        <button class="evaluation-option" data-question="bias" data-answer="high">High - Clearly biased or one-sided</button>
        <button class="evaluation-option" data-question="bias" data-answer="very-high">Very High - Extreme bias, propaganda-like</button>
      </div>
    </div>
    
    <div class="evaluation-question">
      <h4>3. Does the author have clear credentials or qualifications?</h4>
      <div class="evaluation-options">
        <button class="evaluation-option" data-question="author" data-answer="yes">Yes - Credentials clearly listed</button>
        <button class="evaluation-option" data-question="author" data-answer="no">No - No credentials or unclear</button>
      </div>
    </div>
    
    <div class="evaluation-question">
      <h4>4. Is this information recent enough for your needs?</h4>
      <div class="evaluation-options">
        <button class="evaluation-option" data-question="recent" data-answer="yes">Yes - Recent (within 2-3 years)</button>
        <button class="evaluation-option" data-question="recent" data-answer="no">No - Too old or outdated</button>
      </div>
    </div>
    
    <div class="evaluation-question">
      <h4>5. Does the source cite references or provide sources?</h4>
      <div class="evaluation-options">
        <button class="evaluation-option" data-question="sources" data-answer="yes">Yes - Sources or citations provided</button>
        <button class="evaluation-option" data-question="sources" data-answer="no">No - No sources cited</button>
      </div>
    </div>
    
    <button class="btn-primary" id="submitAnswersBtn" style="margin-top: 20px; width: 100%;">Submit Answers</button>
  `;
  
  // Add event listeners
  evaluationPanel.querySelectorAll('.evaluation-option').forEach(option => {
    option.addEventListener('click', (e) => {
      const question = option.dataset.question;
      const answer = option.dataset.answer;
      
      // Remove previous selection for this question
      evaluationPanel.querySelectorAll(`[data-question="${question}"]`).forEach(opt => {
        opt.classList.remove('selected');
      });
      
      option.classList.add('selected');
      gameAnswers[question] = answer;
    });
  });
  
  document.getElementById('submitAnswersBtn').addEventListener('click', checkAnswers);
}

function checkAnswers() {
  const allAnswered = ['credibility', 'bias', 'author', 'recent', 'sources'].every(q => gameAnswers[q]);
  
  if (!allAnswered) {
    alert('Please answer all questions before submitting.');
    return;
  }
  
  let correct = 0;
  let total = 5;
  
  // Check each answer
  Object.keys(gameAnswers).forEach(question => {
    if (gameAnswers[question] === currentGameSource.correctAnswers[question]) {
      correct++;
    }
  });
  
  const score = Math.round((correct / total) * 100);
  const isPerfect = correct === total;
  
  if (isPerfect) {
    gameScore += 10;
    gameStreak++;
  } else {
    gameStreak = 0;
  }
  
  // Show feedback
  gameFeedback.className = `game-feedback show ${isPerfect ? 'correct' : 'incorrect'}`;
  gameFeedback.innerHTML = `
    <h4>${isPerfect ? '✓ Correct!' : 'Not Quite Right'}</h4>
    <p><strong>Score: ${correct}/${total} correct (${score}%)</strong></p>
    <p>${currentGameSource.explanation}</p>
    <button class="btn-primary" id="nextRoundBtn" style="margin-top: 15px;">Next Round →</button>
  `;
  
  // Highlight correct/incorrect answers
  evaluationPanel.querySelectorAll('.evaluation-option').forEach(option => {
    const question = option.dataset.question;
    const answer = option.dataset.answer;
    const isSelected = option.classList.contains('selected');
    const isCorrect = answer === currentGameSource.correctAnswers[question];
    
    if (isSelected && isCorrect) {
      option.classList.add('correct');
    } else if (isSelected && !isCorrect) {
      option.classList.add('incorrect');
    } else if (!isSelected && isCorrect) {
      option.classList.add('correct');
      option.style.opacity = '0.6';
    }
  });
  
  updateGameStats();
  
  document.getElementById('nextRoundBtn').addEventListener('click', () => {
    gameRound++;
    loadGameRound();
  });
}

function updateGameStats() {
  gameScoreEl.textContent = gameScore;
  gameRoundEl.textContent = `${gameRound}/${totalRounds}`;
  gameStreakEl.textContent = gameStreak;
}

function showGameComplete() {
  const percentage = Math.round((gameScore / (totalRounds * 10)) * 100);
  
  sourceCard.innerHTML = '';
  evaluationPanel.innerHTML = '';
  gameFeedback.className = 'game-feedback show correct';
  gameFeedback.innerHTML = `
    <h4>🎉 Game Complete!</h4>
    <p><strong>Final Score: ${gameScore} points (${percentage}%)</strong></p>
    <p><strong>Longest Streak: ${gameStreak} correct answers</strong></p>
    <p>Great job! You've completed the credibility evaluation game. Keep practicing to improve your skills at identifying reliable sources.</p>
    <button class="btn-primary" id="playAgainBtn" style="margin-top: 15px;">Play Again</button>
  `;
  
  document.getElementById('playAgainBtn').addEventListener('click', startNewGame);
}

newGameBtn.addEventListener('click', startNewGame);

// Initialize game
startNewGame();


