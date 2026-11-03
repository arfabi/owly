# 🛠️ Owly.AI — Registry of 14 Local Deterministic Browser Tools

> **Architecture Purpose:** This registry defines the 14 local deterministic tools accessible to **Meta Muse Spark Open** through autonomous function calling.  
> **Key Principle:** *"Models Propose, Deterministic Browser Engines Dispose."*  
> The Voice Companion and AI Assistant do not just generate conversational text—they emit structured JSON function calls to directly manipulate the active DOM, enforce digital accessibility, and navigate complex web forms with zero cloud data leakage.

---

## 📊 Summary Table: 14 Deterministic Tools

| # | Tool ID (`feature`) | Accessibility & UX Domain | Deterministic Browser Action | Example User Voice Command |
| :-: | :--- | :--- | :--- | :--- |
| **1** | `textSize` | Low Vision / Seniors | Scales page typography dynamically (`+25%`, `+50%`, `+75%`, `+100%`) without breaking layout. | *"Make the text on this page bigger."* |
| **2** | `contrast` | Light Sensitivity / Glare | Enforces high contrast, color inversion, or monochrome dark mode across CSS variables. | *"Switch to high contrast mode so it's easier on my eyes."* |
| **3** | `spotlight` | ADHD / Cognitive Focus | Renders an animated reading ruler that dims surrounding elements to focus on the active paragraph. | *"Turn on the reading spotlight for this section."* |
| **4** | `tts` | Blind / Motor Impaired | Triggers browser native Web Speech synthesis to read aloud selected clauses, requirements, or labels. | *"Read these document submission rules aloud."* |
| **5** | `dyslexiaFont` | Dyslexia / Neurodivergent | Overrides page typography with the specialized OpenDyslexic typeface to prevent character inversion. | *"Change the font to dyslexia-friendly mode."* |
| **6** | `textSpacing` | Typography Readability | Widens kerning and tracking between characters (`Light +10%`, `Medium +25%`, `Heavy +50%`). | *"Add more spacing between letters."* |
| **7** | `lineHeight` | Visual Comfort | Expands leading between sentences (`1.5x`, `1.8x`, `2.2x`) to prevent reader fatigue. | *"Increase the line height between paragraphs."* |
| **8** | `pauseAnim` | Vestibular Disorder | Freezes CSS keyframes, blinking banners, marquee tickers, and GIF animations. | *"Stop all moving animations on the screen."* |
| **9** | `bigCursor` | Low Vision / Motor Control | Replaces standard mouse pointer with an extra-large high-visibility black/white cursor with yellow highlighter. | *"Make my mouse cursor larger and easier to see."* |
| **10** | `links` | Visual Navigation | Injects distinct borders, solid underlines, and badge outlines over all interactive links and buttons. | *"Highlight all clickable buttons and links."* |
| **11** | `hideImages` | ADHD / Cognitive Overload | Masks decorative pictures and background banners to isolate text requirements. | *"Hide distracting images so I can focus on the form."* |
| **12** | `textAlign` | Dyslexia & Tracking | Standardizes paragraph alignment (Left, Center, Justified) to eliminate irregular text rivers. | *"Align all text cleanly to the left."* |
| **13** | `colorSat` | Color Blindness | Adjusts global saturation (`High +50%`, `Low -50%`, `Grayscale`) for dichromatic and monochromatic vision. | *"Convert the page to grayscale."* |
| **14** | `find_and_highlight_element` | Hands-Free Form Navigation | Emits semantic coordinates, animates a gliding cursor, and projects a pulsing spotlight beacon on target inputs. | *"Where is the National ID field?"* $\rightarrow$ *Beacon glides straight to the NIK input.* |

---

## 🔬 Technical Function Calling Specifications

### Tool 1: `set_accessibility_feature`
Allows **Meta Muse Spark Open** to execute accessibility adaptations directly on the active webpage.

```json
{
  "type": "function",
  "function": {
    "name": "set_accessibility_feature",
    "description": "Directly adjusts an accessibility tool on the active web page. Used when the user asks to resize text, change contrast, reduce glare, enable reading spotlight, read aloud, or adjust typography.",
    "parameters": {
      "type": "object",
      "properties": {
        "feature": {
          "type": "string",
          "enum": [
            "textSize",
            "contrast",
            "spotlight",
            "tts",
            "dyslexiaFont",
            "textSpacing",
            "lineHeight",
            "pauseAnim",
            "bigCursor",
            "links",
            "hideImages",
            "textAlign",
            "colorSat",
            "liveTooltips"
          ],
          "description": "The deterministic tool identifier."
        },
        "value": {
          "type": "string",
          "description": "The target value (e.g. '+50%', 'High', 'Invert', 'On', 'Off', 'Large (Black)')."
        }
      },
      "required": ["feature", "value"]
    }
  }
}
```

### Tool 2: `find_and_highlight_element`
Allows **Meta Muse Spark Open** to locate interactive UI elements in any language and guide the user visually.

```json
{
  "type": "function",
  "function": {
    "name": "find_and_highlight_element",
    "description": "Visually locates and highlights an interactive element (button, link, form input, or section) on the active webpage with an animated gliding cursor and spotlight beacon.",
    "parameters": {
      "type": "object",
      "properties": {
        "targetName": {
          "type": "string",
          "description": "Normalized semantic keyword (e.g. 'download', 'submit', 'nik', 'ktp', 'passport', 'statement_letter')."
        },
        "elementType": {
          "type": "string",
          "enum": ["button", "link", "input", "any"]
        },
        "replyMessage": {
          "type": "string",
          "description": "Short spoken response confirming the element has been located."
        }
      },
      "required": ["targetName"]
    }
  }
}
```

---

## 📺 On-Screen Overlay Card Blueprint (For Video Recording)

Show this visual graphic HUD card at `2:10 – 2:20` of your video demonstration:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ⚡ META MUSE SPARK DETERMINISTIC TOOL REGISTRY                         │
│ Model: meta-models/muse-spark-open-1026 • Runtime: Browser Side Panel │
├────────────────────────────────────────────────────────────────────────┤
│ [01] textSize        : Dynamic CSS font scalar (+25% to +100%)         │
│ [02] contrast        : Variable dark/invert/high-contrast engine       │
│ [03] spotlight       : Viewport paragraph reading ruler                │
│ [04] tts             : Web Speech API text-to-speech speaker           │
│ [05] dyslexiaFont    : OpenDyslexic character stabilizer               │
│ [06] textSpacing     : Tracking and kerning expander                   │
│ [07] lineHeight      : Leading spacing adjuster (1.5x to 2.2x)         │
│ [08] pauseAnim       : Universal CSS motion & GIF freezer              │
│ [09] bigCursor       : High-visibility pointer with beacon glow        │
│ [10] links           : Interactive boundary and anchor highlighter     │
│ [11] hideImages      : Cognitive distraction image masking             │
│ [12] textAlign       : Uniform paragraph left-alignment engine         │
│ [13] colorSat        : Color blindness RGB matrix adjuster             │
│ [14] find_and_highlight_element: Semantic DOM locator with spotlight beacon │
├────────────────────────────────────────────────────────────────────────┤
│ 🛡️ Security: 100% Client-Side Execution • Zero Cloud Data Leakage      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Code Implementation References

* **LLM Tool Declaration & Schema:** [`web/src/app/api/chat/route.ts#L189-L257`](file:///d:/webdev/laragon/www/savvy/web/src/app/api/chat/route.ts#L189-L257)
* **Accessibility Hub Registry & State:** [`extension/src/components/AccessibilityHubTab.tsx#L67-L173`](file:///d:/webdev/laragon/www/savvy/extension/src/components/AccessibilityHubTab.tsx#L67-L173)
* **DOM Gliding Beacon & Spotlight Injection:** [`extension/src/content.ts#L1630-L1680`](file:///d:/webdev/laragon/www/savvy/extension/src/content.ts#L1630-L1680)

