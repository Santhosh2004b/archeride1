// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/arche-logo.png";

import img1 from "../assets/businessman-working-tablet-with-data-visualization.jpg";
import img2 from "../assets/futuristic-business-meeting-with-digital-table-cityscape-view.jpg";
import img3 from "../assets/team-working-together-project.jpg";

import "../styles/LandingPage.css"; // page-specific CSS

const HERO_IMAGES = [img1, img2, img3];

function LandingPage() {
  const navigate = useNavigate();
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // rotate hero background images
  useEffect(() => {
    const id = setInterval(
      () => setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length),
      5000 // sync with CSS animation duration
    );
    return () => clearInterval(id);
  }, []);

  const activeHeroImage = HERO_IMAGES[heroImageIndex];

  const handleGetStarted = (e) => {
    e.preventDefault();
    window.playCeremonyAudio?.();
    navigate("/ceremony", { state: { playAudio: true } });
  };

  // even index -> zoom in, odd -> zoom out
  const heroAnimationClass =
    heroImageIndex % 2 === 0 ? "hero-image-zoom-in" : "hero-image-zoom-out";

  return (
    <div className="h-screen overflow-hidden bg-brandBg text-brandDark flex flex-col">
      {/* top bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-2">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Arche logo"
            className="h-10 sm:h-8 w-auto object-contain"
          />
        </div>
      </header>

      {/* main hero */}
      <main className="flex-1 px-4 sm:px-8 pb-4 flex flex-col lg:flex-row gap-8 lg:gap-8 items-center justify-center">
        {/* left content */}
        <section className="w-full lg:w-1/2 space-y-4 sm:space-y-5 max-w-xl">
          {/* RIDC label – fade in once */}
          <p className="font-urbanist text-[3px] sm:text-xs tracking-[0.25em] uppercase text-brandMuted ridc-animate-once">
            Risk · Issue · Dependency · Escalation
          </p>

          {/* hero heading: slower fade from left */}
          <h1 className="font-marcellus font-bold text-3xl sm:text-4xl lg:text-5xl text-brandDark leading-tight fade-in-left-slow-main tracking-tight mb-1">
            Manage delivery
            <br className="hidden sm:block" />
            with clarity and control.
          </h1>

          {/* sub-copy: comes in after heading */}
          <p className="font-urbanist text-sm sm:text-base text-brandMuted max-w-xl fade-in-left-slower">
            Empowering teams to execute with precision, collaborate with purpose, and deliver with excellence across every project milestone.
          </p>

          {/* stats + CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center fade-in-left-ctas">
            <div className="flex gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-urbanist font-semibold shadow-sm border border-brandDark cta-animate"
              >
                Login
              </Link>
              <a
                href="#get-started"
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-urbanist border border-brandDark cta-animate"
              >
                Get started
              </a>
            </div>
          </div>
        </section>

        {/* right visual: smooth zoom in/out slider */}
        <section className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-[rgba(0,0,0,0.25)_0px_54px_55px,_rgba(0,0,0,0.12)_0px_-12px_30px,_rgba(0,0,0,0.12)_0px_4px_6px,_rgba(0,0,0,0.17)_0px_12px_13px,_rgba(0,0,0,0.09)_0px_-3px_5px]">
            <img
              src={activeHeroImage}
              alt="Delivery visual"
              className={`hero-image-base ${heroAnimationClass}`}
            />

            {/* dashed crosshair overlay only */}

          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
