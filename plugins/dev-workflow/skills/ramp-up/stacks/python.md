# Python

## Look at

- Manifest: `pyproject.toml` (preferred), `setup.py`, `setup.cfg`, or `requirements*.txt`.
- Lockfile: `poetry.lock`, `uv.lock`, `Pipfile.lock`, `requirements.lock`.
- Python version: `.python-version`, `pyproject.toml` `[tool.poetry.dependencies] python`, or `requires-python`.
- Tooling: `ruff.toml`, `.flake8`, `mypy.ini`, `pytest.ini`, `tox.ini`, `noxfile.py`.
- Entry: `[project.scripts]` in `pyproject.toml`, `__main__.py`, or top-level `main.py`/`app.py`.

## Layout

- Package layout: `src/<pkg>/` (preferred) or top-level `<pkg>/`.
- Notebooks: `notebooks/` or `*.ipynb` — often experimental work, may diverge from prod code.

## Tests

- `tests/`, `test_*.py`, `*_test.py`.
- Skipped: `grep -rIn -E '@pytest\.mark\.skip|pytest\.skip|@unittest\.skip' .`

## Framework signals

- `manage.py` → Django. Then check `INSTALLED_APPS` in `settings.py`, `urls.py`, `apps/`.
- `app = FastAPI(` → FastAPI. Find routers under `routers/` or `api/`.
- `from flask import Flask` → Flask.

## Env + run

- `.env.example`, `Dockerfile`, `Procfile`.
- Note scripts in `pyproject.toml` `[tool.poetry.scripts]` or `Makefile`.
