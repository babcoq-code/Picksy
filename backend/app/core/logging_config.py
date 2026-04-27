import logging, sys

def configure_logging():
    try:
        from pythonjsonlogger import jsonlogger
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(jsonlogger.JsonFormatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s"
        ))
    except ImportError:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(
            "%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"
        ))
    root = logging.getLogger()
    root.handlers = []
    root.addHandler(handler)
    root.setLevel(logging.INFO)
