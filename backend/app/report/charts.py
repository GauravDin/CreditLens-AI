"""matplotlib chart generators — return BytesIO PNG objects for embedding."""
from __future__ import annotations
import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np
    _OK = True
except ImportError:
    _OK = False
    logger.warning("matplotlib not installed — charts disabled.")

_BLUE   = "#1E4D8C"
_LIGHT  = "#4A90D9"
_GREEN  = "#27AE60"
_ORANGE = "#E67E22"
_RED    = "#C0392B"
_GREY   = "#7F8C8D"
_BG     = "#FAFAFA"


def _save(fig) -> io.BytesIO:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
    buf.seek(0)
    plt.close(fig)
    return buf


def revenue_trend(f: dict) -> Optional[io.BytesIO]:
    if not _OK or f.get("revenue") is None:
        return None
    rev, revp, op = f.get("revenue"), f.get("revenue_prev"), f.get("operating_profit", 0) or 0
    fy  = f.get("fiscal_year", "Current")
    labels   = (["Prior Year", fy] if revp else [fy])
    rev_vals = ([revp or 0, rev] if revp else [rev])
    op_vals  = ([0, op] if revp else [op])

    fig, ax = plt.subplots(figsize=(7, 3.5), facecolor=_BG)
    ax.set_facecolor(_BG)
    x, w = range(len(labels)), 0.35
    b1 = ax.bar([i - w/2 for i in x], rev_vals, w, label="Revenue",         color=_BLUE,  alpha=.88, edgecolor="white")
    b2 = ax.bar([i + w/2 for i in x], op_vals,  w, label="Operating Profit", color=_GREEN, alpha=.88, edgecolor="white")
    for b, c in [(b1, _BLUE), (b2, _GREEN)]:
        for bar in b:
            h = bar.get_height()
            if h > 0:
                ax.text(bar.get_x() + bar.get_width()/2, h*1.01, f"{h:,.0f}",
                        ha="center", va="bottom", fontsize=8, color=c)
    ax.set_ylabel(f"{f.get('currency','')} ({f.get('unit','')})", fontsize=9)
    ax.set_xticks(list(x)); ax.set_xticklabels(labels, fontsize=9)
    ax.set_title("Revenue & Operating Profit Trend", fontsize=11, fontweight="bold", color=_BLUE, pad=10)
    ax.legend(fontsize=8)
    ax.spines["top"].set_visible(False); ax.spines["right"].set_visible(False)
    ax.grid(axis="y", linestyle="--", alpha=.4)
    fig.tight_layout()
    return _save(fig)


def score_breakdown(bd: dict, total: float, rating: str) -> Optional[io.BytesIO]:
    if not _OK:
        return None
    cats   = list(bd.keys())
    scores = [bd.get(c, 0) for c in cats]
    maxes  = {"profitability":30,"leverage":25,"liquidity":20,"growth":15,"qualitative":10}
    colours= [_BLUE, _LIGHT, _GREEN, _ORANGE, _GREY]
    fig, ax = plt.subplots(figsize=(7, 3.2), facecolor=_BG)
    ax.set_facecolor(_BG)
    left = 0
    for cat, sc, col in zip(cats, scores, colours):
        ax.barh(0, sc, left=left, color=col, alpha=.9, height=.5,
                label=f"{cat.title()} ({sc}/{maxes.get(cat,'?')})")
        ax.text(left + sc/2, 0, f"{sc}", ha="center", va="center",
                fontsize=9, fontweight="bold", color="white")
        left += sc
    bc = _GREEN if total >= 70 else (_ORANGE if total >= 55 else _RED)
    ax.text(1.01, .5, f"{total:.0f}\n{rating}", transform=ax.transAxes,
            ha="left", va="center", fontsize=14, fontweight="bold", color=bc)
    ax.set_xlim(0, 100); ax.set_yticks([])
    ax.set_xlabel("Score (0–100)", fontsize=9)
    ax.set_title("Credit Score Breakdown", fontsize=11, fontweight="bold", color=_BLUE, pad=10)
    ax.legend(loc="lower right", fontsize=7, ncol=3)
    ax.spines["top"].set_visible(False); ax.spines["right"].set_visible(False); ax.spines["left"].set_visible(False)
    ax.axvline(x=total, color=bc, linewidth=1.5, linestyle="--", alpha=.6)
    fig.tight_layout()
    return _save(fig)


def ratio_dashboard(f: dict) -> Optional[io.BytesIO]:
    if not _OK:
        return None
    rows = [
        ("Current Ratio",     f.get("current_ratio"),    2.0, "×"),
        ("Quick Ratio",       f.get("quick_ratio"),       1.0, "×"),
        ("Equity Ratio",      f.get("equity_ratio"),     60.0, "%"),
        ("ROE",               f.get("roe"),               15.0, "%"),
        ("Operating Margin",  f.get("operating_margin"),  15.0, "%"),
        ("Interest Coverage", f.get("interest_coverage"),  3.0, "×"),
        ("DSCR",              f.get("dscr"),               1.5, "×"),
    ]
    avail = [(l, v, b, u) for l, v, b, u in rows if v is not None]
    if not avail:
        return None
    labels = [r[0] for r in avail]; values = [r[1] for r in avail]
    benchm = [r[2] for r in avail]; units  = [r[3] for r in avail]
    norm   = [min(v/b*100 if b else 0, 180) for v, b in zip(values, benchm)]
    colours= [_GREEN if n >= 100 else (_ORANGE if n >= 70 else _RED) for n in norm]
    fig, ax = plt.subplots(figsize=(7, .55*len(avail)+1.5), facecolor=_BG)
    ax.set_facecolor(_BG)
    bars = ax.barh(range(len(avail)), norm, color=colours, alpha=.85, edgecolor="white", height=.55)
    for i, (bar, val, unit) in enumerate(zip(bars, values, units)):
        ax.text(bar.get_width()+2, i, f"{val:.2f}{unit}", va="center", fontsize=8.5)
    ax.axvline(x=100, color=_GREY, linewidth=1.2, linestyle="--", alpha=.7)
    ax.set_yticks(range(len(avail))); ax.set_yticklabels(labels, fontsize=9)
    ax.set_xlim(0, 200); ax.set_xlabel("% of Benchmark", fontsize=9)
    ax.set_title("Key Ratios vs Benchmarks", fontsize=11, fontweight="bold", color=_BLUE, pad=10)
    ax.spines["top"].set_visible(False); ax.spines["right"].set_visible(False)
    ax.grid(axis="x", linestyle="--", alpha=.3)
    fig.tight_layout()
    return _save(fig)