
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

DATASET_DIR = BASE_DIR / "dataset"
MODELS_DIR = BASE_DIR / "models"
UPLOADS_DIR = BASE_DIR / "uploads"

DATASET_YAML = DATASET_DIR / "data.yaml"

# Modelul ReClar antrenat
MODEL_NAME = "yolo26n.pt"
CUSTOM_MODEL_PATH = (
    MODELS_DIR / "reclar_v1" / "weights" / "best.pt"
)

# Detectare
CONFIDENCE_THRESHOLD = 0.50
IMAGE_SIZE = 512

MODELS_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
