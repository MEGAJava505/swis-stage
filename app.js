// ===== M7 Teams Data =====
const TEAMS = [
    { id: 'ae', code: 'AE', name: 'Alter Ego', flag: 'https://flagcdn.com/w20/id.png', logo: 'img/Alter_Ego_2022_allmode.png' },
    { id: 'aurora_tr', code: 'AUR', name: 'Aurora Turkey', flag: 'https://flagcdn.com/w20/tr.png', logo: 'img/Aurora_Gaming_2025_allmode.png' },
    { id: 'rora', code: 'RORA', name: 'Aurora PH', flag: 'https://flagcdn.com/w20/ph.png', logo: 'img/Aurora_Gaming_PH_2025_allmode.png' },
    { id: 'tl', code: 'TL', name: 'Team Liquid PH', flag: 'https://flagcdn.com/w20/ph.png', logo: 'img/Team_Liquid_PH_2024_darkmode.png' },
    { id: 'bse', code: 'BSE', name: 'Black Sentence', flag: 'https://flagcdn.com/w20/cl.png', logo: 'img/Black_Sentence_Esports_darkmode.png' },
    { id: 'cfu', code: 'CFU', name: 'CFU Gaming', flag: 'https://flagcdn.com/w20/kh.png', logo: 'img/CFU_Gaming_Cambodia_allmode.png' },
    { id: 'srg', code: 'SRG', name: 'SRG.OG', flag: 'https://flagcdn.com/w20/my.png', logo: 'img/SRG.OG_darkmode.png' },
    { id: 'cg', code: 'CG', name: 'CG Esports', flag: 'https://flagcdn.com/w20/my.png', logo: 'img/CG_Esports_allmode.png' },
    { id: 'wc1', code: 'VP', name: 'Virtus.Pro', flag: 'https://flagcdn.com/w20/ru.png', logo: 'img/Virtus.pro_2019_allmode.png', isWildcard: true },
    { id: 'yg', code: 'YG', name: 'Yangon Galacticos', flag: 'https://flagcdn.com/w20/mm.png', logo: 'img/Yangon_Galacticos_2021_allmode.png' },
    { id: 'evil', code: 'EVIL', name: 'Evil', flag: 'https://flagcdn.com/w20/sg.png', logo: 'img/EVIL_SG_allmode.png' },
    { id: 'spirit', code: 'TS', name: 'Team Spirit', flag: 'https://flagcdn.com/w20/ru.png', logo: 'img/Team_Spirit_2022_darkmode.png' },
    { id: 'dfyg', code: 'DFYG', name: 'DianFengYaoGuai', flag: 'https://flagcdn.com/w20/cn.png', logo: 'img/DFYG_allmode.png' },
    { id: 'flcn', code: 'FLCN', name: 'Team Falcons', flag: 'https://flagcdn.com/w20/sa.png', logo: 'img/Team_Falcons.png' },
    { id: 'onic', code: 'ONIC', name: 'ONIC Indonesia', flag: 'https://flagcdn.com/w20/id.png', logo: 'img/ONIC_Esports_2019_ID_allmode.png' },
    { id: 'wc2', code: 'AXE', name: 'AXE Esports', flag: 'https://flagcdn.com/w20/ae.png', logo: 'img/Axe_2023.png', isWildcard: true }
];

let matchupSlots = [
    ['ae', 'aurora_tr'], ['rora', 'tl'], ['bse', 'cfu'], ['srg', 'cg'],
    ['wc1', 'yg'], ['evil', 'spirit'], ['dfyg', 'flcn'], ['onic', 'wc2']
];

const STAGE_POOLS = {
    '1': ['0-0'],
    '2': ['1-0', '0-1'],
    '3': ['2-0', '1-1', '0-2'],
    '4': ['2-1', '1-2'],
    '5': ['2-2'],
    'final': []
};

const STAGE_RESULTS = {
    '4': [{ score: '3-0', type: 'qualified' }, { score: '0-3', type: 'eliminated' }],
    '5': [{ score: '3-1', type: 'qualified' }, { score: '1-3', type: 'eliminated' }],
    'final': [{ score: '3-2', type: 'qualified' }, { score: '2-3', type: 'eliminated' }]
};

const STAGES = ['1', '2', '3', '4', '5', 'final'];

let state = { teams: {}, matches: {}, currentStage: '1' };

// ===== Initialize =====
function init() {
    resetTournament();
    setupEventListeners();
}

function resetTournament() {
    state.teams = {};
    state.matches = {};
    state.currentStage = '1';

    TEAMS.forEach(t => {
        state.teams[t.id] = { ...t, wins: 0, losses: 0, qualified: false, eliminated: false };
    });

    matchupSlots.forEach((pair, i) => {
        state.matches[`r1-${i}`] = { pool: '0-0', team1: pair[0], team2: pair[1], winner: null };
    });

    renderAll();
    updateMinimap();
    renderMobileStage();
}

// ===== Event Listeners =====
function setupEventListeners() {
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm('Сбросить?')) resetTournament();
    });

    document.getElementById('swapWcBtn').addEventListener('click', () => {
        matchupSlots = matchupSlots.map(p => p.map(id => id === 'wc1' ? 'wc2' : id === 'wc2' ? 'wc1' : id));
        resetTournament();
    });

    document.getElementById('setupBtn').addEventListener('click', openSetupModal);
    document.getElementById('applySetup').addEventListener('click', applySetup);
    document.getElementById('cancelSetup').addEventListener('click', closeSetupModal);
    document.querySelector('.modal-overlay')?.addEventListener('click', closeSetupModal);

    document.getElementById('mobileTestBtn').addEventListener('click', () => {
        document.body.classList.toggle('mobile-test');
        renderMobileStage();
    });

    // Minimap stage clicks
    document.querySelectorAll('.mini-stage').forEach(el => {
        el.addEventListener('click', () => {
            state.currentStage = el.dataset.stage;
            updateMinimap();
            renderMobileStage();
        });
    });

    // Stage navigation
    document.getElementById('prevStage').addEventListener('click', () => {
        const idx = STAGES.indexOf(state.currentStage);
        if (idx > 0) {
            state.currentStage = STAGES[idx - 1];
            updateMinimap();
            renderMobileStage();
        }
    });

    document.getElementById('nextStage').addEventListener('click', () => {
        const idx = STAGES.indexOf(state.currentStage);
        if (idx < STAGES.length - 1) {
            state.currentStage = STAGES[idx + 1];
            updateMinimap();
            renderMobileStage();
        }
    });
}

// ===== Minimap =====
function updateMinimap() {
    document.querySelectorAll('.mini-stage').forEach(el => {
        const stage = el.dataset.stage;
        el.classList.remove('active', 'completed');

        if (stage === state.currentStage) {
            el.classList.add('active');
        } else if (isStageCompleted(stage)) {
            el.classList.add('completed');
        }
    });

    // Update title
    const titles = { '1': 'ЭТАП 1', '2': 'ЭТАП 2', '3': 'ЭТАП 3', '4': 'ЭТАП 4', '5': 'ЭТАП 5', 'final': 'ФИНАЛ' };
    document.getElementById('activeStageTitle').textContent = titles[state.currentStage];
}

function isStageCompleted(stage) {
    const pools = STAGE_POOLS[stage] || [];
    if (pools.length === 0) return false;

    for (const pool of pools) {
        const matches = Object.values(state.matches).filter(m => m.pool === pool);
        if (matches.length === 0) return false;
        for (const m of matches) {
            if (!m.winner) return false;
        }
    }
    return true;
}

// ===== Mobile Stage Rendering =====
function renderMobileStage() {
    const container = document.getElementById('activeStageContent');
    const pools = STAGE_POOLS[state.currentStage] || [];
    const results = STAGE_RESULTS[state.currentStage] || [];

    let html = '';

    // If final stage - show FULL tournament results
    if (state.currentStage === 'final') {
        html = renderFullResults();
        container.innerHTML = html;
        return;
    }

    // Render result boxes if any (at top for qualified)
    results.filter(r => r.type === 'qualified').forEach(r => {
        html += renderMobileResult(r.score, r.type);
    });

    // Render pools
    pools.forEach(pool => {
        const matches = Object.entries(state.matches).filter(([, m]) => m.pool === pool).map(([id, m]) => ({ id, ...m }));
        const poolClass = pool.startsWith('2') || pool === '1-0' ? 'winners' : pool.endsWith('2') || pool === '0-1' ? 'losers' : '';

        html += `
            <div class="mobile-pool-box ${poolClass}">
                <div class="mobile-pool-header">
                    <span class="mobile-pool-score">${pool}</span>
                    <span class="mobile-pool-format">${getFormat(pool)}</span>
                </div>
                <div class="matches-list">
                    ${renderMatches(matches)}
                </div>
            </div>
        `;
    });

    // Render eliminated results (at bottom)
    results.filter(r => r.type === 'eliminated').forEach(r => {
        html += renderMobileResult(r.score, r.type);
    });

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.match-team:not(.disabled)').forEach(el => {
        el.addEventListener('click', () => selectWinner(el.dataset.match, el.dataset.team));
    });
}

function renderFullResults() {
    const qualified = Object.values(state.teams).filter(t => t.qualified);
    const eliminated = Object.values(state.teams).filter(t => t.eliminated);

    // Sort by score
    qualified.sort((a, b) => a.losses - b.losses);
    eliminated.sort((a, b) => a.wins - b.wins);

    return `
        <div class="full-results">
            <div class="full-results-title">🏆 ИТОГИ ТУРНИРА</div>
            
            <div class="full-results-section qualified">
                <div class="full-results-header">✅ ПРОШЛИ В ПЛЕЙ-ОФФ (${qualified.length}/8)</div>
                <div class="full-results-list">
                    ${qualified.length > 0 ? qualified.map(t => `
                        <div class="full-result-team">
                            <span class="full-result-score" style="color:#22c55e">${t.wins}-${t.losses}</span>
                            ${getTeamHtml(t)}
                        </div>
                    `).join('') : '<div class="result-empty">Ещё никто не прошёл</div>'}
                </div>
            </div>
            
            <div class="full-results-section eliminated">
                <div class="full-results-header">❌ ВЫБЫЛИ (${eliminated.length}/8)</div>
                <div class="full-results-list">
                    ${eliminated.length > 0 ? eliminated.map(t => `
                        <div class="full-result-team">
                            <span class="full-result-score" style="color:#dc2626">${t.wins}-${t.losses}</span>
                            ${getTeamHtml(t)}
                        </div>
                    `).join('') : '<div class="result-empty">Ещё никто не выбыл</div>'}
                </div>
            </div>
        </div>
    `;
}

function renderMobileResult(score, type) {
    const [w, l] = score.split('-').map(Number);
    const teams = Object.values(state.teams).filter(t => t.wins === w && t.losses === l && (t.qualified || t.eliminated));

    return `
        <div class="mobile-result-box ${type}">
            <div class="mobile-result-score">${score}</div>
            <div class="mobile-result-text">${type === 'qualified' ? 'ПЛЕЙ-ОФФ' : 'ВЫБЫЛИ'}</div>
            <div class="matches-list" style="text-align:left;">
                ${teams.length ? teams.map(t => `<div class="result-team">${getTeamHtml(t)}</div>`).join('') : '<div class="result-empty">—</div>'}
            </div>
        </div>
    `;
}

function renderMatches(matches) {
    if (!matches.length) return '<div class="empty-slot">Ожидание...</div>';

    return matches.map(m => {
        const t1 = state.teams[m.team1], t2 = state.teams[m.team2];
        const t1c = m.winner === m.team1 ? 'winner' : m.winner === m.team2 ? 'loser' : '';
        const t2c = m.winner === m.team2 ? 'winner' : m.winner === m.team1 ? 'loser' : '';
        const dis = m.winner ? 'disabled' : '';

        return `
            <div class="match-row">
                <div class="match-team ${t1c} ${dis}" data-match="${m.id}" data-team="${m.team1}">${getTeamHtml(t1)}</div>
                <span class="match-vs">vs</span>
                <div class="match-team ${t2c} ${dis}" data-match="${m.id}" data-team="${m.team2}">${getTeamHtml(t2)}</div>
            </div>
        `;
    }).join('');
}

function getFormat(pool) {
    return ['2-0', '0-2', '2-1', '1-2', '2-2'].includes(pool) ? 'BO3' : 'BO1';
}

// ===== Setup Modal =====
function openSetupModal() {
    document.getElementById('setupTeams').innerHTML = TEAMS.map(team => {
        const t = state.teams[team.id];
        const logo = team.logo ? `<img src="${team.logo}" class="team-logo">` : '';
        return `
            <div class="setup-item">
                <img src="${team.flag}" class="team-flag">
                ${logo}
                <span class="team-name">${team.code}${team.isWildcard ? '*' : ''}</span>
                <select data-team="${team.id}">
                    ${['0-0', '1-0', '0-1', '2-0', '1-1', '0-2', '2-1', '1-2', '3-0', '0-3', '3-1', '1-3', '3-2', '2-3'].map(s => {
            const [w, l] = s.split('-').map(Number);
            const sel = t.wins === w && t.losses === l ? 'selected' : '';
            return `<option value="${s}" ${sel}>${s}</option>`;
        }).join('')}
                </select>
            </div>
        `;
    }).join('');
    document.getElementById('setupModal').classList.remove('hidden');
}

function closeSetupModal() { document.getElementById('setupModal').classList.add('hidden'); }

function applySetup() {
    document.querySelectorAll('#setupTeams select').forEach(sel => {
        const [w, l] = sel.value.split('-').map(Number);
        const team = TEAMS.find(t => t.id === sel.dataset.team);
        state.teams[sel.dataset.team] = { ...team, wins: w, losses: l, qualified: w >= 3, eliminated: l >= 3 };
    });
    state.matches = {};
    generateMatches();
    closeSetupModal();
    renderAll();
    renderMobileStage();
}

// ===== Match Logic =====
function generateMatches() {
    ['0-0', '1-0', '0-1', '2-0', '1-1', '0-2', '2-1', '1-2', '2-2'].forEach(pool => {
        const [w, l] = pool.split('-').map(Number);
        const teams = Object.values(state.teams).filter(t => t.wins === w && t.losses === l && !t.qualified && !t.eliminated);
        const shuffled = [...teams].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length - 1; i += 2) {
            state.matches[`gen-${pool}-${i}`] = { pool, team1: shuffled[i].id, team2: shuffled[i + 1].id, winner: null };
        }
    });
}

function selectWinner(matchId, winnerId) {
    const match = state.matches[matchId];
    if (!match || match.winner) return;

    const loserId = match.team1 === winnerId ? match.team2 : match.team1;
    match.winner = winnerId;
    state.teams[winnerId].wins++;
    state.teams[loserId].losses++;

    if (state.teams[winnerId].wins >= 3) state.teams[winnerId].qualified = true;
    if (state.teams[loserId].losses >= 3) state.teams[loserId].eliminated = true;

    generateNewMatches();
    renderAll();
    renderMobileStage();
    checkAutoAdvance();
}

function generateNewMatches() {
    ['1-0', '0-1', '2-0', '1-1', '0-2', '2-1', '1-2', '2-2'].forEach(pool => {
        const [w, l] = pool.split('-').map(Number);
        const teams = Object.values(state.teams).filter(t => t.wins === w && t.losses === l && !t.qualified && !t.eliminated);
        const inMatches = new Set();
        Object.values(state.matches).forEach(m => { if (m.pool === pool && !m.winner) { inMatches.add(m.team1); inMatches.add(m.team2); } });
        const need = teams.filter(t => !inMatches.has(t.id));
        for (let i = 0; i < need.length - 1; i += 2) {
            state.matches[`new-${pool}-${Date.now()}-${i}`] = { pool, team1: need[i].id, team2: need[i + 1].id, winner: null };
        }
    });
}

function checkAutoAdvance() {
    const pools = STAGE_POOLS[state.currentStage] || [];
    let allDone = true;
    pools.forEach(pool => {
        Object.values(state.matches).forEach(m => {
            if (m.pool === pool && !m.winner) allDone = false;
        });
    });

    if (allDone && pools.length > 0) {
        const idx = STAGES.indexOf(state.currentStage);
        if (idx < STAGES.length - 1) {
            setTimeout(() => {
                state.currentStage = STAGES[idx + 1];
                updateMinimap();
                renderMobileStage();
            }, 400);
        }
    }
}

// ===== Rendering =====
function getTeamHtml(team) {
    const logo = team.logo ? `<img src="${team.logo}" class="team-logo">` : '';
    return `<img src="${team.flag}" class="team-flag">${logo}<span class="team-code">${team.code}${team.isWildcard ? '*' : ''}</span>`;
}

function renderAll() {
    ['0-0', '1-0', '0-1', '2-0', '1-1', '0-2', '2-1', '1-2', '2-2'].forEach(renderPool);
    ['3-0', '0-3', '3-1', '1-3', '3-2', '2-3'].forEach(renderResult);
}

function renderPool(pool) {
    const container = document.getElementById(`matches-${pool}`);
    if (!container) return;

    const matches = Object.entries(state.matches).filter(([, m]) => m.pool === pool).map(([id, m]) => ({ id, ...m }));
    const expected = { '0-0': 8, '1-0': 4, '0-1': 4, '2-0': 2, '1-1': 4, '0-2': 2, '2-1': 3, '1-2': 3, '2-2': 3 }[pool] || 4;

    let html = matches.map(m => {
        const t1 = state.teams[m.team1], t2 = state.teams[m.team2];
        const t1c = m.winner === m.team1 ? 'winner' : m.winner === m.team2 ? 'loser' : '';
        const t2c = m.winner === m.team2 ? 'winner' : m.winner === m.team1 ? 'loser' : '';
        const dis = m.winner ? 'disabled' : '';
        return `<div class="match-row"><div class="match-team ${t1c} ${dis}" data-match="${m.id}" data-team="${m.team1}">${getTeamHtml(t1)}</div><span class="match-vs">vs</span><div class="match-team ${t2c} ${dis}" data-match="${m.id}" data-team="${m.team2}">${getTeamHtml(t2)}</div></div>`;
    }).join('');

    for (let i = 0; i < expected - matches.length; i++) {
        html += '<div class="match-row"><div class="empty-slot">—</div><span class="match-vs">vs</span><div class="empty-slot">—</div></div>';
    }

    container.innerHTML = html;
    container.querySelectorAll('.match-team:not(.disabled)').forEach(el => {
        el.addEventListener('click', () => selectWinner(el.dataset.match, el.dataset.team));
    });
}

function renderResult(score) {
    const container = document.getElementById(`result-${score}`);
    if (!container) return;
    const [w, l] = score.split('-').map(Number);
    const teams = Object.values(state.teams).filter(t => t.wins === w && t.losses === l && (t.qualified || t.eliminated));
    container.innerHTML = teams.length ? teams.map(t => `<div class="result-team">${getTeamHtml(t)}</div>`).join('') : '<div class="result-empty">—</div>';
}

// ===== Firebase Auto-Save =====
function getUserId() {
    let id = localStorage.getItem('m7_user_id');
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem('m7_user_id', id);
    }
    return id;
}

function getUserNumber() {
    let num = localStorage.getItem('m7_user_number');
    if (!num) {
        num = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number
        localStorage.setItem('m7_user_number', num.toString());
    }
    return parseInt(num);
}

function getDeviceInfo() {
    const ua = navigator.userAgent;

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    // Detect Browser
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Opera')) browser = 'Opera';

    // Detect Mobile/Desktop
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';

    return {
        os,
        browser,
        deviceType,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language
    };
}

function isTournamentComplete() {
    const qualified = Object.values(state.teams).filter(t => t.qualified).length;
    const eliminated = Object.values(state.teams).filter(t => t.eliminated).length;
    return qualified === 8 && eliminated === 8;
}

function savePrediction() {
    if (typeof db === 'undefined') {
        console.log('Firebase not configured - skipping save');
        return;
    }

    const qualified = Object.values(state.teams).filter(t => t.qualified);
    const eliminated = Object.values(state.teams).filter(t => t.eliminated);

    const predictionData = {
        userId: getUserId(),
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString('ru-RU'),
        qualified: qualified.map(t => ({
            code: t.code,
            name: t.name,
            score: `${t.wins}-${t.losses}`
        })),
        eliminated: eliminated.map(t => ({
            code: t.code,
            name: t.name,
            score: `${t.wins}-${t.losses}`
        })),
        allTeams: Object.values(state.teams).map(t => ({
            code: t.code,
            wins: t.wins,
            losses: t.losses,
            qualified: t.qualified,
            eliminated: t.eliminated
        }))
    };

    db.collection('predictions').add(predictionData)
        .then(() => {
            console.log('Prediction saved!');
        })
        .catch(err => {
            console.error('Error saving:', err);
        });
}

function checkAndAutoSave() {
    if (isTournamentComplete() && !state.saved) {
        state.saved = true;
        savePrediction();
    }
}

// Hook into checkAutoAdvance
const originalCheckAutoAdvance = checkAutoAdvance;
checkAutoAdvance = function () {
    originalCheckAutoAdvance();
    checkAndAutoSave();
};

document.addEventListener('DOMContentLoaded', init);

