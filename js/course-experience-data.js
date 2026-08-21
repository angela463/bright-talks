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
  var talk1VideoSrc = 'videos/talk-1-bodies.mp4';
  var talk1ListenAudio = 'audio/talk-1-bodies-biology-anatomy.m4a';
  var brightTalksLogo = 'png/Bright-Talks-logo-createoutlines.png';
  var welcomeVideoSrc = 'videos/hero-home-loop.mp4'; // Same clip as homepage hero (index.html)
  var talk1EmbedSrc =
    'https://player.mediadelivery.net/embed/695172/fb174fe3-ea85-4043-bb6f-2857f074378a' +
    '?autoplay=false&loop=false&muted=true&preload=true&responsive=true&playerjs=true';
  var talk2VideoSrc = 'videos/talk-2-boundaries.mp4';
  var talk3VideoSrc = 'videos/talk-3-reproduction.mp4';
  var talk4VideoSrc = 'videos/talk-4-porn-images.mp4';
  var talk5VideoSrc = 'videos/talk-5-continuing.mp4';

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

  var talk2ReadScript = [
    {
      title: "Introduction",
      paragraphs: [
        "Hi, and welcome back.",
        "In our last lesson, we talked about the importance of teaching children the correct names for their body parts and creating an environment where conversations about bodies feel natural—not awkward or shameful.",
        "Today, we're going to build on that foundation.",
        "Once children understand their bodies, the next step is helping them understand that their bodies belong to them. This is where we begin introducing healthy boundaries, body safety, and the confidence to speak up when something doesn't feel right.",
        "These conversations aren't about making children afraid of the world. They're about helping them move through the world with confidence, wisdom, and the reassurance that they can always come to you."
      ]
    },
    {
      title: "Teaching Body Safety",
      paragraphs: [
        "One of the most practical ways to help children understand body safety is by giving them simple, age-appropriate language.",
        "Continue using the correct anatomical names for every part of the body. This not only helps children communicate clearly, but also reinforces that every part of their body is important and worthy of respect.",
        "As your child grows, you can also begin explaining that certain parts of our bodies are private. A helpful way to describe this is that the parts covered by a swimsuit are private and deserve special respect and care.",
        "Children should know that, in most situations, no one should ask to see or touch those private areas. The few exceptions such as a parent helping with hygiene or a healthcare provider during a medical exam should always be explained with openness and care.",
        "Keeping these conversations simple helps children understand expectations without creating fear."
      ]
    },
    {
      title: "Understanding Boundaries",
      paragraphs: [
        "Boundaries are one of the greatest gifts we can teach our children.",
        "They help children recognize that every person has personal space, feelings, and the right to be treated with respect.",
        "One simple way to introduce this idea is by talking about a \"personal bubble.\" Explain that everyone has a space around them that belongs to them, and just as we respect other people's space, they can expect others to respect theirs.",
        "This also applies to affection.",
        "Many of us grew up believing children should hug every relative or friend, even when they didn't want to. Today, we have the opportunity to teach something even more valuable that affection should come from love, not obligation.",
        "When we allow children to choose whether they'd like to give a hug, a high five, or simply wave hello, we're teaching them that their voice matters.",
        "Ironically, these small everyday moments become practice for much bigger moments later in life."
      ]
    },
    {
      title: "Giving Children Their Voice",
      paragraphs: [
        "One of the most empowering things we can teach children is that it's okay to speak up.",
        "Sometimes play becomes too rough.",
        "Sometimes someone gets too close.",
        "Sometimes something simply doesn't feel right.",
        "Children don't need long speeches in those moments, they need simple words they've already practiced.",
        "Try rehearsing phrases like: \"Please stop.\"",
        "\"I don't like that.\"",
        "\"No, thank you.\"",
        "Or simply, \"I'm going to go find my mom or dad.\"",
        "Practicing these phrases during calm moments helps children feel more confident using them if they ever need to."
      ]
    },
    {
      title: "Trusted Adults",
      paragraphs: [
        "Just as important as teaching children to use their voice is helping them know who will listen.",
        "Take time to identify trusted adults in your child's life together.",
        "This might include a parent, grandparent, teacher, coach, pastor, or another safe adult they know well.",
        "Children should understand that if something makes them feel uncomfortable, confused, or unsafe, they can always come to one of these trusted adults and they will be believed, supported, and loved.",
        "Another important conversation to have is about secrets.",
        "Families often enjoy surprises, like birthday gifts or holiday celebrations, because eventually everyone finds out together.",
        "Secrets are different.",
        "If anyone ever asks your child to keep a secret about their body or about touching, they should know they never have to keep that secret.",
        "You can reassure them by saying: \"There is nothing you could tell me that would make me stop loving you. You can always come to me.\"",
        "Those words can become an incredible source of security throughout childhood."
      ]
    },
    {
      title: "A Christian Perspective",
      paragraphs: [
        "As Christian parents, we believe every person is created in the image of God and has inherent dignity and worth.",
        "Teaching healthy boundaries isn't about teaching children to distrust others.",
        "It's about helping them understand that God created them with value, and because of that, their bodies deserve to be treated with care, respect, and honor.",
        "When children know they are loved by God and deeply loved by their family, healthy boundaries become a natural extension of that truth."
      ]
    },
    {
      title: "Key Takeaway",
      paragraphs: [
        "Body safety doesn't begin with one difficult conversation.",
        "It grows through dozens of small, everyday moments.",
        "Every time you respect your child's boundaries… Every time you listen when they say \"stop\"… Every time you remind them that they can always come to you… You're helping build confidence, trust, and resilience that will serve them for years to come."
      ]
    },
    {
      title: "Wrapping Up",
      paragraphs: [
        "Remember, you're not trying to prepare your child for one conversation—you're preparing them for a lifetime of healthy relationships.",
        "The confidence you're building today becomes the foundation they'll carry into friendships, school, dating, and eventually their own families.",
        "In our next lesson, we'll continue building on this foundation as we explore how to explain reproduction, conception, and birth in ways that are honest, age-appropriate, and rooted in both science and your family's values.",
        "We'll see you in the next lesson."
      ]
    }
  ];

  var talk3ReadScript = [
    {
      title: "Introduction",
      paragraphs: [
        "Hi, and welcome to Bright Talks.",
        "As parents, many of us want our children to grow up feeling confident, safe, and comfortable in their own bodies. But for many families, conversations about bodies can feel awkward because no one modeled those conversations for us growing up.",
        "The good news is that these conversations don't have to be complicated.",
        "Children are naturally curious. At some point they'll ask questions like, \"Where do babies come from?\" or \"How did I get in Mommy's tummy?\" Those questions aren't something to fear, they're opportunities to build trust.",
        "Today, we'll talk about how to answer those questions honestly, simply, and in ways that are appropriate for your child's age and your family's values."
      ]
    },
    {
      title: "Following Your Child's Curiosity",
      paragraphs: [
        "One of the best parenting principles is to answer the question your child is actually asking.",
        "Young children are usually looking for a simple answer, not a detailed explanation.",
        "If your child asks where babies come from, you might simply say, \"A baby begins when a tiny cell from a mom and a tiny cell from a dad come together. The baby grows safely inside the mother's uterus until it's ready to be born.\"",
        "For many young children, that's enough.",
        "As they grow, they'll naturally ask more questions, giving you opportunities to build on what they've already learned."
      ]
    },
    {
      title: "Science and Faith Working Together",
      paragraphs: [
        "Teaching children about reproduction doesn't mean choosing between science and faith.",
        "As Christians, we believe that God created our bodies with incredible purpose and design.",
        "Science helps us understand how our bodies work.",
        "Faith reminds us why they matter.",
        "These two perspectives don't compete, they complement one another.",
        "When children understand both, they can appreciate the wonder of how God designed life while also learning accurate, age-appropriate biology."
      ]
    },
    {
      title: "Keeping the Conversation Open",
      paragraphs: [
        "It's okay if you don't have every answer.",
        "What's most important is creating a home where your child knows they can always ask you.",
        "If you're unsure how to respond, it's perfectly fine to say, \"That's a great question. Let's learn about that together.\"",
        "Moments like these teach children that curiosity is welcomed and that their parents are a safe place to seek truth."
      ]
    },
    {
      title: "A Foundation for the Future",
      paragraphs: [
        "These early conversations aren't about explaining everything at once.",
        "They're about building trust.",
        "Each honest, age-appropriate conversation lays another brick in the foundation you'll continue building as your child grows.",
        "One day those conversations may include puberty, relationships, intimacy, and God's design for marriage.",
        "When children grow up talking openly with their parents, those future conversations often feel far more natural because the relationship has already been built."
      ]
    },
    {
      title: "Key Takeaway",
      paragraphs: [
        "Your goal isn't to have one perfect conversation.",
        "Your goal is to become the person your child naturally comes to with their questions.",
        "When you answer with honesty, warmth, and confidence, you're teaching far more than biology.",
        "You're teaching your child that truth can always be explored together, and that home is a safe place for curiosity."
      ]
    },
    {
      title: "Wrapping Up",
      paragraphs: [
        "As we finish today's lesson, remember that every question your child asks is an invitation into a deeper relationship.",
        "You don't need all the right words, you simply need a willingness to listen, answer honestly, and keep the conversation going.",
        "Each small conversation helps build trust that will carry your family through every stage of childhood and beyond.",
        "In our next lesson, we'll turn our attention to one of the biggest challenges facing families today: helping children navigate inappropriate images, online content, and technology with wisdom and confidence. We'll explore practical ways to prepare, not scare our children, while continuing to build the trust you've been strengthening throughout this course.",
        "We'll see you in the next talk."
      ]
    }
  ];

  var talk4ReadScript = [
    {
      title: "Introduction",
      paragraphs: [
        "Hi, and welcome to Bright Talks.",
        "As parents, many of us want our children to grow up feeling confident, safe, and comfortable in their own bodies. But for many families, conversations about sensitive topics can feel intimidating because no one modeled those conversations for us growing up.",
        "The good news is that you don't have to wait until something happens to begin preparing your child.",
        "Just as we've talked about bodies, boundaries, and God's design for life, today we're going to talk about preparing our children for something many families will eventually face: pornography and inappropriate images.",
        "This may feel like one of the hardest conversations you'll ever have, but it doesn't have to begin with fear. It can begin with trust."
      ]
    },
    {
      title: "Preparing Before They Encounter It",
      paragraphs: [
        "One of the greatest gifts we can give our children is preparation before exposure.",
        "Many children today don't intentionally search for inappropriate images. They may stumble across them through advertisements, social media, friends, online games, or simple curiosity.",
        "We can't control every image our children may encounter.",
        "But we can prepare them for how to respond.",
        "Think of this conversation the same way you would teach your child what to do if they become lost in a store or if there's a fire drill at school.",
        "We're not expecting something bad to happen.",
        "We're helping them know what to do if it does.",
        "Preparation creates confidence."
      ]
    },
    {
      title: "Creating a Safe Place",
      paragraphs: [
        "One of the most important messages your child can hear is this: \"If you ever see something online that confuses you, scares you, or makes you uncomfortable, you can always come talk to me.\"",
        "Children need to know they won't get in trouble simply for asking questions or telling the truth.",
        "When a child believes they'll be met with anger or shame, they're much more likely to hide what happened.",
        "When they know they'll be met with love and calm guidance, they're much more likely to come to you.",
        "Our goal isn't to raise children who never make mistakes.",
        "Our goal is to raise children who know where to go when they need help."
      ]
    },
    {
      title: "Responding with Grace",
      paragraphs: [
        "If your child does encounter pornography or inappropriate images, your response matters.",
        "Take a deep breath.",
        "Stay calm.",
        "Listen before you lecture.",
        "You might say, \"Thank you for telling me. I'm really glad you came to me.\"",
        "That simple response communicates safety.",
        "From there, you can gently explain that not everything we see online reflects God's good design for people or relationships.",
        "Some images are created to confuse, objectify, or distort something beautiful.",
        "This is an opportunity to teach, not to shame."
      ]
    },
    {
      title: "A Christian Perspective",
      paragraphs: [
        "As Christians, we believe that every person is created in the image of God and deserves to be treated with dignity, honor, and respect.",
        "God created intimacy as something good, meaningful, and beautiful within His design.",
        "Pornography presents a very different picture.",
        "Rather than showing people as individuals with inherent worth, it often reduces them to objects for someone else's pleasure.",
        "Helping children understand this isn't about creating fear or embarrassment.",
        "It's about helping them recognize the difference between God's design for love and relationships and the messages they may encounter in the world around them."
      ]
    },
    {
      title: "Keeping the Conversation Going",
      paragraphs: [
        "Like every lesson in this course, this isn't meant to be one conversation.",
        "It's the beginning of many.",
        "As your child grows, their questions will change.",
        "So will your conversations.",
        "What's most important is that they always know your home is a place where honesty is welcomed, questions are encouraged, and grace is never in short supply."
      ]
    },
    {
      title: "Key Takeaway",
      paragraphs: [
        "You don't have to prepare your child for every situation.",
        "You simply need to prepare them to come to you.",
        "When children know they're deeply loved, safe to ask questions, and supported without shame, you've already given them one of the strongest protections they'll ever have."
      ]
    },
    {
      title: "Wrapping Up",
      paragraphs: [
        "As we finish today's lesson, remember that your greatest influence isn't found in having all the right answers.",
        "It's found in being present.",
        "Every calm conversation...",
        "Every honest answer...",
        "Every moment of listening without judgment...",
        "Builds the kind of trust that helps children navigate a complicated world with wisdom and confidence.",
        "Thank you for taking the time to invest in these conversations. They may not always be easy, but they matter deeply, and your willingness to show up with love, patience, and grace will have an impact that lasts far beyond childhood.",
        "We'll see you in the next lesson."
      ]
    }
  ];

  var talk5ReadScript = [
    {
      title: "Introduction",
      paragraphs: [
        "Hi, and welcome to Bright Talks.",
        "As parents, many of us want our children to grow up feeling confident, safe, and comfortable in their own bodies. But for many families, conversations about bodies and growing up can feel awkward because no one modeled those conversations for us growing up.",
        "Over the last few lessons, we've talked about bodies, boundaries, reproduction, and navigating inappropriate images. While those topics are important, perhaps the most important lesson is this: The goal was never to have one perfect conversation.",
        "The goal has always been to build a relationship where conversations continue throughout your child's life.",
        "Today, we'll talk about how to keep that conversation going."
      ]
    },
    {
      title: "Small Conversations Make a Big Difference",
      paragraphs: [
        "One of the greatest gifts you can give your child is knowing they never have to wonder if it's okay to ask you a question.",
        "The healthiest families rarely have one big talk.",
        "Instead, they have dozens of small conversations over the years.",
        "A question in the car.",
        "A conversation before bedtime.",
        "Something that comes up after school.",
        "A movie you watched together.",
        "These ordinary moments often become the most meaningful opportunities to teach, listen, and connect."
      ]
    },
    {
      title: "You Don't Have to Have Every Answer",
      paragraphs: [
        "As your child grows, their questions will grow too.",
        "Some will be simple.",
        "Others may catch you completely off guard.",
        "And that's okay.",
        "You don't have to know every answer in the moment.",
        "Sometimes the best response is simply, \"That's a really good question. Let me think about it, and let's talk about it together.\"",
        "Children don't expect perfection.",
        "They remember whether you were willing to listen."
      ]
    },
    {
      title: "Turning Everyday Moments into Conversations",
      paragraphs: [
        "Many of the best discussions don't begin because we planned them.",
        "They begin because life gives us an opportunity.",
        "A question about a friend.",
        "A scene in a movie.",
        "A headline.",
        "A conversation at school.",
        "Instead of avoiding these moments, we can see them as invitations.",
        "Each one allows us to gently reinforce our family's values while reminding our children that home is a safe place to ask honest questions."
      ]
    },
    {
      title: "Building Trust Over Time",
      paragraphs: [
        "Trust isn't built through one conversation.",
        "It's built through consistency.",
        "Every time you listen without overreacting...",
        "Every time you answer honestly...",
        "Every time you respond with grace instead of shame...",
        "You're showing your child that they can keep coming back to you.",
        "And that trust becomes one of the greatest protections you can offer as they grow into adolescence and adulthood."
      ]
    },
    {
      title: "A Christian Perspective",
      paragraphs: [
        "As Christian parents, we have the privilege of pointing our children toward truth with both conviction and compassion.",
        "Jesus often taught through conversations, questions, and relationships.",
        "In the same way, we can create homes where truth is shared with patience, grace, and love.",
        "Our goal isn't simply to give our children information.",
        "Our goal is to help them grow in wisdom, character, and confidence as they learn to follow God's design for their lives."
      ]
    },
    {
      title: "Key Takeaway",
      paragraphs: [
        "You don't have to be the perfect parent.",
        "You simply need to remain a present one.",
        "Every conversation is another opportunity to build trust.",
        "Every question is another opportunity to strengthen your relationship.",
        "And every stage of childhood offers new opportunities to walk alongside your child with love, honesty, and hope."
      ]
    },
    {
      title: "Wrapping Up",
      paragraphs: [
        "As we close this course, remember that Bright Talks was never about giving you a script for every situation.",
        "It was about helping you discover something you may have already had all along, the ability to lead your family with warmth, wisdom, and confidence.",
        "Your child doesn't need a parent who always has the perfect words.",
        "They need a parent who is willing to keep showing up.",
        "So keep asking questions.",
        "Keep listening well.",
        "Keep creating moments of connection.",
        "And remember, every small conversation is helping build a relationship your child can rely on for years to come.",
        "Thank you for allowing Bright Talks to be part of your family's journey. We hope these lessons have encouraged you, equipped you, and reminded you that you don't have to do this alone.",
        "The conversations may continue to change as your child grows but one thing remains the same: Your presence, your love, and your willingness to keep talking will always matter more than having the perfect answer.",
        "Thank you for joining us, and from all of us at Bright Talks, we wish you and your family the very best as you continue the conversation."
      ]
    }
  ];

  var mcTalk1ReadScript = [
    {
      title: 'Introduction',
      paragraphs: [
        'Hi, and welcome to Bright Talks.',
        'As parents, many of us want our children to grow up feeling confident, safe, and comfortable in their own bodies. But for many families, conversations about bodies and growing up can feel awkward because no one modeled those conversations for us growing up.',
        'The good news is that these discussions don\'t have to be complicated.',
        'As children move into the ages of six, seven, and eight, something begins to change. They\'re noticing more. They\'re asking more questions. They may start comparing their bodies with friends or siblings, becoming more aware of privacy, or wondering why boys and girls are different.',
        'That growing curiosity isn\'t something we need to shut down.',
        'It\'s an invitation to stay connected.'
      ]
    },
    {
      title: 'Growing Bodies, Growing Awareness',
      paragraphs: [
        'Children develop at different rates, and during these years, they\'re becoming increasingly aware that bodies don\'t all look the same.',
        'They may notice differences in height, weight, hair, skin, or body shape. They may become more modest or suddenly want privacy when getting dressed.',
        'These are normal parts of growing up.',
        'When your child makes an observation or asks a question, try to respond calmly and matter-of- factly.',
        'You might say: "Everyone\'s body grows a little differently, and that\'s okay."',
        'Or: "Your body will keep changing as you get older. If you ever have questions about those changes, you can always ask me."',
        'Simple responses like these communicate something powerful:',
        'There is nothing embarrassing about growing up.'
      ]
    },
    {
      title: 'Curiosity Is Normal',
      paragraphs: [
        'At this age, questions may also become more specific.',
        'Your child might ask why bodies are different, where babies come from, or something they heard from a friend at school.',
        'Sometimes those questions catch us completely off guard.',
        'Our instinct might be to change the subject or wonder, "Why are they asking me this already?"',
        'But curiosity is a normal part of childhood development. Children are constantly trying to understand how the world works including their own bodies.',
        'You don\'t have to give them every detail.',
        'Listen to the question they\'re actually asking, give a simple and truthful answer, and then pause.',
        'Often, that\'s enough.',
        'And when you don\'t know what to say, it\'s okay to respond:',
        '"That\'s a good question. Let me think about the best way to answer it, and we\'ll talk about it together."',
        'You\'re showing your child that questions are welcome, even when the answers take a little time.'
      ]
    },
    {
      title: 'Preparing for Changes Ahead',
      paragraphs: [
        'As your child\'s curiosity grows, one of the best things you can do is stay curious too.',
        'When they ask a question, you don\'t always have to rush to give an answer. Sometimes you can simply ask:',
        '"What made you think about that?"',
        'or, "What have you heard about that already?"',
        'Those small questions can tell you a lot about what your child is thinking, what they may be hearing from others, and what they\'re actually ready to understand.',
        'Most importantly, they keep the conversation open.',
        'When we respond to curiosity with curiosity-not embarrassment or alarm-we show our children that questions are welcome here. And that helps establish something we want them to carry into every stage of growing up:',
        '"I can always talk to my parent about this."',
        'For some children, the earliest signs of puberty can begin sooner than parents expect, while for others those changes will come several years later.',
        'That\'s why these years are a wonderful time to begin preparing-not because something needs to happen right now, but because children feel more confident when changes don\'t come as a complete surprise.'
      ]
    },
    {
      title: 'A Christian Perspective',
      paragraphs: [
        'As Christians, we believe our bodies were intentionally created by God and are worthy of care and respect.',
        'And while every person develops differently, those differences don\'t determine their value.',
        'Science helps us understand how bodies grow and develop.',
        'Our faith reminds us that through every stage of that development, our worth remains the same.',
        'When we speak about growing bodies without embarrassment or shame, we help our children see their bodies as something to understand, care for, and be grateful for.'
      ]
    },
    {
      title: 'Key Takeaway',
      paragraphs: [
        'Your child\'s growing curiosity isn\'t a problem to solve.',
        'It\'s an opportunity to strengthen your relationship.',
        'Every question gives you another chance to say: "You can talk to me."',
        'Every honest answer builds trust.',
        'And every calm conversation today makes the bigger conversations tomorrow a little easier.'
      ]
    },
    {
      title: 'Wrapping Up',
      paragraphs: [
        'As we finish today\'s lesson, remember that you don\'t need to prepare your child for every change all at once.',
        'You\'re simply laying the foundation.',
        'Keep listening.',
        'Keep answering honestly.',
        'And keep reminding your child that growing up is nothing to be ashamed of and that you\'ll be there to walk through it with them.',
        'As their world continues to expand, however, you won\'t be the only voice they hear.',
        'Friends, classmates, older children, media, and everyday conversations may introduce ideas or words your child doesn\'t understand.',
        'In our next talk, we\'ll explore When Kids Hear Things From Friends and how to respond when your child comes home and asks a question you weren\'t expecting.',
        'We\'ll help you turn those surprising moments into opportunities for connection rather than panic.',
        'We\'ll see you in the next lesson.'
      ]
    }
  ];

  var mcTalk2ReadScript = [
    {
      title: 'Introduction',
      paragraphs: [
        'Hi, and welcome to Bright Talks.',
        'As parents, many of us want our children to grow up feeling confident, safe, and comfortable coming to us with their questions. But as children grow, something important begins to change:',
        'We\'re no longer the only voices they hear.',
        'Friends, classmates, older siblings, media, and conversations at school begin introducing new words, ideas, and questions-sometimes long before we expected them.',
        'And eventually, your child may come home and say something that completely catches you off guard.',
        'When that happens, your first instinct might be: "Where did you hear THAT?"',
        'Take a breath.',
        'Because that unexpected question may actually be an invitation.',
        'Today, we\'re going to talk about how to respond with curiosity instead of panic so your child continues seeing you as a safe and trusted source.'
      ]
    },
    {
      title: 'When Other Voices Enter the Conversation',
      paragraphs: [
        'At six, seven, and eight, friendships become increasingly important.',
        'Children talk.',
        'They compare experiences.',
        'They repeat things they\'ve heard from siblings, adults, television, online content, or other kids and they don\'t always understand what those things actually mean.',
        'So when your child brings home a new word or idea, remember:',
        'Hearing something isn\'t the same as understanding it.',
        'Before correcting them or jumping into an explanation, find out what they actually know.',
        'You might ask: "What do you think that means?"',
        '"Where did you hear that?"',
        'or simply, "Tell me more about that."',
        'Their answer may surprise you.',
        'Sometimes the conversation you were preparing yourself to have isn\'t the conversation your child needs at all.'
      ]
    },
    {
      title: 'Respond to Curiosity With Curiosity',
      paragraphs: [
        'Remember what we talked about in our last lesson: Respond to curiosity with curiosity.',
        'If your child asks an uncomfortable question, try not to let your facial expression answer before your words do.',
        'Pause.',
        'Listen.',
        'Stay curious.',
        'You don\'t have to immediately correct every word or explain everything they might eventually need to know.',
        'First, understand what they\'re asking.',
        'Then give a truthful, simple, age appropriate response. And pause again.',
        'Let your child\'s curiosity, not your anxiety help determine where the conversation goes next.'
      ]
    },
    {
      title: 'When a Friend Shares Something Inappropriate',
      paragraphs: [
        'Sometimes what your child hears may be inaccurate, inappropriate, or simply more mature than they\'re ready to understand.',
        'Those moments can feel unsettling.',
        'But they also give you an opportunity to reinforce an important message:',
        '"I\'m really glad you told me."',
        'You can explain that sometimes kids hear or repeat things they don\'t fully understand, and your child never has to feel embarrassed about coming to you.',
        'If what they heard isn\'t accurate, gently give them the truth.',
        'If it\'s something they\'re not ready to understand fully, you can say:',
        '"There\'s more to that, and we\'ll keep talking about it as you get older. For now, here\'s what I want you to know."',
        'You\'re not avoiding the conversation.',
        'You\'re meeting your child where they are.'
      ]
    },
    {
      title: 'Helping Them Navigate Their Friendships',
      paragraphs: [
        'We also don\'t want children to believe that a friend is automatically "bad" because they said something inappropriate.',
        'That child may simply be repeating something they heard somewhere else.',
        'Instead, help your child learn what they can do when a conversation makes them uncomfortable.',
        'They can change the subject.',
        'They can walk away.',
        'They can say, "I don\'t want to talk about that."',
        'And they can always come tell you.',
        'This gives children permission to have boundaries with their peers without teaching them to fear their friends.'
      ]
    },
    {
      title: 'A Christian Perspective',
      paragraphs: [
        'As Christian parents, we want our children to learn how to recognize truth while also treating other people with grace.',
        'Not everything they hear will reflect your family\'s beliefs or God\'s design for bodies, relationships, and sexuality.',
        'That\'s why our goal isn\'t to shelter children from every different idea.',
        'It\'s to give them a strong foundation so they know where to bring those ideas when they encounter them.',
        'We can help our children seek what is true while responding to others with kindness, wisdom, and compassion.'
      ]
    },
    {
      title: 'Key Takeaway',
      paragraphs: [
        'When your child comes home with a surprising question, remember:',
        'Pause. Get curious. Clarify. Connect.',
        'You don\'t have to panic.',
        'You don\'t have to know exactly what to say.',
        'And you don\'t have to turn every question into a thirty-minute lesson.',
        'Sometimes the most important thing you can say is simply:',
        '"I\'m glad you came to me."',
        'Because every time your child brings something confusing to you and is met with calmness, honesty, and love, they\'re learning:',
        '"I can bring the hard things here."'
      ]
    },
    {
      title: 'Wrapping Up',
      paragraphs: [
        'As we finish today\'s lesson, remember that you won\'t always be able to control what your child hears.',
        'But you can influence where they go to make sense of it.',
        'Stay curious.',
        'Listen before you react.',
        'Answer honestly.',
        'And keep reminding your child that there is no question too awkward, confusing, or embarrassing to bring home.',
        'As their curiosity continues to grow, some of those questions will naturally become bigger and more specific.',
        'In our next talk, Questions About Babies, Sex & Where We Come From, we\'ll help you navigate those moments with honest, age appropriate answers without giving your child more information than they\'re ready for.',
        'And we\'ll introduce a simple approach you can use when those bigger questions arrive:'
      ]
    }
  ];

  var mcTalk3ReadScript = [
    {
      title: 'Introduction',
      paragraphs: [
        'Hi, and welcome to Bright Talks.',
        'As parents, many of us want our children to grow up feeling confident, safe, and comfortable coming to us with their questions. But as those questions become more specific, it can sometimes feel harder to know exactly what to say.',
        'At six, seven, and eight, questions about babies, pregnancy, growing bodies, and things they may have heard from others can begin to come up.',
        'And when they do, you might find yourself wondering: "How much should I actually tell them?"',
        'The good news is that you don\'t have to explain everything at once.',
        'Today, we\'re going to talk about how to answer these bigger questions honestly, simply, and in a way that meets your child right where they are.'
      ]
    },
    {
      title: 'Start With What They Already Know',
      paragraphs: [
        'When your child asks, "How are babies made?" resist the urge to immediately launch into an explanation.',
        'Remember what we\'ve been practicing: Stay curious.',
        'Try asking: "What made you think about that?"',
        'or, "What do you already know about where babies come from?"',
        'Their answer gives you a starting point.',
        'Maybe they\'re wondering how a baby gets inside a mother\'s body.',
        'Maybe a friend said something at school.',
        'Maybe someone in your family is pregnant.',
        'Understanding the question behind the question helps you give your child the information they\'re actually looking for.'
      ]
    },
    {
      title: 'Answer. Pause. Listen.',
      paragraphs: [
        'Here\'s a simple approach you can use:',
        'First, keep your answer simple, truthful, and appropriate for what your child is asking.',
        'You might say: "Babies begin with something very small from a mom called an egg and something very small from a dad called sperm. When they come together, a baby can begin to grow inside the mom\'s uterus."',
        'Then pause.',
        'Give your child a moment to take that in.',
        'They may be completely satisfied with that answer and move right along to something else.',
        'Or they may have another question.',
        'Either response is okay.',
        'If they ask how the sperm and egg come together, you can add another layer:',
        '"One way a pregnancy can begin is through something called sexual intercourse. This is a private way adults can share intimacy, and it allows sperm from the man\'s body to reach an egg inside the woman\'s body. If you have questions about how that happens, you can always ask me."',
        'Then pause again.',
        'You aren\'t avoiding the next question.',
        'You\'re simply allowing your child to decide when they\'re ready to ask it.'
      ]
    },
    {
      title: 'When Bigger Questions Come Up',
      paragraphs: [
        'As children grow, they may hear words or ask questions that surprise you, including questions about sex.',
        'Remember, your child\'s understanding of a word may be very different from yours.',
        'Before explaining, stay curious.',
        'You might simply ask: "What have you heard about that?"',
        'or, "What do you think that means?"',
        'Their answer will help you understand what they\'re really asking and how much they\'re ready to know.',
        'If they\'re asking about how babies begin, you can explain that sexual intercourse is one way adults can share intimacy that may lead to pregnancy.',
        'You don\'t have to explain every detail unless your child continues asking questions.',
        'For Christian families, you can also gently connect the conversation to your family\'s beliefs:',
        '"We believe God created our bodies, love, marriage, and families with purpose. As you get older, we\'ll keep talking about what that means together."',
        'The goal isn\'t to give your child everything they will eventually need to know.',
        'It\'s to give them enough truth for today and the confidence to come back tomorrow.'
      ]
    },
    {
      title: 'Science and Faith Together',
      paragraphs: [
        'Science gives us an incredible understanding of how human life begins.',
        'At this age, children can begin learning simple biological concepts like eggs, sperm, pregnancy, and how babies grow inside the uterus.',
        'And those scientific truths can exist naturally alongside your family\'s faith.',
        'As Christians, we believe human life has value and that our bodies, relationships, marriage, and sexuality are part of God\'s intentional design.',
        'Science helps us understand how our bodies and reproduction work.',
        'Faith helps us talk about the meaning, responsibility, love, and values surrounding them.',
        'We don\'t have to teach everything at once.',
        'Both of these conversations can deepen as your child grows.'
      ]
    },
    {
      title: 'It\'s Okay If This Feels Awkward',
      paragraphs: [
        'If these conversations weren\'t modeled for you growing up, even saying words like sperm, egg, or sexual intercourse with your child may feel uncomfortable at first.',
        'That\'s okay.',
        'You don\'t have to pretend the conversation feels effortless.',
        'What\'s important is that our discomfort doesn\'t accidentally communicate that their curiosity is something to be embarrassed about.',
        'Take your time.',
        'Stay calm.',
        'And if you\'re caught completely off guard, you can always say:',
        '"That\'s an important question. I want to give you a good answer. Can we talk about it a little later?"',
        'Just make sure you come back to it.',
        'Every time you do, you\'re reinforcing something important:',
        '"You can ask me about this."'
      ]
    },
    {
      title: 'Key Takeaway',
      paragraphs: [
        'You don\'t need to give your six, seven, or eight year old everything you know about reproduction.',
        'Give them what they\'re ready for.',
        'Answer honestly. Pause. Listen.',
        'If another question comes, answer that question too.',
        'Over time, those small conversations build a much bigger understanding of bodies, reproduction, relationships, and your family\'s values.',
        'More importantly, they build trust.'
      ]
    },
    {
      title: 'Wrapping Up',
      paragraphs: [
        'As we finish today\'s lesson, remember that your goal isn\'t to have one perfect conversation.',
        'It\'s to create a relationship where your child never has to wonder whether they\'re allowed to ask.',
        'Stay curious.',
        'Use truthful, age appropriate language.',
        'Let their questions guide the pace.',
        'And remember that every calm answer today makes it easier for your child to come back tomorrow.',
        'As children become more independent, however, knowing the facts is only part of what they need.',
        'They also need confidence navigating situations when you aren\'t right beside them.',
        'In our next talk, Boundaries, Secrets & Staying Safe, we\'ll build on what your child already knows about body safety and help you prepare them for friendships, school, activities, trusted adults, secrets, and situations that simply don\'t feel right.',
        'Because as their independence grows, we want their confidence and their voice to grow with it.',
        'We\'ll see you in the next lesson.'
      ]
    }
  ];

  var mcTalk4ReadScript = [
    {
      title: 'Introduction',
      paragraphs: [
        'Hi, and welcome to Bright Talks.',
        'As parents, many of us want our children to grow up feeling confident, safe, and comfortable coming to us when something doesn\'t feel right.',
        'As children grow, however, their world begins to grow too.',
        'They\'re spending more time at school, with friends, at activities, and around trusted adults outside the home. And while that growing independence is a healthy part of childhood, it also gives us an opportunity to strengthen something we\'ve been teaching from the very beginning:',
        'Your body deserves respect, your boundaries matter, and you can always ask for help.',
        'Today, we\'re going to talk about helping children recognize their boundaries, understand the difference between secrets and surprises, identify trusted adults, and know what to do when a situation leaves them feeling uncomfortable or confused.'
      ]
    },
    {
      title: 'Boundaries Grow With Them',
      paragraphs: [
        'When children were younger, boundaries may have sounded simple:',
        '"You don\'t have to give someone a hug if you don\'t want to."',
        'At six, seven, and eight, we can begin expanding that conversation.',
        'Boundaries aren\'t only about physical touch.',
        'They\'re also about personal space, privacy, words, play, and situations that make us uncomfortable.',
        'Maybe a friend won\'t stop wrestling after your child says they\'re done.',
        'Maybe someone keeps teasing them after they\'ve asked them to stop.',
        'Maybe another child wants to show them something that makes them uncomfortable.',
        'These everyday situations give children opportunities to practice recognizing and communicating their boundaries.',
        'You can remind them: "If something doesn\'t feel right, you can speak up, step away, and find an adult you trust."'
      ]
    },
    {
      title: 'Helping Children Use Their Voice',
      paragraphs: [
        'Knowing they have a boundary is one thing.',
        'Knowing how to communicate it is another.',
        'That\'s why practicing simple phrases at home can be so helpful.',
        '"Please stop."',
        '"I don\'t like that."',
        '"I need some space."',
        '"I\'m going to tell an adult."',
        'Children don\'t need the perfect words.',
        'They need to know that they\'re allowed to use their voice.',
        'And we can reinforce that lesson in everyday family life by listening when they communicate a reasonable boundary to us.',
        'When children see that their words matter at home, they\'re learning how to use those words when we\'re not there.'
      ]
    },
    {
      title: 'Secrets and Surprises',
      paragraphs: [
        'This age is also a good time to talk about the difference between secrets and surprises.',
        'A surprise is something we\'re keeping quiet for a little while because eventually someone will find out like a birthday present or a special celebration.',
        'But children should never feel responsible for keeping something hidden because someone tells them they\'ll get in trouble, makes them feel afraid, or asks them not to tell their parents.',
        'Especially when it involves their body, touching, inappropriate pictures, or something that made them uncomfortable.',
        'You might tell your child: "No one should ask you to keep something from me that makes you feel scared, worried, or uncomfortable. You can always tell me even if someone told you not to."',
        'And then give them one more reassurance: "You won\'t be in trouble for telling me."',
        'That can be incredibly important for a child to hear.'
      ]
    },
    {
      title: 'Who Are Your Safe Adults?',
      paragraphs: [
        'As children become more independent, they also need to know who they can turn to when you aren\'t nearby.',
        'Sit down together and identify a few trusted adults in their world.',
        'Maybe it\'s a grandparent.',
        'A teacher.',
        'A coach.',
        'A relative.',
        'A trusted adult from church or another activity.',
        'Instead of only saying, "Find an adult," help your child know which adults you trust and why.',
        'You can even ask: "If you were at school and needed help, who could you talk to?"',
        '"What about soccer practice?"',
        '"What if you couldn\'t reach me?"',
        'These aren\'t conversations meant to make children afraid.',
        'They\'re simply giving them a plan.',
        'Preparation creates confidence.'
      ]
    },
    {
      title: 'When Something Doesn\'t Feel Right',
      paragraphs: [
        'Sometimes children won\'t know exactly why a situation feels uncomfortable.',
        'That\'s okay.',
        'They don\'t have to prove that something is wrong before asking for help.',
        'Teach your child that if something feels confusing, uncomfortable, or unsafe, they can:',
        'Speak up. Step away. Tell a trusted adult.',
        'And if the first adult doesn\'t understand or doesn\'t help?',
        'Tell another trusted adult.',
        'Keep telling until someone listens.',
        'This isn\'t about teaching children that everyone around them is dangerous.',
        'It\'s about teaching them that they never have to handle an uncomfortable situation alone.'
      ]
    },
    {
      title: 'A Christian Perspective',
      paragraphs: [
        'As Christians, we believe every person is created in the image of God and deserves dignity, care, and respect.',
        'That includes our children.',
        'Teaching boundaries isn\'t teaching children to fear others. It\'s helping them understand that they have value and that other people do too.',
        'We can teach children to respect someone else\'s "no" while also knowing that their own "no" matters.',
        'We can teach kindness without requiring silence.',
        'And we can teach respect for adults while helping children understand that if an adult ever asks them to do something unsafe, inappropriate, or secretive, they can always come to us.'
      ]
    },
    {
      title: 'Key Takeaway',
      paragraphs: [
        'As your child\'s independence grows, their confidence and voice can grow with it.',
        'Help them remember: Speak up. Step away. Tell a trusted adult.',
        'And perhaps most importantly: They can always tell you.',
        'Even if they\'re embarrassed.',
        'Even if they broke a rule.',
        'Even if someone told them not to.',
        'Even if they aren\'t quite sure what happened.',
        'The goal isn\'t for your child to know exactly what to do in every possible situation.',
        'It\'s for them to know they never have to navigate those situations alone.'
      ]
    },
    {
      title: 'Wrapping Up',
      paragraphs: [
        'As we finish today\'s lesson, remember that body safety isn\'t about raising fearful children.',
        'It\'s about raising children who know their boundaries, recognize their value, use their voice, and know where to turn when they need help.',
        'Practice these conversations during calm, everyday moments.',
        'Ask questions.',
        'Listen carefully.',
        'And remind your child often: "Whatever happens, you can always come to me."',
        'Because every time we respond with calmness, honesty, and love, we\'re building the trust they\'ll need as their world continues to grow.',
        'And that brings us to our final talk.',
        'In Keeping the Door Open, we\'ll bring everything we\'ve learned together and explore how to protect that trust as your child moves toward the preteen years so that as their questions get bigger, their willingness to come to you grows right alongside them.',
        'We\'ll see you in the next lesson.'
      ]
    }
  ];

  var mcTalk5ReadScript = [
    {
      title: 'Introduction',
      paragraphs: [
        'Hi, and welcome to Bright Talks.',
        'As parents, many of us want our children to grow up feeling confident, safe, and comfortable coming to us with their questions.',
        'Throughout this course, we\'ve talked about growing bodies, growing curiosity, things children may hear from friends, questions about reproduction, and how to strengthen boundaries and body safety.',
        'But underneath every one of those conversations has been something even more important:',
        'Trust.',
        'Because the goal isn\'t simply for your child to know the right information.',
        'It\'s for them to know where they can always go when they need help making sense of it.',
        'Today, we\'re going to talk about how to keep that door open as your child grows.'
      ]
    },
    {
      title: 'Trust Is Built in Small Moments',
      paragraphs: [
        'Trust usually isn\'t built during one big conversation.',
        'It\'s built in ordinary moments.',
        'When your child tells you something surprising.',
        'When they admit they made a mistake.',
        'When they ask an awkward question.',
        'When they tell you something a friend said.',
        'How we respond in those small moments teaches children what they can bring to us in the future.',
        'Sometimes the most powerful response is simply: "I\'m really glad you told me."',
        'That doesn\'t mean you agree with everything they say or that there won\'t sometimes be consequences.',
        'It simply tells your child: "You can tell me the truth, and we\'ll figure it out together."'
      ]
    },
    {
      title: 'Listen Before You React',
      paragraphs: [
        'As children grow, eventually they\'re going to tell us something we weren\'t expecting.',
        'And sometimes our faces react before our words do.',
        'Before correcting, questioning, or jumping immediately into advice, try to pause and listen.',
        'You might say: "Tell me more."',
        '"How did that make you feel?"',
        'or, "What do you think about what happened?"',
        'Remember one of the ideas we\'ve practiced throughout this course:',
        'Respond to curiosity with curiosity.',
        'When we stay curious, we\'re not only gathering information.',
        'We\'re showing our children that their thoughts matter to us.'
      ]
    },
    {
      title: 'Keep Creating Opportunities to Talk',
      paragraphs: [
        'Not every meaningful conversation needs to begin with: "We need to talk."',
        'In fact, some of the best conversations happen when we\'re doing something else.',
        'Driving in the car.',
        'Making dinner.',
        'Walking the dog.',
        'Getting ready for bed.',
        'Those everyday moments can make bigger conversations feel much less intimidating.',
        'You can also create simple check-ins: "What\'s something that made you happy today?"',
        '"Did anything happen that confused you?"',
        '"Did you hear anything today that you have questions about?"',
        'Your child may not always have something to say.',
        'That\'s okay.',
        'You\'re showing them that the door is open.'
      ]
    },
    {
      title: 'When They Tell You Something Hard',
      paragraphs: [
        'There may come a day when your child tells you something that worries you.',
        'Maybe they broke a family rule.',
        'Maybe they saw something inappropriate.',
        'Maybe a friend said something confusing.',
        'Or maybe something happened that made them uncomfortable or afraid.',
        'In those moments, your child will be watching your response.',
        'Take a breath.',
        'Listen.',
        'And remind them: "Thank you for telling me. We\'ll figure out what to do together."',
        'You can address the behavior or situation after you\'ve made sure your child knows they are safe, heard, and loved.',
        'Grace doesn\'t mean ignoring difficult things.',
        'It means making sure difficult things don\'t have to be faced alone.'
      ]
    },
    {
      title: 'Preparing for the Next Stage',
      paragraphs: [
        'Six, seven, and eight can feel like such a special window.',
        'Your child is becoming more independent, but they still need your guidance in so many ways.',
        'Over the next several years, that independence will continue to grow.',
        'Their bodies will change.',
        'Friendships may become more complicated.',
        'Technology will play a larger role.',
        'Their questions about relationships, sexuality, and growing up will become deeper.',
        'You don\'t have to prepare for all of that today.',
        'You\'re preparing the relationship that will carry you through it.',
        'Every conversation you\'re having now is laying a foundation for the conversations you\'ll have later.'
      ]
    },
    {
      title: 'A Christian Perspective',
      paragraphs: [
        'As Christian parents, we want our children to know God\'s truth but we also want them to understand the grace and love that surround it.',
        'Throughout Scripture, we see a God who invites us to come to Him honestly. We don\'t have to hide our questions, our struggles, or even our mistakes from Him.',
        'That\'s something we can model in our homes too.',
        'You might tell your child: "God loves you, and there is nothing you could ever ask me that would make me stop loving you. Even if you make a mistake or something happens that you\'re afraid to tell me about, I want you to come to me. We can talk about it, pray about it, and figure out what to do together."',
        'That doesn\'t mean every choice is the right choice or that boundaries and consequences disappear.',
        'It means love comes before the lecture.',
        'As your child grows, you can also begin helping them understand why your family believes what it believes.',
        'Instead of only saying: "Because that\'s our rule," you might say:',
        '"Our family believes God created us with purpose, and we want the choices we make to reflect the way He asks us to love and respect ourselves and other people."',
        'And when your child has a question you aren\'t sure how to answer, you can model something else:',
        '"That\'s a really good question. Let\'s think about what we know, what the Bible teaches us, and what we can learn together."',
        'You don\'t have to be afraid of your child\'s questions.',
        'Questions can become opportunities to help faith grow from something your child has simply been told into something they\'re beginning to understand.',
        'Our goal isn\'t simply to raise children who can repeat what their parents believe.',
        'We want to raise children who know they can seek truth, ask hard questions, receive grace when they stumble, and grow in wisdom as their faith becomes increasingly their own.',
        'Truth gives them direction. Grace gives them somewhere to return. And love keeps the door open.'
      ]
    },
    {
      title: 'Key Takeaway',
      paragraphs: [
        'If there\'s one thing we hope you remember from this course, let it be this:',
        'You don\'t need to have every answer. You need to keep the door open.',
        'Keep listening.',
        'Keep asking questions.',
        'Keep telling the truth.',
        'Keep showing up.',
        'Because every time your child comes to you and is met with love, honesty, and calm guidance, you\'re reinforcing something they\'ll carry with them:',
        '"I can bring the hard things here."'
      ]
    },
    {
      title: 'Wrapping Up',
      paragraphs: [
        'As we close this course, remember that these five talks were never meant to prepare you for one perfect conversation.',
        'They were meant to help you begin hundreds of small ones.',
        'Your child\'s questions will change.',
        'Their body will change.',
        'Their friendships will change.',
        'And the world around them will continue to change too.',
        'But through all of it, you can remain something steady:',
        'A parent who listens.',
        'A parent who tells the truth.',
        'A parent who leads with both wisdom and grace.',
        'And a parent whose door remains open.',
        'You don\'t have to know exactly what every stage will bring.',
        'The truth stays consistent. The depth grows with your child.',
        'And when the next question comes, you\'ll be ready to meet them there.',
        'Thank you for allowing Bright Talks to walk alongside your family during this stage.',
        'Keep talking.',
        'Keep listening.',
        'And most importantly keep the door open.',
        'We\'ll see you in the next stage of Bright Talks.'
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
        heroVisual: { type: 'promo' },
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
          type: 'video',
          src: talk1VideoSrc
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
        availability: 'ready',
        title: 'Talk 2: Boundaries & Safety',
        summary:
          'Teach boundaries, safe and unsafe touch, consent in daily life, and who children can tell when something feels wrong.',
        duration: '7m',
        audioDuration: '06:58',
        readScript: talk2ReadScript,
        heroVisual: {
          type: 'video',
          src: talk2VideoSrc
        },
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
        availability: 'ready',
        title: 'Talk 3: Reproduction',
        summary:
          'Answer “where do babies come from?” with simple, factual, warm language suited to ages 3 to 6.',
        duration: '5m',
        audioDuration: '04:35',
        readScript: talk3ReadScript,
        heroVisual: {
          type: 'video',
          src: talk3VideoSrc
        },
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
        availability: 'ready',
        title: 'Talk 4: Porn & Inappropriate Images',
        summary:
          'Prepare calm responses if your child sees confusing images or videos online or elsewhere without fear or shame.',
        duration: '5m',
        audioDuration: '05:27',
        readScript: talk4ReadScript,
        heroVisual: {
          type: 'video',
          src: talk4VideoSrc
        },
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
        availability: 'ready',
        title: 'Talk 5: Continuing the Conversation',
        summary:
          'Build habits and scripts so body-safety talks stay normal, warm, and open as your child grows.',
        duration: '5m',
        audioDuration: '05:25',
        readScript: talk5ReadScript,
        heroVisual: {
          type: 'video',
          src: talk5VideoSrc
        },
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

    var welcomeLesson = lessons[0];
    var talkLessons = lessons.slice(1);
    var ages68 = buildAges68CourseParts(sa);

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
      lessonCount: lessons.length + 1 + ages68.talkLessons.length,
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
          id: 'm-ey-getting-started',
          title: 'Ages 3–6 · Getting Started',
          objective: 'Meet Bright Talks and see how this early-years path is organized.',
          lessons: [welcomeLesson]
        },
        {
          id: 'm-ey-parent-talks',
          title: 'Ages 3–6 · Parent Talks',
          objective:
            'Move through bodies, boundaries, reproduction, online safety, and keeping conversations going.',
          lessons: talkLessons
        },
        {
          id: 'm-mc-getting-started',
          title: 'Ages 6–8 · Getting Started',
          objective: 'Orient to the Ages 6–8 path and how to use each talk.',
          lessons: [ages68.welcomeLesson]
        },
        {
          id: 'm-mc-parent-talks',
          title: 'Ages 6–8 · Parent Talks',
          objective:
            'Walk through curiosity, peer conversations, reproduction questions, safety, and ongoing trust.',
          lessons: ages68.talkLessons
        }
      ]
    };
  }

  function buildAges68CourseParts(sa) {
    var welcomeLesson = splitLesson({
      id: 'mc-welcome',
      title: 'Welcome Video',
      summary:
        'Meet the Ages 6–8 path and see how growing curiosity, friendships, and bigger questions open the door for ongoing conversations.',
      duration: '3 min',
      audioDuration: '03:00',
      audioUrl: welcomeAudio,
      heroVisual: { type: 'promo' },
      sections: [
        {
          title: 'Talk Objectives',
          type: 'objectives',
          bullets: [
            'Understand what this middle-childhood course covers for ages 6 to 8.',
            'See how each talk builds trust as children hear more voices outside the home.',
            'Feel ready to keep answering questions with calm honesty.'
          ]
        },
        {
          title: 'What You Will Learn',
          type: 'prose',
          paragraphs: [
            'This course walks through five parent talks: growing bodies and curiosity, things kids hear from friends, questions about babies and sex, boundaries and secrets, and keeping the door open.',
            'Each talk includes short video (as published), parent-friendly guidance, optional audio, and a readable script. Move at your child’s pace—there is no perfect one-time conversation.',
            'Your goal is a relationship where hard questions still feel safe to bring home.'
          ]
        },
        {
          title: 'How to Use This Course',
          type: 'prose',
          paragraphs: [
            'Watch the welcome, then work through the talks in order or jump to what your family needs now.',
            'Practice small check-ins in ordinary moments—the car, bedtime, after school.',
            'Ages 6–8 talk videos will appear in Watch mode as soon as Heidi’s encodes are linked. Until then, use Read mode for the full script.'
          ]
        }
      ]
    });

    var talks = [
      {
        id: 'mc-talk-1',
        title: 'Talk 1: Growing Bodies & Growing Curiosity',
        summary:
          'Respond calmly when children notice body differences, ask new questions, and want more privacy.',
        readScript: mcTalk1ReadScript,
        image: middleChildhoodLessonImages[0],
        objectives: [
          'Treat growing curiosity as connection, not a problem to shut down.',
          'Give simple, matter-of-fact answers about body differences and change.',
          'Ask follow-up questions that keep the conversation open.'
        ]
      },
      {
        id: 'mc-talk-2',
        title: 'Talk 2: When Kids Hear Things From Friends',
        summary:
          'Respond with curiosity—not panic—when a child brings home unexpected words or ideas.',
        readScript: mcTalk2ReadScript,
        image: middleChildhoodLessonImages[1],
        objectives: [
          'Pause and learn what your child actually heard and understands.',
          'Correct gently when something is inaccurate or too mature.',
          'Teach peer boundaries without teaching fear of friends.'
        ]
      },
      {
        id: 'mc-talk-3',
        title: 'Talk 3: Questions About Babies, Sex & Where We Come From',
        summary:
          'Answer reproduction questions simply and truthfully without oversharing or shutting down.',
        readScript: mcTalk3ReadScript,
        image: middleChildhoodLessonImages[2],
        objectives: [
          'Match the depth of your answer to the question being asked.',
          'Use calm, accurate language about babies and growing up.',
          'Leave the door open for follow-up questions.'
        ]
      },
      {
        id: 'mc-talk-4',
        title: 'Talk 4: Boundaries, Secrets & Staying Safe',
        summary:
          'Strengthen body safety language: privacy, surprises vs secrets, and telling a trusted adult.',
        readScript: mcTalk4ReadScript,
        image: middleChildhoodLessonImages[3],
        objectives: [
          'Practice speak up, step away, and tell a trusted adult.',
          'Distinguish surprises from unsafe secrets.',
          'Respond with calm support if a child shares something hard.'
        ]
      },
      {
        id: 'mc-talk-5',
        title: 'Talk 5: Keeping the Door Open',
        summary:
          'Build everyday habits of listening and trust so bigger preteen conversations still come to you.',
        readScript: mcTalk5ReadScript,
        image: middleChildhoodLessonImages[4],
        objectives: [
          'Use small moments to reinforce “you can tell me.”',
          'Listen before reacting when something unexpected comes up.',
          'Prepare the relationship that will carry into the next stage.'
        ]
      }
    ];

    var talkLessons = talks.map(function (talk) {
      return splitLesson({
        id: talk.id,
        availability: 'ready',
        title: talk.title,
        summary: talk.summary,
        duration: 'Soon',
        audioDuration: '00:00',
        readScript: talk.readScript,
        heroVisual: {
          type: 'image',
          src: talk.image,
          alt: talk.title,
          pendingVideo: true
        },
        sections: [
          {
            title: 'Talk Objectives',
            type: 'objectives',
            bullets: talk.objectives
          },
          {
            title: 'Parent-Facing Guidance',
            type: 'prose',
            paragraphs: [
              talk.summary,
              'Watch mode shows a placeholder until Heidi’s Ages 6–8 video is uploaded. Use Read mode for the full script now.'
            ]
          }
        ]
      });
    });

    return {
      welcomeLesson: welcomeLesson,
      talkLessons: talkLessons
    };
  }

  function buildMiddleChildhoodCourse(sa) {
    var ages68 = buildAges68CourseParts(sa);

    return {
      id: 'bt-middle-childhood',
      title: 'Growing Up: Ages 6 to 8',
      topic: 'Growing Up',
      audience: 'Parents of Ages 6 to 8',
      level: 'Core',
      description:
        'Five parent talks for ages 6 to 8: growing curiosity, friends’ voices, reproduction questions, boundaries, and keeping trust open.',
      outcome:
        'Build confidence leading age-appropriate talks as your child’s world expands beyond home.',
      duration: 'Coming soon',
      lessonCount: 1 + ages68.talkLessons.length,
      progress: 0,
      completed: false,
      heroImage: courseHeroImages.middleChildhood,
      playerEntry: { module: 0, lesson: 0 },
      modules: [
        {
          id: 'm-mc-getting-started',
          title: 'Ages 6–8 · Getting Started',
          objective: 'Orient to the Ages 6–8 path and how to use each talk.',
          lessons: [ages68.welcomeLesson]
        },
        {
          id: 'm-mc-parent-talks',
          title: 'Ages 6–8 · Parent Talks',
          objective:
            'Walk through curiosity, peer conversations, reproduction questions, safety, and ongoing trust.',
          lessons: ages68.talkLessons
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
