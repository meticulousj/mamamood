import mysql from 'mysql2/promise';

const meditations = [
  // Stress Relief
  {
    title: "5-Minute Stress Release",
    category: "stress",
    duration: 5,
    description: "Quick breathing techniques to calm your nervous system and release tension from your shoulders and neck.",
    content: "Find a comfortable position. Close your eyes. Breathe in slowly for 4 counts, hold for 4, exhale for 4. Feel your shoulders drop. Continue this rhythm for 5 minutes, letting go of any tension with each exhale."
  },
  {
    title: "Letting Go of Perfectionism",
    category: "stress",
    duration: 7,
    description: "Release the pressure of perfectionism and embrace self-compassion for the working mom.",
    content: "You are doing your best. That is enough. Let go of the need to control everything. Your worth is not measured by productivity. Breathe deeply and remind yourself: I am enough, exactly as I am right now."
  },
  {
    title: "Midday Tension Release",
    category: "stress",
    duration: 8,
    description: "A grounding meditation to release stress accumulated during the morning.",
    content: "Sit with your feet on the ground. Feel the earth supporting you. Scan your body from head to toe, releasing tension from each area. Imagine stress flowing down through your feet into the earth."
  },
  {
    title: "Work-Life Boundary Setting",
    category: "stress",
    duration: 10,
    description: "Create healthy boundaries between work and personal time with this guided meditation.",
    content: "Visualize a beautiful boundary between your work space and your home space. See yourself leaving work behind. You are now in your personal time. You deserve this rest. Nothing is urgent right now."
  },

  // Sleep
  {
    title: "Gentle Sleep Preparation",
    category: "sleep",
    duration: 10,
    description: "Prepare your mind and body for restful sleep with calming visualization.",
    content: "Lie comfortably. Imagine a warm, soft light filling your body. Your eyelids feel heavy. Your muscles are relaxed. You are safe. You are home. Let sleep come naturally. There is nothing to do tonight but rest."
  },
  {
    title: "Body Scan for Sleep",
    category: "sleep",
    duration: 12,
    description: "Progressive relaxation to help you drift into peaceful sleep.",
    content: "Starting at your toes, notice each part of your body. Feel it relax. Move slowly upward: feet, calves, thighs, hips, belly, chest, arms, shoulders, neck, face. Your entire body is now heavy and relaxed. Sleep is coming."
  },
  {
    title: "Releasing the Day",
    category: "sleep",
    duration: 8,
    description: "Let go of the day's worries and prepare for restorative sleep.",
    content: "The day is complete. You did what you could. Now it's time to rest. Imagine placing each worry in a box and closing the lid. Tomorrow is a new day. Tonight, you rest."
  },
  {
    title: "Peaceful Night Meditation",
    category: "sleep",
    duration: 15,
    description: "A longer meditation for deep, restorative sleep.",
    content: "Breathe slowly and deeply. With each breath, you sink deeper into relaxation. Imagine yourself in a peaceful place—a beach, forest, or garden. Feel the calm. Let sleep embrace you gently."
  },

  // Focus
  {
    title: "Morning Focus & Clarity",
    category: "focus",
    duration: 5,
    description: "Start your day with mental clarity and focused intention.",
    content: "Set your intention for today. What is most important? Focus on that. Release everything else. Your mind is clear. Your purpose is clear. You are ready to tackle the day with focus and calm."
  },
  {
    title: "Deep Work Concentration",
    category: "focus",
    duration: 10,
    description: "Enhance your ability to concentrate and enter a flow state.",
    content: "Your mind is becoming clear and focused. Distractions fade away. You are fully present with your work. Your thoughts are organized. Your focus is sharp. You can accomplish what you set out to do."
  },
  {
    title: "Overcoming Overwhelm",
    category: "focus",
    duration: 7,
    description: "When everything feels like too much, find your center and break it down.",
    content: "You are not behind. You are not failing. One task at a time. Breathe. Focus on what is in front of you right now. Everything else can wait. You are capable. You are strong."
  },
  {
    title: "Creative Flow State",
    category: "focus",
    duration: 8,
    description: "Unlock your creativity and enter a state of inspired flow.",
    content: "Your creative energy is flowing. Ideas come easily. You trust your instincts. Your mind is open and expansive. You are in the zone. Everything you create is valuable and authentic."
  },

  // Gratitude
  {
    title: "Gratitude for Small Moments",
    category: "gratitude",
    duration: 6,
    description: "Appreciate the small, beautiful moments that make up your day.",
    content: "Think of three small moments today that brought you joy. A warm cup of coffee. A hug from your child. A moment of peace. These moments are gifts. Gratitude opens your heart and brings peace."
  },
  {
    title: "Loving-Kindness for Yourself",
    category: "gratitude",
    duration: 10,
    description: "Cultivate compassion and gratitude toward yourself as a working mom.",
    content: "May I be kind to myself. May I forgive my imperfections. May I celebrate my strength. May I be grateful for my body and mind. I am worthy of love and compassion, especially from myself."
  },
  {
    title: "Gratitude Reflection",
    category: "gratitude",
    duration: 8,
    description: "Reflect on what you're grateful for and shift your perspective.",
    content: "Close your eyes. Think of five things you're grateful for today. Feel the warmth of gratitude in your heart. Gratitude shifts your perspective and brings peace. You have so much to be grateful for."
  },
  {
    title: "Abundance Meditation",
    category: "gratitude",
    duration: 9,
    description: "Cultivate a mindset of abundance and appreciation.",
    content: "You have enough. You are enough. Abundance flows to you. Appreciate what you have. Notice the gifts in your life. Your gratitude attracts more goodness. You are blessed."
  },

  // Energy
  {
    title: "Morning Energy Boost",
    category: "energy",
    duration: 5,
    description: "Wake up your body and mind with energizing breath work.",
    content: "Stand or sit tall. Take deep, energizing breaths. Feel energy flowing through your body. Shake out your limbs. You are awake, alive, and ready. Your energy is vibrant and strong."
  },
  {
    title: "Afternoon Energy Revival",
    category: "energy",
    duration: 6,
    description: "Combat the afternoon slump with this revitalizing meditation.",
    content: "Feel your energy returning. Your body is strong. Your mind is alert. Imagine golden light filling your body with vitality. You have the energy you need to finish your day strong."
  },
  {
    title: "Energizing Breath Work",
    category: "energy",
    duration: 7,
    description: "Powerful breathing techniques to boost your energy naturally.",
    content: "Breathe in for 4 counts, hold for 4, exhale for 4. Repeat. Feel the oxygen energizing your cells. Your body is vibrant. Your mind is sharp. You are full of vital energy."
  },
  {
    title: "Confidence & Empowerment",
    category: "energy",
    duration: 8,
    description: "Build your confidence and feel empowered to face challenges.",
    content: "You are strong. You are capable. You have overcome challenges before. You can do this. Feel your power. Stand tall. Your confidence is growing. You are unstoppable."
  },
  {
    title: "Motivation & Purpose",
    category: "energy",
    duration: 9,
    description: "Reconnect with your purpose and reignite your motivation.",
    content: "Why do you do what you do? Remember your purpose. Your work matters. Your presence matters. You are making a difference. Feel your motivation returning. You are inspired."
  },

  // Additional Sessions
  {
    title: "Self-Compassion for Moms",
    category: "stress",
    duration: 10,
    description: "A meditation specifically for working moms to practice self-compassion.",
    content: "You are doing an amazing job. Be gentle with yourself. You don't have to be perfect. You are enough. Your children are lucky to have you. Your work is valued. You deserve kindness, especially from yourself."
  },
  {
    title: "Mindful Eating Break",
    category: "focus",
    duration: 5,
    description: "Take a mindful break during lunch to reset and refocus.",
    content: "Slow down. Notice the flavors and textures of your food. Chew slowly. Be present. This break is for you. Nourish your body and mind. You deserve this moment of peace."
  },
  {
    title: "Evening Wind Down",
    category: "sleep",
    duration: 6,
    description: "Transition from your busy day to a peaceful evening.",
    content: "The day is ending. You can rest now. Leave work behind. Be present with your family or yourself. Breathe slowly. Feel the day releasing from your body. Peace is coming."
  },
  {
    title: "Anxiety Release",
    category: "stress",
    duration: 9,
    description: "Calm anxious thoughts and ground yourself in the present moment.",
    content: "You are safe right now. This moment is okay. Anxiety is just a thought. You can observe it without believing it. Ground yourself: feel your feet, hear sounds, notice your breath. You are here. You are safe."
  },
  {
    title: "Connection & Love",
    category: "gratitude",
    duration: 7,
    description: "Deepen your sense of connection to loved ones and yourself.",
    content: "Think of someone you love. Feel the warmth of that connection. Now extend that love to yourself. You are loved. You are connected. You are never alone. Love is always available to you."
  }
];

async function seedMeditations() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
    user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
    password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
    database: process.env.DATABASE_URL?.split('/')[3] || 'mamamood',
  });

  try {
    console.log('Seeding meditation library...');
    
    for (const med of meditations) {
      await connection.execute(
        'INSERT INTO meditation_sessions (title, category, duration, description, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [med.title, med.category, med.duration, med.description, med.content]
      );
    }
    
    console.log(`✅ Successfully seeded ${meditations.length} meditations!`);
  } catch (error) {
    console.error('Error seeding meditations:', error);
  } finally {
    await connection.end();
  }
}

seedMeditations();
