## Basic RNN Network Visualization

This project provides a front-end only web application that visualizes the base (pre-activation) fully connected layer structure underlying recurrent units (RNNs / LSTMs). It currently shows three input nodes feeding into three output nodes with all-to-all (dense) connections.

### Files
- `index.html` – Entry point; loads styles and script.
- `style.css` – Minimal styling, dark theme, node/edge visuals.
- `script.js` – Renders the SVG network and runs a simple edge highlight animation.

### Usage
Open `index.html` directly in any modern browser (Chrome, Firefox, Edge, Safari). No build step or server required.

### Current Features
- Two panels:
	- Hidden State Layer (h1..hN) with N inputs and N outputs (hidden size).
	- Input → Hidden Mapping (x1..xM to hidden outputs) with independent input size.
- Sliders: Input Size (M) and Hidden Size (N) both range 1–5.
- Fully connected edges with arrowheads in each panel.
- Dynamic rebuild on slider changes (pure pre-activation structure).

### Next Ideas
- Show weight matrix W as a table synchronized with edge highlighting.
- Add tooltips with weight values (random initialization).
- Integrate timestep unfolding for recurrent structure.
- Toggle activation function overlay (e.g., tanh vs. sigmoid curves).
 - Reintroduce optional edge animation to illustrate propagation.

Contributions or extension requests welcome.
# basic-rnn-network
\n+## Practice: Base RNN Cell
This section introduces practice problems for a single vanilla RNN cell (no output projection). For each question you are given column vectors `x`, `h_prev`, bias `b`, and weight matrices `Wx`, `Wh`. Your task: compute the pre-activation
\n+```
z = Wx @ x + Wh @ h_prev + b
```
then the next hidden state
```
h_next = tanh(z)
```
Do NOT round intermediate values until the final `h_next` (you may round to 4 decimal places if desired). All arrays are copyable NumPy definitions in `base_network_practice.py`.
\n+### Problem Set Overview
- Problem 1: Hidden size 4, input size 3 (mixed small real values)
- Problem 2: Hidden size 3, input size 2 (simpler dimensions)
- Problem 3: Hidden size 5, input size 4 (bias emphasizes select units)
- Problem 4: Hidden size 3, input size 3 (integer-heavy weights, observe sign interactions)
- Problem 5: Hidden size 4, input size 2 (larger magnitudes – inspect tanh saturation)
\n+### Deliverables (per problem)
1. Compute `z` (column vector).
2. Compute `h_next = tanh(z)`.
3. Briefly classify each unit's activation regime: near-linear (|z| < 0.5), moderate (0.5 ≤ |z| < 1.5), saturated (|z| ≥ 1.5).
\n+Optional extension: Replace `tanh` with a sigmoid and compare regimes.
\n+No solutions are included by default; feel free to add your own answer key locally. See the Python file for direct copy/paste arrays.