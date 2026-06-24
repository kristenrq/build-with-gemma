import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Type, MapPin } from 'lucide-react';

export default function ImageGenerator() {
  const canvas169Ref = useRef<HTMLDivElement>(null);
  const canvas45Ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale169, setScale169] = useState(1);
  const [scale45, setScale45] = useState(1);
  const [previewTab, setPreviewTab] = useState<'16:9' | '4:5'>('16:9');
  
  const [export169, setExport169] = useState(true);
  const [export45, setExport45] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [title, setTitle] = useState('Title of your hackathon');
  const [subtitle, setSubtitle] = useState('Additional text can go here');
  const [location, setLocation] = useState('Location');
  const bgImage169 = '/background%20-%2016_9%20(2).png';
  const bgImage45 = '/Background%20-4_5.png';

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const container = entries[0].target;
      const { width, height } = container.getBoundingClientRect();
      
      const availWidth = width - 64;
      const availHeight = height - 64;

      // 16:9
      const sX169 = availWidth / 1920;
      const sY169 = availHeight / 1080;
      setScale169(Math.min(sX169, sY169, 1));

      // 4:5
      const sX45 = availWidth / 768;
      const sY45 = availHeight / 960;
      setScale45(Math.min(sX45, sY45, 1));
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [previewTab]); // re-run if tab changes, though dimensions usually remain similar

  const exportCanvas = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    const el = ref.current;
    
    const prevTransform = el.style.transform;
    const prevOpacity = el.style.opacity;
    const prevZIndex = el.style.zIndex;
    const prevPosition = el.style.position;
    const prevBoxShadow = el.style.boxShadow;
    const prevTransition = el.style.transition;
    
    el.style.transition = 'none';
    el.style.transform = 'scale(1)';
    el.style.opacity = '1';
    el.style.zIndex = '9999';
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.boxShadow = 'none';
    
    // Wait a tick for the DOM to update
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const url = await toPng(el, { 
        pixelRatio: 1, 
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      el.style.transition = prevTransition;
      el.style.transform = prevTransform;
      el.style.opacity = prevOpacity;
      el.style.zIndex = prevZIndex;
      el.style.position = prevPosition;
      el.style.boxShadow = prevBoxShadow;
      el.style.top = '';
      el.style.left = '';
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const safeTitle = title.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'banner';
    try {
      if (export169) await exportCanvas(canvas169Ref, `${safeTitle}-16x9.png`);
      if (export45) await exportCanvas(canvas45Ref, `${safeTitle}-4x5.png`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[400px] h-full bg-white border-r border-gray-200 p-8 flex flex-col gap-8 overflow-y-auto z-10 shadow-sm shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Build with Gemma<br />Banner Generator</h1>
          <p className="text-sm text-gray-500">Customize text and export banners.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-400" /> Title
              </label>
              <span className="text-xs text-gray-500">{title.length} / 60</span>
            </div>
            <textarea 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-sans resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-400" /> Subtitle
              </label>
              <span className="text-xs text-gray-500">{subtitle.length} / 30</span>
            </div>
            <input 
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              maxLength={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-sans"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Location
              </label>
              <span className="text-xs text-gray-500">{location.length} / 25</span>
            </div>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={25}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-sans"
            />
          </div>
        </div>

        {/* Export Settings */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Sizes</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={export169} 
                onChange={(e) => setExport169(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Export horizontal</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={export45} 
                onChange={(e) => setExport45(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Export vertical</span>
            </label>
          </div>
        </div>

        <div className="mt-auto pt-8 pb-4">
          <button 
            onClick={handleExport}
            disabled={(!export169 && !export45) || isExporting}
            className="w-full flex items-center justify-center gap-2 bg-[#1A73E8] hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Canvas Preview Area */}
      <div className="flex-1 flex flex-col h-full bg-gray-100 min-w-0">
        
        {/* Preview Tabs */}
        <div className="flex px-6 pt-4 bg-white border-b border-gray-200 shadow-sm shrink-0 gap-4">
          <button 
            onClick={() => setPreviewTab('16:9')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${previewTab === '16:9' ? 'border-[#1A73E8] text-[#1A73E8]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Horizontal
          </button>
          <button 
            onClick={() => setPreviewTab('4:5')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${previewTab === '4:5' ? 'border-[#1A73E8] text-[#1A73E8]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Vertical
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 flex items-center justify-center relative overflow-hidden" ref={containerRef}>
          {/* Subtle grid pattern for the background behind the canvas */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          {/* 16:9 Canvas */}
          <div 
            ref={canvas169Ref}
            className="absolute origin-center bg-white shadow-2xl overflow-hidden transition-opacity duration-300"
            style={{ 
              width: 1920, 
              height: 1080, 
              transform: `scale(${scale169})`,
              opacity: previewTab === '16:9' ? 1 : 0,
              pointerEvents: previewTab === '16:9' ? 'auto' : 'none',
              zIndex: previewTab === '16:9' ? 10 : 0,
            }}
          >
            <img src={bgImage169} alt="Background 16:9" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 z-10 font-sans">
              <div className="absolute top-[60px] left-[40px]" style={{ transformOrigin: 'top left' }}>
                {location && (
                  <div 
                    className="bg-[#1A73E8] text-white px-10 rounded-full text-[53px] font-light tracking-wide flex items-center justify-center min-w-[160px] h-[82px]"
                    style={{ fontVariationSettings: '"ROND" 0' }}
                  >
                    {location}
                  </div>
                )}
              </div>
              <div className="absolute top-[304px] left-[58px] w-[1700px] flex flex-col gap-6">
                {title && (
                  <h1 
                    className="text-[#3772E0] font-sans font-medium leading-[1.1] tracking-normal text-[95px] line-clamp-2"
                    style={{ fontVariationSettings: '"ROND" 100' }}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <h2 
                    className="text-[#3772E0] font-sans font-light leading-[1.1] tracking-normal text-[65px] whitespace-nowrap overflow-hidden text-ellipsis pb-2"
                    style={{ fontVariationSettings: '"ROND" 100' }}
                  >
                    {subtitle}
                  </h2>
                )}
              </div>
            </div>
          </div>

          {/* 4:5 Canvas */}
          <div 
            ref={canvas45Ref}
            className="absolute origin-center bg-white shadow-2xl overflow-hidden transition-opacity duration-300"
            style={{ 
              width: 768, 
              height: 960, 
              transform: `scale(${scale45})`,
              opacity: previewTab === '4:5' ? 1 : 0,
              pointerEvents: previewTab === '4:5' ? 'auto' : 'none',
              zIndex: previewTab === '4:5' ? 10 : 0,
            }}
          >
            <img src={bgImage45} alt="Background 4:5" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 z-10 font-sans">
              <div className="absolute top-[859px] right-[40px]" style={{ transformOrigin: 'top right' }}>
                {location && (
                  <div 
                    className="bg-[#1A73E8] text-white px-10 rounded-full text-[39px] font-light tracking-wide flex items-center justify-center min-w-[120px] h-[61px]"
                    style={{ fontVariationSettings: '"ROND" 0' }}
                  >
                    {location}
                  </div>
                )}
              </div>
              <div className="absolute top-[496px] left-[41px] w-[680px] flex flex-col gap-4">
                {title && (
                  <h1 
                    className="text-[#3772E0] font-sans font-medium leading-[1.1] tracking-normal text-[70px] line-clamp-3"
                    style={{ fontVariationSettings: '"ROND" 100' }}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <h2 
                    className="text-[#3772E0] font-sans font-light leading-[1.1] tracking-normal text-[50px] whitespace-nowrap overflow-hidden text-ellipsis pb-2"
                    style={{ fontVariationSettings: '"ROND" 100' }}
                  >
                    {subtitle}
                  </h2>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
