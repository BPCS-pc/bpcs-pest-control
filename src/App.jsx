import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ChevronRight, ShieldCheck, X, ArrowRight,
  Home, Users, ChevronLeft, Phone, MapPin, BookOpen, Edit3, Printer, History, UserPlus, CheckSquare, Square
} from 'lucide-react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWvHRx4jSkPcqajhIqcrLgq0qhEgyj8P6xnpu4260h3mxvkEPlaThkeOLjSo7VVIGG/exec"; 

const ALL_PESTS = ["바퀴벌레", "개미", "쥐", "보행해충", "비래_해충", "빈대", "흰개미", "기타"];

const App = () => {
  const [reports, setReports] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const initialReportForm = { id: '', customerName: '', date: new Date().toISOString().split('T')[0], checklist: {}, workContent: '', privateMemo: '' };
  const [formData, setFormData] = useState(initialReportForm);
  const [isEditMode, setIsEditMode] = useState(false);

  // 어떤 데이터 타입이 들어와도 안전하게 문자로 변환해주는 도구
  const cleanStr = (val) => {
    if (val === null || val === undefined) return "";
    return String(val).replace(/\s/g, "").toLowerCase();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      // 데이터가 비어있지 않은 것만 골라내기
      setCustomers(Array.isArray(data.customers) ? data.customers.filter(c => c.name) : []);
      setReports(Array.isArray(data.reports) ? data.reports.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
    } catch (e) { console.error("Fetch Error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveToSheet = async (type, data, action = 'add') => {
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action, type, data }) });
      setTimeout(() => { fetchData(); setCurrentView('dashboard'); setSearchTerm(''); }, 1500);
    } catch (e) { setLoading(false); }
  };

  // ★ 24, 25 같은 숫자 검색을 위한 초정밀 필터 ★
  const filteredResults = customers.filter(c => {
    const search = cleanStr(searchTerm);
    if (!search) return false;
    // 오직 거래처 이름(name)에서만 검색
    return cleanStr(c.name).includes(search);
  }).sort((a, b) => String(a.name).localeCompare(String(b.name)));

  if (loading && customers.length === 0) {
    return <div className="flex items-center justify-center min-h-screen font-black text-blue-900 animate-pulse text-lg">데이터 연결 중...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 text-left selection:bg-blue-100">
      <nav className="bg-white border-b sticky top-0 z-50 p-4 flex justify-between items-center shadow-sm print:hidden">
        <div className="flex items-center gap-2 font-black text-xl text-blue-900" onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}}>
          <ShieldCheck size={24} strokeWidth={3}/> BPCS 방역특별시
        </div>
        <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-green-700">ONLINE</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-5 print:p-0">
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-1">
              <h3 className="text-[11px] font-black text-blue-800 tracking-[0.2em] uppercase italic opacity-70">Expert Pest Control Solution</h3>
              <h2 className="text-4xl font-black tracking-tighter">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</h2>
            </header>
            
            {/* 검색창 */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center text-slate-300 group-focus-within:text-blue-900 transition-colors"><Search size={22} strokeWidth={3}/></div>
              <input 
                type="text" 
                placeholder="검색" 
                className="w-full p-7 pl-16 rounded-[2.5rem] border-none shadow-2xl bg-white font-black text-2xl outline-none focus:ring-8 focus:ring-blue-50 transition-all placeholder:text-slate-200" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              
              {/* 실시간 이름 검색 결과 */}
              {searchTerm.trim() !== "" && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-blue-50 z-50 max-h-[60vh] overflow-y-auto p-3 animate-in slide-in-from-top-4">
                  <div className="px-6 py-4 text-[10px] font-black text-blue-900 uppercase border-b border-slate-50 mb-2 tracking-[0.3em]">거래처 검색 결과 ({filteredResults.length})</div>
                  {filteredResults.length > 0 ? (
                    filteredResults.map(c => (
                      <div key={c.id || Math.random()} className="flex items-center justify-between p-6 hover:bg-blue-50 rounded-3xl cursor-pointer active:scale-[0.98] transition-all group" onClick={() => { setSelectedCustomer(c); setCurrentView('customer_detail'); setSearchTerm(''); }}>
                        <div>
                          <div className="font-black text-2xl text-slate-900 group-hover:text-blue-900 transition-colors">{String(c.name)}</div>
                          <div className="text-sm text-slate-400 font-bold mt-1 flex items-center gap-1"><MapPin size={14}/> {String(c.address || "주소 정보 없음")}</div>
                        </div>
                        <div className="bg-blue-900 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={20}/></div>
                      </div>
                    ))
                  ) : (
                    <div className="p-16 text-center text-slate-300 font-black italic text-xl">일치하는 이름이 없습니다.</div>
                  )}
                </div>
              )}
            </div>

            {/* 메인 메뉴 버튼 */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={() => { setFormData(initialReportForm); setIsEditMode(false); setCurrentView('edit'); }} className="col-span-2 bg-blue-900 text-white p-8 rounded-[2.5rem] font-black text-2xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-slate-900"><Plus strokeWidth={4} size={32}/> 신규 작업 작성</button>
              <button onClick={() => setCurrentView('reports_history')} className="bg-white border-2 border-slate-200 text-slate-500 p-7 rounded-[2rem] font-black flex flex-col items-center gap-2 shadow-sm active:bg-slate-50 active:scale-95 transition-all"><History size={28}/>기록 수정/조회</button>
              <button onClick={() => setCurrentView('customer_list')} className="bg-white border-2 border-slate-200 text-slate-500 p-7 rounded-[2rem] font-black flex flex-col items-center gap-2 shadow-sm active:bg-slate-50 active:scale-95 transition-all"><Users size={28}/>거래처 목록</button>
            </div>
          </div>
        )}

        {/* --- 작업 기록 조회/수정 목록 --- */}
        {currentView === 'reports_history' && (
          <div className="space-y-6 animate-in slide-in-from-right">
             <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-slate-400 font-black mb-4 hover:text-blue-900 transition-colors"><ChevronLeft size={28} strokeWidth={3}/> <span>돌아가기</span></button>
             <h2 className="text-4xl font-black tracking-tight">기록 수정 및 조회</h2>
             <div className="relative">
                <Search className="absolute left-5 top-5 text-slate-300" size={20}/>
                <input type="text" placeholder="거래처명으로 검색" className="w-full p-5 pl-14 rounded-2xl border-none shadow-inner bg-white font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>
             <div className="space-y-3 pb-24">
               {reports.filter(r => cleanStr(r.customerName).includes(cleanStr(searchTerm))).map(r => (
                 <div key={r.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center active:scale-[0.98] transition-all" onClick={() => { setFormData(r); setCurrentView('report_view'); }}>
                   <div className="text-left">
                     <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block tracking-widest">{String(r.date)}</span>
                     <h4 className="font-black text-2xl text-slate-900">{String(r.customerName)}</h4>
                   </div>
                   <ChevronRight className="text-slate-200" size={30}/>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* --- 거래처 상세 페이지 --- */}
        {currentView === 'customer_detail' && selectedCustomer && (
          <div className="space-y-8 animate-in slide-in-from-right">
            <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-slate-400 font-black"><ChevronLeft size={28} strokeWidth={3}/> <span>대시보드</span></button>
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-50 text-left">
              <h2 className="text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tighter">{String(selectedCustomer.name)}</h2>
              <div className="space-y-5 text-slate-600 font-black text-lg">
                <p className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl"><Phone size={24} className="text-blue-900"/> {String(selectedCustomer.phone || "연락처 미등록")}</p>
                <p className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl"><MapPin size={24} className="text-blue-900"/> {String(selectedCustomer.address || "주소 미등록")}</p>
              </div>
            </div>
            <div className="bg-blue-900 p-10 rounded-[3rem] shadow-2xl text-white">
              <h4 className="text-blue-300 text-[11px] font-black uppercase mb-4 tracking-widest flex items-center gap-2"><BookOpen size={16}/> 관리 지침 (비공개 메모)</h4>
              <p className="font-bold text-xl leading-relaxed whitespace-pre-wrap opacity-90">{String(selectedCustomer.privateMemo || "기록된 내부 지침이 없습니다.")}</p>
            </div>
            <button onClick={() => { setFormData({...initialReportForm, customerName: selectedCustomer.name}); setIsEditMode(false); setCurrentView('edit'); }} className="w-full bg-blue-100 text-blue-900 p-8 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">이 거래처로 작업 시작 <ArrowRight size={28} strokeWidth={3}/></button>
          </div>
        )}

        {/* --- 작업 작성/수정 폼 --- */}
        {currentView === 'edit' && (
          <div className="space-y-6 animate-in slide-in-from-bottom">
            <h2 className="text-3xl font-black">{isEditMode ? "작업 기록 수정" : "신규 작업 작성"}</h2>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">거래처 명칭</label>
                <input type="text" className="w-full p-5 rounded-2xl bg-slate-50 border-none font-black text-2xl text-slate-900" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} disabled={isEditMode} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">작업 일자</label>
                <input type="date" className="w-full p-5 rounded-2xl bg-slate-50 border-none font-black text-2xl text-slate-900" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">상세 작업 내역</label>
              <textarea placeholder="방역 서비스 상세 내용을 입력하세요..." className="w-full p-8 rounded-[2.5rem] border-2 border-slate-100 font-bold h-80 shadow-sm outline-none focus:border-blue-900 transition-all text-xl leading-relaxed" value={formData.workContent} onChange={e => setFormData({...formData, workContent: e.target.value})} />
            </div>
            <button onClick={() => saveToSheet('reports', formData, isEditMode ? 'update' : 'add')} className="w-full bg-blue-900 text-white p-8 rounded-[2.5rem] font-black text-2xl shadow-2xl active:scale-95 transition-all">
              {isEditMode ? "수정 완료 및 저장" : "구글 시트에 전송"}
            </button>
            <button onClick={() => setCurrentView('dashboard')} className="w-full text-slate-400 font-black py-4 hover:text-slate-900 transition-colors">취소하고 나가기</button>
          </div>
        )}

        {/* --- 보고서 뷰 (인쇄용) --- */}
        {currentView === 'report_view' && (
           <div className="space-y-8 animate-in zoom-in-95">
             <div className="flex justify-between items-center print:hidden">
               <button onClick={() => setCurrentView('reports_history')} className="text-slate-400 font-black flex items-center gap-2"><ChevronLeft size={28} strokeWidth={3}/> <span>목록으로</span></button>
               <div className="flex gap-3">
                 <button onClick={() => { setIsEditMode(true); setCurrentView('edit'); }} className="bg-white border-2 border-blue-900 text-blue-900 px-8 py-5 rounded-2xl font-black shadow-md flex items-center gap-2 active:scale-95 transition-all"><Edit3 size={20}/> 수정</button>
                 <button onClick={() => { window.print(); }} className="bg-blue-900 text-white px-8 py-5 rounded-2xl font-black shadow-xl flex items-center gap-2 active:scale-95 transition-all"><Printer size={20}/> 인쇄 / PDF</button>
               </div>
             </div>
             
             <div id="report-area" className="bg-white p-10 sm:p-24 border border-slate-100 shadow-2xl rounded-[4rem] text-left print:shadow-none print:border-none print:p-0 print:rounded-none">
               <div className="border-b-8 border-blue-900 pb-12 mb-20 flex justify-between items-end">
                 <div className="text-left"><h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-none">SERVICE<br/>REPORT</h1><p className="text-blue-600 font-black text-sm tracking-[0.6em] uppercase italic opacity-90">Expert Pest Control Solution</p></div>
                 <div className="text-right font-black text-sm text-slate-400 uppercase tracking-widest pb-2">Service Date: {String(formData.date)}</div>
               </div>
               <div className="space-y-20">
                 <div className="grid grid-cols-2 gap-12">
                   <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 text-left"><p className="text-[11px] font-black text-blue-800 uppercase mb-3 opacity-40 tracking-widest">Client Name</p><p className="text-4xl font-black text-slate-900">{String(formData.customerName)}</p></div>
                   <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 text-left"><p className="text-[11px] font-black text-blue-800 uppercase mb-3 opacity-40 tracking-widest">Provider</p><p className="text-3xl font-black text-slate-900">BPCS 방역특별시</p></div>
                 </div>
                 <section className="text-left">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase mb-10 tracking-[0.5em] border-b-2 border-slate-100 pb-4">Service Details</h4>
                   <div className="bg-slate-50 p-12 rounded-[3.5rem] min-h-[400px] leading-[1.8] font-bold text-2xl text-slate-800 whitespace-pre-wrap">{String(formData.workContent) || "서비스 내역이 비어 있습니다."}</div>
                 </section>
                 <div className="pt-20 border-t-2 border-slate-900 flex justify-between items-center font-black text-xs text-slate-400 uppercase tracking-widest"><p>Verification System v1.0</p><p>Authorized Signature: _________________</p></div>
               </div>
             </div>
           </div>
        )}
      </main>

      {/* 하단 탭 내비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 pb-12 flex justify-around items-center print:hidden shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-40">
        <button onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}} className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${currentView === 'dashboard' ? 'text-blue-900' : 'text-slate-300'}`}><Home size={30} strokeWidth={currentView === 'dashboard' ? 3 : 2}/><span className="text-[10px] font-black uppercase tracking-tighter">메인 홈</span></button>
        <button onClick={() => {setCurrentView('reports_history'); setSearchTerm('');}} className={`flex flex-col items-center gap-2 transition-all active:scale-90 ${currentView === 'reports_history' ? 'text-blue-900' : 'text-slate-300'}`}><List size={30} strokeWidth={currentView === 'reports_history' ? 3 : 2}/><span className="text-[10px] font-black uppercase tracking-tighter">기록 수정</span></button>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        @media print {
          html, body { visibility: hidden !important; background-color: white !important; -webkit-print-color-adjust: exact !important; }
          #report-area { visibility: visible !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; }
          #report-area * { visibility: visible !important; }
          .print\\:hidden, nav, button, input { display: none !important; }
        }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}} />
    </div>
  );
};

export default App;
