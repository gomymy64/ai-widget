import React, { useState, useRef, useEffect } from 'react';
import { Save, Sparkles, Send, Mic, X, Plus, Trash2, Link as LinkIcon, RefreshCw, ArrowRight, Check, FileText, UploadCloud, Power, BookOpen, Paperclip, File as FileIcon, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ConfigState, Message, QnAItem, LinkItem, FileItem } from '../types';

interface ConfigViewProps {
  config: ConfigState;
  setConfig: React.Dispatch<React.SetStateAction<ConfigState>>;
  onSave: () => void;
  isSaving: boolean;
}

const InfoTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center justify-center ml-1.5 align-middle cursor-help">
    <Info size={14} className="text-zinc-600 hover:text-zinc-400 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs leading-snug text-zinc-300 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none transition-all z-50 text-center">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900"></div>
    </div>
  </div>
);

interface QnACardProps {
  item: QnAItem;
  idx: number;
  onChange: (id: string, field: 'question' | 'answer', value: string) => void;
  onRemove: (id: string) => void;
}

const QnACard: React.FC<QnACardProps> = ({ item, idx, onChange, onRemove }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-900/20 overflow-hidden transition-all hover:border-zinc-700 shadow-sm group">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {idx + 1}
          </div>
          <span className={`text-sm font-medium truncate transition-colors max-w-[200px] sm:max-w-xs ${item.question ? 'text-zinc-200' : 'text-zinc-500 italic'}`}>
            {item.question || "Новый вопрос..."}
          </span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
             className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
             title="Удалить"
           >
             <Trash2 size={14} />
           </button>
           <div className={`text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
             <ChevronDown size={16} />
           </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3 border-t border-zinc-800/50 bg-zinc-950/30">
            <input 
              type="text"
              value={item.question}
              onChange={(e) => onChange(item.id, 'question', e.target.value)}
              placeholder="Вопрос клиента (например: Сколько стоит?)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <textarea 
              value={item.answer}
              onChange={(e) => onChange(item.id, 'answer', e.target.value)}
              placeholder="Ответ бота..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none transition-colors resize-none leading-relaxed"
            />
        </div>
      )}
    </div>
  );
};

const ConfigView: React.FC<ConfigViewProps> = ({ config, setConfig, onSave, isSaving }) => {
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardMessages, setWizardMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Привет! Я помогу настроить вашего ассистента.\n\nНазовите вашу нишу (например: "Автосервис") и я задам уточняющие вопросы, чтобы составить грамотный сценарий.\n\nЕсли у вас есть файлы (прайс-листы, инструкции) или ссылки на сайт/соцсети — прикрепите их или отправьте сюда, я добавлю их в Базу Знаний.'
    }
  ]);
  const [wizardInput, setWizardInput] = useState('');
  const [isWizardLoading, setIsWizardLoading] = useState(false);
  const [wizardFiles, setWizardFiles] = useState<File[]>([]); // Files pending send in wizard

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Preview Chat State
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
  const [previewInput, setPreviewInput] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const wizardScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Voice Recognition Setup ---
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ru-RU';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setWizardInput(prev => (prev + ' ' + finalTranscript).trim());
        }
      };

      recognition.onerror = (event: any) => {
        // Ignore "aborted" errors which happen on frequent toggling or strict mode
        if (event.error !== 'aborted') {
            console.error("Speech recognition error", event.error);
        }
        if (event.error === 'not-allowed') {
            alert("Пожалуйста, разрешите доступ к микрофону.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
         setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []); // Run once on mount

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Ваш браузер не поддерживает голосовой ввод.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Ignore errors if start is called while already starting
        console.log("Recognition start attempt caught", e);
      }
    }
  };

  // --- Scroll Handling ---
  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [previewMessages, isPreviewLoading]);

  useEffect(() => {
    if (wizardScrollRef.current) wizardScrollRef.current.scrollTop = wizardScrollRef.current.scrollHeight;
  }, [wizardMessages, isWizardLoading, wizardFiles]);

  useEffect(() => {
    handleResetChat();
  }, [config.welcomeMessage]);

  // --- Config Form Helpers ---
  const handleQnAChange = (id: string, field: 'question' | 'answer', value: string) => {
    setConfig({
      ...config,
      qna: config.qna.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const addQnA = () => {
    setConfig({ ...config, qna: [...config.qna, { id: Date.now().toString(), question: '', answer: '' }] });
  };

  const removeQnA = (id: string) => {
    setConfig({ ...config, qna: config.qna.filter(item => item.id !== id) });
  };

  const handleLinkChange = (id: string, value: string) => {
    setConfig({
      ...config,
      links: config.links.map(l => l.id === id ? { ...l, url: value } : l)
    });
  };

  const addLink = () => {
    setConfig({ ...config, links: [...config.links, { id: Date.now().toString(), url: '' }] });
  };

  const removeLink = (id: string) => {
    setConfig({ ...config, links: config.links.filter(l => l.id !== id) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles: FileItem[] = Array.from(files).map(f => ({
        id: Date.now().toString() + Math.random(),
        name: f.name,
        size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
        type: 'pdf' // Mock type
      }));
      setConfig(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };

  const removeFile = (id: string) => {
    setConfig({ ...config, files: config.files.filter(f => f.id !== id) });
  };

  // --- Wizard Logic ---
  const handleWizardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setWizardFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeWizardFile = (index: number) => {
      setWizardFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleWizardSend = async () => {
    if (!wizardInput.trim() && wizardFiles.length === 0) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // 1. Process Files: Add them to the main config immediately
    let fileMsgPart = "";
    if (wizardFiles.length > 0) {
        const newFiles: FileItem[] = wizardFiles.map((f) => ({
            id: Date.now().toString() + Math.random(),
            name: f.name,
            size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
            type: 'pdf'
        }));
        setConfig(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
        fileMsgPart = '\n[Прикреплено файлов: ' + wizardFiles.length + ']';
        setWizardFiles([]); // Clear wizard attachment buffer
    }

    const fullUserText = wizardInput + fileMsgPart;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: fullUserText };
    setWizardMessages(prev => [...prev, userMsg]);
    setWizardInput('');
    setIsWizardLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const history = wizardMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      history.push({ role: 'user', parts: [{ text: fullUserText }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history,
        config: {
          systemInstruction: 
            'Ты — опытный бизнес-аналитик и настройщик AI-агентов.\n' +
            'ТВОЯ ЦЕЛЬ: Собрать максимум информации о компании, чтобы заполнить конфигурацию бота.\n\n' +
            'СТРАТЕГИЯ ДИАЛОГА:\n' +
            '1. Если пользователь прикрепил файлы: поблагодари и скажи, что добавил их в базу знаний.\n' +
            '2. НАСТОЙЧИВО спрашивай ссылки: "Есть ли у вас сайт, VK, WhatsApp, Notion? Пришлите ссылки, я добавлю их в источники."\n' +
            '3. Если пользователь назвал нишу, требуй детали: "Сколько стоит услуга X?", "Какой адрес?", "Есть ли гарантия?".\n' +
            '4. Анализируй ответы и формируй "Общую информацию" (knowledgeBaseText).\n\n' +
            'КОГДА ГЕНЕРИРОВАТЬ JSON:\n' +
            'В каждом ответе, если ты получил новую полезную информацию, обновляй JSON-блок в конце.\n\n' +
            'Формат JSON (строго в конце ответа, в блоке ```json):\n' +
            '{\n' +
            '  "name": "Имя бота",\n' +
            '  "welcomeMessage": "Приветствие",\n' +
            '  "role": "Роль",\n' +
            '  "knowledgeBaseText": "Скомпилированный текст о компании на основе ответов.",\n' +
            '  "qna": [\n' +
            '    {"question": "Вопрос", "answer": "Ответ"}\n' +
            '  ],\n' +
            '  "links": ["https://site.com"]\n' +
            '}'
        }
      });

      const responseText = response.text || "Ошибка связи.";
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      
      let cleanText = responseText;
      if (jsonMatch) {
        try {
          const generated = JSON.parse(jsonMatch[1]);
          const mappedQnA = Array.isArray(generated.qna) 
            ? generated.qna.map((q: any, i: number) => ({ id: Date.now() + i, question: q.question, answer: q.answer }))
            : [];
          const mappedLinks = Array.isArray(generated.links)
            ? generated.links.map((l: string, i: number) => ({ id: Date.now() + i + 100, url: l }))
            : [];

          setConfig(prev => ({
            ...prev,
            name: generated.name || prev.name,
            welcomeMessage: generated.welcomeMessage || prev.welcomeMessage,
            role: generated.role || prev.role,
            knowledgeBaseText: generated.knowledgeBaseText || prev.knowledgeBaseText,
            qna: mappedQnA.length > 0 ? mappedQnA : prev.qna,
            links: mappedLinks.length > 0 ? mappedLinks : prev.links
          }));
          cleanText = responseText.replace(/```json[\s\S]*?```/, "").trim();
          if (!cleanText.includes("✨")) {
              cleanText += "\n\n✨ Настройки обновлены.";
          }
        } catch (e) {
          console.error("Failed to parse config JSON", e);
        }
      }

      setWizardMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: cleanText || "Готово."
      }]);

    } catch (error) {
      console.error("Wizard Error", error);
      setWizardMessages(prev => [...prev, { id: 'err', role: 'model', text: 'Ошибка. Попробуйте еще раз.' }]);
    } finally {
      setIsWizardLoading(false);
    }
  };

  // --- Preview Chat Logic ---
  const getCompiledSystemPrompt = () => {
    // Safer way to build system prompt without risk of syntax errors in template literals
    return [
      `Ты — ${config.role}, твое имя ${config.name}.`,
      '',
      'БАЗА ЗНАНИЙ (О компании):',
      config.knowledgeBaseText,
      '',
      'ЧАСТЫЕ ВОПРОСЫ (Q&A):',
      config.qna.map(item => `В: ${item.question}\nО: ${item.answer}`).join('\n\n'),
      '',
      'ИСТОЧНИКИ ДАННЫХ:',
      config.links.map(l => l.url).join(', '),
      '',
      'ФАЙЛЫ В БАЗЕ:',
      config.files.map(f => f.name).join(', '),
      '',
      'Твоя задача: Отвечать кратко, вежливо, по делу, используя предоставленную информацию.'
    ].join('\n');
  };

  const handlePreviewSendMessage = async () => {
    if (!previewInput.trim() || isPreviewLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: previewInput };
    setPreviewMessages(prev => [...prev, userMsg]);
    setPreviewInput('');
    setIsPreviewLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const history = previewMessages.slice(1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      history.push({ role: 'user', parts: [{ text: userMsg.text }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history,
        config: { systemInstruction: getCompiledSystemPrompt() }
      });

      setPreviewMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "..."
      }]);

    } catch (error) {
      console.error("Preview Error", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleResetChat = () => {
    setPreviewMessages([{ id: 'welcome', role: 'model', text: config.welcomeMessage }]);
  };

  // --- Dynamic Class Definitions (Fixes Build Errors) ---
  const micButtonClass = `p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
    isListening 
      ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse' 
      : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
  }`;

  const isSendDisabled = (!wizardInput.trim() && wizardFiles.length === 0) || isWizardLoading;
  
  const sendButtonClass = `p-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
    !isSendDisabled
      ? 'bg-white text-black hover:bg-zinc-200' 
      : 'bg-[#3f3f46] text-zinc-500 cursor-not-allowed'
  }`;

  return (
    <div className="h-[calc(100vh-120px)] flex gap-8 relative overflow-hidden">
      
      {/* --- AI Wizard Modal --- */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col relative overflow-hidden">
             
             <div className="h-16 border-b border-zinc-800 flex justify-between items-center px-6 bg-[#18181b]">
               <div className="flex items-center gap-3">
                 <Sparkles size={20} className="text-indigo-400" />
                 <h2 className="text-lg font-medium text-white">AI Настройка</h2>
               </div>
               <button onClick={() => setIsWizardOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                 <X size={24} />
               </button>
             </div>

             <div ref={wizardScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#18181b]">
                {wizardMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-[16px] leading-relaxed whitespace-pre-line ${
                      msg.role === 'user' 
                        ? 'bg-[#3f3f46] text-white' 
                        : 'text-zinc-200'
                    }`}>
                      {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mb-2"><Sparkles size={16} className="text-white" /></div>}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isWizardLoading && (
                   <div className="flex justify-start">
                      <div className="text-zinc-400 flex gap-2 items-center px-4">
                         <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                         <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                         <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                      </div>
                   </div>
                )}
             </div>

             <div className="p-6 bg-[#18181b]">
                <div className="max-w-3xl mx-auto flex flex-col gap-2">
                    {/* File Attachments Preview in Wizard */}
                    {wizardFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
                            {wizardFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg text-sm border border-zinc-700">
                                    <FileIcon size={14} />
                                    <span className="max-w-[150px] truncate">{file.name}</span>
                                    <button onClick={() => removeWizardFile(idx)} className="hover:text-red-400"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative bg-[#27272a] rounded-3xl border border-zinc-700 focus-within:border-zinc-500 transition-colors shadow-lg">
                    <div className="flex items-end p-2 gap-2">
                        {/* Paperclip Button */}
                        <div className="pb-1 pl-1">
                             <input 
                                type="file" 
                                multiple 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleWizardFileSelect} 
                             />
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                                title="Прикрепить файл"
                             >
                                <Paperclip size={22} />
                             </button>
                        </div>

                        <textarea 
                            value={wizardInput}
                            onChange={(e) => setWizardInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleWizardSend();
                                }
                            }}
                            className="w-full bg-transparent border-none text-white text-lg px-2 py-3 focus:ring-0 resize-none max-h-[200px] overflow-y-auto placeholder-zinc-500"
                            placeholder="Сообщение..."
                            rows={1}
                            style={{ minHeight: '52px' }}
                        />
                        
                        <div className="flex items-center gap-1 pb-1 pr-1">
                            <button 
                            onClick={toggleListening}
                            className={micButtonClass}
                            >
                            <Mic size={22} />
                            </button>
                            <button 
                            onClick={handleWizardSend}
                            disabled={isSendDisabled}
                            className={sendButtonClass}
                            >
                            <ArrowRight size={22} />
                            </button>
                        </div>
                    </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- Main Config Form --- */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20">
        <div className="max-w-3xl mx-auto pt-2">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Настройка</h1>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfig({...config, active: !config.active})}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                  config.active 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                 <Power size={18} />
                 {config.active ? 'Активен' : 'Отключен'}
              </button>
              <button 
                onClick={() => setIsWizardOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
              >
                 <Sparkles size={18} className="text-indigo-600" />
                 Заполнить с AI
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {/* Identity */}
            <section className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <div className="flex items-center mb-2">
                        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wide">Имя</label>
                        <InfoTooltip text="Имя бота, которое увидят клиенты в заголовке чата." />
                    </div>
                    <input 
                      type="text" 
                      value={config.name}
                      onChange={(e) => setConfig({...config, name: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-lg text-white focus:border-indigo-500 focus:outline-none transition-colors placeholder-zinc-700 shadow-sm"
                    />
                 </div>
                 <div>
                    <div className="flex items-center mb-2">
                        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wide">Роль</label>
                        <InfoTooltip text="Задает стиль общения и должность бота (например: 'Старший менеджер', 'Технический помощник')." />
                    </div>
                    <input 
                      type="text" 
                      value={config.role}
                      onChange={(e) => setConfig({...config, role: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-lg text-white focus:border-indigo-500 focus:outline-none transition-colors placeholder-zinc-700 shadow-sm"
                    />
                 </div>
               </div>
               <div>
                  <div className="flex items-center mb-2">
                    <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wide">Приветствие</label>
                    <InfoTooltip text="Первое сообщение, которое бот отправит клиенту при открытии виджета." />
                  </div>
                  <textarea 
                    rows={3}
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig({...config, welcomeMessage: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-lg text-white focus:border-indigo-500 focus:outline-none transition-colors placeholder-zinc-700 resize-none shadow-sm"
                  />
               </div>
            </section>

            <div className="h-px bg-zinc-900 w-full" />

             {/* QnA Scenario (Moved UP) */}
             <section className="space-y-6">
               <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Сценарий (Вопрос - Ответ)</label>
                    <InfoTooltip text="Добавьте частые вопросы и идеальные ответы на них. Бот будет использовать их как строгую инструкцию." />
                  </div>
                  <button onClick={addQnA} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <Plus size={16} /> Добавить
                  </button>
               </div>
               
               <div className="space-y-4">
                 {config.qna.map((item, idx) => (
                   <QnACard 
                     key={item.id} 
                     item={item} 
                     idx={idx} 
                     onChange={handleQnAChange} 
                     onRemove={removeQnA} 
                   />
                 ))}
               </div>
            </section>
            
            <div className="h-px bg-zinc-900 w-full" />

            {/* Knowledge Base (Unified Section) */}
            <section className="space-y-8">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="text-indigo-500" size={24} />
                    <h2 className="text-xl font-bold text-white">База Знаний</h2>
                    <InfoTooltip text="Сюда можно загрузить всю информацию о компании. Бот прочитает файлы, ссылки и текст, чтобы отвечать на любые вопросы клиентов." />
                </div>

                {/* 1. General Text */}
                <div className="space-y-2">
                     <div className="flex items-center">
                        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wide">
                            Общая информация
                        </label>
                     </div>
                     <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
                         <textarea
                            rows={6}
                            value={config.knowledgeBaseText}
                            onChange={(e) => setConfig({...config, knowledgeBaseText: e.target.value})}
                            placeholder="Опишите вашу компанию: история, часы работы, условия возврата, особенности услуг..."
                            className="w-full bg-transparent border-none px-4 py-3 text-lg text-white placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
                         />
                     </div>
                </div>

                {/* 2. Files */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Файлы</label>
                  </div>
                  <div className="space-y-3">
                    {config.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                               <FileText size={18} />
                            </div>
                            <div>
                               <p className="text-sm text-white font-medium">{file.name}</p>
                               <p className="text-xs text-zinc-500">{file.size}</p>
                            </div>
                         </div>
                         <button onClick={() => removeFile(file.id)} className="text-zinc-600 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-600 hover:bg-zinc-900/30 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-6 h-6 mb-2 text-zinc-500 group-hover:text-zinc-300" />
                            <p className="text-xs text-zinc-500 group-hover:text-zinc-300">Нажмите или перетащите файл (PDF, DOCX)</p>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" multiple />
                    </label>
                  </div>
               </div>

                {/* 3. Links */}
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                      <label className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Источники данных (Сайт, VK, Notion)</label>
                      <button onClick={addLink} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        <Plus size={16} /> Добавить
                      </button>
                  </div>
                  <div className="space-y-3">
                      {config.links.map((link) => (
                        <div key={link.id} className="flex gap-3 items-center">
                          <div className="relative flex-1">
                            <LinkIcon size={16} className="absolute left-4 top-3.5 text-zinc-500" />
                            <input 
                              type="text" 
                              value={link.url}
                              onChange={(e) => handleLinkChange(link.id, e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-base text-zinc-300 focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                          </div>
                          <button onClick={() => removeLink(link.id)} className="p-3 text-zinc-600 hover:text-red-500"><Trash2 size={18} /></button>
                        </div>
                      ))}
                  </div>
               </div>
            </section>

            <div className="pt-8 pb-12">
              <button 
                onClick={onSave}
                disabled={isSaving}
                className={`w-full py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-3 shadow-xl ${
                  isSaving 
                    ? 'bg-emerald-600 text-white cursor-wait' 
                    : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.99] shadow-white/5'
                }`}
              >
                {isSaving ? (
                   <>
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     Сохранение...
                   </>
                ) : (
                   <>
                     <Save size={20} />
                     Сохранить изменения
                   </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Column: Preview --- */}
      <div className="hidden xl:block w-[340px] sticky top-0 h-full pt-4 pr-4">
         <div className="flex justify-between items-center mb-4 px-2">
           <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Preview</span>
           <button onClick={handleResetChat} className="text-zinc-600 hover:text-zinc-300 transition-colors">
             <RefreshCw size={14} />
           </button>
         </div>
         
         <div className="relative w-full h-[620px] bg-black rounded-[2.5rem] border-[6px] border-[#222] shadow-2xl overflow-hidden ring-1 ring-white/5 flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#222] rounded-b-xl z-20" />
            <div className="w-full h-full bg-zinc-950 flex flex-col">
              <div className="h-20 bg-zinc-900/90 backdrop-blur-md flex items-end pb-3 px-4 border-b border-white/5 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white uppercase">
                      {config.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{config.name}</p>
                      <p className="text-[10px] text-zinc-400">{config.role}</p>
                    </div>
                  </div>
              </div>

              <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth">
                 <div className="text-center text-[10px] text-zinc-700 my-2 font-medium">Сегодня</div>
                 {previewMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in zoom-in-95 duration-200`}>
                        <div className={`px-4 py-2.5 max-w-[85%] text-[13px] leading-snug ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm'}`}>
                          {msg.text}
                        </div>
                    </div>
                 ))}
                 {isPreviewLoading && (
                   <div className="flex justify-start">
                      <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                         <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></span>
                         <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                         <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-3 bg-zinc-900 border-t border-zinc-800">
                <form onSubmit={(e) => { e.preventDefault(); handlePreviewSendMessage(); }} className="flex gap-2 items-center">
                  <input type="text" value={previewInput} onChange={(e) => setPreviewInput(e.target.value)} placeholder="Сообщение..." className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  <button type="submit" className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 transition-colors"><ArrowRight size={16} /></button>
                </form>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ConfigView;