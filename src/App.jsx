import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ChevronRight, ShieldCheck, X, ArrowRight,
  Home, Users, ChevronLeft, Phone, MapPin, BookOpen, Edit3, Printer, History, UserPlus, CheckSquare, Square, List
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
  const initialCustomerForm = { id: '', name: '', phone: '', address: '', contractDate: '', contractDetails: '', privateMemo: '' };
  
  const [formData, setFormData] = useState(initialReportForm);
  const [customerFormData, setCustomerFormData] = useState(initialCustomerForm);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      if (data) {
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
        setReports(Array.isArray(data.reports) ? data.reports.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
      }
    } catch (e) {
      console.error("데이터를 가져오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const saveToSheet = async (type, data, action = 'add') => {
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action, type, data }) });
      setTimeout(() => { 
        fetchData(); 
        setCurrentView('dashboard'); 
        setSearchTerm(''); 
        setIsEditMode(false);
      }, 1500);
    } catch (e) { setLoading(false); }
  };

  const handlePrint = () => { window.focus(); setTimeout(() => window.print(), 500); };

  // ★ 숫자 검색 필터 (가장 강력한 버전) ★
  const getFilteredList = () => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return [];

    return customers.filter(c => {
      const name = String(c.name || "").replace(/\s/g, "").toLowerCase();
      const search = s.replace(/\s/g, "");
      // 이름이 검색어로 시작하거나(24...), 이름 안에 검색어가 포함되면 표시
      return name.startsWith(search) || name.indexOf(search) !== -1;
    });
  };

  const filteredResults = getFilteredList();

  if (loading && customers.length === 0) {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-white font-black text-blue-900 gap-4"><div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>시스템 연결 중...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 text-left overflow-x-hidden">
      <nav className="bg-white border-b sticky top-0 z-50 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-black text-xl text-blue-900 cursor-pointer" onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}}>
          <ShieldCheck size={22}/> BPCS 방역특별시
        </div>
        <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
      </nav>

      <main className="max-w-4xl mx-auto p-5">
        {currentView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <header className="pb-2">
              <h3 className="text-xs font-bold text-blue-800 italic uppercase">Best Pest Control Solution</h3>
              <h2 className="text-3xl font-black">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</h2>
            </header>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-5 flex items-center text-slate-400"><Search size={20} /></div>
              <input 
                type="text" 
                placeholder="검색 (예: 24, 25)" 
                className="w-full p-6 pl-14 rounded-[2rem] border-none shadow-xl bg-white font-black text-xl outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              
              {searchTerm.trim() !== "" && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-blue-50 z-50 max-h-[60vh] overflow-y-auto p-3">
                  <div className="px-5 py-3 text-[10px] font-black text-blue-900 uppercase border-b border-slate-50 mb-2 tracking-widest">"{searchTerm}" 검색 결과</div>
                  {filteredResults.length > 0 ? (
                    filteredResults.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-5 hover:bg-blue-50 rounded-2xl cursor-pointer mb-1 transition-all" onClick={() => { setSelectedCustomer(c); setCurrentView('customer_detail'); setSearchTerm(''); }}>
                        <div className="text-left">
                          <div className="font-black text-xl text-slate-900">{String(c.name)}</div>
                          <div className="text-xs text-slate-400 mt-1">{String(c.address || "주소 미등록")}</div>
                        </div>
                        <ArrowRight size={20} className="text-blue-200"/>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-400 font-bold italic">해당 거래처가 없습니다.</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={() => { setFormData(initialReportForm); setIsEditMode(false); setCurrentView('edit'); }} className="col-span-2 bg-blue-900 text-white p-8 rounded-[2rem] font-black text-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Plus strokeWidth={4} size={32}/> 신규 작업 작성</button>
              <button onClick={() => { setCustomerFormData(initialCustomerForm); setCurrentView('customer_edit'); }} className="bg-white border-2 border-blue-900 text-blue-900 p-6 rounded-3xl font-black flex flex-col items-center gap-2 shadow-sm"><UserPlus size={24}/>거래처 등록</button>
              <button onClick={() => { setCurrentView('reports_history'); setSearchTerm(''); }} className="bg-white border-2 border-slate-200 text-slate-600 p-6 rounded-3xl font-black flex flex-col items-center gap-2 shadow-sm"><History size={24}/>기록 수정</button>
            </div>
          </div>
        )}

        {/* --- 거래처 상세 페이지 --- */}
        {currentView === 'customer_detail' && selectedCustomer && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-slate-400 font-bold"><ChevronLeft size={24}/> 뒤로가기</button>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50">
              <h2 className="text-4xl font-black text-slate-900 mb-6">{String(selectedCustomer.name)}</h2>
              <div className="space-y-4 text-slate-600 font-bold">
                <p className="flex items-center gap-3"><Phone size={20} className="text-blue-900"/> {String(selectedCustomer.phone || "미등록")}</p>
                <p className="flex items-center gap-3"><MapPin size={20} className="text-blue-900"/> {String(selectedCustomer.address || "미등록")}</p>
              </div>
            </div>
            <div className="bg-blue-900 p-8 rounded-[2.5rem] shadow-xl text-white">
              <h4 className="text-blue-300 text-[10px] font-black uppercase mb-3 flex items-center gap-2"><BookOpen size={14}/> 내부 관리 메모</h4>
              <p className="font-bold leading-relaxed whitespace-pre-wrap text-sm">{String(selectedCustomer.privateMemo || "정보 없음")}</p>
            </div>
            <button onClick={() => { setFormData({...initialReportForm, customerName: selectedCustomer.name}); setIsEditMode(false); setCurrentView('edit'); }} className="w-full bg-blue-50 text-blue-900 p-7 rounded-3xl font-black text-lg flex items-center justify-center gap-2 mt-4">새 작업 시작 <ArrowRight size={20}/></button>
          </div>
        )}

        {/* --- 작업 기록 조회 목록 --- */}
        {currentView === 'reports_history' && (
          <div className="space-y-6">
             <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-slate-400 font-bold"><ChevronLeft size={24}/> 뒤로</button>
             <h2 className="text-3xl font-black">작업 기록 수정</h2>
             <input type="text" placeholder="이름으로 검색" className="w-full p-5 rounded-2xl border-none shadow-inner bg-white font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             <div className="space-y-3">
               {reports.filter(r => String(r.customerName).includes(searchTerm)).map(r => (
                 <div key={r.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center" onClick={() => { setFormData(r); setCurrentView('report_view'); }}>
                   <div className="text-left">
                     <span className="text-[10px] font-black text-blue-900 bg-blue-50 px-2 py-1 rounded-full">{String(r.date)}</span>
                     <h4 className="font-black text-xl mt-1">{String(r.customerName)}</h4>
                   </div>
                   <ChevronRight className="text-slate-200" />
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* --- 보고서 상세 및 수정 --- */}
        {currentView === 'report_view' && (
           <div className="space-y-8 animate-in zoom-in-95">
             <div className="flex justify-between items-center print:hidden">
               <button onClick={() => setCurrentView('reports_history')} className="text-slate-400 font-bold flex items-center gap-1"><ChevronLeft size={24}/> 목록</button>
               <div className="flex gap-2">
                 <button onClick={() => { setIsEditMode(true); setCurrentView('edit'); }} className="bg-white border-2 border-blue-900 text-blue-900 px-6 py-4 rounded-2xl font-black shadow-md flex items-center gap-2"><Edit3 size={18}/> 수정</button>
                 <button onClick={handlePrint} className="bg-blue-900 text-white px-6 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2"><Printer size={18}/> 인쇄</button>
               </div>
             </div>
             <div id="report-area" className="bg-white p-10 sm:p-20 border border-slate-100 shadow-2xl rounded-[3rem] text-left print:shadow-none print:border-none">
               <div className="border-b-4 border-blue-900 pb-10 mb-16 flex justify-between items-end">
                 <div className="text-left"><h1 className="text-5xl font-black text-slate-900 mb-2 leading-none">SERVICE REPORT</h1><p className="text-blue-600 font-black text-xs tracking-widest uppercase italic">BPCS 방역특별시</p></div>
                 <div className="text-right font-black text-xs text-slate-400 uppercase tracking-widest">Date: {String(formData.date)}</div>
               </div>
               <div className="space-y-16">
                 <div className="grid grid-cols-2 gap-10">
                   <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100"><p className="text-[10px] font-black text-blue-800 uppercase mb-2 opacity-50">Customer</p><p className="text-3xl font-black text-slate-900">{String(formData.customerName)}</p></div>
                   <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100"><p className="text-[10px] font-black text-blue-800 uppercase mb-2 opacity-50">Provider</p><p className="text-2xl font-black text-slate-900">BPCS 방역특별시</p></div>
                 </div>
                 <section><h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest border-b pb-3">Work Summary</h4><div className="bg-slate-50 p-10 rounded-[2.5rem] min-h-[300px] leading-[1.8] font-bold text-xl text-slate-800 whitespace-pre-wrap">{String(formData.workContent || "내용 없음")}</div></section>
               </div>
             </div>
           </div>
        )}

        {/* --- 신규 작성 및 수정 폼 --- */}
        {currentView === 'edit' && (
          <div className="space-y-6 animate-in slide-in-from-bottom">
            <h2 className="text-2xl font-black">{isEditMode ? "기록 수정" : "새 작업 작성"}</h2>
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <input type="text" placeholder="거래처명" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} disabled={isEditMode} />
              <input type="date" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <textarea placeholder="작업 내용을 입력하세요..." className="w-full p-8 rounded-[2.5rem] border-2 border-slate-100 font-bold h-72 shadow-sm outline-none text-lg" value={formData.workContent} onChange={e => setFormData({...formData, workContent: e.target.value})} />
            <button onClick={() => saveToSheet('reports', formData, isEditMode ? 'update' : 'add')} className="w-full bg-blue-900 text-white p-7 rounded-3xl font-black text-2xl shadow-xl active:scale-95 transition-all">저장하기</button>
          </div>
        )}
      </main>

      {/* 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 pb-10 flex justify-around items-center print:hidden z-40">
        <button onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}} className={`flex flex-col items-center gap-1.5 ${currentView === 'dashboard' ? 'text-blue-900' : 'text-slate-300'}`}><Home size={26}/><span className="text-[10px] font-black uppercase tracking-tighter">홈</span></button>
        <button onClick={() => {setCurrentView('reports_history'); setSearchTerm('');}} className={`flex flex-col items-center gap-1.5 ${currentView === 'reports_history' ? 'text-blue-900' : 'text-slate-300'}`}><List size={26}/><span className="text-[10px] font-black uppercase tracking-tighter">기록</span></button>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        @media print {
          html, body { visibility: hidden !important; background-color: white !important; }
          #report-area { visibility: visible !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 1.5cm !important; }
          #report-area * { visibility: visible !important; }
          .print\\:hidden, nav, button, input { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default App;
