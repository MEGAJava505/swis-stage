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
    setTimeout(renderFlowConnectors, 10);
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

    // Save button handler
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => savePrediction());
    }

    // Shuffle button handler - reshuffles pending matchups in each pool
    const shuffleBtn = document.getElementById('shuffleBtn');
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', shufflePendingMatchups);
    }

    document.getElementById('setupBtn').addEventListener('click', openSetupModal);
    document.getElementById('applySetup').addEventListener('click', applySetup);
    document.getElementById('cancelSetup').addEventListener('click', closeSetupModal);
    document.querySelector('.modal-overlay')?.addEventListener('click', closeSetupModal);

    const mobileTestBtn = document.getElementById('mobileTestBtn');
    if (mobileTestBtn) {
        mobileTestBtn.addEventListener('click', () => {
            document.body.classList.toggle('mobile-test');
            renderMobileStage();
        });
    }

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
    setTimeout(renderFlowConnectors, 10);
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
    const winner = state.teams[winnerId];
    const loser = state.teams[loserId];

    match.winner = winnerId;
    winner.wins++;
    loser.losses++;

    if (winner.wins >= 3) winner.qualified = true;
    if (loser.losses >= 3) loser.eliminated = true;

    renderAll();
    setTimeout(renderFlowConnectors, 10);
    renderMobileStage();
    checkAutoAdvance();
}

// Render team icons in arrow columns between stages
function renderFlowTeams() {
    return; // Functionality disabled by user request
    /*
    const transitions = {
        '0-0': { winners: '1-0', losers: '0-1', arrow: 1 },
        '1-0': { winners: '2-0', losers: '1-1', arrow: 2 },
        '0-1': { winners: '1-1', losers: '0-2', arrow: 2 },
        '2-0': { winners: '3-0', losers: '2-1', arrow: 3 },
        '1-1': { winners: '2-1', losers: '1-2', arrow: 3 },
        '0-2': { winners: '1-2', losers: '0-3', arrow: 3 },
        '2-1': { winners: '3-1', losers: '2-2', arrow: 4 },
        '1-2': { winners: '2-2', losers: '1-3', arrow: 4 },
        '2-2': { winners: '3-2', losers: '2-3', arrow: 5 }
    };
    
    // Process each arrow column
    for (let arrowNum = 1; arrowNum <= 5; arrowNum++) {
        const winnersContainer = document.getElementById(`flow-winners-${arrowNum}`);
        const losersContainer = document.getElementById(`flow-losers-${arrowNum}`);
        if (!winnersContainer || !losersContainer) continue;
    
        let allWinners = [];
        let allLosers = [];
    
        // Find all source pools for this arrow
        Object.entries(transitions).forEach(([sourcePool, dest]) => {
            if (dest.arrow !== arrowNum) return;
    
            // Get decided matches from this source pool
            const decidedMatches = Object.values(state.matches).filter(m => m.pool === sourcePool && m.winner);
    
            decidedMatches.forEach(m => {
                const winner = state.teams[m.winner];
                const loserId = m.team1 === m.winner ? m.team2 : m.team1;
                const loser = state.teams[loserId];
    
                // Check if team already has a match in destination pool (then don't show in arrow)
                const winnerHasMatch = Object.values(state.matches).some(
                    match => match.pool === dest.winners && (match.team1 === winner.id || match.team2 === winner.id)
                );
                const loserHasMatch = Object.values(state.matches).some(
                    match => match.pool === dest.losers && (match.team1 === loser.id || match.team2 === loser.id)
                );
    
                // Only show if team doesn't have a match yet and isn't qualified/eliminated
                if (!winnerHasMatch && !winner.qualified) {
                    allWinners.push(winner);
                }
                if (!loserHasMatch && !loser.eliminated) {
                    allLosers.push(loser);
                }
            });
        });
    
        winnersContainer.innerHTML = allWinners.map(t => `
            <div class="flow-team-icon winner">
                <img src="${t.flag}" class="team-flag">
                <span>${t.code}</span>
            </div>
        `).join('');
    
        losersContainer.innerHTML = allLosers.map(t => `
            <div class="flow-team-icon loser">
                <img src="${t.flag}" class="team-flag">
                <span>${t.code}</span>
            </div>
        `).join('');
        }
        */
}

function showFlowIndicator(teamCode, destination, type) {
    // Remove existing flow popup if any
    const existing = document.querySelector('.flow-popup');

    if (!existing) {
        // Create new popup container
        const popup = document.createElement('div');
        popup.className = 'flow-popup';
        popup.innerHTML = `
        <div class="flow-title">📍 ПЕРЕХОД</div>
        <div class="flow-items"></div>
    `;
        popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 12, 16, 0.98);
        border: 3px solid #b89d2a;
        padding: 1.25rem 2rem;
        border-radius: 12px;
        z-index: 1000;
        animation: flowIn 0.3s ease;
        box-shadow: 0 8px 40px rgba(0,0,0,0.8);
        min-width: 200px;
    `;
        document.body.appendChild(popup);

        // Auto-remove after delay
        setTimeout(() => popup.remove(), 2000);
    }

    const popup = document.querySelector('.flow-popup');
    const itemsContainer = popup.querySelector('.flow-items');

    const color = type === 'winner' ? '#22c55e' : '#dc2626';
    const icon = type === 'winner' ? '🏆' : '💀';
    const label = type === 'winner' ? 'WIN' : 'LOSE';

    const item = document.createElement('div');
    item.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    color: white;
`;
    item.innerHTML = `
    <span style="font-size: 1.25rem;">${icon}</span>
    <span style="font-weight: 700; font-size: 1.1rem;">${teamCode}</span>
    <span style="color: ${color}; font-size: 0.75rem; background: ${color}22; padding: 0.2rem 0.5rem; border-radius: 4px;">${label}</span>
    <span style="font-family: 'Bebas Neue'; font-size: 1.3rem; color: ${color};">→ ${destination}</span>
`;

    itemsContainer.appendChild(item);
}

function generateNewMatches() {
    ['1-0', '0-1', '2-0', '1-1', '0-2', '2-1', '1-2', '2-2'].forEach(pool => {
        const [w, l] = pool.split('-').map(Number);
        const teams = Object.values(state.teams).filter(t => t.wins === w && t.losses === l && !t.qualified && !t.eliminated);
        const inMatches = new Set();
        Object.values(state.matches).forEach(m => { if (m.pool === pool && !m.winner) { inMatches.add(m.team1); inMatches.add(m.team2); } });
        const need = teams.filter(t => !inMatches.has(t.id));

        // Auto-shuffle teams before pairing
        for (let i = need.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [need[i], need[j]] = [need[j], need[i]];
        }

        for (let i = 0; i < need.length - 1; i += 2) {
            state.matches[`new-${pool}-${Date.now()}-${i}`] = { pool, team1: need[i].id, team2: need[i + 1].id, winner: null };
        }
    });
}

// Shuffle all pending (unpicked) matchups in each pool
function shufflePendingMatchups() {
    const pools = ['0-0', '1-0', '0-1', '2-0', '1-1', '0-2', '2-1', '1-2', '2-2'];

    pools.forEach(pool => {
        // Get all pending matches in this pool
        const pendingMatchIds = Object.entries(state.matches)
            .filter(([, m]) => m.pool === pool && !m.winner)
            .map(([id]) => id);

        if (pendingMatchIds.length < 2) return; // Nothing to shuffle

        // Collect all teams from pending matches
        const teamsInPool = [];
        pendingMatchIds.forEach(id => {
            teamsInPool.push(state.matches[id].team1);
            teamsInPool.push(state.matches[id].team2);
            // Remove old match
            delete state.matches[id];
        });

        // Shuffle teams
        for (let i = teamsInPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [teamsInPool[i], teamsInPool[j]] = [teamsInPool[j], teamsInPool[i]];
        }

        // Create new matchups
        for (let i = 0; i < teamsInPool.length - 1; i += 2) {
            state.matches[`shuffle-${pool}-${Date.now()}-${i}`] = {
                pool,
                team1: teamsInPool[i],
                team2: teamsInPool[i + 1],
                winner: null
            };
        }
    });

    renderAll();
    setTimeout(renderFlowConnectors, 10);
    renderMobileStage();

    // Show notification
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = '🎲 Матчи перемешаны!';
    notification.style.background = '#8b5cf6';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
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
            // Stage complete! Generate shuffled matchups for next stage pools
            const nextStage = STAGES[idx + 1];
            const nextPools = STAGE_POOLS[nextStage] || [];

            nextPools.forEach(pool => {
                const [w, l] = pool.split('-').map(Number);
                // Get all teams that should be in this pool
                const teamsForPool = Object.values(state.teams).filter(t =>
                    t.wins === w && t.losses === l && !t.qualified && !t.eliminated
                );

                // Check if they already have matches in this pool
                const inMatches = new Set();
                Object.values(state.matches).forEach(m => {
                    if (m.pool === pool) {
                        inMatches.add(m.team1);
                        inMatches.add(m.team2);
                    }
                });

                const needMatchup = teamsForPool.filter(t => !inMatches.has(t.id));

                if (needMatchup.length >= 2) {
                    // SHUFFLE the teams (Fisher-Yates)
                    for (let i = needMatchup.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [needMatchup[i], needMatchup[j]] = [needMatchup[j], needMatchup[i]];
                    }

                    // Create random matchups
                    for (let i = 0; i < needMatchup.length - 1; i += 2) {
                        state.matches[`stage-${pool}-${Date.now()}-${i}`] = {
                            pool,
                            team1: needMatchup[i].id,
                            team2: needMatchup[i + 1].id,
                            winner: null
                        };
                    }
                }
            });

            setTimeout(() => {
                state.currentStage = nextStage;
                updateMinimap();
                renderAll();
                renderFlowConnectors();
                renderMobileStage();

                // Show shuffle notification
                const notification = document.createElement('div');
                notification.className = 'save-notification';
                notification.textContent = '🎲 Следующий этап — матчи перемешаны!';
                notification.style.background = '#8b5cf6';
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 2500);
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

// Word lists for readable usernames
const ADJECTIVES = ['Red', 'Blue', 'Green', 'Golden', 'Silver', 'Dark', 'Bright', 'Swift', 'Brave', 'Lucky', 'Wild', 'Calm', 'Fierce', 'Noble', 'Silent', 'Mystic'];
const ANIMALS = ['Wolf', 'Tiger', 'Eagle', 'Dragon', 'Phoenix', 'Lion', 'Bear', 'Hawk', 'Falcon', 'Panther', 'Fox', 'Raven', 'Shark', 'Cobra', 'Lynx', 'Owl'];

function generateReadableName() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const num = Math.floor(Math.random() * 99) + 1;
    return `${adj}_${animal}_${num}`;
}

function getUserId() {
    let id = localStorage.getItem('m7_user_id');
    if (!id) {
        id = generateReadableName();
        localStorage.setItem('m7_user_id', id);
    }
    return id;
}

function getUserNumber() {
    let num = localStorage.getItem('m7_user_number');
    if (!num) {
        num = Math.floor(Math.random() * 9000) + 1000;
        localStorage.setItem('m7_user_number', num.toString());
    }
    return parseInt(num);
}

// Generate consistent color from userId for visual identification
function getColorFromUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
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

function savePrediction(retryCount = 0) {
    if (typeof db === 'undefined') {
        console.log('Firebase not configured - skipping save');
        return Promise.reject('Firebase not configured');
    }

    const maxRetries = 3;
    const qualified = Object.values(state.teams).filter(t => t.qualified);
    const eliminated = Object.values(state.teams).filter(t => t.eliminated);
    const userId = getUserId();

    const predictionData = {
        userId: userId,
        userColor: getColorFromUserId(userId),
        timestamp: new Date().toISOString(),
        localTime: new Date().toLocaleString('ru-RU'),
        isComplete: isTournamentComplete(),
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
        })),
        // Save full match history for visualization
        matchHistory: Object.entries(state.matches).map(([id, m]) => ({
            matchId: id,
            pool: m.pool,
            team1: m.team1,
            team2: m.team2,
            winner: m.winner
        }))
    };

    return db.collection('predictions').add(predictionData)
        .then(() => {
            console.log('✅ Prediction saved!');
            showSaveNotification('success');
            return true;
        })
        .catch(err => {
            console.error(`❌ Error saving (attempt ${retryCount + 1}/${maxRetries}):`, err);

            if (retryCount < maxRetries - 1) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, retryCount) * 1000;
                console.log(`🔄 Retrying in ${delay / 1000}s...`);
                return new Promise(resolve => setTimeout(resolve, delay))
                    .then(() => savePrediction(retryCount + 1));
            } else {
                showSaveNotification('error');
                throw err;
            }
        });
}

function showSaveNotification(type) {
    // Remove existing notification if any
    const existing = document.querySelector('.save-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `save-notification ${type}`;
    notification.textContent = type === 'success'
        ? '✅ Сохранено!'
        : '❌ Ошибка сохранения';
    notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    background: ${type === 'success' ? '#22c55e' : '#dc2626'};
`;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
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

// Render dynamic flow connectors (lines between stages)
function renderFlowConnectors() {
    const transitions = [
        { arrow: 1, src: ['0-0'], destW: ['1-0'], destL: ['0-1'] },
        { arrow: 2, src: ['1-0', '0-1'], destW: ['2-0', '1-1'], destL: ['1-1', '0-2'] },
        { arrow: 3, src: ['2-0', '1-1', '0-2'], destW: ['3-0', '2-1', '1-2'], destL: ['2-1', '1-2', '0-3'] },
        { arrow: 4, src: ['2-1', '1-2'], destW: ['3-1', '2-2'], destL: ['2-2', '1-3'] },
        { arrow: 5, src: ['2-2'], destW: ['3-2'], destL: ['2-3'] }
    ];

    // Determine active stage (show latest stage that has visual progress)
    let activeArrow = 0;
    for (let i = 5; i >= 1; i--) {
        const trans = transitions.find(t => t.arrow === i);
        const hasDecided = Object.values(state.matches).some(m => trans.src.includes(m.pool) && m.winner);
        if (hasDecided) {
            activeArrow = i;
            break;
        }
    }

    // Render connectors
    for (let i = 1; i <= 5; i++) {
        const connector = document.getElementById(`conn-${i}`);
        if (!connector) continue;

        if (i === activeArrow) {
            connector.classList.add('active');
            renderFlowTeamIcons(connector, transitions.find(t => t.arrow === i));
        } else {
            connector.classList.remove('active');
            connector.innerHTML = '';
        }
    }
}

function renderFlowTeamIcons(container, trans) {
    // Get decided matches from source pools
    const decidedMatches = Object.values(state.matches).filter(m => trans.src.includes(m.pool) && m.winner);

    if (decidedMatches.length === 0) {
        container.innerHTML = '';
        return;
    }

    // Group by source pool
    const poolGroups = {};
    trans.src.forEach(pool => {
        poolGroups[pool] = { winners: [], losers: [] };
    });

    decidedMatches.forEach(m => {
        const winnerTeam = state.teams[m.winner];
        const loserId = m.team1 === m.winner ? m.team2 : m.team1;
        const loserTeam = state.teams[loserId];

        if (poolGroups[m.pool]) {
            if (winnerTeam && !winnerTeam.qualified) {
                poolGroups[m.pool].winners.push(winnerTeam);
            }
            if (loserTeam && !loserTeam.eliminated) {
                poolGroups[m.pool].losers.push(loserTeam);
            }
        }
    });

    // Build HTML - each pool gets its own winner/loser bars
    // Sort pools by position: upper pools (more wins) first, lower pools (more losses) last
    const sortedPools = [...trans.src].sort((a, b) => {
        const [winsA, lossesA] = a.split('-').map(Number);
        const [winsB, lossesB] = b.split('-').map(Number);
        // Sort by wins descending (upper pools first), then by losses ascending
        return (winsB - lossesB) - (winsA - lossesA);
    });

    let html = '';
    sortedPools.forEach(pool => {
        const group = poolGroups[pool];
        if (group.winners.length > 0 || group.losers.length > 0) {
            // Determine position class based on wins vs losses
            const [wins, losses] = pool.split('-').map(Number);
            const posClass = wins > losses ? 'flow-pool-upper' : (losses > wins ? 'flow-pool-lower' : 'flow-pool-mid');

            html += `
                <div class="flow-pool-group ${posClass}">
                    <div class="flow-bar flow-bar-winner">
                        ${group.winners.map(t => `
                            <div class="flow-team">
                                <img src="${t.flag}" class="flow-flag">
                                <img src="${t.logo}" class="flow-logo">
                            </div>
                        `).join('')}
                    </div>
                    <div class="flow-bar flow-bar-loser">
                        ${group.losers.map(t => `
                            <div class="flow-team">
                                <img src="${t.flag}" class="flow-flag">
                                <img src="${t.logo}" class="flow-logo">
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

// ==========================================
// USER NICKNAME & SAVE LOGIC
// ==========================================

// --- Open Nickname/Save Modal ---
function openSaveModal() {
    const modal = document.getElementById('nickModal');
    const modalInput = document.getElementById('nicknameInput');
    const panelInput = document.getElementById('nickInput');
    modal.classList.remove('hidden');
    // Sync modal input with panel input
    modalInput.value = panelInput?.value || localStorage.getItem('m7_nickname') || '';
    modalInput.focus();
}

// Handler for Save button - saves directly using panel input
document.getElementById('saveBtn')?.addEventListener('click', () => {
    savePrediction();
});

document.getElementById('closeNickBtn')?.addEventListener('click', () => {
    document.getElementById('nickModal').classList.add('hidden');
});

document.getElementById('saveNickBtn')?.addEventListener('click', () => {
    const modalNick = document.getElementById('nicknameInput').value.trim();
    const panelInput = document.getElementById('nickInput');

    // Sync panel input with modal input
    if (panelInput) panelInput.value = modalNick;

    // Save to localStorage
    if (modalNick) {
        localStorage.setItem('m7_nickname', modalNick);
    } else {
        localStorage.removeItem('m7_nickname');
    }
    document.getElementById('nickModal').classList.add('hidden');

    // Save to Firebase
    savePrediction();
});

// --- Constants & Helpers ---

function getUserId() {
    let id = localStorage.getItem('m7_user_id');
    if (!id) {
        id = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        localStorage.setItem('m7_user_id', id);
    }
    return id;
}

function getNickname() {
    // Priority: panel input > localStorage
    const panelInput = document.getElementById('nickInput');
    if (panelInput && panelInput.value.trim()) {
        return panelInput.value.trim();
    }
    return localStorage.getItem('m7_nickname') || null;
}

function isTournamentComplete() {
    if (typeof state === 'undefined') return false;
    // 8 qualified and 8 eliminated
    const qualified = Object.values(state.teams).filter(t => t.qualified).length;
    const eliminated = Object.values(state.teams).filter(t => t.eliminated).length;
    return qualified === 8 && eliminated === 8;
}

// --- Main Save Function ---
window.savePrediction = function () {
    if (typeof db === 'undefined') {
        console.log('Firebase not configured - skipping save');
        return;
    }

    const qualified = Object.values(state.teams).filter(t => t.qualified);
    const eliminated = Object.values(state.teams).filter(t => t.eliminated);

    if (qualified.length === 0 && eliminated.length === 0) {
        alert('Сначала сделайте прогноз!');
        return;
    }

    const predictionData = {
        userId: getUserId(),
        nickname: getNickname(), // <--- NEW FIELD
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
        // All teams with positions for bracket visualization
        allTeams: Object.values(state.teams).map(t => ({
            code: t.code,
            wins: t.wins,
            losses: t.losses,
            qualified: t.qualified,
            eliminated: t.eliminated
        })),
        // Match history for path reconstruction
        matchHistory: Object.entries(state.matches)
            .filter(([, m]) => m.winner)
            .map(([id, m]) => ({
                pool: m.pool,
                team1: state.teams[m.team1].code,
                team2: state.teams[m.team2].code,
                winner: state.teams[m.winner].code
            }))
    };

    // Debug: log what we're saving
    console.log('=== SAVING PREDICTION ===');
    console.log('matchHistory length:', predictionData.matchHistory?.length);
    console.log('matchHistory:', predictionData.matchHistory);
    console.log('allTeams:', predictionData.allTeams?.map(t => `${t.code}: ${t.wins}-${t.losses}`));

    db.collection('predictions').add(predictionData)
        .then(() => {
            console.log('Prediction saved!');
        })
        .catch(err => {
            console.error('Error saving:', err);
        });
};

// --- Auto-Save Hook ---
const _originalCheck = window.checkAutoAdvance;
window.checkAutoAdvance = function () {
    if (_originalCheck) _originalCheck();

    if (isTournamentComplete() && !state.saved) {
        state.saved = true;
        // Open modal instead of silent save
        setTimeout(openSaveModal, 500);
    }
};

