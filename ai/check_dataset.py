
from pathlib import Path
from collections import Counter

DATASET = Path(__file__).resolve().parent / "dataset"

SPLITS = ["train", "valid", "test"]

NAMES = [
    "BIODEGRADABLE",
    "CARDBOARD",
    "GLASS",
    "METAL",
    "PAPER",
    "PLASTIC"
]

for split in SPLITS:
    labels_dir = DATASET / split / "labels"
    counts = Counter()

    for label_file in labels_dir.glob("*.txt"):
        for line in label_file.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue

            class_id = int(float(line.split()[0]))
            counts[class_id] += 1

    print(f"\n{'=' * 40}")
    print(f"SET: {split.upper()}")
    print(f"{'=' * 40}")

    for class_id, name in enumerate(NAMES):
        print(f"{name}: {counts[class_id]} obiecte")
