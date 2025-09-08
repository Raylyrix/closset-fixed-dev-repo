# Closset Hybrid Embroidery System

A powerful hybrid embroidery design system that combines real-time canvas rendering with professional embroidery file generation using `letink`/`pyembroidery` backend.

## 🎯 Features

### Frontend (React/TypeScript)
- **Real-time Canvas Rendering**: High-quality, hyperrealistic stitch visualization
- **Multiple Stitch Types**: Satin, fill, outline, cross-stitch, chain, backstitch
- **Professional Tools**: Pattern library, stitch direction, spacing controls
- **AI Integration**: Pattern analysis and generation using OpenRouter API
- **Interactive Design**: Mouse-based drawing with real-time preview

### Backend (Python/FastAPI)
- **Professional Stitch Generation**: Using `letink` and `pyembroidery` libraries
- **File Export**: DST, PES, EXP, JEF, VP3 formats
- **File Import**: Parse existing embroidery files
- **Stitch Optimization**: Professional algorithms for stitch placement
- **SVG Processing**: Convert SVG designs to embroidery patterns

## 🚀 Quick Start

### 1. Start the Backend Service

**Windows:**
```bash
start-backend.bat
```

**Linux/Mac:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

### 2. Start the Frontend

```bash
cd apps/web
npm install
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:5173 (or 5174, 5175, 5176)
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   letink/       │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   pyembroidery  │
│                 │    │                 │    │                 │
│ • Canvas 2D     │    │ • File Export   │    │ • DST/PES/EXP   │
│ • Real-time UI  │    │ • Stitch Gen    │    │ • SVG Processing│
│ • AI Integration│    │ • Optimization  │    │ • Professional  │
│ • Pattern Lib   │    │ • File Import   │    │   Algorithms    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎨 Usage

### Drawing Embroidery
1. Select a stitch type (satin, fill, outline, etc.)
2. Choose thread color and thickness
3. Draw on the canvas by clicking and dragging
4. Use pattern library for predefined designs

### Professional Export
1. Ensure backend service is running (green indicator)
2. Click "Export Options" to select format (DST, PES, EXP)
3. Click "Export File" to download professional embroidery file
4. Use "Optimize" to improve stitch quality using backend algorithms

### File Import
1. Click "Import File" to load existing embroidery files
2. Supported formats: DST, PES, EXP, JEF, VP3
3. Imported designs will appear on the canvas

## 🔧 Configuration

### Backend Configuration
Edit `apps/web/src/services/embroideryBackendService.ts`:

```typescript
const config: EmbroideryBackendConfig = {
  baseUrl: 'http://localhost:8000',  // Backend URL
  timeout: 30000                     // Request timeout
};
```

### Stitch Parameters
- **Density**: Controls stitch density (0.1 - 2.0)
- **Thickness**: Thread thickness in pixels
- **Spacing**: Distance between stitches
- **Direction**: Horizontal, vertical, diagonal, radial

## 📁 File Structure

```
├── apps/
│   ├── web/                          # Frontend React app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── EmbroideryTool.tsx    # Main embroidery component
│   │   │   └── services/
│   │   │       ├── embroideryService.ts      # AI integration
│   │   │       └── embroideryBackendService.ts # Backend integration
│   │   └── package.json
│   └── ai/                           # Backend Python service
│       ├── main.py                   # FastAPI application
│       ├── requirements.txt          # Python dependencies
│       └── venv/                     # Virtual environment
├── letink/                           # InkStitch/letink library
├── start-backend.bat                 # Windows startup script
├── start-backend.sh                  # Linux/Mac startup script
└── HYBRID_SYSTEM_README.md          # This file
```

## 🛠️ Development

### Adding New Stitch Types
1. Add stitch type to `EmbroideryStitch` interface
2. Implement rendering logic in `drawStitch` function
3. Add backend conversion in `convertStitchesToBackendFormat`

### Adding New Export Formats
1. Update `exportFormat` type in frontend
2. Add format support in backend `main.py`
3. Update file extension handling

### Customizing AI Analysis
1. Modify prompts in `embroideryService.ts`
2. Adjust analysis parameters
3. Add new analysis categories

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure Python 3.8+ is installed
- Check if port 8000 is available
- Verify all dependencies are installed
- Check console for error messages

### Frontend Issues
- Clear browser cache
- Check browser console for errors
- Ensure backend is running
- Verify CORS settings

### File Export Problems
- Check backend service status
- Verify file format support
- Check browser download permissions
- Review backend logs

## 📚 API Reference

### Backend Endpoints

- `GET /health` - Service health check
- `GET /embroidery/inkstitch/health` - InkStitch status
- `POST /embroidery/generate_from_points` - Generate from points
- `POST /embroidery/export_from_points` - Export to file
- `POST /embroidery/generate` - Generate from SVG
- `POST /embroidery/plan` - Parse machine file

### Frontend Services

- `embroideryBackend.checkHealth()` - Check connection
- `embroideryBackend.generateFromPoints()` - Generate stitches
- `embroideryBackend.exportFromPoints()` - Export file
- `embroideryBackend.parseMachineFile()` - Import file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Closset application suite.

## 🙏 Acknowledgments

- **InkStitch/letink**: Professional embroidery library
- **pyembroidery**: Python embroidery file handling
- **FastAPI**: Modern Python web framework
- **React**: Frontend framework
- **Three.js**: 3D rendering

---

**Happy Embroidering! 🧵✨**
