export type Language = 'en' | 'ur';

export interface Translations {
  // Brand & Common
  brandName: string;
  tagline: string;
  home: string;
  dashboard: string;
  features: string;
  howItWorks: string;
  faq: string;
  signIn: string;
  signOut: string;
  signUp: string;
  getStarted: string;
  startPlanning: string;
  exploreFeatures: string;
  back: string;
  next: string;
  save: string;
  cancel: string;
  submit: string;
  edit: string;
  delete: string;
  archive: string;
  duplicate: string;
  close: string;
  loading: string;
  error: string;
  success: string;
  actions: string;
  viewDetails: string;
  pkr: string;
  marla: string;
  kanal: string;
  sqft: string;
  toggleTheme: string;

  // Roles
  roles: {
    homeowner: string;
    contractor: string;
    supplier: string;
    admin: string;
  };

  // Nav
  nav: {
    homeowner: string;
    contractor: string;
    supplier: string;
    dashboard: string;
    availableProjects: string;
    messages: string;
    notifications: string;
    profile: string;
    settings: string;
    products: string;
    orders: string;
  };

  // Landing Page
  landing: {
    mvpBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    sampleBreakdownTitle: string;
    sampleEstimatedRange: string;
    featuresHeading: string;
    featuresSubheading: string;
    featureAiTitle: string;
    featureAiDesc: string;
    featureContractorTitle: string;
    featureContractorDesc: string;
    featureSupplierTitle: string;
    featureSupplierDesc: string;
    featureChatTitle: string;
    featureChatDesc: string;
    howHeading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    faqHeading: string;
    faq1Q: string;
    faq1A: string;
    faq2Q: string;
    faq2A: string;
    faq3Q: string;
    faq3A: string;
    testimonialTag: string;
    footerText: string;
  };

  // Auth
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    signupTitle: string;
    signupSubtitle: string;
    forgotPasswordTitle: string;
    forgotPasswordSubtitle: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    city: string;
    confirmPassword: string;
    rememberMe: string;
    forgotPasswordLink: string;
    createAccountLink: string;
    haveAccountLink: string;
    sendResetLink: string;
    resetLinkSent: string;
    loginSuccess: string;
    loginFailed: string;
    signupSuccess: string;
    chooseRoleTitle: string;
    chooseRoleSubtitle: string;
    selectRolePrompt: string;
    primaryCity: string;
    confirmRole: string;
  };

  // Estimator & Homeowner Dashboard
  estimator: {
    title: string;
    subtitle: string;
    newProject: string;
    myProjects: string;
    activeProjects: string;
    completedProjects: string;
    archivedProjects: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step1Desc: string;
    step2Desc: string;
    step3Desc: string;
    step4Desc: string;
    step5Desc: string;
    projectTitleLabel: string;
    projectTitlePlaceholder: string;
    cityLabel: string;
    plotSizeLabel: string;
    plotSizeHelp: string;
    coveredAreaLabel: string;
    coveredAreaHelp: string;
    floorsLabel: string;
    basementLabel: string;
    basementDesc: string;
    soilTypeLabel: string;
    constructionTypeLabel: string;
    greyStructure: string;
    turnkey: string;
    materialQualityLabel: string;
    interiorFinishLabel: string;
    exteriorFinishLabel: string;
    roomLayoutHeading: string;
    roomLayoutSubheading: string;
    bedrooms: string;
    bathrooms: string;
    attachedBaths: string;
    powderRoom: string;
    kitchens: string;
    dirtyKitchen: string;
    drawingDining: string;
    tvLounge: string;
    carPorch: string;
    porch1Small: string;
    porch1Large: string;
    porch2Cars: string;
    porch3Cars: string;
    servantQuarter: string;
    mumtyRooftop: string;
    amenitiesHeading: string;
    amenitiesSubheading: string;
    solarPanels: string;
    solarPanelsDesc: string;
    smartHome: string;
    smartHomeDesc: string;
    lawnGarden: string;
    lawnGardenDesc: string;
    swimmingPool: string;
    swimmingPoolDesc: string;
    parkingSpace: string;
    calculateEstimate: string;
    calculating: string;
    estimateReady: string;
    totalEstimatedCost: string;
    minMaxRange: string;
    costBreakdown: string;
    landPrep: string;
    structureFoundation: string;
    plumbingSanitary: string;
    electricalWiring: string;
    finishingPaint: string;
    laborCost: string;
    materialsCost: string;
    matchedContractors: string;
    relevantMaterials: string;
    requestQuotes: string;
    viewResults: string;
    noProjectsYet: string;
    deleteConfirm: string;
  };

  // Contractor & Quotations
  contractor: {
    dashboardTitle: string;
    availableLeads: string;
    myQuotes: string;
    activeWork: string;
    submitQuote: string;
    quoteAmount: string;
    durationDays: string;
    warranty: string;
    timeline: string;
    notes: string;
    experienceYears: string;
    completedProjectsCount: string;
    specialization: string;
    acceptQuote: string;
    rejectQuote: string;
    pendingQuotes: string;
    acceptedQuotes: string;
  };

  // Supplier & Materials
  supplier: {
    dashboardTitle: string;
    myProducts: string;
    addProduct: string;
    productName: string;
    category: string;
    brand: string;
    price: string;
    stock: string;
    unit: string;
    deliveryAvailable: string;
    minimumOrder: string;
    requestMaterialQuote: string;
  };

  // Chat & Communication
  chat: {
    title: string;
    typeMessage: string;
    send: string;
    online: string;
    connecting: string;
    noMessages: string;
    startConversation: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    brandName: 'BuildWise AI',
    tagline: 'Smart Construction Planning & PKR Cost Estimation',
    home: 'Home',
    dashboard: 'Dashboard',
    features: 'Features',
    howItWorks: 'How it works',
    faq: 'FAQ',
    signIn: 'Sign in',
    signOut: 'Sign out',
    signUp: 'Get started',
    getStarted: 'Get started',
    startPlanning: 'Start planning',
    exploreFeatures: 'Explore features',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    edit: 'Edit',
    delete: 'Delete',
    archive: 'Archive',
    duplicate: 'Duplicate',
    close: 'Close',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    actions: 'Actions',
    viewDetails: 'View details',
    pkr: 'PKR',
    marla: 'Marla',
    kanal: 'Kanal',
    sqft: 'Sq Ft',
    toggleTheme: 'Toggle theme',

    roles: {
      homeowner: 'Homeowner',
      contractor: 'Contractor / Builder',
      supplier: 'Material Supplier',
      admin: 'Administrator'
    },

    nav: {
      homeowner: 'Homeowner Hub',
      contractor: 'Contractor Workspace',
      supplier: 'Supplier Portal',
      dashboard: 'Dashboard',
      availableProjects: 'Available Projects',
      messages: 'Messages',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
      products: 'My Products',
      orders: 'Orders'
    },

    landing: {
      mvpBadge: '🇵🇰 Pakistan-first Construction Planning Platform',
      heroTitle: 'Plan, Estimate & Build with Confidence',
      heroSubtitle: 'AI-powered construction cost planning, verified Pakistani contractor quotations, realtime messaging, and material supplier promotions in one unified platform.',
      sampleBreakdownTitle: 'Estimated Cost Breakdown (5 Marla Double Storey)',
      sampleEstimatedRange: 'Estimated Total Cost Range',
      featuresHeading: 'Engineered for Pakistani Construction Needs',
      featuresSubheading: 'Connecting homeowners, contractors, and building material suppliers with accurate PKR estimations and verified contracts.',
      featureAiTitle: 'AI Cost Estimation',
      featureAiDesc: 'Detailed PKR cost ranges across land preparation, grey structure, plumbing, electrical, and finishing for any Marla or Kanal plot.',
      featureContractorTitle: 'Verified Contractor Network',
      featureContractorDesc: 'Smart matching based on budget, city, experience, completed projects, verified reviews, and building specialization.',
      featureSupplierTitle: 'Direct Material Suppliers',
      featureSupplierDesc: 'Connect with verified cement, steel, brick, tile, and sanitary suppliers with transparent market pricing.',
      featureChatTitle: 'Realtime Collaboration',
      featureChatDesc: 'Coordinate directly with contractors and suppliers with live chat, project attachments, and progress milestones.',
      howHeading: 'How BuildWise AI Works',
      step1Title: 'Define Your House Specs',
      step1Desc: 'Enter plot size in Marla, select city, choose number of floors, bedrooms, kitchen layout, and finishing tier.',
      step2Title: 'Get AI Estimation',
      step2Desc: 'Instant comprehensive PKR cost estimate broken down into grey structure, plumbing, electrical, and finishing.',
      step3Title: 'Hire & Track Construction',
      step3Desc: 'Receive competitive bids from verified local contractors, compare quotations, and track progress from ground to rooftop.',
      faqHeading: 'Frequently Asked Questions',
      faq1Q: 'Are the construction rates updated for current Pakistani inflation?',
      faq1A: 'Yes! Rates reflect current 2024-2026 Pakistani market averages for cement bags, steel per ton, brick per thousand, and skilled labor daily wages.',
      faq2Q: 'What is the difference between Grey Structure and Turnkey?',
      faq2A: 'Grey structure includes foundations, brick masonry, concrete lintels, roof slabs, and internal plumbing/electrical conduit pipes. Turnkey includes complete finishing with tiles, paint, sanitary fittings, doors, and woodwork.',
      faq3Q: 'How are contractors verified?',
      faq3A: 'Contractors submit verified portfolios, CNIC/business credentials, verified completed site photos, and receive ratings from real homeowners.',
      testimonialTag: 'Verified Homeowner Feedback',
      footerText: 'BuildWise AI — Smart Construction Planning & PKR Estimation Platform'
    },

    auth: {
      loginTitle: 'Sign in to BuildWise AI',
      loginSubtitle: 'Plan budgets, compare builders, and manage construction decisions.',
      signupTitle: 'Create your BuildWise Account',
      signupSubtitle: 'Join Pakistan\'s smartest construction planning and contractor network.',
      forgotPasswordTitle: 'Reset your Password',
      forgotPasswordSubtitle: 'Enter your email address and we will send you a reset link.',
      email: 'Email Address',
      password: 'Password',
      fullName: 'Full Name',
      phone: 'Phone Number (e.g. 0300-1234567)',
      city: 'City',
      confirmPassword: 'Confirm Password',
      rememberMe: 'Remember me',
      forgotPasswordLink: 'Forgot password?',
      createAccountLink: 'Create an account',
      haveAccountLink: 'Already have an account? Sign in',
      sendResetLink: 'Send reset instructions',
      resetLinkSent: 'Reset link sent to your email.',
      loginSuccess: 'Welcome back!',
      loginFailed: 'Login failed. Please check your credentials.',
      signupSuccess: 'Account created successfully!',
      chooseRoleTitle: 'How will you use BuildWise?',
      chooseRoleSubtitle: 'Select your role on the platform. Each role has custom-tailored construction tools.',
      selectRolePrompt: 'Select your role to continue',
      primaryCity: 'Primary Operating City',
      confirmRole: 'Confirm & Continue to Dashboard'
    },

    estimator: {
      title: 'AI Construction Cost Estimator',
      subtitle: 'Calculate accurate construction costs in Pakistani Rupees based on current market rates for cement, steel, bricks, and labor.',
      newProject: 'New Project Estimation',
      myProjects: 'My Saved Projects',
      activeProjects: 'Active Projects',
      completedProjects: 'Completed',
      archivedProjects: 'Archived',
      step1: 'Basic Info',
      step2: 'Soil & Structure',
      step3: 'Finishing & Quality',
      step4: 'Rooms & Floor Layout',
      step5: 'Modern Amenities',
      step1Desc: 'Plot size, city, and number of storeys',
      step2Desc: 'Soil conditions and construction type',
      step3Desc: 'Material grade and finishing tier',
      step4Desc: 'Bedrooms, bathrooms, kitchen, and lounge',
      step5Desc: 'Solar, smart automation, lawn, and porch',
      projectTitleLabel: 'Project Name / Title',
      projectTitlePlaceholder: 'e.g., 5 Marla Double Storey House in Bahria Town',
      cityLabel: 'City / Region',
      plotSizeLabel: 'Plot Size (in Marlas)',
      plotSizeHelp: '1 Marla = 225 or 272 sq ft (Standard Pakistani 5, 10, or 20 Marla / 1 Kanal)',
      coveredAreaLabel: 'Covered Area (Sq Ft)',
      coveredAreaHelp: 'Total built-up slab area across all floors',
      floorsLabel: 'Number of Floors (Storeys)',
      basementLabel: 'Basement Required?',
      basementDesc: 'Includes excavation, retaining walls, and damp proofing',
      soilTypeLabel: 'Soil Type at Site',
      constructionTypeLabel: 'Construction Package',
      greyStructure: 'Grey Structure (ڈھانچہ)',
      turnkey: 'Turnkey (Complete with Finishing)',
      materialQualityLabel: 'Material Quality Grade',
      interiorFinishLabel: 'Interior Finishing Standard',
      exteriorFinishLabel: 'Exterior Elevation & Paint',
      roomLayoutHeading: 'Rooms & Floor Configuration',
      roomLayoutSubheading: 'Specify detailed room counts to accurately calculate masonry, plaster, doors, and electrical points.',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      attachedBaths: 'All Attached Bathrooms',
      powderRoom: 'Powder Room for Guests',
      kitchens: 'Kitchens',
      dirtyKitchen: 'Separate Dirty/Wet Kitchen',
      drawingDining: 'Drawing & Dining Room',
      tvLounge: 'TV Lounge on Each Floor',
      carPorch: 'Car Porch Capacity',
      porch1Small: '1 Small Hatchback',
      porch1Large: '1 Large Sedan / SUV',
      porch2Cars: '2 Cars Capacity',
      porch3Cars: '3+ Cars Capacity',
      servantQuarter: 'Servant Quarter & Bathroom',
      mumtyRooftop: 'Mumty & Rooftop Access Stairs',
      amenitiesHeading: 'Modern Additions & Green Energy',
      amenitiesSubheading: 'Add smart home features, solar system, and landscape elements.',
      solarPanels: 'On-Grid / Hybrid Solar System',
      solarPanelsDesc: 'Includes solar panels, inverter, Net-metering setup, and wiring',
      smartHome: 'Smart Home Automation',
      smartHomeDesc: 'Smart switches, video doorbell, security cameras, and mobile app controls',
      lawnGarden: 'Front Lawn / Green Garden',
      lawnGardenDesc: 'Grass turf, planters, border tiles, and exterior lighting',
      swimmingPool: 'Private Swimming Pool',
      swimmingPoolDesc: 'Concrete shell, waterproofing, filtration pump, and mosaic tiling',
      parkingSpace: 'Dedicated Car Parking Area',
      calculateEstimate: 'Generate AI Cost Estimate',
      calculating: 'Analyzing Current Market Rates & Calculating...',
      estimateReady: 'Your Construction Cost Estimate is Ready!',
      totalEstimatedCost: 'Total Estimated Construction Cost',
      minMaxRange: 'Expected Minimum to Maximum Range',
      costBreakdown: 'Itemized Cost Breakdown',
      landPrep: 'Excavation & Land Preparation',
      structureFoundation: 'Foundation & Grey Structure',
      plumbingSanitary: 'Plumbing & Sanitary Lines',
      electricalWiring: 'Electrical Wiring & DB Boxes',
      finishingPaint: 'Tiles, Woodwork, Paint & Fixtures',
      laborCost: 'Skilled & Unskilled Labor Cost',
      materialsCost: 'Primary Materials (Cement, Steel, Bricks, Sand)',
      matchedContractors: 'Recommended Contractors for this Project',
      relevantMaterials: 'Relevant Material Offers & Discounts',
      requestQuotes: 'Request Quotations from Contractors',
      viewResults: 'View Full Analysis & Breakdown',
      noProjectsYet: 'You haven\'t created any projects yet. Start with your first house estimate!',
      deleteConfirm: 'Are you sure you want to delete this project?'
    },

    contractor: {
      dashboardTitle: 'Contractor Workspace',
      availableLeads: 'Available Construction Projects',
      myQuotes: 'My Submitted Quotations',
      activeWork: 'Active Site Projects',
      submitQuote: 'Submit Formal Quotation',
      quoteAmount: 'Total Bid Amount (PKR)',
      durationDays: 'Project Duration (Days / Months)',
      warranty: 'Structural Warranty Period',
      timeline: 'Construction Timeline Milestones',
      notes: 'Terms & Conditions / Scope of Work',
      experienceYears: 'Years of Experience',
      completedProjectsCount: 'Completed Projects',
      specialization: 'Core Specialization',
      acceptQuote: 'Accept Quotation',
      rejectQuote: 'Decline Quotation',
      pendingQuotes: 'Pending Homeowner Review',
      acceptedQuotes: 'Accepted & Contracted'
    },

    supplier: {
      dashboardTitle: 'Building Materials Marketplace',
      myProducts: 'Catalog of Building Materials',
      addProduct: 'Add New Material / Product',
      productName: 'Material Name (e.g. Bestway Cement / Mughal Steel)',
      category: 'Category',
      brand: 'Brand / Manufacturer',
      price: 'Unit Price (PKR)',
      stock: 'Available Stock',
      unit: 'Unit of Measure (Bag, Ton, 1000 Bricks, Sq Ft)',
      deliveryAvailable: 'Home / Site Delivery Available',
      minimumOrder: 'Minimum Order Quantity',
      requestMaterialQuote: 'Request Bulk Material Rate'
    },

    chat: {
      title: 'Project Communication',
      typeMessage: 'Type your message here...',
      send: 'Send',
      online: 'Online',
      connecting: 'Connecting...',
      noMessages: 'No messages yet. Send a message to start the conversation!',
      startConversation: 'Start direct chat'
    }
  },

  ur: {
    brandName: 'بلڈ وائز اے آئی',
    tagline: 'پاکستان میں سمارٹ تعمیراتی منصوبہ بندی اور لاگت کا درست تخمینہ',
    home: 'ہوم',
    dashboard: 'ڈیش بورڈ',
    features: 'خصوصیات',
    howItWorks: 'یہ کیسے کام کرتا ہے؟',
    faq: 'عمومی سوالات',
    signIn: 'لاگ ان کریں',
    signOut: 'لاگ آؤٹ',
    signUp: 'ابھی شروع کریں',
    getStarted: 'شروع کریں',
    startPlanning: 'منصوبہ بندی شروع کریں',
    exploreFeatures: 'خصوصیات دیکھیں',
    back: 'واپس',
    next: 'اگلا مرحلہ',
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں',
    submit: 'جمع کروائیں',
    edit: 'ترمیم کریں',
    delete: 'حذف کریں',
    archive: 'آرکائیو کریں',
    duplicate: 'کاپی بنائیں',
    close: 'بند کریں',
    loading: 'لوڈ ہو رہا ہے...',
    error: 'کوئی خرابی پیش آ گئی ہے',
    success: 'کامیابی',
    actions: 'اقدامات',
    viewDetails: 'تفصیلات دیکھیں',
    pkr: 'روپے (PKR)',
    marla: 'مرلہ',
    kanal: 'کنال',
    sqft: 'مربع فٹ',
    toggleTheme: 'تھیم تبدیل کریں',

    roles: {
      homeowner: 'گھر کا مالک (Homeowner)',
      contractor: 'ٹھیکیدار / بلڈر (Contractor)',
      supplier: 'میٹریل سپلائر (Supplier)',
      admin: 'ایڈمنسٹریٹر'
    },

    nav: {
      homeowner: 'ہوم اونر پورٹل',
      contractor: 'ٹھیکیدار ورک اسپیس',
      supplier: 'سپلائر پورٹل',
      dashboard: 'ڈیش بورڈ',
      availableProjects: 'دستیاب منصوبے',
      messages: 'پیغامات',
      notifications: 'اطلاعات',
      profile: 'پروفائل',
      settings: 'ترتیبات',
      products: 'میرے پروڈکٹس',
      orders: 'آرڈرز'
    },

    landing: {
      mvpBadge: '🇵🇰 پاکستان کا پہلا سمارٹ تعمیراتی پلیٹ فارم',
      heroTitle: 'اپنا گھر بنائیں مکمل اعتماد اور درست تخمینے کے ساتھ',
      heroSubtitle: 'تعمیراتی لاگت کا جدید ترین اے آئی تخمینہ، تصدیق شدہ پاکستانی ٹھیکیداروں کی کوٹیشنز، لائیو چیٹ اور بلڈنگ میٹریل کے بہترین ریٹس ایک ہی جگہ پر۔',
      sampleBreakdownTitle: 'متوقع لاگت کی تفصیل (5 مرلہ ڈبل اسٹوری مکان)',
      sampleEstimatedRange: 'کل متوقع لاگت کی رینج',
      featuresHeading: 'پاکستانی تعمیراتی ضروریات کے عین مطابق',
      featuresSubheading: 'گھر بنانے والوں، ٹھیکیداروں اور بلڈنگ میٹریل سپلائرز کو شفاف قیمتوں اور تصدیق شدہ معاہدوں سے جوڑتا ہے۔',
      featureAiTitle: 'اے آئی لاگت کا تخمینہ',
      featureAiDesc: 'زمین کی کھدائی سے لے کر گرے اسٹرکچر، بجلی کی وائرنگ، پلمبنگ اور فنشنگ تک پاکستانی روپے میں تفصیلی لاگت کا تخمینہ۔',
      featureContractorTitle: 'تصدیق شدہ ٹھیکیدار نیٹ ورک',
      featureContractorDesc: 'اپنے شہر، بجٹ، سابقہ مکمل شدہ پروجیکٹس اور ریٹنگز کے مطابق بہترین کاریگر اور بلڈر تلاش کریں۔',
      featureSupplierTitle: 'ڈائریکٹ میٹریل سپلائرز',
      featureSupplierDesc: 'سیمنٹ، سریہ، اینٹیں، ریت، بجری، ٹائلز اور سینیٹری کے مصدقہ ڈیلرز سے ہول سیل ریٹس پر سامان حاصل کریں۔',
      featureChatTitle: 'لائیو باہمی رابطہ',
      featureChatDesc: 'ٹھیکیداروں اور سپلائرز کے ساتھ براہ راست چیٹ، تصاویر اور نقشہ جات کا تبادلہ کریں اور تعمیراتی کام کی نگرانی کریں۔',
      howHeading: 'بلڈ وائز اے آئی کیسے کام کرتا ہے؟',
      step1Title: 'مکان کی تفصیلات درج کریں',
      step1Desc: 'پلاٹ کا سائز (مرلہ/کنال)، شہر، منزلوں کی تعداد، بیڈ رومز، کچن کی قسم اور فنشنگ کوالٹی منتخب کریں۔',
      step2Title: 'فوری تفصیلی تخمینہ حاصل کریں',
      step2Desc: 'سسٹم موجودہ مارکیٹ ریٹس پر میٹریل، لیبر اور مرحلہ وار اخراجات کی تفصیلی رپورٹ تیار کرے گا۔',
      step3Title: 'ٹھیکیدار منتخب کریں اور کام شروع کریں',
      step3Desc: 'مقامی ٹھیکیداروں سے کوٹیشنز وصول کریں، موازنہ کریں اور پروجیکٹ کے ہر مرحلے کی آسانی سے نگرانی کریں۔',
      faqHeading: 'اکثر پوچھے جانے والے سوالات',
      faq1Q: 'کیا تعمیراتی ریٹس موجودہ پاکستانی مارکیٹ کے مطابق ہیں؟',
      faq1A: 'جی ہاں! تمام ریٹس سیمنٹ کی بوری، سریہ فی ٹن، اینٹیں فی ہزار اور کاریگر و مزدور کی روزانہ اجرت کی تازہ ترین مارکیٹ کے مطابق ہیں۔',
      faq2Q: 'گرے اسٹرکچر اور ٹرن کی (Turnkey) میں کیا فرق ہے؟',
      faq2A: 'گرے اسٹرکچر میں بنیادیں، اینٹوں کی چنائی، لینٹل، چھت کا لنٹر، پلمبنگ اور بجلی کی پائپ فٹنگ شامل ہوتی ہے۔ جبکہ ٹرن کی میں مکمل فنشنگ (ٹائلیں، ماربل، پینٹ، دروازے، کھڑکیاں اور سینیٹری) شامل ہوتی ہے۔',
      faq3Q: 'ٹھیکیداروں کی تصدیق کیسے کی جاتی ہے؟',
      faq3A: 'ٹھیکیدار اپنا شناختی کارڈ، سابقہ تعمیر شدہ گھروں کی تصاویر، سائٹ کی لوکیشن اور کلائنٹس کے ریویوز فراہم کرتے ہیں۔',
      testimonialTag: 'صارفین کی آراء',
      footerText: 'بلڈ وائز اے آئی — پاکستان میں سمارٹ کنسٹرکشن پلاننگ اور تخمینہ کاری کا جدید پلیٹ فارم'
    },

    auth: {
      loginTitle: 'بلڈ وائز اے آئی میں لاگ ان کریں',
      loginSubtitle: 'اپنا بجٹ پلان کریں، ٹھیکیداروں کا موازنہ کریں اور تعمیراتی فیصلے آسانی سے لیں۔',
      signupTitle: 'نیا بلڈ وائز اکاؤنٹ بنائیں',
      signupSubtitle: 'پاکستان کے سب سے جدید تعمیراتی نیٹ ورک کا حصہ بنیں۔',
      forgotPasswordTitle: 'پاس ورڈ ری سیٹ کریں',
      forgotPasswordSubtitle: 'اپنا رجسٹرڈ ای میل درج کریں تاکہ ہم آپ کو ری سیٹ لنک بھیج سکیں۔',
      email: 'ای میل ایڈریس',
      password: 'پاس ورڈ',
      fullName: 'پورا نام',
      phone: 'موبائل نمبر (مثال: 03001234567)',
      city: 'شہر',
      confirmPassword: 'پاس ورڈ کی تصدیق کریں',
      rememberMe: 'لاگ ان یاد رکھیں',
      forgotPasswordLink: 'پاس ورڈ بھول گئے؟',
      createAccountLink: 'نیا اکاؤنٹ بنائیں',
      haveAccountLink: 'پہلے سے اکاؤنٹ موجود ہے؟ لاگ ان کریں',
      sendResetLink: 'ری سیٹ ہدایات بھیجیں',
      resetLinkSent: 'ری سیٹ لنک آپ کے ای میل پر بھیج دیا گیا ہے۔',
      loginSuccess: 'خوش آمدید!',
      loginFailed: 'لاگ ان ناپسندیدہ رہا۔ برائے مہربانی ای میل اور پاس ورڈ چیک کریں۔',
      signupSuccess: 'اکاؤنٹ کامیابی سے بن گیا ہے!',
      chooseRoleTitle: 'آپ بلڈ وائز کو کس حیثیت سے استعمال کریں گے؟',
      chooseRoleSubtitle: 'اپنا کردار منتخب کریں۔ ہر کردار کے لیے مخصوص تعمیراتی ٹولز فراہم کیے گئے ہیں۔',
      selectRolePrompt: 'جاری رکھنے کے لیے ایک کردار منتخب کریں',
      primaryCity: 'بنیادی کاروباری شہر',
      confirmRole: 'تصدیق کریں اور ڈیش بورڈ پر جائیں'
    },

    estimator: {
      title: 'اے آئی تعمیراتی لاگت کا تخمینہ کیلکولیٹر',
      subtitle: 'سیمنٹ، سریہ، اینٹ، ریت، بجری اور لیبر کے موجودہ مارکیٹ ریٹس کی بنیاد پر پاکستانی روپے میں مستند تخمینہ لگائیں۔',
      newProject: 'نیا تعمیراتی تخمینہ لگائیں',
      myProjects: 'میرے محفوظ شدہ منصوبے',
      activeProjects: 'جاری منصوبے',
      completedProjects: 'مکمل شدہ منصوبے',
      archivedProjects: 'آرکائیو شدہ',
      step1: 'بنیادی معلومات',
      step2: 'مٹی و بنیادی ڈھانچہ',
      step3: 'کوالٹی و فنشنگ',
      step4: 'کمرے اور فلور پلان',
      step5: 'جدید سہولیات',
      step1Desc: 'پلاٹ کا سائز، شہر اور منزلیں',
      step2Desc: 'مٹی کی قسم اور تعمیراتی پیکج',
      step3Desc: 'میٹریل گریڈ اور فنشنگ کا معیار',
      step4Desc: 'بیڈ رومز، غسل خانے، کچن اور لاؤنج',
      step5Desc: 'سولر پینل، آٹومیشن، لان اور پورچ',
      projectTitleLabel: 'منصوبے کا نام',
      projectTitlePlaceholder: 'مثال: بحریہ ٹاؤن میں 5 مرلہ ڈبل اسٹوری مکان',
      cityLabel: 'شہر / علاقہ',
      plotSizeLabel: 'پلاٹ کا سائز (مرلہ میں)',
      plotSizeHelp: '1 مرلہ = 225 یا 272 مربع فٹ (عام سائز: 3، 5، 7، 10 مرلہ یا 1 کنال)',
      coveredAreaLabel: 'کل کورڈ ایریا (مربع فٹ)',
      coveredAreaHelp: 'تمام منزلوں کے لنٹر اور تعمیر شدہ رقبے کا مجموعہ',
      floorsLabel: 'منزلوں کی تعداد (Storeys)',
      basementLabel: 'کیا بیسمنٹ (تہہ خانہ) درکار ہے؟',
      basementDesc: 'اس میں گہری کھدائی، آر سی سی دیواریں اور واٹر پروفنگ شامل ہوتی ہے',
      soilTypeLabel: 'پلاٹ کی مٹی کی قسم',
      constructionTypeLabel: 'تعمیراتی قسم (Package)',
      greyStructure: 'گرے اسٹرکچر (صرف ڈھانچہ)',
      turnkey: 'ٹرن کی (مکمل تیار شدہ بمعہ فنشنگ)',
      materialQualityLabel: 'میٹریل کوالٹی گریڈ',
      interiorFinishLabel: 'اندرونی فنشنگ کا معیار',
      exteriorFinishLabel: 'بیرونی ایلیویشن اور فرنٹ ڈیزائن',
      roomLayoutHeading: 'کمروں اور منزلوں کی تفصیلی ترتیب',
      roomLayoutSubheading: 'کمروں کی درست تعداد بتائیں تاکہ چنائی، پلستر، دروازے اور بجلی کے پوائنٹس کا درست تخمینہ نکل سکے۔',
      bedrooms: 'بیڈ رومز (سونے کے کمرے)',
      bathrooms: 'واش رومز / غسل خانے',
      attachedBaths: 'تمام بیڈ رومز کے ساتھ اٹیچڈ باتھ',
      powderRoom: 'مہمانوں کے لیے پاؤڈر روم',
      kitchens: 'باورچی خانے (کچن)',
      dirtyKitchen: 'الگ ڈرٹی / ویٹ کچن',
      drawingDining: 'ڈرائنگ اور ڈائننگ روم',
      tvLounge: 'ہر فلور پر ٹی وی لاؤنج',
      carPorch: 'کار پورچ کی گنجائش',
      porch1Small: '1 چھوٹی گاڑی (ہیچ بیک)',
      porch1Large: '1 بڑی گاڑی (سیڈان / ایس یو وی)',
      porch2Cars: '2 گاڑیوں کی پارکنگ',
      porch3Cars: '3 یا اس سے زیادہ گاڑیاں',
      servantQuarter: 'ملازم کا کمرہ اور باتھ روم (سرونٹ کوارٹر)',
      mumtyRooftop: 'ممٹی اور چھت تک سیڑھیاں',
      amenitiesHeading: 'جدید سہولیات اور سولر انرجی',
      amenitiesSubheading: 'سمارٹ ہوم فیچرز، سولر سسٹم اور باغیچے کا اضافہ کریں۔',
      solarPanels: 'آن گرڈ / ہائبرڈ سولر سسٹم',
      solarPanelsDesc: 'سولر پینلز، انورٹر، نیٹ میٹرنگ اور محفوظ وائرنگ شامل ہے',
      smartHome: 'سمارٹ ہوم آٹومیشن',
      smartHomeDesc: 'سمارٹ سوئچز، ویڈیو ڈور بیل، کیمرے اور موبائل ایپ کنٹرول',
      lawnGarden: 'فرنٹ لان / گھاس کا باغیچہ',
      lawnGardenDesc: 'سبزہ، پودے، واک وے ٹائلیں اور بیرونی لائٹنگ',
      swimmingPool: 'پرائیویٹ سوئمنگ پول',
      swimmingPoolDesc: 'آر سی سی باڈی، واٹر پروفنگ، فلٹریشن پمپ اور موزیک ٹائلنگ',
      parkingSpace: 'مخصوص کار پارکنگ ایریا',
      calculateEstimate: 'اے آئی لاگت کا تخمینہ تیار کریں',
      calculating: 'تازہ مارکیٹ ریٹس کا تجزیہ اور تخمینہ جاری ہے...',
      estimateReady: 'تعمیراتی لاگت کا تخمینہ تیار ہے!',
      totalEstimatedCost: 'کل متوقع تعمیراتی لاگت',
      minMaxRange: 'متوقع کم از کم تا زیادہ سے زیادہ رینج',
      costBreakdown: 'مرحلہ وار تفصیلی اخراجات',
      landPrep: 'زمین کی کھدائی اور تیاری',
      structureFoundation: 'بنیادیں اور گرے اسٹرکچر',
      plumbingSanitary: 'پلمبنگ، پائپ اور سینیٹری',
      electricalWiring: 'بجلی کی وائرنگ اور ڈی بی بکس',
      finishingPaint: 'ٹائلز، پینٹ، دروازے اور سینیٹری فٹنگز',
      laborCost: 'مزدوری اور کاریگر کے اخراجات',
      materialsCost: 'بنیادی میٹریل (سیمنٹ، سریہ، اینٹ، بجری)',
      matchedContractors: 'اس پروجیکٹ کے لیے منتخب شدہ ٹھیکیدار',
      relevantMaterials: 'تعمیراتی میٹریل کی رعایت اور خصوصی آفرز',
      requestQuotes: 'ٹھیکیداروں سے کوٹیشنز طلب کریں',
      viewResults: 'مکمل تفصیلی تجزیہ دیکھیں',
      noProjectsYet: 'ابھی تک آپ نے کوئی پروجیکٹ نہیں بنایا۔ اپنے پہلے گھر کا تخمینہ لگائیں!',
      deleteConfirm: 'کیا آپ واقعی اس پروجیکٹ کو حذف کرنا چاہتے ہیں؟'
    },

    contractor: {
      dashboardTitle: 'ٹھیکیدار ورک اسپیس',
      availableLeads: 'دستیاب تعمیراتی پروجیکٹس',
      myQuotes: 'میری بھیجی گئی کوٹیشنز',
      activeWork: 'جاری سائٹس اور کام',
      submitQuote: 'کوٹیشن اور ریٹ جمع کروائیں',
      quoteAmount: 'کل رقم (پاکستانی روپے میں)',
      durationDays: 'کام مکمل کرنے کی مدت (دن یا مہینے)',
      warranty: 'تعمیراتی گارنٹی کی مدت',
      timeline: 'کام کے مراحل کی تفصیل',
      notes: 'شرائط و ضوابط اور طریقہ کار',
      experienceYears: 'تعمیراتی تجربہ (سال)',
      completedProjectsCount: 'مکمل شدہ منصوبے',
      specialization: 'بنیادی مہارت',
      acceptQuote: 'کوٹیشن منظور کریں',
      rejectQuote: 'کوٹیشن مسترد کریں',
      pendingQuotes: 'کلائنٹ کے جواب کی منتظر کوٹیشنز',
      acceptedQuotes: 'منظور شدہ اور معاہدہ شدہ'
    },

    supplier: {
      dashboardTitle: 'بلڈنگ میٹریل مارکیٹ پلیس',
      myProducts: 'تعمیراتی سامان کی لسٹ',
      addProduct: 'نیا میٹریل یا پروڈکٹ شامل کریں',
      productName: 'میٹریل کا نام (مثال: بیسٹ وے سیمنٹ / مغل اسٹیل)',
      category: 'کیٹیگری',
      brand: 'برانڈ / فیکٹری',
      price: 'فی یونٹ قیمت (PKR)',
      stock: 'دستیاب مقدار / اسٹاک',
      unit: 'پیمائش کی اکائی (بوری، ٹن، ہزار اینٹیں، مربع فٹ)',
      deliveryAvailable: 'سائٹ پر ڈلیوری کی سہولت دستیاب ہے',
      minimumOrder: 'کم از کم آرڈر کی مقدار',
      requestMaterialQuote: 'ہول سیل ریٹ معلوم کریں'
    },

    chat: {
      title: 'پروجیکٹ رابطہ و بات چیت',
      typeMessage: 'اپنا پیغام یہاں لکھیں...',
      send: 'بھیجیں',
      online: 'آن لائن',
      connecting: 'رابطہ ہو رہا ہے...',
      noMessages: 'ابھی تک کوئی پیغام نہیں ہے۔ بات چیت شروع کرنے کے لیے پہلا پیغام بھیجیں!',
      startConversation: 'براہ راست بات چیت شروع کریں'
    }
  }
};
