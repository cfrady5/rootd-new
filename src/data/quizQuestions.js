// /src/data/quizQuestions.js
const quizQuestions = [
  // ===== Account & Context (required, non-scored) =====
  {
    id: 1,
    category: "Account",
    type: "text",
    question: "School",
    placeholder: "e.g. Purdue University",
    mapsTo: []
  },
  {
    id: 2,
    category: "Account",
    type: "single",
    question: "Sport",
    options: [
      "Basketball","Football","Soccer","Baseball","Softball","Volleyball",
      "Track & Field","Cross Country","Swimming & Diving","Wrestling","Tennis",
      "Golf","Gymnastics","Lacrosse","Hockey","Cheer / Dance","Esports","Other"
    ],
    mapsTo: []
  },

  // ===== Platforms & Performance =====
  {
    id: 3,
    category: "Platforms",
    type: "multiNumber",
    question: "Followers by platform",
    fields: [
      { key: "instagram", label: "Instagram" },
      { key: "tiktok",    label: "TikTok" },
      { key: "youtube",   label: "YouTube" },
      { key: "twitter",   label: "X (Twitter)" },
      { key: "linkedin",  label: "LinkedIn" },
      { key: "facebook",  label: "Facebook" }
    ],
    mapsTo: ["platformOverlapIndex","localInfluenceDensity","influenceBase"]
  },
  {
    id: 4,
    category: "Platforms",
    type: "slider",
    question: "How many posts do you make per week (all platforms)?",
    min: 0,
    max: 14,
    step: 1,
    mapsTo: ["consistencyIndex","cadenceSync","athleteScore"]
  },
  {
    id: 5,
    category: "Platforms",
    type: "single",
    question: "Typical Instagram Story views",
    options: ["<500","500–1k","1k–3k","3k–10k","10k+"],
    mapsTo: ["conversionPropensity","engagementAuthenticity"]
  },
  {
    id: 6,
    category: "Platforms",
    type: "single",
    question: "Typical TikTok/short-video views",
    options: ["<1k","1k–5k","5k–20k","20k–100k","100k+"],
    mapsTo: ["viralityScore","conversionPropensity"]
  },
  {
    id: 7,
    category: "Execution",
    type: "single",
    question: "Typical turnaround from brief to post",
    options: ["24 hours","2–3 days","~1 week",">1 week"],
    mapsTo: ["responseLikelihood","scheduleCompatibility"]
  },
  {
    id: 8,
    category: "Execution",
    type: "slider",
    question: "Hours per week you can commit to NIL content/appearances",
    min: 0,
    max: 10,
    step: 1,
    mapsTo: ["dealComplexityTolerance","scheduleCompatibility","eventSync"]
  },

  // ===== Brand Tone & Content =====
  {
    id: 9,
    category: "Brand",
    type: "single",
    question: "Preferred brand tone",
    options: ["Polished","Authentic","Funny","Inspirational","Educational"],
    mapsTo: ["toneAlignment","aestheticFit"]
  },
  {
    id: 10,
    category: "Brand",
    type: "multiple",
    question: "Content formats you can deliver",
    options: ["Short-form video","Photos","Livestreams","Podcasts","In-person events","Blogs"],
    mapsTo: ["contentTypeCompat","crossPlatformPotential"]
  },
  {
    id: 11,
    category: "Brand",
    type: "single",
    question: "Comfort making sponsored posts",
    options: ["Very comfortable","Somewhat","Neutral","Not yet"],
    mapsTo: ["mediaQuality","contentTypeCompat"]
  },
  {
    id: 12,
    category: "Brand",
    type: "multiple",
    question: "Your usual content themes",
    options: [
      "Game highlights","Training","Behind-the-scenes","Humor/trends",
      "Lifestyle/fashion","Tech/gaming","Food/reviews","Community"
    ],
    mapsTo: ["interestMatch","aestheticFit"]
  },

  // ===== Interests, Values, Personality =====
  {
    id: 13,
    category: "Fit",
    type: "ranked",
    question: "Top 3 industries you want to partner with (rank)",
    options: [
      "Coffee/cafés","Restaurants","Gyms/fitness","Health & wellness","Retail/apparel",
      "Tech/startups","Education/tutoring","Automotive","Media/entertainment","Travel/hospitality"
    ],
    max: 3,
    mapsTo: ["interestMatch","valueAlignment"]
  },
  {
    id: 14,
    category: "Fit",
    type: "multiple",
    question: "Causes you care about",
    options: [
      "Youth mentorship","Education/literacy","Mental health","Faith-based","Environment",
      "Food security","Local business growth","Veteran support","Inclusion"
    ],
    mapsTo: ["valueAlignment","communityPresence"]
  },
  {
    id: 15,
    category: "Fit",
    type: "slider",
    question: "Community involvement frequency",
    min: 0,
    max: 5,
    step: 1,
    mapsTo: ["communityPresence","eventSync"]
  },
  {
    id: 16,
    category: "Personality",
    type: "slider",
    question: "I like leading on camera",
    min: 1,
    max: 5,
    step: 1,
    mapsTo: ["personalityCompat","responseLikelihood"]
  },
  {
    id: 17,
    category: "Personality",
    type: "slider",
    question: "I prefer polished visuals over casual posts",
    min: 1,
    max: 5,
    step: 1,
    mapsTo: ["aestheticFit"]
  },
  {
    id: 18,
    category: "Personality",
    type: "slider",
    question: "I enjoy trying trending formats",
    min: 1,
    max: 5,
    step: 1,
    mapsTo: ["viralityScore","toneAlignment"]
  },

  // ===== Economics & Compensation =====
  {
    id: 19,
    category: "Compensation",
    type: "slider",
    question: "Minimum value for a sponsored post (USD)",
    min: 0,
    max: 5000,
    step: 50,
    unit: "$",
    mapsTo: ["priceFitRatio","athleteScore"]
  },
  {
    id: 20,
    category: "Compensation",
    type: "single",
    question: "Accept non-cash (free product/store credit)?",
    options: ["Yes","No"],
    mapsTo: ["compTypeMatch","athleteScore"]
  },
  {
    id: 21,
    category: "Compensation",
    type: "single",
    question: "Open to multi-month collaborations?",
    options: ["Yes","No"],
    mapsTo: ["dealComplexityTolerance","longevityIndex"]
  },

  // ===== Availability & Distance =====
  {
    id: 22,
    category: "Timing",
    type: "multiple",
    question: "Available months for NIL activities",
    options: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    mapsTo: ["scheduleCompatibility","campaignTimingMatch"]
  },
  {
    id: 23,
    category: "Location",
    type: "slider",
    question: "Preferred maximum distance for local business matches",
    min: 0,
    max: 250,
    step: 5,
    unit: "mi",
    mapsTo: ["distanceMiles","localInfluenceDensity"]
  },

  // ===== Compliance & Readiness =====
  {
    id: 24,
    category: "Compliance",
    type: "slider",
    question: "Confidence managing NIL contracts",
    min: 1,
    max: 5,
    step: 1,
    mapsTo: ["institutionalApprovalReady","athleteScore"]
  },
  {
    id: 25,
    category: "Compliance",
    type: "single",
    question: "KYC/Tax/Payout setup complete?",
    options: ["Yes","No"],
    mapsTo: ["paymentReadiness","athleteScore"]
  },
  {
    id: 26,
    category: "Compliance",
    type: "multiple",
    question: "Support you want from Rootd",
    options: [
      "Social strategy","Brand partnerships","Legal guidance",
      "Financial literacy","Time management","Media kit"
    ],
    mapsTo: ["contractClarityScore"]
  },

  // ===== Risk & Safety =====
  {
    id: 27,
    category: "Safety",
    type: "single",
    question: "I agree to avoid restricted categories per school policy",
    options: ["Agree","Unsure"],
    mapsTo: ["categoryRestrictionMatch"]
  },
  {
    id: 28,
    category: "Safety",
    type: "single",
    question: "My recent content is brand-safe for family audiences",
    options: ["Yes","Not sure"],
    mapsTo: ["brandSafetyAlignment"]
  },

  // ===== Platform Focus & Cadence Sync =====
  {
    id: 29,
    category: "Platform Focus",
    type: "multiple",
    question: "Platforms you want to prioritize with brands",
    options: ["Instagram","TikTok","YouTube","X (Twitter)","Twitch","LinkedIn"],
    mapsTo: ["platformOverlapIndex","crossPlatformPotential","cadenceSync"]
  },

  // ===== Reputation & References =====
  {
    id: 30,
    category: "Reputation",
    type: "single",
    question: "Coach/mentor reference available if needed",
    options: ["Yes","No"],
    mapsTo: ["reputationIndex","peerRecommendation"]
  }
];

export { quizQuestions };
export default quizQuestions;
