# SwaraGPT Music Information Retrieval & AI Pipeline

This document details the Digital Signal Processing (DSP), fundamental frequency tracking, 22-shruti alignment, and ornamentation segmentation algorithms implemented in SwaraGPT.

---

## 1. Stage 1: Audio Preprocessing

Singing recordings received from browsers require normalization and noise mitigation before pitch tracking.

1. **Format Ingestion:** Soundfile reads `.wav`, `.webm`, `.mp3`, or `.flac` into a single-channel floating-point array.
2. **Resampling:** All inputs are resampled to $f_s = 22{,}050\text{ Hz}$, the standard research sampling rate for MIR pitch tracking.
3. **High-Pass Filter:** A 4th-order Butterworth High-Pass Filter with a cutoff frequency of $f_c = 80\text{ Hz}$ removes microphone handling thumps, plosives, and sub-audible room rumble without affecting low vocal frequencies ($C2 \approx 65.4\text{ Hz}$ / $C3 \approx 130.8\text{ Hz}$).
4. **Peak Normalization:** Signals are normalized to $-1.0\text{ dBFS}$ ($|y| \le 0.891$).
5. **Voice Activity Detection (VAD):** Top-dB energy thresholding ($25\text{ dB}$ below peak) trims silence before and after the singing phrase.

---

## 2. Stage 2: Tonic (Sa) Estimation

Indian Classical Music operates relative to a variable tonic:

$$\text{Estimated Sa} = \arg\max_{f \in [65, 350]} \text{Hist}(F0)$$

* If the user manually selects their tonic (e.g., $138.59\text{ Hz}$ for C#3), the manual tonic is strictly enforced.
* Otherwise, the long-term pitch distribution histogram detects the primary reference peak and assigns it as $f_{Sa}$.

---

## 3. Stage 3: Fundamental Frequency (F0) Extraction

We employ the **Probabilistic YIN (pYIN)** algorithm (Mauch & Dixon, 2014) implemented via Librosa:

1. **Difference Function:** Computes $d_t(\tau) = \sum_{j=1}^W (x_j - x_{j+\tau})^2$.
2. **Cumulative Mean Normalized Difference:**
   $$d'_t(\tau) = \begin{cases} 1 & \text{if } \tau = 0 \\ \frac{d_t(\tau)}{\frac{1}{\tau}\sum_{j=1}^\tau d_t(j)} & \text{otherwise} \end{cases}$$
3. **Probabilistic Hidden Markov Model (HMM):** Viterbi decoding finds the optimal pitch path while pruning unvoiced and noisy frames.
4. Frames where voiced probability $P(\text{voiced}) < 0.15$ are filtered out to prevent octave jumps.

---

## 4. Stage 4: Cent Calculation & 22-Shruti Mapping

Each extracted pitch frame $f_i$ is mapped to relative cents:

$$C_i = 1200 \cdot \log_2\left(\frac{f_i}{f_{Sa}}\right) \pmod{1200}$$

### Tolerance Classification:
* **Sur (In Tune):** $|C_i - C_{\text{target}}| \le 25.0\text{ cents}$
* **Mild Deviation:** $25.0 < |C_i - C_{\text{target}}| \le 50.0\text{ cents}$
* **Besur (Significant Deviation):** $|C_i - C_{\text{target}}| > 50.0\text{ cents}$

### 22-Shruti Microtone Alignment:
The cent position is matched against the target swara's canonical microtones (e.g. *Krodha* $386.3¢$ for Shuddha Ga vs *Vajrika* $407.8¢$ for Tivra Ga).

---

## 5. Stage 5: Ornamentation & Continuous Glide Segmentation

Singing in Indian classical music is characterized by intentional continuous glides (**Meend**), rapid oscillations (**Gamak**), gentle swings (**Andolan**), and transient grace notes (**Kan-swar**). Naively classifying dynamic pitch movements as errors would be fundamentally incorrect.

SwaraGPT computes the continuous first derivative of cents with respect to time:

$$\Delta C(t) = \left|\frac{dC}{dt}\right|$$

* **Steady Sustained Note:** $\Delta C(t) < 40\text{ cents/sec}$ sustained for $\ge 300\text{ ms}$.
* **Meend (Continuous Glide):** $40 \le \Delta C(t) \le 350\text{ cents/sec}$ monotonically ascending or descending across multiple swara boundaries.
* **Gamak / Andolan:** Periodic oscillation ($3\text{ Hz} \le f_{\text{osc}} \le 7\text{ Hz}$) around a central swara.
* **Kan-swar (Grace Note):** Brief transient note duration $< 180\text{ ms}$ immediately preceding a target swara.

---

## 6. Stage 6: Automated Raga Recognition Index (ARI)

The baseline raga recognition engine employs an explainable 3-factor metric:

$$\text{ARI} = 0.40 \cdot S_{\text{scale}} + 0.35 \cdot S_{\text{vadi}} + 0.25 \cdot S_{\text{pakad}}$$

1. **Scale Adherence ($S_{\text{scale}}$):** Percentage of vocal energy centered on swaras belonging to the raga's Aroha/Avaroha.
2. **Vadi/Samvadi Prominence ($S_{\text{vadi}}$):** Ratio of duration spent sustaining the King (Vadi) and Queen (Samvadi) notes.
3. **Pakad N-Gram Matching ($S_{\text{pakad}}$):** Sequence similarity comparing the student's swara transitions against the raga's signature phrase.

---

## 7. Stage 7: Multi-Factor Weighted Scoring

$$\text{Overall Score} = (0.35 \times P) + (0.25 \times S) + (0.15 \times Sh) + (0.15 \times R) + (0.10 \times T)$$

* **$P$ (Pitch Accuracy, 35%):** Frame-level F0 deviation and voicing consistency.
* **$S$ (Swara Accuracy, 25%):** Adherence to nominal note targets ($\pm 25¢$).
* **$Sh$ (Shruti Precision, 15%):** Proximity to raga-specific microtonal ratios.
* **$R$ (Raga Adherence, 15%):** Scale compliance and Vadi emphasis.
* **$T$ (Tonic Stability, 10%):** Constancy of the fundamental Sa reference across the performance.
