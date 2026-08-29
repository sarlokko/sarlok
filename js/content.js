/* Adventure Family — pool di elementi unici (italiano, per famiglie). */
(function (root) {
  const C = {};

  C.worlds = [
    { id: "w-lucciole", name: "Bosco delle Lucciole Storte", hook: "Qui le lucciole volano all'indietro e illuminano solo i segreti." },
    { id: "w-nonna", name: "Cucina Gigante di Nonna Tempesta", hook: "I mestoli sono alti come alberi e il brodo bolle come un mare." },
    { id: "w-isola", name: "Isola che Cammina", hook: "L'isola ha zampe di tartaruga e cambia spiaggia ogni volta che sbadiglia." },
    { id: "w-soffitta", name: "Soffitta dei Giochi Dimenticati", hook: "I peluche abbandonati hanno fondato un regno sotto le scatole." },
    { id: "w-tappeto", name: "Città sotto il Tappeto", hook: "Tra i peli del tappeto ci sono tram, mercati e una polizia di briciole." },
    { id: "w-caramello", name: "Vulcano di Caramello", hook: "La lava è dolce, ma attacca gli stivali e i piani." },
    { id: "w-biblio", name: "Biblioteca Infinita", hook: "I libri camminano e se li chiudi male ti riscrivono la giornata." },
    { id: "w-treno", name: "Treno delle Nuvole", hook: "Il convoglio non ferma mai: le stazioni si agganciano in corsa." },
    { id: "w-ombre", name: "Mercato delle Ombre Colorate", hook: "Si vendono ombre, echi e sbadigli. I prezzi si pagano in promesse." },
    { id: "w-lago", name: "Lago Ghiacciato al Contrario", hook: "Il ghiaccio sta sotto e l'acqua cammina sopra, a testa in giù." },
    { id: "w-specchio", name: "Castello dentro lo Specchio", hook: "Ogni riflesso ha un'opinione diversa su chi siete." },
    { id: "w-fattoria", name: "Fattoria delle Notti Corte", hook: "Il sole tramonta in dieci minuti e le galline fanno uova di luce." },
    { id: "w-sale", name: "Deserto di Sale Musicale", hook: "I cristalli suonano se li calpesti: troppa musica attira tempeste." },
    { id: "w-porto", name: "Porto dei Pesci Volanti", hook: "Le barche sono legate alle nuvole e i pesci litigano con i gabbiani." },
    { id: "w-gatti", name: "Giardino Verticale dei Gatti", hook: "I gatti sono giardinieri e le piante miagolano se le innaffi storte." },
    { id: "w-miniera", name: "Miniera di Stelle Cadute", hook: "Si scava la luce. Se ne prendi troppa, la notte si offende." },
    { id: "w-pozzo", name: "Paese Capovolto nel Pozzo", hook: "Si scende per salire. I tetti sono sentieri e i camini sono porte." },
    { id: "w-circo", name: "Circo Fermo da Cento Anni", hook: "Il pubblico è di polvere. Il tendone respira ancora." },
    { id: "w-scuola", name: "Scuola di Magie Sbagliate", hook: "Ogni incantesimo fa l'opposto. I compiti scappano dai diari." },
    { id: "w-giganti", name: "Valle dei Giganti Addormentati", hook: "I loro russare sono venti. Camminare sui nasi è un'impresa." },
    { id: "w-te", name: "Villaggio nella Tazza da Tè", hook: "Il livello del tè sale a ogni sorso del cielo." },
    { id: "w-divano", name: "Cunicoli sotto il Divano", hook: "Calzini smarriti, monete e un re dei popcorn." },
    { id: "w-faro", name: "Faro sulla Luna Bassa", hook: "La luna ha attraccato al molo. Il faro gira al contrario." },
    { id: "w-ombrelli", name: "Foresta di Ombrelle", hook: "Quando piove le ombrelle si aprono da sole e coprono i sentieri sbagliati." }
  ];

  C.quests = [
    { id: "q-uovo", name: "Salvare l'Uovo che Ricorda", goal: "un uovo che contiene tutti i compleanni dimenticati" },
    { id: "q-chiave", name: "Ritrovare la Chiave del Domani", goal: "la chiave che apre solo i giorni che devono ancora arrivare" },
    { id: "q-ricetta", name: "Rubare indietro la Ricetta del Coraggio", goal: "la ricetta con cui si cuoce il coraggio nelle merende" },
    { id: "q-ombra", name: "Riportare l'Ombra del Paese", goal: "l'ombra collettiva, senza la quale nessuno fa più pisolini" },
    { id: "q-bussola", name: "Raddrizzare la Bussola dei Sogni", goal: "la bussola che punta sempre verso chi ha bisogno di aiuto" },
    { id: "q-drago", name: "Consegnare la Lettera al Drago Timido", goal: "una lettera che, se non arriva, fa piangere le nuvole per una settimana" },
    { id: "q-orologio", name: "Riavvolgere l'Orologio della Cena", goal: "l'orologio che decide quando si torna a tavola" },
    { id: "q-seme", name: "Piantare il Seme dell'Ultima Risata", goal: "un seme che fa crescere una risata capace di spegnere paure" },
    { id: "q-mappa", name: "Ricucire la Mappa Strappata", goal: "la mappa senza la quale i sentieri si mischiano" },
    { id: "q-corona", name: "Nascondere la Corona Inutile", goal: "una corona che rende re chiunque la metta, anche i cappelli" },
    { id: "q-lume", name: "Accendere il Lume dei Persi", goal: "un lume che mostra la strada a chi si è perso nei pensieri" },
    { id: "q-patto", name: "Spezzare il Patto delle Scorciatoie", goal: "un patto che fa arrivare prima, ma toglie i dolci del ritorno" },
    { id: "q-canto", name: "Restituire il Canto alle Campane", goal: "il canto rubato alle campane, ora mute e imbronciate" },
    { id: "q-ponte", name: "Ricostruire il Ponte delle Scuse", goal: "il ponte su cui si passano solo se si è detto scusa per davvero" },
    { id: "q-gatto", name: "Liberare il Gatto Archivista", goal: "il gatto che tiene in ordine i nomi di tutti" },
    { id: "q-neve", name: "Fermare la Neve di Farina", goal: "la bufera di farina che sta seppellendo i forni" },
    { id: "q-specchio", name: "Chiudere lo Specchio Ingordo", goal: "uno specchio che ruba i volti se lo guardi troppo" },
    { id: "q-nave", name: "Varare la Nave di Carta", goal: "una nave di carta che porta a casa chi è rimasto tardi" },
    { id: "q-lanterna", name: "Riempire la Lanterna di Storie", goal: "una lanterna che si accende solo con aneddoti veri" },
    { id: "q-treno", name: "Fermare il Vagone Birichino", goal: "un vagone che scappa e porta via i pisolini" },
    { id: "q-re", name: "Svegliare il Re delle Pause", goal: "il re che, se dorme troppo, nessuno fa più merenda" },
    { id: "q-colore", name: "Restituire il Rosso al Tramonto", goal: "il rosso rubato ai tramonti, ora tutti grigi" },
    { id: "q-chiave2", name: "Aprire il Baule dei Sì", goal: "il baule dove sono chiusi tutti i permessi di giocare ancora un po'" },
    { id: "q-vento", name: "Calmare il Vento Pettegolo", goal: "il vento che racconta i segreti in giro per le piazze" }
  ];

  C.villains = [
    { id: "v-conte", name: "il Conte dei Minuti Rubati", style: "ruba i minuti e li tiene in un orologio a cipolla" },
    { id: "v-strega", name: "Strega Brodo", style: "cuoce i piani degli altri e li serve freddi" },
    { id: "v-re", name: "Re Tappo", style: "chiude tutto con tappi: porte, risate, camini" },
    { id: "v-ombra", name: "Signora Senza Ombra", style: "collezione ombre altrui per sentirsi meno sola" },
    { id: "v-mago", name: "Mago Sbagliato il Grande", style: "i suoi incantesimi funzionano al contrario, di proposito" },
    { id: "v-lupo", name: "Lupo dei Cuscini", style: "soffoca le avventure sotto pile di piume" },
    { id: "v-capitano", name: "Capitano Muffa", style: "fa ammuffire i tesori e le buone idee" },
    { id: "v-bambola", name: "Bambola Direttore", style: "dirige tutti come burattini con un sorriso fisso" },
    { id: "v-cuoco", name: "Chef Fulmine", style: "cucina tempeste e le impiatta senza chiedere" },
    { id: "v-bibliotecaria", name: "la Bibliotecaria del Silenzio Assoluto", style: "cancella le parole dette troppo forte" },
    { id: "v-nano", name: "Nano delle Scorciatoie", style: "vende strade corte che finiscono nel cespuglio sbagliato" },
    { id: "v-gatto", name: "Gatto Imperatore", style: "esige tributi in nascondini e fusa obbligatorie" },
    { id: "v-gelataio", name: "Gelataio Gelido", style: "congela i piedi e i ripensamenti" },
    { id: "v-pittore", name: "Pittore delle Porte False", style: "dipinge uscite che non esistono" },
    { id: "v-sarto", name: "Sarto delle Ombre Strette", style: "cuce vestiti che stringono i destini" },
    { id: "v-posta", name: "Postino dei No", style: "consegna solo rifiuti, mai i sì" },
    { id: "v-rana", name: "Rana Sindaca", style: "fa votare le pozzanghere contro i viaggiatori" },
    { id: "v-drago", name: "Drago dei Sbadigli", style: "addormenta intere valli con uno sbadiglio" },
    { id: "v-specchio", name: "il Gemello nello Specchio", style: "copia i gesti e li fa un po' più cattivi" },
    { id: "v-mulo", name: "Mulo Doganiere", style: "chiede pedaggi in calzini spaiati" },
    { id: "v-luna", name: "la Luna Storta", style: "tira le maree dei calzini sotto i letti" },
    { id: "v-sacco", name: "Sacco dei Rimpianti", style: "inghiotte oggetti «lo prendo dopo»" },
    { id: "v-coro", name: "Coro dei «Non si può»", style: "canta regole finché nessuno osa più" },
    { id: "v-reclock", name: "Orologiaio Invertito", style: "fa scorrere i pomeriggi all'indietro" }
  ];

  C.treasures = [
    { id: "t-fischietto", name: "il Fischietto dei Sussurri" },
    { id: "t-calza", name: "la Calza che Cammina da Sola" },
    { id: "t-mela", name: "la Mela che Dice la Verità solo a Mezzogiorno" },
    { id: "t-chiave", name: "la Chiave Storta" },
    { id: "t-pennello", name: "il Pennello di Nebbia" },
    { id: "t-tazza", name: "la Tazza Senza Fondo (quasi)" },
    { id: "t-dado", name: "il Dado con un Sette" },
    { id: "t-cappa", name: "la Cappa delle Pause" },
    { id: "t-lanterna", name: "la Lanterna Pettegola" },
    { id: "t-corda", name: "la Corda che si Annoda sui Bugiardi" },
    { id: "t-pane", name: "il Pane che Dura tre Giorni e un Segreto" },
    { id: "t-specchio", name: "lo Specchietto dei Dietro" },
    { id: "t-sasso", name: "il Sasso che Torna sempre in Tasca" },
    { id: "t-piuma", name: "la Piuma Pesante" },
    { id: "t-orologio", name: "l'Orologio che Ritarda solo i Guai" },
    { id: "t-mappa", name: "la Mappa che Starnutisce" },
    { id: "t-anello", name: "l'Anello di Spago Magico" },
    { id: "t-foglio", name: "il Foglio che Scrive da Solo le Scuse" },
    { id: "t-campana", name: "la Campanella dei Ritrovamenti" },
    { id: "t-seme", name: "il Seme Instant-Albero" },
    { id: "t-guanti", name: "i Guanti da Afferrare le Nuvole" },
    { id: "t-bussola", name: "la Bussola dei Dolci" },
    { id: "t-sacco", name: "il Sacchetto Infinito di Briciole" },
    { id: "t-corona", name: "la Coroncina di Cartone Vero" }
  ];

  C.npcs = [
    { id: "n-talpa", name: "Talpa Cartografa", quirk: "disegna mappe con il naso" },
    { id: "n-nonno", name: "Nonno Nebbia", quirk: "ricorda il futuro e dimentica le scarpe" },
    { id: "n-owl", name: "Civetta Postina", quirk: "consegna lettere al ramo sbagliato, ma con impegno" },
    { id: "n-bimbo", name: "il Bambino di Fumo", quirk: "è fatto di vapore e teme i sospiri forti" },
    { id: "n-cuoca", name: "Cuoca dei Minuti", quirk: "misura tutto in cucchiai di tempo" },
    { id: "n-cane", name: "Cane Lanterna", quirk: "la coda è una lampada, ma si spegne se ha paura" },
    { id: "n-sarta", name: "Sarta delle Nuvole", quirk: "rappezza il cielo con toppe di lino" },
    { id: "n-pescatore", name: "Pescatore di Echi", quirk: "pesca suoni caduti nei pozzi" },
    { id: "n-regina", name: "Regina delle Formiche Fornaie", quirk: "offre briciole in cambio di notizie" },
    { id: "n-robot", name: "Stufetta Parlante", quirk: "scalda i piedi e i discorsi freddi" },
    { id: "n-albero", name: "Albero Impaziente", quirk: "sbatte i rami se aspettate troppo" },
    { id: "n-topo", name: "Topo Bibliotecario", quirk: "timbra i visitatori sulle caviglie" },
    { id: "n-fata", name: "Fata dei Compiti", quirk: "aiuta solo chi ha già provato tre volte" },
    { id: "n-guardia", name: "Guardia di Paglia", quirk: "è severa, ma si piega al vento delle scuse" },
    { id: "n-mercante", name: "Mercante di Sbadigli", quirk: "vende riposo a rate" },
    { id: "n-lumaca", name: "Lumaca Corriera", quirk: "è lenta, ma non perde mai un indirizzo" },
    { id: "n-pirata", name: "Pirata in Pensione", quirk: "ha una nave in una bottiglia e nostalgia" },
    { id: "n-stella", name: "Stella Caduta Zoppa", quirk: "zoppica di luce e chiede una spalla" },
    { id: "n-fornaio", name: "Fornaio dei Sogni Cotti", quirk: "inforna incubi e li fa diventare crostate" },
    { id: "n-rana", name: "Rana Notaia", quirk: "fa firmare i patti con una zampata bagnata" },
    { id: "n-ombra", name: "Ombra Smarruta", quirk: "cerca il padrone ma si attacca al primo sorriso" },
    { id: "n-drago", name: "Draghetto Raffreddato", quirk: "starnutisce fiammelle innocue e molto rumorose" },
    { id: "n-nonna", name: "Nonna delle Chiavi", quirk: "ha tutte le chiavi tranne quella che serve" },
    { id: "n-vento", name: "Vento Apprendista", quirk: "impara ancora a soffiare dritto" },
    { id: "n-statua", name: "Statua Che si Annoia", quirk: "commenta i passanti se qualcuno la saluta" },
    { id: "n-ape", name: "Ape Archivista", quirk: "cataloga i fiori e i favori" },
    { id: "n-re", name: "Re dei Calzini", quirk: "governa un cassetto e cerca il paio perduto" },
    { id: "n-fantasma", name: "Fantasma della Merenda", quirk: "appare solo tra le quattro e le cinque" },
    { id: "n-ponte", name: "Ponte Parlante", quirk: "fa pagare dazio in barzellette" },
    { id: "n-gatto", name: "Gatto Senza Nome", quirk: "accetta un nome solo se è sbagliato di proposito" },
    { id: "n-orologiaio", name: "Orologiaia dei Pisolini", quirk: "aggiusta i sonnellini che scappano" },
    { id: "n-mulo", name: "Mulo Poeta", quirk: "recita versi se qualcuno gli porta una mela" }
  ];

  C.roles = [
    { id: "r-esplora", name: "Esploratrice/Esploratore", knack: "trovare sentieri storti" },
    { id: "r-cuoco", name: "Cuoca/Cuoco di Viaggio", knack: "inventare pasti e alleanze" },
    { id: "r-inventa", name: "Inventrice/Inventore da Tasca", knack: "costruire aggeggi con tre oggetti" },
    { id: "r-parla", name: "Ambasciatrice/Ambasciatore", knack: "convincere chi è di cattivo umore" },
    { id: "r-guarda", name: "Sentinella", knack: "notare dettagli che gli altri saltano" },
    { id: "r-cura", name: "Guaritrice/Guaritore dei Graffi", knack: "rimediare ai guai piccoli" },
    { id: "r-furbo", name: "Birichina/Birichino", knack: "distrarre, scivolare, sparire un attimo" },
    { id: "r-forza", name: "Spalla Forte", knack: "spingere, sollevare, fare da ponte" },
    { id: "r-canto", name: "Cantastorie", knack: "cambiare l'umore di un luogo con una storia" },
    { id: "r-animale", name: "Amica/Amico degli Animali", knack: "farsi capire da bestie e insetti" },
    { id: "r-mappa", name: "Cartografa/Cartografo", knack: "non perdersi, o perdersi meglio" },
    { id: "r-ombra", name: "Cacciatrice/Cacciatore d'Ombre", knack: "seguire piste strane" },
    { id: "r-dado", name: "Portafortuna", knack: "quando il dado è indeciso, tira dalla vostra" },
    { id: "r-scala", name: "Arrampicatrice/Arrampicatore", knack: "salire dove gli altri guardano" },
    { id: "r-eco", name: "Ascoltatrice/Ascoltatore di Echi", knack: "sentire ciò che i muri ripetono" },
    { id: "r-chiave", name: "Chiavaiola/Chiavaio", knack: "aprire, o almeno tentare, qualsiasi chiusura" },
    { id: "r-faro", name: "Portatrice/Portatore di Lume", knack: "tenere accesa la speranza (e la lanterna)" },
    { id: "r-scudo", name: "Custode del Gruppo", knack: "mettersi in mezzo quando arriva il pericolo" }
  ];

  C.locations = [
    { id: "l-ponte", name: "il Ponte di Radici Sospese" },
    { id: "l-cucina", name: "la Cucina Abbandonata che Cucina da Sola" },
    { id: "l-pozzo", name: "il Pozzo che Canta i Nomi" },
    { id: "l-mercato", name: "il Mercato delle Ore Storte" },
    { id: "l-grotta", name: "la Grotta di Caramelle Salate" },
    { id: "l-torre", name: "la Torre dei Cuscini Impilati" },
    { id: "l-fiume", name: "il Fiume di Inchiostro" },
    { id: "l-stalla", name: "la Stalla dei Cavalli di Nebbia" },
    { id: "l-salone", name: "il Salone degli Specchi Bugiardi" },
    { id: "l-tetto", name: "i Tetti che Camminano" },
    { id: "l-boschetto", name: "il Boschetto delle Domande" },
    { id: "l-mulino", name: "il Mulino che Macina Segreti" },
    { id: "l-spiaggia", name: "la Spiaggia di Bottoni" },
    { id: "l-treno", name: "il Vagone Senza Binari" },
    { id: "l-cimitero", name: "il Giardino delle Statue Impazienti" },
    { id: "l-biblioteca", name: "la Sala dei Libri Affamati" },
    { id: "l-cantina", name: "la Cantina delle Risate in Bottiglia" },
    { id: "l-piazza", name: "la Piazza che Cambia Pavimento" },
    { id: "l-faro", name: "il Faro Interno, senza Mare" },
    { id: "l-miniera", name: "il Cunicolo delle Luci Perdute" },
    { id: "l-teatro", name: "il Teatro dei Palcoscenici Vuoti" },
    { id: "l-orto", name: "l'Orto che Semina da Solo" },
    { id: "l-ponte2", name: "il Ponte di Stoviglie" },
    { id: "l-nido", name: "il Nido Gigante nel Camino" },
    { id: "l-scala", name: "la Scala che Salta i Gradini" },
    { id: "l-lago", name: "lo Specchio d'Acqua che Non Riflette" },
    { id: "l-tenda", name: "la Tenda del Circo Chiuso" },
    { id: "l-forno", name: "il Forno dei Piani Cotti" },
    { id: "l-vicolo", name: "il Vicolo delle Ombre Colorate" },
    { id: "l-albero", name: "l'Albero Cavo Pieno di Posta" },
    { id: "l-molo", name: "il Molo delle Nuvole Attraccate" },
    { id: "l-cassa", name: "la Stanza delle Cassette Musicali" },
    { id: "l-ghiaccio", name: "la Serre di Ghiaccio Dolce" },
    { id: "l-campane", name: "il Campanile Senza Campane" },
    { id: "l-tappeto", name: "la Sala del Tappeto Vivo" },
    { id: "l-soffitta", name: "la Soffitta dei Bauli Chiocciola" },
    { id: "l-chiostro", name: "il Chiostro delle Pause" },
    { id: "l-cava", name: "la Cava di Gessetti Magici" },
    { id: "l-ponte3", name: "il Passerella di Fumo Solido" },
    { id: "l-cuccia", name: "la Cuccia Reale dei Cani di Vento" },
    { id: "l-orologio", name: "la Stanza dentro l'Orologio" },
    { id: "l-serra", name: "la Serra dei Fiori Pettegoli" },
    { id: "l-magazzino", name: "il Magazzino dei Giorni in Scatola" },
    { id: "l-crocevia", name: "il Crocevia delle Quattro Merende" },
    { id: "l-cascata", name: "la Cascata di Coriandoli Bagnati" },
    { id: "l-archivio", name: "l'Archivio delle Promesse" },
    { id: "l-cucina2", name: "il Dispensa Verticale" },
    { id: "l-tunnel", name: "il Tunnel dei Calzini" }
  ];

  C.challenges = [
    {
      id: "c-ponte",
      kind: "danger",
      who: "one",
      title: "Passaggio stretto",
      master: "Siete a {location}. Il passaggio è stretto e sotto c'è un vuoto che fa «gna». {npc} vi grida di sbrigarvi: {villain} non è lontano.",
      secret: "Se falliscono, un cuore se ne va in uno scivolone. Se riescono, trovano una scorciatoia.",
      prompt: "Come attraversate?",
      choices: [
        { id: "run", label: "Attraversiamo di corsa, uno alla volta", target: 4, dmg: 1, ok: "I piedi volano. Il vuoto resta a bocca aperta.", fail: "Uno scivolone! Il vuoto morde un cuore." },
        { id: "build", label: "Costruiamo un passaggio con quello che abbiamo", target: 5, dmg: 1, ok: "Nasce un ponticello ridicolo e solidissimo.", fail: "Crolla a metà. Qualcuno resta appeso per un calzino, e un cuore se ne va." }
      ]
    },
    {
      id: "c-indovinello",
      kind: "puzzle",
      who: "one",
      title: "La domanda del luogo",
      master: "{location} non si apre senza una risposta. Una voce chiede: «Che cosa si può spezzare senza toccarla?» {npc} sussurra che {villain} odia chi indovina.",
      secret: "La risposta vera è «una promessa» o «il silenzio», ma conta il tiro: il luogo è capriccioso.",
      prompt: "Cosa tentate?",
      choices: [
        { id: "think", label: "Pensiamo ad alta voce e rispondiamo", target: 4, dmg: 1, ok: "Il luogo fa «ahh» soddisfatto e si sposta.", fail: "Risposta storta: una piccola trappola scatta." },
        { id: "trick", label: "Facciamo una domanda a nostra volta", target: 5, dmg: 1, ok: "Il luogo si confonde e vi lascia passare per rispetto.", fail: "Si offende. Una raffica vi colpisce." }
      ]
    },
    {
      id: "c-social",
      kind: "social",
      who: "one",
      title: "Trattativa lampo",
      master: "{npc} blocca la strada a {location}. Vuole {treasure} in cambio di un favore. In realtà ha paura di {villain}.",
      secret: "Un successo ottiene aiuto. Un fallimento fa perdere tempo e un cuore (un litigio che fa male).",
      prompt: "Come convincete?",
      choices: [
        { id: "kind", label: "Raccontiamo la nostra missione con calma", target: 4, dmg: 1, ok: "{npc} si scioglie e indica un passaggio nascosto.", fail: "Non crede a una parola. Vi caccia con un colpo di sfortuna." },
        { id: "trade", label: "Offriamo uno scambio onesto", target: 5, dmg: 1, ok: "Lo scambio è fatto. Ottenete anche un consiglio su {villain}.", fail: "Lo scambio è una trappola: perdete un cuore e quasi {treasure}." }
      ]
    },
    {
      id: "c-stealth",
      kind: "stealth",
      who: "two",
      title: "Passare inosservati",
      master: "A {location} ci sono le sentinelle di {villain}. {npc} fa da palo, ma trema.",
      secret: "Servono due persone. Se fallisce chi tira, entrambi rischiano: il danno va a chi ha tirato.",
      prompt: "Quale piano?",
      choices: [
        { id: "shadow", label: "Strisciamo nell'ombra, fiato corto", target: 4, dmg: 1, ok: "Le sentinelle contano le nuvole. Passate.", fail: "Un starnuto. Allarme. Un cuore in meno." },
        { id: "disguise", label: "Ci travestiamo da roba del posto", target: 5, dmg: 1, ok: "Siete credibili quanto basta. Qualcuno vi saluta persino.", fail: "Il travestimento cade a pezzi. Rissa lampo, un cuore via." }
      ]
    },
    {
      id: "c-chase",
      kind: "chase",
      who: "two",
      title: "La corsa",
      master: "Qualcosa ruba {treasure} e scappa attraverso {location}! {npc} urla: «È un servo di {villain}!»",
      secret: "Tira chi è in vita, uno dopo l'altro in questa scena useremo un solo rappresentante del gruppo (il primo vivo scelto). Se fallisce, il tesoro scivola via per ora.",
      prompt: "Come inseguite?",
      choices: [
        { id: "sprint", label: "Scatto a gambe levate", target: 4, dmg: 1, ok: "Lo agganciate. {treasure} torna in tasca.", fail: "Inciampo collettivo. Un cuore e il fiato." },
        { id: "cut", label: "Tagliamo la strada dal lato storto", target: 5, dmg: 1, ok: "Uscite da un vicolo ridicolo e lo beccate.", fail: "Il lato storto era un vicolo cieco. Tonfo." }
      ]
    },
    {
      id: "c-help",
      kind: "help",
      who: "one",
      title: "Qualcuno in trappola",
      master: "{npc} è bloccato a {location}: una trappola firmata {villain}. Chiede aiuto senza fare rumore.",
      secret: "Salvare dà un alleato per la scena dopo (narrativo). Fallire fa male a chi aiuta.",
      prompt: "Come liberate?",
      choices: [
        { id: "care", label: "Disinneschiamo con calma", target: 4, dmg: 1, ok: "Click. {npc} è libero e vi deve un favore.", fail: "La trappola morde anche voi." },
        { id: "force", label: "Tiriamo con tutta la forza", target: 5, dmg: 2, ok: "Spacchiamo la trappola. Un po' di rumore, ma siete eroi.", fail: "Cede di colpo: due cuori di botto per lo strattone." }
      ]
    },
    {
      id: "c-moral",
      kind: "moral",
      who: "one",
      title: "Due strade, un cuore",
      master: "A {location} dovete scegliere: salvare {treasure} che sta per cadere, o coprire {npc} che sta per essere scoperto da un servo di {villain}.",
      secret: "Entrambi i tiri sono onesti. Il fallimento fa sentire il peso della scelta (danno).",
      prompt: "Cosa fate?",
      choices: [
        { id: "item", label: "Salviamo l'oggetto, e poi corriamo dall'amico", target: 4, dmg: 1, ok: "{treasure} è salvo. {npc} ce la fa per un pelo e vi ringrazia lo stesso.", fail: "Perdete la presa. Un cuore di rimpianto (e un livido)." },
        { id: "friend", label: "Copriamo l'amico, l'oggetto può aspettare", target: 4, dmg: 1, ok: "{npc} è salvo. {treasure} lo ritroverete: ha fatto «cling» in un cespuglio.", fail: "Vi scoprono. Scontro breve, un cuore in meno." }
      ]
    },
    {
      id: "c-explore",
      kind: "explore",
      who: "one",
      title: "Il dettaglio nascosto",
      master: "{location} sembra vuoto. Troppo vuoto. {npc} dice che {villain} lascia sempre una traccia, se sapete dove guardare.",
      secret: "Successo: indizio sul covo. Fallimento: una trappola di curiosità.",
      prompt: "Dove cercate?",
      choices: [
        { id: "high", label: "Guardiamo in alto, sempre in alto", target: 4, dmg: 1, ok: "Un segno. La strada verso {villain} è più chiara.", fail: "Vi cade addosso qualcosa di pesante e ingiusto." },
        { id: "low", label: "Frughiamo in basso, tra le fessure", target: 5, dmg: 1, ok: "Trovate un passaggio da topi, perfetto.", fail: "Un morso del posto. Ahi." }
      ]
    },
    {
      id: "c-storm",
      kind: "danger",
      who: "two",
      title: "La bufera del posto",
      master: "Una bufera voluta da {villain} si abbatte su {location}. {npc} cerca un riparo che forse non c'è.",
      secret: "Un rappresentante tira per il gruppo. Fallire colpisce chi tira.",
      prompt: "Come resistete?",
      choices: [
        { id: "shelter", label: "Ci accovacciamo e aspettiamo il peggio", target: 4, dmg: 1, ok: "La bufera vi lecca e se ne va, annoiata.", fail: "Vi prende in pieno. Un cuore vola via con il vento." },
        { id: "sing", label: "Cantiamo per calmare il posto", target: 5, dmg: 1, ok: "Il luogo si intenerisce. La bufera fa un inchino.", fail: "Stonati. La bufera si offende." }
      ]
    },
    {
      id: "c-lock",
      kind: "puzzle",
      who: "one",
      title: "La porta capricciosa",
      master: "Una porta a {location} chiede un pedaggio strano. {npc} ha già fallito tre volte. Dietro, forse, c'è un pezzo della missione contro {villain}.",
      secret: "Il pedaggio è un tiro, non un indovinello vero.",
      prompt: "Come aprite?",
      choices: [
        { id: "key", label: "Proviamo tutte le chiavi, anche quelle inventate", target: 4, dmg: 1, ok: "Una chiave finta diventa vera per un secondo. Basta.", fail: "La porta morde le dita (e un cuore)." },
        { id: "ask", label: "Chiediamo scusa alla porta e spieghiamo perché", target: 5, dmg: 1, ok: "La porta è di buon umore. Si apre sbadigliando.", fail: "Non accetta scuse deboli. Sbatte." }
      ]
    },
    {
      id: "c-climb",
      kind: "danger",
      who: "one",
      title: "Salita da brivido",
      master: "Per proseguire bisogna salire su {location}. Sotto, {npc} tiene (forse) una corda. Sopra, odore di {villain}.",
      secret: "Fallimento = caduta controllata, un o due cuori.",
      prompt: "Come salite?",
      choices: [
        { id: "slow", label: "Salita lenta, presa per presa", target: 4, dmg: 1, ok: "In cima. Le ginocchia dicono cose, ma siete lì.", fail: "Molla una presa. Caduta, un cuore." },
        { id: "leap", label: "Salti arditi, come nei racconti", target: 6, dmg: 2, ok: "Un salto da leggenda. {npc} applaude.", fail: "I racconti mentivano. Tonfo doppio." }
      ]
    },
    {
      id: "c-cook",
      kind: "puzzle",
      who: "one",
      title: "Ricetta di sopravvivenza",
      master: "A {location} un pentolone esige un ingrediente. {npc} propone di usare {treasure} come mestolo. {villain} ha già tentato di bruciare tutto.",
      secret: "Cucinare è un tiro. Il pentolone è giudice.",
      prompt: "Cosa cucinate?",
      choices: [
        { id: "careful", label: "Seguiamo la ricetta alla lettera", target: 4, dmg: 1, ok: "Profumo di vittoria. Il pentolone vi benedice.", fail: "Troppo sale magico. Schizzo bollente, un cuore." },
        { id: "improv", label: "Inventiamo, con coraggio e un po' di caos", target: 5, dmg: 1, ok: "Nasce un piatto impossibile che apre la strada.", fail: "Il caos è troppo. Esplosione di brodo." }
      ]
    },
    {
      id: "c-dark",
      kind: "stealth",
      who: "one",
      title: "Buio che ascolta",
      master: "Il buio di {location} ascolta i passi. {npc} vi prende la mano. {villain} ha orecchie anche qui.",
      secret: "Parlare forte fa fallire di più, ma il tiro decide.",
      prompt: "Come avanzate?",
      choices: [
        { id: "silent", label: "Passi di velluto, niente parole", target: 4, dmg: 1, ok: "Il buio vi ignora, per una volta.", fail: "Un sassolino traditore. Il buio morde." },
        { id: "light", label: "Accendiamo un lume piccolo piccolo", target: 5, dmg: 1, ok: "La luce è una cortesia. Il buio accetta.", fail: "Troppa luce. Il buio si adombra (letteralmente)." }
      ]
    },
    {
      id: "c-market",
      kind: "social",
      who: "two",
      title: "Affare al volo",
      master: "A {location} si vende una voce: sa dove {villain} nasconde le cose. {npc} fa da interprete. Il prezzo è un tiro, non monete.",
      secret: "Due persone all'affare. Tira la prima scelta.",
      prompt: "Come contrattate?",
      choices: [
        { id: "fair", label: "Offriamo un racconto vero in pagamento", target: 4, dmg: 1, ok: "La voce è vostra. Un indizio succoso.", fail: "Il racconto non convince. Vi derubano di un cuore (figurato, ma fa male)." },
        { id: "bluff", label: "Bluffiamo di essere ispettori di {villain}", target: 6, dmg: 1, ok: "Funziona, per poco. Scappate con l'info.", fail: "Bluff orribile. Scandalo, un cuore." }
      ]
    },
    {
      id: "c-bridge-riddle",
      kind: "puzzle",
      who: "one",
      title: "Il guardiano di soglia",
      master: "Un guardiano di {location} vieta il passo. Non è cattivo: è impiegato di {villain} per sbaglio. {npc} conosce una scappatoia legale.",
      secret: "Potete convincere o aggirare.",
      prompt: "Che strategia?",
      choices: [
        { id: "paper", label: "Tiriamo fuori un permesso inventato benissimo", target: 5, dmg: 1, ok: "Il permesso diventa vero per burocrazia magica.", fail: "Bollo mancante. Multa in cuori." },
        { id: "side", label: "Passiamo di lato mentre {npc} distrae", target: 4, dmg: 1, ok: "Classico e funziona.", fail: "Vi beccano. Spintone magico." }
      ]
    },
    {
      id: "c-ice",
      kind: "danger",
      who: "one",
      title: "Superficie traditrice",
      master: "{location} è scivoloso come una bugia. {npc} ha già fatto una piroetta non richiesta. {villain} ama chi cade.",
      secret: "Un 1 sarebbe un disastro, ma usiamo solo il target.",
      prompt: "Come lo attraversate?",
      choices: [
        { id: "slide", label: "Ci lasciamo scivolare di proposito", target: 4, dmg: 1, ok: "Una slitta umana. Arrivate ridendo.", fail: "Slitta contro un muro. Ahi." },
        { id: "grip", label: "Ci attacchiamo a ogni asperità", target: 5, dmg: 1, ok: "Lenti e salvi.", fail: "Molla tutto. Caduta." }
      ]
    },
    {
      id: "c-song",
      kind: "social",
      who: "one",
      title: "Il canto che apre",
      master: "{location} si apre solo con un canto. {npc} è stonato. {villain} ha vietato la musica.",
      secret: "Cantare è un tiro di coraggio, non di orecchio.",
      prompt: "Chi canta e come?",
      choices: [
        { id: "solo", label: "Un assolo coraggioso", target: 4, dmg: 1, ok: "Il luogo fa bis e si apre.", fail: "Fischi (magici). Un cuore di imbarazzo fisico." },
        { id: "choir", label: "Un coro improvvisato di tutti i presenti", target: 5, dmg: 1, ok: "Stonati insieme, quindi perfetti.", fail: "Caos sonoro. Il luogo vi spinge via." }
      ]
    },
    {
      id: "c-trap",
      kind: "danger",
      who: "one",
      title: "Pavimento bugiardo",
      master: "Il pavimento di {location} ha mattonelle che mentono. {npc} dice: «Mai quelle a pois, o sì, aspetta.» {villain} le ha fatte lui.",
      secret: "Scegliere è un tiro. Le pois sono un bluff narrativo.",
      prompt: "Come avanzate?",
      choices: [
        { id: "test", label: "Proviamo ogni passo con un rametto", target: 4, dmg: 1, ok: "Lenti. Vivi. Il pavimento si annoia.", fail: "Una mattonella vince. Scossa, un cuore." },
        { id: "dash", label: "Una corsa dritta, occhi chiusi a metà", target: 5, dmg: 2, ok: "Sorprendete il pavimento. Non fa in tempo.", fail: "Fa in tempo. Due cuori." }
      ]
    },
    {
      id: "c-animal",
      kind: "social",
      who: "one",
      title: "Bestia di confine",
      master: "Una bestia custode blocca {location}. Non è di {villain}, ma è irritata. {npc} parla un po' la sua lingua.",
      secret: "Amicizia o rispetto. Non violenza vera: è un gioco in famiglia.",
      prompt: "Come vi presentate?",
      choices: [
        { id: "food", label: "Offriamo cibo (anche immaginario, ma convinto)", target: 4, dmg: 1, ok: "La bestia accetta e vi scorta un tratto.", fail: "Non era cibo. Morso d'orgoglio, un cuore." },
        { id: "bow", label: "Facciamo un inchino lunghissimo", target: 5, dmg: 1, ok: "Rispetto ottenuto. Passate.", fail: "Inchino troppo corto. Offesa." }
      ]
    },
    {
      id: "c-repair",
      kind: "puzzle",
      who: "two",
      title: "Aggeggio rotto",
      master: "A {location} un meccanismo dovrebbe aiutarvi. È rotto. {npc} ha due attrezzi e tre opinioni. {villain} l'ha sabotato.",
      secret: "Due teste. Un tiro.",
      prompt: "Come lo riparate?",
      choices: [
        { id: "manual", label: "Seguiamo le istruzioni scritte storte", target: 4, dmg: 1, ok: "Click-clack. Funziona, più o meno.", fail: "Istruzioni capovolte. Scossa." },
        { id: "kick", label: "Un colpo secco nel punto giusto (speriamo)", target: 6, dmg: 1, ok: "Il colpo della leggenda.", fail: "Punto sbagliato. Il meccanismo morde." }
      ]
    },
    {
      id: "c-memory",
      kind: "puzzle",
      who: "one",
      title: "Stanza dei ricordi",
      master: "{location} mostra ricordi che non sono vostri. {npc} dice di non credere a tutto. {villain} nasconde bugie tra i ricordi.",
      secret: "Scegliere il ricordo vero è un tiro.",
      prompt: "Cosa fate?",
      choices: [
        { id: "focus", label: "Cerchiamo il ricordo che ha un odore vero", target: 4, dmg: 1, ok: "Trovate una verità utile sulla tana di {villain}.", fail: "Ingoiate una bugia. Fa male, un cuore." },
        { id: "close", label: "Chiudiamo gli occhi e usciamo a tentoni", target: 5, dmg: 1, ok: "Non vi fate fregare. Uscita pulita.", fail: "Inciampate in un ricordo tagliente." }
      ]
    },
    {
      id: "c-crowd",
      kind: "social",
      who: "one",
      title: "Folla contraria",
      master: "A {location} una folla è convinta che siate amici di {villain}. {npc} tenta un discorso.",
      secret: "Un discorso o una fuga dignitosa.",
      prompt: "Come gestite la folla?",
      choices: [
        { id: "speech", label: "Un discorso dal cuore", target: 5, dmg: 1, ok: "La folla si scioglie. Qualcuno vi applaude.", fail: "Pomodori magici. Un cuore." },
        { id: "exit", label: "Una scusa brillante e una retrata", target: 4, dmg: 1, ok: "Uscita elegante. Nessun pomodoro.", fail: "Inciampo pubblico. Ahia." }
      ]
    },
    {
      id: "c-water",
      kind: "danger",
      who: "two",
      title: "Traversata bagnata",
      master: "C'è da attraversare un tratto d'acqua (o brodo, o inchiostro) a {location}. {npc} non nuota. {villain} ha messo correnti storte.",
      secret: "Due persone: una guida, una aiuta.",
      prompt: "Come attraversate?",
      choices: [
        { id: "float", label: "Costruiamo una zattera lampo", target: 4, dmg: 1, ok: "Galleggia. È brutta. È vostra.", fail: "Affonda a metà. Un cuore bagnato." },
        { id: "swim", label: "Nuoto deciso, corda tra i denti", target: 5, dmg: 1, ok: "Arrivate grondanti e vittoriosi.", fail: "Corrente storta. Strattona un cuore." }
      ]
    },
    {
      id: "c-time",
      kind: "puzzle",
      who: "one",
      title: "Minuti che scappano",
      master: "A {location} i minuti scappano verso {villain}. {npc} tenta di acchiapparne uno per la coda.",
      secret: "Prendere un minuto è un tiro.",
      prompt: "Come fermate il tempo (un po')?",
      choices: [
        { id: "catch", label: "Acchiappiamo un minuto a mani nude", target: 5, dmg: 1, ok: "Ne tenete uno. Vi dà un respiro in più, narrativo.", fail: "Vi morde, i minuti hanno denti. Un cuore." },
        { id: "wait", label: "Restiamo fermi finché i minuti si annoiano", target: 4, dmg: 1, ok: "Funziona. I minuti vanno a infastidire altri.", fail: "Vi annoiate voi, e pagate." }
      ]
    },
    {
      id: "c-maze",
      kind: "explore",
      who: "one",
      title: "Labirinto gentile",
      master: "{location} è un labirinto che cambia se vi pentite. {npc} consiglia di scegliere e basta. {villain} ama chi torna indietro.",
      secret: "Decidere è il tiro.",
      prompt: "Come lo affrontate?",
      choices: [
        { id: "left", label: "Sempre a sinistra, come un giuramento", target: 4, dmg: 1, ok: "Il labirinto rispetta i giuramenti stupidi.", fail: "Giuramento rotto da un vicolo. Tonfo." },
        { id: "mark", label: "Lasciamo segni e ci fidiamo dei segni", target: 5, dmg: 1, ok: "I segni restano. Uscita.", fail: "I segni camminano via. Smarriti, un cuore." }
      ]
    },
    {
      id: "c-gift",
      kind: "moral",
      who: "one",
      title: "Regalo avvelenato (di zucchero)",
      master: "Su {location} c'è un dono: sembra {treasure}. {npc} dice che {villain} regala spesso. Troppo spesso.",
      secret: "Prendere o lasciare: entrambi tiri.",
      prompt: "Che fate del dono?",
      choices: [
        { id: "take", label: "Lo prendiamo, ma lo controlliamo bene", target: 5, dmg: 1, ok: "Era quasi una trappola. Ora è vostro, onesto.", fail: "Trappola. Ahi." },
        { id: "leave", label: "Lo lasciamo e andiamo via a testa alta", target: 4, dmg: 1, ok: "Il dono si offende e indica, per dispetto, la strada giusta.", fail: "Il dono vi insegue. Morso d'orgoglio." }
      ]
    },
    {
      id: "c-night",
      kind: "stealth",
      who: "two",
      title: "Turno di guardia",
      master: "Dovete attraversare {location} mentre {villain} fa il giro notturno. {npc} russa. Male.",
      secret: "Un rappresentante tira per tutti.",
      prompt: "Come fate la guardia-movimento?",
      choices: [
        { id: "creep", label: "Movimento a ondate, quando russa {npc}", target: 4, dmg: 1, ok: "Il russare copre i passi. Geniale e orribile.", fail: "Russare si ferma proprio allora. Oh no." },
        { id: "decoy", label: "Lasciamo un richiamo falso dall'altra parte", target: 5, dmg: 1, ok: "{villain} abbocca al falso. Voi no.", fail: "Abbocca a voi. Scontro lampo." }
      ]
    },
    {
      id: "c-storm2",
      kind: "danger",
      who: "one",
      title: "Tetto che vola",
      master: "Il tetto di {location} sta per volare via. Sotto c'è {npc}. {villain} tira raffiche apposta.",
      secret: "Tenere o scappare.",
      prompt: "Cosa fate?",
      choices: [
        { id: "hold", label: "Teniamo il tetto tutti i secondi che servono", target: 5, dmg: 1, ok: "Il tetto resta. {npc} è salvo. Siete eroi da cantiere.", fail: "Il tetto vince. Un cuore schiacciato di fatica." },
        { id: "run", label: "Tiriamo fuori {npc} e lasciamo volare il tetto", target: 4, dmg: 1, ok: "Salvataggio pulito. Il tetto fa un giro turistico.", fail: "Inciampo in uscita. Ahi." }
      ]
    },
    {
      id: "c-riddle2",
      kind: "puzzle",
      who: "one",
      title: "Tre porte, un ticchettio",
      master: "Tre porte a {location}. Una porta a {treasure}, una da {npc} alleato, una dritta da {villain} troppo presto.",
      secret: "Il tiro sceglie se indovinate «abbastanza».",
      prompt: "Come scegliete la porta?",
      choices: [
        { id: "listen", label: "Ascoltiamo i ticchettii", target: 4, dmg: 1, ok: "Il ticchettio giusto. Porta onesta.", fail: "Ticchettio bugiardo. Trappola." },
        { id: "smell", label: "Seguiamo l'odore di merenda vera", target: 5, dmg: 1, ok: "L'odore non mente. Quasi mai.", fail: "Era odore di trappola al cioccolato." }
      ]
    },
    {
      id: "c-duel",
      kind: "danger",
      who: "one",
      title: "Sfida lampo",
      master: "Un servo di {villain} vi sfida a {location}: non a duello di spade, a duello di coraggio. {npc} fa da arbitro incerto.",
      secret: "È un tiro di stomaco, non di spada.",
      prompt: "Come rispondete alla sfida?",
      choices: [
        { id: "stare", label: "Gara di sguardi", target: 4, dmg: 1, ok: "L'altro batte le palpebre. Vittoria.", fail: "Battete le palpebre voi. Un cuore di smacco." },
        { id: "game", label: "Cambiamo gioco: una gara di equilibrio", target: 5, dmg: 1, ok: "Vince l'equilibrio. Il servo se ne va confuso.", fail: "Caduta. Ahia." }
      ]
    },
    {
      id: "c-map",
      kind: "explore",
      who: "one",
      title: "Mappa che mente",
      master: "Trovate una mappa a {location}. {npc} giura che è vera. Puzza di {villain}.",
      secret: "Fidarsi o no è un tiro.",
      prompt: "Vi fidate della mappa?",
      choices: [
        { id: "trust", label: "La seguiamo, ma con un occhio al cielo", target: 5, dmg: 1, ok: "Era vera al 70%. Basta.", fail: "Era vera al 10%. Trappola." },
        { id: "redraw", label: "La ridisegniamo di testa nostra", target: 4, dmg: 1, ok: "La vostra mappa è brutta e corretta.", fail: "Ancora più persi. Un cuore di fatica." }
      ]
    },
    {
      id: "c-comfort",
      kind: "help",
      who: "one",
      title: "Paura contagiosa",
      master: "{npc} è in preda al panico a {location}. Se non lo calmate, il panico chiama {villain}.",
      secret: "Calmare è un tiro di empatia.",
      prompt: "Come lo aiutate?",
      choices: [
        { id: "talk", label: "Parole basse, mano sulla spalla", target: 4, dmg: 1, ok: "Il panico se ne va a fare un giro.", fail: "Le parole escono storte. Il panico morde anche voi." },
        { id: "joke", label: "Una barzelletta nel momento sbagliato, che diventa giusto", target: 5, dmg: 1, ok: "Risata. Magia.", fail: "Barzelletta davvero sbagliata. Ahi." }
      ]
    },
    {
      id: "c-climb2",
      kind: "danger",
      who: "two",
      title: "Catena umana",
      master: "Serve una catena umana per superare un vuoto a {location}. {npc} è troppo corto. {villain} tira ventate.",
      secret: "Due persone. Un tiro.",
      prompt: "Come vi organizzate?",
      choices: [
        { id: "chain", label: "Catena stretta, denti stretti", target: 4, dmg: 1, ok: "Funziona. Siete un bruco coraggioso.", fail: "Cede un anello. Un cuore." },
        { id: "throw", label: "Lanciamo il più leggero e poi il resto", target: 5, dmg: 2, ok: "Lancio da circo. Applausi interni.", fail: "Lancio da circo, atterraggio da no. Due cuori." }
      ]
    },
    {
      id: "c-shop",
      kind: "social",
      who: "one",
      title: "Bottega delle regole",
      master: "Una bottega a {location} vende permessi. Il bottegaio è un cugino di {villain}, ma {npc} lo conosce.",
      secret: "Comprare con un tiro.",
      prompt: "Come ottenete il permesso?",
      choices: [
        { id: "polite", label: "Cortesia estrema e tre «per favore»", target: 4, dmg: 1, ok: "Permesso timbrato. Quasi legale.", fail: "Troppa cortesia. Sospetto. Un cuore." },
        { id: "cousin", label: "Chiediamo a {npc} di fare da garante", target: 5, dmg: 1, ok: "Garante accettato.", fail: "{npc} non è così famoso. Porta in faccia (magica)." }
      ]
    },
    {
      id: "c-echo",
      kind: "explore",
      who: "one",
      title: "Echi traditori",
      master: "A {location} gli echi ripetono le istruzioni sbagliate. {npc} tappa le orecchie. {villain} ha addestrato gli echi.",
      secret: "Fidarsi delle orecchie o degli occhi.",
      prompt: "A chi credete?",
      choices: [
        { id: "eyes", label: "Occhi aperti, echi ignorati", target: 4, dmg: 1, ok: "Gli echi si offendono e tacciono.", fail: "Inciampate ignorando un vero avviso. Ahi." },
        { id: "ears", label: "Ascoltiamo l'eco che sbaglia di meno", target: 5, dmg: 1, ok: "Trovate l'eco pentito. Vi guida.", fail: "Era l'eco più bugiardo." }
      ]
    },
    {
      id: "c-finalish",
      kind: "danger",
      who: "one",
      title: "Allarme prematuro",
      master: "Qualcuno (forse {npc}) fa partire un allarme a {location}. {villain} potrebbe sentire. Dovete spegnerlo.",
      secret: "Spegnerlo in fretta.",
      prompt: "Come spegnete l'allarme?",
      choices: [
        { id: "smash", label: "Un colpo deciso all'aggeggio", target: 4, dmg: 1, ok: "Silenzio. Un po' di pezzi per terra.", fail: "L'aggeggio colpisce indietro." },
        { id: "whisper", label: "Gli chiediamo di smettere, per favore", target: 6, dmg: 1, ok: "L'allarme aveva solo bisogno di essere ascoltato. Si spegne.", fail: "Non ascolta. Urla di più. Un cuore di stress." }
      ]
    },
    {
      id: "c-feast",
      kind: "moral",
      who: "two",
      title: "Tavola troppo piena",
      master: "A {location} c'è un banchetto. Mangiare dà forza, ma il cibo è firmato {villain}. {npc} ha già un dubbioso forchettata in aria.",
      secret: "Un rappresentante tira per il gruppo.",
      prompt: "Mangiate?",
      choices: [
        { id: "taste", label: "Un assaggio piccolo, da investigatori", target: 5, dmg: 1, ok: "Era buono e onesto, per una volta.", fail: "Era un tranello dolce. Mal di cuore." },
        { id: "skip", label: "Digiuniamo con dignità e andiamo", target: 4, dmg: 1, ok: "La fame vi rende lucidi. Passate.", fail: "La fame vi rende goffi. Inciampo." }
      ]
    },
    {
      id: "c-keyhunt",
      kind: "explore",
      who: "two",
      title: "Caccia alla chiave",
      master: "Serve una chiave nascosta a {location}. {npc} ne ha vista una «più o meno lì». {villain} ne ha sparse di false.",
      secret: "Due cercano. Un tiro.",
      prompt: "Come cercate?",
      choices: [
        { id: "grid", label: "Setacciamo a griglia, da professionisti", target: 4, dmg: 1, ok: "Chiave vera. Fredda e onesta.", fail: "Chiave falsa. Scatta. Ahi." },
        { id: "luck", label: "Chiudiamo gli occhi e affondiamo una mano", target: 6, dmg: 1, ok: "Fortuna insolente. Chiave.", fail: "Mano in una trappola. Ovvio." }
      ]
    },
    {
      id: "c-wind",
      kind: "danger",
      who: "one",
      title: "Vento che spinge",
      master: "Un vento voluto da {villain} vi spinge verso il bordo di {location}. {npc} si è già attaccato a un palo.",
      secret: "Resistere o usarlo.",
      prompt: "Che fate col vento?",
      choices: [
        { id: "resist", label: "Ci ancoriamo e aspettiamo", target: 4, dmg: 1, ok: "Il vento si stufa.", fail: "Vi sposta. Un cuore di strattone." },
        { id: "ride", label: "Lo usiamo come spinta nella direzione giusta", target: 5, dmg: 1, ok: "Volo basso, atterraggio eroico.", fail: "Direzione sbagliata. Tonfo." }
      ]
    },
    {
      id: "c-promise",
      kind: "moral",
      who: "one",
      title: "Promessa lampo",
      master: "{npc} chiede una promessa a {location}: se la fate, vi aiuta contro {villain}. Se la rompete dopo, il posto si offende (ma questa è un'altra storia).",
      secret: "Fare la promessa è un tiro di serietà.",
      prompt: "Promettete?",
      choices: [
        { id: "yes", label: "Promettiamo, e lo pensiamo davvero", target: 4, dmg: 1, ok: "La promessa si siede accanto a voi. Aiuto ottenuto.", fail: "La voce trema. Promessa rifiutata. Un cuore di vergogna magica." },
        { id: "later", label: "Chiediamo di parlare dopo, da persone serie", target: 5, dmg: 1, ok: "{npc} rispetta la prudenza. Vi dà un aiuto piccolo.", fail: "Prudenza letta come no. Porta in faccia (metaforica, fa male)." }
      ]
    }
  ];

  C.climax = [
    {
      id: "x-confront",
      title: "Faccia a faccia",
      master: "Ecco {villain}, a {location}. Tiene {treasure} e ride di {questGoal}. {npc} è nascosto, pronto a un piccolo aiuto. È il momento.",
      secret: "Tira TUTTO il gruppo, uno alla volta. Serve almeno metà successi (arrotondati per eccesso). Chi fallisce perde cuori. Se restano zero vivi, l'avventura fallisce.",
      prompt: "Come affrontate {villain}?",
      choices: [
        { id: "brave", label: "Carica di coraggio, tutti insieme", target: 4, dmg: 1, ok: "Il coraggio fa breccia.", fail: "Il coraggio non basta, stavolta." },
        { id: "smart", label: "Un piano furbo dell'ultimo secondo", target: 5, dmg: 1, ok: "Il piano è ridicolo e funziona.", fail: "Il piano è ridicolo e basta." },
        { id: "heart", label: "Parliamo al pezzo che è ancora buono", target: 6, dmg: 1, ok: "Qualcosa in {villain} esita. Ne approfittate.", fail: "Nessun pezzo buono oggi. Colpo." }
      ]
    },
    {
      id: "x-steal",
      title: "Il colpo finale",
      master: "{villain} è distratto a {location}. {treasure} è lì. {npc} fa segno: ora o mai più. La missione ({questName}) si gioca qui.",
      secret: "Tiri di gruppo, metà successi per farcela.",
      prompt: "Come fate il colpo?",
      choices: [
        { id: "sneak", label: "Colpo silenzioso", target: 5, dmg: 1, ok: "Silenzio, oggetto, fuga.", fail: "Un rumore. {villain} si gira." },
        { id: "distract", label: "Uno distrae, gli altri prendono", target: 4, dmg: 1, ok: "La distrazione è un capolavoro.", fail: "La distrazione è un flop." },
        { id: "charge", label: "Entriamo di slancio, che sia quel che sia", target: 4, dmg: 2, ok: "Caos vittorioso.", fail: "Caos doloroso." }
      ]
    },
    {
      id: "x-break",
      title: "Spezzare il trucco",
      master: "Il potere di {villain} a {location} sta in un trucco visibile: un oggetto, un canto, un tappo. {npc} indica {treasure} come leva. La missione è {questName}.",
      secret: "Gruppo, metà successi.",
      prompt: "Come spezzate il trucco?",
      choices: [
        { id: "break", label: "Lo rompiamo di netto", target: 4, dmg: 1, ok: "Si spezza. {villain} perde il ritmo.", fail: "Non si spezza. Si vendica." },
        { id: "turn", label: "Lo giriamo contro {villain}", target: 5, dmg: 1, ok: "Schiaffo di ironia magica.", fail: "Rimbalza su di voi." },
        { id: "joke", label: "Lo rendiamo ridicolo, così smette di funzionare", target: 6, dmg: 1, ok: "Il ridicolo vince. Sempre, quasi.", fail: "Non era il tipo da ridicolo. Colpo." }
      ]
    }
  ];

  C.openings = [
    "La sera è appena partita quando {master} apre il quaderno. A {world} succede questo: {worldHook} La missione è chiara: {questName} — in pratica, recuperare {questGoal}. Chi si oppone è {villain}, che {villainStyle}. Con voi c'è {npc}, che {npcQuirk}.",
    "Un messaggio arriva storto, ma urgente. A {world} — {worldHook} — manca {questGoal}. Si chiama {questName}. Dietro il pasticcio c'è {villain}, che {villainStyle}. {npc} vi aspetta già sul ciglio della prima strada.",
    "Qualcuno ha messo {treasure} in mezzo al tavolo e ha detto: «Servirà». Poi è sparito. Resta {world}: {worldHook} Missione: {questName} ({questGoal}). Nemico: {villain}. Guida incerto: {npc}."
  ];

  C.winEndings = [
    "Ce l'avete fatta. {villain} è sconfitto, o almeno in ritirata con un cipiglio. {questGoal} è salvo. A {world} si torna a respirare. {npc} vi offre una merenda che sa di vittoria. I superstiti tornano a casa con {treasure} e una storia da raccontare a cena.",
    "Il piano, per quanto storto, ha funzionato. {questName} è compiuta. {villain} impara (forse) la lezione. {npc} applaude con le lacrime storte. {world} vi deve un favore.",
    "Non è stato pulito, ma è stato vero. {questGoal} è di nuovo al suo posto. {treasure} resta a voi, come medaglia. {villain} scappa borbottando. Famiglia 1, caos 0."
  ];

  C.failEndings = [
    "Tutti a terra, tutti fuori gioco. {villain} tiene {questGoal} e {world} resta storto. Non è la fine della famiglia: è la fine di QUESTA avventura. Si può sempre riprovare, un altro giorno, un altro racconto.",
    "Il coraggio c'è stato. La fortuna no. {npc} chiude gli occhi. {villain} vince il capitolo. L'avventura è fallita — e va bene: le storie vere hanno anche queste pagine.",
    "Silenzio su {location}. Nessuno resta in piedi. {questName} resta incompiuta. {world} aspetterà un'altra compagnia. Per oggi, sconfitta."
  ];

  C.fleeEndings = [
    "Non avete vinto pulito: siete scappati con i cuori che restavano. {questGoal} è ancora in ballo, ma siete vivi. {npc} vi fa cenno: «Si torna. Un altro giorno.» {world} resta in sospeso.",
    "{villain} tiene campo, voi tenete la pelle. È una ritirata, non una vergogna. {treasure} è perso per ora. La famiglia, no."
  ];

  C.deathLines = [
    "{name} cade fuori dalla storia: petrificato in una posa eroica, per ora.",
    "{name} viene avvolto da una nebbia da capitolo chiuso. Fuori gioco.",
    "{name} sprofonda in un sonno magico troppo fondo. Per questa avventura, basta.",
    "{name} resta impigliato in una trappola di {villain}. Fuori dal gruppo.",
    "{name} si dissolve in stelline arrabbiate. Tornerà a cena, non in questa missione."
  ];

  root.AF_CONTENT = C;
})(typeof window !== "undefined" ? window : globalThis);
