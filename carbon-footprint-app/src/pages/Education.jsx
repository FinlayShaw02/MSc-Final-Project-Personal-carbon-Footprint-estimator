/**
 * ============================================================
 *  File: Education.jsx
 *  Component: Education
 *
 *  Description:
 *  An educational page presenting evidence-based “Did you know?” tips across
 *  key themes (Transport, Home energy, Food, Methods and data). Each section
 *  shows concise facts, impact context and source links.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useMemo, useState } from "react";

/* ---------- tiny UI bits ---------- */
// Small pill like label with themed color tones
function Badge({ children, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary border-primary/30",
    success:
      "bg-[rgb(var(--success-bg))] text-[rgb(var(--success-fg))] border-[rgb(var(--success-fg))]/25",
    warn: "bg-amber-500/15 text-amber-400 border-amber-400/30",
    info: "bg-surfaceVariant text-fg border-border",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// Segmented control style button for tab switching
function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-sm transition ${
        active
          ? "bg-primary text-primaryContrast border-transparent shadow-subtle"
          : "bg-surfaceVariant border-border hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

// Simple card wrapper with icon, title, body and optional footer
function Card({ icon, title, children, footer }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-subtle h-full">
      <div className="flex items-start gap-3">
        <div className="shrink-0 grid place-items-center w-10 h-10 rounded-xl border border-border bg-surfaceVariant text-lg">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-fg">{title}</h3>
          <div className="mt-1 text-sm text-fg/90 space-y-2">{children}</div>
        </div>
      </div>
      {footer && <div className="mt-3">{footer}</div>}
    </article>
  );
}

/* ---------- educational did-you-know style data ---------- */
// Static content model for tabs -> tips -> references
const SECTIONS = [
  {
    key: "transport",
    label: "Transport",
    icon: "🚲",
    impact: "High",
    tips: [
      {
        icon: "🚗",
        title: "Did you know? Electric vs petrol cars",
        bullets: [
          "Did you know using an electric vehicle in the UK produces around two thirds fewer emissions per kilometre than a petrol car (DEFRA, 2025)?",
          "The gap will grow as the electricity grid adds more renewable energy.",
        ],
        refs: ["DEFRA2025"],
      },
      {
        icon: "🚌",
        title: "Did you know? Public transport",
        bullets: [
          "A full double decker bus can replace up to 75 cars on the road, cutting congestion and emissions per passenger (DfT, 2025).",
          "Rail travel per passenger-km emits much less than driving alone.",
        ],
        refs: ["LTQG2025"],
      },
    ],
  },
  {
    key: "home",
    label: "Home energy",
    icon: "🏠",
    impact: "High",
    tips: [
      {
        icon: "💡",
        title: "Did you know? LEDs vs halogens",
        bullets: [
          "LED bulbs use up to 80% less electricity than halogen bulbs. Over a year, replacing 10 halogens can save enough electricity to run a fridge for months.",
        ],
        refs: ["DEFRA2025"],
      },
      {
        icon: "🚿",
        title: "Did you know? Shower flow",
        bullets: [
          "A typical UK shower uses 10-15 litres of water per minute. Cutting flow to 6 L/min can halve water heating energy needs (Waterwise).",
        ],
        refs: ["WATERWISE", "GBS2015"],
      },
      {
        icon: "🔥",
        title: "Did you know? Heating and temperature",
        bullets: [
          "Turning your thermostat down by 1 °C can reduce heating emissions by around 10% (DEFRA factors).",
        ],
        refs: ["DEFRA2025"],
      },
    ],
  },
  {
    key: "food",
    label: "Food",
    icon: "🥗",
    impact: "Medium",
    tips: [
      {
        icon: "🥩",
        title: "Did you know? Beef vs beans",
        bullets: [
          "Producing 100 g of beef protein creates over 25 times more emissions than 100 g of bean protein (Clark et al., 2022).",
        ],
        refs: ["CLARK2022", "OWID2022"],
      },
      {
        icon: "🗑️",
        title: "Did you know? Food waste",
        bullets: [
          "UK households throw away nearly 70 kg of food per person each year, wasting money and causing avoidable emissions.",
        ],
        refs: [],
      },
    ],
  },
  {
    key: "methods",
    label: "Methods & data sources",
    icon: "📏",
    impact: "Method",
    tips: [
      {
        icon: "🧮",
        title: "How we calculate",
        bullets: [
          "We multiply your activity data (miles driven, kWh used, portions eaten) by published emission factors (DEFRA 2025, Clark et al. 2022, OWID 2022).",
          "Public transport and food categories use per-passenger and per-product averages.",
        ],
        refs: ["DEFRA2025", "CLARK2022", "OWID2022"],
      },
      {
        icon: "🔧",
        title: "Our process",
        bullets: [
          "We update when official UK factors change and use agile practices to improve accuracy and transparency.",
        ],
        refs: ["AGILE"],
      },
    ],
  },
];

// Reference metadata used to render source links/tooltips
const SOURCES = {
  DEFRA2025: {
    label:
      "DEFRA (2025). UK Government greenhouse gas conversion factors for company reporting 2025.",
    urls: [
      "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025",
    ],
  },
  LTQG2025: {
    label:
      "Department for Transport (2025). Local Transport Quantifiable Carbon Guidance.",
    urls: [
      "https://assets.publishing.service.gov.uk/media/68af13a12f185664821558c7/local-transport-quantifiable-carbon-guidance.pdf",
    ],
  },
  WATERWISE: {
    label:
      "Waterwise (UK). Typical shower flows 10–15 L/min; efficient 6 L/min.",
    urls: ["https://waterwise.org.uk/how-to-save-water/"],
  },
  GBS2015: {
    label:
      "UK Government Buying Standards: showers/taps (2015). European Water Label 6 L/min for efficient showers.",
    urls: [
      "https://assets.publishing.service.gov.uk/media/5a807d8ded915d74e622ec1a/gbs-taps-automatic-sprays-showers-urinal-2015.pdf",
    ],
  },
  CLARK2022: {
    label:
      "Clark, et al. (2022) Estimating the environmental impacts of 57,000 food products. PNAS 119(33): e2120584119.",
    urls: ["https://doi.org/10.1073/pnas.2120584119"],
  },
  OWID2022: {
    label:
      "Our World in Data (2022). Environmental impacts of food (Clark et al. 2022) dataset",
    urls: ["https://ourworldindata.org/environmental-impacts-of-food"],
  },
  AGILE: {
    label:
      "Agile Alliance (n.d.). What is Agile Software Development?",
    urls: ["https://agilealliance.org/agile101/"],
  },
};

/* ---------- helpers ---------- */
// Extract a clean host name for display from a URL
function host(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}

/* ---------- page ---------- */
export default function Education() {
  // Active tab key 
  const [tab, setTab] = useState("transport");

  // Currently selected section object
  const section = useMemo(() => SECTIONS.find((s) => s.key === tab), [tab]);

  // Set of reference IDs used by the active tabs tips 
  const currentRefIds = useMemo(() => {
    const ids = [];
    section.tips.forEach((t) =>
      (t.refs || []).forEach((r) => {
        if (!ids.includes(r)) ids.push(r);
      })
    );
    return ids;
  }, [section]);

  return (
    <div className="p-4 text-fg max-w-5xl mx-auto">
      {/* Page header with context badges */}
      <header className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">Did you know?</h1>
        <Badge tone="info">Evidence based facts</Badge>
        <div className="ml-auto flex items-center gap-2">
          <Badge tone={section.impact === "High" ? "warn" : "primary"}>
            Focus: {section.label}
          </Badge>
        </div>
      </header>

      {/* Tab controls */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SECTIONS.map((s) => (
          <Pill key={s.key} active={tab === s.key} onClick={() => setTab(s.key)}>
            <span className="mr-1">{s.icon}</span>
            {s.label}
          </Pill>
        ))}
      </div>

      {/* Cards grid for facts/tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {section.tips.map((t, i) => (
          <Card
            key={i}
            icon={t.icon}
            title={t.title}
            footer={
              t.refs?.length ? (
                // Inline source chips/links for the card
                <div className="mt-2">
                  {t.refs.map((r) => {
                    const src = SOURCES[r];
                    if (!src) return null;
                    const firstUrl = src.urls?.[0];
                    return firstUrl ? (
                      <a
                        key={r}
                        href={firstUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline text-xs mr-2"
                        title={src.label}
                      >
                        [{r}] {host(firstUrl)}
                      </a>
                    ) : (
                      <span key={r} className="text-xs mr-2" title={src.label}>
                        [{r}] (no external link)
                      </span>
                    );
                  })}
                </div>
              ) : null
            }
          >
            <ul className="list-disc ml-5 space-y-1">
              {t.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Collapsible full references section for the active tab */}
      {currentRefIds.length > 0 && (
        <details className="mt-6 rounded-2xl border border-border bg-surface p-4 open:shadow-subtle">
          <summary className="cursor-pointer font-semibold">
            Sources for “{section.label}”
          </summary>
          <ul className="text-xs space-y-3 mt-3">
            {currentRefIds.map((id) => {
              const s = SOURCES[id];
              if (!s) return null;
              return (
                <li key={id} className="break-words">
                  <span className="font-medium mr-1">[{id}]</span>
                  <span>{s.label}</span>
                  {s.urls?.length ? (
                    <ul className="ml-5 list-disc">
                      {s.urls.map((u, i) => (
                        <li key={i}>
                          <a
                            href={u}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                            title={u}
                          >
                            {host(u)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-muted mt-3">
            These did you know facts are drawn from UK Government conversion factors, peer reviewed food footprint studies and water efficiency standards. Values vary depending on home, vehicle and diet.
          </p>
        </details>
      )}
    </div>
  );
}
