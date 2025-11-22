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