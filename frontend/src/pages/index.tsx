import { useState, useRef, useEffect } from 'react';
import { client } from '@/client';
import { User, SessionToken, SessionAction, NoteRequest } from '@/study_pb'; 
import Head from 'next/head';

export default function Home() {
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [joinMode, setJoinMode] = useState<'create' | 'join'>('create');
  const [inputRoomId, setInputRoomId] = useState('');

  const [logs, setLogs] = useState<{user: string, msg: string, type: string}[]>([]);
  const [chatMsg, setChatMsg] = useState('');
  const [page, setPage] = useState(1);
  const [myUserId, setMyUserId] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [myNotes, setMyNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [uploading, setUploading] = useState(false);

  const streamRef = useRef<any>(null);
  const notesTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!sessionId || !myNotes) return;
    
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);

    notesTimeoutRef.current = setTimeout(() => {
      saveMyNotes();
    }, 1000);
  }, [myNotes]);

  const addLog = (user: string, msg: string, type: 'chat' | 'system' | 'action') => {
    setLogs(prev => [...prev, { user, msg, type }]);
  };

  const startListening = (token: SessionToken) => {
    if (streamRef.current) return; 

    const stream = client.streamSessionUpdates(token, {});
    streamRef.current = stream;

    stream.on('data', (event: any) => {
      const uName = event.getUserName() || "Unknown";
      
      if (event.hasUserJoined()) {
        addLog(uName, "has entered the study.", 'system');
      } else if (event.hasChatMessage()) {
        addLog(uName, event.getChatMessage(), 'chat');
      } else if (event.hasPageNumber()) {
        setPage(event.getPageNumber());
        addLog(uName, `turned to page ${event.getPageNumber()}`, 'action');
      } else if (event.hasDocumentUrl()) {
        setDocUrl(event.getDocumentUrl());
        setPage(1);
        addLog(uName, "presented a new manuscript", 'action');
      }
    });
  };

  const loadMyNotes = (sId: string, uId: string) => {
    const token = new SessionToken();
    token.setSessionId(sId);
    token.setUserId(uId);
    client.getMyNotes(token, {}, (err, response) => {
      if (!err) setMyNotes(response.getContent());
    });
  };

  const saveMyNotes = () => {
    setSavingNotes(true);
    const req = new NoteRequest();
    req.setSessionId(sessionId);
    req.setUserId(myUserId);
    req.setContent(myNotes);
    client.saveNote(req, {}, () => setSavingNotes(false));
  };

  const handleJoin = () => {
    if (!name) return;
    if (joinMode === 'join' && !inputRoomId) return;

    const userRequest = new User();
    userRequest.setName(name);

    if (joinMode === 'join') {
        userRequest.setDesiredSessionId(inputRoomId);
    }

    client.joinSession(userRequest, {}, (err, response) => {
      if (err) return console.error(err);
      const sId = response.getSessionId();
      const uId = response.getUserId();
      setSessionId(sId);
      setMyUserId(uId);
      
      const token = new SessionToken();
      token.setSessionId(sId);
      token.setUserId(uId);
      
      startListening(token);
      loadMyNotes(sId, uId);
    });
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      // Assuming existing backend logic
      const res = await fetch('http://localhost:8081/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const action = new SessionAction();
      action.setSessionId(sessionId);
      action.setUserId(myUserId);
      action.setDocumentUrl(data.url);
      client.sendAction(action, {}, () => {});
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  const sendChat = () => { 
    if (!chatMsg) return;
    const action = new SessionAction();
    action.setSessionId(sessionId);
    action.setUserId(myUserId);
    action.setChatMessage(chatMsg);
    client.sendAction(action, {}, () => {});
    setChatMsg('');
  };

  return (
    <>
      <Head>
        <title>S T U D Y - O</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* Background with Texture */}
      <div className="fixed inset-0 bg-[#0c0c0c] -z-20" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="min-h-screen text-stone-300 font-serif selection:bg-amber-900 selection:text-white flex flex-col items-center p-6 md:p-12">
        
        {/* Header */}
        <header className="w-full max-w-6xl flex justify-between items-end mb-12 border-b-2 border-stone-800 pb-4">
          <div>
            <h1 className="text-4xl tracking-[0.2em] font-medium text-stone-200 uppercase">
              Study—O
            </h1>
            <p className="text-xs tracking-widest text-amber-700/60 mt-2 uppercase">Collaborative Archive & Study Hall</p>
          </div>
          {sessionId && (
            <div className="flex flex-col items-end gap-1">
               <div className="text-[10px] uppercase tracking-widest text-stone-500">Session Reference</div>
               <div className="font-mono text-amber-700/80 text-lg border border-stone-800 px-3 py-1 bg-[#0a0a0a]">
                 {sessionId}
               </div>
            </div>
          )}
        </header>

        {!sessionId ? (
          <div className="flex flex-col items-center justify-center flex-1 w-full animate-in fade-in duration-700">
            <div className="bg-[#111] border-4 border-double border-stone-800 p-12 max-w-md w-full shadow-2xl relative">
              
              {/* Decorative Corner accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-amber-800/30"/>
              <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-amber-800/30"/>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-amber-800/30"/>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-amber-800/30"/>

              <h2 className="text-xl text-center mb-10 tracking-widest text-stone-400 font-light uppercase">Authentication</h2>
              
              <div className="flex mb-8 border-b border-stone-800 pb-1">
                <button 
                  onClick={() => setJoinMode('create')} 
                  className={`flex-1 pb-2 text-xs tracking-widest uppercase transition-all duration-300 ${joinMode === 'create' ? 'text-amber-600 border-b border-amber-600' : 'text-stone-600 hover:text-stone-400'}`}
                >
                  Create
                </button>
                <div className="w-px bg-stone-800 mx-4"></div>
                <button 
                  onClick={() => setJoinMode('join')} 
                  className={`flex-1 pb-2 text-xs tracking-widest uppercase transition-all duration-300 ${joinMode === 'join' ? 'text-amber-600 border-b border-amber-600' : 'text-stone-600 hover:text-stone-400'}`}
                >
                  Join
                </button>
              </div>
              
              <div className="space-y-8">
                <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-stone-600 mb-2 group-focus-within:text-amber-700 transition-colors">Scholar Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent border-b border-stone-700 py-2 outline-none text-stone-300 focus:border-amber-700 transition-colors font-serif placeholder:text-stone-800" 
                        placeholder="e.g. A. Einstein" 
                    />
                </div>

                {joinMode === 'join' && (
                    <div className="group">
                        <label className="block text-[10px] uppercase tracking-widest text-stone-600 mb-2 group-focus-within:text-amber-700 transition-colors">Room Code</label>
                        <input 
                            type="text" 
                            value={inputRoomId} 
                            onChange={(e) => setInputRoomId(e.target.value)} 
                            className="w-full bg-transparent border-b border-stone-700 py-2 outline-none text-stone-300 focus:border-amber-700 transition-colors font-mono placeholder:text-stone-800" 
                            placeholder="XXX-XXX" 
                        />
                    </div>
                )}

                <button 
                    onClick={handleJoin} 
                    disabled={!name}
                    className="w-full mt-8 border border-stone-700 text-stone-400 hover:text-amber-500 hover:border-amber-700 py-3 uppercase text-xs tracking-[0.2em] transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-900"
                >
                    {joinMode === 'create' ? 'Commence Session' : 'Enter Chamber'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 h-[80vh]">
            
            {/* Left Column: Document Viewer */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-full">
              <div className="flex justify-between items-center px-2">
                <div className="text-xs uppercase tracking-widest text-stone-500">
                  {docUrl ? "Current Manuscript" : "No Document Loaded"}
                </div>
                <label className="cursor-pointer text-[10px] uppercase tracking-widest text-amber-700 hover:text-amber-500 transition-colors border-b border-transparent hover:border-amber-500">
                  {uploading ? "Transcribing..." : "Upload PDF"}
                  <input type="file" className="hidden" accept=".pdf,.png,.jpg" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>

              <div className="flex-1 bg-[#151515] border border-stone-800 shadow-2xl relative overflow-hidden">
                {/* Vintage Frame Effect */}
                <div className="absolute inset-0 border-[6px] border-[#0a0a0a] pointer-events-none z-10"></div>
                <div className="absolute inset-[6px] border border-stone-800 pointer-events-none z-10"></div>
                
                {docUrl ? (
                  <iframe src={docUrl} className="w-full h-full border-none mix-blend-normal opacity-90" title="Doc" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-700">
                    <span className="font-serif italic text-lg opacity-50">The lectern is empty.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Tools */}
            <div className="lg:col-span-4 flex flex-col gap-8 h-full">
              
              {/* Notes Section */}
              <div className="flex-1 flex flex-col relative">
                <div className="absolute -left-2 top-4 bottom-4 w-1 border-l-2 border-dotted border-stone-800"></div>
                <div className="flex justify-between items-end mb-2 border-b border-stone-800 pb-2">
                   <h3 className="font-serif italic text-stone-400 text-lg">Field Notes</h3>
                   <span className={`text-[9px] uppercase tracking-widest ${savingNotes ? 'text-amber-700 animate-pulse' : 'text-stone-600'}`}>
                     {savingNotes ? "Archiving..." : "Archived"}
                   </span>
                </div>
                <textarea 
                  value={myNotes}
                  onChange={(e) => setMyNotes(e.target.value)}
                  className="flex-1 bg-[#0f0f0f] border-none resize-none outline-none text-sm text-stone-300 placeholder:text-stone-800 font-mono leading-7 p-4 shadow-inner"
                  spellCheck={false}
                  // style={{ backgroundImage: 'linear-gradient(#1c1c1c 1px, transparent 1px)', backgroundSize: '100% 28px', lineHeight: '28px' }}
                />
              </div>

              {/* Chat Section */}
              <div className="h-[40%] flex flex-col border-t border-stone-800 pt-4">
                 <div className="mb-2">
                    <h3 className="font-serif italic text-stone-400 text-sm">Discourse</h3>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
                    {logs.map((log, i) => (
                      <div key={i} className={`text-sm ${log.type === 'system' ? 'text-center text-stone-600 text-xs italic my-2 font-serif' : ''}`}>
                         {log.type !== 'system' && (
                           <div className="flex flex-col">
                             <span className="text-[10px] uppercase tracking-wider text-amber-900/60 mb-1">{log.user}</span>
                             <span className={`font-serif leading-relaxed ${log.type === 'action' ? 'text-stone-500 italic' : 'text-stone-300'}`}>
                               {log.type === 'action' ? `* ${log.msg} *` : log.msg}
                             </span>
                           </div>
                         )}
                         {log.type === 'system' && <span>— {log.msg} —</span>}
                      </div>
                    ))}
                 </div>

                 <div className="relative">
                   <input 
                      type="text" 
                      value={chatMsg} 
                      onChange={(e) => setChatMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                      className="w-full bg-transparent border-b border-stone-700 py-2 pr-8 text-sm outline-none focus:border-amber-700 transition text-stone-300 font-serif italic placeholder:text-stone-700 placeholder:not-italic" 
                      placeholder="Add to the discourse..." 
                   />
                   <span className="absolute right-0 top-2 text-stone-700 text-xs">↵</span>
                 </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}