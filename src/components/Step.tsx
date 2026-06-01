import { useEffect, useState, type KeyboardEvent } from "react";
import { Calendar } from "primereact/calendar";
import { Steps } from "primereact/steps";
import type { MenuItem } from "primereact/menuitem";

type StoredSession = {
  activeIndex: number;
  date: string | null;
  time: string;
  activity: string;
};

const STORAGE_KEY = "apology-step-session-v2";

const TIME_OPTIONS = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00",
];

const ACTIVITY_OPTIONS = [
  { label: "Cafe Hangout", emoji: "☕" },
  { label: "Movie Time", emoji: "🎬" },
  { label: "Gaming", emoji: "🎮" },
  { label: "Dining Out", emoji: "🍜" },
];

const readStoredSession = (): StoredSession | null => {
  if (typeof globalThis === "undefined") {
    return null;
  }

  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    const safeActiveIndex =
      typeof parsed.activeIndex === "number" && Number.isInteger(parsed.activeIndex)
      ? Math.min(4, Math.max(0, parsed.activeIndex))
      : 0;

    return {
      activeIndex: safeActiveIndex,
      date: typeof parsed.date === "string" ? parsed.date : null,
      time: typeof parsed.time === "string" ? parsed.time : "",
      activity: typeof parsed.activity === "string" ? parsed.activity : "",
    };
  } catch {
    return null;
  }
};

export default function StepComponent() {
  const [initialSession] = useState<StoredSession | null>(() => readStoredSession());
  const [activeIndex, setActiveIndex] = useState(initialSession?.activeIndex ?? 0);
  const [date, setDate] = useState<Date | null>(() => {
    if (!initialSession?.date) {
      return null;
    }
    const parsedDate = new Date(initialSession.date);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  });
  const [time, setTime] = useState(initialSession?.time ?? "");
  const [activity, setActivity] = useState(initialSession?.activity ?? "");
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const payload: StoredSession = {
      activeIndex,
      date: date ? date.toISOString() : null,
      time,
      activity,
    };

    try {
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage write errors (private mode / quota exceeded).
    }
  }, [activeIndex, date, time, activity]);

  const getRandomOffset = (xRange: number, yRange: number) => {
    const randomX = Math.floor(Math.random() * (xRange * 2 + 1)) - xRange;
    const randomY = Math.floor(Math.random() * (yRange * 2 + 1)) - yRange;
    return { x: randomX, y: randomY };
  };

  const moveNoButton = () => {
    setNoOffset(getRandomOffset(120, 40));
  };

  const itemRenderer = (item: MenuItem, itemIndex: number) => {
    const isActiveItem = activeIndex === itemIndex;
    const canNavigate = itemIndex <= activeIndex;

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === "Enter" || e.key === " ") && canNavigate) {
        e.preventDefault();
        setActiveIndex(itemIndex);
      }
    };

    return (
      <button
        type="button"
        className={`step-node ${isActiveItem ? "is-active" : ""} ${
          canNavigate ? "" : "is-locked"
        }`}
        onClick={() => {
          if (canNavigate) {
            setActiveIndex(itemIndex);
          }
        }}
        onKeyDown={handleKeyDown}
        aria-disabled={!canNavigate}
      >
        <i className={`${item.icon} text-xl`} />
      </button>
    );
  };

  const items: MenuItem[] = [
    {
      label: "Step 1",
      icon: "pi pi-heart-fill",
      template: (item: MenuItem) => itemRenderer(item, 0),
    },
    {
      label: "Step 2",
      icon: "pi pi-heart-fill",
      template: (item: MenuItem) => itemRenderer(item, 1),
    },
    {
      label: "Step 3",
      icon: "pi pi-heart-fill",
      template: (item: MenuItem) => itemRenderer(item, 2),
    },
    {
      label: "Step 4",
      icon: "pi pi-heart-fill",
      template: (item: MenuItem) => itemRenderer(item, 3),
    },
    {
      label: "Step 5",
      icon: "pi pi-heart-fill",
      template: (item: MenuItem) => itemRenderer(item, 4),
    },
  ];

  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Not selected";
  const timeSuffix = time ? ` at ${time}` : "";
  const formattedDateTime = date ? formattedDate + timeSuffix : "Not selected";
  const formattedActivity = activity || "Not entered";

  const renderStepContent = () => {
    if (activeIndex === 0) {
      return (
        <section className="step-panel fade-in">
          <p className="step-kicker">Step 1</p>
          <h2 className="step-title">I'm sorry</h2>
          <p className="step-copy">Can you give me a chance to make it up to you?</p>
          <div className="action-row">
            <button
              type="button"
              className="cute-btn cute-btn-primary"
              onClick={() => setActiveIndex(1)}
            >
              Yes
            </button>
            <button
              type="button"
              className="cute-btn cute-btn-ghost no-runaway"
              onMouseEnter={moveNoButton}
              onFocus={moveNoButton}
              onTouchStart={moveNoButton}
              onClick={moveNoButton}
              style={{ transform: `translate(${noOffset.x}px, ${noOffset.y}px)` }}
            >
              No
            </button>
          </div>
        </section>
      );
    }

    if (activeIndex === 1) {
      return (
        <section className="step-panel fade-in">
          <p className="step-kicker">Step 2</p>
          <h2 className="step-title">Oh, You said yes! Thank you.</h2>
          <p className="step-copy">Let me take you out and make it up to you.</p>
          <button
            type="button"
            className="cute-btn cute-btn-primary"
            onClick={() => setActiveIndex(2)}
          >
            OK
          </button>
        </section>
      );
    }

    if (activeIndex === 2) {
      return (
        <section className="step-panel fade-in">
          <p className="step-kicker">Step 3</p>
          <h2 className="step-title">Pick a date</h2>
          <div className="form-grid">
            <div className="field-wrap">
              <label htmlFor="date" className="field-label">
                Date
              </label>
              <Calendar
                id="date"
                value={date}
                onChange={(e) =>
                  setDate(e.value instanceof Date ? e.value : null)
                }
                showIcon
                placeholder="Select a date"
                className="field-calendar"
                inputClassName="field-input"
                hideOnDateTimeSelect
              />
            </div>
            <div className="field-wrap">
              <label htmlFor="time" className="field-label">
                Time
              </label>
              <select
                id="time"
                className="field-input field-select"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">-- Select a time --</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="cute-btn cute-btn-primary"
              onClick={() => setActiveIndex(3)}
              disabled={date === null || !time}
            >
              Next
            </button>
          </div>
        </section>
      );
    }

    if (activeIndex === 3) {
      return (
        <section className="step-panel fade-in">
          <p className="step-kicker">Step 4</p>
          <h2 className="step-title">What would you like to do?</h2>
          <p className="step-copy">Pick an activity you'd enjoy.</p>
          <div className="activity-grid">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className={`activity-card${activity === opt.label ? " activity-card-active" : ""}`}
                onClick={() => {
                  setActivity(opt.label);
                  setActiveIndex(4);
                }}
              >
                <span className="activity-emoji">{opt.emoji}</span>
                <span className="activity-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="step-panel fade-in">
        <p className="step-kicker">Step 5</p>
        <h2 className="step-title">Our plan</h2>
        <p className="summary-line">
          <strong>Time:</strong> {formattedDateTime}
        </p>
        <p className="summary-line">
          <strong>Activity:</strong> {formattedActivity}
        </p>
      </section>
    );
  };

  return (
    <div className="apology-page">
      <div className="bg-orb bg-orb-left" />
      <div className="bg-orb bg-orb-right" />
      <span className="float-heart float-heart-a" aria-hidden="true" />
      <span className="float-heart float-heart-b" aria-hidden="true" />
      <span className="float-heart float-heart-c" aria-hidden="true" />
      <div className="step-shell">
        <div className="shell-tag">For someone special</div>
        <Steps
          model={items}
          activeIndex={activeIndex}
          readOnly={false}
          className="custom-steps"
        />
        {renderStepContent()}
      </div>
    </div>
  );
}
