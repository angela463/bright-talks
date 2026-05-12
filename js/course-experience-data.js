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
   * @typedef {Object} Lesson
   * @property {string} id
   * @property {string} title
   * @property {string} summary
   * @property {string} duration
   * @property {LessonAudio} audio
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
   * @property {LessonAudio} introAudio
   * @property {Module[]} modules
   */

  var sampleAudio = 'audio/Bright Talks Voice Over.m4a';

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
      progress: 12,
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
      progress: 100,
      completed: true,
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
