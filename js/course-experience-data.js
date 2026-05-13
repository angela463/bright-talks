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
   *
   * @typedef {Object} LessonHeroVisual
   * @property {'video'|'image'} type
   * @property {string} src
   * @property {string} [alt]
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

  function buildNamingBodyPartsLesson(sa) {
    var title =
      'Naming Body Parts Without Shame: Building Body Safety, Confidence, and Everyday Communication';
    var summary =
      'Use clear, kind words for the body so your child feels safe asking questions, understands privacy, and knows you are a steady guide—not a source of embarrassment.';
    var sections = [
      {
        title: 'Lesson Objectives',
        type: 'objectives',
        bullets: [
          'Understand why calm, accurate body language supports confidence and everyday safety for young children.',
          'Connect bath time, books, and dressing routines to short phrases you can repeat without pressure.',
          'Choose one gentle opener you can try this week that fits your family voice.'
        ]
      },
      {
        title: 'Overview of Course',
        type: 'prose',
        paragraphs: [
          'Body Safety Foundations is designed for real parents: short lessons, practical wording, and a tone that feels steady—not scary. You are not trying to teach everything at once. You are building a home where bodies are spoken about like other important topics: with respect, clarity, and warmth.',
          'Across the course you will practice boundaries, privacy, and trusted adults in language a young child can remember. Today we focus on naming body parts because clarity reduces confusion, helps children ask for help, and quietly communicates that shame does not belong in your family story.'
        ]
      },
      {
        title: 'Section 1: Why This Conversation Matters',
        type: 'prose',
        paragraphs: [
          'Young children are naturally curious. When adults go quiet, change the subject, or only use silly nicknames, kids still notice. Silence can accidentally teach that bodies are embarrassing, which makes it harder for them to come to you later with a question or a worry.',
          'When you speak plainly and kindly, you become the trusted guide. That does not mean sharing adult detail. It means using real words in a calm voice—like naming an elbow or a knee—and pairing those words with safety: some areas are private, and grown-ups help with bodies for care, health, or safety.',
          'This also helps when your child hears something odd at school. If you have already spoken calmly at home, they are more likely to think, “I can ask my grown-up,” because you have shown them your door is open.'
        ]
      },
      {
        title: 'Why Naming Body Parts Correctly Is Important',
        type: 'prose',
        paragraphs: [
          'Correct names reduce confusion if a child ever needs to tell a teacher, coach, or doctor what happened. Clear language supports safety the same way a street address helps someone find home—it removes guesswork in a stressful moment.',
          'If you like a family nickname for one area, you can still pair it with the real name: “Some people say ___, and the real name is ___.” That keeps warmth and clarity together.',
          'Naming without shame also protects dignity. You are teaching that every part of the body deserves respect and privacy—and that message becomes the emotional backbone for consent conversations as your child grows.'
        ]
      },
      {
        title: 'The Science Behind Body Awareness and Child Safety',
        type: 'prose',
        paragraphs: [
          'Young children learn through repetition, co-regulation, and trusted relationships. When your voice stays calm, your child’s nervous system gets practice returning to steady. That is why short, warm exchanges beat one intense talk.',
          'Body awareness grows through everyday routines: naming clothing, noticing sensations, and practicing consent language like, “Do you want a hug or a high five?” These habits teach that bodies belong to the person inside them.',
          'Prevention education is not about fearing people; it is about teaching skills—naming, boundaries, and telling a safe adult. Research-informed family programs emphasize early, shame-free language because it pairs safety with connection, which helps lessons actually stick.'
        ]
      },
      {
        title: 'Discussion Prompt: How to Start the Conversation',
        type: 'discussion',
        paragraphs: [
          'Pick a calm moment this week (after a snack, during bath, or while reading). Try a two-sentence opener that names the goal without pressure.'
        ],
        reflectionLead: 'Write a starter phrase you would feel okay saying out loud. Keep it simple—you can repeat it over time.',
        reflectionPlaceholder:
          'Example: “Your body is good and strong. Some parts are private, and I use real names so you always know what I mean.”'
      }
    ];

    function transcriptFromSections() {
      var parts = [title, summary];
      sections.forEach(function (sec) {
        parts.push(sec.title);
        if (sec.bullets) sec.bullets.forEach(function (b) { parts.push(b); });
        if (sec.paragraphs) sec.paragraphs.forEach(function (p) { parts.push(p); });
        if (sec.reflectionLead) parts.push(sec.reflectionLead);
      });
      return parts.join('\n\n');
    }

    var transcript = transcriptFromSections();

    return {
      id: 'l3-naming-body-parts',
      title: title,
      summary: summary,
      duration: '22m',
      layout: 'split-right',
      heroVisual: { type: 'video', src: 'videos/4982409-hd_1920_1080_25fps.mp4' },
      sections: sections,
      audio: {
        audioUrl: sa,
        transcript: transcript,
        voice: 'Warm Guide v1',
        duration: '22:00',
        status: 'ready'
      }
    };
  }

  /** @type {Course[]} */
  var courses = [
    {
      id: 'bt-foundations-early-years',
      title: 'Body Safety Foundations (Ages 3 to 6)',
      topic: 'Body Safety',
      audience: 'Parents of Early Learners',
      level: 'Starter',
      description: 'Learn calm scripts for body questions, privacy, consent, and safe touch conversations in everyday moments.',
      outcome: 'Leave with practical language you can use this week to build trust and body safety habits at home.',
      duration: '2h 10m',
      lessonCount: 13,
      progress: 38,
      completed: false,
      heroImage: 'images/pexels-julia-m-cameron-4144230.jpg',
      playerEntry: { module: 2, lesson: 2 },
      introAudio: {
        audioUrl: sampleAudio,
        transcript: 'Welcome to Body Safety Foundations. In this course you will learn to answer big questions with simple, respectful language.',
        voice: 'Warm Guide v1',
        duration: '02:11',
        status: 'ready'
      },
      modules: [
        {
          id: 'm1',
          title: 'Start Early Without Fear',
          objective: 'Build confidence and age-appropriate language before awkward moments happen.',
          lessons: [
            { id: 'l1', title: 'Why Early Conversations Matter', summary: 'Set the tone before misinformation does.', duration: '8m', audio: { audioUrl: sampleAudio, transcript: 'Early conversations prevent confusion and shame.', voice: 'Warm Guide v1', duration: '08:02', status: 'ready' } },
            { id: 'l2', title: 'Words That Build Safety', summary: 'Use clear terms that reduce confusion.', duration: '9m', audio: { audioUrl: sampleAudio, transcript: 'Use correct names for body parts and boundaries.', voice: 'Warm Guide v1', duration: '09:21', status: 'ready' } },
            { id: 'l3', title: 'Three-Sentence Responses', summary: 'Answer hard questions quickly and calmly.', duration: '11m', audio: { audioUrl: sampleAudio, transcript: 'Keep answers short, honest, and reassuring.', voice: 'Warm Guide v1', duration: '11:07', status: 'ready' } }
          ]
        },
        {
          id: 'm2',
          title: 'Boundaries at Home',
          objective: 'Practice repeatable habits that teach privacy and consent in normal routines.',
          lessons: [
            { id: 'l1', title: 'Consent in Daily Life', summary: 'Model asking permission with everyday touch.', duration: '10m', audio: { audioUrl: sampleAudio, transcript: 'Show consent through simple daily phrases.', voice: 'Warm Guide v1', duration: '10:09', status: 'ready' } },
            { id: 'l2', title: 'Bathroom and Bedroom Privacy', summary: 'Set house rules children can understand.', duration: '8m', audio: { audioUrl: sampleAudio, transcript: 'Create repeatable privacy rules without fear-based language.', voice: 'Warm Guide v1', duration: '08:13', status: 'ready' } },
            { id: 'l3', title: 'When Kids Push Limits', summary: 'Correct behavior while preserving connection.', duration: '11m', audio: { audioUrl: sampleAudio, transcript: 'Correct quickly and reconnect right away.', voice: 'Warm Guide v1', duration: '11:11', status: 'ready' } },
            { id: 'l4', title: 'Caregiver Consistency Plan', summary: 'Align grandparents, babysitters, and co-parents.', duration: '12m', audio: { audioUrl: sampleAudio, transcript: 'Consistency from all adults creates confidence for children.', voice: 'Warm Guide v1', duration: '12:18', status: 'ready' } }
          ]
        },
        {
          id: 'm3',
          title: 'Safety Skills Outside the Home',
          objective: 'Help children apply safety language at school, church, and activities.',
          lessons: [
            { id: 'l1', title: 'Safe Adults and Unsafe Secrets', summary: 'Teach the difference clearly and calmly.', duration: '9m', audio: { audioUrl: sampleAudio, transcript: 'Children need clear rules for secrets and helpers.', voice: 'Warm Guide v1', duration: '09:04', status: 'ready' } },
            { id: 'l2', title: 'What To Do If Something Feels Wrong', summary: 'Use a simple response plan kids can remember.', duration: '12m', audio: { audioUrl: sampleAudio, transcript: 'Practice stop, move away, and tell a trusted adult.', voice: 'Warm Guide v1', duration: '12:35', status: 'ready' } },
            buildNamingBodyPartsLesson(sampleAudio)
          ]
        }
      ]
    },
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
      heroImage: 'images/pexels-vlada-karpovich-4609085.jpg',
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
      heroImage: 'images/promo/promo-08-teen-desk.png',
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
