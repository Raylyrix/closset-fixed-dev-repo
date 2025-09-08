from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.responses import Response, JSONResponse
from fastapi import Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from typing import List, Dict, Any, Optional
import io
import shutil
import subprocess
import tempfile
import os
import sys
import math
try:
    from pyembroidery import EmbPattern, read, STITCH, JUMP, TRIM, COLOR_CHANGE, STOP, END
    _HAS_PYEMBROIDERY = True
except Exception:
    _HAS_PYEMBROIDERY = False
try:
    from svgpathtools import svg2paths2, Path as SvgPath
    _HAS_SVGPATHTOOLS = True
except Exception:
    _HAS_SVGPATHTOOLS = False

class GenerateFromPointsReq(BaseModel):
    """Request payload for /embroidery/generate_from_points."""
    # points in PIXEL space, relative to a canvas of given width/height
    points: List[Dict[str, float]]
    canvas_width: int
    canvas_height: int
    strategy: str = "outline"
    density: float = 1.0
    width_mm: float = 2.0
    passes: int = 1
    stitch_len_mm: float = 2.5
    mm_per_px: float = 0.26

class AIDesignReq(BaseModel):
    """Request payload for AI design generation."""
    description: str
    fabricType: str = "cotton"
    stitchComplexity: str = "beginner"
    threadCategory: str = "metallic"
    canvas_width: int = 800
    canvas_height: int = 600

class OptimizePathReq(BaseModel):
    """Request payload for stitch path optimization."""
    stitches: List[Dict[str, Any]]
    fabricPhysics: Dict[str, float]
    optimizationType: str = "efficiency"

class SuggestColorsReq(BaseModel):
    """Request payload for color suggestions."""
    currentStitches: List[Dict[str, Any]]
    fabricType: str = "cotton"
    designStyle: str = "professional"

class CollaborationReq(BaseModel):
    """Request payload for real-time collaboration."""
    userId: str
    action: str
    data: Dict[str, Any]

app = FastAPI(title="Closset AI Service")

# CORS for local dev and web app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _which(cmd: str) -> str:
    """Return full path if executable is available in PATH, else empty string."""
    from shutil import which
    return which(cmd) or ""

def detect_inkscape() -> Dict[str, Any]:
    """Detect Inkscape (required for Ink/Stitch)."""
    exe = _which("inkscape") or _which("inkscape.exe")
    version = None
    if exe:
        try:
            out = subprocess.check_output([exe, "--version"], stderr=subprocess.STDOUT, text=True)
            version = out.strip()
        except Exception:
            version = None
    return {"found": bool(exe), "path": exe, "version": version}

def stitch_flags_to_str(flags: int) -> str:
    """Map pyembroidery stitch flags to readable type."""
    if not _HAS_PYEMBROIDERY:
        return "stitch"

def _parse_color(s: Optional[str]) -> str:
    if not s:
        return "#000000"
    s = s.strip()
    # Simple pass-through for hex and rgb(a)
    return s

def svg_to_stitches(svg_bytes: bytes, *,
                    mm_per_px: float = 0.26,
                    stitch_len_mm: float = 2.5,
                    strategy: str = "outline",
                    density: float = 1.0,
                    width_mm: float = 2.0,
                    passes: int = 1) -> Dict[str, Any]:
    """Convert SVG into a stitch plan.

    strategy: 'outline' (sample along path), 'satin' (parallel outline; basic), 'fill' (basic hatch fill placeholder)
    density: multiplier for stitch density (1.0 = base)
    """
    if not _HAS_SVGPATHTOOLS:
        raise HTTPException(status_code=501, detail="svgpathtools not installed on the server")

    with tempfile.NamedTemporaryFile(suffix=".svg", delete=False) as tmp:
        tmp.write(svg_bytes)
        tmp.flush()
        svg_path = tmp.name
    try:
        paths, attrs, svg_attr = svg2paths2(svg_path)
        stitch_len_px = (stitch_len_mm / mm_per_px if mm_per_px > 0 else stitch_len_mm) / max(0.25, density)
        width_px = (width_mm / mm_per_px if mm_per_px > 0 else width_mm)
        points: List[Dict[str, Any]] = []
        layers: List[Dict[str, Any]] = []

        for i, p in enumerate(paths):
            a = attrs[i] if i < len(attrs) else {}
            stroke = _parse_color(a.get('stroke'))
            fill = _parse_color(a.get('fill')) if a.get('fill') not in (None, 'none') else None
            length = p.length(error=1e-3)
            if length <= 0:
                continue

            def sample_path(path: SvgPath, spacing: float) -> List[Dict[str, Any]]:
                n = max(1, int(path.length(error=1e-3) // max(0.5, spacing)))
                pts: List[Dict[str, Any]] = []
                for k in range(n + 1):
                    t = k / max(1, n)
                    z = path.point(t)
                    pts.append({"x": float(z.real), "y": float(z.imag), "type": "stitch"})
                return pts

            def sample_path_with_derivs(path: SvgPath, spacing: float) -> List[Dict[str, Any]]:
                n = max(1, int(path.length(error=1e-3) // max(0.5, spacing)))
                pts: List[Dict[str, Any]] = []
                for k in range(n + 1):
                    t = k / max(1, n)
                    z = path.point(t)
                    dz = path.derivative(t)
                    pts.append({
                        "x": float(z.real),
                        "y": float(z.imag),
                        "dx": float(dz.real),
                        "dy": float(dz.imag),
                        "type": "stitch"
                    })
                return pts

            layer_color = stroke or (fill or "#000000")
            layer_pts: List[Dict[str, Any]] = []

            if strategy == "outline":
                layer_pts = sample_path(p, stitch_len_px)
            elif strategy == "satin":
                # Basic satin: create zig-zag across path normals with given width and passes
                base = sample_path_with_derivs(p, stitch_len_px)
                gg: List[Dict[str, Any]] = []
                side = 1.0
                for b in base:
                    # normal = (-dy, dx) normalized
                    dx, dy = b.get("dx", 0.0), b.get("dy", 0.0)
                    mag = (dx*dx + dy*dy) ** 0.5 or 1.0
                    nx, ny = -dy / mag, dx / mag
                    # multiple passes reduce spacing between zig lines slightly
                    w = width_px
                    for pp in range(max(1, passes)):
                        off = (w * (1.0 - (pp / max(1, passes)))) * 0.5
                        gg.append({"x": b["x"] + side * off * nx, "y": b["y"] + side * off * ny, "type": "stitch"})
                    side *= -1.0
                layer_pts = gg
            elif strategy == "fill":
                # Simple banded fill along path direction: step along path and sweep small spans across normal
                base = sample_path_with_derivs(p, stitch_len_px)
                ff: List[Dict[str, Any]] = []
                bands = max(1, int(max(2.0, width_px) // max(1.0, stitch_len_px)))
                for b in base:
                    dx, dy = b.get("dx", 0.0), b.get("dy", 0.0)
                    mag = (dx*dx + dy*dy) ** 0.5 or 1.0
                    nx, ny = -dy / mag, dx / mag
                    # create a small row of stitches across width
                    for bi in range(-bands, bands + 1):
                        off = (bi / max(1, bands)) * (width_px * 0.5)
                        ff.append({"x": b["x"] + off * nx, "y": b["y"] + off * ny, "type": "stitch"})
                layer_pts = ff
            else:
                layer_pts = sample_path(p, stitch_len_px)

            # Attach color to first point of layer as a color_change marker
            if layer_pts:
                points.append({"x": layer_pts[0]["x"], "y": layer_pts[0]["y"], "type": "color_change", "color": layer_color})
                points.extend(layer_pts)
                layers.append({"index": i, "count": len(layer_pts), "color": layer_color})

        info = {
            "stitch_count": len([p for p in points if p.get("type") == "stitch"]),
            "layers": layers,
            "strategy": strategy,
            "mm_per_px": mm_per_px,
            "stitch_len_mm": stitch_len_mm,
            "width_mm": width_mm,
            "passes": passes,
        }
        return {"ok": True, "points": points, "info": info}
    finally:
        try:
            os.remove(svg_path)
        except Exception:
            pass

def running_stitches_to_dst(points: List[Dict[str, Any]]) -> bytes:
    if not _HAS_PYEMBROIDERY:
        raise HTTPException(status_code=501, detail="pyembroidery not installed on the server")
    pattern = EmbPattern()
    # Normalize to start at origin
    if not points:
        return b""
    x0 = points[0]["x"]; y0 = points[0]["y"]
    for i, pt in enumerate(points):
        x = float(pt["x"]) - x0
        y = float(pt["y"]) - y0
        pattern.add_stitch_absolute(x, y, STITCH)
    pattern.end()
    with tempfile.NamedTemporaryFile(suffix=".dst", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        # lazy import to ensure symbol exists
        from pyembroidery import write
        write(pattern, tmp_path)
        with open(tmp_path, "rb") as f:
            return f.read()
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass
    if flags & JUMP:
        return "jump"
    if flags & TRIM:
        return "trim"
    if flags & COLOR_CHANGE:
        return "color_change"
    if flags & STOP:
        return "stop"
    if flags & END:
        return "end"
    return "stitch"

def parse_machine_file_to_plan(data: bytes, fmt_hint: str = "dst") -> Dict[str, Any]:
    """Parse an uploaded machine file (e.g., DST/PES) into a JSON stitch plan."""
    if not _HAS_PYEMBROIDERY:
        raise HTTPException(status_code=501, detail="pyembroidery not installed on the server")
    with tempfile.NamedTemporaryFile(suffix=f".{fmt_hint}", delete=False) as tmp:
        tmp.write(data)
        tmp.flush()
        tmp_path = tmp.name
    try:
        pattern: EmbPattern = read(tmp_path)
        points: List[Dict[str, Any]] = []
        for stitch in pattern.stitches:
            x, y, flags = stitch[0], stitch[1], stitch[2]
            points.append({"x": float(x), "y": float(y), "type": stitch_flags_to_str(flags)})
        info = {
            "stitch_count": len([p for p in points if p["type"] == "stitch"]),
            "jump_count": len([p for p in points if p["type"] == "jump"]),
            "trim_count": len([p for p in points if p["type"] == "trim"]),
            "color_changes": len([p for p in points if p["type"] == "color_change"]),
        }
        return {"ok": True, "points": points, "info": info}
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/embroidery/inkstitch/health")
def inkstitch_health():
    """Report detection status for Inkscape (Ink/Stitch runs as an Inkscape extension)."""
    inkscape = detect_inkscape()
    return {
        "inkscape": inkscape,
        "pyembroidery": _HAS_PYEMBROIDERY,
        "message": "Ink/Stitch communicates via Inkscape extension; ensure Ink/Stitch is installed in Inkscape."
    }

@app.post("/embroidery/plan")
async def embroidery_plan(machine_file: UploadFile = File(...), format: str = Query("dst")):
    """Accept a machine file (DST/PES/...) and return a stitch plan JSON for 3D preview."""
    data = await machine_file.read()
    try:
        plan = parse_machine_file_to_plan(data, fmt_hint=format.lower())
        return JSONResponse(plan)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse machine file: {e}")

@app.post("/embroidery/generate")
async def embroidery_generate(
    svg_file: UploadFile = File(...),
    mm_per_px: float = Query(0.26, gt=0),
    stitch_len_mm: float = Query(2.5, gt=0),
    strategy: str = Query("outline"),
    density: float = Query(1.0, gt=0),
    return_dst: bool = Query(False)
):
    """Generate a stitch plan from an SVG using a chosen strategy.

    strategy = outline | satin | fill (basic fill placeholder)
    density  = density multiplier for stitches
    """
    data = await svg_file.read()
    plan = svg_to_stitches(
        data,
        mm_per_px=mm_per_px,
        stitch_len_mm=stitch_len_mm,
        strategy=strategy,
        density=density,
    )
    if not return_dst:
        return JSONResponse(plan)
    # Return DST binary from plan
    try:
        dst_bytes = running_stitches_to_dst(plan["points"])  # type: ignore
        return Response(dst_bytes, media_type="application/octet-stream")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export DST: {e}")

@app.post("/embroidery/export_from_points")
async def embroidery_export_from_points(
    payload: Dict[str, Any] = Body(..., description="{ points: [{x,y,type}], format?: 'dst' }")
):
    """Export machine file from raw stitch points (running stitches).

    Currently supports DST output only.
    """
    pts = payload.get("points") or []
    fmt = (payload.get("format") or "dst").lower()
    if fmt != "dst":
        raise HTTPException(status_code=400, detail="Only DST export is supported at the moment")
    try:
        dst_bytes = running_stitches_to_dst(pts)
        return Response(dst_bytes, media_type="application/octet-stream")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export from points: {e}")

@app.post("/embroidery/generate_from_points")
async def embroidery_generate_from_points(req: GenerateFromPointsReq):
    """Generate stitch plan from freehand polyline points in PIXEL space.

    Strategies:
    - outline: resample along the path at stitch_len_mm/density spacing.
    - satin: alternate offsets across path normals using width_mm and passes.
    - fill: create bands across normal around each resampled point.
    """
    pts = req.points or []
    if len(pts) < 2:
        return JSONResponse({"ok": True, "points": [], "info": {"stitch_count": 0}})

    stitch_len_px = (req.stitch_len_mm / req.mm_per_px if req.mm_per_px > 0 else req.stitch_len_mm)
    if req.density > 0:
        stitch_len_px = stitch_len_px / max(0.25, req.density)
    width_px = (req.width_mm / req.mm_per_px if req.mm_per_px > 0 else req.width_mm)

    def resample_polyline(points: List[Dict[str, float]], spacing: float) -> List[Dict[str, float]]:
        if len(points) < 2:
            return points
        out: List[Dict[str, float]] = []
        acc = 0.0
        out.append({"x": float(points[0]["x"]), "y": float(points[0]["y"])})
        for i in range(1, len(points)):
            x0, y0 = float(points[i-1]["x"]), float(points[i-1]["y"]) 
            x1, y1 = float(points[i]["x"]), float(points[i]["y"]) 
            dx, dy = x1-x0, y1-y0
            seg_len = math.hypot(dx, dy)
            if seg_len <= 1e-6:
                continue
            ux, uy = dx/seg_len, dy/seg_len
            while acc + spacing <= seg_len:
                acc += spacing
                out.append({"x": x0 + ux*acc, "y": y0 + uy*acc})
            acc = (acc + seg_len) % spacing
        if out[-1]["x"] != pts[-1]["x"] or out[-1]["y"] != pts[-1]["y"]:
            out.append({"x": float(pts[-1]["x"]), "y": float(pts[-1]["y"])})
        return out

    def tangent_at(points: List[Dict[str, float]], i: int) -> tuple:
        if i <= 0:
            x0, y0 = float(points[0]["x"]), float(points[0]["y"]) 
            x1, y1 = float(points[1]["x"]), float(points[1]["y"]) 
        elif i >= len(points)-1:
            x0, y0 = float(points[-2]["x"]), float(points[-2]["y"]) 
            x1, y1 = float(points[-1]["x"]), float(points[-1]["y"]) 
        else:
            x0, y0 = float(points[i-1]["x"]), float(points[i-1]["y"]) 
            x1, y1 = float(points[i+1]["x"]), float(points[i+1]["y"]) 
        dx, dy = x1-x0, y1-y0
        mag = math.hypot(dx, dy) or 1.0
        return (dx/mag, dy/mag)

    base = resample_polyline(pts, max(1.0, stitch_len_px))
    plan_pts: List[Dict[str, Any]] = []

    # Seed color as a single layer (client can colorize per stroke group later)
    plan_pts.append({"x": float(base[0]["x"]), "y": float(base[0]["y"]), "type": "color_change", "color": "#000000"})

    if req.strategy == "outline":
        for b in base:
            plan_pts.append({"x": float(b["x"]), "y": float(b["y"]), "type": "stitch"})
    elif req.strategy == "satin":
        side = 1.0
        for i, b in enumerate(base):
            tx, ty = tangent_at(base, i)
            nx, ny = -ty, tx
            # multi-pass offsets: narrower on later passes
            for pp in range(max(1, req.passes)):
                off = (width_px * (1.0 - (pp / max(1, req.passes)))) * 0.5
                plan_pts.append({
                    "x": float(b["x"]) + side * off * nx,
                    "y": float(b["y"]) + side * off * ny,
                    "type": "stitch"
                })
            side *= -1.0
    elif req.strategy == "zigzag":
        # Similar to satin but use a sawtooth spacing along the normal with fixed amplitude
        amp = width_px * 0.5
        step = max(1.0, stitch_len_px)
        toggle = 1.0
        for i, b in enumerate(base):
            tx, ty = tangent_at(base, i)
            nx, ny = -ty, tx
            plan_pts.append({
                "x": float(b["x"]) + toggle * amp * nx,
                "y": float(b["y"]) + toggle * amp * ny,
                "type": "stitch"
            })
            toggle *= -1.0
    elif req.strategy == "double_satin":
        # Two satin rails side-by-side
        for i, b in enumerate(base):
            tx, ty = tangent_at(base, i)
            nx, ny = -ty, tx
            offA = width_px * 0.25
            offB = width_px * 0.5
            plan_pts.append({"x": float(b["x"]) + offA * nx, "y": float(b["y"]) + offA * ny, "type": "stitch"})
            plan_pts.append({"x": float(b["x"]) - offB * nx, "y": float(b["y"]) - offB * ny, "type": "stitch"})
    elif req.strategy == "meander":
        # Sinusoidal meander around the path normal
        freq = max(0.2, 2.0 / max(1.0, stitch_len_px))
        phase = 0.0
        for i, b in enumerate(base):
            tx, ty = tangent_at(base, i)
            nx, ny = -ty, tx
            phase += freq
            off = math.sin(phase) * (width_px * 0.5)
            plan_pts.append({"x": float(b["x"]) + off * nx, "y": float(b["y"]) + off * ny, "type": "stitch"})
    elif req.strategy == "contour":
        # Multiple parallel contours around the centerline
        bands = max(1, int(max(2.0, width_px) // max(1.0, stitch_len_px)))
        for i, b in enumerate(base):
            tx, ty = tangent_at(base, i)
            nx, ny = -ty, tx
            for bi in range(-bands, bands + 1, 2):
                off = (bi / max(1, bands)) * (width_px * 0.5)
                plan_pts.append({"x": float(b["x"]) + off * nx, "y": float(b["y"]) + off * ny, "type": "stitch"})
    elif req.strategy == "ripple":
        # Radial-like ripple perpendicular to tangent with decaying amplitude
        phase = 0.0
        for i, b in enumerate(base):
            tx, ty = tangent_at(base, i)
            nx, ny = -ty, tx
            phase += 0.5
            amp = (0.5 + 0.5*math.sin(phase)) * (width_px * 0.5)
            plan_pts.append({"x": float(b["x"]) + amp * nx, "y": float(b["y"]) + amp * ny, "type": "stitch"})
    else:  # fill
        bands = max(1, int(max(2.0, width_px) // max(1.0, stitch_len_px)))
        for i, b in enumerate(base):
            tx, ty = tangent_at(base, i)
            nx, ny = -ty, tx
            for bi in range(-bands, bands + 1):
                off = (bi / max(1, bands)) * (width_px * 0.5)
                plan_pts.append({
                    "x": float(b["x"]) + off * nx,
                    "y": float(b["y"]) + off * ny,
                    "type": "stitch"
                })

    info = {
        "stitch_count": len([p for p in plan_pts if p.get("type") == "stitch"]),
        "strategy": req.strategy,
        "mm_per_px": req.mm_per_px,
        "stitch_len_mm": req.stitch_len_mm,
        "width_mm": req.width_mm,
        "passes": req.passes,
    }
    return JSONResponse({"ok": True, "points": plan_pts, "info": info})

# Revolutionary AI-Powered Endpoints

@app.post("/ai/generate-design")
async def generate_ai_design(req: AIDesignReq):
    """Generate AI-powered embroidery design based on description."""
    try:
        # AI-powered design generation logic
        stitch_types = {
            "beginner": ["satin", "fill", "outline"],
            "intermediate": ["satin", "fill", "outline", "cross-stitch", "chain"],
            "advanced": ["satin", "fill", "outline", "cross-stitch", "chain", "backstitch", 
                        "french-knot", "lazy-daisy", "feather"],
            "expert": ["satin", "fill", "outline", "cross-stitch", "chain", "backstitch",
                      "french-knot", "bullion", "lazy-daisy", "feather", "couching", "appliqué",
                      "seed", "stem", "metallic", "glow-thread", "variegated", "gradient"]
        }
        
        available_stitches = stitch_types.get(req.stitchComplexity, stitch_types["beginner"])
        
        # Generate design based on description
        if "flower" in req.description.lower():
            stitches = generate_flower_pattern(req.canvas_width, req.canvas_height, available_stitches)
        elif "heart" in req.description.lower():
            stitches = generate_heart_pattern(req.canvas_width, req.canvas_height, available_stitches)
        elif "star" in req.description.lower():
            stitches = generate_star_pattern(req.canvas_width, req.canvas_height, available_stitches)
        else:
            stitches = generate_abstract_pattern(req.description, req.canvas_width, req.canvas_height, available_stitches)
        
        suggestions = [
            {"type": "color", "suggestion": "Try metallic threads for a luxurious look"},
            {"type": "stitch", "suggestion": "Add french knots for texture"},
            {"type": "pattern", "suggestion": "Consider adding a border outline"}
        ]
        
        return JSONResponse({
            "ok": True,
            "stitches": stitches,
            "suggestions": suggestions,
            "design_analysis": {
                "complexity": req.stitchComplexity,
                "estimated_time": len(stitches) * 0.5,
                "thread_usage": calculate_thread_usage(stitches)
            }
        })
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)

@app.post("/ai/optimize-path")
async def optimize_stitch_path(req: OptimizePathReq):
    """Optimize stitch path using ML algorithms."""
    try:
        # ML-based path optimization
        optimized_stitches = optimize_stitch_sequence(req.stitches, req.fabricPhysics)
        
        return JSONResponse({
            "ok": True,
            "stitches": optimized_stitches,
            "optimization_stats": {
                "original_length": calculate_total_length(req.stitches),
                "optimized_length": calculate_total_length(optimized_stitches),
                "efficiency_gain": calculate_efficiency_gain(req.stitches, optimized_stitches)
            }
        })
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)

@app.post("/ai/suggest-colors")
async def suggest_thread_colors(req: SuggestColorsReq):
    """AI-powered color suggestions based on current design."""
    try:
        # Analyze current stitches and suggest complementary colors
        current_colors = [stitch.get("color", "#000000") for stitch in req.currentStitches]
        
        suggestions = generate_color_suggestions(current_colors, req.fabricType, req.designStyle)
        
        return JSONResponse({
            "ok": True,
            "colors": suggestions,
            "analysis": {
                "current_palette": current_colors,
                "suggested_theme": determine_color_theme(current_colors),
                "harmony_score": calculate_color_harmony(current_colors)
            }
        })
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)

@app.websocket("/collaborate")
async def websocket_collaboration(websocket):
    """Real-time collaboration WebSocket endpoint."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # Handle real-time collaboration updates
            await websocket.send_json({
                "type": "update_received",
                "data": data
            })
    except Exception as e:
        await websocket.close()

# Helper functions for AI features

def generate_flower_pattern(width: int, height: int, stitch_types: List[str]) -> List[Dict]:
    """Generate a flower pattern using available stitch types."""
    center_x, center_y = width // 2, height // 2
    stitches = []
    
    # Center with french knot if available
    if "french-knot" in stitch_types:
        stitches.append({
            "id": "flower_center",
            "type": "french-knot",
            "points": [{"x": center_x, "y": center_y}],
            "color": "#FFD700",
            "thickness": 3,
            "opacity": 1.0
        })
    
    # Petals with lazy daisy if available
    if "lazy-daisy" in stitch_types:
        for i in range(8):
            angle = (i * 45) * math.pi / 180
            petal_x = center_x + 30 * math.cos(angle)
            petal_y = center_y + 30 * math.sin(angle)
            stitches.append({
                "id": f"petal_{i}",
                "type": "lazy-daisy",
                "points": [{"x": center_x, "y": center_y}, {"x": petal_x, "y": petal_y}],
                "color": "#FF69B4",
                "thickness": 2,
                "opacity": 1.0
            })
    
    return stitches

def generate_heart_pattern(width: int, height: int, stitch_types: List[str]) -> List[Dict]:
    """Generate a heart pattern."""
    center_x, center_y = width // 2, height // 2
    stitches = []
    
    # Heart outline
    heart_points = [
        {"x": center_x, "y": center_y + 20},
        {"x": center_x - 15, "y": center_y - 10},
        {"x": center_x - 25, "y": center_y - 5},
        {"x": center_x - 20, "y": center_y + 5},
        {"x": center_x, "y": center_y + 25},
        {"x": center_x + 20, "y": center_y + 5},
        {"x": center_x + 25, "y": center_y - 5},
        {"x": center_x + 15, "y": center_y - 10}
    ]
    
    stitches.append({
        "id": "heart_outline",
        "type": "outline",
        "points": heart_points,
        "color": "#FF0000",
        "thickness": 3,
        "opacity": 1.0
    })
    
    return stitches

def generate_star_pattern(width: int, height: int, stitch_types: List[str]) -> List[Dict]:
    """Generate a star pattern."""
    center_x, center_y = width // 2, height // 2
    stitches = []
    
    # 5-pointed star
    star_points = []
    for i in range(10):
        angle = (i * 36) * math.pi / 180
        radius = 25 if i % 2 == 0 else 12
        x = center_x + radius * math.cos(angle - math.pi/2)
        y = center_y + radius * math.sin(angle - math.pi/2)
        star_points.append({"x": x, "y": y})
    
    stitches.append({
        "id": "star",
        "type": "fill",
        "points": star_points,
        "color": "#FFD700",
        "thickness": 2,
        "opacity": 1.0
    })
    
    return stitches

def generate_abstract_pattern(description: str, width: int, height: int, stitch_types: List[str]) -> List[Dict]:
    """Generate abstract pattern based on description."""
    stitches = []
    
    # Simple abstract pattern based on description keywords
    if "geometric" in description.lower():
        # Create geometric shapes
        for i in range(5):
            x = (width // 6) * (i + 1)
            y = height // 2
            stitches.append({
                "id": f"geometric_{i}",
                "type": "fill",
                "points": [
                    {"x": x - 10, "y": y - 10},
                    {"x": x + 10, "y": y - 10},
                    {"x": x + 10, "y": y + 10},
                    {"x": x - 10, "y": y + 10}
                ],
                "color": f"hsl({i * 72}, 70%, 50%)",
                "thickness": 2,
                "opacity": 1.0
            })
    
    return stitches

def optimize_stitch_sequence(stitches: List[Dict], fabric_physics: Dict) -> List[Dict]:
    """Optimize stitch sequence for efficiency."""
    # Simple optimization: sort by distance
    if not stitches:
        return stitches
    
    optimized = [stitches[0]]
    remaining = stitches[1:]
    
    while remaining:
        last_stitch = optimized[-1]
        last_point = last_stitch["points"][-1] if last_stitch["points"] else {"x": 0, "y": 0}
        
        # Find closest next stitch
        closest_idx = 0
        min_distance = float('inf')
        
        for i, stitch in enumerate(remaining):
            if stitch["points"]:
                first_point = stitch["points"][0]
                distance = math.sqrt(
                    (first_point["x"] - last_point["x"])**2 + 
                    (first_point["y"] - last_point["y"])**2
                )
                if distance < min_distance:
                    min_distance = distance
                    closest_idx = i
        
        optimized.append(remaining.pop(closest_idx))
    
    return optimized

def calculate_total_length(stitches: List[Dict]) -> float:
    """Calculate total stitch length."""
    total = 0
    for stitch in stitches:
        points = stitch.get("points", [])
        for i in range(len(points) - 1):
            p1, p2 = points[i], points[i + 1]
            total += math.sqrt((p2["x"] - p1["x"])**2 + (p2["y"] - p1["y"])**2)
    return total

def calculate_efficiency_gain(original: List[Dict], optimized: List[Dict]) -> float:
    """Calculate efficiency gain percentage."""
    original_length = calculate_total_length(original)
    optimized_length = calculate_total_length(optimized)
    return ((original_length - optimized_length) / original_length) * 100 if original_length > 0 else 0

def generate_color_suggestions(current_colors: List[str], fabric_type: str, design_style: str) -> List[str]:
    """Generate color suggestions based on current palette."""
    suggestions = []
    
    # Add complementary colors
    for color in current_colors[:3]:  # Limit to first 3 colors
        if color.startswith('#'):
            # Simple complementary color generation
            r = int(color[1:3], 16)
            g = int(color[3:5], 16)
            b = int(color[5:7], 16)
            comp_r = 255 - r
            comp_g = 255 - g
            comp_b = 255 - b
            suggestions.append(f"#{comp_r:02x}{comp_g:02x}{comp_b:02x}")
    
    # Add fabric-appropriate colors
    if fabric_type == "cotton":
        suggestions.extend(["#FFFFFF", "#F5F5F5", "#E0E0E0"])
    elif fabric_type == "silk":
        suggestions.extend(["#FFD700", "#C0C0C0", "#E6E6FA"])
    elif fabric_type == "denim":
        suggestions.extend(["#000080", "#4169E1", "#87CEEB"])
    
    return suggestions[:5]  # Return top 5 suggestions

def determine_color_theme(colors: List[str]) -> str:
    """Determine the color theme of the current palette."""
    if not colors:
        return "neutral"
    
    # Simple theme detection based on color analysis
    warm_colors = ["red", "orange", "yellow", "pink"]
    cool_colors = ["blue", "green", "purple", "cyan"]
    
    warm_count = sum(1 for color in colors if any(warm in color.lower() for warm in warm_colors))
    cool_count = sum(1 for color in colors if any(cool in color.lower() for cool in cool_colors))
    
    if warm_count > cool_count:
        return "warm"
    elif cool_count > warm_count:
        return "cool"
    else:
        return "balanced"

def calculate_color_harmony(colors: List[str]) -> float:
    """Calculate color harmony score (0-100)."""
    if len(colors) < 2:
        return 100.0
    
    # Simple harmony calculation based on color distance
    total_distance = 0
    comparisons = 0
    
    for i in range(len(colors)):
        for j in range(i + 1, len(colors)):
            # Convert hex to RGB and calculate distance
            try:
                r1, g1, b1 = int(colors[i][1:3], 16), int(colors[i][3:5], 16), int(colors[i][5:7], 16)
                r2, g2, b2 = int(colors[j][1:3], 16), int(colors[j][3:5], 16), int(colors[j][5:7], 16)
                distance = math.sqrt((r2-r1)**2 + (g2-g1)**2 + (b2-b1)**2)
                total_distance += distance
                comparisons += 1
            except:
                continue
    
    if comparisons == 0:
        return 100.0
    
    avg_distance = total_distance / comparisons
    # Normalize to 0-100 scale (closer to 0 = more harmonious)
    harmony_score = max(0, 100 - (avg_distance / 441) * 100)  # 441 is max RGB distance
    return harmony_score

def calculate_thread_usage(stitches: List[Dict]) -> Dict[str, float]:
    """Calculate estimated thread usage in meters."""
    total_length = calculate_total_length(stitches)
    # Convert pixels to meters (assuming 0.26mm per pixel)
    meters = (total_length * 0.26) / 1000
    return {
        "total_meters": round(meters, 2),
        "estimated_cost": round(meters * 0.5, 2),  # $0.50 per meter estimate
        "stitch_count": len(stitches)
    }

@app.post("/upscale")
async def upscale(image: UploadFile = File(...), scale: int = Query(2, ge=2, le=4)):
    # Placeholder LANCZOS upscale. Swap with Real-ESRGAN / StableSR in production.
    data = await image.read()
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    w, h = im.size
    up = im.resize((w * scale, h * scale), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    up.save(buf, format="PNG")
    return Response(buf.getvalue(), media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


