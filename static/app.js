'use strict';

/* ================= translations ================= */
const I18N = {
  en: {
    title: 'FlyBrain Tic-Tac-Toe',
    subtitle: 'Teach a fruit-fly brain to play — and watch its memory form, synapse by synapse.',
    play_title: '1. Play & teach', you_start: 'You start', fly_starts: 'Fly starts',
    step_mode: 'Step by step', next: 'Next step ▶', speed: 'Speed',
    lg_active: 'firing neuron', lg_good: 'memory: “approach” (good)',
    lg_bad: 'memory: “avoid” (bad)', lg_neutral: 'no memory yet',
    memory_title: '2. Memory', journal_title: 'Learning journal',
    journal_hint: 'After every game dopamine neurons compare what the fly expected with what happened. The difference (prediction error δ) rewrites its synapses.',
    train_title: '3. Training camp',
    train_hint: 'Let the fly play many fast games against a sparring partner and watch the memory map and learning curve change.',
    opponent: 'Opponent', opp_mix: 'mixed', opp_random: 'random',
    opp_heuristic: 'clever (wins & blocks)', opp_self: 'itself', stop: 'Stop',
    wins: 'wins', draws: 'draws', losses: 'losses',
    exam: 'Exam (no learning)', reset: 'New fly (forget everything)',
    about_title: 'How does it work?',
    footer: 'Model inspired by the published Drosophila connectome. Brain sizes are scaled down.',
    footer_fw: 'Wiring from FlyWire v783 (Dorkenwald et al. 2024, Schlegel et al. 2024; CC-BY 4.0).',
    badge_fw: 'FlyWire connectome · {side} mushroom body', badge_syn: 'synthetic wiring',
    side_right: 'right', side_left: 'left',
    notice_rewired: '<p class="bad">The server now uses a different wiring diagram, so your previous fly could not keep its memories. This is a new, naive fly.</p>',
    symbols: 'You: <b class="human">{h}</b> · Fly: <b class="fly">{f}</b>',
    symbols_auto: 'Fly: <b class="fly">{f}</b> · {opp}: <b class="human">{h}</b>',
    st_your_turn: 'Your turn — click a cell.', st_thinking: 'The fly is thinking…',
    st_fly_won: '<b>The fly won.</b>', st_you_won: '<b>You won!</b>', st_draw: '<b>Draw.</b>', curve_empty: 'No games played yet.',
    st_new: 'Start a new game.', st_training: 'Training in progress…',
    st_games: 'games played', st_record: 'wins / draws / losses',
    st_strong: 'KCs signalling “approach”', st_weak: 'KCs signalling “avoid”',
    st_plastic: 'plasticity (learning rate)', st_level: 'level (from last exam)',
    lvl_none: 'take an exam', lvl: ['Larva', 'Novice', 'Apprentice', 'Skilled', 'Master'],
    j_game: 'Game {n}', j_move: '#', j_cell: 'cell', j_expected: 'expected',
    j_outcome: 'outcome', j_delta: 'δ', j_dopa: 'dopamine',
    j_empty: 'Play a game to see how its memory is written.',
    j_observed: 'Watching you: PAM {pam}, PPL1 {ppl1}, {k} KCs changed',
    res_win: 'fly won', res_loss: 'fly lost', res_draw: 'draw',
    ex_games: 'after games', ex_random: 'vs random (W/D/L)',
    ex_heur: 'vs clever (W/D/L)', ex_level: 'level',
    confirm_reset: 'Replace this fly with a new, naive one? All its memories will be lost.',
    c_eyes: 'Eyes · optic lobe', c_cells: 'cell detectors: own / opponent / empty',
    c_lines: 'line detectors (own·opponent marks)',
    c_mb: 'Mushroom body · {n} Kenyon cells', c_apl: 'APL inhibition: only {k} fire at once',
    c_lh: 'Lateral horn', c_app: 'MBON approach', c_av: 'MBON avoid', c_mbon_n: '{n} MBONs',
    c_pam: 'PAM · reward', c_ppl1: 'PPL1 · punishment',
    c_pam_n: 'PAM ×{n} · reward', c_ppl1_n: 'PPL1 ×{n} · punishment',
    c_cx: 'Central complex', c_cx2: 'compares the options', c_dn: 'Descending neurons',
    c_move: 'move → cell {c}',
    ph_intro_tag: 'start', ph_intro_title: 'A naive fly',
    ph_intro_title_exp: 'Your fly ({n} games of experience)',
    ph_intro_text: '<p>This is a model of the fly’s learning centre, the <b>mushroom body</b>. Each dot in the big circle is one Kenyon cell. Grey dots have no memory yet; <span class="good">green</span> means “this situation felt good”, <span class="bad">red</span> means “avoid this”.</p><p>Play a game or send the fly to the training camp and watch the memory form. Turn on <b>Step by step</b> to walk through every stage of thinking and learning.</p>',
    ph_see_tag: '1 · perception', ph_see_title: 'The fly sees your move',
    ph_see_text: '<p>Your mark in cell <b>{cell}</b> lights up the photoreceptors. <span class="num">{n}</span> sensory neurons fire: one per cell (own / opponent / empty) and one detector for each of the 8 lines.</p>',
    ph_imagine_tag: '2 · imagination', ph_imagine_title: 'Imagining a move in cell {cell}',
    ph_imagine_text: '<p>The fly pictures the board after this move. APL inhibition lets only <span class="num">{k}</span> of {n} Kenyon cells fire — a sparse “fingerprint” of this situation.</p><p>Their synapses recall: mushroom body <span class="num {kc_cls}">{kcv}</span>, lateral horn <span class="num {lh_cls}">{lhv}</span> → value <span class="num {cls}">{val}</span>.</p>',
    ph_imagine_new: '<p>These synapses are still untouched — no opinion yet.</p>',
    ph_decide_tag: '3 · decision', ph_decide_title: 'Decision: cell {cell}',
    ph_decide_text: '<p>The central complex compares all imagined outcomes. The best value <span class="num {cls}">{val}</span> belongs to cell <b>{cell}</b>, so descending neurons fire and the fly moves there.</p>',
    ph_decide_random: '<p>All options feel the same, so the choice is random: the fly has nothing to go on yet.</p>',
    ph_outcome_tag: '4 · outcome',
    ph_outcome_win: 'The fly won: reward!', ph_outcome_loss: 'The fly lost: punishment',
    ph_outcome_draw: 'Draw: small reward',
    ph_outcome_text: '<p>As in a living fly, the result arrives as a dopamine signal: reward value <span class="num {cls}">{r}</span>.</p><p>Now the fly replays each of its moves and compares what it expected with what actually happened.</p>',
    ph_replay_tag: '5 · memory', ph_replay_title: 'Remembering move {i} of {n} (cell {cell})',
    ph_replay_text: '<p>Expected <span class="num">{e}</span>. Outcome <span class="num">{o}</span> (reward {r} × {g}<sup>{k}</sup>, fading with distance from the end). Prediction error δ = <span class="num {cls}">{d}</span> <span class="deltabar"><i style="{bar}"></i></span></p>',
    ph_replay_pam: '<p><span class="good">PAM</span> dopamine neurons fire → the {k} active Kenyon cells strengthen their synapses onto “approach” and weaken those onto “avoid”. This situation is now worth <span class="num">{after}</span>.</p>',
    ph_replay_ppl1: '<p><span class="bad">PPL1</span> dopamine neurons fire → the {k} active Kenyon cells strengthen their synapses onto “avoid”. This situation is now worth <span class="num">{after}</span>.</p>',
    ph_replay_none: '<p>No surprise, so there is almost nothing to learn from this move.</p>',
    ph_watch_tag: '6 · observation', ph_watch_title: 'Learning by watching',
    ph_watch_text: '<p>The fly also replays <b>your</b> moves from your point of view, so it learns what worked for you as well. Dopamine: PAM <span class="num">{pam}</span>, PPL1 <span class="num">{ppl1}</span>; <span class="num">{k}</span> Kenyon cells changed.</p>',
    ph_done_tag: '7 · consolidation', ph_done_title: 'Memory updated',
    ph_done_text: '<p><span class="num good">{s}</span> Kenyon cells now signal “approach” and <span class="num bad">{w}</span> signal “avoid”. Next time the fly meets a similar board it will react differently.</p><p>Play again or send it to the training camp.</p>',
    ph_train_tag: 'training', ph_train_title: 'Training camp: game {g} of {t}',
    ph_train_text: '<p>Opponent: <b>{opp}</b>. In this batch: <span class="good">{w}</span> wins, {d} draws, <span class="bad">{l}</span> losses.</p><p>Dopamine released: PAM <span class="num">{pam}</span>, PPL1 <span class="num">{ppl1}</span>. <span class="num">{k}</span> Kenyon cells changed their synapses.</p>',
    ph_train_done: 'Training finished',
    auto: 'Train automatically ({n} games)', auto_stop: 'Stop training',
    auto_hint: 'Watch the fly learn on its own, then play against the trained brain.',
    ph_auto_tag: 'auto training', ph_auto_exam_title: 'Exam before training',
    ph_auto_exam_text: '<p>First the fly takes an exam with learning switched off. Against the clever player it loses <span class="bad">{hl}</span> of games, against the random one it wins <span class="good">{rw}</span>.</p><p>Now it plays {n} games against mixed opponents and learns after each one. From every batch of 10 games one is replayed on the board.</p>',
    ph_auto_title: 'Auto training: game {g} of {t}',
    ph_auto_text: '<p>Replay of game {g}: the fly plays {f} against <b>{opp}</b>, result: <b>{res}</b>.</p><p>Last 10 games: <span class="good">{w}</span> wins, {d} draws, <span class="bad">{l}</span> losses. Dopamine released: PAM <span class="num">{pam}</span>, PPL1 <span class="num">{ppl1}</span>. <span class="num">{k}</span> Kenyon cells changed their synapses.</p>',
    ph_auto_done_title: 'Trained fly: your turn!',
    ph_auto_done_text: '<p>Exam after {n} games of training (before → after), learning switched off:</p><p>Random player: wins <span class="good">{rw0} → {rw}</span>, losses <span class="bad">{rl0} → {rl}</span>.<br>Clever player: draws {hd0} → {hd}, losses <span class="bad">{hl0} → {hl}</span>.</p><p>Level: <b>{lvl0}</b> → <b>{lvl}</b>.</p><p>You start: click a cell to play against the trained brain. It keeps learning from your games.</p>',
    ph_exam_tag: 'exam', ph_exam_title: 'Exam results',
    ph_exam_text: '<p>100 games against each opponent, with learning switched off.</p><p>Random player: <span class="good">{rw}</span> wins, {rd} draws, <span class="bad">{rl}</span> losses.<br>Clever player: <span class="good">{hw}</span> wins, {hd} draws, <span class="bad">{hl}</span> losses.</p><p>Level: <b>{lvl}</b>.</p>',
    err: 'Something went wrong: {e}',
    about: `<p>In 2024–2025 teams from FlyWire (Princeton), HHMI Janelia, the University of Cambridge and Google mapped every neuron and synapse of the fruit fly <i>Drosophila melanogaster</i>: its connectome. This page runs a small model built on one well-understood circuit from that map: the <b>mushroom body</b>, where flies learn which smells, and here which boards, lead to reward or punishment.</p>
<dl>
<dt>Eyes · optic lobe (projection neurons)</dt><dd>Turn the board into neural activity: one neuron per cell state and detectors for each line.</dd>
{kc}
<dt>MBON approach / avoid</dt><dd>Output neurons. The synapses from Kenyon cells onto them <b>are the memory</b>.{mbon}</dd>
<dt>Dopamine: PAM and PPL1</dt><dd>Reward and punishment neurons. They fire according to the prediction error, i.e. how much better or worse the result was than expected, and change only the synapses of Kenyon cells that were active.</dd>
<dt>Lateral horn</dt><dd>A second, parallel pathway from the senses to behaviour; here it also learns, but slowly and coarsely.</dd>
<dt>Central complex · descending neurons</dt><dd>Compare the imagined options and trigger the chosen action.</dd>
</dl>
<p>Win = reward (+1), draw = small reward (+0.3), loss = punishment (−1). {tail} It is a model of the learning principle, not a neuron-by-neuron simulation.</p>`,
    about_kc_syn: '<dt>Kenyon cells ({n})</dt><dd>Each receives ~{claws} random inputs (as in the real fly). The APL neuron inhibits them all, so only 5% fire: a sparse, distinctive code for every situation.</dd>',
    about_kc_fw: '<dt>Kenyon cells ({n}, real wiring)</dt><dd>Every Kenyon cell of the {side} mushroom body from the FlyWire connectome, with its real input synapses: each board feature is fed into one of the {inputs} input neuron types (mostly olfactory projection neurons such as {ex}), and a cell receives {syn} synapses from about {claws} of them on average. The APL neuron inhibits them all, so only 5% fire: a sparse, distinctive code for every situation.</dd>',
    about_mbon_fw: ' FlyWire shows {n} MBONs here. Those in compartments that receive mainly PPL1 dopamine drive “approach” ({app}), those under PAM dopamine drive “avoid” ({av}), because dopamine weakens the synapses in its own compartment. The model sums each group into one neuron.',
    about_tail_syn: 'Neuron counts are scaled down and the board-reading layer is simplified.',
    about_tail_fw: 'The board-reading layer is simplified: the board is presented as if it were a smell.',
  },
  pl: {
    title: 'Mózg muchy gra w kółko i krzyżyk',
    subtitle: 'Naucz mózg muszki owocowej grać i zobacz, jak synapsa po synapsie powstaje jej pamięć.',
    play_title: '1. Graj i ucz', you_start: 'Ty zaczynasz', fly_starts: 'Mucha zaczyna',
    step_mode: 'Krok po kroku', next: 'Następny krok ▶', speed: 'Tempo',
    lg_active: 'aktywny neuron', lg_good: 'pamięć: „zbliż się” (dobre)',
    lg_bad: 'pamięć: „unikaj” (złe)', lg_neutral: 'brak wspomnień',
    memory_title: '2. Pamięć', journal_title: 'Dziennik uczenia',
    journal_hint: 'Po każdej grze neurony dopaminowe porównują, czego mucha się spodziewała, z tym, co się stało. Różnica (błąd przewidywania δ) przepisuje jej synapsy.',
    train_title: '3. Obóz treningowy',
    train_hint: 'Niech mucha rozegra wiele szybkich partii ze sparingpartnerem. Obserwuj, jak zmienia się mapa pamięci i krzywa uczenia.',
    opponent: 'Przeciwnik', opp_mix: 'mieszany', opp_random: 'losowy',
    opp_heuristic: 'sprytny (wygrywa i blokuje)', opp_self: 'ona sama', stop: 'Stop',
    wins: 'wygrane', draws: 'remisy', losses: 'przegrane',
    exam: 'Egzamin (bez uczenia)', reset: 'Nowa mucha (zapomnij wszystko)',
    about_title: 'Jak to działa?',
    footer: 'Model inspirowany opublikowanym konektomem muszki owocowej. Rozmiary mózgu są zmniejszone.',
    footer_fw: 'Połączenia z FlyWire v783 (Dorkenwald i in. 2024, Schlegel i in. 2024; CC-BY 4.0).',
    badge_fw: 'konektom FlyWire · {side} ciało grzybkowate', badge_syn: 'połączenia syntetyczne',
    side_right: 'prawe', side_left: 'lewe',
    notice_rewired: '<p class="bad">Serwer używa teraz innej mapy połączeń, więc poprzednia mucha nie mogła zachować wspomnień. To nowa, niedoświadczona mucha.</p>',
    symbols: 'Ty: <b class="human">{h}</b> · Mucha: <b class="fly">{f}</b>',
    symbols_auto: 'Mucha: <b class="fly">{f}</b> · {opp}: <b class="human">{h}</b>',
    st_your_turn: 'Twój ruch: kliknij pole.', st_thinking: 'Mucha myśli…',
    st_fly_won: '<b>Mucha wygrała.</b>', st_you_won: '<b>Wygrywasz!</b>', st_draw: '<b>Remis.</b>', curve_empty: 'Brak rozegranych gier.',
    st_new: 'Rozpocznij nową grę.', st_training: 'Trwa trening…',
    st_games: 'rozegrane gry', st_record: 'wygrane / remisy / przegrane',
    st_strong: 'KC sygnalizujące „zbliż się”', st_weak: 'KC sygnalizujące „unikaj”',
    st_plastic: 'plastyczność (tempo uczenia)', st_level: 'poziom (ostatni egzamin)',
    lvl_none: 'zrób egzamin', lvl: ['Larwa', 'Nowicjuszka', 'Uczennica', 'Wprawna', 'Mistrzyni'],
    j_game: 'Gra {n}', j_move: '#', j_cell: 'pole', j_expected: 'oczekiwanie',
    j_outcome: 'wynik', j_delta: 'δ', j_dopa: 'dopamina',
    j_empty: 'Zagraj, aby zobaczyć, jak zapisuje się pamięć.',
    j_observed: 'Obserwacja Twoich ruchów: PAM {pam}, PPL1 {ppl1}, zmienionych KC: {k}',
    res_win: 'mucha wygrała', res_loss: 'mucha przegrała', res_draw: 'remis',
    ex_games: 'po grach', ex_random: 'z losowym (W/R/P)',
    ex_heur: 'ze sprytnym (W/R/P)', ex_level: 'poziom',
    confirm_reset: 'Zastąpić tę muchę nową, niedoświadczoną? Wszystkie jej wspomnienia przepadną.',
    c_eyes: 'Oczy · płat wzrokowy', c_cells: 'detektory pól: moje / przeciwnika / puste',
    c_lines: 'detektory linii (znaki moje·przeciwnika)',
    c_mb: 'Ciało grzybkowate · {n} komórek Kenyona', c_apl: 'hamowanie APL: aktywnych naraz tylko {k}',
    c_lh: 'Róg boczny', c_app: 'MBON zbliż się', c_av: 'MBON unikaj', c_mbon_n: 'MBON: {n}',
    c_pam_n: 'PAM ×{n} · nagroda', c_ppl1_n: 'PPL1 ×{n} · kara',
    c_pam: 'PAM · nagroda', c_ppl1: 'PPL1 · kara',
    c_cx: 'Kompleks centralny', c_cx2: 'porównuje opcje', c_dn: 'Neurony zstępujące',
    c_move: 'ruch → pole {c}',
    ph_intro_tag: 'start', ph_intro_title: 'Niedoświadczona mucha',
    ph_intro_title_exp: 'Twoja mucha (doświadczenie: {n} gier)',
    ph_intro_text: '<p>To model ośrodka uczenia się muchy, czyli <b>ciała grzybkowatego</b>. Każda kropka w dużym kole to jedna komórka Kenyona. Szare kropki nie mają jeszcze wspomnień, <span class="good">zielone</span> znaczą „ta sytuacja była dobra”, a <span class="bad">czerwone</span> znaczą „unikaj tego”.</p><p>Zagraj albo wyślij muchę na obóz treningowy i obserwuj, jak powstaje pamięć. Włącz <b>Krok po kroku</b>, aby przejść przez każdy etap myślenia i uczenia.</p>',
    ph_see_tag: '1 · percepcja', ph_see_title: 'Mucha widzi Twój ruch',
    ph_see_text: '<p>Twój znak w polu <b>{cell}</b> pobudza fotoreceptory. Aktywnych jest <span class="num">{n}</span> neuronów czuciowych: po jednym na każde pole (moje / przeciwnika / puste) i po jednym detektorze na każdą z 8 linii.</p>',
    ph_imagine_tag: '2 · wyobraźnia', ph_imagine_title: 'Wyobraża sobie ruch na pole {cell}',
    ph_imagine_text: '<p>Mucha wyobraża sobie planszę po tym ruchu. Hamowanie APL pozwala odpalić tylko <span class="num">{k}</span> z {n} komórek Kenyona, co daje rzadki „odcisk palca” tej sytuacji.</p><p>Ich synapsy przypominają: ciało grzybkowate <span class="num {kc_cls}">{kcv}</span>, róg boczny <span class="num {lh_cls}">{lhv}</span> → wartość <span class="num {cls}">{val}</span>.</p>',
    ph_imagine_new: '<p>Te synapsy są jeszcze nietknięte, więc mucha nie ma zdania.</p>',
    ph_decide_tag: '3 · decyzja', ph_decide_title: 'Decyzja: pole {cell}',
    ph_decide_text: '<p>Kompleks centralny porównuje wszystkie wyobrażone wyniki. Najlepszą wartość <span class="num {cls}">{val}</span> ma pole <b>{cell}</b>, więc neurony zstępujące wysyłają sygnał i mucha tam się rusza.</p>',
    ph_decide_random: '<p>Wszystkie opcje wydają się takie same, więc wybór jest losowy: mucha nie ma jeszcze na czym się oprzeć.</p>',
    ph_outcome_tag: '4 · wynik',
    ph_outcome_win: 'Mucha wygrała: nagroda!', ph_outcome_loss: 'Mucha przegrała: kara',
    ph_outcome_draw: 'Remis: mała nagroda',
    ph_outcome_text: '<p>Jak w żywej musze, wynik dociera jako sygnał dopaminowy: wartość nagrody <span class="num {cls}">{r}</span>.</p><p>Teraz mucha odtwarza każdy swój ruch i porównuje, czego się spodziewała, z tym, co się naprawdę stało.</p>',
    ph_replay_tag: '5 · pamięć', ph_replay_title: 'Wspomnienie ruchu {i} z {n} (pole {cell})',
    ph_replay_text: '<p>Oczekiwanie <span class="num">{e}</span>. Wynik <span class="num">{o}</span> (nagroda {r} × {g}<sup>{k}</sup>, słabnie z odległością od końca). Błąd przewidywania δ = <span class="num {cls}">{d}</span> <span class="deltabar"><i style="{bar}"></i></span></p>',
    ph_replay_pam: '<p>Neurony dopaminowe <span class="good">PAM</span> strzelają → {k} aktywnych komórek Kenyona wzmacnia synapsy do „zbliż się” i osłabia do „unikaj”. Ta sytuacja jest teraz warta <span class="num">{after}</span>.</p>',
    ph_replay_ppl1: '<p>Neurony dopaminowe <span class="bad">PPL1</span> strzelają → {k} aktywnych komórek Kenyona wzmacnia synapsy do „unikaj”. Ta sytuacja jest teraz warta <span class="num">{after}</span>.</p>',
    ph_replay_none: '<p>Brak zaskoczenia, więc z tego ruchu prawie nie ma czego się uczyć.</p>',
    ph_watch_tag: '6 · obserwacja', ph_watch_title: 'Uczenie przez obserwację',
    ph_watch_text: '<p>Mucha odtwarza też <b>Twoje</b> ruchy z Twojej perspektywy, więc uczy się również tego, co działało u Ciebie. Dopamina: PAM <span class="num">{pam}</span>, PPL1 <span class="num">{ppl1}</span>; zmienionych komórek Kenyona: <span class="num">{k}</span>.</p>',
    ph_done_tag: '7 · konsolidacja', ph_done_title: 'Pamięć zaktualizowana',
    ph_done_text: '<p>Komórek Kenyona sygnalizujących „zbliż się”: <span class="num good">{s}</span>, a „unikaj”: <span class="num bad">{w}</span>. Gdy mucha znów zobaczy podobną planszę, zareaguje inaczej.</p><p>Zagraj ponownie albo wyślij ją na obóz treningowy.</p>',
    ph_train_tag: 'trening', ph_train_title: 'Obóz treningowy: gra {g} z {t}',
    ph_train_text: '<p>Przeciwnik: <b>{opp}</b>. W tej serii: <span class="good">{w}</span> wygranych, {d} remisów, <span class="bad">{l}</span> przegranych.</p><p>Wydzielona dopamina: PAM <span class="num">{pam}</span>, PPL1 <span class="num">{ppl1}</span>. Komórek Kenyona ze zmienionymi synapsami: <span class="num">{k}</span>.</p>',
    ph_train_done: 'Trening zakończony',
    auto: 'Trenuj automatycznie ({n} gier)', auto_stop: 'Zatrzymaj trening',
    auto_hint: 'Zobacz, jak mucha uczy się sama, a potem zagraj z wytrenowanym mózgiem.',
    ph_auto_tag: 'trening automatyczny', ph_auto_exam_title: 'Egzamin przed treningiem',
    ph_auto_exam_text: '<p>Najpierw mucha zdaje egzamin z wyłączonym uczeniem. Ze sprytnym graczem przegrywa <span class="bad">{hl}</span> gier, a z losowym wygrywa <span class="good">{rw}</span>.</p><p>Teraz rozegra {n} gier z różnymi przeciwnikami i po każdej będzie się uczyć. Z każdej serii 10 gier jedna jest odtwarzana na planszy.</p>',
    ph_auto_title: 'Trening automatyczny: gra {g} z {t}',
    ph_auto_text: '<p>Powtórka gry {g}: mucha gra jako {f}, przeciwnik: <b>{opp}</b>, wynik: <b>{res}</b>.</p><p>Ostatnie 10 gier: <span class="good">{w}</span> wygranych, {d} remisów, <span class="bad">{l}</span> przegranych. Wydzielona dopamina: PAM <span class="num">{pam}</span>, PPL1 <span class="num">{ppl1}</span>. Komórek Kenyona ze zmienionymi synapsami: <span class="num">{k}</span>.</p>',
    ph_auto_done_title: 'Mucha wytrenowana: Twój ruch!',
    ph_auto_done_text: '<p>Egzamin po {n} grach treningu (przed → po), z wyłączonym uczeniem:</p><p>Gracz losowy: wygrane <span class="good">{rw0} → {rw}</span>, przegrane <span class="bad">{rl0} → {rl}</span>.<br>Sprytny gracz: remisy {hd0} → {hd}, przegrane <span class="bad">{hl0} → {hl}</span>.</p><p>Poziom: <b>{lvl0}</b> → <b>{lvl}</b>.</p><p>Zaczynasz: kliknij pole, aby zagrać z wytrenowanym mózgiem. Mucha nadal uczy się z Waszych gier.</p>',
    ph_exam_tag: 'egzamin', ph_exam_title: 'Wyniki egzaminu',
    ph_exam_text: '<p>Po 100 gier z każdym przeciwnikiem, z wyłączonym uczeniem.</p><p>Gracz losowy: <span class="good">{rw}</span> wygranych, {rd} remisów, <span class="bad">{rl}</span> przegranych.<br>Sprytny gracz: <span class="good">{hw}</span> wygranych, {hd} remisów, <span class="bad">{hl}</span> przegranych.</p><p>Poziom: <b>{lvl}</b>.</p>',
    err: 'Coś poszło nie tak: {e}',
    about: `<p>W latach 2024–2025 zespoły FlyWire (Princeton), HHMI Janelia, Uniwersytetu Cambridge i Google zmapowały każdy neuron i każdą synapsę muszki owocowej <i>Drosophila melanogaster</i>, czyli jej konektom. Ta strona uruchamia mały model oparty na jednym dobrze poznanym obwodzie z tej mapy: <b>ciele grzybkowatym</b>, w którym muchy uczą się, które zapachy (a tutaj: które plansze) prowadzą do nagrody lub kary.</p>
<dl>
<dt>Oczy · płat wzrokowy (neurony projekcyjne)</dt><dd>Zamieniają planszę w aktywność neuronów: jeden neuron na stan pola oraz detektory każdej linii.</dd>
{kc}
<dt>MBON zbliż się / unikaj</dt><dd>Neurony wyjściowe. Synapsy od komórek Kenyona do nich <b>są pamięcią</b>.{mbon}</dd>
<dt>Dopamina: PAM i PPL1</dt><dd>Neurony nagrody i kary. Strzelają proporcjonalnie do błędu przewidywania, czyli tego, o ile wynik był lepszy lub gorszy od oczekiwań, i zmieniają tylko synapsy komórek Kenyona, które były aktywne.</dd>
<dt>Róg boczny</dt><dd>Druga, równoległa droga od zmysłów do zachowania; tutaj też się uczy, ale wolno i zgrubnie.</dd>
<dt>Kompleks centralny · neurony zstępujące</dt><dd>Porównują wyobrażone opcje i uruchamiają wybrane działanie.</dd>
</dl>
<p>Wygrana = nagroda (+1), remis = mała nagroda (+0,3), przegrana = kara (−1). {tail} To model zasady uczenia, a nie symulacja neuron po neuronie.</p>`,
    about_kc_syn: '<dt>Komórki Kenyona ({n})</dt><dd>Każda dostaje ~{claws} losowych wejść (jak u prawdziwej muchy). Neuron APL hamuje wszystkie, więc odpala tylko 5%, co daje rzadki, charakterystyczny kod każdej sytuacji.</dd>',
    about_kc_fw: '<dt>Komórki Kenyona ({n}, prawdziwe połączenia)</dt><dd>Wszystkie komórki Kenyona z konektomu FlyWire ({side} ciało grzybkowate) z ich prawdziwymi synapsami wejściowymi: każda cecha planszy trafia do jednego z {inputs} typów neuronów wejściowych (głównie węchowych neuronów projekcyjnych, np. {ex}), a komórka dostaje {syn} synaps średnio od ok. {claws} z nich. Neuron APL hamuje wszystkie, więc odpala tylko 5%, co daje rzadki, charakterystyczny kod każdej sytuacji.</dd>',
    about_mbon_fw: ' FlyWire pokazuje tu {n} neuronów MBON. Te w przedziałach unerwionych głównie przez dopaminę PPL1 napędzają „zbliż się” ({app}), te pod dopaminą PAM napędzają „unikaj” ({av}), bo dopamina osłabia synapsy we własnym przedziale. Model sumuje każdą grupę w jeden neuron.',
    about_tail_syn: 'Liczby neuronów są zmniejszone, a warstwa odczytu planszy uproszczona.',
    about_tail_fw: 'Warstwa odczytu planszy jest uproszczona: plansza jest podawana tak, jakby była zapachem.',
  },
};

let lang = 'en';
try { lang = localStorage.getItem('lang') || ''; } catch (e) { lang = ''; }
if (!I18N[lang]) lang = (navigator.language || '').toLowerCase().startsWith('pl') ? 'pl' : 'en';

function t(key, vars = {}) {
  let s = I18N[lang][key];
  if (s === undefined) s = I18N.en[key];
  if (typeof s !== 'string') return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
}

/* ================= helpers ================= */
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
const pct = (v) => Math.round(v * 100) + '%';
const cls = (v) => (v > 0.005 ? 'good' : v < -0.005 ? 'bad' : '');
const sym = (v) => (v === 1 ? 'X' : v === -1 ? 'O' : '');

async function api(path, body) {
  const opts = { credentials: 'same-origin' };
  if (body !== undefined) {
    opts.method = 'POST';
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(path, opts);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(d.error || r.status);
    e.data = d;
    throw e;
  }
  return d;
}

/* ================= app state ================= */
let S = null;          // structure from the server
let notice = null;     // one-time message shown with the intro
let state = null;      // last /api/state payload
let game = null;       // current game view
let busy = false;
let training = false;
let stopRequested = false;
let autoRunning = false;
let viewFly = null;    // fly symbol of a replayed training game
let journal = [];      // learning journal entries (browser only)
let currentPhase = null;

// Visual state of the brain canvas
const V = {
  pn: new Set(), kc: [], kcSet: new Set(),
  mem: null, lh: null, buckets: null,
  flash: null, flashSign: null, flashing: false,
  value: null, eyeBoard: Array(9).fill(0), imagined: null,
  cx: Array(9).fill(null), cxBoard: Array(9).fill(0), cxFocus: null, chosen: null,
  dn: 0, pam: 0, ppl1: 0,
};

// Board overlay (per-cell evaluation heatmap)
const ui = { values: {}, ghost: null, focus: null };

/* ================= phase runner ================= */
let waiter = null;
let waitTimer = null;
let waitMs = 0;
const SPEEDS = [2.2, 1.5, 1, 0.6, 0.3];

function stepMode() { return $('#step-mode').checked; }
function speedFactor() { return SPEEDS[+$('#speed').value]; }

function wait(ms) {
  return new Promise((resolve) => {
    waiter = resolve;
    waitMs = ms;
    armWait();
  });
}

function armWait() {
  clearTimeout(waitTimer);
  $('#btn-next').classList.toggle('pulse', !!waiter && stepMode());
  if (waiter && !stepMode()) {
    waitTimer = setTimeout(releaseWait, waitMs * speedFactor());
  }
}

function releaseWait() {
  clearTimeout(waitTimer);
  const w = waiter;
  waiter = null;
  $('#btn-next').classList.remove('pulse');
  if (w) w();
}

function showPhase(p) {
  currentPhase = p;
  $('#phase-tag').textContent = p.tag ? p.tag() : '';
  $('#phase-title').textContent = p.title ? p.title() : '';
  $('#narration').innerHTML = p.html ? p.html() : '';
}

async function runPhases(phases) {
  busy = true;
  refreshControls();
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    if (p.apply) p.apply();
    showPhase(p);
    if (p.ms && i < phases.length - 1) await wait(p.ms);
  }
  busy = false;
  refreshControls();
}

/* ================= board ================= */
function buildBoard() {
  const el = $('#board');
  el.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cell';
    b.dataset.cell = i;
    b.addEventListener('click', () => onCellClick(i));
    el.appendChild(b);
  }
}

function valueColor(v, alpha = 0.55) {
  const s = clamp(Math.sqrt(Math.abs(v)) * 1.1, 0, 1);
  const c = v >= 0 ? [61, 220, 132] : [255, 92, 122];
  return `rgba(${c[0]},${c[1]},${c[2]},${(alpha * s).toFixed(3)})`;
}

function flySymbol() {
  if (viewFly !== null) return viewFly;
  return game ? game.fly : -1;
}

function renderBoard(board, winLine) {
  const fly = flySymbol();
  const cells = $('#board').children;
  for (let i = 0; i < 9; i++) {
    const c = cells[i];
    const v = board[i];
    c.className = 'cell';
    c.innerHTML = '';
    c.style.background = '';
    if (v !== 0) {
      c.textContent = sym(v);
      c.classList.add(v === fly ? 'fly' : 'human');
    } else if (ui.ghost === i) {
      c.textContent = sym(fly);
      c.classList.add('ghost');
    }
    if (v === 0 && ui.values[i] !== undefined) {
      c.style.background = valueColor(ui.values[i]);
      const tag = document.createElement('span');
      tag.className = 'val';
      tag.textContent = fmt(ui.values[i]);
      c.appendChild(tag);
    }
    if (ui.focus === i) c.classList.add('focus');
    if (winLine && winLine.includes(i)) {
      c.classList.add('win');
      if (board[i] !== fly) c.classList.add('human-win');
    }
    c.setAttribute('aria-label', `${i + 1}: ${sym(v) || '-'}`);
  }
}

function renderSymbols() {
  if (viewFly !== null) {
    $('#symbols').innerHTML = t('symbols_auto', { f: sym(viewFly), h: sym(-viewFly), opp: t('opponent') });
    return;
  }
  if (!game) return;
  $('#symbols').innerHTML = t('symbols', { h: sym(-game.fly), f: sym(game.fly) });
}

function renderStatus() {
  let s;
  if (training) s = t('st_training');
  else if (!game) s = '';
  else if (busy) s = t('st_thinking');
  else if (game.over) {
    const w = game.winner;
    s = (w === 0 ? t('st_draw') : w === game.fly ? t('st_fly_won') : t('st_you_won')) + ' ' + t('st_new');
  } else if (game.turn === -game.fly) s = t('st_your_turn');
  else s = t('st_thinking');
  $('#status').innerHTML = s;
}

function refreshControls() {
  const locked = busy || training;
  document.querySelectorAll('#btn-new-human, #btn-new-fly, #btn-exam, #btn-reset, [data-train]')
    .forEach((b) => { b.disabled = locked; });
  $('#btn-stop').disabled = !training;
  const auto = $('#btn-auto');
  auto.disabled = locked && !autoRunning;
  auto.textContent = autoRunning ? t('auto_stop') : t('auto', { n: AUTO_GAMES });
  auto.classList.toggle('running', autoRunning);
  $('#opponent').disabled = locked;
  renderStatus();
}

/* ================= memory panel ================= */
function levelOf(exam) {
  if (!exam) return null;
  const l = exam.heuristic[2];
  if (l > 0.5) return 0;
  if (l > 0.25) return 1;
  if (l > 0.1) return 2;
  if (l > 0.03) return 3;
  return 4;
}

function renderStats() {
  if (!state) return;
  const tt = state.totals;
  const exam = state.exams[state.exams.length - 1];
  const lvl = levelOf(exam);
  const items = [
    [t('st_games'), state.games, ''],
    [t('st_level'), lvl === null ? t('lvl_none') : t('lvl')[lvl], ''],
    [t('st_record'), `${tt.win} / ${tt.draw} / ${tt.loss}`, '', true],
    [t('st_strong'), state.synapses.strengthened, 'good'],
    [t('st_weak'), state.synapses.weakened, 'bad'],
    [t('st_plastic'), pct(state.plasticity), '', true],
  ];
  $('#stats').innerHTML = items.map(([k, v, c, wide]) =>
    `<div class="stat${wide ? ' wide' : ''}"><div class="k">${k}</div><div class="v ${c}">${v}</div></div>`).join('');
}

function renderJournal() {
  const el = $('#journal');
  if (!journal.length) {
    el.innerHTML = `<p class="empty">${t('j_empty')}</p>`;
    return;
  }
  el.innerHTML = journal.map((j) => {
    const res = j.result === 1 ? ['res-win', t('res_win')] : j.result === -1 ? ['res-loss', t('res_loss')] : ['res-draw', t('res_draw')];
    const rows = j.replay.map((s, i) => `<tr><td>${i + 1}</td><td>${s.cell + 1}</td><td>${fmt(s.expected)}</td>` +
      `<td>${fmt(s.outcome)}</td><td class="${s.delta >= 0 ? 'res-win' : 'res-loss'}">${fmt(s.delta)}</td>` +
      `<td>${s.delta >= 0 ? 'PAM' : 'PPL1'}</td></tr>`).join('');
    return `<div class="jgame"><header><b>${t('j_game', { n: j.n })}</b><span class="${res[0]}">${res[1]}</span></header>` +
      `<table><tr><th>${t('j_move')}</th><th>${t('j_cell')}</th><th>${t('j_expected')}</th><th>${t('j_outcome')}</th>` +
      `<th>${t('j_delta')}</th><th>${t('j_dopa')}</th></tr>${rows}</table>` +
      `<p class="hint">${t('j_observed', { pam: j.observed.pam.toFixed(2), ppl1: j.observed.ppl1.toFixed(2), k: j.observed.kc_changed })}</p></div>`;
  }).join('');
}

/* ================= training panel ================= */
function renderCurve() {
  const cv = $('#curve');
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  const pad = { l: 40, r: 12, t: 12, b: 26 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;
  g.font = '11px system-ui, sans-serif';
  g.strokeStyle = '#27304f';
  g.fillStyle = '#9aa3c0';
  g.lineWidth = 1;
  for (const y of [0, 0.25, 0.5, 0.75, 1]) {
    const yy = pad.t + ph * (1 - y);
    g.beginPath(); g.moveTo(pad.l, yy); g.lineTo(pad.l + pw, yy); g.stroke();
    g.textAlign = 'right'; g.textBaseline = 'middle';
    g.fillText(pct(y), pad.l - 6, yy);
  }
  const pts = state ? state.curve : [];
  if (!pts.length) {
    g.textAlign = 'center';
    g.fillText(t('curve_empty'), pad.l + pw / 2, pad.t + ph / 2);
    return;
  }
  const maxX = pts[pts.length - 1][0];
  const X = (x) => pad.l + pw * (maxX <= 1 ? 1 : (x - 1) / (maxX - 1));
  g.textAlign = 'center'; g.textBaseline = 'top';
  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    const gx = Math.max(1, Math.round(1 + f * (maxX - 1)));
    g.fillText(gx, X(gx), pad.t + ph + 6);
  }
  const series = [[1, '#3ddc84'], [2, '#a78bfa'], [3, '#ff5c7a']];
  g.lineWidth = 2;
  g.lineJoin = 'round';
  for (const [k, color] of series) {
    g.strokeStyle = color;
    g.beginPath();
    pts.forEach((p, i) => {
      const x = X(p[0]);
      const y = pad.t + ph * (1 - p[k]);
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    });
    g.stroke();
  }
}

function renderExams() {
  const ex = state ? state.exams.slice(-6).reverse() : [];
  if (!ex.length) { $('#exams').innerHTML = ''; return; }
  const f = (a) => a.map(pct).join(' / ');
  $('#exams').innerHTML = `<table><tr><th>${t('ex_games')}</th><th>${t('ex_random')}</th><th>${t('ex_heur')}</th><th>${t('ex_level')}</th></tr>` +
    ex.map((e) => `<tr><td>${e.games}</td><td>${f(e.random)}</td><td>${f(e.heuristic)}</td><td>${t('lvl')[levelOf(e)]}</td></tr>`).join('') +
    '</table>';
}

/* ================= memory in the canvas ================= */
function setMemory(mem, flash) {
  const kc = Float32Array.from(mem.kc);
  if (flash && V.mem) {
    for (let i = 0; i < kc.length; i++) {
      const d = kc[i] - V.mem[i];
      if (Math.abs(d) > 0.002) {
        V.flash[i] = 1;
        V.flashSign[i] = d > 0 ? 1 : -1;
        V.flashing = true;
      }
    }
  }
  V.mem = kc;
  V.lh = Float32Array.from(mem.lh);
  V.buckets = null;
}

function updateKCs(indices, values) {
  for (let j = 0; j < indices.length; j++) {
    const i = indices[j];
    const d = values[j] - V.mem[i];
    if (Math.abs(d) > 1e-4) {
      V.flash[i] = 1;
      V.flashSign[i] = d > 0 ? 1 : -1;
      V.flashing = true;
    }
    V.mem[i] = values[j];
  }
  V.buckets = null;
}

function applyState(st, withMemory = true) {
  state = st;
  if (withMemory) setMemory(st.memory, false);
  renderStats();
  renderCurve();
  renderExams();
}

/* ================= phases: a move ================= */
function clearThinking() {
  V.pn = new Set(); V.kc = []; V.kcSet = new Set();
  V.value = null; V.imagined = null; V.cx = Array(9).fill(null);
  V.cxFocus = null; V.chosen = null;
  ui.values = {}; ui.ghost = null; ui.focus = null;
}

function perceptionPhase(p, cell) {
  return {
    ms: 1600,
    tag: () => t('ph_see_tag'),
    title: () => t('ph_see_title'),
    html: () => t('ph_see_text', { cell: cell + 1, n: p.pn.length }),
    apply: () => {
      clearThinking();
      V.pn = new Set(p.pn);
      V.eyeBoard = p.board.slice();
      V.cxBoard = p.board.slice();
      renderBoard(p.board);
    },
  };
}

function thinkPhases(th) {
  const fly = game.fly;
  const cands = th.candidates.slice().sort((a, b) => a.cell - b.cell);
  const phases = cands.map((c, i) => ({
    ms: i < 2 ? 1500 : 800,
    tag: () => t('ph_imagine_tag'),
    title: () => t('ph_imagine_title', { cell: c.cell + 1 }),
    html: () => t('ph_imagine_text', {
      k: c.kc.length, n: S.n_kc, kcv: fmt(c.kc_value), lhv: fmt(c.lh_value), val: fmt(c.value),
      kc_cls: cls(c.kc_value), lh_cls: cls(c.lh_value), cls: cls(c.value),
    }) + (Math.abs(c.value) < 1e-3 ? t('ph_imagine_new') : ''),
    apply: () => {
      const imagined = th.board.slice();
      imagined[c.cell] = fly;
      V.eyeBoard = imagined;
      V.imagined = c.cell;
      V.cxBoard = th.board.slice();
      V.pn = new Set(c.pn);
      V.kc = c.kc;
      V.kcSet = new Set(c.kc);
      V.value = c.value;
      V.cx[c.cell] = c.value;
      V.cxFocus = c.cell;
      ui.ghost = c.cell;
      ui.focus = c.cell;
      ui.values[c.cell] = c.value;
      renderBoard(th.board);
    },
  }));
  const best = cands.find((c) => c.cell === th.chosen);
  const vals = cands.map((c) => c.value);
  const flat = Math.max(...vals) - Math.min(...vals) < 1e-3;
  phases.push({
    ms: 1800,
    tag: () => t('ph_decide_tag'),
    title: () => t('ph_decide_title', { cell: th.chosen + 1 }),
    html: () => t('ph_decide_text', { cell: th.chosen + 1, val: fmt(best.value), cls: cls(best.value) }) +
      (flat ? t('ph_decide_random') : ''),
    apply: () => {
      V.cxFocus = null;
      V.chosen = th.chosen;
      V.dn = 1;
      V.kc = best.kc;
      V.kcSet = new Set(best.kc);
      V.pn = new Set(best.pn);
      V.value = best.value;
      const after = th.board.slice();
      after[th.chosen] = fly;
      V.eyeBoard = after;
      V.imagined = null;
      ui.ghost = null;
      ui.focus = th.chosen;
      renderBoard(after);
    },
  });
  return phases;
}

function miniBoard(board, fly, hl) {
  return '<span class="mini">' + board.map((v, i) =>
    `<span class="${v === fly ? 'f' : v ? 'h' : ''}${i === hl ? ' hl' : ''}">${sym(v)}</span>`).join('') + '</span>';
}

function learningPhases(L, g, st) {
  const fly = g.fly;
  const titleKey = L.result === 1 ? 'ph_outcome_win' : L.result === -1 ? 'ph_outcome_loss' : 'ph_outcome_draw';
  const phases = [{
    ms: 2200,
    tag: () => t('ph_outcome_tag'),
    title: () => t(titleKey),
    html: () => t('ph_outcome_text', { r: fmt(L.reward), cls: cls(L.reward) }),
    apply: () => {
      ui.values = {}; ui.ghost = null; ui.focus = null;
      V.cx = Array(9).fill(null); V.cxFocus = null; V.chosen = null;
      V.cxBoard = g.board.slice(); V.eyeBoard = g.board.slice();
      renderBoard(g.board, g.line);
      if (L.reward > 0) V.pam = Math.max(V.pam, 0.8); else V.ppl1 = Math.max(V.ppl1, 0.8);
    },
  }];
  const n = L.replay.length;
  L.replay.forEach((s, i) => {
    const k = n - 1 - i;
    const w = clamp(Math.abs(s.delta), 0, 1) * 50;
    const bar = s.delta >= 0 ? `left:50%;width:${w}%;background:var(--good)` : `right:50%;width:${w}%;background:var(--bad)`;
    phases.push({
      ms: 2600,
      tag: () => t('ph_replay_tag'),
      title: () => t('ph_replay_title', { i: i + 1, n, cell: s.cell + 1 }),
      html: () => miniBoard(s.board, fly, s.cell) +
        t('ph_replay_text', { e: fmt(s.expected), o: fmt(s.outcome), r: fmt(L.reward), g: L.gamma, k, d: fmt(s.delta), cls: cls(s.delta), bar }) +
        (Math.abs(s.delta) < 0.02 ? t('ph_replay_none')
          : t(s.delta > 0 ? 'ph_replay_pam' : 'ph_replay_ppl1', { k: s.kc.length, after: fmt(s.after) })),
      apply: () => {
        V.eyeBoard = s.board.slice();
        V.cxBoard = s.board.slice();
        V.imagined = null;
        V.pn = new Set();
        V.kc = s.kc;
        V.kcSet = new Set(s.kc);
        V.value = s.after;
        updateKCs(s.kc, s.kc_values);
        const a = clamp(Math.abs(s.delta) * 1.2, 0.15, 1);
        if (s.delta > 0) V.pam = a; else V.ppl1 = a;
      },
    });
  });
  phases.push({
    ms: 2200,
    tag: () => t('ph_watch_tag'),
    title: () => t('ph_watch_title'),
    html: () => t('ph_watch_text', { pam: L.observed.pam.toFixed(2), ppl1: L.observed.ppl1.toFixed(2), k: L.observed.kc_changed }),
    apply: () => {
      V.kc = []; V.kcSet = new Set(); V.value = null;
      V.eyeBoard = g.board.slice();
      setMemory(st.memory, true);
      V.pam = Math.max(V.pam, clamp(L.observed.pam, 0, 0.6));
      V.ppl1 = Math.max(V.ppl1, clamp(L.observed.ppl1, 0, 0.6));
    },
  });
  phases.push({
    ms: 0,
    tag: () => t('ph_done_tag'),
    title: () => t('ph_done_title'),
    html: () => t('ph_done_text', { s: st.synapses.strengthened, w: st.synapses.weakened }),
    apply: () => {
      applyState(st, false);
      journal.unshift({ n: st.games, result: L.result, replay: L.replay, observed: L.observed });
      journal = journal.slice(0, 15);
      renderJournal();
      renderBoard(g.board, g.line);
    },
  });
  return phases;
}

/* ================= actions ================= */
function showError(e) {
  showPhase({ tag: () => '!', title: () => '', html: () => `<p>${t('err', { e: e.message })}</p>` });
}

async function onCellClick(i) {
  if (busy || training || !game || game.over || game.turn !== -game.fly || game.board[i] !== 0) return;
  notice = null;
  busy = true;
  const board = game.board.slice();
  board[i] = -game.fly;
  clearThinking();
  renderBoard(board);
  refreshControls();
  let d;
  try {
    d = await api('/api/move', { cell: i });
  } catch (e) {
    busy = false;
    if (e.data && e.data.game) game = e.data.game;
    renderBoard(game.board);
    refreshControls();
    showError(e);
    return;
  }
  const phases = [perceptionPhase(d.perception, i)];
  if (d.think) phases.push(...thinkPhases(d.think));
  if (d.learning) phases.push(...learningPhases(d.learning, d.game, d.state));
  await runPhases(phases);
  game = d.game;
  if (!d.learning) {
    applyState(d.state, false);
    renderBoard(game.board, game.line);
  }
  renderStatus();
}

async function newGame(flyStarts) {
  if (busy || training) return;
  notice = null;
  busy = true;
  refreshControls();
  let d;
  try {
    d = await api('/api/new_game', { fly_starts: flyStarts });
  } catch (e) {
    busy = false;
    refreshControls();
    showError(e);
    return;
  }
  game = d.game;
  clearThinking();
  V.eyeBoard = Array(9).fill(0);
  V.cxBoard = Array(9).fill(0);
  renderSymbols();
  renderBoard(Array(9).fill(0));
  if (d.think) await runPhases(thinkPhases(d.think));
  else {
    busy = false;
    showPhase(introPhase());
  }
  renderBoard(game.board);
  refreshControls();
}

async function train(total) {
  if (busy || training) return;
  training = true;
  stopRequested = false;
  refreshControls();
  clearThinking();
  const opponent = $('#opponent').value;
  const oppName = $('#opponent').selectedOptions[0].textContent;
  let done = 0;
  let last = null;
  try {
    while (done < total && !stopRequested) {
      const n = Math.min(250, total - done);
      const d = await api('/api/train', { games: n, opponent });
      done += n;
      applyState(d, false);
      setMemory(d.memory, true);
      const c = d.chunk;
      const w = c.results.filter((r) => r === 1).length;
      const l = c.results.filter((r) => r === -1).length;
      V.pam = clamp(c.pam / c.games, 0.15, 1);
      V.ppl1 = clamp(c.ppl1 / c.games, 0.15, 1);
      $('#progress-bar').style.width = pct(done / total);
      const g = done;
      last = {
        tag: () => t('ph_train_tag'),
        title: () => t('ph_train_title', { g, t: total }),
        html: () => t('ph_train_text', {
          opp: oppName, w, d: c.games - w - l, l, pam: c.pam.toFixed(1), ppl1: c.ppl1.toFixed(1), k: c.kc_changed,
        }),
      };
      showPhase(last);
      await new Promise((r) => setTimeout(r, 120));
    }
  } catch (e) {
    showError(e);
    last = null;
  }
  training = false;
  if (last) showPhase({ ...last, title: () => t('ph_train_done') });
  setTimeout(() => { if (!training) $('#progress-bar').style.width = '0'; }, 1200);
  refreshControls();
}

/* ---- automatic training: exam, 300 visible games, exam, then play ---- */
const AUTO_GAMES = 300;
const AUTO_BATCH = 10;

function nap(ms) {
  return new Promise((r) => setTimeout(r, ms * speedFactor()));
}

function winLineOf(b) {
  return LINE_ICON.find(([a, c, d]) => b[a] !== 0 && b[a] === b[c] && b[a] === b[d]) || null;
}

async function replayGame(lg) {
  viewFly = lg.fly;
  renderSymbols();
  clearThinking();
  V.eyeBoard = Array(9).fill(0);
  V.cxBoard = Array(9).fill(0);
  renderBoard(V.eyeBoard);
  let prev = Array(9).fill(0);
  for (const s of lg.steps) {
    if (stopRequested) return;
    V.cx = Array(9).fill(null);
    if (s.kc) {
      V.pn = new Set(s.pn);
      V.kc = s.kc;
      V.kcSet = new Set(s.kc);
      V.value = s.value;
      V.cx[s.cell] = s.value;
      V.chosen = s.cell;
      V.dn = 1;
    } else {
      V.pn = new Set(); V.kc = []; V.kcSet = new Set();
      V.value = null; V.chosen = null;
    }
    V.cxBoard = prev;
    V.eyeBoard = s.board.slice();
    prev = s.board.slice();
    ui.focus = s.cell;
    renderBoard(s.board);
    await nap(s.kc ? 240 : 150);
  }
  ui.focus = null;
  renderBoard(prev, winLineOf(prev));
}

function examNumbers(e) {
  return {
    rw: pct(e.random[0]), rd: pct(e.random[1]), rl: pct(e.random[2]),
    hw: pct(e.heuristic[0]), hd: pct(e.heuristic[1]), hl: pct(e.heuristic[2]),
    lvl: t('lvl')[levelOf(e)],
  };
}

async function autoTrain() {
  if (busy || training) return;
  notice = null;
  training = autoRunning = true;
  stopRequested = false;
  refreshControls();
  clearThinking();
  const tag = () => t('ph_auto_tag');
  let before = null;
  let after = null;
  let done = 0;
  try {
    let d = await api('/api/exam', {});
    applyState(d, false);
    before = d.exam;
    const b = examNumbers(before);
    showPhase({
      tag, title: () => t('ph_auto_exam_title'),
      html: () => t('ph_auto_exam_text', { ...b, n: AUTO_GAMES }),
    });
    await nap(3000);
    while (done < AUTO_GAMES && !stopRequested) {
      d = await api('/api/train', { games: AUTO_BATCH, opponent: 'mix', show: true });
      const c = d.chunk;
      const lg = c.last_game;
      const g = done + c.games;
      const w = c.results.filter((r) => r === 1).length;
      const l = c.results.filter((r) => r === -1).length;
      showPhase({
        tag, title: () => t('ph_auto_title', { g, t: AUTO_GAMES }),
        html: () => t('ph_auto_text', {
          g, f: sym(lg.fly), opp: t('opp_' + lg.opponent),
          res: t(lg.result === 1 ? 'res_win' : lg.result === -1 ? 'res_loss' : 'res_draw'),
          w, d: c.games - w - l, l, pam: c.pam.toFixed(1), ppl1: c.ppl1.toFixed(1), k: c.kc_changed,
        }),
      });
      await replayGame(lg);
      done = g;
      applyState(d, false);
      setMemory(d.memory, true);
      V.pam = clamp(c.pam / c.games, 0.15, 1);
      V.ppl1 = clamp(c.ppl1 / c.games, 0.15, 1);
      $('#progress-bar').style.width = pct(done / AUTO_GAMES);
      await nap(350);
    }
    d = await api('/api/exam', {});
    applyState(d, false);
    after = d.exam;
  } catch (e) {
    showError(e);
  }
  viewFly = null;
  renderSymbols();
  training = autoRunning = false;
  setTimeout(() => { if (!training) $('#progress-bar').style.width = '0'; }, 1200);
  refreshControls();
  if (!after) return;
  await newGame(false);
  const b = examNumbers(before);
  const a = examNumbers(after);
  showPhase({
    tag, title: () => t('ph_auto_done_title'),
    html: () => t('ph_auto_done_text', {
      ...a, n: done, rw0: b.rw, rl0: b.rl, hd0: b.hd, hl0: b.hl, lvl0: b.lvl,
    }),
  });
}

async function exam() {
  if (busy || training) return;
  busy = true;
  refreshControls();
  try {
    const d = await api('/api/exam', {});
    applyState(d, false);
    const e = d.exam;
    showPhase({
      tag: () => t('ph_exam_tag'),
      title: () => t('ph_exam_title'),
      html: () => t('ph_exam_text', {
        rw: pct(e.random[0]), rd: pct(e.random[1]), rl: pct(e.random[2]),
        hw: pct(e.heuristic[0]), hd: pct(e.heuristic[1]), hl: pct(e.heuristic[2]),
        lvl: t('lvl')[levelOf(e)],
      }),
    });
  } catch (e) {
    showError(e);
  }
  busy = false;
  refreshControls();
}

async function resetFly() {
  if (busy || training || !confirm(t('confirm_reset'))) return;
  try {
    const d = await api('/api/reset', {});
    applyState(d);
    game = d.game;
    journal = [];
    renderJournal();
    clearThinking();
    V.eyeBoard = Array(9).fill(0);
    V.cxBoard = Array(9).fill(0);
    renderSymbols();
    renderBoard(game.board);
    notice = null;
    showPhase(introPhase());
    refreshControls();
  } catch (e) {
    showError(e);
  }
}

function introPhase() {
  return {
    tag: () => t('ph_intro_tag'),
    title: () => (state && state.games ? t('ph_intro_title_exp', { n: state.games }) : t('ph_intro_title')),
    html: () => (notice ? t(notice) : '') + t('ph_intro_text'),
  };
}

/* ================= brain canvas ================= */
const W = 1000;
const H = 550;
const MB = { x: 470, y: 272, r: 165 };
const LH = { x: 350, y: 500, cols: 27, gap: 9 };
const MBON_APP = { x: 725, y: 205 };
const MBON_AV = { x: 725, y: 345 };
const PAM = { x: 690, y: 88 };
const PPL1 = { x: 660, y: 470 };
const CX = { x: 810, y: 200, gap: 56 };
const DN = { x: 885, y: 470 };
const LINE_ICON = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const COLORS = {
  fly: '#ffb547', human: '#4cc9f0', good: [61, 220, 132], bad: [255, 92, 122],
  neutral: [52, 62, 96], text: '#c9cee3', muted: '#7f89aa', active: '#fff6d6',
};

let cv;
let ctx;
let pnPos = [];
let kcPos = null;
let lhPos = [];
let scale = 1;
let dpr = 1;

function layout() {
  pnPos = [];
  for (let i = 0; i < 9; i++) {
    const bx = 24 + (i % 3) * 64;
    const by = 52 + Math.floor(i / 3) * 64;
    for (let k = 0; k < 3; k++) pnPos.push([bx + 13 + k * 16, by + 46]);
  }
  const np = S.line_patterns.length;
  for (let li = 0; li < 8; li++) {
    for (let p = 0; p < np; p++) pnPos.push([62 + p * 15, 318 + li * 21]);
  }
  kcPos = new Float32Array(S.n_kc * 2);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < S.n_kc; i++) {
    const r = MB.r * Math.sqrt((i + 0.5) / S.n_kc);
    kcPos[i * 2] = MB.x + r * Math.cos(i * golden);
    kcPos[i * 2 + 1] = MB.y + r * Math.sin(i * golden);
  }
  lhPos = [];
  for (let i = 0; i < S.n_pn; i++) {
    lhPos.push([LH.x + (i % LH.cols) * LH.gap, LH.y + Math.floor(i / LH.cols) * LH.gap]);
  }
}

function resize() {
  dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth;
  scale = w / W;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(w * H / W * dpr);
}

function memColor(m, scaleTo = 1) {
  const s = clamp(Math.sqrt(Math.abs(m) / scaleTo) * 1.1, 0, 1);
  const c = m >= 0 ? COLORS.good : COLORS.bad;
  const n = COLORS.neutral;
  return `rgb(${Math.round(n[0] + (c[0] - n[0]) * s)},${Math.round(n[1] + (c[1] - n[1]) * s)},${Math.round(n[2] + (c[2] - n[2]) * s)})`;
}

function buildBuckets() {
  const buckets = new Map();
  for (let i = 0; i < V.mem.length; i++) {
    const level = Math.round(clamp(Math.sign(V.mem[i]) * Math.sqrt(Math.abs(V.mem[i])) * 1.1, -1, 1) * 12);
    if (!buckets.has(level)) buckets.set(level, []);
    buckets.get(level).push(i);
  }
  V.buckets = [...buckets.entries()].map(([level, idx]) => ({
    color: memColor(Math.sign(level) * (level / 12 / 1.1) ** 2),
    idx,
  }));
}

function text(s, x, y, opts = {}) {
  const size = (opts.size || 12) * (opts.raw ? 1 : 1.3);
  ctx.font = `${opts.bold ? '600 ' : ''}${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.fillStyle = opts.color || COLORS.muted;
  ctx.textAlign = opts.align || 'left';
  ctx.textBaseline = opts.base || 'alphabetic';
  if (opts.max) ctx.fillText(s, x, y, opts.max); else ctx.fillText(s, x, y);
}

function circle(x, y, r, fill, stroke, lw = 1) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function glow(x, y, r, rgb, a) {
  if (a <= 0.01) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`);
  g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

function drawEyes() {
  text(t('c_eyes'), 24, 30, { size: 14, bold: true, color: COLORS.text });
  for (let i = 0; i < 9; i++) {
    const bx = 24 + (i % 3) * 64;
    const by = 52 + Math.floor(i / 3) * 64;
    ctx.fillStyle = '#0f1528';
    ctx.strokeStyle = V.imagined === i ? COLORS.fly : '#27304f';
    ctx.lineWidth = V.imagined === i ? 2 : 1;
    ctx.setLineDash(V.imagined === i ? [4, 3] : []);
    ctx.beginPath();
    ctx.roundRect(bx, by, 58, 58, 8);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    const v = V.eyeBoard[i];
    if (v) {
      const isFly = v === flySymbol();
      text(sym(v), bx + 29, by + 30, { size: 22, bold: true, align: 'center', base: 'middle', color: isFly ? 'rgba(255,181,71,.55)' : 'rgba(76,201,240,.55)' });
    }
    for (let k = 0; k < 3; k++) {
      const [x, y] = pnPos[i * 3 + k];
      const on = V.pn.has(i * 3 + k);
      const col = k === 0 ? COLORS.fly : k === 1 ? COLORS.human : '#dfe4f5';
      if (on) glow(x, y, 12, k === 0 ? [255, 181, 71] : k === 1 ? [76, 201, 240] : [223, 228, 245], 0.5);
      circle(x, y, 5, on ? col : '#232b47');
    }
  }
  text(t('c_cells'), 24, 258, { size: 10, max: 262 });
  text(t('c_lines'), 24, 290, { size: 10, max: 262 });
  const np = S.line_patterns.length;
  S.line_patterns.forEach((p, k) => text(`${p[0]}·${p[1]}`, 62 + k * 15, 306, { size: 8, align: 'center', raw: true }));
  for (let li = 0; li < 8; li++) {
    const y = 318 + li * 21;
    for (let c = 0; c < 9; c++) {
      const on = LINE_ICON[li].includes(c);
      ctx.fillStyle = on ? '#9aa3c0' : '#232b47';
      ctx.fillRect(24 + (c % 3) * 5, y - 7 + Math.floor(c / 3) * 5, 4, 4);
    }
    for (let p = 0; p < np; p++) {
      const idx = S.n_cell + li * np + p;
      const [x] = pnPos[idx];
      const on = V.pn.has(idx);
      let col = '#232b47';
      if (on) {
        const [m, o] = S.line_patterns[p];
        col = m && !o ? COLORS.fly : o && !m ? COLORS.human : m && o ? '#a78bfa' : '#dfe4f5';
        glow(x, y, 10, [255, 240, 200], 0.35);
      }
      circle(x, y, 4.5, col);
    }
  }
}

function drawMB() {
  text(t('c_mb', { n: S.n_kc }), MB.x, 30, { size: 14, bold: true, align: 'center', color: COLORS.text, max: 420 });
  text(t('c_apl', { k: S.k_active }), MB.x, 52, { size: 11, align: 'center', max: 420 });
  circle(MB.x, MB.y, MB.r + 9, '#0c1226', '#1f2848', 1.5);
  glow(MB.x, MB.y, MB.r * 1.25, COLORS.good, V.pam * 0.35);
  glow(MB.x, MB.y, MB.r * 1.25, COLORS.bad, V.ppl1 * 0.35);
  if (!V.buckets) buildBuckets();
  const s = 2.4;
  for (const b of V.buckets) {
    ctx.fillStyle = b.color;
    ctx.beginPath();
    for (const i of b.idx) ctx.rect(kcPos[i * 2] - s / 2, kcPos[i * 2 + 1] - s / 2, s, s);
    ctx.fill();
  }
  if (V.flashing) {
    let any = false;
    for (let i = 0; i < V.flash.length; i++) {
      const f = V.flash[i];
      if (f <= 0) continue;
      any = true;
      const c = V.flashSign[i] > 0 ? COLORS.good : COLORS.bad;
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(f * 0.9).toFixed(3)})`;
      ctx.fillRect(kcPos[i * 2] - 2.5, kcPos[i * 2 + 1] - 2.5, 5, 5);
    }
    V.flashing = any;
  }
  if (V.kc.length) {
    ctx.fillStyle = COLORS.active;
    ctx.shadowColor = '#ffe08a';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (const i of V.kc) ctx.rect(kcPos[i * 2] - 2.2, kcPos[i * 2 + 1] - 2.2, 4.4, 4.4);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  // lateral horn
  text(t('c_lh'), LH.x, LH.y - 14, { size: 12, bold: true, color: COLORS.text });
  for (let i = 0; i < lhPos.length; i++) {
    const [x, y] = lhPos[i];
    circle(x, y, 3, V.lh ? memColor(V.lh[i], 4) : '#232b47');
    if (V.pn.has(i)) circle(x, y, 4.5, null, COLORS.active, 1.2);
  }
}

function drawLinks() {
  if (!V.kc.length) return;
  const sample = V.kc.filter((_, j) => j % 10 === 0);
  ctx.lineWidth = 0.7;
  if (V.pn.size) {
    ctx.strokeStyle = 'rgba(255,224,138,0.16)';
    ctx.beginPath();
    let j = 0;
    for (const p of V.pn) {
      const [x, y] = pnPos[p];
      for (let r = 0; r < 2; r++) {
        const k = sample[(j * 3 + r * 7) % sample.length];
        ctx.moveTo(x, y);
        ctx.lineTo(kcPos[k * 2], kcPos[k * 2 + 1]);
      }
      j++;
    }
    ctx.stroke();
  }
  for (const k of sample.slice(0, 12)) {
    const m = V.mem[k];
    const target = m >= 0 ? MBON_APP : MBON_AV;
    const c = m >= 0 ? COLORS.good : COLORS.bad;
    ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(0.12 + Math.min(0.5, Math.abs(m))).toFixed(2)})`;
    ctx.beginPath();
    ctx.moveTo(kcPos[k * 2], kcPos[k * 2 + 1]);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
  }
}

function drawOutputs() {
  const v = V.value;
  const actApp = v === null ? 0 : clamp(0.5 + v / 2, 0, 1);
  const actAv = v === null ? 0 : clamp(0.5 - v / 2, 0, 1);
  glow(MBON_APP.x, MBON_APP.y, 50, COLORS.good, actApp * 0.6);
  glow(MBON_AV.x, MBON_AV.y, 50, COLORS.bad, actAv * 0.6);
  circle(MBON_APP.x, MBON_APP.y, 12 + 12 * actApp, `rgba(61,220,132,${0.2 + 0.7 * actApp})`, '#3ddc84', 1.5);
  circle(MBON_AV.x, MBON_AV.y, 12 + 12 * actAv, `rgba(255,92,122,${0.2 + 0.7 * actAv})`, '#ff5c7a', 1.5);
  text(t('c_app'), MBON_APP.x, MBON_APP.y - 32, { size: 11, align: 'center', color: COLORS.text });
  text(t('c_av'), MBON_AV.x, MBON_AV.y + 40, { size: 11, align: 'center', color: COLORS.text });
  const c = fw();
  if (c) {
    const n = (v) => c.mbons.filter((m) => m.valence === v).length;
    text(t('c_mbon_n', { n: n(1) }), MBON_APP.x, MBON_APP.y - 48, { size: 9, align: 'center' });
    text(t('c_mbon_n', { n: n(-1) }), MBON_AV.x, MBON_AV.y + 56, { size: 9, align: 'center' });
  }
  if (v !== null) {
    text(fmt(v), (MBON_APP.x + MBON_AV.x) / 2, (MBON_APP.y + MBON_AV.y) / 2 + 4, { size: 13, bold: true, align: 'center', color: v >= 0 ? '#3ddc84' : '#ff5c7a' });
  }
  // dopamine neurons
  for (const [pos, level, rgb, label, below] of [[PAM, V.pam, COLORS.good, fw() ? t('c_pam_n', { n: fw().n_pam }) : t('c_pam'), false], [PPL1, V.ppl1, COLORS.bad, fw() ? t('c_ppl1_n', { n: fw().n_ppl1 }) : t('c_ppl1'), true]]) {
    glow(pos.x, pos.y, 60, rgb, level * 0.8);
    if (level > 0.05) {
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(level * 0.7).toFixed(2)})`;
      ctx.lineWidth = 2;
      for (const a of [-0.5, 0, 0.5]) {
        const tx = MB.x + MB.r * Math.cos(a + (below ? 0.9 : -0.9));
        const ty = MB.y + MB.r * Math.sin(a + (below ? 0.9 : -0.9));
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.quadraticCurveTo((pos.x + tx) / 2, pos.y, tx, ty);
        ctx.stroke();
      }
    }
    circle(pos.x, pos.y, 14, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.25 + 0.75 * level})`, `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`, 1.5);
    text(label, pos.x + 22, pos.y + 4, { size: 11, color: COLORS.text });
  }
}

function drawCX() {
  const cx0 = CX.x + CX.gap;
  text(t('c_cx'), cx0, 138, { size: 14, bold: true, align: 'center', color: COLORS.text });
  text(t('c_cx2'), cx0, 160, { size: 11, align: 'center' });
  for (let i = 0; i < 9; i++) {
    const x = CX.x + (i % 3) * CX.gap;
    const y = CX.y + Math.floor(i / 3) * CX.gap;
    const occ = V.cxBoard[i];
    const val = V.cx[i];
    let fill = '#141b33';
    if (val !== null && !occ) fill = memColor(val);
    circle(x, y, 20, fill, i === V.chosen ? COLORS.fly : i === V.cxFocus ? '#ffffff' : '#27304f', i === V.chosen || i === V.cxFocus ? 2.5 : 1);
    if (occ) {
      const isFly = occ === flySymbol();
      text(sym(occ), x, y + 1, { size: 16, bold: true, align: 'center', base: 'middle', color: isFly ? 'rgba(255,181,71,.6)' : 'rgba(76,201,240,.6)' });
    } else if (val !== null) {
      text(fmt(val), x, y + 1, { size: 10, bold: true, align: 'center', base: 'middle', color: '#0b1020' });
    } else {
      text(String(i + 1), x, y + 1, { size: 10, align: 'center', base: 'middle' });
    }
  }
  if (V.cxFocus !== null && V.value !== null) {
    const x = CX.x + (V.cxFocus % 3) * CX.gap;
    const y = CX.y + Math.floor(V.cxFocus / 3) * CX.gap;
    ctx.strokeStyle = V.value >= 0 ? 'rgba(61,220,132,.6)' : 'rgba(255,92,122,.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(MBON_APP.x + 18, (MBON_APP.y + MBON_AV.y) / 2);
    ctx.lineTo(x - 20, y);
    ctx.stroke();
  }
  // descending neurons
  text(t('c_dn'), DN.x, DN.y - 34, { size: 12, bold: true, align: 'center', color: COLORS.text });
  if (V.chosen !== null && V.dn > 0.02) {
    const x = CX.x + (V.chosen % 3) * CX.gap;
    const y = CX.y + Math.floor(V.chosen / 3) * CX.gap;
    ctx.strokeStyle = `rgba(255,181,71,${V.dn.toFixed(2)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.lineTo(DN.x, DN.y - 20);
    ctx.stroke();
    glow(DN.x, DN.y, 60, [255, 181, 71], V.dn * 0.7);
  }
  circle(DN.x, DN.y, 18, `rgba(255,181,71,${0.15 + 0.85 * V.dn})`, COLORS.fly, 1.5);
  if (V.chosen !== null) text(t('c_move', { c: V.chosen + 1 }), DN.x, DN.y + 38, { size: 12, align: 'center', color: COLORS.text });
}

let lastT = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - lastT) / 1000 || 0);
  lastT = now;
  V.pam = Math.max(0, V.pam - dt * 0.45);
  V.ppl1 = Math.max(0, V.ppl1 - dt * 0.45);
  V.dn = Math.max(0, V.dn - dt * 0.35);
  if (V.flashing) {
    for (let i = 0; i < V.flash.length; i++) if (V.flash[i] > 0) V.flash[i] = Math.max(0, V.flash[i] - dt * 0.6);
  }
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (S && V.mem) {
    drawLinks();
    drawEyes();
    drawMB();
    drawOutputs();
    drawCX();
  }
  requestAnimationFrame(frame);
}

/* ================= language ================= */
function applyLang() {
  document.documentElement.lang = lang;
  document.title = t('title');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
  renderAbout();
  renderSymbols();
  refreshControls();
  renderStats();
  renderJournal();
  renderExams();
  renderCurve();
  if (currentPhase) showPhase(currentPhase);
}

function fw() {
  return S && S.connectome && S.connectome.kind === 'flywire' ? S.connectome : null;
}

function renderAbout() {
  const c = fw();
  let kc;
  let mbon = '';
  if (c) {
    const n = (v) => c.mbons.filter((m) => m.valence === v).length;
    const avgSyn = Math.round(c.pn_kc_synapses / (c.n_kc - c.n_kc_silent));
    kc = t('about_kc_fw', { n: c.n_kc, side: t('side_' + c.side), inputs: c.inputs.length,
      ex: c.inputs.slice(0, 3).join(', '), syn: avgSyn, claws: c.claws });
    mbon = t('about_mbon_fw', { n: c.mbons.length, app: n(1), av: n(-1) });
  } else {
    kc = t('about_kc_syn', { n: S ? S.n_kc : 4000, claws: S && S.connectome ? S.connectome.claws : 7 });
  }
  $('#about').innerHTML = t('about', { kc, mbon, tail: t(c ? 'about_tail_fw' : 'about_tail_syn') });
  $('#footer').textContent = t(c ? 'footer_fw' : 'footer');
  const badge = $('#connectome');
  badge.textContent = !S ? '' : c ? t('badge_fw', { side: t('side_' + c.side) }) : t('badge_syn');
  badge.classList.toggle('real', !!c);
}

/* ================= start ================= */
async function init() {
  cv = $('#brain');
  ctx = cv.getContext('2d');
  buildBoard();
  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    lang = b.dataset.lang;
    try { localStorage.setItem('lang', lang); } catch (e) { /* storage unavailable */ }
    applyLang();
  }));
  $('#btn-new-human').addEventListener('click', () => newGame(false));
  $('#btn-new-fly').addEventListener('click', () => newGame(true));
  $('#btn-next').addEventListener('click', releaseWait);
  $('#step-mode').addEventListener('change', armWait);
  $('#speed').addEventListener('input', armWait);
  document.querySelectorAll('[data-train]').forEach((b) => b.addEventListener('click', () => train(+b.dataset.train)));
  $('#btn-stop').addEventListener('click', () => { stopRequested = true; });
  $('#btn-auto').addEventListener('click', () => {
    if (autoRunning) stopRequested = true;
    else autoTrain();
  });
  $('#btn-exam').addEventListener('click', exam);
  $('#btn-reset').addEventListener('click', resetFly);
  window.addEventListener('resize', () => { resize(); renderCurve(); });
  applyLang();
  try {
    S = await api('/api/structure');
    const st = await api('/api/state');
    V.flash = new Float32Array(S.n_kc);
    V.flashSign = new Int8Array(S.n_kc);
    layout();
    resize();
    renderAbout();
    if (st.notice === 'connectome_changed') notice = 'notice_rewired';
    applyState(st);
    game = st.game;
    V.eyeBoard = game.board.slice();
    V.cxBoard = game.board.slice();
    renderSymbols();
    renderBoard(game.board, game.line);
    showPhase(introPhase());
    refreshControls();
  } catch (e) {
    showError(e);
  }
  requestAnimationFrame(frame);
}

init();
