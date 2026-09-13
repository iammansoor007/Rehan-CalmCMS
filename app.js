/* ==========================================================================
   CalmTouch - Interactive Application Logic & Slug Router
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileDrawer();
  initSearchModal();
  initCategoryTabs();
  initRouter();
  initNewsletterForm();
  initContactForm();
  initSmoothScroll();
});

/* Helper Function to Generate Slugs */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* Central Article Store with Rich Content */
const articlesDatabase = [
  {
    title: '5 Easy Neck Massage Techniques for Desk Workers',
    category: 'Self-Massage',
    date: 'May 12, 2026',
    author: 'CalmTouch Editorial Team',
    img: 'assets/images/article1.png',
    intro: 'Spending hours in front of a monitor often leads to stiff shoulders, upper back tightness, and severe neck discomfort. These 5 self-massage steps can be done right at your desk to release tension in under 5 minutes.',
    sections: [
      {
        heading: '1. The Suboccipital Release',
        text: 'Place your thumbs at the base of your skull, right where your neck connects to your head. Apply gentle upward and inward pressure while slowly tilting your head back. Hold for 30 seconds to ease tension headaches.'
      },
      {
        heading: '2. Upper Trapezius Squeeze',
        text: 'Reach across your chest with your right hand to grip the muscle between your left neck and shoulder. Squeeze firmly, hold for 5 seconds, and slowly roll your left shoulder backwards.'
      },
      {
        heading: '3. Neck Side Glide & Stretch',
        text: 'Use two fingertips to make small circular friction motions along the side of your neck, working from behind your ear down towards your collarbone. Repeat 3 times on each side.'
      }
    ],
    callout: 'Pro Tip: Remember to drink a glass of water after self-massage to help flush out metabolic waste from relaxed muscle fibers.',
    relatedSlugs: ['can-massage-help-lower-back-pain', 'simple-hand-massage-for-daily-tension', 'deep-tissue-vs-sports-massage']
  },
  {
    title: 'Can Massage Help Lower Back Pain?',
    category: 'Pain Relief',
    date: 'May 10, 2026',
    author: 'Dr. Elena Vance, LMT & Wellness Advisor',
    img: 'assets/images/article2.png',
    intro: 'Lower back pain affects millions of adults worldwide. Massage therapy is recognized as one of the most effective non-invasive, drug-free interventions for lumbar muscle spasms and chronic tension.',
    sections: [
      {
        heading: 'How Massage Relieves Lumbar Strain',
        text: 'By targeting the gluteal muscles, piriformis, and lumbar erector spinae, therapeutic massage reduces mechanical pressure on the lower spine. Increased blood circulation delivers vital oxygen and nutrients to inflamed muscle tissues.'
      },
      {
        heading: 'Which Modalities Work Best?',
        text: 'Neuromuscular therapy, trigger point release, and gentle Swedish techniques work exceptionally well. Deep tissue massage is also beneficial when applied with moderate, non-painful pressure.'
      }
    ],
    callout: 'Important Note: If your lower back pain radiates down your leg or is accompanied by numbness, consult a medical professional before starting massage therapy.',
    relatedSlugs: ['targeting-lower-back-discomfort-effectively', 'sciatica-pain-relief-through-myofascial-release', '5-easy-neck-massage-techniques-for-desk-workers']
  },
  {
    title: 'Best Evening Massage Routine for Better Sleep',
    category: 'Stress & Sleep',
    date: 'May 08, 2026',
    author: 'Sarah Jenkins, Wellness Specialist',
    img: 'assets/images/article3.png',
    intro: 'A restful night begins with relaxing your nervous system. Integrating a 10-minute self-massage ritual before bedtime signals your brain to transition into deep restorative sleep.',
    sections: [
      {
        heading: 'Step 1: Scalp & Temple Calm',
        text: 'Use the pads of all ten fingers to gently massage your scalp in circular motions. Lightly press near your temples using lavender essential oil for enhanced calmness.'
      },
      {
        heading: 'Step 2: Palm & Wrist Pressure Points',
        text: 'Press your opposite thumb firmly into the center of your palm (Heart 7 pressure point) for 10 deep breaths to quiet an overactive mind.'
      }
    ],
    callout: 'Sleep Habit Tip: Dim your lights 30 minutes before bed and turn off screens while performing your evening massage routine.',
    relatedSlugs: ['how-essential-oils-support-a-calmer-massage', 'calming-your-nervous-system-with-head-scalp-massage', 'creating-a-peaceful-sleep-sanctuary-at-home']
  },
  {
    title: 'How Essential Oils Support a Calmer Massage',
    category: 'Aromatherapy',
    date: 'May 04, 2026',
    author: 'CalmTouch Aromatherapy Team',
    img: 'assets/images/article4.png',
    intro: 'Aromatherapy enhances massage therapy by combining the tactile benefits of touch with the therapeutic properties of plant extracts. Learn which essential oils to choose for your goals.',
    sections: [
      {
        heading: 'Lavender & Chamomile for Relaxation',
        text: 'These classic botanicals contain linalool, which has been shown to lower heart rate and reduce stress levels during massage.'
      },
      {
        heading: 'Eucalyptus & Peppermint for Muscle Recovery',
        text: 'Cooling menthol and eucalyptus extracts penetrate deep into tired muscles, providing a natural soothing sensation.'
      }
    ],
    callout: 'Safety First: Always dilute essential oils in a carrier oil like jojoba, sweet almond, or coconut oil before applying to skin.',
    relatedSlugs: ['best-evening-massage-routine-for-better-sleep', 'swedish-massage-what-to-expect', 'hydrotherapy-heat-therapy-combinations']
  },
  {
    title: 'Swedish Massage: What to Expect',
    category: 'Massage Therapy',
    date: 'April 28, 2026',
    author: 'CalmTouch Editorial Team',
    img: 'assets/images/hero.png',
    intro: 'Swedish massage is the foundation of modern Western massage therapy. Known for long, sweeping strokes and gentle friction, it provides the ultimate relaxation experience for beginners.',
    sections: [
      {
        heading: 'The Five Core Strokes of Swedish Massage',
        text: 'Effleurage (gliding strokes), Petrissage (kneading), Tapotement (rhythmic tapping), Friction, and Vibration work together to release body tension.'
      },
      {
        heading: 'What Happens During Your First Session',
        text: 'Your therapist will consult with you on your health background and focus areas. You will be fully draped in soft sheets, ensuring your privacy and comfort throughout the treatment.'
      }
    ],
    callout: 'Good to Know: Swedish massage is perfect if you are new to massage or prefer a soothing, gentle pressure.',
    relatedSlugs: ['deep-tissue-vs-sports-massage', 'how-often-should-you-get-a-massage', 'the-beginners-guide-to-massage-therapy']
  },
  {
    title: 'Deep Tissue vs Sports Massage',
    category: 'Massage Therapy',
    date: 'April 22, 2026',
    author: 'Marcus Vance, Athletic Recovery Coach',
    img: 'assets/images/article2.png',
    intro: 'While both deep tissue and sports massage target deeper muscle layers, they serve distinct purposes depending on whether you seek chronic tension relief or athletic performance enhancement.',
    sections: [
      {
        heading: 'Deep Tissue Massage Focus',
        text: 'Targets chronic muscle tightness and adhesions ("knots") using slow, deliberate firm pressure across muscle fibers.'
      },
      {
        heading: 'Sports Massage Focus',
        text: 'Tailored specifically for athletes, incorporating active stretching, joint mobilization, and fast-paced strokes to boost agility and speed up post-workout recovery.'
      }
    ],
    callout: 'Choosing Right: Opt for Sports Massage before or after physical competition, and Deep Tissue for persistent postural stiffness.',
    relatedSlugs: ['post-workout-muscle-recovery-techniques', 'preventing-sports-injuries-with-regular-therapy', 'swedish-massage-what-to-expect']
  },
  {
    title: 'How Often Should You Get a Massage?',
    category: 'Massage Therapy',
    date: 'April 18, 2026',
    author: 'CalmTouch Editorial Team',
    img: 'assets/images/article1.png',
    intro: 'Determining your ideal massage frequency depends on your lifestyle, physical activity level, stress, and specific wellness goals.',
    sections: [
      {
        heading: 'For General Stress & Maintenance',
        text: 'A monthly session (every 3 to 4 weeks) is ideal for maintaining mobility, keeping stress levels manageable, and promoting immune function.'
      },
      {
        heading: 'For Chronic Pain & Rehabilitation',
        text: 'Initial treatment regimens may benefit from weekly or bi-weekly visits until acute discomfort stabilizes, gradually transitioning to monthly maintenance.'
      }
    ],
    callout: 'Wellness Balance: Combining regular professional massage with daily home stretches yields the best long-term results.',
    relatedSlugs: ['swedish-massage-what-to-expect', 'the-beginners-guide-to-massage-therapy', '5-easy-neck-massage-techniques-for-desk-workers']
  },
  {
    title: 'Simple Hand Massage for Daily Tension',
    category: 'Self-Care',
    date: 'April 14, 2026',
    author: 'CalmTouch Editorial Team',
    img: 'assets/images/article3.png',
    intro: 'Our hands perform complex micro-movements all day long. A simple 3-minute hand massage can relieve strain from typing, texting, and manual tasks.',
    sections: [
      {
        heading: 'Thumb Webbing Release',
        text: 'Gently pinch the fleshy area between your thumb and index finger using your opposite hand. Massage in small circles for 30 seconds on each hand.'
      },
      {
        heading: 'Finger Stretches & Flexion',
        text: 'Gently pull each finger from base to tip, applying light traction to relieve finger joint compression.'
      }
    ],
    callout: 'Hand Care Tip: Use a hydrating hand cream during your massage to soften skin and reduce skin friction.',
    relatedSlugs: ['5-easy-neck-massage-techniques-for-desk-workers', 'daily-foot-reflexology-essentials', 'evening-relaxation-rituals-for-busy-mind']
  },
  {
    title: 'The Beginner’s Guide to Massage Therapy',
    category: 'Guidebook',
    date: 'April 10, 2026',
    author: 'CalmTouch Editorial Staff',
    img: 'assets/images/guide.png',
    intro: 'Everything you need to know about starting your massage therapy journey—from selecting the right therapist to understanding etiquette, pressure levels, and home care practices.',
    sections: [
      {
        heading: 'Selecting the Right Style',
        text: 'Whether you need stress reduction (Swedish), targeted tension release (Deep Tissue), or energy balance (Shiatsu), understanding style differences ensures a great session.'
      },
      {
        heading: 'Preparing for Your Session',
        text: 'Arrive 10 minutes early, hydrate well, communicate your pressure preferences clearly with your practitioner, and take slow deep breaths during the session.'
      }
    ],
    callout: 'Key takeaway: Communication is key! Never hesitate to ask your therapist for lighter or firmer pressure during treatment.',
    relatedSlugs: ['swedish-massage-what-to-expect', 'how-often-should-you-get-a-massage', 'deep-tissue-vs-sports-massage']
  }
];

/* Helper to locate article by slug or title */
function getArticleBySlug(slug) {
  const targetSlug = slugify(slug);
  let match = articlesDatabase.find(a => slugify(a.title) === targetSlug);
  if (!match) {
    // Search in browse category fallback
    for (const catKey in browseCategoryData) {
      const card = browseCategoryData[catKey].find(c => slugify(c.title) === targetSlug);
      if (card) {
        match = {
          title: card.title,
          category: catKey,
          date: 'May 2026',
          author: 'CalmTouch Editorial Team',
          img: card.img,
          intro: `Explore our comprehensive guide on ${card.title}. Learn practical tips, expert guidance, and natural steps to incorporate into your body care routine.`,
          sections: [
            {
              heading: 'Key Insights & Benefits',
              text: 'Incorporating structured self-care techniques into your daily routine helps relieve tight muscles, improves local circulation, and boosts energy levels.'
            },
            {
              heading: 'Practical Guidelines',
              text: 'Take 5 to 10 minutes each day to practice gentle movements, stay hydrated, and maintain good ergonomic posture throughout your workday.'
            }
          ],
          callout: 'Remember: Consistency is key to long-term comfort and mobility.',
          relatedSlugs: ['5-easy-neck-massage-techniques-for-desk-workers', 'can-massage-help-lower-back-pain', 'swedish-massage-what-to-expect']
        };
        break;
      }
    }
  }
  return match;
}

/* Router Logic for Slug-based Navigation */
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const rawHash = window.location.hash.trim();
  const urlParams = new URLSearchParams(window.location.search);
  const querySlug = urlParams.get('slug');
  const queryCat = urlParams.get('cat');

  const mainSections = document.querySelectorAll('#hero, #categories, #latest, #browse, #guide, #trust, #newsletter');
  const blogDetailView = document.getElementById('blog-detail-view');
  const categoryPageView = document.getElementById('category-page-view');
  const aboutPageView = document.getElementById('about-page-view');
  const contactPageView = document.getElementById('contact-page-view');

  // Helper to hide all page views
  function hideAllViews() {
    mainSections.forEach(sec => sec.classList.add('hidden'));
    if (blogDetailView) blogDetailView.classList.add('hidden');
    if (categoryPageView) categoryPageView.classList.add('hidden');
    if (aboutPageView) aboutPageView.classList.add('hidden');
    if (contactPageView) contactPageView.classList.add('hidden');
  }

  // 1. Handle URL Query Parameters (for multi-page HTML files)
  if (querySlug && blogDetailView) {
    const article = getArticleBySlug(querySlug);
    if (article) {
      hideAllViews();
      blogDetailView.classList.remove('hidden');
      renderBlogDetailPage(article);
      return;
    }
  }

  if (queryCat && categoryPageView) {
    hideAllViews();
    categoryPageView.classList.remove('hidden');
    renderCategoryPage(queryCat);
    return;
  }

  // 2. Individual Article Detail Route (Hash)
  if (rawHash.startsWith('#blog/')) {
    const slug = rawHash.replace('#blog/', '');
    const article = getArticleBySlug(slug);

    if (article && blogDetailView) {
      hideAllViews();
      blogDetailView.classList.remove('hidden');
      renderBlogDetailPage(article);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
  }

  // 3. Category Filter Page Route (Hash)
  if (rawHash.startsWith('#category/') || rawHash.startsWith('#categories/')) {
    const catSlug = rawHash.replace('#category/', '').replace('#categories/', '');
    if (categoryPageView) {
      hideAllViews();
      categoryPageView.classList.remove('hidden');
      renderCategoryPage(catSlug);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
  }

  // 4. Dedicated About Us Page Route (Hash)
  if (rawHash === '#about' || rawHash === '#about-us') {
    if (aboutPageView) {
      hideAllViews();
      aboutPageView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
  }

  // 5. Dedicated Contact Us Page Route (Hash)
  if (rawHash === '#contact' || rawHash === '#contact-us') {
    if (contactPageView) {
      hideAllViews();
      contactPageView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
  }

  // 6. Standalone Fallback Rendering (when opening standalone HTML files without params)
  if (blogDetailView && !rawHash && !querySlug && mainSections.length === 0) {
    const firstArticle = articlesDatabase[0];
    blogDetailView.classList.remove('hidden');
    renderBlogDetailPage(firstArticle);
    return;
  }

  if (categoryPageView && !rawHash && !queryCat && mainSections.length === 0) {
    categoryPageView.classList.remove('hidden');
    renderCategoryPage('massage-therapy');
    return;
  }

  // 5. Render Homepage View
  if (blogDetailView) blogDetailView.classList.add('hidden');
  if (categoryPageView) categoryPageView.classList.add('hidden');
  if (aboutPageView) aboutPageView.classList.add('hidden');
  if (contactPageView) contactPageView.classList.add('hidden');
  mainSections.forEach(sec => sec.classList.remove('hidden'));

  if (rawHash && rawHash !== '#' && !rawHash.startsWith('#blog/') && !rawHash.startsWith('#category/') && rawHash !== '#about' && rawHash !== '#contact') {
    const target = document.querySelector(rawHash);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 60);
    }
  } else if (!rawHash || rawHash === '#') {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

/* Render WordPress-Style Category Archive Page */
function renderCategoryPage(categorySlug) {
  const titleElem = document.getElementById('category-page-title');
  const descElem = document.getElementById('category-page-desc');
  const countElem = document.getElementById('category-page-count');
  const breadcrumbTitle = document.getElementById('category-page-breadcrumb-title');
  const articlesGrid = document.getElementById('category-page-articles-grid');

  if (!articlesGrid) return;

  const categoryMap = {
    'massage-therapy': {
      name: 'Massage Therapy',
      desc: 'Browse our complete archive of classic modalities, professional session advice, and bodywork techniques tailored for stress and body alignment.'
    },
    'pain-relief': {
      name: 'Pain Relief',
      desc: 'Target everyday discomfort, lower back strain, neck tightness, and muscle spasms with safe therapeutic approaches.'
    },
    'stress-sleep': {
      name: 'Stress & Sleep',
      desc: 'Quiet an overactive mind and prepare your nervous system for deep restorative sleep with evening massage rituals.'
    },
    'self-care': {
      name: 'Self-Care',
      desc: 'Practical self-massage routines, reflexology tips, and foam rolling techniques you can easily do at home.'
    },
    'aromatherapy': {
      name: 'Aromatherapy',
      desc: 'Enhance your relaxation journey with essential oil blends, plant extracts, and mindful fragrance pairings.'
    },
    'recovery': {
      name: 'Recovery',
      desc: 'Support active bodies with post-workout massage, hydrotherapy combinations, and injury prevention advice.'
    },
    'all': {
      name: 'All Category Archives',
      desc: 'Browse our complete collection of simple, evidence-aligned massage and body care guides.'
    }
  };

  const currentCategory = categoryMap[categorySlug] || {
    name: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    desc: 'Explore practical massage and wellness articles tailored to your body.'
  };

  // Update Header & Breadcrumbs
  if (titleElem) titleElem.textContent = currentCategory.name;
  if (descElem) descElem.textContent = currentCategory.desc;
  if (breadcrumbTitle) breadcrumbTitle.textContent = currentCategory.name;

  // Consolidate articles from database + browseCategoryData
  let allArticles = [...articlesDatabase];

  for (const catKey in browseCategoryData) {
    browseCategoryData[catKey].forEach(card => {
      if (!allArticles.some(a => slugify(a.title) === slugify(card.title))) {
        allArticles.push({
          title: card.title,
          category: catKey,
          date: 'May 2026',
          author: 'CalmTouch Editorial Team',
          img: card.img
        });
      }
    });
  }

  // Filter Articles Matching Category
  let filtered = [];
  if (categorySlug === 'all') {
    filtered = allArticles;
  } else {
    filtered = allArticles.filter(a => {
      const catSlug = slugify(a.category);
      if (categorySlug === 'self-care' || categorySlug === 'self-massage') {
        return catSlug.includes('self');
      }
      return catSlug === categorySlug || catSlug.includes(categorySlug) || categorySlug.includes(catSlug);
    });
  }

  // Update Article Count Meta
  if (countElem) {
    countElem.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'Article' : 'Articles'}`;
  }

  if (filtered.length === 0) {
    articlesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: var(--color-bg-soft); border-radius: var(--radius-md);">
        <h3 style="margin-bottom: 8px;">No articles found in this category</h3>
        <p style="margin-bottom: 20px; color: var(--color-muted);">Explore our other wellness topics or browse all articles.</p>
        <button class="btn btn-primary" onclick="location.hash='#category/all'">View All Articles</button>
      </div>
    `;
    return;
  }

  articlesGrid.innerHTML = filtered.map(item => `
    <article class="article-card" onclick="location.hash='#blog/${slugify(item.title)}'">
      <div class="article-img-wrapper">
        <img src="${item.img}" alt="${item.title}" class="article-img">
      </div>
      <div class="article-body">
        <span class="article-tag">${item.category}</span>
        <h3 class="article-card-title">${item.title}</h3>
        <div class="article-meta">
          <span>${item.date || 'May 2026'}</span>
        </div>
      </div>
    </article>
  `).join('');
}

/* Render Full Blog Detail Page */
function renderBlogDetailPage(article) {
  const container = document.getElementById('blog-detail-content-area');
  if (!container) return;

  // Update Breadcrumbs
  const breadcrumbCat = document.getElementById('breadcrumb-category');
  const breadcrumbTitle = document.getElementById('breadcrumb-title');
  if (breadcrumbCat) {
    breadcrumbCat.textContent = article.category;
    breadcrumbCat.setAttribute('href', '#category/' + slugify(article.category));
    breadcrumbCat.setAttribute('onclick', `location.hash='#category/${slugify(article.category)}'`);
  }
  if (breadcrumbTitle) breadcrumbTitle.textContent = article.title;

  // Find Prev / Next Articles
  const currentIndex = articlesDatabase.findIndex(a => slugify(a.title) === slugify(article.title));
  const prevArticle = currentIndex > 0 ? articlesDatabase[currentIndex - 1] : articlesDatabase[articlesDatabase.length - 1];
  const nextArticle = currentIndex < articlesDatabase.length - 1 ? articlesDatabase[currentIndex + 1] : articlesDatabase[0];

  container.innerHTML = `
    <div class="blog-detail-header">
      <span class="blog-detail-category" style="cursor: pointer;" onclick="location.hash='#category/${slugify(article.category)}'">${article.category}</span>
      <h1 class="blog-detail-title">${article.title}</h1>
      <div class="blog-detail-meta">
        <div class="blog-detail-meta-item">
          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: var(--color-primary-light); color: var(--color-primary); font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;">
            ${article.author.charAt(0)}
          </div>
          <span style="font-weight: 600; color: var(--color-dark-text);">By ${article.author}</span>
        </div>
        <span>•</span>
        <div class="blog-detail-meta-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${article.date}</span>
        </div>
      </div>
    </div>

    <div class="blog-detail-img-wrapper">
      <img src="${article.img}" alt="${article.title}" class="blog-detail-img" />
    </div>

    <!-- Quick Summary Box -->
    <div class="quick-summary-box">
      <div class="summary-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span>Quick Summary</span>
      </div>
      <p>${article.intro}</p>
    </div>

    <!-- Main Article Body -->
    <div class="blog-detail-body">
      <p style="font-size: 1.12rem; font-weight: 500; color: var(--color-dark-text); margin-bottom: 24px; line-height: 1.75;">
        ${article.intro}
      </p>

      <h2>Key Benefits of This Approach</h2>
      <ul class="checkmark-list">
        <li>
          <div class="checkmark-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span>Relieves muscle stiffness and restores healthy body alignment.</span>
        </li>
        <li>
          <div class="checkmark-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span>Encourages localized blood flow and flushes built-up tension.</span>
        </li>
        <li>
          <div class="checkmark-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span>Calms the nervous system for better evening sleep and mood balance.</span>
        </li>
      </ul>

      ${article.sections.map(sec => `
        <h2>${sec.heading}</h2>
        <p>${sec.text}</p>
      `).join('')}

      <h2>Recommended Treatment Overview</h2>
      <table class="article-data-table">
        <thead>
          <tr>
            <th>Technique Type</th>
            <th>Primary Benefit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Swedish Relaxation</strong></td>
            <td>Eases everyday physical fatigue & calms anxiety.</td>
          </tr>
          <tr>
            <td><strong>Deep Tissue Release</strong></td>
            <td>Targets persistent muscular knots & chronic postural strain.</td>
          </tr>
          <tr>
            <td><strong>Targeted Self-Massage</strong></td>
            <td>Provides immediate at-desk relief for neck and shoulders.</td>
          </tr>
        </tbody>
      </table>

      <h2>How to Practice Safely</h2>
      <ol class="numbered-step-list">
        <li>
          <div class="step-num-badge">1</div>
          <div><strong>Listen to your body:</strong> Apply gentle pressure and stop immediately if you feel sharp pain.</div>
        </li>
        <li>
          <div class="step-num-badge">2</div>
          <div><strong>Stay hydrated:</strong> Drink plenty of room-temperature water after massage to support muscle recovery.</div>
        </li>
        <li>
          <div class="step-num-badge">3</div>
          <div><strong>Combine with light stretching:</strong> Gently stretch affected muscles after warm massage therapy.</div>
        </li>
      </ol>

      <!-- Bottom Callout CTA Banner -->
      <div class="article-cta-banner">
        <div class="cta-banner-left">
          <div class="cta-banner-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div>
            <strong style="color: var(--color-dark-text); font-size: 1.05rem; display: block; margin-bottom: 2px;">Stay Restored & Comfortable</strong>
            <p style="margin: 0; font-size: 0.88rem; color: var(--color-muted);">Explore our complete library of practical wellness and body care guides.</p>
          </div>
        </div>
        <button class="btn btn-primary" onclick="location.hash='#categories'">Browse All Topics</button>
      </div>

      <!-- Share Article Bar -->
      <div class="share-article-bar">
        <span>Share this article</span>
        <div class="share-social-icons">
          <button class="social-share-btn" title="Share on Facebook" onclick="showToast('Article link copied!')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </button>
          <button class="social-share-btn" title="Share on Twitter" onclick="showToast('Article link copied!')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
          </button>
          <button class="social-share-btn" title="Share on LinkedIn" onclick="showToast('Article link copied!')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </button>
          <button class="social-share-btn" title="Share via Email" onclick="showToast('Article link copied!')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </button>
        </div>
      </div>

      <!-- Author Bio Card -->
      <div class="author-bio-card">
        <div class="author-avatar-fallback">${article.author.charAt(0)}</div>
        <div>
          <span class="author-label">About the Author</span>
          <h4 class="author-name">${article.author}</h4>
          <p class="author-desc">Certified wellness advisor and massage practitioner dedicated to bringing practical, evidence-aligned body recovery techniques to daily living.</p>
        </div>
      </div>

      <!-- Previous / Next Navigation Cards -->
      <div class="prev-next-nav-grid">
        ${prevArticle ? `
          <div class="prev-post-card" onclick="location.hash='#blog/${slugify(prevArticle.title)}'">
            <img src="${prevArticle.img}" alt="${prevArticle.title}" class="prev-next-thumb" />
            <div>
              <span class="prev-next-label">← PREVIOUS ARTICLE</span>
              <h5 class="prev-next-title">${prevArticle.title}</h5>
            </div>
          </div>
        ` : '<div></div>'}

        ${nextArticle ? `
          <div class="next-post-card" onclick="location.hash='#blog/${slugify(nextArticle.title)}'">
            <div>
              <span class="prev-next-label" style="text-align: right; display: block;">NEXT ARTICLE →</span>
              <h5 class="prev-next-title">${nextArticle.title}</h5>
            </div>
            <img src="${nextArticle.img}" alt="${nextArticle.title}" class="prev-next-thumb" />
          </div>
        ` : '<div></div>'}
      </div>
    </div>
  `;
}

/* Mobile Drawer Menu */
function initMobileDrawer() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* Search Modal Overlay */
function initSearchModal() {
  const searchTrigger = document.getElementById('search-trigger');
  const searchModalBackdrop = document.getElementById('search-modal-backdrop');
  const closeSearchBtn = document.getElementById('search-modal-close');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (!searchModalBackdrop) return; // Guard if modal not present on page

  const sampleArticles = [
    { title: '5 Easy Neck Massage Techniques for Desk Workers', cat: 'Self-Massage' },
    { title: 'Can Massage Help Lower Back Pain?', cat: 'Pain Relief' },
    { title: 'Best Evening Massage Routine for Better Sleep', cat: 'Stress & Sleep' },
    { title: 'How Essential Oils Support a Calmer Massage', cat: 'Aromatherapy' },
    { title: 'Swedish Massage: What to Expect', cat: 'Massage Therapy' },
    { title: 'Deep Tissue vs Sports Massage', cat: 'Massage Therapy' },
    { title: 'Simple Hand Massage for Daily Tension', cat: 'Self-Care' }
  ];

  function openSearch() {
    searchModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderSuggestions(sampleArticles);
    setTimeout(() => searchInput && searchInput.focus(), 100);
  }

  function closeSearch() {
    searchModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  }

  if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

  // Close on backdrop click
  searchModalBackdrop.addEventListener('click', (e) => {
    if (e.target === searchModalBackdrop) closeSearch();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModalBackdrop.classList.contains('active')) {
      closeSearch();
    }
  });

  // Live search filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderSuggestions(sampleArticles);
        return;
      }
      const filtered = sampleArticles.filter(item =>
        item.title.toLowerCase().includes(query) || item.cat.toLowerCase().includes(query)
      );
      renderSuggestions(filtered);
    });
  }

  function renderSuggestions(items) {
    if (!searchResults) return;
    if (items.length === 0) {
      searchResults.innerHTML = `<div style="padding: 16px; color: var(--color-muted); text-align: center;">No articles found. Try another search.</div>`;
      return;
    }
    searchResults.innerHTML = items.map(item => `
      <div class="suggestion-item" onclick="closeSearchAndNavigate('${slugify(item.title)}')">
        <strong>${item.title}</strong>
        <span style="display: block; font-size: 0.78rem; color: var(--color-primary); font-weight: 600;">${item.cat}</span>
      </div>
    `).join('');
  }

  // Navigate to the blog detail page (works for both single-page hash routing and multi-page)
  window.closeSearchAndNavigate = function(slug) {
    closeSearch();
    // If we're on index.html (has #hero section), use hash routing
    // Otherwise navigate to blog-detail.html with query param
    const onHomePage = !!document.getElementById('hero');
    if (onHomePage) {
      location.hash = '#blog/' + slug;
    } else {
      location.href = 'blog-detail.html?slug=' + slug;
    }
  };

  /* Sidebar Search Listener */
  const sidebarSearchInput = document.getElementById('sidebar-search-input');
  const sidebarSearchBtn = document.getElementById('sidebar-search-btn');

  function handleSidebarSearch() {
    if (!sidebarSearchInput) return;
    const query = sidebarSearchInput.value.trim();
    if (query) {
      const match = articlesDatabase.find(a => a.title.toLowerCase().includes(query.toLowerCase()));
      if (match) {
        location.hash = '#blog/' + slugify(match.title);
      } else {
        showToast('No articles matching "' + query + '"');
      }
    }
  }

  if (sidebarSearchBtn) sidebarSearchBtn.addEventListener('click', handleSidebarSearch);
  if (sidebarSearchInput) {
    sidebarSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSidebarSearch();
    });
  }

  /* Category Archive Sidebar Search Listener */
  const catSearchInput = document.getElementById('sidebar-category-search-input');
  const catSearchBtn = document.getElementById('sidebar-category-search-btn');

  function handleCatSearch() {
    if (!catSearchInput) return;
    const query = catSearchInput.value.trim();
    if (query) {
      const match = articlesDatabase.find(a => a.title.toLowerCase().includes(query.toLowerCase()));
      if (match) {
        location.hash = '#blog/' + slugify(match.title);
      } else {
        showToast('No articles matching "' + query + '"');
      }
    }
  }

  if (catSearchBtn) catSearchBtn.addEventListener('click', handleCatSearch);
  if (catSearchInput) {
    catSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCatSearch();
    });
  }
}

/* Category Tab Filtering */
const browseCategoryData = {
  'Massage Therapy': [
    { title: 'Swedish Massage: What to Expect', img: 'assets/images/hero.png' },
    { title: 'Deep Tissue vs Sports Massage', img: 'assets/images/article2.png' },
    { title: 'How Often Should You Get a Massage?', img: 'assets/images/article1.png' },
    { title: 'Simple Hand Massage for Daily Tension', img: 'assets/images/article3.png' }
  ],
  'Pain Relief': [
    { title: 'Targeting Lower Back Discomfort Effectively', img: 'assets/images/article2.png' },
    { title: 'Relieving Upper Back & Shoulder Tightness', img: 'assets/images/article1.png' },
    { title: 'Therapeutic Stretches to Combine with Massage', img: 'assets/images/hero.png' },
    { title: 'Sciatica Pain Relief Through Myofascial Release', img: 'assets/images/article3.png' }
  ],
  'Stress & Sleep': [
    { title: 'Best Evening Massage Routine for Better Sleep', img: 'assets/images/article3.png' },
    { title: 'Calming Your Nervous System with Head & Scalp Massage', img: 'assets/images/article4.png' },
    { title: 'Breathing Techniques During Massage Sessions', img: 'assets/images/hero.png' },
    { title: 'Creating a Peaceful Sleep Sanctuary at Home', img: 'assets/images/article1.png' }
  ],
  'Self-Care': [
    { title: '5 Easy Neck Massage Techniques for Desk Workers', img: 'assets/images/article1.png' },
    { title: 'Daily Foot Reflexology Essentials', img: 'assets/images/article3.png' },
    { title: 'Foam Rolling Guidelines for Beginners', img: 'assets/images/article2.png' },
    { title: 'Evening Relaxation Rituals for Busy Mind', img: 'assets/images/article4.png' }
  ],
  'Recovery': [
    { title: 'Post-Workout Muscle Recovery Techniques', img: 'assets/images/hero.png' },
    { title: 'Hydrotherapy & Heat Therapy Combinations', img: 'assets/images/article2.png' },
    { title: 'Preventing Sports Injuries with Regular Therapy', img: 'assets/images/article1.png' },
    { title: 'Active Rest Days for Long-term Mobility', img: 'assets/images/article3.png' }
  ]
};

function initCategoryTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const browseGrid = document.getElementById('browse-grid');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');
      if (browseGrid && browseCategoryData[category]) {
        browseGrid.style.opacity = '0';
        setTimeout(() => {
          renderBrowseCards(browseCategoryData[category]);
          browseGrid.style.opacity = '1';
        }, 180);
      }
    });
  });
}

function renderBrowseCards(cards) {
  const browseGrid = document.getElementById('browse-grid');
  if (!browseGrid) return;
  browseGrid.innerHTML = cards.map(c => `
    <div class="browse-card" onclick="location.hash='#blog/${slugify(c.title)}'">
      <div class="browse-img-wrapper">
        <img src="${c.img}" alt="${c.title}" class="browse-img" />
      </div>
      <div class="browse-card-body">
        <h4 class="browse-card-title">${c.title}</h4>
      </div>
    </div>
  `).join('');
}

/* Newsletter Form Submission */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-email');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input ? input.value.trim() : '';
      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address.');
        return;
      }
      showToast('Thank you for subscribing to CalmTouch!');
      if (input) input.value = '';
    });
  }
}

/* Main Contact Us Form Submission */
function initContactForm() {
  const form = document.getElementById('main-contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value || 'General Inquiry';
      const message = document.getElementById('contact-message').value.trim();

      // Construct Gmail mailto URL
      const mailtoUrl = `mailto:support@calmtouch.com?subject=${encodeURIComponent('[' + subject + '] Inquiry from ' + name)}&body=${encodeURIComponent('Sender Name: ' + name + '\nSender Email: ' + email + '\n\nMessage:\n' + message)}`;

      // Trigger default mail client / Gmail
      window.location.href = mailtoUrl;

      showToast('Thank you ' + name + '! Opening Gmail to send message.');
      form.reset();
    });
  }
}

/* Toast Notification Utility */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* Smooth Scroll */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId.startsWith('#blog/') || targetId.startsWith('#category/') || targetId === '#about' || targetId === '#contact') return;

      const blogDetailView = document.getElementById('blog-detail-view');
      const categoryPageView = document.getElementById('category-page-view');
      const aboutPageView = document.getElementById('about-page-view');
      const contactPageView = document.getElementById('contact-page-view');
      const mainSections = document.querySelectorAll('#hero, #categories, #latest, #browse, #guide, #trust, #newsletter');

      if (blogDetailView) blogDetailView.classList.add('hidden');
      if (categoryPageView) categoryPageView.classList.add('hidden');
      if (aboutPageView) aboutPageView.classList.add('hidden');
      if (contactPageView) contactPageView.classList.add('hidden');
      mainSections.forEach(sec => sec.classList.remove('hidden'));

      if (targetId === '#') {
        e.preventDefault();
        window.location.hash = '#';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.location.hash = targetId;
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
