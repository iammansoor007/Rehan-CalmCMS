import mongoose from "mongoose";

const uri = "mongodb+srv://ammansoor007_db_user:vYwUhDetv8xoCQtz@cluster0.rrfgy8h.mongodb.net/calmtouch?retryWrites=true&w=majority&appName=Cluster0";

async function runSeed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected!");

  const db = mongoose.connection.db;

  // 1. Admin User
  const usersCol = db.collection("users");
  const existingUser = await usersCol.findOne({ username: "rehanblogsite" });
  if (!existingUser) {
    await usersCol.insertOne({
      username: "rehanblogsite",
      password: "rehanblogsite@2026adsense",
      role: "admin",
      createdAt: new Date(),
    });
    console.log("✓ Admin user 'rehanblogsite' created.");
  } else {
    console.log("✓ Admin user 'rehanblogsite' already exists.");
  }

  // 2. Categories
  const categoriesCol = db.collection("categories");
  const catCount = await categoriesCol.countDocuments();
  if (catCount === 0) {
    const categories = [
      {
        slug: "massage-therapy",
        name: "Massage Therapy",
        description: "Browse our complete archive of classic modalities, professional session advice, and bodywork techniques tailored for stress and body alignment.",
        createdAt: new Date(),
      },
      {
        slug: "pain-relief",
        name: "Pain Relief",
        description: "Target everyday discomfort, lower back strain, neck tightness, and muscle spasms with safe therapeutic approaches.",
        createdAt: new Date(),
      },
      {
        slug: "stress-sleep",
        name: "Stress & Sleep",
        description: "Quiet an overactive mind and prepare your nervous system for deep restorative sleep with evening massage rituals.",
        createdAt: new Date(),
      },
      {
        slug: "self-care",
        name: "Self-Care",
        description: "Practical self-massage routines, reflexology tips, and foam rolling techniques you can easily do at home.",
        createdAt: new Date(),
      },
      {
        slug: "aromatherapy",
        name: "Aromatherapy",
        description: "Enhance your relaxation journey with essential oil blends, plant extracts, and mindful fragrance pairings.",
        createdAt: new Date(),
      },
      {
        slug: "recovery",
        name: "Recovery",
        description: "Support active bodies with post-workout massage, hydrotherapy combinations, and injury prevention advice.",
        createdAt: new Date(),
      },
      {
        slug: "all",
        name: "All Category Archives",
        description: "Browse our complete collection of simple, evidence-aligned massage and body care guides.",
        createdAt: new Date(),
      },
    ];
    await categoriesCol.insertMany(categories);
    console.log(`✓ Inserted ${categories.length} categories.`);
  } else {
    console.log(`✓ Categories already seeded (${catCount} found).`);
  }

  // 3. Articles
  const articlesCol = db.collection("articles");
  const artCount = await articlesCol.countDocuments();
  if (artCount === 0) {
    const articles = [
      {
        slug: "5-easy-neck-massage-techniques-for-desk-workers",
        title: "5 Easy Neck Massage Techniques for Desk Workers",
        category: "Self-Care",
        date: "May 12, 2026",
        author: "CalmTouch Editorial Team",
        authorRole: "Wellness Advisors",
        img: "/assets/images/article1.png",
        intro: "Spending hours in front of a monitor often leads to stiff shoulders, upper back tightness, and severe neck discomfort. These 5 self-massage steps can be done right at your desk to release tension in under 5 minutes.",
        quickSummary: "Combat desk fatigue and neck tightness with 5 gentle self-massage techniques designed to relieve pressure at the base of the skull and upper shoulders without any special equipment.",
        keyBenefits: [
          "Relieves muscle stiffness and restores healthy cervical alignment.",
          "Encourages localized blood flow and flushes built-up tension.",
          "Calms the nervous system for better focus and headache prevention.",
        ],
        sections: [
          {
            heading: "1. The Suboccipital Release",
            text: "Place your thumbs at the base of your skull, right where your neck connects to your head. Apply gentle upward and inward pressure while slowly tilting your head back. Hold for 30 seconds to ease tension headaches.",
          },
          {
            heading: "2. Upper Trapezius Squeeze",
            text: "Reach across your chest with your right hand to grip the muscle between your left neck and shoulder. Squeeze firmly, hold for 5 seconds, and slowly roll your left shoulder backwards.",
          },
          {
            heading: "3. Neck Side Glide & Stretch",
            text: "Use two fingertips to make small circular friction motions along the side of your neck, working from behind your ear down towards your collarbone. Repeat 3 times on each side.",
          },
        ],
        dataTable: {
          headers: ["Technique Focus", "Target Muscle", "Duration"],
          rows: [
            ["Suboccipital Release", "Base of Skull / Occipital", "30 - 45 seconds"],
            ["Trapezius Squeeze", "Upper Shoulder & Trap", "5 - 10 squeezes"],
            ["Lateral Glide", "Levator Scapulae & Scalenes", "1 - 2 minutes"],
          ],
        },
        safeSteps: [
          {
            step: 1,
            title: "Breathe deeply",
            desc: "Exhale fully as you apply pressure to help the nervous system release muscular bracing.",
          },
          {
            step: 2,
            title: "Keep movements slow",
            desc: "Avoid rapid pinching or sudden jerks; steady sustained compression is most effective.",
          },
          {
            step: 3,
            title: "Stay hydrated",
            desc: "Drink a glass of water post-massage to assist muscular waste elimination.",
          },
        ],
        callout: "Pro Tip: Remember to drink a glass of water after self-massage to help flush out metabolic waste from relaxed muscle fibers.",
        relatedSlugs: ["can-massage-help-lower-back-pain", "simple-hand-massage-for-daily-tension", "deep-tissue-vs-sports-massage"],
        status: "published",
        createdAt: new Date(),
      },
      {
        slug: "can-massage-help-lower-back-pain",
        title: "Can Massage Help Lower Back Pain?",
        category: "Pain Relief",
        date: "May 10, 2026",
        author: "Dr. Elena Vance, LMT & Wellness Advisor",
        authorRole: "Licensed Massage Therapist",
        img: "/assets/images/article2.png",
        intro: "Lower back pain affects millions of adults worldwide. Massage therapy is recognized as one of the most effective non-invasive, drug-free interventions for lumbar muscle spasms and chronic tension.",
        quickSummary: "Therapeutic massage addresses lumbar strain by releasing chronic tension in the glutes, hips, and lower back muscles, improving circulation and reducing pressure on spinal nerve roots.",
        keyBenefits: [
          "Reduces lower back muscle spasms and fascial restrictions.",
          "Improves pelvic alignment and mobility.",
          "Stimulates endorphin release for natural pain relief.",
        ],
        sections: [
          {
            heading: "How Massage Relieves Lumbar Strain",
            text: "By targeting the gluteal muscles, piriformis, and lumbar erector spinae, therapeutic massage reduces mechanical pressure on the lower spine. Increased blood circulation delivers vital oxygen and nutrients to inflamed muscle tissues.",
          },
          {
            heading: "Which Modalities Work Best?",
            text: "Neuromuscular therapy, trigger point release, and gentle Swedish techniques work exceptionally well. Deep tissue massage is also beneficial when applied with moderate, non-painful pressure.",
          },
        ],
        relatedSlugs: ["5-easy-neck-massage-techniques-for-desk-workers", "swedish-massage-what-to-expect", "deep-tissue-vs-sports-massage"],
        status: "published",
        createdAt: new Date(),
      },
      {
        slug: "best-evening-massage-routine-for-better-sleep",
        title: "Best Evening Massage Routine for Better Sleep",
        category: "Stress & Sleep",
        date: "May 08, 2026",
        author: "Sarah Jenkins, Wellness Specialist",
        authorRole: "Sleep & Wellness Coach",
        img: "/assets/images/article3.png",
        intro: "A restful night begins with relaxing your nervous system. Integrating a 10-minute self-massage ritual before bedtime signals your brain to transition into deep restorative sleep.",
        quickSummary: "Gentle evening scalp, temple, and foot massage calms the sympathetic fight-or-flight response, lowers evening cortisol, and prepares your body for rapid sleep onset.",
        keyBenefits: [
          "Activates the parasympathetic 'rest and digest' nervous system.",
          "Lowers heart rate and eases mental rumination before bed.",
          "Improves slow-wave deep sleep quality.",
        ],
        sections: [
          {
            heading: "Step 1: Scalp & Temple Calm",
            text: "Use the pads of all ten fingers to gently massage your scalp in circular motions. Lightly press near your temples using lavender essential oil for enhanced calmness.",
          },
          {
            heading: "Step 2: Palm & Wrist Pressure Points",
            text: "Press your opposite thumb firmly into the center of your palm (Heart 7 pressure point) for 10 deep breaths to quiet an overactive mind.",
          },
        ],
        relatedSlugs: ["how-essential-oils-support-a-calmer-massage", "simple-hand-massage-for-daily-tension", "swedish-massage-what-to-expect"],
        status: "published",
        createdAt: new Date(),
      },
      {
        slug: "how-essential-oils-support-a-calmer-massage",
        title: "How Essential Oils Support a Calmer Massage",
        category: "Aromatherapy",
        date: "May 04, 2026",
        author: "CalmTouch Aromatherapy Team",
        authorRole: "Botanical Specialists",
        img: "/assets/images/article4.png",
        intro: "Aromatherapy enhances massage therapy by combining the tactile benefits of touch with the therapeutic properties of plant extracts. Learn which essential oils to choose for your goals.",
        sections: [
          {
            heading: "Lavender & Chamomile for Relaxation",
            text: "These classic botanicals contain linalool, which has been shown to lower heart rate and reduce stress levels during massage.",
          },
          {
            heading: "Eucalyptus & Peppermint for Muscle Recovery",
            text: "Cooling menthol and eucalyptus extracts penetrate deep into tired muscles, providing a natural soothing sensation.",
          },
        ],
        relatedSlugs: ["best-evening-massage-routine-for-better-sleep", "swedish-massage-what-to-expect", "5-easy-neck-massage-techniques-for-desk-workers"],
        status: "published",
        createdAt: new Date(),
      },
      {
        slug: "swedish-massage-what-to-expect",
        title: "Swedish Massage: What to Expect",
        category: "Massage Therapy",
        date: "April 28, 2026",
        author: "CalmTouch Editorial Team",
        authorRole: "Bodywork Analysts",
        img: "/assets/images/hero.png",
        intro: "Swedish massage is the foundation of modern Western massage therapy. Known for long, sweeping strokes and gentle friction, it provides the ultimate relaxation experience for beginners.",
        sections: [
          {
            heading: "The Five Core Strokes of Swedish Massage",
            text: "Effleurage (gliding strokes), Petrissage (kneading), Tapotement (rhythmic tapping), Friction, and Vibration work together to release body tension.",
          },
          {
            heading: "What Happens During Your First Session",
            text: "Your therapist will consult with you on your health background and focus areas. You will be fully draped in soft sheets, ensuring your privacy and comfort throughout the treatment.",
          },
        ],
        relatedSlugs: ["deep-tissue-vs-sports-massage", "how-often-should-you-get-a-massage", "the-beginners-guide-to-massage-therapy"],
        status: "published",
        createdAt: new Date(),
      },
      {
        slug: "deep-tissue-vs-sports-massage",
        title: "Deep Tissue vs Sports Massage",
        category: "Massage Therapy",
        date: "April 22, 2026",
        author: "Marcus Vance, Athletic Recovery Coach",
        authorRole: "Recovery Specialist",
        img: "/assets/images/article2.png",
        intro: "While both deep tissue and sports massage target deeper muscle layers, they serve distinct purposes depending on whether you seek chronic tension relief or athletic performance enhancement.",
        sections: [
          {
            heading: "Deep Tissue Massage Focus",
            text: "Targets chronic muscle tightness and adhesions ('knots') using slow, deliberate firm pressure across muscle fibers.",
          },
          {
            heading: "Sports Massage Focus",
            text: "Tailored specifically for athletes, incorporating active stretching, joint mobilization, and fast-paced strokes to boost agility and speed up post-workout recovery.",
          },
        ],
        relatedSlugs: ["swedish-massage-what-to-expect", "how-often-should-you-get-a-massage", "can-massage-help-lower-back-pain"],
        status: "published",
        createdAt: new Date(),
      },
      {
        slug: "how-often-should-you-get-a-massage",
        title: "How Often Should You Get a Massage?",
        category: "Massage Therapy",
        date: "April 18, 2026",
        author: "CalmTouch Editorial Team",
        authorRole: "Wellness Advisors",
        img: "/assets/images/article1.png",
        intro: "Determining your ideal massage frequency depends on your lifestyle, physical activity level, stress, and specific wellness goals.",
        sections: [
          {
            heading: "For General Stress & Maintenance",
            text: "A monthly session (every 3 to 4 weeks) is ideal for maintaining mobility, keeping stress levels manageable, and promoting immune function.",
          },
          {
            heading: "For Chronic Pain & Rehabilitation",
            text: "Initial treatment regimens may benefit from weekly or bi-weekly visits until acute discomfort stabilizes, gradually transitioning to monthly maintenance.",
          },
        ],
        relatedSlugs: ["swedish-massage-what-to-expect", "5-easy-neck-massage-techniques-for-desk-workers", "deep-tissue-vs-sports-massage"],
        status: "published",
        createdAt: new Date(),
      },
      {
        slug: "simple-hand-massage-for-daily-tension",
        title: "Simple Hand Massage for Daily Tension",
        category: "Self-Care",
        date: "April 14, 2026",
        author: "CalmTouch Editorial Team",
        authorRole: "Editorial Staff",
        img: "/assets/images/article3.png",
        intro: "Our hands perform complex micro-movements all day long. A simple 3-minute hand massage can relieve strain from typing, texting, and manual tasks.",
        sections: [
          {
            heading: "Thumb Webbing Release",
            text: "Gently pinch the fleshy area between your thumb and index finger using your opposite hand. Massage in small circles for 30 seconds on each hand.",
          },
          {
            heading: "Finger Stretches & Flexion",
            text: "Gently pull each finger from base to tip, applying light traction to relieve finger joint compression.",
          },
        ],
        relatedSlugs: ["5-easy-neck-massage-techniques-for-desk-workers", "best-evening-massage-routine-for-better-sleep", "how-essential-oils-support-a-calmer-massage"],
        status: "published",
        createdAt: new Date(),
      },
      {
        slug: "the-beginners-guide-to-massage-therapy",
        title: "The Beginner’s Guide to Massage Therapy",
        category: "Massage Therapy",
        date: "April 10, 2026",
        author: "CalmTouch Editorial Staff",
        authorRole: "Wellness Advisors",
        img: "/assets/images/guide.png",
        intro: "Everything you need to know about starting your massage therapy journey—from selecting the right therapist to understanding etiquette, pressure levels, and home care practices.",
        sections: [
          {
            heading: "Selecting the Right Style",
            text: "Whether you need stress reduction (Swedish), targeted tension release (Deep Tissue), or energy balance (Shiatsu), understanding style differences ensures a great session.",
          },
          {
            heading: "Preparing for Your Session",
            text: "Arrive 10 minutes early, hydrate well, communicate your pressure preferences clearly with your practitioner, and take slow deep breaths during the session.",
          },
        ],
        relatedSlugs: ["swedish-massage-what-to-expect", "how-often-should-you-get-a-massage", "deep-tissue-vs-sports-massage"],
        status: "published",
        createdAt: new Date(),
      },
    ];
    await articlesCol.insertMany(articles);
    console.log(`✓ Inserted ${articles.length} articles.`);
  } else {
    console.log(`✓ Articles already seeded (${artCount} found).`);
  }

  // 4. SiteConfig
  const siteConfigCol = db.collection("siteconfigs");
  const siteConfigCount = await siteConfigCol.countDocuments();
  if (siteConfigCount === 0) {
    await siteConfigCol.insertOne({
      brandName: "CalmTouch",
      tagline: "Massage & Wellness Blog",
      logoUrl: "",
      metaDescription: "Simple, trustworthy guidance for massage therapy, pain relief, recovery, stress care, and healthy routines for everyday life.",
      contactEmail: "support@calmtouch.com",
      socialLinks: {
        facebook: "https://facebook.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com",
      },
      createdAt: new Date(),
    });
    console.log("✓ SiteConfig initialized.");
  } else {
    console.log("✓ SiteConfig already initialized.");
  }

  console.log("\n🎉 ALL COLLECTIONS INITIALIZED IN MONGODB ATLAS!");
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
