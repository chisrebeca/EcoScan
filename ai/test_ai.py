
import sys
import json

from pathlib import Path
from ai_model import detect_waste


def main():

    if len(sys.argv) < 2:
        print("Utilizare:")
        print("python test_ai.py uploads/fotografie.jpg")
        return

    image_path = Path(sys.argv[1])

    try:

        print("\nAnalizez fotografia...\n")

        result = detect_waste(image_path)

        print("REZULTATUL AI:")
        print("=" * 40)

        print(json.dumps(
            result,
            indent=4,
            ensure_ascii=False
        ))

        print("\nAnaliza a fost finalizată!")

    except Exception as error:

        print(f"Eroare: {error}")


if __name__ == "__main__":
    main()
