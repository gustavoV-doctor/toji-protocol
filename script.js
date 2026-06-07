/* =========================================================
   PROTOCOLO RESTRIÇÃO CELESTIAL — v3
   Lógica: rotação semanal + REGISTRO de carga×reps + persistência
           + progressão (1RM estimado) + dupla progressão
   ========================================================= */

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}

/* =====================================================
   BLOCOS DE TREINO — augmentados com campos estruturados
   sets / repLow / repHigh / track ('load' | 'bodyweight' | 'cardio')
   (mantém 'reps' como string de exibição)
   ===================================================== */
const BLOCKS = {
    A: {
        code: 'A',
        title: 'SUPERIOR PESADO',
        subtitle: 'Peito, costas, ombro e braço — carga, densidade e silêncio.',
        kanji: '鍛',
        exercises: [
            { name: 'Supino inclinado no Smith', reps: '4 × 6–8', cue: 'Banco a 30°. Desce devagar (3s), explode na subida. Sem rebote.', sets: 4, repLow: 6, repHigh: 8, track: 'load' },
            { name: 'Puxada alta com pegada média', reps: '4 × 8–10', cue: 'Puxa até o peito superior, contrai a dorsal 1s. Sem usar tronco.', sets: 4, repLow: 8, repHigh: 10, track: 'load' },
            { name: 'Desenvolvimento no Smith', reps: '4 × 6–8', cue: 'Banco reto, barra na linha do queixo. Ombro estável, sem arquear.', sets: 4, repLow: 6, repHigh: 8, track: 'load' },
            { name: 'Remada na polia baixa', reps: '3 × 8–10', cue: 'Triângulo até o abdômen. Cotovelo colado ao corpo.', sets: 3, repLow: 8, repHigh: 10, track: 'load' },
            { name: 'Elevação lateral (halter 8–10kg)', reps: '4 × 12–15', cue: 'Sobe controlado, cotovelo guia o movimento. Zero embalo.', sets: 4, repLow: 12, repHigh: 15, track: 'load' },
            { name: 'Bi-set: tríceps polia + rosca polia', reps: '3 × 10–12 cada', cue: 'Sem pausa entre os dois. 60s entre bi-sets.', sets: 3, repLow: 10, repHigh: 12, track: 'load' },
            { name: 'Esteira — corrida moderada', reps: '8 min', cue: 'Velocidade que te deixa respirando, mas conseguindo falar 3 palavras.', sets: 0, repLow: 0, repHigh: 0, track: 'cardio' }
        ]
    },
    B: {
        code: 'B',
        title: 'INFERIOR',
        subtitle: 'Quadríceps, posterior, glúteo, panturrilha — a base do predador.',
        kanji: '脚',
        exercises: [
            { name: 'Agachamento no Smith', reps: '4 × 6–8', cue: 'Pés à frente da barra. Desce até coxa paralela. Foco em força.', sets: 4, repLow: 6, repHigh: 8, track: 'load' },
            { name: 'Leg press horizontal', reps: '4 × 10–12', cue: 'Pés médios, amplitude total. Não trava o joelho em cima.', sets: 4, repLow: 10, repHigh: 12, track: 'load' },
            { name: 'Cadeira flexora', reps: '4 × 10–12', cue: 'Contrai 1s no final. Excêntrica controlada (3s).', sets: 4, repLow: 10, repHigh: 12, track: 'load' },
            { name: 'Cadeira extensora', reps: '4 × 12–15', cue: 'Pico de contração 2s. Sem balanço.', sets: 4, repLow: 12, repHigh: 15, track: 'load' },
            { name: 'Afundo com halteres', reps: '3 × 10 cada perna', cue: 'Passo longo, joelho da frente alinhado ao pé.', sets: 3, repLow: 10, repHigh: 10, track: 'load' },
            { name: 'Panturrilha no Smith em pé', reps: '4 × 15', cue: 'Sobe explosivo, desce em 3s. Amplitude máxima.', sets: 4, repLow: 15, repHigh: 15, track: 'load' },
            { name: 'Caminhada inclinada', reps: '5 min · 12% incl.', cue: 'Sem segurar nas barras. Passos firmes.', sets: 0, repLow: 0, repHigh: 0, track: 'cardio' }
        ]
    },
    C: {
        code: 'C',
        title: 'SUPERIOR VOLUME',
        subtitle: 'Hipertrofia e detalhe — abrir costas, peito alto, ombros 3D.',
        kanji: '形',
        exercises: [
            { name: 'Supino reto no Smith', reps: '4 × 8–10', cue: 'Cadência 2-1-2. Foco em sentir o peitoral médio.', sets: 4, repLow: 8, repHigh: 10, track: 'load' },
            { name: 'Remada unilateral na polia alta', reps: '3 × 10–12 cada', cue: 'Puxa pra trás do quadril. Roda o ombro pra fora no final.', sets: 3, repLow: 10, repHigh: 12, track: 'load' },
            { name: 'Crucifixo na polia (cruzado)', reps: '3 × 12–15', cue: 'Cabos baixos cruzando à frente. Aperta o peito 1s.', sets: 3, repLow: 12, repHigh: 15, track: 'load' },
            { name: 'Puxada com pegada média', reps: '3 × 10–12', cue: 'Foco em contrair a dorsal, não em levantar peso.', sets: 3, repLow: 10, repHigh: 12, track: 'load' },
            { name: 'Bi-set: lateral + posterior de ombro', reps: '3 × 12 cada', cue: 'Halter 5–8kg pra lateral. Inclinado pra posterior.', sets: 3, repLow: 12, repHigh: 12, track: 'load' },
            { name: 'Rosca direta na polia + tríceps corda', reps: '3 × 10–12 cada', cue: 'Sem balanço. Aperta o tríceps no final, abre a corda.', sets: 3, repLow: 10, repHigh: 12, track: 'load' },
            { name: 'Abdominal infra no chão', reps: '3 × 15', cue: 'Pernas estendidas, lombar colada. Subida lenta.', sets: 3, repLow: 15, repHigh: 15, track: 'bodyweight' }
        ]
    },
    D: {
        code: 'D',
        title: 'INFERIOR + CARDIO',
        subtitle: 'Posterior, glúteo, condicionamento — a sessão que queima.',
        kanji: '燃',
        exercises: [
            { name: 'Stiff (romeno) no Smith', reps: '4 × 8–10', cue: 'Quadril pra trás, barra rente à perna. Sente o posterior.', sets: 4, repLow: 8, repHigh: 10, track: 'load' },
            { name: 'Leg press — pés altos', reps: '3 × 12', cue: 'Pés no topo da plataforma. Foco em glúteo e posterior.', sets: 3, repLow: 12, repHigh: 12, track: 'load' },
            { name: 'Flexora — drop-set', reps: '3 × 10 + 8 + 6', cue: 'Faz 10 com carga forte, baixa, mais 8, baixa, mais 6. Sem pausa.', sets: 3, repLow: 6, repHigh: 10, track: 'load' },
            { name: 'Extensora — drop-set', reps: '3 × 12 + 10 + 8', cue: 'Mesmo esquema. Queima o quadríceps até o fim.', sets: 3, repLow: 8, repHigh: 12, track: 'load' },
            { name: 'Step-up com halteres', reps: '3 × 10 cada perna', cue: 'Sobe usando o glúteo, não o impulso da perna de baixo.', sets: 3, repLow: 10, repHigh: 10, track: 'load' },
            { name: 'Abdominal pernas elevadas', reps: '3 × 15', cue: 'Lombar no chão. Sobe contraindo, desce em 3s.', sets: 3, repLow: 15, repHigh: 15, track: 'bodyweight' },
            { name: 'HIIT esteira', reps: '6 × (30s forte / 60s leve)', cue: 'Forte = velocidade que você mal aguenta. Leve = caminhada.', sets: 0, repLow: 0, repHigh: 0, track: 'cardio' }
        ]
    }
};

/* =====================================================
   ROTAÇÃO SEMANAL — 4 dias úteis + 3 de descanso
   0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb
   ===================================================== */
const WEEK = {
    0: { type: 'rest', label: 'Descanso' },
    1: { type: 'work', block: 'A' },
    2: { type: 'rest', label: 'Cardio leve · passos' },
    3: { type: 'work', block: 'B' },
    4: { type: 'rest', label: 'Descanso' },
    5: { type: 'work', block: 'C' },
    6: { type: 'work', block: 'D' }
};

/* =====================================================
   MANIFESTOS DIÁRIOS — frases tom Toji
   ===================================================== */
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

/* =====================================================
   HELPERS
   ===================================================== */
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
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Número PT-BR (vírgula decimal), sem zeros à toa
function fmt(n, dec = 1) {
    if (n == null || isNaN(n)) return '—';
    const r = Number(n).toFixed(dec);
    return r.replace(/\.0+$/, '').replace('.', ',');
}
// Parse de input PT-BR ("42,5" → 42.5)
function parseNum(v) {
    if (v == null) return null;
    const s = String(v).trim().replace(',', '.');
    if (s === '') return null;
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
}
function todayKey(d = new Date()) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function dateKeyOf(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function fmtDataCurta(iso) {
    const d = new Date(iso);
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

/* =====================================================
   PERSISTÊNCIA — localStorage versionado + degradação
   ===================================================== */
const STORE_KEY = 'toji:sessoes:v1';
const DRAFT_KEY = 'toji:rascunho:v1';
let memFallback = {};       // usado se localStorage indisponível
let STORAGE_OK = true;

function storageDisponivel() {
    try {
        const k = '__toji_test__';
        localStorage.setItem(k, k); localStorage.removeItem(k);
        return true;
    } catch (e) { return false; }
}
function lerBruto(key) {
    if (!STORAGE_OK) return memFallback[key] ?? null;
    try { return localStorage.getItem(key); }
    catch (e) { return memFallback[key] ?? null; }
}
function gravarBruto(key, val) {
    if (!STORAGE_OK) { memFallback[key] = val; return false; }
    try { localStorage.setItem(key, val); return true; }
    catch (e) { memFallback[key] = val; return false; }
}
function carregarSessoes() {
    const raw = lerBruto(STORE_KEY);
    if (!raw) return [];
    try {
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data.filter(s => s && s.exercicios) : [];
    } catch (e) { return []; }
}
function salvarSessoes(arr) {
    return gravarBruto(STORE_KEY, JSON.stringify(arr));
}

let SESSOES = [];          // estado em memória (espelha o storage)

/* =====================================================
   LÓGICA PURA — 1RM, melhor série, dupla progressão
   ===================================================== */
function est1RM(carga, reps) {
    if (carga == null || reps == null || carga <= 0 || reps <= 0) return null;
    return carga * (1 + reps / 30);   // Epley
}
// Melhor série de um exercício registrado (load: maior 1RM; bodyweight: mais reps)
function melhorSerie(exReg) {
    if (!exReg || !exReg.series) return null;
    if (exReg.track === 'bodyweight') {
        const v = exReg.series.filter(s => s.reps > 0);
        if (!v.length) return null;
        return v.reduce((b, s) => (s.reps > b.reps ? s : b));
    }
    const v = exReg.series.filter(s => est1RM(s.carga, s.reps) != null);
    if (!v.length) return null;
    return v.reduce((b, s) => (est1RM(s.carga, s.reps) > est1RM(b.carga, b.reps) ? s : b));
}
// Sessões que contêm um exercício, mais recentes primeiro
function sessoesDoExercicio(nome) {
    return SESSOES
        .filter(se => se.exercicios.some(e => e.name === nome))
        .sort((a, b) => new Date(b.data) - new Date(a.data));
}
// Curva temporal (antiga → nova)
function curvaExercicio(nome) {
    const exDef = acharExercicio(nome);
    const track = exDef ? exDef.track : 'load';
    return SESSOES
        .filter(se => se.exercicios.some(e => e.name === nome))
        .map(se => {
            const ex = se.exercicios.find(e => e.name === nome);
            const best = melhorSerie(ex);
            if (!best) return null;
            if (track === 'bodyweight') {
                return { data: se.data, carga: best.carga, reps: best.reps, valor: best.reps, e1rm: null };
            }
            const e = est1RM(best.carga, best.reps);
            return { data: se.data, carga: best.carga, reps: best.reps, valor: e, e1rm: e };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.data) - new Date(b.data));
}
// Status de sobrecarga — baseado na última sessão registrada
function statusSobrecarga(exDef) {
    if (exDef.track === 'cardio') return { tipo: 'cardio' };
    const hist = sessoesDoExercicio(exDef.name);
    if (!hist.length) return { tipo: 'novo' };
    const ex = hist[0].exercicios.find(e => e.name === exDef.name);
    const series = (ex.series || []).filter(s => s.reps > 0);
    if (!series.length) return { tipo: 'novo' };
    const bateuTopo = series.every(s => s.reps >= exDef.repHigh);
    if (bateuTopo) {
        return { tipo: exDef.track === 'bodyweight' ? 'progredir' : 'subir_carga', topo: exDef.repHigh };
    }
    return { tipo: 'ganhar_reps', topo: exDef.repHigh };
}
// Referência da última sessão por índice de série → "40×8"
function refUltima(nome, i) {
    const hist = sessoesDoExercicio(nome);
    if (!hist.length) return null;
    const ex = hist[0].exercicios.find(e => e.name === nome);
    const s = ex && ex.series ? ex.series[i] : null;
    if (!s) {
        const best = melhorSerie(ex);
        if (!best) return null;
        return best.carga != null ? `${fmt(best.carga)}×${best.reps}` : `×${best.reps}`;
    }
    if (s.carga != null && s.reps != null) return `${fmt(s.carga)}×${s.reps}`;
    if (s.reps != null) return `×${s.reps}`;
    return null;
}
function acharExercicio(nome) {
    for (const code of Object.keys(BLOCKS)) {
        const ex = BLOCKS[code].exercises.find(e => e.name === nome);
        if (ex) return ex;
    }
    return null;
}
// Semana ISO — segunda como início
function inicioSemana(d = new Date()) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = (x.getDay() + 6) % 7;      // 0 = segunda
    x.setDate(x.getDate() - dow);
    x.setHours(0, 0, 0, 0);
    return x;
}
function sessoesDaSemana(d = new Date()) {
    const ini = inicioSemana(d);
    const fim = new Date(ini); fim.setDate(ini.getDate() + 7);
    return SESSOES.filter(s => { const dt = new Date(s.data); return dt >= ini && dt < fim; });
}

/* =====================================================
   RASCUNHO DO DIA (autosave de inputs em edição)
   ===================================================== */
function lerRascunho() {
    const raw = lerBruto(DRAFT_KEY);
    if (!raw) return null;
    try { const d = JSON.parse(raw); return d && d.dia === todayKey() ? d : null; }
    catch (e) { return null; }
}
function salvarRascunho(bloco, dados) {
    gravarBruto(DRAFT_KEY, JSON.stringify({ dia: todayKey(), bloco, dados }));
}
function limparRascunho() { gravarBruto(DRAFT_KEY, JSON.stringify({ dia: '', bloco: '', dados: {} })); }

/* =====================================================
   RENDER — topbar / manifesto / hero (do app original)
   ===================================================== */
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
        const hs = $$('.hero-stats')[0]; if (hs) hs.style.opacity = '0.4';
        const cta = $('#hero-cta'); if (cta) cta.style.display = 'none';
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

/* =====================================================
   RENDER — TREINO DE HOJE (com registro de carga×reps)
   ===================================================== */
let BLOCO_HOJE = null;

function renderWorkout(todayConfig) {
    const workoutEl = $('#workout');
    const restEl = $('#rest');
    const fecharBtn = $('#fechar-sessao');

    if (todayConfig.type === 'rest') {
        workoutEl.hidden = true;
        restEl.hidden = false;
        if (fecharBtn) fecharBtn.hidden = true;
        return;
    }
    workoutEl.hidden = false;
    restEl.hidden = true;

    const block = BLOCKS[todayConfig.block];
    BLOCO_HOJE = block.code;
    $('#workout-title').textContent = block.title;
    $('#progress-total').textContent = block.exercises.length;

    // Pré-preenchimento: sessão de hoje já fechada > rascunho do dia
    const sessaoHoje = SESSOES.find(s => dateKeyOf(s.data) === todayKey() && s.bloco === block.code);
    const rascunho = !sessaoHoje ? lerRascunho() : null;

    const list = $('#exercises');
    list.innerHTML = '';

    block.exercises.forEach((ex, i) => {
        const li = document.createElement('li');
        li.className = 'ex';
        li.dataset.name = ex.name;
        li.dataset.track = ex.track;
        li.style.animationDelay = (60 + i * 55) + 'ms';

        // valores pré-preenchidos
        let pre = [];
        if (sessaoHoje) {
            const exr = sessaoHoje.exercicios.find(e => e.name === ex.name);
            if (exr) pre = exr.series;
        } else if (rascunho && rascunho.dados[ex.name]) {
            pre = rascunho.dados[ex.name];
        }

        const status = statusSobrecarga(ex);
        const badge = badgeHTML(status);

        if (ex.track === 'cardio') {
            const doneCardio = (pre[0] && pre[0].concluido) || (sessaoHoje && cardioFeito(sessaoHoje, ex.name));
            li.innerHTML = `
                <span class="ex-num">${pad2(i + 1)}</span>
                <div class="ex-body">
                    <div class="ex-head"><div class="ex-name">${ex.name}</div></div>
                    <div class="ex-cue">${ex.cue}</div>
                </div>
                <span class="ex-reps">${ex.reps}</span>
                <span class="ex-check" role="checkbox" tabindex="0" aria-label="Marcar ${ex.name} como concluído">
                    <svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"></polyline></svg>
                </span>`;
            if (doneCardio) li.classList.add('is-done');
            const toggle = () => { li.classList.toggle('is-done'); onLogChange(); };
            li.querySelector('.ex-check').addEventListener('click', toggle);
            li.querySelector('.ex-check').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        } else {
            // load / bodyweight → linhas de série
            let seriesHTML = '';
            for (let s = 0; s < ex.sets; s++) {
                const pv = pre[s] || {};
                const ref = refUltima(ex.name, s);
                const cargaInput = ex.track === 'bodyweight'
                    ? `<span class="serie-bw">peso corporal</span>`
                    : `<input class="serie-carga" inputmode="decimal" placeholder="·" aria-label="carga série ${s + 1} de ${ex.name}" value="${pv.carga != null ? fmt(pv.carga) : ''}"><span class="serie-u">KG</span><span class="serie-x">×</span>`;
                seriesHTML += `
                    <div class="serie" data-i="${s}">
                        <span class="serie-n">s${s + 1}</span>
                        ${cargaInput}
                        <input class="serie-reps" inputmode="numeric" placeholder="·" aria-label="reps série ${s + 1} de ${ex.name}" value="${pv.reps != null ? pv.reps : ''}">
                        <span class="serie-ref">${ref ? 'últ. ' + ref : '—'}</span>
                    </div>`;
            }
            li.innerHTML = `
                <span class="ex-num">${pad2(i + 1)}</span>
                <div class="ex-body">
                    <div class="ex-head">
                        <div class="ex-name">${ex.name}</div>
                        ${badge}
                    </div>
                    <div class="ex-cue">${ex.cue}</div>
                    <div class="ex-log">${seriesHTML}</div>
                </div>
                <span class="ex-reps">${ex.reps}</span>
                <span class="ex-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"></polyline></svg>
                </span>`;
            // listeners dos inputs
            li.querySelectorAll('.serie-carga, .serie-reps').forEach(inp => {
                inp.addEventListener('input', onLogChange);
            });
            marcarLinhaSeValido(li);
        }
        list.appendChild(li);
    });

    if (fecharBtn) fecharBtn.hidden = false;
    updateProgress();
}

function badgeHTML(status) {
    if (status.tipo === 'subir_carga') return `<span class="ex-badge is-up">SUBA A CARGA ↑</span>`;
    if (status.tipo === 'progredir') return `<span class="ex-badge is-up">PROGRIDA ↑</span>`;
    if (status.tipo === 'ganhar_reps') return `<span class="ex-badge">META ${status.topo} REPS</span>`;
    return '';
}
function cardioFeito(sessao, nome) {
    const ex = sessao.exercicios.find(e => e.name === nome);
    return !!(ex && ex.concluido);
}
// Coleta as séries digitadas numa linha .ex
function coletarSeries(li) {
    const track = li.dataset.track;
    if (track === 'cardio') {
        return { concluido: li.classList.contains('is-done'), series: [] };
    }
    const series = [];
    li.querySelectorAll('.serie').forEach(row => {
        const cargaEl = row.querySelector('.serie-carga');
        const repsEl = row.querySelector('.serie-reps');
        const carga = cargaEl ? parseNum(cargaEl.value) : null;
        const reps = repsEl ? parseNum(repsEl.value) : null;
        series.push({ carga: cargaEl ? carga : null, reps, segundos: null });
    });
    return { concluido: false, series };
}
function linhaTemValido(li) {
    const track = li.dataset.track;
    if (track === 'cardio') return li.classList.contains('is-done');
    const { series } = coletarSeries(li);
    if (track === 'bodyweight') return series.some(s => s.reps > 0);
    return series.some(s => s.reps > 0);   // carga pode faltar; reps define "fez"
}
function marcarLinhaSeValido(li) {
    if (linhaTemValido(li)) li.classList.add('is-done');
    else li.classList.remove('is-done');
}
function onLogChange() {
    // atualiza estado visual + progresso + autosave do rascunho
    const dados = {};
    $$('#exercises .ex').forEach(li => {
        marcarLinhaSeValido(li);
        const nome = li.dataset.name;
        if (li.dataset.track === 'cardio') {
            dados[nome] = [{ concluido: li.classList.contains('is-done') }];
        } else {
            dados[nome] = coletarSeries(li).series;
        }
    });
    updateProgress();
    if (BLOCO_HOJE) salvarRascunho(BLOCO_HOJE, dados);
}
function updateProgress() {
    const rows = $$('#exercises .ex');
    const total = rows.length;
    let done = 0;
    rows.forEach(li => { if (li.classList.contains('is-done')) done++; });
    const pct = total === 0 ? 0 : (done / total) * 100;
    $('#progress-done').textContent = done;
    $('#progress-bar').style.width = pct + '%';
    $('#workout-foot').hidden = !(done === total && total > 0);
}

/* =====================================================
   FECHAR SESSÃO — valida, monta, persiste
   ===================================================== */
function fecharSessao() {
    const rows = $$('#exercises .ex');
    const exercicios = [];
    rows.forEach(li => {
        const nome = li.dataset.name;
        const track = li.dataset.track;
        if (track === 'cardio') {
            if (li.classList.contains('is-done')) {
                exercicios.push({ name: nome, track, series: [], concluido: true });
            }
            return;
        }
        const { series } = coletarSeries(li);
        const validas = series.filter(s => s.reps > 0);
        if (validas.length) {
            exercicios.push({ name: nome, track, series: validas, concluido: false });
        }
    });

    if (!exercicios.length) {
        toast('Sessão vazia. Preenche ao menos uma série.', true);
        return;
    }

    // Substitui sessão do mesmo dia/bloco se já existir (re-fechar)
    const dk = todayKey();
    SESSOES = SESSOES.filter(s => !(dateKeyOf(s.data) === dk && s.bloco === BLOCO_HOJE));
    SESSOES.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        data: new Date().toISOString(),
        bloco: BLOCO_HOJE,
        exercicios
    });
    const ok = salvarSessoes(SESSOES);
    limparRascunho();

    toast(ok ? 'Registrado. O número não mente.' : 'Salvo só nesta sessão (modo sem memória).');
    $('#workout-foot').hidden = false;

    // re-render dependentes
    renderWeek();
    renderProgressao();
    // atualiza referências "último" e badges com a sessão recém-salva
    const dow = new Date().getDay();
    renderWorkout(WEEK[dow]);
}

/* =====================================================
   RENDER — SEMANA (com dias logados + contador X/4)
   ===================================================== */
function renderWeek() {
    const grid = $('#week-grid');
    grid.innerHTML = '';
    const todayDow = new Date().getDay();
    const semana = sessoesDaSemana();
    const logadosPorDia = {};
    semana.forEach(s => { logadosPorDia[new Date(s.data).getDay()] = true; });

    for (let dow = 1; dow <= 6; dow++) renderWeekCell(grid, dow, todayDow, logadosPorDia);
    renderWeekCell(grid, 0, todayDow, logadosPorDia);

    const feitos = semana.filter(s => s.bloco).length;
    const counter = $('#week-counter');
    if (counter) counter.innerHTML = `<span class="wc-num">${feitos}</span> / 4 treinos`;
}
function renderWeekCell(grid, dow, todayDow, logadosPorDia) {
    const cfg = WEEK[dow];
    const cell = document.createElement('div');
    cell.className = 'week-cell';
    if (dow === todayDow) cell.classList.add('is-today');
    if (cfg.type === 'rest') cell.classList.add('is-rest');
    if (logadosPorDia[dow]) cell.classList.add('is-logged');

    let blockTxt = '休';
    let typeTxt = cfg.label || 'Descanso';
    if (cfg.type === 'work') {
        blockTxt = cfg.block;
        typeTxt = BLOCKS[cfg.block].title.split(' ')[0];
    }
    cell.innerHTML = `
        <span class="week-day-label">${WEEKDAY_PT[dow]}</span>
        <span class="week-day-block">${blockTxt}</span>
        <span class="week-day-type">${typeTxt}</span>`;
    grid.appendChild(cell);
}

/* =====================================================
   RENDER — BIBLIOTECA (do app original)
   ===================================================== */
function renderLibrary() {
    const tabs = $$('.lib-tab');
    const content = $('#library-content');
    function show(code) {
        const block = BLOCKS[code];
        let html = `
            <h4 class="lib-block-title">${block.title}</h4>
            <span class="lib-block-sub">Bloco ${block.code} · ${block.kanji}</span>
            <p style="color: var(--ink-2); margin-bottom: 20px; line-height: 1.6;">${block.subtitle}</p>`;
        block.exercises.forEach((ex, i) => {
            html += `
                <div class="lib-ex">
                    <span class="lib-ex-num">${pad2(i + 1)}</span>
                    <div>
                        <div class="lib-ex-name">${ex.name}</div>
                        <div class="lib-ex-cue">${ex.cue}</div>
                    </div>
                    <span class="lib-ex-reps">${ex.reps}</span>
                </div>`;
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

/* =====================================================
   RENDER — PROGRESSÃO (1RM, variação, gráfico, histórico)
   ===================================================== */
function exerciciosRastreaveis() {
    const vistos = new Set();
    const lista = [];
    Object.keys(BLOCKS).forEach(code => {
        BLOCKS[code].exercises.forEach(ex => {
            if (ex.track !== 'cardio' && !vistos.has(ex.name)) {
                vistos.add(ex.name);
                lista.push(ex);
            }
        });
    });
    return lista;
}
function preencherSeletor() {
    const sel = $('#prog-select');
    if (!sel) return;
    sel.innerHTML = '';
    exerciciosRastreaveis().forEach(ex => {
        const o = document.createElement('option');
        o.value = ex.name; o.textContent = ex.name;
        sel.appendChild(o);
    });
    // default: último exercício treinado, se houver
    if (SESSOES.length) {
        const ult = [...SESSOES].sort((a, b) => new Date(b.data) - new Date(a.data))[0];
        const prim = ult.exercicios.find(e => acharExercicio(e.name) && acharExercicio(e.name).track !== 'cardio');
        if (prim) sel.value = prim.name;
    }
    sel.addEventListener('change', () => renderProgressao());
}
function renderProgressao() {
    const sel = $('#prog-select');
    if (!sel) return;
    const nome = sel.value || (exerciciosRastreaveis()[0] && exerciciosRastreaveis()[0].name);
    const exDef = acharExercicio(nome);
    const curva = curvaExercicio(nome);
    const bw = exDef && exDef.track === 'bodyweight';

    const heroNum = $('#prog-hero-num');
    const heroUnit = $('#prog-hero-unit');
    const heroVar = $('#prog-hero-var');
    const heroBest = $('#prog-hero-best');
    const heroLabel = $('#prog-hero-label');

    if (!curva.length) {
        heroNum.textContent = '—';
        heroUnit.textContent = '';
        heroVar.textContent = '';
        heroBest.textContent = 'Sem histórico. Registra e a curva nasce.';
        heroLabel.textContent = bw ? 'MELHOR REPS' : '1RM ESTIMADO';
        $('#prog-chart').innerHTML = chartVazio();
        $('#prog-history').innerHTML = '';
        return;
    }

    const ultimo = curva[curva.length - 1];
    const primeiro = curva[0];
    heroLabel.textContent = bw ? 'MELHOR SÉRIE' : '1RM ESTIMADO';
    if (bw) {
        heroNum.textContent = ultimo.reps;
        heroUnit.textContent = ' reps';
        heroBest.textContent = `melhor: ${ultimo.reps} reps`;
    } else {
        heroNum.textContent = fmt(ultimo.e1rm);
        heroUnit.textContent = ' kg';
        heroBest.textContent = `melhor série: ${fmt(ultimo.carga)} × ${ultimo.reps}`;
    }
    const base = primeiro.valor, fimv = ultimo.valor;
    if (curva.length >= 2 && base > 0) {
        const pct = ((fimv - base) / base) * 100;
        const up = pct >= 0;
        heroVar.textContent = `${up ? '▲ +' : '▼ '}${fmt(Math.abs(pct))}%`;
        heroVar.className = 'prog-var ' + (up ? 'is-up' : 'is-down');
    } else {
        heroVar.textContent = 'base';
        heroVar.className = 'prog-var';
    }

    $('#prog-chart').innerHTML = chartSVG(curva, bw);

    // histórico (mais recente primeiro, até 8)
    const hist = [...curva].reverse().slice(0, 8);
    $('#prog-history').innerHTML = hist.map((p, idx) => `
        <div class="prog-row">
            <span class="prog-row-data">${fmtDataCurta(p.data)}</span>
            <span class="prog-row-set">${p.carga != null ? fmt(p.carga) + ' × ' + p.reps : p.reps + ' reps'}</span>
            <span class="prog-row-rm">${bw ? '' : '1RM ' + fmt(p.e1rm)}${idx === 0 ? '<i> · atual</i>' : ''}</span>
        </div>`).join('');
}
function chartVazio() {
    return `<div class="chart-empty">Sem dados ainda.<br><span>進</span></div>`;
}
// Gráfico SVG à mão (linha violeta, grid, ponto atual com glow)
function chartSVG(curva, bw) {
    const W = 320, H = 120, padL = 8, padR = 8, padT = 14, padB = 20;
    const xs = curva.map((_, i) => i);
    const ys = curva.map(p => p.valor);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const span = (yMax - yMin) || 1;
    const lo = yMin - span * 0.15, hi = yMax + span * 0.15;
    const px = i => curva.length === 1 ? W / 2 : padL + (i / (curva.length - 1)) * (W - padL - padR);
    const py = v => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

    let grid = '';
    for (let g = 0; g <= 2; g++) {
        const y = padT + (g / 2) * (H - padT - padB);
        grid += `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 4"/>`;
    }
    const pts = curva.map((p, i) => `${px(i).toFixed(1)},${py(p.valor).toFixed(1)}`).join(' ');
    const line = curva.length > 1
        ? `<polyline points="${pts}" fill="none" stroke="var(--violet)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
        : '';
    const dots = curva.map((p, i) => {
        const last = i === curva.length - 1;
        const c = px(i).toFixed(1), y = py(p.valor).toFixed(1);
        return last
            ? `<circle cx="${c}" cy="${y}" r="6" fill="var(--violet)" opacity="0.25"/><circle cx="${c}" cy="${y}" r="3.5" fill="var(--violet)"/>`
            : `<circle cx="${c}" cy="${y}" r="2.6" fill="var(--ink-3)"/>`;
    }).join('');
    const yHi = bw ? `${yMax}` : fmt(yMax) + 'kg';
    const yLo = bw ? `${yMin}` : fmt(yMin) + 'kg';
    const dIni = fmtDataCurta(curva[0].data), dFim = fmtDataCurta(curva[curva.length - 1].data);
    return `
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="chart-svg" role="img" aria-label="Curva de progressão">
            ${grid}${line}${dots}
        </svg>
        <div class="chart-axis">
            <span>${dIni}</span>
            <span class="chart-y">${yLo} → ${yHi}</span>
            <span>${dFim}</span>
        </div>`;
}

/* =====================================================
   TOAST
   ===================================================== */
let toastTimer = null;
function toast(msg, erro = false) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('is-erro', !!erro);
    el.hidden = false;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.classList.remove('is-on'); }, 2600);
}

/* =====================================================
   ANIMAÇÕES — scroll reveal, parallax, contador (original)
   ===================================================== */
function setupReveals() {
    const targets = document.querySelectorAll('.manifesto, .workout, .rest, .week, .progress-sec, .library, .target, .bottom');
    targets.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
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
            bg.style.transform = `translate3d(0, ${y * 0.25}px, 0) scale(1.04)`;
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}
function animateCount(el, target, duration = 1200) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = target; return; }
    const startTime = performance.now();
    function tick(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}
function animateHeroStats() {
    const stats = document.querySelectorAll('.hero-stats .stat-num');
    if (!stats.length) return;
    const targets = Array.from(stats).map(s => { const n = parseInt(s.textContent.trim(), 10); return isNaN(n) ? null : n; });
    if (targets.every(t => t === null || t === 0)) return;
    stats.forEach((s, i) => { if (targets[i] !== null) s.textContent = '0'; });
    setTimeout(() => {
        stats.forEach((s, i) => { if (targets[i] !== null) animateCount(s, targets[i], 1100 + i * 120); });
    }, 600);
}

/* =====================================================
   INIT
   ===================================================== */
function init() {
    STORAGE_OK = storageDisponivel();
    SESSOES = carregarSessoes();
    if (!STORAGE_OK) {
        const b = $('#storage-banner');
        if (b) b.hidden = false;
    }

    const dow = new Date().getDay();
    const todayConfig = WEEK[dow];

    renderTopbar();
    renderManifesto();
    renderHero(todayConfig);
    renderWorkout(todayConfig);
    renderWeek();
    renderLibrary();
    preencherSeletor();
    renderProgressao();

    const fecharBtn = $('#fechar-sessao');
    if (fecharBtn) fecharBtn.addEventListener('click', fecharSessao);

    setupReveals();
    setupParallax();
    animateHeroStats();
}

document.addEventListener('DOMContentLoaded', init);
