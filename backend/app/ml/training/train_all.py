from __future__ import annotations

from backend.app.ml.training.train_anemia import train as train_anemia
from backend.app.ml.training.train_ckd import train as train_ckd
from backend.app.ml.training.train_diabetes import train as train_diabetes


def train_all():
    return {
        "anemia": train_anemia()["metrics"],
        "diabetes": train_diabetes()["metrics"],
        "ckd": train_ckd()["metrics"],
    }


if __name__ == "__main__":
    print(train_all())
