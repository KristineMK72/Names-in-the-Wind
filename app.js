// app.js
// Names in the Wind — interactive tribute grid (no frameworks)

(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const DATA = (window.NITW && Array.isArray(window.NITW.cases)) ? window.NITW.cases : [];

  // ---------- Utilities ----------
  const norm = (s) => (s || "").toString().trim();
  const lower = (s) => norm(s).toLowerCase();

  function safeYear(y) {
    const n = Number(y);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function badgeClass(status) {
    const s = lower(status);
    if (s.includes("missing")) return "badge badge--missing";
    if (s.includes("homicide") || s.includes("murder")) return "badge badge--homicide";
    if (s.includes("found")) return "badge badge--found";
    return "badge";
  }

  function csvEscape(v) {
    const s = (v == null) ? "" : String(v);
    return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  }

  function downloadCSV(rows, filename) {
    const header = ["id","name","tribe","identity","status","year","location","sourceName","sourceUrl","note"];
    const lines = [header.map(csvEscape).join(",")];

    for (const r of rows) {
      lines.push([
        r.id, r.name, r.tribe, r.identity, r.status, r.year, r.location, r.sourceName, r.sourceUrl, r.note
      ].map(csvEscape).join(","));
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ---------- Elements ----------
  const elCards = $("#cards");
  const elQ = $("#q");
  const elStatus = $("#status");
  const elIdentity = $("#identity");
  const elYear = $("#year");

  const statCases = $("#statCases");
  const statMissing = $("#statMissing");
  const statHomicide = $("#statHomicide");
  const statFound = $("#statFound");

  const modal = $("#modal");
  const modalTitle = $("#modalTitle");
  const modalBody = $("#modalBody");

  // ---------- Filters ----------
  function buildYearOptions() {
    if (!elYear) return;

    const years = new Set();
    for (const c of DATA) {
      const y = safeYear(c.year);
      if (y) years.add(y);
    }
    const sorted = Array.from(years).sort((a, b) => b - a);

    // keep first option ("all"), then add unique years
    for (const y of sorted) {
      const opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      elYear.appendChild(opt);
    }
  }

  function matchesFilters(c) {
    const q = lower(elQ ? elQ.value : "");
    const status = elStatus ? elStatus.value : "all";
    const identity = elIdentity ? elIdentity.value : "all";
    const year = elYear ? elYear.value : "all";

    if (status !== "all" && norm(c.status) !== status) return false;
    if (identity !== "all" && norm(c.identity) !== identity) return false;

    if (year !== "all") {
      const y = safeYear(c.year);
      if (!y || String(y) !== year) return false;
    }

    if (!q) return true;

    const hay = [
      c.name, c.tribe, c.identity, c.status, c.location, c.sourceName, c.note
    ].map(lower).join(" • ");

    return hay.includes(q);
  }

  function filtered() {
    return DATA.filter(matchesFilters);
  }

  // ---------- Stats ----------
  function updateStats(rows) {
    const total = rows.length;

    let missing = 0, homicide = 0, found = 0;
    for (const r of rows) {
      const s = lower(r.status);
      if (s.includes("missing")) missing++;
      else if (s.includes("homicide") || s.includes("murder")) homicide++;
      else if (s.includes("found")) found++;
    }

    if (statCases) statCases.textContent = String(total);
    if (statMissing) statMissing.textContent = String(missing);
    if (statHomicide) statHomicide.textContent = String(homicide);
    if (statFound) statFound.textContent = String(found);
  }

  // ---------- Rendering ----------
  function cardHTML(c) {
    const y = safeYear(c.year);
    const metaParts = [];
    if (norm(c.tribe)) metaParts.push(c.tribe);
    if (norm(c.location)) metaParts.push(c.location);
    if (y) metaParts.push(String(y));

    return `
      <article class="cardCase" role="button" tabindex="0" data-id="${c.id}">
        <div class="cardCase__top">
          <div class="cardCase__name">${norm(c.name) || "Unknown"}</div>
          <div class="${badgeClass(c.status)}">${norm(c.status) || "Unknown"}</div>
        </div>

        <div class="cardCase__meta">${metaParts.join(" • ") || "—"}</div>

        <div class="cardCase__note">
          ${(norm(c.note) || "—").slice(0, 220)}${(norm(c.note).length > 220) ? "…" : ""}
        </div>

        <div class="cardCase__src">
          Source: <a href="${norm(c.sourceUrl) || "#"}" target="_blank" rel="noopener">${norm(c.sourceName) || "View"}</a>
        </div>
      </article>
    `;
  }

  function render(rows) {
    if (!elCards) return;

    if (!rows.length) {
      elCards.innerHTML = `
        <div class="panel" style="grid-column: 1 / -1;">
          <h3>No matches</h3>
          <p class="muted">Try adjusting filters or search terms.</p>
        </div>
      `;
      return;
    }

    elCards.innerHTML = rows.map(cardHTML).join("");
  }

  // ---------- Modal ----------
  function openModal(c) {
    if (!modal) return;

    const y = safeYear(c.year);
    const parts = [];
    if (norm(c.tribe)) parts.push(`<div><strong>Nation/Tribe:</strong> ${norm(c.tribe)}</div>`);
    if (norm(c.identity)) parts.push(`<div><strong>Identity:</strong> ${norm(c.identity)}</div>`);
    if (norm(c.status)) parts.push(`<div><strong>Status:</strong> ${norm(c.status)}</div>`);
    if (y) parts.push(`<div><strong>Year:</strong> ${y}</div>`);
    if (norm(c.location)) parts.push(`<div><strong>Location:</strong> ${norm(c.location)}</div>`);

    modalTitle.textContent = norm(c.name) || "Case details";
    modalBody.innerHTML = `
      <div class="panel" style="box-shadow:none; background: rgba(255,255,255,.03);">
        ${parts.join("")}
      </div>

      <div style="height: 10px;"></div>

      <div class="panel" style="box-shadow:none; background: rgba(0,0,0,.22);">
        <h3 style="margin-bottom:8px;">Context</h3>
        <div class="muted" style="white-space: pre-wrap;">${norm(c.note) || "—"}</div>
      </div>

      <div style="height: 10px;"></div>

      <div class="panel" style="box-shadow:none; background: rgba(0,0,0,.22);">
        <h3 style="margin-bottom:8px;">Source</h3>
        <a class="inlineLink" href="${norm(c.sourceUrl) || "#"}" target="_blank" rel="noopener">
          ${norm(c.sourceName) || "Open source"}
        </a>
      </div>
    `;

    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
  }

  function findById(id) {
    return DATA.find((c) => c.id === id) || null;
  }

  // ---------- Actions ----------
  function updateAll() {
    const rows = filtered();
    updateStats(rows);
    render(rows);
  }

  function wireEvents() {
    // filters
    [elQ, elStatus, elIdentity, elYear].forEach((el) => {
      if (!el) return;
      el.addEventListener("input", updateAll);
      el.addEventListener("change", updateAll);
    });

    // card click / enter key
    document.addEventListener("click", (e) => {
      const card = e.target.closest && e.target.closest(".cardCase");
      if (!card) return;
      const id = card.getAttribute("data-id");
      const c = findById(id);
      if (c) openModal(c);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();

      const active = document.activeElement;
      if (e.key === "Enter" && active && active.classList && active.classList.contains("cardCase")) {
        const id = active.getAttribute("data-id");
        const c = findById(id);
        if (c) openModal(c);
      }
    });

    // modal close
    if (modal) {
      modal.addEventListener("click", (e) => {
        const close = e.target.getAttribute && e.target.getAttribute("data-close");
        if (close) closeModal();
      });
    }

    // download filtered CSV
    const dl = $("#downloadBtn");
    if (dl) {
      dl.addEventListener("click", () => {
        const rows = filtered();
        downloadCSV(rows, "names-in-the-wind_filtered.csv");
      });
    }

    // share link
    const share = $("#shareBtn");
    if (share) {
      share.addEventListener("click", async () => {
        const url = window.location.href;
        try {
          await navigator.clipboard.writeText(url);
          share.textContent = "Link copied";
          setTimeout(() => (share.textContent = "Copy share link"), 1400);
        } catch {
          // fallback
          const ta = document.createElement("textarea");
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
          share.textContent = "Link copied";
          setTimeout(() => (share.textContent = "Copy share link"), 1400);
        }
      });
    }

    // contribute button (optional)
    const contribute = $("#contributeBtn");
    if (contribute) {
      contribute.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "https://github.com/";
      });
    }
  }

  // ---------- Boot ----------
  function boot() {
    buildYearOptions();
    wireEvents();
    updateAll();
  }

  // Wait until cases.js is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
