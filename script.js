// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.log('SW failed:', err));
}

// ===== WORKOUT DATA =====
const WORKOUTS = {
    1: {
        name: 'PULL A',
        subtitle: 'Costas Pesado + Trapézio + Bíceps',
        kanji: '引',
        desc: 'Foco em carga pesada e compostos. Construa as costas de predador.',
        type: 'pull',
        exercises: [
            { name: 'Barra Fixa com Peso (Pull-up)', reps: '4x6-8 — Carga adicional, pegada pronada' },
            { name: 'Remada Curvada com Barra', reps: '4x6-8 — Puxada explosiva, sem embalo' },
            { name: 'Remada Cavalinho (T-Bar Row)', reps: '3x8-10 — Espessura no meio das costas' },
            { name: 'Encolhimento com Halteres (Shrug)', reps: '4x10-12 — Segura 2s no topo, trapézio grosso' },
            { name: 'Rosca Direta com Barra W', reps: '3x8-10 — Controle na excêntrica (3s descendo)' },
            { name: 'Rosca Martelo com Halteres', reps: '3x10-12 — Braquial e antebraço' },
        ]
    },
    2: {
        name: 'PUSH A',
        subtitle: 'Peito Pesado + Ombro + Tríceps',
        kanji: '押',
        desc: 'Carga máxima nos compostos. Construa a força de impacto.',
        type: 'push',
        exercises: [
            { name: 'Supino Reto com Barra', reps: '4x6-8 — Carga pesada, arco controlado' },
            { name: 'Supino Inclinado com Halteres', reps: '3x8-10 — Peitoral superior, amplitude total' },
            { name: 'Desenvolvimento com Halteres (sentado)', reps: '4x8-10 — Deltóide anterior e medial' },
            { name: 'Elevação Lateral com Halteres', reps: '4x12-15 — Ombro largo, sem embalo' },
            { name: 'Tríceps Testa com Barra W', reps: '3x8-10 — Cabeça longa do tríceps' },
            { name: 'Tríceps Pulley com Corda', reps: '3x12-15 — Abre no final, contração máxima' },
        ]
    },
    3: {
        name: 'LEGS A',
        subtitle: 'Quadríceps + Panturrilha + Core',
        kanji: '脚',
        desc: 'Pernas que saltam prédios e chutam feiticeiros.',
        type: 'legs',
        exercises: [
            { name: 'Agachamento Livre com Barra', reps: '4x6-8 — Profundo, joelho alinhado' },
            { name: 'Leg Press 45°', reps: '4x10-12 — Pés médios, amplitude completa' },
            { name: 'Cadeira Extensora', reps: '3x12-15 — Segura 2s no topo' },
            { name: 'Avanço (Lunge) com Halteres', reps: '3x10 cada perna — Passo longo' },
            { name: 'Panturrilha no Leg Press', reps: '4x15-20 — Amplitude total, pausa embaixo' },
            { name: 'Abdominal na Barra (Leg Raise)', reps: '4x12 — Core de pedra, controle total' },
        ]
    },
    4: {
        name: 'PULL B',
        subtitle: 'Costas Volume + Bíceps + Antebraço',
        kanji: '引',
        desc: 'Volume e contração. Detalhes que separam o predador da presa.',
        type: 'pull',
        exercises: [
            { name: 'Puxada Frontal no Cabo (pegada aberta)', reps: '4x10-12 — Squeeze na dorsal' },
            { name: 'Remada Unilateral com Halter (Serrote)', reps: '3x10-12 cada lado — Amplitude máxima' },
            { name: 'Remada na Polia Baixa (Seated Row)', reps: '3x10-12 — Triângulo, puxa pro abdômen' },
            { name: 'Face Pull', reps: '3x15 — Deltóide posterior + postura' },
            { name: 'Rosca Inclinada com Halteres', reps: '3x10-12 — Banco 45°, pico de bíceps' },
            { name: 'Rosca de Punho (Wrist Curl)', reps: '3x15 — Grip de ferro' },
        ]
    },
    5: {
        name: 'PUSH B',
        subtitle: 'Ombro Foco + Peito Volume + Tríceps',
        kanji: '押',
        desc: 'Ombros 3D e peito definido. A armadura celestial completa.',
        type: 'push',
        exercises: [
            { name: 'Desenvolvimento Arnold', reps: '4x8-10 — Rotação completa, 3 cabeças do deltóide' },
            { name: 'Elevação Lateral na Polia', reps: '4x12-15 — Tensão contínua, ombro redondo' },
            { name: 'Supino Inclinado com Barra', reps: '3x8-10 — Peitoral superior' },
            { name: 'Crucifixo na Polia (Crossover)', reps: '3x12-15 — Contração máxima' },
            { name: 'Mergulho no Paralelo', reps: '3x8-12 — Tronco reto = tríceps' },
            { name: 'Tríceps Francês com Halter', reps: '3x10-12 — Um halter, ambas as mãos' },
        ]
    },
    6: {
        name: 'LEGS B',
        subtitle: 'Posterior + Glúteo + Panturrilha + Core',
        kanji: '脚',
        desc: 'Posterior forte = explosão, velocidade e estabilidade.',
        type: 'legs',
        exercises: [
            { name: 'Stiff (Romeno) com Barra', reps: '4x8-10 — Quadril pra trás, barra rente à perna' },
            { name: 'Agachamento Búlgaro', reps: '3x10 cada perna — Pé no banco, desce fundo' },
            { name: 'Mesa Flexora', reps: '4x10-12 — Segura 2s na contração' },
            { name: 'Cadeira Abdutora', reps: '3x12-15 — Glúteo médio, estabilidade lateral' },
            { name: 'Panturrilha em Pé (Smith)', reps: '4x12-15 — Sobe devagar, desce controlado' },
            { name: 'Prancha com Peso', reps: '3x1 min — Anilha nas costas, core blindado' },
        ]
    }
};

// ===== MOTIVATIONAL QUOTES =====
const MOTIVATIONS = [
    { text: 'Enquanto os fracos dormem, o predador treina.', jp: '弱者が眠る間、捕食者は鍛える。' },
    { text: 'Seu corpo é sua única arma. Afie-o todos os dias.', jp: '体は唯一の武器。毎日研ぎ澄ませ。' },
    { text: 'A dor que você sente hoje é a força que você terá amanhã.', jp: '今日の痛みは明日の力。' },
    { text: 'Ninguém nasce forte. Você se torna forte por escolha.', jp: '強さは生まれつきではない。選択だ。' },
    { text: 'Cada série é um passo pra se tornar a anomalia.', jp: '一セットごとに異常へ近づく。' },
    { text: 'Sem energia amaldiçoada. Sem desculpas. Só trabalho.', jp: '呪力なし。言い訳なし。ただ鍛錬。' },
    { text: 'O clan te rejeitou. Prove que eles estavam errados.', jp: '禪院はお前を捨てた。奴らが間違いだと証明しろ。' },
    { text: 'Quando quiser parar, lembre por que começou.', jp: 'やめたくなったら、なぜ始めたか思い出せ。' },
    { text: 'Consistência é mais letal que talento.', jp: '継続は才能より致命的。' },
    { text: 'Você não precisa de jujutsu. Você É a arma.', jp: '呪術は要らない。お前自身が武器だ。' },
    { text: 'Mais um rep. Mais um passo. O Toji dentro de você exige.', jp: 'もう一回。もう一歩。内なる甚爾が求める。' },
    { text: 'Não treine pra ficar bonito. Treine pra ser perigoso.', jp: '見た目のためじゃない。危険であるために鍛えろ。' },
    { text: 'O descanso de ontem alimenta a brutalidade de hoje.', jp: '昨日の休息が今日の獰猛さを養う。' },
    { text: 'Feiticeiros confiam em técnica. Você confia no ferro.', jp: '術師は技に頼る。お前は鉄に頼れ。' },
    { text: 'A Restrição Celestial não é uma maldição. É uma dádiva.', jp: '天与呪縛は呪いではない。恩恵だ。' },
    { text: 'O shape do Toji não se constrói com preguiça.', jp: '甚爾の体は怠惰では作れない。' },
    { text: 'Hoje você sangra no treino. Amanhã eles sangram no tatame.', jp: '今日トレーニングで血を流せ。明日は奴らが流す。' },
    { text: 'Cada gota de suor é um selo de maldição que você quebra.', jp: '汗の一滴ごとに呪印を砕く。' },
    { text: 'Não existe overtraining. Existe under-eating e under-sleeping.', jp: 'オーバートレーニングはない。食事と睡眠の不足があるだけ。' },
    { text: 'O ferro nunca mente. Ele mostra exatamente onde você está.', jp: '鉄は嘘をつかない。お前の現在地を正確に示す。' },
    { text: 'Gojo é talento. Toji é trabalho. Seja Toji.', jp: '五条は才能。甚爾は努力。甚爾であれ。' },
];

// ===== PROGRESS MESSAGES =====
const PROGRESS_MSGS = {
    0:   { status: 'Hora de começar, assassino.', sub: 'Marque os exercícios conforme fizer.' },
    10:  { status: 'Aquecimento concluído.', sub: 'O verdadeiro trabalho começa agora.' },
    25:  { status: 'Sangue esquentando.', sub: 'Continue. O Toji não para aqui.' },
    50:  { status: 'Metade da missão.', sub: 'Você já está onde a maioria desiste.' },
    75:  { status: 'Quase lá, predador.', sub: 'Três quartos. Termine o que começou.' },
    90:  { status: 'Último exercício.', sub: 'Uma rep de cada vez. Finalize.' },
    100: { status: '天与呪縛 — MISSÃO COMPLETA.', sub: 'Você é a anomalia hoje.' },
};

// ===== STORAGE HELPERS =====
function getStorage(key, fallback) {
    try {
        const v = localStorage.getItem('toji_' + key);
        return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
}
function setStorage(key, value) {
    try { localStorage.setItem('toji_' + key, JSON.stringify(value)); } catch {}
}

function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ===== MAIN APP =====
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const jsDay = now.getDay(); // 0=Sun, 1=Mon...
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

    // Map JS day (0=Sun) to workout day (1-6, 0=rest)
    const workoutDayMap = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
    const workoutDay = workoutDayMap[jsDay];
    const isRestDay = workoutDay === 0;
    const workout = isRestDay ? null : WORKOUTS[workoutDay];

    // Date display
    const dateStr = `${dayNames[jsDay]}, ${now.getDate()} de ${monthNames[now.getMonth()]}`;
    document.getElementById('today-date').textContent = dateStr;

    // Streak & stats
    let streak = getStorage('streak', 0);
    let totalWorkouts = getStorage('totalWorkouts', 0);
    let lastCompleted = getStorage('lastCompleted', '');
    const todayCompleted = getStorage('completed_' + todayKey(), false);

    // Check if streak is broken (missed more than 1 day)
    if (lastCompleted) {
        const lastDate = new Date(lastCompleted);
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 2) { // Allow 1 rest day gap
            streak = 0;
            setStorage('streak', 0);
        }
    }

    document.getElementById('streak-count').textContent = streak;
    document.getElementById('total-workouts').textContent = totalWorkouts;

    // Daily motivation (seeded by date so it's consistent through the day)
    const seed = now.getFullYear() * 10000 + (now.getMonth()+1) * 100 + now.getDate();
    const quoteIndex = seed % MOTIVATIONS.length;
    const quote = MOTIVATIONS[quoteIndex];
    document.getElementById('motivation-text').textContent = `"${quote.text}"`;
    document.getElementById('motivation-jp').textContent = quote.jp;

    // Highlight today in week overview
    document.querySelectorAll('.week-day').forEach(el => {
        if (parseInt(el.dataset.day) === jsDay) {
            el.classList.add('today');
        }
    });

    // REST DAY
    if (isRestDay) {
        document.getElementById('today-title').textContent = 'DIA DE DESCANSO';
        document.getElementById('today-type').textContent = '休息 — Recuperação';
        document.getElementById('today-kanji').textContent = '休';
        document.getElementById('rest-day').style.display = 'block';
        document.getElementById('workout-today').style.display = 'none';
        document.getElementById('progress-feedback').style.display = 'none';
        setupAllWorkouts();
        return;
    }

    // WORKOUT DAY
    document.getElementById('today-title').textContent = `MISSÃO: ${workout.name}`;
    document.getElementById('today-type').textContent = workout.subtitle;
    document.getElementById('today-kanji').textContent = workout.kanji;

    // If already completed today
    if (todayCompleted) {
        showCelebration(streak, totalWorkouts, workout.exercises.length);
        setupAllWorkouts();
        return;
    }

    // Render today's workout
    renderWorkout(workout);
    setupAllWorkouts();

    // Progress tracking
    const checkboxes = document.querySelectorAll('#workout-today .ex-check');
    const totalExercises = checkboxes.length;

    // Restore checked state
    const savedChecks = getStorage('checks_' + todayKey(), []);
    checkboxes.forEach((cb, i) => {
        if (savedChecks[i]) {
            cb.checked = true;
            cb.closest('.exercise-item').classList.add('done');
        }
    });
    updateProgress(checkboxes, totalExercises);

    checkboxes.forEach((cb, i) => {
        cb.addEventListener('change', () => {
            // Save state
            const states = Array.from(checkboxes).map(c => c.checked);
            setStorage('checks_' + todayKey(), states);

            // Visual
            if (cb.checked) {
                cb.closest('.exercise-item').classList.add('done');
            } else {
                cb.closest('.exercise-item').classList.remove('done');
            }

            updateProgress(checkboxes, totalExercises);
        });
    });
});

function renderWorkout(workout) {
    const container = document.getElementById('workout-today');
    let html = `<div class="workout-card">
        <h3 class="workout-title">
            <span class="workout-kanji">${workout.kanji}</span>
            ${workout.name} <span class="workout-subtitle-inline">— ${workout.subtitle}</span>
        </h3>
        <p class="workout-desc">${workout.desc}</p>
        <ul class="exercise-list">`;

    workout.exercises.forEach((ex, i) => {
        html += `
            <li class="exercise-item" data-index="${i}">
                <label class="custom-checkbox">
                    <input type="checkbox" class="ex-check">
                    <span class="checkmark"></span>
                    <div class="exercise-info">
                        <span class="exercise-name">${ex.name}</span>
                        <span class="exercise-reps">${ex.reps}</span>
                    </div>
                </label>
            </li>`;
    });

    html += '</ul></div>';
    container.innerHTML = html;
}

function updateProgress(checkboxes, total) {
    const checked = Array.from(checkboxes).filter(c => c.checked).length;
    const pct = Math.round((checked / total) * 100);

    // Circle
    const circle = document.getElementById('progress-fill-circle');
    const circumference = 2 * Math.PI * 45;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference - (pct / 100) * circumference;

    // Percent text
    document.getElementById('progress-percent').textContent = `${pct}%`;

    // Message
    let msgKey = 0;
    const keys = Object.keys(PROGRESS_MSGS).map(Number).sort((a,b) => a-b);
    for (const k of keys) {
        if (pct >= k) msgKey = k;
    }
    const msg = PROGRESS_MSGS[msgKey];
    document.getElementById('progress-status').textContent = msg.status;
    document.getElementById('progress-sub').textContent = msg.sub;

    // Color shift
    if (pct >= 100) {
        circle.style.stroke = '#FFD700';
        document.getElementById('progress-percent').style.color = '#FFD700';
    } else if (pct >= 50) {
        circle.style.stroke = '#9333ea';
    } else {
        circle.style.stroke = '#6b21a8';
    }

    // Complete button
    const completeSection = document.getElementById('complete-section');
    if (pct >= 100) {
        completeSection.style.display = 'block';
        document.getElementById('complete-btn').onclick = () => completeWorkout();
    } else {
        completeSection.style.display = 'none';
    }
}

function completeWorkout() {
    let streak = getStorage('streak', 0);
    let totalWorkouts = getStorage('totalWorkouts', 0);
    const lastCompleted = getStorage('lastCompleted', '');
    const today = todayKey();

    // Check if already completed
    if (getStorage('completed_' + today, false)) return;

    // Update streak
    if (lastCompleted) {
        const lastDate = new Date(lastCompleted);
        const now = new Date();
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) {
            streak++;
        } else {
            streak = 1;
        }
    } else {
        streak = 1;
    }

    totalWorkouts++;

    setStorage('streak', streak);
    setStorage('totalWorkouts', totalWorkouts);
    setStorage('lastCompleted', today);
    setStorage('completed_' + today, true);

    // Update header stats
    document.getElementById('streak-count').textContent = streak;
    document.getElementById('total-workouts').textContent = totalWorkouts;

    const jsDay = new Date().getDay();
    const workoutDay = jsDay === 0 ? 0 : jsDay;
    const workout = WORKOUTS[workoutDay];
    showCelebration(streak, totalWorkouts, workout ? workout.exercises.length : 0);
}

function showCelebration(streak, total, exercises) {
    document.getElementById('workout-today').style.display = 'none';
    document.getElementById('complete-section').style.display = 'none';
    document.getElementById('progress-feedback').style.display = 'none';

    const cel = document.getElementById('celebration');
    cel.style.display = 'block';

    document.getElementById('cel-streak').textContent = streak;
    document.getElementById('cel-total').textContent = total;
    document.getElementById('cel-exercises').textContent = exercises;

    // Random celebration text
    const celTexts = [
        'O Toji de hoje ficaria orgulhoso. Descanse e volte mais forte.',
        'Missão cumprida. O clã Zen\'in nunca teria previsto isso.',
        'Mais um dia onde você provou que não precisa de jujutsu.',
        'O assassino completou a missão. Agora recupere.',
        'Restrição Celestial ativada. Corpo forjado. Descanse.'
    ];
    const seed = new Date().getDate();
    document.getElementById('celebration-text').textContent = celTexts[seed % celTexts.length];
}

function setupAllWorkouts() {
    const container = document.getElementById('all-workouts-content');
    let html = '';

    for (let day = 1; day <= 6; day++) {
        const w = WORKOUTS[day];
        html += `<div class="all-day-content ${day === 1 ? 'active' : ''}" id="all-day${day}">
            <h4 class="all-day-title"><span class="workout-kanji">${w.kanji}</span> ${w.name} — ${w.subtitle}</h4>
            <ul class="all-exercise-list">`;
        w.exercises.forEach(ex => {
            html += `<li><strong>${ex.name}</strong><br><span class="all-ex-reps">${ex.reps}</span></li>`;
        });
        html += '</ul></div>';
    }

    container.innerHTML = html;

    // Mini tab switching
    document.querySelectorAll('.mini-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mini-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.all-day-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });
}
