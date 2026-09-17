// QA Learning Hub - App Logic
const STORAGE_KEY = 'qa-hub-v2';
let state = {
  completed: {}, // topicId -> {status, learnedAt, revisions:[], quizScores:[], level}
  notes: [], // {id, topicId, content, createdAt}
  quizAttempts: [], // {date, score, total, category}
  streak: 0,
  lastStudy: null,
  practiceDone: 0,
  weakTopics: {}, // topicId -> fail count
  recent: [], // topicIds
  flashcards: {}, // card front -> {easy, difficult}
};

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){ const parsed = JSON.parse(raw); state = {...state, ...parsed}; }
  }catch(e){}
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function markStudied(topicId){
  const now = new Date().toISOString();
  if(!state.completed[topicId]){
    state.completed[topicId] = {status:'learning', learnedAt: now, revisions:[], quizScores:[], level:'Beginner'};
  }
  state.completed[topicId].lastViewed = now;
  // recent
  state.recent = [topicId, ...state.recent.filter(id=>id!==topicId)].slice(0,10);
  // streak
  const today = new Date().toDateString();
  const last = state.lastStudy ? new Date(state.lastStudy).toDateString() : null;
  if(last !== today){
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    if(last === yesterday.toDateString()) state.streak++;
    else if(!last) state.streak = 1;
    else if(new Date(today) > new Date(last)) {
      // if gap >1 day, reset to 1 but keep? simple
      const diff = (new Date(today)-new Date(last))/(1000*60*60*24);
      if(diff>1) state.streak = 1; else state.streak++;
    }
    state.lastStudy = new Date().toISOString();
  }
  // schedule revision
  scheduleRevision(topicId);
  saveState();
}
function scheduleRevision(topicId){
  const c = state.completed[topicId];
  if(!c) return;
  const now = new Date();
  // spaced: 1,3,7,14 days
  const steps = [1,3,7,14];
  const done = c.revisions?.length || 0;
  const nextDays = steps[Math.min(done, steps.length-1)];
  const due = new Date(); due.setDate(now.getDate()+nextDays);
  c.nextRevision = due.toISOString();
}

function getDueTopics(){
  const now = new Date();
  return Object.keys(state.completed).filter(id=>{
    const c = state.completed[id];
    return c.nextRevision && new Date(c.nextRevision) <= now;
  }).map(id=> TOPICS.find(t=>t.id===id)).filter(Boolean);
}
function getWeakTopics(){
  return Object.entries(state.weakTopics).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id])=> TOPICS.find(t=>t.id===id)).filter(Boolean);
}

function showToast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),2500);
}

// Router
let currentView = 'dashboard';
let currentParams = {};

function navigate(view, params={}){
  currentView = view; currentParams = params;
  document.querySelectorAll('.nav-item').forEach(el=>{
    el.classList.toggle('active', el.dataset.view===view);
  });
  // close mobile sidebar
  document.querySelector('.sidebar').classList.remove('open');
  render();
  window.scrollTo(0,0);
}

function render(){
  const main = document.getElementById('main-content');
  const searchQ = document.getElementById('global-search').value.toLowerCase().trim();
  if(searchQ && currentView!=='learn'){
    // if searching, force learn view filtered
    renderLearn(main, searchQ);
    return;
  }
  switch(currentView){
    case 'dashboard': renderDashboard(main); break;
    case 'learn': renderLearn(main); break;
    case 'learn-detail': renderLearnDetail(main, currentParams.topicId); break;
    case 'revision': renderRevision(main); break;
    case 'practice': renderPractice(main); break;
    case 'quiz': renderQuiz(main); break;
    case 'testcase': renderTestCasePractice(main); break;
    case 'bug': renderBugPractice(main); break;
    case 'api': renderApiPractice(main); break;
    case 'performance': renderPerformancePractice(main); break;
    case 'security': renderSecurityPractice(main); break;
    case 'progress': renderProgress(main); break;
    case 'notes': renderNotes(main); break;
    default: renderDashboard(main);
  }
}

// Components
function topicCard(t, extra=''){
  const comp = state.completed[t.id];
  const isDone = !!comp;
  return `<div class="topic-card ${isDone?'completed':''}" onclick="navigate('learn-detail',{topicId:'${t.id}'})">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <div style="font-weight:600;font-size:14px">${t.title}</div>
      ${isDone?'<span class="badge badge-success">✓ Learned</span>':`<span class="badge">${t.level||'beginner'}</span>`}
    </div>
    <div class="muted small" style="margin:6px 0 8px">${t.categoryName} • ${t.explanation.slice(0,90)}...</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${t.revisionPoints.slice(0,2).map(p=>`<span class="badge">${p.slice(0,28)}</span>`).join('')}</div>
    ${extra}
  </div>`;
}

function renderDashboard(main){
  const completedCount = Object.keys(state.completed).length;
  const total = TOPICS.length;
  const remaining = total - completedCount;
  const due = getDueTopics();
  const weak = getWeakTopics();
  const quizAcc = state.quizAttempts.length ? Math.round(state.quizAttempts.reduce((s,a)=>s+(a.score/a.total),0)/state.quizAttempts.length*100) : 0;
  const recentTopics = state.recent.map(id=>TOPICS.find(t=>t.id===id)).filter(Boolean).slice(0,4);
  const continueId = state.recent[0] || TOPICS.find(t=>!state.completed[t.id])?.id || TOPICS[0].id;
  const continueTopic = TOPICS.find(t=>t.id===continueId);

  main.innerHTML = `
    <div class="section">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px">
        <div>
          <div class="h1">Welcome back 👋</div>
          <div class="muted">Continue your QA learning journey. Learn → Practice → Revise → Track.</div>
        </div>
        <button class="btn btn-primary" onclick="navigate('learn-detail',{topicId:'${continueId}'})">Continue Learning: ${continueTopic?.title||''} →</button>
      </div>
    </div>

    <div class="grid grid-4">
      <div class="card kpi"><div class="kpi-top"><span class="kpi-label">Topics Completed</span><span class="badge badge-success">${completedCount}/${total}</span></div><div class="kpi-value">${completedCount}</div><div class="progress"><div class="progress-bar" style="width:${Math.round(completedCount/total*100)}%"></div></div><div class="small muted">${remaining} remaining</div></div>
      <div class="card kpi"><div class="kpi-top"><span class="kpi-label">Learning Streak</span><span class="badge">🔥</span></div><div class="kpi-value">${state.streak} days</div><div class="small muted">Last studied: ${state.lastStudy? new Date(state.lastStudy).toLocaleDateString(): 'Never'}</div></div>
      <div class="card kpi"><div class="kpi-top"><span class="kpi-label">Quiz Accuracy</span><span class="badge">${state.quizAttempts.length} attempts</span></div><div class="kpi-value">${quizAcc}%</div><div class="progress"><div class="progress-bar success" style="width:${quizAcc}%"></div></div></div>
      <div class="card kpi"><div class="kpi-top"><span class="kpi-label">Practice Done</span><span class="badge">${state.practiceDone}</span></div><div class="kpi-value">${state.practiceDone}</div><div class="small muted">Test cases, bugs, API, etc.</div></div>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="section-head"><div class="h2">Today's Revision 📚</div><span class="badge badge-warn">${due.length} due</span></div>
        ${due.length? `<div class="list">${due.slice(0,5).map(t=>`<div class="list-item"><div class="dot"></div><div style="flex:1"><div style="font-weight:600">${t.title}</div><div class="small muted">${t.categoryName}</div></div><button class="btn btn-sm" onclick="navigate('learn-detail',{topicId:'${t.id}'})">Revise</button></div>`).join('')}</div>` : `<div class="empty"><div class="big">✅</div>Nothing due today! Great job. <br><span class="small">Complete more topics to build spaced revision.</span></div>`}
        <div class="divider"></div>
        <div class="h3" style="margin-bottom:8px">Suggested for today</div>
        <div class="grid" style="grid-template-columns:1fr">
          ${['Severity vs Priority','HTTP Status Codes','Equivalence Partitioning','API Authentication','Response Time'].map(title=>{
            const t = TOPICS.find(x=> x.title.toLowerCase().includes(title.toLowerCase().split(' ')[0]) || x.title===title) || TOPICS[Math.floor(Math.random()*TOPICS.length)];
            return `<div class="list-item" style="padding:6px 0"><span class="badge">${t.categoryName}</span><span style="flex:1;font-size:13px">${t.title}</span><button class="btn btn-sm" onclick="navigate('learn-detail',{topicId:'${t.id}'})">Open</button></div>`;
          }).join('')}
        </div>
      </div>
      <div class="card">
        <div class="section-head"><div class="h2">Weak Topics 🎯</div><button class="btn btn-sm" onclick="navigate('revision')">Fix now</button></div>
        ${weak.length? `<div class="list">${weak.map(t=>`<div class="list-item"><div class="dot" style="background:var(--warning)"></div><div style="flex:1"><div style="font-weight:600">${t.title}</div><div class="small muted">Needs revision – low quiz score</div></div><button class="btn btn-sm" onclick="navigate('learn-detail',{topicId:'${t.id}'})">Practice</button></div>`).join('')}</div>` : `<div class="empty"><div class="big">💪</div>No weak topics yet. Take quizzes to identify them.</div>`}
        <div class="divider"></div>
        <div class="h3">Recently Studied</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${recentTopics.length? recentTopics.map(t=>`<span class="chip" onclick="navigate('learn-detail',{topicId:'${t.id}'})">${t.title}</span>`).join('') : '<span class="muted small">No recent topics</span>'}</div>
        <div class="divider"></div>
        <div class="h3">Daily QA Challenge 🔥</div>
        <div class="card" style="background:#f8fafc;margin-top:8px">
          <div style="font-weight:600">${DAILY_CHALLENGES[0].title}</div>
          <div class="small muted" style="margin:6px 0">${DAILY_CHALLENGES[0].prompt.slice(0,120)}...</div>
          <button class="btn btn-sm btn-primary" onclick="navigate('practice')">Try Challenge</button>
        </div>
      </div>
    </div>

    <div class="grid grid-3" style="margin-top:16px">
      <div class="card"><div class="h3">Quick Actions</div><div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
        <button class="btn" onclick="navigate('quiz')">📝 Take Random Quiz (10 Q)</button>
        <button class="btn" onclick="navigate('testcase')">🧪 Practice Test Cases</button>
        <button class="btn" onclick="navigate('bug')">🐛 Bug Reporting Practice</button>
        <button class="btn" onclick="navigate('api')">🔌 API Simulator</button>
      </div></div>
      <div class="card"><div class="h3">Flashcards</div><div class="small muted">Quick revision – flip cards</div><div id="dash-flash" style="margin-top:10px"></div></div>
      <div class="card"><div class="h3">My Learning Philosophy</div><div class="small" style="margin-top:8px;line-height:1.6">Prefer: <br>“Basically...”<br>“In simple words...”<br>“For example...”<br>“As a QA, I would check...”<br>“One common mistake is...”<br><br>We keep explanations natural, practical, eSewa/banking/airline examples, not textbook.</div></div>
    </div>
  `;
  // render one flashcard
  const flashEl = document.getElementById('dash-flash');
  if(flashEl){
    const card = FLASHCARDS[Math.floor(Math.random()*FLASHCARDS.length)];
    flashEl.innerHTML = `<div class="flashcard" id="dashFlashCard" onclick="this.classList.toggle('flipped')"><div class="flash-inner"><div class="flash-front"><div class="small muted">FRONT</div><div style="font-weight:700;margin-top:8px">${card.front}</div><div class="small muted" style="margin-top:10px">Click to flip</div></div><div class="flash-back"><div class="small muted">BACK</div><div style="font-weight:600;margin-top:8px">${card.back}</div></div></div></div>`;
  }
}

function renderLearn(main, forcedSearch=''){
  const q = forcedSearch || document.getElementById('global-search')?.value.toLowerCase()||'';
  let filtered = TOPICS;
  if(q) filtered = TOPICS.filter(t=> (t.title+' '+t.categoryName+' '+t.explanation).toLowerCase().includes(q));
  // group by category
  const byCat = {};
  filtered.forEach(t=>{ if(!byCat[t.categoryId]) byCat[t.categoryId]=[]; byCat[t.categoryId].push(t); });
  main.innerHTML = `
    <div class="section-head"><div><div class="h1">Learn QA Step by Step</div><div class="muted small">Simple language, real examples, eSewa / airline / banking apps</div></div><div style="display:flex;gap:8px"><span class="badge">${filtered.length} topics</span><button class="btn btn-sm" onclick="document.getElementById('global-search').value=''; renderLearn(document.getElementById('main-content'))">Clear search</button></div></div>
    <div class="grid" style="grid-template-columns:280px 1fr;gap:16px">
      <div>
        <div class="card" style="position:sticky;top:80px">
          <div class="h3">Categories</div>
          <div class="list" style="margin-top:10px">
            ${CATEGORIES.map(c=>{
              const count = (byCat[c.id]||[]).length;
              const totalCat = TOPICS.filter(t=>t.categoryId===c.id).length;
              const done = TOPICS.filter(t=>t.categoryId===c.id && state.completed[t.id]).length;
              return `<div class="list-item" style="cursor:pointer" onclick="document.getElementById('cat-${c.id}')?.scrollIntoView({behavior:'smooth'})"><div style="flex:1"><div style="font-weight:600">${c.icon} ${c.name}</div><div class="small muted">${done}/${totalCat} done • ${count} shown</div></div><div class="progress" style="width:50px"><div class="progress-bar" style="width:${totalCat?Math.round(done/totalCat*100):0}%"></div></div></div>`;
            }).join('')}
          </div>
          <div class="divider"></div>
          <div class="h3">My Understanding Levels</div>
          <div class="small muted" style="margin-top:6px">Beginner → Learning → Practicing → Comfortable</div>
          <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
            ${Object.entries(state.completed).slice(0,5).map(([id,v])=>{ const t=TOPICS.find(x=>x.id===id); return t?`<div class="small"><span class="badge">${v.level||'Learning'}</span> ${t.title}</div>`:''}).join('') || '<span class="small muted">No topics yet</span>'}
          </div>
        </div>
      </div>
      <div>
        ${Object.keys(byCat).length? Object.entries(byCat).map(([catId, topics])=>{
          const cat = CATEGORIES.find(c=>c.id===catId);
          return `<div id="cat-${catId}" style="margin-bottom:22px"><div class="section-head"><div class="h2">${cat?cat.icon:''} ${cat?cat.name:catId}</div><span class="badge">${topics.length} topics</span></div><div class="grid grid-2">${topics.map(t=>topicCard(t)).join('')}</div></div>`;
        }).join('') : `<div class="empty"><div class="big">🔍</div>No topics found for "${q}". Try searching "API", "severity", "JWT", "QR", "JMeter".</div>`}
      </div>
    </div>
  `;
}

function renderLearnDetail(main, topicId){
  const t = TOPICS.find(x=>x.id===topicId);
  if(!t){ main.innerHTML = `<div class="empty">Topic not found</div>`; return; }
  markStudied(topicId);
  const comp = state.completed[topicId];
  const notes = state.notes.filter(n=>n.topicId===topicId);
  main.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px"><button class="btn btn-sm" onclick="navigate('learn')">← Back to Learn</button><span class="badge">${t.categoryName}</span><span class="badge badge-primary">${t.level}</span>${comp?'<span class="badge badge-success">✓ Learned</span>':''}</div>
    <div class="grid" style="grid-template-columns:1fr 300px;gap:16px">
      <div>
        <div class="card">
          <div class="h1" style="font-size:22px">${t.title}</div>
          <div class="muted small" style="margin-top:4px">Simple explanation for beginners • Real eSewa / airline examples</div>
          <div class="divider"></div>

          <details open><summary>1. Simple Explanation <span class="badge">Start here</span></summary><div style="margin-top:10px">${t.explanation}<br><br><div class="code-block" style="background:#f8fafc;color:#334155;border:1px solid #e2e8f0">Basically: ${t.title} helps QA ensure app works for real users.</div></div></details>
          <details open><summary>2. Why It Matters for QA</summary><div style="margin-top:10px">${t.whyMatters}</div></details>
          <details open><summary>3. Real Example (eSewa / Airline / Banking)</summary><div style="margin-top:10px">${t.realExample}</div></details>
          <details open><summary>4. QA Example – As a QA, I would check...</summary><div style="margin-top:10px">${t.qaExample}<div style="margin-top:8px"><span class="badge badge-primary">Tip</span> Always think negative, boundary, network, security.</div></div></details>
          <details><summary>5. Common Mistakes Beginners Make</summary><div style="margin-top:10px"><ul>${t.mistakes.map(m=>`<li>${m}</li>`).join('')}</ul></div></details>
          <details open><summary>6. Quick Revision – 3-5 points</summary><div style="margin-top:10px"><ul>${t.revisionPoints.map(p=>`<li>${p}</li>`).join('')}</ul></div></details>
          <details><summary>7. Practice Question</summary><div style="margin-top:10px"><div style="font-weight:600">${t.practice.question}</div><div class="small muted" style="margin-top:6px">Hint: ${t.practice.hint}</div><textarea id="practice-answer" class="textarea" placeholder="Write your answer here..." style="margin-top:10px"></textarea><button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="evaluatePractice('${t.id}')">Check My Answer</button><div id="practice-feedback" style="margin-top:10px"></div></div></details>
          <details><summary>8. Quick Quiz</summary><div id="topic-quiz" style="margin-top:10px"></div></details>
        </div>
      </div>
      <div>
        <div class="card" style="position:sticky;top:80px">
          <div class="h3">Actions</div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
            <button class="btn ${comp?'':'btn-primary'}" onclick="toggleComplete('${t.id}')">${comp?'✓ Marked as Learned (click to undo)':'Mark as Learned'}</button>
            <button class="btn" onclick="document.getElementById('note-input').focus()">+ Add My Note</button>
            <button class="btn" onclick="navigate('quiz')">Take Quiz</button>
            <button class="btn" onclick="navigate('testcase')">Practice Test Cases</button>
            <select class="select" onchange="updateLevel('${t.id}', this.value)"><option disabled>Set understanding level</option><option ${comp?.level==='Beginner'?'selected':''}>Beginner</option><option ${comp?.level==='Learning'?'selected':''}>Learning</option><option ${comp?.level==='Practicing'?'selected':''}>Practicing</option><option ${comp?.level==='Comfortable'?'selected':''}>Comfortable</option></select>
          </div>
          <div class="divider"></div>
          <div class="h3">My Notes for this topic</div>
          <textarea id="note-input" class="textarea" placeholder="Write in your own words..." style="margin-top:8px;min-height:80px"></textarea>
          <button class="btn btn-primary btn-sm" style="margin-top:6px" onclick="addNote('${t.id}')">Save Note</button>
          <div id="notes-list" style="margin-top:10px">${notes.length? notes.map(n=>`<div class="card note-card" style="padding:10px;margin-top:6px"><div class="small">${n.content}</div><div class="small muted" style="margin-top:4px">${new Date(n.createdAt).toLocaleString()} <span style="float:right;cursor:pointer" onclick="deleteNote('${n.id}')">🗑️</span></div></div>`).join('') : '<div class="small muted">No notes yet. Write what you understood.</div>'}</div>
          <div class="divider"></div>
          <div class="h3">What I Struggled With</div>
          <textarea id="struggle-input" class="textarea" placeholder="What was confusing?" style="min-height:60px;margin-top:6px"></textarea>
          <div class="divider"></div>
          <div class="h3">Interview Questions</div>
          <div class="small" style="margin-top:6px">${INTERVIEW_QUESTIONS.filter(q=> t.title.toLowerCase().includes(q.category.toLowerCase()) || q.category.toLowerCase().includes(t.categoryId)).slice(0,2).map(q=>`• ${q.q}`).join('<br>') || '• What is '+t.title+'? <br>• Explain with real example'}</div>
        </div>
      </div>
    </div>
  `;
  // render quiz inside
  const quizContainer = document.getElementById('topic-quiz');
  if(quizContainer && t.quiz){
    quizContainer.innerHTML = t.quiz.map((q,i)=>`
      <div style="margin-top:12px;padding:10px;border:1px solid var(--border);border-radius:10px">
        <div style="font-weight:600">${i+1}. ${q.q}</div>
        <div style="margin-top:8px">${q.options.map((opt,oi)=>`<div class="quiz-option" onclick="checkTopicQuiz(this, ${oi}, ${q.answer}, '${q.explanation.replace(/'/g,"\\'")}')"><span>${String.fromCharCode(65+oi)}.</span><span>${opt}</span></div>`).join('')}</div>
        <div class="quiz-explain small muted" style="display:none;margin-top:8px"></div>
      </div>
    `).join('');
  }
}

function toggleComplete(topicId){
  if(state.completed[topicId]){
    delete state.completed[topicId];
    showToast('Removed from learned');
  }else{
    state.completed[topicId] = {status:'learning', learnedAt:new Date().toISOString(), revisions:[], quizScores:[], level:'Learning'};
    scheduleRevision(topicId);
    showToast('Marked as learned! Revision scheduled');
  }
  saveState(); renderLearnDetail(document.getElementById('main-content'), topicId);
}
function updateLevel(topicId, level){
  if(!state.completed[topicId]) state.completed[topicId] = {learnedAt:new Date().toISOString(), revisions:[], quizScores:[]};
  state.completed[topicId].level = level;
  saveState(); showToast('Level updated: '+level);
}
function addNote(topicId){
  const input = document.getElementById('note-input');
  const content = input.value.trim();
  if(!content) return;
  const note = {id: Date.now().toString(), topicId, content, createdAt:new Date().toISOString()};
  state.notes.unshift(note);
  saveState(); input.value=''; renderLearnDetail(document.getElementById('main-content'), topicId);
  showToast('Note saved');
}
function deleteNote(noteId){
  state.notes = state.notes.filter(n=>n.id!==noteId);
  saveState(); showToast('Note deleted');
  // re-render current detail if possible
  const topicId = currentParams.topicId;
  if(topicId) renderLearnDetail(document.getElementById('main-content'), topicId);
}
function evaluatePractice(topicId){
  const ans = document.getElementById('practice-answer').value.trim();
  const fb = document.getElementById('practice-feedback');
  if(!ans){ fb.innerHTML = '<span class="badge badge-warn">Write something first</span>'; return; }
  // simple heuristic
  const checks = [
    {kw:['invalid','wrong','incorrect'], msg:'Good – you considered invalid input'},
    {kw:['empty','blank'], msg:'Nice – empty input covered'},
    {kw:['boundary','min','max','edge'], msg:'Great – boundary values'},
    {kw:['network','internet','timeout'], msg:'Excellent – network failure'},
    {kw:['security','injection','xss'], msg:'Awesome – security thinking'},
    {kw:['usability','ux'], msg:'Good – usability'},
  ];
  const lower = ans.toLowerCase();
  const found = checks.filter(c=> c.kw.some(k=> lower.includes(k)));
  const missing = checks.filter(c=> !c.kw.some(k=> lower.includes(k))).slice(0,3);
  fb.innerHTML = `
    <div class="card" style="background:#f0fdf4;border-color:#a7f3d0">
      <div style="font-weight:600">Feedback for you:</div>
      <div class="small" style="margin-top:6px">${found.length? found.map(f=>`✅ ${f.msg}`).join('<br>') : 'You wrote a start – try to add more negative cases.'}</div>
      ${missing.length? `<div class="small" style="margin-top:8px"><b>Consider also:</b><br>${missing.map(m=>`• ${m.kw[0]} – e.g., think about ${m.kw[0]} scenarios`).join('<br>')}</div>` : ''}
      <div class="small muted" style="margin-top:8px">Remember: As a QA, always think – valid, invalid, empty, boundary, network, security, usability, accessibility.</div>
    </div>
  `;
  state.practiceDone++; saveState();
}
function checkTopicQuiz(el, selected, correct, explanation){
  const parent = el.parentElement;
  parent.querySelectorAll('.quiz-option').forEach(o=>{o.classList.remove('correct','wrong'); o.style.pointerEvents='none';});
  if(selected===correct){ el.classList.add('correct'); showToast('Correct!'); }
  else { el.classList.add('wrong'); parent.children[correct]?.classList.add('correct'); }
  const exp = parent.nextElementSibling;
  exp.style.display='block'; exp.innerHTML = `<b>${selected===correct?'✅ Correct':'❌ Wrong'}:</b> ${explanation}`;
  // track weak
  const topicId = currentParams.topicId;
  if(selected!==correct){
    state.weakTopics[topicId] = (state.weakTopics[topicId]||0)+1;
  }
  saveState();
}

// Revision
function renderRevision(main){
  const due = getDueTopics();
  const weak = getWeakTopics();
  main.innerHTML = `
    <div class="h1">Revision Mode 🔁</div>
    <div class="muted small">Spaced revision: Learned today → tomorrow → 3 days → 7 days → 14 days. If you perform poorly, topic comes sooner.</div>
    <div class="grid grid-3" style="margin-top:16px">
      <div class="card card-hover" style="cursor:pointer" onclick="startRevision('quick')"><div class="h3">⚡ Quick Revision</div><div class="small muted">Short explanations + key points for fast recall</div><div style="margin-top:10px"><span class="badge">${TOPICS.length} topics</span></div></div>
      <div class="card card-hover" style="cursor:pointer" onclick="startRevision('weak')"><div class="h3">🎯 Weak Topics</div><div class="small muted">Topics where quiz score low – fix them</div><div style="margin-top:10px"><span class="badge badge-warn">${weak.length} weak</span></div></div>
      <div class="card card-hover" style="cursor:pointer" onclick="startRevision('random')"><div class="h3">🎲 Random Revision</div><div class="small muted">Random questions from everything learned</div><div style="margin-top:10px"><span class="badge">Surprise me</span></div></div>
      <div class="card card-hover" style="cursor:pointer" onclick="startRevision('due')"><div class="h3">📅 Due for Revision</div><div class="small muted">Spaced repetition due today</div><div style="margin-top:10px"><span class="badge badge-danger">${due.length} due</span></div></div>
      <div class="card card-hover" style="cursor:pointer" onclick="startRevision('exam')"><div class="h3">📝 Exam Revision</div><div class="small muted">30 important points for final review</div></div>
      <div class="card card-hover" style="cursor:pointer" onclick="startRevision('interview')"><div class="h3">💼 Interview Revision</div><div class="small muted">Common QA interview Q&A</div></div>
    </div>
    <div id="revision-area" style="margin-top:20px"></div>
  `;
}
function startRevision(mode){
  const area = document.getElementById('revision-area');
  let items = [];
  if(mode==='due') items = getDueTopics();
  else if(mode==='weak') items = getWeakTopics();
  else if(mode==='quick') items = TOPICS.filter(t=>state.completed[t.id]).slice(0,8);
  else if(mode==='random') items = [...TOPICS].sort(()=>0.5-Math.random()).slice(0,8);
  else if(mode==='exam') items = TOPICS.slice(0,10);
  else if(mode==='interview') { renderInterviewRevision(area); return; }

  if(!items.length){ area.innerHTML = `<div class="empty">No topics for this mode. Learn more first.</div>`; return; }

  area.innerHTML = `
    <div class="card"><div class="h2">${mode.toUpperCase()} Revision – ${items.length} topics</div>
      <div style="margin-top:12px" class="grid grid-2">
        ${items.map(t=>`<div class="card" style="background:#f8fafc"><div style="font-weight:700">${t.title}</div><div class="small muted">${t.categoryName}</div><ul class="small" style="margin-top:6px">${t.revisionPoints.map(p=>`<li>${p}</li>`).join('')}</ul><button class="btn btn-sm" style="margin-top:6px" onclick="navigate('learn-detail',{topicId:'${t.id}'})">Open full</button></div>`).join('')}
      </div>
      <div style="margin-top:12px"><button class="btn btn-primary" onclick="navigate('quiz')">Take Quiz on these</button></div>
    </div>
  `;
}
function renderInterviewRevision(area){
  area.innerHTML = `
    <div class="card"><div class="h2">Interview Revision Mode</div><div class="small muted">Practice common QA interview questions</div>
      <div style="margin-top:12px" id="interview-q"></div>
    </div>
  `;
  let idx=0;
  function showQ(){
    const q = INTERVIEW_QUESTIONS[idx];
    document.getElementById('interview-q').innerHTML = `
      <div style="font-weight:700">${idx+1}/${INTERVIEW_QUESTIONS.length} [${q.category}]</div>
      <div style="margin:10px 0;font-size:16px;font-weight:600">${q.q}</div>
      <textarea id="int-ans" class="textarea" placeholder="Type your answer..."></textarea>
      <div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-primary" onclick="checkInterview()">Submit</button><button class="btn" onclick="nextInterview()">Skip</button></div>
      <div id="int-feedback" style="margin-top:12px"></div>
    `;
  }
  window.checkInterview = ()=>{
    const ans = document.getElementById('int-ans').value.trim();
    if(!ans){ showToast('Write answer first'); return; }
    const q = INTERVIEW_QUESTIONS[idx];
    document.getElementById('int-feedback').innerHTML = `<div class="card" style="background:#f0fdf4"><div style="font-weight:600">Sample better answer (simple language):</div><div class="small" style="margin-top:6px">${q.sample}</div><div class="small muted" style="margin-top:6px">Your answer: ${ans.slice(0,200)}</div><div style="margin-top:8px"><span class="badge badge-success">Keep practicing – clarity + example matters</span></div><button class="btn btn-sm" style="margin-top:8px" onclick="nextInterview()">Next →</button></div>`;
  };
  window.nextInterview = ()=>{ idx = (idx+1)%INTERVIEW_QUESTIONS.length; showQ(); };
  showQ();
}

// Practice hub
function renderPractice(main){
  main.innerHTML = `
    <div class="h1">Practice Hub 🧪</div>
    <div class="muted small">Learn → Understand → Practice → Get Feedback → Revise → Retest</div>
    <div class="grid grid-3" style="margin-top:16px">
      <div class="card card-hover" onclick="navigate('testcase')"><div class="h3">📋 Test Case Practice</div><div class="small muted">Write scenarios for eSewa login, airline search, payment, QR</div><div style="margin-top:8px"><span class="badge">Interactive</span></div></div>
      <div class="card card-hover" onclick="navigate('bug')"><div class="h3">🐛 Bug Reporting Practice</div><div class="small muted">Create bug title, steps, expected vs actual (observed!)</div></div>
      <div class="card card-hover" onclick="navigate('api')"><div class="h3">🔌 API Practice</div><div class="small muted">Status codes, methods, Postman, API simulator</div></div>
      <div class="card card-hover" onclick="navigate('performance')"><div class="h3">⚡ Performance Practice</div><div class="small muted">Response time, P95, JMeter simulator</div></div>
      <div class="card card-hover" onclick="navigate('security')"><div class="h3">🔒 Security Practice</div><div class="small muted">IDOR, XSS, SQLi, JWT, auth</div></div>
      <div class="card" style="background:#f8fafc"><div class="h3">Daily QA Challenge</div><div id="daily-challenge"></div></div>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><div class="h2">Airline Application Practice ✈️</div><div class="small muted">Practice per module</div>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
          ${['Airlines Home Page','Search Departure/Destination','Passenger Selection','Flight Results','Flight Details','Passenger Details','Booking Confirmation','Payment','Post-Booking'].map((m,i)=>`<div class="list-item"><span class="badge">${i+1}</span><span style="flex:1">${m}</span><button class="btn btn-sm" onclick="practiceAirline('${m}')">Practice</button></div>`).join('')}
        </div>
      </div>
      <div class="card"><div class="h2">QA Thinking – What could go wrong? 🤔</div><div class="small muted">Real-world situations</div>
        <div id="qa-thinking" style="margin-top:10px"></div>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><div class="h2">Simulators (Mock, no real money)</div>
        <div class="tabs" style="margin-top:10px"><div class="tab active" onclick="switchSimTab(this,'login')">Login Simulator</div><div class="tab" onclick="switchSimTab(this,'payment')">Payment Simulator</div><div class="tab" onclick="switchSimTab(this,'api')">API Simulator</div></div>
        <div id="sim-area" style="margin-top:12px"></div>
      </div>
      <div class="card"><div class="h2">Flashcards – Quick Revision</div><div id="flash-area" style="margin-top:10px"></div></div>
    </div>
  `;
  renderDailyChallenge();
  renderQAThinking();
  renderSim('login');
  renderFlashcards();
}

function renderDailyChallenge(){
  const el = document.getElementById('daily-challenge');
  if(!el) return;
  const ch = DAILY_CHALLENGES[Math.floor(Math.random()*DAILY_CHALLENGES.length)];
  el.innerHTML = `
    <div style="font-weight:600;margin-top:8px">${ch.title}</div>
    <div class="small" style="margin-top:6px">${ch.prompt}</div>
    <textarea id="daily-ans" class="textarea" placeholder="What would you test?" style="margin-top:8px;min-height:70px"></textarea>
    <button class="btn btn-primary btn-sm" style="margin-top:6px" onclick="showDailyAnswer()">Show QA Thought Process</button>
    <div id="daily-fb" style="margin-top:8px"></div>
  `;
  window.showDailyAnswer = ()=>{
    document.getElementById('daily-fb').innerHTML = `<div class="card" style="background:#f0fdf4"><div class="small"><b>Example QA thought:</b><br>${ch.answer}</div></div>`;
    state.practiceDone++; saveState();
  };
}
function renderQAThinking(){
  const el = document.getElementById('qa-thinking');
  if(!el) return;
  const situations = [
    {title:"Login", prompt:"User login with phone + MPIN. What could go wrong beyond wrong password?"},
    {title:"Payment", prompt:"Pay Rs. 1000 to merchant via QR. What could go wrong?"},
    {title:"Flight Booking", prompt:"Book flight KTM-DEL for 2 adults. What edge cases?"},
    {title:"File Upload", prompt:"Upload profile photo. What could go wrong?"},
  ];
  let idx=0;
  function show(){
    const s = situations[idx];
    el.innerHTML = `<div style="font-weight:600">${s.title}</div><div class="small muted" style="margin-top:4px">${s.prompt}</div><textarea id="think-ans" class="textarea" style="margin-top:8px" placeholder="List what could go wrong..."></textarea><div style="display:flex;gap:8px;margin-top:6px"><button class="btn btn-primary btn-sm" onclick="checkThink()">Check</button><button class="btn btn-sm" onclick="nextThink()">Next</button></div><div id="think-fb" style="margin-top:8px"></div>`;
  }
  window.checkThink = ()=>{
    const ans = document.getElementById('think-ans').value.toLowerCase();
    const must = ['invalid','empty','boundary','network','security','usability','performance','duplicate'];
    const found = must.filter(k=> ans.includes(k));
    document.getElementById('think-fb').innerHTML = `<div class="small">You covered: ${found.join(', ')||'try more'}<br>Also think: negative, boundary, network, security, usability, accessibility, compatibility, performance, data consistency, duplicate actions, unexpected behavior.</div>`;
  };
  window.nextThink = ()=>{ idx=(idx+1)%situations.length; show(); };
  show();
}
function practiceAirline(module){
  const prompts = {
    'Airlines Home Page':"Test home page: search form visible, from/to fields, date picker, passenger selector, offers banner, navigation",
    'Search Departure/Destination':"Test search: valid cities, same from/to error, auto-suggest, empty validation, special characters",
    'Passenger Selection':"Test passenger: min 1, max 9, infant without adult error, child age validation",
    'Flight Results':"Test results: filters, sorting by price/time, no results handling, loading state",
    'Flight Details':"Test details: fare breakdown, baggage info, cancellation policy",
    'Passenger Details':"Test passenger form: name validation, DOB, passport expiry, contact info",
    'Booking Confirmation':"Test confirmation: summary matches selection, price matches, terms checkbox",
    'Payment':"Test payment: valid/invalid amount, MPIN, wallet balance, duplicate prevention, network fail",
    'Post-Booking':"Test post-booking: ticket email, PNR, download ticket, cancel flow"
  };
  const area = document.getElementById('main-content');
  // reuse test case practice view but prefill
  navigate('testcase');
  setTimeout(()=>{
    const sel = document.getElementById('feature-select');
    if(sel){ sel.value='airline-search'; }
    const ta = document.getElementById('tc-input');
    if(ta){ ta.value = `Feature: ${module}\nSuggested focus: ${prompts[module]||module}\n\nWrite your test scenarios here:\n1. `; }
  },100);
}

function switchSimTab(el, type){
  el.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderSim(type);
}
function renderSim(type){
  const el = document.getElementById('sim-area');
  if(!el) return;
  if(type==='login'){
    el.innerHTML = `
      <div class="sim-box">
        <div class="h3">Login Simulator (Mock)</div>
        <div style="margin-top:8px"><input id="sim-phone" class="input" placeholder="Phone (e.g., 98XXXXXXXX)"><input id="sim-mpin" class="input" style="margin-top:8px" type="password" placeholder="MPIN (e.g., 1234)"></div>
        <button class="btn btn-primary" style="margin-top:8px" onclick="simulateLogin()">Login</button>
        <div id="sim-login-res" style="margin-top:8px" class="small"></div>
        <div class="small muted" style="margin-top:8px">Try: empty, wrong format, 1234 valid, 0000 locked, slow network toggle below <br><label><input type="checkbox" id="slow-net"> Simulate slow network</label></div>
      </div>
    `;
  } else if(type==='payment'){
    el.innerHTML = `
      <div class="sim-box">
        <div class="h3">Payment Simulator (Mock – no real money)</div>
        <input id="pay-amount" class="input" placeholder="Amount Rs. 10-50000" type="number">
        <input id="pay-mpin" class="input" style="margin-top:8px" placeholder="MPIN" type="password">
        <div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-primary" onclick="simulatePay()">Pay Now</button><button class="btn" onclick="simulatePay(true)">Double Click (test duplicate)</button></div>
        <div id="pay-res" style="margin-top:8px" class="small"></div>
        <div class="small muted" style="margin-top:6px">Check: wallet balance, history, duplicate prevention, error messages</div>
      </div>
    `;
  } else {
    el.innerHTML = `
      <div class="sim-box">
        <div class="h3">API Simulator</div>
        <div style="display:flex;gap:8px;margin-top:8px"><select id="api-method" class="select" style="width:100px"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select><input id="api-url" class="input" value="/api/users/123" style="flex:1"></div>
        <textarea id="api-body" class="textarea" style="margin-top:8px;min-height:60px" placeholder='{"name":"test"}'></textarea>
        <button class="btn btn-primary" style="margin-top:8px" onclick="simulateApi()">Send Request</button>
        <div id="api-res" style="margin-top:8px"></div>
      </div>
    `;
  }
}
function simulateLogin(){
  const phone = document.getElementById('sim-phone').value.trim();
  const mpin = document.getElementById('sim-mpin').value.trim();
  const slow = document.getElementById('slow-net').checked;
  const res = document.getElementById('sim-login-res');
  res.innerHTML = slow ? '⏳ Loading (slow network)...' : '⏳ Checking...';
  setTimeout(()=>{
    if(!phone) res.innerHTML = '<span style="color:var(--danger)">❌ Phone required</span>';
    else if(phone.length<10) res.innerHTML = '<span style="color:var(--danger)">❌ Invalid phone format</span>';
    else if(!mpin) res.innerHTML = '<span style="color:var(--danger)">❌ MPIN required</span>';
    else if(mpin==='0000') res.innerHTML = '<span style="color:var(--danger)">❌ Account locked after 5 attempts. Try after 30 mins.</span>';
    else if(mpin==='1234') res.innerHTML = '<span style="color:var(--success)">✅ Login success! Token: abc123… Redirect to home.</span><br><span class="small muted">Check: session, token expiry, wallet balance API</span>';
    else res.innerHTML = '<span style="color:var(--danger)">❌ Invalid MPIN. Attempts left: 2</span>';
  }, slow?2000:600);
}
function simulatePay(double=false){
  const amt = parseFloat(document.getElementById('pay-amount').value);
  const mpin = document.getElementById('pay-mpin').value;
  const res = document.getElementById('pay-res');
  if(double) res.innerHTML = '⚠️ Double click detected! Button should disable after first click to prevent duplicate.';
  if(isNaN(amt)) { res.innerHTML = '<span style="color:var(--danger)">❌ Enter amount</span>'; return; }
  if(amt<10) res.innerHTML = '<span style="color:var(--danger)">❌ Minimum Rs.10</span>';
  else if(amt>50000) res.innerHTML = '<span style="color:var(--danger)">❌ Maximum Rs.50000 exceeded</span>';
  else if(amt===0) res.innerHTML = '<span style="color:var(--danger)">❌ Zero amount not allowed</span>';
  else if(mpin!=='1234') res.innerHTML = '<span style="color:var(--danger)">❌ Invalid MPIN</span>';
  else {
    res.innerHTML = `<span style="color:var(--success)">✅ Payment success! Rs.${amt} paid. Wallet updated: Rs.${10000-amt} (was 10000). Txn ID: TXN${Date.now()}</span><br><span class="small">Check: history entry, notification, balance consistency, idempotency key</span>`;
  }
}
function simulateApi(){
  const method = document.getElementById('api-method').value;
  const url = document.getElementById('api-url').value;
  const body = document.getElementById('api-body').value;
  const resEl = document.getElementById('api-res');
  let status=200, bodyRes='{}';
  if(url.includes('9999')){ status=404; bodyRes='{"error":"Not found"}'; }
  else if(method==='POST'){ status=201; bodyRes='{"id":124,"message":"Created"}'; }
  else if(url.includes('users/124') && method==='GET'){ status=200; bodyRes='{"id":124,"name":"Ram","balance":5000}'; }
  else if(url.includes('users/12') && method==='GET'){ status=403; bodyRes='{"error":"Forbidden – not your data (IDOR check)"}'; }
  else { status=200; bodyRes='{"message":"OK","data":[]}'; }
  resEl.innerHTML = `<div class="code-block">HTTP/1.1 ${status} ${status===200?'OK':status===201?'Created':status===404?'Not Found':'Forbidden'}<br>Content-Type: application/json<br><br>${bodyRes}</div><div class="small muted" style="margin-top:6px">As QA, check: status code, headers, JSON schema, response time, error message not leaking stack trace</div>`;
}

// Flashcards
function renderFlashcards(){
  const el = document.getElementById('flash-area');
  if(!el) return;
  let idx=0;
  let filtered = [...FLASHCARDS];
  function show(){
    if(!filtered.length) filtered = [...FLASHCARDS];
    const card = filtered[idx%filtered.length];
    el.innerHTML = `
      <div class="flashcard" id="flashCard" onclick="this.classList.toggle('flipped')"><div class="flash-inner"><div class="flash-front"><div class="small muted">FRONT • Click to flip</div><div style="font-weight:700;margin-top:10px;font-size:16px">${card.front}</div></div><div class="flash-back"><div class="small muted">BACK</div><div style="font-weight:600;margin-top:10px">${card.back}</div></div></div></div>
      <div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-sm" onclick="prevFlash()">← Prev</button><button class="btn btn-sm" onclick="nextFlash()">Next →</button><button class="btn btn-sm" onclick="shuffleFlash()">Shuffle</button><button class="btn btn-sm" style="background:var(--success-light)" onclick="markFlash('easy')">Easy</button><button class="btn btn-sm" style="background:var(--warning-light)" onclick="markFlash('difficult')">Difficult</button></div>
      <div class="small muted" style="margin-top:6px">${idx+1}/${filtered.length} • Difficult cards appear more often</div>
    `;
  }
  window.nextFlash = ()=>{ idx=(idx+1)%filtered.length; const c=document.getElementById('flashCard'); if(c) c.classList.remove('flipped'); setTimeout(show,150); };
  window.prevFlash = ()=>{ idx=(idx-1+filtered.length)%filtered.length; const c=document.getElementById('flashCard'); if(c) c.classList.remove('flipped'); setTimeout(show,150); };
  window.shuffleFlash = ()=>{ filtered.sort(()=>0.5-Math.random()); idx=0; show(); };
  window.markFlash = (type)=>{
    const card = filtered[idx];
    state.flashcards[card.front] = state.flashcards[card.front]||{easy:0,difficult:0};
    state.flashcards[card.front][type]++;
    if(type==='difficult'){
      // add duplicate to show more often
      filtered.splice(idx,0,card);
    }
    saveState(); showToast(type==='easy'?'Marked easy – will show less':'Marked difficult – will show more'); nextFlash();
  };
  show();
}

// Quiz
let activeQuiz = null;
function renderQuiz(main, preset=null){
  if(!activeQuiz){
    main.innerHTML = `
      <div class="h1">Quiz System 📝</div>
      <div class="muted small">Multiple choice, True/False, scenario-based. Explanation after each answer.</div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card"><div class="h3">Start New Quiz</div>
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px">
            <div><label class="small">Number of questions</label><div style="display:flex;gap:8px;margin-top:4px"><button class="chip active" data-count="10" onclick="selectChip(this)">10</button><button class="chip" data-count="20" onclick="selectChip(this)">20</button><button class="chip" data-count="30" onclick="selectChip(this)">30</button></div></div>
            <div><label class="small">Difficulty</label><select id="quiz-diff" class="select"><option value="all">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
            <div><label class="small">Category</label><select id="quiz-cat" class="select"><option value="all">All categories</option>${CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
            <button class="btn btn-primary" onclick="startQuiz()">Start Quiz →</button>
            <button class="btn" onclick="startQuiz(true)">🎲 Random Revision Quiz</button>
          </div>
        </div>
        <div class="card"><div class="h3">Quiz History</div><div class="small muted">${state.quizAttempts.length} attempts</div><div style="margin-top:10px" class="list">${state.quizAttempts.slice(0,5).map(a=>`<div class="list-item"><span class="badge">${a.score}/${a.total}</span><span style="flex:1" class="small">${new Date(a.date).toLocaleString()} • ${a.category}</span><span class="badge ${a.score/a.total>=0.7?'badge-success':'badge-warn'}">${Math.round(a.score/a.total*100)}%</span></div>`).join('') || '<div class="small muted">No attempts yet</div>'}</div></div>
      </div>
      <div class="card" style="margin-top:16px"><div class="h3">Quick Topic Quiz</div><div class="grid grid-3" style="margin-top:10px">${CATEGORIES.map(c=>`<div class="topic-card" onclick="startQuiz(false,'${c.id}')"><div style="font-weight:600">${c.icon} ${c.name}</div><div class="small muted">${TOPICS.filter(t=>t.categoryId===c.id).length} topics</div></div>`).join('')}</div></div>
    `;
    window.selectChip = (el)=>{
      el.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      el.classList.add('active');
    };
    window.startQuiz = (random=false, forcedCat=null)=>{
      const countEl = document.querySelector('[data-count].active') || document.querySelector('[data-count]');
      const count = parseInt(countEl?.dataset.count||'10');
      const diff = document.getElementById('quiz-diff')?.value||'all';
      const cat = forcedCat || document.getElementById('quiz-cat')?.value||'all';
      let pool = [...QUIZ_BANK];
      if(cat!=='all') pool = pool.filter(q=> q.category===cat || TOPICS.find(t=>t.categoryId===cat && t.title.toLowerCase().includes(q.q.toLowerCase().slice(0,10))));
      if(diff!=='all') pool = pool.filter(q=> q.difficulty===diff);
      if(random) pool.sort(()=>0.5-Math.random());
      const selected = pool.slice(0, count);
      if(!selected.length){ showToast('No questions for filter'); return; }
      activeQuiz = {questions:selected, current:0, score:0, answers:[], category:cat};
      renderQuiz(main);
    };
  } else {
    const q = activeQuiz.questions[activeQuiz.current];
    const progress = Math.round((activeQuiz.current/activeQuiz.questions.length)*100);
    main.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center"><button class="btn btn-sm" onclick="activeQuiz=null; renderQuiz(document.getElementById('main-content'))">← Exit Quiz</button><span class="badge">${activeQuiz.current+1}/${activeQuiz.questions.length}</span></div>
      <div class="progress" style="margin:12px 0"><div class="progress-bar" style="width:${progress}%"></div></div>
      <div class="card">
        <div style="display:flex;gap:8px;align-items:center"><span class="badge badge-primary">${q.difficulty}</span><span class="badge">${q.category}</span></div>
        <div style="font-weight:700;font-size:18px;margin-top:12px">${activeQuiz.current+1}. ${q.q}</div>
        <div style="margin-top:14px" id="quiz-options">${q.options.map((opt,i)=>`<div class="quiz-option" onclick="answerQuiz(${i})"><span>${String.fromCharCode(65+i)}.</span><span>${opt}</span></div>`).join('')}</div>
        <div id="quiz-explain" style="display:none;margin-top:12px" class="card" style="background:#f8fafc"></div>
      </div>
    `;
    window.answerQuiz = (selected)=>{
      const q = activeQuiz.questions[activeQuiz.current];
      const opts = document.querySelectorAll('#quiz-options .quiz-option');
      opts.forEach(o=>o.style.pointerEvents='none');
      const isCorrect = selected===q.answer;
      if(isCorrect){ opts[selected].classList.add('correct'); activeQuiz.score++; }
      else { opts[selected].classList.add('wrong'); opts[q.answer].classList.add('correct'); }
      activeQuiz.answers.push({selected, correct:isCorrect});
      const exp = document.getElementById('quiz-explain');
      exp.style.display='block';
      exp.innerHTML = `<div style="font-weight:600">${isCorrect?'✅ Correct':'❌ Wrong'}</div><div class="small" style="margin-top:6px">${q.explanation}</div><button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="nextQuizQ()">Next →</button>`;
      // track weak
      if(!isCorrect){
        const topicMatch = TOPICS.find(t=> t.title.toLowerCase().includes(q.category) || q.category.includes(t.categoryId));
        if(topicMatch){ state.weakTopics[topicMatch.id] = (state.weakTopics[topicMatch.id]||0)+1; }
      }
      saveState();
    };
    window.nextQuizQ = ()=>{
      activeQuiz.current++;
      if(activeQuiz.current>=activeQuiz.questions.length){
        // finish
        const score = activeQuiz.score;
        const total = activeQuiz.questions.length;
        state.quizAttempts.unshift({date:new Date().toISOString(), score, total, category:activeQuiz.category});
        saveState();
        const pct = Math.round(score/total*100);
        main.innerHTML = `
          <div class="card" style="text-align:center;padding:30px"><div style="font-size:48px">${pct>=70?'🎉':'💪'}</div><div class="h1">Quiz Finished!</div><div style="font-size:22px;font-weight:800;margin-top:8px">${score}/${total} • ${pct}%</div>
          <div class="progress" style="margin:16px auto;max-width:300px"><div class="progress-bar ${pct>=70?'success':''}" style="width:${pct}%"></div></div>
          <div class="small muted">Correct: ${score} • Wrong: ${total-score}</div>
          <div style="margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn btn-primary" onclick="activeQuiz=null; renderQuiz(document.getElementById('main-content'))">Take Another Quiz</button><button class="btn" onclick="navigate('revision')">Revise Weak Topics</button><button class="btn" onclick="navigate('dashboard')">Dashboard</button></div>
          <div class="card" style="background:#f8fafc;margin-top:16px;text-align:left"><div class="h3">Topics that need revision</div><div class="small muted" style="margin-top:6px">${activeQuiz.answers.map((a,i)=> !a.correct ? `• Q${i+1}: ${activeQuiz.questions[i].q.slice(0,60)}...` : '').filter(Boolean).join('<br>') || 'Great! No weak areas this time.'}</div></div>
          </div>
        `;
        activeQuiz=null;
      } else {
        renderQuiz(main);
      }
    };
  }
}

// Test Case Practice
function renderTestCasePractice(main){
  main.innerHTML = `
    <div class="h1">Test Case Practice 📋</div>
    <div class="muted small">Practice creating test scenarios, test cases, preconditions, expected results. System gives feedback and missing scenarios.</div>
    <div class="grid" style="grid-template-columns:320px 1fr;gap:16px;margin-top:16px">
      <div class="card" style="position:sticky;top:80px;height:fit-content">
        <div class="h3">Choose Feature</div>
        <select id="feature-select" class="select" style="margin-top:8px" onchange="loadFeature()">${PRACTICE_FEATURES.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}</select>
        <div id="feature-desc" style="margin-top:10px" class="small muted"></div>
        <div class="divider"></div>
        <div class="h3">Checklist – Did you consider?</div>
        <div class="small" style="margin-top:8px;line-height:1.8">
          • Invalid input<br>• Empty input<br>• Boundary values<br>• Network failure<br>• Timeout<br>• Server error<br>• Multiple attempts<br>• Security (SQLi, XSS)<br>• Different devices<br>• Screen sizes<br>• Accessibility<br>• Usability<br>• Duplicate actions
        </div>
        <div class="divider"></div>
        <div class="h3">Suggested Answer (hidden until you try)</div>
        <div id="suggested" style="margin-top:8px" class="small muted">Write your answer first, then click Check.</div>
      </div>
      <div class="card">
        <div class="h2">Create Test Scenarios</div>
        <div class="small muted">Example: "Create test scenarios for eSewa Login page."</div>
        <textarea id="tc-input" class="textarea" style="margin-top:10px;min-height:200px" placeholder="Write your test scenarios here...

Example format:
1. Scenario: Valid login
   Precondition: User registered
   Steps: Enter valid phone + MPIN, click login
   Expected: Login success, home page shown
   Priority: High
   Severity: Critical

2. Scenario: ..."></textarea>
        <div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-primary" onclick="checkTestCases()">Check & Get Feedback</button><button class="btn" onclick="document.getElementById('tc-input').value=''">Clear</button></div>
        <div id="tc-feedback" style="margin-top:12px"></div>

        <div class="divider"></div>
        <div class="h3">Airline App – Dedicated Practice</div>
        <div class="small muted">9 modules – random feature generator</div>
        <button class="btn btn-sm" style="margin-top:8px" onclick="randomAirlineFeature()">🎲 Give me random airline feature</button>
        <div id="airline-random" style="margin-top:8px"></div>
      </div>
    </div>
  `;
  loadFeature();
}
function loadFeature(){
  const sel = document.getElementById('feature-select');
  const f = PRACTICE_FEATURES.find(x=>x.id===sel.value);
  if(!f) return;
  document.getElementById('feature-desc').innerHTML = `<b>${f.name}</b><br>${f.desc}`;
  document.getElementById('suggested').innerHTML = `<div class="small muted">Suggested scenarios hidden – write first.</div>`;
}
function checkTestCases(){
  const sel = document.getElementById('feature-select');
  const f = PRACTICE_FEATURES.find(x=>x.id===sel.value);
  const input = document.getElementById('tc-input').value.trim();
  const fb = document.getElementById('tc-feedback');
  const sugg = document.getElementById('suggested');
  if(!input){ fb.innerHTML = '<span class="badge badge-warn">Write scenarios first</span>'; return; }
  const lower = input.toLowerCase();
  const mustKeywords = ['valid','invalid','empty','boundary','network','security','duplicate','timeout','error','mpin','password','login','payment','qr'];
  const found = mustKeywords.filter(k=> lower.includes(k));
  const missingScenarios = f.suggested.filter(s=> !lower.includes(s.split(' ')[0].toLowerCase()) && Math.random()>0.5).slice(0,5);
  fb.innerHTML = `
    <div class="card" style="background:#f0fdf4;border-color:#a7f3d0">
      <div style="font-weight:600">Feedback – Good start! 🎉</div>
      <div class="small" style="margin-top:6px">You covered ${found.length} key areas: ${found.join(', ')||'try to add more'}</div>
      <div class="small" style="margin-top:8px"><b>Missing / Better ideas:</b><br>${f.suggested.slice(0,8).map(s=>`• ${s}`).join('<br>')}</div>
      <div class="small" style="margin-top:8px"><b>Tips:</b> ${missingScenarios.length? 'You missed: '+missingScenarios.join(', ') : 'Great coverage!'}<br>Encourage negative testing: invalid, empty, boundary, network, security, usability.</div>
    </div>
  `;
  sugg.innerHTML = `<div class="small"><b>Suggested for ${f.name}:</b><br>${f.suggested.map(s=>`• ${s}`).join('<br>')}</div>`;
  state.practiceDone++; saveState(); showToast('Practice checked – feedback shown');
}
function randomAirlineFeature(){
  const modules = ['Home Page','Search Departure/Destination','Passenger Selection','Flight Results','Flight Details','Passenger Details','Booking Confirmation','Payment','Post-Booking'];
  const m = modules[Math.floor(Math.random()*modules.length)];
  document.getElementById('airline-random').innerHTML = `<div class="card" style="background:#eef2ff"><div style="font-weight:600">✈️ Test: ${m}</div><div class="small" style="margin-top:6px">Create 5 test scenarios for ${m} in airline app. Consider valid, invalid, empty, network, timeout, duplicate booking.</div></div>`;
}

// Bug Practice
function renderBugPractice(main){
  main.innerHTML = `
    <div class="h1">Bug Reporting Practice 🐛</div>
    <div class="muted small">Learn: Actual Result must be what you observed, not repeat Expected. Include evidence, steps, severity, priority.</div>
    <div class="grid" style="grid-template-columns:340px 1fr;gap:16px;margin-top:16px">
      <div class="card">
        <div class="h3">Bug Scenarios</div>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
          ${BUG_SCENARIOS.map(b=>`<div class="card" style="cursor:pointer;padding:10px" onclick="loadBug(${b.id})"><div style="font-weight:600">${b.title}</div><div class="small muted">${b.desc.slice(0,80)}...</div></div>`).join('')}
        </div>
        <div class="divider"></div>
        <button class="btn btn-sm" onclick="loadBug(${BUG_SCENARIOS[Math.floor(Math.random()*BUG_SCENARIOS.length)].id})">🎲 Random Bug</button>
      </div>
      <div class="card">
        <div id="bug-desc" class="card" style="background:#f8fafc">Select a bug scenario from left</div>
        <div style="margin-top:12px" id="bug-form">
          <div class="grid grid-2">
            <div><label class="small">Bug Title</label><input id="bug-title" class="input" placeholder="Clear, specific title"></div>
            <div><label class="small">Environment</label><input id="bug-env" class="input" placeholder="Android 13, eSewa v5.2, staging"></div>
          </div>
          <div style="margin-top:8px"><label class="small">Description</label><textarea id="bug-desc-input" class="textarea" placeholder="What happened?"></textarea></div>
          <div style="margin-top:8px"><label class="small">Steps to Reproduce</label><textarea id="bug-steps" class="textarea" placeholder="1. Open login&#10;2. Enter invalid password&#10;3. Click login"></textarea></div>
          <div class="grid grid-2" style="margin-top:8px"><div><label class="small">Expected Result</label><textarea id="bug-expected" class="textarea" placeholder="Should show friendly error 'Invalid MPIN'"></textarea></div><div><label class="small">Actual Result (what you SAW)</label><textarea id="bug-actual" class="textarea" placeholder="Shows backend stack trace NullPointerException..."></textarea></div></div>
          <div class="grid grid-2" style="margin-top:8px"><div><label class="small">Severity</label><select id="bug-sev" class="select"><option>Critical</option><option>Major</option><option>Minor</option><option>Trivial</option></select></div><div><label class="small">Priority</label><select id="bug-pri" class="select"><option>High</option><option>Medium</option><option>Low</option></select></div></div>
          <div style="margin-top:8px"><label class="small">Evidence (describe screenshot/video)</label><input id="bug-evidence" class="input" placeholder="Screenshot of error, video of steps"></div>
          <button class="btn btn-primary" style="margin-top:10px" onclick="evaluateBug()">Submit Bug Report for Review</button>
          <div id="bug-feedback" style="margin-top:12px"></div>
        </div>
      </div>
    </div>
  `;
  loadBug(BUG_SCENARIOS[0].id);
}
function loadBug(id){
  const b = BUG_SCENARIOS.find(x=>x.id===id);
  if(!b) return;
  const el = document.getElementById('bug-desc');
  if(el) el.innerHTML = `<div style="font-weight:700">${b.title}</div><div class="small" style="margin-top:6px">${b.desc}</div><div class="small muted" style="margin-top:6px">Hint: ${b.hint}</div>`;
  // prefill
  document.getElementById('bug-title').value = b.title;
}
function evaluateBug(){
  const title = document.getElementById('bug-title').value.trim();
  const steps = document.getElementById('bug-steps').value.trim();
  const expected = document.getElementById('bug-expected').value.trim();
  const actual = document.getElementById('bug-actual').value.trim();
  const fb = document.getElementById('bug-feedback');
  let issues=[];
  if(!title || title.length<10) issues.push('Title too short – make it specific');
  if(!steps || steps.split('\n').length<2) issues.push('Steps to reproduce need at least 2-3 steps');
  if(!expected) issues.push('Expected result missing');
  if(!actual) issues.push('Actual result missing – must describe what you observed');
  if(expected && actual && expected.toLowerCase()===actual.toLowerCase()) issues.push('❌ Critical: Actual Result repeats Expected! Actual must be what you SAW, not copy of expected. Example: Expected = friendly error, Actual = stack trace shown.');
  if(actual && actual.length<15) issues.push('Actual result too vague – include error message you saw');

  if(issues.length){
    fb.innerHTML = `<div class="card" style="background:var(--warning-light);border-color:#fde68a"><div style="font-weight:600">Needs improvement:</div><ul class="small" style="margin-top:6px">${issues.map(i=>`<li>${i}</li>`).join('')}</ul></div>`;
  } else {
    fb.innerHTML = `<div class="card" style="background:var(--success-light);border-color:#a7f3d0"><div style="font-weight:600">✅ Great bug report!</div><div class="small" style="margin-top:6px">Clear title, reproducible steps, expected vs actual distinct, evidence mentioned. This is what devs need.<br><br><b>Remember:</b> Actual = observed behavior (e.g., 'Shows NullPointerException at com.esewa...') not 'Should show error'.</div></div>`;
    state.practiceDone++; saveState();
  }
}

// API Practice
function renderApiPractice(main){
  main.innerHTML = `
    <div class="h1">API Practice 🔌</div>
    <div class="muted small">HTTP methods, status codes, Postman, REST, security</div>
    <div class="tabs" style="margin-top:12px"><div class="tab active" onclick="switchApiTab(this,'learn')">Learn</div><div class="tab" onclick="switchApiTab(this,'status')">Status Codes</div><div class="tab" onclick="switchApiTab(this,'postman')">Postman Simulator</div><div class="tab" onclick="switchApiTab(this,'sim')">API Simulator</div><div class="tab" onclick="switchApiTab(this,'quiz')">Quiz</div></div>
    <div id="api-area" style="margin-top:16px"></div>
  `;
  renderApiTab('learn');
}
function switchApiTab(el, tab){ el.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); el.classList.add('active'); renderApiTab(tab); }
function renderApiTab(tab){
  const area = document.getElementById('api-area');
  if(tab==='learn'){
    const topics = TOPICS.filter(t=>t.categoryId==='api');
    area.innerHTML = `<div class="grid grid-2">${topics.map(t=>topicCard(t)).join('')}</div>`;
  } else if(tab==='status'){
    area.innerHTML = `
      <div class="grid grid-3">
        ${[
          {code:200, meaning:'OK – success', example:'GET /flights returns flights'},
          {code:201, meaning:'Created – new resource made', example:'POST /bookings created booking'},
          {code:204, meaning:'No Content – success but no body', example:'DELETE success'},
          {code:400, meaning:'Bad Request – client sent wrong data', example:'Amount = abc'},
          {code:401, meaning:'Unauthorized – auth needed/failed', example:'No token or expired'},
          {code:403, meaning:'Forbidden – no permission', example:'Access other user data'},
          {code:404, meaning:'Not Found', example:'/users/9999'},
          {code:409, meaning:'Conflict – duplicate', example:'Booking same seat twice'},
          {code:422, meaning:'Unprocessable – validation failed', example:'Invalid email format'},
          {code:429, meaning:'Too Many Requests – rate limit', example:'100 req/sec exceeded'},
          {code:500, meaning:'Internal Server Error', example:'Backend crash'},
          {code:502, meaning:'Bad Gateway', example:'Upstream service down'},
          {code:503, meaning:'Service Unavailable', example:'Server overloaded'},
        ].map(s=>`<div class="card"><div style="font-weight:800;font-size:20px">${s.code}</div><div style="font-weight:600">${s.meaning}</div><div class="small muted" style="margin-top:4px">Ex: ${s.example}</div></div>`).join('')}
      </div>
    `;
  } else if(tab==='postman'){
    area.innerHTML = `
      <div class="grid grid-2">
        <div class="card">
          <div class="h3">Postman Concepts</div>
          <div class="small" style="margin-top:8px;line-height:1.8">
            <b>Collections:</b> Folder of requests (e.g., eSewa Login APIs)<br>
            <b>Environments:</b> dev/staging/prod variables – baseUrl changes<br>
            <b>Variables:</b> {{baseUrl}}, {{token}} – reuse<br>
            <b>Requests:</b> Method + URL + Headers + Body<br>
            <b>Headers:</b> Content-Type, Authorization<br>
            <b>Auth:</b> Bearer token, Basic, OAuth<br>
            <b>Test Scripts:</b> pm.test(\"Status 200\", ()=> pm.response.to.have.status(200))<br>
            <b>Assertions:</b> Check status, body, time<br>
            <b>Pre-request:</b> Set timestamp, generate data<br>
            <b>Runner:</b> Run collection with iterations
          </div>
          <div class="code-block" style="margin-top:10px">// Example test script
pm.test("Status 200", function(){
  pm.response.to.have.status(200);
});
pm.test("Response time < 500ms", function(){
  pm.expect(pm.response.responseTime).to.be.below(500);
});
pm.test("Has transaction id", function(){
  var json = pm.response.json();
  pm.expect(json.txnId).to.exist;
});</div>
        </div>
        <div class="card">
          <div class="h3">Postman Practice Exercises</div>
          <div id="postman-quiz"></div>
        </div>
      </div>
    `;
    const pq = document.getElementById('postman-quiz');
    pq.innerHTML = API_EXERCISES.map((q,i)=>`<div style="margin-top:10px;padding:10px;border:1px solid var(--border);border-radius:10px"><div style="font-weight:600">${i+1}. ${q.q}</div><div style="margin-top:6px">${q.options.map((o,oi)=>`<div class="quiz-option" onclick="checkPostman(this,${oi},${q.answer},'${q.explanation.replace(/'/g,"\\'")}')">${o}</div>`).join('')}</div><div class="small muted" style="display:none;margin-top:6px"></div></div>`).join('');
    window.checkPostman = (el, sel, correct, exp)=>{
      const parent = el.parentElement;
      parent.querySelectorAll('.quiz-option').forEach(o=>{o.classList.remove('correct','wrong'); o.style.pointerEvents='none';});
      if(sel===correct) el.classList.add('correct'); else { el.classList.add('wrong'); parent.children[correct].classList.add('correct'); }
      const fb = parent.nextElementSibling; fb.style.display='block'; fb.innerHTML = `<b>${sel===correct?'✅ Correct':'❌ Wrong'}:</b> ${exp}`;
    };
  } else if(tab==='sim'){
    area.innerHTML = `<div class="card"><div class="h3">API Simulator (Mock)</div><div style="margin-top:10px">${document.getElementById('sim-area')?.innerHTML || ''}</div><div id="api-sim-area"></div></div>`;
    // reuse earlier simulator
    setTimeout(()=>{
      const el = document.getElementById('api-sim-area');
      if(el){
        el.innerHTML = `
          <div style="display:flex;gap:8px;margin-top:8px"><select id="api-method2" class="select" style="width:100px"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select><input id="api-url2" class="input" value="/api/bookings" style="flex:1"></div>
          <textarea id="api-body2" class="textarea" style="margin-top:8px" placeholder='{"from":"KTM","to":"DEL"}'></textarea>
          <button class="btn btn-primary" style="margin-top:8px" onclick="simulateApi2()">Send</button>
          <div id="api-res2" style="margin-top:8px"></div>
        `;
      }
    },50);
    window.simulateApi2 = ()=>{
      const method = document.getElementById('api-method2').value;
      const url = document.getElementById('api-url2').value;
      const resEl = document.getElementById('api-res2');
      let status=200, body='{"message":"OK"}';
      if(method==='POST' && url.includes('bookings')){ status=201; body='{"bookingId":"B123","status":"confirmed","pnr":"ABC123"}'; }
      else if(url.includes('9999')){ status=404; body='{"error":"Not found"}'; }
      resEl.innerHTML = `<div class="code-block">HTTP/1.1 ${status}<br><br>${body}</div>`;
    };
  } else if(tab==='quiz'){
    const qArea = document.createElement('div');
    area.innerHTML = '<div id="api-quiz-area"></div>';
    activeQuiz = null;
    // reuse quiz rendering but filtered to api
    const main = { innerHTML:'' };
    // hack: call startQuiz logic
    let pool = QUIZ_BANK.filter(q=> q.category==='api' || q.q.toLowerCase().includes('api') || q.q.includes('HTTP'));
    const selected = pool.slice(0,5);
    activeQuiz = {questions:selected, current:0, score:0, answers:[], category:'api'};
    // render inline
    const renderInline = ()=>{
      const q = activeQuiz.questions[activeQuiz.current];
      document.getElementById('api-quiz-area').innerHTML = `
        <div class="card"><div class="h3">${activeQuiz.current+1}/${activeQuiz.questions.length} – ${q.q}</div><div style="margin-top:10px">${q.options.map((o,i)=>`<div class="quiz-option" onclick="answerApiQuiz(${i})">${o}</div>`).join('')}</div><div id="api-quiz-exp" style="display:none;margin-top:10px"></div></div>
      `;
    };
    window.answerApiQuiz = (sel)=>{
      const q = activeQuiz.questions[activeQuiz.current];
      const opts = document.querySelectorAll('#api-quiz-area .quiz-option');
      opts.forEach(o=>o.style.pointerEvents='none');
      const correct = sel===q.answer;
      opts[sel].classList.add(correct?'correct':'wrong');
      if(!correct) opts[q.answer].classList.add('correct');
      const exp = document.getElementById('api-quiz-exp');
      exp.style.display='block';
      exp.innerHTML = `<div class="small"><b>${correct?'✅ Correct':'❌ Wrong'}:</b> ${q.explanation}<br><button class="btn btn-sm btn-primary" style="margin-top:8px" onclick="nextApiQuiz()">Next</button></div>`;
      if(correct) activeQuiz.score++;
    };
    window.nextApiQuiz = ()=>{
      activeQuiz.current++;
      if(activeQuiz.current>=activeQuiz.questions.length){
        document.getElementById('api-quiz-area').innerHTML = `<div class="card" style="text-align:center"><div class="h2">Done! ${activeQuiz.score}/${activeQuiz.questions.length}</div><button class="btn" onclick="renderApiTab('quiz')">Restart</button></div>`;
        activeQuiz=null;
      } else renderInline();
    };
    renderInline();
  }
}

// Performance
function renderPerformancePractice(main){
  main.innerHTML = `
    <div class="h1">Performance Practice ⚡</div>
    <div class="muted small">Response time, latency, throughput, TPS, P95, P99, JMeter</div>
    <div class="tabs" style="margin-top:12px"><div class="tab active" onclick="switchPerfTab(this,'metrics')">Metrics</div><div class="tab" onclick="switchPerfTab(this,'jmeter')">JMeter Simulator</div><div class="tab" onclick="switchPerfTab(this,'types')">Types</div></div>
    <div id="perf-area" style="margin-top:16px"></div>
  `;
  renderPerfTab('metrics');
}
function switchPerfTab(el, tab){ el.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); el.classList.add('active'); renderPerfTab(tab); }
function renderPerfTab(tab){
  const area = document.getElementById('perf-area');
  if(tab==='metrics'){
    const metrics = [
      {name:'Response Time', mean:'Time from request to response', example:'Login API 800ms – user waits 0.8 sec', qa:'QA checks <2 sec for good UX, <500ms for API'},
      {name:'Latency', mean:'Delay before processing starts (network delay)', example:'Network latency 100ms', qa:'High latency = slow network'},
      {name:'Throughput', mean:'Requests handled per second', example:'100 TPS = 100 payments/sec', qa:'Higher is better, check under load'},
      {name:'TPS', mean:'Transactions Per Second – business', example:'Payment transaction', qa:'Business metric'},
      {name:'RPS', mean:'Requests Per Second – HTTP', example:'API calls per sec', qa:'May be more than TPS'},
      {name:'Error Rate', mean:'% failed requests', example:'2% errors under load', qa:'Should be <1%'},
      {name:'Concurrent Users', mean:'Users active at same time', example:'100 users searching flights together', qa:'Different from total users'},
      {name:'P95', mean:'95% requests faster than this', example:'P95 800ms means 5% slower', qa:'Better than average – shows real pain'},
      {name:'P99', mean:'99% faster than this – worst 1%', example:'P99 2 sec means 1% users wait 2 sec', qa:'Critical for UX'},
    ];
    area.innerHTML = `<div class="grid grid-2">${metrics.map(m=>`<div class="card"><div style="font-weight:700">${m.name}</div><div class="small" style="margin-top:4px"><b>What it means:</b> ${m.mean}<br><b>Simple example:</b> ${m.example}<br><b>What QA looks for:</b> ${m.qa}<br><b>Why it matters:</b> User experience & system health</div></div>`).join('')}</div>`;
  } else if(tab==='jmeter'){
    area.innerHTML = `
      <div class="grid grid-2">
        <div class="card">
          <div class="h3">JMeter Learning Simulator</div>
          <div class="small muted">Test Plan → Thread Group → HTTP Request → Listeners → Assertions → Results</div>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            <div><label class="small">Number of Threads (users)</label><input id="jm-threads" class="input" type="number" value="10"></div>
            <div><label class="small">Ramp-up (seconds to start all)</label><input id="jm-ramp" class="input" type="number" value="10"></div>
            <div><label class="small">Loop Count</label><input id="jm-loop" class="input" type="number" value="5"></div>
            <div><label class="small">Target API</label><input id="jm-api" class="input" value="/api/login"></div>
            <button class="btn btn-primary" onclick="runJMeterSim()">▶️ Run Test (Simulated)</button>
          </div>
          <div class="code-block" style="margin-top:12px">// Structure
Test Plan
 └─ Thread Group (10 users, ramp 10s, loop 5)
     └─ HTTP Request (GET /api/login)
     └─ Assertion (Status 200)
     └─ Listener (View Results Tree)</div>
        </div>
        <div class="card"><div class="h3">Results (Simulated)</div><div id="jm-results" class="small muted">Run test to see results – response time, throughput, error %, P95, P99</div></div>
      </div>
    `;
  } else {
    area.innerHTML = `<div class="grid grid-2">
      <div class="card"><div class="h3">Load Testing</div><div class="small">Test with expected users – e.g., 100 users searching flights</div></div>
      <div class="card"><div class="h3">Stress Testing</div><div class="small">Push beyond limits – 1000 users when expected 100, find breaking point</div></div>
      <div class="card"><div class="h3">Spike Testing</div><div class="small">Sudden spike 10→500 users instantly, check recovery</div></div>
      <div class="card"><div class="h3">Endurance Testing</div><div class="small">Run load 8 hours – find memory leaks</div></div>
      <div class="card"><div class="h3">Volume Testing</div><div class="small">Large data – 1M transactions in history</div></div>
      <div class="card"><div class="h3">Scalability Testing</div><div class="small">Can system scale up with more users/servers?</div></div>
    </div>`;
  }
}
function runJMeterSim(){
  const threads = parseInt(document.getElementById('jm-threads').value)||10;
  const ramp = parseInt(document.getElementById('jm-ramp').value)||10;
  const loop = parseInt(document.getElementById('jm-loop').value)||5;
  const totalReq = threads*loop;
  // simulate metrics
  const avgRT = 200 + Math.random()*300 + threads*2;
  const p95 = avgRT*1.8;
  const p99 = avgRT*2.5;
  const throughput = (totalReq / (ramp+10)).toFixed(1);
  const errRate = threads>50 ? (Math.random()*5).toFixed(1) : (Math.random()*0.8).toFixed(2);
  const res = document.getElementById('jm-results');
  res.innerHTML = `
    <div class="small">
      <b>Executed:</b> ${totalReq} requests (${threads} threads × ${loop} loops, ramp ${ramp}s)<br>
      <b>Avg Response Time:</b> ${avgRT.toFixed(0)} ms<br>
      <b>P95:</b> ${p95.toFixed(0)} ms (95% faster)<br>
      <b>P99:</b> ${p99.toFixed(0)} ms (99% faster)<br>
      <b>Throughput:</b> ${throughput} req/sec<br>
      <b>Error %:</b> ${errRate}%<br>
      <b>CPU:</b> ${Math.min(90, 20+threads*1.2).toFixed(0)}%<br>
      <b>Memory:</b> ${Math.min(85, 30+threads*0.8).toFixed(0)}%<br><br>
      <b>What QA looks for:</b><br>
      • Response time <500ms? ${avgRT<500?'✅':'⚠️ Too high'}<br>
      • P95 <1 sec? ${p95<1000?'✅':'⚠️ Slow for 5% users'}<br>
      • Error <1%? ${parseFloat(errRate)<1?'✅':'❌ High errors'}<br>
      • Throughput stable?<br><br>
      <span class="badge ${parseFloat(errRate)<1?'badge-success':'badge-danger'}">Result: ${parseFloat(errRate)<1 && avgRT<800 ? 'PASS' : 'NEEDS INVESTIGATION'}</span>
    </div>
  `;
  state.practiceDone++; saveState();
}

// Security
function renderSecurityPractice(main){
  main.innerHTML = `
    <div class="h1">Security Practice 🔒</div>
    <div class="muted small">Auth vs Authorization, IDOR, XSS, SQLi, JWT, OAuth, sensitive data</div>
    <div class="tabs" style="margin-top:12px"><div class="tab active" onclick="switchSecTab(this,'learn')">Learn</div><div class="tab" onclick="switchSecTab(this,'idor')">IDOR Lab</div><div class="tab" onclick="switchSecTab(this,'xss')">XSS Lab</div><div class="tab" onclick="switchSecTab(this,'jwt')">JWT Lab</div></div>
    <div id="sec-area" style="margin-top:16px"></div>
  `;
  renderSecTab('learn');
}
function switchSecTab(el, tab){ el.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active')); el.classList.add('active'); renderSecTab(tab); }
function renderSecTab(tab){
  const area = document.getElementById('sec-area');
  if(tab==='learn'){
    const topics = TOPICS.filter(t=>t.categoryId==='security');
    area.innerHTML = `<div class="grid grid-2">${topics.map(t=>topicCard(t)).join('')}</div>
      <div class="card" style="margin-top:16px"><div class="h3">OWASP API Top 10 (Simple)</div><div class="small" style="margin-top:8px;line-height:1.8">
        1. Broken Object Level Authorization (IDOR)<br>
        2. Broken Authentication<br>
        3. Broken Object Property Level Auth<br>
        4. Unrestricted Resource Consumption (no rate limit)<br>
        5. Broken Function Level Auth<br>
        6. Unrestricted Business Flow (e.g., unlimited coupon use)<br>
        7. Server Side Request Forgery<br>
        8. Security Misconfiguration<br>
        9. Improper Inventory Management<br>
        10. Unsafe Consumption of APIs
      </div></div>`;
  } else if(tab==='idor'){
    area.innerHTML = `
      <div class="card">
        <div class="h3">IDOR Lab – Insecure Direct Object Reference</div>
        <div class="small muted">Try changing user ID to access other's data. Should be blocked with 403.</div>
        <div style="margin-top:10px"><label class="small">API Endpoint</label><div style="display:flex;gap:8px;margin-top:4px"><input id="idor-url" class="input" value="/api/users/123/transactions"><button class="btn btn-primary" onclick="testIDOR()">Send</button></div></div>
        <div id="idor-res" style="margin-top:10px"></div>
        <div class="code-block" style="margin-top:10px">// As QA, test:
GET /api/users/123 -> your data OK
GET /api/users/124 -> should be 403 Forbidden, not 200 with other's data
GET /api/transactions?userId=123 change to 124 -> should be blocked</div>
      </div>
    `;
    window.testIDOR = ()=>{
      const url = document.getElementById('idor-url').value;
      const res = document.getElementById('idor-res');
      if(url.includes('124') || url.includes('125')){
        res.innerHTML = `<div class="card" style="background:var(--danger-light);border-color:#fecaca"><b>❌ VULNERABLE!</b> API returned 200 with other user's data – IDOR bug!<br>Expected: 403 Forbidden</div>`;
      } else {
        res.innerHTML = `<div class="card" style="background:var(--success-light);border-color:#a7f3d0"><b>✅ Secure</b> – Your own data returned 200 OK. Now try changing 123 to 124.</div>`;
      }
    };
  } else if(tab==='xss'){
    area.innerHTML = `
      <div class="card"><div class="h3">XSS Lab – Cross Site Scripting</div><div class="small muted">If you type &lt;script&gt;alert(1)&lt;/script&gt; in comment and it executes, it's XSS.</div>
        <input id="xss-input" class="input" placeholder="Type comment, try <script>alert(1)</script>" style="margin-top:10px">
        <button class="btn btn-primary" style="margin-top:8px" onclick="testXSS()">Submit Comment</button>
        <div id="xss-res" style="margin-top:10px"></div>
      </div>
    `;
    window.testXSS = ()=>{
      const val = document.getElementById('xss-input').value;
      const res = document.getElementById('xss-res');
      if(val.includes('<script>')){
        res.innerHTML = `<div class="card" style="background:var(--danger-light)"><b>❌ XSS Vulnerable!</b> Script tag not escaped – would execute.<br>Fix: Encode output, sanitize input.</div>`;
      } else {
        res.innerHTML = `<div class="card" style="background:var(--success-light)"><b>✅ Safe</b> – Input escaped: ${val.replace(/</g,'&lt;')}</div>`;
      }
    };
  } else if(tab==='jwt'){
    area.innerHTML = `
      <div class="card"><div class="h3">JWT Lab</div><div class="small muted">JWT = header.payload.signature – check expiry, tampering, sensitive data</div>
        <div class="code-block" style="margin-top:10px">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjE3MDU0MzQ0MDB9.signature
Payload decoded: {"userId":"123","exp":1705434400}
</div>
        <div style="margin-top:10px"><label class="small">Try tampering payload userId to 124</label><input id="jwt-input" class="input" value='{"userId":"124","exp":1705434400}'><button class="btn btn-sm" style="margin-top:6px" onclick="testJWT()">Verify Token</button><div id="jwt-res" style="margin-top:8px"></div></div>
      </div>
    `;
    window.testJWT = ()=>{
      const val = document.getElementById('jwt-input').value;
      const res = document.getElementById('jwt-res');
      if(val.includes('124')){
        res.innerHTML = `<div class="card" style="background:var(--danger-light)"><b>❌ If signature not validated, attacker can change ID to 124 and access other's data – IDOR via JWT!</b><br>QA checks: signature validation, expiry, no sensitive data in payload.</div>`;
      } else {
        res.innerHTML = `<div class="card" style="background:var(--success-light)"><b>✅ Valid token for your user</b></div>`;
      }
    };
  }
}

// Progress
function renderProgress(main){
  const completed = Object.keys(state.completed).length;
  const total = TOPICS.length;
  const pct = Math.round(completed/total*100);
  const byCat = CATEGORIES.map(c=>{
    const catTopics = TOPICS.filter(t=>t.categoryId===c.id);
    const done = catTopics.filter(t=>state.completed[t.id]).length;
    return {cat:c, done, total:catTopics.length, pct: catTopics.length? Math.round(done/catTopics.length*100):0};
  });
  main.innerHTML = `
    <div class="h1">Progress Tracking 📊</div>
    <div class="muted small">Overall learning, category progress, quiz accuracy, weak topics, streak</div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><div class="h3">Overall Progress</div><div style="font-size:28px;font-weight:800;margin-top:8px">${completed}/${total} • ${pct}%</div><div class="progress" style="margin-top:8px;height:10px"><div class="progress-bar" style="width:${pct}%"></div></div><div class="small muted" style="margin-top:8px">Levels: Beginner → Learning → Practicing → Comfortable</div>
        <div style="margin-top:12px">${Object.entries(state.completed).slice(0,6).map(([id,v])=>{ const t=TOPICS.find(x=>x.id===id); return `<div class="list-item"><span class="badge">${v.level||'Learning'}</span><span style="flex:1" class="small">${t?.title||id}</span><span class="small muted">${v.learnedAt? new Date(v.learnedAt).toLocaleDateString():''}</span></div>`}).join('') || '<span class="small muted">No topics yet</span>'}</div>
      </div>
      <div class="card"><div class="h3">Category Progress</div><div style="margin-top:10px;display:flex;flex-direction:column;gap:10px">${byCat.map(b=>`<div><div style="display:flex;justify-content:space-between"><span class="small" style="font-weight:600">${b.cat.icon} ${b.cat.name}</span><span class="small">${b.done}/${b.total} • ${b.pct}%</span></div><div class="progress" style="margin-top:4px"><div class="progress-bar" style="width:${b.pct}%"></div></div></div>`).join('')}</div></div>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><div class="h3">Quiz Accuracy</div><div style="font-size:22px;font-weight:800;margin-top:6px">${state.quizAttempts.length? Math.round(state.quizAttempts.reduce((s,a)=>s+a.score/a.total,0)/state.quizAttempts.length*100):0}% avg</div><div class="small muted">${state.quizAttempts.length} attempts</div><div style="margin-top:10px" class="list">${state.quizAttempts.slice(0,8).map(a=>`<div class="list-item"><span class="badge">${a.score}/${a.total}</span><span class="small" style="flex:1">${a.category} • ${new Date(a.date).toLocaleDateString()}</span><span class="badge ${a.score/a.total>=0.7?'badge-success':'badge-warn'}">${Math.round(a.score/a.total*100)}%</span></div>`).join('') || '<div class="small muted">No quizzes yet</div>'}</div></div>
      <div class="card"><div class="h3">Weak Topics & Revision History</div><div style="margin-top:10px">${getWeakTopics().length? getWeakTopics().map(t=>`<div class="list-item"><span class="dot" style="background:var(--warning)"></span><span style="flex:1">${t.title}</span><button class="btn btn-sm" onclick="navigate('learn-detail',{topicId:'${t.id}'})">Revise</button></div>`).join('') : '<div class="small muted">No weak topics – great!</div>'}<div class="divider"></div><div class="h3">Revision Due</div><div style="margin-top:6px">${getDueTopics().length? getDueTopics().map(t=>`<div class="list-item"><span class="dot"></span><span style="flex:1">${t.title}</span><span class="small muted">${t.categoryName}</span></div>`).join('') : '<div class="small muted">Nothing due today</div>'}</div></div></div>
    </div>
    <div class="card" style="margin-top:16px"><div class="h3">Learning Streak 🔥</div><div style="font-size:20px;font-weight:800;margin-top:6px">${state.streak} days</div><div class="small muted">Study daily to keep streak. Last studied: ${state.lastStudy? new Date(state.lastStudy).toLocaleString(): 'Never'}</div><div style="margin-top:10px;display:flex;gap:6px">${Array.from({length:14}).map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-13+i); const studied = state.lastStudy && new Date(state.lastStudy).toDateString()===d.toDateString() ? true : Math.random()>0.6 && i<state.streak; return `<div style="width:28px;height:28px;border-radius:8px;background:${studied?'var(--primary)':'var(--border2)'};display:grid;place-items:center;font-size:11px;color:${studied?'#fff':'var(--muted)'}">${d.getDate()}</div>`}).join('')}</div></div>
  `;
}

// Notes
function renderNotes(main){
  const allNotes = state.notes;
  const q = document.getElementById('global-search')?.value.toLowerCase()||'';
  const filtered = q ? allNotes.filter(n=> n.content.toLowerCase().includes(q) || (TOPICS.find(t=>t.id===n.topicId)?.title.toLowerCase().includes(q))) : allNotes;
  main.innerHTML = `
    <div class="h1">My Notes 📝</div>
    <div class="muted small">Personal notes for every topic – write in your own words. Search notes.</div>
    <div class="grid" style="grid-template-columns:1fr 320px;gap:16px;margin-top:16px">
      <div>
        <div class="card"><div style="display:flex;gap:8px"><input id="notes-search" class="input" placeholder="Search notes... (e.g., severity, JWT, QR)" value="${q}"><button class="btn" onclick="renderNotes(document.getElementById('main-content'))">Search</button></div>
          <div style="margin-top:12px" class="grid grid-1">${filtered.length? filtered.map(n=>{ const t=TOPICS.find(x=>x.id===n.topicId); return `<div class="card note-card"><div style="display:flex;justify-content:space-between"><span class="badge">${t?.title||n.topicId}</span><span class="small muted">${new Date(n.createdAt).toLocaleString()}</span></div><div style="margin-top:8px">${n.content}</div><div style="margin-top:8px;display:flex;gap:6px"><button class="btn btn-sm" onclick="editNotePrompt('${n.id}')">Edit</button><button class="btn btn-sm" onclick="deleteNoteGlobal('${n.id}')">Delete</button><button class="btn btn-sm" onclick="navigate('learn-detail',{topicId:'${n.topicId}'})">Open Topic</button></div></div>`}).join('') : '<div class="empty">No notes yet. Go to Learn → open topic → Add My Notes</div>'}</div>
        </div>
      </div>
      <div>
        <div class="card" style="position:sticky;top:80px"><div class="h3">Add Quick Note</div><select id="quick-note-topic" class="select" style="margin-top:8px">${TOPICS.map(t=>`<option value="${t.id}">${t.title}</option>`).join('')}</select><textarea id="quick-note-content" class="textarea" style="margin-top:8px" placeholder="Write note..."></textarea><button class="btn btn-primary" style="margin-top:8px" onclick="addQuickNote()">Save Note</button><div class="divider"></div><div class="h3">Stats</div><div class="small muted" style="margin-top:6px">Total notes: ${allNotes.length}<br>Topics with notes: ${new Set(allNotes.map(n=>n.topicId)).size}<br><br>Tip: Write what you understood, not copy textbook.</div></div>
      </div>
    </div>
  `;
}
function addQuickNote(){
  const topicId = document.getElementById('quick-note-topic').value;
  const content = document.getElementById('quick-note-content').value.trim();
  if(!content) return;
  state.notes.unshift({id:Date.now().toString(), topicId, content, createdAt:new Date().toISOString()});
  saveState(); document.getElementById('quick-note-content').value=''; renderNotes(document.getElementById('main-content')); showToast('Note saved');
}
function deleteNoteGlobal(id){ state.notes = state.notes.filter(n=>n.id!==id); saveState(); renderNotes(document.getElementById('main-content')); showToast('Deleted'); }
function editNotePrompt(id){
  const n = state.notes.find(x=>x.id===id);
  if(!n) return;
  const newContent = prompt('Edit note:', n.content);
  if(newContent!==null){ n.content = newContent; saveState(); renderNotes(document.getElementById('main-content')); }
}

// Init
function init(){
  loadState();
  // sidebar nav
  document.querySelectorAll('.nav-item').forEach(el=> el.addEventListener('click', ()=> navigate(el.dataset.view)));
  document.getElementById('global-search').addEventListener('input', ()=>{ if(currentView!=='learn') navigate('learn'); else render(); });
  document.getElementById('mobile-toggle').addEventListener('click', ()=> document.querySelector('.sidebar').classList.toggle('open'));
  navigate('dashboard');
  // expose globally for inline handlers
  window.navigate = navigate;
  window.toggleComplete = toggleComplete;
  window.updateLevel = updateLevel;
  window.addNote = addNote;
  window.deleteNote = deleteNote;
  window.evaluatePractice = evaluatePractice;
  window.checkTopicQuiz = checkTopicQuiz;
  window.startRevision = startRevision;
  window.practiceAirline = practiceAirline;
  window.switchSimTab = switchSimTab;
  window.simulateLogin = simulateLogin;
  window.simulatePay = simulatePay;
  window.simulateApi = simulateApi;
  window.selectChip = window.selectChip||(()=>{});
  window.startQuiz = window.startQuiz||(()=>{});
  window.answerQuiz = window.answerQuiz||(()=>{});
  window.nextQuizQ = window.nextQuizQ||(()=>{});
  window.loadFeature = loadFeature;
  window.checkTestCases = checkTestCases;
  window.randomAirlineFeature = randomAirlineFeature;
  window.loadBug = loadBug;
  window.evaluateBug = evaluateBug;
  window.switchApiTab = switchApiTab;
  window.renderApiTab = renderApiTab;
  window.switchPerfTab = switchPerfTab;
  window.renderPerfTab = renderPerfTab;
  window.runJMeterSim = runJMeterSim;
  window.switchSecTab = switchSecTab;
  window.renderSecTab = renderSecTab;
  window.addQuickNote = addQuickNote;
  window.deleteNoteGlobal = deleteNoteGlobal;
  window.editNotePrompt = editNotePrompt;
}
document.addEventListener('DOMContentLoaded', init);
