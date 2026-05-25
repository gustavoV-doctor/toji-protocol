/* =========================================================
   PROTOCOLO RESTRIÇÃO CELESTIAL — v2
   Lógica: rotação semanal + checklist da sessão (sem persistência)
   ========================================================= */

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// =====================================================
// BLOCOS DE TREINO — adaptados ao equipamento real
// (Smith, leg horizontal, polias, halteres ≤10kg, esteira)
// =====================================================
const BLOCKS = {
    A: {
        code: 'A',
        title: 'SUPERIOR PESADO',
        subtitle: 'Peito, costas, ombro e braço — carga, densidade e silêncio.',
        kanji: '鍛',
        exercises: [
            { name: 'Supino inclinado no Smith', reps: '4 × 6–8', cue: 'Banco a 30°. Desce devagar (3s), explode na subida. Sem rebote.' },
            { name: 'Puxada alta com pegada média', reps: '4 × 8–10', cue: 'Puxa até o peito superior, contrai a dorsal 1s. Sem usar tronco.' },
            { name: 'Desenvolvimento no Smith', reps: '4 × 6–8', cue: 'Banco reto, barra na linha do queixo. Ombro estável, sem arquear.' },
            { name: 'Remada na polia baixa', reps: '3 × 8–10', cue: 'Triângulo até o abdômen. Cotovelo colado ao corpo.' },
            { name: 'Elevação lateral (halter 8–10kg)', reps: '4 × 12–15', cue: 'Sobe controlado, cotovelo guia o movimento. Zero embalo.' },
            { name: 'Bi-set: tríceps polia + rosca polia', reps: '3 × 10–12 cada', cue: 'Sem pausa entre os dois. 60s entre bi-sets.' },
            { name: 'Esteira — corrida moderada', reps: '8 min', cue: 'Velocidade que te deixa respirando, mas conseguindo falar 3 palavras.' }
        ]
    },
    B: {
        code: 'B',
        title: 'INFERIOR',
        subtitle: 'Quadríceps, posterior, glúteo, panturrilha — a base do predador.',
        kanji: '脚',
        exercises: [
            { name: 'Agachamento no Smith', reps: '4 × 6–8', cue: 'Pés à frente da barra. Desce até coxa paralela. Foco em força.' },
            { name: 'Leg press horizontal', reps: '4 × 10–12', cue: 'Pés médios, amplitude total. Não trava o joelho em cima.' },
            { name: 'Cadeira flexora', reps: '4 × 10–12', cue: 'Contrai 1s no final. Excêntrica controlada (3s).' },
            { name: 'Cadeira extensora', reps: '4 × 12–15', cue: 'Pico de contração 2s. Sem balanço.' },
            { name: 'Afundo com halteres', reps: '3 × 10 cada perna', cue: 'Passo longo, joelho da frente alinhado ao pé.' },
            { name: 'Panturrilha no Smith em pé', reps: '4 × 15', cue: 'Sobe explosivo, desce em 3s. Amplitude máxima.' },
            { name: 'Caminhada inclinada', reps: '5 min · 12% incl.', cue: 'Sem segurar nas barras. Passos firmes.' }
        ]
    },
    C: {
        code: 'C',
        title: 'SUPERIOR VOLUME',
        subtitle: 'Hipertrofia e detalhe — abrir costas, peito alto, ombros 3D.',
        kanji: '形',
        exercises: [
            { name: 'Supino reto no Smith', reps: '4 × 8–10', cue: 'Cadência 2-1-2. Foco em sentir o peitoral médio.' },
            { name: 'Remada unilateral na polia alta', reps: '3 × 10–12 cada', cue: 'Puxa pra trás do quadril. Roda o ombro pra fora no final.' },
            { name: 'Crucifixo na polia (cruzado)', reps: '3 × 12–15', cue: 'Cabos baixos cruzando à frente. Aperta o peito 1s.' },
            { name: 'Puxada com pegada média', reps: '3 × 10–12', cue: 'Foco em contrair a dorsal, não em levantar peso.' },
            { name: 'Bi-set: lateral + posterior de ombro', reps: '3 × 12 cada', cue: 'Halter 5–8kg pra lateral. Inclinado pra posterior.' },
            { name: 'Rosca direta na polia + tríceps corda', reps: '3 × 10–12 cada', cue: 'Sem balanço. Aperta o tríceps no final, abre a corda.' },
            { name: 'Abdominal infra no chão', reps: '3 × 15', cue: 'Pernas estendidas, lombar colada. Subida lenta.' }
        ]
    },
    D: {
        code: 'D',
        title: 'INFERIOR + CARDIO',
        subtitle: 'Posterior, glúteo, condicionamento — a sessão que queima.',
        kanji: '燃',
        exercises: [
            { name: 'Stiff (romeno) no Smith', reps: '4 × 8–10', cue: 'Quadril pra trás, barra rente à perna. Sente o posterior.' },
            { name: 'Leg press — pés altos', reps: '3 × 12', cue: 'Pés no topo da plataforma. Foco em glúteo e posterior.' },
            { name: 'Flexora — drop-set', reps: '3 × 10 + 8 + 6', cue: 'Faz 10 com carga forte, baixa, mais 8, baixa, mais 6. Sem pausa.' },
            { name: 'Extensora — drop-set', reps: '3 × 12 + 10 + 8', cue: 'Mesmo esquema. Queima o quadríceps até o fim.' },
            { name: 'Step-up com halteres', reps: '3 × 10 cada perna', cue: 'Sobe usando o glúteo, não o impulso da perna de baixo.' },
            { name: 'Abdominal pernas elevadas', reps: '3 × 15', cue: 'Lombar no chão. Sobe contraindo, desce em 3s.' },
            { name: 'HIIT esteira', reps: '6 × (30s forte / 60s leve)', cue: 'Forte = velocidade que você mal aguenta. Leve = caminhada.' }
        ]
    }
};

// =====================================================
// ROTAÇÃO SEMANAL — 4 dias úteis + 3 de descanso
// 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb
// =====================================================
const WEEK = {
    0: { type: 'rest', label: 'Descanso' },
    1: { type: 'work', block: 'A' },
    2: { type: 'rest', label: 'Cardio leve · passos' },
    3: { type: 'work', block: 'B' },
    4: { type: 'rest', label: 'Descanso' },
    5: { type: 'work', block: 'C' },
    6: { type: 'work', block: 'D' }
};

// =====================================================
// MANIFESTOS DIÁRIOS — frases tom Toji (frias, cirúrgicas)
// =====================================================
const MANIFESTOS = [
    { pt: 'Sem talento. Só execução.', jp: '才能はいらない。実行だけだ。' },
    { pt: 'O fraco se justifica. Você treina.', jp: '弱者は言い訳する。お前は鍛える。' },
    { pt: 'Dor é informação. Continue.', jp: '痛みは情報だ。進め。' },
    { pt: 'Não negocie com a preguiça. Ela sempre vence.', jp: '怠惰と交渉するな。必ず負ける。' },
    { pt: 'Eles vão notar. Não pela palavra — pela presença.', jp: '言葉ではなく、存在で示せ。' },
    { pt: 'Cada repetição é um voto contra quem você era.', jp: '一回ごとに、過去の自分を否定しろ。' },
    { pt: 'Treine sem testemunha. O resultado fala.', jp: '見せるな。見せつけろ。' },
    { pt: 'Você não está cansado. Está confortável demais.', jp: '疲れではない。慣れすぎただけだ。' },
    { pt: 'Restrição celestial não é dom. É preço pago em silêncio.', jp: '天与呪縛は才能ではない。沈黙で払う代償だ。' },
    { pt: 'O nível em que você se torna inevitável existe. Caminhe até lá.', jp: '不可避になる地点がある。そこまで歩け。' }
];

// =====================================================
// HELPERS
// =====================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const WEEKDAY_PT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const WEEKDAY_FULL = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];

function pad2(n) { return String(n).padStart(2, '0'); }

function pickManifesto() {
    const day = new Date();
    const seed = day.getFullYear() * 1000 + (day.getMonth() * 31) + day.getDate();
    return MANIFESTOS[seed % MANIFESTOS.length];
}

function missionNumberToday() {
    // dia do ano
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// =====================================================
// RENDER
// =====================================================
function renderTopbar() {
    const now = new Date();
    const formatted = `${WEEKDAY_FULL[now.getDay()]} · ${pad2(now.getDate())}.${pad2(now.getMonth() + 1)}.${now.getFullYear()}`;
    $('#topbar-date').textContent = formatted;
}

function renderManifesto() {
    const m = pickManifesto();
    $('#manifesto-text').textContent = m.pt;
    $('#manifesto-jp').textContent = m.jp;
}

function renderHero(todayConfig) {
    const now = new Date();
    $('#hero-weekday').textContent = WEEKDAY_PT[now.getDay()];
    $('#hero-mission-num').textContent = `MISSÃO N° ${pad2(missionNumberToday())}`;

    if (todayConfig.type === 'rest') {
        $('#hero-title-main').innerHTML = 'DIA DE<br>DESCANSO';
        $('#hero-subtitle').textContent = todayConfig.label + ' — o músculo cresce no silêncio. Caminhe, hidrate, durma cedo.';
        $('#hero-kanji').textContent = '休';
        $('#stat-exercises').textContent = '0';
        $('#stat-block').textContent = '—';
        $$('.hero-stats')[0].style.opacity = '0.4';
        const cta = $('#hero-cta');
        if (cta) cta.style.display = 'none';
        return;
    }

    const block = BLOCKS[todayConfig.block];
    const titleHTML = block.title.includes(' ') ? block.title.replace(' ', '<br>') : block.title;
    $('#hero-title-main').innerHTML = titleHTML;
    $('#hero-subtitle').textContent = block.subtitle;
    $('#hero-kanji').textContent = block.kanji;
    $('#stat-exercises').textContent = block.exercises.length;
    $('#stat-block').textContent = block.code;
}

function renderWorkout(todayConfig) {
    const workoutEl = $('#workout');
    const restEl = $('#rest');

    if (todayConfig.type === 'rest') {
        workoutEl.hidden = true;
        restEl.hidden = false;
        return;
    }

    workoutEl.hidden = false;
    restEl.hidden = true;

    const block = BLOCKS[todayConfig.block];
    $('#workout-title').textContent = block.title;
    $('#progress-total').textContent = block.exercises.length;
    $('#progress-done').textContent = '0';
    $('#progress-bar').style.width = '0%';

    const list = $('#exercises');
    list.innerHTML = '';
    block.exercises.forEach((ex, i) => {
        const li = document.createElement('li');
        li.className = 'ex';
        li.style.animationDelay = (80 + i * 70) + 'ms';
        li.innerHTML = `
            <span class="ex-num">${pad2(i + 1)}</span>
            <div class="ex-body">
                <div class="ex-name">${ex.name}</div>
                <div class="ex-cue">${ex.cue}</div>
            </div>
            <span class="ex-reps">${ex.reps}</span>
            <span class="ex-check">
                <svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"></polyline></svg>
            </span>
        `;
        li.addEventListener('click', () => {
            li.classList.toggle('is-done');
            updateProgress();
        });
        list.appendChild(li);
    });

    $('#workout-foot').hidden = true;
}

function updateProgress() {
    const total = $$('.ex').length;
    const done = $$('.ex.is-done').length;
    const pct = total === 0 ? 0 : (done / total) * 100;
    $('#progress-done').textContent = done;
    $('#progress-bar').style.width = pct + '%';

    if (done === total && total > 0) {
        $('#workout-foot').hidden = false;
    } else {
        $('#workout-foot').hidden = true;
    }
}

function renderWeek() {
    const grid = $('#week-grid');
    grid.innerHTML = '';
    const todayDow = new Date().getDay();

    for (let dow = 1; dow <= 6; dow++) renderWeekCell(grid, dow, todayDow);
    renderWeekCell(grid, 0, todayDow); // Domingo no fim
}

function renderWeekCell(grid, dow, todayDow) {
    const cfg = WEEK[dow];
    const cell = document.createElement('div');
    cell.className = 'week-cell';
    if (dow === todayDow) cell.classList.add('is-today');
    if (cfg.type === 'rest') cell.classList.add('is-rest');

    let blockTxt = '休';
    let typeTxt = cfg.label || 'Descanso';
    if (cfg.type === 'work') {
        blockTxt = cfg.block;
        typeTxt = BLOCKS[cfg.block].title.split(' ')[0]; // primeira palavra
    }
    cell.innerHTML = `
        <span class="week-day-label">${WEEKDAY_PT[dow]}</span>
        <span class="week-day-block">${blockTxt}</span>
        <span class="week-day-type">${typeTxt}</span>
    `;
    grid.appendChild(cell);
}

function renderLibrary() {
    const tabs = $$('.lib-tab');
    const content = $('#library-content');

    function show(code) {
        const block = BLOCKS[code];
        let html = `
            <h4 class="lib-block-title">${block.title}</h4>
            <span class="lib-block-sub">Bloco ${block.code} · ${block.kanji}</span>
            <p style="color: var(--ink-2); margin-bottom: 20px; line-height: 1.6;">${block.subtitle}</p>
        `;
        block.exercises.forEach((ex, i) => {
            html += `
                <div class="lib-ex">
                    <span class="lib-ex-num">${pad2(i + 1)}</span>
                    <div>
                        <div class="lib-ex-name">${ex.name}</div>
                        <div class="lib-ex-cue">${ex.cue}</div>
                    </div>
                    <span class="lib-ex-reps">${ex.reps}</span>
                </div>
            `;
        });
        content.innerHTML = html;
    }

    tabs.forEach(t => {
        t.addEventListener('click', () => {
            tabs.forEach(x => x.classList.remove('is-active'));
            t.classList.add('is-active');
            show(t.dataset.block);
        });
    });

    show('A');
}

// =====================================================
// ANIMAÇÕES — scroll reveal, parallax, counter
// =====================================================
function setupReveals() {
    const targets = document.querySelectorAll(
        '.manifesto, .workout, .rest, .week, .library, .target, .bottom'
    );
    targets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(el => io.observe(el));
}

function setupParallax() {
    const bg = document.querySelector('.hero-bg');
    if (!bg) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            // Move o fundo do hero ~20% mais devagar que o scroll
            bg.style.transform = `translate3d(0, ${y * 0.25}px, 0) scale(1.04)`;
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function animateCount(el, target, duration = 1200) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = target;
        return;
    }
    const startTime = performance.now();
    function tick(now) {
        const t = Math.min(1, (now - startTime) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function animateHeroStats() {
    const stats = document.querySelectorAll('.hero-stats .stat-num');
    if (!stats.length) return;

    // Coleta alvos numéricos ANTES de zerar
    const targets = Array.from(stats).map(s => {
        const n = parseInt(s.textContent.trim(), 10);
        return isNaN(n) ? null : n;
    });

    // Se nenhum é numérico (dia de descanso), pula
    if (targets.every(t => t === null || t === 0)) return;

    // Zera os numéricos imediatamente
    stats.forEach((s, i) => {
        if (targets[i] !== null) s.textContent = '0';
    });

    // Anima após pequeno delay (alinha com hero entrance)
    setTimeout(() => {
        stats.forEach((s, i) => {
            if (targets[i] !== null) {
                animateCount(s, targets[i], 1100 + i * 120);
            }
        });
    }, 600);
}

// =====================================================
// INIT
// =====================================================
function init() {
    const dow = new Date().getDay();
    const todayConfig = WEEK[dow];

    renderTopbar();
    renderManifesto();
    renderHero(todayConfig);
    renderWorkout(todayConfig);
    renderWeek();
    renderLibrary();

    // Anima depois do render
    setupReveals();
    setupParallax();
    animateHeroStats();
}

document.addEventListener('DOMContentLoaded', init);
