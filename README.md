# WebTools

WebTools is a static web tools hub. The primary application lives in `src/tools/`.

## Main Entry

Open `src/tools/index.html`, or serve `src/tools/` with a local static server.

Current tool categories:

- Text
- Time
- Encode
- Color
- Life

## Repository Layout

```text
src/tools/                 Main WebTools Hub application
src/tools/assets-show/     Asset distribution tool used by the Life category
experiments/stocks/        Archived stock analysis experiment
experiments/python-tools/  Archived Python scraping/data experiment
archive/stock-strategies/  Stock strategy reference materials
docs/                      Project documentation
```

`src/` should stay focused on the active WebTools Hub. New experiments should go under `experiments/`, and large reference material should go under `archive/` or outside this repository.
