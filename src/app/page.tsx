'use client';
import { useState } from 'react';
import { Bot, Link, CheckCircle2, RotateCcw, AlertTriangle, ChevronRight, Loader2, Video } from 'lucide-react';
import { saveGeneratedContent } from './actions';

export default function Home() {
  const [url, setUrl] = useState('');
  const [model, setModel] = useState('openai');
  const [loadingStep, setLoadingStep] = useState(0); // 0: idle, 1: scraping, 2: generating
  const [results, setResults] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [selections, setSelections] = useState({
    hook: 'storytelling',
    bridge: 'storytelling',
    value: 'storytelling',
    cta: 'storytelling'
  });
  const [error, setError] = useState('');
  const [savedStyle, setSavedStyle] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setError('');
    setResults(null);
    setSavedStyle(null);

    try {
      setLoadingStep(1);
      // 1. Scrape
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const scrapeData = await scrapeRes.json();

      if (!scrapeRes.ok) throw new Error(scrapeData.error || 'Failed to scrape URL');
      if (!scrapeData.content) throw new Error('No content found in the given URL');

      setLoadingStep(2);
      // 2. Generate
      let genData: any;
      
      if (model.startsWith('puter')) {
        const { puter } = await import('@heyputer/puter.js');
        const prompt = `You are an expert copywriter fluent in Indonesian. Read the following news content and generate 3 different versions (storytelling, data-driven, and inspiratif) following the Hook, Bridge, Value, CTA structure. 

ALL output MUST be in Indonesian language using a casual and engaging accent (bahasa santai/gaul) that is friendly and relatable. Use popular Indonesian slang or informal terms where appropriate to make it feel authentic, but keep it readable.

Pastikan juga untuk menyisipkan penjelasan sederhana mengenai konsep AI atau teknologi terkini yang ada di dalam berita. Jelaskan dengan perumpamaan yang sangat mudah dimengerti oleh orang awam (biasa/non-teknis) agar mereka bisa sekaligus teredukasi mengenai perkembangan teknologi terbaru.

Make each section impactful and highly engaging.

Return ONLY a valid JSON object matching this schema exactly (no markdown formatting, no comments, just raw JSON):
{
  "storytelling": { "hook": "...", "bridge": "...", "value": "...", "cta": "..." },
  "dataDriven": { "hook": "...", "bridge": "...", "value": "...", "cta": "..." },
  "inspiratif": { "hook": "...", "bridge": "...", "value": "...", "cta": "..." }
}

News Content:
${scrapeData.content.substring(0, 15000)}`;

        let puterModel = 'gpt-4o';
        if (model === 'puter-qwen') puterModel = 'qwen/qwen3.6-plus:free';
        if (model === 'puter-claude') puterModel = 'anthropic/claude-sonnet-4-6';
        if (model === 'puter-gemini') puterModel = 'google/gemini-3.1-pro-preview';
        if (model === 'puter-deepseek') puterModel = 'deepseek/deepseek-v3.2';

        const response: any = await puter.ai.chat(prompt, { model: puterModel });
        let responseText = typeof response === 'string' ? response : (response?.message?.content || response?.text || JSON.stringify(response));

        if (!responseText) throw new Error("Received empty response from Puter AI");

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not parse AI output as JSON");

        genData = JSON.parse(jsonMatch[0]);
      } else {
        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: scrapeData.content, modelUsed: model })
        });
        genData = await genRes.json();

        if (!genRes.ok) throw new Error(genData.error || 'Failed to generate content');
      }

      setResults(genData);
      setTitle(scrapeData.title || '');
      setSelections({
        hook: 'storytelling',
        bridge: 'storytelling',
        value: 'storytelling',
        cta: 'storytelling'
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingStep(0);
    }
  };

  const handleSave = async () => {
    if (!results) return;
    
    const hook = results[selections.hook].hook;
    const bridge = results[selections.bridge].bridge;
    const value = results[selections.value].value;
    const cta = results[selections.cta].cta;

    const res = await saveGeneratedContent({
      url,
      modelUsed: model,
      selectedVersion: 0, // 0 for custom mix
      hook,
      bridge,
      value,
      cta,
      style: 'custom',
      title: title,
      youtubeUrl: youtubeUrl || undefined,
    });

    if (res.success) {
      setSavedStyle('custom');
    } else {
      setError(res.error || 'Failed to save');
    }
  };

  const styles = [
    { key: 'storytelling', label: 'Storytelling 📖', color: 'bg-primary-orange', data: results?.storytelling },
    { key: 'dataDriven', label: 'Data-Driven 📊', color: 'bg-bright-blue', data: results?.dataDriven },
    { key: 'inspiratif', label: 'Inspiratif ✨', color: 'bg-fresh-green', data: results?.inspiratif }
  ];

  return (
    <div className="flex flex-col gap-12 w-full animate-fade-in-up">
      {!results && loadingStep === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 text-center max-w-2xl mx-auto mt-10">
          <h2 className="text-5xl md:text-6xl font-black leading-tight text-dark-text drop-shadow-sm">
            Turn Any News Into <br /> <span className="text-bright-blue brutal-shadow bg-honey-yellow px-4 py-2 rounded-2xl inline-block mt-2">Engaging Content.</span>
          </h2>
          <p className="text-xl opacity-80 font-medium">Paste a news URL and let AI draft 3 varied versions using our proven Hook-Bridge-Value-CTA framework.</p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 bg-white p-6 rounded-3xl brutal-shadow relative">
            <div className="flex bg-cream-bg rounded-xl brutal-shadow overflow-hidden group focus-within:ring-4 ring-primary-orange/20 transition-all">
              <span className="p-4 flex items-center justify-center bg-cream-bg border-r-2 border-black">
                <Link className="h-6 w-6 text-black opacity-40" />
              </span>
              <input
                type="url"
                placeholder="https://example.com/news..."
                className="flex-1 bg-transparent p-4 outline-none font-bold text-lg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="flex bg-cream-bg rounded-xl brutal-shadow overflow-hidden group focus-within:ring-4 ring-primary-orange/20 transition-all">
              <span className="p-4 flex items-center justify-center bg-cream-bg border-r-2 border-black">
                <Video className="h-6 w-6 text-[#FF0000] opacity-80" />
              </span>
              <input
                type="url"
                placeholder="Optional: YouTube video source URL..."
                className="flex-1 bg-transparent p-4 outline-none font-bold text-lg"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full bg-cream-bg rounded-xl brutal-shadow overflow-hidden flex focus-within:ring-4 ring-bright-blue/20 transition-all">
                <span className="p-4 flex items-center justify-center bg-cream-bg border-r-2 border-black">
                  <Bot className="h-6 w-6 text-black opacity-40" />
                </span>
                <select
                  className="flex-1 bg-transparent p-4 outline-none font-bold text-lg cursor-pointer min-w-0"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="claude">Claude</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="puter-gpt-4o">Puter: GPT-4o (Free)</option>
                  <option value="puter-qwen">Puter: Qwen 3.6 (Free)</option>
                  <option value="puter-claude">Puter: Claude 4.6 (Free)</option>
                  <option value="puter-gemini">Puter: Gemini 3.1 (Free)</option>
                  <option value="puter-deepseek">Puter: DeepSeek V3.2 (Free)</option>
                </select>
              </div>

              <button type="submit" className="w-full sm:w-auto bg-primary-orange text-white p-4 px-8 rounded-xl brutal-shadow font-extrabold text-lg hover-lift flex items-center justify-center gap-2 flex-shrink-0">
                Generate <ChevronRight strokeWidth={3} className="h-5 w-5" />
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-xl brutal-shadow flex items-center gap-2 border-2 border-red-500 w-full animate-fade-in-up">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" /> <span className="text-left font-medium">{error}</span>
            </div>
          )}
        </div>
      )}

      {loadingStep > 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 text-center animate-fade-in-up">
          <Loader2 className="h-20 w-20 animate-spin text-bright-blue" />
          <h3 className="text-3xl font-black">{loadingStep === 1 ? 'Scraping the article...' : 'Crafting 3 magic variations...'}</h3>
          <p className="text-xl font-medium opacity-80">Hang tight, combining words with AI.</p>
        </div>
      )}

      {results && loadingStep === 0 && (
        <div className="flex flex-col gap-8 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl brutal-shadow">
            <div className="w-full overflow-hidden">
              <p className="text-sm font-bold opacity-60 uppercase mb-1">Source URL</p>
              <a href={url} target="_blank" rel="noreferrer" className="text-primary-orange font-bold hover:underline truncate block w-full">{url}</a>
            </div>
            <button onClick={() => setResults(null)} className="flex items-center justify-center gap-2 px-4 py-2 font-bold bg-cream-bg border-2 border-black rounded-xl hover:bg-black/5 hover-lift whitespace-nowrap w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" /> Start Over
            </button>
          </div>

          <div className="text-center -mb-4">
             <h3 className="text-2xl font-black bg-white inline-block px-6 py-2 rounded-2xl brutal-shadow border-2 border-black -rotate-1">
               Mix & Match Your Perfect Post!
             </h3>
             <p className="mt-4 font-bold opacity-60 italic">Click on any section below to toggle it for your final combination.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {styles.map(({ key, label, color, data }) => (
              <div key={key} className="bg-white rounded-3xl brutal-shadow flex flex-col overflow-hidden relative group border-2 border-black/5">
                <div className={`${color} text-white p-4 border-b-2 border-black font-black text-xl text-center`}>
                  {label}
                </div>

                <div className="p-6 flex-1 flex flex-col gap-4 text-base relative">
                  <div 
                    onClick={() => setSelections({...selections, hook: key})}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer hover:border-primary-orange/50 ${selections.hook === key ? 'border-primary-orange bg-orange-50/50 shadow-xs ring-4 ring-orange-500/10' : 'border-transparent'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black uppercase text-primary-orange bg-orange-100 px-2 py-1 rounded-md border-2 border-black">Hook</span>
                       {selections.hook === key && <CheckCircle2 className="h-4 w-4 text-primary-orange" />}
                    </div>
                    <p className="font-bold leading-snug">{data?.hook}</p>
                  </div>

                  <div 
                    onClick={() => setSelections({...selections, bridge: key})}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer hover:border-bright-blue/50 ${selections.bridge === key ? 'border-bright-blue bg-blue-50/50 shadow-xs ring-4 ring-blue-500/10' : 'border-transparent'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black uppercase text-bright-blue bg-blue-100 px-2 py-1 rounded-md border-2 border-black">Bridge</span>
                       {selections.bridge === key && <CheckCircle2 className="h-4 w-4 text-bright-blue" />}
                    </div>
                    <p className="font-medium leading-snug">{data?.bridge}</p>
                  </div>

                  <div 
                    onClick={() => setSelections({...selections, value: key})}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer hover:border-fresh-green/50 ${selections.value === key ? 'border-fresh-green bg-green-50/50 shadow-xs ring-4 ring-green-500/10' : 'border-transparent'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black uppercase text-fresh-green bg-green-100 px-2 py-1 rounded-md border-2 border-black">Value</span>
                       {selections.value === key && <CheckCircle2 className="h-4 w-4 text-fresh-green" />}
                    </div>
                    <p className="font-medium leading-snug">{data?.value}</p>
                  </div>

                  <div 
                    onClick={() => setSelections({...selections, cta: key})}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer hover:border-honey-yellow/50 ${selections.cta === key ? 'border-honey-yellow bg-yellow-50/50 shadow-xs ring-4 ring-yellow-500/10' : 'border-transparent'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black uppercase text-honey-yellow bg-yellow-100 px-2 py-1 rounded-md border-2 border-black">CTA</span>
                       {selections.cta === key && <CheckCircle2 className="h-4 w-4 text-honey-yellow" />}
                    </div>
                    <p className="font-bold leading-snug">{data?.cta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-dark-text p-8 rounded-4xl brutal-shadow text-white relative overflow-hidden border-4 border-black">
             {/* Background decorative element */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-orange opacity-20 blur-3xl z-0"></div>
             
             <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div className="flex-1">
                    <h3 className="text-lg font-black leading-tight mb-2 line-clamp-2">{title || "Untitled Post"}</h3>
                    <p className="text-sm font-medium leading-relaxed opacity-70 whitespace-pre-wrap line-clamp-4">{results[selections.hook].hook + " " + results[selections.bridge].bridge + " " + results[selections.value].value + " " + results[selections.cta].cta}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-white to-transparent flex items-end justify-start px-2 pb-1 gap-1"></div>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={savedStyle === 'custom'}
                    className={`px-10 py-5 rounded-2xl font-black text-xl transition-all brutal-shadow hover-lift flex items-center gap-2 ${savedStyle === 'custom' ? 'bg-fresh-green text-white cursor-default' : 'bg-honey-yellow text-black'}`}
                  >
                    {savedStyle === 'custom' ? (
                      <><CheckCircle2 className="h-6 w-6" /> Saved to History</>
                    ) : (
                      'Save Combination'
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                   <div className="bg-white/10 p-6 rounded-3xl border-2 border-white/10 backdrop-blur-xs">
                      <div className="flex flex-col gap-6">
                        <div>
                          <span className="text-[10px] font-black uppercase text-white/40 mb-2 block">Hook ({selections.hook})</span>
                          <p className="text-xl font-bold leading-relaxed">{results[selections.hook].hook}</p>
                        </div>
                        <div className="h-[2px] bg-white/5 w-full"></div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-white/40 mb-2 block">Bridge ({selections.bridge})</span>
                          <p className="text-lg font-medium leading-relaxed opacity-90">{results[selections.bridge].bridge}</p>
                        </div>
                        <div className="h-[2px] bg-white/5 w-full"></div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-white/40 mb-2 block">Value ({selections.value})</span>
                          <p className="text-lg font-medium leading-relaxed opacity-90">{results[selections.value].value}</p>
                        </div>
                        <div className="h-[2px] bg-white/5 w-full"></div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-white/40 mb-2 block">CTA ({selections.cta})</span>
                          <p className="text-xl font-bold leading-relaxed">{results[selections.cta].cta}</p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-xl brutal-shadow flex items-center gap-2 border-2 border-red-500 w-full animate-fade-in-up mt-4">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" /> <span className="font-medium text-left">{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
