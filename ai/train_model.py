
from pathlib import Path
from ultralytics import YOLO

from config import DATASET_YAML, MODELS_DIR

# Configurare antrenare
MODEL_NAME = "yolo26n.pt"
EPOCHS = 50
IMAGE_SIZE = 512
BATCH_SIZE = 2
DEVICE = 0

def train_model():
    print("Initializare model ReClar AI...")

    model = YOLO(MODEL_NAME)

    print("Incepem antrenarea pe NVIDIA GPU...")

    results = model.train(
        data=str(DATASET_YAML),
        epochs=EPOCHS,
        imgsz=IMAGE_SIZE,
        batch=BATCH_SIZE,
        device=DEVICE,
        workers=0,
        project=str(MODELS_DIR),
        name="reclar_v1",
        exist_ok=True,
        patience=10,
        save=True,
        plots=True,
        amp=True,
        cache=False
    )

    print("\nAntrenare terminata!")

    best_model = (
        MODELS_DIR / "reclar_v1" / "weights" / "best.pt"
    )

    print(f"Model salvat la: {best_model}")

    return results


if __name__ == "__main__":
    train_model()
