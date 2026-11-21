
import sys
import json
import contextlib
import io


def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Nu a fost furnizată fotografia."
        }))
        sys.exit(1)

    try:
        # Redirecționăm mesajele AI în afara rezultatului JSON
        with contextlib.redirect_stdout(sys.stderr):
            from ai_model import detect_waste
            result = detect_waste(sys.argv[1])

        # Pe stdout trimitem exclusiv JSON
        print(json.dumps(result, ensure_ascii=False))

    except Exception as error:
        print(json.dumps({
            "success": False,
            "error": str(error)
        }, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
