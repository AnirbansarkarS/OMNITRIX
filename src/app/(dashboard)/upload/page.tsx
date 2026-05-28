import DropZone from "@/components/uploader/DropZone";

export default function UploadPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-omni-text mb-1">Upload Model</h1>
                <p className="text-omni-muted text-sm">
                    Upload a 3D file to view and export it. GLB, GLTF, OBJ, STL, and FBX are supported.
                </p>
            </div>

            <DropZone />

            {/* Tips */}
            <div className="glass-card p-5 space-y-3">
                <h2 className="text-sm font-semibold text-omni-text">Tips</h2>
                <ul className="space-y-2 text-xs text-omni-muted">
                    {[
                        "GLB/GLTF includes textures and animations — best for fully textured models.",
                        "OBJ files load faster but materials (.mtl) are not auto-loaded.",
                        "STL files are rendered with a default green PBR material.",
                        "FBX supports rigged characters with animations.",
                        "Keep files under 100 MB for best performance.",
                    ].map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                            <span className="text-omni-accent mt-0.5">·</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
