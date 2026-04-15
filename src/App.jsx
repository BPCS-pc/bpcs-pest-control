import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Printer, Save, FileText, Calendar, 
  User, ClipboardList, BookOpen, X, Search, 
  ChevronRight, ShieldCheck, Briefcase, Camera, Image as ImageIcon,
  Globe, AlertCircle, CheckSquare, Square, Settings2, Home, List, ChevronLeft,
  Phone, MapPin, Users, Info, UserPlus, History, ArrowRight, ExternalLink, Clock, AlertTriangle, FileCheck
} from 'lucide-react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWvHRx4jSkPcqajhIqcrLgq0qhEgyj8P6xnpu4260h3mxvkEPlaThkeOLjSo7VVIGG/exec"; 

const PEST_LIST_TOP = ["바퀴벌레", "개미", "쥐", "기타"];
const PEST_LIST_BOTTOM = ["보행해충", "비래_해충", "빈대", "흰개미"];
const ALL_PESTS = [...PEST_LIST_TOP, ...PEST_LIST_BOTTOM];

const ChecklistItem = ({ pest, checked, onToggle }) => (
  <div onClick={onToggle} className={`flex items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-95 ${checked ? 'bg-blue-900 border-blue-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 shadow-sm'}`}>
    {checked ? <CheckSquare size={18} /> : <Square size={18} />}
    <span className="font-bold text-sm text-left">{pest}</span>
  </div>
);

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

  const renderSafeText = (text) => {
    if (text === null || text === undefined) return "";
    return String(text);
  };

  const fetchData = async () => {
    if (!SCRIPT_URL) return;
    setLoading(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
      setReports(Array.isArray(data.reports) ? data.reports.sort((a, b) => new Date(b.date) - new Date(a.date)) : []);
    } catch (e) { 
      setCustomers([]);
      setReports([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); document.title = "BPCS 방역특별시"; }, []);

  const saveToSheet = async (type, data) => {
    setLoading(true);
    try {
      await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'add', type, data }) });
      setTimeout(() => { fetchData(); setCurrentView('dashboard'); }, 1500);
    } catch (e) { setLoading(false); }
  };

  const handlePrint = () => { window.focus(); setTimeout(() => window.print(), 500); };

  // 핵심 수정: '이름'에 검색어가 포함될 때만 결과 목록에 넣음
  const filteredCustomers = customers.filter(c => {
    const name = renderSafeText(c.name).trim();
    const search = searchTerm.trim();
    if (!search) return false; // 검색어가 없으면 아무것도 안 보여줌
    return name.includes(search); // 이름에 검색어가 포함되어야만 true
  });

  if (loading && customers.length === 0) {
    return <div className="flex flex-col items-center justify-center min-h-screen bg-white"><div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div><p className="font-black text-blue-900 tracking-widest text-center uppercase">데이터 동기화 중...</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 text-left overflow-x-hidden">
      <nav className="bg-white border-b sticky top-0 z-30 p-4 flex justify-between items-center shadow-sm print:hidden">
        <div className="flex items-center gap-2 font-black text-xl text-blue-900 cursor-pointer" onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}}>
          <div className="bg-blue-900 p-1.5 rounded-xl text-white shadow-md"><ShieldCheck size={22}/></div>
          BPCS 방역특별시
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">실시간 연동중</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-5 print:p-0">
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="space-y-1">
              <h3 className="text-sm font-bold text-blue-800 italic text-left">Best Pest Control Solution</h3>
              <h2 className="text-3xl font-black text-left">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</h2>
            </header>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-900 transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="검색" 
                className="w-full p-6 pl-14 rounded-[2rem] border-none shadow-xl bg-white font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              
              {/* 필터링된 결과만 보여주는 섹션 */}
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-blue-50 z-50 max-h-80 overflow-y-auto p-2">
                  <div className="px-5 py-3 text-[10px] font-black text-blue-900 uppercase tracking-widest border-b border-slate-50 mb-1">거래처 명칭 검색 결과</div>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(c => (
                      <div 
                        key={c.id} 
                        className="flex items-center justify-between p-5 hover:bg-blue-50 rounded-2xl cursor-pointer transition-colors active:scale-[0.98]"
                        onClick={() => { setSelectedCustomer(c); setCurrentView('customer_detail'); setSearchTerm(''); }}
                      >
                        <div className="text-left">
                          <div className="font-black text-lg text-slate-900">{renderSafeText(c.name)}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{renderSafeText(c.address)}</div>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-full text-blue-900"><ArrowRight size={16}/></div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-400 font-bold italic">검색 결과가 없습니다.</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button onClick={() => { setFormData(initialReportForm); setCurrentView('edit'); }} className="col-span-2 bg-blue-900 text-white p-7 rounded-[2rem] font-black text-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Plus strokeWidth={3} size={28}/> 신규 작업 작성</button>
              <button onClick={() => { setCustomerFormData(initialCustomerForm); setCurrentView('customer_edit'); }} className="bg-white border-2 border-blue-900 text-blue-900 p-6 rounded-3xl font-bold flex flex-col items-center gap-1 active:bg-blue-50 transition-all shadow-sm"><UserPlus size={24}/><span className="text-sm">거래처 등록</span></button>
              <button onClick={() => setCurrentView('customer_list')} className="bg-white border-2 border-slate-200 text-slate-600 p-6 rounded-3xl font-bold flex flex-col items-center gap-1 active:bg-slate-50 transition-all shadow-sm"><Users size={24}/><span className="text-sm">거래처 목록</span></button>
            </div>
          </div>
        )}

        {/* 나머지 기능 뷰들 (customer_list, detail, edit, report_view) */}
        {currentView === 'customer_list' && (
          <div className="space-y-6 animate-in fade-in text-left">
             <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-slate-400 font-bold mb-4"><ChevronLeft size={24}/> <span>대시보드</span></button>
             <h2 className="text-3xl font-black text-left">거래처 목록</h2>
             <input type="text" placeholder="검색" className="w-full p-5 rounded-2xl border-none shadow-inner bg-white font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             <div className="space-y-3 pb-20">{customers.filter(c => renderSafeText(c.name).toLowerCase().includes(searchTerm.toLowerCase())).map(c => (<div key={c.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex justify-between items-center active:bg-slate-50 transition-all" onClick={() => { setSelectedCustomer(c); setCurrentView('customer_detail'); }}><div className="text-left"><h4 className="font-black text-xl text-slate-900">{renderSafeText(c.name)}</h4><p className="text-sm text-slate-400 mt-1">{renderSafeText(c.address) || "주소 미등록"}</p></div><ChevronRight className="text-slate-200" /></div>))}</div>
          </div>
        )}

        {currentView === 'customer_detail' && selectedCustomer && (
          <div className="space-y-6 animate-in slide-in-from-right text-left"><button onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}} className="flex items-center gap-1 text-slate-400 font-bold mb-2"><ChevronLeft size={20}/> 대시보드로</button><div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 text-left"><h2 className="text-4xl font-black text-slate-900 mb-6">{renderSafeText(selectedCustomer.name)}</h2><div className="space-y-3 text-slate-600 font-bold"><p className="flex items-center gap-3"><Phone size={18} className="text-blue-900"/> {renderSafeText(selectedCustomer.phone) || "미등록"}</p><p className="flex items-center gap-3"><MapPin size={18} className="text-blue-900"/> {renderSafeText(selectedCustomer.address) || "미등록"}</p></div></div><div className="bg-blue-900 p-7 rounded-3xl shadow-xl text-white text-left"><h4 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3 flex items-center gap-2"><BookOpen size={14}/> 내부 관리 메모</h4><p className="font-bold text-sm leading-relaxed whitespace-pre-wrap">{renderSafeText(selectedCustomer.privateMemo) || "기록된 지침이 없습니다."}</p></div><button onClick={() => { setFormData({...initialReportForm, customerName: selectedCustomer.name}); setCurrentView('edit'); }} className="w-full bg-blue-100 text-blue-900 p-6 rounded-2xl font-black flex items-center justify-center gap-2 mt-4">이 거래처로 새 작업 작성하기 <ArrowRight size={18}/></button></div>
        )}

        {currentView === 'customer_edit' && (
          <div className="space-y-8 animate-in slide-in-from-bottom text-left"><h2 className="text-2xl font-black">거래처 등록</h2><div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 space-y-4"><input type="text" placeholder="거래처 명칭 (필수)" className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-blue-900" value={customerFormData.name} onChange={e => setCustomerFormData({...customerFormData, name: e.target.value})} /><input type="tel" placeholder="연락처" className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-blue-900" value={customerFormData.phone} onChange={e => setCustomerFormData({...customerFormData, phone: e.target.value})} /><input type="text" placeholder="주소" className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-blue-900" value={customerFormData.address} onChange={e => setCustomerFormData({...customerFormData, address: e.target.value})} /><input type="date" className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold outline-none focus:ring-2 focus:ring-blue-900" value={customerFormData.contractDate} onChange={e => setCustomerFormData({...customerFormData, contractDate: e.target.value})} /></div><textarea placeholder="비공개 메모..." className="w-full p-6 rounded-3xl border-2 border-slate-100 font-bold h-32 outline-none focus:border-blue-900 transition-colors" value={customerFormData.privateMemo} onChange={e => setCustomerFormData({...customerFormData, privateMemo: e.target.value})} /><button onClick={() => saveToSheet('customers', {...customerFormData, id: Date.now().toString()})} className="w-full bg-blue-900 text-white p-6 rounded-[1.5rem] font-black text-xl shadow-xl active:scale-[0.98] transition-all">거래처 정보 저장</button></div>
        )}

        {currentView === 'edit' && (
          <div className="space-y-6 animate-in slide-in-from-bottom text-left"><h2 className="text-2xl font-black">작업 작성</h2><div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 space-y-4"><input type="text" placeholder="거래처명" className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-lg outline-none focus:ring-2 focus:ring-blue-900" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} /><input type="date" className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-lg outline-none focus:ring-2 focus:ring-blue-900" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div><div className="space-y-3 px-1 text-left"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">해충 점검</h4><div className="grid grid-cols-2 gap-3">{ALL_PESTS.map((pest, i) => (<ChecklistItem key={i} pest={pest} checked={formData.checklist && formData.checklist[pest]} onToggle={() => setFormData(p => ({...p, checklist: {...(p.checklist || {}), [pest]: !(p.checklist && p.checklist[pest])}}))} />))}</div></div><textarea placeholder="방역 상세 작업 내역..." className="w-full p-7 rounded-[2.5rem] border-2 border-slate-100 font-bold h-56 shadow-sm outline-none focus:border-blue-900 transition-all" value={formData.workContent} onChange={e => setFormData({...formData, workContent: e.target.value})} /><div className="bg-blue-900 p-8 rounded-[2.5rem] shadow-xl text-white text-left"><h4 className="text-blue-300 text-[10px] font-black uppercase mb-2">내부 메모 (비공개)</h4><textarea className="w-full bg-blue-800/50 border-none text-white p-5 rounded-2xl outline-none font-bold h-32" value={formData.privateMemo} onChange={e => setFormData({...formData, privateMemo: e.target.value})} /></div><button onClick={() => saveToSheet('reports', {...formData, id: Date.now().toString()})} className="w-full bg-blue-900 text-white p-6 rounded-[1.5rem] font-black text-xl shadow-xl active:scale-[0.98] transition-all">구글 시트 저장</button></div>
        )}

        {currentView === 'report_view' && (
           <div className="space-y-8 animate-in zoom-in-95 text-left"><div className="flex justify-between items-center print:hidden"><button onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}} className="text-slate-400 font-bold flex items-center gap-1"><ChevronLeft size={24}/> 뒤로</button><button onClick={handlePrint} className="bg-blue-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2 active:scale-95 transition-all"><Printer size={20}/> PDF 저장/인쇄</button></div><div id="report-area" className="bg-white p-10 sm:p-20 border border-slate-100 print:p-0 print:border-none shadow-2xl print:shadow-none rounded-[3rem] print:rounded-none text-left"><div className="border-b-4 border-blue-900 pb-10 mb-16 flex justify-between items-end"><div className="text-left"><h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2 leading-none text-left">SERVICE<br/>REPORT</h1><p className="text-blue-600 font-black text-[12px] tracking-[0.5em] uppercase italic text-left opacity-80">Best Pest Control Solution</p></div><div className="text-right font-black text-sm text-slate-400 uppercase tracking-widest text-right">Date: {renderSafeText(formData.date)}</div></div><div className="space-y-16 text-left"><div className="grid grid-cols-2 gap-10"><div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left"><p className="text-[11px] font-black text-blue-800 uppercase mb-2 tracking-widest opacity-60 text-left">Customer</p><p className="text-3xl font-black text-slate-900 text-left">{renderSafeText(formData.customerName)}</p></div><div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left"><p className="text-[11px] font-black text-blue-800 uppercase mb-2 tracking-widest opacity-60 text-left">Provider</p><p className="text-2xl font-black text-slate-900 text-left">BPCS 방역특별시</p></div></div><section><h4 className="text-[11px] font-black text-slate-400 uppercase mb-8 tracking-[0.4em] border-b pb-3 text-left">Inspection Result</h4><div className="flex flex-wrap gap-3">{formData.checklist && ALL_PESTS.map((p, i) => formData.checklist[p] && (<span key={i} className="px-5 py-2.5 bg-blue-900 text-white rounded-full text-[13px] font-black shadow-lg">{p}</span>))}{(!formData.checklist || !Object.values(formData.checklist).some(v => v)) && <p className="text-slate-300 font-bold italic">특이사항 없음</p>}</div></section><section><h4 className="text-[11px] font-black text-slate-400 uppercase mb-8 tracking-[0.4em] border-b pb-3 text-left">Work Summary</h4><div className="bg-slate-50 p-10 rounded-[2.5rem] min-h-[250px] text-left leading-[1.8]"><p className="text-slate-800 text-xl font-bold whitespace-pre-wrap text-left">{renderSafeText(formData.workContent) || "기록된 내용이 없습니다."}</p></div></section><section className="pt-24 border-t-2 border-slate-900 flex justify-between items-end uppercase text-[11px] font-black text-slate-400 text-left"><p className="text-left">BPCS Cloud Verification System</p><div className="text-right flex flex-col items-end text-right"><div className="w-40 h-20 border-b-2 border-slate-900 flex items-center justify-center text-slate-200 italic font-serif text-3xl font-black opacity-40">Verified</div></div></section></div></div></div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-4 pb-10 flex justify-around items-center print:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-40"><button onClick={() => {setCurrentView('dashboard'); setSearchTerm('');}} className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${currentView === 'dashboard' ? 'text-blue-900' : 'text-slate-300'}`}><Home size={26} strokeWidth={2.5}/><span className="text-[10px] font-black uppercase tracking-tighter">Dashboard</span></button><button onClick={() => {setCurrentView('customer_list'); setSearchTerm('');}} className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${currentView.includes('customer') ? 'text-blue-900' : 'text-slate-300'}`}><Users size={26} strokeWidth={2.5}/><span className="text-[10px] font-black uppercase tracking-tighter">Clients</span></button></nav>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; visibility: hidden !important; background-color: white !important; height: auto !important; overflow: visible !important; -webkit-print-color-adjust: exact !important; }
          #report-area { visibility: visible !important; display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 1.5cm !important; border: none !
