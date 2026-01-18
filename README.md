# Three.js Product Viewer - Features & Usage

Three.js product viewer featuring HDRI environment presets, shadow controls, ground shadow catcher, post‑processing bloom, camera presets, auto‑rotation, color and texture customization, screenshot export, and responsive UI with model upload.

---

#### 🔗 Live demo
https://universal-coding-experiments.github.io/three.js-product-viewer/

---

## ✨ Key Features

### 1. **Model Upload (NEW)**
- **Drag & Drop**: Drag .glb or .gltf files directly onto the upload zone
- **Click to Upload**: Click the upload area to select files from your computer
- **Real-time Feedback**: See loading status and confirmation messages
- **Multiple Models**: Upload different models to compare and view

### 2. **3D Viewer**
- **Orbit Controls**: Rotate, zoom, and pan the model freely
- **Multiple Camera Presets**: Front, Side, Top views for quick perspective changes
- **Auto-Rotate**: Enable automatic rotation to showcase the model
- **Fullscreen Mode**: View in immersive fullscreen

### 3. **Lighting & Shadows**
- **Shadow Quality**: Low, Medium, High quality options
- **Grid Helper**: Toggle ground grid for reference
- **Professional Lighting**: Hemisphere + Directional lights for realistic rendering

### 4. **Customization**
- **Color Picker**: Change model color in real-time
- **Texture Support**: Apply textures to the model (add .jpg files to `/textures/` folder)
- **Reset Appearance**: Restore original colors and textures instantly
- **HDRI Environments**: Load high-quality environment maps (add .hdr files to `/hdr/` folder)

### 5. **Export**
- **High-Quality Screenshots**: 2x resolution PNG exports with timestamps
- **Easy Download**: Screenshots automatically download to your computer

### 6. **Theme**
- **Light/Dark Background**: Switch between light gray and dark backgrounds
- **Transparent Mode**: Clear background for green-screen compositing

---

## 📁 File Structure

```
/
├── index.html              # Main page
├── script.js               # Application logic
├── style.css               # Legacy styles (CSS already in HTML)
├── product.glb             # Default 3D model (place your model here)
├── /libs/                  # Three.js libraries
│   ├── three.module.js
│   ├── OrbitControls.js
│   ├── GLTFLoader.js
│   └── RGBELoader.js
├── /textures/              # Optional: Add your texture files here
│   ├── matte.jpg
│   ├── glossy.jpg
│   └── pattern.jpg
└── /hdr/                   # Optional: Add your HDRI files here
    ├── studio_small.hdr
    ├── venice_sunset_1k.hdr
    └── empty_warehouse.hdr
```

---

## 🎨 Customization Guide

### Add Custom Textures
1. Create a `/textures/` folder in the root directory
2. Add your texture images (.jpg, .png)
3. The texture names will appear in the "Appearance" > Texture dropdown
4. Edit the HTML `<select>` options to add your custom textures

**Example:**
```html
<option value="my-texture.jpg">My Texture</option>
```

### Add Custom HDRI Maps
1. Create a `/hdr/` folder in the root directory
2. Add your HDR/RGBE files (.hdr)
3. The HDRI names will appear in the "Background" > Environment dropdown
4. Edit the HTML `<select>` options to add your custom HDRIs

**Example:**
```html
<option value="my-hdri.hdr">My Environment</option>
```

### Change Default Model
- Replace `product.glb` with your own model
- Or upload a different .glb file using the Model upload feature

---

## 🎮 Controls

| Action | Input |
|--------|-------|
| **Rotate** | Click + Drag / Single Touch Drag |
| **Zoom** | Mouse Wheel / Touch Pinch |
| **Pan** | Right Click + Drag / Middle Mouse + Drag / Ctrl + Left Click |
| **Preset Views** | Front, Side, Top buttons |
| **Auto Rotate** | Toggle checkbox |
| **Upload Model** | Drag & drop or click upload zone |

---

## ⚙️ Technical Details

- **Framework**: Three.js r160
- **Renderer**: WebGL with PCFSoftShadowMap
- **UI**: Tailwind CSS with glass-morphism design
- **Responsive**: Mobile-friendly responsive layout
- **File Support**: .glb, .gltf (3D models), .hdr (HDRI), .jpg/.png (Textures)

---

## 🐛 Troubleshooting

**Model won't load:**
- Ensure product.glb exists in the root directory
- Check browser console for error messages
- Verify the .glb file is valid

**Textures not showing:**
- Add .jpg/.png files to `/textures/` folder
- Edit HTML to add new texture options
- Model must support UV mapping

**HDRI not changing:**
- Add .hdr files to `/hdr/` folder
- Edit HTML to add new HDRI options
- Wait for loading indicator to disappear

**Text hard to read:**
- Light text in light theme is fixed - use light theme for best contrast
- Dark theme provides good visibility in dark mode

---

## 📝 Version History

- **v2.0** - Added drag-and-drop GLB upload, fixed text visibility, removed bloom effect
- **v1.0** - Initial release with basic viewer functionality

---

## Tech Stack

### 🖥️ Frontend Frameworks & Styling
- HTML5 — structure of the viewer and UI.
- CSS3 + TailwindCSS — utility‑first styling, responsive design, dark/light theme support, glassmorphism effects.
- Custom CSS overrides — for buttons, selects, tooltips, and glass card backgrounds.

### 🎨 3D & Graphics
- Three.js — core WebGL library for rendering 3D models.
- OrbitControls — camera interaction (pan, zoom, rotate).
- GLTFLoader — loads .glb / .gltf models.
- RGBELoader + PMREMGenerator — loads HDRI environment maps for realistic reflections.
- ShadowMaterial — ground shadow catcher for realism.

---

## 🚀 Getting Started
1. Clone the repo

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Universal-Coding-Experiments/three.js-product-viewer.git
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create your feature branch  
3. Commit your changes  
4. Open a Pull Request  

---

## 📜 License

This project is open-source and available under the **MIT License**.

---

## 🌟 Support

If you like this project, please ⭐ star the repository  
and share the demo with others.

---

## 📫 How to Reach Me
- 👨‍💻 **Author:** Sanjaya Suraweera (CipherNyx)  
- 🐙 **GitHub:** [CipherNyx](https://github.com/CipherNyx)  
- 📧 **Email:** sasbsuraweera@gmail.com  
- 💼 **LinkedIn:** [sanjaya-suraweera](https://www.linkedin.com/in/sanjaya-suraweera/)  
- 📺 **YouTube:** [SanjayaSuraweera](https://www.youtube.com/@SanjayaSuraweera)  
- 📷 **Instagram:** [sanjaya_suraweera](https://www.instagram.com/sanjaya_suraweera/)  
- 🎵 **TikTok:** [nits_mind](https://www.tiktok.com/@nits_mind)  
- 📘 **Facebook:** [sanjaya.bandara.suraweera](https://www.facebook.com/sanjaya.bandara.suraweera/)

---