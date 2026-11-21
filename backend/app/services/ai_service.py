
import subprocess
import json
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_DIR = BACKEND_DIR.parent

AI_DIR = PROJECT_DIR / "ai"

AI_PYTHON = AI_DIR / ".venv" / "Scripts" / "python.exe"
AI_SCRIPT = AI_DIR / "run_ai.py"


def detect_waste(image_path: str):
    """Apelează modelul ReClar din mediul virtual AI."""

    image_path = Path(image_path).resolve()

    if not AI_PYTHON.exists():
        raise FileNotFoundError("Mediul virtual AI nu există.")

    if not AI_SCRIPT.exists():
        raise FileNotFoundError("Scriptul run_ai.py nu există.")

    if not image_path.exists():
        raise FileNotFoundError("Fotografia nu există.")

    process = subprocess.run(
        [
            str(AI_PYTHON),
            str(AI_SCRIPT),
            str(image_path)
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=120
    )

    if process.returncode != 0:
        raise RuntimeError(
            process.stderr or "Eroare la executarea AI."
        )

    try:
        return json.loads(process.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(
            f"Rezultat AI invalid: {process.stdout}"
        ) from error
