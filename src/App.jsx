import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ChevronRight, ShieldCheck, X, ArrowRight,
  Home, Users, ChevronLeft, Phone, MapPin, BookOpen, Edit3, Printer, UserPlus, CheckSquare, Square
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

  const saveToSheet = async (type, data) => {
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'add', type, data }) });
      setTimeout(() => { fetchData(); setCurrentView('dashboard'); setSearchTerm(''); }, 1500);
    } catch (e) { setLoading(false); }
  };

  const handlePrint = () => { window.focus(); setTimeout(() => window.print(), 500); };

  // 이름 검색 필터 (숫자/문자 통합)
  const getFilteredList = () => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return [];
    return customers.filter(c => {
      const name = String(c.name || "").replace(/\s/g, "").toLowerCase();
      const search = s.replace(/\s/g, "");
      return name.startsWith(search) || name.includes(search);
    });
  };

  const filteredResults = getFilteredList();

  if (loading && customers.length === 0) {
    return <div className="flex items-center justify-center min-h-screen bg-white font-black text-blue-900">데이터 동기화 중...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 text-left">
      <nav className="bg-white border-b sticky top-0 z-50 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-black text-xl text-blue-900" onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}}>
          <ShieldCheck size={22}/> BPCS 방역특별시
        </div>
        <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
      </nav>

      <main className="max-w-4xl mx-auto p-5">
        {currentView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <header className="pb-2">
              <h3 className="text-xs font-bold text-blue-800 italic tracking-tighter uppercase">Best Pest Control Solution</h3>
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
                  <div className="px-5 py-3 text-[10px] font-black text-blue-900 uppercase border-b border-slate-50 mb-2">"{searchTerm}" 결과</div>
                  {filteredResults.length > 0 ? (
                    filteredResults.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-5 hover:bg-blue-50 rounded-2xl cursor-pointer" onClick={() => { setSelectedCustomer(c); setCurrentView('customer_detail'); setSearchTerm(''); }}>
                        <div className="text-left">
                          <div className="font-black text-xl">{String(c.name)}</div>
                          <div className="text-xs text-slate-400 mt-1">{String(c.address || "주소 미등록")}</div>
                        </div>
                        <ArrowRight size={20} className="text-blue-200"/>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-400 font-bold italic">검색 결과가 없습니다.</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={() => { setFormData(initialReportForm); setCurrentView('edit'); }} className="col-span-2 bg-blue-900 text-white p-8 rounded-[2rem] font-black text-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Plus strokeWidth={4} size={32}/> 신규 작업 작성</button>
              <button onClick={() => { setCustomerFormData(initialCustomerForm); setCurrentView('customer_edit'); }} className="bg-white border-2 border-blue-900 text-blue-900 p-6 rounded-3xl font-black flex flex-col items-center gap-2 shadow-sm"><UserPlus size={24}/>거래처 등록</button>
              {/* 수정된 버튼: '기록 수정' 대신 '거래처 목록' 배치 */}
              <button onClick={() => { setCurrentView('customer_list'); setSearchTerm(''); }} className="bg-white border-2 border-slate-200 text-slate-600 p-6 rounded-3xl font-black flex flex-col items-center gap-2 shadow-sm"><Users size={24}/>거래처 목록</button>
            </div>
          </div>
        )}

        {/* --- 거래처 목록 뷰 --- */}
        {currentView === 'customer_list' && (
          <div className="space-y-6 animate-in fade-in">
             <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-slate-400 font-bold"><ChevronLeft size={24}/> 대시보드</button>
             <h2 className="text-3xl font-black">거래처 목록</h2>
             <input type="text" placeholder="이름으로 검색" className="w-full p-5 rounded-2xl border-none shadow-inner bg-white font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             <div className="space-y-3 pb-20">
               {customers.filter(c => String(c.name).includes(searchTerm)).map(c => (
                 <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center" onClick={() => { setSelectedCustomer(c); setCurrentView('customer_detail'); }}>
                   <div className="text-left">
                     <h4 className="font-black text-xl">{String(c.name)}</h4>
                     <p className="text-xs text-slate-400 mt-1">{String(c.address || "주소 미등록")}</p>
                   </div>
                   <ChevronRight className="text-slate-200" />
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* --- 거래처 상세 페이지 --- */}
        {currentView === 'customer_detail' && selectedCustomer && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <button onClick={() => setCurrentView('customer_list')} className="flex items-center gap-1 text-slate-400 font-bold"><ChevronLeft size={24}/> 목록으로</button>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50">
              <h2 className="text-4xl font-black text-slate-900 mb-6">{String(selectedCustomer.name)}</h2>
              <div className="space-y-4 text-slate-600 font-bold text-left">
                <p className="flex items-center gap-3"><Phone size={20} className="text-blue-900"/> {String(selectedCustomer.phone || "연락처 미등록")}</p>
                <p className="flex items-center gap-3"><MapPin size={20} className="text-blue-900"/> {String(selectedCustomer.address || "주소 미등록")}</p>
              </div>
            </div>
            <div className="bg-blue-900 p-8 rounded-[2.5rem] shadow-xl text-white">
              <h4 className="text-blue-300 text-[10px] font-black uppercase mb-3 flex items-center gap-2"><BookOpen size={14}/> 내부 관리 메모</h4>
              <p className="font-bold leading-relaxed whitespace-pre-wrap">{String(selectedCustomer.privateMemo || "기록된 지침이 없습니다.")}</p>
            </div>
            <button onClick={() => { setFormData({...initialReportForm, customerName: selectedCustomer.name}); setCurrentView('edit'); }} className="w-full bg-blue-50 text-blue-900 p-7 rounded-3xl font-black text-lg flex items-center justify-center gap-2 mt-4">이 거래처로 작업 시작 <ArrowRight size={20}/></button>
          </div>
        )}

        {/* --- 신규 거래처 등록 폼 --- */}
        {currentView === 'customer_edit' && (
          <div className="space-y-8 animate-in slide-in-from-bottom">
            <h2 className="text-2xl font-black">신규 거래처 등록</h2>
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <input type="text" placeholder="거래처 명칭 (예: 25 삼성식당)" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={customerFormData.name} onChange={e => setCustomerFormData({...customerFormData, name: e.target.value})} />
              <input type="tel" placeholder="연락처" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={customerFormData.phone} onChange={e => setCustomerFormData({...customerFormData, phone: e.target.value})} />
              <input type="text" placeholder="주소" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={customerFormData.address} onChange={e => setCustomerFormData({...customerFormData, address: e.target.value})} />
            </div>
            <textarea placeholder="특이사항 및 메모 (비공개)..." className="w-full p-6 rounded-3xl border-2 border-slate-100 font-bold h-32 outline-none" value={customerFormData.privateMemo} onChange={e => setCustomerFormData({...customerFormData, privateMemo: e.target.value})} />
            <button onClick={() => saveToSheet('customers', {...customerFormData, id: Date.now().toString()})} className="w-full bg-blue-900 text-white p-7 rounded-3xl font-black text-xl shadow-xl">거래처 저장</button>
          </div>
        )}

        {/* --- 작업 작성 폼 --- */}
        {currentView === 'edit' && (
          <div className="space-y-6 animate-in slide-in-from-bottom">
            <h2 className="text-2xl font-black">방역 작업 작성</h2>
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <input type="text" placeholder="거래처명" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              <input type="date" className="w-full p-4 rounded-xl bg-slate-50 border-none font-bold text-lg" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <textarea placeholder="방역 내용을 상세히 적어주세요..." className="w-full p-8 rounded-[2.5rem] border-2 border-slate-100 font-bold h-72 shadow-sm outline-none text-lg" value={formData.workContent} onChange={e => setFormData({...formData, workContent
