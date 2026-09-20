import React, { useState } from "react";
import { 
  Video, 
  ExternalLink, 
  Copy, 
  Check, 
  BookOpen, 
  FileText, 
  Terminal, 
  Compass, 
  CheckCircle2, 
  BrainCircuit,
  Sparkles,
  Layers,
  Code2,
  Youtube
} from "lucide-react";
import { Course, Lesson, LessonReferenceLink } from "../types";
import { getLessonResources } from "../utils/lessonResources";

interface LessonResourcesSectionProps {
  course: Course;
  lesson: Lesson;
  onAskTutorWithContext: (lesson: Lesson, customPrompt?: string) => void;
}

export const LessonResourcesSection: React.FC<LessonResourcesSectionProps> = ({
  course,
  lesson,
  onAskTutorWithContext,
}) => {
  const resources = getLessonResources(course, lesson);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [checkedTakeaways, setCheckedTakeaways] = useState<Set<number>>(new Set());
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");

  const handleCopyLink = (url: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(url);
      }
    } catch {
      // Fallback
    }
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const toggleTakeaway = (index: number) => {
    setCheckedTakeaways((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const categories = ["All", "Documentation", "Architecture Guide", "Specification", "GitHub", "Interactive Lab"];
  const filteredLinks = activeCategoryFilter === "All" 
    ? resources.referenceLinks 
    : resources.referenceLinks.filter((l) => l.category === activeCategoryFilter);

  const getCategoryIcon = (cat: LessonReferenceLink["category"]) => {
    switch (cat) {
      case "Documentation":
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case "Architecture Guide":
        return <Compass className="w-4 h-4 text-purple-600" />;
      case "Specification":
        return <FileText className="w-4 h-4 text-amber-600" />;
      case "Interactive Lab":
        return <Terminal className="w-4 h-4 text-emerald-600" />;
      case "GitHub":
        return <Code2 className="w-4 h-4 text-slate-700" />;
      default:
        return <Layers className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getCategoryBadgeClass = (cat: LessonReferenceLink["category"]) => {
    switch (cat) {
      case "Documentation":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Architecture Guide":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Specification":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Interactive Lab":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "GitHub":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  const youtubeWatchUrl = resources.video.youtubeId 
    ? `https://www.youtube.com/watch?v=${resources.video.youtubeId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(resources.video.title)}`;

  return (
    <div id="lesson-resources-container" className="mt-8 space-y-6 pt-6 border-t border-slate-200">
      {/* Top Banner indicating Registered Course Alignment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-xl shadow-xs">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
              Enrolled Track Only
            </span>
            <span className="text-xs text-slate-400 truncate">
              {course.category}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white truncate font-['Outfit',sans-serif]">
            Related Video & Reference Links for: {course.title}
          </h3>
          <p className="text-xs text-slate-400">
            Hand-curated lecture videos, official documentation, and architectural guides strictly for your active registered lesson.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 border border-slate-700 flex items-center space-x-1">
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span>1 Video</span>
          </span>
          <span className="text-xs px-2.5 py-1 bg-slate-800 rounded-lg text-slate-300 border border-slate-700 flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>{resources.referenceLinks.length} Links</span>
          </span>
        </div>
      </div>

      {/* Part 1: Curated Video Walkthrough */}
      <section id="section-related-video" className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
              <Youtube className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 font-['Outfit',sans-serif]">
                  Related Video Walkthrough
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                  {resources.video.duration}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Channel: <strong className="text-slate-700">{resources.video.channel}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              id="btn-watch-youtube-external"
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
            <button
              id="btn-ask-tutor-video"
              onClick={() =>
                onAskTutorWithContext(
                  lesson,
                  `Can you explain the key concepts taught in the video "${resources.video.title}" and how it relates to our code implementation?`
                )
              }
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask Tutor on Video</span>
            </button>
          </div>
        </div>

        {/* Video Player Embed Area */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
            {resources.video.embedUrl ? (
              <iframe
                src={resources.video.embedUrl}
                title={resources.video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                <Video className="w-12 h-12 text-slate-600 animate-pulse" />
                <p className="font-semibold text-sm text-slate-300">{resources.video.title}</p>
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Watch Lecture on External Player
                </a>
              </div>
            )}
          </div>

          {/* Video Overview & Key Takeaways */}
          <div className="space-y-3 pt-2">
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Lecture Synopsis
              </h5>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {resources.video.description}
              </p>
            </div>

            {resources.video.keyTakeaways && resources.video.keyTakeaways.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Key Video Takeaways (Click to Check Off)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {checkedTakeaways.size} of {resources.video.keyTakeaways.length} reviewed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {resources.video.keyTakeaways.map((takeaway, idx) => {
                    const isChecked = checkedTakeaways.has(idx);
                    return (
                      <button
                        key={idx}
                        id={`takeaway-item-${idx}`}
                        type="button"
                        onClick={() => toggleTakeaway(idx)}
                        className={`text-left p-2 rounded-md border text-xs flex items-start space-x-2 transition-all cursor-pointer ${
                          isChecked
                            ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
                            : "bg-white border-slate-200 text-slate-700 hover:border-indigo-200"
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            isChecked ? "text-emerald-600" : "text-slate-300"
                          }`}
                        />
                        <span className={`leading-snug ${isChecked ? "line-through opacity-80" : ""}`}>
                          {takeaway}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Part 2: Curated Reference Links & Official Documentation */}
      <section id="section-reference-links" className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-sm sm:text-base text-slate-900 font-['Outfit',sans-serif]">
                Official Reference Documentation & Links
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {resources.referenceLinks.length} Verified Sources
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Primary documentation, standards, and interactive labs aligned with {course.title}.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeCategoryFilter === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Links List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredLinks.map((link, linkIdx) => {
            const isCopied = copiedUrl === link.url;
            return (
              <div
                key={linkIdx}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all bg-slate-50/40 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadgeClass(
                        link.category
                      )}`}
                    >
                      {getCategoryIcon(link.category)}
                      <span className="ml-1">{link.category}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[140px]">
                      {link.sourceName}
                    </span>
                  </div>

                  <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                    {link.title}
                  </h5>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {link.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                  <button
                    id={`btn-copy-link-${linkIdx}`}
                    type="button"
                    onClick={() => handleCopyLink(link.url)}
                    className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-slate-200/60"
                    title="Copy resource URL to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <a
                    id={`link-open-resource-${linkIdx}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
