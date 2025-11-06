# Formula-1 Portfolio - Vaibhav Lodhiya

A cinematic, interactive Formula-1 themed portfolio website built with React, TypeScript, Three.js, and React Three Fiber.

## 🚀 Features

### Cinematic Experience
- **Intro Animation**: High-production intro with driver walking to car, boarding animation, and helmet POV transition
- **Auto-Driving**: Car automatically moves forward at constant speed
- **Steering Control**: Use arrow keys (← →) or A/D keys to steer left and right
- **Checkpoint System**: Five interactive checkpoints along the track:
  - Turn 1: Experiences
  - Turn 2: About Me
  - Turn 3: Projects
  - Turn 4: Tech Stack
  - Turn 5: Resume
- **Collision Detection**: Automatic modal triggers when car reaches checkpoints
- **Finish Cinematic**: Celebration sequence with final overlay

### Interactive UI
- **Glass-morphism Modals**: Beautiful, accessible popups with:
  - Close button (X) or ESC key to close
  - Skip button to bypass checkpoints
  - Resume download functionality
- **HUD System**: Real-time heads-up display showing:
  - Next checkpoint label
  - Progress bar (checkpoints completed)
  - Mini-map with car position indicator
  - Persistent skip button
- **Keyboard Controls**: Full keyboard navigation and accessibility

### Technical Highlights
- **3D Rendering**: React Three Fiber with Drei helpers
- **Animation**: GSAP for cinematic timelines, Framer Motion for UI
- **State Management**: Zustand for global state
- **Styling**: TailwindCSS with custom glass-morphism effects
- **Audio**: Dynamic audio system with fade transitions (crowd, engine, finish)

## 📦 Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**:
```bash
npm install
```

3. **Add 3D Models**:
   - Copy your `f1_car.glb` file to `public/assets/models/f1_car.glb`
   - Copy your `driver.glb` file to `public/assets/models/driver.glb`

4. **Add Resume** (optional):
   - Replace `public/assets/resume.pdf` with your actual resume PDF

5. **Add Audio Files** (optional):
   - `public/assets/audio/crowd.mp3` - Crowd ambience
   - `public/assets/audio/engine.mp3` - Engine sound
   - `public/assets/audio/finish.mp3` - Finish celebration

## 🎮 Usage

### Development
```bash
npm run dev
```

The app will run on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎯 How to Use

1. **Loading**: Wait for the 3D models to load
2. **Intro**: Watch the cinematic intro animation
3. **Driving**: After intro, the car starts automatically
4. **Steering**: Use arrow keys (← →) or A/D to steer
5. **Checkpoints**: Drive through the glowing checkpoint boxes
6. **Modals**: When you hit a checkpoint, a modal opens with that section's content
7. **Skip**: Click "Skip" in the modal or HUD to bypass a checkpoint
8. **Finish**: Complete all checkpoints to see the finish celebration

## 📁 Project Structure

```
Portfolio_f1/
├── public/
│   └── assets/
│       ├── models/          # 3D model files (.glb)
│       ├── audio/           # Audio files (.mp3)
│       └── resume.pdf       # Resume PDF
├── src/
│   ├── components/
│   │   ├── F1Scene.tsx      # Main 3D scene
│   │   ├── Car.tsx          # Car component with physics
│   │   ├── Driver.tsx       # Driver with animations
│   │   ├── Checkpoints.tsx  # Checkpoint system
│   │   ├── Track.tsx        # Procedural track
│   │   ├── FinishLine.tsx   # Finish line elements
│   │   ├── PopUpModal.tsx   # Modal component
│   │   ├── HUD.tsx          # Heads-up display
│   │   ├── FinishOverlay.tsx # Finish screen
│   │   └── Audio.tsx        # Audio controller
│   ├── store/
│   │   └── useStore.ts      # Zustand store
│   ├── hooks/
│   │   └── useControls.ts   # Keyboard controls
│   ├── data/
│   │   └── content.json     # Portfolio content
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
└── package.json
```

## ⚙️ Configuration

### Update Portfolio Content

Edit `src/data/content.json` to customize:
- About Me section
- Experiences
- Projects
- Tech Stack
- Resume download link

### Adjust Checkpoint Positions

Edit checkpoint positions in `src/store/useStore.ts`:
```typescript
const initialCheckpoints: CheckpointState[] = [
  { id: 0, label: 'Experiences', position: [5, 2, -8] },
  // ... adjust positions as needed
];
```

### Customize Car Speed

In `src/store/useStore.ts`:
```typescript
carSpeed: 0.05, // Adjust this value (higher = faster)
```

## 🎨 Customization

### Colors & Styling
- Edit Tailwind classes in components for color scheme
- Modify glass-morphism effects in modal components
- Adjust track colors in `Track.tsx`

### Camera Behavior
- Modify camera animations in `F1Scene.tsx`
- Adjust helmet POV position in `Car.tsx`

### Audio
- Replace audio files in `public/assets/audio/`
- Adjust volume levels in `Audio.tsx`

## 🚧 Requirements

### Required Models
- `f1_car.glb` - F1 car 3D model
- `driver.glb` - Driver 3D model with animations

### Optional Assets
- Audio files for enhanced experience
- Higher quality textures for track/environment

## 📝 Notes

- The app uses procedural placeholders for grandstands, barriers, and track elements
- Audio playback requires user interaction in some browsers (autoplay restrictions)
- Model loading uses React Suspense for smooth experience
- All modals are keyboard accessible (ESC to close, Tab navigation)

## 🔧 Troubleshooting

### Models Not Loading
- Ensure `.glb` files are in `public/assets/models/`
- Check browser console for errors
- Verify file paths match exactly (case-sensitive)

### Audio Not Playing
- Some browsers block autoplay - user interaction required
- Check browser console for autoplay policy errors
- Ensure audio files exist in `public/assets/audio/`

### Performance Issues
- Reduce checkpoint count if needed
- Lower quality in model files
- Disable post-processing effects if required

## 📄 License

This project is created for Vaibhav Lodhiya's portfolio.

## 🎉 Credits

Built with:
- React + TypeScript
- Vite
- React Three Fiber
- Drei
- GSAP
- Zustand
- Framer Motion
- TailwindCSS
- Three.js

---

**Ready to race? Start the dev server and enjoy the ride! 🏁**



