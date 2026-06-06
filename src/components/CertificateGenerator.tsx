import React, { useEffect, useRef } from "react";
import { X, Download, ShieldCheck } from "lucide-react";

interface CertificateGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  moduleTitle: string;
  date: string;
  verificationCode: string;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  isOpen,
  onClose,
  username,
  moduleTitle,
  date,
  verificationCode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      drawCertificate();
    }
  }, [isOpen, username, moduleTitle, date, verificationCode]);

  if (!isOpen) return null;

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set resolution: 1000x700 for high quality
    canvas.width = 1000;
    canvas.height = 700;

    // 1. Draw Deep Space Background Gradient
    const bgGrad = ctx.createRadialGradient(500, 350, 100, 500, 350, 600);
    bgGrad.addColorStop(0, "#111827"); // deep slate
    bgGrad.addColorStop(1, "#070B13"); // cosmic black
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 700);

    // 2. Draw outer border (cyan neon glow)
    ctx.strokeStyle = "#06B6D4";
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 940, 640);

    // 3. Draw inner border (gold/orange)
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 910, 610);

    // 4. Draw corner decorative elements
    drawCornerDecorations(ctx);

    // 5. Draw Header text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 16px Outfit, 'Courier New'";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("JAVASCRIPT CODING ACADEMY", 500, 120);

    // Star separator
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#F59E0B";
    ctx.fillText("★  ★  ★  ★  ★", 500, 155);

    // 6. Draw Certificate of Completion title
    ctx.font = "bold 44px Outfit, sans-serif";
    // Gold gradient for title text
    const titleGrad = ctx.createLinearGradient(300, 0, 700, 0);
    titleGrad.addColorStop(0, "#F59E0B");
    titleGrad.addColorStop(1, "#FDE047");
    ctx.fillStyle = titleGrad;
    ctx.fillText("CERTIFICATE OF COMPLETION", 500, 210);

    // 7. Award statement
    ctx.font = "16px 'Outfit', sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("This document is proudly presented to", 500, 280);

    // 8. Student Name
    ctx.font = "extrabold 52px 'Outfit', sans-serif";
    // Cyan gradient for name
    const nameGrad = ctx.createLinearGradient(300, 0, 700, 0);
    nameGrad.addColorStop(0, "#06B6D4");
    nameGrad.addColorStop(1, "#8B5CF6");
    ctx.fillStyle = nameGrad;
    ctx.fillText(username.toUpperCase(), 500, 345);

    // Underline name
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(250, 385);
    ctx.lineTo(750, 385);
    ctx.stroke();

    // 9. Achievement statement
    ctx.font = "16px 'Outfit', sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("for successfully completing and passing the curriculum module:", 500, 420);

    // 10. Module Title
    ctx.font = "bold 32px 'Outfit', sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(moduleTitle, 500, 470);

    // 11. Footer: Verification Code & Date & Seal
    // Date
    ctx.textAlign = "left";
    ctx.font = "14px 'Outfit', sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText(`DATE: ${date}`, 100, 570);

    // Verification Code
    ctx.textAlign = "right";
    ctx.fillText(`VERIFICATION CODE: ${verificationCode}`, 900, 570);

    // Signatures
    ctx.textAlign = "center";
    ctx.font = "italic 16px 'Courier New'";
    ctx.fillStyle = "#E2E8F0";
    ctx.fillText("JS AI Tutor", 250, 560);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText("INSTRUCTOR SIGNATURE", 250, 580);
    
    // Draw signature line
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(170, 545);
    ctx.lineTo(330, 545);
    ctx.stroke();

    // Verification Seal Graphic
    drawVerificationSeal(ctx, 500, 565);
  };

  const drawCornerDecorations = (ctx: CanvasRenderingContext2D) => {
    const corners = [
      { x: 45, y: 45, dx: 1, dy: 1 },     // Top-Left
      { x: 955, y: 45, dx: -1, dy: 1 },   // Top-Right
      { x: 45, y: 655, dx: 1, dy: -1 },   // Bottom-Left
      { x: 955, y: 655, dx: -1, dy: -1 }, // Bottom-Right
    ];

    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 3;

    corners.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + 40 * c.dy);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x + 40 * c.dx, c.y);
      ctx.stroke();
    });
  };

  const drawVerificationSeal = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Outer seal circle
    ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.stroke();

    // Inner seal circle
    ctx.fillStyle = "rgba(6, 182, 212, 0.05)";
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Check mark inside seal
    ctx.strokeStyle = "#06B6D4";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 1);
    ctx.lineTo(x - 2, y + 7);
    ctx.lineTo(x + 10, y - 5);
    ctx.stroke();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `JS-Certificate-${moduleTitle.replace(/\s+/g, "-")}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="cert-drawer-overlay">
      <div className="cert-card-panel glass-card">
        {/* Header toolbar */}
        <div className="workspace-header select-none" style={{ width: "100%", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck style={{ width: "20px", height: "20px", color: "var(--color-green)" }} />
            <h2 className="workspace-header-title">Official Certificate Portal</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleDownload}
              className="cert-view-btn primary-btn-green"
              style={{ border: "none" }}
            >
              <Download style={{ width: "14px", height: "14px" }} />
              Download PNG
            </button>
            <button
              onClick={onClose}
              className="settings-close-btn"
            >
              <X style={{ width: "20px", height: "20px" }} />
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="cert-canvas-frame">
          <canvas
            ref={canvasRef}
            style={{ width: "100%", maxHeight: "500px", objectFit: "contain" }}
          />
        </div>
      </div>
    </div>
  );
};
