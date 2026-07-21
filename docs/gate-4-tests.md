# Gate 4: Tests

Tests validate the public interface. They must survive a complete internal rewrite.

## Test Categories

### Contract Tests (Public Interface)

| Test | What it validates |
|------|-------------------|
| `render()` returns `RenderResult` with correct shape | Interface contract |
| All 5 formats produce valid output files | Format dispatch |
| All 15 themes resolve without error | Theme resolution |
| Unsupported diagram type throws `UNSUPPORTED_TYPE` | Error contract |
| Empty source throws `INVALID_SOURCE` | Error contract |
| Missing theme throws `THEME_NOT_FOUND` | Error contract |
| ASCII only works with beautiful-mermaid types | Backend boundary |

### Integration Tests

| Test | What it validates |
|------|-------------------|
| Flowchart → SVG, PNG, HTML, PDF, ASCII | End-to-end pipeline |
| Sequence diagram → all formats | Alternate diagram type |
| C4 diagram falls back to mermaid-cli (or gives clear install message) | Backend selection |
| Project config auto-discovery from working directory | Config resolution |
| Theme override via `--theme` flag | Theme priority chain |

## Manual Test Results

All tests pass for the beautiful-mermaid backend (6 diagram types, all formats):

```bash
✓ flowchart → svg (dracula theme)
✓ flowchart → png (tokyo-night theme)
✓ flowchart → html (nord theme)
✓ flowchart → pdf (github-dark theme)
✓ flowchart → ascii (default theme)
✓ --theme list → 15 themes enumerated
✓ C4 diagram → falls back to mermaid-cli with clear install error
```

## What We Don't Test (By Design)

- Internal implementation details (renderBeautifullSvg, svgToPng internals)
- Specific pixel output (test contracts, not visual fidelity)
- resvg-js internals (external library)
- beautiful-mermaid internals (external library)

## Test Survivability

If we replace beautiful-mermaid with a different SVG renderer, or swap resvg-js for sharp, or change the HTML template entirely — every test above should still pass because they test the *interface*, not the *implementation*.
