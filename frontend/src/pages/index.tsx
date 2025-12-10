import { useState, useRef, useEffect } from 'react';
import { client } from '@/client';
import { User, SessionToken, SessionAction, NoteRequest } from '@/study_pb'; 

export default function Home() {
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [chatMsg, setChatMsg] = useState('');
  const [page, setPage] = useState(1);
  const [myUserId, setMyUserId] = useState('');
  const [docUrl, setDocUrl] = useState('');
  
  const [myNotes, setMyNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const streamRef = useRef<any>(null);

  const addToLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const startListening = (token: SessionToken) => {
    addToLog("Listening for updates...");
    const stream = client.streamSessionUpdates(token, {});
    streamRef.current = stream;

    stream.on('data', (event: any) => {
      const userName = event.getUserName();
      if (event.hasUserJoined()) {
        addToLog(`${userName} joined!`);
      } else if (event.hasChatMessage()) {
        addToLog(`${userName}: ${event.getChatMessage()}`);
      } else if (event.hasPageNumber()) {
        setPage(event.getPageNumber());
        addToLog(`${userName} flipped to page ${event.getPageNumber()}`);
      } else if (event.hasDocumentUrl()) {
        setDocUrl(event.getDocumentUrl());
        setPage(1);
        addToLog(`${userName} shared a document!`);
      }
    });
  };

  const loadMyNotes = (sId: string, uId: string) => {
    const token = new SessionToken();
    token.setSessionId(sId);
    token.setUserId(uId);

    client.getMyNotes(token, {}, (err, response) => {
      if (!err) {
        setMyNotes(response.getContent());
        addToLog("Loaded your saved notes.");
      }
    });
  };

  const saveMyNotes = () => {
    setSavingNotes(true);
    const req = new NoteRequest();
    req.setSessionId(sessionId);
    req.setUserId(myUserId);
    req.setContent(myNotes);

    client.saveNote(req, {}, (err) => {
      setSavingNotes(false);
      if (!err) addToLog("Notes saved to DB.");
    });
  };

  const joinSession = () => {
    if (!name) return;
    const userRequest = new User();
    userRequest.setName(name);

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
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('http://localhost:8081/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        const action = new SessionAction();
        action.setSessionId(sessionId);
        action.setUserId(myUserId);
        action.setDocumentUrl(data.url);
        client.sendAction(action, {}, () => {});
      } catch (err) { console.error(err); }
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

  const changePage = (newPage: number) => { 
    if (newPage < 1) return;
    const action = new SessionAction();
    action.setSessionId(sessionId);
    action.setUserId(myUserId);
    action.setPageNumber(newPage);
    client.sendAction(action, {}, () => {});
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-blue-400">Study-O</h1>
      
      {!sessionId ? (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 mb-4" placeholder="Enter name..." />
          <button onClick={joinSession} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold">Join Room</button>
        </div>
      ) : (
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {}
          <div className="md:col-span-2 bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col h-[600px]">
             <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-300 font-bold">Shared View</h3>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs font-bold">
                Upload PDF <input type="file" className="hidden" accept=".pdf,.png,.jpg" onChange={handleFileUpload} />
              </label>
            </div>
            <div className="flex-1 bg-gray-200 rounded overflow-hidden relative">
              {docUrl ? (
                <iframe src={docUrl} className="w-full h-full border-none" title="Doc" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">No Document</div>
              )}
            </div>
            {docUrl && (
              <div className="flex justify-center gap-4 mt-2 items-center">
                <button onClick={() => changePage(page - 1)} className="px-3 py-1 bg-gray-700 rounded">←</button>
                <span>Pg {page}</span>
                <button onClick={() => changePage(page + 1)} className="px-3 py-1 bg-blue-600 rounded">→</button>
              </div>
            )}
          </div>

          {/* COLUMN 2: PERSONAL NOTES (1 col wide) */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col h-[600px]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-yellow-400 font-bold">My Notes</h3>
              <button 
                onClick={saveMyNotes} 
                className="text-xs bg-yellow-600 hover:bg-yellow-500 px-2 py-1 rounded"
              >
                {savingNotes ? "Saving..." : "Save"}
              </button>
            </div>
            <textarea 
              value={myNotes}
              onChange={(e) => setMyNotes(e.target.value)}
              className="flex-1 bg-gray-900 text-yellow-100 p-3 rounded border border-gray-600 resize-none focus:outline-none focus:border-yellow-500 font-mono text-sm"
              placeholder="Type your personal notes here..."
            />
            <p className="text-xs text-gray-500 mt-2">Notes are private and saved to DB.</p>
          </div>

          {/* COLUMN 3: CHAT (1 col wide) */}
          <div className="flex flex-col h-[600px]">
            <div className="flex-1 bg-black p-4 overflow-y-auto font-mono text-xs border border-gray-700 rounded-t-xl">
              {logs.map((log, i) => <div key={i} className="mb-2 border-b border-gray-800 pb-1">{log}</div>)}
            </div>
            <div className="bg-gray-800 p-2 rounded-b-xl border border-gray-700 border-t-0 flex gap-2">
              <input type="text" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-xs" placeholder="Chat..." />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}