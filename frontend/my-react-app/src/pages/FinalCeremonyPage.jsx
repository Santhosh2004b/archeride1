import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Ceremony.css";

const vpImg = "/assets/SATHISH.png";
const devImg = "/assets/SANTHOSH.jpg";

const FinalCeremonyPage = () => {
    const navigate = useNavigate();

    const milestones = [
        { title: "The Foundation", desc: "Forging the path through initial challenges, laying every stone with precision." },
        { title: "The Integration", desc: "Unifying our vision into a single, cohesive ecosystem of service delivery." },
        { title: "The Success", desc: "Reaching the summit of operational excellence through collective dedication." }
    ];

    const handleFinish = () => {
        window.stopCeremonyAudio?.();
        window.location.href = "https://satishtextile.com/wp-content/uploads/2026/01/Untitled-video-Generated-with-Scribe-AI-1.mp4";
    };

    return (
        <div className="final-ceremony-container ceremony-fullscreen overflow-y-auto px-6 py-20 pb-40 relative">
            {/* Premium Backdrop */}
            <div className="ceremony-service-bg fixed inset-0 z-0">
                <div className="parallax-stars-1 opacity-50" />
                <div className="parallax-stars-2 opacity-40" />
                <div className="blue-ray-glow" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto text-center">
                {/* Hero Header */}
                <header className="mb-24 animate-fade-in-down">
                    <div className="success-story-badge">Corporate Success Story</div>
                    <h1 className="executive-hero-title mb-6">A Legacy of Innovation & Success</h1>
                    <div className="hero-divider-gold mx-auto" />
                    <p className="executive-hero-subtitle mt-8 max-w-2xl mx-auto font-medium text-white/80">
                        WE HAVE ARRIVED. Our success story is built upon the many stones we stepped to reach this pinnacle.
                    </p>
                </header>

                {/* The Success Story / Timeline */}
                <section className="mb-32">
                    <h2 className="section-label-gold mb-16 underline-gold">The Stones of Progress</h2>
                    <div className="milestones-grid grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
                        {milestones.map((m, i) => (
                            <div key={i} className="milestone-card glass-premium p-10 text-left animate-fade-in-up" style={{ animationDelay: `${0.4 + i * 0.3}s` }}>
                                <div className="milestone-number">0{i + 1}</div>
                                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-[0.2em]">{m.title}</h3>
                                <p className="text-white/70 leading-relaxed font-light">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Executive Honor - VP Spotlight */}
                <section className="mb-32">
                    <h2 className="section-label-gold mb-12 uppercase tracking-widest">Executive leadership & support</h2>
                    <div className="vp-honor-card glass-premium p-12 max-w-5xl mx-auto relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
                        <div className="vp-honor-glow" />
                        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                            <div className="vp-portrait-wrapper flex-shrink-0">
                                <img src={vpImg} alt="Satish Balaji" className="vp-img-premium shadow-2xl" />
                                <div className="vp-ring-gold" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-4xl font-extrabold text-white mb-2 uppercase tracking-tighter">Satish Balaji</h3>
                                <p className="text-gold-gradient font-black uppercase tracking-[0.4em] mb-8 text-sm">Vice President</p>
                                <div className="honor-quote text-white/90 italic text-xl leading-relaxed border-l-0 md:border-l-4 border-gold-primary pl-0 md:pl-8 py-4 bg-white/5 rounded-r-xl pr-6">
                                    "I am profoundly thankful for the tremendous effort and support from every one of you. We have stepped through many stones to be here today. This success belongs to you all."
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Recognition */}
                <section className="mb-20">
                    <h2 className="section-label-gold mb-12 uppercase tracking-widest">Execution Excellence</h2>
                    <div className="flex justify-center">
                        <div className="team-card-minimal glass-premium p-8 flex flex-col items-center w-72 animate-fade-in-up" style={{ animationDelay: '2s' }}>
                            <img src={devImg} alt="Santhosh B" className="dev-img-premium mb-6 border-gold-primary/30" />
                            <h4 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">Santhosh B</h4>
                            <p className="text-gold-gradient text-xs font-black uppercase tracking-widest">Architect of Execution</p>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <div className="mt-32 pb-20 animate-fade-in" style={{ animationDelay: '2.5s' }}>
                    <p className="text-white/60 mb-10 font-light italic tracking-widest uppercase text-sm">Step into the future of ArcheRIDE</p>
                    <button onClick={handleFinish} className="intro-btn px-20 py-6 text-xl font-black tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
                        Complete Ceremony
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinalCeremonyPage;
