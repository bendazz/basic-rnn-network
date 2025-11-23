"""Base RNN Cell Practice Problems

For each problem compute:
    z = Wx @ x + Wh @ h_prev + b
    h_next = np.tanh(z)

Classification (optional): For each unit decide if |z_i| is
    - near_linear: |z_i| < 0.5
    - moderate:    0.5 <= |z_i| < 1.5
    - saturated:   |z_i| >= 1.5

No solutions included; create your own answer key if desired.
All arrays are column vectors or matrices sized (hidden_size x input_size / hidden_size).
"""

import numpy as np

# Template function students may use.

def rnn_step(x: np.ndarray, h_prev: np.ndarray, Wx: np.ndarray, Wh: np.ndarray, b: np.ndarray):
    """Single vanilla RNN cell forward pass with tanh activation.
    Shapes:
        x:      (input_size, 1)
        h_prev: (hidden_size, 1)
        Wx:     (hidden_size, input_size)
        Wh:     (hidden_size, hidden_size)
        b:      (hidden_size, 1)
    Returns:
        z:       pre-activation (hidden_size, 1)
        h_next:  tanh(z)        (hidden_size, 1)
    """
    z = Wx @ x + Wh @ h_prev + b
    h_next = np.tanh(z)
    return z, h_next

# -----------------
# Problem 1 (hidden=4, input=3)
# -----------------
P1_x = np.array([[1.0], [0.5], [-1.0]], dtype=float)
P1_h_prev = np.array([[0.2], [-0.1], [0.05], [0.3]], dtype=float)
P1_b = np.array([[0.0], [0.1], [-0.05], [0.2]], dtype=float)
P1_Wx = np.array([
    [0.3,  -0.2,  0.1],
    [0.0,   0.5, -0.4],
    [0.25,  0.15,-0.3],
    [-0.1,  0.2,  0.4],
], dtype=float)
P1_Wh = np.array([
    [0.4,  -0.3,  0.0,  0.2],
    [-0.2,  0.1,  0.5, -0.1],
    [0.3,   0.2, -0.4,  0.1],
    [0.0,  -0.25, 0.35, 0.2],
], dtype=float)

# -----------------
# Problem 2 (hidden=3, input=2)
# -----------------
P2_x = np.array([[1.0], [-2.0]], dtype=float)
P2_h_prev = np.array([[0.4], [0.0], [-0.3]], dtype=float)
P2_b = np.array([[0.05], [-0.1], [0.2]], dtype=float)
P2_Wx = np.array([
    [0.6, -0.5],
    [0.2,  0.1],
    [-0.3, 0.4],
], dtype=float)
P2_Wh = np.array([
    [0.2, -0.1, 0.0],
    [-0.4, 0.3, 0.5],
    [0.1, -0.2, 0.25],
], dtype=float)

# -----------------
# Problem 3 (hidden=5, input=4)
# -----------------
P3_x = np.array([[0.5], [-1.0], [1.5], [0.0]], dtype=float)
P3_h_prev = np.array([[0.1], [0.2], [-0.2], [0.0], [0.3]], dtype=float)
P3_b = np.array([[0.2], [0.0], [0.0], [0.15], [-0.1]], dtype=float)
P3_Wx = np.array([
    [0.1, -0.2,  0.3,  0.0],
    [0.4,  0.0, -0.1,  0.2],
    [-0.3, 0.25, 0.15, -0.05],
    [0.0,  0.3, -0.2,  0.4],
    [0.2, -0.1,  0.0,  0.1],
], dtype=float)
P3_Wh = np.array([
    [0.2, -0.1,  0.05, 0.0,  0.1],
    [0.0,  0.3, -0.2,  0.1, -0.05],
    [0.25, 0.1, -0.4,  0.0,  0.2],
    [-0.1, 0.2,  0.3, -0.15, 0.05],
    [0.05,-0.2,  0.1,  0.25,-0.3 ],
], dtype=float)

# -----------------
# Problem 4 (hidden=3, input=3) – integer-heavy weights
# -----------------
P4_x = np.array([[2.0], [-1.0], [0.5]], dtype=float)
P4_h_prev = np.array([[1.0], [-0.5], [0.0]], dtype=float)
P4_b = np.array([[0.0], [0.5], [-0.5]], dtype=float)
P4_Wx = np.array([
    [1.0, -2.0,  1.0],
    [0.0,  1.0, -1.0],
    [-1.0, 2.0,  0.0],
], dtype=float)
P4_Wh = np.array([
    [2.0, -1.0, 0.0],
    [-1.0, 1.0,  1.0],
    [0.0, -2.0, 2.0],
], dtype=float)

# -----------------
# Problem 5 (hidden=4, input=2) – larger magnitudes (tanh saturation)
# -----------------
P5_x = np.array([[3.0], [-2.0]], dtype=float)
P5_h_prev = np.array([[0.5], [1.0], [-0.5], [0.0]], dtype=float)
P5_b = np.array([[0.1], [-0.2], [0.0], [0.3]], dtype=float)
P5_Wx = np.array([
    [1.2, -0.8],
    [0.5,  1.1],
    [-1.0, 0.9],
    [0.7, -0.6],
], dtype=float)
P5_Wh = np.array([
    [0.9, -0.5,  0.3,  0.2],
    [0.4,  0.8, -0.6,  0.0],
    [-0.7, 0.2,  1.0, -0.4],
    [0.3, -0.9,  0.5,  0.6],
], dtype=float)

if __name__ == "__main__":
    # Demonstration: compute z and h_next for Problem 1 only (students can replicate for others)
    z1, h1 = rnn_step(P1_x, P1_h_prev, P1_Wx, P1_Wh, P1_b)
    print("Problem 1 pre-activation z:\n", z1)
    print("Problem 1 h_next (tanh):\n", h1)
    # Comment out or remove prints if using purely for student distribution.
