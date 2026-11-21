
from ultralytics import YOLO
from collections import Counter
from pathlib import Path
import cv2

from config import (
    CUSTOM_MODEL_PATH,
    UPLOADS_DIR,
    CONFIDENCE_THRESHOLD,
    IMAGE_SIZE
)


class RecyclingAI:

    def __init__(self):
        """Încarcă modelul antrenat ReClar."""

        if not CUSTOM_MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Modelul ReClar nu a fost găsit: {CUSTOM_MODEL_PATH}"
            )

        print("Se încarcă modelul ReClar AI...")

        self.model = YOLO(str(CUSTOM_MODEL_PATH))

        print("Modelul ReClar AI a fost încărcat!")
        print("Categorii:", self.model.names)

    def detect(self, image_path):
        """Detectează și numără materialele reciclabile."""

        image_path = Path(image_path)

        if not image_path.exists():
            raise FileNotFoundError(
                f"Fotografia nu există: {image_path}"
            )

        # Predicția modelului
        results = self.model.predict(
            source=str(image_path),
            conf=CONFIDENCE_THRESHOLD,
            imgsz=IMAGE_SIZE,
            device=0,
            iou=0.45,
            max_det=100,
            agnostic_nms=False,
            verbose=False
        )

        if not results:
            raise RuntimeError("Modelul nu a returnat rezultate.")

        result = results[0]

        detections = []
        counts = Counter()

        # Prelucrarea obiectelor detectate
        for box in result.boxes:

            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            class_name = self.model.names[class_id]

            x1, y1, x2, y2 = map(
                int, box.xyxy[0].tolist()
            )

            detections.append({
                "type": class_name,
                "confidence": round(confidence, 3),
                "box": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2
                }
            })

            counts[class_name] += 1

        # Generarea imaginii cu detecții
        annotated_image = result.plot(
            labels=True,
            conf=False,
            line_width=2,
            font_size=12
        )

        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

        output_path = (
            UPLOADS_DIR / f"{image_path.stem}_detected.jpg"
        )

        saved = cv2.imwrite(
            str(output_path),
            annotated_image
        )

        if not saved:
            raise RuntimeError(
                "Nu s-a putut salva imaginea cu detecții."
            )

        # Rezultatul final
        return {
            "success": True,
            "total_objects": len(detections),
            "detections": detections,
            "counts": dict(counts),
            "annotated_image": str(output_path)
        }


# Instanță reutilizabilă a modelului
recycling_ai = RecyclingAI()


def detect_waste(image_path):
    """Funcție utilizată ulterior de backend."""

    return recycling_ai.detect(image_path)
