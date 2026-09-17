// QA Learning Hub - Data
const CATEGORIES = [
  { id:'qa-fundamentals', name:'QA Fundamentals', icon:'🧩', desc:'Core concepts every QA must know' },
  { id:'agile', name:'Agile & SDLC', icon:'🔄', desc:'How software is built and QA role' },
  { id:'test-design', name:'Test Design Techniques', icon:'🎯', desc:'Smart ways to design tests' },
  { id:'functional', name:'Functional & Domain Testing', icon:'✈️', desc:'Real app features like payments, login, QR' },
  { id:'api', name:'API Testing', icon:'🔌', desc:'HTTP, status codes, Postman, REST' },
  { id:'security', name:'Security Testing', icon:'🔒', desc:'Auth, IDOR, XSS, JWT, OWASP' },
  { id:'ui', name:'UI / UX Testing', icon:'🎨', desc:'Layout, usability, Android vs iOS' },
  { id:'performance', name:'Performance & JMeter', icon:'⚡', desc:'Load, stress, metrics, JMeter' },
  { id:'database', name:'Database & SQL', icon:'🗄️', desc:'Tables, CRUD, data validation' },
  { id:'process', name:'Process & QA Mindset', icon:'🧠', desc:'RTM, severity, RCA, risk, thinking' },
];

function mkTopic(id, title, categoryId, overrides={}){
  const cat = CATEGORIES.find(c=>c.id===categoryId);
  const base = {
    id, title, categoryId, categoryName: cat?cat.name:categoryId,
    level: overrides.level||'beginner',
    explanation: overrides.explanation || `In simple words, ${title} is about understanding how this concept works in real software. Basically, it's a way to make sure the app behaves correctly for users.`,
    whyMatters: overrides.whyMatters || `As a QA, you need ${title} because it helps you find issues before users do. It makes your testing smarter and more focused.`,
    realExample: overrides.realExample || `Think of an eSewa app. When you use ${title}, you are checking a real user flow like login or payment. For example, if ${title} fails, user can't complete their task.`,
    qaExample: overrides.qaExample || `As a QA, I would check: 1) Normal happy path, 2) Invalid inputs, 3) Edge cases, 4) What happens when network fails. I would write test cases for each.`,
    mistakes: overrides.mistakes || ["Only testing happy path and missing negative cases","Not checking error messages properly","Assuming backend will handle it","Forgetting to test on slow network"],
    revisionPoints: overrides.revisionPoints || [`What is ${title} in one line?`,`Why is it important for QA?`,`One real example`,`One common mistake`],
    practice: overrides.practice || { question:`If you had to test ${title} in an eSewa login page, what 5 things would you test?`, hint:"Think: valid, invalid, empty, boundary, network, security" },
    quiz: overrides.quiz || [{ q:`What is the main purpose of ${title}?`, options:[`To make testing more thorough`,`To make app look pretty`,`To write code faster`,`To delete bugs automatically`], answer:0, explanation:`${title} helps QA test thoroughly and catch issues early.` }]
  };
  return {...base, ...overrides, id, title, categoryId, categoryName: cat?cat.name:categoryId };
}

const TOPICS = [
  mkTopic('what-is-qa','What is QA?','qa-fundamentals',{
    level:'beginner',
    explanation:`In simple words, QA means Quality Assurance. Basically, QA is the process of making sure the software works correctly and gives a good experience to users. QA is not just finding bugs, it's about preventing bugs from happening.`,
    whyMatters:`If there is no QA, users will face broken features, wrong payments, or app crashes. As a QA, you are the gatekeeper for quality.`,
    realExample:`Imagine eSewa. You send Rs. 500 to a friend. QA makes sure the money actually goes, balance updates, notification comes, and history shows correct entry.`,
    qaExample:`As a QA, I would check: login works, payment deducts correctly, error message shows if balance low, app doesn't crash on slow internet.`,
    mistakes:["Thinking QA is only clicking around","Thinking QA = bug hunting only, not prevention","Not understanding user perspective"],
    revisionPoints:["QA = process to ensure quality, not just testing","QA is prevention, QC is detection","QA involved from start of SDLC","QA thinks like user + developer"],
    practice:{question:"You are testing eSewa login. How would you explain QA role to a developer?", hint:"Prevent bugs, improve process, ensure user happiness"},
    quiz:[
      {q:"What is QA mainly about?", options:["Ensuring quality throughout process","Only finding bugs at end","Writing code","Designing UI"], answer:0, explanation:"QA is about ensuring quality throughout, not just at end."},
      {q:"True/False: QA is same as testing.", options:["True","False"], answer:1, explanation:"Testing is part of QA. QA is broader – process, prevention, standards."}
    ]
  }),
  mkTopic('qa-vs-qc','QA vs QC vs Testing','qa-fundamentals',{
    explanation:`QA = Quality Assurance – focuses on process to prevent defects. QC = Quality Control – focuses on product to find defects. Testing = executing the app to find bugs. Basically: QA says 'let's build it right', QC says 'let's check if we built it right'.`,
    whyMatters:`In interviews this is very common. Also in real work you need to know you are doing QA (improving process) not just QC.`,
    realExample:`eSewa team: QA sets checklist for payment testing, QC reviews payment feature, Testing actually tries payments with valid/invalid amounts.`,
    qaExample:`As QA I would: create test plan (QA), review requirements (QA), execute tests (Testing), log bugs and verify fixes (QC).`,
    revisionPoints:["QA = process oriented, prevention","QC = product oriented, detection","Testing = part of QC","QA starts early, QC after build"],
  }),
  mkTopic('sdlc','SDLC','qa-fundamentals',{
    explanation:`SDLC = Software Development Life Cycle. Steps: Requirement -> Design -> Development -> Testing -> Deployment -> Maintenance. Basically it's the journey of an idea becoming an app.`,
    whyMatters:`You need to know where QA fits. QA is involved from requirement phase, not just testing phase.`,
    realExample:`Airline app: Requirement – user can search flights. Design – UI mockups. Dev – build search. Testing – QA tests search. Deploy – release. Maintenance – fix issues.`,
    revisionPoints:["SDLC phases: Req, Design, Dev, Test, Deploy, Maintain","QA involved from day 1","Different models: Waterfall, Agile, V-model"],
  }),
  mkTopic('stlc','STLC','qa-fundamentals',{
    explanation:`STLC = Software Testing Life Cycle. Phases: Requirement Analysis, Test Planning, Test Case Design, Environment Setup, Test Execution, Test Closure. It's QA's own cycle inside SDLC.`,
    revisionPoints:["STLC is QA's workflow","Starts with understanding requirements","Ends with test closure report","Entry/Exit criteria for each phase"],
  }),
  mkTopic('functional-testing','Functional Testing','qa-fundamentals',{
    explanation:`Functional testing checks if feature does what it should do. Does login actually login? Does payment actually pay?`,
    realExample:`In eSewa, functional test: Enter valid phone + MPIN -> should login. Enter wrong MPIN -> should show error.`,
    revisionPoints:["Checks functionality against requirement","Types: smoke, sanity, regression, UAT","Based on business logic"],
  }),
  mkTopic('non-functional-testing','Non-functional Testing','qa-fundamentals',{
    explanation:`Non-functional is about HOW the app works, not WHAT. How fast? How secure? How usable? Performance, security, usability are non-functional.`,
    revisionPoints:["Performance, security, usability","How well vs what","Equally important as functional"],
  }),
  mkTopic('regression-testing','Regression Testing','qa-fundamentals',{
    explanation:`Regression means after fixing a bug or adding new feature, check that old features still work. Basically 'did we break anything else?'`,
    realExample:`Dev fixes QR scan bug. You retest QR + also test login, payment, history to ensure nothing broke.`,
    revisionPoints:["Retest fixed bug + related areas","Can be manual or automated","Very important before release"],
  }),
  mkTopic('smoke-testing','Smoke Testing','qa-fundamentals',{
    explanation:`Smoke testing is quick check: is build stable enough to test deeply? Like checking if car starts before long drive. Also called build verification.`,
    revisionPoints:["Quick, shallow, critical paths only","If smoke fails, reject build","Done on new build"],
  }),
  mkTopic('sanity-testing','Sanity Testing','qa-fundamentals',{
    explanation:`Sanity is narrow and deep check after small fix. Smoke = wide shallow, Sanity = narrow deep. You test only fixed area + related.`,
    revisionPoints:["After bug fix or minor change","Focused testing","If sanity fails, bug not fixed properly"],
  }),
  mkTopic('exploratory-testing','Exploratory Testing','qa-fundamentals',{
    explanation:`Exploratory = learning + testing at same time. No pre-written test cases. You explore app like real user and try to break it. Very useful for new features.`,
    revisionPoints:["No scripts, use your thinking","Good for finding unexpected bugs","Time-boxed sessions"],
  }),

  // Agile
  mkTopic('agile','Agile','agile',{
    explanation:`Agile is a way of building software in small iterations, not all at once. Basically build small, get feedback, improve, repeat. Main idea: adapt to change quickly.`,
    whyMatters:`Most companies use Agile. QA must understand sprints, stories, standups.`,
    realExample:`Airline app: Instead of building whole app in 6 months, build login in sprint 1, search in sprint 2, payment in sprint 3. QA tests each sprint.`,
    revisionPoints:["Iterative & incremental","Customer collaboration","Responding to change","Working software over docs"],
  }),
  mkTopic('scrum','Scrum','agile',{
    explanation:`Scrum is most popular Agile framework. Roles: Product Owner, Scrum Master, Dev Team. Events: Sprint, Sprint Planning, Daily Standup, Sprint Review, Retrospective. Artifacts: Product Backlog, Sprint Backlog, Increment.`,
    qaExample:`As QA in Scrum: attend planning to clarify stories, write acceptance criteria, test within sprint, join retrospective to improve.`,
    revisionPoints:["Sprint = 1-4 weeks","Daily standup 15 min","Backlog = to-do list","QA part of dev team"],
  }),
  mkTopic('kanban','Kanban','agile',{ explanation:`Kanban uses a board with columns: To Do, In Progress, Done. You limit work in progress. No fixed sprints, continuous flow. Good for support/maintenance.` }),
  mkTopic('xp','Extreme Programming (XP)','agile',{ explanation:`XP focuses on technical excellence: pair programming, TDD, continuous integration, small releases. QA role includes writing tests early and pairing with devs.` }),
  mkTopic('lean','Lean Software Development','agile',{ explanation:`Lean says eliminate waste, deliver fast, build quality in. Idea from Toyota. 7 principles: eliminate waste, amplify learning, decide late, deliver fast, empower team, build integrity, see whole.` }),
  mkTopic('crystal','Crystal','agile',{ explanation:`Crystal says different projects need different processes based on team size and criticality. Focus on people, communication, frequent delivery.` }),
  mkTopic('fdd','Feature-Driven Development (FDD)','agile',{ explanation:`FDD builds by features. Steps: develop overall model, build feature list, plan by feature, design by feature, build by feature. Good for large teams.` }),
  mkTopic('scrumban','Scrumban','agile',{ explanation:`Scrumban = Scrum + Kanban. Use Scrum roles and Kanban board flow. Flexible, good for teams transitioning.` }),
  mkTopic('dsdm','DSDM','agile',{ explanation:`DSDM = Dynamic Systems Development Method. Full project lifecycle with focus on business need, on-time delivery, MoSCoW prioritization.` }),
  mkTopic('safe','SAFe','agile',{ explanation:`SAFe = Scaled Agile Framework for large enterprises with many teams. Organizes work into Program Increments, Agile Release Train.` }),
  mkTopic('less','LeSS','agile',{ explanation:`LeSS = Large Scale Scrum. Simple scaling of Scrum to multiple teams working on same product.` }),
  mkTopic('agile-principles','Agile Principles','agile',{ explanation:`12 Agile principles from manifesto. Key: satisfy customer, welcome change, deliver frequently, daily collaboration, motivated individuals, face-to-face, working software, sustainable pace, technical excellence, simplicity, self-organizing, reflect and adjust.` }),

  // Test Design
  mkTopic('test-scenarios','Test Scenarios','test-design',{
    explanation:`Test Scenario = high-level what to test. Example: 'Verify login with valid credentials'. It's a story, not steps.`,
    revisionPoints:["High level","What to test","One scenario can have many test cases"],
  }),
  mkTopic('test-cases','Test Cases','test-design',{
    explanation:`Test Case = detailed steps: preconditions, steps, test data, expected result, actual result. Scenario is idea, test case is detailed execution.`,
    revisionPoints:["Detailed steps","Includes test data and expected result","Traceable to requirement"],
  }),
  mkTopic('equivalence-partitioning','Equivalence Partitioning','test-design',{
    explanation:`Divide inputs into groups where each group should behave same. Test one from each group. If amount allowed 10 to 50000, partitions: valid 10-50000, invalid <10, invalid >50000, invalid non-numeric.`,
    realExample:`eSewa amount field: valid partition 10-50000, you test 100 (one value). Invalid partitions: 5, 60000, abc, empty.`,
    qaExample:`As QA I would: Identify partitions, pick one value per partition, ensure error messages correct for invalid.`,
    revisionPoints:["Valid + invalid partitions","Reduces test cases but covers all types","Use with boundary value"],
    quiz:[{q:"Amount allowed 10-50000. Which is valid equivalence?", options:["5","100","60000","abc"], answer:1, explanation:"100 lies within 10-50000 valid range."}]
  }),
  mkTopic('bva','Boundary Value Analysis','test-design',{
    explanation:`Bugs often at boundaries. If range 10-50000, boundaries are 9,10,11 and 49999,50000,50001. Test those edge values.`,
    realExample:`Test eSewa with 9 (should fail), 10 (pass), 11 (pass), 49999, 50000, 50001.`,
    revisionPoints:["Test at min-1, min, min+1, max-1, max, max+1","Finds off-by-one errors","Combine with equivalence"],
  }),
  mkTopic('decision-table','Decision Table','test-design',{
    explanation:`When different combinations of conditions give different results, use table. Example: login with conditions: valid user?, valid password?, account locked? Each combo has result.`,
    revisionPoints:["Conditions + Actions","Covers all combos","Good for business rules"],
  }),
  mkTopic('state-transition','State Transition','test-design',{
    explanation:`Some apps have states. Example: eSewa login: Logged Out -> Enter credentials -> OTP sent -> Verified -> Logged In. Test valid transitions and invalid like trying to pay without login.`,
    revisionPoints:["States and transitions","Valid and invalid transitions","Diagram helps"],
  }),
  mkTopic('error-guessing','Error Guessing','test-design',{
    explanation:`Use experience to guess where bugs hide. Like empty fields, double click pay button, back button during payment, copy-paste with spaces.`,
    revisionPoints:["Experience based","Ad-hoc but powerful","Good for exploratory"],
  }),

  // Functional domains
  mkTopic('authentication-testing','Authentication Testing','functional',{
    explanation:`Testing login, logout, forgot password, reset MPIN. Check valid, invalid, empty, locked account, OTP expiry, session.`,
    realExample:`eSewa login: correct MPIN -> success, wrong 5 times -> account locked, OTP expired after 2 min -> resend needed.`,
    revisionPoints:["Valid/invalid/empty","OTP expiry, resend","Account lock after attempts","Session timeout"],
  }),
  mkTopic('qr-testing','QR Code Testing','functional',{
    explanation:`Test QR scan: valid, invalid, expired, static vs dynamic, small/large, damaged, distance, lighting, gallery, screenshot, permission, network fail.`,
    realExample:`Payment QR: valid QR -> pay screen, expired QR -> error 'QR expired', no camera permission -> ask permission.`,
    revisionPoints:["Valid/invalid/expired","Static vs dynamic","Camera permission","Network interruption"],
  }),
  mkTopic('payment-testing','Payment Testing','functional',{
    explanation:`Payment testing is critical: valid amount, zero, negative, min/max, insufficient balance, duplicate, network fail, wallet update, history, notification.`,
    realExample:`User pays 100: bank deducted but wallet not updated -> bug. Must check DB, API, UI all consistent.`,
    revisionPoints:["Amount boundaries","Balance checks","Duplicate prevention","Network failure handling"],
  }),
  mkTopic('network-testing','Network Testing','functional',{
    explanation:`App behavior on no internet, slow, intermittent, switching WiFi to data, timeout, retry, duplicate request.`,
    realExample:`During eSewa payment, switch off internet -> should show 'no internet' not crash, should not deduct money.`,
    revisionPoints:["No/slow/intermittent","Switching networks","Timeout & retry","Idempotency"],
  }),
  mkTopic('chatbot-testing','Chatbot Testing','functional',{
    explanation:`Test chatbot: intent recognition, flow, context, relevance, accuracy, consistency, fallback, handoff, security, adversarial.`,
    realExample:`User: 'My payment failed'. Bot should understand intent, ask transaction ID, not repeat same answer, fallback to human if confused.`,
    revisionPoints:["Intent + entities","Context memory","Fallback handling","Security – no sensitive data leak"],
  }),
  mkTopic('ui-testing','UI Testing','ui',{
    explanation:`Check layout, alignment, fonts, colors, buttons, error messages, loading, empty states, responsive, navigation, usability, accessibility.`,
    revisionPoints:["Pixel perfection vs spec","Different screen sizes","Error and empty states"],
  }),
  mkTopic('android-ios','Android vs iOS Testing','ui',{
    explanation:`Same feature should work on both but UI differs. Check navigation (back button Android), permissions, notifications, font, gestures.`,
    revisionPoints:["OS specific behaviors","Device fragmentation","Human Interface vs Material Design"],
  }),
  mkTopic('accessibility','Accessibility','ui',{
    explanation:`App usable for all: screen reader, color contrast, font scaling, keyboard navigation.`,
    revisionPoints:["TalkBack/VoiceOver","Contrast ratio","Focus order"],
  }),
  mkTopic('usability','Usability','ui',{
    explanation:`How easy app is to use. Is flow intuitive? Are errors clear? Is CTA obvious?`,
    revisionPoints:["Intuitive flow","Clear error messages","Consistency"],
  }),

  // API
  mkTopic('api-fundamentals','API Fundamentals','api',{
    explanation:`API = way for apps to talk. Frontend asks backend via API. Like waiter between customer and kitchen.`,
    revisionPoints:["Request -> Response","Client-Server","Uses HTTP"],
  }),
  mkTopic('http-methods','HTTP Methods','api',{
    explanation:`GET = fetch data, POST = create, PUT = full update, PATCH = partial update, DELETE = delete. Simple: GET to see flights, POST to book flight.`,
    revisionPoints:["GET safe, idempotent","POST creates, not idempotent","PUT vs PATCH","DELETE removes"],
    quiz:[{q:"Which method to create a new booking?", options:["GET","POST","DELETE","PUT"], answer:1, explanation:"POST is used to create new resource."}]
  }),
  mkTopic('http-status-codes','HTTP Status Codes','api',{
    explanation:`2xx success (200 OK, 201 Created, 204 No Content), 4xx client error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many), 5xx server error (500 Internal, 502 Bad Gateway, 503 Service Unavailable).`,
    revisionPoints:["2xx success","4xx client mistake","5xx server problem","401 vs 403: auth vs permission"],
    quiz:[{q:"API returns 201. What does it mean?", options:["Created successfully","Bad request","Unauthorized","Server error"], answer:0, explanation:"201 means resource created."}]
  }),
  mkTopic('headers','Headers','api',{ explanation:`Headers are metadata of request/response: Content-Type, Authorization, Accept, etc. Like envelope info.` }),
  mkTopic('json','JSON','api',{ explanation:`JSON = {\"key\":\"value\"} format for data exchange. Lightweight, readable. QA checks valid JSON, fields, types.` }),
  mkTopic('xml','XML','api',{ explanation:`XML uses tags <user><name>Ram</name></user>. Older but still used in SOAP.` }),
  mkTopic('auth','Authentication','api',{ explanation:`Authentication = who are you? Verify identity via password, OTP, token.` }),
  mkTopic('authorization','Authorization','api',{ explanation:`Authorization = what can you do? After login, can you access other user's data? That's authorization check.` }),
  mkTopic('rest','REST API','api',{ explanation:`REST uses HTTP methods, stateless, resource based URLs like /users/123. Most common.` }),
  mkTopic('soap','SOAP API','api',{ explanation:`SOAP uses XML, strict contract WSDL, heavier than REST. Used in banking.` }),
  mkTopic('websocket','WebSocket','api',{ explanation:`WebSocket = two-way continuous connection, good for chat, live flight status.` }),
  mkTopic('postman','Postman','api',{ explanation:`Tool to test APIs: create requests, collections, environments, write assertions.` }),
  mkTopic('collections','Collections','api',{ explanation:`Collection = folder of API requests grouped by feature, like 'eSewa Login APIs'.` }),
  mkTopic('environments','Environments','api',{ explanation:`Environment = variables for different setups: dev, staging, prod. Base URL changes but requests same.` }),
  mkTopic('variables','Variables','api',{ explanation:`Variables store dynamic values: {{baseUrl}}, {{token}}. Reuse across requests.` }),
  mkTopic('scripts','Scripts','api',{ explanation:`Pre-request scripts run before request (e.g., generate timestamp), Test scripts run after (assertions).` }),
  mkTopic('assertions','Assertions','api',{ explanation:`Assertions check response: status 200, response time < 500ms, body contains expected field.` }),
  mkTopic('runner','Runner','api',{ explanation:`Runner runs collection with many iterations, data files, useful for regression.` }),

  // Security
  mkTopic('api-security','API Security','security',{ explanation:`Check auth, authorization, data exposure, injection, rate limiting.` }),
  mkTopic('idor','IDOR','security',{
    explanation:`IDOR = Insecure Direct Object Reference. Changing ID to access other's data. /api/user/123 -> change to 124 and see other user's info. QA must test.`,
    realExample:`eSewa transaction history: change transaction ID in URL, should NOT see other user's transaction.`,
    revisionPoints:["Change ID param","Should get 403 not other's data","Very critical bug"],
  }),
  mkTopic('sql-injection','SQL Injection','security',{ explanation:`Attacker injects SQL via input: ' OR '1'='1 . QA checks if input sanitized, error doesn't leak DB info.` }),
  mkTopic('xss','XSS','security',{ explanation:`XSS = injecting script into app. If comment field allows <script>alert(1)</script> and it executes, it's XSS. QA checks output encoding.` }),
  mkTopic('oauth','OAuth','security',{ explanation:`OAuth = login via Google/Facebook without sharing password. Token based delegation.` }),
  mkTopic('jwt','JWT','security',{ explanation:`JWT = JSON Web Token with header.payload.signature. Used for stateless auth. QA checks expiry, tampering, sensitive data in payload.` }),
  mkTopic('sensitive-data','Sensitive Data Exposure','security',{ explanation:`Check logs, responses don't expose password, MPIN, token, card number. MPIN should be masked.` }),

  // Performance
  mkTopic('performance-testing','Performance Testing','performance',{ explanation:`Check how fast and stable app is under load. Types: load, stress, spike, endurance, volume, scalability.` }),
  mkTopic('load-testing','Load Testing','performance',{ explanation:`Test with expected users, e.g., 100 users searching flights simultaneously.` }),
  mkTopic('stress-testing','Stress Testing','performance',{ explanation:`Push beyond limits to find breaking point. What happens at 1000 users when expected 100?` }),
  mkTopic('spike-testing','Spike Testing','performance',{ explanation:`Sudden spike: 10 users -> 500 users instantly, then back. Does app recover?` }),
  mkTopic('endurance-testing','Endurance Testing','performance',{ explanation:`Run load for long time (8 hours) to find memory leaks.` }),
  mkTopic('jmeter','JMeter','performance',{
    explanation:`JMeter tool to simulate many users: Test Plan -> Thread Group (users) -> HTTP Request -> Listeners (results) -> Assertions.`,
    realExample:`Create 10 threads, ramp-up 10 sec, loop 5 times = 50 requests to login API. Check response time, error %.`,
    revisionPoints:["Thread Group = users","Ramp-up = time to start all","Listener = results"],
  }),
  mkTopic('response-time','Response Time','performance',{ explanation:`Time from request to response. QA checks <2 sec for good UX. Includes network + server + processing.` }),
  mkTopic('latency','Latency','performance',{ explanation:`Delay before processing starts, often network delay.` }),
  mkTopic('throughput','Throughput','performance',{ explanation:`Requests handled per second. Higher is better. Example 100 TPS means 100 transactions per sec.` }),
  mkTopic('tps','TPS','performance',{ explanation:`Transactions Per Second – business transactions, e.g., payment per sec.` }),
  mkTopic('rps','RPS','performance',{ explanation:`Requests Per Second – HTTP requests, may be more than TPS.` }),
  mkTopic('error-rate','Error Rate','performance',{ explanation:`% of failed requests. Should be <1% ideally.` }),
  mkTopic('concurrent-users','Concurrent Users','performance',{ explanation:`Users active at same time. Different from total users.` }),
  mkTopic('cpu-util','CPU Utilization','performance',{ explanation:`How much CPU server uses. If 90%+ under load, may need scaling.` }),
  mkTopic('memory-util','Memory Utilization','performance',{ explanation:`RAM usage. Memory leak if keeps increasing.` }),
  mkTopic('p95','P95','performance',{
    explanation:`P95 = 95% of requests faster than this time. If P95 is 800ms, 95% users got response <800ms, 5% slower. Better than average because average hides slow users.`,
    realExample:`Average 300ms but P95 2 sec means 5% users suffer 2 sec+. Need to fix slow 5%.`,
    revisionPoints:["P95 = 95th percentile","More realistic than average","P99 = 99th percentile even stricter"],
  }),
  mkTopic('p99','P99','performance',{ explanation:`99% requests faster than P99. Shows worst 1% experience.` }),

  // DB
  mkTopic('database-testing','Database Testing','database',{ explanation:`Check data stored correctly, CRUD works, constraints enforced, API vs DB consistent.` }),
  mkTopic('sql-basics','SQL Basics','database',{ explanation:`SQL = language to talk to DB. SELECT reads, INSERT adds, UPDATE modifies, DELETE removes.` }),
  mkTopic('crud','CRUD','database',{ explanation:`Create (INSERT), Read (SELECT), Update (UPDATE), Delete (DELETE) – basic DB operations.` }),

  // Process
  mkTopic('severity','Severity','process',{
    explanation:`Severity = impact of bug on system. Critical (app crash, payment fail), Major (feature broken but workaround), Minor (UI glitch), Trivial (typo). Decided by QA.`,
    realExample:`eSewa payment deducts but wallet not updated = Critical severity.`,
    revisionPoints:["How bad is bug technically?","Critical/Major/Minor/Trivial","QA decides severity"],
  }),
  mkTopic('priority','Priority','process',{
    explanation:`Priority = how urgently bug should be fixed. High (fix now), Medium (fix in this sprint), Low (fix later). Decided by Product Owner/BA.`,
    revisionPoints:["How urgent to fix?","High/Medium/Low","Business decides priority"],
  }),
  mkTopic('severity-vs-priority','Severity vs Priority','process',{
    explanation:`High severity low priority: app logo broken on old Android 5 – severe visually but few users. Low severity high priority: company name typo on homepage – minor technically but high business impact.`,
    revisionPoints:["Severity = technical impact","Priority = business urgency","Can be different combinations"],
  }),
  mkTopic('rca','Root Cause Analysis','process',{
    explanation:`RCA = find actual cause not just symptom. Use 5 Whys: ask why 5 times. Example: login fails -> why? API timeout -> why? DB slow -> why? No index -> root cause.`,
    revisionPoints:["Symptom vs root cause","5 Whys technique","Prevents same bug again"],
  }),
  mkTopic('rtm','RTM','process',{ explanation:`RTM = Requirement Traceability Matrix: Requirement -> Test Case -> Execution -> Defect. Ensures all requirements tested.` }),
  mkTopic('entry-criteria','Entry Criteria','process',{ explanation:`Conditions to start testing: requirements ready, test env ready, build deployed, test data ready.` }),
  mkTopic('exit-criteria','Exit Criteria','process',{ explanation:`Conditions to stop testing: all critical tests passed, no high severity open bugs, test report ready.` }),
  mkTopic('bug-reporting','Bug Reporting','process',{
    explanation:`Good bug report: Title (clear), Description, Steps to Reproduce, Expected vs Actual (actual must be what you SAW, not repeat expected), Environment, Severity/Priority, Evidence (screenshot/video).`,
    revisionPoints:["Actual = observed behavior","Steps must be reproducible","Include evidence"],
  }),
  mkTopic('retesting','Retesting','process',{ explanation:`Retesting = test fixed bug again to confirm fix works. Specific to that bug.` }),
  mkTopic('regression','Regression','process',{ explanation:`Regression = after fix, test related areas to ensure no side effects.` }),
  mkTopic('risk-based','Risk-Based Testing','process',{ explanation:`Test high-risk areas first: payment, login, money transfer are high risk (business impact high). Profile, notifications low risk. Risk = probability * impact.` }),
  mkTopic('qa-thinking','QA Thinking','process',{ explanation:`Think Like a QA: What could go wrong? Negative, boundary, network, security, usability, accessibility, compatibility, performance, data consistency, duplicate actions.` }),
];

const FLASHCARDS = [
  {front:"What is HTTP 401?", back:"Usually means authentication required or failed. Check token/credentials."},
  {front:"Difference between Severity vs Priority?", back:"Severity = technical impact (QA decides). Priority = business urgency (PO decides). Can be High severity Low priority."},
  {front:"What is P95?", back:"95% of requests faster than this. Better than average to see real user pain. If P95 800ms, 5% slower than 800ms."},
  {front:"What is IDOR?", back:"Insecure Direct Object Reference – changing ID to access other's data. e.g., /user/123 -> /user/124 should be blocked."},
  {front:"Smoke vs Sanity?", back:"Smoke = quick wide check if build testable. Sanity = narrow deep check after fix."},
  {front:"GET vs POST?", back:"GET fetches, safe & idempotent. POST creates, not idempotent."},
  {front:"What is 201 status?", back:"Created successfully – new resource made."},
  {front:"Boundary values for 10-50000?", back:"9,10,11 and 49999,50000,50001"},
  {front:"What is RTM?", back:"Requirement Traceability Matrix – maps Requirement -> Test Case -> Execution -> Defect."},
  {front:"What is JWT?", back:"JSON Web Token – header.payload.signature, stateless auth, check expiry & tampering."},
  {front:"Load vs Stress?", back:"Load = expected users. Stress = beyond expected to find breaking point."},
  {front:"What is exploratory testing?", back:"Learning + testing simultaneously without scripts, find unexpected bugs."},
  {front:"Actual Result in bug report should be?", back:"What you actually observed, NOT repeat of expected. Be specific with error message."},
];

const DAILY_CHALLENGES = [
  {title:"Payment deducted but wallet not updated", prompt:"A user paid Rs. 500 via bank, bank deducted but eSewa wallet balance not updated. What would you test/investigate?", answer:"Check: 1) API response – success or fail? 2) DB transaction table – entry exists? 3) Wallet balance table – updated? 4) Logs for timeout/error 5) Idempotency – retry caused duplicate? 6) Webhook from bank received? 7) Network failure mid-way? 8) Reconciliation job? 9) Check history & notification."},
  {title:"Login with valid credentials fails sometimes", prompt:"Login works 80% time, fails 20% with 'Something went wrong'. What could be wrong?", answer:"Possible: API timeout, load balancer issue, DB connection pool exhausted, OTP service slow, race condition, cache issue, P95 high, check logs, check network, check concurrent users."},
  {title:"QR scan works on Android but not iOS", prompt:"Same QR scans on Android, fails on iOS. What to check?", answer:"Check camera permission handling iOS vs Android, QR library version, image resolution, focus, lighting handling, iOS security restrictions, different parsing logic, test on multiple iOS versions."},
  {title:"Search flights returns no results for valid route", prompt:"KTM to DEL, valid date, but no flights shown. Works in staging, not prod.", answer:"Check: env config, API endpoint, data – prod has flights? Cache? Date format/timezone? Authorization? Feature flag off in prod? Network? Check API response vs UI handling."},
  {title:"App crashes on double tap Pay button", prompt:"User double taps Pay quickly, app crashes. How to test & prevent?", answer:"Test duplicate request handling, disable button after first tap, idempotency key, check race condition, backend should handle duplicate, show loading state, debouncing."},
];

const PRACTICE_FEATURES = [
  {id:'esewa-login', name:'eSewa Login Page', desc:'Phone number + MPIN login', suggested:['Valid phone + valid MPIN -> success','Invalid phone format','Empty phone','Empty MPIN','Wrong MPIN','Account locked after 5 attempts','Forgot MPIN flow','MPIN masking','Session timeout','Login with slow/no internet','SQL injection in phone field','XSS in fields','Login button disabled until valid input','Keyboard handling','Biometric login if enabled']},
  {id:'airline-search', name:'Airline Search', desc:'From, To, Date, Passengers', suggested:['Valid from/to/date -> show flights','Same from and to -> error','Past date -> error','Empty fields validation','Swap from/to','Passenger count min 1 max 9','Infant without adult -> error','Search with no internet','Search API timeout handling','Special characters in city name','Auto-suggest for cities','Loading state while searching']},
  {id:'payment', name:'Payment / Transfer', desc:'Amount + MPIN + confirm', suggested:['Valid amount + MPIN -> success','Zero amount -> error','Negative amount','Below min Rs.10','Above max 50000','Insufficient balance','Invalid MPIN','MPIN attempts lock','Duplicate payment prevention','Network failure mid-payment','Wallet balance updates correctly','Transaction history entry','Notification received','Payment confirmation screen']},
  {id:'qr-scan', name:'QR Scan Payment', desc:'Scan QR to pay merchant', suggested:['Valid static QR -> pay screen','Valid dynamic QR with amount','Expired QR -> error','Invalid QR -> error','Damaged/blurry QR','Scan from gallery','Scan screenshot','No camera permission','Low light scan','Very small/large QR','Network fail during scan','API timeout after scan']},
];

const BUG_SCENARIOS = [
  {id:1, title:"Invalid password shows backend error", desc:"User enters invalid password on eSewa login and app shows 'NullPointerException at com.esewa...' instead of friendly message.", hint:"Check error handling, stack trace exposure"},
  {id:2, title:"Wallet balance mismatch", desc:"User had Rs. 1000, paid Rs. 200, history shows payment success but balance still shows Rs. 1000, not Rs. 800.", hint:"DB update, API response, UI refresh"},
  {id:3, title:"Flight search shows past date flights", desc:"User selects past date 2023-01-01, app still shows flights and allows booking.", hint:"Validation missing, boundary"},
  {id:4, title:"QR scanner freezes", desc:"Open QR scanner, deny camera permission, app freezes white screen, no message.", hint:"Permission handling"},
];

const API_EXERCISES = [
  {q:"An API returns HTTP 201. What does this usually mean?", options:["Resource created successfully","Bad request","Server error","No content"], answer:0, explanation:"201 Created – POST success that created something."},
  {q:"Which method would you normally use to update an existing resource fully?", options:["GET","POST","PUT","DELETE"], answer:2, explanation:"PUT for full update, PATCH for partial."},
  {q:"You GET /users/9999 and get 404. What does it mean?", options:["User not found","Unauthorized","Server crashed","Created"], answer:0, explanation:"404 Not Found – resource doesn't exist."},
  {q:"API returns 429. What should QA check?", options:["Rate limiting – too many requests","Authentication failed","Payment required","Success"], answer:0, explanation:"429 Too Many Requests – rate limit hit."},
  {q:"Which header usually carries auth token?", options:["Authorization","Content-Type","Accept","Cache-Control"], answer:0, explanation:"Authorization: Bearer <token>"},
];

const INTERVIEW_QUESTIONS = [
  {category:'QA Fundamentals', q:"What is difference between QA and QC?", sample:"QA is process to prevent defects, focuses on process. QC is to find defects in product. Testing is part of QC. QA starts early."},
  {category:'QA Fundamentals', q:"What is regression testing?", sample:"After fixing bug or adding feature, test old features to ensure nothing broke. Example: fix login bug, also test payment, search still work."},
  {category:'API Testing', q:"What is difference between 401 and 403?", sample:"401 Unauthorized – you are not authenticated, login needed. 403 Forbidden – you are authenticated but not allowed to access."},
  {category:'API Testing', q:"What is API testing?", sample:"Testing APIs directly without UI. Check request/response, status codes, headers, JSON, auth, error handling, performance."},
  {category:'Security', q:"What is IDOR?", sample:"Insecure Direct Object Reference – attacker changes ID to access other's data. /api/user/123 to /124 should be blocked."},
  {category:'Performance', q:"What is P95?", sample:"95th percentile response time. 95% users faster than this. Better than average to see real pain for slow users."},
  {category:'Manual', q:"Severity vs Priority with example?", sample:"Severity = technical impact. Priority = business urgency. Example high severity low priority: crash on old Android 5 rare. Low severity high priority: typo in company name on homepage."},
  {category:'SQL', q:"What is difference between WHERE and HAVING?", sample:"WHERE filters rows before grouping, HAVING filters after GROUP BY."},
];

const QUIZ_BANK = [
  {q:"What is smoke testing?", options:["Quick check if build is testable","Deep testing of one feature","Testing without requirements","Performance testing"], answer:0, difficulty:'beginner', category:'qa-fundamentals', explanation:"Smoke = build verification, shallow but critical paths."},
  {q:"Equivalence Partitioning for age 18-60, which valid class?", options:["10","25","65","-5"], answer:1, difficulty:'beginner', category:'test-design', explanation:"25 lies in 18-60 valid."},
  {q:"Boundary values for 10-50000 are?", options:["10,50000 only","9,10,11,49999,50000,50001","0,10,50000,100000","10,20,30"], answer:1, difficulty:'intermediate', category:'test-design', explanation:"Boundaries include min-1, min, min+1, max-1, max, max+1"},
  {q:"POST /bookings returns 201. Means?", options:["Created","Bad request","Unauthorized","Server error"], answer:0, difficulty:'beginner', category:'api', explanation:"201 Created."},
  {q:"IDOR vulnerability is about?", options:["Accessing other's data by changing ID","SQL injection","XSS","Slow response"], answer:0, difficulty:'intermediate', category:'security', explanation:"Insecure Direct Object Reference."},
  {q:"What is P99?", options:["99% requests faster than this","99 requests per second","99% error rate","99 users"], answer:0, difficulty:'intermediate', category:'performance', explanation:"P99 is 99th percentile."},
  {q:"RTM stands for?", options:["Requirement Traceability Matrix","Real Time Monitoring","Regression Test Management","Request To Modify"], answer:0, difficulty:'beginner', category:'process', explanation:"Maps Requirement -> Test Case -> Defect."},
  {q:"Which is NOT HTTP method?", options:["GET","POST","FETCH","DELETE"], answer:2, difficulty:'beginner', category:'api', explanation:"FETCH is not standard HTTP method (though JS has fetch)."},
  {q:"XSS is?", options:["Injecting script into app","Database injection","Changing ID","Slow API"], answer:0, difficulty:'intermediate', category:'security', explanation:"Cross Site Scripting – script injection."},
  {q:"Load testing is?", options:["Test with expected load","Test beyond limits","Sudden spike","Long duration"], answer:0, difficulty:'beginner', category:'performance', explanation:"Load = expected users."},
  {q:"What should Actual Result contain?", options:["What you actually observed","Copy of Expected Result","Developer comment","Nothing"], answer:0, difficulty:'beginner', category:'process', explanation:"Actual must be observed behavior with specifics."},
  {q:"JWT contains?", options:["header.payload.signature","username.password","only token","database"], answer:0, difficulty:'intermediate', category:'security', explanation:"JWT structure."},
  {q:"Agile principle: responding to change over?", options:["Following a plan","Working software","Customer collaboration","Processes"], answer:0, difficulty:'beginner', category:'agile', explanation:"Agile manifesto: responding to change over following a plan."},
  {q:"Which testing is ad-hoc without scripts?", options:["Exploratory","Regression","Smoke","Unit"], answer:0, difficulty:'beginner', category:'qa-fundamentals', explanation:"Exploratory is unscripted."},
  {q:"401 vs 403?", options:["401 auth needed, 403 forbidden even after auth","Same","403 auth needed","401 success"], answer:0, difficulty:'intermediate', category:'api', explanation:"401 unauthenticated, 403 unauthorized."},
  {q:"Payment amount -5 should?", options:["Show error invalid amount","Proceed","Crash","Deduct from wallet"], answer:0, difficulty:'beginner', category:'functional', explanation:"Negative amount invalid."},
  {q:"QR expired should?", options:["Show error QR expired","Allow payment","Crash","Ignore"], answer:0, difficulty:'beginner', category:'functional', explanation:"Expired QR must error."},
  {q:"Thread Group in JMeter is?", options:["Number of virtual users","Response time","Server","Database"], answer:0, difficulty:'beginner', category:'performance', explanation:"Thread Group defines users."},
  {q:"SELECT * FROM users WHERE id=1 is?", options:["Read data","Insert","Delete","Update"], answer:0, difficulty:'beginner', category:'database', explanation:"SELECT reads."},
  {q:"Risk-based testing means?", options:["Test high-risk areas first","Test randomly","Test only low risk","Test UI only"], answer:0, difficulty:'intermediate', category:'process', explanation:"Prioritize high risk = high impact * high probability."},
];
