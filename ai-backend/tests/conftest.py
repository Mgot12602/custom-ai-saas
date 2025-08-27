import sys
from pathlib import Path

# Add project root to sys.path so "import src..." works in tests
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
