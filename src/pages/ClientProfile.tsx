/* ============================================
   FILE: ClientProfile.tsx
   PURPOSE: Client Profile Drill-down Page
   DEPENDENCIES: react, react-router-dom, lucide-react
   EXPORTS: ClientProfile (default)
   ============================================ */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, UserCircle, BrainCircuit, Activity } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '../services/supabaseClient';
import { BrainClient } from '../services/clientService';

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<BrainClient | null>(null);
  const [knowledgeChunks, setKnowledgeChunks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClientData() {
      if (!isSupabaseConfigured() || !id) return;
      setIsLoading(true);

      // 1. Get Client Info
      const { data: clientData } = await getSupabase()!
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (clientData) {
        setClient(clientData as BrainClient);

        // 2. Fetch ingested knowledge chunks matching this client's folder name
        const { data: chunks } = await getSupabase()!
          .from('knowledge_embeddings')
          .select('content, metadata')
          .filter('metadata->>source', 'ilike', `%${clientData.name}%`);

        if (chunks) {
          setKnowledgeChunks(chunks);
        }
      }

      setIsLoading(false);
    }

    fetchClientData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <Activity className="animate-pulse mb-4" size={40} color="#3b82f6" />
        <p>טוען תיק לקוח...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl text-slate-300">תיק לקוח לא נמצא</h2>
        <Link to="/clients" className="text-blue-400 mt-4 inline-block">חזרה לכל הלקוחות</Link>
      </div>
    );
  }

  // Group chunks by file source
  const documentsMap = new Map<string, any[]>();
  knowledgeChunks.forEach(chunk => {
    const source = chunk.metadata?.source || 'מסמך לא ידוע';
    if (!documentsMap.has(source)) documentsMap.set(source, []);
    documentsMap.get(source)!.push(chunk);
  });
  const filesList = Array.from(documentsMap.keys());

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <header className="flex items-center justify-between mb-8 border-b border-slate-700/50 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg border border-slate-600/30">
            <UserCircle size={36} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
              {client.name}
              <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
                {client.status}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">תיק דיגיטלי מלא • עודכן לאחרונה: {new Date(client.last_ingest_date || client.created_at || '').toLocaleDateString('he-IL')}</p>
          </div>
        </div>
        
        <Link to="/clients" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-700">
          <ArrowLeft size={16} /> חזור
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/40 border border-blue-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                <BrainCircuit size={20} /> תובנות מוח (AI)
              </h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed relative z-10">
              {knowledgeChunks.length > 0 ? 
                `המוח ניתח ${knowledgeChunks.length} פריטי מידע סמנטיים מתוך המסמכים שהוזנו לתיק. המערכת מזהה פעילות שוטפת ועיבוד מלא של הקבצים. ניתן להשתמש בצ'אט הצף לשאלות ממוקדות על סמך מסמכים אלו.` 
                : 
                'אין עדיין חומר קריא ללקוח זה. שאב תיקייה ב"המוח למד" כדי שארכיב כאן תובנות.'}
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
             <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
                <FileText size={20} className="text-amber-400" /> 
                מסמכים שנסרקו למערכת ({filesList.length})
              </h2>
              
              {filesList.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filesList.map((fileName, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText size={16} className="text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-300 truncate" dir="ltr">{fileName.split('/').pop()}</span>
                      </div>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700">
                        {documentsMap.get(fileName)?.length} מקטעים
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">לא נמצאו מסמכים שקושרו ישירות ללקוח.</div>
              )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">פעולות מהירות</h3>
            <div className="space-y-2">
               <button className="w-full text-right p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/60 text-sm text-slate-200 transition-colors border border-transparent hover:border-slate-600">
                  📄 הפק דוח מס שוטף
               </button>
               <button className="w-full text-right p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/60 text-sm text-slate-200 transition-colors border border-transparent hover:border-slate-600">
                  🎯 חבר לתרשים זרימה
               </button>
               <button className="w-full text-right p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-sm text-amber-500 transition-colors border border-amber-500/20">
                  + בקש חוסרים (Mission)
               </button>
            </div>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">סטטיסטיקה</h3>
            <ul className="space-y-3">
              <li className="flex justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-300 text-sm">מקטעי תוכן:</span>
                <span className="text-blue-400 font-bold font-mono">{knowledgeChunks.length}</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-slate-300 text-sm">סך קבצים:</span>
                <span className="text-white font-bold font-mono">{client.files_count}</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
