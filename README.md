# Adventure Family

Portale di avventure **GDR per famiglie**. Ogni volta che apri una nuova storia, il gioco pesca elementi mai usati e costruisce un’avventura da circa mezz’ora.

Repo dedicato: [sarlokko/Adventure-family](https://github.com/sarlokko/Adventure-family)

Se stai guardando questo codice su `sarlok`, è solo il bootstrap: **non mergiare su main**. Copia i file nel repo `Adventure-family` (o apri un Cloud Agent su quel repo).

## Come si gioca

1. Un adulto (o chi se la sente) è il **master**: legge il quaderno, tiene i segreti, fa volare la storia.
2. Gli altri sono i **giocatori** (da 1 a 6). All’inizio si sceglie quanti sono e i nomi.
3. Si passa il telefono/tablet: vista Master e vista Giocatori.
4. Le prove si risolvono con un **dado a 6 facce**. Serve un punteggio minimo (4+, 5+ o 6). Se fallisci perdi cuori.
5. A **0 cuori** il personaggio è fuori gioco (nella storia “muore” in modo da fiaba, non cruento).
6. Se **cadono tutti**, l’avventura **fallisce**.

Se c’è una storia in sospeso, all’apertura puoi **continuare** o **iniziarne una nuova** (quella vecchia viene abbandonata e i suoi elementi restano usati, così la nuova è comunque diversa).

## Sempre diversa

Ogni avventura combina mondo, missione, nemico, tesoro, personaggio guida, ruoli, luoghi e prove **non ancora usati**. Quando un mazzo finisce, si rimescola da solo: le combinazioni restano nuove.

## Avvio locale

Apri `index.html` nel browser, oppure:

```
python3 -m http.server 8080
```

Poi vai su `http://localhost:8080`.

## GitHub Pages

In **Settings → Pages** del repo `Adventure-family`, pubblica il branch `main` dalla cartella `/`.

Tutto resta nel browser (`localStorage`): niente account, niente server.
