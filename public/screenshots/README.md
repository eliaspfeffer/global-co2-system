# 📸 Screenshot Guide for Global CO2 System

This directory contains screenshots and GIFs demonstrating the key features and scenarios of the Global CO2 Accountability System.

## 🎯 Required Screenshots

### 1. **main-interface.png**

- **What to capture**: Full application interface with 3D Earth, all panels visible
- **Setup**:
  - Navigate to http://localhost:3000
  - Ensure all panels are expanded
  - Select a country to show country panel
  - Take full-screen screenshot
- **Purpose**: Hero image for README

### 2. **satellite-detection-vote.png**

- **What to capture**: Voting panel showing satellite detection vote
- **Setup**:
  - Select a country (e.g., China)
  - Increase emissions above allowance using slider
  - Wait for satellite detection alert
  - Screenshot the voting panel with satellite detection data
- **Purpose**: Show democratic verification process

### 3. **country-choice.png**

- **What to capture**: Enforcement choice dialog after satellite detection
- **Setup**:
  - Continue from satellite detection scenario
  - Countries vote "Trust Satellites" to confirm detection
  - Screenshot the enforcement choice dialog
- **Purpose**: Show clear enforcement options

### 4. **bitcoin-seizure.png**

- **What to capture**: Bitcoin seizure vote interface
- **Setup**:
  - From country choice, select "Refuse to Buy"
  - Screenshot the resulting Bitcoin seizure vote
- **Purpose**: Show multisig enforcement mechanism

### 5. **automatic-enforcement.png**

- **What to capture**: Automatic enforcement notification
- **Setup**:
  - Have a country refuse compliance
  - Continue increasing emissions (Fast Forward Time)
  - Screenshot when automatic enforcement triggers
- **Purpose**: Show "waiting out" prevention

### 6. **satellite-panel.png**

- **What to capture**: Satellite panel with launch buttons
- **Setup**:
  - Focus on the satellite panel
  - Ensure satellite fund has Bitcoin
  - Show all satellite companies with launch buttons
- **Purpose**: Show satellite network expansion

## 🎬 Required GIFs

### 1. **satellite-detection.gif**

- **What to capture**: Complete detection flow
- **Steps**:
  1. Adjust country emissions above allowance
  2. Show satellite detection alert
  3. Show voting interface appearing
  4. Show vote being cast
  5. Show confirmation
- **Duration**: 10-15 seconds
- **Purpose**: Show detection → verification → enforcement flow

### 2. **complete-flow.gif**

- **What to capture**: End-to-end scenario
- **Steps**:
  1. Country exceeds allowance
  2. Satellite detection
  3. Democratic voting
  4. Enforcement choice
  5. Final outcome
- **Duration**: 20-30 seconds
- **Purpose**: Complete system demonstration

## 🛠️ Screenshot Instructions

### Tools Needed

- **macOS**: Cmd+Shift+4 for region screenshot, Cmd+Shift+5 for screen recording
- **Windows**: Snipping Tool or Win+Shift+S
- **Chrome Extensions**: Full Page Screen Capture, Loom for GIFs

### Best Practices

1. **Resolution**: Take at least 1920x1080 screenshots
2. **File Format**: PNG for screenshots, GIF for animations
3. **File Size**: Optimize for web (compress large images)
4. **Naming**: Use exact filenames referenced in README.md
5. **Content**: Ensure all UI elements are clearly visible

### Recommended Workflow

1. Start application: `npm run dev`
2. Open browser to http://localhost:3000
3. Follow scenario setup instructions above
4. Take screenshots/GIFs in sequence
5. Save to `public/screenshots/` directory
6. Verify all images display correctly in README

## 📋 Scenario Checklist

- [ ] main-interface.png - Hero image
- [ ] satellite-detection-vote.png - Voting process
- [ ] country-choice.png - Enforcement options
- [ ] bitcoin-seizure.png - Seizure vote
- [ ] automatic-enforcement.png - Automatic enforcement
- [ ] satellite-panel.png - Satellite expansion
- [ ] satellite-detection.gif - Detection flow
- [ ] complete-flow.gif - End-to-end demo

## 🎨 Visual Guidelines

### Screenshot Composition

- **Focus**: Highlight the specific feature being demonstrated
- **Context**: Include enough surrounding UI for context
- **Clarity**: Ensure text is readable and UI elements are distinct
- **Annotations**: Consider adding arrows or highlights for key elements

### GIF Guidelines

- **Smooth Motion**: 30 FPS for smooth animation
- **Pause Points**: Brief pauses to let users read important text
- **Loop**: Make GIFs loop seamlessly
- **Compression**: Balance quality with file size (<5MB per GIF)

## 🔧 Technical Notes

### File Paths

All images should be placed in:

```
public/screenshots/
├── main-interface.png
├── satellite-detection-vote.png
├── country-choice.png
├── bitcoin-seizure.png
├── automatic-enforcement.png
├── satellite-panel.png
├── satellite-detection.gif
└── complete-flow.gif
```

### Markdown References

Images are referenced in README.md as:

```markdown
![Alt Text](screenshots/filename.png)
```

The `public/` directory is served statically by Next.js, so `/screenshots/` maps to `public/screenshots/`.

## 🚀 Quick Demo Script

For efficient screenshot capture, follow this script:

1. **Setup**: Start app, open to full screen
2. **Main Interface**: Take hero shot
3. **Satellite Detection**: Increase emissions → alert → vote → screenshot
4. **Enforcement**: Continue vote → enforcement choice → screenshot
5. **Seizure**: Refuse → seizure vote → screenshot
6. **Auto Enforcement**: Fast forward → continue emitting → auto trigger → screenshot
7. **Satellites**: Focus satellite panel → screenshot
8. **GIFs**: Record key flows with screen recorder

Total time: ~30 minutes for complete screenshot set.
