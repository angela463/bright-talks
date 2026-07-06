/* course-experience-data.js */
(function () {
  'use strict';

  /**
   * @typedef {'ready'|'generating'|'failed'} AudioStatus
   *
   * @typedef {Object} LessonAudio
   * @property {string} audioUrl
   * @property {string} transcript
   * @property {string} voice
   * @property {string} duration
   * @property {AudioStatus} status
   *
   * @typedef {Object} LessonSection
   * @property {string} title
   * @property {'objectives'|'prose'|'discussion'} [type]
   * @property {string[]} [bullets]
   * @property {string[]} [paragraphs]
   * @property {string} [reflectionLead]
   * @property {string} [reflectionPlaceholder]
   * @property {{ label: string, href: string, description?: string }[]} [downloads]
   * @property {string[]} [scripts]
   *
   * @typedef {Object} LessonHeroVisual
   * @property {'video'|'image'|'embed'} type
   * @property {string} src
   * @property {string} [alt]
   * @property {{ introAudio?: string, introDurationMs?: number, logoSrc?: string, series?: string, kicker?: string, title?: string, outro?: { series?: string, kicker?: string, title?: string, subtitle?: string, outroAudio?: string } }} [splash]
   *
   * @typedef {Object} Lesson
   * @property {string} id
   * @property {string} title
   * @property {string} summary
   * @property {string} duration
   * @property {LessonAudio} audio
   * @property {'split-right'|string} [layout]
   * @property {LessonHeroVisual} [heroVisual]
   * @property {LessonSection[]} [sections]
   *
   * @typedef {Object} Module
   * @property {string} id
   * @property {string} title
   * @property {string} objective
   * @property {Lesson[]} lessons
   *
   * @typedef {Object} Course
   * @property {string} id
   * @property {string} title
   * @property {string} topic
   * @property {string} audience
   * @property {string} level
   * @property {string} description
   * @property {string} outcome
   * @property {string} duration
   * @property {number} lessonCount
   * @property {number} progress
   * @property {boolean} completed
   * @property {string} heroImage
   * @property {{ module: number, lesson: number }} [playerEntry]
   * @property {LessonAudio} introAudio
   * @property {Module[]} modules
   */

  var sampleAudio = 'audio/Bright Talks Voice Over.m4a';
  var welcomeAudio = 'audio files/Bright Talks v1.mp3';
  var talk1IntroAudio = 'audio/Warm Windows, Open Minds.mp3';
  var talk1VideoSrc =
    'https://vz-02a1a166-7fe.b-cdn.net/fb174fe3-ea85-4043-bb6f-2857f074378a/play_720p.mp4';
  var talk1ListenAudio = talk1VideoSrc;
  var brightTalksLogo = 'png/Bright-Talks-logo-createoutlines.png';
  var welcomeVideoSrc = 'videos/hero-home-loop.mp4'; // Same clip as homepage hero (index.html)
  var talk1EmbedSrc =
    'https://player.mediadelivery.net/embed/695172/fb174fe3-ea85-4043-bb6f-2857f074378a' +
    '?autoplay=false&loop=false&muted=true&preload=true&responsive=true&playerjs=true';

  var talk1ReadScript = [
    {
      title: 'Introduction',
      paragraphs: [
        'Hi, and welcome to Bright Talks.',
        'As parents, many of us want our children to grow up feeling confident, safe, and comfortable in their own bodies. But for many families, conversations about bodies can feel awkward because no one modeled those conversations for us growing up.',
        'The good news is that these discussions do not have to be complicated. One of the simplest ways to build confidence and body safety from an early age is by teaching children the correct names for their body parts.',
        'Today we will talk about why that matters, how it supports healthy development, and how it creates a foundation for future conversations as your child grows.'
      ]
    },
    {
      title: 'Why Naming Body Parts Correctly Matters',
      paragraphs: [
        'When children are learning about the world, we naturally teach them the names of things. We teach them words like eyes, ears, elbows, knees, fingers, and toes. Private body parts are no different.',
        'Using correct anatomical names helps children understand that every part of their body has value and purpose. It removes confusion and helps normalize healthy conversations about bodies.',
        'Sometimes parents use nicknames or phrases like “private parts” or “no-no zones” because it feels more comfortable. While these terms are often well-intentioned, they can sometimes create confusion or unintentionally communicate that certain parts of the body are embarrassing or shameful.',
        'Instead, using accurate language helps children understand their bodies in a healthy, age-appropriate way.'
      ]
    },
    {
      title: 'Building Confidence and Communication',
      paragraphs: [
        'Teaching correct body terminology is not about introducing adult topics too early. It is about helping children develop confidence and communication skills.',
        'When children have the vocabulary to describe their bodies, they become more comfortable asking questions, expressing concerns, and talking openly with trusted adults. This creates an environment where conversations feel natural rather than awkward.',
        'And when children know they can ask questions without fear or embarrassment, they are much more likely to come to their parents when they need guidance.'
      ]
    },
    {
      title: 'Supporting Body Safety',
      paragraphs: [
        'There is also an important safety benefit. If a child is injured, experiencing discomfort, or needs medical attention, using correct terminology helps them communicate clearly with parents, caregivers, and healthcare providers.',
        'Clear language reduces misunderstanding and helps adults respond appropriately when children need help. Body safety begins with body awareness, and body awareness begins with understanding our bodies.'
      ]
    },
    {
      title: 'Looking Ahead: Preparing for Future Conversations',
      paragraphs: [
        'Many parents worry that teaching correct body terminology will lead to questions they are not ready to answer. In reality, these early conversations often make future discussions much easier.',
        'Children who grow up hearing age-appropriate information from trusted parents are often more comfortable talking about sensitive topics later in life. As children mature, parents can gradually introduce conversations about relationships, intimacy, sexuality, reproduction, and God’s design for marriage and family.',
        'These discussions do not need to happen all at once. The goal is many small conversations over time. Each conversation builds upon the last.'
      ]
    },
    {
      title: 'A Christian Perspective',
      paragraphs: [
        'As Christian parents, we believe our bodies are created by God and are inherently good. Teaching children about their bodies is not something to fear. It is an opportunity to help them understand their value, dignity, and purpose.',
        'When conversations about bodies are grounded in truth, love, and respect, children learn that their bodies are gifts to be cared for and stewarded well. This foundation also prepares them to understand God’s design for relationships, marriage, intimacy, and sexuality as they grow older.'
      ]
    },
    {
      title: 'Wrapping Up',
      paragraphs: [
        'As we close this lesson, remember that you do not need to have all the answers, and you do not need to have one perfect conversation. What matters most is that you are willing to start.',
        'Every small conversation you have with your child helps build trust, confidence, and connection. By teaching them about their bodies in a healthy, age-appropriate way, you are creating a foundation for future conversations that will feel more natural and less intimidating as they grow.',
        'If this feels new or uncomfortable, that is okay. Many parents are learning alongside their children. The fact that you are here, investing time in these conversations, already makes a difference.',
        'Take a moment to reflect on one small step you can take this week. Maybe it is introducing correct body terminology, answering a question with confidence, or simply creating space for curiosity and conversation. You do not have to do everything today. Just take the next step.',
        'In our next lesson, we will build on this foundation by exploring boundaries and body safety — helping children understand personal space, consent, trusted adults, and how to communicate when something does not feel right.'
      ]
    }
  ];

  var courseHeroImages = {
    earlyYears: 'images/pexels-julia-m-cameron-4144230.jpg',
    middleChildhood: 'images/pexels-julia-m-cameron-4144531.jpg',
    puberty: 'images/pexels-tima-miroshnichenko-5813804.jpg',
    teen: 'images/teen-laptop-couch.png'
  };

  var earlyYearsLessonImages = {
    bodies: 'images/pexels-cottonbro-6668315.jpg',
    boundaries: 'images/how-it-works-family.jpg',
    reproduction: 'images/pexels-emma-bauso-1183828-2253879.jpg',
    porn: 'images/promo/promo-05-tablet-learning.png',
    continuing: 'images/pexels-max-fischer-5212331.jpg'
  };

  var middleChildhoodLessonImages = [
    'images/pexels-julia-m-cameron-4144531.jpg',
    'images/pexels-karola-g-5478103.jpg',
    'images/pexels-mikhail-nilov-6893360.jpg',
    'images/pexels-antonius-ferret-5274618.jpg',
    'images/promo/promo-04-classroom.png',
    'images/pexels-artempodrez-6951903.jpg',
    'images/pexels-bohlemedia-963713.jpg',
    'images/pexels-hngstrm-1939485.jpg',
    'images/promo/promo-03-hiking.png'
  ];

  function lessonAudio(sa, transcript, duration, voice) {
    return {
      audioUrl: sa,
      transcript: transcript,
      voice: voice || 'Warm Guide v1',
      duration: duration,
      status: 'ready'
    };
  }

  function transcriptFromLesson(lesson) {
    if (lesson.readScript && lesson.readScript.length) {
      return lesson.readScript.map(function (sec) {
        return [sec.title].concat(sec.paragraphs || []).join('\n\n');
      }).join('\n\n');
    }
    var parts = [lesson.title, lesson.summary];
    (lesson.sections || []).forEach(function (sec) {
      parts.push(sec.title);
      if (sec.bullets) sec.bullets.forEach(function (b) { parts.push(b); });
      if (sec.paragraphs) sec.paragraphs.forEach(function (p) { parts.push(p); });
      if (sec.scripts) sec.scripts.forEach(function (s) { parts.push(s); });
      if (sec.reflectionLead) parts.push(sec.reflectionLead);
    });
    return parts.join('\n\n');
  }

  function splitLesson(opts) {
    var lesson = {
      id: opts.id,
      title: opts.title,
      summary: opts.summary,
      duration: opts.duration,
      layout: 'split-right',
      heroVisual: opts.heroVisual,
      sections: opts.sections
    };
    if (opts.readScript) lesson.readScript = opts.readScript;
    lesson.audio = lessonAudio(
      opts.audioUrl || sampleAudio,
      opts.transcript || transcriptFromLesson(lesson),
      opts.audioDuration || opts.duration,
      opts.audioVoice
    );
    if (opts.availability) lesson.availability = opts.availability;
    return lesson;
  }

  function buildEarlyYearsFoundationsCourse(sa) {
    var handbookPlaceholder = '#parent-handbook-pdf-placeholder';

    var lessons = [
      splitLesson({
        id: 'welcome-video',
        title: 'Welcome Video',
        summary:
          'Meet Bright Talks, see how this course is organized, and hear why calm, shame-free conversations help young children feel safe and understood.',
        duration: '3 min',
        audioDuration: '03:00',
        audioUrl: welcomeAudio,
        heroVisual: {
          type: 'video',
          src: welcomeVideoSrc,
          poster: 'images/promo/promo-07-family-walk.png'
        },
        sections: [
          {
            title: 'Talk Objectives',
            type: 'objectives',
            bullets: [
              'Understand what Bright Talks offers parents and caregivers of young children.',
              'See how the course is structured and what you can expect in each talk.',
              'Feel reassured that you can lead these talks with warmth, not fear or embarrassment.'
            ]
          },
          {
            title: 'What You Will Learn',
            type: 'prose',
            paragraphs: [
              'This course walks through six practical topics: bodies and anatomy, boundaries and safety, reproduction, online images, and keeping the conversation going over time.',
              'Each talk includes short video, parent-friendly guidance, optional audio narration, and space to reflect. You can move at your child’s pace. There is no test and no perfect script.',
              'Bright Talks is built for real homes: busy schedules, curious questions, and the hope that your child will always know they can come to you.'
            ]
          },
          {
            title: 'How to Use This Course',
            type: 'prose',
            paragraphs: [
              'Watch the welcome video, then move through the talks in order or jump to what fits your family right now.',
              'Use the handbook and discussion prompts when you are ready. Small, repeated conversations matter more than one long talk.',
              'If a topic feels new to you, that is okay. You are learning alongside your child, and that honesty builds trust.'
            ]
          }
        ]
      }),
      splitLesson({
        id: 'lesson-1-bodies',
        availability: 'ready',
        title: 'Talk 1: Bodies, Biology & Anatomy',
        summary:
          'Name body parts clearly and without shame so your child understands privacy, dignity, and that their body belongs to them.',
        duration: '20m',
        audioDuration: '05:54',
        audioUrl: talk1ListenAudio,
        audioVoice: 'Heidi Cooper',
        readScript: talk1ReadScript,
        heroVisual: {
          type: 'embed',
          src: talk1EmbedSrc,
          previewSrc: talk1VideoSrc,
          splash: {
            introAudio: talk1IntroAudio,
            introDurationMs: 6000,
            logoSrc: brightTalksLogo,
            kicker: 'Talk 1',
            title: 'Bodies, Biology & Anatomy'
          }
        },
        sections: [
          {
            title: 'Talk Objectives',
            type: 'objectives',
            bullets: [
              'Use accurate, calm words for body parts in everyday moments.',
              'Connect naming to safety: private parts, respect, and asking for help.',
              'Choose one routine (bath, books, dressing) to practice this week.'
            ]
          },
          {
            title: 'Age-Based Guidance',
            type: 'prose',
            paragraphs: [
              'Ages 3 to 4: Short labels during care routines. “This is your arm, this is your knee.” Keep your tone matter-of-fact, like naming colors.',
              'Ages 5 to 6: Add privacy language. “Some parts are private. We use real names so you always know what I mean.”'
            ]
          },
          {
            title: 'Phrases to Try',
            type: 'scripts',
            scripts: [
              '“Every part of your body has a name. We use real names so you always know what I mean.”',
              '“Your body is strong and good. Some parts are private. We only touch them for washing or health.”',
              '“If something feels confusing or uncomfortable, you can always tell me.”'
            ]
          },
          {
            title: 'Parent Handbook & Resources',
            type: 'downloads',
            downloads: [
              {
                label: 'Download Parent Handbook (PDF)',
                href: handbookPlaceholder,
                description: 'Printable guide with body-part language, bath-time prompts, and book suggestions.'
              },
              {
                label: 'Body Safety Word List (PDF)',
                href: '#body-safety-word-list-placeholder',
                description: 'Simple vocabulary card for caregivers and co-parents.'
              }
            ]
          },
          {
            title: 'Try This at Home',
            type: 'discussion',
            paragraphs: ['Pick one calm moment this week to name two body parts and one private-area rule.'],
            reflectionLead: 'What phrase will you try first?',
            reflectionPlaceholder: 'Example: “Your body is strong and good. Some parts are private. We only touch them for washing or health.”'
          }
        ]
      }),
      splitLesson({
        id: 'lesson-2-boundaries',
        availability: 'soon',
        title: 'Talk 2: Boundaries & Safety',
        summary:
          'Teach boundaries, safe and unsafe touch, consent in daily life, and who children can tell when something feels wrong.',
        duration: '22m',
        audioDuration: '22:00',
        heroVisual: { type: 'image', src: earlyYearsLessonImages.boundaries, alt: 'Family conversation at home' },
        sections: [
          {
            title: 'Talk Objectives',
            type: 'objectives',
            bullets: [
              'Explain boundaries in language a young child can remember.',
              'Distinguish caring touch (doctor, parent for health) from unsafe touch.',
              'Name trusted adults your child can go to for help.'
            ]
          },
          {
            title: 'Boundaries in Everyday Life',
            type: 'prose',
            paragraphs: [
              'Boundaries are not lectures. They are habits: asking before a hug, knocking before entering a room, and respecting “no” or “not right now.”',
              'Practice consent language often: “Do you want a high five or a wave?” Children learn that their body belongs to them.'
            ]
          },
          {
            title: 'Doctor, Family & Safe Touch',
            type: 'prose',
            paragraphs: [
              'Help children understand that some grown-ups help with bodies for health and care: a parent during bath time, a doctor with a parent present. Those moments have a purpose and should never feel secret or scary.',
              'Unsafe touch is touch that feels confusing, scary, or secret, and children can always tell you. Reassure them: you will listen, you will believe them, and you will help.'
            ]
          },
          {
            title: 'Trusted Adults',
            type: 'prose',
            paragraphs: [
              'Name two or three trusted adults besides you (another caregiver, grandparent, teacher). Practice: “If you ever feel mixed-up or yucky about touch, tell me or ___ right away.”',
              'Keep the list small and familiar so your child is not overwhelmed.'
            ]
          },
          {
            title: 'Safety Scripts',
            type: 'scripts',
            scripts: [
              '“Your body belongs to you. You can say no to a hug.”',
              '“No secrets about touch. If someone asks you to keep touch a secret, tell me.”',
              '“If something feels wrong, come to me. I will always help you.”'
            ]
          }
        ]
      }),
      splitLesson({
        id: 'lesson-3-reproduction',
        availability: 'soon',
        title: 'Talk 3: Reproduction',
        summary:
          'Answer “where do babies come from?” with simple, factual, warm language suited to ages 3 to 6.',
        duration: '18m',
        audioDuration: '18:00',
        heroVisual: { type: 'image', src: earlyYearsLessonImages.reproduction, alt: 'Calm parent-child moment' },
        sections: [
          {
            title: 'Talk Objectives',
            type: 'objectives',
            bullets: [
              'Respond to early questions about babies without shame or over-explaining.',
              'Use age-appropriate facts about conception and birth.',
              'Stay calm so your child knows this topic is safe to discuss.'
            ]
          },
          {
            title: 'Simple, Age-Appropriate Facts',
            type: 'prose',
            paragraphs: [
              'Young children often need a short answer first: “Babies grow in a special place inside the body called a uterus. It takes time, and a grown-up takes care of the baby until it is ready to be born.”',
              'If they ask how a baby starts, you might say: “It takes a tiny part from two grown-ups who love each other. Their bodies work together in a special way, and the baby grows in the uterus.” Add detail only if they ask more.',
              'Use the same calm tone you use for other body topics. You do not need graphic detail for a preschooler.'
            ]
          },
          {
            title: 'Common Questions',
            type: 'prose',
            paragraphs: [
              '“Did I grow in your tummy?” Yes, and you can share their birth story in a simple, loving way.',
              '“How does the baby get out?” “When the baby is ready, the body pushes the baby out through a special opening called the vagina, or sometimes doctors help through surgery.”',
              'It is okay to say, “Great question. Let me think how to say that simply,” and return when you are ready.'
            ]
          },
          {
            title: 'Parent Handbook',
            type: 'downloads',
            downloads: [
              {
                label: 'Reproduction Q&A Guide (PDF)',
                href: '#reproduction-guide-placeholder',
                description: 'Sample phrases for ages 3 to 6 (placeholder. Full PDF coming soon).'
              }
            ]
          }
        ]
      }),
      splitLesson({
        id: 'lesson-4-porn',
        availability: 'soon',
        title: 'Talk 4: Porn & Inappropriate Images',
        summary:
          'Prepare calm responses if your child sees confusing images or videos online or elsewhere without fear or shame.',
        duration: '20m',
        audioDuration: '20:00',
        heroVisual: { type: 'image', src: earlyYearsLessonImages.porn, alt: 'Parent guiding child at computer' },
        sections: [
          {
            title: 'Talk Objectives',
            type: 'objectives',
            bullets: [
              'Understand why early conversations about inappropriate images support safety.',
              'Know what to say if a child sees something confusing without panic or punishment.',
              'Set simple family rules for screens and “tell me right away.”'
            ]
          },
          {
            title: 'Parent-Facing Guidance',
            type: 'prose',
            paragraphs: [
              'This talk is for adults. We do not show graphic content. The goal is to help you respond with steadiness if a young child encounters inappropriate pictures or videos.',
              'Many children see something by accident: a click, a pop-up, or an older sibling’s device. Your reaction shapes whether they come to you again.'
            ]
          },
          {
            title: 'What To Say',
            type: 'scripts',
            scripts: [
              '“That picture is not for kids. If you see something like that, close the screen and tell me. You are not in trouble.”',
              '“Those images are for grown-ups only. They can feel confusing. I am glad you told me.”',
              '“Let’s find something safe to watch together.”'
            ]
          },
          {
            title: 'Online Safety Basics',
            type: 'prose',
            paragraphs: [
              'Use devices in shared spaces when possible, enable parental controls, and teach: “If a screen shows something that feels yucky or weird, come get me.”',
              'Focus on safety and trust, not shame. You are the steady adult in a confusing moment.'
            ]
          },
          {
            title: 'Resource Placeholder',
            type: 'downloads',
            downloads: [
              {
                label: 'Family Screen Safety Checklist (PDF)',
                href: '#screen-safety-checklist-placeholder',
                description: 'One-page checklist for caregivers (placeholder).'
              }
            ]
          }
        ]
      }),
      splitLesson({
        id: 'lesson-5-continuing',
        availability: 'soon',
        title: 'Talk 5: Continuing the Conversation',
        summary:
          'Build habits and scripts so body-safety talks stay normal, warm, and open as your child grows.',
        duration: '16m',
        audioDuration: '16:00',
        heroVisual: { type: 'image', src: earlyYearsLessonImages.continuing, alt: 'Parent and child talking' },
        sections: [
          {
            title: 'Talk Objectives',
            type: 'objectives',
            bullets: [
              'Plan small, repeatable check-ins, not one “big talk.”',
              'Use scripts that fit your family voice.',
              'Identify next steps and who else should hear the same language.'
            ]
          },
          {
            title: 'Keep It Going',
            type: 'prose',
            paragraphs: [
              'Children learn through repetition. A two-sentence comment during bath time, a book at bedtime, or a quick check-in after school keeps the door open.',
              'Celebrate questions: “I am glad you asked me.” Even if you need a pause to answer, follow up soon.'
            ]
          },
          {
            title: 'Scripts You Can Reuse',
            type: 'scripts',
            scripts: [
              '“What questions do you have about bodies today?”',
              '“Remember: your body is yours. You can tell me anything.”',
              '“We use real names and we keep each other safe.”'
            ]
          },
          {
            title: 'Reflection & Next Steps',
            type: 'discussion',
            paragraphs: [
              'Choose one weekly rhythm (Sunday breakfast, car ride, bedtime) for a one-minute check-in.',
              'Share key phrases with co-parents, grandparents, or childcare so your child hears consistent messages.'
            ],
            reflectionLead: 'What is one next step you will take in the next seven days?',
            reflectionPlaceholder: 'Example: “Download the handbook and practice one boundary phrase at bath time.”'
          },
          {
            title: 'Course Completion',
            type: 'prose',
            paragraphs: [
              'You have walked through the core early-years path. Revisit any talk when new questions appear and celebrate the trust you are building.',
              'More age-specific videos and handbooks will be linked here as they are published.'
            ]
          }
        ]
      })
    ];

    return {
      id: 'bt-foundations-early-years',
      title: 'Body Safety Foundations (Ages 3 to 6)',
      topic: 'Body Safety',
      audience: 'Parents of Early Learners',
      level: 'Starter',
      description:
        'A structured path for parents and caregivers: welcome, bodies, boundaries, reproduction, online safety, and ongoing conversation that is calm, clear, and shame-free.',
      outcome:
        'Leave with practical language, handbooks, and scripts you can use this week to build trust and body safety at home.',
      duration: '1h 42m',
      lessonCount: lessons.length,
      progress: 17,
      completed: false,
      heroImage: courseHeroImages.earlyYears,
      playerEntry: { module: 0, lesson: 0 },
      introAudio: {
        audioUrl: sa,
        transcript:
          'Welcome to Body Safety Foundations. This course guides you through six talks designed for parents of young children.',
        voice: 'Warm Guide v1',
        duration: '02:11',
        status: 'ready'
      },
      modules: [
        {
          id: 'm-early-years-core',
          title: 'Early Years Course',
          objective:
            'Move from introduction through bodies, boundaries, reproduction, online safety, and keeping conversations going over time.',
          lessons: lessons
        }
      ]
    };
  }

  function buildMiddleChildhoodCourse(sa) {
    var lessonTitles = [
      'Understanding Growing Bodies',
      'Privacy & Personal Space',
      'Answering Curious Questions',
      'Friendships & Boundaries',
      'Media & Online Curiosity',
      'Emotions & Self-Esteem',
      'Family Values & Rules',
      'Preparing for Puberty Talks',
      'Keeping Conversations Open'
    ];
    var durations = ['12 min', '10 min', '11 min', '9 min', '13 min', '10 min', '8 min', '12 min', '9 min'];

    var lessons = lessonTitles.map(function (title, i) {
      return {
        id: 'mc-l' + (i + 1),
        title: 'Lesson ' + (i + 1) + ': ' + title,
        summary: 'Practical guidance for parents of children ages 6 to 9.',
        duration: durations[i],
        heroVisual: {
          type: 'image',
          src: middleChildhoodLessonImages[i % middleChildhoodLessonImages.length],
          alt: title
        },
        audio: {
          audioUrl: sa,
          transcript: title + ': parent-friendly guidance for middle childhood.',
          voice: 'Warm Guide v2',
          duration: durations[i].replace(' min', ':00'),
          status: 'ready'
        }
      };
    });

    return {
      id: 'bt-middle-childhood',
      title: 'Growing Up: Middle Childhood',
      topic: 'Growing Up',
      audience: 'Parents of Ages 6 to 9',
      level: 'Core',
      description:
        'Friendships, curiosity, and honest answers as your child grows more independent.',
      outcome:
        'Build confidence leading age-appropriate talks about bodies, boundaries, and growing up.',
      duration: '1h 34m',
      lessonCount: lessons.length,
      progress: 0,
      completed: false,
      heroImage: courseHeroImages.middleChildhood,
      playerEntry: { module: 0, lesson: 0 },
      modules: [
        {
          id: 'm-middle-childhood',
          title: 'Middle Childhood Course',
          objective: 'Guide children ages 6 to 9 through curiosity, boundaries, and growing independence.',
          lessons: lessons
        }
      ]
    };
  }

  /** @type {Course[]} */
  var courses = [
    buildEarlyYearsFoundationsCourse(sampleAudio),
    buildMiddleChildhoodCourse(sampleAudio),
    {
      id: 'bt-puberty-conversations',
      title: 'Puberty & Growing Up Without Shame',
      topic: 'Puberty',
      audience: 'Parents of Ages 9 to 13',
      level: 'Core',
      description: 'Lead puberty talks with confidence, dignity, and practical scripts for body changes, emotions, and relationships.',
      outcome: 'Create ongoing conversations that reduce shame, improve trust, and keep communication open.',
      duration: '2h 45m',
      lessonCount: 15,
      progress: 0,
      completed: false,
      heroImage: courseHeroImages.puberty,
      introAudio: {
        audioUrl: sampleAudio,
        transcript: 'This course helps you normalize puberty conversations so your child feels supported, informed, and safe.',
        voice: 'Warm Guide v2',
        duration: '02:28',
        status: 'ready'
      },
      modules: [
        {
          id: 'm1',
          title: 'Set the Tone',
          objective: 'Normalize puberty language and reduce family anxiety.',
          lessons: [
            { id: 'l1', title: 'Conversation Myths to Drop', summary: 'Replace fear with practical expectations.', duration: '10m', audio: { audioUrl: sampleAudio, transcript: 'Myths keep parents silent; clarity builds trust.', voice: 'Warm Guide v2', duration: '10:18', status: 'ready' } },
            { id: 'l2', title: 'Calm Openers That Work', summary: 'Start naturally in everyday moments.', duration: '9m', audio: { audioUrl: sampleAudio, transcript: 'Short openers invite dialogue without pressure.', voice: 'Warm Guide v2', duration: '09:40', status: 'ready' } },
            { id: 'l3', title: 'Handling Embarrassment', summary: 'Respond when children shut down or joke.', duration: '11m', audio: { audioUrl: sampleAudio, transcript: 'Respect discomfort while keeping the door open.', voice: 'Warm Guide v2', duration: '11:02', status: 'ready' } }
          ]
        },
        {
          id: 'm2',
          title: 'Body Changes and Emotional Health',
          objective: 'Teach what is happening physically and emotionally in an affirming way.',
          lessons: [
            { id: 'l1', title: 'What Changes to Expect', summary: 'Map age ranges without panic.', duration: '12m', audio: { audioUrl: sampleAudio, transcript: 'Different timelines are normal and healthy.', voice: 'Warm Guide v2', duration: '12:09', status: 'ready' } },
            { id: 'l2', title: 'Mood Swings and Connection', summary: 'Stay close when emotions feel intense.', duration: '11m', audio: { audioUrl: sampleAudio, transcript: 'Empathy first, coaching second.', voice: 'Warm Guide v2', duration: '11:28', status: 'ready' } },
            { id: 'l3', title: 'Practical Hygiene Routines', summary: 'Build habits that support confidence.', duration: '8m', audio: { audioUrl: sampleAudio, transcript: 'Simple routines reduce stress and conflict.', voice: 'Warm Guide v2', duration: '08:31', status: 'ready' } }
          ]
        },
        {
          id: 'm3',
          title: 'Digital and Social Pressures',
          objective: 'Prepare children for online and peer pressure with values-based guidance.',
          lessons: [
            { id: 'l1', title: 'Texting and Social Boundaries', summary: 'Set standards for digital respect.', duration: '9m', audio: { audioUrl: sampleAudio, transcript: 'Digital communication needs clear boundaries.', voice: 'Warm Guide v2', duration: '09:14', status: 'ready' } },
            { id: 'l2', title: 'Responding to Explicit Content', summary: 'Guide without shaming or escalating.', duration: '12m', audio: { audioUrl: sampleAudio, transcript: 'Correct clearly while protecting trust.', voice: 'Warm Guide v2', duration: '12:03', status: 'ready' } },
            { id: 'l3', title: 'Friends, Crushes, and Respect', summary: 'Teach healthy standards early.', duration: '10m', audio: { audioUrl: sampleAudio, transcript: 'Respect and boundaries belong in every relationship.', voice: 'Warm Guide v2', duration: '10:27', status: 'ready' } }
          ]
        }
      ]
    },
    {
      id: 'bt-teen-digital-safety',
      title: 'Teen Digital Safety & Healthy Relationships',
      topic: 'Digital Safety',
      audience: 'Parents of Teens',
      level: 'Advanced',
      description: 'Support teens through online pressure, sexting risks, boundary violations, and relationship decision making.',
      outcome: 'Build a family plan that keeps teens safer online while strengthening trust and accountability.',
      duration: '3h 05m',
      lessonCount: 16,
      progress: 0,
      completed: false,
      heroImage: courseHeroImages.teen,
      introAudio: {
        audioUrl: sampleAudio,
        transcript: 'In this course, we focus on practical digital safety, trust, and clear standards for healthy teen relationships.',
        voice: 'Warm Guide v3',
        duration: '02:16',
        status: 'ready'
      },
      modules: [
        {
          id: 'm1',
          title: 'Digital Culture Reality Check',
          objective: 'Understand the pressures teens face in connected environments.',
          lessons: [
            { id: 'l1', title: 'What Teens Actually Face Online', summary: 'Map the social dynamics behind risky behavior.', duration: '12m', audio: { audioUrl: sampleAudio, transcript: 'Digital pressure is social pressure in real time.', voice: 'Warm Guide v3', duration: '12:22', status: 'ready' } },
            { id: 'l2', title: 'Family Standards That Stick', summary: 'Set values-based digital expectations.', duration: '9m', audio: { audioUrl: sampleAudio, transcript: 'Clarity and consistency matter more than strictness.', voice: 'Warm Guide v3', duration: '09:35', status: 'ready' } },
            { id: 'l3', title: 'When Rules Are Broken', summary: 'Use consequences that teach, not just punish.', duration: '11m', audio: { audioUrl: sampleAudio, transcript: 'Consequences should restore trust and responsibility.', voice: 'Warm Guide v3', duration: '11:20', status: 'ready' } }
          ]
        },
        {
          id: 'm2',
          title: 'Sexting, Consent, and Boundaries',
          objective: 'Teach legal, emotional, and relational consequences with practical scripts.',
          lessons: [
            { id: 'l1', title: 'Consent in Digital Spaces', summary: 'Expand consent conversations beyond in-person settings.', duration: '10m', audio: { audioUrl: sampleAudio, transcript: 'Consent applies to photos, messages, and sharing.', voice: 'Warm Guide v3', duration: '10:42', status: 'ready' } },
            { id: 'l2', title: 'How To Respond to Sexting Incidents', summary: 'Take immediate steps with wisdom and clarity.', duration: '13m', audio: { audioUrl: sampleAudio, transcript: 'Respond quickly, protect your teen, and document facts.', voice: 'Warm Guide v3', duration: '13:09', status: 'ready' } },
            { id: 'l3', title: 'Repairing Trust After a Crisis', summary: 'Move from panic to a healthy recovery plan.', duration: '12m', audio: { audioUrl: sampleAudio, transcript: 'Recovery requires honesty, support, and clear boundaries.', voice: 'Warm Guide v3', duration: '12:15', status: 'ready' } }
          ]
        },
        {
          id: 'm3',
          title: 'Healthy Relationship Coaching',
          objective: 'Coach teens toward dignity, boundaries, and relational wisdom.',
          lessons: [
            { id: 'l1', title: 'Red Flags and Green Flags', summary: 'Teach teens to recognize healthy vs unhealthy patterns.', duration: '9m', audio: { audioUrl: sampleAudio, transcript: 'Spot early signs to prevent bigger harm.', voice: 'Warm Guide v3', duration: '09:12', status: 'ready' } },
            { id: 'l2', title: 'Conflict, Pressure, and Respect', summary: 'Practice scripts for difficult social situations.', duration: '11m', audio: { audioUrl: sampleAudio, transcript: 'Boundaries protect confidence and self-respect.', voice: 'Warm Guide v3', duration: '11:29', status: 'ready' } },
            { id: 'l3', title: 'Parent-Teen Debrief Rhythm', summary: 'Create an ongoing weekly check-in routine.', duration: '8m', audio: { audioUrl: sampleAudio, transcript: 'Frequent short check-ins keep conversations open.', voice: 'Warm Guide v3', duration: '08:25', status: 'ready' } }
          ]
        }
      ]
    }
  ];

  window.BRIGHT_TALKS_COURSE_EXPERIENCE = courses;
})();
