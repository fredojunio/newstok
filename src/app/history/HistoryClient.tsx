'use client';
import { useState } from 'react';
import { Trash2, Edit3, Download, Eye, X, Save, AlertTriangle, Video } from 'lucide-react';
import { deleteGeneratedContent, editGeneratedContent } from '../actions';

type HistoryItem = {
  id: string;
  url: string;
  modelUsed: string;
  style: string | null;
  hook: string | null;
  bridge: string | null;
  value: string | null;
  cta: string | null;
  youtubeUrl: string | null;
  fullContent: string | null;
  createdAt: string | null;
};

export default function HistoryClient({ items: initialItems }: { items: HistoryItem[] }) {
  const [items, setItems] = useState<HistoryItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to delete this content?')) return;
    setLoadingAction(id);
    const res = await deleteGeneratedContent(id);
    if (res.success) {
      setItems(items.filter(i => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } else {
      alert(res.error);
    }
    setLoadingAction(null);
  };

  const handleExportTxt = (item: HistoryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const blob = new Blob([item.fullContent || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newstok-${item.style || 'content'}-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    setLoadingAction('edit');
    const res = await editGeneratedContent(selectedItem.id, editContent);
    if (res.success) {
      const updated = items.map(i => i.id === selectedItem.id ? { ...i, fullContent: editContent } : i);
      setItems(updated);
      setSelectedItem({ ...selectedItem, fullContent: editContent });
      setIsEditing(false);
    } else {
      alert(res.error);
    }
    setLoadingAction(null);
  };

  if (items.length === 0) {
    return (
      <div className="bg-cream-bg border-4 border-dashed border-black/20 p-12 rounded-3xl text-center">
        <h3 className="text-2xl font-black mb-2 opacity-60">No history found.</h3>
        <p className="opacity-50 font-bold">Go generate some amazing content first!</p>
      </div>
    );
  }

  const getStyleColor = (style: string | null) => {
    if (style === 'storytelling') return 'bg-primary-orange';
    if (style === 'dataDriven') return 'bg-bright-blue';
    if (style === 'inspiratif') return 'bg-fresh-green';
    return 'bg-gray-500';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div 
             key={item.id} 
             onClick={() => setSelectedItem(item)}
             className="bg-white p-6 rounded-3xl brutal-shadow cursor-pointer hover-lift flex flex-col h-[280px] relative group"
          >
             <div className="flex justify-between items-start mb-4">
                <span className={`${getStyleColor(item.style)} text-white px-3 py-1 text-xs font-black uppercase rounded-lg brutal-shadow`}>
                   {item.style || 'Content'}
                </span>
                <span className="text-xs font-bold opacity-50 bg-gray-100 px-2 py-1 rounded-md">{item.modelUsed}</span>
             </div>
             
             <div className="flex-1 overflow-hidden relative mb-4">
                <p className="text-sm font-medium leading-relaxed opacity-80 whitespace-pre-wrap">{item.fullContent}</p>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent flex items-end justify-start px-2 pb-1 gap-1">
                   <div className="h-1.5 w-4 rounded-full bg-primary-orange/50" title="Hook"></div>
                   <div className="h-1.5 w-4 rounded-full bg-bright-blue/50" title="Bridge"></div>
                   <div className="h-1.5 w-4 rounded-full bg-fresh-green/50" title="Value"></div>
                   <div className="h-1.5 w-4 rounded-full bg-honey-yellow/50" title="CTA"></div>
                </div>
             </div>

             <div className="flex items-center justify-between border-t-2 border-black/10 pt-4 mt-auto">
                <p className="text-xs font-medium opacity-50 truncate max-w-[150px]">{item.url}</p>
                <div className="flex gap-2">
                   <button 
                     onClick={(e) => handleExportTxt(item, e)}
                     className="p-2 bg-gray-100 hover:bg-black/10 rounded-xl transition-colors"
                     title="Export to TXT"
                   >
                     <Download className="h-4 w-4" />
                   </button>
                   <button 
                     onClick={(e) => handleDelete(item.id, e)}
                     className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-colors"
                     title="Delete"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-cream-bg w-full max-w-3xl max-h-[90vh] rounded-4xl brutal-shadow flex flex-col overflow-hidden relative">
              
              <div className="flex justify-between items-center p-6 border-b-4 border-black bg-white">
                 <div className="flex items-center gap-3">
                   <span className={`${getStyleColor(selectedItem.style)} text-white px-4 py-1 text-sm font-black uppercase rounded-xl brutal-shadow`}>
                      {selectedItem.style || 'Content'}
                   </span>
                   <span className="text-sm font-bold opacity-60">| {selectedItem.modelUsed}</span>
                 </div>
                 <button onClick={() => { setSelectedItem(null); setIsEditing(false); }} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full">
                    <X className="h-6 w-6" />
                 </button>
              </div>

               <div className="p-6 overflow-y-auto flex-1 bg-white/50">
                  
                  {isEditing ? (
                     <textarea 
                       className="w-full h-full min-h-[400px] bg-white p-4 font-medium text-lg leading-relaxed outline-none border-4 border-black/10 focus:border-primary-orange rounded-xl resize-none brutal-shadow transition-colors"
                       value={editContent}
                       onChange={(e) => setEditContent(e.target.value)}
                       placeholder="Edit the full content here..."
                     />
                  ) : (
                    <div className="flex flex-col gap-6">
                       <div className="bg-white p-4 rounded-2xl brutal-shadow border-2 border-black/5">
                         <span className="text-xs font-black uppercase text-primary-orange bg-orange-100 px-2 py-1 rounded-md border-2 border-black mb-2 inline-block">Hook</span>
                         <p className="font-bold text-lg leading-snug">{selectedItem.hook || "N/A"}</p>
                       </div>
                       
                       <div className="bg-white p-4 rounded-2xl brutal-shadow border-2 border-black/5">
                         <span className="text-xs font-black uppercase text-bright-blue bg-blue-100 px-2 py-1 rounded-md border-2 border-black mb-2 inline-block">Bridge</span>
                         <p className="font-medium text-lg leading-snug">{selectedItem.bridge || "N/A"}</p>
                       </div>
                       
                       <div className="bg-white p-4 rounded-2xl brutal-shadow border-2 border-black/5">
                         <span className="text-xs font-black uppercase text-fresh-green bg-green-100 px-2 py-1 rounded-md border-2 border-black mb-2 inline-block">Value</span>
                         <p className="font-medium text-lg leading-snug">{selectedItem.value || "N/A"}</p>
                       </div>
                       
                       <div className="bg-white p-4 rounded-2xl brutal-shadow border-2 border-black/5">
                         <span className="text-xs font-black uppercase text-honey-yellow bg-yellow-100 px-2 py-1 rounded-md border-2 border-black mb-2 inline-block">CTA</span>
                         <p className="font-bold text-lg leading-snug">{selectedItem.cta || "N/A"}</p>
                       </div>

                       <div className="mt-4 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-black/10">
                          <p className="text-xs font-black uppercase opacity-40 mb-2 text-center">Full Content View</p>
                          <div className="font-medium text-base leading-relaxed whitespace-pre-wrap opacity-70 italic">
                            {selectedItem.fullContent}
                          </div>
                       </div>
                    </div>
                  )}
                  
                  <div className="mt-8 bg-black/5 p-4 rounded-xl border border-black/10">
                    <p className="text-xs font-black uppercase opacity-60 mb-1">Source URL</p>
                    <a href={selectedItem.url} target="_blank" rel="noreferrer" className="text-bright-blue font-bold break-all hover:underline">{selectedItem.url}</a>
                  </div>

                  {selectedItem.youtubeUrl && (
                    <div className="mt-4 bg-[#FF0000]/5 p-4 rounded-xl border border-[#FF0000]/10 flex items-center gap-3">
                      <Video className="h-5 w-5 text-[#FF0000]" />
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-[#FF0000] opacity-60 mb-0.5">Video Source</p>
                        <a href={selectedItem.youtubeUrl} target="_blank" rel="noreferrer" className="text-[#FF0000] font-bold break-all hover:underline text-sm">{selectedItem.youtubeUrl}</a>
                      </div>
                    </div>
                  )}
               </div>

              <div className="p-6 bg-white border-t-4 border-black flex justify-end gap-4">
                 {isEditing ? (
                   <>
                     <button 
                       onClick={() => setIsEditing(false)}
                       className="px-6 py-3 font-bold bg-gray-200 hover:bg-gray-300 rounded-xl"
                     >
                        Cancel
                     </button>
                     <button 
                       onClick={handleSaveEdit}
                       disabled={loadingAction === 'edit'}
                       className="px-6 py-3 font-black bg-primary-orange text-white hover-lift brutal-shadow rounded-xl flex items-center gap-2"
                     >
                       <Save className="h-5 w-5" /> Save Changes
                     </button>
                   </>
                 ) : (
                   <>
                     <button 
                       onClick={() => handleExportTxt(selectedItem)}
                       className="px-6 py-3 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2"
                     >
                       <Download className="h-5 w-5" /> Export TXT
                     </button>
                     <button 
                       onClick={() => { setIsEditing(true); setEditContent(selectedItem.fullContent || ''); }}
                       className="px-6 py-3 font-black bg-bright-blue text-white hover-lift brutal-shadow rounded-xl flex items-center gap-2"
                     >
                       <Edit3 className="h-5 w-5" /> Edit Text
                     </button>
                   </>
                 )}
              </div>

           </div>
        </div>
      )}
    </>
  );
}
