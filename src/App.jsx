import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ChevronRight, ShieldCheck, X, ArrowRight,
  Home, Users, ChevronLeft, Phone, MapPin, BookOpen, Edit3, Printer, UserPlus, CheckSquare, Square, List, Info
} from 'lucide-react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWvHRx4jSkPcqajhIqcrLgq0qhEgyj8P6xnpu4260h3mxvkEPlaThkeOLjSo7VVIGG/exec"; 

const ALL_PESTS = ["바퀴벌레", "개미", "쥐", "보행해충", "비래_해충", "빈대", "흰개미", "기타"];

const ChecklistItem = ({ pest, checked, onToggle }) => (
  <div onClick={onToggle} className={`flex items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-95 ${checked ? 'bg-blue-900 border-blue-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 shadow-sm'}`}>
    {checked ? <CheckSquare size={18} /> : <Square size={18} />}
    <span className="font-bold text-sm">{pest}</span>
  </div>
);

// 구글 시트의 과거 텍스트 데이터를 에러 없이 안전하게 변환하는 함수
const safeParseChecklist = (val) => {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val); 
  } catch (e) {
    let legacy = {};
    ALL_PESTS.forEach(p => {
      if (String(val).includes(p)) legacy[p] = true;
    });
    return legacy;
  }
};

const App = () => {
  const [reports, setReports] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const initialReportForm = { id: '', customerName: '', date: new Date().toISOString().split('T')[0], checklist: {}, workContent: '', privateMemo: '' };
  const initialCustomerForm = { id: '', name: '', phone: '', address: '', checklist: {}, generalMemo: '', privateMemo: '' };
  
  const [formData, setFormData] = useState(initialReportForm);
  const [customerFormData, setCustomerFormData] = useState(initialCustomerForm);
  const [isCustomerEditMode, setIsCustomerEditMode] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      if (data) {
        setCustomers(Array.isArray(data.customers) ? data.customers : []);
        setReports(Array.isArray(data.reports) ? data.reports.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
      }
    } catch (e) { console.error("Data Fetch Error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const saveToSheet = async (type, data, action = 'add') => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (payload.checklist) payload.checklist = JSON.stringify(payload.checklist);

      await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action, type, data: payload }) });
      setTimeout(() => { 
        fetchData(); 
        setCurrentView('dashboard'); 
        setSearchTerm(''); 
        setIsCustomerEditMode(false);
      }, 1500);
    } catch (e) { setLoading(false); }
  };

  const forceString = (val) => val ? String(val) : "";

  const getFilteredList = () => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return [];
    return customers.filter(c => {
      const name = forceString(c.name).replace(/\s/g, "").toLowerCase();
      const search = s.replace(/\s/g, "");
      return name.startsWith(search) || name.includes(search);
    });
  };

  const filteredResults = getFilteredList();

  if (loading && customers.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-white font-black text-blue-900">데이터 동기화 중...</div>;
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
                placeholder="검색" 
                className="w-full p-6 pl-14 rounded-[2rem] border-none shadow-xl bg-white font-black text-xl outline-none focus:ring-4 focus:ring-blue-100 transition-all" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              
              {searchTerm.trim() !== "" && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-blue-50 z-50 max-h-[60vh] overflow-y-auto p-3">
                  {filteredResults.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-5 hover:bg-blue-50 rounded-2xl cursor-pointer mb-1 border border-transparent hover:border-blue-100 transition-all" onClick={() => { setSelectedCustomer(c); setCurrentView('customer_detail'); setSearchTerm(''); }}>
                      <div className="text-left">
                        <div className="font-black text-xl">{forceString(c.name)}</div>
                        <div className="text-xs text-slate-400 mt-1">{forceString(c.address)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setCustomerFormData({...c, checklist: safeParseChecklist(c.checklist)}); setIsCustomerEditMode(true); setCurrentView('customer_edit'); }} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-blue-900"><Edit3 size={18}/></button>
                        <div className="p-2 bg-blue-50 rounded-full text-blue-900"><ArrowRight size={18}/></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={() => { setFormData(initialReportForm); setCurrentView('edit'); }} className="col-span-2 bg-blue-900 text-white p-8 rounded-[2rem] font-black text-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Plus strokeWidth={4} size={32}/> 신규 작업 작성</button>
              <button onClick={() => { setCustomerFormData(initialCustomerForm); setIsCustomerEditMode(false); setCurrentView('customer_edit'); }} className="bg-white border-2 border-blue-900 text-blue-900 p-6 rounded-3xl font-black flex flex-col items-center gap-2 shadow-sm"><UserPlus size={24}/>거래처 등록</button>
              <button onClick={() => { setCurrentView('customer_list'); setSearchTerm(''); }} className="bg-white border-2 border-slate-200 text-slate-600 p-6 rounded-3xl font-black flex flex-col items-center gap-2 shadow-sm"><Users size={24}/>거래처 목록</button>
            </div>
          </div>
        )}

        {currentView === 'customer_list' && (
          <div className="space-y-6 animate-in fade-in">
             <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-slate-400 font-bold"><ChevronLeft size={24}/> 대시보드</button>
             <h2 className="text-3xl font-black">거래처 목록</h2>
             <input type="text" placeholder="이름 검색" className="w-full p-5 rounded-2xl border-none shadow-inner bg-white font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             <div className="space-y-3 pb-20">
               {customers.filter(c => forceString(c.name).includes(searchTerm)).map(c => (
                 <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center" onClick={() => { setSelectedCustomer(c); setCurrentView('customer_detail'); }}>
                   <div className="text-left"><h4 className="font-black text-xl">{forceString(c.name)}</h4><p className="text-xs text-slate-400 mt-1">{forceString(c.address)}</p></div>
                   <div className="flex gap-2">
                     <button onClick={(e) => { e.stopPropagation(); setCustomerFormData({...c, checklist: safeParseChecklist(c.checklist)}); setIsCustomerEditMode(true); setCurrentView('customer_edit'); }} className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:text-blue-900"><Edit3 size={20}/></button>
                     <ChevronRight className="text-slate-200" />
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {currentView === 'customer_detail' && selectedCustomer && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <button onClick={() => setCurrentView('customer_list')} className="flex items-center gap-1 text-slate-400 font-bold"><ChevronLeft size={24}/> 목록</button>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-4xl font-black text-slate-900">{forceString(selectedCustomer.name)}</h2>
                <button onClick={() => { setCustomerFormData({...selectedCustomer, checklist: safeParseChecklist(selectedCustomer.checklist)}); setIsCustomerEditMode(true); setCurrentView('customer_edit'); }} className="bg-blue-50 text-blue-900 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1"><Edit3 size={14}/> 정보 수정</button>
              </div>
              <div className="space-y-4 text-slate-600 font-bold">
                <p className="flex items-center gap-3"><Phone size={20} className="text-blue-900"/> {forceString(selectedCustomer.phone) || "연락처 미등록"}</p>
                <p className="flex items-center gap-3"><MapPin size={20} className="text-blue-900"/> {forceString(selectedCustomer.address) || "주소 미등록"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-7 rounded-3xl border shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck size={14}/> 주요 관리 해충</h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const checks = safeParseChecklist(selectedCustomer.checklist);
                    const activePests = ALL_PESTS.filter(p => checks[p]);
                    return activePests.length > 0 ? (
                      activePests.map((p, i) => <span key={i} className="px-3 py-1 bg-blue-900 text-white rounded-lg text-xs font-bold">{p}</span>)
                    ) : (
                      <span className="text-slate-300 italic text-sm">정보 없음</span>
                    );
                  })()}
                </div>
              </div>
              <div className="bg-slate-100 p-7 rounded-3xl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={14}/> 일반 메모 (고객 정보)</h4>
                <p className="font-bold text-sm leading-relaxed whitespace-pre-wrap">{forceString(selectedCustomer.generalMemo) || "기록 없음"}</p>
              </div>
              <div className="bg-blue-900 p-7 rounded-3xl text-white">
                <h4 className="text-blue-300 text-[10px] font-black uppercase mb-3 flex items-center gap-2"><BookOpen size={14}/> 내부 관리 메모 (비공개)</h4>
                <p className="font-bold text-sm leading-relaxed whitespace-pre-wrap">{forceString(selectedCustomer.privateMemo) || "기록 없음"}</p>
              </div>
            </div>
            <button onClick={() => { setFormData({...initialReportForm, customerName: selectedCustomer.name}); setCurrentView('edit'); }} className="w-full bg-blue-900 text-white p-7 rounded-3xl font-black text-lg flex items-center justify-center gap-2 mt-4 shadow-xl">이 거래처로 작업 시작 <ArrowRight size={20}/></button>
          </div>
        )}

        {currentView === 'customer_edit' && (
          <div className="space-y-8 animate-in slide-in-from-bottom pb-20">
            <h2 className="text-3xl font-black">{isCustomerEditMode ? "거래처 정보 수정" : "신규 거래처 등록"}</h2>
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <input type="text" placeholder="거래처 명칭 (예: 25 삼성식당)" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={customerFormData.name} onChange={e => setCustomerFormData({...customerFormData, name: e.target.value})} />
              <input type="tel" placeholder="연락처" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={customerFormData.phone} onChange={e => setCustomerFormData({...customerFormData, phone: e.target.value})} />
              <input type="text" placeholder="주소" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={customerFormData.address} onChange={e => setCustomerFormData({...customerFormData, address: e.target.value})} />
            </div>

            <div className="space-y-3 px-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">대상 해충 체크리스트</h4>
              <div className="grid grid-cols-2 gap-3">
                {ALL_PESTS.map((pest, i) => (
                  <ChecklistItem 
                    key={i} 
                    pest={pest} 
                    checked={customerFormData.checklist && customerFormData.checklist[pest]} 
                    onToggle={() => setCustomerFormData(p => ({...p, checklist: {...(p.checklist || {}), [pest]: !(p.checklist && p.checklist[pest])}}))} 
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">일반 메모</h4>
                <textarea placeholder="고객 관련 일반적인 사항..." className="w-full p-6 rounded-3xl border-2 border-slate-100 font-bold h-32 outline-none focus:border-blue-900" value={customerFormData.generalMemo} onChange={e => setCustomerFormData({...customerFormData, generalMemo: e.target.value})} />
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">내부 메모 (비공개)</h4>
                <textarea placeholder="현장 지침 및 관리자 참고 사항..." className="w-full p-6 rounded-3xl border-2 border-slate-100 font-bold h-32 outline-none focus:border-blue-900 bg-slate-50" value={customerFormData.privateMemo} onChange={e => setCustomerFormData({...customerFormData, privateMemo: e.target.value})} />
              </div>
            </div>

            <button onClick={() => saveToSheet('customers', isCustomerEditMode ? customerFormData : {...customerFormData, id: Date.now().toString()}, isCustomerEditMode ? 'update' : 'add')} className="w-full bg-blue-900 text-white p-7 rounded-3xl font-black text-xl shadow-xl">
              {isCustomerEditMode ? "수정 내용 저장" : "거래처 등록 완료"}
            </button>
            <button onClick={() => { setCurrentView('dashboard'); setIsCustomerEditMode(false); }} className="w-full text-slate-300 font-bold py-2">취소하고 돌아가기</button>
          </div>
        )}

        {currentView === 'edit' && (
          <div className="space-y-6 animate-in slide-in-from-bottom pb-20">
            <h2 className="text-3xl font-black">방역 작업 작성</h2>
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <input type="text" placeholder="거래처명" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              <input type="date" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="space-y-3 px-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">해충 점검</h4>
              <div className="grid grid-cols-2 gap-3">
                {ALL_PESTS.map((pest, i) => (
                  <ChecklistItem key={i} pest={pest} checked={formData.checklist && formData.checklist[pest]} onToggle={() => setFormData(p => ({...p, checklist: {...(p.checklist || {}), [pest]: !(p.checklist && p.checklist[pest])}}))} />
                ))}
              </div>
            </div>
            <textarea placeholder="방역 내용을 상세히 적어주세요..." className="w-full p-8 rounded-[2.5rem] border-2 border-slate-100 font-bold h-72 shadow-sm outline-none text-lg" value={formData.workContent} onChange={e => setFormData({...formData, workContent: e.target.value})} />
            <button onClick={() => saveToSheet('reports', {...formData, id: Date.now().toString()})} className="w-full bg-blue-900 text-white p-7 rounded-3xl font-black text-2xl shadow-xl">보고서 저장</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 pb-10 flex justify-around items-center print:hidden z-40">
        <button onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}} className={`flex flex-col items-center gap-1.5 ${currentView === 'dashboard' ? 'text-blue-900' : 'text-slate-300'}`}><Home size={26}/><span className="text-[10px] font-black uppercase tracking-tighter">홈</span></button>
        <button onClick={() => {setCurrentView('customer_list'); setSearchTerm('');}} className={`flex flex-col items-center gap-1.5 ${currentView === 'customer_list' ? 'text-blue-900' : 'text-slate-300'}`}><Users size={26}/><span className="text-[10px] font-black uppercase tracking-tighter">거래처</span></button>
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        @media print {
          html, body { visibility: hidden !important; background-color: white !important; }
          #report-area { visibility: visible !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 1.5cm !important; }
          #report-area * { visibility: visible !important; }
          .print\\:hidden, nav, button, input, textarea { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default App;
