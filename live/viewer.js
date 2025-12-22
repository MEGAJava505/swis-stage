// ===== M7 Viewer - Live Predictions =====

// ===== Teams Data (same as app.js) =====
const TEAMS = [
    { id: 'ae', code: 'AE', name: 'Alter Ego', flag: 'https://flagcdn.com/w20/id.png', logo: '../img/Alter_Ego_2022_allmode.png' },
    { id: 'aurora_tr', code: 'AUR', name: 'Aurora Turkey', flag: 'https://flagcdn.com/w20/tr.png', logo: '../img/Aurora_Gaming_2025_allmode.png' },
    { id: 'rora', code: 'RORA', name: 'Aurora PH', flag: 'https://flagcdn.com/w20/ph.png', logo: '../img/Aurora_Gaming_PH_2025_allmode.png' },
    { id: 'tl', code: 'TL', name: 'Team Liquid PH', flag: 'https://flagcdn.com/w20/ph.png', logo: '../img/Team_Liquid_PH_2024_darkmode.png' },
    { id: 'bse', code: 'BSE', name: 'Black Sentence', flag: 'https://flagcdn.com/w20/cl.png', logo: '../img/Black_Sentence_Esports_darkmode.png' },
    { id: 'cfu', code: 'CFU', name: 'CFU Gaming', flag: 'https://flagcdn.com/w20/kh.png', logo: '../img/CFU_Gaming_Cambodia_allmode.png' },
    { id: 'srg', code: 'SRG', name: 'SRG.OG', flag: 'https://flagcdn.com/w20/my.png', logo: '../img/SRG.OG_darkmode.png' },
    { id: 'cg', code: 'CG', name: 'CG Esports', flag: 'https://flagcdn.com/w20/my.png', logo: '../img/CG_Esports_allmode.png' },
    { id: 'wc1', code: 'VP', name: 'Virtus.Pro', flag: 'https://flagcdn.com/w20/ru.png', logo: '../img/Virtus.pro_2019_allmode.png', isWildcard: true },
    { id: 'yg', code: 'YG', name: 'Yangon Galacticos', flag: 'https://flagcdn.com/w20/mm.png', logo: '../img/Yangon_Galacticos_2021_allmode.png' },
    { id: 'evil', code: 'EVIL', name: 'Evil', flag: 'https://flagcdn.com/w20/sg.png', logo: '../img/EVIL_SG_allmode.png' },
    { id: 'spirit', code: 'TS', name: 'Team Spirit', flag: 'https://flagcdn.com/w20/ru.png', logo: '../img/Team_Spirit_2022_darkmode.png' },
    { id: 'dfyg', code: 'DFYG', name: 'DianFengYaoGuai', flag: 'https://flagcdn.com/w20/cn.png', logo: '../img/DFYG_allmode.png' },
    { id: 'flcn', code: 'FLCN', name: 'Team Falcons', flag: 'https://flagcdn.com/w20/sa.png', logo: '../img/Team_Falcons.png' },
    { id: 'onic', code: 'ONIC', name: 'ONIC Indonesia', flag: 'https://flagcdn.com/w20/id.png', logo: '../img/ONIC_Esports_2019_ID_allmode.png' },
    { id: 'wc2', code: 'AXE', name: 'AXE Esports', flag: 'https://flagcdn.com/w20/ae.png', logo: '../img/Axe_2023.png', isWildcard: true }
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

// State
let state = { teams: {}, matches: {}, currentStage: '1' };
let officialResults = {}; // Official results from Firebase
let userPredictions = {}; // User's predictions
let predictionStats = { correct: 0, incorrect: 0, pending: 0 };

// Wild Card Teams
const WC_TEAMS_A = [
    { id: 'bgt', code: 'BGT', name: 'Boostgate', flag: 'https://flagcdn.com/w20/tr.png', logo: '../img/Boostgate_Esports_allmode.png' },
    { id: 'leon', code: 'LEON', name: 'Leon Esports', flag: '', logo: '../img/Leon_Esports_allmode.png' },
    { id: 'zone', code: 'ZONE', name: 'Team Zone', flag: 'https://flagcdn.com/w20/mn.png', logo: '../img/Team_Zone_darkmode.png' },
    { id: 'zeta', code: 'ZETA', name: 'ZETA DIVISION', flag: 'https://flagcdn.com/w20/jp.png', logo: '../img/ZETA_DIVISION_darkmode.png' }
];

const WC_TEAMS_B = [
    { id: 'axe', code: 'AXE', name: 'Axe Esports', flag: 'https://flagcdn.com/w20/ae.png', logo: '../img/Axe_2023.png' },
    { id: 'gzg', code: 'GZG', name: 'Guangzhou', flag: 'https://flagcdn.com/w20/cn.png', logo: '../img/Guangzhou_Gaming_allmode.png' },
    { id: 'rlg', code: 'RLG', name: 'RLG SE', flag: 'https://flagcdn.com/w20/vn.png', logo: '../img/72px-Radiance_Legend_Gaming_China_logo_allmode.png' },
    { id: 'vp', code: 'VP', name: 'Virtus.pro', flag: 'https://flagcdn.com/w20/ru.png', logo: '../img/Virtus.pro_2019_allmode.png' }
];

const WC_GROUP_MATCHES = {
    A: [
        { day: 1, team1: 'zone', team2: 'zeta' }, { day: 1, team1: 'bgt', team2: 'leon' },
        { day: 2, team1: 'leon', team2: 'zeta' }, { day: 2, team1: 'bgt', team2: 'zone' },
        { day: 3, team1: 'zone', team2: 'leon' }, { day: 3, team1: 'bgt', team2: 'zeta' }
    ],
    B: [
        { day: 1, team1: 'gzg', team2: 'axe' }, { day: 1, team1: 'vp', team2: 'rlg' },
        { day: 2, team1: 'gzg', team2: 'rlg' }, { day: 2, team1: 'vp', team2: 'axe' },
        { day: 3, team1: 'axe', team2: 'rlg' }, { day: 3, team1: 'gzg', team2: 'vp' }
    ]
};

let wcState = {
    groupA: {},
    groupB: {},
    matchesA: [],
    matchesB: [],
    playoffs: { match1: null, match2: null },
    winners: []
};

let currentMode = null;

// ===== Firebase Real-time Listener =====
function setupRealtimeListener() {
    if (typeof db === 'undefined') {
        console.log('Firebase not configured');
        updateSyncStatus(false);
        return;
    }

    // Listen for official results
    db.collection('officialResults').doc('current')
        .onSnapshot((doc) => {
            if (doc.exists) {
                officialResults = doc.data();
                console.log('📥 Official results updated:', officialResults);
                applyOfficialResults();
                updatePredictionStats();
            }
        }, (error) => {
            console.error('Error listening to official results:', error);
            updateSyncStatus(false);
        });

    updateSyncStatus(true);
}

function updateSyncStatus(connected) {
    const el = document.getElementById('syncStatus');
    if (connected) {
        el.className = 'sync-status connected';
        el.textContent = '🔗 Подключено';
    } else {
        el.className = 'sync-status disconnected';
        el.textContent = '⚠️ Отключено';
    }
}

// Apply official results to the UI
function applyOfficialResults() {
    if (!officialResults) return;

    // Apply Wild Card results
    if (officialResults.wcMatchResults && currentMode === 'wildcard') {
        Object.entries(officialResults.wcMatchResults).forEach(([matchId, result]) => {
            if (result.confirmed) {
                const match = [...wcState.matchesA, ...wcState.matchesB].find(m => m.id === matchId);
                if (match) {
                    // Mark as official
                    match.official = true;
                    match.officialWinner = result.winner;
                    match.officialScore = result.score;
                }
            }
        });
        renderWcAll();
    }

    // Load custom Swiss matches from Firebase
    if (officialResults.swissMatchesCustom && currentMode === 'swiss') {
        Object.values(officialResults.swissMatchesCustom).forEach(customMatch => {
            // Add custom match to state if not exists
            if (!state.matches[customMatch.id]) {
                state.matches[customMatch.id] = {
                    pool: customMatch.pool,
                    team1: customMatch.team1,
                    team2: customMatch.team2,
                    winner: null
                };
            }
        });
    }

    // Apply Swiss Stage results
    if (officialResults.swissMatchResults && currentMode === 'swiss') {
        Object.entries(officialResults.swissMatchResults).forEach(([matchId, result]) => {
            if (result.confirmed && state.matches[matchId]) {
                state.matches[matchId].official = true;
                state.matches[matchId].officialWinner = result.winner;
                state.matches[matchId].officialScore = result.score;
            }
        });
        renderAllPools();
    }
}

// Update prediction stats
function updatePredictionStats() {
    predictionStats = { correct: 0, incorrect: 0, pending: 0 };

    // Check Swiss predictions
    Object.entries(state.matches).forEach(([matchId, match]) => {
        if (match.winner) {
            if (officialResults?.swissMatchResults?.[matchId]?.confirmed) {
                if (match.winner === officialResults.swissMatchResults[matchId].winner) {
                    predictionStats.correct++;
                } else {
                    predictionStats.incorrect++;
                }
            } else {
                predictionStats.pending++;
            }
        }
    });

    // Check Wild Card predictions
    [...wcState.matchesA, ...wcState.matchesB].forEach(match => {
        if (match.winner) {
            if (officialResults?.wcMatchResults?.[match.id]?.confirmed) {
                if (match.winner === officialResults.wcMatchResults[match.id].winner) {
                    predictionStats.correct++;
                } else {
                    predictionStats.incorrect++;
                }
            } else {
                predictionStats.pending++;
            }
        }
    });

    // Update UI
    document.getElementById('correctCount').textContent = predictionStats.correct;
    document.getElementById('incorrectCount').textContent = predictionStats.incorrect;
    document.getElementById('pendingCount').textContent = predictionStats.pending;

    const total = predictionStats.correct + predictionStats.incorrect;
    if (total > 0) {
        const accuracy = Math.round((predictionStats.correct / total) * 100);
        document.getElementById('accuracyPercent').textContent = accuracy + '%';
    } else {
        document.getElementById('accuracyPercent').textContent = '—';
    }
}

// ===== Initialize =====
function init() {
    setupModeSelection();
    initTimers();
    setupRealtimeListener();
    loadSavedPredictions();
}

function loadSavedPredictions() {
    const saved = localStorage.getItem('m7_viewer_predictions');
    if (saved) {
        try {
            userPredictions = JSON.parse(saved);
            console.log('Loaded saved predictions:', userPredictions);
        } catch (e) {
            console.error('Error loading predictions:', e);
        }
    }
}

function savePredictionsLocally() {
    localStorage.setItem('m7_viewer_predictions', JSON.stringify({
        swiss: state.matches,
        wildcard: {
            matchesA: wcState.matchesA,
            matchesB: wcState.matchesB,
            playoffs: wcState.playoffs
        }
    }));
}

function setupModeSelection() {
    document.getElementById('startWildcardBtn').addEventListener('click', () => startMode('wildcard'));
    document.getElementById('startSwissBtn').addEventListener('click', () => startMode('swiss'));

    const modeSwitchBtn = document.getElementById('modeSwitchBtn');
    if (modeSwitchBtn) {
        modeSwitchBtn.addEventListener('click', switchMode);
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll);
    }

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => savePrediction());
    }
}

function resetAll() {
    if (currentMode === 'wildcard') {
        initWildCard();
    } else {
        resetTournament();
        renderAllPools();
        renderMinimap();
    }
    savePredictionsLocally();
}

function switchMode() {
    const wcSection = document.getElementById('wildcardSection');
    const swissBracket = document.getElementById('swissBracket');
    const minimap = document.getElementById('mobileMinimap');
    const mobileStage = document.getElementById('mobileActiveStage');

    if (currentMode === 'wildcard') {
        wcSection.classList.add('hidden');
        swissBracket.classList.remove('hidden');
        if (minimap) minimap.classList.remove('hidden');
        if (mobileStage) mobileStage.classList.remove('hidden');
        currentMode = 'swiss';
        resetTournament();
        setupEventListeners();
    } else {
        swissBracket.classList.add('hidden');
        wcSection.classList.remove('hidden');
        if (minimap) minimap.classList.add('hidden');
        if (mobileStage) mobileStage.classList.add('hidden');
        currentMode = 'wildcard';
        initWildCard();
    }
}

function startMode(mode) {
    currentMode = mode;
    document.getElementById('modeSelection').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    const minimap = document.getElementById('mobileMinimap');
    const mobileStage = document.getElementById('mobileActiveStage');

    if (mode === 'wildcard') {
        document.getElementById('wildcardSection').classList.remove('hidden');
        document.getElementById('swissBracket').classList.add('hidden');
        if (minimap) minimap.classList.add('hidden');
        if (mobileStage) mobileStage.classList.add('hidden');
        initWildCard();
    } else {
        document.getElementById('wildcardSection').classList.add('hidden');
        document.getElementById('swissBracket').classList.remove('hidden');
        if (minimap) minimap.classList.remove('hidden');
        if (mobileStage) mobileStage.classList.remove('hidden');
        resetTournament();
        setupEventListeners();
    }
}

// ===== Wild Card Functions =====
function initWildCard() {
    resetWcState();
    renderWcAll();
    setupWcEventListeners();
}

function resetWcState() {
    wcState.groupA = {};
    wcState.groupB = {};
    WC_TEAMS_A.forEach(t => { wcState.groupA[t.id] = { ...t, matchWins: 0, matchLosses: 0, gameWins: 0, gameLosses: 0 }; });
    WC_TEAMS_B.forEach(t => { wcState.groupB[t.id] = { ...t, matchWins: 0, matchLosses: 0, gameWins: 0, gameLosses: 0 }; });
    wcState.matchesA = WC_GROUP_MATCHES.A.map((m, i) => ({ id: `a-${i}`, ...m, winner: null }));
    wcState.matchesB = WC_GROUP_MATCHES.B.map((m, i) => ({ id: `b-${i}`, ...m, winner: null }));
    wcState.playoffs = { match1: null, match2: null };
    wcState.winners = [];
}

function getWcTeam(id, group) {
    return group === 'A' ? wcState.groupA[id] : wcState.groupB[id];
}

function getWcStandings(group) {
    const teams = Object.values(group === 'A' ? wcState.groupA : wcState.groupB);
    return teams.sort((a, b) => {
        if (b.matchWins !== a.matchWins) return b.matchWins - a.matchWins;
        const diffA = a.gameWins - a.gameLosses, diffB = b.gameWins - b.gameLosses;
        return diffB !== diffA ? diffB - diffA : b.gameWins - a.gameWins;
    });
}

function selectWcGroupWinner(matchId, winnerId, group) {
    const matches = group === 'A' ? wcState.matchesA : wcState.matchesB;
    const match = matches.find(m => m.id === matchId);

    // Check if match is locked (official result exists)
    if (officialResults?.wcMatchResults?.[matchId]?.confirmed) {
        return; // Can't change locked match
    }

    if (!match || match.winner) return;

    match.winner = winnerId;
    const loserId = match.team1 === winnerId ? match.team2 : match.team1;
    const winner = getWcTeam(winnerId, group), loser = getWcTeam(loserId, group);
    winner.matchWins++; winner.gameWins += 2;
    loser.matchLosses++; loser.gameLosses += 2;

    renderWcAll();
    checkWcPlayoffs();
    savePredictionsLocally();
}

function checkWcPlayoffs() {
    const allADone = wcState.matchesA.every(m => m.winner);
    const allBDone = wcState.matchesB.every(m => m.winner);
    if (allADone && allBDone) renderWcPlayoffs();
}

function selectWcPlayoffWinner(matchNum, winnerId) {
    wcState.playoffs[`match${matchNum}`] = winnerId;
    renderWcPlayoffs();
    updateWcResults();
    savePredictionsLocally();
}

function updateWcResults() {
    const winners = [];
    if (wcState.playoffs.match1) winners.push(wcState.playoffs.match1);
    if (wcState.playoffs.match2) winners.push(wcState.playoffs.match2);
    wcState.winners = winners;

    const qualEl = document.getElementById('wcQualified');
    const elimEl = document.getElementById('wcEliminated');

    if (winners.length === 2) {
        const allTeams = { ...wcState.groupA, ...wcState.groupB };
        qualEl.innerHTML = winners.map(id => allTeams[id]?.code || id).join(', ');

        const standingsA = getWcStandings('A'), standingsB = getWcStandings('B');
        const playoffTeams = [standingsA[0].id, standingsA[1].id, standingsB[0].id, standingsB[1].id];
        const eliminated = playoffTeams.filter(id => !winners.includes(id));
        elimEl.innerHTML = eliminated.map(id => allTeams[id]?.code || id).join(', ');

        document.getElementById('continueToSwissBtn').classList.remove('hidden');
    }
}

function continueToSwiss() {
    if (wcState.winners.length !== 2) return;

    const allWcTeams = { ...wcState.groupA, ...wcState.groupB };
    const winner1 = allWcTeams[wcState.winners[0]];
    const winner2 = allWcTeams[wcState.winners[1]];

    const wc1 = TEAMS.find(t => t.id === 'wc1');
    const wc2 = TEAMS.find(t => t.id === 'wc2');
    if (wc1 && winner1) { wc1.code = winner1.code; wc1.name = winner1.name; wc1.logo = winner1.logo; wc1.flag = winner1.flag; }
    if (wc2 && winner2) { wc2.code = winner2.code; wc2.name = winner2.name; wc2.logo = winner2.logo; wc2.flag = winner2.flag; }

    document.getElementById('wildcardSection').classList.add('hidden');
    document.getElementById('continueToSwissBtn').classList.add('hidden');
    document.getElementById('swissBracket').classList.remove('hidden');

    const minimap = document.getElementById('mobileMinimap');
    const mobileStage = document.getElementById('mobileActiveStage');
    if (minimap) minimap.classList.remove('hidden');
    if (mobileStage) mobileStage.classList.remove('hidden');

    currentMode = 'swiss';
    resetTournament();
    setupEventListeners();
}

function renderWcAll() {
    renderWcStandings('A'); renderWcStandings('B');
    renderWcMatches('A'); renderWcMatches('B');
}

function renderWcStandings(group) {
    const standings = getWcStandings(group);
    const tbody = document.querySelector(`#wcStandings${group} tbody`);
    tbody.innerHTML = standings.map((t, i) => {
        const rowClass = i < 2 ? 'qualified' : 'eliminated';
        return `<tr class="${rowClass}">
            <td>${i + 1}</td>
            <td><div class="team-cell"><img src="${t.logo}" width="20">${t.code}</div></td>
            <td>${t.matchWins}-${t.matchLosses}</td>
        </tr>`;
    }).join('');
}

function renderWcMatches(group) {
    const matches = group === 'A' ? wcState.matchesA : wcState.matchesB;
    const container = document.getElementById(`wcMatches${group}`);

    container.innerHTML = matches.map(m => {
        const t1 = getWcTeam(m.team1, group), t2 = getWcTeam(m.team2, group);
        const isLocked = officialResults?.wcMatchResults?.[m.id]?.confirmed;
        const officialWinner = officialResults?.wcMatchResults?.[m.id]?.winner;
        const userVoted = !!m.winner;

        let t1Class = '', t2Class = '';
        let statusHtml = '';
        let rowClass = '';
        const disabled = userVoted || isLocked ? 'disabled' : '';

        if (userVoted && isLocked) {
            // User voted AND official result exists
            t1Class = m.winner === m.team1 ? 'winner' : 'loser';
            t2Class = m.winner === m.team2 ? 'winner' : 'loser';
            if (m.winner === officialWinner) {
                statusHtml = '<span class="prediction-status correct">✅</span>';
            } else {
                statusHtml = '<span class="prediction-status incorrect">❌</span>';
            }
            rowClass = 'official-result';
        } else if (userVoted && !isLocked) {
            // User voted, waiting for official result
            t1Class = m.winner === m.team1 ? 'winner' : 'loser';
            t2Class = m.winner === m.team2 ? 'winner' : 'loser';
            statusHtml = '<span class="prediction-status pending">⏳</span>';
        } else if (!userVoted && isLocked) {
            // User didn't vote, but official result exists - show with cyan
            t1Class = officialWinner === m.team1 ? 'official-winner' : 'official-loser';
            t2Class = officialWinner === m.team2 ? 'official-winner' : 'official-loser';
            statusHtml = '<span class="official-badge">ИТОГ</span>';
            rowClass = 'official-only';
        }

        return `<div class="wc-match-row ${rowClass}">
            ${statusHtml}
            <div class="wc-match-team ${t1Class} ${disabled}" data-match="${m.id}" data-team="${m.team1}" data-group="${group}"><img src="${t1.logo}">${t1.code}</div>
            <span class="wc-match-vs">vs</span>
            <div class="wc-match-team ${t2Class} ${disabled}" data-match="${m.id}" data-team="${m.team2}" data-group="${group}"><img src="${t2.logo}">${t2.code}</div>
        </div>`;
    }).join('');

    container.querySelectorAll('.wc-match-team:not(.disabled)').forEach(el => {
        el.addEventListener('click', () => selectWcGroupWinner(el.dataset.match, el.dataset.team, el.dataset.group));
    });
}

function renderWcPlayoffs() {
    const standingsA = getWcStandings('A'), standingsB = getWcStandings('B');
    renderWcPlayoffMatch(1, standingsA[0], standingsB[1]);
    renderWcPlayoffMatch(2, standingsB[0], standingsA[1]);
}

function renderWcPlayoffMatch(num, team1, team2) {
    const container = document.querySelector(`#wcPlayoff${num} .wc-playoff-content`);
    if (!team1 || !team2) { container.innerHTML = '<span style="color:#666;">Ожидание...</span>'; return; }

    const winner = wcState.playoffs[`match${num}`];
    const t1Class = winner === team1.id ? 'winner' : winner === team2.id ? 'loser' : '';
    const t2Class = winner === team2.id ? 'winner' : winner === team1.id ? 'loser' : '';
    const disabled = winner ? 'disabled' : '';

    container.innerHTML = `<div class="wc-match-row">
        <div class="wc-match-team ${t1Class} ${disabled}" data-playoff="${num}" data-team="${team1.id}"><img src="${team1.logo}">${team1.code}</div>
        <span class="wc-match-vs">vs</span>
        <div class="wc-match-team ${t2Class} ${disabled}" data-playoff="${num}" data-team="${team2.id}"><img src="${team2.logo}">${team2.code}</div>
    </div>`;

    container.querySelectorAll('.wc-match-team:not(.disabled)').forEach(el => {
        el.addEventListener('click', () => selectWcPlayoffWinner(parseInt(el.dataset.playoff), el.dataset.team));
    });
}

function setupWcEventListeners() {
    document.getElementById('continueToSwissBtn').addEventListener('click', continueToSwiss);
}

// ===== Countdown Timers =====
const WILDCARD_DATE = new Date('2026-01-03T00:00:00+05:00');
const SWISS_DATE = new Date('2026-01-10T00:00:00+05:00');

function initTimers() {
    updateTimers();
    setInterval(updateTimers, 1000);
}

function updateTimers() {
    updateTimer('wcTimer', WILDCARD_DATE);
    updateTimer('swissTimer', SWISS_DATE);
}

function updateTimer(elementId, targetDate) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        el.textContent = '🎉 LIVE!';
        el.style.color = '#22c55e';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    el.textContent = `${days}д ${hours}ч ${minutes}м`;
}

// ===== Swiss Stage Functions =====
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

    renderAllPools();
    updateMinimap();
    renderMobileStage();
}

function setupEventListeners() {
    document.querySelectorAll('.mini-stage').forEach(el => {
        el.addEventListener('click', () => {
            state.currentStage = el.dataset.stage;
            updateMinimap();
            renderMobileStage();
        });
    });

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

function updateMinimap() {
    document.querySelectorAll('.mini-stage').forEach(el => {
        const stage = el.dataset.stage;
        el.classList.remove('active', 'completed');
        if (stage === state.currentStage) {
            el.classList.add('active');
        }
    });

    const titles = { '1': 'ЭТАП 1', '2': 'ЭТАП 2', '3': 'ЭТАП 3', '4': 'ЭТАП 4', '5': 'ЭТАП 5', 'final': 'ФИНАЛ' };
    document.getElementById('activeStageTitle').textContent = titles[state.currentStage];
}

function renderMinimap() {
    // Simple minimap update
    updateMinimap();
}

function renderMobileStage() {
    const container = document.getElementById('activeStageContent');
    const pools = STAGE_POOLS[state.currentStage] || [];
    const results = STAGE_RESULTS[state.currentStage] || [];

    let html = '';

    if (state.currentStage === 'final') {
        html = renderFullResults();
        container.innerHTML = html;
        return;
    }

    results.filter(r => r.type === 'qualified').forEach(r => {
        html += renderMobileResult(r.score, r.type);
    });

    pools.forEach(pool => {
        const matches = Object.entries(state.matches).filter(([, m]) => m.pool === pool).map(([id, m]) => ({ id, ...m }));
        html += `
            <div class="mobile-pool-box">
                <div class="mobile-pool-header">
                    <span class="mobile-pool-score">${pool}</span>
                </div>
                <div class="matches-list">
                    ${renderMatches(matches)}
                </div>
            </div>
        `;
    });

    results.filter(r => r.type === 'eliminated').forEach(r => {
        html += renderMobileResult(r.score, r.type);
    });

    container.innerHTML = html;

    container.querySelectorAll('.match-team:not(.disabled)').forEach(el => {
        el.addEventListener('click', () => selectWinner(el.dataset.match, el.dataset.team));
    });
}

function renderFullResults() {
    const qualified = Object.values(state.teams).filter(t => t.qualified);
    const eliminated = Object.values(state.teams).filter(t => t.eliminated);

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
        const isLocked = officialResults?.swissMatchResults?.[m.id]?.confirmed;
        const officialWinner = officialResults?.swissMatchResults?.[m.id]?.winner;
        const userVoted = !!m.winner;

        let t1c = '', t2c = '';
        let statusHtml = '';
        let rowClass = '';
        const dis = userVoted || isLocked ? 'disabled' : '';

        if (userVoted && isLocked) {
            // User voted AND official result exists
            t1c = m.winner === m.team1 ? 'winner' : 'loser';
            t2c = m.winner === m.team2 ? 'winner' : 'loser';
            if (m.winner === officialWinner) {
                statusHtml = '<span class="prediction-status correct">✅</span>';
            } else {
                statusHtml = '<span class="prediction-status incorrect">❌</span>';
            }
            rowClass = 'official-result';
        } else if (userVoted && !isLocked) {
            // User voted, waiting for official result
            t1c = m.winner === m.team1 ? 'winner' : 'loser';
            t2c = m.winner === m.team2 ? 'winner' : 'loser';
            statusHtml = '<span class="prediction-status pending">⏳</span>';
        } else if (!userVoted && isLocked) {
            // User didn't vote, but official result exists - show with cyan
            t1c = officialWinner === m.team1 ? 'official-winner' : 'official-loser';
            t2c = officialWinner === m.team2 ? 'official-winner' : 'official-loser';
            statusHtml = '<span class="official-badge">ИТОГ</span>';
            rowClass = 'official-only';
        }

        return `
            <div class="match-row ${rowClass}">
                ${statusHtml}
                <div class="match-team ${t1c} ${dis}" data-match="${m.id}" data-team="${m.team1}">${getTeamHtml(t1)}</div>
                <span class="match-vs">vs</span>
                <div class="match-team ${t2c} ${dis}" data-match="${m.id}" data-team="${m.team2}">${getTeamHtml(t2)}</div>
            </div>
        `;
    }).join('');
}

function getTeamHtml(team) {
    if (!team) return '<span>???</span>';
    const flag = team.flag ? `<img src="${team.flag}" class="team-flag">` : '';
    const logo = team.logo ? `<img src="${team.logo}" class="team-logo">` : '';
    return `${flag}${logo}<span class="team-name">${team.code}</span>`;
}

function selectWinner(matchId, teamId) {
    const match = state.matches[matchId];
    if (!match || match.winner) return;

    // Check if locked
    if (officialResults?.swissMatchResults?.[matchId]?.confirmed) {
        return;
    }

    match.winner = teamId;
    const winner = state.teams[teamId];
    const loserId = match.team1 === teamId ? match.team2 : match.team1;
    const loser = state.teams[loserId];

    winner.wins++;
    loser.losses++;

    if (winner.wins >= 3) winner.qualified = true;
    if (loser.losses >= 3) loser.eliminated = true;

    // Don't auto-generate matches - admin will set them in control panel
    renderAllPools();
    updateMinimap();
    renderMobileStage();
    savePredictionsLocally();
    updatePredictionStats();
}

function generateNewMatches() {
    ['1-0', '0-1', '2-0', '1-1', '0-2', '2-1', '1-2', '2-2'].forEach(pool => {
        const [w, l] = pool.split('-').map(Number);
        const teams = Object.values(state.teams).filter(t => t.wins === w && t.losses === l && !t.qualified && !t.eliminated);
        const inMatches = new Set();
        Object.values(state.matches).forEach(m => { if (m.pool === pool && !m.winner) { inMatches.add(m.team1); inMatches.add(m.team2); } });
        const need = teams.filter(t => !inMatches.has(t.id));

        for (let i = need.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [need[i], need[j]] = [need[j], need[i]];
        }

        for (let i = 0; i < need.length - 1; i += 2) {
            state.matches[`new-${pool}-${Date.now()}-${i}`] = { pool, team1: need[i].id, team2: need[i + 1].id, winner: null };
        }
    });
}

// checkAutoAdvance removed - admin controls stage progression

function renderAllPools() {
    ['0-0', '1-0', '0-1', '2-0', '1-1', '0-2', '2-1', '1-2', '2-2'].forEach(pool => {
        const container = document.getElementById(`matches-${pool}`);
        if (!container) return;
        const matches = Object.entries(state.matches).filter(([, m]) => m.pool === pool).map(([id, m]) => ({ id, ...m }));
        container.innerHTML = renderMatches(matches);

        container.querySelectorAll('.match-team:not(.disabled)').forEach(el => {
            el.addEventListener('click', () => selectWinner(el.dataset.match, el.dataset.team));
        });
    });

    renderResults();
}

function renderResults() {
    ['3-0', '0-3', '3-1', '1-3', '3-2', '2-3'].forEach(score => {
        const container = document.getElementById(`result-${score}`);
        if (!container) return;
        const [w, l] = score.split('-').map(Number);
        const teams = Object.values(state.teams).filter(t => t.wins === w && t.losses === l);
        container.innerHTML = teams.map(t => `<div class="result-team">${getTeamHtml(t)}</div>`).join('') || '<div class="result-empty">—</div>';
    });
}

// ===== Save Prediction =====
function getUserId() {
    let id = localStorage.getItem('m7_user_id');
    if (!id) {
        id = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        localStorage.setItem('m7_user_id', id);
    }
    return id;
}

function savePrediction() {
    if (typeof db === 'undefined') {
        console.log('Firebase not configured');
        alert('Firebase не настроен!');
        return;
    }

    const nickname = document.getElementById('nickInput')?.value.trim() || '';

    const predictionData = {
        userId: getUserId(),
        nickname: nickname || null,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        mode: currentMode,

        // Swiss predictions
        swissMatches: Object.entries(state.matches).map(([id, m]) => ({
            id,
            pool: m.pool,
            team1: m.team1,
            team2: m.team2,
            predictedWinner: m.winner
        })).filter(m => m.predictedWinner),

        swissTeams: Object.entries(state.teams).map(([id, t]) => ({
            id,
            code: t.code,
            wins: t.wins,
            losses: t.losses,
            qualified: t.qualified,
            eliminated: t.eliminated
        })),

        // Wild Card predictions
        wcMatchesA: wcState.matchesA.map(m => ({
            id: m.id,
            team1: m.team1,
            team2: m.team2,
            predictedWinner: m.winner
        })).filter(m => m.predictedWinner),

        wcMatchesB: wcState.matchesB.map(m => ({
            id: m.id,
            team1: m.team1,
            team2: m.team2,
            predictedWinner: m.winner
        })).filter(m => m.predictedWinner),

        wcPlayoffs: wcState.playoffs,
        wcWinners: wcState.winners
    };

    db.collection('predictions').add(predictionData)
        .then(() => {
            console.log('✅ Prediction saved!');
            showNotification('✅ Прогноз сохранён!', 'success');
        })
        .catch(err => {
            console.error('❌ Error saving:', err);
            showNotification('❌ Ошибка сохранения', 'error');
        });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = message;
    notification.style.background = type === 'success' ? '#22c55e' : '#dc2626';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', init);
