import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components.js";

function initCanvas() {
  const canvas = document.getElementById("liquid-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  if (!canvas || !ctx) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const maxTrails = 36;
  let width = 0;
  let height = 0;
  let animationFrameId = 0;
  let trails = [];

  function resizeCanvas() {
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * devicePixelRatio);
    canvas.height = Math.floor(height * devicePixelRatio);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function addTrail(event) {
    if (reducedMotion.matches) {
      return;
    }

    trails.push({
      x: event.clientX,
      y: event.clientY,
      vx: (Math.random() - 0.5) * 1.8,
      vy: (Math.random() - 0.5) * 1.8,
      size: 28 + Math.random() * 20,
      life: 1,
    });

    if (trails.length > maxTrails) {
      trails = trails.slice(trails.length - maxTrails);
    }
  }

  function renderFrame() {
    ctx.clearRect(0, 0, width, height);

    for (let index = trails.length - 1; index >= 0; index -= 1) {
      const particle = trails[index];

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life *= 0.95;

      if (particle.life < 0.05) {
        trails.splice(index, 1);
        continue;
      }

      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size
      );

      gradient.addColorStop(0, `rgba(77, 234, 255, ${particle.life * 0.32})`);
      gradient.addColorStop(0.45, `rgba(15, 175, 154, ${particle.life * 0.2})`);
      gradient.addColorStop(1, "rgba(77, 234, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    animationFrameId = window.requestAnimationFrame(renderFrame);
  }

  function syncMotionPreference() {
    trails = [];
    window.cancelAnimationFrame(animationFrameId);
    ctx.clearRect(0, 0, width, height);

    if (!reducedMotion.matches) {
      animationFrameId = window.requestAnimationFrame(renderFrame);
    }
  }

  resizeCanvas();
  syncMotionPreference();

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", addTrail, { passive: true });

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", syncMotionPreference);
  } else if (reducedMotion.addListener) {
    reducedMotion.addListener(syncMotionPreference);
  }
}

function renderApp() {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    return;
  }

  createRoot(rootElement).render(React.createElement(App));
}

function startApp() {
  initCanvas();
  renderApp();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
  startApp();
}
