/* =========================================================
   PROJETO TOJI — Tracker de recomposição
   Não é caderninho: é treinador. Diz quando subir a carga.
   Client-side puro · localStorage versionado · zero dependência
   ========================================================= */

/* ---------------------------------------------------------
   PROGRAMA — fonte da verdade (editável sem tocar no resto)
--------------------------------------------------------- */
const PROGRAM = {
    rotacao: { semanaImpar: ["A", "B", "A"], semanaPar: ["B", "A", "B"] },
    agenda: {
        pesados: ["Ter", "Qui", "Sáb"],
        leves: ["Seg", "Qua", "Sex"],          // cardio Z2 30min + acessório opcional
        recuperacaoAtiva: ["Dom"]
    },
    descanso: { composto: "2–3 min", isolado: "60–90 s" },
    est1RM: "Epley → peso * (1 + reps / 30)",
    treinos: {
        A: {
            titulo: "SUPERIOR", foco: "peito · costas · ombro · braço", exercicios: [
                { nome: "Supino reto (barra ou halteres)", series: 4, reps: [6, 10], tipo: "composto", musculo: "peito" },
                { nome: "Remada curvada (barra)", series: 4, reps: [8, 12], tipo: "composto", musculo: "costas" },
                { nome: "Desenvolvimento militar", series: 3, reps: [8, 12], tipo: "composto", musculo: "ombro" },
                { nome: "Puxada alta", series: 3, reps: [8, 12], tipo: "composto", musculo: "costas" },
                { nome: "Elevação lateral", series: 3, reps: [12, 15], tipo: "isolado", musculo: "ombro" },
                { nome: "Rosca direta", series: 3, reps: [10, 12], tipo: "isolado", musculo: "bíceps" },
                { nome: "Tríceps corda ou testa", series: 3, reps: [10, 12], tipo: "isolado", musculo: "tríceps" }
            ]
        },
        B: {
            titulo: "INFERIOR", foco: "perna completa · core", exercicios: [
                { nome: "Agachamento no Smith", series: 4, reps: [6, 10], tipo: "composto", musculo: "quadríceps" },
                { nome: "Terra romeno (RDL)", series: 3, reps: [8, 10], tipo: "composto", musculo: "posterior" },
                { nome: "Leg press", series: 3, reps: [10, 12], tipo: "composto", musculo: "quadríceps" },
                { nome: "Cadeira flexora", series: 3, reps: [10, 12], tipo: "isolado", musculo: "posterior" },
                { nome: "Panturrilha em pé", series: 4, reps: [12, 20], tipo: "isolado", musculo: "panturrilha" },
                { nome: "Prancha", series: 3, reps: null, tipo: "core", musculo: "core", porTempo: true },
                { nome: "Abdominal infra", series: 3, reps: [12, 15], tipo: "core", musculo: "core" }
            ]
        }
    }
};

/* ---------------------------------------------------------
   IDs estáveis por exercício (slug do nome) + índice plano
--------------------------------------------------------- */
function slug(s) {
    return s.toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
const EXERCISES = {}; // id -> { ...ex, treino, idx }
["A", "B"].forEach((t) => {
    PROGRAM.treinos[t].exercicios.forEach((ex, idx) => {
        ex.id = slug(ex.nome);
        ex.treino = t;
        ex.idx = idx;
        EXERCISES[ex.id] = ex;
    });
});

/* ---------------------------------------------------------
   FRASES — tom Toji, cirúrgico, sem energia amaldiçoada
--------------------------------------------------------- */
const MANIFESTOS = [
    { pt: "Sem energia amaldiçoada. Só execução.", jp: "呪力はいらない。実行だけだ。" },
    { pt: "O fraco se justifica. Você sobe a carga.", jp: "弱者は言い訳する。お前は重さを上げる。" },
    { pt: "Cada repetição é um voto contra quem você era.", jp: "一回ごとに、過去の自分を否定しろ。" },
    { pt: "Não negocie com a preguiça. Ela sempre vence.", jp: "怠惰と交渉するな。必ず負ける。" },
    { pt: "O número não mente. Ou subiu, ou não.", jp: "数字は嘘をつかない。" },
    { pt: "Treine sem testemunha. O resultado fala.", jp: "見せるな。見せつけろ。" },
    { pt: "Você não está cansado. Está confortável demais.", jp: "疲れではない。慣れすぎただけだ。" },
    { pt: "Recuperação é o gargalo. Qualidade, não volume-lixo.", jp: "質を積め。量ではない。" }
];

/* =========================================================
   HELPERS
========================================================= */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

const WEEKDAY_PT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const WEEKDAY_FULL = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];

const pad2 = (n) => String(n).padStart(2, "0");

/** Formata número no padrão BR (vírgula decimal, até 1 casa). */
function fmt(n) {
    if (n == null || isNaN(n)) return "—";
    const r = Math.round(n * 10) / 10;
    return String(r).replace(".", ",");
}

/** Chave de data local YYYY-MM-DD (sem fuso surpresa). */
function dateKey(d) {
    const x = (d instanceof Date) ? d : new Date(d);
    return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
}
const todayKey = () => dateKey(new Date());

/** Epley. */
const epley = (carga, reps) => (Number(carga) || 0) * (1 + (Number(reps) || 0) / 30);

/* ----- Calendário / rotação ----- */
function startOfWeekMonday(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dow = d.getDay();                 // 0=Dom … 6=Sáb
    const diff = dow === 0 ? -6 : 1 - dow;  // recua até a segunda
    d.setDate(d.getDate() + diff);
    return d;
}
function weekIndex(date) {
    const epoch = new Date(2024, 0, 1);     // 01/01/2024 caiu numa segunda
    const mon = startOfWeekMonday(date);
    return Math.round((mon - epoch) / (7 * 86400000));
}
/** Semana ímpar = A·B·A, semana par = B·A·B. */
const isOddWeek = (date) => weekIndex(date) % 2 === 0;
const weekRotation = (date) =>
    isOddWeek(date) ? PROGRAM.rotacao.semanaImpar : PROGRAM.rotacao.semanaPar;

const HEAVY_SLOT = { 2: 0, 4: 1, 6: 2 }; // Ter, Qui, Sáb -> posição na rotação

/** Tipo do dia: 'pesado' | 'leve' | 'recuperacao'. */
function dayType(date) {
    const dow = date.getDay();
    if (dow in HEAVY_SLOT) return "pesado";
    if (dow === 0) return "recuperacao";
    return "leve";
}

/** Treino sugerido hoje (no dia pesado: pela rotação; senão: o próximo pesado). */
function suggestedTreino(date) {
    const dow = date.getDay();
    if (dow in HEAVY_SLOT) return weekRotation(date)[HEAVY_SLOT[dow]];
    for (let i = 1; i <= 7; i++) {
        const d = new Date(date);
        d.setDate(date.getDate() + i);
        if (d.getDay() in HEAVY_SLOT) return weekRotation(d)[HEAVY_SLOT[d.getDay()]];
    }
    return "A";
}

function pickManifesto() {
    const d = new Date();
    const seed = d.getFullYear() * 1000 + d.getMonth() * 31 + d.getDate();
    return MANIFESTOS[seed % MANIFESTOS.length];
}

/* =========================================================
   PERSISTÊNCIA — interface única sobre o localStorage
   (trocar por IndexedDB/backend depois sem mexer na UI)
========================================================= */
const STORE_KEY = "toji:sessoes:v1";
const store = {
    load() {
        try {
            const raw = localStorage.getItem(STORE_KEY);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            console.warn("Toji: falha ao ler registros, seguindo em memória.", e);
            return [];
        }
    },
    save(arr) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(arr));
            return true;
        } catch (e) {
            console.warn("Toji: falha ao salvar registros.", e);
            return false;
        }
    },
    clear() {
        try { localStorage.removeItem(STORE_KEY); } catch (e) { /* noop */ }
    }
};

/* Estado em memória (espelha o store). */
let sessions = store.load();

/** Salva (substituindo a sessão do mesmo dia+treino, se existir). */
function commitSession(sess) {
    const k = dateKey(sess.data);
    const i = sessions.findIndex((s) => dateKey(s.data) === k && s.treino === sess.treino);
    if (i >= 0) sessions[i] = sess; else sessions.push(sess);
    sessions.sort((a, b) => a.id - b.id);
    return store.save(sessions);
}

/* ----- Consultas ----- */
/** Sessão de hoje para um treino (pra pré-preencher inputs). */
function todaysSession(treino) {
    const k = todayKey();
    return sessions.find((s) => dateKey(s.data) === k && s.treino === treino) || null;
}

/** Todas as sessões que têm dado para um exercício, mais recentes primeiro. */
function historyOf(exId) {
    return sessions
        .filter((s) => s.series[exId] && s.series[exId].some((x) => x && (x.carga != null || x.reps != null)))
        .sort((a, b) => a.id - b.id);
}

/** Última sessão COMPLETA anterior a hoje (referência "último: …"). */
function lastEntry(exId) {
    const list = historyOf(exId).slice().reverse(); // mais recente primeiro
    const k = todayKey();
    for (const s of list) if (dateKey(s.data) !== k) return s;
    return null;
}

/** Métrica do exercício: 'tempo' (porTempo) | 'kg' (tem carga) | 'reps' (peso corporal). */
function exMetric(ex) {
    if (ex.porTempo) return "tempo";
    const any = sessions.some((s) =>
        s.series[ex.id] && s.series[ex.id].some((x) => x && x.carga != null && x.carga > 0));
    return any ? "kg" : "reps";
}

/** Melhor série de um array de séries, conforme a métrica. */
function bestSet(series, metric) {
    const valid = (series || []).filter((x) => x && (x.reps != null || x.carga != null));
    if (!valid.length) return null;
    if (metric === "kg") return valid.reduce((b, x) => (epley(x.carga, x.reps) > epley(b.carga, b.reps) ? x : b));
    return valid.reduce((b, x) => ((x.reps || 0) > (b.reps || 0) ? x : b)); // tempo/reps
}

/** Valor plotado/ comparado conforme métrica. */
function setValue(set, metric) {
    if (!set) return 0;
    if (metric === "kg") return Number(set.carga) || 0;
    return Number(set.reps) || 0; // segundos ou reps
}

/** Motor de sobrecarga: bateu o topo da faixa em TODAS as séries na última sessão? */
function shouldIncreaseLoad(ex) {
    if (!ex.reps) return false; // por tempo não tem faixa
    const last = lastEntry(ex.id);
    if (!last) return false;
    const sets = (last.series[ex.id] || []).filter((x) => x && x.reps != null);
    if (sets.length < ex.series) return false; // exige todas as séries registradas
    const topo = ex.reps[1];
    return sets.every((x) => x.reps >= topo);
}

/* =========================================================
   ESTADO DA UI
========================================================= */
const state = {
    screen: "treino",
    treino: suggestedTreino(new Date()),
    progEx: null // id do exercício na tela de progressão
};

/* =========================================================
   RENDER — TOPO E NAV
========================================================= */
function renderTopbar() {
    const now = new Date();
    $("#topbar-date").textContent =
        `${WEEKDAY_FULL[now.getDay()]} · ${pad2(now.getDate())}.${pad2(now.getMonth() + 1)}.${now.getFullYear()}`;
}

function setScreen(name) {
    state.screen = name;
    document.body.dataset.screen = name;
    $$(".screen").forEach((s) => s.classList.toggle("is-active", s.dataset.screen === name));
    $$(".tab").forEach((t) => t.classList.toggle("is-active", t.dataset.screen === name));
    if (name === "progresso") renderProgresso();
    if (name === "semana") renderSemana();
    if (name === "treino") renderTreino();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   RENDER — TELA TREINO
========================================================= */
function renderTreino() {
    const now = new Date();
    const tipo = dayType(now);
    const t = state.treino;
    const treino = PROGRAM.treinos[t];
    const HERO_KANJI = { A: "鍛", B: "脚" };

    // Cabeçalho / herói
    $("#treino-kanji").textContent = HERO_KANJI[t];
    $("#treino-weekday").textContent = WEEKDAY_PT[now.getDay()];
    $("#treino-rotacao").textContent = weekRotation(now).join("·");
    const sug = suggestedTreino(now);
    const sugPrefix = tipo === "pesado" ? "SUGERIDO" : "PRÓXIMO PESADO";
    $("#treino-sugerido").textContent = `${sugPrefix}: ${sug} · ${PROGRAM.treinos[sug].titulo}`;
    $("#treino-title").textContent = treino.titulo;
    $("#treino-foco").textContent = treino.foco;

    // Frase do dia
    const m = pickManifesto();
    $("#manifesto-text").textContent = m.pt;
    $("#manifesto-jp").textContent = m.jp;

    // Toggle A/B
    $$(".seg-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.treino === t));

    // Banner do tipo de dia
    const banner = $("#day-banner");
    if (tipo === "pesado") {
        banner.hidden = true;
    } else {
        banner.hidden = false;
        if (tipo === "leve") {
            banner.className = "day-banner is-leve";
            banner.innerHTML = `<span class="db-kanji">軽</span>
                <div><strong>DIA LEVE</strong>
                <p>Cardio Zona 2 · 30 min + acessório leve opcional (ponto fraco). Registro de carga abaixo é opcional.</p></div>`;
        } else {
            banner.className = "day-banner is-rec";
            banner.innerHTML = `<span class="db-kanji">休</span>
                <div><strong>RECUPERAÇÃO ATIVA</strong>
                <p>Caminhada, mobilidade, cardio leve. O músculo cresce no silêncio. Volte mais letal.</p></div>`;
        }
    }

    // Cards de exercício
    const saved = todaysSession(t);
    const wrap = $("#exercicios");
    wrap.innerHTML = "";

    treino.exercicios.forEach((ex, i) => {
        const metric = exMetric(ex);
        const last = lastEntry(ex.id);
        const lastSets = last ? (last.series[ex.id] || []) : [];
        const savedSets = saved ? (saved.series[ex.id] || []) : [];
        const subir = shouldIncreaseLoad(ex);
        const esquema = ex.porTempo ? `${ex.series} × tempo`
            : `${ex.series} × ${ex.reps[0]}–${ex.reps[1]}`;

        const card = document.createElement("article");
        card.className = "card reveal";
        card.style.transitionDelay = (i * 45) + "ms";

        let setsHTML = "";
        for (let s = 0; s < ex.series; s++) {
            const sv = savedSets[s] || {};
            const lv = lastSets[s];
            const ref = lv && (lv.carga != null || lv.reps != null)
                ? `últ. ${refText(lv, metric, true)}`
                : "primeira vez";
            const cargaVal = sv.carga != null ? sv.carga : "";
            const repsVal = sv.reps != null ? sv.reps : "";

            if (metric === "tempo") {
                setsHTML += `
                <div class="set-row" data-ex="${ex.id}" data-set="${s}">
                    <span class="set-idx">${s + 1}</span>
                    <label class="set-field set-field--solo">
                        <input class="set-reps" type="number" inputmode="numeric" min="0"
                            placeholder="0" value="${repsVal}" aria-label="Tempo em segundos série ${s + 1}">
                        <span class="set-unit">seg</span>
                    </label>
                    <span class="set-ref">${ref}</span>
                </div>`;
            } else {
                setsHTML += `
                <div class="set-row" data-ex="${ex.id}" data-set="${s}">
                    <span class="set-idx">${s + 1}</span>
                    <label class="set-field">
                        <input class="set-carga" type="number" inputmode="decimal" min="0" step="0.5"
                            placeholder="0" value="${cargaVal}" aria-label="Carga série ${s + 1}">
                        <span class="set-unit">kg</span>
                    </label>
                    <label class="set-field">
                        <input class="set-reps" type="number" inputmode="numeric" min="0"
                            placeholder="0" value="${repsVal}" aria-label="Reps série ${s + 1}">
                        <span class="set-unit">reps</span>
                    </label>
                    <span class="set-ref">${ref}</span>
                </div>`;
            }
        }

        card.innerHTML = `
            <div class="card-head">
                <div class="card-head-main">
                    <span class="card-tag">${ex.musculo} · ${ex.tipo}</span>
                    <h3 class="card-name">${ex.nome}</h3>
                </div>
                <span class="card-scheme">${esquema}</span>
            </div>
            ${subir ? `<div class="badge-up"><span class="badge-up-dot"></span>SUBA A CARGA — bateu o topo em tudo</div>`
                : (last ? `<div class="card-goal">Meta: repetir a carga e ganhar reps até o topo da faixa.</div>` : "")}
            <div class="sets">${setsHTML}</div>`;

        wrap.appendChild(card);
    });

    // Revela cards
    requestAnimationFrame(() => $$("#exercicios .reveal").forEach((el) => el.classList.add("is-visible")));
}

/** Texto da referência de uma série, conforme métrica.
 *  compact=true: sem espaços ao redor do × (cabe ao lado dos inputs no mobile). */
function refText(set, metric, compact = false) {
    if (metric === "tempo") return `${set.reps ?? "—"}s`;
    if (metric === "reps") return `${set.reps ?? "—"} reps`;
    const c = set.carga != null ? `${fmt(set.carga)}kg` : "—";
    const r = set.reps != null ? `${set.reps}` : "—";
    return compact ? `${c}×${r}` : `${c} × ${r}`;
}

/** Coleta os inputs e salva a sessão atual. */
function saveSession() {
    const t = state.treino;
    const treino = PROGRAM.treinos[t];
    const series = {};
    let hasData = false;

    treino.exercicios.forEach((ex) => {
        const rows = $$(`.set-row[data-ex="${ex.id}"]`);
        const arr = rows.map((row) => {
            const cargaEl = $(".set-carga", row);
            const repsEl = $(".set-reps", row);
            const carga = cargaEl && cargaEl.value !== "" ? parseFloat(cargaEl.value) : null;
            const reps = repsEl && repsEl.value !== "" ? parseInt(repsEl.value, 10) : null;
            if (carga != null || reps != null) hasData = true;
            return { carga: isNaN(carga) ? null : carga, reps: isNaN(reps) ? null : reps };
        });
        series[ex.id] = arr;
    });

    if (!hasData) {
        toast("Registre ao menos uma série antes de salvar.");
        return;
    }

    const existing = todaysSession(t);
    const sess = {
        id: existing ? existing.id : Date.now(),
        data: existing ? existing.data : new Date().toISOString(),
        treino: t,
        series
    };

    const ok = commitSession(sess);
    toast(ok ? "Sessão registrada." : "Salvo só nesta sessão (storage indisponível).");
    renderTreino();
    buildProgressoOptions();
}

/* =========================================================
   RENDER — TELA PROGRESSÃO
========================================================= */
function buildProgressoOptions() {
    const sel = $("#prog-select");
    if (!sel) return;
    const prev = state.progEx || sel.value;
    sel.innerHTML = "";
    ["A", "B"].forEach((t) => {
        const og = document.createElement("optgroup");
        og.label = `${t} · ${PROGRAM.treinos[t].titulo}`;
        PROGRAM.treinos[t].exercicios.forEach((ex) => {
            const o = document.createElement("option");
            o.value = ex.id;
            o.textContent = ex.nome;
            og.appendChild(o);
        });
        sel.appendChild(og);
    });
    if (prev && EXERCISES[prev]) sel.value = prev;
    state.progEx = sel.value;
}

function renderProgresso() {
    if (!state.progEx) buildProgressoOptions();
    const ex = EXERCISES[state.progEx];
    if (!ex) return;

    const metric = exMetric(ex);
    const hist = historyOf(ex.id);

    const unitLabel = metric === "tempo" ? "segundos" : metric === "reps" ? "reps" : "kg";
    $("#prog-chart-label").textContent = `Melhor série · ${unitLabel}`;

    // Pontos: melhor série por sessão
    const points = hist.map((s) => {
        const best = bestSet(s.series[ex.id], metric);
        return { date: s.data, best, value: setValue(best, metric) };
    }).filter((p) => p.best);

    // Stats
    const statsWrap = $("#prog-stats");
    const chartWrap = $("#prog-chart");
    const histWrap = $("#prog-history");

    if (!points.length) {
        statsWrap.innerHTML = "";
        chartWrap.innerHTML = `<p class="empty">Sem registros ainda.<br>Treine, registre e o número aparece aqui.</p>`;
        histWrap.innerHTML = "";
        return;
    }

    const first = points[0];
    const latest = points[points.length - 1];

    // Variação (no 1RM est. para kg; no próprio valor pra tempo/reps)
    const firstCmp = metric === "kg" ? epley(first.best.carga, first.best.reps) : first.value;
    const lastCmp = metric === "kg" ? epley(latest.best.carga, latest.best.reps) : latest.value;
    const varPct = firstCmp > 0 ? ((lastCmp - firstCmp) / firstCmp) * 100 : 0;
    const varSign = varPct > 0 ? "+" : "";
    const varClass = varPct > 0 ? "up" : varPct < 0 ? "down" : "flat";

    const bestNow = refText(latest.best, metric, true);
    const e1 = metric === "kg" ? Math.round(epley(latest.best.carga, latest.best.reps)) : null;

    statsWrap.innerHTML = `
        <div class="stat-box">
            <span class="stat-label">Melhor série atual</span>
            <span class="stat-val">${bestNow}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">1RM estimado</span>
            <span class="stat-val">${e1 != null ? fmt(e1) + " kg" : "—"}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Variação${metric === "kg" ? " (1RM)" : ""}</span>
            <span class="stat-val var-${varClass}">${varSign}${fmt(varPct)}%</span>
        </div>`;

    chartWrap.innerHTML = buildChart(points, metric);

    // Histórico (mais recente primeiro)
    histWrap.innerHTML = `<div class="hist-head">Histórico</div>` +
        points.slice().reverse().slice(0, 16).map((p) => {
            const d = new Date(p.date);
            const date = `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
            const e = metric === "kg" ? ` · 1RM ${fmt(Math.round(epley(p.best.carga, p.best.reps)))}` : "";
            return `<div class="hist-row">
                <span class="hist-date">${date}</span>
                <span class="hist-val">${refText(p.best, metric)}</span>
                <span class="hist-e1">${e}</span>
            </div>`;
        }).join("");
}

/** Gráfico de linha em SVG feito à mão — visual Toji. */
function buildChart(points, metric) {
    const W = 320, H = 150, padL = 8, padR = 8, padT = 14, padB = 22;
    const vals = points.map((p) => p.value);
    let min = Math.min(...vals), max = Math.max(...vals);
    if (min === max) { min = Math.max(0, min - 1); max = max + 1; }
    const span = max - min || 1;

    const n = points.length;
    const x = (i) => padL + (n === 1 ? (W - padL - padR) / 2 : (i / (n - 1)) * (W - padL - padR));
    const y = (v) => padT + (1 - (v - min) / span) * (H - padT - padB);

    const coords = points.map((p, i) => ({ cx: x(i), cy: y(p.value), v: p.value }));
    const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.cx.toFixed(1)},${c.cy.toFixed(1)}`).join(" ");
    const area = `${line} L${coords[n - 1].cx.toFixed(1)},${H - padB} L${coords[0].cx.toFixed(1)},${H - padB} Z`;

    const dots = coords.map((c, i) =>
        `<circle cx="${c.cx.toFixed(1)}" cy="${c.cy.toFixed(1)}" r="${i === n - 1 ? 4 : 2.6}"
            class="${i === n - 1 ? "chart-dot chart-dot--last" : "chart-dot"}"/>`).join("");

    const lastLabel = `<text x="${coords[n - 1].cx.toFixed(1)}" y="${(coords[n - 1].cy - 9).toFixed(1)}"
        class="chart-tip" text-anchor="${n === 1 ? "middle" : "end"}">${fmt(coords[n - 1].v)}</text>`;

    return `
    <svg viewBox="0 0 ${W} ${H}" class="chart-svg" preserveAspectRatio="none" role="img" aria-label="Curva da melhor série">
        <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--violet)" stop-opacity="0.28"/>
                <stop offset="100%" stop-color="var(--violet-deep)" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" class="chart-axis"/>
        <path d="${area}" fill="url(#chartFill)"/>
        <path d="${line}" class="chart-line" fill="none"/>
        ${dots}
        ${lastLabel}
        <text x="${padL}" y="${H - 6}" class="chart-min">${fmt(min)}</text>
        <text x="${W - padR}" y="${H - 6}" class="chart-max" text-anchor="end">${fmt(max)}</text>
    </svg>`;
}

/* =========================================================
   RENDER — TELA SEMANA
========================================================= */
function renderSemana() {
    const now = new Date();
    const mon = startOfWeekMonday(now);
    const todayK = todayKey();

    // Strip Seg–Dom
    const grid = $("#week-grid");
    grid.innerHTML = "";
    let pesadosFeitos = 0;

    for (let i = 0; i < 7; i++) {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        const dk = dateKey(d);
        const tipo = dayType(d);
        const sess = sessions.find((s) => dateKey(s.data) === dk);
        const treinado = !!sess;
        if (treinado && tipo === "pesado") pesadosFeitos++;

        const cell = document.createElement("div");
        cell.className = "wk-cell";
        if (dk === todayK) cell.classList.add("is-today");
        if (treinado) cell.classList.add("is-done");
        if (tipo !== "pesado") cell.classList.add("is-soft");

        const mark = treinado ? (sess.treino) : (tipo === "pesado" ? "·" : tipo === "recuperacao" ? "休" : "軽");
        cell.innerHTML = `
            <span class="wk-day">${WEEKDAY_PT[d.getDay()]}</span>
            <span class="wk-mark">${mark}</span>
            <span class="wk-date">${pad2(d.getDate())}</span>`;
        grid.appendChild(cell);
    }

    // Contador X/3
    $("#week-count").textContent = pesadosFeitos;
    const rail = $("#week-count-bar");
    if (rail) rail.style.width = Math.min(100, (pesadosFeitos / 3) * 100) + "%";

    // Rotação da semana
    $("#week-rotacao").textContent = weekRotation(now).join(" · ");

    // Total de registros
    $("#week-total").textContent = sessions.length;
}

/* =========================================================
   TOAST
========================================================= */
let toastTimer = null;
function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2600);
}

/* =========================================================
   EVENTOS
========================================================= */
function wireEvents() {
    // Nav inferior
    $$(".tab").forEach((t) => t.addEventListener("click", () => setScreen(t.dataset.screen)));

    // Toggle A/B
    $$(".seg-btn").forEach((b) => b.addEventListener("click", () => {
        state.treino = b.dataset.treino;
        renderTreino();
    }));

    // Salvar sessão
    $("#btn-save").addEventListener("click", saveSession);

    // Progressão: troca de exercício
    $("#prog-select").addEventListener("change", (e) => {
        state.progEx = e.target.value;
        renderProgresso();
    });

    // Apagar tudo
    $("#btn-clear").addEventListener("click", () => {
        if (!sessions.length) { toast("Nada para apagar."); return; }
        if (confirm("Apagar TODOS os registros? Esta ação não tem volta.")) {
            store.clear();
            sessions = [];
            buildProgressoOptions();
            renderTreino();
            renderSemana();
            renderProgresso();
            toast("Registros apagados.");
        }
    });
}

/* Parallax sutil na imagem do herói. */
function setupParallax() {
    const bg = $(".hero-bg");
    if (!bg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            bg.style.transform = `translate3d(0, ${window.scrollY * 0.18}px, 0) scale(1.06)`;
            ticking = false;
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}

/* =========================================================
   INIT
========================================================= */
function init() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js").catch(() => { });
    }
    renderTopbar();
    buildProgressoOptions();
    wireEvents();
    renderTreino();
    setScreen("treino");
    setupParallax();
}

document.addEventListener("DOMContentLoaded", init);
