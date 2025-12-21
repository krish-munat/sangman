export interface DadiNuskhe {
  id: string
  title: string
  category: 'skin' | 'eyes' | 'respiratory' | 'bones' | 'digestion' | 'ayurvedic' | 'hair' | 'stress' | 'blood' | 'oral'
  philosophy: string
  method: string
  whyItWorks: string
  ingredients?: string[]
  timing?: string
  precautions?: string
}

export const dadiNuskhe: DadiNuskhe[] = [
  // Skin Care
  {
    id: 'skin-1',
    title: 'Besan & Haldi Ubtan (The Gold Standard)',
    category: 'skin',
    philosophy: "Dadi's skincare isn't about layering chemicals; it's about 'feeding' the skin with the same nutrient-rich ingredients you eat.",
    method: 'Mix 2 tbsp Gram Flour (Besan) + Pinch of Turmeric (Haldi) + 1 tbsp Raw Milk (or Yogurt for oily skin). Apply this paste to your face and neck. Let it dry for 15-20 minutes. Dampen your hands and scrub it off gently in circular motions.',
    whyItWorks: 'Besan is a natural alkalizing cleanser that removes deep-seated dirt. Turmeric is antiseptic and reduces inflammation (acne). Milk contains lactic acid which gently exfoliates dead skin cells.',
    ingredients: ['Gram Flour (Besan)', 'Turmeric (Haldi)', 'Raw Milk or Yogurt'],
    timing: '2-3 times per week',
  },
  {
    id: 'skin-2',
    title: 'Raw Milk Cleanser (Kaccha Doodh)',
    category: 'skin',
    philosophy: 'Natural ingredients work in harmony with your skin\'s natural processes.',
    method: 'Dip a cotton ball in cold raw milk and wipe your face with it every night before bed. Wash off in the morning.',
    whyItWorks: 'Raw milk is rich in fats and lactic acid. It acts as a natural toner and moisturizer, reversing sun tan and keeping skin soft.',
    ingredients: ['Cold Raw Milk'],
    timing: 'Every night before bed',
  },
  {
    id: 'skin-3',
    title: 'Malai (Cream) for Dry Lips/Skin',
    category: 'skin',
    philosophy: 'Natural fats mimic the skin\'s own oils, repairing the moisture barrier faster than synthetic lotions.',
    method: 'Take fresh malai from boiled milk, add a few drops of rose water, and massage it onto your face or lips.',
    whyItWorks: 'It\'s pure natural fat that mimics the skin\'s own oils, repairing the moisture barrier faster than synthetic lotions.',
    ingredients: ['Fresh Malai (Cream)', 'Rose Water'],
    timing: 'As needed for dry skin',
  },

  // Dark Circles
  {
    id: 'eyes-1',
    title: 'Raw Potato Slices (Aloo)',
    category: 'eyes',
    philosophy: 'Dark circles in Ayurveda are often due to "Pitta" (heat) or lack of sleep. The goal is to cool the area and improve circulation.',
    method: 'Grate a raw potato and squeeze out the juice. Soak cotton pads in this juice and place them on your eyes for 15-20 minutes.',
    whyItWorks: 'Potato contains natural bleaching agents and enzymes (catecholase) that reduce puffiness and lighten dark pigment over time.',
    ingredients: ['Raw Potato'],
    timing: 'Daily for 15-20 minutes',
  },
  {
    id: 'eyes-2',
    title: 'Sweet Almond Oil (Badam Rogan)',
    category: 'eyes',
    philosophy: 'Proper massage improves circulation and reduces fluid retention.',
    method: 'Every night, take 2 drops of pure almond oil on your ring finger. Massage the under-eye area strictly in one direction (inner to outer corner) to drain fluids.',
    whyItWorks: 'It is rich in Vitamin E and K, which helps contract dilated blood vessels that cause the dark appearance.',
    ingredients: ['Pure Almond Oil (Badam Rogan)'],
    timing: 'Every night before bed',
  },
  {
    id: 'eyes-3',
    title: 'Kansa Wand / Ghee Massage',
    category: 'eyes',
    philosophy: 'Cooling the eyes reduces heat that causes burning and tired eyes.',
    method: 'Apply a little Ghee around the eyes and massage gently.',
    whyItWorks: 'Ghee cools the eyes (Netra Tarpana) and reduces the "heat" that causes burning and tired eyes.',
    ingredients: ['Pure Desi Ghee'],
    timing: 'As needed',
  },

  // Respiratory Health
  {
    id: 'resp-1',
    title: 'Ginger & Honey Juice (Adrak-Shahad)',
    category: 'respiratory',
    philosophy: 'Cold is a "Kapha" imbalance. You need "heating" (ushna) ingredients to melt the mucus.',
    method: 'Crush fresh ginger to extract 1 tsp juice. Mix with 1 tsp warm honey and a pinch of black pepper. Lick this paste slowly 2-3 times a day. Do not drink water immediately after.',
    whyItWorks: 'Ginger is anti-inflammatory and clears the throat. Honey soothes the irritated lining (demulcent), and pepper fights the infection.',
    ingredients: ['Fresh Ginger', 'Honey', 'Black Pepper'],
    timing: '2-3 times a day',
    precautions: 'Do not drink water immediately after',
  },
  {
    id: 'resp-2',
    title: 'Turmeric Milk (Haldi Doodh / Golden Milk)',
    category: 'respiratory',
    philosophy: 'Natural antibiotics work better when properly absorbed.',
    method: 'Mix 1 cup hot milk + 1/2 tsp Turmeric + Pinch of Black Pepper + 1/2 tsp Ghee. Always add Black Pepper. Drink warm.',
    whyItWorks: 'Curcumin (the active agent in turmeric) cannot be absorbed by the body without piperine (found in pepper). It acts as a natural antibiotic and boosts immunity overnight.',
    ingredients: ['Hot Milk', 'Turmeric', 'Black Pepper', 'Ghee'],
    timing: 'Once daily, preferably at night',
    precautions: 'Always add black pepper for absorption',
  },
  {
    id: 'resp-3',
    title: 'Steam with Ajwain (Carom Seeds)',
    category: 'respiratory',
    philosophy: 'Steam therapy opens blocked passages naturally.',
    method: 'Boil water with a spoonful of Ajwain. Inhale the steam under a towel for 10-15 minutes.',
    whyItWorks: 'Ajwain has thymol, a powerful antimicrobial agent that opens up blocked nasal passages instantly.',
    ingredients: ['Water', 'Ajwain (Carom Seeds)'],
    timing: 'As needed for congestion',
  },

  // Bone Health
  {
    id: 'bones-1',
    title: 'Sesame Seeds (Til) & Jaggery (Gud)',
    category: 'bones',
    philosophy: 'Bones deteriorate due to "Vata" (air/dryness) increase in the body as we age. You need lubrication and calcium.',
    method: 'Eat a small ladoo made of roasted white sesame seeds and jaggery daily in winter.',
    whyItWorks: 'Til is the richest vegetarian source of calcium (even more than milk). Jaggery aids digestion and provides iron. This combo strengthens bones and prevents brittleness.',
    ingredients: ['Roasted White Sesame Seeds', 'Jaggery'],
    timing: 'Daily in winter',
  },
  {
    id: 'bones-2',
    title: 'Gond (Edible Gum)',
    category: 'bones',
    philosophy: 'Joint lubrication prevents pain and stiffness.',
    method: 'Gond ke Ladoo or soaking Gond Katira in water (in summer) and drinking it with milk.',
    whyItWorks: 'Gond lubricates the joints and regenerates fluid between cartilages, reducing knee and back pain.',
    ingredients: ['Gond (Edible Gum)', 'Milk'],
    timing: 'Daily, especially in winter',
  },
  {
    id: 'bones-3',
    title: 'Sunlight (Dhoop)',
    category: 'bones',
    philosophy: 'Vitamin D is essential for calcium absorption.',
    method: 'Sit in the morning sun (8 AM - 10 AM) for 20 minutes with your back exposed.',
    whyItWorks: 'Vitamin D is essential for calcium absorption. Without it, all the milk you drink is useless for your bones.',
    timing: 'Daily, 8 AM - 10 AM',
    precautions: 'Avoid peak sun hours',
  },

  // Digestion
  {
    id: 'digest-1',
    title: 'Jeera Water (Cumin Water)',
    category: 'digestion',
    philosophy: 'If your stomach is clean, your skin and health will automatically be fine.',
    method: 'Boil 1 tsp Jeera in a glass of water until it reduces to half. Drink it warm.',
    whyItWorks: 'Excellent for bloating, gas, and metabolism boosting.',
    ingredients: ['Cumin Seeds (Jeera)', 'Water'],
    timing: '30 minutes after meals',
  },
  {
    id: 'digest-2',
    title: 'Vajrasana (Thunderbolt Pose)',
    category: 'digestion',
    philosophy: 'Yoga aids digestion by increasing blood flow to the stomach.',
    method: 'Sit on your knees (heels touching buttocks) for 10 minutes immediately after dinner.',
    whyItWorks: 'It is the only yoga asana allowed after eating; it increases blood flow to the stomach to aid digestion.',
    timing: '10 minutes immediately after dinner',
  },

  // Ayurvedic
  {
    id: 'ayur-1',
    title: 'Tamra Jal (Copper Water)',
    category: 'ayurvedic',
    philosophy: 'In Ayurveda, water stored in copper balances all three doshas (Vata, Pitta, Kapha) and acts as a natural sterilizer.',
    method: 'Scrub a pure copper vessel with lemon and salt. Fill it with water at night and place it on a wooden surface. Let it sit for at least 8 hours. Drink 1-2 glasses first thing in the morning on an empty stomach. Do not brush your teeth before this.',
    whyItWorks: 'Copper ions dissolve in the water (Oligodynamic effect), which kills harmful bacteria in the gut, stimulates peristalsis (bowel movement), and aids in iron absorption for anemia.',
    ingredients: ['Pure Copper Vessel', 'Water'],
    timing: 'First thing in the morning, empty stomach',
    precautions: 'Do not brush teeth before drinking',
  },
  {
    id: 'ayur-2',
    title: 'Gandusha (Oil Pulling)',
    category: 'oral',
    philosophy: 'Digestion begins in the mouth. If your mouth has toxins (Ama), they travel to your gut.',
    method: 'Take 1 tablespoon of Sesame Oil (for strong teeth/gums) or Coconut Oil (for whitening/cooling). Swish it in your mouth vigorously for 10-15 minutes. Spit it out in the trash. Never swallow it. Rinse with warm salt water.',
    whyItWorks: 'The fat in the oil traps bacteria and dissolves plaque that water/toothpaste cannot reach. It cures bleeding gums, fixes bad breath, and improves sinus health and face glow by increasing blood flow.',
    ingredients: ['Sesame Oil or Coconut Oil', 'Warm Salt Water'],
    timing: '10-15 minutes daily, preferably in the morning',
    precautions: 'Never swallow the oil',
  },
  {
    id: 'ayur-3',
    title: 'CCF Tea (Cumin, Coriander, Fennel)',
    category: 'digestion',
    philosophy: 'Most diseases start with Agni (digestive fire) being too weak or too strong. This tea resets it.',
    method: 'Mix equal parts of whole Cumin seeds (Jeera), Coriander seeds (Dhaniya), and Fennel seeds (Saunf). Boil 1 teaspoon of this mix in 2 cups of water until it reduces to 1 cup. Strain and sip it warm.',
    whyItWorks: 'Jeera burns toxins. Dhaniya cools the body (good for acidity/Pitta). Saunf relaxes the stomach muscles (stops cramping/gas). Result: No bloating, better absorption of nutrients, and clear skin.',
    ingredients: ['Cumin Seeds (Jeera)', 'Coriander Seeds (Dhaniya)', 'Fennel Seeds (Saunf)'],
    timing: '30 minutes after meals',
  },
  {
    id: 'ayur-4',
    title: 'Triphala (Three Fruits)',
    category: 'ayurvedic',
    philosophy: '"No mother? Don\'t worry, if you have Triphala." It is said to care for internal organs like a mother cares for a child.',
    method: 'For Constipation/Detox: Mix 1 tsp in a cup of warm water and drink it just before sleeping. For Eye Sight: Soak 1 tsp in a glass of water overnight. Strain it through a fine cloth in the morning and wash your eyes with this water.',
    whyItWorks: 'It is not habit-forming like laxatives. Amla is Vitamin C (immunity), Bibhitaki clears mucus (lungs), and Haritaki scrapes toxins from the intestines.',
    ingredients: ['Triphala Powder (Amla, Haritaki, Bibhitaki)'],
    timing: 'Before sleeping (for detox) or morning (for eyes)',
  },
  {
    id: 'ayur-5',
    title: 'Nasya (Nasal Drops)',
    category: 'respiratory',
    philosophy: 'The nose is the doorway to the brain (Prana). Dryness here leads to headaches, insomnia, and allergies.',
    method: 'Lie down on your back with your head tilted back slightly. Put 2 drops of warm Cow Ghee (must be pure Desi Ghee) in each nostril. Sniff deeply. Do this in the morning or before bed.',
    whyItWorks: 'It lubricates the nasal passage, preventing allergens from sticking. It calms the Vata dosha in the head, which reduces anxiety, improves memory, and prevents premature graying of hair.',
    ingredients: ['Pure Desi Ghee'],
    timing: 'Morning or before bed',
  },

  // Hair
  {
    id: 'hair-1',
    title: 'Methi (Fenugreek) Pack',
    category: 'hair',
    philosophy: 'Hair fall is often due to excess body heat (Pitta). Methi cools the scalp.',
    method: 'Soak 2 tablespoons of Methi seeds in water overnight. In the morning, grind them into a smooth paste. Mix with 1 tablespoon of Curd (Yogurt) and 1 teaspoon of Castor Oil. Apply to scalp (roots) and leave for 30 minutes. Wash with mild shampoo.',
    whyItWorks: 'Methi contains lecithin, which strengthens the hair follicle. Curd fights dandruff (fungus), and Castor oil thickens the hair shaft.',
    ingredients: ['Fenugreek Seeds (Methi)', 'Curd (Yogurt)', 'Castor Oil'],
    timing: 'Once or twice a week',
  },

  // Stress & Sleep
  {
    id: 'stress-1',
    title: 'Ashwagandha Moon Milk',
    category: 'stress',
    philosophy: 'You cannot heal if you do not sleep. Ashwagandha is an "Adaptogen"—it helps your body adapt to stress.',
    method: 'Take 1 cup of milk (dairy or almond). Add 1/2 tsp Ashwagandha powder + pinch of Nutmeg (Jaiphal) + pinch of Cardamom. Boil it for 5 minutes. Sweeten with raw sugar or maple syrup (avoid honey in hot liquids).',
    whyItWorks: 'Ashwagandha lowers cortisol (stress hormone). Nutmeg is a natural sedative in small doses. This cures "tired but wired" feelings.',
    ingredients: ['Milk', 'Ashwagandha Powder', 'Nutmeg (Jaiphal)', 'Cardamom', 'Raw Sugar or Maple Syrup'],
    timing: '30 minutes before bed',
    precautions: 'Avoid honey in hot liquids',
  },
  {
    id: 'stress-2',
    title: 'Abhyanga (Self-Massage)',
    category: 'ayurvedic',
    philosophy: 'Your body dries out as you age (Vata increases). Oil keeps the body "juicy" and flexible.',
    method: 'Warm up ½ cup of Sesame Oil (Til Taila). Before your shower, massage your whole body vigorously. Use long strokes on long bones (arms/legs) and circular motions on joints (knees/elbows). Wait 15 minutes, then take a warm bath.',
    whyItWorks: 'The oil penetrates through the 7 layers of skin to the tissues, lubricating joints, calming the nervous system, and preventing "creaky" bones.',
    ingredients: ['Sesame Oil (Til Taila)'],
    timing: 'Daily, before shower',
  },

  // Blood Purifier
  {
    id: 'blood-1',
    title: 'Neem & Haldi Balls',
    category: 'blood',
    philosophy: 'Skin issues (acne, eczema) are often just "bad blood" or internal inflammation showing up outside.',
    method: 'Take fresh Neem leaves (or pure powder) and Turmeric powder. Mix them with a tiny drop of water to make small marble-sized balls. Swallow one ball every morning on an empty stomach with water.',
    whyItWorks: 'Neem is the most potent anti-bacterial and anti-fungal herb. Turmeric is anti-inflammatory. Together, they clean the blood, ensuring pimples stop appearing.',
    ingredients: ['Fresh Neem Leaves or Powder', 'Turmeric Powder'],
    timing: 'Every morning on empty stomach',
  },
  {
    id: 'oral-1',
    title: 'Jihwa Prakshalana (Tongue Scraping)',
    category: 'oral',
    philosophy: 'The white coating on your tongue in the morning is Ama (undigested toxins). Swallowing it re-absorbs the toxin.',
    method: 'Use a Copper or Stainless Steel scraper (avoid plastic). Immediately after brushing, scrape the tongue from back to front 5-7 times. Rinse the mouth.',
    whyItWorks: 'Different parts of the tongue are connected to different organs (Heart, Lungs, Stomach). Scraping stimulates these organs and removes the bacteria that cause bad breath and heart plaque buildup.',
    ingredients: ['Copper or Stainless Steel Tongue Scraper'],
    timing: 'Daily, after brushing',
  },
]

