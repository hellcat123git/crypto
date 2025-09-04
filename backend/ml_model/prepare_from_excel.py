#!/usr/bin/env python3
"""
Convert the provided India dataset Excel file into the CSV format expected by train.py.
Expected output columns: fuel_price, traffic_index, demand_level, price_multiplier
"""

import pandas as pd
import numpy as np
from pathlib import Path


def _pick_column(frame: pd.DataFrame, candidates: set[str]) -> str:
    """Return the first matching column name (case-insensitive, trimmed)."""
    normalized_to_actual: dict[str, str] = {c.lower().strip(): c for c in frame.columns}
    for candidate in candidates:
        if candidate in normalized_to_actual:
            return normalized_to_actual[candidate]
    raise KeyError(f"Missing expected columns. Tried: {sorted(candidates)}. Available: {list(frame.columns)}")


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]
    excel_path = project_root / "india_weather_traffic_fuel_50k.xlsx"
    out_csv = Path(__file__).resolve().parent / "training_data.csv"

    if not excel_path.exists():
        raise FileNotFoundError(f"Excel file not found at {excel_path}")

    df = pd.read_excel(excel_path)

    # Identify columns flexibly
    fuel_col = _pick_column(
        df,
        {
            "fuel_price",
            "fuel",
            "fuelprice",
            "fuel_cost",
            "petrol_price",
            "petrol",
        },
    )
    traffic_col = _pick_column(
        df,
        {"traffic_index", "traffic", "trafficindex", "congestion"},
    )
    demand_col = _pick_column(
        df,
        {"demand_level", "demand", "demandindex", "demand_score"},
    )

    # Optional existing multiplier
    multiplier_col: str | None = None
    for c in df.columns:
        if c.lower().strip() in {"price_multiplier", "multiplier", "price_factor"}:
            multiplier_col = c
            break

    # Coerce and clean
    fuel = pd.to_numeric(df[fuel_col], errors="coerce")
    traffic = pd.to_numeric(df[traffic_col], errors="coerce")
    demand = pd.to_numeric(df[demand_col], errors="coerce")

    mask = fuel.notna() & traffic.notna() & demand.notna()
    if mask.sum() == 0:
        raise ValueError("No valid rows after parsing numeric columns for fuel/traffic/demand")

    fuel = fuel[mask]
    traffic = traffic[mask]
    demand = demand[mask]
    df = df.loc[mask].copy()

    # Clip to the model's expected ranges
    fuel = fuel.clip(lower=1.0, upper=3.0)
    traffic = traffic.clip(lower=1).clip(upper=10).round()
    demand = demand.clip(lower=1).clip(upper=10).round()

    if multiplier_col is not None:
        multiplier = pd.to_numeric(df[multiplier_col], errors="coerce").fillna(1.0)
        multiplier = multiplier.clip(lower=0.8, upper=2.0)
    else:
        # Derive a plausible multiplier compatible with the existing business logic
        fuel_impact = 1.0 + (fuel - 1.0) * 0.2  # $1→1.0x, $3→1.4x (unit-agnostic scaling)
        traffic_impact = 1.0 + (traffic - 1) * 0.033  # 1→1.0x, 10→1.3x
        demand_impact = 1.0 + (demand - 1) * 0.033   # 1→1.0x, 10→1.3x
        multiplier = (fuel_impact * traffic_impact * demand_impact)
        multiplier = multiplier.clip(lower=0.8, upper=2.0)

    out = pd.DataFrame(
        {
            "fuel_price": fuel.round(2),
            "traffic_index": traffic.astype(int),
            "demand_level": demand.astype(int),
            "price_multiplier": np.round(multiplier, 3),
        }
    )

    out.to_csv(out_csv, index=False)
    print(f"Saved {len(out)} rows to {out_csv}")


if __name__ == "__main__":
    main()




