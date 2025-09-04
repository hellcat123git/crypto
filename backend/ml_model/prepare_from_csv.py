#!/usr/bin/env python3
"""
Convert the provided India dataset CSV file into the CSV format expected by train.py.
Expected output columns: fuel_price, traffic_index, demand_level, price_multiplier
"""

import pandas as pd
import numpy as np
from pathlib import Path


def _pick_column(frame: pd.DataFrame, candidates: set[str]) -> str:
    normalized_to_actual: dict[str, str] = {c.lower().strip(): c for c in frame.columns}
    for candidate in candidates:
        if candidate in normalized_to_actual:
            return normalized_to_actual[candidate]
    raise KeyError(f"Missing expected columns. Tried: {sorted(candidates)}. Available: {list(frame.columns)}")


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]
    csv_path = project_root / "india_weather_traffic_fuel_50k-1.csv"
    out_csv = Path(__file__).resolve().parent / "training_data.csv"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found at {csv_path}")

    # Read with robust parsing
    df = pd.read_csv(csv_path)

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
    # traffic may be given as numeric percentage or categories; expecting numeric 1-10 for the model
    traffic_col = _pick_column(
        df,
        {"traffic_index", "traffic", "trafficindex", "congestion", "traffic_level"},
    )
    demand_col = _pick_column(
        df,
        {"demand_level", "demand", "demandindex", "demand_score", "demand_level_pct"},
    )

    multiplier_col: str | None = None
    for c in df.columns:
        if c.lower().strip() in {"price_multiplier", "multiplier", "price_factor"}:
            multiplier_col = c
            break

    fuel = pd.to_numeric(df[fuel_col], errors="coerce")
    traffic_raw = df[traffic_col]
    demand_raw = df[demand_col]

    # Handle traffic possibly being categorical like "Heavy Traffic", "Light Traffic" or numeric percent
    def map_traffic(value) -> float:
        if pd.isna(value):
            return np.nan
        if isinstance(value, (int, float)):
            # If percentage 0-100, map to 1-10; if already 1-10, leave
            v = float(value)
            if v > 10:
                return max(1.0, min(10.0, round(v / 10.0)))
            return max(1.0, min(10.0, v))
        s = str(value).strip().lower()
        mapping = {
            "none": 1,
            "light": 3,
            "light traffic": 3,
            "moderate": 6,
            "moderate traffic": 6,
            "heavy": 9,
            "heavy traffic": 9,
            "closure": 10,
            "accident": 8,
            "roadwork": 7,
        }
        return mapping.get(s, np.nan)

    def map_demand(value) -> float:
        if pd.isna(value):
            return np.nan
        if isinstance(value, (int, float)):
            v = float(value)
            if v > 10:
                return max(1.0, min(10.0, round(v / 10.0)))
            return max(1.0, min(10.0, v))
        s = str(value).strip().lower()
        mapping = {
            "low": 3,
            "normal": 5,
            "medium": 5,
            "high": 8,
            "very high": 10,
        }
        return mapping.get(s, np.nan)

    traffic = traffic_raw.apply(map_traffic)
    demand = demand_raw.apply(map_demand)

    mask = fuel.notna() & traffic.notna() & demand.notna()
    if mask.sum() == 0:
        raise ValueError("No valid rows after parsing fuel/traffic/demand from CSV")

    fuel = fuel[mask]
    traffic = traffic[mask].astype(float)
    demand = demand[mask].astype(float)
    df = df.loc[mask].copy()

    fuel = fuel.clip(lower=1.0, upper=3.0)
    traffic = traffic.clip(lower=1, upper=10).round()
    demand = demand.clip(lower=1, upper=10).round()

    if multiplier_col is not None:
        multiplier = pd.to_numeric(df[multiplier_col], errors="coerce").fillna(1.0)
        multiplier = multiplier.clip(lower=0.8, upper=2.0)
    else:
        fuel_impact = 1.0 + (fuel - 1.0) * 0.2
        traffic_impact = 1.0 + (traffic - 1) * 0.033
        demand_impact = 1.0 + (demand - 1) * 0.033
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












